# 🔧 Authentication Troubleshooting Checklist

Use this checklist to systematically diagnose and fix authentication issues.

## Pre-Flight Checks (Before Testing)

### Backend Configuration
- [ ] Backend API is running and accessible
- [ ] Backend endpoint `/api/auth/login/firebase` is working
- [ ] Backend can validate Firebase ID tokens
- [ ] Backend returns JWT token in response
- [ ] Backend CORS is configured for mobile app

### Firebase Configuration
- [ ] Phone Authentication is enabled in Firebase Console
- [ ] Apple Sign In is enabled in Firebase Console (iOS)
- [ ] Google Sign In is enabled in Firebase Console
- [ ] `GoogleService-Info.plist` is up to date (iOS)
- [ ] `google-services.json` is up to date (Android)
- [ ] Firebase project ID matches backend configuration

### iOS Configuration (TestFlight)
- [ ] Bundle ID matches Firebase project
- [ ] APNS certificates are valid
- [ ] Apple Sign In capability is enabled
- [ ] Associated domains are configured

### Android Configuration
- [ ] Package name matches Firebase project
- [ ] SHA-1 fingerprint is added to Firebase
- [ ] Google Play Services is available

## Debug Session Checklist

### Step 1: Verify Firebase Authentication

**What to Check:**
```
✅ Firebase Sign In successful
👤 User Details:
   - UID: [should exist]
   - Email/Phone: [should exist]
```

**If Failed:**
- [ ] Check Firebase Console for error details
- [ ] Verify Firebase SDK version compatibility
- [ ] Check network connectivity
- [ ] Review Firebase error code in logs
- [ ] Verify API keys are correct

### Step 2: Verify Backend Authentication

**What to Check:**
```
✅ Backend authentication successful
📦 Backend Response: { token: "...", user: {...} }
```

**If Failed:**
- [ ] Verify backend is accessible (ping/curl test)
- [ ] Check backend logs for errors
- [ ] Verify Firebase ID token is valid
- [ ] Test endpoint manually with Postman
- [ ] Check backend Firebase Admin SDK setup
- [ ] Verify Firebase project ID in backend config

**Common Backend Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| Network request failed | Backend unreachable | Check backend URL, firewall rules |
| Invalid token | Token expired or malformed | Force refresh token before sending |
| 401 Unauthorized | Backend can't validate token | Check Firebase Admin SDK setup |
| 500 Server Error | Backend crash | Check backend error logs |
| Timeout | Backend too slow | Increase timeout, optimize backend |

### Step 3: Verify Token Storage

**What to Check:**
```
🔍 Verifying token storage...
   - Token Storage: ✅ EXISTS
🔐 Final Authentication Status: ✅ AUTHENTICATED
```

**If Failed:**
- [ ] Check AsyncStorage permissions
- [ ] Verify AsyncStorage is not full
- [ ] Check if backend response contains token
- [ ] Review `yoraaAPI.firebaseLogin()` implementation
- [ ] Check `authStorageService.storeAuthData()` implementation
- [ ] Verify token format is correct

**Token Storage Debug:**
```javascript
// Add this to debug token storage
const token = await AsyncStorage.getItem('userToken');
console.log('Stored Token:', token);
console.log('Token Length:', token?.length);
console.log('Is Authenticated:', yoraaAPI.isAuthenticated());
```

### Step 4: Verify Session Creation

**What to Check:**
```
✅ Session created for [method] login
```

**If Failed:**
- [ ] Check `sessionManager.createSession()` implementation
- [ ] Verify session storage mechanism
- [ ] Check if user data is complete
- [ ] Review session expiration logic

### Step 5: Verify Navigation

**What to Check:**
```
🚀 STEP X: Navigating to next screen...
📍 Navigation Target: [screen name]
✅ Navigation completed
```

**If Failed:**
- [ ] Check navigation parameters
- [ ] Verify navigation stack is correct
- [ ] Check if screen exists in navigator
- [ ] Review navigation timing (not too early)

## Common Issue Resolution

### Issue 1: "Not Authenticated" Status After Login

**Diagnostic Steps:**
1. Search logs for: `DEBUG SESSION STARTED`
2. Find the authentication attempt
3. Check each step sequentially

**Resolution Path:**

```
Step 1: Firebase Auth
├─ ✅ Success → Go to Step 2
└─ ❌ Failed → Fix Firebase configuration

Step 2: Backend Auth
├─ ✅ Success → Go to Step 3
└─ ❌ Failed → Fix backend connectivity/configuration

Step 3: Token Storage
├─ ✅ Success → Go to Step 4
└─ ❌ Failed → Fix AsyncStorage/token storage

Step 4: Authentication Status
├─ ✅ AUTHENTICATED → Issue is elsewhere
└─ ❌ NOT AUTHENTICATED → Fix yoraaAPI.isAuthenticated() logic
```

### Issue 2: User Can't Access Backend Features

**Check:**
1. Is user authenticated with Firebase? → YES
2. Is user authenticated with backend? → NO ❌

**This means:**
- Firebase login worked
- Backend authentication failed
- No JWT token
- No backend API access

**Fix:**
- [ ] Ensure backend is accessible
- [ ] Verify Firebase ID token is sent to backend
- [ ] Check backend can validate token
- [ ] Ensure backend returns JWT token
- [ ] Verify token is stored after backend auth

