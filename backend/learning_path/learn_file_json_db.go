package main

import (
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// ========================================
// STRUCTS
// ========================================

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Balance   int       `json:"balance"`
	IsMember  bool      `json:"is_member"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Price     int       `json:"price"`
	Stock     int       `json:"stock"`
	Category  string    `json:"category"`
	Rating    float64   `json:"rating"`
	CreatedAt time.Time `json:"created_at"`
}

type Order struct {
	ID         string    `json:"id"`
	CustomerID int       `json:"customer_id"`
	Total      int       `json:"total"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

// ========================================
// FILE OPERATIONS
// ========================================

// Write text to file
func writeToFile(filename, content string) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	_, err = file.WriteString(content)
	if err != nil {
		return fmt.Errorf("failed to write to file: %w", err)
	}

	return nil
}

// Read text from file
func readFromFile(filename string) (string, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	return string(content), nil
}

// Append to file
func appendToFile(filename, content string) error {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	_, err = file.WriteString(content)
	if err != nil {
		return fmt.Errorf("failed to append to file: %w", err)
	}

	return nil
}

// ========================================
// JSON OPERATIONS
// ========================================

// Save struct to JSON file
func saveToJSON(filename string, data interface{}) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create JSON file: %w", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ") // Pretty print
	err = encoder.Encode(data)
	if err != nil {
		return fmt.Errorf("failed to encode JSON: %w", err)
	}

	return nil
}

// Load struct from JSON file
func loadFromJSON(filename string, target interface{}) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open JSON file: %w", err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(target)
	if err != nil {
		return fmt.Errorf("failed to decode JSON: %w", err)
	}

	return nil
}

// Convert struct to JSON string
func toJSONString(data interface{}) (string, error) {
	jsonBytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

// ========================================
// CSV OPERATIONS
// ========================================

// Export products to CSV
func exportProductsToCSV(filename string, products []Product) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write header
	header := []string{"ID", "Name", "Price", "Stock", "Category", "Rating"}
	if err := writer.Write(header); err != nil {
		return err
	}

	// Write data
	for _, p := range products {
		record := []string{
			p.ID,
			p.Name,
			fmt.Sprintf("%d", p.Price),
			fmt.Sprintf("%d", p.Stock),
			p.Category,
			fmt.Sprintf("%.2f", p.Rating),
		}
		if err := writer.Write(record); err != nil {
			return err
		}
	}

	return nil
}

// Import products from CSV
func importProductsFromCSV(filename string) ([]Product, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)

	// Skip header
	_, err = reader.Read()
	if err != nil {
		return nil, err
	}

	var products []Product
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		var price, stock int
		var rating float64
		fmt.Sscanf(record[2], "%d", &price)
		fmt.Sscanf(record[3], "%d", &stock)
		fmt.Sscanf(record[5], "%f", &rating)

		product := Product{
			ID:       record[0],
			Name:     record[1],
			Price:    price,
			Stock:    stock,
			Category: record[4],
			Rating:   rating,
		}
		products = append(products, product)
	}

	return products, nil
}

// ========================================
// DATABASE OPERATIONS
// ========================================

