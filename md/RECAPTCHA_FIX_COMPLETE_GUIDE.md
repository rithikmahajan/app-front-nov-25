# Firebase Phone Authentication reCAPTCHA Fix

## Problem
You're getting the error: `[auth/unknown] The reCAPTCHA SDK is not linked to your app`

This happens because Firebase Phone Authentication on iOS requires additional verification configuration to prevent abuse.

## ✅ Solution: Enable Firebase App Check (RECOMMENDED)

### Step 1: Enable App Check in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/yoraa-android-ios/appcheck
   
2. **Click "Get Started" or "Apps"**
   
3. **Select your iOS app**: `YORAA (com.yoraaapparelsprivatelimited.yoraa)`

4. **Choose Provider**:
   - For **Production**: Select **DeviceCheck**
   - For **Development/Testing**: Select **Debug Provider**

5. **Click "Save"**

### Step 2: Install App Check Package (Already Done ✅)

The RecaptchaInterop pod is already installed in your project.

### Step 3: Configure App Check in Your App

You need to add App Check initialization to your AppDelegate. Update your `ios/YoraaApp/AppDelegate.swift`:

```swift
import Firebase
import FirebaseAppCheck

// In didFinishLaunchingWithOptions, BEFORE FirebaseApp.configure():
let providerFactory = AppCheckDebugProviderFactory()
AppCheck.setAppCheckProviderFactory(providerFactory)

// Then configure Firebase
FirebaseApp.configure()
```

For production, use:
```swift
let providerFactory = DeviceCheckProviderFactory()
AppCheck.setAppCheckProviderFactory(providerFactory)
```

### Step 4: Rebuild and Test

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## Alternative: Use Test Phone Numbers (Development Only)

If you just want to test without configuring App Check:

1. Go to Firebase Console > Authentication > Sign-in method
2. Click on "Phone" provider
3. Scroll down to "Phone numbers for testing"
4. Add test phone numbers and codes:
   - Phone: +1 555-555-5555
   - Code: 123456

⚠️ **This only works in development and requires you to use these specific test numbers!**

---

## Current Setup

- ✅ Firebase initialized in AppDelegate
- ✅ RecaptchaInterop pod installed (101.0.0)
- ✅ URL schemes configured in Info.plist
- ✅ Push notifications configured for phone auth
- ✅ Bundle ID: `com.yoraaapparelsprivatelimited.yoraa`
- ✅ Firebase Project: `yoraa-android-ios`

---

## Quick Fix Command

Run this to apply the App Check fix:

```bash
chmod +x RECAPTCHA_FIX_GUIDE.sh
./RECAPTCHA_FIX_GUIDE.sh
```

---

## Verification

After applying the fix, you should:
1. See phone auth working without reCAPTCHA errors
2. Receive SMS OTP codes to real phone numbers
3. Be able to verify codes successfully

---

## Need Help?

- Firebase App Check Docs: https://firebase.google.com/docs/app-check/ios/devicecheck-provider
- Firebase Phone Auth Docs: https://firebase.google.com/docs/auth/ios/phone-auth
- reCAPTCHA Enterprise: https://cloud.google.com/recaptcha-enterprise/docs/instrument-ios-apps
