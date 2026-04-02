<div align="center">
  <div>
    <img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white" /> 
    <img src="https://img.shields.io/badge/-Express_5-000000?style=for-the-badge&logo=Express&logoColor=white" /> 
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white" />
    <br/>
    <img src="https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white" /> 
    <img src="https://img.shields.io/badge/-Mongoose-880000?style=for-the-badge&logo=Mongoose&logoColor=white" /> 
    <img src="https://img.shields.io/badge/-Zod-3E67B1?style=for-the-badge&logo=Zod&logoColor=white" />
    <br/>
    <img src="https://img.shields.io/badge/-JWT-000000?style=for-the-badge&logo=JSON%20Web%20Tokens&logoColor=white" />
    <img src="https://img.shields.io/badge/-Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white" />
    <img src="https://img.shields.io/badge/-Winston-FFCC00?style=for-the-badge&logo=Winston&logoColor=black" />
  </div>
</div>

# Restaurant Management System API

> **Production-Grade Restaurant Backend** — A fully-featured REST API for managing tables, reservations, complex order lifecycles, and atomic raw material inventory deductions. Built with modern best practices, concurrency control, and highly robust structural architecture.

A comprehensive backend solution designed for the fast-paced restaurant environment. This system goes beyond basic CRUD operations by implementing real-world concurrency management, atomic database transactions for orders, automated raw ingredient inventory tracking, and complex relationship mapping between dishes and their required ingredients.

---

## 🎯 What This Project Does

The Restaurant Management System API is a complete backend solution that enables:

- **Order & Inventory Syncing**: Placing an order automatically and atomically calculates and deducts the exact raw materials required for each dish in real-time.
- **Table Reservation Management**: Secure, race-condition-proof table booking and real-time status tracking (available, reserved, occupied).
- **Menu & Ingredients Linking**: Advanced schema mapping connecting final menu items to multiple raw inventory items (with specific measurement units like kg, grams, litres).
- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin/Staff/User).
- **Data Validation & Integrity**: Multi-level Zod validation and Mongoose transactions to ensure database consistency.
- **Media Management**: Upload and manage menu item banners seamlessly via Cloudinary integration.

---

## ✨ Key Features

### 🔐 Security & Authentication
- **Dual JWT Token System**: Short-lived access tokens and secure refresh tokens via HTTP-only cookies.
- **Role-Based Authorization**: Granular operational access for Admins and standard Users.
- **Concurrency Control**: Prevents double-booking of tables using atomic MongoDB operators locking table availability during booking.
- **Rate Limiting & Security Headers**: Express rate limiting and Helmet.js to prevent brute force and ensure secure HTTP standards.
- **CORS Protection**: Whitelisted origin limits to secure endpoints.

### 📋 Advanced Business Logic
- **Atomicity & Acid Transactions**: Mongoose `session.withTransaction` guarantees that an Order is never placed unless the inventory is successfully deducted simultaneously.
- **Formula-based Inventory**: Real-time multi-document aggregations map an Array of Orders => Recipe Ingredients => Database Inventory Deductions.
- **Automated Restocking Alerts**: Dynamically tracks items globally and switches `isLowStock` boolean triggers if ingredients fall beneath min thresholds.
- **Status Lifecycle State Machine**: Order status tracking enforcing correct chronological operational transitions (`pending` -> `preparing` -> `served`).
- **Graceful Error Handling & Rollbacks**: Catch blocks instantly abort transactions if there's insufficient stock or duplicate booking requests.

### 🛠️ Developer Experience
- **TypeScript First**: Full strict type safety with custom `@/types` and path aliases mapped throughout the project.
- **Zod Schemas Validation**: Extensive pre-route validation ensuring the controller logic is executed strictly on sanitized, predictable typed inputs.
- **Structured Debugging**: Winston tracking production-level error traces, requests logging, and system health status.
- **Clean Architecture Mapping**: Clear structural separation into models, controllers, routers, config, custom lib helpers, and validations.

---

## 📊 API Endpoints Overview

### **Authentication** (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Register a new user/admin | ❌ |
| POST | `/login` | Authenticate & receive tokens | ❌ |
| POST | `/refresh-token` | Regenerate access token | ❌ |
| POST | `/logout` | Invalidate active session | ✅ |

