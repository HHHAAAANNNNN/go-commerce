package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/HHHAAAANNNNN/go-commerce-backend/config"
	"github.com/HHHAAAANNNNN/go-commerce-backend/routes"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	fmt.Println("╔═══════════════════════════════════════╗")
	fmt.Println("║   GO-COMMERCE REST API SERVER        ║")
	fmt.Println("╚═══════════════════════════════════════╝")

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found. Using default environment variables.")
	}

	// Connect to database
	err := config.ConnectDatabase()
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer config.CloseDatabase()

	// Setup routes
	router := routes.SetupRoutes()

	// Serve static files from the project root public/assets directory
	// Binary runs from backend/ so use ../ to go up to project root
	// URL: /assets/products/phones/file.jpg
	// → strip "/assets/" → products/phones/file.jpg
	// → serve from ../public/assets/ → public/assets/products/phones/file.jpg ✓
	// Serve uploaded files
	uploadsDir := "/app/uploads"
	if os.Getenv("RAILWAY_ENVIRONMENT_NAME") == "" {
		uploadsDir = "./uploads" // Local dev
	}
	os.MkdirAll(uploadsDir, 0755)
	router.PathPrefix("/assets/uploads/").Handler(
		http.StripPrefix("/assets/uploads/", http.FileServer(http.Dir(uploadsDir))),
	)

	publicAssetsDir := filepath.Join("..", "public", "assets")
	if _, err := os.Stat(publicAssetsDir); os.IsNotExist(err) {
		os.MkdirAll(publicAssetsDir, 0755)
	}
	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir(publicAssetsDir))))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("🚀 Server starting on http://localhost:%s\n", port)
	port = ":" + port
	fmt.Println("\n📋 Available Endpoints:")
	fmt.Println("   GET    /api/health")
	fmt.Println("   POST   /api/auth/register")
	fmt.Println("   POST   /api/auth/login")
	fmt.Println("   GET    /api/users")
	fmt.Println("   GET    /api/users/{id}")
	fmt.Println("   POST   /api/users")
	fmt.Println("   PUT    /api/users/{id}")
	fmt.Println("   DELETE /api/users/{id}")
	fmt.Println("   GET    /api/products")
	fmt.Println("   GET    /api/products/search?q=keyword")
	fmt.Println("   GET    /api/products/{id}")
	fmt.Println("   POST   /api/products")
	fmt.Println("   PUT    /api/products/{id}")
	fmt.Println("   DELETE /api/products/{id}")
	fmt.Println("\n📁 Static Files:")
	fmt.Println("\n⏳ Server is running... Press Ctrl+C to stop")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"https://go-commerce.web.id",
			"https://www.go-commerce.web.id",
			"http://localhost:8080",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Accept"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	handler := c.Handler(router)

	log.Fatal(http.ListenAndServe(port, handler))

}
