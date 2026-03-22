package main

import "fmt"

func main() {
    fmt.Println("╔═══════════════════════════════════════╗")
    fmt.Println("   OPERATORS & CONTROL FLOW           ")
    fmt.Println("╚═══════════════════════════════════════╝\n")

	// ===================================
	// ARITMETIC OPERATORS
	// ===================================

	fmt.Println("=== ARITMETIC OPERATORS ===\n")

	price := 100000
	quantity := 3
	shippingCost := 25000

	subtotal := price * quantity
	total := subtotal + shippingCost

	fmt.Println("Harga Satuan: Rp", price)
	fmt.Println("Kuantitas: ", quantity)
	fmt.Println("Biaya Ongkir: Rp", shippingCost)
	fmt.Println("Subtotal: Rp", subtotal)
	fmt.Println("Total: Rp", total)
	fmt.Println()

	// Operasi lainnya
	a := 20
	b := 3
	fmt.Println("a:", a, "b:", b)
	fmt.Println("Penjumlahan (a + b):", a+b)
	fmt.Println("Pengurangan (a - b):", a-b)
	fmt.Println("Perkalian (a * b):", a*b)
	fmt.Println("Pembagian (a / b):", a/b)
	fmt.Println("Modulus (a % b):", a%b)
	fmt.Println()

	// ===================================
	// COMPARISON OPERATORS
	// ===================================

	fmt.Println("=== COMPARISON OPERATORS ===\n")

	userBalance := 500000
	productPrice := 350000

	fmt.Println("Saldo User	: Rp", userBalance)
	fmt.Println("Harga Produk	: Rp", productPrice)
	fmt.Println()

	fmt.Println("Cukup Bayar?", userBalance >= productPrice)
	fmt.Println("Sama Persis?", userBalance == productPrice)
	fmt.Println("Tidak sama?", userBalance != productPrice)
	fmt.Println("Lebih besar?", userBalance > productPrice)
	fmt.Println("Lebih kecil?", userBalance < productPrice)
	fmt.Println()

	// ===================================
	// LOGICAL OPERATORS
	// ===================================

	fmt.Println("=== LOGICAL OPERATORS ===\n")

	isMember := true
	hasDiscountCoupon := false
	purchaseAmount := 1500000

	fmt.Println("Is Member?", isMember)
	fmt.Println("Has Discount Coupon?", hasDiscountCoupon)
	fmt.Println("Purchase Amount: Rp", purchaseAmount)
	fmt.Println()

	// AND - semua harus true
	eligibleForFreeShipping := isMember && (purchaseAmount >= 1000000)
	fmt.Println("Eligible for Free Shipping?", eligibleForFreeShipping)

	// OR - salah satu harus true
	canGetDiscount := isMember || hasDiscountCoupon
	fmt.Println("Can Get Discount?", canGetDiscount)
	fmt.Println()

	// NOT - kebalikan
	isGuest := !isMember
	fmt.Println("Is Guest?", isGuest)
	fmt.Println()

	// ===================================
	// IF-ELSE STATEMENT
	// ===================================

	fmt.Println("=== IF-ELSE STATEMENT ===\n")

	customerName := "Farhan Nugraha"
	customerBalance := 750000
	itemPrice := 500000

	fmt.Println("Customer Name: ", customerName)
	fmt.Println("Customer Balance: Rp", customerBalance)
	fmt.Println("Item Price: Rp", itemPrice)
	fmt.Println()

	if customerBalance >= itemPrice {
		remainingBalance := customerBalance - itemPrice
		fmt.Println("Purchase Successful!")
		fmt.Println("Remaining Balance: Rp", remainingBalance)
	} else {
		shortage := itemPrice - customerBalance
		fmt.Println("Insufficient Balance!")
		fmt.Println("You need Rp", shortage, "more to complete the purchase.")
	}
	fmt.Println()

	// ===================================
	// NESTED-IF STATEMENT
	// ===================================

	fmt.Println("=== SISTEM DISKON OTOMATIS ===\n")

	orderTotal := 2500000
	isPremiumMember := true

	fmt.Println("Order Total: Rp", orderTotal)
	fmt.Println("Is Premium Member?", isPremiumMember)
	fmt.Println()

	var discount float64
	var discountLabel string

	if isPremiumMember && orderTotal >= 2000000 {
		discount = 20.0
		discountLabel = "20% Discount for Premium Members"
	} else if isPremiumMember {
		discount = 15.0
		discountLabel = "15% Discount for Premium Members"
	} else if orderTotal >= 1000000 {
		discount = 10.0
		discountLabel = "10% Discount"
	} else if orderTotal >= 500000 {
		discount = 5.0
		discountLabel = "5% Discount"
	} else {
		discount = 0.0
		discountLabel = "No Discount"
	}

	discountAmount := float64(orderTotal) * (discount / 100)
	finalTotal := float64(orderTotal) - discountAmount

	fmt.Println("Discount Label: ", discountLabel)
	fmt.Println("Discount Amount: Rp", int(discountAmount))
	fmt.Println("Final Total after Discount: Rp", int(finalTotal))
	fmt.Println()

	// ===================================
	// SWITCH STATEMENT
	// ===================================

	fmt.Println("=== SWITCH STATEMENT ===\n")

	paymentMethod := "gopay"
	fmt.Println("Payment Method: ", paymentMethod)

	switch paymentMethod {
	case "gopay", "ovo", "dana":
		fmt.Println("You selected a digital wallet for payment.")
	case "credit_card":
		fmt.Println("You selected credit card for payment.")
	case "bank_transfer":
		fmt.Println("You selected bank transfer for payment.")
	case "cod":
		fmt.Println("You selected Cash on Delivery (COD) for payment.")
	default:
		fmt.Println("Unknown payment method selected.")
	}
	fmt.Println()

	// ===================================
	// SWITCH TANPA EXPRESSION
	// ===================================

	fmt.Println("=== RATING PRODUK SYSTEM ===\n")
	productRating := 4.5
	fmt.Println("Product Rating: ", productRating)

	switch {
	case productRating >= 4.5:
		fmt.Println("Excellent!")
	case productRating >= 4.0:
		fmt.Println("Very Good!")
	case productRating >= 3.0:
		fmt.Println("Good!")
	case productRating >= 2.0:
		fmt.Println("Fair!")
	default:
		fmt.Println("Poor!")
	}
	fmt.Println()

	// ===================================
	// ANOTHER NESTED IF
	// ===================================

	fmt.Println("=== STOCK & AVAILABILITY CHECK ===\n")

	productStock := 5
	requestedQty := 3
	isStoreOpen := true

	fmt.Println("Product Stock: ", productStock)
	fmt.Println("Requested Quantity: ", requestedQty)
	fmt.Println("Is Store Open?", isStoreOpen)
	fmt.Println()

	if isStoreOpen {
		if productStock >= requestedQty {
			fmt.Println("Order can be processed!")
		} else if productStock > 0 {
			fmt.Println("Insufficient stock for the requested quantity.")
		} else {
			fmt.Println("Out of stock. Order cannot be processed.")
		}
	} else {
		fmt.Println("Store is closed. Order cannot be processed.")
	}
	fmt.Println()

	// ===================================
	// CHECKOUT SYSTEM
	// ===================================

	fmt.Println("=== SIMPLE CHECKOUT SYSTEM ===\n")

	// data customer
	checkoutCustomer := "Farhan Nugraha"
	checkoutIsMember := true
	checkoutBalance := 3000000

	// data order
	checkoutProduct := "Iphone 15 Pro Max"
	checkoutPrice := 2500000
	checkoutQuantity := 1
	checkoutShippingCost := 50000

	// proses checkout
	fmt.Println("Customer Name: ", checkoutCustomer)
	fmt.Println("Is Member?", checkoutIsMember)
	fmt.Println("Customer Balance: Rp", checkoutBalance)
	fmt.Println("================================")
	fmt.Println("Product: ", checkoutProduct)
	fmt.Println("Price: Rp", checkoutPrice)
	fmt.Println("Quantity: ", checkoutQuantity)
	fmt.Println("Shipping Cost: Rp", checkoutShippingCost)
	fmt.Println("================================")
	
	checkoutSubtotal := checkoutPrice * checkoutQuantity

	var checkoutDiscount float64
	if checkoutIsMember && checkoutSubtotal >= 2000000 {
		checkoutDiscount = 15.0
	} else if checkoutIsMember {
		checkoutDiscount = 10.0
	} else if checkoutSubtotal >= 1000000 {
		checkoutDiscount = 5.0
	} else {
		checkoutDiscount = 0.0
	}

	checkoutDiscountAmount := float64(checkoutSubtotal) * (checkoutDiscount / 100)
	checkoutAfterDiscount := float64(checkoutSubtotal) - checkoutDiscountAmount

	var finalShipping int
	if checkoutIsMember && checkoutSubtotal >= 1000000 {
		finalShipping = 0
		fmt.Println("FREE SHIPPING APPLIED!")
	} else {
		finalShipping = checkoutShippingCost
	}

	checkoutFinalTotal := checkoutAfterDiscount + float64(finalShipping)

	fmt.Println("Subtotal : Rp", checkoutSubtotal)
	if checkoutDiscount > 0 {
		fmt.Printf("Discount (%.0f%%) : Rp%d\n", checkoutDiscount, int(checkoutDiscountAmount))
	} else {
		fmt.Println("Discount : Rp0")
	}
	fmt.Println("Shipping Cost : Rp", finalShipping)
	fmt.Println("================================")
	fmt.Println("Final Total : Rp", int(checkoutFinalTotal))

	if checkoutBalance >= int(checkoutFinalTotal) {
		remainingBalance := checkoutBalance - int(checkoutFinalTotal)
		fmt.Println("Purchase Successful!")
		fmt.Println("Remaining Balance: Rp", remainingBalance)
	} else {
		shortage := int(checkoutFinalTotal) - checkoutBalance
		fmt.Println("Insufficient Balance!")
		fmt.Println("You need Rp", shortage, "more to complete the purchase.")
	}
	fmt.Println()

	


}