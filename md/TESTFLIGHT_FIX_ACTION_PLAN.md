# 🎯 TESTFLIGHT FIX - ACTION PLAN

**Date**: 11 October 2025  
**Issue**: Users cannot login on TestFlight  
**Root Cause**: App uses email, backend requires phone number  
**Priority**: 🚨 CRITICAL

---

## 📋 SUMMARY

### Problem:
Your React Native app on TestFlight cannot login because:
- ❌ App sends `{ email, password }` to backend
- ✅ Backend expects `{ phNo, password }`
- Result: "User not found" error

### Solution:
Change the app to use phone numbers for login instead of email.

### Time Required:
- Code changes: 30-60 minutes
- Testing: 15-30 minutes
- TestFlight upload: 10 minutes
- **Total: 1-2 hours**

---

## ✅ STEP-BY-STEP FIX

### Step 1: Fix the Login API Call (5 minutes)

**File**: `src/services/yoraaAPI.js`  
**Line**: ~313

**Find this code**:
```javascript
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
```

**Replace with**:
```javascript
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

**Changes**:
- Parameter: `email` → `phoneNumber`
- API body: `{ email, password }` → `{ phNo: phoneNumber, password }`

---

### Step 2: Find All Login Screen Files (2 minutes)

Run this command to find files that use the login method:

```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main
grep -r "yoraaAPI.login" src/
```

Common files to check:
- `src/screens/auth/LoginScreen.js`
- `src/screens/auth/SignInScreen.js`  
- `src/components/auth/LoginForm.js`
- Any other authentication screens

---

### Step 3: Update Login Screen Components (15-30 minutes)

For each file found in Step 2, make these changes:

#### A. Update State Variables

**Before**:
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

**After**:
```javascript
const [phoneNumber, setPhoneNumber] = useState('');
const [password, setPassword] = useState('');
```

#### B. Update Input Field

**Before**:
```jsx
<TextInput
  placeholder="Email"
  keyboardType="email-address"
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
/>
```

**After**:
```jsx
<TextInput
  placeholder="Phone Number"
  keyboardType="phone-pad"
  value={phoneNumber}
  onChangeText={setPhoneNumber}
  autoCapitalize="none"
/>
```

#### C. Update Validation

**Before**:
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

if (!validateEmail(email)) {
  Alert.alert('Error', 'Please enter a valid email');
  return;
}
```

**After**:
```javascript
const validatePhone = (phone) => {
  // Adjust regex based on your phone format requirements
  const phoneRegex = /^[0-9]{10}$/;  // Example: 10-digit phone
  return phoneRegex.test(phone);
};

if (!validatePhone(phoneNumber)) {
  Alert.alert('Error', 'Please enter a valid 10-digit phone number');
  return;
}
```

#### D. Update Login Call

