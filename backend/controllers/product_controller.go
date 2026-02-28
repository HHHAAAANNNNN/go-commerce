package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/models"
	"github.com/HHHAAAANNNNN/go-commerce-backend/utils"
	"github.com/gorilla/mux"
)

// GetAllProducts - GET /api/products
func GetAllProducts(w http.ResponseWriter, r *http.Request) {
	query := `SELECT p.id, p.name, p.price, p.stock, c.name, p.rating, p.description, p.image_url, p.brand, p.created_at 
			  FROM products p 
			  LEFT JOIN categories c ON p.category_id = c.id 
			  ORDER BY p.id ASC`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Query error: "+err.Error())
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		var imageURL, description, brand string
		var category sql.NullString
		var priceFloat float64
		var ratingFloat float64

		err := rows.Scan(&product.ID, &product.Name, &priceFloat, &product.Stock,
			&category, &ratingFloat, &description, &imageURL, &brand, &product.CreatedAt)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Scan error: "+err.Error())
			return
		}
		product.Price = int(priceFloat)
		product.Rating = models.Decimal(ratingFloat)
		product.Description = description
		product.Image = imageURL
		product.Brand = brand
		if category.Valid {
			product.Category = category.String
		} else {
			product.Category = "Uncategorized"
		}
		products = append(products, product)
	}

	if len(products) == 0 {
		utils.SuccessResponse(w, "No products found", []models.Product{})
		return
	}

	utils.SuccessResponse(w, "Products fetched successfully", products)
}

// GetProductByID - GET /api/products/{id}
func GetProductByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	productID, err := strconv.Atoi(id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	query := `SELECT p.id, p.name, p.price, p.stock, c.name, p.rating, p.description, p.image_url, p.brand, p.created_at 
			  FROM products p 
			  LEFT JOIN categories c ON p.category_id = c.id 
			  WHERE p.id = ?`

	var product models.Product
	var imageURL, description, brand string
	var category sql.NullString
	var priceFloat float64
	var ratingFloat float64

	err = config.DB.QueryRow(query, productID).Scan(
		&product.ID, &product.Name, &priceFloat, &product.Stock,
		&category, &ratingFloat, &description, &imageURL, &brand, &product.CreatedAt,
	)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "Product not found")
		return
	}

	product.Price = int(priceFloat)
	product.Rating = models.Decimal(ratingFloat)
	product.Description = description
	product.Image = imageURL
	product.Brand = brand
	if category.Valid {
		product.Category = category.String
	} else {
		product.Category = "Uncategorized"
	}

	// Fetch key-value specifications
	product.Specifications = fetchSpecifications(product.ID)

	utils.SuccessResponse(w, "Product fetched successfully", product)
}

