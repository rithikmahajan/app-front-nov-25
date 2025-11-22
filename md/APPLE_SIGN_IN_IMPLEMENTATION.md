# Apple Sign-In Implementation Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Dependencies](#dependencies)
- [iOS Configuration](#ios-configuration)
- [Implementation Details](#implementation-details)
- [Authentication Flow](#authentication-flow)
- [Code Structure](#code-structure)
- [Backend Integration](#backend-integration)
- [Error Handling](#error-handling)
- [Testing & Debugging](#testing--debugging)

---

## Overview

This application implements **Sign in with Apple** using Firebase Authentication as the authentication provider. The implementation follows Apple's guidelines and provides a seamless authentication experience for iOS users.

### Key Features
- ✅ Native Apple Authentication using `@invertase/react-native-apple-authentication`
- ✅ Firebase integration for unified authentication
- ✅ Backend synchronization with custom API
- ✅ Account linking support (link Apple accounts with existing accounts)
- ✅ Comprehensive error handling and logging
- ✅ FCM token registration post-authentication
- ✅ Guest data transfer after successful sign-in

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TAPS APPLE SIGN-IN                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Apple Native Authentication                         │
│  - Request credentials from Apple                            │
│  - User authenticates via Face ID/Touch ID                   │
│  - Receive identityToken, user info                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Firebase Authentication                             │
│  - Create Firebase credential from Apple token               │
│  - Sign in to Firebase with credential                       │
│  - Update Firebase profile (if new user)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Backend Authentication                              │
│  - Get Firebase ID token                                     │
│  - Call backend /api/auth/apple-signin                       │
│  - Backend verifies token & creates/updates user             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Token Storage & Verification                        │
│  - Store backend token in AsyncStorage                       │
│  - Verify token was stored correctly                         │
│  - Confirm authentication status                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Post-Authentication Setup                           │
│  - Initialize FCM service                                    │
│  - Register push notification token                          │
│  - Transfer guest data (cart, favorites, etc.)               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ USER SUCCESSFULLY AUTHENTICATED              │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependencies

### NPM Packages

```json
{
  "@invertase/react-native-apple-authentication": "^2.4.1",
  "@react-native-firebase/app": "^23.4.0",
  "@react-native-firebase/auth": "^23.4.0",
  "@react-native-firebase/messaging": "^23.4.0",
  "@react-native-async-storage/async-storage": "^1.24.0",
  "base-64": "^1.0.0"
}
```

### Installation

```bash
npm install @invertase/react-native-apple-authentication
npm install @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-async-storage/async-storage
npm install base-64
```

### iOS Pod Installation

```bash
cd ios
pod install
cd ..
```

---

## iOS Configuration

### 1. Enable Sign in with Apple Capability

**Xcode Configuration:**
1. Open `ios/YoraaApp.xcworkspace` in Xcode
2. Select your project in the navigator
3. Select your target (YoraaApp)
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability"
6. Add "Sign in with Apple"

### 2. Entitlements File

**File:** `ios/YoraaApp/YoraaApp.entitlements`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>
    
    <!-- Apple Sign In Capability -->
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
    
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
</dict>
</plist>
```

### 3. Info.plist Configuration

**File:** `ios/YoraaApp/Info.plist`

The app already has URL schemes configured for other services, but no specific Apple Sign-In configuration is needed in Info.plist beyond the entitlements.

### 4. Apple Developer Console Setup

1. **Enable Sign in with Apple:**
   - Go to [Apple Developer Console](https://developer.apple.com)
   - Navigate to Certificates, Identifiers & Profiles
   - Select your App ID
   - Enable "Sign in with Apple" capability
   - Save changes

2. **Firebase Console Setup:**
   - Go to Firebase Console
   - Navigate to Authentication > Sign-in method
   - Enable Apple provider
   - Add your Apple Team ID and Services ID

---

## Implementation Details

### Service Architecture

The implementation is split across multiple service files:

```
src/services/
├── appleAuthService.js          # Core Apple authentication logic
├── authenticationService.js     # High-level auth orchestration
├── yoraaAPI.js                  # Backend API integration
├── accountLinkingService.js     # Account linking functionality
└── fcmService.js                # Push notification setup
```

---

## Code Structure

### 1. Apple Auth Service (`appleAuthService.js`)

This is the core service that handles all Apple Sign-In operations.

#### Key Methods:

**`isAppleAuthAvailable()`**
- Checks if Apple Authentication is supported on the device
- Returns: `boolean`

**`signInWithApple()`**
- Main authentication method
- Handles the complete sign-in flow
- Returns: `Promise<UserCredential>` or `null` if cancelled

#### Implementation Flow:

```javascript
async signInWithApple() {
  // STEP 1: Check device support
  if (!appleAuth.isSupported) {
    throw new Error('Apple Sign In not supported');
  }

  // STEP 2: Set sign-in lock (prevents app state interference)
  yoraaAPI.setSignInLock(true);

  // STEP 3: Request Apple credentials
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  // STEP 4: Extract identity token
  const { identityToken, nonce } = appleAuthRequestResponse;

  // STEP 5: Create Firebase credential
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken, 
    nonce
  );

  // STEP 6: Sign in to Firebase
  const userCredential = await auth().signInWithCredential(appleCredential);

  // STEP 7: Update Firebase profile (if new user)
  if (userCredential.additionalUserInfo?.isNewUser) {
    const { givenName, familyName } = appleAuthRequestResponse.fullName || {};
    const displayName = `${givenName || ''} ${familyName || ''}`.trim();
    if (displayName) {
      await userCredential.user.updateProfile({ displayName });
    }
  }

  // STEP 8: Authenticate with backend
  const firebaseIdToken = await userCredential.user.getIdToken(true);
  const backendResponse = await yoraaAPI.firebaseLogin(firebaseIdToken);

  // STEP 9: Verify token storage
  const storedToken = await yoraaAPI.getUserToken();
  if (!storedToken) {
    throw new Error('Backend token not stored');
  }

  // STEP 10: Initialize FCM (push notifications)
  const fcmService = require('./fcmService').default;
  await fcmService.initialize();
  await fcmService.registerTokenWithBackend(storedToken);

  // STEP 11: Release sign-in lock
  yoraaAPI.setSignInLock(false);

  return userCredential;
}
```

#### Apple Response Data Structure:

The Apple authentication response contains:

```javascript
{
  user: "001234.567890abcdef1234567890abcdef.1234",     // Unique Apple user ID
  email: "user@privaterelay.appleid.com",               // Email (may be hidden)
  fullName: {                                           // Only sent on FIRST login
    givenName: "John",
    familyName: "Doe",
    middleName: null,
    namePrefix: null,
    nameSuffix: null,
    nickname: null
  },
  identityToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token
  authorizationCode: "c1234567890abcdef...",            // Authorization code
  nonce: "random-nonce-string",                         // Nonce for security
  state: null,                                          // Optional state
  realUserStatus: 1                                     // 1 = likely real, 0 = unsure
}
```

**Important Notes:**
- `email` may be a private relay email (`@privaterelay.appleid.com`)
- `fullName` is **only sent on the first login**, subsequent logins return `null`
- `identityToken` is a JWT that can be decoded to get user info
- Apple user ID is stable and unique per user per app

#### Identity Token Decoding:

The service decodes the JWT to extract additional information:

```javascript
// Decoded payload structure
{
  iss: "https://appleid.apple.com",
  sub: "001234.567890abcdef...",      // Apple User ID
  aud: "com.yourapp.bundleid",
  iat: 1730678400,                    // Issued at timestamp
  exp: 1730764800,                    // Expiration timestamp
  email: "user@privaterelay.appleid.com",
  email_verified: "true",
  is_private_email: "true",           // True if using relay
  nonce_supported: true
}
```

---

### 2. Authentication Service (`authenticationService.js`)

High-level orchestration service that coordinates the authentication process.

```javascript
async signInWithApple() {
  try {
    // Delegate to appleAuthService
    const appleResult = await appleAuthService.signInWithApple();
    
    if (!appleResult.success) {
      throw new Error(appleResult.error || 'Apple Sign In failed');
    }

    // Get Firebase ID token
    const firebaseUser = auth().currentUser;
    const idToken = await firebaseUser.getIdToken();
    
    // Authenticate with backend
    const backendResult = await this._authenticateWithBackend({
      idToken,
      email: appleResult.user.email,
      fullName: appleResult.user.fullName,
      method: 'apple'
    });

    // Complete authentication
    await this._completeAuthentication(backendResult.data);
    
    return {
      success: true,
      user: backendResult.data.user,
      token: backendResult.data.token,
      message: 'Apple Sign In successful'
    };
  } catch (error) {
    console.error('❌ Apple Sign In error:', error);
    return {
      success: false,
      error: this._getAuthErrorMessage(error)
    };
  }
}
```

---

### 3. Backend API Integration (`yoraaAPI.js`)

Handles communication with the backend server.

#### Firebase Login Method:

```javascript
async firebaseLogin(idToken) {
  try {
    const response = await this.makeRequest(
      '/api/auth/firebase-login',
      'POST',
      { idToken }
    );
    
    if (response.success && response.data) {
      const token = response.data.token;
      const userData = response.data.user;
      
      // Store token in AsyncStorage
      this.userToken = token;
      await AsyncStorage.setItem('userToken', token);
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await authStorageService.storeAuthData(token, userData);
      }
      
      // Transfer guest data
      await this.transferAllGuestData();
      
      return response.data;
    }
  } catch (error) {
    console.error('❌ Firebase Login failed:', error);
    throw error;
  }
}
```

#### Apple Sign-In Specific Endpoint:

```javascript
async appleSignIn(idToken) {
  try {
    const response = await this.makeRequest(
      '/api/auth/apple-signin',
      'POST',
      { idToken }
    );
    
    if (response.success && response.data) {
      const token = response.data.token;
      const userData = response.data.user;
      
      // Store authentication data
      this.userToken = token;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await authStorageService.storeAuthData(token, userData);
      
      // Transfer guest data
      await this.transferAllGuestData();
      
      return response.data;
    }
  } catch (error) {
    // Handle 409 conflict (account exists with different provider)
    if (error.response?.status === 409) {
      const conflictError = new Error('Account exists with different provider');
      conflictError.isAccountConflict = true;
      conflictError.status = 409;
      conflictError.data = error.response?.data?.data;
      throw conflictError;
    }
    throw error;
  }
}
```

---

### 4. Account Linking Service (`accountLinkingService.js`)

Handles linking Apple accounts with existing accounts.

```javascript
async linkAccount(existingMethod) {
  try {
    let userCredential;
    
    if (existingMethod === 'apple') {
      userCredential = await appleAuthService.signInWithApple();
      
      if (!userCredential) {
        throw new Error('Apple authentication was cancelled');
      }
    }
    
    // Link accounts on backend
    const result = await this.linkAccountsOnBackend(
      userCredential,
      existingMethod
    );
    
    return result;
  } catch (error) {
    console.error('Account linking failed:', error);
    throw error;
  }
}
```

---

## Authentication Flow

### Complete Sign-In Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  USER PRESSES "SIGN IN WITH APPLE" BUTTON                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  appleAuthService.signInWithApple()                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. Check if Apple Auth is supported                    │  │
│  │    - appleAuth.isSupported                             │  │
│  │    - Throw error if not supported                      │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Set Sign-In Lock                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ yoraaAPI.setSignInLock(true)                           │  │
│  │ Purpose: Prevents app state interference during auth   │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Request Apple Credentials                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ appleAuth.performRequest({                             │  │
│  │   requestedOperation: LOGIN,                           │  │
│  │   requestedScopes: [EMAIL, FULL_NAME]                  │  │
│  │ })                                                      │  │
│  │                                                         │  │
│  │ → Shows Apple Sign-In modal                            │  │
│  │ → User authenticates with Face ID/Touch ID             │  │
│  │ → Returns: identityToken, nonce, user info             │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Create Firebase Credential                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ auth.AppleAuthProvider.credential(                     │  │
│  │   identityToken,                                       │  │
│  │   nonce                                                │  │
│  │ )                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Sign In to Firebase                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ auth().signInWithCredential(appleCredential)           │  │
│  │                                                         │  │
│  │ Returns:                                                │  │
│  │   - userCredential.user (Firebase user object)         │  │
│  │   - userCredential.additionalUserInfo.isNewUser        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Update Firebase Profile (if new user)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ if (isNewUser && fullName) {                           │  │
│  │   const displayName = `${givenName} ${familyName}`;    │  │
│  │   await user.updateProfile({ displayName });           │  │
│  │ }                                                       │  │
│  │                                                         │  │
│  │ Note: fullName only available on FIRST login!          │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Get Firebase ID Token                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ const firebaseIdToken =                                │  │
│  │   await user.getIdToken(true); // Force refresh        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Authenticate with Backend                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ yoraaAPI.firebaseLogin(firebaseIdToken)                │  │
│  │                                                         │  │
│  │ Backend Process:                                        │  │
│  │ 1. Verify Firebase ID token                            │  │
│  │ 2. Extract user info from token                        │  │
│  │ 3. Check if user exists in database                    │  │
│  │ 4. Create new user OR update existing user             │  │
│  │ 5. Generate backend JWT token                          │  │
│  │ 6. Return: { token, user, isNewUser }                  │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Store Authentication Data                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ await AsyncStorage.setItem('userToken', token);        │  │
│  │ await AsyncStorage.setItem('userData', userData);      │  │
│  │ await authStorageService.storeAuthData(...);           │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Verify Token Storage                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ const storedToken = await yoraaAPI.getUserToken();     │  │
│  │ if (!storedToken) {                                    │  │
│  │   throw new Error('Token not stored');                 │  │
│  │ }                                                       │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Initialize FCM (Push Notifications)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ const fcmService = require('./fcmService').default;    │  │
│  │ const fcmResult = await fcmService.initialize();       │  │
│  │                                                         │  │
│  │ if (fcmResult.success && fcmResult.token) {            │  │
│  │   await fcmService.registerTokenWithBackend(token);    │  │
│  │ }                                                       │  │
│  │                                                         │  │
│  │ Note: Non-critical - continues even if this fails      │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Transfer Guest Data                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ await yoraaAPI.transferAllGuestData();                 │  │
│  │                                                         │  │
│  │ Transfers:                                              │  │
│  │ - Shopping cart items                                  │  │
│  │ - Favorite products                                    │  │
│  │ - Browsing history                                     │  │
│  │ - Any other guest session data                         │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Release Sign-In Lock                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ yoraaAPI.setSignInLock(false);                         │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  ✅ AUTHENTICATION COMPLETE                                   │
│  Return userCredential to caller                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Backend Integration

### Backend Endpoints

The backend must implement these endpoints:

#### 1. Firebase Login Endpoint

**Endpoint:** `POST /api/auth/firebase-login`

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Backend Process:**
1. Verify Firebase ID token using Firebase Admin SDK
2. Extract user information from verified token
3. Check if user exists in database (by Firebase UID)
4. If new user: Create user account
5. If existing user: Update last login timestamp
6. Generate backend JWT token
7. Return user data and token

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "backend-jwt-token...",
    "user": {
      "_id": "user-database-id",
      "name": "John Doe",
      "email": "user@example.com",
      "firebaseUid": "firebase-user-id",
      "authProvider": "apple",
      "createdAt": "2025-11-03T10:00:00.000Z",
      "lastLogin": "2025-11-03T10:00:00.000Z"
    },
    "isNewUser": false
  }
}
```

#### 2. Apple Sign-In Endpoint (Alternative)

**Endpoint:** `POST /api/auth/apple-signin`

**Request Body:**
```json
{
  "idToken": "firebase-id-token..."
}
```

This endpoint performs the same operations as firebase-login but may include Apple-specific logic.

---

### Backend Implementation Example (Node.js/Express)

```javascript
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firebase Login endpoint
app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Step 1: Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name;
    const provider = decodedToken.firebase.sign_in_provider; // "apple.com"
    
    // Step 2: Find or create user in database
    let user = await User.findOne({ firebaseUid });
    let isNewUser = false;
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUid,
        email,
        name,
        authProvider: provider === 'apple.com' ? 'apple' : provider,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await user.save();
      isNewUser = true;
    } else {
      // Update existing user
      user.lastLogin = new Date();
      if (email && !user.email) user.email = email;
      if (name && !user.name) user.name = name;
      await user.save();
    }
    
    // Step 3: Generate backend JWT token
    const token = jwt.sign(
      { userId: user._id, firebaseUid: user.firebaseUid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Step 4: Return response
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          firebaseUid: user.firebaseUid,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        isNewUser
      }
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});
```

---

## Error Handling

### User Cancellation

```javascript
// Error code 1001 = user cancelled
if (error.code === '1001' || error.code === 1001 || 
    error.code === 'ERR_REQUEST_CANCELED') {
  console.log('User canceled Apple Sign In');
  // Don't throw error - just return null
  return null;
}
```

### Backend Authentication Failure

If backend authentication fails, the service performs a **rollback**:

```javascript
try {
  // Attempt backend authentication
  await yoraaAPI.firebaseLogin(firebaseIdToken);
} catch (backendError) {
  console.error('Backend authentication failed - ROLLBACK');
  
  // Sign out from Firebase
  await auth().signOut();
  
  // Clear any stored tokens
  await yoraaAPI.clearAuthTokens();
  
  // Throw user-friendly error
  throw new Error('Sign-in failed. Please try again.');
}
```

### Account Conflict (409 Error)

When a user tries to sign in with Apple but an account already exists with the same email using a different provider:

```javascript
// Backend returns 409 status
if (error.response?.status === 409) {
  const conflictError = new Error(
    'Account exists with different authentication method'
  );
  conflictError.isAccountConflict = true;
  conflictError.status = 409;
  conflictError.data = {
    existingMethod: 'google', // or 'email'
    email: 'user@example.com'
  };
  throw conflictError;
}

// UI handles this by showing account linking modal
```

### Common Error Codes

| Error Code | Description | Handling |
|------------|-------------|----------|
| `1001` | User cancelled sign-in | Silent - don't show error |
| `ERR_REQUEST_CANCELED` | Request was canceled | Silent - don't show error |
| `ERR_REQUEST_NOT_HANDLED` | Apple didn't handle request | Show error message |
| `ERR_REQUEST_NOT_INTERACTIVE` | Not in interactive mode | Show error message |
| `ERR_REQUEST_UNKNOWN` | Unknown error from Apple | Show generic error |
| `auth/invalid-credential` | Invalid Firebase credential | Show error and retry |
| Backend 409 | Account exists with different provider | Show account linking modal |
| Backend 401 | Authentication failed | Show error and retry |

---

## Testing & Debugging

### Comprehensive Logging

The implementation includes extensive logging at every step:

```javascript
console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║       🍎 APPLE AUTH SERVICE - SIGN IN FLOW            ║');
console.log('╚═══════════════════════════════════════════════════════╝');
console.log(`⏰ Start Time: ${new Date().toISOString()}`);

// ... authentication steps ...

console.log('✅ Apple Sign In flow completed successfully');
console.log(`⏰ End Time: ${new Date().toISOString()}`);
```

### Debug Information Logged

1. **Apple Response Data:**
   - User ID
   - Email (may be hidden)
   - Full name (only on first login)
   - Identity token (truncated)
   - Authorization code (truncated)
   - Real user status

2. **Decoded Identity Token:**
   - Issuer
   - Subject (user ID)
   - Audience
   - Issued at / Expiration
   - Email verification status
   - Private email flag

3. **Firebase Authentication:**
   - UID
   - Email
   - Display name
   - Email verified status
   - Created at / Last sign-in
   - Is new user flag
   - Provider ID

4. **Backend Sync Verification:**
   - Firebase user state
   - Backend user state
   - Sync status checks
   - Account linking information

### Testing Checklist

- [ ] **First-time sign-in:** Creates new account with full name
- [ ] **Subsequent sign-ins:** Uses existing account (no name data from Apple)
- [ ] **Email privacy:** Handles private relay emails correctly
- [ ] **User cancellation:** Doesn't show error, just returns to login screen
- [ ] **Firebase sync:** User data syncs correctly between Firebase and backend
- [ ] **Token storage:** Backend token is stored and verified
- [ ] **FCM registration:** Push notification token is registered (non-blocking)
- [ ] **Guest data transfer:** Cart/favorites transfer to logged-in account
- [ ] **Account conflict:** Shows linking modal when account exists with different provider
- [ ] **Network failure:** Shows appropriate error and allows retry
- [ ] **Backend rollback:** Firebase sign-out on backend auth failure

### Testing on Device

**Requirements:**
- Physical iOS device (Apple Sign-In doesn't work on simulator reliably)
- iOS 13.0 or later
- Device must have an Apple ID signed in

**Test Commands:**

```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Run on device
npx react-native run-ios --device "Your iPhone Name"
```

### Debugging Tips

1. **Check Apple Developer Console:**
   - Verify "Sign in with Apple" is enabled for your App ID
   - Check that bundle identifier matches

2. **Check Firebase Console:**
   - Verify Apple provider is enabled
   - Check that Apple Team ID is correct

3. **Check Entitlements:**
   - Open Xcode project
   - Verify "Sign in with Apple" capability is added
   - Check that entitlements file is correctly linked

4. **Monitor Logs:**
   ```bash
   # iOS device logs
   xcrun simctl spawn booted log stream --predicate 'processImagePath contains "YoraaApp"'
   ```

5. **Test Token Flow:**
   ```bash
   # Use test scripts
   node test-apple-auth.js
   ```

---

## UI Components

### Re-Authentication Modal

The app includes a modal for re-authenticating with Apple when linking accounts:

**File:** `src/components/ReAuthModal.js`

```javascript
<TouchableOpacity 
  style={[styles.socialButton, styles.appleButton]}
  onPress={handleSocialAuth}
>
  <AppleIcon width={20} height={20} />
  <Text style={[styles.socialButtonText, styles.appleButtonText]}>
    Sign in with Apple
  </Text>
</TouchableOpacity>
```

---

## Security Considerations

### 1. Token Security
- Firebase ID tokens are short-lived (1 hour)
- Backend JWT tokens have configurable expiration (typically 30 days)
- Tokens are stored securely in AsyncStorage (encrypted on iOS)

### 2. Private Relay Emails
- Apple may provide relay emails (`@privaterelay.appleid.com`)
- Backend must handle cases where email may change or not be provided
- Use Firebase UID as primary identifier, not email

### 3. Nonce Usage
- Nonce is used to prevent replay attacks
- Generated by Firebase, validated by Apple

### 4. Account Linking
- Prevents duplicate accounts with same email
- Requires re-authentication for security
- Uses secure token exchange

### 5. Sign-In Lock
- Prevents race conditions during authentication
- Blocks app state reinitialization during sign-in
- Automatically released on completion or error

---

## Common Issues & Solutions

### Issue 1: "Apple Sign In not supported"
**Solution:** Only works on iOS 13+ and requires physical device for testing

### Issue 2: Full name is null on subsequent logins
**Solution:** This is expected behavior - Apple only sends name on first login. Store it in backend on first login.

### Issue 3: Email is a relay email
**Solution:** This is a privacy feature. Accept relay emails and forward communications through Apple's relay.

### Issue 4: Sign-in works but app doesn't navigate
**Solution:** Check that backend authentication succeeds and token is stored correctly.

### Issue 5: Account conflict errors
**Solution:** Implement account linking flow or allow users to sign in with original method first.

---

## Future Enhancements

1. **Credential State Checking:**
   - Periodically check if Apple credentials are still valid
   - Handle revoked credentials gracefully

2. **Better Error Messages:**
   - More specific error messages for different failure scenarios
   - Localization support

3. **Analytics Integration:**
   - Track sign-in success/failure rates
   - Monitor authentication flow completion times

4. **Biometric Re-Authentication:**
   - Use Face ID/Touch ID for re-authentication without Apple modal

---

## References

- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [React Native Apple Authentication](https://github.com/invertase/react-native-apple-authentication)
- [Firebase Apple Authentication](https://firebase.google.com/docs/auth/ios/apple)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

---

## Maintenance Notes

**Last Updated:** November 3, 2025

**Dependencies Version:**
- `@invertase/react-native-apple-authentication`: 2.4.1
- `@react-native-firebase/auth`: 23.4.0

**Known Issues:**
- None currently

**Upcoming Changes:**
- None planned

---

*This documentation was created by analyzing the complete Apple Sign-In implementation in the Yoraa app.*