### Issue 3: Profile Not Created/Updated

**Check:**
1. Is backend auth successful? → NO
   - Fix backend authentication first
2. Is backend auth successful? → YES
   - Does backend response include user object?
     - NO → Backend not returning user data
     - YES → Check if user data is stored

**Fix:**
- [ ] Verify backend returns user object in response
- [ ] Check `authStorageService.storeAuthData()` is called
- [ ] Verify user data is saved to AsyncStorage
- [ ] Check profile screen fetches from correct storage

### Issue 4: Intermittent Authentication Failures

**Possible Causes:**
- Network instability
- Backend timeout
- Token expiration
- Race conditions

**Debug:**
- [ ] Check network quality during auth
- [ ] Review timing of token requests
- [ ] Add retry logic for backend auth
- [ ] Increase timeout values
- [ ] Check for concurrent auth requests

## Platform-Specific Issues

### iOS TestFlight Specific

**Issue: Phone Auth Not Working**
- [ ] Check APNS certificates
- [ ] Verify `GoogleService-Info.plist` is in project
- [ ] Enable App Verification disabled for debug
- [ ] Use test phone numbers for testing

**Issue: Apple Sign In Fails**
- [ ] Verify Apple Sign In capability enabled
- [ ] Check Bundle ID matches app
- [ ] Review associated domains
- [ ] Test on real device (doesn't work in simulator)

### Android Specific

**Issue: Google Sign In Fails**
- [ ] Verify SHA-1 fingerprint in Firebase
- [ ] Check Google Play Services is installed
- [ ] Verify `google-services.json` is in app/
- [ ] Check package name matches Firebase

**Issue: SMS Auto-Retrieval Not Working**
- [ ] Verify SMS permissions
- [ ] Check phone number format
- [ ] Test manual OTP entry

## Emergency Debug Commands

### Check Current Auth State
```javascript
// Firebase
const firebaseUser = auth().currentUser;
console.log('Firebase User:', firebaseUser?.uid);

// Backend
const backendToken = await AsyncStorage.getItem('userToken');
console.log('Backend Token:', backendToken ? 'EXISTS' : 'MISSING');

// API
const isAuth = yoraaAPI.isAuthenticated();
console.log('Is Authenticated:', isAuth);
```

### Force Re-Authentication
```javascript
// Sign out completely
await auth().signOut();
await AsyncStorage.removeItem('userToken');
await AsyncStorage.removeItem('userData');

// Then try login again
```

### Test Backend Directly
```bash
# Get Firebase ID token from logs
# Then test backend endpoint

curl -X POST https://your-backend.com/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_FIREBASE_TOKEN_HERE"}'

# Should return:
# { "success": true, "data": { "token": "JWT_TOKEN", "user": {...} } }
```

### Verify Token Storage
```javascript
// Check what's actually stored
const allKeys = await AsyncStorage.getAllKeys();
console.log('All Storage Keys:', allKeys);

const userToken = await AsyncStorage.getItem('userToken');
const userData = await AsyncStorage.getItem('userData');

console.log('User Token:', userToken ? 'EXISTS' : 'MISSING');
console.log('User Data:', userData ? JSON.parse(userData) : 'MISSING');
```

## Success Criteria

An authentication is considered successful when ALL of these are true:

- [x] Firebase authentication completes without error
- [x] Firebase user has UID
- [x] Firebase ID token is generated
- [x] Backend authentication succeeds
- [x] Backend returns JWT token
- [x] JWT token is stored in AsyncStorage
- [x] `yoraaAPI.isAuthenticated()` returns `true`
- [x] Session is created
- [x] User can navigate to next screen
- [x] User can access authenticated features

## Quick Reference: Log Patterns

### ✅ Success Pattern
```
✅ Firebase Sign In successful
✅ Backend authentication successful
✅ Token Storage: EXISTS
✅ AUTHENTICATED
✅ Session created
✅ Navigation completed
```

### ❌ Backend Failure Pattern
```
✅ Firebase Sign In successful
❌ BACKEND AUTHENTICATION FAILED
⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend!
```
**Action:** Fix backend connectivity/configuration

### ❌ Token Storage Failure Pattern
```
✅ Firebase Sign In successful
✅ Backend authentication successful
Token Storage: ❌ MISSING
Token After Retry: ❌ STILL MISSING
```
**Action:** Fix AsyncStorage or token persistence logic

## Escalation Path

If you've gone through this checklist and authentication still fails:

1. **Collect Full Debug Session**
   - Copy entire log from `╔═══` to `╚═══`
   - Include timestamp
   - Note device/platform

2. **Document Steps to Reproduce**
   - What login method was used?
   - What step failed?
   - Is it consistent or intermittent?

3. **Check Backend Status**
   - Is backend accessible?
   - Are there backend error logs?
   - Is Firebase Admin SDK working?

4. **Create Issue Report**
   - Include debug logs
   - Include reproduction steps
   - Include platform details
   - Reference this checklist

---

**Troubleshooting Version:** 1.0.0  
**Last Updated:** 2025-10-12  
**For detailed debugging, see:** AUTHENTICATION_DEBUG_GUIDE.md
