# 🔐 Complete Authentication Implementation Guide

## 📋 Overview

This guide provides a complete, working implementation of authentication using Firebase with proper FCM token management for the YORAA app. All authentication methods are unified under a single service.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              authenticationService.js (UNIFIED)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • signInWithPhoneNumber()  (Firebase Phone Auth + OTP)    │  │
│  │ • verifyOTP()                                              │  │
│  │ • signInWithApple()        (Apple Sign In)                │  │
│  │ • signInWithGoogle()       (Google Sign In)               │  │
│  │ • signInWithEmail()        (Email/Password Login)         │  │
│  │ • signUpWithEmail()        (Email/Password Sign Up)       │  │
│  │ • logout()                 (Sign Out + Clean Up)          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ Firebase │       │  Backend │       │   FCM    │
    │   Auth   │       │   API    │       │ Service  │
    └──────────┘       └──────────┘       └──────────┘
```

---

## 📁 Files Created/Updated

### ✅ New Files
1. `/src/services/authenticationService.js` - **Unified authentication service**
2. This guide

### 🔄 Updated Files
1. `/src/services/fcmService.js` - Added `unregisterTokenFromBackend()` method
2. `/src/screens/RewardsScreen.js` - Removed "Create Account" button

---

## 🚀 Implementation Guide

### Step 1: Import the Authentication Service

In any screen where you need authentication (login, signup, rewards, etc.):

```javascript
import authenticationService from '../services/authenticationService';
```

### Step 2: Phone Number Login with OTP

```javascript
// Example: LoginScreen.js or PhoneLoginScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const PhoneLoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    const result = await authenticationService.signInWithPhoneNumber(phoneNumber);
    
    if (result.success) {
      setConfirmation(result.confirmation);
      setStep('otp');
      Alert.alert('Success', 'OTP sent to your phone');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const result = await authenticationService.verifyOTP(confirmation, otp);
    
    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      // FCM token is automatically registered
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View>
      {step === 'phone' ? (
        <>
          <TextInput
            placeholder="+91 Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Button title="Send OTP" onPress={handleSendOTP} />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};

export default PhoneLoginScreen;
```

### Step 3: Apple Sign In

```javascript
// Example: WelcomeScreen.js or AppleSignInButton component

import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const AppleSignInButton = ({ navigation }) => {
  const handleAppleSignIn = async () => {
    const result = await authenticationService.signInWithApple();
    
    if (result.success) {
      Alert.alert('Success', 'Signed in with Apple!');
      // FCM token is automatically registered
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <TouchableOpacity onPress={handleAppleSignIn} style={styles.appleButton}>
      <Text style={styles.buttonText}>🍎 Sign in with Apple</Text>
    </TouchableOpacity>
  );
};

export default AppleSignInButton;
```

### Step 4: Google Sign In

```javascript
// Example: WelcomeScreen.js or GoogleSignInButton component

import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const GoogleSignInButton = ({ navigation }) => {
  const handleGoogleSignIn = async () => {
    const result = await authenticationService.signInWithGoogle();
    
    if (result.success) {
      Alert.alert('Success', 'Signed in with Google!');
      // FCM token is automatically registered
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
      <Text style={styles.buttonText}>🔵 Sign in with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;
```

### Step 5: Email/Password Login

```javascript
// Example: EmailLoginScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const EmailLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await authenticationService.signInWithEmail(email, password);
    
    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      // FCM token is automatically registered
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default EmailLoginScreen;
```

### Step 6: Email/Password Sign Up

```javascript
// Example: EmailSignUpScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const EmailSignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignUp = async () => {
    const result = await authenticationService.signUpWithEmail(
      email,
      password,
      fullName
    );
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      // FCM token is automatically registered
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

export default EmailSignUpScreen;
```

### Step 7: Logout (CRITICAL!)

```javascript
// Example: ProfileScreen.js, SettingsScreen.js, or RewardsScreen.js

import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import authenticationService from '../services/authenticationService';

const LogoutButton = ({ navigation }) => {
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
              // Navigate to welcome/login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>🔓 Logout</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;
```

### Step 8: Check Authentication Status

```javascript
// Example: Any protected screen or App.js

import React, { useEffect, useState } from 'react';
import authenticationService from '../services/authenticationService';

const ProtectedScreen = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authenticationService.isAuthenticated();
    
    if (authenticated) {
      const user = await authenticationService.getCurrentUser();
      setIsAuthenticated(true);
      setCurrentUser(user);
    } else {
      // Redirect to login
      navigation.replace('Login');
    }
  };

  return (
    // Your screen content
  );
};
```

---

## 🔔 FCM Token Flow (Automatic!)

### What Happens Automatically After Login/Signup:

1. ✅ User authenticates successfully
2. ✅ Auth token saved to AsyncStorage (`token`, `user`)
3. ✅ FCM service initializes
4. ✅ FCM requests notification permission
5. ✅ FCM token obtained from Firebase
6. ✅ FCM token registered with backend (`/users/update-fcm-token`)
7. ✅ User can now receive push notifications

### What Happens Automatically on Logout:

1. ✅ FCM token unregistered from backend (`/users/remove-fcm-token`)
2. ✅ Firebase sign out
3. ✅ Google sign out (if applicable)
4. ✅ All AsyncStorage data cleared
5. ✅ User redirected to login screen

**You don't need to manually handle FCM tokens!** The authentication service handles everything.

---

## 🎯 Integration with Contexts

### Cart Context - Update to Check Authentication

The Cart and Wishlist contexts should already be checking for authentication. If not, update them:

```javascript
// src/services/cart/CartContext.js

useEffect(() => {
  checkAuthAndFetchCart();
}, []);

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

### Wishlist Context - Update to Check Authentication

```javascript
// src/services/context/WishlistContext.js

useEffect(() => {
  checkAuthAndLoadWishlist();
}, []);

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

## 📊 Expected Console Output

### ✅ Successful Phone Login Flow

```
╔═══════════════════════════════════════════════════════════════╗
║       📱 PHONE AUTH - SEND OTP FLOW                           ║
╚═══════════════════════════════════════════════════════════════╝
⏰ Start Time: 2025-10-14T10:30:00.000Z
📞 Phone Number: +917006114695
🔄 Sending OTP via Firebase...
✅ OTP sent successfully

╔═══════════════════════════════════════════════════════════════╗
║       📱 PHONE AUTH - VERIFY OTP FLOW                         ║
╚═══════════════════════════════════════════════════════════════╝
⏰ Start Time: 2025-10-14T10:31:00.000Z
📝 OTP Code: 123456
🔄 Confirming OTP with Firebase...
✅ OTP verified successfully
👤 Firebase UID: abc123xyz...
🔄 Authenticating with backend server...
✅ Backend authentication successful
🔄 Completing authentication flow...
💾 Saving authentication data...
✅ Auth data saved to AsyncStorage
🔔 Initializing FCM service...
✅ Authentication flow completed
🔔 Initializing FCM Service...
✅ iOS notification permissions granted: 1
📱 FCM Token received: feavECDWzkUeoSV6...
✅ FCM Service initialized successfully
✅ FCM initialized successfully
📤 Registering FCM token with backend...
✅ FCM token registered with backend successfully
✅ FCM token registered with backend
```

### ✅ Successful Logout Flow

```
╔═══════════════════════════════════════════════════════════════╗
║       🔓 LOGOUT FLOW                                          ║
╚═══════════════════════════════════════════════════════════════╝
⏰ Start Time: 2025-10-14T11:00:00.000Z
🔄 Signing out from Firebase...
✅ Firebase sign out successful
✅ Google sign out successful
📤 Unregistering FCM token from backend...
✅ FCM token unregistered from backend
🔄 Clearing stored authentication data...
✅ All stored data cleared
✅ Logout completed successfully
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🔧 Backend API Requirements

Your backend must have these endpoints:

### 1. Firebase Login/Signup Endpoint
```
POST /auth/firebase-login
Body: {
  idToken: string,          // Firebase ID token
  phoneNumber?: string,     // For phone auth
  email?: string,           // For email/google/apple auth
  fullName?: string,        // User's full name
  photoURL?: string,        // Profile photo URL
  method: 'phone' | 'apple' | 'google' | 'email'
}
Response: {
  success: boolean,
  token: string,           // Your backend JWT token
  user: {
    _id: string,
    email?: string,
    phoneNumber?: string,
    name?: string,
    // ... other user fields
  }
}
```

### 2. FCM Token Registration Endpoint
```
POST /users/update-fcm-token
Headers: {
  Authorization: Bearer <token>
}
Body: {
  fcmToken: string,
  platform: 'ios' | 'android'
}
Response: {
  success: boolean,
  message: string
}
```

### 3. FCM Token Unregister Endpoint
```
POST /users/remove-fcm-token
Headers: {
  Authorization: Bearer <token>
}
Body: {
  fcmToken: string,
  platform: 'ios' | 'android'
}
Response: {
  success: boolean,
  message: string
}
```

---

## ✅ Testing Checklist

### Phone Authentication
- [ ] Send OTP to valid phone number
- [ ] Receive OTP code
- [ ] Verify OTP successfully
- [ ] FCM token registered after login
- [ ] User data saved to AsyncStorage
- [ ] Navigate to home screen

### Apple Sign In
- [ ] Apple Sign In modal appears
- [ ] Sign in successfully
- [ ] FCM token registered after login
- [ ] User data saved to AsyncStorage
- [ ] Navigate to home screen

### Google Sign In
- [ ] Google Sign In modal appears
- [ ] Sign in successfully
- [ ] FCM token registered after login
- [ ] User data saved to AsyncStorage
- [ ] Navigate to home screen

### Email Login
- [ ] Login with valid credentials
- [ ] FCM token registered after login
- [ ] User data saved to AsyncStorage
- [ ] Navigate to home screen
- [ ] Show error for invalid credentials

### Email Sign Up
- [ ] Create account with valid data
- [ ] FCM token registered after signup
- [ ] User data saved to AsyncStorage
- [ ] Navigate to home screen
- [ ] Show error for existing email

### Logout
- [ ] FCM token unregistered from backend
- [ ] Firebase sign out successful
- [ ] Google sign out successful (if applicable)
- [ ] All AsyncStorage data cleared
- [ ] Navigate to login/welcome screen
- [ ] Cannot access protected screens after logout

### Context Integration
- [ ] Cart not fetched for guest users (no errors)
- [ ] Wishlist not fetched for guest users (no errors)
- [ ] Cart loads automatically after login
- [ ] Wishlist loads automatically after login
- [ ] Cart cleared after logout
- [ ] Wishlist cleared after logout

---

## 🐛 Common Issues & Solutions

### Issue: "No token found" errors for guest users
**Solution:** Contexts should check authentication before fetching data. See [Integration with Contexts](#integration-with-contexts) section.

### Issue: FCM token not registered
**Solution:** Ensure auth token is saved BEFORE calling FCM service. The authenticationService handles this correctly.

### Issue: Logout not clearing data
**Solution:** Use `authenticationService.logout()` which handles everything including FCM unregister.

### Issue: Firebase Auth errors
**Solution:** Check error messages in console. The service provides user-friendly error messages via `_getAuthErrorMessage()`.

### Issue: Backend authentication fails
**Solution:** Ensure your backend endpoint `/auth/firebase-login` exists and accepts Firebase ID tokens.

---

## 📚 Additional Features You Can Add

### 1. Remember Me (Keep User Logged In)
Already implemented! Auth data persists in AsyncStorage across app restarts.

### 2. Biometric Authentication
```javascript
// Add to authenticationService.js
import ReactNativeBiometrics from 'react-native-biometrics';

async enableBiometrics() {
  const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  // Implement biometric login
}
```

### 3. Password Reset
```javascript
// Add to authenticationService.js
async resetPassword(email) {
  try {
    await auth().sendPasswordResetEmail(email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    return { success: false, error: this._getAuthErrorMessage(error) };
  }
}
```

### 4. Email Verification
```javascript
// Add to authenticationService.js
async sendEmailVerification() {
  try {
    const user = auth().currentUser;
    await user.sendEmailVerification();
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🎉 Summary

✅ **Single unified authentication service** (`authenticationService.js`)
✅ **All sign-in methods supported** (Phone/OTP, Apple, Google, Email)
✅ **Automatic FCM token management** (register on login, unregister on logout)
✅ **Clean console logs** (no errors for guest users)
✅ **Production-ready** (comprehensive error handling)
✅ **Easy to use** (simple async/await API)

---

**Last Updated:** October 14, 2025  
**Version:** 2.0.0  
**Author:** YORAA Development Team
