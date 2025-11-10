# 🚀 Shiprocket Backend Integration Guide

**Date:** October 14, 2025  
**Status:** ✅ Ready for Implementation

---

## 🔐 Authentication Clarification

### Your Shiprocket Accounts:

1. **Main Login (Dashboard Access)**
   - Email: `contact@yoraa.in`
   - Password: `R@2727thik`
   - Purpose: Login to Shiprocket web dashboard only

2. **API User (Backend Integration)** ✅ **USE THIS**
   - Email: `support@yoraa.in`
   - Password: `R@0621thik`
   - Purpose: API operations (create orders, track shipments)
   - Company ID: `5783639`

### ⚠️ IMPORTANT:
**For backend code, ALWAYS use API User credentials (`support@yoraa.in`)** because:
- ✅ Has order management permissions
- ✅ Properly configured for API access
- ✅ Already tested and working in frontend

---

## 📁 File Structure

```
your-backend/
├── .env                              # Environment variables
├── services/
│   └── shiprocketService.js          # Shiprocket integration
├── controllers/
│   └── orderController.js            # Order handling
└── routes/
    └── orderRoutes.js                # API routes
```

---

## 🔧 Step 1: Environment Configuration

### Backend `.env` file:

```env
# Shiprocket API Configuration
SHIPROCKET_API_USER_EMAIL=support@yoraa.in
SHIPROCKET_API_USER_PASSWORD=R@0621thik
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_COMPANY_ID=5783639

# Optional: Main account (for reference only)
SHIPROCKET_MAIN_EMAIL=contact@yoraa.in
SHIPROCKET_MAIN_PASSWORD=R@2727thik
```

---

## 📝 Step 2: Backend Service Implementation

The complete service is available in `backend-shiprocket-service.js`.

### Quick Setup:

1. Copy `backend-shiprocket-service.js` to your backend
2. Install dependencies:
```bash
npm install axios
```

3. Import and use:
```javascript
const shiprocketService = require('./services/shiprocketService');
```

---

## 🎯 Step 3: Order Controller Integration

### Example: `controllers/orderController.js`

