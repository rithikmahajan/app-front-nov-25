# 🧪 Apple Login TestFlight - Testing & Verification Guide

## Pre-Test Setup

### 1. Build Fresh TestFlight Version
```bash
# Clean build
cd ios
rm -rf build Pods
pod install

# Build in Xcode
# Product -> Archive
# Distribute to App Store Connect
```

### 2. Install from TestFlight
- Wait for build to process (~15 minutes)
- Install on physical iPhone
- **IMPORTANT**: Delete old version first to start fresh

## Test Suite

### ✅ Test 1: Fresh Apple Login
**Objective**: Verify new user can log in with Apple

**Steps**:
1. Open app (freshly installed)
2. Tap "Sign In" or go to Profile
3. Tap "Continue with Apple"
4. Complete Apple authentication
5. Accept terms and conditions (if new user)

**Expected Results**:
- ✅ No errors during login
- ✅ Redirected to appropriate screen (Home or T&C)
- ✅ Profile shows user information
- ✅ Rewards screen shows authenticated state
- ✅ Can add items to favorites

**Console Logs to Verify** (check Xcode -> Devices -> View Device Logs):
```
🍎 Starting Apple Sign In...
✅ Apple Sign In successful, isNewUser: false
🔑 Getting Firebase ID token for backend authentication...
✅ Successfully authenticated with Yoraa backend
🔍 Backend token verification: TOKEN EXISTS
🔐 Final authentication status: AUTHENTICATED
✅ Session created for Apple login
🎯 Final auth status before navigation: AUTHENTICATED ✅
```

**Pass/Fail**: ⬜

---

### ✅ Test 2: Returning User Login
**Objective**: Verify existing Apple ID user can log in

**Steps**:
1. Use Apple ID that has logged in before
2. Follow Test 1 steps
3. Should skip T&C and go directly to Home

**Expected Results**:
- ✅ Recognized as returning user (isNewUser: false)
- ✅ Skip terms and conditions
- ✅ Go directly to Home screen
- ✅ Previous favorites/data restored

**Pass/Fail**: ⬜

---

### ✅ Test 3: App Backgrounding
**Objective**: Verify authentication persists when app goes to background

**Steps**:
1. Log in with Apple (complete Test 1)
2. Navigate to Profile or Rewards
3. Press Home button (background app)
4. Wait 10 seconds
5. Tap app icon to resume

**Expected Results**:
- ✅ User still logged in
- ✅ No "not authenticated" message
- ✅ Can access all features immediately
- ✅ No need to log in again

**Console Logs to Verify**:
```
📱 App became active, refreshing authentication...
🔐 Auth status after reinitialization: AUTHENTICATED ✅
```

**Pass/Fail**: ⬜

---

### ✅ Test 4: App Force Quit & Restart
**Objective**: Verify authentication persists after app restart

**Steps**:
1. Log in with Apple (complete Test 1)
2. Force quit app (swipe up from app switcher)
3. Wait 5 seconds
4. Reopen app

**Expected Results**:
- ✅ User automatically logged in
- ✅ No login screen shown
- ✅ Direct access to Home screen
- ✅ All user data intact

**Console Logs to Verify**:
```
🔄 Initializing authentication services...
🔐 Stored authentication found: true
✅ Restoring user session: [user email]
✅ Backend token synced
```

**Pass/Fail**: ⬜

---

### ✅ Test 5: Protected Features Access
**Objective**: Verify all protected features work with Apple login

**Steps**:
1. Log in with Apple
2. Try each protected feature:
   - Add item to favorites
   - View saved addresses
   - Access rewards program
   - View order history
   - Start checkout process

**Expected Results**:
- ✅ All features accessible
- ✅ No "please log in" messages
- ✅ API calls succeed
- ✅ Data saves correctly

**Pass/Fail**: ⬜

---

### ✅ Test 6: Checkout Flow
**Objective**: Verify Apple login works in checkout flow

**Steps**:
1. Start as guest (not logged in)
2. Add items to bag
3. Tap "Checkout"
4. When prompted, tap "Sign in with Apple"
5. Complete Apple authentication
6. Accept T&C
7. Continue to delivery options

