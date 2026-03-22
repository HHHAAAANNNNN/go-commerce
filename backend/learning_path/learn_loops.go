package main

import "fmt"

func main() {
	fmt.Println("╔═══════════════════════════════════════╗")
    fmt.Println("       LOOPS & ARRAYS                 ")
    fmt.Println("╚═══════════════════════════════════════╝\n")

	// ==========================
	// FOR LOOP - Basic
	// ==========================

	fmt.Println("=== Basic For Loop === \n")

	// loop cetak 1 sampai 5
	fmt.Println("Counting from 1 to 5:")
	for i := 1; i <= 5; i++ {
		fmt.Printf("Number: %d\n", i)
	}
	fmt.Println()

	// loop mundur
	fmt.Println("Counting down from 5 to 1:")
	for i := 5; i >= 1; i-- {
		fmt.Printf("Number: %d\n", i)
	}
	fmt.Println()

	// ==========================
	// FOR LOOP - While Style
	// ==========================

	fmt.Println("=== For Loop with Arrays === \n")

	stock := 10
	fmt.Printf("Initial Stock: %d\n", stock)

	for stock > 0 {
		fmt.Printf("Selling 1 item, stock left: %d\n", stock-1)
		stock--
	}
	fmt.Println("Stock is empty!\n")

	// ==========================
	// FOR LOOP - Inifinite with Break
	// ==========================

	fmt.Println("=== Infinite Loop with Break === \n")

	orderCount := 0
	maxOrders := 5

	for {
		orderCount++
		fmt.Println("Processing order number: ", orderCount)
		if orderCount >= maxOrders {
			fmt.Println("Reached maximum order limit. Stopping.\n")
			break
		}
	}

	// ==========================
	// CONTINUE STATEMENT
	// ==========================

	fmt.Println("=== Continue Statement === \n")

	fmt.Println("Processing orders, skipping order #3: ")
	for i := 1; i <= 5; i++ {
		if i == 3 {
			fmt.Println("Skipping order #3")
			continue
		}
		fmt.Println("Processing order #", i)
	}
	fmt.Println()

	// ==========================
	// NESTED LOOPS
	// ==========================

	fmt.Println("=== NESTED LOOP ===")

	fmt.Println("Product Table (3 categories, 3 products each): \n")
	categories := []string{"Electronics", "Clothing", "Books"}

	for catIndex, category := range categories {
		fmt.Printf("Category %d: %s\n", catIndex+1, category)
		for prodNum := 1; prodNum <= 3; prodNum++ {
			fmt.Printf("  - Product %d\n", prodNum)
		}
		fmt.Println()
	}

	// ==========================
	// ARRAYS - Declaration
	// ==========================

	fmt.Println("=== ARRAYS - Declaration === \n")

	var productIDs [5]int
	productIDs[0] = 101
	productIDs[1] = 102
	productIDs[2] = 103
	productIDs[3] = 104
	productIDs[4] = 105

	fmt.Println("Product IDs Array:", productIDs)
	fmt.Println("First Product ID:", productIDs[0])
	fmt.Println("last Product ID:", productIDs[len(productIDs)-1])
	fmt.Println("Total Products:", len(productIDs))
	fmt.Println()

	prices := [5]int{100000, 250000, 150000, 300000, 180000}
	fmt.Println("Prices Array:", prices)
	fmt.Println()

	categories2 := [...]string{"electronics", "clothing", "books", "furniture", "toys"}
	fmt.Println("Categories Array:", categories2)
	fmt.Println()

	// ==========================
	// ARRAYS - Looping
	// ==========================

	fmt.Println("=== ARRAYS - Looping === \n")

	productNames := [5]string{"Laptop", "T-Shirt", "Novel", "Sofa", "Action Figure"}

	// classic for loop
	fmt.Println("Using classic for loop:")
	for i := 0; i < len(productNames); i++ {
		fmt.Printf("Product %d: %s\n", i+1, productNames[i])
	}
	fmt.Println()

	// range loop
	fmt.Println("Using range loop:")
	for index, product := range productNames {
		fmt.Printf("Product %d: %s\n", index+1, product)
	}
	fmt.Println()

	// range ignoring index
	fmt.Println("Using range loop (ignoring index):")
	for _, product := range productNames {
		fmt.Printf("Product: %s\n", product)
	}
	fmt.Println()

	// ==========================
	// ARRAYS - Multi Dimensional
	// ==========================

	fmt.Println("=== ARRAYS - Multi Dimensional === \n")

	inventory := [3][3]int {
		{101, 50, 100000},
		{102, 30, 250000},
		{103, 20, 150000},
	}

	fmt.Println("Inventory Table:")
	fmt.Println("ID\tStock\tPrice")
	fmt.Println("-----------------------")

	for _, product := range inventory {
		fmt.Printf("%d\t%d\t%d\n", product[0], product[1], product[2])
	}
	fmt.Println()

	// ==========================
	// ARRAY OPERATIONS
	// ==========================

	fmt.Println("=== ARRAY OPERATIONS === \n")

	stockLevels := [5]int{50, 30, 20, 15, 40}

	totalStock := 0
	for _, stock := range stockLevels {
		totalStock += stock
	}

	fmt.Println("Stock Levels:", stockLevels)
	fmt.Println("Total Stock Available:", totalStock)
	fmt.Println()

	// cari stock terbesar
	maxStock := stockLevels[0]
	for _, stock := range stockLevels {
		if stock > maxStock {
			maxStock = stock
		}
	}

	fmt.Println("Maximum Stock Level:", maxStock)
	fmt.Println()

	// cari stock terkecil
	minStock := stockLevels[0]
	for _, stock := range stockLevels {
		if stock < minStock {
			minStock = stock
		}
	}

	fmt.Println("Minimum Stock Level:", minStock)
	fmt.Println()

	// mean stock
	avgStock := float64(totalStock) / float64(len(stockLevels))
	fmt.Printf("Average Stock Level: %.2f\n", avgStock)
	fmt.Println()

	// ==========================
	// MINI PROJECT: SHOPPING CART
	// ==========================

	fmt.Println("=== MINI PROJECT: SHOPPING CART === \n")

	cartProductNames := [3]string{"Laptop", "T-Shirt", "Novel"}
	cartPrices := [3]int{1000000, 250000, 150000}
	cartQuantities := [3]int{1, 2, 1}

	fmt.Println("YOUR SHOPPING CART: \n")
	fmt.Println("No\tProduct\t\tPrice\tQuantity\tTotal")

	var grandTotal int = 0

	for i := 0; i < len(cartProductNames); i++ {
		subtotal := cartPrices[i] * cartQuantities[i]
		grandTotal += subtotal

		fmt.Printf("%-2d\t%-17s\t\t%9d\t%3d\t%9d\n", 
		i+1, 
		cartProductNames[i], cartPrices[i], cartQuantities[i], subtotal)
	}

	fmt.Println("-----------------------------------------------------")

	var discount float64
	if grandTotal >= 5000000 {
		discount = 15
	} else if grandTotal >= 3000000 {
		discount = 10
	} else if grandTotal >= 1000000 {
		discount = 5
	} else {
		discount = 0
	}

	discountAmount := float64(grandTotal) * (discount / 100)
	tax := float64(grandTotal-int(discountAmount)) * 0.11
	finalTotal := float64(grandTotal) - discountAmount + tax

	fmt.Println()
	fmt.Printf("SubTotal: %d\n", grandTotal)

	if discount > 0 {
		fmt.Printf("Discount (%d%%): %.0f\n", int(discount), discountAmount)
		fmt.Printf("Discount Amount: %.0f\n", discountAmount)
	} else {
		fmt.Println("No discount applied.")
	}

	fmt.Printf("Tax (11%%): %.0f\n", tax)
	fmt.Printf("Final Total: %.0f\n", finalTotal)
	fmt.Println()

	totalItems := 0
	for _, qty := range cartQuantities {
		totalItems += qty
	}

	fmt.Printf("Total Items: %d\n", totalItems)
	fmt.Println("Total Products:", len(cartProductNames))
	fmt.Println()

	// ==========================
	// FIND PRODUCT IN CART
	// ==========================

	fmt.Println("=== FIND PRODUCT IN CART === \n")

	searchProduct := "Iphone 15 Pro"
	found := false
	foundIndex := -1

	for i, product := range cartProductNames {
		if product == searchProduct {
			found = true
			foundIndex = i
			break
		}
	}

	if found {
		fmt.Printf("Product '%s' found at index %d with the Price of %d and Quantity of %d\n", searchProduct, foundIndex, cartPrices[foundIndex], cartQuantities[foundIndex])
	} else {
		fmt.Printf("Product '%s' not found in the cart.\n", searchProduct)
	}

	fmt.Println()

	// ==========================
	// ORDER PROCESSING SIMULATION
	// ==========================

	fmt.Println("=== ORDER PROCESSING SIMULATION === \n")

	orderStatuses := [5]string{"Pending", "Processing", "Shipped", "Delivered", "Cancelled"}

	for i, status := range orderStatuses {
		fmt.Printf("Order %d: %s\n", i+1, status)

		if i < len(orderStatuses)-1 {
			fmt.Println("Updating status to next stage...\n")
		} else {
			fmt.Println("Order process completed.\n")
		}
		fmt.Println()
	}

	fmt.Println("\n === END OF PROGRAM ===")
}