# 🔄 Payment & Shiprocket Order Confirmation - Complete API Flow Documentation

## 📋 Overview

This document provides a **complete technical overview** of all API calls involved in payment processing and Shiprocket order confirmation in the YORA app, including when each API is called, what data is sent, and what responses are received.

---

## 🎯 High-Level Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT & SHIPPING FLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Proceed to Checkout" (Bag Screen)
   └─► Validates cart & authentication
   
2. Frontend → Backend: Create Order (Pre-Payment)
   └─► POST /api/payment/create-order (or /api/razorpay/create-order)
   └─► Returns: Razorpay Order ID
   
3. Frontend: Opens Razorpay Payment UI
   └─► User enters payment details
   └─► Razorpay processes payment
   
4. Frontend → Backend: Verify Payment (Post-Payment)
   └─► POST /api/payment/verify-payment (or /api/razorpay/verify-payment)
   └─► Backend verifies signature
   └─► Backend creates order in database
   └─► Backend creates Shiprocket shipment
   └─► Returns: Order ID + AWB Tracking Code
   
5. Frontend: Shows Order Confirmation
   └─► Displays order details with tracking info
   
6. User can track order
   └─► GET /api/orders/track/:awbCode
   └─► Returns: Real-time shipment status from Shiprocket
```

---

## 📡 Detailed API Flow

### **PHASE 1: Order Creation (Pre-Payment)**

#### 🔹 API Call #1: Create Razorpay Order

**When Called:** When user clicks "Proceed to Checkout" after selecting delivery address

**Endpoint:** 
- `POST /api/payment/create-order` (New standard endpoint)
- `POST /api/razorpay/create-order` (Backward compatible)

**Called From:** 
- `src/services/orderService.js` → `createOrder()` function
- Line ~533: `response = await apiService.post('/payment/create-order', requestBody);`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>" // Optional, can also be in body
}
```

**Request Body:**
```json
{
  "amount": 1999,                        // Total amount in INR (NOT paise)
  "cart": [
    {
      "id": "68da56fc0561b958f6694e1d",  // Product MongoDB ObjectId
      "name": "Cotton T-Shirt",
      "quantity": 2,
      "price": 999,                       // Price per item
      "size": "M",
      "sku": "SKU-RED-M-001",
      "image": "https://...",
      "description": "Red cotton t-shirt"
    }
  ],
  "staticAddress": {
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "email": "rithik@yoraa.in",
    "phone": "7006114695",
    "phoneNumber": "7006114695",         // Some systems use phone, others phoneNumber
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",            // Optional
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "pinCode": "110001",                 // Some systems use zipCode, others pinCode
    "country": "India"
  },
  "orderNotes": "",                      // Optional customer notes
  "paymentMethod": "razorpay"
}
```

