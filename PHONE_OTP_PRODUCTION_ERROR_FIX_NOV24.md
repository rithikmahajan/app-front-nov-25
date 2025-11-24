# Phone OTP Production Login Error - Diagnosis & Fix

**Date:** November 24, 2025  
**Issue:** "Authentication Error" when logging in with phone number + OTP  
**Status:** ✅ **BACKEND ENDPOINT EXISTS** - Issue is likely token validation

---

## 🔍 Diagnosis Results

### Backend Status: ✅ WORKING
```bash
# Test just performed:
$ curl -X POST https://api.yoraa.in.net/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

Response: 400 Bad Request
{
  "success": false,
  "message": "Decoding Firebase ID token failed...",
  "statusCode": 400
}
```

**This is actually GOOD:**
- ✅ Endpoint exists (not 404)
- ✅ Backend is processing requests
- ✅ Firebase token validation is working (rejecting invalid token)

---

## 🎯 Root Cause Analysis

The error occurs in **Step 3** of the authentication flow:

1. ✅ **Step 1:** User enters phone number → Firebase sends OTP (WORKS)
2. ✅ **Step 2:** User enters OTP → Firebase verifies code (WORKS)
3. ❌ **Step 3:** App authenticates with backend → **FAILS HERE**

### Possible Causes:

#### A. Token Expiration ⏱️
Firebase tokens expire quickly. If there's a delay between:
- Getting the token from Firebase
- Sending it to backend

The token might be expired.

#### B. Token Format Issue 📝
Backend might be expecting:
- Different token format
- Additional fields
- Specific headers

#### C. Network Timeout 🌐
Request might be timing out due to:
- Slow connection
- Backend processing delay
- Cloudflare protection

#### D. Production vs Development Config 🔧
App might be:
- Using wrong environment config
- Missing production Firebase settings
- Using dev mode flags in production

---

## 🔧 Immediate Fixes to Try

### Fix 1: Force Fresh Token (RECOMMENDED)

Update the OTP verification code to force a fresh token:

```javascript
// In: src/screens/loginaccountmobilenumberverificationcode.js
// Around line 270

// BEFORE:
const idToken = await user.getIdToken(/* forceRefresh */ true);

// AFTER:
// Get a fresh token with forced refresh and longer validity
const idToken = await user.getIdToken(/* forceRefresh */ true);
console.log('🔑 Token expires at:', new Date(Date.now() + 3600000).toISOString());

// Verify token is fresh (less than 5 minutes old)
const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
const tokenAge = Date.now() / 1000 - tokenPayload.iat;
console.log(`⏱️ Token age: ${tokenAge} seconds`);

if (tokenAge > 300) { // 5 minutes
  console.warn('⚠️ Token might be stale, getting new one...');
  await user.reload();
  idToken = await user.getIdToken(true);
}
```

### Fix 2: Add Request Timeout Handling

```javascript
// In: src/screens/loginaccountmobilenumberverificationcode.js
// Around line 260

// Add timeout wrapper
const authenticateWithTimeout = async (idToken) => {
  return Promise.race([
    yoraaAPI.firebaseLogin(idToken),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Backend request timeout after 30s')), 30000)
    )
  ]);
};

// Use it:
backendResponse = await authenticateWithTimeout(idToken);
```

### Fix 3: Enhanced Error Logging

Add this right before the backend call:

```javascript
// In: src/screens/loginaccountmobilenumberverificationcode.js
// Around line 285

console.log('\n🔐 AUTHENTICATION DEBUG INFO:');
console.log('   - Firebase User UID:', user.uid);
console.log('   - Phone Number:', user.phoneNumber);
console.log('   - Token (first 50):', idToken.substring(0, 50));
console.log('   - Token (last 50):', idToken.substring(idToken.length - 50));
console.log('   - Token length:', idToken.length);
console.log('   - Current time:', new Date().toISOString());
console.log('   - Build type:', __DEV__ ? 'DEBUG' : 'PRODUCTION');

// Try to parse token to check validity
try {
  const parts = idToken.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('   - Token issued at:', new Date(payload.iat * 1000).toISOString());
    console.log('   - Token expires at:', new Date(payload.exp * 1000).toISOString());
    console.log('   - Token valid for:', Math.floor((payload.exp * 1000 - Date.now()) / 1000), 'seconds');
  }
} catch (e) {
  console.error('❌ Failed to parse token:', e);
}
```

---

## 🧪 Testing Steps

