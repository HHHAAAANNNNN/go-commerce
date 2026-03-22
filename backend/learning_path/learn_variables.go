package main

import "fmt"

func main() {
	fmt.Println("=== BELAJAR VARIABLES & DATA TYPES ===\n")

	// ===================================
	// 4 CARA DEKLARASI VARIABLE
	// ===================================

	// cara 1: [var + tipe data]
	var productName string = "Laptop Gaming"
	var price int = 15000000
	var isAvailable bool = true

	fmt.Println("Produk: ", productName)
	fmt.Println("Harga: Rp", price)
	fmt.Println("Tersedia: ", isAvailable)
	fmt.Println()

	// cara 2: [var] tanpa tipe data (tipe data akan di-deteksi otomatis)

	var storeName = "TechStore Indonesia" // otomatis deteksi ini string
	var totalProducts = 150 // otomatis deteksi ini int

	fmt.Println("Nama Toko: ", storeName)
	fmt.Println("Total Produk: ", totalProducts)
	fmt.Println()

	// cara 3: short declaration (hanya bisa di dalam function)

	customerName := "Budi Santoso" // otomatis deteksi ini string
	customerEmail := "budi@gmail.com" // otomatis deteksi ini string
	customerAge := 25 // otomatis deteksi ini int

	fmt.Println("Nama Pelanggan: ", customerName)
	fmt.Println("Email Pelanggan: ", customerEmail)
	fmt.Println("Usia Pelanggan: ", customerAge)
	fmt.Println()

	// cara 4: deklarasi multiple variable

	var (
		adminName  = "Admin Store"
		adminLevel = 1
		adminActive = true
	)

	fmt.Println("Nama Admin: ", adminName)
	fmt.Println("Level Admin: ", adminLevel)
	fmt.Println("Status: ", adminActive)
	fmt.Println()

	// ===================================
	// TIPE DATA
	// ===================================

	fmt.Println("=== TIPE DATA ===\n")

	// string
	var category string = "Elektronik"
	description := "Produk Laptop Gaming dengan RTX 4060"

	// integer (int)
	var stock int = 50
	var productID int64 = 123456
	quantity := 5

	// float (decimal)
	var discount float64 = 15.5
	rating := 4.8

	// boolean (true/false)
	var isPremium bool = false
	hasWarranty := true

	fmt.Println("Kategori: ", category)
	fmt.Println("Deskripsi: ", description)
	fmt.Println("product ID: ", productID)
	fmt.Println("Stok: ", stock)
	fmt.Println("Kuantitas: ", quantity)
	fmt.Println("Diskon: ", discount)
	fmt.Println("Rating: ", rating)
	fmt.Println("Premium: ", isPremium)
	fmt.Println("Garansi: ", hasWarranty)
	fmt.Println()

	// ===================================
	// CONSTANT (Nilai Tetap)
	// ===================================

	const TAX float64 = 11.0
	const MAX_CART_ITEMS = 10
	const STORE_OPEN_HOUR = 8
	const FREE_SHIPPING_MIN = 100000

	fmt.Println("=== CONSTANTS ===\n")
	fmt.Println("Pajak: ", TAX, "%")
	fmt.Println("Maksimal Item di Keranjang: ", MAX_CART_ITEMS)
	fmt.Println("Jam Buka Toko: ", STORE_OPEN_HOUR, ":00")
	fmt.Println("Gratis Ongkir untuk Pembelian di atas: Rp", FREE_SHIPPING_MIN)
	fmt.Println()

	// ===================================
	// TYPE CONVERSION (Konversi Tipe Data)
	// ===================================

	fmt.Println("=== TYPE CONVERSION ===\n")

	basePrice := 100000
	taxAmount := float64(basePrice) * (TAX / 100)
	finalPrice := float64(basePrice) + taxAmount

	fmt.Printf("Harga Dasar: Rp%d\n", basePrice)
	fmt.Printf("Pajak: Rp%.2f\n", taxAmount)
	fmt.Printf("Harga Akhir: Rp%.2f\n", finalPrice)
	fmt.Println()

	// ===================================
	// ZERO VALUES (Nilai Default)
	// ===================================

	fmt.Println("=== ZERO VALUES ===\n")

	var emptyString string // "" default value
	var emptyInt int       // 0 default value
	var emptyFloat float64 // 0.0 default value
	var emptyBool bool     // false default value

	fmt.Println("Empty String: ", emptyString, "| Length: ", len(emptyString))
	fmt.Println("Empty Int: ", emptyInt)
	fmt.Println("Empty Float: ", emptyFloat)
	fmt.Println("Empty Bool: ", emptyBool)
	fmt.Println()

	// ===================================
	// STRING OPERATIONS (Operasi String)
	// ===================================

	fmt.Println("=== STRING OPERATIONS ===\n")
	firstName := "Farhan"
	lastName := "Nugraha"
	fullName := firstName + " " + lastName

	fmt.Println("Full Name: ", fullName)
	fmt.Println("Length: ", len(fullName), "characters")
	fmt.Println()

	orderMessage := fmt.Sprintf("Order #%d - %s (Rp %d)", productID, productName, price)
	fmt.Println(orderMessage)
	fmt.Println()

	// ===================================
	// MINI PROJECT: INVOICE GENERATOR
	// ===================================

	fmt.Println("╔═══════════════════════════════════════╗")
	fmt.Println("	INVOICE GO-MMERCE \n")
	fmt.Println("╚═══════════════════════════════════════╝")
	fmt.Println()

	invoiceCustomer := "Budi Santoso"
	invoiceProduct := "Laptop Gaming ASUS ROG"
	invoiceQuantity := 2
	invoiceUnitPrice := 15000000

	invoiceTotal := invoiceQuantity * invoiceUnitPrice
	invoiceTax := float64(invoiceTotal) * (TAX / 100)
	invoiceFinalTotal := float64(invoiceTotal) + invoiceTax

	fmt.Println("Customer Name : ", invoiceCustomer)
	fmt.Println("Product Name  : ", invoiceProduct)
	fmt.Println("Quantity      : ", invoiceQuantity)
	fmt.Println("Unit Price    : Rp%d", invoiceUnitPrice)
	fmt.Println("========================================")
	fmt.Println("Total Price   : Rp%d", invoiceTotal)
	fmt.Printf("Tax (%.2f%%)  : Rp%.2f\n", TAX, invoiceTax)
	fmt.Println("========================================")
	fmt.Printf("TOTAL INVOICE : Rp%.2f\n", invoiceFinalTotal)
	fmt.Println()

	fmt.Println("✅ Invoice generated successfully!")
	fmt.Println("╚═══════════════════════════════════════╝")
	
}