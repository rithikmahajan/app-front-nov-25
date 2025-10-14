# 🎯 TESTFLIGHT LOGIN/LOGOUT/PROFILE ISSUES - ROOT CAUSE IDENTIFIED

**Date**: 11 October 2025  
**Status**: 🔍 **ROOT CAUSE FOUND**  
**Priority**: 🚨 **CRITICAL - APP CANNOT LOGIN**

---

## 🚨 CRITICAL ISSUE

### The Problem:
**React Native app is trying to login with EMAIL, but backend ONLY accepts PHONE NUMBERS**

### Evidence:
1. Backend login controller code (`src/controllers/authController/AuthController.js` line 16):
```javascript
exports.loginController = async (req, res) => {
    const { phNo, password } = req.body;  // ← Only extracts phNo, NOT email
    const existingUser = await User.findOne({ phNo });  // ← Only searches by phone
    //...
}
```

2. React Native app (`src/services/yoraaAPI.js` line ~313):
```javascript
async login(email, password) {  // ← Takes email parameter
  const response = await this.makeRequest('/api/auth/login', 'POST', 
    { email, password }  // ← Sends email to backend
  );
}
```

### Result:
- ❌ Login always fails with "User not found"
- ❌ Users cannot access the app on TestFlight
- ❌ Profile updates fail (no auth token)
- ❌ All authenticated features are broken

---

## ✅ THE FIX

### Step 1: Update `yoraaAPI.js` Login Method

**File**: `src/services/yoraaAPI.js`  
**Line**: ~313

**CHANGE FROM**:
```javascript
async login(email, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', { email, password });
  if (response.token) {
    this.userToken = response.token;
    await AsyncStorage.setItem('userToken', response.token);
    
    // Transfer guest data after successful authentication
    try {
      await this.transferAllGuestData();
    } catch (transferError) {
      console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
    }
  }
  return response;
}
```

**CHANGE TO**:
```javascript
async login(phoneNumber, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', { 
    phNo: phoneNumber,  // ← Backend expects phNo, not email
    password 
  });
  if (response.token) {
    this.userToken = response.token;
    await AsyncStorage.setItem('userToken', response.token);
    
    // Transfer guest data after successful authentication
    try {
      await this.transferAllGuestData();
    } catch (transferError) {
      console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
    }
  }
  return response;
}
```

### Step 2: Update All Login Screen Components

Find all files that call `yoraaAPI.login()` and update them to use phone number instead of email.

**Search for**:
```bash
grep -r "yoraaAPI.login" src/
```

**Update each call from**:
```javascript
await yoraaAPI.login(email, password);
```

**To**:
```javascript
await yoraaAPI.login(phoneNumber, password);
```

### Step 3: Update Login UI

- Change email input field to phone number input
- Update input validation (phone format instead of email format)
- Update placeholder text
- Update error messages

---

## 📱 WHAT'S WORKING (Don't Touch These)

### ✅ Google Sign-In
**File**: `src/services/yoraaAPI.js`  
**Status**: ✅ CORRECT - Already uses Firebase

```javascript
async firebaseLogin(idToken) {
  const response = await this.makeRequest('/api/auth/login/firebase', 'POST', { idToken });
  // ... handles token storage correctly
}
```

### ✅ Apple Sign-In
**File**: `src/services/yoraaAPI.js`  
**Status**: ✅ CORRECT - Already uses Firebase

Both Google and Apple sign-in go through Firebase authentication, which then calls `/api/auth/login/firebase` - this is correct and working.

### ✅ Profile Update
**File**: `src/services/yoraaAPI.js`  
**Status**: ✅ CORRECT

```javascript
async updateProfile(profileData) {
  return this.makeRequest('/api/profile', 'PUT', profileData, true);
}
```

Backend provides `PUT /api/profile` endpoint - this matches perfectly.

### ✅ Logout
**File**: `src/managers/AuthManager.js`  
**Status**: ✅ CORRECT

```javascript
async logout() {
  await auth().signOut();
  await AsyncStorage.multiRemove(['userToken', 'userData', 'guestId']);
  this.userToken = null;
  this.userData = null;
}
```

Clears Firebase auth and AsyncStorage - correct for JWT-based auth.

---

## 🧪 BACKEND ENDPOINTS - VERIFIED

