# 📦 Complete YORA App Flow Summary - Checkout to Tracking

## 🎯 **Complete Flow Overview**

```
USER ACTION              →  FRONTEND              →  BACKEND                →  EXTERNAL API
═══════════════════════════════════════════════════════════════════════════════════════════

1. Add to Cart           →  CartScreen            →  POST /cart/add         →  MongoDB
                            - bag.js                  - Save cart item
                            
2. View Cart             →  CartScreen            →  GET /cart              →  MongoDB
                            - Display items           - Fetch user cart
                            - Show total
                            
3. Checkout              →  CartScreen            →  GET /profile           →  MongoDB
                            - Validate address        - Check user profile
                            - Navigate to Payment
                            
4. Payment Screen        →  PaymentGateway        →  POST /razorpay/        →  Razorpay
                            - Display summary           create-order
                            - Show order details      - Create order ID
                            
5. Enter Payment         →  Razorpay UI           →  Process payment        →  Razorpay
                            - Card/UPI/Wallet         - Capture payment
                            
6. Payment Success       →  PaymentGateway        →  POST /razorpay/        →  Razorpay
                            - Get payment_id            verify-payment         → Shiprocket
                            - Get signature           - Verify signature       → MongoDB
                                                      - Create order
                                                      - Create shipment
                                                      - Get AWB code
                                                      - Save to DB
                                                      - Clear cart
                            
7. Order Confirmation    →  Navigate to Orders    →  GET /orders/           →  MongoDB
                            - OrderScreen             getAllByUser
                            - Display orders          - Return orders with
                                                        AWB codes
                            
8. Track Order           →  Orders Screen         →  N/A                    →  Shiprocket
                            - Click Track button      (Direct API call)       
                            - Fetch tracking        
                            
9. View Tracking         →  TrackingModal         →  N/A                    →  Shiprocket
                            - Display timeline        (Display data)          - Track AWB
                            - Show status
```

---

## 📂 **File Structure & Responsibilities**

### **Frontend Files**

```
src/
├── screens/
│   ├── bag.js                              ✅ Cart & Checkout
│   ├── paymentGateway.js                   ⚠️  MISSING (needs creation)
│   ├── orders.js                           ✅ Orders display & tracking
│   └── orderstrackmodeloverlay.js          ✅ Tracking modal UI
│
├── services/
│   ├── orderService.js                     ✅ Order creation logic
│   ├── paymentService.js                   ✅ Payment processing
│   ├── shiprocketService.js                ✅ Shiprocket integration
│   └── yoraaAPI.js                         ✅ API communication
│
└── store/
    └── slices/
        └── orderSlice.js                   ✅ Order state management
```

### **Backend Files**

```
backend/
├── routes/
│   ├── razorpay.js                         ✅ Payment endpoints
│   ├── orders.js                           ✅ Order endpoints
│   └── cart.js                             ✅ Cart endpoints
│
├── models/
│   ├── Order.js                            ✅ Order schema
│   ├── Cart.js                             ✅ Cart schema
│   └── User.js                             ✅ User schema
│
└── utils/
    └── shiprocketService.js                ✅ Shiprocket integration
```

---

## 🔄 **Data Flow by Screen**

### **1. Cart Screen (bag.js)**

#### What It Does:
- Displays cart items with SKU, quantity, price
- Calculates total amount
- Validates user profile and address
- Navigates to payment

#### Data Flow:
```javascript
INPUT:
- cart (from Redux store)
- user profile (from API)
- address (from user data)

PROCESS:
- Calculate total amount
- Validate profile completeness
- Check address exists

OUTPUT:
- Navigate to Payment with:
  {
    itemIds: ["64abc123...", "64def456..."],
    address: { /* complete address object */ },
    cart: [ /* cart items with SKU */ ],
    totalAmount: 500,
    onPaymentSuccess: clearCart
  }
```

#### Code Reference:
```javascript
// File: src/screens/bag.js
const handleCheckout = () => {
  if (!data || !data.isProfile) {
    Alert.alert("Error", "Complete your profile first");
    return;
  }

  const itemIds = cart.map(item => item.item);
  
  navigation.navigate('Payment', {
    itemIds,
    address,
    cart,
    totalAmount: calculateTotal(),
    onPaymentSuccess: clearCart
  });
};
```

---

### **2. Payment Gateway Screen (MISSING - Needs Creation)**

#### What It Should Do:
- Display order summary
- Show delivery address
- Create Razorpay order
- Open Razorpay payment UI
- Verify payment
- Navigate to orders

