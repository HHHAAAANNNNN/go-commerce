package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/models"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest - Request body for registration
type RegisterRequest struct {
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest - Request body for login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse - Response for successful login
type LoginResponse struct {
	User  models.User `json:"user"`
	Token string      `json:"token,omitempty"` // For future JWT implementation
}

// Register - POST /api/auth/register
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validation
	if req.FullName == "" || req.Phone == "" || req.Email == "" || req.Password == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Mohon mengisi semua field secara lengkap")
		return
	}

	// Check if email already exists
	var existingID int
	checkQuery := `SELECT id FROM users WHERE email = ?`
	err = config.DB.QueryRow(checkQuery, req.Email).Scan(&existingID)
	if err == nil {
		utils.ErrorResponse(w, http.StatusConflict, "Email sudah terdaftar")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Prepare query and values in DB column order (only columns that exist)
	query := `INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)`
	values := []interface{}{req.FullName, req.Email, string(hashedPassword), req.Phone}
	log.Printf("[DEBUG] SQL Query: %s", query)
	log.Printf("[DEBUG] Values: full_name='%s', email='%s', password='%s', phone='%s'", req.FullName, req.Email, string(hashedPassword), req.Phone)

	result, err := config.DB.Exec(query, values...)
	if err != nil {
		log.Printf("❌ Registration error: %v", err)
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Gagal mendaftarkan akun: %v", err))
		return
	}

	id, _ := result.LastInsertId()
	user := models.User{
		ID:       int(id),
		FullName: req.FullName,
		Email:    req.Email,
		Phone:    req.Phone,
	}

	utils.CreatedResponse(w, "Registrasi berhasil! Silakan login", user)
}

// Login - POST /api/auth/login
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validation
	if req.Email == "" || req.Password == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Email dan password harus diisi")
		return
	}

	// Get user from database
	var user models.User
	var hashedPassword string
	query := `SELECT id, full_name, email, password, balance, is_member, created_at FROM users WHERE email = ?`
	err = config.DB.QueryRow(query, req.Email).Scan(
		&user.ID, &user.FullName, &user.Email, &hashedPassword, &user.Balance, &user.IsMember, &user.CreatedAt,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password))
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	// Successful login
	response := LoginResponse{
		User: user,
	}

	utils.SuccessResponse(w, "Login berhasil", response)
}