### **Tables & Reservations** (`/api/v1/tables` & `/api/v1/reservations`)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/tables` | Create a new table | Admin |
| GET | `/tables` | Get all table statuses | User/Admin |
| POST | `/reservations/:tableId` | Atomically reserve a specific table | User/Admin |
| DELETE | `/reservations/:id` | Cancel reservation (frees table) | User/Admin |

### **Menu Items** (`/api/v1/menuItems`)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Create new dish & upload banner | Admin |
| GET | `/` | List available menu items | User/Admin |
| PUT | `/:menuItemId` | Update dish details | Admin |

### **Orders** (`/api/v1/orders`)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Create order & trigger inventory deduction | User/Admin |
| GET | `/` | View orders | User/Admin |
| PATCH | `/:orderId/status` | Update status (e.g. `served`, frees table) | Admin |

### **Inventory & Ingredients** (`/api/v1/inventory`)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Add raw material (kg, L, pieces) | Admin |
| POST | `/ingredients` | Link an inventory item to a menu item (Recipe) | Admin |
| PATCH | `/:itemId/restock` | Restock specific inventory item | Admin |
| GET | `/` | View inventory and check low-stock triggers | Admin |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB instance (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mine0059/Apexcifytechnologys_restaurant_management_system.git
cd Apexcifytechnologys_restaurant_management_system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/restaurant-management-system

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Security / Admins
WHITELIST_ORIGINS=http://localhost:5173
WHITELIST_ADMINS_MAIL=admin@admin.com

# Logging
LOG_LEVEL=debug
```

4. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── controllers/v1/          # Business logic handlers
│   ├── auth/                
│   ├── inventory/           # Complex inventory transactions
│   ├── menuItem/            
│   ├── order/               # Order lifecycle & deductions
│   ├── reservation/         # Concurrency control booking
│   └── table/               
├── models/                  # Mongoose NoSQL Schemas
│   ├── inventoryItem.ts
│   ├── menuItem.ts
│   ├── menuItemIngredient.ts# Relational Join Collection
│   ├── order.ts
│   ├── reservation.ts
│   ├── table.ts
│   └── user.ts
├── routes/v1/               # Express Route Definitions
├── middlewares/             # Security Layer
│   ├── authenticated.ts     # Token verification
│   ├── authorize.ts         # RBAC
│   ├── validate.ts          # Zod validation injector
│   └── uploadMenuItemBanner.ts
├── validations/             # Strict Zod Schemas
├── lib/                     # Utils & Third-Party Drivers
│   ├── inventory.ts         # Order Deduction Engine Matrix
│   ├── mongoose.ts
│   ├── cloudinary.ts
│   └── winston.ts
└── server.ts                # App Entry Point
```

---

## 🧪 Testing

For manual testing, standard HTTP clients such as Postman, Insomnia, or a `.http` REST Client file in VS Code can hit the development server routes detailed above.

---

## 🔒 The Inventory Deduction Engine (lib/inventory.ts)
The crowning feature of this backend is its non-relational database transaction control. When an order is placed:
1. Mongoose opens an ACID Session.
2. The Table status changes atomically. 
3. The system maps the array of Menu Items ordered directly to the `MenuItemIngredient` join collection to resolve recipes.
4. It performs parallel calculations checking `quantityNeeded` vs `orderQuantity`. 
5. It runs a `Promise.all` update deducting fractional components representing actual restaurant food preparation.
6. The entire Order commits—or the session violently aborts and throws an expected error if it faults.

---

## 📚 Technology Stack

| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | Runtime Environment | 18+ |
| **Express** | Web Framework | 5.2.1 |
| **TypeScript** | Type Safety | 5.9.3 |
| **MongoDB** | NoSQL Database | Latest |
| **Mongoose** | ODM / Transaction Driver | 9.3.3 |
| **Zod** | Schema Validation | 4.3.6 |
| **JWT** | Authentication | 9.0.3 |
| **Bcrypt** | Password Hashing | 6.0.0 |
| **Cloudinary** | Image Storage | 2.9.0 |
| **Winston** | Tracking & Diagnostics | 3.19.0 |
| **Helmet** | HTTP Security Guard | 8.1.0 |
| **Express Rate Limit** | Flood Prevention | 8.3.1 |
| **Multer** | Multipart Form Data | 2.1.1 |

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the LICENSE file for details.

**© 2026 Oghenemine Emmanuel** - All rights reserved.

---

## 👨‍💻 Author

**Oghenemine Emmanuel**
- Developing scalable, secure REST APIs with Node.js and TypeScript
- Focus on database transactional integrity and real-world software architecture.
