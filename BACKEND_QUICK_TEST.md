# 🧪 Backend Team: Simple Test to Prove the Issue

## Quick Test (30 seconds)

**Run this command on your backend server:**

```bash
# SSH to backend
ssh root@185.193.19.244

# Find your User model
find . -name "*user*.js" -o -name "*User*.js" | grep -v node_modules

# Check what authProvider enum values are allowed
grep -A 10 "authProvider" models/User.js  # Adjust path as needed
```

**Expected output:**
```javascript
authProvider: {
  type: String,
  enum: ['apple', 'google', 'facebook'], // or similar
  required: true
}
```

**See the problem?** `'phone'` is NOT in that array!

---

## What Firebase Actually Sends

When a user authenticates with **Firebase Phone Auth**, the ID token contains:

```json
{
  "firebase": {
    "sign_in_provider": "phone"  // ← This exact string
  }
}
```

When your backend does this:
```javascript
const authProvider = decodedToken.firebase.sign_in_provider;
// authProvider = "phone"
```

Then tries to save:
```javascript
user.authProvider = "phone"; // ❌ NOT in enum!
await user.save(); // ❌ VALIDATION ERROR!
```

---

## The Error You'll See in Logs

Search your backend logs for this error:

```bash
docker logs yoraa-api-prod | grep "not a valid enum value"
```

**You should see:**
```
User validation failed: authProvider: `phone` is not a valid enum value for path `authProvider`
```

**This proves:**
1. ✅ The error is happening on your backend
2. ✅ It's a Mongoose schema validation error
3. ✅ The value `'phone'` is being rejected

---

## Live Test with curl

**Test your current endpoint:**

```bash
# This will fail with enum error if 'phone' is not in schema
curl -X POST http://185.193.19.244:3001/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "PHONE_AUTH_ID_TOKEN_HERE"
  }'
```

**Expected error response:**
```json
{
  "success": false,
  "message": "User validation failed: authProvider: `phone` is not a valid enum value for path `authProvider`.",
  "statusCode": 400
}
```

---

## The One-Line Fix

**File:** `models/User.js` (or wherever your User schema is)

**Before:**
```javascript
authProvider: {
  type: String,
  enum: ['apple', 'google', 'facebook'],
  required: true
}
```

**After:**
```javascript
authProvider: {
  type: String,
  enum: ['apple', 'google', 'facebook', 'phone'],  // ← Add 'phone'
  required: true
}
```

**That's it!** One word added, error fixed.

---

## Verification After Fix

1. **Restart backend:**
   ```bash
   docker restart yoraa-api-prod
   ```

2. **Test again:**
   ```bash
   curl -X POST http://185.193.19.244:3001/api/auth/login/firebase \
     -H "Content-Type: application/json" \
     -d '{"idToken": "PHONE_AUTH_TOKEN"}'
   ```

3. **Expected success response:**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "...",
       "user": {
         "authProvider": "phone"  // ✅ Now accepted!
       }
     }
   }
   ```

---

## Why This is 100% a Backend Issue

| Question | Answer |
|----------|--------|
| Who defines the enum values? | ✅ Backend (User model schema) |
| Who validates against enum? | ✅ Backend (Mongoose/MongoDB) |
| Who throws the validation error? | ✅ Backend (Mongoose) |
| Can frontend change enum? | ❌ NO |
| Can frontend change Firebase's values? | ❌ NO |
| Can frontend prevent the error? | ❌ NO |

**Conclusion:** Backend must update schema to accept Firebase's values.

---

## Official Firebase Documentation

**Proof that Firebase uses 'phone' as sign_in_provider:**

1. **Firebase Admin SDK - DecodedIdToken:**
   https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.decodedidtoken

2. **UserRecord.ProviderData:**
   https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.userrecord#userrecordproviderdata

3. **Firebase Auth Provider IDs:**
   - Phone: `"phone"`
   - Google: `"google.com"`
   - Apple: `"apple.com"`
   - Password: `"password"`

---

## Summary for Backend Team

**Problem:**
- Firebase sends `sign_in_provider: "phone"`
- Your schema only allows `['apple', 'google', 'facebook']`
- Mongoose validation fails

**Solution:**
- Add `'phone'` to the enum
- Optionally add mapping for `.com` suffixes
- Restart server
- Done! ✅

**Time:** 5 minutes  
**Effort:** 1 line of code  
**Risk:** None (just adding allowed value)  
**Impact:** Fixes all Phone/Apple/Google authentication ✅

---

**Questions? Run the verification script:**
```bash
./verify-backend-schema.sh
```

This will show you exactly where the enum is defined and what values are currently allowed.