### Step 1: Enable Debug Logging
1. Build a debug version with the fixes above
2. Install on device
3. Try to login with phone + OTP
4. Capture console logs

### Step 2: Check Logs for These Keys
Look for these in logs:
```
✅ "Token age: X seconds" - Should be < 60 seconds
✅ "Token valid for: X seconds" - Should be > 3000 seconds
❌ "Token might be stale" - BAD, token too old
❌ "Backend request timeout" - BAD, network issue
```

### Step 3: Test Backend Directly
If you capture a real token from logs, test it:

```bash
# Replace TOKEN_FROM_LOGS with actual token
curl -X POST https://api.yoraa.in.net/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"TOKEN_FROM_LOGS"}' \
  -v
```

Expected response:
- ✅ 200: Success with JWT token
- ❌ 400: Invalid token (expired/malformed)
- ❌ 401: Unauthorized
- ❌ 500: Backend error

---

## 🔬 Advanced Debugging

### Check Firebase Token Service Account

1. **Verify Firebase Admin SDK** on backend:
   - Service account JSON is loaded
   - Has correct project ID
   - Permissions are correct

2. **Check Token Audience**:
   ```javascript
   // Token should have these fields:
   {
     "aud": "yoraa-android-ios",  // Must match Firebase project ID
     "iss": "https://securetoken.google.com/yoraa-android-ios",
     "phone_number": "+917006114695"  // User's phone
   }
   ```

3. **Verify App Attestation** (iOS production):
   ```javascript
   // In production, iOS might be sending App Attest
   // Backend must handle both regular and attested requests
   ```

---

## 📊 Current Flow Analysis

Based on the code review:

```javascript
// File: src/screens/loginaccountmobilenumberverificationcode.js

1. ✅ OTP Verification (Line 204-217)
   - Uses confirmation.confirm(otpCode)
   - Gets Firebase user credential
   - WORKS: Firebase returns authenticated user

2. ✅ Token Generation (Line 270)
   - Gets Firebase ID token
   - Token is valid JWT
   - WORKS: Token generated successfully

3. ❌ Backend Authentication (Line 285-350)
   - Has 3 retry attempts with backoff
   - Calls yoraaAPI.firebaseLogin(idToken)
   - FAILS: Either timeout or invalid token

4. Current retry logic:
   - Attempt 1: Immediate
   - Attempt 2: Wait 2 seconds
   - Attempt 3: Wait 4 seconds
   - Then gives up
```

**Problem:** Each retry uses the same token, which might be getting staler.

**Solution:** Get a fresh token on each retry:

```javascript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Get FRESH token on each retry
    console.log(`   - Getting fresh Firebase ID token (attempt ${attempt})...`);
    const idToken = await user.getIdToken(true); // Force refresh each time
    
    console.log(`   - Token freshly generated at: ${new Date().toISOString()}`);
    
    // Rest of the code...
    backendResponse = await yoraaAPI.firebaseLogin(idToken);
```

---

## 🚀 Quick Fix Deployment

### Option A: Minimal Change (RECOMMENDED)
Just update the retry loop to get fresh token:

```bash
# 1. Open the file
code src/screens/loginaccountmobilenumberverificationcode.js

# 2. Find line ~263 (inside the retry loop)
# 3. Move the getIdToken() call INSIDE the loop
# 4. Add forceRefresh on each attempt

# Before:
const idToken = await user.getIdToken(true);  // Outside loop

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  // ... uses same idToken
}

# After:
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const idToken = await user.getIdToken(true);  // Fresh token each time
  // ... uses fresh idToken
}
```

### Option B: Full Debug Version
Apply all fixes above for maximum diagnostic info.

---

## 📋 Backend Team Checklist

Please verify these on your end:

- [ ] Firebase Admin SDK initialized correctly
- [ ] Service account JSON has correct permissions
- [ ] Token validation doesn't have strict time windows
- [ ] Endpoint handles both iOS and Android tokens
- [ ] No rate limiting on `/api/auth/login/firebase`
- [ ] Proper error messages returned (not just 400)
- [ ] Logs show what's failing in token decode

---

## 📞 Next Steps

### If Fix 1 Works:
✅ Deploy to production  
✅ Test with real users  
✅ Monitor for any issues  

### If Fix 1 Doesn't Work:
1. Share the complete console logs
2. Share a sample token (from logs)
3. Backend team tests that exact token
4. Compare what frontend sends vs what backend receives

---

**Last Updated:** November 24, 2025  
**Status:** Ready to test fixes  
**Priority:** 🔴 HIGH - Production login broken
