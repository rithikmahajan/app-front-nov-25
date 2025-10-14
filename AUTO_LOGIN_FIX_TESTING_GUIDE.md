# Authentication Fix - Testing Guide

## 🧪 How to Verify the Fix

### **Quick Test (Recommended)**

1. **Kill and restart the app right now**
   ```bash
   # In terminal:
   # Stop the running app (Cmd+C in the terminal where Metro is running)
   # Or close the iOS simulator app
   
   # Clear app data (important!)
   npx react-native run-ios --reset-cache
   ```

2. **Expected Result:**
   - ✅ App should start with **login/signup screen**
   - ✅ No auto-login as "Rithik Mahajan"
   - ✅ No profile data shown
   - ✅ Clean logged-out state

3. **Login again:**
   - Click "Sign in with Apple"
   - Complete authentication
   - Profile should load correctly

4. **Test persistence:**
   - Close app completely
   - Reopen app
   - ✅ Should remain logged in (valid session)

5. **Test logout:**
   - Click logout
   - Close app completely
   - Reopen app
   - ✅ Should show login screen (no auto-login)

---

## 🔬 Detailed Testing Scenarios

### **Scenario 1: Fresh App Start (Never Logged In)**

**Steps:**
```bash
# Delete app from simulator
# Reinstall fresh
npx react-native run-ios
```

**Expected Logs:**
```javascript
🔄 Initializing Session Manager...
🔐 Stored authentication found: false
⚠️ No backend authentication token found in storage
✅ App starts in logged-out state
```

**Expected UI:**
- ✅ Login/Signup screen visible
- ✅ No profile information
- ✅ No cart data
- ✅ No wishlist data

---

### **Scenario 2: App Start After Logout**

**Steps:**
1. Login with any method
2. Navigate to Profile → Logout
3. Confirm logout
4. Kill app completely
5. Restart app

**Expected Logs:**
```javascript
🔐 Starting complete logout process...
✅ All auth storage cleared
✅ Session cleared
🔥 Firebase Auth state changed: User logged out
```

**On App Restart:**
```javascript
🔄 Initializing Session Manager...
🔐 Stored authentication found: false
⚠️ No backend authentication token found in storage
```

**Expected UI:**
- ✅ Login/Signup screen visible
- ✅ No auto-login
- ✅ Must login again

---

### **Scenario 3: Valid Session Restoration**

**Steps:**
1. Login with any method
2. Use app normally
3. Kill app (don't logout)
4. Restart app within token validity period

**Expected Logs:**
```javascript
🔄 Initializing Session Manager...
📱 Found existing session, validating...
✅ Session restored successfully
✅ Backend already authenticated on app start
```

**Expected UI:**
- ✅ App opens to home screen
- ✅ Profile shows correct user name
- ✅ Cart and wishlist data loads
- ✅ No login required

---

### **Scenario 4: Corrupted/Incomplete Session (THE FIX)**

**Steps:**
1. Login with any method
2. While app is running, manually corrupt session:
   ```javascript
   // In React Native Debugger console:
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // Corrupt session data
   await AsyncStorage.setItem('sessionData', '{"userId": null}');
   ```
3. Kill app
4. Restart app

**Expected Logs (BEFORE FIX):**
```javascript
❌ Incomplete session data
❌ Stored session invalid, clearing...
🔑 Retrieved token: EXISTS  ← ❌ Token still there!
✅ Backend authentication token loaded from storage
✅ Backend already authenticated  ← ❌ Auto-login!
```

**Expected Logs (AFTER FIX):**
```javascript
❌ Incomplete session data - clearing all auth data
🧹 Clearing ALL authentication data (session + tokens)...
✅ All auth data cleared - app will start in logged-out state
🔑 Retrieved token: NULL  ← ✅ Token properly cleared!
⚠️ No backend authentication token found in storage
```

**Expected UI:**
- ✅ Login/Signup screen visible
- ✅ No auto-login
- ✅ Clean logged-out state

---

## 📋 Comprehensive Test Checklist

### **Authentication Flow Tests**

- [ ] **Test 1:** Fresh install shows login screen
- [ ] **Test 2:** Apple Sign In creates valid session
- [ ] **Test 3:** Google Sign In creates valid session
- [ ] **Test 4:** Phone Sign In creates valid session
- [ ] **Test 5:** Valid session persists across app restarts
- [ ] **Test 6:** Logout clears all auth data
- [ ] **Test 7:** After logout, app shows login screen
- [ ] **Test 8:** Corrupted session auto-clears
- [ ] **Test 9:** No Firebase user = no auto-login
- [ ] **Test 10:** Invalid token = no auto-login

### **Session Persistence Tests**

- [ ] **Test 11:** Login → Close → Reopen = Still logged in
- [ ] **Test 12:** Login → Logout → Close → Reopen = Logged out
- [ ] **Test 13:** App crash during login = Clean state
- [ ] **Test 14:** Network failure during auth = No partial session

### **Security Tests**

- [ ] **Test 15:** Cannot access app with expired token
- [ ] **Test 16:** Cannot access app with deleted user
- [ ] **Test 17:** Backend token sync validates properly
- [ ] **Test 18:** No auth bypass with manual storage manipulation

---

## 🐛 Debugging Commands

### **Check Current Auth State:**
```javascript
// In React Native Debugger console:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check all auth keys
const keys = await AsyncStorage.getAllKeys();
console.log('All storage keys:', keys);

// Check specific values
const token = await AsyncStorage.getItem('userToken');
const session = await AsyncStorage.getItem('sessionData');
const isAuth = await AsyncStorage.getItem('isAuthenticated');

console.log('Token:', token ? 'EXISTS' : 'NULL');
console.log('Session:', session);
console.log('IsAuthenticated:', isAuth);
```

### **Manually Clear Auth (For Testing):**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.multiRemove([
  'userToken',
  'firebaseToken',
  'backendAuthToken',
  'sessionData',
  'isAuthenticated',
  'guestSessionId'
]);

