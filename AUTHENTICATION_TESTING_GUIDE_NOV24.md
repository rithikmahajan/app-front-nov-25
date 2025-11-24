# Complete Authentication & Logout Test Plan
**Date:** November 24, 2024  
**Purpose:** Test all authentication methods + logout data cleanup fixes

---

## 🎯 Test Overview

We need to test **4 critical areas**:

1. ✅ **Apple Sign-In** - Does it work in production?
2. ✅ **Google Sign-In** - Does it work in production?
3. ✅ **Phone OTP Sign-In** - Does the "Authentication Error" still occur?
4. ✅ **Logout Data Cleanup** - Are addresses/orders cleared properly?

---

## 📱 Test 1: Phone Number + OTP Authentication

### Current Issue
- "Authentication Error" appearing after entering OTP
- Backend endpoint returning 400 error

### Test Steps

```
1. Open app
2. Navigate to login screen
3. Select "Sign in with Phone Number"
4. Enter phone: +1234567890 (or your test number)
5. Tap "Send OTP"
6. Check SMS for OTP code
7. Enter the 6-digit OTP
8. Observe result
```

### Expected Results

**✅ Success Case:**
```
- OTP verified
- User signed in to Firebase ✅
- Backend authentication succeeds ✅
- User token stored ✅
- Navigate to home screen ✅
- No errors shown
```

**❌ Failure Case (Current Bug):**
```
- OTP verified
- User signed in to Firebase ✅
- Backend authentication fails ❌
- Alert shown: "Authentication Error"
- Message: "We could not complete your login.
           Please try again or contact support..."
```

### Console Logs to Check

```javascript
// Look for these in console:
🔐 PHONE AUTH SERVICE - OTP VERIFICATION
├─ STEP 1: Verifying OTP code with Firebase ✅
├─ STEP 2: Getting Firebase ID token ✅
├─ STEP 3: Validating token format ✅
├─ STEP 4: Backend Authentication (Attempt 1/3)
│  ├─ Token preview: eyJhbGciOi...
│  ├─ Token length: 1234 chars
│  ├─ Token expiry: 2024-11-24T08:09:00.000Z
│  └─ POST /api/auth/login/firebase
│
└─ Result: ❌ Backend auth failed: Request failed with status code 400
           OR
   Result: ✅ Backend authentication successful
```

---

## 🍎 Test 2: Apple Sign-In

### Current Status
- Has retry + rollback mechanism ✅
- Better error handling than Phone OTP
- Should work if backend is healthy

### Test Steps (iOS Only)

```
1. Open app
2. Navigate to login screen
3. Tap "Sign in with Apple"
4. Apple ID modal appears
5. Authenticate with Face ID / Touch ID
6. Approve the sign-in
7. Observe result
```

### Expected Results

**✅ Success Case:**
```
- Apple authentication succeeds
- Firebase sign-in succeeds
- Backend authentication succeeds
- User signed in
- Navigate to home screen
- No errors
```

**❌ Failure Case (Backend Down):**
```
- Apple authentication succeeds ✅
- Firebase sign-in succeeds ✅
- Backend authentication fails ❌
- Retry attempted (1 time)
- Retry fails ❌
- Rollback: Firebase sign-out ✅
- Error shown: "Sign-in failed. Please try again or contact support."
- User returned to login screen (clean state)
```

### Console Logs to Check

```javascript
🍎 APPLE AUTH SERVICE - SIGN IN FLOW
├─ STEP 1: Requesting Apple credentials ✅
├─ STEP 2: Creating Firebase credential ✅
├─ STEP 3: Signing in to Firebase ✅
├─ STEP 4: Firebase Profile Update Check
├─ STEP 5: Backend Authentication & User Verification
│  ├─ Getting Firebase ID token...
│  ├─ Calling backend firebaseLogin API...
│  └─ Result: ✅ Success OR ❌ Failed
│
├─ STEP 6: Verifying token storage
│  └─ Token Storage: ✅ EXISTS OR ❌ MISSING
│
└─ STEP 7: FCM setup completed

// If backend fails:
🔄 RETRY: Attempting backend authentication again...
   - Getting fresh Firebase ID token...
   - Retrying backend firebaseLogin API...
   
   Result: ❌ RETRY FAILED
   
🔄 ROLLBACK: Signing out from Firebase...
✅ Firebase sign-out successful
```

