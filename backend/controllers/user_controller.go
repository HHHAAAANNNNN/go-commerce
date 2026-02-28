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
	query := `SELECT id, full_name, email, phone, balance, is_member, avatar_url, created_at FROM users ORDER BY id`

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
		err := rows.Scan(&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Balance, &user.IsMember, &avatarURL, &user.CreatedAt)
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

	query := `SELECT id, full_name, email, phone, balance, is_member, avatar_url, created_at FROM users WHERE id = ?`

	var user models.User
	var avatarURL sql.NullString
	err = config.DB.QueryRow(query, id).Scan(
		&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Balance, &user.IsMember, &avatarURL, &user.CreatedAt,
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
