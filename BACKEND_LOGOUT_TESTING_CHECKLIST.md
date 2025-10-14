# Backend Logout State - Testing Checklist

## Quick Verification Tests

### ✅ Test 1: Normal Logout Flow (Happy Path)

**Steps:**
1. Login to the app with any method (email, phone, Apple, Google)
2. Verify you're logged in (can see profile, authenticated features)
3. Click "Sign Out" button
4. Check logs for this sequence:

**Expected Logs:**
```
🔐 Starting comprehensive logout process...
✅ Session manager cleared
🔥 Signing out Firebase user: [user email/uid]
✅ Firebase logout successful
🔐 Starting complete logout process...
📤 Notifying backend of logout state...
✅ Backend notified of logout: { success: true }
✅ All auth storage cleared
✅ Auth storage service cleared
✅ New guest session initialized for logged-out state
✅ Complete logout process finished - backend notified, local state cleared
📱 Navigated to Rewards screen
✅ Complete logout process finished
```

**Expected Behavior:**
- ✅ Navigated to Rewards screen
- ✅ No user profile visible
- ✅ Can browse as guest
- ✅ "Sign In" button available

---

### ✅ Test 2: App Restart After Logout

**Steps:**
1. After Test 1 (logged out state)
2. **Force close** the app completely
3. **Reopen** the app
4. Check logs on app start

**Expected Logs:**
```
🔄 Initializing YoraaAPI service...
🔑 Retrieved token: NULL
ℹ️ No Firebase user found for backend authentication
🆕 Generated new guest session ID: guest_[timestamp]_[random]
```

**Expected Behavior:**
- ✅ App starts in guest mode
- ✅ No authentication required
- ✅ Can browse freely
- ✅ Can sign in when ready

---

### ✅ Test 3: Backend Notification Verification

**Steps:**
1. Login to the app
2. **Before logging out**, open your backend logs/monitoring
3. Click "Sign Out"
4. Check backend received the logout request

**Expected Backend Request:**
```
POST /api/auth/logout
Headers:
  Authorization: Bearer [valid_token]
  Content-Type: application/json

Body:
{
  "userId": "firebase_uid_string",
  "timestamp": "2024-10-12T10:30:00.000Z",
  "reason": "user_initiated_logout"
}
```

**Expected Backend Response:**
```
Status: 200 OK
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### ⚠️ Test 4: Logout with Network Error (Error Handling)

**Steps:**
1. Login to the app
2. **Enable Airplane Mode** or **disable WiFi/cellular**
3. Click "Sign Out"
4. Check logs

**Expected Logs:**
```
🔐 Starting comprehensive logout process...
✅ Session manager cleared
✅ Firebase logout successful
🔐 Starting complete logout process...
📤 Notifying backend of logout state...
⚠️ Backend logout notification failed: [network error message]
✅ All auth storage cleared
✅ Auth storage service cleared
✅ New guest session initialized for logged-out state
✅ Complete logout process finished - backend notified, local state cleared
```

**Expected Behavior:**
- ✅ Logout still completes successfully
- ✅ Local state cleared
- ✅ User sees "Signed Out" alert
- ✅ Navigated to Rewards screen
- ⚠️ Backend might not be aware (will sync on next app start with network)

**Recovery Test:**
1. Re-enable network
2. Restart app
3. Should initialize in guest mode normally

---

### 🔄 Test 5: State Synchronization (Mismatch Recovery)

**Simulate State Mismatch:**

This simulates a scenario where Firebase logout happened but backend wasn't notified.

**Steps:**
1. Login to the app
2. Use React Native Debugger or AsyncStorage inspector
3. Manually check AsyncStorage for:
   - `@auth_token` - should exist
   - `@user_data` - should exist
4. **Manually sign out from Firebase** (without using the app's logout button):
   ```javascript
   // In React Native Debugger console
   import auth from '@react-native-firebase/auth';
   await auth().signOut();
   ```
5. **Keep the backend token in AsyncStorage** (don't delete it)
6. **Restart the app**
7. Check logs

**Expected Logs:**
```
🔄 Initializing YoraaAPI service...
🔑 Retrieved token: EXISTS
🔄 Found Firebase user, attempting backend authentication...
ℹ️ No Firebase user found for backend authentication
⚠️ Backend token exists but no Firebase user - syncing state...
🔄 Syncing logout state with backend...
📤 Notifying backend of logout...
✅ Backend logout state synced
✅ Local auth state cleared
🆕 Generated new guest session ID
```

**Expected Behavior:**
- ✅ Detects state mismatch
- ✅ Automatically syncs with backend
- ✅ Clears local tokens
- ✅ Continues as guest

---

### 📊 Test 6: Multiple Rapid Logouts (Race Condition)

**Steps:**
1. Login to the app
2. Click "Sign Out"
3. **Quickly click "Stay"** to cancel
4. Immediately click "Sign Out" again
5. This time let it complete
6. Check logs for any race conditions or duplicate calls

**Expected Behavior:**
- ✅ No duplicate logout calls
- ✅ Clean state management
- ✅ No errors in logs

---

### 🔍 Test 7: Logout State Inspection

**Use React Native Debugger to inspect state:**

**Before Logout:**
```javascript
// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Should have token
const token = await AsyncStorage.getItem('@auth_token');
console.log('Token:', token); // Should be long JWT string

