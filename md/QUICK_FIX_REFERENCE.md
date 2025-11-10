# 🚨 TESTFLIGHT LOGIN FIX - QUICK REFERENCE

**Issue**: Users cannot login on TestFlight  
**Cause**: App sends email, backend expects phone number  
**Fix Time**: 1-2 hours

---

## 🎯 THE FIX (ONE-PAGE SUMMARY)

### 1. Update yoraaAPI.js (Line ~313)

```javascript
// BEFORE ❌
async login(email, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', 
    { email, password }
  );
  // ...
}

// AFTER ✅
async login(phoneNumber, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', 
    { phNo: phoneNumber, password }
  );
  // ...
}
```

### 2. Update Login Screens

**Change input field:**
- Email input → Phone number input
- `keyboardType="email-address"` → `keyboardType="phone-pad"`
- Email validation → Phone validation

**Update login calls:**
```javascript
// BEFORE ❌
await yoraaAPI.login(email, password);

// AFTER ✅
await yoraaAPI.login(phoneNumber, password);
```

### 3. Don't Touch These (Already Correct)

- ✅ Google Sign-In (`firebaseLogin()`)
- ✅ Apple Sign-In (`firebaseLogin()`)
- ✅ Profile Update (`PUT /api/profile`)
- ✅ Logout (AsyncStorage clear)

---

## 📋 BACKEND ENDPOINTS (QUICK REF)

```
✅ POST /api/auth/login
   Body: { "phNo": "8888777766", "password": "Test123456" }
   
✅ POST /api/auth/login/firebase
   Body: { "idToken": "<firebase-token>" }
   
✅ GET /api/profile
   Headers: { "Authorization": "Bearer <token>" }
   
✅ PUT /api/profile
   Headers: { "Authorization": "Bearer <token>" }
   Body: { "firstName": "...", "lastName": "...", ... }
```

---

## ✅ TESTING CHECKLIST

- [ ] Updated `yoraaAPI.login()` method
- [ ] Updated login screen components
- [ ] Tested phone login locally
- [ ] Tested Google Sign-In still works
- [ ] Tested Apple Sign-In still works
- [ ] Tested profile update works
- [ ] Built for TestFlight
- [ ] Tested on device

---

## 📝 FILES TO CHANGE

1. `src/services/yoraaAPI.js` - login method
2. Login screen components - UI + validation

---

## 🎯 BACKEND EXPECTATIONS

**Login Endpoint ONLY Accepts:**
```javascript
{
  "phNo": "8888777766",    // ← Phone number (NOT email)
  "password": "Test123456"
}
```

**Does NOT Accept:**
```javascript
{
  "email": "user@example.com",  // ❌ Will fail
  "password": "Test123456"
}
```

---

## 💡 WHY THIS HAPPENED

Backend `loginController` code:
```javascript
const { phNo, password } = req.body;  // ← Only extracts phNo
const existingUser = await User.findOne({ phNo });  // ← Only searches by phone
```

---

**Status**: Fix ready, needs implementation  
**Priority**: 🚨 CRITICAL  
**Timeline**: 1-2 hours
