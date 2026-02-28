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

// categoryToDir maps form category value to the correct subdirectory and URL path
func categoryToDir(category string) (dir string, urlBase string) {
	switch strings.ToLower(category) {
	case "smartphones":
		return filepath.Join("..", "public", "assets", "products", "phones"), "/assets/products/phones"
	case "laptops":
		return filepath.Join("..", "public", "assets", "products", "laptops"), "/assets/products/laptops"
	case "avatars":
		return filepath.Join("..", "public", "assets", "people"), "/assets/people"
	default:
		return filepath.Join("..", "public", "assets", "products"), "/assets/products"
	}
}

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

	// Get category from form and map to directory
	category := r.FormValue("category")
	dir, urlBase := categoryToDir(category)

	// Create unique filename
	filename := fmt.Sprintf("%d_%s", header.Size, header.Filename)
	filename = strings.ReplaceAll(filename, " ", "-")
	filename = strings.ToLower(filename)

	// Create directory path
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

	// Return relative URL (no host/port prefix)
	url := fmt.Sprintf("%s/%s", urlBase, filename)
	utils.SuccessResponse(w, "Image uploaded successfully", map[string]string{"url": url})
}
