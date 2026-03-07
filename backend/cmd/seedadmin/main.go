// cmd/seedadmin/main.go
// Usage: go run ./cmd/seedadmin <email>
// Promotes the user with the given email to the 'admin' role.

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run ./cmd/seedadmin <email>")
		os.Exit(1)
	}
	email := os.Args[1]

	dsn := "root:@tcp(127.0.0.1:3306)/go_commerce?parseTime=true"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("open:", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("ping:", err)
	}

	res, err := db.Exec("UPDATE users SET role = 'admin' WHERE email = ?", email)
	if err != nil {
		log.Fatal("update:", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		fmt.Printf("❌ No user found with email: %s\n", email)
		os.Exit(1)
	}
	fmt.Printf("✅ User '%s' is now an admin!\n", email)
}