#### Required Implementation:

**Create File:** `src/screens/paymentGateway.js`

```javascript
import React, { useState, useEffect } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOrder, verifyPayment } from '../services/paymentService';

const PaymentGatewayScreen = ({ route, navigation }) => {
  const { address, cart, totalAmount, onPaymentSuccess } = route.params;
  
  const handlePayment = async () => {
    try {
      // Step 1: Create Razorpay order
      const orderData = await createOrder({
        amount: totalAmount,
        cart: cart.map(item => ({
          itemId: item.item,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price
        })),
        staticAddress: address
      });

      // Step 2: Open Razorpay UI
      const paymentResponse = await RazorpayCheckout.open({
        key: 'rzp_live_VRU7ggfYLI7DWV',
        amount: totalAmount * 100,
        order_id: orderData.id,
        name: 'YORA Fashion',
        prefill: {
          email: await AsyncStorage.getItem('user_email'),
          contact: await AsyncStorage.getItem('user_phNo')
        }
      });

      // Step 3: Verify payment
      const verifyData = await verifyPayment(paymentResponse);

      if (verifyData.success) {
        Alert.alert('Success', 'Order placed successfully!');
        onPaymentSuccess?.();  // Clear cart
        navigation.navigate('Orders');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    }
  };

  return (
    <View>
      {/* Display order summary */}
      <TouchableOpacity onPress={handlePayment}>
        <Text>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

### **3. Orders Screen (orders.js)**

#### What It Does:
- Fetches all user orders
- Displays order cards with status
- Provides "Track Order" button
- Opens tracking modal with real data

#### Data Flow:
```javascript
INPUT:
- User authentication token
- Order ID for tracking

PROCESS:
- Fetch orders from backend
- Transform order data
- On track click:
  - Check AWB code exists
  - Fetch Shiprocket tracking
  - Transform to modal format

OUTPUT:
- Display orders list
- Open tracking modal with:
  [
    { status: "Packing", location: "...", timestamp: "..." },
    { status: "Picked", location: "...", timestamp: "..." },
    { status: "In Transit", location: "...", timestamp: "..." },
    { status: "Delivered", location: "...", timestamp: "..." }
  ]
```

#### Code Reference:
```javascript
// File: src/screens/orders.js
const handleTrackOrder = async (order) => {
  if (!order.awb_code) {
    Alert.alert('Tracking Unavailable');
    return;
  }

  try {
    const trackingData = await fetchTrackingDetails(order.awb_code);
    const transformedData = transformTrackingForModal(trackingData);
    trackingModalRef.current?.openModal(transformedData);
  } catch (error) {
    Alert.alert('Error', 'Failed to fetch tracking');
  }
};
```

---

### **4. Tracking Modal (orderstrackmodeloverlay.js)**

#### What It Does:
- Displays tracking timeline
- Shows completed vs pending steps
- Displays location and timestamp for each step
- Drag-to-close functionality

#### Data Flow:
```javascript
INPUT:
[
  { status: "Packing", location: "Warehouse Mumbai", timestamp: "..." },
  { status: "Picked", location: "Courier Hub", timestamp: "..." },
  { status: "In Transit", location: "Delhi Hub", timestamp: "..." },
  { status: "Delivered", location: "Customer", timestamp: "..." }
]

PROCESS:
- Match input statuses with master steps
- Determine which steps are completed
- Display timeline with dots and lines

OUTPUT:
- Visual timeline
- Filled dots for completed steps
- Empty dots for pending steps
- Location and timestamp for each
```

---

## 🔌 **API Endpoints Used**

### **Backend Endpoints**

| Method | Endpoint | Purpose | Auth | Request | Response |
|--------|----------|---------|------|---------|----------|
| POST | `/razorpay/create-order` | Create Razorpay order | ✅ Yes | `{ amount, cart, staticAddress }` | `{ id, amount, currency }` |
| POST | `/razorpay/verify-payment` | Verify payment & create order | ❌ No | `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` | `{ success, orderId, awb_code }` |
| GET | `/orders/getAllByUser` | Fetch user orders | ✅ Yes | `?page=1&limit=10` | `{ success, orders: [...] }` |
| GET | `/orders/:id` | Get single order | ✅ Yes | Order ID in URL | `{ success, order: {...} }` |
| POST | `/orders/cancel/:id` | Cancel order | ✅ Yes | Order ID in URL | `{ success, message }` |
| GET | `/profile` | Get user profile | ✅ Yes | None | `{ isProfile, address: [...] }` |
| GET | `/cart` | Get cart items | ✅ Yes | None | `{ cart: [...] }` |
| POST | `/cart/add` | Add to cart | ✅ Yes | `{ itemId, sku, quantity }` | `{ success, cart }` |
| DELETE | `/cart/clear` | Clear cart | ✅ Yes | None | `{ success }` |

### **External API Endpoints**

| Service | Endpoint | Purpose | Auth |
|---------|----------|---------|------|
| Razorpay | `https://api.razorpay.com/v1/orders` | Create order | API Key |
| Shiprocket | `https://apiv2.shiprocket.in/v1/external/auth/login` | Authenticate | Email/Password |
| Shiprocket | `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc` | Create shipment | Bearer Token |
| Shiprocket | `https://apiv2.shiprocket.in/v1/external/courier/assign/awb` | Get AWB code | Bearer Token |
| Shiprocket | `https://apiv2.shiprocket.in/v1/external/courier/track/awb/{awb}` | Track shipment | Bearer Token |

