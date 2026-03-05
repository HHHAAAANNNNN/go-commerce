package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
)

// POST /api/users/{id}/checkout
func Checkout(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req struct {
		ProductIDs []string `json:"product_ids"`
		VoucherID  string   `json:"voucher_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.ProductIDs) == 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "product_ids required")
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// 1. Fetch user balance
	var balance int
	err = tx.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	// 2. Fetch cart items for selected product IDs
	type lineItem struct {
		productID string
		name      string
		image     string
		price     int
		quantity  int
	}
	var items []lineItem
	for _, pid := range req.ProductIDs {
		var item lineItem
		item.productID = pid
		// Get cart quantity
		err = tx.QueryRow("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?", userID, pid).Scan(&item.quantity)
		if err == sql.ErrNoRows {
			utils.ErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Product %s not in cart", pid))
			return
		} else if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "DB error")
			return
		}
		// Get product price, name, stock
		// price is DECIMAL in DB so scan via float64 first, same as product_controller
		var stock int
		var priceFloat float64
		err = tx.QueryRow("SELECT name, price, stock, COALESCE(image_url,'') FROM products WHERE id = ?", pid).Scan(&item.name, &priceFloat, &stock, &item.image)
		if err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Product %s not found", pid))
			return
		}
		item.price = int(priceFloat)
		if stock < item.quantity {
			utils.ErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Insufficient stock for %s", item.name))
			return
		}
		items = append(items, item)
	}

	// 3. Compute subtotal
	subtotal := 0
	for _, item := range items {
		subtotal += item.price * item.quantity
	}

	// 4. Apply voucher if provided
	discount := 0
	if req.VoucherID != "" {
		var discountType string
		var discountValue, maxDiscount, minPurchase, usageLimit, usedCount int
		var isActive bool
		var validUntil time.Time
		row := tx.QueryRow(`SELECT type, discount_value, COALESCE(max_discount,0), min_purchase, usage_limit, used_count, is_active, valid_until FROM vouchers WHERE id = ?`, req.VoucherID)
		err = row.Scan(&discountType, &discountValue, &maxDiscount, &minPurchase, &usageLimit, &usedCount, &isActive, &validUntil)
		if err != nil {
			// Voucher not found — ignore silently
			err = nil
		} else if isActive && validUntil.After(time.Now()) && (usageLimit == 0 || usedCount < usageLimit) && subtotal >= minPurchase {
			switch discountType {
			case "percentage":
				discount = subtotal * discountValue / 100
				if maxDiscount > 0 && discount > maxDiscount {
					discount = maxDiscount
				}
			case "fixed_amount":
				discount = discountValue
			}
			// Increment used_count
			_, err = tx.Exec("UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?", req.VoucherID)
			if err != nil {
				utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update voucher")
				return
			}
		}
	}

	total := subtotal - discount
	if total < 0 {
		total = 0
	}

	// 5. Check balance
	if balance < total {
		err = fmt.Errorf("insufficient balance")
		utils.ErrorResponse(w, http.StatusPaymentRequired, "Insufficient balance")
		return
	}

	// 6. Deduct balance
	_, err = tx.Exec("UPDATE users SET balance = balance - ? WHERE id = ?", total, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to deduct balance: "+err.Error())
		return
	}

	// 7. Increment total_spent
	_, err = tx.Exec("UPDATE users SET total_spent = total_spent + ? WHERE id = ?", total, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update total_spent: "+err.Error())
		return
	}

	// 8. Create order — orders.id is AUTO_INCREMENT INT, order_number is the user-visible string
	orderNumber := fmt.Sprintf("ORD-%d-%d", userID, time.Now().UnixMilli())
	result, err := tx.Exec(
		"INSERT INTO orders (order_number, user_id, address_id, subtotal, discount_amount, total_amount, status) VALUES (?, ?, NULL, ?, ?, ?, 'pending')",
		orderNumber, userID, subtotal, discount, total,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create order: "+err.Error())
		return
	}
	insertedOrderID, err := result.LastInsertId()
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get order ID: "+err.Error())
		return
	}

	// 9. Insert order items, reduce stock, delete cart items
	for _, item := range items {
		subtotalItem := item.price * item.quantity
		_, err = tx.Exec(
			"INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)",
			insertedOrderID, item.productID, item.name, item.image, item.quantity, item.price, subtotalItem,
		)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to insert order item: "+err.Error())
			return
		}
		_, err = tx.Exec("UPDATE products SET stock = stock - ? WHERE id = ?", item.quantity, item.productID)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update stock")
			return
		}
		_, err = tx.Exec("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", userID, item.productID)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to clear cart")
			return
		}
	}

	// 10. Commit
	if err = tx.Commit(); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	utils.CreatedResponse(w, "Checkout successful", map[string]interface{}{
		"order_id": orderNumber,
		"total":    total,
		"discount": discount,
	})
}

// GET /api/users/{id}/stats
func GetUserStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Total, pending, completed, this-year orders
	var totalOrders, pendingOrders, completedOrders, thisYearOrders int
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ?", userID).Scan(&totalOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'pending'", userID).Scan(&pendingOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'completed'", userID).Scan(&completedOrders)
	thisYear := time.Now().Year()
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND YEAR(created_at) = ?", userID, thisYear).Scan(&thisYearOrders)

	// Monthly spending — last 6 months
	type MonthData struct {
		Month      string  `json:"month"`
		Amount     int     `json:"amount"`
		Percentage float64 `json:"percentage"`
	}
	var monthly []MonthData
	rows, err := config.DB.Query(`
		SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total_amount) as amount
		FROM orders
		WHERE user_id = ? AND status = 'delivered' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
		GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
		ORDER BY YEAR(created_at), MONTH(created_at)
	`, userID)
	maxAmount := 0
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var m MonthData
			var amountF float64
			rows.Scan(&m.Month, &amountF)
			m.Amount = int(amountF)
			if m.Amount > maxAmount {
				maxAmount = m.Amount
			}
			monthly = append(monthly, m)
		}
	}
	for i := range monthly {
		if maxAmount > 0 {
			monthly[i].Percentage = float64(monthly[i].Amount) / float64(maxAmount) * 100
		}
	}
	if monthly == nil {
		monthly = []MonthData{}
	}

	// Category breakdown (spending by product category)
	type CategoryData struct {
		Name       string  `json:"name"`
		Value      int     `json:"value"`
		Percentage float64 `json:"percentage"`
	}
	var categories []CategoryData
	catRows, err := config.DB.Query(`
		SELECT COALESCE(c.name, 'Other') as cat, SUM(oi.price * oi.quantity) as total
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		JOIN products p ON p.id = oi.product_id
		LEFT JOIN categories c ON c.id = p.category_id
		WHERE o.user_id = ? AND o.status = 'delivered'
		GROUP BY cat
		ORDER BY total DESC
		LIMIT 5
	`, userID)
	totalCatSpend := 0
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var c CategoryData
			var valueF float64
			catRows.Scan(&c.Name, &valueF)
			c.Value = int(valueF)
			totalCatSpend += c.Value
			categories = append(categories, c)
		}
	}
	for i := range categories {
		if totalCatSpend > 0 {
			categories[i].Percentage = float64(categories[i].Value) / float64(totalCatSpend) * 100
		}
	}
	if categories == nil {
		categories = []CategoryData{}
	}

	utils.SuccessResponse(w, "Stats fetched", map[string]interface{}{
		"total_orders":       totalOrders,
		"pending_orders":     pendingOrders,
		"completed_orders":   completedOrders,
		"this_year_orders":   thisYearOrders,
		"monthly_spending":   monthly,
		"category_breakdown": categories,
	})
}

// GET /api/users/{id}/orders?limit=5
func GetUserOrders(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if l, e := strconv.Atoi(limitStr); e == nil && l > 0 {
		limit = l
	}

	rows, err := config.DB.Query(`
		SELECT o.order_number, GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', ') as products,
			SUM(oi.quantity) as total_qty, o.total_amount, o.status, o.created_at
		FROM orders o
		JOIN order_items oi ON oi.order_id = o.id
		JOIN products p ON p.id = oi.product_id
		WHERE o.user_id = ?
		GROUP BY o.id, o.order_number, o.total_amount, o.status, o.created_at
		ORDER BY o.created_at DESC
		LIMIT ?
	`, userID, limit)
	if err != nil {
		utils.SuccessResponse(w, "Orders fetched", []interface{}{})
		return
	}
	defer rows.Close()

	type OrderRow struct {
		ID        string `json:"id"`
		Products  string `json:"products"`
		TotalQty  int    `json:"total_qty"`
		Total     int    `json:"total"`
		Status    string `json:"status"`
		CreatedAt string `json:"created_at"`
	}
	var orders []OrderRow
	for rows.Next() {
		var o OrderRow
		var createdAt time.Time
		var totalF float64
		rows.Scan(&o.ID, &o.Products, &o.TotalQty, &totalF, &o.Status, &createdAt)
		o.Total = int(totalF)
		o.CreatedAt = createdAt.Format("Jan 02, 2006")
		orders = append(orders, o)
	}
	if orders == nil {
		orders = []OrderRow{}
	}
	utils.SuccessResponse(w, "Orders fetched", orders)
}

// GET /api/users/{id}/orders/{orderNumber}
func GetOrderDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	orderNumber := vars["orderNumber"]

	type OrderHeader struct {
		OrderNumber string `json:"order_number"`
		Status      string `json:"status"`
		Subtotal    int    `json:"subtotal"`
		Discount    int    `json:"discount"`
		Total       int    `json:"total"`
		CreatedAt   string `json:"created_at"`
	}
	var header OrderHeader
	var createdAt time.Time
	var subtotalF, discountF, totalF float64
	err = config.DB.QueryRow(`
		SELECT order_number, status, subtotal, discount_amount, total_amount, created_at
		FROM orders WHERE order_number = ? AND user_id = ?
	`, orderNumber, userID).Scan(&header.OrderNumber, &header.Status, &subtotalF, &discountF, &totalF, &createdAt)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "Order not found")
		return
	}
	header.Subtotal = int(subtotalF)
	header.Discount = int(discountF)
	header.Total = int(totalF)
	header.CreatedAt = createdAt.Format("Jan 02, 2006")

	type ItemRow struct {
		ProductName  string `json:"product_name"`
		ProductImage string `json:"product_image"`
		Quantity     int    `json:"quantity"`
		Price        int    `json:"price"`
		Subtotal     int    `json:"subtotal"`
	}
	iRows, err := config.DB.Query(`
		SELECT oi.product_name,
		       COALESCE(NULLIF(oi.product_image,''), p.image_url, '') as img,
		       oi.quantity, oi.price, oi.subtotal
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		LEFT JOIN products p ON p.id = oi.product_id
		WHERE o.order_number = ? AND o.user_id = ?
		ORDER BY oi.id ASC
	`, orderNumber, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch order items: "+err.Error())
		return
	}
	defer iRows.Close()

	var orderItems []ItemRow
	for iRows.Next() {
		var item ItemRow
		var pf, sf float64
		iRows.Scan(&item.ProductName, &item.ProductImage, &item.Quantity, &pf, &sf)
		item.Price = int(pf)
		item.Subtotal = int(sf)
		orderItems = append(orderItems, item)
	}
	if orderItems == nil {
		orderItems = []ItemRow{}
	}
	utils.SuccessResponse(w, "Order detail fetched", map[string]interface{}{
		"order": header,
		"items": orderItems,
	})
}

// PATCH /api/users/{id}/orders/{orderNumber}/status
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	orderNumber := vars["orderNumber"]

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	validStatuses := map[string]bool{
		"pending": true, "processing": true, "shipped": true,
		"delivered": true, "cancelled": true,
	}
	if !validStatuses[req.Status] {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid status")
		return
	}

	result, err := config.DB.Exec(
		"UPDATE orders SET status = ? WHERE order_number = ? AND user_id = ?",
		req.Status, orderNumber, userID,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update status: "+err.Error())
		return
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Order not found")
		return
	}
	utils.SuccessResponse(w, "Order status updated", map[string]string{"status": req.Status})
}
