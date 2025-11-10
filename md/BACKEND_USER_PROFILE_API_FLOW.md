# 🔄 User Profile API Flow - Visual Guide

## Complete Request/Response Flow for GET /api/user/profile

This document shows the exact flow when a user opens the Profile screen in the app.

---

## 📱 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER OPENS PROFILE SCREEN                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ProfileScreen.js (line ~180)                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check if backend is authenticated                          │  │
│  │    const isBackendAuth = yoraaAPI.isAuthenticated()          │  │
│  │                                                               │  │
│  │    ✅ YES → Continue                                         │  │
│  │    ❌ NO  → Sync backend authentication first               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ProfileScreen.js (line ~211)                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 2. Call API to get profile                                    │  │
│  │    const profileResponse = await yoraaAPI.getUserProfile()   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  yoraaAPI.js (line ~383)                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 3. Make HTTP GET request                                      │  │
│  │    const response = await this.makeRequest(                  │  │
│  │      '/api/user/profile',                                     │  │
│  │      'GET'                                                    │  │
│  │    )                                                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  yoraaAPI.js - makeRequest() (line ~262)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 4. Prepare HTTP request                                       │  │
│  │    URL: http://185.193.19.244:8000/api/user/profile          │  │
│  │    Method: GET                                                │  │
│  │    Headers:                                                   │  │
│  │      - Content-Type: application/json                        │  │
│  │      - Authorization: Bearer <JWT_TOKEN>                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ╔═══════════════════════╗
                        ║   NETWORK REQUEST     ║
                        ║   (HTTP GET)          ║
                        ╚═══════════════════════╝
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND SERVER: http://185.193.19.244:8000                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 5. Receive request                                            │  │
│  │    GET /api/user/profile                                      │  │
│  │    Authorization: Bearer <TOKEN>                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                          🔴 CURRENT STATUS                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ❌ Endpoint NOT FOUND                                         │  │
│  │                                                               │  │
│  │ Returns:                                                      │  │
│  │ {                                                             │  │
│  │   "success": false,                                           │  │
│  │   "message": "API endpoint not found: GET /api/user/profile", │  │
│  │   "data": null,                                               │  │
│  │   "statusCode": 404                                           │  │
│  │ }                                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                    ✅ EXPECTED BEHAVIOR (After Implementation)       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 6a. Authentication Middleware                                 │  │
│  │     - Extract JWT token from Authorization header            │  │
│  │     - Verify token signature                                 │  │
│  │     - Check token expiration                                 │  │
│  │     - Extract user ID from token                             │  │
│  │     - Attach user to req.user                                │  │
│  │                                                               │  │
│  │     ❌ FAIL → Return 401 or 403                              │  │
│  │     ✅ SUCCESS → Continue to route handler                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 6b. Route Handler: GET /api/user/profile                     │  │
│  │     - Get user ID from req.user                              │  │
│  │     - Query database for user document                       │  │
│  │     - Remove sensitive fields (password, etc.)               │  │
│  │     - Return user profile data                               │  │
│  │                                                               │  │
│  │     ❌ User not found → Return 404                           │  │
│  │     ❌ Database error → Return 500                           │  │
│  │     ✅ SUCCESS → Return 200 with user data                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ╔═══════════════════════╗
                        ║   NETWORK RESPONSE    ║
                        ║   (HTTP 200/404/500)  ║
                        ╚═══════════════════════╝
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  yoraaAPI.js - makeRequest() (line ~290)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 7. Process response                                           │  │
│  │    - Parse JSON                                               │  │
│  │    - Check response.success                                   │  │
│  │    - Log response details                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  yoraaAPI.js - getUserProfile() (line ~400)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 8. Handle response                                            │  │
│  │                                                               │  │
│  │    IF response.success === true:                             │  │
│  │      ✅ Return user data from backend                        │  │
│  │                                                               │  │
│  │    ELSE (404 error):                                         │  │
│  │      ⚠️  Use Firebase fallback data                          │  │
│  │      📱 Get currentUser from Firebase Auth                   │  │
│  │      🔄 Return {                                             │  │
│  │           success: true,                                     │  │
│  │           data: {                                            │  │
│  │             email: currentUser.email,                        │  │
│  │             name: currentUser.displayName,                   │  │
│  │             phone: currentUser.phoneNumber                   │  │
│  │           },                                                 │  │
│  │           message: 'Using fallback - endpoint not impl'      │  │
│  │         }                                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ProfileScreen.js (line ~214)                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 9. Display profile data                                       │  │
│  │                                                               │  │
│  │    🔴 CURRENT: Shows Firebase data (fallback)                │  │
│  │    ✅ AFTER FIX: Shows backend database data                 │  │
│  │                                                               │  │
│  │    Display:                                                   │  │
│  │    - Name (firstName + lastName OR name OR displayName)      │  │
│  │    - Email                                                    │  │
│  │    - Phone                                                    │  │
│  │    - Profile image                                           │  │
│  │    - Gender                                                   │  │
│  │    - Date of birth                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Request/Response Examples

### Current State (404 Error)

#### Request Sent from Frontend
```http
GET /api/user/profile HTTP/1.1
Host: 185.193.19.244:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDc4Yjh...
```

