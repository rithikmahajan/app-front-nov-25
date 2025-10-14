# 🔐 Frontend Apple Sign-In Backend Authentication Implementation

## For Backend Team Verification

This document explains how the frontend handles Apple Sign-In authentication and requests tokens from the backend. Please verify that the backend endpoints match these expectations.

---

## 📋 Authentication Flow Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                  COMPLETE APPLE SIGN-IN FLOW                      │
└──────────────────────────────────────────────────────────────────┘

1. User taps "Sign in with Apple"
   │
   ├─ 🔒 Frontend sets sign-in lock (prevents race conditions)
   │
2. Apple Auth SDK Request
   │
   ├─ Request scopes: EMAIL, FULL_NAME
   ├─ Receive: identityToken, authorizationCode, user ID
   │
3. Firebase Authentication
   │
   ├─ Create Firebase credential with Apple identityToken
   ├─ Sign in to Firebase
   ├─ Firebase returns: userCredential
   │
4. Get Firebase ID Token
   │
   ├─ Call: userCredential.user.getIdToken(true)
   ├─ This is a JWT signed by Firebase
   │
5. Backend Authentication (CRITICAL)
   │
   ├─ 🌐 POST /api/auth/login/firebase
   ├─ Body: { idToken: <Firebase JWT> }
   ├─ Backend must:
   │  ├─ Verify Firebase JWT signature
   │  ├─ Extract user info from JWT
   │  ├─ Create/update user in database
   │  ├─ Generate backend JWT token
   │  └─ Return token + user data
   │
6. Token Storage
   │
   ├─ Store backend JWT in memory (immediate)
   ├─ Store backend JWT in AsyncStorage
   ├─ Store user data in AsyncStorage
   │
7. Verification
   │
   ├─ Verify token exists in memory
   ├─ Verify user is authenticated
   ├─ 🔓 Release sign-in lock
   │
✅ User is now authenticated with both Firebase AND backend
```

---

## 🌐 Backend API Endpoint Requirements

### 1. Firebase Login Endpoint

**Endpoint:** `POST /api/auth/login/firebase`

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Request Headers:**
```
Content-Type: application/json
```

**idToken Details:**
- This is a Firebase ID Token (JWT)
- Signed by Firebase Auth service
- Contains user information (UID, email, etc.)
- Must be verified by backend using Firebase Admin SDK

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "firebaseUid": "QvABW0kxruOvHTSIIFHbawTm9Kg2",
      "authProvider": "apple",
      "createdAt": "2025-10-12T...",
      "updatedAt": "2025-10-12T..."
    }
  },
  "message": "Login successful"
}
```

**Expected Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid Firebase token",
  "error": "INVALID_TOKEN"
}
```

---

## 🔍 Backend Verification Checklist

### ✅ Firebase Token Verification

The backend **MUST** verify the Firebase ID token:

```javascript
// Example using Firebase Admin SDK (Node.js)
const admin = require('firebase-admin');

