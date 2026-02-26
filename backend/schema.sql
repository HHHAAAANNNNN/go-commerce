-- Go-Commerce Database Schema
-- Run this script to set up the database

CREATE DATABASE IF NOT EXISTS go_commerce;
USE go_commerce;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    balance INT DEFAULT 0,
    is_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id INT NOT NULL,
    total INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sample data for testing
INSERT INTO products (id, name, price, stock, category, rating) VALUES
    ('LAP001', 'Gaming Laptop', 15000000, 10, 'Electronics', 4.5),
    ('LAP002', 'Business Laptop', 8000000, 25, 'Electronics', 4.2),
    ('HP001', 'Wireless Headphones', 1500000, 50, 'Audio', 4.7),
    ('KB001', 'Mechanical Keyboard', 750000, 30, 'Accessories', 4.6),
    ('MS001', 'Gaming Mouse', 450000, 40, 'Accessories', 4.4);
