package controllers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
)

// UploadImage - POST /api/upload
func UploadImage(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (max 5MB)
	err := r.ParseMultipartForm(5 << 20)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 5MB)")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to get image file")
		return
	}
	defer file.Close()

	// Validate file type
	fileType := header.Header.Get("Content-Type")
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/jpg":  true,
		"image/webp": true,
	}
	if !allowedTypes[fileType] {
		utils.ErrorResponse(w, http.StatusBadRequest, "Only JPG, PNG, and WEBP images are allowed")
		return
	}

	// Get category from form
	category := r.FormValue("category")
	if category == "" {
		category = "products"
	}

	// Create unique filename
	filename := fmt.Sprintf("%d_%s", header.Size, header.Filename)
	filename = strings.ReplaceAll(filename, " ", "-")
	filename = strings.ToLower(filename)

	// Create directory path
	dir := filepath.Join("public", "assets", category)
	if err := os.MkdirAll(dir, 0755); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create directory")
		return
	}

	// Create file
	filePath := filepath.Join(dir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to save file")
		return
	}
	defer dst.Close()

	// Copy file
	_, err = io.Copy(dst, file)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to save file")
		return
	}

	// Return URL
	url := fmt.Sprintf("/assets/%s/%s", category, filename)
	utils.SuccessResponse(w, "Image uploaded successfully", map[string]string{"url": url})
}
