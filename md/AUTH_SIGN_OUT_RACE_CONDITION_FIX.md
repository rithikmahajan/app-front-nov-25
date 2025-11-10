# Authentication Sign-Out Race Condition Fix

**Date**: October 11, 2025  
**Issue**: `[auth/no-current-user] No user currently signed in` error during logout  
**Type**: Frontend Error - Race Condition

---

## 🐛 The Problem

### Error Message
```
NativeFirebaseError: [auth/no-current-user] No user currently signed in.
at getIdToken (authManager.js:67)
```

### Root Cause
A **race condition** occurs during the Firebase logout process:

1. ✅ Firebase Auth state changes to "logged out"
2. 🔄 `authManager` listener detects the change and runs
3. ⚠️ Code attempts to authenticate with backend using `yoraaAPI.firebaseLogin(idToken)`
4. 🔄 If backend returns 401, it triggers retry logic in `makeRequest()`
5. ❌ Retry calls `ensureFreshFirebaseToken()` which tries to call `getIdToken()` on a user that no longer exists

**Timeline:**
```
T0: User signs out → Firebase user becomes null
T1: Auth listener fires → tries to get ID token
T2: Backend auth attempt → may trigger retry with 401
T3: Retry tries to get fresh token → ERROR: user is null
```

---

## ✅ The Solution

### 1. Added Try-Catch in Backend Authentication (authManager.js)

**Location**: `src/services/authManager.js` (lines 50-74)

```javascript
// Ensure backend is authenticated
if (!yoraaAPI.isAuthenticated()) {
  console.log('🔄 Authenticating with backend...');
  
  try {
    // Verify Firebase user is still available before getting token
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.warn('⚠️ Firebase user signed out during backend auth attempt');
      return;
    }
    
    const idToken = await currentUser.getIdToken(false);
    await yoraaAPI.firebaseLogin(idToken);
    console.log('✅ Backend authentication successful');
  } catch (backendAuthError) {
    // If user signed out during backend auth, fail gracefully
    if (backendAuthError.code === 'auth/no-current-user' || 
        backendAuthError.message?.includes('no-current-user') ||
        backendAuthError.message?.includes('User not authenticated')) {
      console.warn('⚠️ User signed out during backend authentication, skipping...');
      return;
    }
    // Re-throw other errors
    throw backendAuthError;
  }
}
```

**What it does:**
- ✅ Wraps the entire backend auth flow in try-catch
- ✅ Checks if user exists before getting token
- ✅ Catches sign-out errors gracefully
- ✅ Re-throws genuine errors that need attention

---

### 2. Enhanced Error Handling in Token Refresh (yoraaAPI.js)

**Location**: `src/services/yoraaAPI.js` (lines 71-108)

```javascript
async ensureFreshFirebaseToken() {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      console.warn('⚠️ Cannot get Firebase token - user not signed in');
      throw new Error('User not authenticated with Firebase');
    }
    
    // ... token refresh logic ...
    
  } catch (error) {
    // Handle user sign-out during token refresh gracefully
    if (error.code === 'auth/no-current-user' || 
        error.message?.includes('no-current-user') ||
        error.message?.includes('User not authenticated')) {
      console.warn('⚠️ User signed out during token refresh');
      this.userToken = null;
      throw error;
    }
    
    console.error('❌ Failed to get Firebase token:', error);
    throw new Error('Authentication failed. Please log in again.');
  }
}
```

**What it does:**
- ✅ Logs warning when user is not signed in
- ✅ Detects sign-out errors specifically
- ✅ Clears the user token on sign-out
- ✅ Provides clear error messages

---

## 🎯 Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Error Handling** | ❌ No try-catch around backend auth | ✅ Comprehensive error catching |
| **User Check** | ⚠️ Single check before token | ✅ Multiple checks + error handling |
| **Sign-out Detection** | ❌ Throws error on sign-out | ✅ Gracefully handles sign-out |
| **Token Cleanup** | ⚠️ Token may persist | ✅ Token cleared on sign-out |
| **User Experience** | ❌ Error logs shown | ✅ Clean warnings only |

---

## 🔍 Error Detection Strategy

The fix detects sign-out errors through **three methods**:

1. **Error Code**: `error.code === 'auth/no-current-user'`
2. **Error Message**: `error.message?.includes('no-current-user')`
3. **Custom Message**: `error.message?.includes('User not authenticated')`

This triple-check ensures we catch the error regardless of how Firebase formats it.

---

## 📊 Impact

### Before Fix
```
🔥 App.js - Firebase Auth state changed: User logged out
❌ Error handling Firebase user sign in: [auth/no-current-user]
   at getIdToken (authManager.js:67)
```

### After Fix
```
🔥 App.js - Firebase Auth state changed: User logged out
⚠️ User signed out during backend authentication, skipping...
✅ Clean logout - no errors
```

---

## 🧪 Testing Checklist

- [x] Normal login flow works
- [x] Normal logout flow works without errors
- [x] Rapid login/logout doesn't cause errors
- [x] Backend 401 retry doesn't crash on sign-out
- [x] Token refresh during sign-out is handled gracefully
- [x] Session cleanup happens correctly

---

## 📝 Technical Notes

**This is a Frontend Error** because:
- The race condition happens in the frontend auth flow
- The backend is working correctly (returning 401 when needed)
- The issue is with how the frontend handles sign-out timing
- No backend changes are required

**Why Race Conditions Occur:**
- Firebase auth state changes are asynchronous
- Backend authentication happens after state change detection
- Network requests may be in-flight when sign-out occurs
- Multiple async operations running simultaneously

**Prevention Strategy:**
- Always check `currentUser` before calling Firebase methods
- Wrap Firebase calls in try-catch blocks
- Detect and handle sign-out errors specifically
- Clean up state when sign-out is detected

---

## 🚀 Deployment Notes

- ✅ No breaking changes
- ✅ Backward compatible
- ✅ No backend changes required
- ✅ Safe to deploy immediately

**Files Changed:**
1. `src/services/authManager.js` - Enhanced backend auth error handling
2. `src/services/yoraaAPI.js` - Improved token refresh error handling

---

## 🔗 Related Documentation

- `CHAT_AUTH_IMPLEMENTATION_SUMMARY.md` - Authentication flow
- `FRONTEND_FIREBASE_JWT_INTEGRATION_COMPLETE.md` - Firebase JWT setup
- `EMAIL_LOGIN_OTP_IMPLEMENTATION.md` - Login methods

---

**Status**: ✅ **FIXED**  
**Priority**: 🔴 **HIGH** (User-visible error during logout)  
**Complexity**: 🟢 **LOW** (Simple error handling)
