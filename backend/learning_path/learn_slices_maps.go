package main

import (
	"fmt"
	"sort"
	"strings"

	"golang.org/x/text/number"
)

func main() {
    fmt.Println("╔═══════════════════════════════════════╗")
    fmt.Println("      SLICES & MAPS                   ")
    fmt.Println("╚═══════════════════════════════════════╝\n")

	// ==========================
	// SLICES - Basic Operations
	// ==========================

	fmt.Println("=== Basic Slice Operations === \n")

	// cara 1: langsung buat slice
	products := []string{"Apple", "Banana", "Cherry"}
	fmt.Println("Initial Products:", products)
	fmt.Println("Number of Products:", len(products))
	fmt.Println("capacity of Products slice:", cap(products))
	fmt.Println()

	// cara 2: menggunakan make
	prices := make([]int, 3, 5)
	prices[0] = 100000
	prices[1] = 500000
	prices[2] = 75000
	fmt.Println("Initial Prices Slice:", prices)
	fmt.Println("Number of elements in Prices slice:", len(prices))
	fmt.Println("Capacity of Prices slice:", cap(prices))
	fmt.Println()

	// cara 3: slice kosong
	var categories []string
	fmt.Println("Empty Categories Slice:", categories)
	fmt.Println("is nil?", categories == nil)
	fmt.Println()

	// ==========================
	// APPEND to SLICES
	// ==========================

	fmt.Println("=== APPEND to SLICES === \n")
	cart := []string{}
	fmt.Println("Initial Cart:", cart)

	cart = append(cart, "Laptop")
	fmt.Println("Cart after adding Laptop:", cart)

	cart = append(cart, "Smartphone", "Headphones")
	fmt.Println("Cart after adding more items:", cart)

	newItems := []string{"Mouse", "Keyboard"}
	cart = append(cart, newItems...)
	fmt.Println("Cart after adding new items slice:", cart)
	fmt.Println("Total items in Cart:", len(cart))
	fmt.Println()

	// ==========================
	// ACCESSING SLICES
	// ==========================

	fmt.Println("=== ACCESSING SLICES === \n")

	items := []string{"Table", "Chair", "Lamp", "Sofa", "Bookshelf"}
	fmt.Println("Items Slice:", items)

	fmt.Println("First Item:", items[0])
	fmt.Println("Last Item:", items[len(items)-1])
	fmt.Println()

	// slicing [start:end] - includes start, excludes end
	fmt.Println("Items from index 1 to 3:", items[1:4])
	fmt.Println("Items from start to index 2:", items[:3])
	fmt.Println("Items from index 2 to end:", items[2:])
	fmt.Println("Items full slice:", items[:])
	fmt.Println()

	// ==========================
	// MODIFYING SLICES
	// ==========================

	fmt.Println("=== MODIFYING SLICES === \n")

	inventory := []string{"Pen", "Notebook", "Eraser"}
	fmt.Println("Initial Inventory:", inventory)

	inventory[1] = "Pencil"
	fmt.Println("Inventory after modifying:", inventory)
	fmt.Println()

	// ==========================
	// DELETING from SLICES
	// ==========================

	fmt.Println("=== DELETING from SLICES === \n")

	tasks := []string{"Task1", "Task2", "Task3", "Task4", "Task5"}
	fmt.Println("Initial Tasks:", tasks)

	indexToDelete := 2
	tasks = append(tasks[:indexToDelete], tasks[indexToDelete+1:]...)
	fmt.Println("Tasks after deleting index 2:", tasks)
	fmt.Println()

	tasks = tasks[1:]
	fmt.Println("Tasks after removing first item:", tasks)
	fmt.Println()

	tasks = tasks[:len(tasks)-1]
	fmt.Println("Tasks after removing last item:", tasks)
	fmt.Println()

	// ==========================
	// COPY SLICES
	// ==========================

	fmt.Println("=== COPY SLICES === \n")

	original := []int{1, 2, 3, 4, 5}
	copied := make([]int, len(original))
	copy(copied, original)

	fmt.Println("Original Slice:", original)
	fmt.Println("Copied Slice:", copied)
	fmt.Println()

	copied[0] = 999
	fmt.Println("Copied Slice after modification:", copied)
	fmt.Println("Original Slice remains unchanged:", original)
	fmt.Println()

	// ==========================
	// SLICE OPERATIONS
	// ==========================

	fmt.Println("=== SLICE OPERATIONS === \n")

	numbers := []int{42, 23, 16, 15, 8, 4}
	fmt.Println("Original Numbers Slice:", numbers)

	sort.Ints(numbers)
	fmt.Println("Sorted Numbers Slice (ascending):", numbers)

	sort.Sort(sort.Reverse(sort.IntSlice(numbers)))
	fmt.Println("Sorted Numbers Slice (descending):", numbers)
	fmt.Println()

	names := []string{"alice", "Bob", "charlie", "dave"}
	fmt.Println("Original Names Slice:", names)
	sort.Strings(names)
	fmt.Println("Sorted Names Slice (A-Z):", names)
	fmt.Println()

	joined := strings.Join(names, ", ")
	fmt.Println("Joined Names:", joined)
	fmt.Println()

	// ==========================
	// MAPS - Basic Operations
	// ==========================

	fmt.Println("=== MAPS - Basic Operations === \n")

	// cara 1: map literal
	productPrices := map[string]int{
		"Laptop": 15000000,
		"Smartphone": 8000000,
		"Tablet": 5000000,
	}
	fmt.Println("Product Prices Map:", productPrices)
	fmt.Println()

	// cara 2: menggunakan make
	userBalances := make(map[string]int)
	userBalances["Farhan"] = 5000000
	userBalances["Alya"] = 7500000
	userBalances["Rizky"] = 3000000

	fmt.Println("User Balances Map:", userBalances)
	fmt.Println()

	// ==========================
	// MAP OPERATIONS
	// ==========================

	fmt.Println("=== MAP OPERATIONS === \n")

	// add/update
	productPrices["Headphones"] = 2000000
	fmt.Println("Added Headphones:", productPrices)

	productPrices["Laptop"] = 14000000
	fmt.Println("Updated Laptop Price:", productPrices)

	// get value
	laptopPrice := productPrices["Laptop"]
	fmt.Println("Laptop Price:", laptopPrice)

	// check if key exists
	price, exists := productPrices["Smartwatch"]
	if exists {
		fmt.Println("Smartwatch Price:", price)
	} else {
		fmt.Println("Smartwatch not found in product prices.")
	}
	fmt.Println()

	// delete
	delete(productPrices, "Tablet")
	fmt.Println("Product Prices after deleting Tablet:", productPrices)
	fmt.Println()

	// length
	fmt.Println("Number of products in Product Prices map:", len(productPrices))
	fmt.Println()

	// ==========================
	// LOOPING MAPS
	// ==========================

	fmt.Println("=== LOOPING MAPS === \n")

	stockMap := map[string]int{
		"Laptop": 10,
		"Smartphone": 25,
		"Headphones": 50,
		"Tablet": 15,
	}

	fmt.Println("Stock Map:")
	for product, stock := range stockMap {
		fmt.Printf("Product: %s, Stock: %d\n", product, stock)
	}
	fmt.Println()

	// looping hanya key
	fmt.Println("Products in Stock Map:")
	for product := range stockMap {
		fmt.Println("Product:", product)
	}
	fmt.Println()

	// ==========================
	// NESTED MAPS
	// ==========================

	fmt.Println("=== NESTED MAPS === \n")

	productDatabase := map[string]map[string]interface{}{
		"Laptop": {
			"name": "Laptop",
			"price": 15000000,
			"stock": 10,
			"category": "Electronics",
		},
		"Smartphone": {
			"name": "Smartphone",
			"price": 8000000,
			"stock": 25,
			"category": "Electronics",
		},
		"Headphones": {
			"name": "Headphones",
			"price": 2000000,
			"stock": 50,
			"category": "Electronics",
		},
	}

	fmt.Println("Product Database:")
	for id, details := range productDatabase {
		fmt.Printf("Product ID: %s\n", id)
		fmt.Printf(" Name: %s\n", details["name"])
		fmt.Printf(" Price: %s\n", number.FormatInt(details["price"].(int), number.Decimal))
		fmt.Printf(" Stock: %d\n", details["stock"].(int))
		fmt.Printf(" Category: %s\n", details["category"])
		fmt.Println()
	}
	fmt.Println()

	// ==========================
	//  SLICES OF MAPS
	// ==========================

	fmt.Println("=== SLICES of MAPS === \n")

	productList := []map[string]interface{}{
		{
			"id": "P001",
			"name": "Laptop",
			"price": 15000000,
		},
		{
			"id": "P002",
			"name": "Smartphone",
			"price": 8000000,
		},
		{
			"id": "P003",
			"name": "Headphones",
			"price": 2000000,
		},
	}

	fmt.Println("Product List:")
	for i, product := range productList {
		fmt.Printf("%d. [%s] %s - Rp %d\n",
			i+1,
			product["id"],
			product["name"],
			product["price"],
		)
	}
	fmt.Println()

	// ==========================
	// MINI PROJECT: SHOPPING SYSTEM
	// ==========================

	fmt.Println("=== MINI PROJECT: SHOPPING SYSTEM === \n")

	products2 := map[string]map[string]interface{}{
		"LAP001": {
			"name": "Gaming Laptop",
			"price": 20000000,
			"stock": 10,
		},
		"IPH002": {
			"name": "iPhone",
			"price": 15000000,
			"stock": 15,
		},
		"AIR003": {
			"name": "AirPods",
			"price": 3000000,
			"stock": 30,
		},
		"MAC004": {
			"name": "MacBook Pro",
			"price": 25000000,
			"stock": 5,
		},
	}

	customerName2 := "Farhan Nugraha"
	customerBalance2 := 50000000

	shoppingCart := map[string]int{
		"LAP001": 1,
		"IPH002": 2,
		"AIR003": 1,
	}

	fmt.Printf("Customer: %s\n", customerName2)
	fmt.Printf("Initial Balance: Rp %s\n\n", number.FormatInt(customerBalance2, number.Decimal))

	fmt.Println("Your Cart: \n")
	fmt.Println("No\tProduct\t\tPrice\tQuantity\tTotal")
	fmt.Println("-------------------------------------------------------------")

	var cartTotal int
	var cartItems []string

	for productID, quantity := range shoppingCart {
		product := products2[productID]
		name := product["name"].(string)
		price := product["price"].(int)
		total := price * quantity
		
		cartTotal += total
		cartItems = append(cartItems, name)

		fmt.Printf("%d\t%s\tRp %s\t%d\t\tRp %s\n",
			productID, name, price, quantity, total)
	}

	fmt.Println("-------------------------------------------------------------")

	var discount float64
	if cartTotal >= 30000000 {
		discount = 15.0
	} else if cartTotal >= 20000000 {
		discount = 10.0
	} else {
		discount = 5.0
	}

	discountAmount := float64(cartTotal) * (discount / 100)
	tax := float64(cartTotal-int(discountAmount)) * 0.11
	finalTotal := float64(cartTotal) - discountAmount + tax

	fmt.Println()
	fmt.Printf("Cart Total: Rp %s\n", number.FormatInt(cartTotal, number.Decimal))
	fmt.Printf("Discount: %.0f%% (Rp %s)\n", discount, number.FormatInt(int(discountAmount), number.Decimal))
	fmt.Printf("Tax (11%%): Rp %s\n", number.FormatInt(int(tax), number.Decimal))
	fmt.Println("===============================================================")
	fmt.Printf("FINAL TOTAL: Rp %s\n", number.FormatInt(int(finalTotal), number.Decimal))

	fmt.Println()
	if customerBalance2 >= int(finalTotal) {
		remaining := customerBalance2 - int(finalTotal)
		fmt.Println("Purchase successful!")
		fmt.Printf("Remaining Balance after purchase: Rp %s\n", number.FormatInt(remaining, number.Decimal))

		fmt.Println("Updating Stock...")
		for productID, quantity := range shoppingCart {
			product := products2[productID]
			stock := product["stock"].(int)
			newStock := stock - quantity
			products2[productID]["stock"] = newStock

			fmt.Printf("Product: %s, New Stock: %d\n", product["name"], newStock)
		}

		fmt.Println("Thank you for shopping with us!")
		fmt.Println("Items purchased:", strings.Join(cartItems, ", "))

	} else {
		shortage := int(finalTotal) - customerBalance2
		fmt.Printf("You need an additional Rp %s to complete the purchase.\n", number.FormatInt(shortage, number.Decimal))
	}

	fmt.Println("REMAINING STOCK:")
	for id, details := range products2 {
		fmt.Printf("Product ID: %s, Name: %s, Stock: %d\n",
			id,
			details["name"],
			details["stock"].(int),
		)
	}
	fmt.Println()

	// ==========================
	// SEARCH AND FILTER
	// ==========================

	fmt.Println("=== SEARCH AND FILTER === \n")

	minPrice := 5000000
	maxPrice := 20000000

	fmt.Printf("Products priced between Rp %s and Rp %s:\n", minPrice, maxPrice)
	for id, details := range products2 {
		price := details["price"].(int)
		if price >= minPrice && price <= maxPrice {
			fmt.Printf("Product ID: %s, Name: %s, Price: Rp %s\n",
				id,
				details["name"],
				number.FormatInt(price, number.Decimal),
			)
		}
	}
	fmt.Println()

	// find product by name
	searchName := "iPhone"
	fmt.Printf("Searching for product with name '%s':\n", searchName)
	for id, details := range products2 {
		name := details["name"].(string)
		if strings.Contains(strings.ToLower(name), strings.ToLower(searchName)) {
			fmt.Printf("Product ID: %s, Name: %s, Price: Rp %s\n",
				id,
				name,
				number.FormatInt(details["price"].(int), number.Decimal),
			)
		}
	}
	fmt.Println()
}

