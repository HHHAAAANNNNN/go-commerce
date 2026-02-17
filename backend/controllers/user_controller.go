package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/models"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
)

// GetAllUsers - GET /api/users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, full_name, email, balance, is_member, created_at FROM users ORDER BY id`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.FullName, &user.Email, &user.Balance, &user.IsMember, &user.CreatedAt)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to scan user")
			return
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

	query := `SELECT id, full_name, email, balance, is_member, created_at FROM users WHERE id = ?`

	var user models.User
	err = config.DB.QueryRow(query, id).Scan(
		&user.ID, &user.FullName, &user.Email, &user.Balance, &user.IsMember, &user.CreatedAt,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "User not found")
		return
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

	// Validation
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
