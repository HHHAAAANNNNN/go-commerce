<div align="center">

# 🛒 Go-Commerce Backend

[![Go Version](https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**A comprehensive e-commerce REST API built with Go (Golang)**

*A structured learning project demonstrating progressive mastery from Go fundamentals to production-ready backend systems with database integration, RESTful architecture, and clean code principles.*

[Features](#-key-features) •
[Quick Start](#-quick-start) •
[API Documentation](#-api-endpoints) •
[Architecture](#-project-structure) •
[Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Learning Path](#-learning-objectives--mastered-concepts)
- [Usage Examples](#-api-usage-examples)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

This project was developed as a **systematic learning journey** through Go programming, following a semester-based curriculum that covers essential concepts from basic syntax to advanced web development patterns. 

The final application is a **fully functional e-commerce backend API** featuring:
- 👥 User management system
- 📦 Product inventory management
- 🛍️ Order processing capabilities
- 🔍 Advanced search functionality
- 🔐 Clean architecture with middleware support

## 📚 Learning Objectives & Mastered Concepts

<details>
<summary><h3>📖 Semester 1: Fundamentals (Weeks 1-8)</h3></summary>

#### Core Language Features

- **Variables & Data Types**: Deep understanding of Go's type system, including explicit and implicit declarations, type conversion, and zero values
- **Operators & Control Flow**: Mastery of arithmetic, comparison, and logical operators; implementation of conditional logic with if-else and switch statements
- **Loops & Arrays**: Proficiency in Go's for loop variations, array manipulation, and iteration patterns
- **Functions**: Experience with multiple return values, variadic parameters, named returns, and function closures

**Key Learning Files**:
- `learning Path/learn_variables.go` - Variable declarations, constants, type conversion
- `learning Path/learn_operators.go` - Operators, conditionals, switch statements
- `learning Path/learn_loops.go` - Loop patterns, array operations

</details>

<details>
<summary><h3>📖 Semester 2: Intermediate Concepts (Weeks 9-14)</h3></summary>

#### Data Structures & Object-Oriented Design

- **Slices & Maps**: Dynamic data structures, slice operations (append, copy, slicing), map manipulation and key-value storage patterns
- **Structs & Methods**: Custom type definitions, method receivers (value vs pointer), struct composition
- **Pointers**: Memory management, pointer dereferencing, understanding when to use pointers for efficiency and mutability
- **Interfaces**: Polymorphism in Go, interface satisfaction, type assertions, and the power of implicit implementation
- **Error Handling**: Go's explicit error handling pattern, custom error types, error wrapping, panic and recover mechanisms

**Key Learning Files**:
- `learning Path/learn_slices_maps.go` - Dynamic collections, CRUD operations on data structures
- `learning Path/learn_functions.go` - Struct methods, advanced function patterns
- `learning Path/learn_advanced.go` - Interfaces, pointers, custom errors, panic/recover

</details>

<details>
<summary><h3>📖 Semester 3: Advanced & Production-Ready Concepts (Weeks 15-20)</h3></summary>

#### Database Integration & Web Development

- **File I/O Operations**: Reading and writing files, file handling patterns, resource management with defer
- **JSON Serialization**: Struct tags, marshaling/unmarshaling, working with JSON data
- **CSV Processing**: Reading and writing CSV files, data import/export functionality
- **Database Integration**: MySQL connectivity, SQL query execution, prepared statements, connection pooling
- **REST API Development**: HTTP server implementation, routing with Gorilla Mux, request/response handling
- **Middleware Pattern**: Logger middleware, CORS handling, request preprocessing
- **MVC Architecture**: Separation of concerns with Models, Controllers, and Routes
- **API Design**: RESTful conventions, proper HTTP status codes, JSON response standardization

**Key Learning Files**:
- `learning Path/learn_file_json_db.go` - File operations, JSON/CSV handling, database CRUD

</details>

### 🎓 Learning Progression

This project represents a **structured learning path** through Go development:

1. **Foundation Phase** → Understanding Go syntax, types, and control structures
2. **Intermediate Phase** → Working with complex data structures, functions, and OOP concepts
3. **Advanced Phase** → Implementing real-world patterns like interfaces, error handling, and pointer usage
4. **Production Phase** → Building a complete REST API with database integration and clean architecture

Each phase is documented in the `learning Path/` directory with standalone executable examples demonstrating specific concepts.

---

---

## ✨ Key Features

<table>
<tr>
<td>

### 🏗️ Architecture
- Clean MVC pattern
- RESTful API design
- Middleware support
- Modular structure

</td>
<td>

### 🔒 Security
- SQL injection prevention
- Prepared statements
- Input validation
- CORS configuration

</td>
</tr>
<tr>
<td>

### 💾 Database
- MySQL integration
- Connection pooling
- Transaction support
- Efficient queries

</td>
<td>

### 📊 Data Management
- Full CRUD operations
- Search & filtering
- Data validation
- Standardized responses

</td>
</tr>
</table>

---

## 🛠️ Technology Stack

<div align="center">

| Category | Technology |
|----------|-----------|
| **Language** | ![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white) |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white) |
| **Router** | ![Gorilla Mux](https://img.shields.io/badge/Gorilla-Mux-00ADD8) |
| **Architecture** | MVC (Model-View-Controller) |
| **API Style** | RESTful |

**Core Dependencies:**
```go
github.com/gorilla/mux v1.8.1          // HTTP router
github.com/go-sql-driver/mysql v1.9.3  // MySQL driver
golang.org/x/text v0.34.0              // Text processing
```

</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
✓ Go 1.21 or higher
✓ MySQL 5.7+ or 8.0+ (XAMPP recommended for Windows)
✓ Git
```

### Installation

**1️⃣ Clone the repository**
```bash
git clone https://github.com/HHHAAAANNNNN/go-commerce-backend.git
cd go-commerce-backend
```

**2️⃣ Install dependencies**
```bash
go mod download
go mod tidy
```

**3️⃣ Set up the database**

Start your MySQL server (via XAMPP or standalone), then create the database:

```sql
CREATE DATABASE go_commerce;
USE go_commerce;
```

Execute the following schema scripts:

<details>
<summary>📊 Click to expand database schema</summary>

```sql
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    balance INT DEFAULT 0,
    is_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id INT NOT NULL,
    total INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

</details>

**4️⃣ Configure database connection**

Edit `config/database.go` if your MySQL credentials differ:

```go
// Default DSN (root user with no password)
dsn := "root:@tcp(localhost:3306)/go_commerce?parseTime=true"

// If you have a password, update it like this:
dsn := "root:yourpassword@tcp(localhost:3306)/go_commerce?parseTime=true"
```

**5️⃣ Run the application**

```bash
go run main.go
```

You should see:
```
╔═══════════════════════════════════════╗
║   GO-COMMERCE REST API SERVER        ║
╚═══════════════════════════════════════╝

🚀 Server starting on http://localhost:8080
...
⏳ Server is running... Press Ctrl+C to stop
```

**6️⃣ Test the API**

```bash
# Health check
curl http://localhost:8080/api/health
```

✅ You're all set! The API is now running at `http://localhost:8080`

---

## 📁 Project Structure

```
go-commerce-backend/
│
├── 📄 main.go                      # Application entry point & server initialization
│
├── 📂 config/
│   └── database.go                 # Database connection & configuration
│
├── 📂 models/
│   ├── user.go                     # User data model & database operations
│   ├── product.go                  # Product data model & database operations
│   └── order.go                    # Order data model & database operations
│
├── 📂 controllers/
│   ├── user_controller.go          # User business logic & HTTP handlers
│   └── product_controller.go       # Product business logic & HTTP handlers
│
├── 📂 routes/
│   └── routes.go                   # API route definitions & middleware setup
│
├── 📂 middlewares/
│   └── middleware.go               # Logger, CORS, and request processing
│
├── 📂 utils/
│   └── response.go                 # Standardized JSON response helpers
│
└── 📂 learning Path/               # Tutorial files documenting learning journey
    ├── learn_variables.go          # Variables & data types
    ├── learn_operators.go          # Operators & control flow
    ├── learn_loops.go              # Loops & arrays
    ├── learn_slices_maps.go        # Slices & maps
    ├── learn_functions.go          # Functions & structs
    ├── learn_advanced.go           # Pointers, interfaces, errors
    └── learn_file_json_db.go       # File I/O, JSON, database
```

---

## 🌐 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check server status |

### 👥 User Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/users` | Get all users | - |
| `GET` | `/api/users/{id}` | Get user by ID | - |
| `POST` | `/api/users` | Create new user | `{"name": "string", "email": "string", "balance": int, "is_member": bool}` |
| `PUT` | `/api/users/{id}` | Update user | `{"name": "string", "email": "string", "balance": int, "is_member": bool}` |
| `DELETE` | `/api/users/{id}` | Delete user | - |

### 📦 Product Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/products` | Get all products | - |
| `GET` | `/api/products/{id}` | Get product by ID | - |
| `GET` | `/api/products/search?q={keyword}` | Search products | - |
| `POST` | `/api/products` | Create new product | `{"id": "string", "name": "string", "price": int, "stock": int, "category": "string"}` |
| `PUT` | `/api/products/{id}` | Update product | `{"name": "string", "price": int, "stock": int, "category": "string"}` |
| `DELETE` | `/api/products/{id}` | Delete product | - |

---

## 🗄️ Database Schema

<details open>
<summary><b>Users Table</b></summary>

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    balance INT DEFAULT 0,
    is_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
</details>

<details open>
<summary><b>Products Table</b></summary>

```sql
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
</details>

<details open>
<summary><b>Orders Table</b></summary>

```sql
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id INT NOT NULL,
    total INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);
```
</details>

<details open>
<summary><b>Order Items Table</b></summary>

```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```
</details>

### 📊 Entity Relationship

```
users (1) ──────< (N) orders (1) ──────< (N) order_items (N) >────── (1) products
```

---

## Installation & Setup

*See the [Quick Start](#-quick-start) section above for detailed installation instructions.*

## 💡 API Usage Examples

### Health Check

**Request:**
```bash
curl http://localhost:8080/api/health
```

**Response:**
```json
{
  "status": "success",
  "message": "Server is running"
}
```

---

### Get All Users

**Request:**
```bash
curl http://localhost:8080/api/users
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "balance": 5000000,
      "is_member": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create a New User

**Request:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "balance": 3000000,
    "is_member": false
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "balance": 3000000,
    "is_member": false
  }
}
```

---

### Get Product by ID

**Request:**
```bash
curl http://localhost:8080/api/products/LAP001
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "LAP001",
    "name": "Gaming Laptop",
    "price": 15000000,
    "stock": 10,
    "category": "Electronics",
    "rating": 4.5,
    "created_at": "2024-01-10T08:00:00Z"
  }
}
```

---

### Search Products

**Request:**
```bash
curl "http://localhost:8080/api/products/search?q=laptop"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "LAP001",
      "name": "Gaming Laptop",
      "price": 15000000,
      "stock": 10,
      "category": "Electronics",
      "rating": 4.5
    },
    {
      "id": "LAP002",
      "name": "Business Laptop",
      "price": 8000000,
      "stock": 25,
      "category": "Electronics",
      "rating": 4.2
    }
  ]
}
```

---

### Update Product

**Request:**
```bash
curl -X PUT http://localhost:8080/api/products/LAP001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop Pro",
    "price": 18000000,
    "stock": 8,
    "category": "Electronics"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Product updated successfully"
}
```

---

### Delete User

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/users/2
```

