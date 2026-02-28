package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

// ConnectDatabase - Connect to MySQL database and run migrations
func ConnectDatabase() error {
	// First, connect without database to create it if not exists
	dsnNoDB := "root:@tcp(localhost:3306)/?parseTime=true"
	db, err := sql.Open("mysql", dsnNoDB)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()

	// Create database if not exists
	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS go_commerce")
	if err != nil {
		return fmt.Errorf("failed to create database: %w", err)
	}

	// Now connect to the actual database
	dsn := "root:@tcp(localhost:3306)/go_commerce?parseTime=true"
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to go_commerce database: %w", err)
	}

	err = DB.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connected successfully")

	// Run migrations
	err = runMigrations()
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

// runMigrations - Create tables if they don't exist
func runMigrations() error {
	log.Println("🔄 Running database migrations...")

	// Users table
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		full_name VARCHAR(100) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		phone VARCHAR(20),
		balance INT DEFAULT 0,
		is_member BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`
	_, err := DB.Exec(createUsersTable)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}
	log.Println("✅ Users table ready")

	// Products table
	createProductsTable := `
	CREATE TABLE IF NOT EXISTS products (
		id VARCHAR(50) PRIMARY KEY,
		name VARCHAR(200) NOT NULL,
		price INT NOT NULL,
		stock INT DEFAULT 0,
		category VARCHAR(100),
		rating DECIMAL(3,2) DEFAULT 0.00,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`
	_, err = DB.Exec(createProductsTable)
	if err != nil {
		return fmt.Errorf("failed to create products table: %w", err)
	}
	log.Println("✅ Products table ready")

	// Orders table
	createOrdersTable := `
	CREATE TABLE IF NOT EXISTS orders (
		id VARCHAR(50) PRIMARY KEY,
		customer_id INT NOT NULL,
		total INT NOT NULL,
		status VARCHAR(50) DEFAULT 'pending',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (customer_id) REFERENCES users(id)
	)`
	_, err = DB.Exec(createOrdersTable)
	if err != nil {
		return fmt.Errorf("failed to create orders table: %w", err)
	}
	log.Println("✅ Orders table ready")

	// Order items table
	createOrderItemsTable := `
	CREATE TABLE IF NOT EXISTS order_items (
		id INT AUTO_INCREMENT PRIMARY KEY,
		order_id VARCHAR(50) NOT NULL,
		product_id VARCHAR(50) NOT NULL,
		quantity INT NOT NULL,
		price INT NOT NULL,
		FOREIGN KEY (order_id) REFERENCES orders(id),
		FOREIGN KEY (product_id) REFERENCES products(id)
	)`
	_, err = DB.Exec(createOrderItemsTable)
	if err != nil {
		return fmt.Errorf("failed to create order_items table: %w", err)
	}
	log.Println("✅ Order items table ready")

	// Product specifications table (key-value schema)
	// Disable FK checks before drop to handle any constraint issues cleanly
	DB.Exec(`SET FOREIGN_KEY_CHECKS=0`)
	DB.Exec(`DROP TABLE IF EXISTS product_specifications`)
	DB.Exec(`SET FOREIGN_KEY_CHECKS=1`)
	createSpecsTable := `
	CREATE TABLE IF NOT EXISTS product_specifications (
		id INT AUTO_INCREMENT PRIMARY KEY,
		product_id INT NOT NULL,
		spec_key VARCHAR(100) NOT NULL,
		spec_value TEXT,
		display_order INT DEFAULT 0,
		INDEX idx_product_id (product_id)
	)`
	_, err = DB.Exec(createSpecsTable)
	if err != nil {
		return fmt.Errorf("failed to create product_specifications table: %w", err)
	}
	log.Println("✅ Product specifications table ready")

	// Insert sample products if products table is empty
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err == nil && count == 0 {
		insertProducts := `
		INSERT INTO products (id, name, price, stock, category, rating) VALUES
			('LAP001', 'Gaming Laptop', 15000000, 10, 'Electronics', 4.5),
			('LAP002', 'Business Laptop', 8000000, 25, 'Electronics', 4.2),
			('HP001', 'Wireless Headphones', 1500000, 50, 'Audio', 4.7),
			('KB001', 'Mechanical Keyboard', 750000, 30, 'Accessories', 4.6),
			('MS001', 'Gaming Mouse', 450000, 40, 'Accessories', 4.4)`
		_, err = DB.Exec(insertProducts)
		if err != nil {
			return fmt.Errorf("failed to insert sample products: %w", err)
		}
		log.Println("✅ Sample products inserted")
	}

	log.Println("✅ All migrations completed successfully")
	return nil
}

// CloseDatabase - Close database connection
func CloseDatabase() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}