// Connect to database
func connectDB() (*sql.DB, error) {
	// Format: username:password@tcp(host:port)/database
	dsn := "root:@tcp(localhost:3306)/go_commerce?parseTime=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect: %w", err)
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// Create user in database
func createUser(db *sql.DB, user User) (int64, error) {
	query := `INSERT INTO users (name, email, balance, is_member) VALUES (?, ?, ?, ?)`

	result, err := db.Exec(query, user.Name, user.Email, user.Balance, user.IsMember)
	if err != nil {
		return 0, fmt.Errorf("failed to create user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

// Get user by ID
func getUserByID(db *sql.DB, id int) (*User, error) {
	query := `SELECT id, name, email, balance, is_member, created_at FROM users WHERE id = ?`

	var user User
	err := db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Balance,
		&user.IsMember,
		&user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// Get all users
func getAllUsers(db *sql.DB) ([]User, error) {
	query := `SELECT id, name, email, balance, is_member, created_at FROM users ORDER BY id`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Balance,
			&user.IsMember,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

// Update user balance
func updateUserBalance(db *sql.DB, userID, newBalance int) error {
	query := `UPDATE users SET balance = ? WHERE id = ?`

	result, err := db.Exec(query, newBalance, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// Delete user
func deleteUser(db *sql.DB, userID int) error {
	query := `DELETE FROM users WHERE id = ?`

	result, err := db.Exec(query, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// Create product
func createProduct(db *sql.DB, product Product) error {
	query := `INSERT INTO products (id, name, price, stock, category, rating) VALUES (?, ?, ?, ?, ?, ?)`

	_, err := db.Exec(query, product.ID, product.Name, product.Price, product.Stock, product.Category, product.Rating)
	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// Get all products
func getAllProducts(db *sql.DB) ([]Product, error) {
	query := `SELECT id, name, price, stock, category, rating, created_at FROM products ORDER BY created_at DESC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Price,
			&product.Stock,
			&product.Category,
			&product.Rating,
			&product.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

// Search products by name
func searchProducts(db *sql.DB, keyword string) ([]Product, error) {
	query := `SELECT id, name, price, stock, category, rating, created_at 
              FROM products 
              WHERE name LIKE ? OR category LIKE ?
              ORDER BY rating DESC`

	searchPattern := "%" + keyword + "%"
	rows, err := db.Query(query, searchPattern, searchPattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Price,
			&product.Stock,
			&product.Category,
			&product.Rating,
			&product.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

// ========================================
// MAIN FUNCTION
// ========================================

func main() {
	fmt.Println("╔═══════════════════════════════════════╗")
	fmt.Println("║   FILE I/O, JSON & DATABASE          ║")
	fmt.Println("╚═══════════════════════════════════════╝\n")

	// ========================================
	// 1. FILE OPERATIONS
	// ========================================

	fmt.Println("=== FILE OPERATIONS ===\n")

	// Write to file
	content := "Welcome to Go-Commerce!\nThis is a test file.\n"
	err := writeToFile("test.txt", content)
	if err != nil {
		fmt.Printf("❌ Error writing file: %v\n", err)
	} else {
		fmt.Println("✅ File created: test.txt")
	}

	// Read from file
	readContent, err := readFromFile("test.txt")
	if err != nil {
		fmt.Printf("❌ Error reading file: %v\n", err)
	} else {
		fmt.Println("✅ File content:")
		fmt.Println(readContent)
	}

	// Append to file
	err = appendToFile("test.txt", "Appended line 1\n")
	if err != nil {
		fmt.Printf("❌ Error appending: %v\n", err)
	} else {
		fmt.Println("✅ Content appended")
	}

	// Read again
	readContent, _ = readFromFile("test.txt")
	fmt.Println("Updated content:")
	fmt.Println(readContent)

	// ========================================
	// 2. JSON OPERATIONS
	// ========================================

	fmt.Println("=== JSON OPERATIONS ===\n")

	// Create sample data
	users := []User{
		{
			ID:       1,
			Name:     "Farhan Nugraha",
			Email:    "farhan@email.com",
			Balance:  10000000,
			IsMember: true,
		},
		{
			ID:       2,
			Name:     "Budi Santoso",
			Email:    "budi@email.com",
			Balance:  5000000,
			IsMember: false,
		},
	}

	// Save to JSON
	err = saveToJSON("users.json", users)
	if err != nil {
		fmt.Printf("❌ Error saving JSON: %v\n", err)
	} else {
		fmt.Println("✅ Users saved to users.json")
	}

	// Convert to JSON string (for API responses)
	jsonStr, _ := toJSONString(users[0])
	fmt.Println("\n📄 JSON String:")
	fmt.Println(jsonStr)

	// Load from JSON
	var loadedUsers []User
	err = loadFromJSON("users.json", &loadedUsers)
	if err != nil {
		fmt.Printf("❌ Error loading JSON: %v\n", err)
	} else {
		fmt.Println("\n✅ Users loaded from JSON:")
		for _, u := range loadedUsers {
			fmt.Printf("   - %s (%s)\n", u.Name, u.Email)
		}
	}

	// ========================================
	// 3. CSV OPERATIONS
	// ========================================

	fmt.Println("\n=== CSV OPERATIONS ===\n")

	products := []Product{
		{ID: "LAP001", Name: "Laptop ASUS", Price: 15000000, Stock: 10, Category: "Electronics", Rating: 4.8},
		{ID: "IPH001", Name: "iPhone 15 Pro", Price: 18000000, Stock: 5, Category: "Electronics", Rating: 4.9},
		{ID: "AIR001", Name: "AirPods Pro", Price: 3500000, Stock: 20, Category: "Accessories", Rating: 4.7},
	}

	// Export to CSV
	err = exportProductsToCSV("products.csv", products)
	if err != nil {
		fmt.Printf("❌ Error exporting CSV: %v\n", err)
	} else {
		fmt.Println("✅ Products exported to products.csv")
	}

	// Import from CSV
	importedProducts, err := importProductsFromCSV("products.csv")
	if err != nil {
		fmt.Printf("❌ Error importing CSV: %v\n", err)
	} else {
		fmt.Println("✅ Products imported from CSV:")
		for _, p := range importedProducts {
			fmt.Printf("   - %s: Rp %d\n", p.Name, p.Price)
		}
	}

	// ========================================
	// 4. DATABASE OPERATIONS
	// ========================================

	fmt.Println("\n=== DATABASE OPERATIONS ===\n")

	// Connect to database
	db, err := connectDB()
	if err != nil {
		fmt.Printf("❌ Database connection failed: %v\n", err)
		fmt.Println("⚠️  Make sure XAMPP MySQL is running!")
		fmt.Println("⚠️  Make sure database 'go_commerce' exists!")
		return
	}
	defer db.Close()

	fmt.Println("✅ Connected to database\n")

	// ========================================
	// 4.1 CREATE (Insert)
	// ========================================

	fmt.Println("--- CREATE Operations ---\n")

	// Create users
	newUser1 := User{
		Name:     "Farhan Nugraha",
		Email:    "farhan@gocommerce.com",
		Balance:  15000000,
		IsMember: true,
	}

	userID1, err := createUser(db, newUser1)
	if err != nil {
		fmt.Printf("❌ Error creating user: %v\n", err)
	} else {
		fmt.Printf("✅ User created with ID: %d\n", userID1)
	}

	newUser2 := User{
		Name:     "Siti Aminah",
		Email:    "siti@gocommerce.com",
		Balance:  8000000,
		IsMember: false,
	}

	userID2, err := createUser(db, newUser2)
	if err != nil {
		fmt.Printf("❌ Error creating user: %v\n", err)
	} else {
		fmt.Printf("✅ User created with ID: %d\n", userID2)
	}

	// Create products
	productsDB := []Product{
		{ID: "LAP001", Name: "Laptop ASUS ROG", Price: 15000000, Stock: 10, Category: "Electronics", Rating: 4.8},
		{ID: "IPH001", Name: "iPhone 15 Pro", Price: 18000000, Stock: 5, Category: "Electronics", Rating: 4.9},
		{ID: "MAC001", Name: "MacBook Air M2", Price: 16000000, Stock: 8, Category: "Electronics", Rating: 4.9},
		{ID: "AIR001", Name: "AirPods Pro", Price: 3500000, Stock: 20, Category: "Accessories", Rating: 4.7},
		{ID: "MOU001", Name: "Logitech MX Master", Price: 1200000, Stock: 15, Category: "Accessories", Rating: 4.6},
	}

	fmt.Println()
	for _, p := range productsDB {
		err = createProduct(db, p)
		if err != nil {
			fmt.Printf("❌ Error creating product %s: %v\n", p.ID, err)
		} else {
			fmt.Printf("✅ Product created: %s\n", p.Name)
		}
	}

	// ========================================
	// 4.2 READ (Select)
	// ========================================

	fmt.Println("\n--- READ Operations ---\n")

	// Get user by ID
	user, err := getUserByID(db, int(userID1))
	if err != nil {
		fmt.Printf("❌ Error getting user: %v\n", err)
	} else {
		fmt.Println("✅ User found:")
		fmt.Printf("   ID: %d\n", user.ID)
		fmt.Printf("   Name: %s\n", user.Name)
		fmt.Printf("   Email: %s\n", user.Email)
		fmt.Printf("   Balance: Rp %d\n", user.Balance)
		fmt.Printf("   Member: %v\n", user.IsMember)
	}

	// Get all users
	fmt.Println("\n📋 All Users:")
	allUsers, err := getAllUsers(db)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		for _, u := range allUsers {
			fmt.Printf("   [%d] %s - Rp %d\n", u.ID, u.Name, u.Balance)
		}
	}

	// Get all products
	fmt.Println("\n📦 All Products:")
	allProducts, err := getAllProducts(db)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		for _, p := range allProducts {
			fmt.Printf("   [%s] %s - Rp %d (Stock: %d)\n", p.ID, p.Name, p.Price, p.Stock)
		}
	}

	// Search products
	fmt.Println("\n🔍 Search Results for 'iPhone':")
	searchResults, err := searchProducts(db, "iPhone")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		for _, p := range searchResults {
			fmt.Printf("   ⭐%.1f - %s (Rp %d)\n", p.Rating, p.Name, p.Price)
		}
	}

	// ========================================
	// 4.3 UPDATE
	// ========================================

	fmt.Println("\n--- UPDATE Operations ---\n")

	// Update user balance
	fmt.Printf("Updating user %d balance...\n", userID1)
	err = updateUserBalance(db, int(userID1), 20000000)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Println("✅ Balance updated")

		// Verify update
		updatedUser, _ := getUserByID(db, int(userID1))
		fmt.Printf("   New balance: Rp %d\n", updatedUser.Balance)
	}

	// ========================================
	// 4.4 DELETE
	// ========================================

	fmt.Println("\n--- DELETE Operations ---\n")

	fmt.Println("⚠️  Delete operation skipped (keeping data for demo)")
	fmt.Println("To delete: deleteUser(db, userID)")

	// ========================================
	// 5. MINI PROJECT: Complete Transaction
	// ========================================

	fmt.Println("\n╔═══════════════════════════════════════╗")
	fmt.Println("║    💳 COMPLETE TRANSACTION           ║")
	fmt.Println("╚═══════════════════════════════════════╝\n")

	// Get customer
	customer, _ := getUserByID(db, int(userID1))
	fmt.Printf("👤 Customer: %s\n", customer.Name)
	fmt.Printf("💰 Balance: Rp %d\n\n", customer.Balance)

	// Select products
	selectedProducts, _ := searchProducts(db, "Laptop")
	if len(selectedProducts) > 0 {
		product := selectedProducts[0]
		quantity := 1
		total := product.Price * quantity

		fmt.Printf("🛒 Purchasing: %s\n", product.Name)
		fmt.Printf("💵 Price: Rp %d x %d = Rp %d\n", product.Price, quantity, total)

		if customer.Balance >= total {
			// Deduct balance
			newBalance := customer.Balance - total
			err = updateUserBalance(db, customer.ID, newBalance)
			if err != nil {
				fmt.Printf("❌ Transaction failed: %v\n", err)
			} else {
				fmt.Println("\n✅ ═══ TRANSACTION SUCCESSFUL ═══")
				fmt.Printf("💰 Remaining Balance: Rp %d\n", newBalance)

				// Save transaction to JSON log
				transaction := map[string]interface{}{
					"customer_id":   customer.ID,
					"customer_name": customer.Name,
					"product_id":    product.ID,
					"product_name":  product.Name,
					"quantity":      quantity,
					"total":         total,
					"timestamp":     time.Now(),
				}
				saveToJSON("last_transaction.json", transaction)
				fmt.Println("📄 Transaction saved to last_transaction.json")
			}
		} else {
			shortage := total - customer.Balance
			fmt.Println("\n❌ ═══ TRANSACTION FAILED ═══")
			fmt.Printf("💸 Insufficient balance (need Rp %d more)\n", shortage)
		}
	}

	fmt.Println("\n╚═══════════════════════════════════════╝")
	fmt.Println("\n✅ Demo completed! Check these files:")
	fmt.Println("   - test.txt")
	fmt.Println("   - users.json")
	fmt.Println("   - products.csv")
	fmt.Println("   - last_transaction.json")
}