**Response:**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Key Features Implemented

### 1. 🎨 RESTful API Design
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Meaningful endpoint naming conventions
- Appropriate HTTP status codes (200, 201, 400, 404, 500)
- JSON request/response format

### 2. 🗄️ Database Integration
- Connection pooling for efficiency
- Prepared statements to prevent SQL injection
- Transaction support for data integrity
- Proper error handling for database operations

### 3. 🔧 Middleware Chain
- Request logging for debugging and monitoring
- CORS support for cross-origin requests
- Extensible middleware pattern for future additions (authentication, rate limiting, etc.)

### 4. 🏛️ Clean Architecture
- Separation of concerns (MVC pattern)
- Reusable components (utils, models)
- Modular design for easy maintenance and testing
- Consistent error handling across the application

### 5. 📊 Data Management
- CRUD operations for all entities
- Search and filter capabilities
- Data validation at controller level
- Standardized JSON responses

---

## Learning Progression

This project represents a structured learning path through Go development:

1. **Foundation Phase**: Understanding Go syntax, types, and control structures
2. **Intermediate Phase**: Working with complex data structures, functions, and OOP concepts
3. **Advanced Phase**: Implementing real-world patterns like interfaces, error handling, and pointer usage
4. **Production Phase**: Building a complete REST API with database integration and clean architecture

