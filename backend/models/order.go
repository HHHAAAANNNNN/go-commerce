package models

import "time"

type Order struct {
	ID        string      `json:"id"`
	UserID    int         `json:"user_id"`
	Items     []OrderItem `json:"items,omitempty"`
	Total     int         `json:"total"`
	Status    string      `json:"status"`
	CreatedAt time.Time   `json:"created_at"`
}

type OrderItem struct {
	ID        int    `json:"id"`
	OrderID   string `json:"order_id"`
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
	Price     int    `json:"price"`
}

type OrderCreateRequest struct {
	UserID int `json:"user_id"`
	Items  []struct {
		ProductID string `json:"product_id"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}