console.log('✅ All auth data cleared');
```

### **Check Firebase User:**
```javascript
import { getAuth } from '@react-native-firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

console.log('Firebase User:', user ? user.uid : 'NULL');
```

---

## 🎯 What to Look For

### **Good Signs (Fix Working):**
- ✅ **Fresh app start:** Login screen visible
- ✅ **After logout:** Login screen on next app start
- ✅ **Valid session:** Auto-restore works correctly
- ✅ **Corrupted session:** Auto-clears, shows login screen
- ✅ **Consistent logs:** Token and session states match

### **Bad Signs (Need Investigation):**
- ❌ **Auto-login without explicit login**
- ❌ **Profile visible on fresh install**
- ❌ **Token exists but session is null**
- ❌ **Session exists but token is null**
- ❌ **Inconsistent auth state between Firebase and backend**

---

## 📊 Expected Log Patterns

### **Pattern 1: Clean Start (No Previous Login)**
```
🔄 Initializing Session Manager...
🔐 Stored authentication found: false
⚠️ No backend authentication token found in storage
🆕 Generated new guest session ID: guest_xxx
```

### **Pattern 2: Valid Session Restore**
```
🔄 Initializing Session Manager...
📱 Found existing session, validating...
✅ Session restored successfully
🔑 Retrieved token: EXISTS
✅ Backend authentication token loaded from storage
✅ Backend already authenticated on app start
```

### **Pattern 3: Invalid Session (Fixed!)**
```
🔄 Initializing Session Manager...
📱 Found existing session, validating...
❌ Incomplete session data - clearing all auth data
🧹 Clearing ALL authentication data (session + tokens)...
✅ All auth data cleared - app will start in logged-out state
🔑 Retrieved token: NULL
⚠️ No backend authentication token found in storage
```

### **Pattern 4: Logout Flow**
```
🔐 Starting complete logout process...
📤 Notifying backend of logout state...
✅ All auth storage cleared
🧹 Clearing auth data...
✅ Auth data cleared
🆕 Generated new guest session ID: guest_xxx
✅ Complete logout process finished
```

---

## 🚀 Quick Validation Script

Save this as `test-auth-state.js` and run it to check current state:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';

async function checkAuthState() {
  console.log('\n=== AUTHENTICATION STATE CHECK ===\n');
  
  // Check AsyncStorage
  const token = await AsyncStorage.getItem('userToken');
  const session = await AsyncStorage.getItem('sessionData');
  const isAuth = await AsyncStorage.getItem('isAuthenticated');
  
  console.log('📦 AsyncStorage:');
  console.log('  - userToken:', token ? 'EXISTS' : 'NULL');
  console.log('  - sessionData:', session ? JSON.parse(session) : 'NULL');
  console.log('  - isAuthenticated:', isAuth);
  
  // Check Firebase
  const auth = getAuth();
  const firebaseUser = auth.currentUser;
  
  console.log('\n🔥 Firebase:');
  console.log('  - User:', firebaseUser ? firebaseUser.uid : 'NULL');
  console.log('  - Email:', firebaseUser?.email || 'NULL');
  console.log('  - Display Name:', firebaseUser?.displayName || 'NULL');
  
  // Check consistency
  console.log('\n✅ Consistency Check:');
  const hasToken = !!token;
  const hasSession = !!session;
  const hasFirebaseUser = !!firebaseUser;
  const isAuthFlag = isAuth === 'true';
  
  if (hasToken && hasSession && hasFirebaseUser && isAuthFlag) {
    console.log('  ✅ VALID AUTHENTICATED STATE');
  } else if (!hasToken && !hasSession && !hasFirebaseUser && !isAuthFlag) {
    console.log('  ✅ VALID LOGGED-OUT STATE');
  } else {
    console.log('  ❌ INCONSISTENT STATE - NEEDS CLEARING');
    console.log('  - Token:', hasToken);
    console.log('  - Session:', hasSession);
    console.log('  - Firebase User:', hasFirebaseUser);
    console.log('  - isAuthenticated flag:', isAuthFlag);
  }
  
  console.log('\n================================\n');
}

export default checkAuthState;
```

---

## 🎉 Success Criteria

The fix is successful if:

1. ✅ **Fresh app install** → Login screen shown
2. ✅ **After logout** → Login screen shown on next start
3. ✅ **Valid session** → Auto-restore works
4. ✅ **Invalid session** → Auto-clears and shows login screen
5. ✅ **No unexpected auto-logins**
6. ✅ **Consistent auth state** across all components
7. ✅ **Production-ready** authentication flow

---

**Next Steps:**
1. Run the quick test above
2. Verify expected behavior
3. Test all scenarios in the checklist
4. Report any issues found