**Backend Processing:**
1. Validates cart items (checks if products exist in database)
2. Validates delivery address
3. Calculates total amount (may differ from frontend if prices changed)
4. Creates Razorpay order using Razorpay API
5. May create a temporary order record in database (with status "pending")

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "id": "order_MnbXZxAbCdEfGh",         // Razorpay Order ID (CRITICAL - needed for payment)
  "amount": 199900,                      // Amount in PAISE (1999 * 100)
  "currency": "INR",
  "database_order_id": "68ee34dab4b...", // Optional: MongoDB Order ID
  "order_details": {                     // Optional: Backend calculation details
    "calculated_amount": 1999,
    "final_amount": 1999,
    "discounts_applied": 0
  },
  "cart_calculation": {                  // Optional: Item-wise breakdown
    "subtotal": 1998,
    "shipping": 0,
    "tax": 0,
    "total": 1999
  }
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Invalid item IDs" // or other error message
}
```

**What Frontend Does Next:**
- Stores the `id` (Razorpay Order ID)
- Stores `amount` for Razorpay checkout
- Proceeds to open Razorpay payment UI

---

### **PHASE 2: Payment Processing**

#### 🔹 Payment UI: Razorpay Checkout (NOT an API Call)

**When Called:** Immediately after successful order creation

**Called From:**
- `src/services/paymentService.js` → `initiatePayment()` function
- Line ~95: `const paymentResponse = await RazorpayCheckout.open(razorpayOptions);`

**What Happens:**
1. Frontend opens Razorpay native payment UI
2. User enters card/UPI/netbanking details
3. Razorpay processes payment on their servers
4. Razorpay returns payment success/failure to app

**Razorpay Configuration:**
```javascript
const razorpayOptions = {
  key: 'rzp_live_VRU7ggfYLI7DWV',       // Razorpay API Key (LIVE)
  amount: 199900,                         // Amount in paise from backend
  currency: 'INR',
  name: 'Yoraa Apparels',
  description: 'Yoraa Apparels Purchase',
  image: 'https://yoraa.com/logo.png',
  order_id: 'order_MnbXZxAbCdEfGh',     // From Step 1 response
  
  // Pre-fill customer data
  prefill: {
    name: 'Rithik Mahajan',
    email: 'rithik@yoraa.in',
    contact: '7006114695'
  },
  
  // Branding
  theme: {
    color: '#FF6B35'
  }
}
```

**Payment Success Response (from Razorpay SDK):**
```json
{
  "razorpay_payment_id": "pay_MnbYZxAbCdEfGh",
  "razorpay_order_id": "order_MnbXZxAbCdEfGh",
  "razorpay_signature": "4a3e2c1b0d9f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a"
}
```

**What Frontend Does Next:**
- Takes these 3 values from Razorpay
- Sends them to backend for verification

---

### **PHASE 3: Payment Verification & Order Creation**

#### 🔹 API Call #2: Verify Payment & Create Order

**When Called:** Immediately after Razorpay payment success

**Endpoint:**
- `POST /api/payment/verify-payment` (New standard endpoint)
- `POST /api/razorpay/verify-payment` (Backward compatible)

**Called From:**
- `src/services/orderService.js` → `verifyPayment()` function
- Line ~682: `response = await apiService.post('/payment/verify-payment', verificationPayload);`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>" // Optional
}
```

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_MnbYZxAbCdEfGh",
  "razorpay_order_id": "order_MnbXZxAbCdEfGh",
  "razorpay_signature": "4a3e2c1b0d9f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a"
}
```

**⚠️ CRITICAL NOTES:**
- **ONLY** send these 3 Razorpay fields
- **DO NOT** send cart, address, or order details
- Backend retrieves order details from the temporary order created in Step 1
- Or backend retrieves order details from session/database using `razorpay_order_id`

**Backend Processing (THIS IS WHERE THE MAGIC HAPPENS):**

1. **Verify Payment Signature** (Security Check)
   ```javascript
   const crypto = require('crypto');
   const generated_signature = crypto
     .createHmac('sha256', RAZORPAY_KEY_SECRET)
     .update(razorpay_order_id + "|" + razorpay_payment_id)
     .digest('hex');
   
   if (generated_signature !== razorpay_signature) {
     // Payment verification failed - SECURITY ISSUE
     return { success: false, message: 'Invalid payment signature' };
   }
   ```

2. **Retrieve Order Data**
   - Finds temporary order using `razorpay_order_id`
   - Or retrieves from session/cache
   - Gets cart items, address, amount

3. **Create Order in Database**
   ```javascript
   const order = await Order.create({
     orderNumber: 'YOR-2025-123456',    // Auto-generated
     userId: userId,
     
     // Items
     items: [
       {
         productId: '68da56fc0561b958f6694e1d',
         name: 'Cotton T-Shirt',
         quantity: 2,
         price: 999,
         size: 'M',
         sku: 'SKU-RED-M-001'
       }
     ],
     
     // Address
     shippingAddress: {
       firstName: 'Rithik',
       lastName: 'Mahajan',
       email: 'rithik@yoraa.in',
       phone: '7006114695',
       addressLine1: '123 Main Street',
       city: 'Delhi',
       state: 'Delhi',
       zipCode: '110001',
       country: 'India'
     },
     
     // Payment
     paymentMethod: 'razorpay',
     paymentStatus: 'paid',
     razorpay_order_id: 'order_MnbXZxAbCdEfGh',
     razorpay_payment_id: 'pay_MnbYZxAbCdEfGh',
     transactionId: 'pay_MnbYZxAbCdEfGh',
     
     // Amounts
     subtotal: 1998,
     shippingCharges: 0,
     taxAmount: 0,
     totalAmount: 1999,
     
     // Status
     orderStatus: 'confirmed',
     paymentStatus: 'paid',
     
     // Timestamps
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

4. **Create Shiprocket Shipment** (Steps 4a-4e below)

5. **Clear User's Cart**
   ```javascript
   await Cart.deleteMany({ userId: userId });
   ```

6. **Return Success Response**

---

### **PHASE 4: Shiprocket Integration (Inside Step 2 Backend)**

#### 🔹 API Call #3: Authenticate with Shiprocket

**When Called:** Inside the verify-payment endpoint, before creating shipment

**Endpoint:** 
- `POST https://apiv2.shiprocket.in/v1/external/auth/login`

**Called From:** 
- Backend service: `backend/services/shiprocketService.js`
- Function: `getShiprocketToken()`

**Request:**
```json
{
  "email": "support@yoraa.in",
  "password": "R@2727thik"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 864000  // Token valid for 10 days
}
```

**What Backend Does:**
- Caches this token for future requests
- Uses it in Authorization header for all Shiprocket API calls

---

#### 🔹 API Call #4: Create Shiprocket Order

**When Called:** Immediately after Shiprocket authentication

**Endpoint:**
- `POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`

**Called From:**
- Backend service: `backend/services/shiprocketService.js`
- Function: `createShiprocketOrder()`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "order_id": "YOR-2025-123456",                 // Your internal order ID
  "order_date": "2025-10-21",                    // YYYY-MM-DD format
  "pickup_location": "Primary",                  // Your warehouse name in Shiprocket
  "channel_id": "",                              // Empty for API orders
  "comment": "YORA Fashion Order",
  
  // Customer Billing Details
  "billing_customer_name": "Rithik",
  "billing_last_name": "Mahajan",
  "billing_address": "123 Main Street",
  "billing_address_2": "Apt 4B",
  "billing_city": "Delhi",
  "billing_pincode": "110001",
  "billing_state": "Delhi",
  "billing_country": "India",
  "billing_email": "rithik@yoraa.in",
  "billing_phone": "7006114695",
  
  // Customer Shipping Details (usually same as billing)
  "shipping_is_billing": true,
  "shipping_customer_name": "Rithik",
  "shipping_last_name": "Mahajan",
  "shipping_address": "123 Main Street",
  "shipping_address_2": "Apt 4B",
  "shipping_city": "Delhi",
  "shipping_pincode": "110001",
  "shipping_state": "Delhi",
  "shipping_country": "India",
  "shipping_email": "rithik@yoraa.in",
  "shipping_phone": "7006114695",
  
  // Order Items
  "order_items": [
    {
      "name": "Cotton T-Shirt",
      "sku": "SKU-RED-M-001",
      "units": 2,
      "selling_price": "999",
      "discount": "",
      "tax": "",
      "hsn": ""
    }
  ],
  
  // Payment Details
  "payment_method": "Prepaid",                   // ALWAYS Prepaid (Razorpay already collected)
  "shipping_charges": 0,
  "giftwrap_charges": 0,
  "transaction_charges": 0,
  "total_discount": 0,
  "sub_total": 1999,
  
  // Package Dimensions (Default values)
  "length": 10,                                  // cm
  "breadth": 10,                                 // cm
  "height": 10,                                  // cm
  "weight": 0.5                                  // kg
}
```

**Response (Success):**
```json
{
  "order_id": 236612717,                         // Shiprocket's internal order ID
  "shipment_id": 236612718,                      // Shiprocket's shipment ID
  "status": "NEW",
  "status_code": 1,
  "onboarding_completed_now": 0,
  "awb_code": null,                              // AWB generated in next step
  "courier_company_id": null,
  "courier_name": null
}
```

**What Backend Does:**
- Stores `order_id` and `shipment_id` in database order record
- Proceeds to generate AWB code

---

#### 🔹 API Call #5: Generate AWB Code (Tracking Number)

**When Called:** Immediately after Shiprocket order creation

**Endpoint:**
- `POST https://apiv2.shiprocket.in/v1/external/courier/assign/awb`

**Called From:**
- Backend service: `backend/services/shiprocketService.js`
- Function: `generateAWB()`

**Request:**
```json
{
  "shipment_id": 236612718,                      // From previous step
  "courier_id": 1                                // Auto-assign best courier
}
```

**Response (Success):**
```json
{
  "awb_assign_status": 1,
  "response": {
    "data": {
      "awb_code": "141123221084922",             // THIS IS THE TRACKING NUMBER!
      "courier_company_id": 17,
      "courier_name": "Xpressbees Surface",
      "assigned_date_time": "2025-10-21 15:30:00",
      "pickup_scheduled_date": "2025-10-22",
      "routing_code": "DEL/D",
      "rto_charges": 0,
      "applied_weight": 0.5,
      "charged_weight": 0.5
    }
  }
}
```

**What Backend Does:**
- Updates order in database with AWB code
- Updates courier information
- Returns this information to frontend

---

### **PHASE 5: Response to Frontend**

#### 🔹 API Call #2 Response (Payment Verification - Complete)

After all backend processing (payment verification, order creation, Shiprocket integration), the backend returns:

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "orderId": "68ee34dab4bba96264a3b922",         // MongoDB Order ID
  "orderNumber": "YOR-2025-123456",              // Human-readable order number
  "message": "Payment verified and shipment created successfully",
  
  "order": {
    "_id": "68ee34dab4bba96264a3b922",
    "orderNumber": "YOR-2025-123456",
    "userId": "68dae3fd47054fe75c651493",
    "items": [...],
    "shippingAddress": {...},
    "totalAmount": 1999,
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "razorpay_payment_id": "pay_MnbYZxAbCdEfGh",
    "createdAt": "2025-10-21T10:30:00.000Z"
  },
  
  // Shiprocket Tracking Details
  "awb_code": "141123221084922",                 // TRACKING NUMBER
  "shipment_id": 236612718,                      // Shiprocket shipment ID
  "courier_name": "Xpressbees Surface",          // Courier company
  "courier_company_id": 17
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Invalid payment signature" // or other error
}
```

**What Frontend Does:**
- Displays order confirmation screen
- Shows order number and tracking details
- Clears local cart
- Navigates to order confirmation screen

---

### **PHASE 6: Order Confirmation Display**

**Screen:** `src/screens/orderconfirmationphone.js`

**Data Displayed:**
- ✅ Order Number (e.g., "YOR-2025-123456")
- ✅ Payment ID (e.g., "pay_MnbYZxAbCdEfGh")
- ✅ Total Amount (e.g., "₹1,999")
- ✅ Order Items (with images, names, quantities)
- ✅ Delivery Address
- ✅ AWB Tracking Code (e.g., "141123221084922")
- ✅ Courier Name (e.g., "Xpressbees Surface")
- ✅ Order Date & Time

**User Actions Available:**
- View Order Details
- Track Order
- Continue Shopping

---

### **PHASE 7: Order Tracking**

#### 🔹 API Call #6: Get User's Orders

**When Called:** When user opens "My Orders" screen

**Endpoint:**
- `GET /api/orders/user/:userId`
- Or: `GET /api/orders/getAllByUser`

**Called From:**
- `src/screens/orders.js`
- `src/services/yoraaAPI.js` → `getUserOrders()`

**Request:**
```
GET /api/orders/user/68dae3fd47054fe75c651493?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "68ee34dab4bba96264a3b922",
      "orderNumber": "YOR-2025-123456",
      "items": [
        {
          "name": "Cotton T-Shirt",
          "quantity": 2,
          "price": 999,
          "image": "https://..."
        }
      ],
      "totalAmount": 1999,
      "orderStatus": "confirmed",
      "paymentStatus": "paid",
      "awb_code": "141123221084922",
      "courier_name": "Xpressbees Surface",
      "createdAt": "2025-10-21T10:30:00.000Z"
    },
    // ... more orders
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 25,
    "hasMore": true
  }
}
```

---

#### 🔹 API Call #7: Track Shipment (Real-Time)

**When Called:** When user clicks "Track Order" button

**Endpoint:**
- `GET /api/orders/track/:awbCode`

**Called From:**
- `src/contexts/ShiprocketContext.js` → `trackShipment()`
- `src/services/yoraaAPI.js` → `trackShipment()`

**Request:**
```
GET /api/orders/track/141123221084922
```

**Backend Processing:**
1. Backend authenticates with Shiprocket (gets token)
2. Backend calls Shiprocket tracking API:
   ```
   GET https://apiv2.shiprocket.in/v1/external/courier/track/awb/141123221084922
   ```

**Shiprocket Response (to Backend):**
```json
{
  "tracking_data": {
    "track_status": 1,
    "shipment_status": 6,
    "shipment_track": [
      {
        "id": 1,
        "awb_code": "141123221084922",
        "courier_company_id": 17,
        "shipment_status": 6,
        "shipment_status_label": "Delivered",
        "current_timestamp": "2025-10-25 14:30:00",
        "edd": "2025-10-25",
        "pickup_date": "2025-10-22",
        "delivered_date": "2025-10-25"
      }
    ],
    "shipment_track_activities": [
      {
        "date": "2025-10-25 14:30:00",
        "status": "Delivered",
        "activity": "Shipment delivered to customer",
        "location": "Delhi",
        "sr-status": "Delivered",
        "sr-status-label": "Delivered"
      },
      {
        "date": "2025-10-25 09:00:00",
        "status": "Out for Delivery",
        "activity": "Shipment out for delivery",
        "location": "Delhi Hub",
        "sr-status": "Out for Delivery",
        "sr-status-label": "Out for Delivery"
      },
      {
        "date": "2025-10-24 18:00:00",
        "status": "In Transit",
        "activity": "Shipment in transit",
        "location": "Delhi Sorting Facility",
        "sr-status": "In Transit",
        "sr-status-label": "In Transit"
      },
      {
        "date": "2025-10-22 10:00:00",
        "status": "Picked Up",
        "activity": "Shipment picked up from warehouse",
        "location": "Warehouse - Primary",
        "sr-status": "Picked Up",
        "sr-status-label": "Picked Up"
      }
    ]
  }
}
```

**Backend Response (to Frontend):**
```json
{
  "success": true,
  "awb_code": "141123221084922",
  "courier_name": "Xpressbees Surface",
  "current_status": "Delivered",
  "edd": "2025-10-25",
  "delivered_date": "2025-10-25",
  "tracking_history": [
    {
      "timestamp": "2025-10-25 14:30:00",
      "status": "Delivered",
      "description": "Shipment delivered to customer",
      "location": "Delhi"
    },
    {
      "timestamp": "2025-10-25 09:00:00",
      "status": "Out for Delivery",
      "description": "Shipment out for delivery",
      "location": "Delhi Hub"
    },
    {
      "timestamp": "2025-10-24 18:00:00",
      "status": "In Transit",
      "description": "Shipment in transit",
      "location": "Delhi Sorting Facility"
    },
    {
      "timestamp": "2025-10-22 10:00:00",
      "status": "Picked Up",
      "description": "Shipment picked up from warehouse",
      "location": "Warehouse - Primary"
    }
  ]
}
```

**What Frontend Does:**
- Displays tracking timeline
- Shows current status with visual indicator
- Shows estimated delivery date
- Shows tracking history in chronological order

---

## 📊 Complete API Call Sequence Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPLETE API SEQUENCE                          │
└──────────────────────────────────────────────────────────────────┘

TIME  | API CALL                              | DIRECTION           | PURPOSE
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=0s  | POST /api/payment/create-order        | Frontend → Backend  | Create Razorpay order
      |                                       |                     | Returns: order_id
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=1s  | [Razorpay Payment UI]                 | User → Razorpay     | User enters payment
      |                                       |                     | Returns: payment_id, signature
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=30s | POST /api/payment/verify-payment      | Frontend → Backend  | Verify payment
      |                                       |                     | Trigger order creation
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=31s | POST /auth/login                      | Backend → Shiprocket| Get auth token
      | (shiprocket.in)                       |                     |
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=32s | POST /orders/create/adhoc             | Backend → Shiprocket| Create shipment
      | (shiprocket.in)                       |                     | Returns: shipment_id
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=33s | POST /courier/assign/awb              | Backend → Shiprocket| Generate tracking code
      | (shiprocket.in)                       |                     | Returns: awb_code
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
T=34s | Response to Frontend                  | Backend → Frontend  | Order + AWB details
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
Later | GET /api/orders/user/:userId          | Frontend → Backend  | Fetch user's orders
──────┼───────────────────────────────────────┼────────────────────┼─────────────────────────
Later | GET /api/orders/track/:awbCode        | Frontend → Backend  | Track shipment
      |                                       |                     |
      | GET /courier/track/awb/:awb           | Backend → Shiprocket| Get real-time tracking
      | (shiprocket.in)                       |                     |
──────┴───────────────────────────────────────┴────────────────────┴─────────────────────────
```

