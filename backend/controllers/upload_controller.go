package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func UploadProductImage(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20) // 10MB max

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create uploads directory jika belum ada
	uploadsDir := "/app/uploads"
	if os.Getenv("RAILWAY_ENVIRONMENT_NAME") == "" {
		// Local development
		uploadsDir = "./uploads"
	}

	os.MkdirAll(uploadsDir, 0755)

	// Generate unique filename
	ext := filepath.Ext(handler.Filename)
	filename := fmt.Sprintf("product_%d%s", time.Now().UnixNano(), ext)
	filepath := filepath.Join(uploadsDir, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	io.Copy(dst, file)

	// Return accessible URL
	imageURL := fmt.Sprintf("/assets/uploads/%s", filename)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": imageURL,
	})
}
