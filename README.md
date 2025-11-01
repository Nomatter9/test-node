# Products Node.js API with MySQL

A simple REST API for managing products using Node.js, Express, and MySQL.

## Features

- Create, Read, Update, and Delete products (CRUD operations)
- MySQL database integration
- RESTful API endpoints
- CORS enabled
- Environment variables for configuration

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   
   Run the SQL setup file to create the database and table:
   ```bash
   mysql -u root -p < setup.sql
   ```
   
   Or manually run the SQL commands in your MySQL client.

4. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=products_db
   PORT=3000
   ```

## Running the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Get all products
```
GET /api/products
```

### Get single product
```
GET /api/products/:id
```

### Create product
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "quantity": 10
}
```

### Update product
```
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 149.99,
  "quantity": 5
}
```

### Delete product
```
DELETE /api/products/:id
```

## Testing the API

You can test the API using:
- **curl** (command line)
- **Postman**
- **Thunder Client** (VS Code extension)
- **Your frontend application**

### Example curl commands:

**Get all products:**
```bash
curl http://localhost:3000/api/products
```

**Create a product:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"A test product","price":49.99,"quantity":5}'
```

**Update a product:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product","description":"Updated description","price":59.99,"quantity":10}'
```

**Delete a product:**
```bash
curl -X DELETE http://localhost:3000/api/products/1
```

## Database Schema

**products table:**
- `id` - INT (Primary Key, Auto Increment)
- `name` - VARCHAR(255) (Required)
- `description` - TEXT (Optional)
- `price` - DECIMAL(10,2) (Required)
- `quantity` - INT (Default: 0)
- `created_at` - TIMESTAMP (Auto-generated)
- `updated_at` - TIMESTAMP (Auto-updated)

## Project Structure

```
products-app/
├── server.js         # Main application file
├── db.js            # Database configuration
├── package.json     # Dependencies and scripts
├── .env.example     # Environment variables template
├── .env             # Your environment variables (create this)
├── setup.sql        # Database setup script
└── README.md        # This file
```

## Common Issues

1. **Database connection fails:**
   - Check your MySQL credentials in `.env`
   - Ensure MySQL server is running
   - Verify the database exists

2. **Port already in use:**
   - Change the PORT in your `.env` file
   - Or stop the process using port 3000

3. **Module not found:**
   - Run `npm install` to install all dependencies

## Next Steps

You can extend this application with:
- Input validation (using express-validator)
- Authentication (JWT)
- Pagination for product listing
- Image upload for products
- Search and filtering
- Database migrations

## License

ISC