---

## 🗄️ **Database Schema**

### **Order Document Structure**

```javascript
{
  _id: ObjectId("64order123..."),
  user: ObjectId("64user456..."),
  
  // Order Items
  items: [
    {
      itemId: ObjectId("64product789..."),
      sku: "RED-M",                    // Color-Size
      name: "Cotton T-Shirt",
      description: "Premium cotton",
      quantity: 2,
      price: 250,
      imageUrl: "https://..."
    }
  ],
  
  // Pricing
  totalAmount: 500,
  
  // Delivery Address
  address: {
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400001",
    phoneNumber: "9876543210",
    country: "India",
    type: "home"
  },
  
  // Payment Information
  paymentId: "pay_abc123",           // Razorpay payment ID
  orderId: "order_xyz123",           // Razorpay order ID
  paymentStatus: "SUCCESS",          // PENDING | SUCCESS | FAILED | REFUNDED
  
  // Shipping Information
  awb_code: "141123221084922",       // ⚠️ CRITICAL FOR TRACKING
  shipment_id: 236612717,            // Shiprocket shipment ID
  courier_name: "Xpressbees Surface",
  
  // Order Status
  orderStatus: "PROCESSING",         // PENDING | PROCESSING | SHIPPED | 
                                     // IN_TRANSIT | OUT_FOR_DELIVERY | 
                                     // DELIVERED | CANCELLED | RETURNED
  
  // Timestamps
  created_at: ISODate("2024-10-14T10:30:00Z"),
  updated_at: ISODate("2024-10-14T10:30:00Z")
}
```

---

## 🚨 **Critical Integration Points**

### **1. Order Creation → AWB Code Storage**

**Location:** Backend `routes/razorpay.js` → `verify-payment` endpoint

```javascript
// ⚠️ CRITICAL: This MUST happen after payment verification
const shipmentResult = await createShiprocketShipment(newOrder);

if (shipmentResult.success) {
  // Save AWB code to database
  newOrder.awb_code = shipmentResult.awb_code;
  newOrder.shipment_id = shipmentResult.shipment_id;
  newOrder.courier_name = shipmentResult.courier_name;
  await newOrder.save();
}
```

**Why Critical:**
Without AWB code, tracking is impossible. Order screen will show "Tracking Not Available".

---

### **2. Order Fetch → Include AWB Code**

**Location:** Backend `routes/orders.js` → `getAllByUser` endpoint

```javascript
// ⚠️ CRITICAL: MUST include AWB fields in response
const orders = await Order.find({ user: req.user.id })
  .select('_id items total_price order_status awb_code shipment_id courier_name ...')
  .lean();
```

**Why Critical:**
Frontend needs AWB code to call Shiprocket tracking API.

---

### **3. Frontend → Shiprocket Authentication**

**Location:** Frontend `services/shiprocketService.js`

```javascript
// ⚠️ CRITICAL: Token must be cached to avoid rate limits
let cachedToken = null;
let tokenExpiry = null;

export const getShiprocketToken = async () => {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  // Otherwise authenticate
  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'support@yoraa.in',
      password: 'R@2727thik'
    })
  });
  
  cachedToken = response.token;
  tokenExpiry = Date.now() + (10 * 60 * 60 * 1000); // 10 hours
  
  return cachedToken;
};
```

**Why Critical:**
Shiprocket has rate limits. Authenticating on every request will cause failures.

---

## ✅ **Implementation Status**

