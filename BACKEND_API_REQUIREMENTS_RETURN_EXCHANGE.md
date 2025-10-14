# 🔌 Backend API Requirements - Return/Exchange/Cancel Flow

## 📋 Overview

This document outlines the **exact backend API endpoints** required to support the Return, Exchange, and Cancel Order functionality in the YORA mobile app.

**Frontend Implementation:** ✅ Complete  
**Backend Implementation:** ⏳ Required

---

## 🎯 Required API Endpoints

### 1. Return Order Endpoint

**Endpoint:** `POST /api/orders/return`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
{
  orderId: String,        // Order ID to return
  reason: String,         // Reason for return
  images: [File, File]    // 1-3 image files
}
```

**Request Example:**
```javascript
// FormData structure
const formData = new FormData();
formData.append('orderId', '64f8a2c3e4b0c8d9e123456');
formData.append('reason', 'Product not as expected');
formData.append('images', {
  uri: 'file:///path/to/image1.jpg',
  type: 'image/jpeg',
  name: 'return_image_1.jpg'
});
formData.append('images', {
  uri: 'file:///path/to/image2.jpg',
  type: 'image/jpeg',
  name: 'return_image_2.jpg'
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "order": {
    "_id": "64f8a2c3e4b0c8d9e123456",
    "orderNumber": "YORA2024001",
    "refund": {
      "status": "PENDING",
      "reason": "Product not as expected",
      "requestDate": "2024-10-14T10:30:00.000Z",
      "images": [
        "https://cloudinary.com/yoraa/returns/image1.jpg",
        "https://cloudinary.com/yoraa/returns/image2.jpg"
      ]
    }
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Order ID and reason are required"
}
```

**400 - Return Window Expired:**
```json
{
  "success": false,
  "message": "Return window has expired. Returns are only allowed within 4 days of delivery."
}
```

**404 - Order Not Found:**
```json
{
  "success": false,
  "message": "Order not found or not eligible for return"
}
```

**Implementation Requirements:**
1. ✅ Validate user owns the order
2. ✅ Check order status is "DELIVERED"
3. ✅ Verify return window (4 days from delivery)
4. ✅ Upload images to Cloudinary/S3
5. ✅ Update order with refund details
6. ✅ Send email/SMS notification to customer
7. ✅ Notify admin of new return request

---

### 2. Exchange Order Endpoint

**Endpoint:** `POST /api/orders/exchange`

**Authentication:** Required (Bearer token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "orderId": "64f8a2c3e4b0c8d9e123456",
  "reason": "Size/fit issue",
  "desiredSize": "L"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Exchange request submitted successfully",
  "order": {
    "_id": "64f8a2c3e4b0c8d9e123456",
    "orderNumber": "YORA2024001",
    "exchange": {
      "status": "PENDING",
      "reason": "Size/fit issue",
      "desiredSize": "L",
      "requestDate": "2024-10-14T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Order ID, reason, and desired size are required"
}
```

**400 - Size Not Available:**
```json
{
  "success": false,
  "message": "The selected size is not available for this product"
}
```

**404 - Order Not Found:**
```json
{
  "success": false,
  "message": "Order not found or not eligible for exchange"
}
```

**Implementation Requirements:**
1. ✅ Validate user owns the order
2. ✅ Check order status is "DELIVERED"
3. ✅ Verify exchange window (7 days from delivery)
4. ✅ Check desired size availability
5. ✅ Update order with exchange details
6. ✅ Send email/SMS notification to customer
7. ✅ Notify admin of new exchange request

---

### 3. Cancel Order Endpoint

**Endpoint:** `PUT /api/orders/:orderId/cancel`

**Authentication:** Required (Bearer token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**URL Parameters:**
- `orderId` - The ID of the order to cancel

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "64f8a2c3e4b0c8d9e123456",
    "orderNumber": "YORA2024001",
    "orderStatus": "CANCELLED",
    "paymentStatus": "REFUNDED",
    "cancelledAt": "2024-10-14T10:30:00.000Z",
    "cancellationReason": "Customer requested cancellation"
  }
}
```

**Error Responses:**

**400 - Cannot Cancel:**
```json
{
  "success": false,
  "message": "Order cannot be cancelled. It has already been shipped."
}
```

**404 - Order Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Implementation Requirements:**
1. ✅ Validate user owns the order
2. ✅ Check order status allows cancellation (PENDING, CONFIRMED, PROCESSING)
3. ✅ Cancel Shiprocket shipment if created
4. ✅ Initiate refund if payment was made
5. ✅ Update order status to CANCELLED
6. ✅ Send email/SMS notification to customer
7. ✅ Notify admin of cancellation

---

### 4. Get Return Orders Endpoint

**Endpoint:** `GET /api/orders/return-orders`

**Authentication:** Required (Bearer token)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "returnOrders": [
    {
      "_id": "64f8a2c3e4b0c8d9e123456",
      "orderNumber": "YORA2024001",
      "items": [
        {
          "name": "Product Name",
          "imageUrl": "https://...",
          "size": "M",
          "quantity": 1,
          "price": 999
        }
      ],
      "total_price": 999,
      "refund": {
        "status": "PENDING",
        "reason": "Quality not as expected",
        "requestDate": "2024-10-14T10:00:00.000Z",
        "images": ["https://..."],
        "returnAwbCode": null,
        "refundAmount": null,
        "refundDate": null
      }
    }
  ]
}
```

**Implementation Requirements:**
1. ✅ Filter orders by user ID
2. ✅ Filter orders with refund status
3. ✅ Sort by request date (newest first)
4. ✅ Include order items and images
5. ✅ Include refund tracking details

---

## 📦 Database Schema Updates

### Order Model Updates

```javascript
const orderSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Order Status
  orderStatus: {
    type: String,
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'EXCHANGE_REQUESTED'
    ],
    default: 'PENDING'
  },
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // Refund/Return Details
  refund: {
    status: {
      type: String,
      enum: [
        'PENDING',           // Request submitted
        'APPROVED',          // Admin approved, pickup scheduled
        'REJECTED',          // Admin rejected
        'ITEM_RECEIVED',     // Item received at warehouse
        'REFUND_INITIATED',  // Refund processing
        'COMPLETED'          // Refund completed
      ],
      default: 'PENDING'
    },
    reason: {
      type: String,
      required: true
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    images: [{
      type: String  // Cloudinary URLs
    }],
    
    // Shiprocket Return Tracking
    returnShipmentId: String,
    returnAwbCode: String,
    pickupScheduledDate: Date,
    itemReceivedDate: Date,
    
    // Refund Details
    refundAmount: Number,
    refundDate: Date,
    refundMethod: {
      type: String,
      enum: ['ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'STORE_CREDIT']
    },
    refundTransactionId: String,
    
    // Admin Notes
    adminNotes: String,
    rejectionReason: String
  },
  
  // Exchange Details
  exchange: {
    status: {
      type: String,
      enum: [
        'PENDING',           // Request submitted
        'APPROVED',          // Admin approved
        'REJECTED',          // Admin rejected
        'RETURN_SHIPPED',    // Original item being returned
        'ITEM_RECEIVED',     // Original item received
        'NEW_ITEM_SHIPPED',  // New item shipped
        'COMPLETED'          // Exchange completed
      ],
      default: 'PENDING'
    },
    reason: {
      type: String,
      required: true
    },
    desiredSize: {
      type: String,
      required: true
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    
    // Shiprocket Tracking
    returnShipmentId: String,
    returnAwbCode: String,
    forwardShipmentId: String,
    forwardAwbCode: String,
    
    // Timeline
    pickupScheduledDate: Date,
    itemReceivedDate: Date,
    newItemShippedDate: Date,
    exchangeCompletedDate: Date,
    
    // Admin Notes
    adminNotes: String,
    rejectionReason: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

---

## 🔐 Security & Validation

### Authentication
```javascript
// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
```

### Order Ownership Validation
```javascript
const validateOrderOwnership = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    userId: userId
  });
  
  if (!order) {
    throw new Error('Order not found or access denied');
  }
  
  return order;
};
```

### Return Window Validation
```javascript
const validateReturnWindow = (deliveryDate) => {
  const currentDate = new Date();
  const deliveryDateObj = new Date(deliveryDate);
  const daysSinceDelivery = Math.floor(
    (currentDate - deliveryDateObj) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceDelivery > 4) {
    throw new Error('Return window has expired (4 days from delivery)');
  }
  
  return true;
};
```

---

## 📤 Image Upload Configuration

### Cloudinary Setup

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload return images
const uploadReturnImages = async (files) => {
  const imageUrls = [];
  
  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'yoraa/returns',
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      
      imageUrls.push(result.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload images');
    }
  }
  
  return imageUrls;
};
```