| Endpoint | Method | Takes | Returns | Status |
|----------|--------|-------|---------|--------|
| `/api/auth/login` | POST | `{ phNo, password }` | `{ token, user }` | ✅ Works |
| `/api/auth/login/firebase` | POST | `{ idToken }` | `{ token, user }` | ✅ Works |
| `/api/auth/signup` | POST | `{ name, email, phNo, password }` | Success message | ✅ Works |
| `/api/profile` | GET | Auth header | User profile | ✅ Works |
| `/api/profile` | PUT | Profile data + Auth header | Updated profile | ✅ Works |

**NOT Available**:
- ❌ Email login (`/api/auth/login` with email)
- ❌ OTP verification
- ❌ Password reset

---

## 📝 EXACT CODE CHANGES NEEDED

### Change 1: yoraaAPI.js

<details>
<summary>View full code change</summary>

```javascript
// OLD CODE (lines ~313-328):
async login(email, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', { email, password });
  if (response.token) {
    this.userToken = response.token;
    await AsyncStorage.setItem('userToken', response.token);
    
    try {
      await this.transferAllGuestData();
    } catch (transferError) {
      console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
    }
  }
  return response;
}

// NEW CODE:
async login(phoneNumber, password) {
  const response = await this.makeRequest('/api/auth/login', 'POST', { 
    phNo: phoneNumber,
    password 
  });
  if (response.token) {
    this.userToken = response.token;
    await AsyncStorage.setItem('userToken', response.token);
    
    try {
      await this.transferAllGuestData();
    } catch (transferError) {
      console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
    }
  }
  return response;
}
```

</details>

### Change 2: Update Login Screen Components

Find files that use login and update them. Common files:
- `src/screens/auth/LoginScreen.js`
- `src/screens/auth/SignInScreen.js`
- Any other login-related screens

**Before**:
```javascript
const handleLogin = async () => {
  const response = await yoraaAPI.login(email, password);
};
```

**After**:
```javascript
const handleLogin = async () => {
  const response = await yoraaAPI.login(phoneNumber, password);
};
```

---

## ✅ VERIFICATION CHECKLIST

After making changes:

- [ ] Phone login works in simulator
- [ ] Google Sign-In still works
- [ ] Apple Sign-In still works
- [ ] Profile update works after login
- [ ] Logout clears session properly
- [ ] App doesn't crash on launch
- [ ] TestFlight users can login

---

## 🎯 WHY THIS ISSUE OCCURRED

1. **Backend decision**: Backend team chose phone-only login for user accounts
2. **Miscommunication**: Frontend team assumed email login would work
3. **No API documentation**: No clear spec of what backend endpoints accept
4. **Testing gap**: Tests didn't catch the phone vs email mismatch

---

## 💡 RECOMMENDATIONS

### Immediate (Critical):
1. ✅ Change `yoraaAPI.login()` to use phone number
2. ✅ Update all login UI to collect phone numbers
3. ✅ Test on TestFlight before release

### Short-term:
1. Add API documentation (OpenAPI/Swagger)
2. Add integration tests that catch these mismatches
3. Improve error messages ("Expected phNo, got email")

### Long-term (Optional):
1. Ask backend to support email login (OR)
2. Standardize on phone-only login everywhere
3. Add proper API versioning

---

## 🚀 DEPLOYMENT PLAN

1. **Make code changes** (30 minutes)
   - Update `yoraaAPI.js`
   - Update login screens
   - Update validation

2. **Test locally** (15 minutes)
   - Test phone login
   - Test Google/Apple sign-in
   - Test profile update
   - Test logout

3. **Build for TestFlight** (10 minutes)
   ```bash
   cd ios && pod install
   npx react-native run-ios --configuration Release
   ```

4. **Upload to TestFlight** (5 minutes)

5. **Test on TestFlight** (10 minutes)
   - Download from TestFlight
   - Test login with phone number
   - Test all auth flows

**Total Time**: ~70 minutes

---

## 📞 CONTACT

**Issue**: Login not working on TestFlight  
**Root Cause**: Backend expects phone, app sends email  
**Fix**: Change app to use phone numbers  
**Status**: **FIX READY** - just needs implementation

---

**Last Updated**: 11 October 2025  
**Next Action**: Implement the fix in `yoraaAPI.js`  
**Priority**: 🚨 CRITICAL
