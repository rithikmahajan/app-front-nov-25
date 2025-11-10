# 🚀 Shiprocket Integration - Backend Implementation Guide

**For:** Backend Development Team  
**Project:** YORAA E-commerce Platform  
**Date:** October 14, 2025  
**Priority:** High - Required for Order Fulfillment

---

## 📋 Executive Summary

This document provides complete instructions for integrating Shiprocket shipping service into the YORAA backend. After payment verification, orders must be automatically created in Shiprocket to generate shipping labels and tracking codes.

**What you'll implement:**
- Automatic order creation in Shiprocket after payment
- AWB (tracking code) generation
- Real-time shipment tracking
- Error handling and retry logic

**Estimated Time:** 2-3 hours

---

## 🔐 API Credentials

### ⚠️ CRITICAL: Use Correct Credentials

**API User Credentials (Use These in Code):**
```
Email:     support@yoraa.in
Password:  R@0621thik
Base URL:  https://apiv2.shiprocket.in/v1/external
Company ID: 5783639
```

**DO NOT use:** `contact@yoraa.in` (that's for dashboard login only, lacks API permissions)

---

## 📦 Deliverables

### 1. Service File
Copy the provided `backend-shiprocket-service.js` to your backend:
```
your-backend/
└── services/
    └── shiprocketService.js  ← Copy here
```

### 2. Environment Variables
Add to your backend `.env` file:
```env
# Shiprocket Configuration
SHIPROCKET_API_USER_EMAIL=support@yoraa.in
SHIPROCKET_API_USER_PASSWORD=R@0621thik
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_COMPANY_ID=5783639
```

### 3. Dependencies
Install required package:
```bash
npm install axios
```

### 4. Database Schema Update
Add these fields to your Order model:
```javascript
{
  // Existing fields...
  
  // Add these new fields:
  shiprocketOrderId: { type: String },
  shipmentId: { type: String },
  awbCode: { type: String },  // Tracking number
  courierName: { type: String },
  courierId: { type: Number },
  shippingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'failed'],
    default: 'pending'
  },
  shippingError: { type: String },
  shippingCreatedAt: { type: Date },
  shippingFailedAt: { type: Date }
}
```

---

## 🔧 Implementation

### Step 1: Copy Service File

The complete service implementation is in `backend-shiprocket-service.js`. Copy it to your backend services folder.

**Key Functions Available:**

| Function | Purpose | Usage |
|----------|---------|-------|
| `createCompleteShipment()` | Creates order + generates AWB | ⭐ **Use this one** |
| `getShiprocketToken()` | Gets auth token | Auto-called internally |
| `createShiprocketOrder()` | Creates order only | For manual control |
| `trackShipment()` | Track by AWB code | For tracking endpoint |

### Step 2: Update Order Controller

**Location:** `controllers/orderController.js`

Add Shiprocket integration after payment verification:

```javascript
const shiprocketService = require('../services/shiprocketService');

async function createOrder(req, res) {
  try {
    // 1. Verify payment with Razorpay
    const paymentVerified = await verifyRazorpayPayment(
      req.body.razorpay_order_id,
      req.body.razorpay_payment_id,
      req.body.razorpay_signature
    );

    if (!paymentVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed' 
      });
    }

    // 2. Create order in database
    const order = await Order.create({
      userId: req.user._id,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      paymentId: req.body.razorpay_payment_id,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress
    });

    // 3. Create Shiprocket shipment
    try {
      const shipmentData = {
        orderId: order._id.toString(),
        orderDate: new Date().toISOString().split('T')[0],
        customer: {
          name: req.body.shippingAddress.firstName,
          lastName: req.body.shippingAddress.lastName || '',
          email: req.user.email,
          phone: req.body.shippingAddress.phone,
          address: req.body.shippingAddress.address,
          address2: req.body.shippingAddress.landmark || '',
          city: req.body.shippingAddress.city,
          state: req.body.shippingAddress.state,
          pincode: req.body.shippingAddress.pincode,
          country: 'India'
        },
        items: req.body.items.map(item => ({
          name: item.name,
          sku: item._id || item.sku,
          quantity: item.quantity,
          price: item.price,
          tax: item.gst || 0,
          discount: item.discount || 0
        })),
        paymentMethod: 'Prepaid',
        subTotal: req.body.totalAmount,
        shippingCharges: req.body.shippingCharges || 0,
        totalDiscount: req.body.totalDiscount || 0,
        dimensions: {
          length: 10,  // cm - adjust based on your products
          breadth: 10,
          height: 10,
          weight: 0.5  // kg - adjust based on your products
        }
      };

      // Create complete shipment (order + courier + AWB)
      const shipmentResult = await shiprocketService.createCompleteShipment(shipmentData);

      if (shipmentResult.success) {
        // Update order with shipping details
        order.shiprocketOrderId = shipmentResult.orderId;
        order.shipmentId = shipmentResult.shipmentId;
        order.awbCode = shipmentResult.awbCode;
        order.courierName = shipmentResult.courier.name;
        order.courierId = shipmentResult.courier.id;
        order.shippingStatus = 'processing';
        order.shippingCreatedAt = new Date();
        await order.save();

        console.log('✅ Order created with shipping:', {
          orderId: order._id,
          awbCode: shipmentResult.awbCode,
          courier: shipmentResult.courier.name
        });
      } else {
        throw new Error(shipmentResult.error);
      }

    } catch (shippingError) {
      // Log error but don't fail the order
      console.error('❌ Shiprocket error:', shippingError.message);
      
      order.shippingStatus = 'failed';
      order.shippingError = shippingError.message;
      order.shippingFailedAt = new Date();
      await order.save();

      // Optionally notify admin about shipping failure
      // await notifyAdmin('Shipping failed', { orderId: order._id, error: shippingError.message });
    }

    // 4. Send response to frontend
    return res.status(200).json({
      success: true,
      order: {
        id: order._id,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        awbCode: order.awbCode,
        trackingUrl: order.awbCode ? `https://shiprocket.co/tracking/${order.awbCode}` : null
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { createOrder };
```

### Step 3: Add Tracking Endpoint

**Location:** `controllers/orderController.js`

```javascript
async function getOrderTracking(req, res) {
  try {
    const { orderId } = req.params;

    // Fetch order from database
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify user owns this order (or is admin)
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // If no AWB code, return order status only
    if (!order.awbCode) {
      return res.status(200).json({
        success: true,
        tracking: null,
        message: 'Tracking not yet available',
        orderStatus: order.orderStatus,
        shippingStatus: order.shippingStatus
      });
    }

    // Fetch live tracking from Shiprocket
    try {
      const trackingData = await shiprocketService.trackShipment(order.awbCode);
      
      return res.status(200).json({
        success: true,
        tracking: trackingData,
        awbCode: order.awbCode,
        courierName: order.courierName,
        trackingUrl: `https://shiprocket.co/tracking/${order.awbCode}`
      });

    } catch (trackingError) {
      console.error('❌ Tracking fetch error:', trackingError);
      
      // Return basic order info if tracking fails
      return res.status(200).json({
        success: true,
        tracking: null,
        message: 'Tracking temporarily unavailable',
        orderStatus: order.orderStatus,
        shippingStatus: order.shippingStatus,
        awbCode: order.awbCode
      });
    }

  } catch (error) {
    console.error('❌ Error fetching tracking:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { createOrder, getOrderTracking };
```

### Step 4: Add Routes

**Location:** `routes/orderRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

// Create order after payment
router.post('/orders/create', authenticate, orderController.createOrder);

// Get order tracking
router.get('/orders/:orderId/tracking', authenticate, orderController.getOrderTracking);

module.exports = router;
```

---

## 🧪 Testing

### Test 1: Verify Credentials

Run the provided test script:
```bash
node test-shiprocket-integration.js
```

**Expected Output:**
```
✅ Configuration Check - PASS
✅ Authentication - PASS
✅ Order Creation (Dry Run) - PASS
✅ Tracking (Dry Run) - PASS

🎉 All tests passed! Integration is ready.
```

### Test 2: Manual API Test (cURL)

Test authentication directly:
```bash
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@yoraa.in",
    "password": "R@0621thik"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "id": 123456,
  "email": "support@yoraa.in"
}
```

### Test 3: Create Test Order

Use Postman or your API client:

**Endpoint:** `POST /api/orders/create`

**Headers:**
```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Body:**
```json
{
  "razorpay_order_id": "order_test123",
  "razorpay_payment_id": "pay_test123",
  "razorpay_signature": "test_signature",
  "items": [
    {
      "_id": "product123",
      "name": "Test Product",
      "quantity": 1,
      "price": 999
    }
  ],
  "totalAmount": 999,
  "shippingAddress": {
    "firstName": "Test",
    "lastName": "User",
    "phone": "9876543210",
    "address": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "670c...",
    "status": "confirmed",
    "paymentStatus": "paid",
    "shippingStatus": "processing",
    "awbCode": "ABCD1234567890",
    "trackingUrl": "https://shiprocket.co/tracking/ABCD1234567890"
  }
}
```

### Test 4: Verify in Shiprocket Dashboard

1. Login to https://app.shiprocket.in
2. Email: `contact@yoraa.in`
3. Password: `R@2727thik`
4. Navigate to Orders → All Orders
5. Verify your test order appears

---

## 🔍 Monitoring & Debugging

### Log Points to Implement

Add detailed logging at these points:

```javascript
// 1. Payment verification
console.log('[ORDER] Payment verification started:', { 
  orderId, 
  paymentId 
});

// 2. Order creation
console.log('[ORDER] Order created in database:', { 
  orderId: order._id 
});

// 3. Shiprocket authentication
console.log('[SHIPROCKET] Authenticating...');

// 4. Shiprocket order creation
console.log('[SHIPROCKET] Creating shipment:', { 
  orderId: order._id 
});

// 5. Success
console.log('[SHIPROCKET] ✅ Shipment created:', { 
  orderId: order._id,
  awbCode: shipmentResult.awbCode,
  courier: shipmentResult.courier.name
});

// 6. Errors
console.error('[SHIPROCKET] ❌ Error:', { 
  orderId: order._id,
  error: error.message 
});
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Permission Denied" | Wrong email used | Use `support@yoraa.in` not `contact@yoraa.in` |
| "Token Expired" | Token > 10 hours old | Service auto-refreshes, check logs |
| "No Couriers Available" | Pincode not serviceable | Check pincode in Shiprocket dashboard |
| "Invalid Pickup Location" | Pickup not configured | Set `pickup_location: "Primary"` |
| Order created but no AWB | Courier selection failed | Check dimensions and weight |

### Health Check Endpoint

Add this endpoint to verify Shiprocket connectivity:

```javascript
async function checkShiprocketHealth(req, res) {
  try {
    const token = await shiprocketService.getShiprocketToken();
    
    return res.status(200).json({
      success: true,
      shiprocket: 'connected',
      tokenGenerated: !!token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      shiprocket: 'error',
      error: error.message
    });
  }
}
```

---

## 📊 Expected Flow

```
1. Customer completes payment (Razorpay)
   ↓
2. Backend verifies payment
   ↓
3. Create order in database
   ↓
4. Authenticate with Shiprocket (support@yoraa.in)
   ↓
5. Create Shiprocket order
   ↓
6. Get available couriers
   ↓
7. Select best courier (cheapest/fastest)
   ↓
8. Generate AWB (tracking code)
   ↓
9. Update order with AWB
   ↓
10. Return order details to frontend
    ↓
11. Send confirmation email to customer (with tracking link)
```

---

## 🚨 Error Handling Strategy

### Scenario 1: Shiprocket API Down
```javascript
// Don't fail the order
order.shippingStatus = 'failed';
order.shippingError = 'Shiprocket temporarily unavailable';
await order.save();

// Queue for retry
await shippingQueue.add({ orderId: order._id });

// Notify customer
await sendEmail(customer.email, 'Order confirmed - Shipping pending');
```

### Scenario 2: Authentication Fails
```javascript
// Retry once with fresh token
cachedToken = null;
const newToken = await getShiprocketToken();
// Retry operation
```

### Scenario 3: No Couriers Available
```javascript
// Log for manual intervention
console.error('[SHIPROCKET] No couriers for pincode:', pincode);
await notifyAdmin('Manual shipping required', { orderId });

order.shippingStatus = 'pending_manual';
await order.save();
```

---

## 📧 Customer Notifications

After successful shipment creation, send:

### Email Template
```
Subject: Order Confirmed - #{{ORDER_ID}}

Hi {{CUSTOMER_NAME}},

Your order has been confirmed and will be shipped soon!

Order Details:
- Order ID: {{ORDER_ID}}
- AWB Code: {{AWB_CODE}}
- Courier: {{COURIER_NAME}}
- Expected Delivery: {{ESTIMATED_DELIVERY}}

Track your order: https://shiprocket.co/tracking/{{AWB_CODE}}

Thank you for shopping with YORAA!
```

### SMS Template
```
YORAA: Your order #{{ORDER_ID}} is confirmed. Track at: https://shiprocket.co/tracking/{{AWB_CODE}}
```

---

## 🔒 Security Considerations

1. **Never expose credentials in logs:**
   ```javascript
   // ❌ BAD
   console.log('Credentials:', email, password);
   
   // ✅ GOOD
   console.log('Authenticating with email:', email.substring(0, 3) + '***');
   ```

2. **Use environment variables:**
   ```javascript
   // ❌ BAD
   const email = 'support@yoraa.in';
   
   // ✅ GOOD
   const email = process.env.SHIPROCKET_API_USER_EMAIL;
   ```

3. **Validate user ownership:**
   ```javascript
   // Always verify user owns the order
   if (order.userId.toString() !== req.user._id.toString()) {
     return res.status(403).json({ error: 'Access denied' });
   }
   ```

---

## 📈 Performance Optimization

### 1. Token Caching
The service already implements token caching (9-hour validity). Don't make unnecessary auth calls.

### 2. Async Operations
Consider using a job queue for shipment creation:
```javascript
// Instead of blocking the response
await shippingQueue.add({
  orderId: order._id,
  customerData: shipmentData
});

// Return immediately
res.json({ success: true, order });
```

### 3. Retry Logic
Implement exponential backoff for failed shipments:
```javascript
const retryConfig = {
  retries: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
};
```

---

## 📝 Checklist

### Pre-Deployment
- [ ] `backend-shiprocket-service.js` copied to `services/`
- [ ] Environment variables added to `.env`
- [ ] `axios` package installed
- [ ] Order model updated with shipping fields
- [ ] Order controller updated
- [ ] Tracking endpoint added
- [ ] Routes configured
- [ ] Test script executed successfully
- [ ] Manual API test passed

### Testing
- [ ] Test order creation works
- [ ] Verify order in Shiprocket dashboard
- [ ] Check AWB code generated
- [ ] Test tracking endpoint
- [ ] Verify error handling (simulate failures)
- [ ] Test with different pincodes

### Deployment
- [ ] Deploy to staging
- [ ] Run end-to-end test on staging
- [ ] Monitor logs for errors
- [ ] Deploy to production
- [ ] Monitor first 10 production orders
- [ ] Set up alerts for shipping failures

---

## 🆘 Support

### Shiprocket Support
- **Email:** support@shiprocket.in
- **Phone:** +91 11 4173 4173
- **Company ID:** 5783639 (mention when contacting support)

### API Documentation
- **Docs:** https://apidocs.shiprocket.in
- **Dashboard:** https://app.shiprocket.in

### Internal Contacts
- **Frontend Team:** (for tracking display)
- **DevOps:** (for environment variables)
- **Product Team:** (for business logic decisions)

---

## 📎 Attached Files

1. **`backend-shiprocket-service.js`** - Complete service implementation
2. **`test-shiprocket-integration.js`** - Testing script
3. **Additional documentation** - For detailed reference

---

## ✅ Acceptance Criteria

The integration is complete when:

1. ✅ Orders automatically create Shiprocket shipments after payment
2. ✅ AWB codes are generated and saved to database
3. ✅ Tracking endpoint returns live tracking data
4. ✅ Failed shipments are logged and queued for retry
5. ✅ Error handling prevents order creation failures
6. ✅ All tests pass in staging environment
7. ✅ First 10 production orders ship successfully

---

## 🎯 Timeline

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Copy service file & setup | 30 min | High |
| Update order controller | 1 hour | High |
| Add tracking endpoint | 30 min | High |
| Testing & debugging | 1 hour | High |
| Documentation & handoff | 30 min | Medium |

**Total:** ~3-4 hours

---

## 🚀 Getting Started

1. **Read this document completely** (15 min)
2. **Run test script** to verify credentials (5 min)
3. **Copy service file** to your backend (2 min)
4. **Update environment variables** (5 min)
5. **Implement order controller changes** (1 hour)
6. **Add tracking endpoint** (30 min)
7. **Test thoroughly** (1 hour)
8. **Deploy to staging** (15 min)
9. **Monitor and iterate** (ongoing)

---

**Document Version:** 1.0  
**Last Updated:** October 14, 2025  
**Status:** Ready for Implementation

---

## 💬 Questions?

If you have questions during implementation:
1. Check the troubleshooting section above
2. Review the additional documentation files
3. Run the test script for diagnostics
4. Contact Shiprocket support if API issues persist

**Let's ship some orders! 📦🚀**
