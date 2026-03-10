// cmd/checkusers/main.go - List all users with their roles
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

	rows, err := db.Query("SELECT id, email, full_name, role FROM users ORDER BY id")
	if err != nil {
		log.Fatal("query:", err)
	}
	defer rows.Close()

	fmt.Println("📋 Users in database:")
	fmt.Println("─────────────────────────────────────────────────────────────")
	for rows.Next() {
		var id int
		var email, name, role string
		if err := rows.Scan(&id, &email, &name, &role); err != nil {
			log.Fatal("scan:", err)
		}
		roleIcon := "👤"
		if role == "admin" {
			roleIcon = "👑"
		}
		fmt.Printf("%s ID: %-3d | %-25s | %-20s | %s\n", roleIcon, id, email, name, role)
	}
	fmt.Println("─────────────────────────────────────────────────────────────")
}
