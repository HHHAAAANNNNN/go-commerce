package controllers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
)

// VoucherRow matches the existing `vouchers` table schema
type VoucherRow struct {
	ID            int     `json:"id"`
	Code          string  `json:"code"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Type          string  `json:"type"`
	DiscountValue float64 `json:"discount_value"`
	MinPurchase   float64 `json:"min_purchase"`
	MaxDiscount   float64 `json:"max_discount"`
	UsageLimit    int     `json:"usage_limit"`
	UsedCount     int     `json:"used_count"`
	ValidFrom     string  `json:"valid_from"`
	ValidUntil    string  `json:"valid_until"`
	IsActive      bool    `json:"is_active"`
	CreatedAt     string  `json:"created_at"`
}

type VoucherCreateRequest struct {
	Code          string  `json:"code"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Type          string  `json:"type"`
	DiscountValue float64 `json:"discount_value"`
	MinPurchase   float64 `json:"min_purchase"`
	MaxDiscount   float64 `json:"max_discount"`
	UsageLimit    int     `json:"usage_limit"`
	DurationDays  int     `json:"duration_days"`
}

// ListVouchers - GET /api/vouchers
func ListVouchers(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query(
		`SELECT id, code, name, description, type, discount_value, min_purchase, max_discount,
		        usage_limit, used_count, valid_from, valid_until, is_active, created_at
		 FROM vouchers ORDER BY created_at DESC`)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to fetch vouchers")
		return
	}
	defer rows.Close()

	var vouchers []VoucherRow
	for rows.Next() {
		var v VoucherRow
		var validFrom, validUntil, createdAt []byte
		if err := rows.Scan(
			&v.ID, &v.Code, &v.Name, &v.Description, &v.Type,
			&v.DiscountValue, &v.MinPurchase, &v.MaxDiscount,
			&v.UsageLimit, &v.UsedCount, &validFrom, &validUntil,
			&v.IsActive, &createdAt,
		); err != nil {
			continue
		}
		v.ValidFrom = string(validFrom)
		v.ValidUntil = string(validUntil)
		v.CreatedAt = string(createdAt)
		vouchers = append(vouchers, v)
	}
	if vouchers == nil {
		vouchers = []VoucherRow{}
	}
	utils.SuccessResponse(w, "Vouchers fetched successfully", vouchers)
}

// CreateVoucher - POST /api/vouchers
func CreateVoucher(w http.ResponseWriter, r *http.Request) {
	var req VoucherCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Code = strings.ToUpper(strings.TrimSpace(req.Code))
	if req.Code == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Voucher code is required")
		return
	}

	validTypes := map[string]bool{"percentage": true, "fixed_amount": true, "free_shipping": true}
	if !validTypes[req.Type] {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid voucher type")
		return
	}
	if req.Type == "free_shipping" {
		req.DiscountValue = 0
		req.MaxDiscount = 0
	}
	if req.DurationDays <= 0 {
		req.DurationDays = 30
	}

	now := time.Now()
	validUntil := now.AddDate(0, 0, req.DurationDays)

	result, err := config.DB.Exec(
		`INSERT INTO vouchers
		 (code, name, description, type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until, is_active)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
		req.Code, req.Name, req.Description, req.Type,
		req.DiscountValue, req.MinPurchase, req.MaxDiscount,
		req.UsageLimit, now, validUntil,
	)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			utils.ErrorResponse(w, http.StatusConflict, "Voucher code already exists")
			return
		}
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create voucher: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.CreatedResponse(w, "Voucher created successfully", map[string]interface{}{"id": id})
}
