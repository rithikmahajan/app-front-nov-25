# Social Sign-In Testing Guide
**Date:** November 24, 2024  
**Purpose:** Test if Apple and Google Sign-In have the same backend authentication error as Phone OTP

---

## 🎯 Quick Answer

**YES**, Apple Sign-In and Google Sign-In **could have the same issue** because:
1. ✅ They use the **same backend endpoint**: `/api/auth/login/firebase`
2. ✅ They send Firebase ID tokens the same way
3. ✅ If the backend is rejecting valid tokens, it affects ALL methods

**However**, they have **better error handling**:
- ✅ Retry logic (1 attempt)
- ✅ Token validation
- ✅ Rollback on failure (Apple has this, Google now has it too)

---

## ✅ Fixes Applied

### 1. Google Sign-In Rollback Added
**File:** `src/services/googleAuthService.js`  
**Change:** Added Firebase sign-out and token cleanup if backend auth fails after retry

**Before:**
```javascript
} catch (retryError) {
  throw new Error('Backend authentication failed...');
}
```

**After:**
```javascript
} catch (retryError) {
  // Rollback: Sign out from Firebase
  await auth().signOut();
  await yoraaAPI.clearAuthTokens();
  
  throw new Error('Backend authentication failed...');
}
```

**Impact:** Prevents inconsistent state where user is signed in to Firebase but not the backend.

---

## 🧪 Testing Instructions

### Test 1: Apple Sign-In (iOS only)
```
1. Open the app
2. Tap "Sign in with Apple"
3. Approve with Face ID / Touch ID
4. Observe the result:
   ✅ Success: User signed in → Backend working
   ❌ Error: "Authentication Error" → Same backend issue
```

**Expected Behavior if Backend Fails:**
- Error message appears
- User is signed OUT of Firebase (rollback)
- Can try again with fresh state

---

### Test 2: Google Sign-In (iOS & Android)
```
1. Open the app
2. Tap "Sign in with Google"
3. Select Google account
4. Observe the result:
   ✅ Success: User signed in → Backend working
   ❌ Error: "Authentication Error" → Same backend issue
```

**Expected Behavior if Backend Fails:**
- Error message appears
- User is signed OUT of Firebase (rollback) ← **NEW FIX**
- Can try again with fresh state

---

### Test 3: Phone OTP (Current Issue)
```
1. Open the app
2. Enter phone number: +1234567890
3. Enter OTP code (check SMS)
4. Observe the result:
   ✅ Success: User signed in → Backend working
   ❌ Error: "Authentication Error" → Backend issue confirmed
```

---

## 🔍 What to Look For

### Success Indicators ✅
- User lands on home screen
- Profile shows user data
- Backend API calls work (favorites, cart, etc.)
- No "not authenticated" errors

### Failure Indicators ❌
- "Authentication Error" alert appears
- User returns to login screen
- Console shows: "Backend authentication failed"
- Console shows: "Token not stored"

---

## 📊 Diagnostic Logging

### Enable Console Logs
All three auth methods have detailed logging:

**Phone OTP:**
```
🔐 PHONE AUTH SERVICE - OTP VERIFICATION
├─ STEP 1: Verifying OTP code with Firebase
├─ STEP 2: Getting Firebase ID token
├─ STEP 3: Validating token format
├─ STEP 4: Authenticating with backend (retry 1/3)
└─ ✅ Success / ❌ Failed
```

**Apple Sign-In:**
```
🍎 APPLE AUTH SERVICE - SIGN IN FLOW
├─ STEP 1: Requesting Apple credentials
├─ STEP 2: Creating Firebase credential
├─ STEP 3: Signing in to Firebase
├─ STEP 4: Firebase Profile Update Check
├─ STEP 5: Backend Authentication
├─ STEP 6: Verifying token storage
└─ ✅ Success / ❌ Failed → Retry → Rollback
```

**Google Sign-In:**
```
🔵 GOOGLE AUTH SERVICE - SIGN IN FLOW
├─ STEP 1: Checking Google Play Services (Android)
├─ STEP 2: Signing out from previous session
├─ STEP 3: Initiating Google Sign In
├─ STEP 4: Extracting ID token
├─ STEP 5: Creating Firebase credential
├─ STEP 6: Signing in to Firebase
├─ STEP 7: Authenticating with backend
├─ STEP 8: Verifying token storage
└─ ✅ Success / ❌ Failed → Retry → Rollback (NEW)
```

---

## 🐛 Expected Console Output if Backend Fails

