# 🔐 Backend Authentication Payload Specification
## Frontend → Backend Communication Documentation

**Generated:** November 24, 2025  
**Production Issue:** Authentication Error - "authProvider: 'phone' is not a valid enum value"  
**For:** Backend Team Review

---

## 📋 Table of Contents
1. [Production Environment](#production-environment)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Payload Specifications](#payload-specifications)
4. [Firebase ID Token Details](#firebase-id-token-details)
5. [Current Error Analysis](#current-error-analysis)
6. [Backend Requirements](#backend-requirements)

---

## 🌐 Production Environment

### API Configuration
```javascript
Production URL: https://api.yoraa.in.net/api
Environment: Production (NOT Development)
Platform: iOS & Android
```

### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <Firebase_ID_Token>" // For authenticated requests
}
```

---

## 🔌 Authentication Endpoints

### Primary Authentication Endpoint
```
POST https://api.yoraa.in.net/api/auth/login/firebase
```

**Purpose:** Universal login endpoint for all authentication methods (Apple, Google, Phone OTP)

---

## 📤 Payload Specifications

### 1. Phone Number + OTP Authentication

**Frontend Code Location:** `src/services/authenticationService.js:145`

#### Request Payload
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**IMPORTANT:** The payload ONLY contains the Firebase ID Token. No additional fields.

#### Firebase ID Token Claims (Phone Auth)
When decoded, the Firebase ID Token contains:
```json
{
  "iss": "https://securetoken.google.com/<PROJECT_ID>",
  "aud": "<PROJECT_ID>",
  "auth_time": 1700000000,
  "user_id": "abc123def456...",
  "sub": "abc123def456...",
  "iat": 1700000000,
  "exp": 1700003600,
  "phone_number": "+919876543210",
  "firebase": {
    "identities": {
      "phone": ["+919876543210"]
    },
    "sign_in_provider": "phone"
  }
}
```

**Key Field:** `firebase.sign_in_provider` = `"phone"`

---

### 2. Google Sign In Authentication

**Frontend Code Location:** `src/services/googleAuthService.js:150-170`

#### Request Payload
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**IMPORTANT:** The payload ONLY contains the Firebase ID Token. No additional fields.

#### Firebase ID Token Claims (Google Auth)
```json
{
  "iss": "https://securetoken.google.com/<PROJECT_ID>",
  "aud": "<PROJECT_ID>",
  "auth_time": 1700000000,
  "user_id": "xyz789abc123...",
  "sub": "xyz789abc123...",
  "iat": 1700000000,
  "exp": 1700003600,
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "firebase": {
    "identities": {
      "google.com": ["107123456789012345678"],
      "email": ["user@gmail.com"]
    },
    "sign_in_provider": "google.com"
  }
}
```

**Key Field:** `firebase.sign_in_provider` = `"google.com"`

---

### 3. Apple Sign In Authentication

**Frontend Code Location:** `src/services/appleAuthService.js:135-165`

#### Request Payload
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**IMPORTANT:** The payload ONLY contains the Firebase ID Token. No additional fields.

#### Firebase ID Token Claims (Apple Auth)
```json
{
  "iss": "https://securetoken.google.com/<PROJECT_ID>",
  "aud": "<PROJECT_ID>",
  "auth_time": 1700000000,
  "user_id": "abc123xyz789...",
  "sub": "abc123xyz789...",
  "iat": 1700000000,
  "exp": 1700003600,
  "email": "user@privaterelay.appleid.com",
  "email_verified": true,
  "name": "Jane Smith",
  "firebase": {
    "identities": {
      "apple.com": ["001234.abc123def456789..."],
      "email": ["user@privaterelay.appleid.com"]
    },
    "sign_in_provider": "apple.com"
  }
}
```

**Key Field:** `firebase.sign_in_provider` = `"apple.com"`

---

## 🔍 Firebase ID Token Details

### Token Structure
Firebase ID Tokens are JWT (JSON Web Tokens) with three parts:
```
eyJhbGc...HEADER.eyJpc3M...PAYLOAD.SflKxw...SIGNATURE
```

### How to Decode (Backend)
```javascript
// Node.js example
const admin = require('firebase-admin');

async function verifyToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    console.log('User ID:', decodedToken.uid);
    console.log('Email:', decodedToken.email);
    console.log('Phone:', decodedToken.phone_number);
    console.log('Sign-in Provider:', decodedToken.firebase.sign_in_provider);
    
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}
```

### Expected Sign-in Provider Values
```javascript
{
  "phone": "phone",           // ⚠️ THIS IS THE ISSUE
  "google": "google.com",
  "apple": "apple.com",
  "password": "password",
  "anonymous": "anonymous"
}
```

---

## ❌ Current Error Analysis

### Error Message
```
Authentication Error
User validation failed: authProvider: 'phone' is not a valid enum value for path 'authProvider'
```

### Root Cause
The backend is extracting `firebase.sign_in_provider` from the Firebase ID Token and using it as the `authProvider` field in the User model.

**Problem:** The backend User schema has an enum validation that does NOT include `"phone"` as a valid value.

### Where the Error Occurs
```
Backend: User Model Schema Validation
Field: authProvider
Received Value: "phone"
Expected Values: (Unknown - need backend team to confirm)
```

---

## 🔧 Backend Requirements

### What We Need from Backend Team

#### 1. Current User Schema
```javascript
// Please provide the current User model schema
const UserSchema = new Schema({
  authProvider: {
    type: String,
    enum: [/* WHAT ARE THE CURRENT VALUES? */],
    required: true
  }
  // ... other fields
});
```

#### 2. Expected Enum Values
What values are currently allowed for `authProvider`?
- [ ] `"phone"`
- [ ] `"google"` or `"google.com"`?
- [ ] `"apple"` or `"apple.com"`?
- [ ] `"password"`
- [ ] Other values?

#### 3. Firebase Integration Code
How does the backend extract and validate the `authProvider`?

```javascript
// Example of what we expect backend is doing:
app.post('/api/auth/login/firebase', async (req, res) => {
  const { idToken } = req.body;
  
  // Verify Firebase token
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  
  // Extract sign-in provider
  const authProvider = decodedToken.firebase.sign_in_provider; // ← THIS IS THE VALUE
  
  // Create/update user
  const user = await User.findOneAndUpdate(
    { firebaseUid: decodedToken.uid },
    {
      authProvider: authProvider, // ← ENUM VALIDATION FAILS HERE
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number,
      // ...
    },
    { upsert: true, new: true }
  );
  
  res.json({ success: true, user, token: generateJWT(user) });
});
```

---

## 🎯 Recommended Backend Fix

### Option 1: Update Enum to Match Firebase Values (Recommended)
```javascript
const UserSchema = new Schema({
  authProvider: {
    type: String,
    enum: [
      'phone',        // ← ADD THIS
      'google.com',   // Match Firebase exactly
      'apple.com',    // Match Firebase exactly
      'password',
      'anonymous'
    ],
    required: true
  }
});
```

### Option 2: Map Firebase Values to Backend Values
```javascript
// Backend mapping function
function mapFirebaseProvider(firebaseProvider) {
  const mapping = {
    'phone': 'phone',
    'google.com': 'google',
    'apple.com': 'apple',
    'password': 'email',
    'anonymous': 'guest'
  };
  return mapping[firebaseProvider] || firebaseProvider;
}

// In auth endpoint:
const authProvider = mapFirebaseProvider(decodedToken.firebase.sign_in_provider);
```

### Option 3: Frontend Workaround (NOT RECOMMENDED)
We could map on the frontend, but this is **not ideal** because:
- Firebase tokens are standardized
- Backend should handle Firebase integration correctly
- Creates inconsistency across services

---

## 📊 Complete Request Flow

### Phone OTP Login Flow
```
1. User enters phone number → Frontend
2. Frontend calls Firebase Auth.signInWithPhoneNumber()
3. User enters OTP → Frontend
4. Frontend calls confirmation.confirm(otp)
5. Firebase returns UserCredential with ID Token
6. Frontend extracts idToken
7. Frontend sends: POST /api/auth/login/firebase
   Body: { "idToken": "eyJ..." }
8. Backend receives request
9. Backend verifies idToken with Firebase Admin SDK
10. Backend extracts: firebase.sign_in_provider = "phone"
11. Backend tries to save User with authProvider: "phone"
12. ❌ Mongoose validation fails: "phone" not in enum
```

### Google/Apple Login Flow
```
1. User taps Google/Apple button → Frontend
2. Frontend initiates Google/Apple authentication
3. User completes authentication in system UI
4. Frontend receives credentials
5. Frontend signs into Firebase with credentials
6. Firebase returns UserCredential with ID Token
7. Frontend extracts idToken
8. Frontend sends: POST /api/auth/login/firebase
   Body: { "idToken": "eyJ..." }
9. Backend receives request
10. Backend verifies idToken with Firebase Admin SDK
11. Backend extracts: firebase.sign_in_provider = "google.com"/"apple.com"
12. Backend saves User (may or may not fail depending on enum values)
```

---

## 🔐 Security Notes

### Frontend Security
- ✅ Firebase ID Tokens are signed by Google
- ✅ Tokens expire after 1 hour
- ✅ Frontend forces token refresh before API calls
- ✅ No sensitive data stored in frontend
- ✅ All authentication goes through Firebase

### Backend Security Requirements
- ✅ MUST verify Firebase ID Token using Firebase Admin SDK
- ✅ MUST NOT trust frontend-provided user data without verification
- ✅ MUST extract user info from verified token claims
- ✅ MUST validate token signature and expiration
- ⚠️ DO NOT accept custom authProvider from frontend

---

## 📝 Sample Valid ID Tokens

### Phone Auth Token (Decoded Payload)
```json
{
  "iss": "https://securetoken.google.com/yoraa-app",
  "aud": "yoraa-app",
  "auth_time": 1732435200,
  "user_id": "abc123",
  "sub": "abc123",
  "iat": 1732435200,
  "exp": 1732438800,
  "phone_number": "+919876543210",
  "firebase": {
    "identities": {
      "phone": ["+919876543210"]
    },
    "sign_in_provider": "phone"
  }
}
```

### Google Auth Token (Decoded Payload)
```json
{
  "iss": "https://securetoken.google.com/yoraa-app",
  "aud": "yoraa-app",
  "auth_time": 1732435200,
  "user_id": "xyz789",
  "sub": "xyz789",
  "iat": 1732435200,
  "exp": 1732438800,
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "firebase": {
    "identities": {
      "google.com": ["107123456789012345678"],
      "email": ["user@gmail.com"]
    },
    "sign_in_provider": "google.com"
  }
}
```

### Apple Auth Token (Decoded Payload)
```json
{
  "iss": "https://securetoken.google.com/yoraa-app",
  "aud": "yoraa-app",
  "auth_time": 1732435200,
  "user_id": "def456",
  "sub": "def456",
  "iat": 1732435200,
  "exp": 1732438800,
  "email": "privaterelay@appleid.com",
  "email_verified": true,
  "name": "Jane Smith",
  "firebase": {
    "identities": {
      "apple.com": ["001234.abc123def456"],
      "email": ["privaterelay@appleid.com"]
    },
    "sign_in_provider": "apple.com"
  }
}
```

---

## 🚨 Urgent Action Required

### For Backend Team:

1. **Confirm Current User Schema**
   - What is the current `authProvider` enum definition?
   - Share the User model schema

2. **Verify Firebase Integration**
   - How are you extracting `authProvider` from the Firebase token?
   - Are you using Firebase Admin SDK to verify tokens?

3. **Implement Fix**
   - Add `"phone"` to the authProvider enum
   - OR implement proper mapping from Firebase values

4. **Test All Auth Methods**
   - Test Phone OTP login
   - Test Google Sign In
   - Test Apple Sign In

### Expected Response Time
⏰ **CRITICAL** - Production app is broken for all authentication methods

---

## 📞 Contact Information

**Frontend Team:** Rithik Mahajan  
**Issue Date:** November 24, 2025  
**Priority:** 🔴 CRITICAL - Production Down  
**Affected Users:** ALL users (cannot login via any method)

---

## 🧪 Testing Checklist for Backend

After implementing the fix, please test:

- [ ] Phone OTP Login (Provider: `"phone"`)
- [ ] Google Sign In (Provider: `"google.com"`)
- [ ] Apple Sign In (Provider: `"apple.com"`)
- [ ] Email/Password Login (Provider: `"password"`)
- [ ] User account linking (same email, different providers)
- [ ] Token verification and expiration
- [ ] New user creation
- [ ] Existing user login

---

## 📚 Additional Resources

### Firebase Admin SDK Documentation
- [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Manage Users](https://firebase.google.com/docs/auth/admin/manage-users)

### Firebase Auth Providers
- [Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Google Sign In](https://firebase.google.com/docs/auth/web/google-signin)
- [Apple Sign In](https://firebase.google.com/docs/auth/web/apple)

---

**END OF SPECIFICATION**

*This document contains all information the backend team needs to fix the authentication issue. No frontend changes required.*
