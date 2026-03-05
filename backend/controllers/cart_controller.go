package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
)

type CartItemResponse struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

// GetCartItems - GET /api/users/{id}/cart
func GetCartItems(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	rows, err := config.DB.Query("SELECT id, user_id, product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY created_at DESC", userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch cart items")
		return
	}
	defer rows.Close()

	var items []CartItemResponse
	for rows.Next() {
		var item CartItemResponse
		if err := rows.Scan(&item.ID, &item.UserID, &item.ProductID, &item.Quantity); err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to scan cart item")
			return
		}
		items = append(items, item)
	}

	if items == nil {
		items = []CartItemResponse{}
	}

	utils.SuccessResponse(w, "Cart items fetched", items)
}

// AddToCart - POST /api/users/{id}/cart
func AddToCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var rawReq map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rawReq); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var productID string
	switch v := rawReq["product_id"].(type) {
	case string:
		productID = v
	case float64:
		productID = strconv.Itoa(int(v))
	default:
		utils.ErrorResponse(w, http.StatusBadRequest, "product_id is required")
		return
	}

	var quantity int
	switch v := rawReq["quantity"].(type) {
	case float64:
		quantity = int(v)
	default:
		quantity = 1
	}

	if productID == "" || quantity <= 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "product_id and quantity > 0 are required")
		return
	}

	// Upsert: if item already exists, add to quantity
	_, err = config.DB.Exec(
		"INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)",
		userID, productID, quantity,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to add to cart: "+err.Error())
		return
	}

	utils.CreatedResponse(w, "Item added to cart", nil)
}

// UpdateCartItem - PUT /api/users/{id}/cart/{productId}
func UpdateCartItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	productID := vars["productId"]

	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Quantity <= 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "quantity must be > 0")
		return
	}

	result, err := config.DB.Exec("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", req.Quantity, userID, productID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update cart item")
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Cart item not found")
		return
	}

	utils.SuccessResponse(w, "Cart item updated", nil)
}

// RemoveFromCart - DELETE /api/users/{id}/cart/{productId}
func RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	productID := vars["productId"]

	result, err := config.DB.Exec("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", userID, productID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to remove cart item")
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Cart item not found")
		return
	}

	utils.SuccessResponse(w, "Item removed from cart", nil)
}