---

## 🔐 Authentication & Security

### Frontend Authentication
- **JWT Token:** Stored in AsyncStorage after login
- **User Data:** Retrieved via `yoraaAPI.getUserData()`
- **Token Usage:** Sent in `Authorization: Bearer <token>` header

### Backend Authentication
- **Validates JWT token** on all authenticated endpoints
- **Razorpay Signature Verification:**
  ```javascript
  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');
  
  if (generated_signature !== razorpay_signature) {
    throw new Error('Invalid payment signature');
  }
  ```

### Shiprocket Authentication
- **Email/Password based login**
- **Token cached for 10 days**
- **Token renewal:** Automatic on expiry

---

## 🎨 Frontend Code References

### Key Files:
1. **`src/screens/bag.js`** - Cart & checkout initiation
2. **`src/services/orderService.js`** - Order creation & verification
3. **`src/services/paymentService.js`** - Razorpay integration
4. **`src/services/yoraaAPI.js`** - API client
5. **`src/screens/orderconfirmationphone.js`** - Order confirmation
6. **`src/screens/orders.js`** - Order list
7. **`src/contexts/ShiprocketContext.js`** - Shiprocket tracking

### Key Functions:
```javascript
// Order Creation
createOrder(cart, address, options)
  → src/services/orderService.js:~450

// Payment Initiation
initiatePayment(orderResponse, address, onSuccess, onError)
  → src/services/paymentService.js:~34

// Payment Verification
verifyPayment(paymentData)
  → src/services/orderService.js:~642

// Tracking
trackShipment(awbCode)
  → src/contexts/ShiprocketContext.js:~75
```