### Apple Sign-In Failure
```
🍎 APPLE AUTH SERVICE - SIGN IN FLOW
⏰ Start Time: 2024-11-24T...
...
🔄 STEP 5: Backend Authentication & User Verification...
   - Calling backend firebaseLogin API...
❌ Backend Error Type: Error
❌ Backend Error Message: Request failed with status code 400
🔄 RETRY: Attempting backend authentication again...
   - Getting fresh Firebase ID token...
   - Retrying backend firebaseLogin API...
❌ RETRY FAILED: Request failed with status code 400
🔄 ROLLBACK: Signing out from Firebase due to backend auth failure...
✅ Firebase sign-out successful
```

### Google Sign-In Failure
```
🔵 GOOGLE AUTH SERVICE - SIGN IN FLOW
⏰ Start Time: 2024-11-24T...
...
🔄 STEP 7: Authenticating with Yoraa backend...
   - Calling backend firebaseLogin API...
❌ Backend Error Type: Error
❌ Backend Error Message: Request failed with status code 400
🔄 RETRY: Attempting backend authentication again...
   - Getting fresh Firebase ID token...
   - Retrying backend firebaseLogin API...
❌ RETRY FAILED: Request failed with status code 400
🔄 ROLLBACK: Signing out from Firebase due to backend auth failure...
✅ Firebase sign-out successful (rollback complete)
✅ Cleared partial auth tokens
```

### Phone OTP Failure
```
🔐 PHONE AUTH SERVICE - OTP VERIFICATION
⏰ Start Time: 2024-11-24T...
...
🔄 STEP 4: Backend Authentication (Attempt 1/3)...
❌ Backend auth failed: Request failed with status code 400
🔄 Retrying backend authentication (Attempt 2/3)...
❌ Backend auth failed: Request failed with status code 400
🔄 Retrying backend authentication (Attempt 3/3)...
❌ Backend auth failed: Request failed with status code 400
❌ All retry attempts exhausted
```

---

## 🔬 Backend Testing

### Test Backend Endpoint Directly

```bash
# Get a real Firebase token from the app console logs, then:
curl -X POST https://api.yoraa.in.net/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<PASTE_REAL_TOKEN_HERE>"}'
```

**Expected Responses:**

**Success:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "..."
  }
}
```

**Failure:**
```json
{
  "status": "error",
  "message": "Invalid token" // or other error
}
```

---

## 📈 Comparison Matrix

| Feature | Phone OTP | Apple Sign-In | Google Sign-In |
|---------|-----------|---------------|----------------|
| **Backend Endpoint** | ✅ Same | ✅ Same | ✅ Same |
| **Retry Attempts** | 3 times | 1 time | 1 time |
| **Token Refresh** | ✅ Each retry | ✅ On retry | ✅ On retry |
| **Token Validation** | ✅ JWT decode | ✅ Storage check | ✅ Storage check |
| **Rollback on Fail** | ❌ No | ✅ Yes | ✅ Yes (NEW) |
| **Error Message** | Generic | Detailed | Detailed |
| **Affected by Backend Issue** | ✅ YES | ✅ YES | ✅ YES |

---

## ✅ Conclusion

### Will Social Sign-In Fail Too?

**Short Answer:** Possibly, but they handle it better.

**Long Answer:**
1. **Same Backend Issue = Same Failure**
   - All methods call `/api/auth/login/firebase`
   - If backend rejects valid tokens, all methods fail

2. **Better Error Recovery**
   - Social sign-in has retry logic
   - Social sign-in has rollback (prevents inconsistent state)
   - Phone OTP only has retry (no rollback yet)

3. **User Impact**
   - **Phone OTP:** User stuck in error state, Firebase + Backend mismatched
   - **Apple/Google:** Clean rollback, user can try again fresh

### Recommended Testing Order
1. ✅ **Test Phone OTP** (known issue)
2. ✅ **Test Google Sign-In** (most likely to work - has Play Services)
3. ✅ **Test Apple Sign-In** (iOS only)

### If All Methods Fail
**Root Cause:** Backend `/api/auth/login/firebase` endpoint has an issue:
- Token validation too strict
- Network/timeout issues
- Database connection problems
- Server configuration error

**Fix:** Contact backend team to investigate endpoint health.

---

## 🛠️ Next Steps

### If Social Sign-In Works
✅ Problem is specific to Phone OTP token generation  
→ Investigate Phone Auth vs Social Auth token differences

### If Social Sign-In Also Fails  
✅ Problem is in backend endpoint  
→ Backend team needs to fix `/api/auth/login/firebase`

### Immediate Action
**Test all three methods in production and report results.**