**Expected Results**:
- ✅ Redirected to T&C after login
- ✅ After T&C, redirected to delivery options
- ✅ Can complete checkout
- ✅ Order processes successfully

**Pass/Fail**: ⬜

---

### ✅ Test 7: Multiple Sessions
**Objective**: Verify authentication after network interruption

**Steps**:
1. Log in with Apple
2. Enable Airplane Mode
3. Try to access a feature (should fail gracefully)
4. Disable Airplane Mode
5. Try again

**Expected Results**:
- ✅ Graceful error handling with network off
- ✅ Automatic recovery when network restored
- ✅ Still authenticated
- ✅ No need to log in again

**Pass/Fail**: ⬜

---

### ✅ Test 8: Logout & Re-login
**Objective**: Verify logout and re-login works properly

**Steps**:
1. Log in with Apple
2. Go to Profile
3. Tap "Logout" or "Sign Out"
4. Confirm logout
5. Log in with Apple again

**Expected Results**:
- ✅ Clean logout (all tokens cleared)
- ✅ Guest state after logout
- ✅ Can log back in successfully
- ✅ User data restored after re-login

**Pass/Fail**: ⬜

---

## Critical Checkpoints

### Must Pass ✅
- [ ] Fresh Apple login succeeds
- [ ] Console shows "AUTHENTICATED ✅" after login
- [ ] Authentication persists after backgrounding
- [ ] Authentication persists after app restart
- [ ] Protected features accessible
- [ ] Checkout flow works

### Nice to Have ✅
- [ ] Fast login (<3 seconds)
- [ ] Smooth navigation after login
- [ ] Clear error messages if issues occur
- [ ] Offline handling graceful

## Debugging Failed Tests

### If Login Succeeds but Shows "Not Authenticated"

**Check**:
1. Xcode Console logs - look for "Backend token verification: TOKEN MISSING"
2. Backend server status: `curl http://185.193.19.244:8001/health`
3. Check if token stored: Look for "💾 Storing auth data..." log

**Fix**:
- If backend down: Start backend server
- If token not stored: Check backend JWT validation
- If token stored but not loaded: Verify `yoraaAPI.initialize()` called

### If Authentication Lost After Backgrounding

**Check**:
1. AppState listener working: Look for "📱 App became active" log
2. Token reinitialization: Look for "Auth status after reinitialization" log

**Fix**:
- Verify App.js AppState listener is active
- Check AsyncStorage permissions

### If Backend Auth Fails

**Check**:
1. Backend server running and accessible
2. Firebase service account credentials valid
3. CORS headers configured
4. JWT validation logic correct

**Logs to Look For**:
```
❌ Backend authentication failed: [specific error]
```

## Reporting Issues

If tests fail, collect:

1. **Console Logs**: Copy all logs from Xcode Console
2. **Network Logs**: Check Charles/Proxyman for API calls
3. **Steps to Reproduce**: Exact sequence that caused failure
4. **Device Info**: iOS version, device model
5. **TestFlight Build**: Build number and version

## Success Criteria

**All 8 tests must pass** for the fix to be considered successful.

**Test Results Summary**:
- Test 1 (Fresh Login): ⬜
- Test 2 (Returning User): ⬜
- Test 3 (Backgrounding): ⬜
- Test 4 (Restart): ⬜
- Test 5 (Protected Features): ⬜
- Test 6 (Checkout Flow): ⬜
- Test 7 (Network Interruption): ⬜
- Test 8 (Logout/Re-login): ⬜

**Overall Status**: ⬜ PASS / ⬜ FAIL

---

## Quick Verification Commands

### Check Backend Health
```bash
curl http://185.193.19.244:8001/health
```

### Check Device Logs (Real-time)
```bash
# Connect iPhone to Mac
# Open Xcode -> Window -> Devices and Simulators
# Select device -> Open Console
# Filter for "YoraaApp"
```

### Check AsyncStorage (Simulator Only)
```bash
./debug-apple-auth.sh
```

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: Ready for Testing
