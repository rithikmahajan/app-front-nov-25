# ⚡ Quick Reference: GET /api/user/profile Implementation

> **TL;DR:** The endpoint `GET /api/user/profile` is missing. Here's everything you need in one page.

---

## 🎯 What to Implement

```javascript
// routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password -__v');
    
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
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: null,
      statusCode: 500
    });
  }
});

module.exports = router;
```

```javascript
// app.js (register route)
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);
```

---

## 🧪 How to Test

```bash
# 1. Get auth token
TOKEN=$(curl -s -X POST http://185.193.19.244:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 2. Test the endpoint
curl -X GET http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "message": "Profile retrieved successfully",
#   "data": { ... user data ... },
#   "statusCode": 200
# }
```

---

## 📋 Response Format

### ✅ Success (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "gender": "male",
    "profileImage": "url",
    "addresses": []
  },
  "statusCode": 200
}
```

### ❌ Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "statusCode": 401
}
```

### ❌ Invalid Token (403)
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null,
  "statusCode": 403
}
```

### ❌ Not Found (404)
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "statusCode": 404
}
```

---

## ✅ Checklist

- [ ] Route created in `routes/user.js`
- [ ] Route registered in `app.js`: `app.use('/api/user', userRoutes)`
- [ ] Authentication middleware applied
- [ ] Tested with valid token → 200
- [ ] Tested with invalid token → 403
- [ ] Tested with no token → 401
- [ ] Response format matches spec
- [ ] Deployed to production server
- [ ] Restarted backend server
- [ ] Notified frontend team

---

## 📄 Full Documentation

For complete details, see:
- **BACKEND_ENDPOINT_IMPLEMENTATION_SUMMARY.md** - Start here
- **BACKEND_USER_PROFILE_ENDPOINT_IMPLEMENTATION.md** - Complete guide
- **BACKEND_USER_PROFILE_API_FLOW.md** - Visual flow diagram
- **BACKEND_MISSING_ENDPOINTS_CHECKLIST.md** - Status tracking

---

## 🚨 Current Issue

```
ERROR: API endpoint not found: GET /api/user/profile
STATUS: 404 Not Found
IMPACT: Profile screen using Firebase fallback data
PRIORITY: HIGH
```

---

## 🎯 After Implementation

```
✅ Endpoint returns 200 OK
✅ Profile data from database (not Firebase)
✅ No console errors
✅ All profile fields available
```

---

**Time to implement:** ~30 minutes  
**Server:** http://185.193.19.244:8000  
**Date:** October 12, 2025
