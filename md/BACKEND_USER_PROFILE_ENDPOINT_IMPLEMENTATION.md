# 🔴 MISSING BACKEND ENDPOINT: `/api/user/profile`

## ⚠️ Current Issue

The frontend app is calling `GET /api/user/profile` but the backend is returning a **404 error**:

```json
{
  "success": false,
  "message": "API endpoint not found: GET /api/user/profile",
  "data": null,
  "statusCode": 404
}
```

**Error Location:** `yoraaAPI.js` line ~390-430  
**Called From:** `ProfileScreen.js` line ~211

---

## 📋 Required Backend Implementation

### **Endpoint Details**

```
GET /api/user/profile
```

**Authentication:** ✅ Required (JWT Bearer Token)  
**Method:** `GET`  
**Content-Type:** `application/json`

---

## 🔧 Backend Implementation Guide

### **1. Route Definition**

The backend needs to add this route to the user routes file (e.g., `routes/user.js` or `routes/profile.js`):

```javascript
// routes/user.js or routes/profile.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Your JWT auth middleware

/**
 * @route   GET /api/user/profile
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user is populated by authMiddleware from JWT token
    const userId = req.user.id || req.user._id;
    
    // Fetch user from database (adjust based on your DB)
    const user = await User.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
        statusCode: 404
      });
    }
    
    // Return user profile
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      data: null,
      statusCode: 500
    });
  }
});

module.exports = router;
```

---

### **2. Register Route in Main App**

Add the route to your main Express app (e.g., `app.js` or `server.js`):

```javascript
// app.js or server.js

const userRoutes = require('./routes/user');

// Register user routes under /api/user
app.use('/api/user', userRoutes);
```

---

### **3. Expected Response Format**

#### **Success Response (200)**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "67078b8f9e826c5d8c3d4e5f",
    "email": "rithik@example.com",
    "name": "Rithik Mahajan",
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "phone": "+919876543210",
    "gender": "male",
    "dateOfBirth": "1995-05-15",
    "profileImage": "https://example.com/images/profile.jpg",
    "addresses": [
      {
        "_id": "addr123",
        "type": "home",
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India",
        "isDefault": true
      }
    ],
    "createdAt": "2024-10-10T12:00:00.000Z",
    "updatedAt": "2024-10-12T08:30:00.000Z"
  },
  "statusCode": 200
}
```

#### **Error Response - User Not Found (404)**

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "statusCode": 404
}
```

#### **Error Response - Unauthorized (401)**

```json
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "statusCode": 401
}
```

#### **Error Response - Invalid Token (403)**

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null,
  "statusCode": 403
}
```

#### **Error Response - Server Error (500)**

```json
{
  "success": false,
  "message": "Server error while fetching profile",
  "data": null,
  "statusCode": 500
}
```

---

## 📊 Required User Schema Fields

The user document in your database should include these fields:

```javascript
// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for social login users
  },
  
  // Profile Information
  name: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  
  // Authentication Providers
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Addresses (embedded or referenced)
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
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

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🔐 Authentication Middleware

The endpoint requires JWT authentication. Here's the middleware implementation:

```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null,
        statusCode: 401
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token not found',
        data: null,
        statusCode: 401
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found or token invalid',
        data: null,
        statusCode: 403
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        data: null,
        statusCode: 403
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expired',
        data: null,
        statusCode: 403
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      data: null,
      statusCode: 500
    });
  }
};

module.exports = authMiddleware;
```

---

## 🧪 Testing the Endpoint

### **1. Using cURL**

```bash
# Test with authentication token
curl -X GET \
  http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### **2. Using Postman**

1. **Create a new GET request:**
   - URL: `http://185.193.19.244:8000/api/user/profile`
   
2. **Add Headers:**
   - `Authorization`: `Bearer YOUR_JWT_TOKEN_HERE`
   - `Content-Type`: `application/json`
   
3. **Send the request**

### **3. Using JavaScript (Frontend Test)**

```javascript
// Test from browser console or React Native
const testProfileEndpoint = async () => {
  const token = 'YOUR_JWT_TOKEN_HERE';
  
  try {
    const response = await fetch('http://185.193.19.244:8000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Profile Response:', data);
    
    if (data.success) {
      console.log('✅ User Profile:', data.data);
    } else {
      console.error('❌ Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
};

testProfileEndpoint();
```