---

## 🔵 Test 3: Google Sign-In

### Current Status
- Has retry + rollback mechanism ✅ (just added)
- Better error handling
- Works on both iOS and Android

### Test Steps

```
1. Open app
2. Navigate to login screen
3. Tap "Sign in with Google"
4. Google account picker appears
5. Select your Google account
6. Approve the permissions
7. Observe result
```

### Expected Results

**✅ Success Case:**
```
- Google authentication succeeds
- Firebase sign-in succeeds
- Backend authentication succeeds
- User signed in
- Navigate to home screen
- No errors
```

**❌ Failure Case (Backend Down):**
```
- Google authentication succeeds ✅
- Firebase sign-in succeeds ✅
- Backend authentication fails ❌
- Retry attempted (1 time)
- Retry fails ❌
- Rollback: Firebase sign-out ✅ (NEW FIX)
- Rollback: Clear auth tokens ✅ (NEW FIX)
- Error shown: "Backend authentication failed after retry..."
- User returned to login screen (clean state)
```

### Console Logs to Check

```javascript
🔵 GOOGLE AUTH SERVICE - SIGN IN FLOW
├─ STEP 1: Checking Google Play Services (Android only)
├─ STEP 2: Signing out from previous session
├─ STEP 3: Initiating Google Sign In
├─ STEP 4: Extracting ID token
├─ STEP 5: Creating Firebase credential
├─ STEP 6: Signing in to Firebase
├─ STEP 7: Authenticating with Yoraa backend
│  ├─ Getting Firebase ID token...
│  ├─ Calling backend firebaseLogin API...
│  └─ Result: ✅ Success OR ❌ Failed
│
├─ STEP 8: Verifying token storage
│  └─ Token Storage: ✅ EXISTS OR ❌ MISSING
│
└─ STEP 9: FCM setup completed

// If backend fails:
🔄 RETRY: Attempting backend authentication again...
   - Getting fresh Firebase ID token...
   - Retrying backend firebaseLogin API...
   
   Result: ❌ RETRY FAILED
   
🔄 ROLLBACK: Signing out from Firebase... (NEW)
✅ Firebase sign-out successful (rollback complete)
✅ Cleared partial auth tokens
```

---

## 🧹 Test 4: Logout Data Cleanup (CRITICAL)

### What We Fixed
- Added address clearing to logout
- Added order history clearing
- Added browsing history clearing
- Total: 30+ keys now cleared

### Test Scenario: Device Switching

```
═══════════════════════════════════════════════════════════════
TEST: Verify addresses don't persist across user sessions
═══════════════════════════════════════════════════════════════

STEP 1: Login as User A
  1. Sign in with Phone/Google/Apple (any method)
  2. Navigate to "My Addresses" or address screen
  3. Add a new address:
     - Name: "Test User A"
     - Street: "123 Test Street A"
     - City: "Test City A"
     - Zip: "11111"
  4. Save the address
  5. Verify address appears in list
  
  Expected: ✅ Address saved and visible

STEP 2: Logout User A
  1. Go to profile/settings
  2. Tap "Logout"
  3. Confirm logout
  4. Wait for logout to complete
  
  Expected: ✅ Returned to login screen

STEP 3: Check Storage (Optional - Dev Mode)
  // Run this in console/debugger
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  const check = async () => {
    const addresses = await AsyncStorage.getItem('userAddresses');
    console.log('Addresses after logout:', addresses);
    // Should be: null
  };
  
  Expected: ✅ userAddresses = null

STEP 4: Login as Different User (User B)
  1. Sign in with different account
     - Different email/phone/Apple ID/Google account
  2. Navigate to "My Addresses"
  3. Check what addresses are shown
  
  Expected Results:
  ✅ PASS: No addresses shown (empty list)
       OR only User B's own addresses (if they had any)
  
  ❌ FAIL: Shows "123 Test Street A, Test City A"
       (User A's address visible to User B)
       🚨 PRIVACY VIOLATION!

STEP 5: Verification
  If User B sees User A's address:
  - ❌ BUG STILL EXISTS (logout not clearing addresses)
  - 🚨 Critical privacy issue
  - Need to debug logout implementation
  
  If User B sees no addresses from User A:
  - ✅ FIX SUCCESSFUL
  - ✅ Privacy maintained
  - ✅ Logout working correctly
```