### **Frontend**

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| Cart Screen | ✅ Complete | `src/screens/bag.js` | Working |
| Payment Gateway | ⚠️ Missing | **NEEDS CREATION** | Critical |
| Orders Screen | ✅ Complete | `src/screens/orders.js` | Needs AWB integration |
| Tracking Modal | ✅ Complete | `src/screens/orderstrackmodeloverlay.js` | Working |
| Order Service | ✅ Complete | `src/services/orderService.js` | Working |
| Payment Service | ✅ Complete | `src/services/paymentService.js` | Working |
| Shiprocket Service | ✅ Complete | `src/services/shiprocketService.js` | Ready to use |

### **Backend**

| Component | Status | Needs |
|-----------|--------|-------|
| Razorpay Order Creation | ✅ Complete | None |
| Payment Verification | ✅ Complete | Verify AWB saving |
| Shiprocket Integration | ✅ Complete | Verify AWB generation |
| Order Endpoints | ✅ Complete | Verify AWB in response |
| Order Model | ⚠️ Check | Add AWB fields if missing |

---

## 🎯 **Next Steps**

### **Immediate (Critical):**

1. ✅ **Create Payment Gateway Screen**
   - File: `src/screens/paymentGateway.js`
   - Use Razorpay SDK
   - Display order summary
   - Handle payment flow

2. ✅ **Integrate Real Tracking in Orders Screen**
   - Update `orders.js`
   - Replace mock tracking with Shiprocket API
   - Use `shiprocketService.js`

3. ✅ **Verify Backend Returns AWB**
   - Check order response includes AWB code
   - Test with actual order

### **Short Term (Important):**

4. ✅ **Add Error Handling**
   - Handle missing AWB codes
   - Handle Shiprocket API failures
   - Show user-friendly messages

5. ✅ **Add Loading States**
   - Show spinner during tracking fetch
   - Prevent multiple API calls

### **Long Term (Nice to Have):**

6. ✅ **Create Full Tracking Screen**
   - Dedicated page instead of modal
   - More detailed tracking info
   - Delivery map integration

7. ✅ **Add Push Notifications**
   - Notify on status changes
   - Notify on delivery

---

## 📊 **Testing Checklist**

### **End-to-End Test Flow:**

- [ ] Add product to cart
- [ ] Navigate to cart
- [ ] Click "Proceed to Checkout"
- [ ] Verify address is loaded
- [ ] Navigate to payment screen
- [ ] See order summary
- [ ] Click "Pay Now"
- [ ] Razorpay UI opens
- [ ] Complete payment
- [ ] Payment verification succeeds
- [ ] Order created in database
- [ ] AWB code generated
- [ ] AWB code saved to order
- [ ] Cart cleared
- [ ] Navigate to orders screen
- [ ] Order displays with AWB
- [ ] Click "Track Order"
- [ ] Tracking modal opens
- [ ] Real tracking data displayed
- [ ] Timeline shows correctly
- [ ] Can close modal by dragging

---

## 📞 **Troubleshooting Guide**

### **Issue: Payment verification fails**

**Symptoms:** Payment successful but order not created

**Check:**
1. Backend logs for signature verification errors
2. Razorpay dashboard for payment status
3. MongoDB for order creation

**Fix:** Ensure signature verification logic is correct

---

### **Issue: AWB code is null**

**Symptoms:** Tracking shows "Not Available" for all orders

**Check:**
1. Backend logs during order creation
2. Shiprocket dashboard for shipment status
3. MongoDB order document for AWB field

**Fix:** Verify Shiprocket shipment creation succeeds

---

### **Issue: Tracking fetch fails**

**Symptoms:** Error when clicking "Track Order"

**Check:**
1. Order has valid AWB code
2. Shiprocket authentication succeeds
3. AWB code exists in Shiprocket system

**Fix:** Verify AWB is valid and shipment exists

---

## 🎉 **Summary**

### **What's Working:**
✅ Cart management  
✅ Order service  
✅ Payment service  
✅ Shiprocket service  
✅ Tracking modal UI  
✅ Orders display  

### **What Needs Implementation:**
⚠️ Payment Gateway Screen (critical)  
⚠️ Real tracking integration in Orders screen  
⚠️ Backend AWB verification  

### **Estimated Time to Complete:**
- Payment Gateway Screen: 2 hours
- Tracking Integration: 1 hour
- Backend Verification: 30 minutes
- Testing: 1 hour
- **Total: 4.5 hours**

---

**You're 80% there! Just need to create the Payment Gateway screen and integrate real tracking.** 🚀
