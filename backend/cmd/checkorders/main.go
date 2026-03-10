// cmd/checkorders/main.go - Check orders in database
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "root:@tcp(127.0.0.1:3306)/go_commerce?parseTime=true"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("open:", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("ping:", err)
	}

	// Check users first
	fmt.Println("\n=== USERS ===")
	userRows, _ := db.Query("SELECT id, email, role FROM users ORDER BY id LIMIT 10")
	defer userRows.Close()
	for userRows.Next() {
		var id int
		var email, role string
		userRows.Scan(&id, &email, &role)
		fmt.Printf("ID: %d | %s | role=%s\n", id, email, role)
	}

	// Check orders
	fmt.Println("\n=== ORDERS ===")
	orderRows, _ := db.Query("SELECT order_number, user_id, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 10")
	defer orderRows.Close()
	count := 0
	for orderRows.Next() {
		var orderNum string
		var userID int
		var status string
		var total float64
		var createdAt string
		orderRows.Scan(&orderNum, &userID, &status, &total, &createdAt)
		fmt.Printf("Order: %s | User: %d | Status: %s | Total: %.0f | %s\n", orderNum, userID, status, total, createdAt)
		count++
	}
	if count == 0 {
		fmt.Println("(no orders found)")
	}
	fmt.Printf("\nTotal orders: %d\n", count)
}