Each phase is documented in the `learning Path/` directory with standalone executable examples demonstrating specific concepts.

## 💻 Technical Highlights

<table>
<tr>
<td width="50%">

### Type Safety
✓ Leveraging Go's static typing  
✓ Compile-time error detection  
✓ Strong type system

### Error Handling
✓ Following Go idioms  
✓ Explicit error management  
✓ Robust error propagation

### Interface-Based Design
✓ Flexible architecture  
✓ Testable code patterns  
✓ Polymorphic implementations

</td>
<td width="50%">

### Pointer Efficiency
✓ Performance optimization  
✓ Memory management  
✓ Controlled mutability

### Concurrency Ready
✓ Goroutine-friendly design  
✓ Scalable architecture  
✓ Concurrent processing support

### Database Best Practices
✓ Connection pooling  
✓ Prepared statements  
✓ Resource cleanup (defer)

</td>
</tr>
</table>

---

## 🔧 Configuration

### Environment Variables

Currently, the application uses hardcoded configuration in `config/database.go`. For production deployments, consider using environment variables:

```go
// Recommended configuration structure
dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
    os.Getenv("DB_USER"),      // default: "root"
    os.Getenv("DB_PASSWORD"),  // default: ""
    os.Getenv("DB_HOST"),      // default: "localhost"
    os.Getenv("DB_PORT"),      // default: "3306"
    os.Getenv("DB_NAME"),      // default: "go_commerce"
)
```

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DB_HOST` | `localhost` | MySQL host address |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `` | Database password |
| `DB_NAME` | `go_commerce` | Database name |

---

## 🛠️ Development Environment

### Recommended Tools

| Tool | Purpose | Link |
|------|---------|------|
| **Visual Studio Code** | Primary IDE | [Download](https://code.visualstudio.com/) |
| **Go Extension** | Go language support | [Install](https://marketplace.visualstudio.com/items?itemName=golang.go) |
| **XAMPP** | Local MySQL server | [Download](https://www.apachefriends.org/) |
| **Postman** | API testing | [Download](https://www.postman.com/) |
| **Git** | Version control | [Download](https://git-scm.com/) |

### Useful VS Code Extensions

```json
{
  "recommendations": [
    "golang.go",
    "humao.rest-client",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker"
  ]
}
```

### Development Workflow

1. **Code** → Write/modify code
2. **Format** → `go fmt ./...`
3. **Lint** → `go vet ./...`
4. **Test** → `go test ./...`
5. **Run** → `go run main.go`

---

## 🚧 Future Enhancements

<table>
<tr>
<td width="50%">

### 🔐 Security
- [ ] JWT authentication
- [ ] Role-based authorization
- [ ] API key management
- [ ] Password encryption

### 🧪 Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoint testing
- [ ] Test coverage reports

### ⚡ Performance
- [ ] Response caching
- [ ] Database query optimization
- [ ] Rate limiting
- [ ] Request throttling

</td>
<td width="50%">

### 📊 Features
- [ ] Pagination support
- [ ] Advanced filtering
- [ ] Data export (CSV/Excel)
- [ ] Email notifications

### 🛠️ DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment
- [ ] Monitoring & logging

### 📖 Documentation
- [ ] Swagger/OpenAPI docs
- [ ] Postman collection
- [ ] Integration guides
- [ ] Video tutorials

</td>
</tr>
</table>

---

## 🐛 Troubleshooting

<details>
<summary><b>Database Connection Issues</b></summary>

**Problem:** `Error connecting to database`

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # For XAMPP users
   # Start XAMPP Control Panel and start MySQL
   
   # For Linux users
   sudo systemctl status mysql
   ```

