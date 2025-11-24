# 🔧 Backend Fix Required - Auth Provider Enum Error

## 🚨 URGENT: Production Login Broken

**Error:** `authProvider: 'phone' is not a valid enum value for path 'authProvider'`

**Impact:** ALL login methods (Phone/OTP, Apple, Google) failing in production

---

## ⚡ Quick Fix (Choose ONE)

### Option 1: Update User Schema Enum (RECOMMENDED)

```javascript
// models/User.js

const userSchema = new mongoose.Schema({
  // ... other fields
  
  authProvider: {
    type: String,
    enum: [
      'google',
      'google.com',    // Firebase format
      'apple', 
      'apple.com',     // Firebase format
      'password',
      'phone',         // ✅ ADD THIS LINE
      'firebase'
    ],
    required: true
  },
  
  // ... other fields
});
```

### Option 2: Map Firebase Providers in Auth Controller

```javascript
// controllers/authController.js
// In your firebaseLogin function:

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // ✅ ADD THIS MAPPING
    const providerMapping = {
      'phone': 'firebase',
      'google.com': 'google',
      'apple.com': 'apple',
      'password': 'password'
    };
    
    const firebaseProvider = decodedToken.firebase.sign_in_provider;
    const authProvider = providerMapping[firebaseProvider] || 'firebase';
    
    // Use authProvider instead of raw sign_in_provider
    // when creating/updating user
    
    // ... rest of code
  }
};
```

---

## 🔍 What's Happening

1. User authenticates with Firebase (phone/OTP, Apple, or Google)
2. Frontend sends Firebase ID token to `/api/auth/login/firebase`
3. Backend decodes token and extracts `sign_in_provider`
4. **Firebase returns:** `'phone'` for phone auth
5. **Backend tries to save:** User with `authProvider: 'phone'`
6. **MongoDB rejects:** `'phone'` not in enum
7. **User sees:** "Authentication Error" ❌

### Firebase sign_in_provider Values:

- `'phone'` - Phone number authentication ⚠️ **Not in your enum**
- `'google.com'` - Google Sign In
- `'apple.com'` - Apple Sign In  
- `'password'` - Email/Password

### Your Current Enum Values:

```javascript
enum: ['google', 'apple', 'password', 'firebase']
// Missing: 'phone' ❌
```

---

## ✅ Testing After Fix

1. Deploy backend changes
2. Test phone/OTP login
3. Should see in logs:
   ```
   ✅ User created with authProvider: 'phone'
   OR
   ✅ User created with authProvider: 'firebase' (if using mapping)
   ```

---

## 📋 Implementation Steps

1. **Update Code:** Apply Option 1 or Option 2 above
2. **Test Locally:** Verify phone auth works
3. **Deploy:** Push to production
4. **Verify:** Test all auth methods in production

---

## 🆘 Need Help?

**Debug Current Behavior:**

Add this temporarily to see what Firebase sends:

```javascript
// controllers/authController.js
console.log('Firebase sign_in_provider:', decodedToken.firebase.sign_in_provider);
console.log('Full firebase object:', decodedToken.firebase);
```

**Expected output for phone auth:**
```
Firebase sign_in_provider: phone
Full firebase object: { sign_in_provider: 'phone', identities: { phone: ['+91...'] } }
```

---

**Priority:** 🔴 CRITICAL  
**ETA Request:** 24 hours  
**Impact:** All new user registrations and logins blocked

