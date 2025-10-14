# 🍎 Apple Sign-In Data - Quick Reference

## All Available Information at Sign-In Time

### Response Object Properties

| Property | Type | Description | Always Available? |
|----------|------|-------------|-------------------|
| `user` | string | Apple's unique user identifier | ✅ Yes |
| `email` | string/null | User's email address | ⚠️ First sign-in only* |
| `fullName` | object/null | User's name components | ⚠️ First sign-in only* |
| `identityToken` | string | JWT token for authentication | ✅ Yes |
| `authorizationCode` | string | Authorization code | ✅ Yes |
| `nonce` | string/null | Cryptographic nonce | ✅ Yes (if provided) |
| `state` | string/null | State parameter | ✅ Yes (if provided) |
| `realUserStatus` | number | User verification status (0-2) | ✅ Yes |

### Full Name Object Properties

| Property | Type | Example |
|----------|------|---------|
| `givenName` | string/null | "John" |
| `familyName` | string/null | "Smith" |
| `middleName` | string/null | "Michael" |
| `namePrefix` | string/null | "Dr." |
| `nameSuffix` | string/null | "Jr." |
| `nickname` | string/null | "Johnny" |

### Identity Token (JWT) Decoded Properties

| Property | Type | Description |
|----------|------|-------------|
| `iss` | string | Issuer (always `https://appleid.apple.com`) |
| `sub` | string | Subject - Apple user ID (same as `user` field) |
| `aud` | string | Audience - Your app's bundle ID |
| `iat` | number | Issued at timestamp (Unix epoch) |
| `exp` | number | Expiration timestamp (Unix epoch) |
| `email` | string | User's email address ✅ Always present |
| `email_verified` | boolean | Whether email is verified |
| `is_private_email` | boolean | Whether using Apple's relay email |
| `nonce_supported` | boolean | Whether nonce is supported |

## Key Insights

### 1. Email Retrieval Strategy
```
First Sign-In:
  appleAuthRequestResponse.email ✅ Available
  
Subsequent Sign-Ins:
  appleAuthRequestResponse.email ❌ null
  BUT: JWT token email ✅ Always available
  
✨ SOLUTION: Always decode JWT to get email!
```

### 2. Real User Status Values
```javascript
0 = Unsupported (device limitation)
1 = Unknown (can't determine)
2 = Likely Real (high confidence) ✅ Recommended for production
```

### 3. Privacy Relay Detection
```javascript
// Check in decoded JWT:
if (payload.is_private_email === true) {
  // User is using: xxx@privaterelay.appleid.com
  // Store this email, it's permanent for your app
}
```

### 4. Name Data Handling
```javascript
// First sign-in: Save to your database
if (appleAuthRequestResponse.fullName) {
  const { givenName, familyName } = appleAuthRequestResponse.fullName;
  saveToDatabase({ givenName, familyName });
}

// Subsequent sign-ins: Load from your database
// (Apple won't provide this data again)
```

## What You Get Now

### Before This Update ❌
```
appleAuthService.js:41    - User: 000315...
appleAuthService.js:42    - Email: N/A (may be hidden)
appleAuthService.js:43    - Full Name: {"namePrefix":null,...}
appleAuthService.js:44    - Identity Token: EXISTS
appleAuthService.js:45    - Authorization Code: EXISTS
```

### After This Update ✅
```
✅ Complete raw JSON object
✅ All 8 response properties logged individually
✅ All 6 fullName properties (if available)
✅ Identity token length + preview
✅ Authorization code length + preview
✅ Decoded JWT with 9+ claims
✅ All timestamps in ISO format
✅ List of all available keys
```

## Most Important Fields for Your Backend

### For User Identification
```javascript
const userId = appleAuthRequestResponse.user;
// Example: "000315.04ccbefff13446b2bcddb1abb2323a69.2334"
// ✅ This NEVER changes for a user
```

### For Authentication
```javascript
const identityToken = appleAuthRequestResponse.identityToken;
// Send this to your backend for verification
// Backend should verify signature against Apple's public keys
```

### For User Email (Reliable Method)
```javascript
// Decode the identity token
const payload = decodeJWT(appleAuthRequestResponse.identityToken);
const email = payload.email;
// ✅ This works on EVERY sign-in, not just the first
```

### For User Profile (First Sign-In Only)
```javascript
if (appleAuthRequestResponse.email && appleAuthRequestResponse.fullName) {
  // FIRST SIGN-IN - Save this to your database!
  const profile = {
    email: appleAuthRequestResponse.email,
    firstName: appleAuthRequestResponse.fullName.givenName,
    lastName: appleAuthRequestResponse.fullName.familyName,
    // ... save other fields
  };
  saveToDatabase(profile);
}
```

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Expecting email on every sign-in
```javascript
// This will be NULL after first sign-in:
const email = appleAuthRequestResponse.email; // ❌
```
**✅ Solution:** Always get email from decoded JWT token

### ❌ Pitfall 2: Not saving name on first sign-in
```javascript
// If you don't save fullName on first sign-in,
// you'll NEVER get it again from Apple
```
**✅ Solution:** Save fullName to your database immediately on first sign-in

### ❌ Pitfall 3: Treating privacy relay emails as invalid
```javascript
// user@privaterelay.appleid.com is a VALID email
```
**✅ Solution:** Accept and store privacy relay emails - they're permanent for your app

### ❌ Pitfall 4: Not checking realUserStatus
```javascript
// Ignoring this allows potential fraud
```
**✅ Solution:** Check `realUserStatus === 2` for high-confidence real users

## Next Steps

1. **Run the app** and sign in with Apple
2. **Check Metro console** for the enhanced STEP 1 output
3. **Verify** you see all the data listed above
4. **Update your backend** to handle privacy relay emails
5. **Update your database** to store name data on first sign-in

---

**Created:** 2025-10-12  
**Related Files:** 
- `src/services/appleAuthService.js`
- `APPLE_SIGNIN_COMPLETE_DATA_LOGGING.md`