// Should have user data
const userData = await AsyncStorage.getItem('@user_data');
console.log('User:', JSON.parse(userData)); // Should have user object

// Check yoraaAPI state
console.log('API Token:', yoraaAPI.userToken); // Should be long string
console.log('Guest Session:', yoraaAPI.guestSessionId); // Should be null or old session
```

**After Logout:**
```javascript
// Should have no token
const token = await AsyncStorage.getItem('@auth_token');
console.log('Token:', token); // Should be null

// Should have no user data
const userData = await AsyncStorage.getItem('@user_data');
console.log('User:', userData); // Should be null

// Should have guest session
const guestSession = await AsyncStorage.getItem('guestSessionId');
console.log('Guest Session:', guestSession); // Should be guest_[timestamp]_[random]

// Check yoraaAPI state
console.log('API Token:', yoraaAPI.userToken); // Should be null
console.log('Guest Session:', yoraaAPI.guestSessionId); // Should be guest_xxx
```

---

## Backend Testing

### Backend Endpoint Requirements

Your backend should handle:

**1. Valid Logout Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer [valid_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "timestamp": "2024-10-12T10:30:00.000Z",
    "reason": "user_initiated_logout"
  }'

# Expected Response: 200 OK
# { "success": true, "message": "User logged out successfully" }
```

**2. Logout with Invalid/Expired Token:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "user_initiated_logout"
  }'

# Expected Response: 401 Unauthorized (but frontend continues anyway)
```

**3. State Sync Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer [valid_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "state_sync",
    "timestamp": "2024-10-12T10:30:00.000Z"
  }'

# Expected Response: 200 OK
```

---

## Common Issues & Solutions

### Issue: "Backend token exists but no Firebase user"

**What it means:** Local storage has a backend token but Firebase user is signed out.

**Expected behavior:** App automatically syncs state and clears token.

**Logs to look for:**
```
⚠️ Backend token exists but no Firebase user - syncing state...
🔄 Syncing logout state with backend...
✅ Backend logout state synced
```

**Action:** None needed - this is automatic recovery.

---

### Issue: Backend logout fails during sign out

**What it means:** Network error or backend unavailable during logout.

**Expected behavior:** Local logout completes, backend will be synced later.

**Logs to look for:**
```
⚠️ Backend logout notification failed: [error message]
✅ All auth storage cleared  ← Still completes!
```

**Action:** 
- Local logout succeeded ✅
- On next app start with network, state will sync
- User can continue using app as guest

---

### Issue: User sees old data after logout

**Potential causes:**
1. Redux/state management not cleared
2. Cached data in components
3. AsyncStorage not fully cleared

**Check:**
```javascript
// All should be null/empty after logout
await AsyncStorage.getItem('@auth_token'); // null
await AsyncStorage.getItem('@user_data'); // null
await AsyncStorage.getItem('userToken'); // null
await AsyncStorage.getItem('userData'); // null
```

---

## Success Criteria

### ✅ All Tests Should Show:

1. **Logout Flow:**
   - Backend notified BEFORE local state cleared
   - Local state fully cleared
   - Guest session initialized
   - Navigation to Rewards screen

2. **App Restart:**
   - No token found (expected)
   - Guest session generated
   - No Firebase user (expected)
   - App functions normally as guest

3. **Backend:**
   - Receives logout requests
   - Invalidates sessions
   - Returns success status
   - Logs event for auditing

4. **Error Handling:**
   - Local logout succeeds even if backend fails
   - State sync recovers from mismatches
   - No app crashes or blocking errors

---

## Monitoring in Production

### Key Metrics to Track:

1. **Logout Success Rate:**
   - Track how many logouts successfully notify backend
   - Alert if success rate drops below 95%

2. **State Sync Events:**
   - Count how often state sync is triggered
   - High frequency might indicate a systemic issue

3. **Failed Backend Notifications:**
   - Monitor and alert on failures
   - Could indicate backend availability issues

4. **User Experience:**
   - Time to logout completion
   - Navigation success rate
   - Post-logout app usage (guest mode)

---

## Quick Diagnostic Commands

### Check AsyncStorage State:
```javascript
// In React Native Debugger
import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = await AsyncStorage.getAllKeys();
const items = await AsyncStorage.multiGet(keys);
console.table(items);
```

### Check Firebase Auth State:
```javascript
import auth from '@react-native-firebase/auth';

const user = auth().currentUser;
console.log('Firebase User:', user);
console.log('Is Signed In:', !!user);
```

### Check yoraaAPI State:
```javascript
import yoraaAPI from './src/services/yoraaAPI';

console.log('User Token:', yoraaAPI.userToken);
console.log('Admin Token:', yoraaAPI.adminToken);
console.log('Guest Session:', yoraaAPI.guestSessionId);
```

---

## Summary

Your logout implementation now:
- ✅ **Notifies backend** with token before clearing
- ✅ **Sends context** (userId, timestamp, reason)
- ✅ **Handles errors** gracefully
- ✅ **Syncs state** automatically
- ✅ **Clears all data** completely
- ✅ **Initializes guest session** for post-logout browsing
- ✅ **Logs everything** for debugging

The logs you were seeing (`Retrieved token: NULL`, `No Firebase user found`, `Generated new guest session`) are **CORRECT** and **EXPECTED** after a successful logout! 🎉
