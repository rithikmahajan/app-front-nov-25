# 🍎 Apple Sign-In Complete Data Logging

## Summary
Updated `appleAuthService.js` to log **ALL available information** from Apple Sign-In response at STEP 1.

## What's Now Being Logged

### 1. **Raw Response Object**
```javascript
🔑 Raw Response (stringified): <complete JSON object>
```

### 2. **Basic Response Properties**
- **user**: Apple user identifier (e.g., `000315.04ccbefff13446b2bcddb1abb2323a69.2334`)
- **email**: User's email (may be `N/A` if user chose to hide it)
- **fullName**: Object with name components
- **identityToken**: JWT token (shows length and first 50 chars)
- **authorizationCode**: Authorization code (shows length and first 50 chars)
- **nonce**: Cryptographic nonce value
- **state**: State parameter
- **realUserStatus**: Indicates if user is likely real person (anti-fraud)

### 3. **Full Name Breakdown** (if available)
- **givenName**: First name
- **familyName**: Last name
- **middleName**: Middle name
- **namePrefix**: Name prefix (e.g., "Dr.", "Mr.")
- **nameSuffix**: Name suffix (e.g., "Jr.", "III")
- **nickname**: Nickname

### 4. **Decoded Identity Token (JWT)**
The identity token is now automatically decoded to show:
- **iss** (issuer): Who issued the token (Apple)
- **sub** (subject): Apple's unique user identifier
- **aud** (audience): Your app's bundle ID
- **iat** (issued at): When token was created (ISO timestamp)
- **exp** (expires): When token expires (ISO timestamp)
- **email**: User's email address
- **email_verified**: Whether email is verified
- **is_private_email**: Whether user is using Apple's privacy relay email
- **nonce_supported**: Whether nonce is supported
- Plus complete JSON payload

### 5. **All Available Keys**
Lists all keys present in the response object for verification.

## Important Notes

### Email and Name Information
⚠️ **First Sign-In Only**: Apple provides `email` and `fullName` **ONLY on the first sign-in**. On subsequent sign-ins, these fields will be `null` or empty even though they exist in Apple's system.

**Example:**
- **First sign-in**: All data provided
- **Second sign-in**: Only `user`, `identityToken`, and `authorizationCode` provided
- Email comes from decoded JWT token on subsequent sign-ins

### Real User Status
The `realUserStatus` can have these values:
- `0`: Unsupported (device doesn't support this check)
- `1`: Unknown (can't determine)
- `2`: Likely real (high confidence this is a real person)

### Private Email Relay
If `is_private_email: true` in the JWT, the user chose to use Apple's privacy relay feature. The email will look like: `randomstring@privaterelay.appleid.com`

## Changes Made

### 1. Added Base64 Decoding Library
```javascript
import { decode as base64Decode } from 'base-64';
```
Installed `base-64` package to decode JWT tokens in React Native.

### 2. Enhanced Logging
- Added complete raw JSON output
- Added individual property logging with proper formatting
- Added JWT token decoding with all claims
- Added key enumeration to catch any additional fields

## Sample Output

```
🔄 STEP 1: Requesting Apple credentials...
✅ Apple credentials received
📦 Complete Apple Response Object:
═══════════════════════════════════════════════════════════════
🔑 Raw Response (stringified): {
  "user": "000315.04ccbefff13446b2bcddb1abb2323a69.2334",
  "email": null,
  "fullName": {
    "givenName": null,
    "familyName": null,
    ...
  },
  "identityToken": "eyJraWQ...",
  "authorizationCode": "c1234...",
  ...
}

📋 Individual Properties:
   ├─ user: 000315.04ccbefff13446b2bcddb1abb2323a69.2334
   ├─ email: N/A (may be hidden by user)
   ├─ fullName: {"namePrefix":null,"givenName":null,...}
   ├─ identityToken: [1234 chars] eyJraWQiOiJmaDZCczhDIiwiYWxnIjoiUlMyNTYifQ...
   ├─ authorizationCode: [891 chars] c1234567890abcdef...
   ├─ nonce: null
   ├─ state: null
   ├─ realUserStatus: 2

🔓 Decoded Identity Token Payload:
{
  "iss": "https://appleid.apple.com",
  "sub": "000315.04ccbefff13446b2bcddb1abb2323a69.2334",
  "aud": "com.yourapp.bundleid",
  "iat": 1728000000,
  "exp": 1728086400,
  "email": "user@example.com",
  "email_verified": true,
  "is_private_email": false,
  "nonce_supported": true
}
   ├─ iss (issuer): https://appleid.apple.com
   ├─ sub (subject/user ID): 000315.04ccbefff13446b2bcddb1abb2323a69.2334
   ├─ aud (audience): com.yourapp.bundleid
   ├─ iat (issued at): 2024-10-04T00:00:00.000Z
   ├─ exp (expires): 2024-10-05T00:00:00.000Z
   ├─ email: user@example.com
   ├─ email_verified: true
   ├─ is_private_email: false
   └─ nonce_supported: true
═══════════════════════════════════════════════════════════════

🔍 All Available Keys in Response: user,email,fullName,identityToken,authorizationCode,nonce,state,realUserStatus
```

## How to Use This Data

### For First-Time Sign-In Detection
Check `email` and `fullName` fields - if they're present, it's likely the first sign-in.

### For Email Retrieval
Always check the decoded JWT token's `email` field as a fallback if the response `email` is null.

### For User Verification
Use `realUserStatus: 2` to have confidence the user is a real person (helps prevent fraud).

### For Privacy Awareness
Check `is_private_email` in the JWT to know if user is using privacy relay.

## Testing
To see this enhanced logging in action, simply sign in with Apple and check the console output at STEP 1.

## Files Modified
- `src/services/appleAuthService.js` - Enhanced logging in `signInWithApple()` method
- `package.json` - Added `base-64` dependency

## Dependencies Added
```bash
npm install base-64
```