---

## 🛠️ Backend Code References (Conceptual)

### Expected Backend Endpoints:

```javascript
// 1. Create Order
router.post('/api/payment/create-order', async (req, res) => {
  const { amount, cart, staticAddress } = req.body;
  
  // Validate cart items
  // Calculate total
  // Create Razorpay order
  // Return order_id
});

// 2. Verify Payment & Create Order
router.post('/api/payment/verify-payment', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  // Verify signature
  // Create order in database
  // Authenticate with Shiprocket
  // Create Shiprocket shipment
  // Generate AWB code
  // Return order + AWB details
});

// 3. Get User Orders
router.get('/api/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  // Fetch orders from database
  // Return paginated list
});

// 4. Track Shipment
router.get('/api/orders/track/:awbCode', async (req, res) => {
  const { awbCode } = req.params;
  
  // Authenticate with Shiprocket
  // Get tracking data
  // Return formatted tracking info
});
```

---

## 📋 Environment Variables Required

### Frontend:
```bash
# API Configuration
API_BASE_URL=http://185.193.19.244:8000

# Razorpay
RAZORPAY_KEY=rzp_live_VRU7ggfYLI7DWV
```

### Backend:
```bash
# Razorpay
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=<your_razorpay_secret>

# Shiprocket
SHIPROCKET_EMAIL=support@yoraa.in
SHIPROCKET_PASSWORD=R@2727thik
SHIPROCKET_API_BASE_URL=https://apiv2.shiprocket.in/v1/external

# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=<your_jwt_secret>
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Invalid item IDs" Error
**Cause:** Product IDs not properly converted to MongoDB ObjectId  
**Solution:** Backend must convert string IDs to ObjectId before querying

### Issue 2: Amount Mismatch
**Cause:** Frontend sends amount in INR, Razorpay expects paise  
**Solution:** Backend multiplies by 100: `amount_in_paise = amount * 100`

### Issue 3: Shiprocket Authentication Failure
**Cause:** Wrong credentials or expired token  
**Solution:** Verify credentials, implement token refresh logic

### Issue 4: AWB Code Not Generated
**Cause:** Shiprocket shipment created but AWB generation failed  
**Solution:** Implement retry logic for AWB generation

### Issue 5: Cart Not Clearing After Payment
**Cause:** Cart cleared before payment verification  
**Solution:** Clear cart ONLY after successful payment verification

---

## 🧪 Testing Checklist

- [ ] ✅ Order creation returns valid Razorpay order_id
- [ ] ✅ Razorpay payment UI opens correctly
- [ ] ✅ Payment verification succeeds with valid signature
- [ ] ✅ Order created in database after payment
- [ ] ✅ Shiprocket shipment created successfully
- [ ] ✅ AWB tracking code generated
- [ ] ✅ Order confirmation shows all details
- [ ] ✅ Cart cleared after successful payment
- [ ] ✅ Order appears in "My Orders"
- [ ] ✅ Tracking shows real-time shipment status

---

## 📚 Additional Resources

- **Razorpay Docs:** https://razorpay.com/docs/
- **Shiprocket API Docs:** https://apidocs.shiprocket.in/
- **React Native Razorpay:** https://github.com/razorpay/react-native-razorpay

---

## 📝 Version History

- **v1.0** (Oct 21, 2025) - Initial comprehensive documentation
- Covers complete payment & Shiprocket integration flow
- All API endpoints, request/response formats documented
- Frontend and backend code references included

---

**Last Updated:** October 21, 2025  
**Author:** AI Documentation Assistant  
**Project:** YORA Apparels Mobile App
