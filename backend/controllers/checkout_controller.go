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
		price     int
		quantity  int
		category  string
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
		// Get product price, name, category, stock
		var stock int
		err = tx.QueryRow("SELECT name, price, stock, COALESCE(category,'') FROM products WHERE id = ?", pid).Scan(&item.name, &item.price, &stock, &item.category)
		if err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Product %s not found", pid))
			return
		}
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
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to deduct balance")
		return
	}

	// 7. Increment total_spent
	_, err = tx.Exec("UPDATE users SET total_spent = total_spent + ? WHERE id = ?", total, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update total_spent")
		return
	}

	// 8. Create order
	orderID := fmt.Sprintf("ORD-%d-%d", userID, time.Now().UnixMilli())
	_, err = tx.Exec("INSERT INTO orders (id, customer_id, total, status) VALUES (?, ?, ?, 'pending')", orderID, userID, total)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create order")
		return
	}

	// 9. Insert order items, reduce stock, delete cart items
	for _, item := range items {
		_, err = tx.Exec("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", orderID, item.productID, item.quantity, item.price)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to insert order item")
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
		"order_id": orderID,
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
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE customer_id = ?", userID).Scan(&totalOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE customer_id = ? AND status = 'pending'", userID).Scan(&pendingOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE customer_id = ? AND status = 'completed'", userID).Scan(&completedOrders)
	thisYear := time.Now().Year()
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE customer_id = ? AND YEAR(created_at) = ?", userID, thisYear).Scan(&thisYearOrders)

	// Monthly spending — last 6 months
	type MonthData struct {
		Month      string  `json:"month"`
		Amount     int     `json:"amount"`
		Percentage float64 `json:"percentage"`
	}
	var monthly []MonthData
	rows, err := config.DB.Query(`
		SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total) as amount
		FROM orders
		WHERE customer_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
		GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
		ORDER BY YEAR(created_at), MONTH(created_at)
	`, userID)
	maxAmount := 0
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var m MonthData
			rows.Scan(&m.Month, &m.Amount)
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
		SELECT COALESCE(p.category, 'Other') as cat, SUM(oi.price * oi.quantity) as total
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		JOIN products p ON p.id = oi.product_id
		WHERE o.customer_id = ?
		GROUP BY cat
		ORDER BY total DESC
		LIMIT 5
	`, userID)
	totalCatSpend := 0
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var c CategoryData
			catRows.Scan(&c.Name, &c.Value)
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
	limit := 5
	if l, e := strconv.Atoi(limitStr); e == nil && l > 0 {
		limit = l
	}

	rows, err := config.DB.Query(`
		SELECT o.id, GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', ') as products,
			SUM(oi.quantity) as total_qty, o.total, o.status, o.created_at
		FROM orders o
		JOIN order_items oi ON oi.order_id = o.id
		JOIN products p ON p.id = oi.product_id
		WHERE o.customer_id = ?
		GROUP BY o.id, o.total, o.status, o.created_at
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
		rows.Scan(&o.ID, &o.Products, &o.TotalQty, &o.Total, &o.Status, &createdAt)
		o.CreatedAt = createdAt.Format("Jan 02, 2006")
		orders = append(orders, o)
	}
	if orders == nil {
		orders = []OrderRow{}
	}
	utils.SuccessResponse(w, "Orders fetched", orders)
}
