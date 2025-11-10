# 🚀 Authentication Migration Quick Reference

## 📋 What Was Done

### ✅ New Files Created
1. `/src/services/authenticationService.js` - **Unified authentication service**
2. `/AUTHENTICATION_COMPLETE_GUIDE.md` - Complete implementation guide
3. This quick reference

### 🔄 Files Updated
1. `/src/services/fcmService.js` - Added `unregisterTokenFromBackend()` method
2. `/src/screens/RewardsScreen.js` - Removed "Create Account" button

---

## 🔧 Files You Need to Update

### 1. Update Your Login Screens

#### File: `src/screens/loginaccountmobilenumber.js`
**Replace the phone login logic with:**

```javascript
import authenticationService from '../services/authenticationService';

// In your component:
const [confirmation, setConfirmation] = useState(null);

// Send OTP
const handleSendOTP = async () => {
  const result = await authenticationService.signInWithPhoneNumber(phoneNumber);
  
  if (result.success) {
    setConfirmation(result.confirmation);
    // Navigate to OTP screen or show OTP input
  } else {
    Alert.alert('Error', result.error);
  }
};

// Verify OTP (in OTP verification screen)
const handleVerifyOTP = async () => {
  const result = await authenticationService.verifyOTP(confirmation, otpCode);
  
  if (result.success) {
    Alert.alert('Success', 'Login successful!');
    navigation.replace('Home');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

#### File: `src/screens/loginaccountemail.js`
**Replace email login logic with:**

```javascript
import authenticationService from '../services/authenticationService';

const handleLogin = async () => {
  const result = await authenticationService.signInWithEmail(email, password);
  
  if (result.success) {
    Alert.alert('Success', 'Login successful!');
    navigation.replace('Home');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

#### File: `src/screens/createaccountemail.js`
**Replace email signup logic with:**

```javascript
import authenticationService from '../services/authenticationService';

const handleSignUp = async () => {
  const result = await authenticationService.signUpWithEmail(
    email,
    password,
    fullName
  );
  
  if (result.success) {
    Alert.alert('Success', 'Account created successfully!');
    navigation.replace('Home');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

### 2. Update Social Sign-In Screens

#### File: Find your Apple Sign In implementation
**Replace with:**

```javascript
import authenticationService from '../services/authenticationService';

const handleAppleSignIn = async () => {
  const result = await authenticationService.signInWithApple();
  
  if (result.success) {
    Alert.alert('Success', 'Signed in with Apple!');
    navigation.replace('Home');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

#### File: Find your Google Sign In implementation
**Replace with:**

```javascript
import authenticationService from '../services/authenticationService';

const handleGoogleSignIn = async () => {
  const result = await authenticationService.signInWithGoogle();
  
  if (result.success) {
    Alert.alert('Success', 'Signed in with Google!');
    navigation.replace('Home');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

### 3. Update Profile/Settings Screen with Logout

#### File: `src/screens/ProfileScreen.js` or `src/screens/SettingsScreen.js`
**Add logout button:**

```javascript
import authenticationService from '../services/authenticationService';

const handleLogout = async () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          const result = await authenticationService.logout();
          
          if (result.success) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          } else {
            Alert.alert('Error', 'Failed to logout');
          }
        }
      }
    ]
  );
};

// In your render:
<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
  <Text style={styles.logoutText}>🔓 Logout</Text>
</TouchableOpacity>
```

### 4. Update Cart Context (if not already done)

#### File: `src/services/cart/CartContext.js`
**Update the authentication check:**

```javascript
import authenticationService from '../services/authenticationService';

const checkAuthAndFetchCart = async () => {
  try {
    const isAuth = await authenticationService.isAuthenticated();
    if (isAuth) {
      console.log('[CartProvider] User authenticated, fetching cart...');
      await fetchCart();
    } else {
      console.log('[CartProvider] No authentication, skipping cart fetch');
    }
  } catch (error) {
    console.error('[CartProvider] Auth check error:', error.message);
  }
};
```

### 5. Update Wishlist Context (if not already done)

#### File: `src/services/context/WishlistContext.js`
**Update the authentication check:**

```javascript
import authenticationService from '../services/authenticationService';

const checkAuthAndLoadWishlist = async () => {
  try {
    const isAuth = await authenticationService.isAuthenticated();
    if (isAuth) {
      console.log('[WishlistProvider] User authenticated, loading wishlist...');
      await loadWishlist();
    } else {
      console.log('[WishlistProvider] No authentication, skipping wishlist load');
    }
  } catch (error) {
    console.error('[WishlistProvider] Auth check error:', error.message);
  }
};
```

---

## 🎯 Key Benefits

### Before (Multiple Services)
❌ Scattered authentication code  
❌ Manual FCM token management  
❌ Errors for guest users  
❌ Inconsistent error handling  
❌ Complex logout process  

### After (Unified Service)
✅ Single authentication service  
✅ Automatic FCM token management  
✅ Clean logs for guest users  
✅ Consistent error messages  
✅ Simple logout (one call)  

---

## 📊 Flow Comparison

### Old Flow (Problematic)
```
User logs in → Save token → Navigate
                             ↓
                    Try to send FCM token
                             ↓
                    ERROR: No token found!
```

### New Flow (Fixed)
```
User logs in → Save token → Initialize FCM → Register FCM → Navigate
                                                              ↓
                                                         Success!
