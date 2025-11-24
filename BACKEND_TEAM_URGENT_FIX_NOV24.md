# 🚨 URGENT: Backend Bug in `/api/auth/login/firebase`

**To:** Backend Team  
**From:** Frontend/Mobile Team  
**Date:** November 24, 2025  
**Priority:** 🔴 CRITICAL - Production Down

---

## 📋 Executive Summary

**Problem:** Your `/api/auth/login/firebase` endpoint works for Apple/Google but **FAILS for Firebase Phone Authentication**

**Impact:** All users trying to login with phone number cannot complete authentication

**Error Seen by Users:**
```
Authentication Error
User validation failed: authProvider: 'phone' is not a valid enum value for path 'authProvider'.
```

---

## 🐛 The Bug

Your API documentation shows this endpoint handles Firebase authentication:

```javascript
POST /api/auth/login/firebase
Body: { "idToken": "..." }
```

**What Works:** ✅
- Apple Sign In → `authProvider: 'apple'`
- Google Sign In → `authProvider: 'google'`

**What Breaks:** ❌
- Phone Sign In → `authProvider: 'phone'` → **VALIDATION ERROR**

---

## 🔍 Root Cause

### What Your Backend is Doing (Wrong):

```javascript
// Current implementation (INCORRECT):
const decodedToken = await admin.auth().verifyIdToken(idToken);
const authProvider = decodedToken.firebase.sign_in_provider; // ❌ Direct use

// Try to save user
user.authProvider = authProvider; // ❌ FAILS when authProvider = 'phone'
await user.save(); // ❌ Mongoose validation error
```

### Why It Fails:

**Firebase returns these values in `sign_in_provider`:**
- `'phone'` ← Phone authentication ❌ **NOT in your User schema**
- `'google.com'` ← Google Sign In
- `'apple.com'` ← Apple Sign In  
- `'password'` ← Email/Password

**Your User Model Schema:**
```javascript
authProvider: {
  type: String,
  enum: ['google', 'apple', 'password', 'firebase'], // ❌ 'phone' is missing!
  required: true
}
```

---

## ✅ The Fix

Add this mapping function to your `/api/auth/login/firebase` controller:

```javascript
/**
 * Maps Firebase sign_in_provider values to our User schema enum values
 * @param {string} firebaseProvider - From decodedToken.firebase.sign_in_provider
 * @returns {string} - Mapped value for User.authProvider field
 */
const mapAuthProvider = (firebaseProvider) => {
  const providerMap = {
    // Firebase Phone Auth
    'phone': 'firebase',
    
    // Firebase Email/Password
    'password': 'firebase',
    
    // Social providers (remove .com suffix)
    'google.com': 'google',
    'apple.com': 'apple',
    'facebook.com': 'firebase',
    
    // Custom token
    'custom': 'firebase',
  };
  
  // Default to 'firebase' for unknown providers
  return providerMap[firebaseProvider] || 'firebase';
};

// In your firebaseLogin controller/route handler:
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // ✅ FIX: Map Firebase provider to our schema values
    const firebaseProvider = decodedToken.firebase.sign_in_provider;
    const authProvider = mapAuthProvider(firebaseProvider);
    
    console.log(`Firebase Provider: ${firebaseProvider} → Mapped: ${authProvider}`);
    
    // Now use the mapped value
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: decodedToken.uid,
        authProvider: authProvider, // ✅ Using mapped value
        email: decodedToken.email,
        name: decodedToken.name,
        phoneNumber: decodedToken.phone_number,
        isVerified: true,
      });
    } else {
      // Update existing user
      user.authProvider = authProvider; // ✅ Using mapped value
      user.email = decodedToken.email || user.email;
      user.name = decodedToken.name || user.name;
    }
    
    await user.save(); // ✅ Now works for all Firebase auth methods
    
    // Generate JWT and return response
    const token = generateJWT(user);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user },
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Firebase login error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid Firebase ID token',
      data: null,
      statusCode: 400
    });
  }
};
```

---

## 🧪 How to Test

### Test Case 1: Phone Authentication
```bash
# User completes Firebase Phone Auth on mobile app
# App sends Firebase ID token to your backend

curl -X POST http://185.193.19.244:3001/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ..."
  }'

# Expected: SUCCESS
# {
#   "success": true,
#   "data": {
#     "user": {
#       "authProvider": "firebase",  ← ✅ Mapped from 'phone'
#       "phoneNumber": "+917006114695"
#     }
#   }
# }
```

### Test Case 2: Apple Sign In (Should Still Work)
```bash
curl -X POST http://185.193.19.244:3001/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken": "APPLE_ID_TOKEN"}'

# Expected: SUCCESS  
# {
#   "data": {
#     "user": {
#       "authProvider": "apple"  ← ✅ Mapped from 'apple.com'
#     }
#   }
# }
```

### Test Case 3: Google Sign In (Should Still Work)
```bash
curl -X POST http://185.193.19.244:3001/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken": "GOOGLE_ID_TOKEN"}'

# Expected: SUCCESS
# {
#   "data": {
#     "user": {
#       "authProvider": "google"  ← ✅ Mapped from 'google.com'
#     }
#   }
# }
```

---

## 📊 Verification

After deploying the fix, check your backend logs for:

```
Firebase Provider: phone → Mapped: firebase ✅
Firebase Provider: google.com → Mapped: google ✅
Firebase Provider: apple.com → Mapped: apple ✅
```

You should see **NO MORE** errors like:
```
❌ User validation failed: authProvider: 'phone' is not a valid enum value
```

---

## 🔧 Alternative Fix (Not Recommended)

If you don't want to map values, you can update your User model schema to allow 'phone':

```javascript
authProvider: {
  type: String,
  enum: ['google', 'apple', 'password', 'firebase', 'phone'], // ✅ Added 'phone'
  required: true
}
```

**Why This is Not Recommended:**
- Creates inconsistency (why have both 'firebase' and 'phone'?)
- Harder to query users by auth method
- Doesn't solve the `.com` suffix issue for google.com/apple.com

---

## ⏰ Timeline

**URGENT - Please fix within:** 2 hours

**Reason:**
- Production is down
- ALL phone authentication is broken
- Users cannot complete registration/login
- Business impact: Cannot onboard new users

---

## 📞 Contact

If you need clarification or have questions about the fix:
- Frontend/Mobile Team: [Your Contact]
- Test Credentials: Available on request

---

## 🆘 Current Workaround (Temporary)

While waiting for backend fix, we can temporarily:
1. ❌ Use your `/api/auth/generate-otp` + `/api/auth/verifyOtp` instead (requires rewriting frontend)
2. ❌ Disable phone auth in the app (bad user experience)
3. ✅ **Best: Fix the backend (2 minutes of code change)**

---

## 📝 Summary

**What to change:** 1 file  
**Lines of code:** ~20 lines (add mapping function + use it)  
**Testing required:** 5 minutes  
**Deployment:** Standard backend deployment  

**Impact after fix:**
- ✅ Phone authentication works
- ✅ Apple Sign In continues to work
- ✅ Google Sign In continues to work
- ✅ All Firebase auth methods supported
- ✅ Production back online

---

**Please prioritize this fix. Our production app is down.**

Thank you!
