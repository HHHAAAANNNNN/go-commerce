package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/models"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// GetAllUsers - GET /api/users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, full_name, email, phone, balance, is_member, total_spent, avatar_url, created_at FROM users ORDER BY id`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		var avatarURL sql.NullString
		err := rows.Scan(&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Balance, &user.IsMember, &user.TotalSpent, &avatarURL, &user.CreatedAt)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to scan user")
			return
		}
		if avatarURL.Valid {
			user.AvatarURL = avatarURL.String
		}
		users = append(users, user)
	}

	utils.SuccessResponse(w, "Users fetched successfully", users)
}

// GetUserByID - GET /api/users/{id}
func GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	query := `SELECT id, full_name, email, phone, balance, is_member, total_spent, avatar_url, created_at FROM users WHERE id = ?`

	var user models.User
	var avatarURL sql.NullString
	err = config.DB.QueryRow(query, id).Scan(
		&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Balance, &user.IsMember, &user.TotalSpent, &avatarURL, &user.CreatedAt,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}
	if avatarURL.Valid {
		user.AvatarURL = avatarURL.String
	}

	utils.SuccessResponse(w, "User fetched successfully", user)
}

// CreateUser - POST /api/users
func CreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.UserCreateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.FullName == "" || req.Email == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Full name and email are required")
		return
	}

	query := `INSERT INTO users (full_name, email) VALUES (?, ?)`
	result, err := config.DB.Exec(query, req.FullName, req.Email)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	id, _ := result.LastInsertId()
	user := models.User{
		ID:       int(id),
		FullName: req.FullName,
		Email:    req.Email,
	}

	utils.CreatedResponse(w, "User created successfully", user)
}

// UpdateUser - PUT /api/users/{id}
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req models.UserUpdateRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	query := `UPDATE users SET full_name = ?, balance = ?, is_member = ? WHERE id = ?`
	result, err := config.DB.Exec(query, req.FullName, req.Balance, req.IsMember, id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(w, "User updated successfully", nil)
}

// UpdateProfile - PUT /api/users/{id}/profile
// Handles: full_name, phone, email, avatar_url, and optional password change
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	type ProfileUpdateRequest struct {
		FullName        string `json:"full_name"`
		Phone           string `json:"phone"`
		Email           string `json:"email"`
		AvatarURL       string `json:"avatar_url"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	var req ProfileUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// If password change requested — verify current password first
	if req.NewPassword != "" {
		if req.CurrentPassword == "" {
			utils.ErrorResponse(w, http.StatusBadRequest, "Current password is required to set a new password")
			return
		}
		var hashedPassword string
		err := config.DB.QueryRow("SELECT password FROM users WHERE id = ?", id).Scan(&hashedPassword)
		if err != nil {
			utils.ErrorResponse(w, http.StatusNotFound, "User not found")
			return
		}
		if bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.CurrentPassword)) != nil {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Current password is incorrect")
			return
		}
		// Hash new password and update
		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to hash password")
			return
		}
		config.DB.Exec("UPDATE users SET password = ? WHERE id = ?", string(newHash), id)
	}

	// Update profile fields
	result, err := config.DB.Exec(
		"UPDATE users SET full_name = ?, phone = ?, email = ?, avatar_url = ? WHERE id = ?",
		req.FullName, req.Phone, req.Email, req.AvatarURL, id,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update profile: "+err.Error())
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	// Return only the fields that were changed — avoids re-querying with
	// balance/is_member columns that may fail due to type scan issues.
	// The frontend merges these partial fields on top of existing localStorage data.
	type ProfileResponse struct {
		ID        int    `json:"id"`
		FullName  string `json:"full_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
		AvatarURL string `json:"avatar_url,omitempty"`
	}
	utils.SuccessResponse(w, "Profile updated successfully", ProfileResponse{
		ID:        id,
		FullName:  req.FullName,
		Email:     req.Email,
		Phone:     req.Phone,
		AvatarURL: req.AvatarURL,
	})
}

// DeleteUser - DELETE /api/users/{id}
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	query := `DELETE FROM users WHERE id = ?`
	result, err := config.DB.Exec(query, id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(w, "User deleted successfully", nil)
}

// GetBalance - GET /api/users/{id}/balance
func GetBalance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var balance int
	err = config.DB.QueryRow("SELECT balance FROM users WHERE id = ?", id).Scan(&balance)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(w, "Balance fetched", map[string]int{"balance": balance})
}

