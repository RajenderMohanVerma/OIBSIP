# Crust & Craft — REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer token in `Authorization` header

---

## Authentication

### POST /auth/register
Create a new customer account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "phone": "+91 98765 43210"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
  }
}
```

**Validation errors (422):** Name 2-60 chars, valid email, password ≥8 chars with uppercase and number.

---

### POST /auth/login

**Request Body:**
```json
{ "email": "jane@example.com", "password": "SecurePass1" }
```

**Response 200:**
```json
{ "success": true, "data": { "token": "...", "user": { ... } } }
```

---

### GET /auth/me
**Requires auth.** Returns the authenticated user's profile.

---

### PATCH /auth/profile
**Requires auth.** Update name or phone.

---

### POST /auth/add-address
**Requires auth.**
```json
{ "label": "Home", "street": "123 Main St", "city": "Mumbai", "postalCode": "400001" }
```

### DELETE /auth/address/:addressId
**Requires auth.**

---

## Pizzas

### GET /pizzas
List pizzas. Supports query params:
- `search` – text search
- `category` – Classic | Veggie | Cheese Lovers | Spicy | BBQ | Specialty
- `isVeg` – true | false
- `sort` – `-popularity` | `basePrice` | `-basePrice`
- `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [ { "_id": "...", "name": "Margherita Classic", "basePrice": 199, ... } ],
  "pagination": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### GET /pizzas/featured
Returns up to 6 featured pizzas (no auth required).

### GET /pizzas/:id
Single pizza detail.

### POST /pizzas *(Admin only)*
Create a new pizza.

**Request Body:**
```json
{
  "name": "New Pizza",
  "description": "Delicious new creation",
  "category": "Specialty",
  "imageUrl": "https://...",
  "basePrice": 299,
  "isVeg": true,
  "isFeatured": false
}
```

### PATCH /pizzas/:id *(Admin only)*
Partial update of a pizza. Any pizza fields can be updated.

### DELETE /pizzas/:id *(Admin only)*

---

## Orders

### POST /orders/validate-cart
**Requires auth.** Server-side reprices cart items. Call before showing checkout totals.

**Request Body:**
```json
{
  "items": [
    {
      "pizzaId": "...",
      "size": "Medium",
      "crust": "Classic",
      "toppings": [{ "name": "Extra Cheese" }],
      "quantity": 2
    }
  ],
  "couponCode": "WELCOME20"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [ { "pizzaName": "...", "unitPrice": 319, "itemTotal": 638, ... } ],
    "subtotal": 638,
    "discountAmount": 100,
    "couponMessage": "Coupon applied! You save ₹100",
    "deliveryFee": 0,
    "taxAmount": 26.9,
    "totalAmount": 564.9
  }
}
```

### POST /orders
**Requires auth.** Create an order. Prices are recalculated server-side.

**Request Body:**
```json
{
  "items": [ { "pizzaId": "...", "size": "Large", "crust": "Stuffed", "toppings": [], "quantity": 1 } ],
  "deliveryAddress": {
    "name": "Jane Doe",
    "phone": "+91 98765 43210",
    "street": "123 Main St",
    "city": "Mumbai",
    "postalCode": "400001",
    "instructions": "Ring doorbell"
  },
  "paymentMethod": "razorpay",
  "couponCode": "FLAT50"
}
```

### GET /orders/my-orders
**Requires auth.** Returns the authenticated user's orders.
Query params: `page`, `limit`, `status`

### GET /orders/:id
**Requires auth.** Returns order detail. Customers can only access their own orders.

---

## Payments

### POST /payments/create-order
**Requires auth.** Creates a Razorpay order.

**Request Body:**
```json
{ "orderId": "<MongoDB Order ID>" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_...",
    "amount": 56490,
    "currency": "INR",
    "keyId": "rzp_test_...",
    "orderNumber": "CC-..."
  }
}
```

### POST /payments/verify
**Requires auth.** Verifies Razorpay payment signature. Marks order as paid only after successful verification.

**Request Body:**
```json
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "...",
  "orderId": "<MongoDB Order ID>"
}
```

### POST /payments/webhook
Razorpay webhook endpoint. Verifies signature using `RAZORPAY_WEBHOOK_SECRET`.
Handles `payment.captured` and `payment.failed` events.

---

## Admin (all require admin role)

### GET /admin/dashboard
Returns:
- `totalOrders`, `pendingOrders`, `completedOrders`
- `totalRevenue` (from delivered + paid orders)
- `totalCustomers`
- `popularPizzas` (top 5 by order count)
- `recentOrders` (last 10)

### GET /admin/orders
Query params: `page`, `limit`, `status`, `paymentStatus`, `search` (order number)

### GET /admin/orders/:id
Full order detail with customer info.

### PATCH /admin/orders/:id/status
Update order status.

**Request Body:**
```json
{ "status": "preparing", "note": "Kitchen started work" }
```

Valid statuses: `placed`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`

### GET /admin/customers
Query params: `page`, `limit`, `search` (name or email)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [ { "field": "email", "message": "Valid email required" } ]
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation |
| 401 | Unauthorized — token missing or invalid |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 503 | Service unavailable (e.g. Razorpay not configured) |

---

## Rate Limits

- Auth routes (`/api/auth/*`): **20 requests per 15 minutes** per IP
- All other API routes: **300 requests per 15 minutes** per IP

---

## Demo Coupon Codes

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| WELCOME20 | Percentage | 20% (max ₹100) | ₹299 |
| FLAT50 | Fixed | ₹50 | ₹499 |
| CRAFTDAY | Percentage | 15% (max ₹80) | ₹399 |

---

## Pricing Rules

- **Delivery fee:** ₹40 (free for orders above ₹500 after discount)
- **Tax:** 5% GST on post-discount subtotal
- **Sizes:** Small (+₹0), Medium (+₹80), Large (+₹160)
- **Crusts:** Thin (+₹0), Classic (+₹20), Stuffed (+₹60)
- **Note:** All prices are in Indian Rupees (INR). All pricing is calculated server-side; frontend-submitted prices are ignored.

