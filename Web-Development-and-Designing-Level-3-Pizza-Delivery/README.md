# 🍕 Crust & Craft — Full-Stack Pizza Delivery Application

> **"Good Pizza. Great Moments."**  
> *Developed for the Oasis Infobyte Web Development and Designing Internship — Level 3*  
> **Developer:** Rajender Mohan  
> **Repository Name:** `OIBSIP`  
> **Level 3 Project Folder:** `Web-Development-and-Designing-Level-3-Pizza-Delivery`

---

## 📸 Visual Identity & Design System

The application features a **Premium Dark Artistic Theme** inspired by cinematic editorial design:
* **Charcoal Black (`#171717`)**: Primary background, navigation, and structural surfaces.
* **Forest Green (`#06110C`)**: Hero background, content backdrops, and subtle depth accents.
* **Crimson Red (`#A31C18`)**: Primary action buttons, badges, live state indicators, and promotional highlights.
* **Warm Off-White (`#F5F1E9`)**: High-contrast, readable typography.
* **Muted Gray-Green (`#89928B` / `#B8C0B8`)**: Descriptions, micro-labels, and borders (`#303832`).

### Typography Hierarchy:
* **Display Headings:** `Limelight` & `Playfair Display` (64px–88px on hero, 36px–48px on sections)
* **Interface & Forms:** `Inter` (14px–17px body, 12px uppercase micro-labels)
* **Technical Details & Currency:** `JetBrains Mono`

---

## 🛠️ Mandatory Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA architecture, React Router v6, React Hot Toast, Context API |
| **Language** | JavaScript (ES6+) | Modern async/await, modular components |
| **Styling** | Responsive CSS3 | CSS Custom Properties (Variables), Flexbox, CSS Grid, mobile-first |
| **Backend** | Node.js + Express.js | Modular MVC REST API, CORS, Helmet, Winston logger, Morgan |
| **Database** | MongoDB + Mongoose | Schemas for Users, Pizzas, Orders, Coupons |
| **Authentication** | JWT + Bcrypt | 12-round salt hashing, Bearer token authorization, role-based access control |
| **Payment Gateway** | Razorpay (TEST MODE ONLY) | Server order creation, client checkout modal, HMAC-SHA256 signature verification |
| **Testing** | Jest + Supertest | Automated test coverage for Auth, Pizza catalog, and Payments |

---

## 🌟 Key Features

### 👤 Customer Experience:
1. **Cinematic Hero & Showcase:** Dynamic featured pizzas loaded live from MongoDB.
2. **Interactive Pizza Customizer:**
   * **Size Options:** Small (+₹0), Medium (+₹80), Large (+₹160)
   * **Crust Options:** Thin (+₹0), Classic (+₹20), Stuffed (+₹60)
   * **Toppings:** Extra Cheese, Mushrooms, Black Olives, Jalapeños, Paneer, Chicken
   * **Special Instructions:** Kitchen notes passed directly to the order record.
3. **Cart & Dynamic Pricing:**
   * Revalidates and recalculates authoritative prices on the backend.
   * Free delivery above ₹500, standard ₹40 delivery fee.
   * 5% GST tax calculation.
   * Demo promo coupon verification (`WELCOME20`, `FLAT50`, `CRAFTDAY`).
4. **Secure Checkout & Razorpay Test Mode:**
   * Customer details & delivery address validation.
   * Razorpay Test Mode modal checkout.
   * Cash on Delivery (COD) alternative.
5. **Live Order Tracking Timeline:**
   * 5-Stage visual progress: `Placed` → `Confirmed` → `In the Oven` → `Out for Delivery` → `Delivered`.
6. **Customer Portal:**
   * Personal dashboard with stats (total orders, active orders, total spend).
   * Order history with filtering and detailed receipts.
   * Profile management with saved delivery addresses.

### 🛡️ Administrative Console (`/admin`):
1. **Executive Metrics:** Total revenue, active kitchen queue, delivered orders, registered customer counts, top-selling pizzas.
2. **Live Order Management:** Search by reference, filter by status, inspect customer instructions, and update workflow stage in real time.
3. **Menu & Recipe Management:** Add new pizzas, edit prices and categories, toggle live availability (in-stock / sold-out), and delete items safely.
4. **Customer Directory:** Inspect registered accounts, order counts, and registration timestamps.

---

## 📂 Project Architecture

