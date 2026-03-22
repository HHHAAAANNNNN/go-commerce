package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

// ConnectDatabase - Connect to MySQL database and run migrations
func ConnectDatabase() error {
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "root"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "go_commerce"
	}
	tlsParam := ""
	if os.Getenv("DB_TLS") == "true" {
		tlsParam = "&tls=true"
	}

	dsnNoDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?parseTime=true&timeout=5s&readTimeout=5s&writeTimeout=5s%s",
		dbUser, dbPassword, dbHost, dbPort, tlsParam)
	db, err := sql.Open("mysql", dsnNoDB)
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}
	defer db.Close()

	if os.Getenv("DB_SKIP_CREATE") != "true" {
		if _, err = db.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", dbName)); err != nil {
			log.Printf("⚠️  Could not create database (may already exist): %v", err)
		}
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&timeout=5s&readTimeout=5s&writeTimeout=5s%s",
		dbUser, dbPassword, dbHost, dbPort, dbName, tlsParam)
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to %s: %w", dbName, err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Connection pool limits — prevents MySQL from being overwhelmed
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(3 * time.Minute)
	DB.SetConnMaxIdleTime(1 * time.Minute)

	log.Println("✅ Database connected successfully")

	if err = runMigrations(); err != nil {
		return fmt.Errorf("migrations failed: %w", err)
	}
	return nil
}

