# Firebase Authentication Race Condition Fix

## Problem Description

Users were experiencing an error during OTP verification:

```
NativeFirebaseError: [auth/no-current-user] No user currently signed in.
```

This error occurred when trying to get a Firebase ID token immediately after OTP verification and sign-in.

## Root Cause

The issue was a **race condition** in the authentication flow:

1. User enters OTP → Firebase phone authentication succeeds
2. `onAuthStateChanged` listener in `authManager.js` is triggered
3. The code attempts to get an ID token to authenticate with the backend
4. **Problem**: In some cases, there's a timing issue where:
   - Firebase user hasn't fully initialized yet, OR
   - User gets signed out during the authentication process, OR
   - Multiple async operations try to access the user simultaneously

This resulted in `auth().currentUser` being `null` when `getIdToken()` was called, causing the "no-current-user" error.

## Solution Implemented

### 1. Added Initialization Delay in AuthManager (`authManager.js`)

```javascript
// Add small delay to ensure Firebase user is fully initialized
await new Promise(resolve => setTimeout(resolve, 100));

// Double-check user is still signed in after delay
const revalidatedUser = auth().currentUser;
if (!revalidatedUser) {
  console.warn('⚠️ Firebase user signed out immediately after sign in');
  return;
}
```

This ensures Firebase authentication state has fully propagated before proceeding.

### 2. Enhanced Error Handling in SessionManager (`sessionManager.js`)

```javascript
async ensureBackendAuthentication() {
  try {
    // ... existing checks ...
    
    try {
      const idToken = await currentUser.getIdToken(false);
      await yoraaAPI.firebaseLogin(idToken);
    } catch (tokenError) {
      // Handle the specific "no current user" error gracefully
      if (tokenError.code === 'auth/no-current-user' || 
          tokenError.message?.includes('no-current-user') ||
          tokenError.message?.includes('No user currently signed in')) {
        console.warn('⚠️ User signed out while getting ID token');
        throw new Error('User signed out during authentication');
      }
      throw tokenError;
    }
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3. Improved Backend Authentication in AuthManager

Added nested try-catch blocks to specifically handle token retrieval errors:

```javascript
try {
  const idToken = await currentUser.getIdToken(false);
  await yoraaAPI.firebaseLogin(idToken);
} catch (tokenError) {
  if (tokenError.code === 'auth/no-current-user' || 
      tokenError.message?.includes('No user currently signed in')) {
    console.warn('⚠️ User signed out while getting ID token');
    return;
  }
  throw tokenError;
}
```

### 4. Enhanced OTP Verification Screen (`loginaccountmobilenumberverificationcode.js`)

Added verification delay and user validation after OTP confirmation:

```javascript
// Verify OTP
const userCredential = await phoneAuthService.verifyOTP(code, confirmation);
const user = userCredential.user;

// Wait for Firebase auth state to fully propagate
await new Promise(resolve => setTimeout(resolve, 300));

// Verify user is still signed in
const currentUser = phoneAuthService.getCurrentUser();
if (!currentUser) {
  throw new Error('Authentication failed. Please try again.');
}

// Create session
await sessionManager.createSession({ ... }, 'phone');
```

Also added better error message handling:

```javascript
if (error.message?.includes('no-current-user') || 
    error.message?.includes('No user currently signed in')) {
  errorMessage = 'Authentication session expired. Please request a new OTP.';
}
```

## Benefits

1. **Race Condition Prevention**: Added delays ensure Firebase auth state is fully initialized
2. **Graceful Error Handling**: Specific handling for "no-current-user" errors prevents crashes
3. **Better User Experience**: Clear error messages guide users on what to do
4. **Multiple Validation Points**: User existence is checked at multiple stages
5. **Fail-Safe Mechanisms**: If user signs out during authentication, the process gracefully exits

## Testing Recommendations

Test the following scenarios:

1. ✅ Normal OTP verification flow
2. ✅ Quick sign-in/sign-out cycles
3. ✅ Network interruptions during OTP verification
4. ✅ Multiple OTP attempts
5. ✅ Background/foreground app transitions during OTP verification

## Files Modified

1. `/src/services/authManager.js` - Added initialization delay and enhanced error handling
2. `/src/services/sessionManager.js` - Improved token retrieval error handling
3. `/src/screens/loginaccountmobilenumberverificationcode.js` - Added verification delay and user validation

## Error Prevention Strategy

The fix implements a **defense-in-depth** approach:

- **Layer 1**: Delay after sign-in to ensure initialization
- **Layer 2**: Verify user exists before getting token
- **Layer 3**: Catch specific "no-current-user" errors
- **Layer 4**: Gracefully handle and log errors without crashing
- **Layer 5**: Provide helpful error messages to users

This multi-layered approach ensures the authentication flow is robust and handles edge cases gracefully.