// fetchSpecifications returns all spec rows for a product as key-value pairs
func fetchSpecifications(productID int) []models.ProductSpec {
	rows, err := config.DB.Query(
		`SELECT spec_key, spec_value FROM product_specifications 
		 WHERE product_id = ? ORDER BY display_order ASC`, productID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var specs []models.ProductSpec
	for rows.Next() {
		var s models.ProductSpec
		if err := rows.Scan(&s.Key, &s.Value); err != nil {
			continue
		}
		specs = append(specs, s)
	}
	return specs
}

// insertSpec inserts a single key-value spec row (skips empty values)
func insertSpec(productID int64, key, value string, order int) error {
	if value == "" {
		return nil
	}
	_, err := config.DB.Exec(
		`INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES (?, ?, ?, ?)`,
		productID, key, value, order,
	)
	return err
}

// CreateProduct - POST /api/products
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req models.ProductCreateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" || req.Price <= 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "Name and price are required")
		return
	}

	// Get category_id from category name
	var categoryID int
	err = config.DB.QueryRow("SELECT id FROM categories WHERE name = ?", req.Category).Scan(&categoryID)
	if err != nil {
		categoryID = 1
	}

	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))

	query := `INSERT INTO products (name, slug, price, stock, category_id, rating, description, image_url, brand) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := config.DB.Exec(query, req.Name, slug, req.Price, req.Stock, categoryID, req.Rating, req.Description, req.Image, req.Brand)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create product: "+err.Error())
		return
	}

	productID, err := result.LastInsertId()
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get product ID")
		return
	}

	// Insert specifications as key-value rows
	order := 1
	specRows := []struct{ key, value string }{
		{"Chipset", req.Chipset},
		{"RAM", formatRAM(req.RamGB, req.RamDdr)},
		{"ROM", formatROM(req.RomValue, req.RomUnit, req.StorageType)},
		{"Display", formatDisplay(req.DisplayInch)},
		{"Refresh Rate", formatRefreshRate(req.RefreshRateHz)},
		{"Battery", req.Battery},
		{"Charging", req.Charging},
		{"Camera", req.Camera},
		{"Operating System", formatOS(req.OsName, req.OsVersion)},
		{"Connectivity", formatConnectivity(req.Connectivity5G, req.ConnectivityWifi, req.ConnectivityNfc)},
	}

	for _, s := range specRows {
		if err := insertSpec(productID, s.key, s.value, order); err != nil {
			// Log but don't fail; product was already created
			fmt.Printf("Warning: failed to insert spec %s: %v\n", s.key, err)
		}
		order++
	}

	utils.CreatedResponse(w, "Product created successfully", map[string]interface{}{"id": productID})
}

// --- Spec value formatters ---

func formatRAM(ramGB int, ddr string) string {
	if ramGB <= 0 {
		return ""
	}
	if ddr != "" {
		return fmt.Sprintf("%d GB %s", ramGB, ddr)
	}
	return fmt.Sprintf("%d GB", ramGB)
}

func formatROM(value int, unit string, storageType string) string {
	if value <= 0 {
		return ""
	}
	if unit == "" {
		unit = "GB"
	}
	if storageType != "" {
		return fmt.Sprintf("%d %s %s", value, unit, storageType)
	}
	return fmt.Sprintf("%d %s", value, unit)
}

func formatDisplay(inch float64) string {
	if inch <= 0 {
		return ""
	}
	return fmt.Sprintf("%.1f inch", inch)
}

func formatRefreshRate(hz int) string {
	if hz <= 0 {
		return ""
	}
	return fmt.Sprintf("%d Hz", hz)
}

func formatOS(name, version string) string {
	if name == "" {
		return ""
	}
	if version != "" {
		return name + " " + version
	}
	return name
}

func formatConnectivity(g5, wifi, nfc bool) string {
	var parts []string
	if g5 {
		parts = append(parts, "5G")
	}
	if wifi {
		parts = append(parts, "Wi-Fi")
	}
	if nfc {
		parts = append(parts, "NFC")
	}
	return strings.Join(parts, ", ")
}

// UpdateProduct - PUT /api/products/{id}
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req models.ProductUpdateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	query := `UPDATE products SET name = ?, price = ?, stock = ?, rating = ?, description = ?, image_url = ?, brand = ? WHERE id = ?`
	result, err := config.DB.Exec(query, req.Name, req.Price, req.Stock, req.Rating, req.Description, req.Image, req.Brand, id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update product")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Product not found")
		return
	}

	utils.SuccessResponse(w, "Product updated successfully", nil)
}

// DeleteProduct - DELETE /api/products/{id}
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	query := `DELETE FROM products WHERE id = ?`
	result, err := config.DB.Exec(query, id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to delete product")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Product not found")
		return
	}

	utils.SuccessResponse(w, "Product deleted successfully", nil)
}

// SearchProducts - GET /api/products/search?q=keyword
func SearchProducts(w http.ResponseWriter, r *http.Request) {
	keyword := r.URL.Query().Get("q")
	if keyword == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Search keyword is required")
		return
	}

	query := `SELECT p.id, p.name, p.price, p.stock, c.name, p.rating, p.description, p.image_url, p.brand, p.created_at
              FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE p.name LIKE ? OR p.description LIKE ?
              ORDER BY p.rating DESC`

	searchPattern := "%" + keyword + "%"
	rows, err := config.DB.Query(query, searchPattern, searchPattern)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to search products")
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		var imageURL, description, brand string
		var category sql.NullString
		var priceFloat float64
		var ratingFloat float64

		err := rows.Scan(&product.ID, &product.Name, &priceFloat, &product.Stock,
			&category, &ratingFloat, &description, &imageURL, &brand, &product.CreatedAt)
		if err != nil {
			continue
		}
		product.Price = int(priceFloat)
		product.Rating = models.Decimal(ratingFloat)
		product.Description = description
		product.Image = imageURL
		product.Brand = brand
		if category.Valid {
			product.Category = category.String
		} else {
			product.Category = "Uncategorized"
		}
		products = append(products, product)
	}

	utils.SuccessResponse(w, "Search completed", products)
}