#### Response from Backend (Current)
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "message": "API endpoint not found: GET /api/user/profile",
  "data": null,
  "statusCode": 404
}
```

#### Frontend Fallback Response (Current)
```javascript
// yoraaAPI.js returns this instead:
{
  success: true,
  data: {
    email: "rithik@example.com",
    name: "Rithik Mahajan",          // From Firebase displayName
    phone: "+919876543210",           // From Firebase phoneNumber
    profileImage: "https://...",      // From Firebase photoURL
  },
  message: "Using fallback profile data - backend endpoint not implemented"
}
```

---

### Expected State (After Implementation)

#### Request Sent from Frontend
```http
GET /api/user/profile HTTP/1.1
Host: 185.193.19.244:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDc4Yjh...
```

#### Response from Backend (Expected)
```json
HTTP/1.1 200 OK
Content-Type: application/json

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
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "profileImage": "https://storage.example.com/profiles/user123.jpg",
    "addresses": [
      {
        "_id": "addr123",
        "type": "home",
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India",
        "isDefault": true
      }
    ],
    "firebaseUid": "firebase_uid_here",
    "createdAt": "2024-10-10T12:00:00.000Z",
    "updatedAt": "2024-10-12T08:30:00.000Z"
  },
  "statusCode": 200
}
```

#### Frontend Processing (Expected)
```javascript
// yoraaAPI.js returns this:
{
  success: true,
  data: {
    _id: "67078b8f9e826c5d8c3d4e5f",
    email: "rithik@example.com",
    name: "Rithik Mahajan",
    firstName: "Rithik",
    lastName: "Mahajan",
    phone: "+919876543210",
    gender: "male",
    dateOfBirth: "1995-05-15T00:00:00.000Z",
    profileImage: "https://storage.example.com/profiles/user123.jpg",
    addresses: [...],
    firebaseUid: "firebase_uid_here",
    createdAt: "2024-10-10T12:00:00.000Z",
    updatedAt: "2024-10-12T08:30:00.000Z"
  },
  message: "Profile retrieved successfully"
}
```

---

## 🔐 Authentication Token Flow

```
┌─────────────────────────────────────────────────────────────┐
│  HOW THE JWT TOKEN IS OBTAINED AND USED                     │
└─────────────────────────────────────────────────────────────┘

1. USER LOGS IN
   ├─ Email/Password Login
   │  └─ POST /api/auth/login → Returns JWT token
   │
   ├─ Firebase Login (Google/Apple/Phone)
   │  └─ POST /api/auth/login/firebase → Returns JWT token
   │
   └─ Token Structure:
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": { /* user data */ }
      }

2. TOKEN IS STORED
   ├─ AsyncStorage.setItem('userToken', token)
   ├─ yoraaAPI.userToken = token  (in memory)
   └─ authStorageService.storeAuthData(token, userData)

3. TOKEN IS USED FOR AUTHENTICATED REQUESTS
   ├─ makeRequest() automatically adds to headers:
   │  Authorization: Bearer <token>
   │
   └─ Backend extracts and verifies:
      ├─ Extract from "Authorization: Bearer <token>"
      ├─ Verify with JWT_SECRET
      ├─ Decode to get user ID
      └─ Find user in database

4. TOKEN LIFECYCLE
   ├─ Valid → Allow request
   ├─ Expired → Return 403
   ├─ Invalid → Return 403
   └─ Missing → Return 401
```

---

## 🛠️ Backend Implementation Steps

### Step 1: Create Route
```javascript
// routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getProfile } = require('../controllers/userController');

router.get('/profile', authMiddleware, getProfile);

module.exports = router;
```

### Step 2: Create Controller
```javascript
// controllers/userController.js
const User = require('../models/User');

exports.getProfile = async (req, res) => {
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
      message: 'Server error while fetching profile',
      data: null,
      statusCode: 500
    });
  }
};
```

### Step 3: Register Routes
```javascript
// app.js or server.js
const userRoutes = require('./routes/user');

app.use('/api/user', userRoutes);
```

### Step 4: Test
```bash
# Test the endpoint
curl -X GET http://185.193.19.244:8000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Success Metrics

After implementation, you should see:

### ✅ Frontend Logs (Console)
```
🔍 Fetching user profile from backend...
📊 Profile response: {success: true, data: {...}, message: 'Profile retrieved successfully'}
✅ User profile loaded from backend
📊 Profile data for ProfileScreen: {success: true, data: {...}}
✅ Using backend profile name: Rithik Mahajan
```

### ❌ Current Logs (Console)
```
🔍 Fetching user profile from backend...
API Response: {status: 404, url: 'http://185.193.19.244:8000/api/user/profile', ...}
❌ API Error [404] /api/user/profile: {success: false, message: 'API endpoint not found...'}
⚠️ Backend returned unsuccessful response
📱 Using Firebase user data as fallback
📊 Profile data for ProfileScreen: {success: true, data: {...}, message: 'Using fallback...'}
✅ Using Firebase displayName: Rithik Mahajan
```

---

## 🎯 Impact After Implementation

| Before (Current) | After (With Endpoint) |
|------------------|----------------------|
| ❌ 404 errors in console | ✅ No errors |
| 📱 Firebase fallback data | 🗄️ Backend database data |
| ⚠️ Limited profile fields | ✅ All profile fields available |
| 🔄 Inconsistent data sources | 🎯 Single source of truth |
| ❌ Can't show addresses | ✅ Can show saved addresses |
| ❌ Can't show gender/DOB | ✅ Can show all profile data |

---

**Document Purpose:** Help backend team understand the complete API flow  
**Next Steps:** Implement GET /api/user/profile endpoint  
**Testing:** Use the examples above to verify implementation
