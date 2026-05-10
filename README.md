# Farmify — Modular Backend Architecture
**Production-Ready Modular Structure**

Farmify is a full-stack agriculture support platform built with Node.js, Express, SQLite, and Gemini AI. This repository contains the modularized backend.

## 📂 Project Structure
```text
src/
├── app.js               # Express application and middleware setup
├── server.js            # Entry point with graceful shutdown handling
├── config/              # Configuration (DB, AI, Env)
├── controllers/         # Business logic modules (Auth, Marketplace, AI, etc.)
├── routes/              # Route aggregators (Flattened for frontend compatibility)
├── middleware/          # Security, Auth, Validation, Rate Limiting
├── utils/               # Database helpers and utilities
└── uploads/             # Static file storage
```

## 🚀 Quick Start

### 1. Install dependencies
```powershell
npm install
```

### 2. Setup environment
Create a `.env` file in the root directory:
```text
PORT=3004
JWT_SECRET=your_secure_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHER_API_KEY=your_weather_api_key_here
```

### 3. Start server 
```powershell
# Development (with nodemon)
npm run dev

# Production
npm start
```

### 4. Verify
```powershell
curl http://localhost:3004/api/health
```

---

## 🔐 Authentication System

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | ❌ | Register `{name, email, password, role?}` |
| POST | `/api/auth/login` | ❌ | Login `{email, password}` |
| POST | `/api/auth/logout` | ✅ | Blacklist current token |
| GET | `/api/auth/me` | ✅ | Get current user data |
| POST | `/api/auth/change-password` | ✅ | Update password |

---

## 🛰️ API Reference

### 👤 Profile & Dashboard
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/profile` | ✅ | Get user + farm profile |
| PUT | `/api/profile` | ✅ | Update profile fields |
| GET | `/api/dashboard/stats` | ✅ | Get aggregate statistics |
| GET | `/api/dashboard/overview` | ✅ | Get farm management overview |
| PUT | `/api/dashboard/overview` | ✅ | Update farm management overview |
| GET | `/api/weather` | ❌ | Get weather (default: Bhopal) |
| GET | `/api/mandi` | ❌ | Get live market prices |

### 🌾 Marketplace
| Method | Route | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/marketplace` | ❌ | Any | Browse products |
| POST | `/api/marketplace` | ✅ | farmer | List a new product |
| GET | `/api/marketplace/farmer` | ✅ | farmer | View your listings |
| PUT | `/api/marketplace/:id` | ✅ | farmer | Edit product |
| DELETE | `/api/marketplace/:id` | ✅ | farmer | Delete product |

### 🛒 Cart
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/cart` | ✅ | View cart items |
| POST | `/api/cart` | ✅ | Add to cart `{product_id, quantity}` |
| PUT | `/api/cart/:id` | ✅ | Update quantity |
| DELETE | `/api/cart/:id` | ✅ | Remove item |
| DELETE | `/api/cart` | ✅ | Clear cart |

### 📦 Orders & Payments
| Method | Route | Auth | Description |
| :--- | :--- | : :--- | :--- |
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders/buyer` | ✅ | Purchase history |
| GET | `/api/orders/farmer` | ✅ | Sales orders (Farmer role) |
| PUT | `/api/orders/status` | ✅ | Update status (Farmer role) |
| POST | `/api/orders/cancel` | ✅ | Cancel order |
| POST | `/api/payments/process` | ✅ | Process payment |

### 🤖 AI & Tools
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/ai/chat` | ✅ | Chat with Krishi AI |
| GET | `/api/ai/chat/history` | ✅ | Get user chat history |
| POST | `/api/ai/scan-plant` | ✅ | Analyze plant disease/health |
| POST | `/api/soil/recommend` | ❌ | Crop recommendations (Parameters) |
| POST | `/api/soil/fertilizer-guide` | ❌ | Fertilizer schedule & guide |

### 🏘️ Community & Advisories
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/advisories` | ❌ | Browse news and crop alerts |
| POST | `/api/advisories` | ✅ | Post advisory (Expert role) |
| GET | `/api/community/posts` | ❌ | Community forum posts |
| POST | `/api/community/posts` | ✅ | Create forum post |
| GET | `/api/community/orgs` | ❌ | List farming organizations |

### 📋 Subsidies & Machinery
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/subsidies` | ❌ | Browse government schemes |
| POST | `/api/subsidies/apply` | ✅ | Apply for a subsidy |
| GET | `/api/machinery` | ❌ | Browse rental machinery |
| POST | `/api/machinery/book` | ✅ | Book machinery |

---

## 🛠️ Built With
- **Node.js & Express** - Server Framework
- **SQLite3** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password Hashing
- **Google Gemini AI** - Intelligent Advisory
- **Express Rate Limit** - Security