// tableHasColumn checks whether `col` exists on `table`.
func tableHasColumn(table, col string) bool {
	var n string
	err := DB.QueryRow(
		`SELECT COLUMN_NAME FROM information_schema.COLUMNS
		 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
		table, col,
	).Scan(&n)
	return err == nil
}

// dropIfSchemaMismatch drops `table` when a required column is missing.
// CREATE TABLE IF NOT EXISTS will then recreate it correctly.
func dropIfSchemaMismatch(table string, requiredCols ...string) {
	for _, col := range requiredCols {
		if !tableHasColumn(table, col) {
			log.Printf("⚠️  Table '%s' is missing column '%s' — dropping to recreate", table, col)
			DB.Exec("SET FOREIGN_KEY_CHECKS = 0")
			DB.Exec("DROP TABLE IF EXISTS " + table)
			DB.Exec("SET FOREIGN_KEY_CHECKS = 1")
			return
		}
	}
}

func runMigrations() error {
	log.Println("🔄 Running database migrations...")

	// --- users ---
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id         INT AUTO_INCREMENT PRIMARY KEY,
			full_name  VARCHAR(100) NOT NULL,
			email      VARCHAR(100) UNIQUE NOT NULL,
			password   VARCHAR(255) NOT NULL,
			phone      VARCHAR(20),
			balance    INT DEFAULT 0,
			total_spent INT DEFAULT 0,
			is_member  BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`)
	if err != nil {
		return fmt.Errorf("users table: %w", err)
	}
	// Add total_spent if this is an old users table
	if !tableHasColumn("users", "total_spent") {
		DB.Exec("ALTER TABLE users ADD COLUMN total_spent INT DEFAULT 0")
	}
	if !tableHasColumn("users", "avatar_url") {
		DB.Exec("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)")
	}
	if !tableHasColumn("users", "role") {
		DB.Exec("ALTER TABLE users ADD COLUMN role ENUM('admin','customer') NOT NULL DEFAULT 'customer'")
	}
	if !tableHasColumn("users", "email_verified") {
		DB.Exec("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE")
	}
	log.Println("✅ users table ready")

	// --- products ---
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id         VARCHAR(50) PRIMARY KEY,
			name       VARCHAR(200) NOT NULL,
			price      INT NOT NULL,
			stock      INT DEFAULT 0,
			category   VARCHAR(100),
			rating     DECIMAL(3,2) DEFAULT 0.00,
			image_url  VARCHAR(500),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`)
	if err != nil {
		return fmt.Errorf("products table: %w", err)
	}
	if !tableHasColumn("products", "image_url") {
		DB.Exec("ALTER TABLE products ADD COLUMN image_url VARCHAR(500)")
	}
	log.Println("✅ products table ready")

	// --- orders: drop if schema is from old version ---
	dropIfSchemaMismatch("orders", "order_number", "user_id", "subtotal", "total_amount")
	// Also drop order_items first (FK child), then orders
	if !tableHasColumn("orders", "order_number") {
		DB.Exec("SET FOREIGN_KEY_CHECKS = 0")
		DB.Exec("DROP TABLE IF EXISTS order_items")
		DB.Exec("DROP TABLE IF EXISTS orders")
		DB.Exec("SET FOREIGN_KEY_CHECKS = 1")
	}
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id              INT AUTO_INCREMENT PRIMARY KEY,
			order_number    VARCHAR(100) NOT NULL UNIQUE,
			user_id         INT NOT NULL,
			address_id      INT DEFAULT NULL,
			subtotal        INT NOT NULL DEFAULT 0,
			discount_amount INT NOT NULL DEFAULT 0,
			total_amount    INT NOT NULL DEFAULT 0,
			status          VARCHAR(50) DEFAULT 'pending',
			created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`)
	if err != nil {
		return fmt.Errorf("orders table: %w", err)
	}
	log.Println("✅ orders table ready")

	// --- order_items ---
	dropIfSchemaMismatch("order_items", "product_name", "product_image", "subtotal")
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS order_items (
			id            INT AUTO_INCREMENT PRIMARY KEY,
			order_id      INT NOT NULL,
			product_id    VARCHAR(50) NOT NULL,
			product_name  VARCHAR(200) NOT NULL DEFAULT '',
			product_image VARCHAR(500) NOT NULL DEFAULT '',
			quantity      INT NOT NULL,
			price         INT NOT NULL,
			subtotal      INT NOT NULL DEFAULT 0,
			FOREIGN KEY (order_id) REFERENCES orders(id)
		)`)
	if err != nil {
		return fmt.Errorf("order_items table: %w", err)
	}
	log.Println("✅ order_items table ready")

	// --- cart_items ---
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS cart_items (
			id         INT AUTO_INCREMENT PRIMARY KEY,
			user_id    INT NOT NULL,
			product_id VARCHAR(50) NOT NULL,
			quantity   INT NOT NULL DEFAULT 1,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE KEY unique_cart_item (user_id, product_id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`)
	if err != nil {
		return fmt.Errorf("cart_items table: %w", err)
	}
	log.Println("✅ cart_items table ready")

	// --- product_specifications ---
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS product_specifications (
			id            INT AUTO_INCREMENT PRIMARY KEY,
			product_id    INT NOT NULL,
			spec_key      VARCHAR(100) NOT NULL,
			spec_value    TEXT,
			display_order INT DEFAULT 0,
			INDEX idx_product_id (product_id)
		)`)
	if err != nil {
		return fmt.Errorf("product_specifications table: %w", err)
	}
	log.Println("✅ product_specifications table ready")

	// --- seed products ---
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if count == 0 {
		DB.Exec(`INSERT INTO products (id, name, price, stock, category, rating) VALUES
			('LAP001','Gaming Laptop',15000000,10,'Electronics',4.5),
			('LAP002','Business Laptop',8000000,25,'Electronics',4.2),
			('HP001','Wireless Headphones',1500000,50,'Audio',4.7),
			('KB001','Mechanical Keyboard',750000,30,'Accessories',4.6),
			('MS001','Gaming Mouse',450000,40,'Accessories',4.4)`)
		log.Println("✅ sample products seeded")
	}

	// --- vouchers: drop if old schema ---
	dropIfSchemaMismatch("vouchers", "discount_value", "valid_from", "valid_until", "is_active", "used_count")
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS vouchers (
			id             INT AUTO_INCREMENT PRIMARY KEY,
			code           VARCHAR(50) NOT NULL UNIQUE,
			name           VARCHAR(100) NOT NULL DEFAULT '',
			description    TEXT,
			type           VARCHAR(50) NOT NULL DEFAULT 'percentage',
			discount_value DECIMAL(10,2) DEFAULT 0,
			min_purchase   INT DEFAULT 0,
			max_discount   DECIMAL(10,2) DEFAULT 0,
			usage_limit    INT DEFAULT 0,
			used_count     INT DEFAULT 0,
			valid_from     DATETIME DEFAULT CURRENT_TIMESTAMP,
			valid_until    DATETIME,
			is_active      BOOLEAN DEFAULT TRUE,
			created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`)
	if err != nil {
		return fmt.Errorf("vouchers table: %w", err)
	}
	log.Println("✅ vouchers table ready")

	log.Println("✅ All migrations completed")
	return nil
}

// CloseDatabase - Close database connection
func CloseDatabase() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}
