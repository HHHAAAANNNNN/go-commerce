package routes

import (
	"net/http"

	"github.com/HHHAAAANNNNN/go-commerce-backend/controllers"
	"github.com/HHHAAAANNNNN/go-commerce-backend/middlewares"
	"github.com/gorilla/mux"
)

// adminOnly wraps a handler with RequireAuth + RequireRole("admin")
func adminOnly(h http.HandlerFunc) http.Handler {
	return middlewares.RequireAuth(
		middlewares.RequireRole("admin")(http.HandlerFunc(h)),
	)
}

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	// Apply global middlewares
	router.Use(middlewares.Logger)
	router.Use(middlewares.CORS)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Health check (public)
	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"OK","message":"Server is running"}`))
	}).Methods("GET", "OPTIONS")

	// Auth routes (public)
	api.HandleFunc("/auth/register", controllers.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/login", controllers.Login).Methods("POST", "OPTIONS")

	// Upload — admin only
	api.Handle("/upload", adminOnly(controllers.UploadImage)).Methods("POST", "OPTIONS")

	// User routes — list/create/update/delete are admin-only; per-user routes are open
	api.Handle("/users", adminOnly(controllers.GetAllUsers)).Methods("GET", "OPTIONS")
	api.Handle("/users", adminOnly(controllers.CreateUser)).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}", controllers.GetUserByID).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}", adminOnly(controllers.UpdateUser)).Methods("PUT", "OPTIONS")
	api.Handle("/users/{id}", adminOnly(controllers.DeleteUser)).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/users/{id}/profile", controllers.UpdateProfile).Methods("PUT", "OPTIONS")
	api.HandleFunc("/users/{id}/balance", controllers.GetBalance).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/topup", controllers.TopUp).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}/total-spent", controllers.GetTotalSpent).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/dashboard", controllers.GetDashboard).Methods("GET", "OPTIONS")

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
	api.HandleFunc("/users/{id}/orders/{orderNumber}/reviews", controllers.SubmitReviews).Methods("POST", "OPTIONS")

	// Admin-only order management
	api.Handle("/orders", adminOnly(http.HandlerFunc(controllers.GetAllOrders))).Methods("GET", "OPTIONS")
	api.Handle("/orders/{orderNumber}", adminOnly(http.HandlerFunc(controllers.GetOrderDetailAdmin))).Methods("GET", "OPTIONS")
	api.Handle("/orders/{orderNumber}/status", adminOnly(http.HandlerFunc(controllers.UpdateOrderStatusAdmin))).Methods("PATCH", "OPTIONS")

	// Product routes — GET is public, mutations are admin only
	api.HandleFunc("/products", controllers.GetAllProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/search", controllers.SearchProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/{id}", controllers.GetProductByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/{id}/reviews", controllers.GetProductReviews).Methods("GET", "OPTIONS")
	api.Handle("/products", adminOnly(controllers.CreateProduct)).Methods("POST", "OPTIONS")
	api.Handle("/products/{id}", adminOnly(controllers.UpdateProduct)).Methods("PUT", "OPTIONS")
	api.Handle("/products/{id}", adminOnly(controllers.DeleteProduct)).Methods("DELETE", "OPTIONS")

	// Voucher routes — GET is public, creation is admin only
	api.HandleFunc("/vouchers", controllers.ListVouchers).Methods("GET", "OPTIONS")
	api.Handle("/vouchers", adminOnly(controllers.CreateVoucher)).Methods("POST", "OPTIONS")

	return router
}
