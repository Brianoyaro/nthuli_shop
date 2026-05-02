# Nthuli Shop Backend (Node.js)

Node.js/Express.js implementation of the Nthuli Shop backend using Sequelize ORM and MySQL.

## Prerequisites

- Node.js 14+
- MySQL 5.7+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials (default: root/root)

## Database Setup

1. Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE nthuli_shop;
EXIT;
```

2. Run migrations and seeders:
```bash
npm run migrate
npm run seed
```

This will:
- Create all required tables (Users, Categories, Products, ProductImages, Payments)
- Seed the 4 required product categories (SHOES, FURNITURE, CLOTHES, KITCHEN_APPLIANCES)

## Development

Start development server with hot reload:
```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Production

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Products
- `GET /api/products` - Get all products grouped by type
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/products` - Get products by category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

## Product Types and Attributes

### Shoes
- Gender: male, female, unisex
- Material: leather, converse, sneakers

### Furniture
- Type: Bed, Sofas, Dining Set, Dining Table, Dining Chair, Home Other (HOME category)
       Office Chair, Boardroom Table, Workstation, Office Sofa, Office Desk, Office Other (OFFICE category)
- Material: wood, plastic, metal

### Clothes
- Type: Shirt, T-shirt, Dress, Skirt, Short, Trouser, Jacket, Vest, Sweaters
- Gender: male, female, unisex
- Material: cotton, wool, polyester

### Kitchen Appliances
- Function: cutting, serving, cooking, other

## File Upload

- Max file size: 20MB
- Allowed types: JPEG, PNG, GIF, WebP
- Files stored in `uploads/` directory
- Filenames are UUIDs with original extension preserved

## Authentication

- JWT-based authentication
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Password hashing with bcrypt (10 rounds)
- Admin role required for product/category management