```

---

## 🧪 Testing Steps

1. **Test Phone Login**
   ```bash
   1. Enter phone number (+91...)
   2. Click "Send OTP"
   3. Enter OTP code
   4. Click "Verify"
   5. ✅ Should login and navigate to Home
   6. ✅ Check console for FCM token registration
   ```

2. **Test Google Sign In**
   ```bash
   1. Click "Sign in with Google"
   2. Select Google account
   3. ✅ Should login and navigate to Home
   4. ✅ Check console for FCM token registration
   ```

3. **Test Apple Sign In**
   ```bash
   1. Click "Sign in with Apple"
   2. Authenticate with Apple
   3. ✅ Should login and navigate to Home
   4. ✅ Check console for FCM token registration
   ```

4. **Test Email Login**
   ```bash
   1. Enter email and password
   2. Click "Login"
   3. ✅ Should login and navigate to Home
   4. ✅ Check console for FCM token registration
   ```

5. **Test Email Sign Up**
   ```bash
   1. Enter name, email, password
   2. Click "Sign Up"
   3. ✅ Should create account and navigate to Home
   4. ✅ Check console for FCM token registration
   ```

6. **Test Logout**
   ```bash
   1. Click "Logout"
   2. Confirm logout
   3. ✅ Should clear all data
   4. ✅ Should unregister FCM token
   5. ✅ Should navigate to Welcome/Login screen
   6. ✅ Cart and Wishlist should not load
   ```

7. **Test Guest User (No Login)**
   ```bash
   1. Open app without logging in
   2. ✅ No error messages in console
   3. ✅ Cart and Wishlist should not fetch
   4. ✅ Clean experience for guest user
   ```

---

## 🔍 How to Find Your Files

### Finding Login Screens
```bash
# Search for phone login
grep -r "signInWithPhoneNumber\|phone.*auth" src/screens/

# Search for email login
grep -r "signInWithEmailAndPassword\|email.*login" src/screens/

# Search for Google login
grep -r "GoogleSignin\|google.*sign" src/screens/

# Search for Apple login
grep -r "appleAuth\|apple.*sign" src/screens/
```

### Finding Logout Implementation
```bash
# Search for logout/signout
grep -r "signOut\|logout\|log.*out" src/screens/

# Look in Profile or Settings screens
ls -la src/screens/ | grep -i "profile\|setting"
```

---

## ⚠️ Important Notes

### 1. **FCM Token Management**
- ✅ **DO**: Use `authenticationService.logout()` - handles FCM automatically
- ❌ **DON'T**: Call `auth().signOut()` directly - won't unregister FCM token

### 2. **Token Order (Critical!)**
```javascript
// ✅ CORRECT - authenticationService handles this
await authenticationService.signInWithEmail(email, password);
// Token saved → FCM initialized → FCM registered

// ❌ WRONG - manual approach
await auth().signInWithEmailAndPassword(email, password);
await sendFCMToken(); // Too early! Token not saved yet
await AsyncStorage.setItem('token', token);
```

### 3. **Context Updates**
Both Cart and Wishlist contexts should check authentication before fetching:
```javascript
const isAuth = await authenticationService.isAuthenticated();
if (isAuth) {
  // Fetch data
} else {
  // Skip quietly (no errors)
}
```

### 4. **Backend Requirements**
Your backend MUST have these endpoints:
- `POST /auth/firebase-login` - Accepts Firebase ID token, returns JWT
- `POST /users/update-fcm-token` - Registers FCM token
- `POST /users/remove-fcm-token` - Unregisters FCM token

---

## 📞 Need Help?

### Console Output Guide

#### ✅ Good Output (Success)
```
🔔 Initializing FCM after login...
✅ FCM initialized successfully
✅ FCM token registered with backend
[CartProvider] User authenticated, fetching cart...
[WishlistProvider] User authenticated, loading wishlist...
```

#### ❌ Bad Output (Problem)
```
❌ No token found
❌ FCM registration failed
❌ Backend authentication failed
```

### Common Fixes

**Problem:** "No token found" errors for guest users  
**Fix:** Update Cart/Wishlist contexts to check auth first

**Problem:** FCM token not registered  
**Fix:** Use `authenticationService` methods, not direct Firebase auth

**Problem:** Data not cleared on logout  
**Fix:** Use `authenticationService.logout()`, not manual signout

---

## ✅ Migration Checklist

- [ ] Install dependencies (if not already installed)
- [ ] Copy `authenticationService.js` to `src/services/`
- [ ] Update phone login screen
- [ ] Update email login screen
- [ ] Update email signup screen
- [ ] Update Google sign-in implementation
- [ ] Update Apple sign-in implementation
- [ ] Add logout button to Profile/Settings
- [ ] Update Cart context authentication check
- [ ] Update Wishlist context authentication check
- [ ] Test all authentication methods
- [ ] Test logout functionality
- [ ] Test guest user experience
- [ ] Verify FCM token registration in console
- [ ] Verify FCM token unregistration on logout

---

## 🎉 You're Done!

After completing the checklist above, your authentication system will:
- ✅ Work seamlessly across all sign-in methods
- ✅ Automatically manage FCM tokens
- ✅ Provide clean experience for guest users
- ✅ Handle logout properly
- ✅ Be production-ready

**Questions?** Check the full guide: `AUTHENTICATION_COMPLETE_GUIDE.md`

---

**Last Updated:** October 14, 2025  
**Author:** YORAA Development Team