async function verifyFirebaseToken(idToken) {
  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // decodedToken contains:
    // {
    //   uid: "QvABW0kxruOvHTSIIFHbawTm9Kg2",
    //   email: "user@example.com",
    //   email_verified: true,
    //   firebase: {
    //     identities: {
    //       "apple.com": ["000315.04ccbefff13446b2bcddb1abb2323a69.2334"]
    //     },
    //     sign_in_provider: "apple.com"
    //   },
    //   iat: 1728000000,
    //   exp: 1728003600,
    //   ...
    // }
    
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
}
```

### ✅ User Creation/Update

```javascript
async function handleFirebaseLogin(idToken) {
  // 1. Verify Firebase token
  const decodedToken = await verifyFirebaseToken(idToken);
  
  // 2. Check if user exists in database
  let user = await User.findOne({ firebaseUid: decodedToken.uid });
  
  if (!user) {
    // 3. Create new user
    user = await User.create({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      authProvider: decodedToken.firebase.sign_in_provider.replace('.com', ''),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } else {
    // 4. Update existing user
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    await user.save();
  }
  
  // 5. Generate backend JWT token
  const backendToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // 6. Return response
  return {
    success: true,
    data: {
      token: backendToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firebaseUid: user.firebaseUid,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  };
}
```

### ✅ Account Linking (Same Email, Different Providers)

**Important:** The backend should automatically link accounts with the same email address across different auth providers (Apple, Google, Email/Password).

```javascript
async function handleFirebaseLogin(idToken) {
  const decodedToken = await verifyFirebaseToken(idToken);
  
  // Look for user by email OR firebaseUid
  let user = await User.findOne({
    $or: [
      { firebaseUid: decodedToken.uid },
      { email: decodedToken.email }
    ]
  });
  
  if (user && user.firebaseUid !== decodedToken.uid) {
    // Account linking: User exists with same email but different Firebase UID
    console.log(`Linking new auth provider to existing account: ${user.email}`);
    
    // Add new Firebase UID to linked providers
    if (!user.linkedFirebaseUids) {
      user.linkedFirebaseUids = [];
    }
    user.linkedFirebaseUids.push({
      uid: decodedToken.uid,
      provider: decodedToken.firebase.sign_in_provider,
      linkedAt: new Date()
    });
    
    user.firebaseUid = decodedToken.uid; // Update primary UID
    await user.save();
  }
  
  // ... rest of the flow
}
```

---

## 📱 Frontend Implementation Details

### Token Request Code

**File:** `src/services/yoraaAPI.js`

```javascript
async firebaseLogin(idToken) {
  // Set sign-in lock to prevent race conditions
  const lockAlreadySet = this.isSigningIn;
  if (!lockAlreadySet) {
    this.isSigningIn = true;
  }
  
  try {
    // Make request to backend
    const response = await this.makeRequest(
      '/api/auth/login/firebase', 
      'POST', 
      { idToken }
    );
    
    if (response.success && response.data) {
      const token = response.data.token;
      const userData = response.data.user;
      
      if (token) {
        // Store token in memory IMMEDIATELY (synchronous)
        this.userToken = token;
        
        // Store in AsyncStorage (parallel, async)
        await Promise.all([
          AsyncStorage.setItem('userToken', token),
          AsyncStorage.setItem('userData', JSON.stringify(userData)),
          authStorageService.storeAuthData(token, userData)
        ]);
        
        return response.data;
      } else {
        throw new Error('No token received from backend');
      }
    } else {
      throw new Error(response.message || 'Backend authentication failed');
    }
  } finally {
    if (!lockAlreadySet) {
      this.isSigningIn = false;
    }
  }
}
```

### makeRequest() Implementation

**File:** `src/services/yoraaAPI.js`

```javascript
async makeRequest(endpoint, method = 'GET', body = null, requireAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = this.userToken;
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${this.baseURL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data;
}
```

---

## 🔒 Security Considerations

### 1. Firebase Token Verification (CRITICAL)

❌ **NEVER trust the token without verification:**
```javascript
// WRONG - DO NOT DO THIS
app.post('/api/auth/login/firebase', (req, res) => {
  const { idToken } = req.body;
  // Decoding without verification is DANGEROUS
  const decoded = jwt.decode(idToken); // ❌ NO!
  // ... create user session
});
```

✅ **ALWAYS verify with Firebase Admin SDK:**
```javascript
// CORRECT
app.post('/api/auth/login/firebase', async (req, res) => {
  try {
    const { idToken } = req.body;
    // Verify signature with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken); // ✅ YES!
    // ... proceed with user creation
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
```

### 2. Token Expiration

- **Firebase ID Token:** Expires in 1 hour
- **Backend JWT Token:** Should expire in 7-30 days (configurable)
- Frontend refreshes Firebase token automatically
- Backend token refresh handled by frontend auth manager

### 3. HTTPS Only

- All API calls use HTTPS in production
- Base URL: `https://api.yoraa.com` (production)
- Base URL: `http://localhost:3000` (development)

---

## 🧪 Testing the Integration

### Test Case 1: New User Sign-In

**Frontend Sends:**
```http
POST /api/auth/login/firebase
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNmExODNhNjQzZTJiNDU4MzdjN..."
}
```

**Backend Should Return:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "new_user_id",
      "email": "newuser@example.com",
      "name": null,
      "firebaseUid": "QvABW0kxruOvHTSIIFHbawTm9Kg2",
      "authProvider": "apple",
      "createdAt": "2025-10-12T10:30:00Z",
      "updatedAt": "2025-10-12T10:30:00Z"
    }
  },
  "message": "Login successful"
}
```

**Frontend Verifies:**
- ✅ `response.success === true`
- ✅ `response.data.token` exists and is a string
- ✅ `response.data.user` exists and has user info
- ✅ Token is stored in memory
- ✅ Token is stored in AsyncStorage

### Test Case 2: Existing User Sign-In

**Same request format, but user already exists in database**

**Backend Should:**
- ✅ Find existing user by Firebase UID
- ✅ Update `lastLoginAt` timestamp
- ✅ Generate new backend JWT token
- ✅ Return existing user data

### Test Case 3: Invalid Token

**Frontend Sends:**
```http
POST /api/auth/login/firebase
Content-Type: application/json

{
  "idToken": "invalid_token_123"
}
```

**Backend Should Return:**
```json
{
  "success": false,
  "message": "Invalid Firebase token",
  "error": "INVALID_TOKEN"
}
```

**Frontend Handles:**
- ❌ Backend authentication fails
- 🔄 Frontend signs out from Firebase
- 🧹 Frontend clears any partial data
- 📢 Shows error message to user

---

## 📊 Frontend Token Storage Locations

### 1. In-Memory Storage
```javascript
this.userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```
- **Purpose:** Fast access for API calls
- **Lifetime:** Until app is closed
- **Cleared on:** App restart, sign out

### 2. AsyncStorage (Legacy)
```javascript
await AsyncStorage.setItem('userToken', token);
await AsyncStorage.setItem('userData', JSON.stringify(user));
```
- **Purpose:** Persistence across app restarts
- **Lifetime:** Until explicitly cleared
- **Cleared on:** Sign out, app uninstall

### 3. AuthStorageService (New)
```javascript
await authStorageService.storeAuthData(token, user);
```
- **Purpose:** Secure storage with encryption support
- **Lifetime:** Until explicitly cleared
- **Cleared on:** Sign out, app uninstall

---

## ⚠️ Critical Requirements for Backend

### ✅ MUST HAVE

1. **Firebase Admin SDK** properly configured
2. **Firebase project credentials** (service account JSON)
3. **Token verification** before creating sessions
4. **Backend JWT generation** with secure secret
5. **User database** to store user information
6. **Account linking** for same email across providers

### ❌ MUST NOT

1. **Decode without verification** - Always use `verifyIdToken()`
2. **Store Firebase ID tokens** - Use them only for verification
3. **Skip email verification** - Trust Firebase's `email_verified` field
4. **Expose secrets** - Keep JWT secrets and Firebase credentials secure

---

## 🔍 Verification Questions for Backend Team

Please confirm the following:

1. ✅ Is `POST /api/auth/login/firebase` endpoint implemented?
2. ✅ Does it accept `{ idToken: string }` in request body?
3. ✅ Does it verify the Firebase token using Firebase Admin SDK?
4. ✅ Does it return `{ success, data: { token, user } }` format?
5. ✅ Is the backend JWT token properly generated and signed?
6. ✅ Does it handle account linking for same email?
7. ✅ Are appropriate error messages returned for failures?
8. ✅ Is CORS configured to allow frontend domain?
9. ✅ Are logs in place to debug authentication issues?
10. ✅ Is rate limiting implemented to prevent abuse?

---

## 📝 Sample Firebase ID Token Payload

Here's what the backend will receive in the `idToken`:

```json
{
  "iss": "https://securetoken.google.com/your-project-id",
  "aud": "your-project-id",
  "auth_time": 1728000000,
  "user_id": "QvABW0kxruOvHTSIIFHbawTm9Kg2",
  "sub": "QvABW0kxruOvHTSIIFHbawTm9Kg2",
  "iat": 1728000000,
  "exp": 1728003600,
  "email": "user@example.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "apple.com": [
        "000315.04ccbefff13446b2bcddb1abb2323a69.2334"
      ],
      "email": [
        "user@example.com"
      ]
    },
    "sign_in_provider": "apple.com"
  },
  "uid": "QvABW0kxruOvHTSIIFHbawTm9Kg2"
}
```

**Key Fields:**
- `uid` / `user_id`: Firebase user ID (use this as primary identifier)
- `email`: User's email address
- `email_verified`: Boolean indicating if email is verified
- `firebase.sign_in_provider`: Authentication method (`apple.com`, `google.com`, `password`)
- `firebase.identities.apple.com[0]`: Apple user ID (different from Firebase UID)
- `exp`: Token expiration (Unix timestamp)

---

## 🚀 Production Readiness

### Frontend Checklist ✅

- ✅ Sign-in lock implemented to prevent race conditions
- ✅ Token stored in memory immediately (synchronous)
- ✅ Token stored in AsyncStorage (persistent)
- ✅ Comprehensive error handling
- ✅ Automatic Firebase sign-out on backend failure
- ✅ User-friendly error messages
- ✅ Logging for debugging
- ✅ Token verification after storage

### Backend Checklist (Please Confirm)

- [ ] Firebase Admin SDK configured
- [ ] Token verification implemented
- [ ] User creation/update logic
- [ ] Account linking for same email
- [ ] Backend JWT generation
- [ ] Error handling and logging
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Production environment ready

---

## 📞 Contact

If you have questions or need clarification on the frontend implementation:

**Frontend Documentation:**
- `APPLE_SIGNIN_COMPLETE_DATA_LOGGING.md` - Complete Apple data logging
- `APPLE_SIGNIN_DATA_QUICK_REF.md` - Quick reference
- `APPLE_AUTH_TOKEN_STORAGE_FIX.md` - Token storage fix details
- `TOKEN_RACE_CONDITION_VISUAL.md` - Visual flow diagrams

**This Document:**
- `FRONTEND_BACKEND_AUTH_INTEGRATION.md` (current)

---

**Document Created:** 2025-10-12  
**Purpose:** Backend team verification of frontend auth implementation  
**Status:** Ready for Backend Team Review  
**Frontend Version:** Production Ready ✅