2. Check database credentials in `config/database.go`:
   ```go
   dsn := "root:yourpassword@tcp(localhost:3306)/go_commerce?parseTime=true"
   ```

3. Ensure the database exists:
   ```sql
   SHOW DATABASES;
   CREATE DATABASE IF NOT EXISTS go_commerce;
   ```

4. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

</details>

<details>
<summary><b>Port Already in Use</b></summary>

**Problem:** `listen tcp :8080: bind: address already in use`

**Solutions:**
1. Find and kill the process using port 8080:
   ```bash
   # Linux/Mac
   lsof -i :8080
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

2. Or change the port in `main.go`:
   ```go
   port := ":3000"  // Use a different port
   ```

</details>

<details>
<summary><b>Module Dependencies Issues</b></summary>

**Problem:** `cannot find package` or module errors

**Solutions:**
1. Clean and reinstall modules:
   ```bash
   go clean -modcache
   go mod download
   go mod tidy
   ```

2. Verify Go version:
   ```bash
   go version  # Should be 1.21 or higher
   ```

</details>

<details>
<summary><b>CORS Errors</b></summary>

**Problem:** Frontend can't access the API due to CORS

**Solution:**
The middleware in `middlewares/middleware.go` already handles CORS. Ensure it's properly configured:
```go
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
```

</details>

<details>
<summary><b>JSON Parsing Errors</b></summary>

**Problem:** `invalid character` or JSON unmarshal errors

**Solutions:**
1. Validate JSON format using online validators
2. Ensure Content-Type header is set:
   ```bash
   curl -X POST http://localhost:8080/api/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Test", "email": "test@example.com"}'
   ```

</details>

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### How to Contribute

1. **Fork the Project**
   ```bash
   # Click the "Fork" button at the top right of this page
   ```

2. **Clone your Fork**
   ```bash
   git clone https://github.com/your-username/go-commerce-backend.git
   cd go-commerce-backend
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make your Changes**
   - Write clean, documented code
   - Follow Go conventions and best practices
   - Add tests if applicable

