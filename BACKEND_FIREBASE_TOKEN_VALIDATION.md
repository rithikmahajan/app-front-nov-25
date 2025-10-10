# Backend Firebase JWT Token Validation - Implementation Guide

## 🚨 **URGENT: Backend Issue Identified**

**Status**: Frontend is working correctly and sending Firebase JWT tokens, but backend is rejecting them as "Invalid Token".

**Required**: Backend team needs to implement Firebase JWT token validation using Firebase Admin SDK.

---

## 🔍 **Current Situation**

### ✅ **Frontend Status (Working)**
- Firebase JWT tokens are being generated
- Tokens are being sent in Authorization header
- Request format is correct

### ❌ **Backend Status (Not Working)**
- Backend receives Firebase JWT tokens
- Backend responds with `401 "Invalid Token, please login again"`
- Backend is not configured to validate Firebase JWT tokens

---

## 🛠 **Backend Implementation Required**

### 1. Install Firebase Admin SDK

**Node.js/Express:**
```bash
npm install firebase-admin
```

**Python/Django:**
```bash
pip install firebase-admin
```

**Java/Spring Boot:**
```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

### 2. Firebase Admin Configuration

**Node.js Implementation:**
```javascript
// firebaseAdmin.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-firebase-project-id'
});

module.exports = admin;
```

**Environment Variables:**
```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```

### 3. Token Validation Middleware

**Express.js Middleware:**
```javascript
// middleware/firebaseAuth.js
const admin = require('../firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required to access chat support.'
        }
      });
    }

    // Verify Firebase JWT token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    console.log('✅ Firebase token validated for user:', req.user.uid);
    next();
    
  } catch (error) {
    console.error('❌ Firebase token validation failed:', error.message);
    
    // Handle specific Firebase errors
    let errorMessage = 'Invalid token, please login again';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expired, please refresh your session';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format';
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: errorMessage
      }
    });
  }
};

module.exports = verifyFirebaseToken;
```

### 4. Apply Middleware to Chat Routes

**Express.js Route Setup:**
```javascript
// routes/chat.js
const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Apply Firebase authentication to all chat routes
router.use('/chat/*', verifyFirebaseToken);

// Chat session creation
router.post('/chat/session', async (req, res) => {
  try {
    // req.user contains validated Firebase user info
    const { sessionId, userInfo, startTime, status } = req.body;
    
    // Create chat session with authenticated user
    const session = await createChatSession({
      sessionId,
      userId: req.user.uid,  // Use Firebase UID
      userEmail: req.user.email,
      userName: req.user.name,
      startTime,
      status
    });
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        createdAt: session.createdAt,
        estimatedWaitTime: 120
      },
      message: 'Chat session created successfully'
    });
    
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_CREATION_FAILED',
        message: 'Failed to create chat session'
      }
    });
  }
});

module.exports = router;
```

---

## 🧪 **Testing Firebase Token Validation**

### Test Valid Token
```bash
# Get a Firebase token from frontend and test
curl -X POST http://localhost:8001/api/chat/session \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "userInfo": {
      "isGuest": false,
      "userId": "firebase_user_id",
      "name": "Test User"
    },
    "startTime": "2025-10-06T15:30:00.000Z",
    "status": "active"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "test_session_123",
    "status": "active",
    "createdAt": "2025-10-06T15:30:00.000Z"
  }
}
```

### Test Invalid Token
```bash
curl -X POST http://localhost:8001/api/chat/session \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test"}'
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token, please login again"
  }
}
```

---

## 🔧 **Configuration Steps**

### 1. Get Firebase Service Account Key
1. Go to Firebase Console → Project Settings
2. Navigate to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Store securely in backend (not in version control!)

### 2. Set Environment Variables
```bash
# .env file
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```

### 3. Update Backend Dependencies
Add Firebase Admin SDK to your package.json/requirements.txt/pom.xml

### 4. Test Integration
1. Deploy backend changes
2. Test with frontend
3. Verify tokens are being validated correctly

---

## 🚨 **Security Considerations**

### Do's ✅
- Store service account keys securely
- Use environment variables for configuration
- Log authentication attempts for monitoring
- Implement rate limiting on auth endpoints
- Validate token expiration

### Don'ts ❌
- Don't commit service account keys to version control
- Don't disable SSL/TLS in production
- Don't ignore token expiration
- Don't log sensitive token data

---

## 📋 **Implementation Checklist**

### Backend Team Tasks
- [ ] Install Firebase Admin SDK
- [ ] Configure Firebase service account
- [ ] Implement token validation middleware
- [ ] Apply middleware to chat routes
- [ ] Test token validation with valid/invalid tokens
- [ ] Update error handling for specific Firebase errors
- [ ] Deploy and test with frontend

### Testing Checklist
- [ ] Valid Firebase tokens are accepted
- [ ] Invalid tokens are rejected with proper error
- [ ] Expired tokens are handled correctly
- [ ] Missing tokens return authentication required
- [ ] Frontend can successfully create chat sessions
- [ ] All auth-required endpoints are protected

---

## 🆘 **Quick Debug Commands**

**Check if Firebase token is valid (Node.js):**
```javascript
const admin = require('firebase-admin');

const testToken = async (token) => {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log('✅ Token valid for user:', decoded.uid);
    return decoded;
  } catch (error) {
    console.error('❌ Token invalid:', error.message);
  }
};

// Test with frontend token
testToken('eyJhbGciOiJSUzI1NiIs...');
```

**Check Firebase project configuration:**
```javascript
console.log('Firebase project ID:', admin.app().options.projectId);
console.log('Service account email:', admin.app().options.credential._email);
```

---

## 📞 **Support**

- **Firebase Documentation**: https://firebase.google.com/docs/admin/setup
- **Firebase Auth Verification**: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- **Node.js Example**: https://github.com/firebase/firebase-admin-node

---

**Priority**: 🚨 **CRITICAL** - Chat functionality blocked until Firebase token validation is implemented
**Estimated Effort**: 2-4 hours for experienced developer
**Dependencies**: Firebase service account key, Admin SDK setup

**Status**: ⏳ Waiting for Backend Team Implementation