**Before**:
```javascript
const handleLogin = async () => {
  try {
    const response = await yoraaAPI.login(email, password);
    if (response.token) {
      // Navigate to home
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**After**:
```javascript
const handleLogin = async () => {
  try {
    const response = await yoraaAPI.login(phoneNumber, password);
    if (response.token) {
      // Navigate to home
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

### Step 4: Keep Google/Apple Sign-In Unchanged (0 minutes)

**DO NOT CHANGE THESE** - They already work correctly:

```javascript
// Google Sign-In - Already correct
async signInWithGoogle() {
  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(googleCredential);
  const firebaseToken = await auth().currentUser.getIdToken();
  return await yoraaAPI.firebaseLogin(firebaseToken);
}

// Apple Sign-In - Already correct
async signInWithApple() {
  const appleAuthRequestResponse = await appleAuth.performRequest({...});
  const { identityToken } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(identityToken);
  await auth().signInWithCredential(appleCredential);
  const firebaseToken = await auth().currentUser.getIdToken();
  return await yoraaAPI.firebaseLogin(firebaseToken);
}
```

These use `yoraaAPI.firebaseLogin()` which is separate and already correct.

---

### Step 5: Test Locally (15 minutes)

#### A. Test Phone Login

1. Run the app:
   ```bash
   npx react-native run-ios
   ```

2. Try logging in with a test phone number:
   - Phone: `8888777766`
   - Password: `Test123456`

3. Verify:
   - ✅ Login succeeds
   - ✅ Token is stored
   - ✅ User navigates to home screen

#### B. Test Google Sign-In

1. Click "Sign in with Google"
2. Complete Google auth flow
3. Verify login succeeds

#### C. Test Apple Sign-In

1. Click "Sign in with Apple"
2. Complete Apple auth flow
3. Verify login succeeds

#### D. Test Profile Update

1. After login, go to profile screen
2. Update your name or other details
3. Save changes
4. Verify update succeeds

#### E. Test Logout

1. Click logout button
2. Verify:
   - ✅ Returns to login screen
   - ✅ Cannot access protected screens
   - ✅ Can login again

---

### Step 6: Build for TestFlight (10 minutes)

```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main

# Update pods
cd ios
pod install
cd ..

# Build release version
npx react-native run-ios --configuration Release

# Or build with Xcode:
# 1. Open ios/YoraaApp.xcworkspace in Xcode
# 2. Select "Any iOS Device" as target
# 3. Product > Archive
# 4. Upload to App Store Connect
```

---

### Step 7: Test on TestFlight (10 minutes)

1. Upload build to TestFlight
2. Wait for processing (~5-10 minutes)
3. Download on your device
4. Test:
   - ✅ Phone login works
   - ✅ Google Sign-In works
   - ✅ Apple Sign-In works
   - ✅ Profile update works
   - ✅ Logout works

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: "User not found" error

**Cause**: User doesn't exist or isn't verified

**Fix**: 
1. Use a verified user account, or
2. Create a new account via signup
3. Verify the account (if OTP is enabled)

---

### Issue 2: "Invalid credentials" error

**Cause**: Wrong password

**Fix**: 
- Use the correct password
- Or reset password (if password reset is implemented)

---

### Issue 3: Phone number validation fails

**Cause**: Wrong phone format

**Fix**: Adjust your phone validation regex to match your backend's expected format:

```javascript
// If backend expects 10 digits:
const phoneRegex = /^[0-9]{10}$/;

// If backend expects country code:
const phoneRegex = /^\+[0-9]{12}$/;

// If backend is flexible:
const phoneRegex = /^[+]?[0-9]{10,15}$/;
```

---

### Issue 4: Google/Apple sign-in stopped working

**Cause**: You accidentally changed the wrong code

**Fix**: 
- Revert changes to `firebaseLogin()` method
- Only change the regular `login()` method
- Google/Apple should use `firebaseLogin()`, not `login()`

---

## ✅ VERIFICATION CHECKLIST

Before deploying to TestFlight:

- [ ] Changed `yoraaAPI.login()` to accept `phoneNumber` instead of `email`
- [ ] Updated API call to send `{ phNo: phoneNumber, password }`
- [ ] Updated all login screens to use phone number input
- [ ] Updated phone number validation
- [ ] Updated placeholder text ("Phone Number" not "Email")
- [ ] Tested phone login locally
- [ ] Tested Google Sign-In still works
- [ ] Tested Apple Sign-In still works
- [ ] Tested profile update after login
- [ ] Tested logout clears session
- [ ] Built release version
- [ ] Tested on TestFlight

---

## 📝 FILES TO MODIFY

### Must Change:
1. ✏️ `src/services/yoraaAPI.js` - login method (~line 313)
2. ✏️ Login screen components (phone input, validation)

### Don't Change:
1. ✅ `src/services/yoraaAPI.js` - firebaseLogin method
2. ✅ `src/managers/AuthManager.js` - logout method
3. ✅ `src/services/yoraaAPI.js` - updateProfile method
4. ✅ Google Sign-In implementation
5. ✅ Apple Sign-In implementation

---

## 💡 TIPS

1. **Search for email-related code**:
   ```bash
   grep -r "email" src/screens/auth/
   ```
   Replace with phone number logic

2. **Test with a real backend user**:
   - Create via signup endpoint
   - Or ask backend team for test credentials

3. **Keep error messages helpful**:
   ```javascript
   Alert.alert(
     'Login Failed', 
     'Please check your phone number and password'
   );
   ```

4. **Add phone formatting** (optional):
   ```javascript
   const formatPhone = (phone) => {
     // Remove non-digits
     const cleaned = phone.replace(/\D/g, '');
     // Format as (XXX) XXX-XXXX or whatever format you want
     return cleaned;
   };
   ```

---

## 🎯 SUCCESS CRITERIA

Your fix is complete when:

- ✅ Users can login with phone number + password
- ✅ Google Sign-In still works
- ✅ Apple Sign-In still works
- ✅ Profile updates work after login
- ✅ Logout clears the session
- ✅ TestFlight app allows login
- ✅ No crashes on app launch

---

## 📞 NEED HELP?

### If login still fails:
1. Check backend is running (`http://localhost:8001`)
2. Check user exists and is verified in database
3. Check phone number format matches backend expectations
4. Check network requests in React Native debugger

### If Google/Apple sign-in breaks:
1. Revert any changes to `firebaseLogin()` method
2. Ensure Firebase configuration is correct
3. Check Firebase console for errors

### If profile update fails:
1. Check auth token is being sent in headers
2. Check token hasn't expired
3. Check profile update endpoint is being called correctly

---

**Status**: 📋 **ACTION PLAN READY**  
**Next Step**: Start with Step 1 - Fix yoraaAPI.js  
**Timeline**: 1-2 hours total  
**Priority**: 🚨 CRITICAL

**Good luck! 🚀**
