# 🔴 Missing Backend Endpoints - Quick Checklist

## Overview

This document tracks all backend API endpoints that the frontend is calling but are not yet implemented on the backend server (`http://185.193.19.244:8000`).

**Last Updated:** October 12, 2025

---

## ❌ Currently Missing Endpoints

### 1. **User Profile - GET**

```
GET /api/user/profile
```

**Status:** 🔴 NOT IMPLEMENTED (Returns 404)  
**Priority:** HIGH  
**Impact:** Profile screen uses Firebase fallback data instead of backend database  
**Documentation:** `BACKEND_USER_PROFILE_ENDPOINT_IMPLEMENTATION.md`

**Frontend Usage:**
- File: `src/services/yoraaAPI.js` (line ~383)
- Called from: `ProfileScreen.js` (line ~211)
- Purpose: Fetch user profile data from backend database

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "gender": "male",
    "profileImage": "url"
  }
}
```

---

## ✅ Currently Implemented Endpoints

### Authentication Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/auth/register` | POST | ✅ Working | User registration |
| `/api/auth/login` | POST | ✅ Working | Email/password login |
| `/api/auth/login/firebase` | POST | ✅ Working | Firebase authentication |
| `/api/auth/logout` | POST | ✅ Working | User logout |

### Profile Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/profile` | PUT | ✅ Working | Update user profile |
| `/api/user/profile` | GET | ❌ Missing | **NEEDS IMPLEMENTATION** |

### Other Endpoints

Based on `BACKEND_HANDOFF.md`, these should be implemented:

| Category | Endpoint | Method | Status | Priority |
|----------|----------|--------|--------|----------|
| **Products** | `/api/categories` | GET | ❓ Unknown | Medium |
| **Products** | `/api/products` | GET | ❓ Unknown | High |
| **Products** | `/api/products/:id` | GET | ❓ Unknown | High |
| **Products** | `/api/products/search` | GET | ❓ Unknown | High |
| **Cart** | `/api/cart` | GET | ❓ Unknown | High |
| **Cart** | `/api/cart/add` | POST | ❓ Unknown | High |
| **Orders** | `/api/orders` | POST | ❓ Unknown | High |
| **Orders** | `/api/orders` | GET | ❓ Unknown | Medium |
| **Wishlist** | `/api/wishlist` | GET | ❓ Unknown | Medium |

---

## 🧪 Testing Checklist

### How to Verify Implementation

For each endpoint, test the following:

#### 1. **Authentication Required Endpoints**

```bash
# Test without token (should return 401)
curl -X GET http://185.193.19.244:8000/api/user/profile

# Test with invalid token (should return 403)
curl -X GET http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer invalid_token"

# Test with valid token (should return 200)
curl -X GET http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

#### 2. **Response Format Validation**

All endpoints should return consistent format:

```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* response data */ },
  "statusCode": 200
}
```

#### 3. **Error Handling**

Test these scenarios:
- Missing required fields
- Invalid data types
- Database connection errors
- Token expiration
- User not found

---

## 📋 Implementation Priority

### 🔴 HIGH Priority (Blocking User Experience)

1. **GET /api/user/profile** - Profile screen relies on this
   - Currently using Firebase fallback
   - Users can't see backend-stored profile data

### 🟡 MEDIUM Priority (Enhanced Features)

2. Product-related endpoints (if e-commerce is active)
3. Order history endpoints
4. Wishlist endpoints

### 🟢 LOW Priority (Nice to Have)

5. Advanced search features
6. Recommendation endpoints
7. Analytics endpoints

---

## 🔧 Quick Implementation Guide

### Step 1: Check Existing Code

The backend might already have `/api/profile` (PUT). Check if you can add GET support:

```javascript
// Existing (PUT)
router.put('/profile', authMiddleware, updateProfile);

// Add this (GET)
router.get('/profile', authMiddleware, getProfile);

// Or create separate route
router.get('/user/profile', authMiddleware, getProfile);
```

### Step 2: Implement Controller

```javascript
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
        statusCode: 404
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: null,
      statusCode: 500
    });
  }
};
```

### Step 3: Test

```bash
# Get your JWT token first
TOKEN=$(curl -X POST http://185.193.19.244:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Test the profile endpoint
curl -X GET http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📞 Communication Protocol

### When Endpoint is Implemented

Notify frontend team with:

1. ✅ Endpoint URL and method
2. ✅ Authentication requirements
3. ✅ Request/response examples
4. ✅ Any special headers or parameters
5. ✅ Error codes and their meanings

### Testing Results to Share

Provide test results for:
- Valid request
- Missing authentication
- Invalid token
- User not found
- Server error scenario

---

## 🔄 Current Workaround

The frontend currently handles missing `/api/user/profile` gracefully:

1. Calls backend endpoint
2. If 404 error, uses Firebase user data as fallback
3. Displays profile information from Firebase
4. Logs warning in console

**This is a temporary solution. Backend implementation is required for:**
- Accurate profile data from database
- Profile updates to persist correctly
- Gender, address, and other extended fields
- Unified data source across the app

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `BACKEND_USER_PROFILE_ENDPOINT_IMPLEMENTATION.md` | Detailed implementation guide for GET /api/user/profile |
| `BACKEND_HANDOFF.md` | Complete backend API documentation |
| `FRONTEND_BACKEND_SYNC_VERIFICATION.md` | Testing and verification guide |

---

**Status Summary:**
- 🔴 Critical: 1 endpoint (GET /api/user/profile)
- 🟡 Unknown: ~15 endpoints (need verification)
- ✅ Working: 4+ endpoints (auth, profile update)

**Next Steps:**
1. Backend team implements GET /api/user/profile
2. Test with frontend app
3. Verify all other endpoints from BACKEND_HANDOFF.md
4. Update this checklist with actual implementation status