---

## 🧪 Automated Test (Optional)

### Run Test Script

```javascript
// In your React Native app, add this to a test screen or run in console

import { runAllLogoutTests } from './src/tests/logoutDataPersistenceTest';

// Run all tests
async function runTests() {
  console.log('Starting logout tests...\n');
  
  const results = await runAllLogoutTests();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Address Persistence:', results.test1.success ? '✅ PASS' : '❌ FAIL');
  console.log('Device Switching:', results.test2.success ? '✅ PASS' : '❌ FAIL');
  console.log('Complete Audit:', results.test3.success ? '✅ PASS' : '❌ FAIL');
  console.log('Overall:', results.overallSuccess ? '✅ ALL PASS' : '❌ SOME FAILED');
}

runTests();
```

---

## 📊 Test Results Template

### Fill this out as you test:

```
═══════════════════════════════════════════════════════════════
                    TEST EXECUTION RESULTS
═══════════════════════════════════════════════════════════════

Date: ________________
Tester: ________________
Device: ________________ (iOS/Android)
App Version: ________________

───────────────────────────────────────────────────────────────
TEST 1: Phone Number + OTP Sign-In
───────────────────────────────────────────────────────────────
Status: [ ] PASS  [ ] FAIL  [ ] SKIP

Phone Number Tested: ____________________
OTP Received: [ ] Yes  [ ] No
OTP Verified: [ ] Yes  [ ] No
Backend Auth Success: [ ] Yes  [ ] No
Error Shown: [ ] Yes  [ ] No

Error Details (if any):
_____________________________________________________________
_____________________________________________________________

Console Logs:
_____________________________________________________________
_____________________________________________________________

───────────────────────────────────────────────────────────────
TEST 2: Apple Sign-In
───────────────────────────────────────────────────────────────
Status: [ ] PASS  [ ] FAIL  [ ] SKIP

Apple ID Used: ____________________
Face ID/Touch ID: [ ] Success  [ ] Failed
Firebase Sign-In: [ ] Success  [ ] Failed
Backend Auth: [ ] Success  [ ] Failed
Error Shown: [ ] Yes  [ ] No

Error Details (if any):
_____________________________________________________________
_____________________________________________________________

Console Logs:
_____________________________________________________________
_____________________________________________________________

───────────────────────────────────────────────────────────────
TEST 3: Google Sign-In
───────────────────────────────────────────────────────────────
Status: [ ] PASS  [ ] FAIL  [ ] SKIP

Google Account Used: ____________________
Account Selection: [ ] Success  [ ] Failed
Firebase Sign-In: [ ] Success  [ ] Failed
Backend Auth: [ ] Success  [ ] Failed
Rollback Occurred: [ ] Yes  [ ] No  [ ] N/A

Error Details (if any):
_____________________________________________________________
_____________________________________________________________

Console Logs:
_____________________________________________________________
_____________________________________________________________

───────────────────────────────────────────────────────────────
TEST 4: Logout Data Cleanup (Device Switching)
───────────────────────────────────────────────────────────────
Status: [ ] PASS  [ ] FAIL  [ ] SKIP

User A Login Method: [ ] Phone  [ ] Apple  [ ] Google
User A Address Added: [ ] Yes  [ ] No
Address Details: _________________________________________

User A Logout: [ ] Success  [ ] Failed

User B Login Method: [ ] Phone  [ ] Apple  [ ] Google
User B Different Account: [ ] Yes  [ ] No

User B Sees User A's Address: [ ] Yes (FAIL)  [ ] No (PASS)

Storage Check (AsyncStorage):
userAddresses after logout: [ ] null (PASS)  [ ] has data (FAIL)

Privacy Violation: [ ] Yes (CRITICAL)  [ ] No (GOOD)

Notes:
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════════════
                        SUMMARY
═══════════════════════════════════════════════════════════════

Total Tests Run: ______ / 4
Tests Passed: ______
Tests Failed: ______
Tests Skipped: ______

Critical Issues Found:
[ ] Phone OTP backend authentication failing
[ ] Apple Sign-In backend authentication failing
[ ] Google Sign-In backend authentication failing
[ ] Address data persisting after logout (privacy issue)
[ ] Order data persisting after logout
[ ] Other: _____________________________________________

Overall Assessment:
[ ] All authentication methods working
[ ] Some authentication methods failing
[ ] Logout cleanup working correctly
[ ] Logout cleanup has privacy issues

Recommended Actions:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

Tester Signature: ____________________
Date: ____________________
```