---

## 📧 Notification Templates

### Return Request - Customer Email
```html
<h2>Return Request Received</h2>
<p>Dear {{customerName}},</p>
<p>We have received your return request for order <strong>{{orderNumber}}</strong>.</p>

<h3>Return Details:</h3>
<ul>
  <li>Order ID: {{orderNumber}}</li>
  <li>Reason: {{returnReason}}</li>
  <li>Request Date: {{requestDate}}</li>
</ul>

<p>We will process your request within 2-3 business days.</p>
<p>You will receive a pickup confirmation email once approved.</p>

<p>Thank you,<br>YORAA Team</p>
```

### Exchange Request - Customer Email
```html
<h2>Exchange Request Received</h2>
<p>Dear {{customerName}},</p>
<p>We have received your exchange request for order <strong>{{orderNumber}}</strong>.</p>

<h3>Exchange Details:</h3>
<ul>
  <li>Order ID: {{orderNumber}}</li>
  <li>Reason: {{exchangeReason}}</li>
  <li>Desired Size: {{desiredSize}}</li>
  <li>Request Date: {{requestDate}}</li>
</ul>

<p>We will process your request within 2-3 business days.</p>

<p>Thank you,<br>YORAA Team</p>
```

### Order Cancelled - Customer Email
```html
<h2>Order Cancelled</h2>
<p>Dear {{customerName}},</p>
<p>Your order <strong>{{orderNumber}}</strong> has been cancelled successfully.</p>

<h3>Cancellation Details:</h3>
<ul>
  <li>Order ID: {{orderNumber}}</li>
  <li>Cancelled At: {{cancelledAt}}</li>
  <li>Refund Amount: ₹{{refundAmount}}</li>
</ul>

<p>Your refund will be processed within 5-7 business days.</p>

<p>Thank you,<br>YORAA Team</p>
```

