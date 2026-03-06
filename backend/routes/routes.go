package routes

import (
	"net/http"

	"github.com/HHHAAAANNNNN/go-commerce-backend/controllers"
	"github.com/HHHAAAANNNNN/go-commerce-backend/middlewares"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	// Apply global middlewares
	router.Use(middlewares.Logger)
	router.Use(middlewares.CORS)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"OK","message":"Server is running"}`))
	}).Methods("GET", "OPTIONS")

	// Auth routes
	api.HandleFunc("/auth/register", controllers.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/login", controllers.Login).Methods("POST", "OPTIONS")

	// Upload route
	api.HandleFunc("/upload", controllers.UploadImage).Methods("POST", "OPTIONS")

	// User routes
	api.HandleFunc("/users", controllers.GetAllUsers).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}", controllers.GetUserByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/users", controllers.CreateUser).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}/profile", controllers.UpdateProfile).Methods("PUT", "OPTIONS")
	api.HandleFunc("/users/{id}/balance", controllers.GetBalance).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/topup", controllers.TopUp).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}/total-spent", controllers.GetTotalSpent).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/dashboard", controllers.GetDashboard).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}", controllers.UpdateUser).Methods("PUT", "OPTIONS")
	api.HandleFunc("/users/{id}", controllers.DeleteUser).Methods("DELETE", "OPTIONS")

	// Cart routes
	api.HandleFunc("/users/{id}/cart", controllers.GetCartItems).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/cart", controllers.AddToCart).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}/cart/{productId}", controllers.UpdateCartItem).Methods("PUT", "OPTIONS")
	api.HandleFunc("/users/{id}/cart/{productId}", controllers.RemoveFromCart).Methods("DELETE", "OPTIONS")

	// Checkout & order routes
	api.HandleFunc("/users/{id}/checkout", controllers.Checkout).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}/stats", controllers.GetUserStats).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/orders", controllers.GetUserOrders).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/orders/{orderNumber}", controllers.GetOrderDetail).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/orders/{orderNumber}/status", controllers.UpdateOrderStatus).Methods("PATCH", "OPTIONS")

	// Product routes
	api.HandleFunc("/products", controllers.GetAllProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/search", controllers.SearchProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/{id}", controllers.GetProductByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/products", controllers.CreateProduct).Methods("POST", "OPTIONS")
	api.HandleFunc("/products/{id}", controllers.UpdateProduct).Methods("PUT", "OPTIONS")
	api.HandleFunc("/products/{id}", controllers.DeleteProduct).Methods("DELETE", "OPTIONS")

	// Voucher routes
	api.HandleFunc("/vouchers", controllers.ListVouchers).Methods("GET", "OPTIONS")
	api.HandleFunc("/vouchers", controllers.CreateVoucher).Methods("POST", "OPTIONS")

	return router
}