---

## 🔄 Frontend Integration (Already Implemented)

The frontend is already configured to call this endpoint. Here's the implementation in `yoraaAPI.js`:

```javascript
// src/services/yoraaAPI.js (lines 383-430)

async getUserProfile() {
  try {
    console.log('🔍 Fetching user profile from backend...');
    
    const response = await this.makeRequest('/api/user/profile', 'GET');
    
    console.log('📊 Profile response:', response);
    
    if (response.success && response.data) {
      console.log('✅ User profile loaded from backend');
      return {
        success: true,
        data: response.data,
        message: response.message || 'Profile loaded successfully'
      };
    } else {
      console.warn('⚠️ Backend returned unsuccessful response');
      
      // FALLBACK: Return Firebase data
      const currentUser = auth().currentUser;
      if (currentUser) {
        console.log('📱 Using Firebase user data as fallback');
        return {
          success: true,
          data: {
            email: currentUser.email,
            name: currentUser.displayName || '',
            phone: currentUser.phoneNumber || '',
            profileImage: currentUser.photoURL || null,
          },
          message: 'Using fallback profile data - backend endpoint not implemented'
        };
      }
      
      throw new Error(response.message || 'Failed to load profile');
    }
  } catch (error) {
    console.error(`API Error [GET /api/user/profile]:`, error);
    
    // FALLBACK: Return Firebase data on error
    const currentUser = auth().currentUser;
    if (currentUser) {
      console.log('📱 API failed, using Firebase user data');
      return {
        success: true,
        data: {
          email: currentUser.email,
          name: currentUser.displayName || '',
          phone: currentUser.phoneNumber || '',
          profileImage: currentUser.photoURL || null,
        },
        message: 'Using fallback profile data - backend endpoint not implemented'
      };
    }
    
    throw error;
  }
}
```

**Called from:** `ProfileScreen.js` (line ~211):

```javascript
const profileResponse = await yoraaAPI.getUserProfile();
console.log('📊 Profile data for ProfileScreen:', profileResponse);
```

---

## ✅ Implementation Checklist

Backend team should complete these tasks:

- [ ] Create `routes/user.js` or add route to existing user routes file
- [ ] Implement `GET /api/user/profile` endpoint with authentication
- [ ] Ensure JWT authentication middleware is working
- [ ] Verify User model has all required fields (email, name, firstName, lastName, phone, etc.)
- [ ] Test endpoint with valid JWT token
- [ ] Test endpoint with invalid/expired token
- [ ] Test endpoint with missing token
- [ ] Verify response format matches specification
- [ ] Deploy to production server (http://185.193.19.244:8000)
- [ ] Test from frontend app to confirm integration

---

## 🎯 Expected Behavior After Implementation

Once implemented, the frontend will:

1. ✅ Call `GET /api/user/profile` on ProfileScreen load
2. ✅ Receive user data from backend database
3. ✅ Display accurate profile information (not Firebase fallback)
4. ✅ No more 404 errors in console
5. ✅ Unified user data across all screens

---

## 📞 Backend Team Action Required

**Priority:** 🔴 HIGH  
**Impact:** Currently using Firebase fallback data, but backend database should be source of truth  
**Estimated Time:** 30-60 minutes to implement and test

**Questions?**
- Check existing `/api/profile` endpoint (currently implemented as `PUT /api/profile` for updates)
- May need to refactor to support both GET and PUT on `/api/profile`
- Or create separate `/api/user/profile` (GET) and `/api/profile` (PUT)

---

## 📚 Related Documentation

- **Authentication Flow:** See `BACKEND_HANDOFF.md` lines 65-175
- **Existing Endpoints:** See `BACKEND_HANDOFF.md` lines 176-250
- **Frontend API Service:** `src/services/yoraaAPI.js`
- **Profile Screen:** `src/screens/ProfileScreen.js`

---

**Document Created:** October 12, 2025  
**Status:** 🔴 Endpoint Not Implemented  
**Next Steps:** Backend team to implement endpoint and notify frontend team for testing