---

## 🧪 Testing Endpoints

### Using cURL

**Test Return Endpoint:**
```bash
curl -X POST http://localhost:8000/api/orders/return \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "orderId=64f8a2c3e4b0c8d9e123456" \
  -F "reason=Product not as expected" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Test Exchange Endpoint:**
```bash
curl -X POST http://localhost:8000/api/orders/exchange \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "64f8a2c3e4b0c8d9e123456",
    "reason": "Size/fit issue",
    "desiredSize": "L"
  }'
```

**Test Cancel Endpoint:**
```bash
curl -X PUT http://localhost:8000/api/orders/64f8a2c3e4b0c8d9e123456/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

**Test Get Return Orders:**
```bash
curl -X GET http://localhost:8000/api/orders/return-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Shiprocket Integration

### Create Return Shipment

```javascript
const createReturnShipment = async (order) => {
  try {
    // Get Shiprocket auth token
    const authResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD
        })
      }
    );
    
    const authData = await authResponse.json();
    const token = authData.token;
    
    // Create return order
    const returnData = {
      order_id: `${order.orderNumber}_RETURN`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: "Primary",
      
      // Pickup from customer
      pickup_customer_name: order.address.firstName,
      pickup_last_name: order.address.lastName,
      pickup_address: order.address.addressLine1,
      pickup_city: order.address.city,
      pickup_state: order.address.state,
      pickup_country: "India",
      pickup_pincode: order.address.zipCode,
      pickup_phone: order.address.phoneNumber,
      
      // Deliver to warehouse
      billing_customer_name: "YORAA Warehouse",
      billing_address: process.env.WAREHOUSE_ADDRESS,
      billing_city: process.env.WAREHOUSE_CITY,
      billing_pincode: process.env.WAREHOUSE_PINCODE,
      billing_state: process.env.WAREHOUSE_STATE,
      billing_country: "India",
      billing_phone: process.env.WAREHOUSE_PHONE,
      billing_email: process.env.WAREHOUSE_EMAIL,
      
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.sku || 'N/A',
        units: item.quantity,
        selling_price: item.price
      })),
      
      payment_method: "Prepaid",
      sub_total: order.totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };
    
    const response = await fetch(
      'https://apiv2.shiprocket.in/v1/external/orders/create/return',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(returnData)
      }
    );
    
    const result = await response.json();
    
    if (result.order_id) {
      return {
        shipmentId: result.shipment_id,
        awbCode: result.awb_code,
        courierId: result.courier_id,
        courierName: result.courier_name
      };
    } else {
      throw new Error('Failed to create return shipment');
    }
  } catch (error) {
    console.error('Error creating return shipment:', error);
    throw error;
  }
};
```

---

## ✅ Implementation Checklist

### Backend Developer Tasks

#### API Endpoints
- [ ] POST /api/orders/return
- [ ] POST /api/orders/exchange
- [ ] PUT /api/orders/:id/cancel
- [ ] GET /api/orders/return-orders

#### Database
- [ ] Update Order schema with refund/exchange fields
- [ ] Create indexes for efficient queries
- [ ] Add validation rules

#### Image Upload
- [ ] Set up Cloudinary account
- [ ] Configure environment variables
- [ ] Implement image upload function
- [ ] Add image optimization

#### Shiprocket Integration
- [ ] Set up Shiprocket credentials
- [ ] Implement return shipment creation
- [ ] Add webhook handlers for tracking

#### Notifications
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Create email templates
- [ ] Implement SMS service (Twilio)
- [ ] Create SMS templates

#### Security
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Add authentication middleware
- [ ] Add order ownership validation

#### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test with Postman/cURL
- [ ] Load testing

---

## 📞 Support

**Questions?**
Contact the frontend team for clarification on:
- API request/response formats
- Expected error messages
- Navigation flows
- UI/UX requirements

**Backend Team Lead:** [Your Name]  
**Frontend Team Lead:** [Frontend Lead Name]  
**Project Manager:** [PM Name]

---

**Status:** 📝 Specification Complete - Ready for Implementation  
**Priority:** 🔴 High  
**Estimated Time:** 2-3 days  
**Last Updated:** October 14, 2025
