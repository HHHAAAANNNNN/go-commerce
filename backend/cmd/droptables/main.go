package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "root:@tcp(localhost:3306)/go_commerce?parseTime=true"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("❌ Open error:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("❌ Ping error:", err)
	}
	fmt.Println("✅ Connected to go_commerce")

	stmts := []string{
		"SET FOREIGN_KEY_CHECKS = 0",
		"DROP TABLE IF EXISTS order_items",
		"DROP TABLE IF EXISTS orders",
		"DROP TABLE IF EXISTS vouchers",
		"DROP TABLE IF EXISTS cart_items",
		"SET FOREIGN_KEY_CHECKS = 1",
	}

	for _, s := range stmts {
		_, err := db.Exec(s)
		if err != nil {
			fmt.Printf("⚠️  [%s] Error: %v\n", s, err)
		} else {
			fmt.Printf("✅ Executed: %s\n", s)
		}
	}

	fmt.Println("\n🎉 Done! Now run: go run main.go")
}
