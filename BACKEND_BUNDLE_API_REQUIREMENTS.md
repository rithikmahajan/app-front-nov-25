# Backend Bundle API Requirements for Product Recommendations

## 📋 Overview

This document outlines the required backend API endpoints needed to implement the product bundling and recommendation feature (similar to Nike's "Complete the Look" feature) in the mobile app.

**Current Status:** ❌ API endpoints do not exist yet  
**Priority:** High - Frontend implementation is ready and waiting for these APIs

---

## 🎯 Required API Endpoints

### 1. Get All Active Bundles
**Purpose:** Fetch all active product bundles for display on homepage/category pages

**Endpoint:** `GET /api/bundles`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `isActive` (optional, boolean) - Filter by active status (default: true)
- `limit` (optional, number) - Limit results (default: 10)
- `page` (optional, number) - Page number for pagination

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "bundles": [
    {
      "_id": "bundle_id_123",
      "name": "Summer Essential Bundle",
      "description": "Everything you need for summer",
      "products": [
        {
          "_id": "product_id_1",
          "name": "White T-Shirt",
          "price": 899,
          "images": [
            "https://cdn.example.com/image1.jpg",
            "https://cdn.example.com/image2.jpg"
          ],
          "description": "Premium cotton t-shirt",
          "category": "Clothing",
          "stock": 100,
          "sku": "TS001",
          "sizes": ["S", "M", "L", "XL"]
        },
        {
          "_id": "product_id_2",
          "name": "Denim Shorts",
          "price": 1499,
          "images": ["https://cdn.example.com/shorts.jpg"],
          "category": "Clothing",
          "stock": 50
        }
      ],
      "isActive": true,
      "discount": 10,
      "totalPrice": 2398,
      "discountedPrice": 2158.20,
      "createdAt": "2025-10-30T10:00:00.000Z",
      "updatedAt": "2025-10-30T10:00:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching bundles"
}
```

---

### 2. Get Bundle by ID
**Purpose:** Fetch details of a specific bundle

**Endpoint:** `GET /api/bundles/:id`

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (required) - Bundle ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "bundle": {
    "_id": "bundle_id_123",
    "name": "Summer Essential Bundle",
    "description": "Everything you need for summer",
    "products": [
      {
        "_id": "product_id_1",
        "name": "White T-Shirt",
        "price": 899,
        "images": ["https://cdn.example.com/image1.jpg"],
        "stock": 100
      }
    ],
    "isActive": true,
    "discount": 10,
    "totalPrice": 2398,
    "discountedPrice": 2158.20
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Bundle not found"
}
```

---

### 3. Get Bundles for Specific Product (MOST IMPORTANT)
**Purpose:** Show "Complete the Look" / "Frequently Bought Together" recommendations on product detail pages

**Endpoint:** `GET /api/bundles/product/:productId`

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `productId` (required) - Product ID to find related bundles

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "bundles": [
    {
      "_id": "bundle_id_123",
      "name": "Complete the Look",
      "description": "Style this with",
      "products": [
        {
          "_id": "current_product_id",
          "name": "White T-Shirt",
          "price": 899,
          "images": ["https://cdn.example.com/tshirt.jpg"]
        },
        {
          "_id": "recommended_product_1",
          "name": "Denim Shorts",
          "price": 1499,
          "images": ["https://cdn.example.com/shorts.jpg"]
        },
        {
          "_id": "recommended_product_2",
          "name": "Sneakers",
          "price": 2999,
          "images": ["https://cdn.example.com/sneakers.jpg"]
        }
      ],
      "isActive": true,
      "discount": 15,
      "totalPrice": 5397,
      "discountedPrice": 4587.45
    }
  ]
}
```

**No Bundles Response (200 OK):**
```json
{
  "success": true,
  "count": 0,
  "bundles": []
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 🗄️ Database Schema

### Bundle Model (Mongoose Example)

```javascript
const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  discountedPrice: {
    type: Number,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Pre-save hook to calculate prices
bundleSchema.pre('save', async function(next) {
  if (this.isModified('products') || this.isModified('discount')) {
    await this.populate('products');
    
    // Calculate total price
    this.totalPrice = this.products.reduce((sum, product) => {
      return sum + (product.price || 0);
    }, 0);
    
    // Calculate discounted price
    if (this.discount > 0) {
      this.discountedPrice = this.totalPrice * (1 - this.discount / 100);
    } else {
      this.discountedPrice = this.totalPrice;
    }
  }
  next();
});

module.exports = mongoose.model('Bundle', bundleSchema);
```

---

## 💻 Backend Implementation Example

### Controller: `src/controllers/bundleController.js`

```javascript
const Bundle = require('../models/Bundle');
const Product = require('../models/Product');

// Get all active bundles
exports.getAllBundles = async (req, res) => {
  try {
    const { isActive = true, limit = 10, page = 1 } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const bundles = await Bundle.find(query)
      .populate('products')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ displayOrder: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bundles.length,
      bundles
    });
  } catch (error) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bundles'
    });
  }
};

// Get bundle by ID
exports.getBundleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bundle = await Bundle.findById(id).populate('products');
    
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      bundle
    });
  } catch (error) {
    console.error('Error fetching bundle:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bundle'
    });
  }
};

// Get bundles for specific product (MOST IMPORTANT)
exports.getBundlesForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find all active bundles that contain this product
    const bundles = await Bundle.find({
      products: productId,
      isActive: true
    })
    .populate('products')
    .sort({ displayOrder: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bundles.length,
      bundles
    });
  } catch (error) {
    console.error('Error fetching product bundles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product bundles'
    });
  }
};

// Create new bundle (Admin only)
exports.createBundle = async (req, res) => {
  try {
    const { name, description, products, discount, isActive } = req.body;
    
    // Validate products exist
    const productDocs = await Product.find({ _id: { $in: products } });
    if (productDocs.length !== products.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found'
      });
    }
    
    const bundle = new Bundle({
      name,
      description,
      products,
      discount,
      isActive
    });
    
    await bundle.save();
    await bundle.populate('products');
    
    res.status(201).json({
      success: true,
      bundle
    });
  } catch (error) {
    console.error('Error creating bundle:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bundle'
    });
  }
};

// Update bundle (Admin only)
exports.updateBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const bundle = await Bundle.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('products');
    
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      bundle
    });
  } catch (error) {
    console.error('Error updating bundle:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bundle'
    });
  }
};

// Delete bundle (Admin only)
exports.deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bundle = await Bundle.findByIdAndDelete(id);
    
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bundle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bundle:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bundle'
    });
  }
};
```

---

## 🛣️ Routes Configuration

### `src/routes/bundleRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const bundleController = require('../controllers/bundleController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', bundleController.getAllBundles);
router.get('/:id', bundleController.getBundleById);
router.get('/product/:productId', bundleController.getBundlesForProduct);

// Admin routes
router.post('/', protect, authorize('admin'), bundleController.createBundle);
router.put('/:id', protect, authorize('admin'), bundleController.updateBundle);
router.delete('/:id', protect, authorize('admin'), bundleController.deleteBundle);

module.exports = router;
```

### Add to main `app.js` or `server.js`:

```javascript
const bundleRoutes = require('./routes/bundleRoutes');
app.use('/api/bundles', bundleRoutes);
```

---

## 🧪 Testing the APIs

### Test with cURL

```bash
# 1. Get all bundles
curl -X GET "http://185.193.19.244:8080/api/bundles" \
  -H "Content-Type: application/json"

# 2. Get bundle by ID
curl -X GET "http://185.193.19.244:8080/api/bundles/BUNDLE_ID_HERE" \
  -H "Content-Type: application/json"

# 3. Get bundles for a product (MOST IMPORTANT)
curl -X GET "http://185.193.19.244:8080/api/bundles/product/PRODUCT_ID_HERE" \
  -H "Content-Type: application/json"

# Example with actual product ID from your app:
curl -X GET "http://185.193.19.244:8080/api/bundles/product/68da56fc0561b958f6694e31" \
  -H "Content-Type: application/json"
```

### Test with Postman

1. **Collection:** Create "Bundle APIs" collection
2. **Requests:**
   - GET All Bundles: `{{base_url}}/api/bundles`
   - GET Bundle by ID: `{{base_url}}/api/bundles/:id`
   - GET Product Bundles: `{{base_url}}/api/bundles/product/:productId`

---

## 📊 Data Flow

```
User views Product Detail Page
          ↓
Frontend calls: GET /api/bundles/product/{productId}
          ↓
Backend searches for bundles containing that product
          ↓
Returns all active bundles with full product details
          ↓
Frontend displays "Complete the Look" section
          ↓
User clicks "Add Bundle to Cart"
          ↓
Frontend adds all products from bundle to cart
```

---

## 🎨 UI Examples (What Frontend Will Build)

### Product Detail Page

```
┌─────────────────────────────────────────────┐
│  [Product Image]                            │
│  Product Name - ₹899                        │
│  [Add to Cart]                              │
├─────────────────────────────────────────────┤
│  🎁 Complete the Look                       │
│                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  IMG   │  │  IMG   │  │  IMG   │       │
│  │ This   │  │ Shorts │  │ Shoes  │       │
│  │ ₹899   │  │ ₹1499  │  │ ₹2999  │       │
│  └────────┘  └────────┘  └────────┘       │
│                                             │
│  Total: ₹5397  →  Save 15%  →  ₹4587      │
│  [ Add All to Cart ]                       │
└─────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Backend Developer Tasks:

- [ ] Create Bundle model/schema in database
- [ ] Implement `GET /api/bundles` endpoint
- [ ] Implement `GET /api/bundles/:id` endpoint
- [ ] Implement `GET /api/bundles/product/:productId` endpoint (Priority #1)
- [ ] Add admin endpoints for bundle CRUD operations
- [ ] Add proper error handling and validation
- [ ] Test all endpoints with sample data
- [ ] Update API documentation
- [ ] Deploy to production server
- [ ] Notify frontend team when ready

### Frontend Developer Tasks (Already Done):

- [x] Create bundleService.js
- [x] Create BundleRecommendations component
- [x] Integrate into ProductDetailsMain screen
- [x] Add error handling and loading states
- [ ] Test with real backend API (waiting for backend)

---

## 🚀 Priority & Timeline

**Priority:** 🔴 HIGH  
**Estimated Backend Development Time:** 4-6 hours  
**Reason:** Frontend implementation is complete and ready to test

### Suggested Timeline:
- **Day 1:** Create database schema and model
- **Day 1:** Implement the 3 GET endpoints
- **Day 2:** Add admin CRUD endpoints
- **Day 2:** Testing and deployment

---

## 📞 Contact & Questions

**Frontend Developer:** Ready and waiting for APIs  
**Current Status:** Frontend shows "No bundles configured" message  

### When APIs are ready:
1. Test endpoint: `GET /api/bundles/product/{productId}`
2. Verify response format matches documentation
3. Create test bundles in admin panel
4. Test on mobile app
5. Take screenshots and verify UI

---

## 🔗 Related Files

**Frontend Files (Already Created):**
- `src/services/bundleService.js` - API service layer
- `src/components/BundleRecommendations.js` - UI component
- `src/screens/ProductDetailsMain.js` - Integration point

**Backend Files (Need to Create):**
- `src/models/Bundle.js` - Database model
- `src/controllers/bundleController.js` - Business logic
- `src/routes/bundleRoutes.js` - API routes

---

**Document Version:** 1.0  
**Last Updated:** October 30, 2025  
**Status:** 🟡 Waiting for Backend Implementation