---

## 🔍 Debugging Tips

### If Phone OTP Fails

1. **Check Console for:**
   ```
   ❌ Backend auth failed: Request failed with status code 400
   ```

2. **Check Token:**
   ```javascript
   // Token should be valid JWT
   // Check token preview in logs
   // Check token expiry time
   ```

3. **Test Backend Directly:**
   ```bash
   # Copy the token from console logs
   curl -X POST https://api.yoraa.in.net/api/auth/login/firebase \
     -H "Content-Type: application/json" \
     -d '{"idToken":"<PASTE_REAL_TOKEN>"}'
   ```

---

### If Social Sign-In Fails

1. **Check if Firebase authentication succeeds first**
2. **Check if backend authentication fails**
3. **Verify rollback occurs** (user should be signed out)
4. **Check if it's the same backend issue as Phone OTP**

---

### If Logout Cleanup Fails

1. **Check AsyncStorage:**
   ```javascript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   const debugStorage = async () => {
     const keys = await AsyncStorage.getAllKeys();
     console.log('All keys:', keys);
     
     const addresses = await AsyncStorage.getItem('userAddresses');
     console.log('userAddresses:', addresses);
   };
   ```

2. **Verify logout method was called:**
   ```javascript
   // Look for logs:
   🔐 Starting logout process...
   ✅ Local storage cleared (30 keys removed)
   ✅ Auth storage service cleared
   ```

3. **Check if old code is still deployed:**
   - Make sure you're testing the version with the fixes
   - Rebuild the app if needed

---

## 🚀 Quick Start Testing

### Fastest Way to Test Everything:

```
1. Phone OTP Test (2 minutes)
   - Sign in with phone
   - Check if works or shows error
   - Note the result

2. Logout & Privacy Test (5 minutes)
   - While still signed in from #1
   - Add a test address "123 Test St"
   - Logout
   - Sign in with DIFFERENT account (Google/Apple)
   - Check if "123 Test St" is visible
   - If YES = Bug exists
   - If NO = Fix working

3. Social Sign-In Test (3 minutes each)
   - Sign out
   - Try Apple Sign-In
   - Try Google Sign-In
   - Check if both work

Total time: ~15 minutes
```

---

## ✅ Success Criteria

**All tests pass when:**

1. ✅ Phone OTP authentication works (no "Authentication Error")
2. ✅ Apple Sign-In works (or gracefully fails with rollback)
3. ✅ Google Sign-In works (or gracefully fails with rollback)
4. ✅ Logout clears all user data (addresses, orders, etc.)
5. ✅ New user login shows NO data from previous user
6. ✅ No privacy violations detected

---

## 📞 Report Issues

**If you find bugs, report:**

1. Which test failed
2. Error message shown to user
3. Console logs
4. Device type (iOS/Android)
5. Steps to reproduce

---

**Good luck with testing! 🚀**