```javascript
const shiprocketService = require('../services/shiprocketService');

/**
 * Create order after payment verification
 */
async function createOrder(req, res) {
  try {
    const { 
      orderId,
      customer,
      items,
      totalAmount,
      paymentId 
    } = req.body;

    // 1. Save order to your database
    const order = await Order.create({
      orderId,
      customer,
      items,
      totalAmount,
      paymentId,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    // 2. Create Shiprocket shipment
    try {
      const shiprocketData = {
        orderId: order._id.toString(),
        orderDate: new Date().toISOString().split('T')[0],
        customer: {
          name: customer.firstName,
          lastName: customer.lastName || '',
          email: customer.email,
          phone: customer.phone,
          address: customer.shippingAddress.address,
          address2: customer.shippingAddress.landmark || '',
          city: customer.shippingAddress.city,
          state: customer.shippingAddress.state,
          pincode: customer.shippingAddress.pincode,
          country: 'India'
        },
        items: items.map(item => ({
          name: item.name,
          sku: item.sku || item._id,
          quantity: item.quantity,
          price: item.price,
          tax: item.gst || 0
        })),
        paymentMethod: 'Prepaid',
        subTotal: totalAmount,
        shippingCharges: 0,
        totalDiscount: 0,
        dimensions: {
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5
        }
      };

      const shipmentResult = await shiprocketService.createCompleteShipment(shiprocketData);

      // 3. Update order with shipping details
      order.shippingStatus = 'processing';
      order.shiprocketOrderId = shipmentResult.orderId;
      order.shipmentId = shipmentResult.shipmentId;
      order.awbCode = shipmentResult.awbCode;
      order.courier = shipmentResult.courier;
      await order.save();

      console.log('✅ Order created with shipping:', {
        orderId: order._id,
        awbCode: shipmentResult.awbCode
      });

      return res.status(200).json({
        success: true,
        order: {
          id: order._id,
          status: order.status,
          awbCode: order.awbCode,
          trackingUrl: `https://shiprocket.co/tracking/${order.awbCode}`
        }
      });

    } catch (shippingError) {
      // If shipping fails, still save order but mark shipping as failed
      console.error('❌ Shipping failed:', shippingError);
      
      order.shippingStatus = 'failed';
      order.shippingError = shippingError.message;
      await order.save();

      // Return success but notify about shipping issue
      return res.status(200).json({
        success: true,
        order: {
          id: order._id,
          status: order.status,
          shippingWarning: 'Order created but shipping label generation pending'
        }
      });
    }

  } catch (error) {
    console.error('❌ Order creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get order tracking details
 */
async function getOrderTracking(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (!order.awbCode) {
      return res.status(200).json({
        success: true,
        tracking: null,
        message: 'Tracking not yet available'
      });
    }

    // Fetch live tracking from Shiprocket
    const trackingData = await shiprocketService.trackShipment(order.awbCode);

    return res.status(200).json({
      success: true,
      tracking: trackingData,
      awbCode: order.awbCode
    });

  } catch (error) {
    console.error('❌ Tracking fetch error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  createOrder,
  getOrderTracking
};
```

---

## 🛣️ Step 4: API Routes

### Example: `routes/orderRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

// Create order (called after payment verification)
router.post('/orders/create', authenticate, orderController.createOrder);

// Get order tracking
router.get('/orders/:orderId/tracking', authenticate, orderController.getOrderTracking);

module.exports = router;
```

---

## 🧪 Step 5: Testing

### Test Authentication:

```bash
cd your-backend
node backend-shiprocket-service.js
```

Expected output:
```
🔐 Authenticating with Shiprocket API...
✅ Shiprocket authentication successful
📝 Token valid until: [timestamp]
✅ Token obtained: eyJ0eXAiOiJKV1QiLCJ...
```

### Test Order Creation:

```javascript
const shiprocketService = require('./services/shiprocketService');

// Test data
const testOrder = {
  orderId: 'TEST123',
  orderDate: '2025-10-14',
  customer: {
    name: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '9876543210',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India'
  },
  items: [{
    name: 'Test Product',
    sku: 'TEST-SKU-001',
    quantity: 1,
    price: 999,
    tax: 0
  }],
  paymentMethod: 'Prepaid',
  subTotal: 999,
  shippingCharges: 0,
  totalDiscount: 0,
  dimensions: {
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5
  }
};

// Test
shiprocketService.createCompleteShipment(testOrder)
  .then(result => {
    console.log('✅ Test passed:', result);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });
```

---

## 🔍 Troubleshooting

### Issue 1: "Permission Denied"

**Solution:**
```javascript
// ❌ WRONG
email: 'contact@yoraa.in'

// ✅ CORRECT
email: 'support@yoraa.in'
```

### Issue 2: Token Expired

The service automatically handles token refresh. If issues persist:
```javascript
// Force token refresh
cachedToken = null;
tokenExpiry = null;
await getShiprocketToken();
```

### Issue 3: Invalid Pincode

```javascript
// Ensure pincode is string and 6 digits
pincode: customer.pincode.toString().padStart(6, '0')
```

### Issue 4: No Couriers Available

Check:
- Pincode serviceability
- Weight and dimensions
- Pickup location configured in Shiprocket

---

## 📊 Complete Order Flow

```
1. Customer Completes Payment
   ↓
2. Payment Verification (Razorpay)
   ↓
3. Create Order in Database
   ↓
4. Call createCompleteShipment()
   ├─→ Create Shiprocket Order
   ├─→ Get Available Couriers
   ├─→ Select Best Courier
   └─→ Generate AWB
   ↓
5. Update Order with Tracking
   ↓
6. Send Confirmation to Customer
   ↓
7. Customer Can Track Order
```

---

## 🎯 Quick Implementation Checklist

- [ ] Copy `backend-shiprocket-service.js` to backend
- [ ] Update `.env` with API user credentials
- [ ] Install `axios` dependency
- [ ] Update order controller to use service
- [ ] Add tracking endpoint
- [ ] Test authentication
- [ ] Test order creation
- [ ] Update frontend to fetch tracking
- [ ] Deploy and monitor

---

## 📞 Support

**Shiprocket Issues:**
- Email: support@shiprocket.in
- Company ID: 5783639
- Dashboard: https://app.shiprocket.in

**API Documentation:**
- https://apidocs.shiprocket.in

---

## ✅ Summary

**USE THESE CREDENTIALS IN BACKEND:**
```env
SHIPROCKET_API_USER_EMAIL=support@yoraa.in
SHIPROCKET_API_USER_PASSWORD=R@0621thik
```

**DON'T USE:**
- ❌ contact@yoraa.in (main login, use only for dashboard)

**The complete backend service is ready in:**
- `backend-shiprocket-service.js`

Just integrate it into your backend and orders will be created automatically! 🚀
