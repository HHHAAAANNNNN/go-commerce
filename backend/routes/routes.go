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
	router.Use(middlewares.RecoverPanic)
	router.Use(middlewares.Logger)

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
	api.Handle("/upload", adminOnly(controllers.UploadProductImage)).Methods("POST", "OPTIONS")

	// User routes — list/create/update/delete are admin-only; per-user routes are open
	api.Handle("/users", adminOnly(controllers.GetAllUsers)).Methods("GET", "OPTIONS")
	api.Handle("/users", adminOnly(controllers.CreateUser)).Methods("POST", "OPTIONS")
	api.Handle("/users/{id}", middlewares.RequireAuth(http.HandlerFunc(controllers.GetUserByID))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}", adminOnly(controllers.UpdateUser)).Methods("PUT", "OPTIONS")
	api.Handle("/users/{id}", adminOnly(controllers.DeleteUser)).Methods("DELETE", "OPTIONS")
	api.Handle("/users/{id}/profile", middlewares.RequireAuth(http.HandlerFunc(controllers.UpdateProfile))).Methods("PUT", "OPTIONS")
	api.Handle("/users/{id}/balance", middlewares.RequireAuth(http.HandlerFunc(controllers.GetBalance))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/topup", middlewares.RequireAuth(http.HandlerFunc(controllers.TopUp))).Methods("POST", "OPTIONS")
	api.Handle("/users/{id}/total-spent", middlewares.RequireAuth(http.HandlerFunc(controllers.GetTotalSpent))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/dashboard", middlewares.RequireAuth(http.HandlerFunc(controllers.GetDashboard))).Methods("GET", "OPTIONS")

	// Cart routes
	api.Handle("/users/{id}/cart", middlewares.RequireAuth(http.HandlerFunc(controllers.GetCartItems))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/cart", middlewares.RequireAuth(http.HandlerFunc(controllers.AddToCart))).Methods("POST", "OPTIONS")
	api.Handle("/users/{id}/cart/{productId}", middlewares.RequireAuth(http.HandlerFunc(controllers.UpdateCartItem))).Methods("PUT", "OPTIONS")
	api.Handle("/users/{id}/cart/{productId}", middlewares.RequireAuth(http.HandlerFunc(controllers.RemoveFromCart))).Methods("DELETE", "OPTIONS")

	// Checkout & order routes
	api.Handle("/users/{id}/checkout", middlewares.RequireAuth(http.HandlerFunc(controllers.Checkout))).Methods("POST", "OPTIONS")
	api.Handle("/users/{id}/stats", middlewares.RequireAuth(http.HandlerFunc(controllers.GetUserStats))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/orders", middlewares.RequireAuth(http.HandlerFunc(controllers.GetUserOrders))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/orders/{orderNumber}", middlewares.RequireAuth(http.HandlerFunc(controllers.GetOrderDetail))).Methods("GET", "OPTIONS")
	api.Handle("/users/{id}/orders/{orderNumber}/status", middlewares.RequireAuth(http.HandlerFunc(controllers.UpdateOrderStatus))).Methods("PATCH", "OPTIONS")
	api.Handle("/users/{id}/orders/{orderNumber}/reviews", middlewares.RequireAuth(http.HandlerFunc(controllers.SubmitReviews))).Methods("POST", "OPTIONS")

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
