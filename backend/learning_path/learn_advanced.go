package main

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// ========================================
// STRUCTS
// ========================================

type User struct {
	ID       int
	Name     string
	Email    string
	Balance  int
	IsMember bool
}

type Product struct {
	ID       string
	Name     string
	Price    int
	Stock    int
	Category string
}

type Order struct {
	ID         string
	CustomerID int
	Items      []OrderItem
	Total      int
	Status     string
	CreatedAt  time.Time
}

type OrderItem struct {
	ProductID string
	Quantity  int
	Price     int
}

type PaymentMethod struct {
	Type   string
	Number string
}

// ========================================
// INTERFACES
// ========================================

// Interface untuk entitas yang bisa ditampilkan
type Displayable interface {
	Display()
}

// Interface untuk entitas yang punya harga
type Priceable interface {
	GetPrice() int
	SetPrice(price int)
}

// Interface untuk payment processor
type PaymentProcessor interface {
	ProcessPayment(amount int) error
	GetPaymentMethod() string
}

// Interface untuk storage/database
type Storage interface {
	Save(id string, data interface{}) error
	Load(id string) (interface{}, error)
	Delete(id string) error
}

// ========================================
// IMPLEMENT INTERFACES
// ========================================

// User implements Displayable
func (u User) Display() {
	fmt.Println("╔════════════════════════════════════╗")
	fmt.Println("║        USER INFORMATION            ║")
	fmt.Println("╚════════════════════════════════════╝")
	fmt.Printf("ID      : %d\n", u.ID)
	fmt.Printf("Name    : %s\n", u.Name)
	fmt.Printf("Email   : %s\n", u.Email)
	fmt.Printf("Balance : Rp %d\n", u.Balance)
	fmt.Printf("Member  : %v\n", u.IsMember)
	fmt.Println()
}

// Product implements Displayable
func (p Product) Display() {
	fmt.Println("┌────────────────────────────────────┐")
	fmt.Printf("│ %-34s │\n", p.Name)
	fmt.Println("├────────────────────────────────────┤")
	fmt.Printf("│ ID    : %-26s │\n", p.ID)
	fmt.Printf("│ Price : Rp %-23d │\n", p.Price)
	fmt.Printf("│ Stock : %-26d │\n", p.Stock)
	fmt.Println("└────────────────────────────────────┘")
}

// Product implements Priceable
func (p Product) GetPrice() int {
	return p.Price
}

func (p *Product) SetPrice(price int) {
	p.Price = price
}

// Order implements Displayable
func (o Order) Display() {
	fmt.Println("╔════════════════════════════════════╗")
	fmt.Printf("║  ORDER #%-25s ║\n", o.ID)
	fmt.Println("╚════════════════════════════════════╝")
	fmt.Printf("Customer ID : %d\n", o.CustomerID)
	fmt.Printf("Status      : %s\n", o.Status)
	fmt.Printf("Total       : Rp %d\n", o.Total)
	fmt.Printf("Created     : %s\n", o.CreatedAt.Format("02 Jan 2006"))
	fmt.Println()
}

// Credit Card Payment Processor
type CreditCardPayment struct {
	CardNumber string
	CVV        string
}

func (c CreditCardPayment) ProcessPayment(amount int) error {
	if len(c.CardNumber) < 16 {
		return errors.New("invalid card number")
	}
	fmt.Printf("✅ Credit Card payment processed: Rp %d\n", amount)
	return nil
}

func (c CreditCardPayment) GetPaymentMethod() string {
	return "Credit Card"
}

// E-Wallet Payment Processor
type EWalletPayment struct {
	PhoneNumber string
	Provider    string // gopay, ovo, dana
}

func (e EWalletPayment) ProcessPayment(amount int) error {
	if len(e.PhoneNumber) < 10 {
		return errors.New("invalid phone number")
	}
	fmt.Printf("✅ %s payment processed: Rp %d\n", e.Provider, amount)
	return nil
}

func (e EWalletPayment) GetPaymentMethod() string {
	return e.Provider
}

// Bank Transfer Payment Processor
type BankTransferPayment struct {
	BankName      string
	AccountNumber string
}

func (b BankTransferPayment) ProcessPayment(amount int) error {
	if len(b.AccountNumber) < 10 {
		return errors.New("invalid account number")
	}
	fmt.Printf("✅ Bank Transfer (%s) processed: Rp %d\n", b.BankName, amount)
	return nil
}

func (b BankTransferPayment) GetPaymentMethod() string {
	return fmt.Sprintf("Bank Transfer - %s", b.BankName)
}

// Simple In-Memory Storage
type MemoryStorage struct {
	data map[string]interface{}
}

func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		data: make(map[string]interface{}),
	}
}

