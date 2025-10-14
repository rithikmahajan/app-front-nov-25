# Complete Shipping and Order Management Implementation - YORA App

## 📦 **PART 2: SHIPPING, ORDER TRACKING & MANAGEMENT**

---

## Table of Contents

1. [Shiprocket Integration Overview](#shiprocket-integration-overview)
2. [Backend Implementation - Shiprocket Service](#backend-implementation---shiprocket-service)
3. [Backend Implementation - Order Verification with Shipping](#backend-implementation---order-verification-with-shipping)
4. [Frontend Implementation - Order Tracking](#frontend-implementation---order-tracking)
5. [Complete Order Management APIs](#complete-order-management-apis)
6. [Database Schema](#database-schema)
7. [Testing Guide](#testing-guide)

---

## Shiprocket Integration Overview

Shiprocket is a shipping aggregation platform that connects with multiple courier services. The integration flow is:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHIPROCKET INTEGRATION FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATE → Login to Shiprocket API (get token)
2. CREATE ORDER → Register order in Shiprocket system
3. GENERATE AWB → Get tracking number from courier
4. GENERATE LABEL → Create shipping label PDF
5. SCHEDULE PICKUP → Arrange courier pickup from warehouse
6. TRACK SHIPMENT → Monitor delivery status in real-time
```

### Shiprocket API Credentials

```javascript
// Store in .env file
SHIPROCKET_EMAIL=support@yoraa.in
SHIPROCKET_PASSWORD=R@2727thik
SHIPROCKET_API_BASE_URL=https://apiv2.shiprocket.in/v1/external
```

---

## Backend Implementation - Shiprocket Service

### File: `backend/services/shiprocketService.js`

This service handles all Shiprocket API interactions.

```javascript
/**
 * Shiprocket Service - Complete Shipping Integration
 * Handles authentication, order creation, AWB generation, and tracking
 */

const fetch = require('node-fetch'); // npm install node-fetch@2
const crypto = require('crypto');

// Shiprocket API Configuration
const SHIPROCKET_CONFIG = {
  baseUrl: process.env.SHIPROCKET_API_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,
  defaultPickupLocation: 'Primary', // Set in Shiprocket dashboard
  defaultLength: 25,  // cm
  defaultBreadth: 20, // cm
  defaultHeight: 10,  // cm
  defaultWeight: 0.5  // kg
};

/**
 * Authenticate with Shiprocket API
 * Returns authentication token valid for 24 hours
 */
async function authenticateShiprocket() {
  try {
    console.log('🔐 Authenticating with Shiprocket...');
    
    const response = await fetch(`${SHIPROCKET_CONFIG.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        email: SHIPROCKET_CONFIG.email,
        password: SHIPROCKET_CONFIG.password
      })
    });

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Shiprocket authentication failed: No token received');
    }

    console.log('✅ Shiprocket authentication successful');
    return data.token;
    
  } catch (error) {
    console.error('❌ Shiprocket authentication error:', error);
    throw new Error(`Shiprocket authentication failed: ${error.message}`);
  }
}

/**
 * Create Order in Shiprocket
 * Registers order and generates AWB code in one flow
 */
async function createShiprocketShipment(orderData) {
  try {
    console.log('🚀 Starting Shiprocket shipment creation');
    console.log('📦 Order ID:', orderData._id);

    // Step 1: Authenticate
    const token = await authenticateShiprocket();

    // Step 2: Prepare shipment data
    const shipmentData = {
      // Order Information
      order_id: orderData._id.toString(),
      order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      pickup_location: SHIPROCKET_CONFIG.defaultPickupLocation,
      channel_id: "",
      comment: "YORA Fashion Order",
      
      // Billing Details (Customer Information)
      billing_customer_name: orderData.address.firstName || 'Customer',
      billing_last_name: orderData.address.lastName || '',
      billing_address: orderData.address.address || orderData.address.addressLine1,
      billing_city: orderData.address.city,
      billing_pincode: orderData.address.pinCode || orderData.address.zipCode,
      billing_state: orderData.address.state,
      billing_country: orderData.address.country || "India",
      billing_email: orderData.address.email || "customer@yoraa.in",
      billing_phone: orderData.address.phoneNumber || orderData.address.phone,
      
      // Shipping Details (same as billing)
      shipping_is_billing: true,
      
      // Order Items - Map from order data
      order_items: orderData.items.map(item => ({
        name: item.name || 'Product',
        sku: item.sku || `SKU-${item.itemId}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: ""
      })),
      
      // Payment Information
      payment_method: "Prepaid", // Payment already done via Razorpay
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: orderData.totalAmount,
      
      // Package Dimensions
      length: SHIPROCKET_CONFIG.defaultLength,
      breadth: SHIPROCKET_CONFIG.defaultBreadth,
      height: SHIPROCKET_CONFIG.defaultHeight,
      weight: SHIPROCKET_CONFIG.defaultWeight
    };

    console.log('📦 Shipment data prepared for order:', shipmentData.order_id);

    // Step 3: Create order in Shiprocket
    const createOrderResponse = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/orders/create/adhoc`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shipmentData)
      }
    );

    const orderResult = await createOrderResponse.json();

    if (!orderResult.order_id) {
      console.error('❌ Shiprocket order creation failed:', orderResult);
      throw new Error(orderResult.message || 'Failed to create order in Shiprocket');
    }

    console.log('✅ Order created in Shiprocket:', orderResult.order_id);
    console.log('📦 Shipment ID:', orderResult.shipment_id);

    // Step 4: Generate AWB Code (Tracking Number)
    console.log('🔢 Generating AWB code...');
    
    const awbResponse = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/courier/assign/awb`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipment_id: orderResult.shipment_id,
          courier_id: 1 // Auto-assign best courier
        })
      }
    );

    const awbResult = await awbResponse.json();

    if (awbResult.awb_assign_status !== 1) {
      console.error('❌ AWB generation failed:', awbResult);
      throw new Error('Failed to generate AWB code');
    }

    const awb_code = awbResult.response.data.awb_code;
    const courier_name = awbResult.response.data.courier_name;

    console.log('✅ AWB code generated:', awb_code);
    console.log('🚚 Courier:', courier_name);

    // Step 5: Generate Shipping Label
    console.log('🏷️ Generating shipping label...');
    
    const labelResponse = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/courier/generate/label`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipment_id: [orderResult.shipment_id]
        })
      }
    );

    const labelResult = await labelResponse.json();
    console.log('✅ Shipping label generated:', labelResult.label_url);

    // Step 6: Schedule Pickup
    console.log('📅 Scheduling pickup...');
    
    const pickupResponse = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/courier/generate/pickup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipment_id: [orderResult.shipment_id]
        })
      }
    );

    const pickupResult = await pickupResponse.json();
    console.log('✅ Pickup scheduled:', pickupResult.response?.pickup_scheduled_date);

    // Return complete shipment details
    return {
      success: true,
      awb_code: awb_code,
      shipment_id: orderResult.shipment_id,
      order_id: orderResult.order_id,
      courier_name: courier_name,
      label_url: labelResult.label_url || null,
      pickup_scheduled: pickupResult.response?.pickup_scheduled_date || null,
      pickup_token: pickupResult.response?.pickup_token_number || null
    };

  } catch (error) {
    console.error('❌ Shiprocket shipment creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Track Shipment using AWB Code
 * Returns real-time tracking information
 */
async function trackShipment(awbCode) {
  try {
    console.log('📍 Tracking shipment:', awbCode);
    
    const token = await authenticateShiprocket();
    
    const response = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/courier/track/awb/${awbCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const trackingData = await response.json();
    
    if (!trackingData.tracking_data) {
      throw new Error('Tracking data not available');
    }

    console.log('✅ Tracking data retrieved');
    return {
      success: true,
      data: trackingData.tracking_data
    };
    
  } catch (error) {
    console.error('❌ Tracking error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel Shipment
 * Cancels shipment in Shiprocket system
 */
async function cancelShipment(awbCode) {
  try {
    console.log('🚫 Cancelling shipment:', awbCode);
    
    const token = await authenticateShiprocket();
    
    const response = await fetch(
      `${SHIPROCKET_CONFIG.baseUrl}/orders/cancel/shipment/awbs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          awbs: [awbCode]
        })
      }
    );

    const result = await response.json();
    
    console.log('✅ Shipment cancellation result:', result);
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Cancellation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  authenticateShiprocket,
  createShiprocketShipment,
  trackShipment,
  cancelShipment
};
```

---

## Backend Implementation - Order Verification with Shipping

### File: `backend/routes/razorpay.js` or `backend/controllers/razorpayController.js`

Update the payment verification endpoint to include Shiprocket integration:

```javascript
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { createShiprocketShipment } = require('../services/shiprocketService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Verify Payment and Create Order with Shipping
 * POST /razorpay/verify-payment
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    console.log('🔐 Verifying payment:', razorpay_payment_id);

    // ============================================
    // STEP 1: VERIFY PAYMENT SIGNATURE
    // ============================================
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed'
      });
    }

    console.log('✅ Payment signature verified');

    // ============================================
    // STEP 2: FETCH ORDER DETAILS FROM RAZORPAY
    // ============================================
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    
    // Extract data from order notes
    const cart = JSON.parse(razorpayOrder.notes.cart);
    const address = JSON.parse(razorpayOrder.notes.address);
    const userId = razorpayOrder.notes.userId;

    console.log('📦 Order details fetched from Razorpay');
    console.log('👤 User ID:', userId);
    console.log('🛒 Cart items:', cart.length);

    // ============================================
    // STEP 3: FETCH PRODUCT DETAILS
    // ============================================
    const enrichedItems = await Promise.all(
      cart.map(async (cartItem) => {
        try {
          const product = await Product.findById(cartItem.itemId);
          
          if (!product) {
            console.warn(`⚠️ Product not found: ${cartItem.itemId}`);
            return {
              itemId: cartItem.itemId,
              sku: cartItem.sku || 'UNKNOWN',
              quantity: cartItem.quantity,
              price: cartItem.price,
              name: cartItem.name || 'Unknown Product',
              description: cartItem.description || '',
              imageUrl: ''
            };
          }
          
          return {
            itemId: cartItem.itemId,
            sku: cartItem.sku,
            quantity: cartItem.quantity,
            price: cartItem.price,
            name: product.name,
            description: product.description || '',
            imageUrl: product.images?.[0] || ''
          };
        } catch (error) {
          console.error('❌ Error fetching product:', cartItem.itemId, error);
          return {
            itemId: cartItem.itemId,
            sku: cartItem.sku || 'UNKNOWN',
            quantity: cartItem.quantity,
            price: cartItem.price,
            name: cartItem.name || 'Unknown Product',
            description: '',
            imageUrl: ''
          };
        }
      })
    );

    console.log('✅ Product details enriched');

    // ============================================
    // STEP 4: CREATE ORDER IN DATABASE
    // ============================================
    const newOrder = await Order.create({
      user: userId,
      items: enrichedItems,
      totalAmount: razorpayOrder.amount / 100, // Convert paise to rupees
      address: address,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: 'SUCCESS',
      orderStatus: 'PENDING',
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Order created in database:', newOrder._id);

    // ============================================
    // STEP 5: CREATE SHIPMENT WITH SHIPROCKET
    // ============================================
    let awb_code = null;
    let shipment_id = null;
    let courier_name = null;

    try {
      console.log('🚀 Creating Shiprocket shipment...');
      
      const shipmentResult = await createShiprocketShipment(newOrder);
      
      if (shipmentResult.success) {
        awb_code = shipmentResult.awb_code;
        shipment_id = shipmentResult.shipment_id;
        courier_name = shipmentResult.courier_name;
        
        // Update order with shipment details
        newOrder.awb_code = awb_code;
        newOrder.shipment_id = shipment_id;
        newOrder.courier_name = courier_name;
        newOrder.orderStatus = 'PROCESSING';
        newOrder.label_url = shipmentResult.label_url;
        newOrder.pickup_scheduled = shipmentResult.pickup_scheduled;
        await newOrder.save();
        
        console.log('✅ Shipment created successfully');
        console.log('📦 AWB Code:', awb_code);
        console.log('🚚 Courier:', courier_name);
      } else {
        console.warn('⚠️ Shipment creation failed:', shipmentResult.error);
        // Order is still created, shipment can be created later
      }
    } catch (shipmentError) {
      console.error('❌ Shipment creation error:', shipmentError);
      // Continue - shipment can be created later
    }

    // ============================================
    // STEP 6: CLEAR USER'S CART
    // ============================================
    if (userId) {
      try {
        await Cart.deleteMany({ user: userId });
        console.log('✅ Cart cleared for user:', userId);
      } catch (cartError) {
        console.error('❌ Error clearing cart:', cartError);
        // Non-critical error, continue
      }
    }

    // ============================================
    // STEP 7: SEND SUCCESS RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      orderId: newOrder._id,
      awb_code: awb_code,
      shipment_id: shipment_id,
      courier_name: courier_name,
      message: 'Payment verified and order created successfully'
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## Frontend Implementation - Order Tracking

### File: `src/services/trackingService.js`

Create a new service for tracking functionality:

```javascript
/**
 * Tracking Service - Order Tracking Implementation
 * Handles fetching and displaying shipment tracking information
 */

import yoraaAPI from './yoraaAPI';
import { BASE_URL } from '../constants/config';

/**
 * Fetch tracking information for an order
 * @param {string} awbCode - Shiprocket AWB tracking number
 * @returns {Promise<Object>} Tracking data
 */
export const fetchTrackingInfo = async (awbCode) => {
  try {
    console.log('📍 Fetching tracking info for AWB:', awbCode);
    
    const response = await yoraaAPI.makeRequest(
      `/api/orders/track/${awbCode}`,
      'GET',
      null,
      true
    );
    
    if (response.success && response.data) {
      console.log('✅ Tracking info retrieved');
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Tracking data not available');
    }
  } catch (error) {
    console.error('❌ Error fetching tracking info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user's orders
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of orders per page
 * @returns {Promise<Object>} Orders data
 */
export const getUserOrders = async (page = 1, limit = 10) => {
  try {
    console.log('📦 Fetching user orders...');
    
    const response = await yoraaAPI.makeRequest(
      `/api/orders/user?page=${page}&limit=${limit}`,
      'GET',
      null,
      true
    );
    
    if (response.success && response.data) {
      console.log('✅ Orders retrieved:', response.data.length);
      return {
        success: true,
        orders: response.data,
        totalOrders: response.totalOrders,
        page: response.page,
        limit: response.limit
      };
    } else {
      throw new Error('Failed to fetch orders');
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelOrder = async (orderId) => {
  try {
    console.log('🚫 Cancelling order:', orderId);
    
    const response = await yoraaAPI.makeRequest(
      `/api/orders/cancel/${orderId}`,
      'POST',
      null,
      true
    );
    
    if (response.success) {
      console.log('✅ Order cancelled successfully');
      return {
        success: true,
        message: 'Order cancelled successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format tracking milestones for display
 * @param {Array} activities - Shipment track activities
 * @returns {Array} Formatted milestones
 */
export const formatTrackingMilestones = (activities) => {
  const milestoneMap = {
    'OP': { label: 'Order Placed', icon: 'shopping-cart' },
    'OFP': { label: 'Out for Pickup', icon: 'local-shipping' },
    'PKD': { label: 'Picked Up', icon: 'check-circle' },
    'PUD': { label: 'Pickup Done', icon: 'check-circle' },
    'IT': { label: 'In Transit', icon: 'local-shipping' },
    'RAD': { label: 'Reached Destination', icon: 'place' },
    'OFD': { label: 'Out for Delivery', icon: 'local-shipping' },
    'DLVD': { label: 'Delivered', icon: 'check-circle' },
    'RTO': { label: 'Return to Origin', icon: 'undo' },
    'CANCELLED': { label: 'Cancelled', icon: 'cancel' }
  };
  
  if (!activities || activities.length === 0) {
    return [];
  }
  
  return activities.map(activity => ({
    status: activity.status,
    label: milestoneMap[activity.status]?.label || activity.activity,
    icon: milestoneMap[activity.status]?.icon || 'circle',
    date: activity.date,
    location: activity.location,
    completed: true
  }));
};

export default {
  fetchTrackingInfo,
  getUserOrders,
  cancelOrder,
  formatTrackingMilestones
};
```

---

## Complete Order Management APIs

### Backend API Endpoints

#### 1. Get All Orders for User

```javascript
/**
 * GET /api/orders/user
 * Get all orders for authenticated user
 */
router.get('/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email phone');

    const totalOrders = await Order.countDocuments({ user: req.user.id });

    return res.status(200).json({
      success: true,
      data: orders,
      totalOrders,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});
```

#### 2. Get Order by ID

```javascript
/**
 * GET /api/orders/:id
 * Get specific order details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});
```

#### 3. Track Order

```javascript
/**
 * GET /api/orders/track/:awbCode
 * Get real-time tracking information
 */
router.get('/track/:awbCode', authenticate, async (req, res) => {
  try {
    const { awbCode } = req.params;
    
    // Import tracking service
    const { trackShipment } = require('../services/shiprocketService');
    
    const trackingResult = await trackShipment(awbCode);
    
    if (trackingResult.success) {
      return res.status(200).json({
        success: true,
        data: trackingResult.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Tracking data not available'
      });
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking data',
      error: error.message
    });
  }
});
```

#### 4. Cancel Order

```javascript
/**
 * POST /api/orders/cancel/:id
 * Cancel an order
 */
router.post('/cancel/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled'
      });
    }

    if (order.orderStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Cancel shipment in Shiprocket if AWB exists
    if (order.awb_code) {
      const { cancelShipment } = require('../services/shiprocketService');
      await cancelShipment(order.awb_code);
    }

    // Update order status
    order.orderStatus = 'CANCELLED';
    order.updated_at = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});
```

---

## Database Schema

### Order Model

```javascript
// File: backend/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Order Items
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: String
  }],
  
  // Order Details
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Delivery Address
  address: {
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    address: String,
    addressLine2: String,
    city: String,
    state: String,
    pinCode: String,
    country: String,
    addressType: String,
    landmark: String
  },
  
  // Payment Information
  paymentId: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  
  // Shipping Information
  awb_code: {
    type: String,
    default: null,
    index: true
  },
  shipment_id: {
    type: Number,
    default: null
  },
  courier_name: {
    type: String,
    default: null
  },
  label_url: {
    type: String,
    default: null
  },
  pickup_scheduled: {
    type: String,
    default: null
  },
  
  // Order Status
  orderStatus: {
    type: String,
    enum: [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
      'REFUNDED'
    ],
    default: 'PENDING',
    index: true
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes for efficient queries
orderSchema.index({ user: 1, created_at: -1 });
orderSchema.index({ awb_code: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

---

## Testing Guide

### Testing Shiprocket Integration

#### 1. Test Authentication

```bash
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@yoraa.in",
    "password": "R@2727thik"
  }'
```

Expected Response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "id": 12345,
  "first_name": "YORA",
  "last_name": "Fashion"
}
```

#### 2. Test Order Creation Flow

```javascript
// Run this test in your backend
const { createShiprocketShipment } = require('./services/shiprocketService');

const testOrder = {
  _id: '507f1f77bcf86cd799439011',
  items: [
    {
      itemId: '507f191e810c19729de860ea',
      sku: 'RED-M',
      name: 'Cotton T-Shirt',
      quantity: 2,
      price: 500
    }
  ],
  totalAmount: 1000,
  address: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '9876543210',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    country: 'India'
  }
};

createShiprocketShipment(testOrder).then(result => {
  console.log('Test Result:', result);
});
```

#### 3. Test Tracking

```javascript
const { trackShipment } = require('./services/shiprocketService');

trackShipment('141123221084922').then(result => {
  console.log('Tracking Result:', result);
});
```

### Manual Testing Checklist

- [ ] Payment successful → Order created in database
- [ ] Order has all required fields (items, address, payment)
- [ ] Shiprocket order created successfully
- [ ] AWB code generated and saved
- [ ] Shipping label PDF generated
- [ ] Pickup scheduled
- [ ] User can view order in orders list
- [ ] User can track order with AWB code
- [ ] User can cancel order (before delivery)
- [ ] Cart cleared after successful order

---

## Environment Variables Summary

```bash
# .env file

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Shiprocket Configuration
SHIPROCKET_EMAIL=support@yoraa.in
SHIPROCKET_PASSWORD=R@2727thik
SHIPROCKET_API_BASE_URL=https://apiv2.shiprocket.in/v1/external

# Database
MONGODB_URI=mongodb://localhost:27017/yora

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=8000
```

---

## Complete Flow Timeline

```
T=0s    User completes payment via Razorpay
        └─ Payment successful callback received

T=1s    POST /api/razorpay/verify-payment
        ├─ Verify payment signature
        └─ Signature verified ✅

T=2s    Fetch order details from Razorpay
        ├─ Extract cart data
        ├─ Extract address data
        └─ Extract user ID

T=3s    Enrich cart items with product details
        └─ Fetch from Product collection

T=4s    Create order in MongoDB
        └─ Order ID: 507f1f77bcf86cd799439011

T=5s    Authenticate with Shiprocket
        └─ Token received ✅

T=6s    Create order in Shiprocket
        └─ Shiprocket Order ID: 237157589
        └─ Shipment ID: 236612717

T=8s    Generate AWB code
        └─ AWB: 141123221084922
        └─ Courier: Xpressbees Surface

T=9s    Generate shipping label
        └─ Label URL: https://shiprocket-labels.s3...

T=10s   Schedule pickup
        └─ Pickup Date: 2024-10-15
        └─ Pickup Token: PKP123456

T=11s   Update order in database
        ├─ AWB code saved
        ├─ Shipment ID saved
        └─ Order status: PROCESSING

T=12s   Clear user's cart
        └─ Cart cleared ✅

T=13s   Send success response to frontend
        └─ Order created successfully
        └─ Navigate to Orders screen
```

---

## Key Takeaways

### ✅ Order Creation
1. Verify payment signature first
2. Create order in database
3. Never skip payment verification

### ✅ Shiprocket Integration
1. Authenticate before each operation
2. Handle errors gracefully (shipment can be created later)
3. Store AWB code for tracking
4. Generate shipping label for warehouse

### ✅ Order Tracking
1. Use AWB code for tracking
2. Display milestone-based progress
3. Show estimated delivery date
4. Allow order cancellation (before delivery)

### ✅ Error Handling
1. Log all errors for debugging
2. Continue order creation even if shipment fails
3. Provide user-friendly error messages
4. Implement retry mechanisms

---

## Troubleshooting

### Common Issues

**1. Shiprocket authentication fails**
- Check email and password in .env
- Verify API credentials are correct
- Check network connectivity

**2. AWB code not generated**
- Verify order data is complete
- Check pincode serviceability
- Ensure pickup location is configured

**3. Tracking data not available**
- AWB code might not be synced yet (wait 5-10 minutes)
- Verify AWB code is correct
- Check Shiprocket API status

**4. Order created but no shipment**
- Shipment creation is non-blocking
- Can be manually created from admin panel
- Check Shiprocket logs for errors

---

**End of Implementation Guide** 🎉

For support:
- Razorpay Docs: https://razorpay.com/docs/
- Shiprocket API: https://apidocs.shiprocket.in/
- YORA Backend Team: support@yoraa.in
