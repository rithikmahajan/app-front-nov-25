# 🔍 Authentication Debug Quick Reference

## Quick Log Search Commands

When viewing logs, search for these patterns to quickly identify issues:

### Find All Authentication Sessions
```
Search: "╔═══════════════════════════════════════════════════════════════╗"
```

### Find Successful Authentications
```
Search: "✅ AUTHENTICATED"
```

### Find Backend Authentication Failures
```
Search: "⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend"
```

### Find Token Storage Issues
```
Search: "Token Storage: ❌ MISSING"
```

### Find All Errors
```
Search: "❌ ERROR"
```

## Authentication Flow Summary

### Phone Login Flow
1. **Send OTP** → `PHONE LOGIN DEBUG SESSION`
2. **Verify OTP** → `PHONE OTP VERIFICATION DEBUG SESSION`
3. **Backend Auth** → `Authenticating with Yoraa backend`
4. **Token Storage** → `Verifying token storage`
5. **Navigate** → `Navigation completed`

### Apple Sign In Flow
1. **Request Credentials** → `APPLE AUTH SERVICE - SIGN IN FLOW`
2. **Firebase Sign In** → `Signing in to Firebase`
3. **Backend Auth** → `Authenticating with Yoraa backend`
4. **Token Storage** → `Verifying token storage`
5. **Navigate** → `Navigation completed`

### Google Sign In Flow
1. **Request Credentials** → `GOOGLE AUTH SERVICE - SIGN IN FLOW`
2. **Firebase Sign In** → `Signing in to Firebase`
3. **Backend Auth** → `Authenticating with Yoraa backend`
4. **Token Storage** → `Verifying token storage`
5. **Navigate** → `Navigation completed`

## Critical Success Indicators

Look for these in order:

✅ Step 1: Firebase Authentication
```
✅ Firebase Sign In successful
👤 User Details:
   - UID: [uid]
   - Email: [email]
```

✅ Step 2: Backend Authentication
```
✅ Backend authentication successful
📦 Backend Response: { token: "...", user: {...} }
```

✅ Step 3: Token Verification
```
🔍 Verifying token storage...
   - Token Storage: ✅ EXISTS
🔐 Final Authentication Status: ✅ AUTHENTICATED
```

✅ Step 4: Session/Navigation
```
✅ Session created for [method] login
✅ Navigation completed
```

## Common Failure Patterns

### Pattern 1: Firebase Auth Fails
```
❌ APPLE SIGN IN ERROR
❌ Error Code: auth/[code]
```
**Action:** Check Firebase configuration, API keys, and network

### Pattern 2: Backend Auth Fails
```
⚠️ BACKEND AUTHENTICATION FAILED
❌ Backend Error Message: [message]
```
**Action:** Check backend API, network connectivity, verify endpoint

### Pattern 3: Token Not Stored
```
❌ Backend token not set properly, reinitializing...
   - Token After Retry: ❌ STILL MISSING
```
**Action:** Check AsyncStorage, verify backend response has token

### Pattern 4: Session Creation Fails
```
❌ SESSION CREATION ERROR
```
**Action:** Check sessionManager implementation

## Quick Diagnostic Steps

### Issue: User says "Not Logged In" after login

1. Search logs for: `DEBUG SESSION STARTED`
2. Check if session shows: `✅ Firebase Sign In successful`
   - ❌ No → Firebase auth failed, check Firebase config
   - ✅ Yes → Continue to step 3

3. Check if session shows: `✅ Backend authentication successful`
   - ❌ No → Backend auth failed, check backend API
   - ✅ Yes → Continue to step 4

4. Check if session shows: `Token Storage: ✅ EXISTS`
   - ❌ No → Token storage failed, check AsyncStorage
   - ✅ Yes → Continue to step 5

5. Check if session shows: `✅ AUTHENTICATED`
   - ❌ No → Authentication state not set properly
   - ✅ Yes → Issue is elsewhere (not auth-related)

### Issue: Profile Not Updated

1. Search for: `Backend Response`
2. Check if response includes `user: {...}`
   - ❌ No → Backend didn't return user data
   - ✅ Yes → Continue to step 3

3. Search for: `Storing user data in auth storage`
   - ❌ Not found → User data wasn't stored
   - ✅ Found → Storage succeeded

4. Check app's user profile screen
   - If still empty → Profile fetch logic issue, not auth issue

## Log Symbols Guide

| Symbol | Meaning |
|--------|---------|
| 🔐 | Authentication operation |
| 📱 | Phone/Device related |
| 🍎 | Apple Sign In |
| 🔵 | Google Sign In |
| ✅ | Success |
| ❌ | Error/Failure |
| ⚠️ | Warning |
| 🔍 | Verification/Check |
| 📦 | Data/Object |
| 👤 | User information |
| ⏰ | Timestamp |
| 🔄 | Processing/In-progress |
| 📍 | Navigation |
| 🚀 | Action/Launch |

## Sample Working Log

```
╔═══════════════════════════════════════════════════════════════╗
║        🔐 APPLE LOGIN DEBUG SESSION STARTED                   ║
╚═══════════════════════════════════════════════════════════════╝

🔄 STEP 1: Requesting Apple credentials...
✅ Apple credentials received

🔄 STEP 2: Creating Firebase credential...
✅ Firebase credential created

🔄 STEP 3: Signing in to Firebase...
✅ Firebase Sign In successful
👤 User Details:
   - UID: abc123xyz
   - Email: user@example.com

🔄 STEP 4: Authenticating with Yoraa backend...
✅ Backend authentication successful

🔍 STEP 5: Verifying token storage...
   - Token Storage: ✅ EXISTS
🔐 Final Authentication Status: ✅ AUTHENTICATED

✅ Apple Sign In flow completed successfully
╚═══════════════════════════════════════════════════════════════╝
```

## Sample Failed Log

```
╔═══════════════════════════════════════════════════════════════╗
║        🔐 APPLE LOGIN DEBUG SESSION STARTED                   ║
╚═══════════════════════════════════════════════════════════════╝

🔄 STEP 1: Requesting Apple credentials...
✅ Apple credentials received

🔄 STEP 2: Creating Firebase credential...
✅ Firebase credential created

🔄 STEP 3: Signing in to Firebase...
✅ Firebase Sign In successful

🔄 STEP 4: Authenticating with Yoraa backend...

╔═══════════════════════════════════════════════════════════════╗
║              ⚠️  BACKEND AUTHENTICATION FAILED                ║
╚═══════════════════════════════════════════════════════════════╝
❌ Backend Error Message: Network request failed
⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend!

[This tells you: Firebase auth worked but backend auth failed due to network]
```

## Emergency Contact Info

If logs show consistent backend failures:
1. Verify backend is running and accessible
2. Check backend logs for errors
3. Test backend API endpoints manually
4. Verify Firebase project configuration matches backend

If logs show consistent Firebase failures:
1. Check Firebase Console for service status
2. Verify API keys in `GoogleService-Info.plist` (iOS) / `google-services.json` (Android)
3. Check Firebase Authentication is enabled for the methods used
4. Verify bundle ID / package name matches Firebase project

---

**Quick Reference Version:** 1.0.0  
**For detailed guide, see:** AUTHENTICATION_DEBUG_GUIDE.md