func (m *MemoryStorage) Save(id string, data interface{}) error {
	if id == "" {
		return errors.New("id cannot be empty")
	}
	m.data[id] = data
	return nil
}

func (m *MemoryStorage) Load(id string) (interface{}, error) {
	data, exists := m.data[id]
	if !exists {
		return nil, fmt.Errorf("data with id '%s' not found", id)
	}
	return data, nil
}

func (m *MemoryStorage) Delete(id string) error {
	if _, exists := m.data[id]; !exists {
		return fmt.Errorf("data with id '%s' not found", id)
	}
	delete(m.data, id)
	return nil
}

// ========================================
// POINTERS EXAMPLES
// ========================================

// Function yang menerima value (copy)
func updateBalanceByValue(user User, amount int) {
	user.Balance += amount
	fmt.Printf("Inside function: %s balance = Rp %d\n", user.Name, user.Balance)
}

// Function yang menerima pointer (original)
func updateBalanceByPointer(user *User, amount int) {
	user.Balance += amount
	fmt.Printf("Inside function: %s balance = Rp %d\n", user.Name, user.Balance)
}

// Function untuk swap values
func swap(a, b *int) {
	*a, *b = *b, *a
}

// ========================================
// ERROR HANDLING FUNCTIONS
// ========================================

// Custom error type
type InsufficientBalanceError struct {
	UserID   int
	Required int
	Current  int
}

func (e *InsufficientBalanceError) Error() string {
	return fmt.Sprintf("insufficient balance: required Rp %d, current Rp %d (user ID: %d)",
		e.Required, e.Current, e.UserID)
}

type OutOfStockError struct {
	ProductID string
	Requested int
	Available int
}

func (e *OutOfStockError) Error() string {
	return fmt.Sprintf("out of stock: requested %d, only %d available (product: %s)",
		e.Requested, e.Available, e.ProductID)
}

// Function dengan error handling
func purchaseProduct(user *User, product *Product, quantity int) error {
	// Validate stock
	if product.Stock < quantity {
		return &OutOfStockError{
			ProductID: product.ID,
			Requested: quantity,
			Available: product.Stock,
		}
	}

	// Calculate total
	total := product.Price * quantity

	// Validate balance
	if user.Balance < total {
		return &InsufficientBalanceError{
			UserID:   user.ID,
			Required: total,
			Current:  user.Balance,
		}
	}

	// Process transaction
	user.Balance -= total
	product.Stock -= quantity

	return nil
}

// Function dengan multiple error checks
func validateUser(email, name string, balance int) error {
	if email == "" {
		return errors.New("email cannot be empty")
	}
	if !strings.Contains(email, "@") {
		return errors.New("invalid email format")
	}
	if name == "" {
		return errors.New("name cannot be empty")
	}
	if balance < 0 {
		return errors.New("balance cannot be negative")
	}
	return nil
}

// Function dengan panic & recover
func safeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered: %v", r)
		}
	}()

	if b == 0 {
		panic("division by zero")
	}
	result = a / b
	return
}

// ========================================
// GENERIC FUNCTIONS USING INTERFACES
// ========================================

// Function yang menerima interface Displayable
func displayInfo(d Displayable) {
	d.Display()
}

// Function yang menerima slice of Displayable
func displayAll(items []Displayable) {
	for i, item := range items {
		fmt.Printf("\n=== Item %d ===\n", i+1)
		item.Display()
	}
}

// Function untuk process payment dengan interface
func processPayment(processor PaymentProcessor, amount int) error {
	fmt.Printf("\n💳 Processing payment via %s...\n", processor.GetPaymentMethod())
	err := processor.ProcessPayment(amount)
	if err != nil {
		return fmt.Errorf("payment failed: %w", err)
	}
	fmt.Println("✅ Payment successful!")
	return nil
}

// ========================================
// MAIN FUNCTION
// ========================================

