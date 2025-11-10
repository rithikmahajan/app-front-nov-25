# TestFlight Guest User Authentication Fix

## Problem Analysis

In TestFlight, users are seeing "Guest User" in the Profile screen even after successfully logging in. The authentication succeeds at the Firebase level, but the backend authentication and session management aren't properly synchronized.

### Root Causes Identified:

1. **Backend Authentication Not Syncing**: After Firebase login succeeds, the backend authentication (`yoraaAPI.firebaseLogin()`) might be failing silently
2. **Session Manager Not Creating Session**: The session manager might not be creating or maintaining the session properly
3. **Profile Screen Loading State**: The ProfileScreen loads user data before backend authentication completes
4. **Race Condition**: The auth state listener might be firing before the backend authentication completes

## The Authentication Flow

```
User Login Attempt
    ↓
Firebase Authentication (signInWithEmailAndPassword/OTP/Social)
    ↓
Session Manager Creates Session
    ↓
Backend Authentication (yoraaAPI.firebaseLogin with ID token)
    ↓
Store Backend JWT Token
    ↓
Update ProfileScreen with User Data
```

## Current Issues in TestFlight

When the app is opened:
- Firebase user exists (authenticated)
- Session data exists in AsyncStorage
- BUT: `yoraaAPI.userToken` is `null` (backend not authenticated)
- Result: ProfileScreen shows "Guest User"

## Solution Implementation

### 1. Enhanced Backend Authentication Sync in AuthManager

**File**: `src/services/authManager.js`

The `syncBackendAuth()` method needs to be more robust and handle retries better.

### 2. ProfileScreen Needs to Wait for Backend Auth

**File**: `src/screens/ProfileScreen.js`

The ProfileScreen should:
- Check if Firebase user exists
- If yes, ensure backend is authenticated before loading
- Show appropriate loading state during backend sync
- Only show "Guest User" if truly no authentication

### 3. Session Manager Should Validate Backend Token

**File**: `src/services/sessionManager.js`

Session validation should verify:
- Firebase user exists
- Backend token exists in yoraaAPI
- Token is valid and not expired

## Implementation Steps

### Step 1: Fix ProfileScreen to Properly Handle Auth State

The ProfileScreen needs to:
1. Check Firebase auth state
2. Ensure backend auth is synced
3. Only then load profile data
4. Show appropriate loading states

### Step 2: Add Backend Auth Verification on App Start

In `App.js`, after initializing services, verify backend authentication is properly synced.

### Step 3: Add Retry Logic for Backend Auth

The `authManager.syncBackendAuth()` should retry if it fails, with exponential backoff.

### Step 4: Add Debug Logging

Add comprehensive logging to track authentication state at each step.

## Testing Checklist

### In TestFlight:

- [ ] Fresh install - Guest user should be shown
- [ ] Login with email - Should show user name immediately
- [ ] Close app completely
- [ ] Reopen app - Should still show user name (not Guest User)
- [ ] Navigate to Profile - Should show correct user name
- [ ] Navigate to EditProfile - Should show correct user data
- [ ] Try to access chat - Should work without "Authentication needed" error
- [ ] Logout - Should return to Guest User state
- [ ] Login again - Should show user name

### Expected Behavior:

1. **Before Login**: "Guest User" displayed
2. **After Login**: User's actual name displayed
3. **After App Restart**: User's name still displayed (session persisted)
4. **No Auth Errors**: Chat and other authenticated features work

## Key Code Changes Needed

### 1. ProfileScreen - Enhanced loadUserName()

```javascript
const loadUserName = useCallback(async () => {
  try {
    setIsLoadingUserName(true);
    
    // Get current Firebase user
    const currentUser = auth().currentUser;
    
    if (currentUser) {
      console.log('👤 Firebase user found:', currentUser.email || currentUser.uid);
      
      // CRITICAL: Ensure backend is authenticated
      try {
        if (!yoraaAPI.isAuthenticated()) {
          console.log('⚠️ Backend not authenticated, syncing...');
          const syncSuccess = await authManager.syncBackendAuth();
          
          if (!syncSuccess) {
            console.warn('❌ Backend sync failed, will retry...');
            // Retry once more
            await new Promise(resolve => setTimeout(resolve, 1000));
            await authManager.syncBackendAuth();
          }
        }
      } catch (syncError) {
        console.error('❌ Backend sync error:', syncError);
        // Continue anyway - try to load profile
      }
      
      // Now try to get profile from backend
      try {
        const profile = await yoraaAPI.getUserProfile();
        // ... rest of profile loading logic
      } catch (profileError) {
        // Fallback to Firebase data
      }
    } else {
      console.log('❌ No Firebase user found');
      setUserName('Guest User');
    }
  } catch (error) {
    console.error('❌ Error in loadUserName:', error);
    setUserName('Guest User');
  } finally {
    setIsLoadingUserName(false);
  }
}, []);
```

### 2. AuthManager - Enhanced syncBackendAuth()

```javascript
async syncBackendAuth(retryCount = 0, maxRetries = 3) {
  const user = auth().currentUser;
  
  if (!user) {
    console.warn('⚠️ No Firebase user to sync');
    return false;
  }
  
  if (yoraaAPI.isAuthenticated()) {
    console.log('✅ Backend already authenticated');
    return true;
  }
  
  try {
    console.log(`🔄 Syncing backend auth (attempt ${retryCount + 1}/${maxRetries})...`);
    
    // Get fresh ID token
    const idToken = await user.getIdToken(true);
    
    // Authenticate with backend
    await yoraaAPI.firebaseLogin(idToken);
    
    console.log('✅ Backend auth synchronized successfully');
    
    // Verify session exists
    const sessionState = sessionManager.getSessionState();
    if (!sessionState.isAuthenticated) {
      const loginMethod = this.determineLoginMethod(user);
      await sessionManager.createSession({
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, loginMethod);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Backend sync failed (attempt ${retryCount + 1}):`, error.message);
    
    // Retry with exponential backoff
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.syncBackendAuth(retryCount + 1, maxRetries);
    }
    
    return false;
  }
}
```

### 3. Session Manager - Enhanced isSessionValid()

```javascript
async isSessionValid() {
  try {
    if (!this.currentSessionState.isAuthenticated) {
      return false;
    }
    
    // Check Firebase auth
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) {
      console.log('⚠️ Session exists but Firebase user is null');
      await this.clearSession();
      return false;
    }
    
    // Check backend auth
    if (!yoraaAPI.isAuthenticated()) {
      console.log('⚠️ Session exists but backend not authenticated');
      
      // Try to re-sync backend
      try {
        const idToken = await firebaseUser.getIdToken(true);
        await yoraaAPI.firebaseLogin(idToken);
        console.log('✅ Backend re-authenticated successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed to re-authenticate backend:', error);
        await this.clearSession();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Session validation error:', error);
    return false;
  }
}
```

## Next Steps

1. Implement the enhanced `syncBackendAuth()` in authManager.js
2. Update ProfileScreen's `loadUserName()` method
3. Update EditProfile's `loadUserProfile()` method
4. Add backend validation to sessionManager's `isSessionValid()`
5. Test thoroughly in TestFlight
6. Monitor logs for any authentication failures

## Success Criteria

✅ User sees their name immediately after login
✅ User sees their name after app restart
✅ No "Authentication needed" errors in chat
✅ No "Guest User" shown when authenticated
✅ Proper error handling if backend auth fails
✅ Clear logging for debugging

## Monitoring

After deployment, monitor for:
- "Backend sync failed" messages
- "Guest User" appearing for authenticated users
- "Authentication needed" errors
- Session validation failures