5. **Commit your Changes**
   ```bash
   git add .
   git commit -m "Add some AmazingFeature"
   ```

6. **Push to your Fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes in detail

### Contribution Guidelines

- 📝 Write clear commit messages
- 🧪 Add tests for new features
- 📖 Update documentation as needed
- 💡 Follow existing code style
- 🐛 Report bugs via GitHub Issues
- ⭐ Star the repo if you find it useful!

---

## 🙏 Acknowledgments

This project was developed as a **comprehensive learning exercise** to master Go programming through practical application development. The structured approach from fundamentals to advanced concepts demonstrates a methodical understanding of the language and its ecosystem.

Special thanks to:
- The Go community for excellent documentation and resources
- Gorilla toolkit for the robust HTTP router
- All contributors and supporters of this project

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 HHHAAAANNNNN

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Contact

<div align="center">

**HHHAAAANNNNN**

[![GitHub](https://img.shields.io/badge/GitHub-HHHAAAANNNNN-181717?style=for-the-badge&logo=github)](https://github.com/HHHAAAANNNNN)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your-email@example.com)

**Project Link:** [https://github.com/HHHAAAANNNNN/go-commerce-backend](https://github.com/HHHAAAANNNNN/go-commerce-backend)

---

### ⭐ Star this repo if you find it helpful!

<p align="center">Made with ❤️ and Go</p>

</div>
