package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
)

// POST /api/users/{id}/orders/{orderNumber}/reviews
// Body: [{"product_id": 16, "rating": 5, "review_text": "Great product!"}, ...]
func SubmitReviews(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	orderNumber := vars["orderNumber"]

	// Resolve numeric order ID
	var orderID int
	err = config.DB.QueryRow(
		"SELECT id FROM orders WHERE order_number = ? AND user_id = ?",
		orderNumber, userID,
	).Scan(&orderID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "Order not found")
		return
	}

	type ReviewItem struct {
		ProductID  int    `json:"product_id"`
		Rating     int    `json:"rating"`
		ReviewText string `json:"review_text"`
	}

	var items []ReviewItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	for _, item := range items {
		if item.ProductID <= 0 || item.Rating < 1 || item.Rating > 5 {
			continue
		}
		_, _ = config.DB.Exec(`
			INSERT INTO reviews (product_id, user_id, order_id, rating, review_text, is_verified, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
			ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), updated_at = NOW()
		`, item.ProductID, userID, orderID, item.Rating, item.ReviewText)

		// Recalculate product average rating and review count
		_, _ = config.DB.Exec(`
			UPDATE products SET
				rating        = (SELECT AVG(rating)   FROM reviews WHERE product_id = ?),
				total_reviews = (SELECT COUNT(*)       FROM reviews WHERE product_id = ?)
			WHERE id = ?
		`, item.ProductID, item.ProductID, item.ProductID)
	}

	utils.SuccessResponse(w, "Reviews submitted successfully", nil)
}

// GET /api/products/{id}/reviews
func GetProductReviews(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	type ReviewRow struct {
		ID         int    `json:"id"`
		UserName   string `json:"user_name"`
		Rating     int    `json:"rating"`
		ReviewText string `json:"review_text"`
		IsVerified bool   `json:"is_verified"`
		CreatedAt  string `json:"created_at"`
	}

	rows, err := config.DB.Query(`
		SELECT r.id,
		       COALESCE(NULLIF(u.full_name,''), u.email, 'Anonymous'),
		       r.rating,
		       COALESCE(r.review_text, ''),
		       r.is_verified,
		       r.created_at
		FROM reviews r
		JOIN users u ON u.id = r.user_id
		WHERE r.product_id = ?
		ORDER BY r.created_at DESC
	`, productID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}
	defer rows.Close()

	var reviews []ReviewRow
	for rows.Next() {
		var rev ReviewRow
		var createdAt time.Time
		var isVerified int
		if err := rows.Scan(&rev.ID, &rev.UserName, &rev.Rating, &rev.ReviewText, &isVerified, &createdAt); err != nil {
			continue
		}
		rev.IsVerified = isVerified == 1
		rev.CreatedAt = createdAt.Format("Jan 02, 2006")
		reviews = append(reviews, rev)
	}
	if reviews == nil {
		reviews = []ReviewRow{}
	}

	utils.SuccessResponse(w, "Reviews fetched", reviews)
}
