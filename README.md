<div align="center">

# 🍕 OIBSIP — Oasis Infobyte Internship
### Web Development and Designing — Level 3 Project Showcase

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay%20(Test%20Mode)-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![JWT](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br />

<p align="center">
  <b>Developed by Rajender Mohan</b><br />
  <i>Oasis Infobyte Web Development and Designing Internship — Level 3 Task</i>
</p>

[Explore Level 3 Project Folder](./Web-Development-and-Designing-Level-3-Pizza-Delivery) •
[API Documentation](./Web-Development-and-Designing-Level-3-Pizza-Delivery/docs/API.md) •
[Report an Issue](https://github.com/RajenderMohanVerma/OIBSIP/issues)

---

</div>

## 📌 Executive Summary

This repository contains full-stack web applications engineered for the **Oasis Infobyte Internship Program (OIBSIP)** in the **Web Development and Designing** track.

The flagship application presented here is **Crust & Craft** — a production-ready, full-stack pizza ordering and delivery platform built to satisfy the **Level 3 Project Requirements**. It combines modern architectural patterns, enterprise-grade security, end-to-end payment processing in test mode, and a distinctive **Cinematic Dark Artistic Design System**.

---

## 📂 Repository Task Directory

| Level | Project | Directory Link | Tech Stack | Status |
|:---:|:---|:---|:---|:---:|
| **Level 3** | **Crust & Craft — Pizza Delivery Application** | [📂 Web-Development-and-Designing-Level-3-Pizza-Delivery](./Web-Development-and-Designing-Level-3-Pizza-Delivery) | React 18, Vite, Express, MongoDB, Razorpay | <kbd>Complete</kbd> ✅ |

---

## 🍕 Featured Application: Crust & Craft

> *"Good Pizza. Great Moments."*

**Crust & Craft** delivers a real-world e-commerce experience designed specifically for premium artisanal pizzerias. Rather than a static prototype, the platform is fully dynamic from database to client, featuring real-time menu queries, client-side state caching, tamper-proof server-side price revalidation, and an administrative control panel.

### 🎨 Visual Identity & Design System

The interface rejects generic cookie-cutter templates in favor of a **Cinematic Dark Artistic Theme**:

* 🖤 **Charcoal Black (`#171717`)**: Dominant canvas, header navigation, and structural layouts.
* 🌲 **Forest Green (`#06110C`)**: Ambient background contrast, hero surfaces, and subtle visual depth.
* 🔴 **Crimson Red (`#A31C18`)**: Primary action elements, call-to-actions, cart badges, and live timeline states.
* 🏛️ **Elevated Surfaces (`#101612`, `#1B211D`)**: Soft card layers with hairline borders (`#303832`).
* 🖋️ **Editorial Typography**:
  * **Brand Display:** `Limelight` and `Playfair Display` for cinematic headlines.
  * **Interface & Forms:** `Inter` for legibility across viewports.
  * **Financial & Order Codes:** `JetBrains Mono` for invoice clarity.

---

## 🚀 Key Functional Modules

### 1. 🍕 Customer Experience & Ordering Engine
* **Dynamic Menu & Filtering:** Live catalog fetching with vegetarian/non-vegetarian toggles, spice-level indicators, and category filtering.
* **Interactive Pizza Customizer:**
  * **Size Selection:** Small (+₹0), Medium (+₹80), Large (+₹160).
  * **Crust Choices:** Thin Crust, Classic Hand-Tossed, Cheese Stuffed (+₹60).
  * **Extra Toppings:** Real-time multi-select toppings (Mushrooms, Jalapeños, Olives, Extra Cheese, etc.).
  * **Kitchen Instructions:** Custom notes saved directly to order tickets.
* **Tamper-Proof Shopping Cart:** Client cart with local storage persistence and server-side recalculation to prevent price spoofing.
* **Coupon & Discount Engine:** Validation for promo codes such as `WELCOME20` (20% off), `FLAT50` (₹50 off), and `CRAFTDAY` (15% off).

### 2. 💳 Checkout & Payment Integration
* **Razorpay Payment Gateway (Test Mode):** Server creates cryptographic Razorpay orders; frontend launches native checkout modal; backend verifies HMAC-SHA256 signatures before confirming payment.
* **Cash on Delivery (COD):** Seamless alternative flow with immediate order confirmation.
* **Live 5-Stage Order Tracking:** Visual progress stepper updating states from `placed` ➔ `confirmed` ➔ `preparing` ➔ `out_for_delivery` ➔ `delivered`.

### 3. 🛡️ Security & Role-Based Access Control
* **Authentication:** JSON Web Tokens (JWT) with secure HTTP headers.
* **Password Hashing:** 12-round bcrypt salt protection.
* **Rate Limiting:** Express rate limiting protects sensitive authentication and payment endpoints against brute-force attacks.
* **Input Sanitization:** Mongoose validation schemas preventing NoSQL injection and payload pollution.

### 4. 📊 Administrative Operations Center
* **Metrics & Analytics:** Real-time calculation of total revenue, order counts, customer registrations, and pending deliveries.
* **Order Pipeline Management:** Admin interface to advance order states, inspect customer notes, and review payment transaction IDs.
* **Menu Management (CRUD):** Live creation, price updates, topping management, and stock toggles for menu items.
* **Customer Directory:** Inspect registered user accounts and their order histories.

---

## 🛠️ Technology Architecture

```text
[ Client (React 18 + Vite) ]
          │
          ▼  HTTPS / REST API
[ Express.js API Gateway & Middleware ]
  ├── CORS & Helmet Headers
  ├── Rate Limiters (Auth / API)
  ├── JWT Auth & Role Guard
  └── Error Handling & Winston Logging
          │
          ├──► [ Razorpay Test Gateway (Order & Signature Verification) ]
          │
          ▼
[ MongoDB Database (Mongoose ODM) ]
  ├── Users (Auth, Addresses, Roles)
  ├── Pizzas (Sizes, Crusts, Pricing, In-stock)
  ├── Orders (Snapshots, Delivery, Status, Razorpay ID)
  └── Coupons (Codes, Discounts, Expiry)
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **MongoDB** (local community server running at `mongodb://localhost:27017` or MongoDB Atlas URI)
* **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/RajenderMohanVerma/OIBSIP.git
cd OIBSIP/Web-Development-and-Designing-Level-3-Pizza-Delivery
```

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment configuration
cp .env.example .env

# Populate sample data (12 Pizzas, 3 Coupons, Admin & Customer accounts)
npm run seed

# Start Express server in development mode
npm run dev
# Server running at: http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start Vite development server
npm run dev
# Client running at: http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@crustandcraft.dev` | `Admin@123456` | Full Admin Console, Menu CRUD, Status Transitions |
| **Customer** | `customer@demo.com` | `Customer@123` | Ordering, Cart, Address Management, Order History |

---

## 🧪 Testing & Code Quality

Automated integration tests ensure reliability for critical application workflows:

```bash
cd server
npm test
```

Covers:
* User registration and authentication workflows
* Menu fetching and query filtering
* Order creation and server-side pricing validations
* Razorpay payment order initiation and signature validation

---

## 📬 Contact & Acknowledgements

* **Developer:** Rajender Mohan ([GitHub Profile](https://github.com/RajenderMohanVerma))
* **Program:** [Oasis Infobyte](https://oasisinfobyte.com/) Internship Program
* **Domain:** Web Development and Designing (Level 3 Task)

---

<div align="center">
  <sub>Built with precision for the Oasis Infobyte Internship • 2026</sub>
</div>