```
Web-Development-and-Designing-Level-3-Pizza-Delivery/
├── client/                      # React 18 + Vite Frontend
│   ├── public/                  # Favicon & Static assets
│   ├── src/
│   │   ├── assets/              # Images and icons
│   │   ├── components/
│   │   │   └── common/          # Navbar, Footer, PizzaCard, OrderStatusTimeline, ProtectedRoute
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── layouts/             # MainLayout, AdminLayout
│   │   ├── pages/               # HomePage, MenuPage, PizzaDetailPage, CartPage, CheckoutPage, etc.
│   │   │   └── admin/           # AdminDashboard, AdminOrders, AdminOrderDetail, AdminMenu, AdminCustomers
│   │   ├── services/            # Axios API client & service wrappers
│   │   ├── utils/               # Formatters & helper functions
│   │   ├── App.jsx              # Application routing table
│   │   ├── index.css            # Dark Artistic Theme Design Tokens & Global CSS
│   │   └── main.jsx             # React entry point
│   ├── .env.example             # Frontend environment variables template
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # MongoDB connection & env validator
│   │   ├── controllers/         # Auth, Pizza, Order, Payment, Admin controllers
│   │   ├── middleware/          # JWT auth, Admin check, Rate limiter, Error handler, Validation
│   │   ├── models/              # Mongoose models: User, Pizza, Order, Coupon
│   │   ├── routes/              # Express route declarations
│   │   ├── utils/               # Logger, AppError, ApiResponse
│   │   ├── __tests__/           # Jest & Supertest automated test suites
│   │   ├── app.js               # Express application configuration
│   │   ├── seed.js              # Database seed script (12 pizzas, coupons, demo users)
│   │   └── server.js            # Server entry point
│   ├── .env.example             # Backend environment variables template
│   ├── jest.config.js
│   └── package.json
├── docs/                        # Project Documentation
│   ├── API.md                   # Full REST API specification
│   └── screenshots/             # Interface captures
├── package.json                 # Monorepo root scripts (concurrently)
└── README.md                    # Project documentation
```

---

## 🚀 Quick Setup & Installation

### Prerequisites:
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Install All Dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate to `server` and `client` individually and run `npm install`)*

### 2. Configure Environment Variables
Copy the `.env.example` files to `.env`:

**In `server/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crust-and-craft
JWT_SECRET=crust_craft_super_secret_dev_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder
ADMIN_EMAIL=admin@crustandcraft.dev
ADMIN_PASSWORD=Admin@123456
NODE_ENV=development
```

**In `client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder_key
VITE_APP_NAME=Crust & Craft
```

### 3. Seed Database
Populates the database with 12 handcrafted pizzas, 3 demo coupons, and pre-configured testing accounts:
```bash
npm run seed
```

### 4. Run Application
Run both frontend and backend concurrently:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000/api`
* **API Health Check:** `http://localhost:5000/health`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@crustandcraft.dev` | `Admin@123456` | Full Admin Console (`/admin`) + Menu + Order Management |
| **Demo Customer** | `customer@demo.com` | `Customer@123` | Ordering, Cart, Checkout, Dashboard, Profile |

> *Tip: The Login page provides one-click helper buttons to auto-fill these demo credentials.*

---

## 🎟️ Active Demo Coupons

| Coupon Code | Discount | Terms |
|---|---|---|
| `WELCOME20` | 20% OFF (Max ₹100) | Min. order ₹299 |
| `FLAT50` | Flat ₹50 OFF | Min. order ₹499 |
| `CRAFTDAY` | 15% OFF (Max ₹80) | Min. order ₹399 |

---

## 💳 Razorpay Test Mode Workflow

1. During checkout, choose **"Razorpay Online Payment (Test Mode)"**.
2. Click **"Pay via Razorpay"** — the server generates an order reference and calculates the authorized amount in paise.
3. Razorpay Checkout modal opens. In test mode, you can test with:
   * **UPI:** Enter any test VPA (e.g. `success@razorpay`)
   * **Cards:** Any standard Razorpay test card number (e.g., `4111 1111 1111 1111`, expiry in future, any 3-digit CVV)
4. Razorpay sends the signed payload back to the client.
5. The frontend transmits `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature` to `POST /api/payments/verify`.
6. The backend verifies the HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`. **Payment is marked paid only after server verification.**

---

## 🧪 Testing

To run backend automated tests:
```bash
npm run test:server
```
Tests cover:
* Customer registration & password strength validation.
* JWT authentication & unauthorized access prevention.
* Role-based authorization for administrative routes.
* Pizza catalog queries & admin CRUD permissions.
* Payment order creation & graceful degradation without gateway keys.

---

## 📄 Submission Checklist (Oasis Infobyte Level 3)

- [x] Complete Full-Stack Implementation (React + Node.js + Express + MongoDB).
- [x] Tested Authentication (Bcrypt + JWT + Role-based Admin).
- [x] Dynamic Pizza Customization (Size, Crust, Extra Toppings).
- [x] Server-Validated Shopping Cart with Coupons and Delivery Rules.
- [x] Razorpay Test Gateway Integration with Backend Cryptographic Verification.
- [x] Real-time Order Tracking Timeline (5 Stages).
- [x] Customer Dashboard & Order History.
- [x] Complete Administrative Management Console.
- [x] Premium Dark Artistic Visual Redesign (Charcoal `#171717`, Forest `#06110C`, Crimson `#A31C18`).
- [x] Responsive on Mobile, Tablet, and Desktop.
- [x] Clean Git Structure & Complete Documentation.

---

*Built with passion for the Oasis Infobyte Web Development & Designing Internship.*