func main() {
	fmt.Println("╔═══════════════════════════════════════╗")
	fmt.Println("║   POINTERS, INTERFACES & ERRORS      ║")
	fmt.Println("╚═══════════════════════════════════════╝\n")

	// ========================================
	// 1. POINTERS BASICS
	// ========================================

	fmt.Println("=== POINTERS BASICS ===\n")

	// Variable biasa
	balance := 100000
	fmt.Printf("Balance value: %d\n", balance)
	fmt.Printf("Balance address: %p\n", &balance)
	fmt.Println()

	// Pointer variable
	var balancePtr *int
	balancePtr = &balance

	fmt.Printf("Pointer value (address): %p\n", balancePtr)
	fmt.Printf("Pointer dereferenced (*ptr): %d\n", *balancePtr)
	fmt.Println()

	// Modify via pointer
	*balancePtr = 200000
	fmt.Printf("After modify via pointer: %d\n", balance)
	fmt.Println()

	// ========================================
	// 2. POINTERS WITH STRUCTS
	// ========================================

	fmt.Println("=== POINTERS WITH STRUCTS ===\n")

	user1 := User{
		ID:      1,
		Name:    "Farhan",
		Email:   "farhan@email.com",
		Balance: 1000000,
	}

	fmt.Printf("Before (value): %s balance = Rp %d\n", user1.Name, user1.Balance)
	updateBalanceByValue(user1, 500000)
	fmt.Printf("After (value):  %s balance = Rp %d\n", user1.Name, user1.Balance)
	fmt.Println("⚠️ Balance tidak berubah!\n")

	fmt.Printf("Before (pointer): %s balance = Rp %d\n", user1.Name, user1.Balance)
	updateBalanceByPointer(&user1, 500000)
	fmt.Printf("After (pointer):  %s balance = Rp %d\n", user1.Name, user1.Balance)
	fmt.Println("✅ Balance berubah!\n")

	// ========================================
	// 3. SWAP USING POINTERS
	// ========================================

	fmt.Println("=== SWAP VALUES ===\n")

	x, y := 10, 20
	fmt.Printf("Before swap: x=%d, y=%d\n", x, y)
	swap(&x, &y)
	fmt.Printf("After swap:  x=%d, y=%d\n\n", x, y)

	// ========================================
	// 4. NIL POINTERS
	// ========================================

	fmt.Println("=== NIL POINTERS ===\n")

	var userPtr *User
	fmt.Printf("User pointer: %v\n", userPtr)
	fmt.Printf("Is nil? %v\n", userPtr == nil)

	// Safe check before use
	if userPtr != nil {
		fmt.Println("User name:", userPtr.Name)
	} else {
		fmt.Println("⚠️ Pointer is nil, cannot access\n")
	}

	// Initialize pointer
	userPtr = &user1
	fmt.Printf("After initialize: %v\n", userPtr)
	fmt.Printf("User name: %s\n\n", userPtr.Name)

	// ========================================
	// 5. INTERFACES - DISPLAYABLE
	// ========================================

	fmt.Println("=== INTERFACES - DISPLAYABLE ===\n")

	user2 := User{
		ID:       2,
		Name:     "Budi Santoso",
		Email:    "budi@email.com",
		Balance:  5000000,
		IsMember: true,
	}

	product1 := Product{
		ID:       "LAP001",
		Name:     "Laptop ASUS ROG",
		Price:    15000000,
		Stock:    10,
		Category: "Electronics",
	}

	order1 := Order{
		ID:         "ORD001",
		CustomerID: 1,
		Total:      15000000,
		Status:     "Paid",
		CreatedAt:  time.Now(),
	}

	// Semua struct di atas implements Displayable
	fmt.Println("Display User:")
	displayInfo(user2)

	fmt.Println("Display Product:")
	displayInfo(product1)

	fmt.Println("Display Order:")
	displayInfo(order1)

	// Display multiple items
	displayableItems := []Displayable{user1, user2, product1, order1}
	fmt.Println("=== DISPLAY ALL ITEMS ===")
	displayAll(displayableItems)

	// ========================================
	// 6. INTERFACES - PRICEABLE
	// ========================================

	fmt.Println("\n=== INTERFACES - PRICEABLE ===\n")

	product2 := Product{
		ID:    "MOU001",
		Name:  "Gaming Mouse",
		Price: 500000,
		Stock: 50,
	}

	fmt.Printf("Original price: Rp %d\n", product2.GetPrice())
	product2.SetPrice(750000)
	fmt.Printf("Updated price: Rp %d\n\n", product2.GetPrice())

	// ========================================
	// 7. INTERFACES - PAYMENT PROCESSOR
	// ========================================

	fmt.Println("=== INTERFACES - PAYMENT PROCESSOR ===\n")

	amount := 1000000

	// Credit Card
	creditCard := CreditCardPayment{
		CardNumber: "1234567812345678",
		CVV:        "123",
	}
	processPayment(creditCard, amount)

	// E-Wallet
	gopay := EWalletPayment{
		PhoneNumber: "081234567890",
		Provider:    "GoPay",
	}
	processPayment(gopay, amount)

	// Bank Transfer
	bankTransfer := BankTransferPayment{
		BankName:      "BCA",
		AccountNumber: "1234567890",
	}
	processPayment(bankTransfer, amount)

	// ========================================
	// 8. ERROR HANDLING - BASIC
	// ========================================

	fmt.Println("\n=== ERROR HANDLING - BASIC ===\n")

	// Validate user
	err := validateUser("farhan@email.com", "Farhan", 100000)
	if err != nil {
		fmt.Printf("❌ Validation error: %v\n", err)
	} else {
		fmt.Println("✅ User validation passed")
	}

	// Invalid email
	err = validateUser("invalidemail", "Farhan", 100000)
	if err != nil {
		fmt.Printf("❌ Validation error: %v\n\n", err)
	}

	// ========================================
	// 9. CUSTOM ERROR TYPES
	// ========================================

	fmt.Println("=== CUSTOM ERROR TYPES ===\n")

	buyer := User{
		ID:      3,
		Name:    "Siti",
		Email:   "siti@email.com",
		Balance: 500000,
	}

	laptop := Product{
		ID:    "LAP002",
		Name:  "MacBook Pro",
		Price: 30000000,
		Stock: 3,
	}

	fmt.Printf("User: %s (Balance: Rp %d)\n", buyer.Name, buyer.Balance)
	fmt.Printf("Product: %s (Price: Rp %d, Stock: %d)\n\n", laptop.Name, laptop.Price, laptop.Stock)

	// Try to purchase (insufficient balance)
	err = purchaseProduct(&buyer, &laptop, 1)
	if err != nil {
		// Type assertion untuk custom error
		switch e := err.(type) {
		case *InsufficientBalanceError:
			fmt.Printf("❌ Error: %v\n", e)
			fmt.Printf("   Kekurangan: Rp %d\n\n", e.Required-e.Current)
		case *OutOfStockError:
			fmt.Printf("❌ Error: %v\n\n", e)
		default:
			fmt.Printf("❌ Unknown error: %v\n\n", err)
		}
	}

	// Try to purchase out of stock
	mouse := Product{
		ID:    "MOU002",
		Name:  "Wireless Mouse",
		Price: 200000,
		Stock: 2,
	}

	err = purchaseProduct(&buyer, &mouse, 5)
	if err != nil {
		switch e := err.(type) {
		case *InsufficientBalanceError:
			fmt.Printf("❌ Error: %v\n\n", e)
		case *OutOfStockError:
			fmt.Printf("❌ Error: %v\n", e)
			fmt.Printf("   Silakan kurangi quantity menjadi %d\n\n", e.Available)
		default:
			fmt.Printf("❌ Unknown error: %v\n\n", err)
		}
	}

	// Successful purchase
	keyboard := Product{
		ID:    "KEY001",
		Name:  "Mechanical Keyboard",
		Price: 400000,
		Stock: 10,
	}

	fmt.Printf("Attempting to buy %s...\n", keyboard.Name)
	err = purchaseProduct(&buyer, &keyboard, 1)
	if err != nil {
		fmt.Printf("❌ Purchase failed: %v\n\n", err)
	} else {
		fmt.Println("✅ Purchase successful!")
		fmt.Printf("   New balance: Rp %d\n", buyer.Balance)
		fmt.Printf("   Remaining stock: %d\n\n", keyboard.Stock)
	}

	// ========================================
	// 10. PANIC & RECOVER
	// ========================================

	fmt.Println("=== PANIC & RECOVER ===\n")

	// Safe division
	result, err := safeDivide(10, 2)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Printf("10 / 2 = %d\n", result)
	}

	// Division by zero (will panic but recovered)
	result, err = safeDivide(10, 0)
	if err != nil {
		fmt.Printf("❌ Error: %v\n\n", err)
	} else {
		fmt.Printf("Result: %d\n", result)
	}

	// ========================================
	// 11. INTERFACES - STORAGE
	// ========================================

	fmt.Println("=== INTERFACES - STORAGE ===\n")

	storage := NewMemoryStorage()

	// Save data
	product3 := Product{
		ID:    "HD001",
		Name:  "Headphones",
		Price: 1500000,
		Stock: 15,
	}

	err = storage.Save(product3.ID, product3)
	if err != nil {
		fmt.Printf("❌ Save error: %v\n", err)
	} else {
		fmt.Printf("✅ Product saved: %s\n", product3.ID)
	}

	// Load data
	data, err := storage.Load("HD001")
	if err != nil {
		fmt.Printf("❌ Load error: %v\n", err)
	} else {
		loadedProduct := data.(Product)
		fmt.Printf("✅ Product loaded: %s - Rp %d\n", loadedProduct.Name, loadedProduct.Price)
	}

	// Try to load non-existent data
	_, err = storage.Load("NOTFOUND")
	if err != nil {
		fmt.Printf("❌ Load error: %v\n", err)
	}

	// Delete data
	err = storage.Delete("HD001")
	if err != nil {
		fmt.Printf("❌ Delete error: %v\n", err)
	} else {
		fmt.Println("✅ Product deleted: HD001")
	}

	fmt.Println("\n╚═══════════════════════════════════════╝")
}