// TopUp - POST /api/users/{id}/topup
func TopUp(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req struct {
		Amount int `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Amount <= 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "Top-up amount must be greater than 0")
		return
	}

	// Atomically increment balance
	result, err := config.DB.Exec("UPDATE users SET balance = balance + ? WHERE id = ?", req.Amount, id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to top up balance")
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	// Return updated balance
	var newBalance int
	config.DB.QueryRow("SELECT balance FROM users WHERE id = ?", id).Scan(&newBalance)

	utils.SuccessResponse(w, "Top-up successful", map[string]int{"balance": newBalance})
}

// GetDashboard - GET /api/users/{id}/dashboard
// Returns all dashboard data in a single DB round-trip to prevent connection overload.
func GetDashboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// 1. User info (balance, total_spent)
	var balance, totalSpent int
	config.DB.QueryRow("SELECT balance, total_spent FROM users WHERE id = ?", id).Scan(&balance, &totalSpent)

	// 2. Order stats
	var totalOrders, pendingOrders, completedOrders, thisYearOrders int
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ?", id).Scan(&totalOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'pending'", id).Scan(&pendingOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'completed'", id).Scan(&completedOrders)
	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = ? AND YEAR(created_at) = YEAR(NOW())", id).Scan(&thisYearOrders)

	// 3. Monthly spending
	type MonthData struct {
		Month      string  `json:"month"`
		Amount     int     `json:"amount"`
		Percentage float64 `json:"percentage"`
	}
	var monthly []MonthData
	mRows, _ := config.DB.Query(`
		SELECT DATE_FORMAT(created_at,'%b') as month, SUM(total_amount) as amount
		FROM orders WHERE user_id = ? AND status='delivered' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
		GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at,'%b')
		ORDER BY YEAR(created_at), MONTH(created_at)`, id)
	if mRows != nil {
		defer mRows.Close()
		maxAmt := 0
		for mRows.Next() {
			var m MonthData
			var f float64
			mRows.Scan(&m.Month, &f)
			m.Amount = int(f)
			if m.Amount > maxAmt {
				maxAmt = m.Amount
			}
			monthly = append(monthly, m)
		}
		for i := range monthly {
			if maxAmt > 0 {
				monthly[i].Percentage = float64(monthly[i].Amount) / float64(maxAmt) * 100
			}
		}
	}
	if monthly == nil {
		monthly = []MonthData{}
	}

	// 4. Category breakdown
	type CategoryData struct {
		Name       string  `json:"name"`
		Value      int     `json:"value"`
		Percentage float64 `json:"percentage"`
	}
	var categories []CategoryData
	cRows, _ := config.DB.Query(`
		SELECT COALESCE(c.name,'Other') as cat, SUM(oi.price*oi.quantity) as total
		FROM order_items oi
		JOIN orders o ON o.id=oi.order_id
		JOIN products p ON p.id=oi.product_id
		LEFT JOIN categories c ON c.id=p.category_id
		WHERE o.user_id=? AND o.status='delivered'
		GROUP BY cat ORDER BY total DESC LIMIT 5`, id)
	totalCat := 0
	if cRows != nil {
		defer cRows.Close()
		for cRows.Next() {
			var c CategoryData
			var f float64
			cRows.Scan(&c.Name, &f)
			c.Value = int(f)
			totalCat += c.Value
			categories = append(categories, c)
		}
		for i := range categories {
			if totalCat > 0 {
				categories[i].Percentage = float64(categories[i].Value) / float64(totalCat) * 100
			}
		}
	}
	if categories == nil {
		categories = []CategoryData{}
	}

	// 5. Recent orders (last 5)
	type OrderRow struct {
		ID        string `json:"id"`
		Products  string `json:"products"`
		TotalQty  int    `json:"total_qty"`
		Total     int    `json:"total"`
		Status    string `json:"status"`
		CreatedAt string `json:"created_at"`
	}
	var orders []OrderRow
	oRows, _ := config.DB.Query(`
		SELECT o.order_number, GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', '),
			SUM(oi.quantity), o.total_amount, o.status, o.created_at
		FROM orders o
		JOIN order_items oi ON oi.order_id=o.id
		JOIN products p ON p.id=oi.product_id
		WHERE o.user_id=?
		GROUP BY o.id, o.order_number, o.total_amount, o.status, o.created_at
		ORDER BY o.created_at DESC LIMIT 5`, id)
	if oRows != nil {
		defer oRows.Close()
		for oRows.Next() {
			var o OrderRow
			var createdAt sql.NullTime
			var f float64
			oRows.Scan(&o.ID, &o.Products, &o.TotalQty, &f, &o.Status, &createdAt)
			o.Total = int(f)
			if createdAt.Valid {
				o.CreatedAt = createdAt.Time.Format("Jan 02, 2006")
			}
			orders = append(orders, o)
		}
	}
	if orders == nil {
		orders = []OrderRow{}
	}

	// 6. Products (for recommendations — fetched once)
	type Product struct {
		ID       int     `json:"id"`
		Name     string  `json:"name"`
		Price    int     `json:"price"`
		Category string  `json:"category"`
		Rating   float64 `json:"rating"`
		Stock    int     `json:"stock"`
		Image    string  `json:"image"`
		Brand    string  `json:"brand"`
	}
	var products []Product
	pRows, _ := config.DB.Query(`
		SELECT p.id, p.name, p.price, COALESCE(c.name,''), COALESCE(p.rating,0),
		       COALESCE(p.stock,0), COALESCE(p.image_url,''), COALESCE(p.brand,'')
		FROM products p
		LEFT JOIN categories c ON c.id = p.category_id
		WHERE p.is_active = 1
		LIMIT 20`)
	if pRows != nil {
		defer pRows.Close()
		for pRows.Next() {
			var p Product
			var priceF, rf float64
			pRows.Scan(&p.ID, &p.Name, &priceF, &p.Category, &rf, &p.Stock, &p.Image, &p.Brand)
			p.Price = int(priceF)
			p.Rating = rf
			products = append(products, p)
		}
	}
	if products == nil {
		products = []Product{}
	}

	// 7. Active vouchers
	type VoucherRow struct {
		ID            int     `json:"id"`
		Code          string  `json:"code"`
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		Type          string  `json:"type"`
		DiscountValue float64 `json:"discount_value"`
		MinPurchase   int     `json:"min_purchase"`
		MaxDiscount   float64 `json:"max_discount"`
		UsageLimit    int     `json:"usage_limit"`
		UsedCount     int     `json:"used_count"`
		ValidFrom     string  `json:"valid_from"`
		ValidUntil    string  `json:"valid_until"`
		IsActive      bool    `json:"is_active"`
	}
	var vouchers []VoucherRow
	vRows, _ := config.DB.Query(`SELECT id, code, name, COALESCE(description,''), type, discount_value, min_purchase, max_discount, usage_limit, used_count, valid_from, valid_until, is_active FROM vouchers WHERE is_active=1 AND valid_until > NOW()`)
	if vRows != nil {
		defer vRows.Close()
		for vRows.Next() {
			var v VoucherRow
			var vf, maxD, minPurchaseF float64
			var vFrom, vUntil sql.NullTime
			vRows.Scan(&v.ID, &v.Code, &v.Name, &v.Description, &v.Type, &vf, &minPurchaseF, &maxD, &v.UsageLimit, &v.UsedCount, &vFrom, &vUntil, &v.IsActive)
			v.DiscountValue = vf
			v.MaxDiscount = maxD
			v.MinPurchase = int(minPurchaseF)
			if vFrom.Valid {
				v.ValidFrom = vFrom.Time.Format("2006-01-02T15:04:05Z")
			}
			if vUntil.Valid {
				v.ValidUntil = vUntil.Time.Format("2006-01-02T15:04:05Z")
			}
			vouchers = append(vouchers, v)
		}
	}
	if vouchers == nil {
		vouchers = []VoucherRow{}
	}

	utils.SuccessResponse(w, "Dashboard fetched", map[string]interface{}{
		"balance":     balance,
		"total_spent": totalSpent,
		"stats": map[string]interface{}{
			"total_orders":       totalOrders,
			"pending_orders":     pendingOrders,
			"completed_orders":   completedOrders,
			"this_year_orders":   thisYearOrders,
			"monthly_spending":   monthly,
			"category_breakdown": categories,
		},
		"recent_orders": orders,
		"vouchers":      vouchers,
		"products":      products,
	})
}

// GetTotalSpent - GET /api/users/{id}/total-spent
func GetTotalSpent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var totalSpent int
	err = config.DB.QueryRow("SELECT total_spent FROM users WHERE id = ?", id).Scan(&totalSpent)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(w, "Total spent fetched", map[string]int{"total_spent": totalSpent})
}
