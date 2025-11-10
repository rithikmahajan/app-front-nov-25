# Firebase Phone Authentication Setup Guide

## Current Error
**[auth/operation-not-allowed] This operation is not allowed. You must enable this service in the console.**

This error occurs because Phone Authentication is not enabled in your Firebase project.

---

## 🔧 Step-by-Step Fix

### Step 1: Enable Phone Authentication in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Authentication**
   - Click on **"Build"** in the left sidebar
   - Click on **"Authentication"**
   - Click on **"Sign-in method"** tab

3. **Enable Phone Provider**
   - Find **"Phone"** in the list of providers
   - Click on it
   - Click **"Enable"** toggle
   - Click **"Save"**

---

### Step 2: Set Up App Verification (reCAPTCHA)

For iOS, you need to configure reCAPTCHA Enterprise:

#### 2a. Enable App Check in Firebase Console

1. In Firebase Console, go to **"Build" → "App Check"**
2. Click **"Get Started"** or **"Register"** for your iOS app
3. Select **"App Attest"** as the provider for iOS
4. Click **"Save"**

#### 2b. Configure reCAPTCHA Enterprise for Phone Auth

1. Go to **Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select the same project as your Firebase project

2. **Enable reCAPTCHA Enterprise API**
   - Go to: https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com
   - Click **"Enable"**

3. **Create a reCAPTCHA Key for iOS**
   - Go to: https://console.cloud.google.com/security/recaptcha
   - Click **"Create Key"**
   - Fill in:
     - **Display name**: "iOS Phone Auth"
     - **Platform type**: Select **"iOS"**
     - **Bundle ID**: `org.reactjs.native.example.oct7appfrontmain` (or your actual bundle ID)
   - Click **"Create"**
   - **Copy the Key ID** (you'll need this)

---

### Step 3: Update Your iOS App Configuration

#### 3a. Add the reCAPTCHA Key to your app

Open `ios/oct7appfrontmain/Info.plist` and add:

```xml
<key>RECAPTCHA_SITE_KEY</key>
<string>YOUR_RECAPTCHA_KEY_ID_HERE</string>
```

Or create a config file at `src/config/recaptcha.config.js`:

```javascript
export const RECAPTCHA_CONFIG = {
  siteKey: 'YOUR_RECAPTCHA_KEY_ID_HERE', // From Google Cloud Console
};
```

#### 3b. Add App Attest Capability

1. Open your project in Xcode
2. Select your app target
3. Go to **"Signing & Capabilities"** tab
4. Click **"+ Capability"**
5. Add **"App Attest"**

#### 3c. Update Entitlements File

The entitlements file should already have this (check `ios/oct7appfrontmain/oct7appfrontmain.entitlements`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
</dict>
</plist>
```

---

### Step 4: Configure Phone Auth Settings

Back in Firebase Console → Authentication → Sign-in method:

1. Click on **"Phone"** provider settings (gear icon)
2. Under **"Phone numbers for testing (optional)"**:
   - Add test phone numbers if needed for development
   - Example: `+91 7006114695` with code `123456`

3. **Test Mode (Development)**
   - For testing without SMS charges, you can add test numbers
   - These will work without sending actual SMS

4. **Production Setup**
   - Enable **App Verification**
   - Ensure you have billing enabled on your Firebase project (required for SMS)

---

### Step 5: Update Your React Native Code

Make sure your Firebase initialization includes App Check:

```javascript
// App.js or firebase initialization file
import auth from '@react-native-firebase/auth';
import appCheck from '@react-native-firebase/app-check';

// Initialize App Check
appCheck()
  .initializeAppCheck({
    provider: __DEV__ ? appCheck.newReactNativeFirebaseAppCheckProviderDebug() : 'app-attest',
    isTokenAutoRefreshEnabled: true,
  })
  .then(() => console.log('App Check initialized'))
  .catch(console.error);
```

---

### Step 6: Rebuild and Test

```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clean Xcode build
cd ios && xcodebuild clean && cd ..

# Rebuild the app
npx react-native run-ios
```

---

## 🧪 Testing Checklist

- [ ] Phone authentication enabled in Firebase Console
- [ ] App Check enabled for iOS app
- [ ] reCAPTCHA Enterprise API enabled in Google Cloud
- [ ] reCAPTCHA key created for iOS platform
- [ ] Bundle ID matches in Firebase, Google Cloud, and Xcode
- [ ] App Attest capability added in Xcode
- [ ] Entitlements file configured
- [ ] App Check initialized in React Native code
- [ ] Pods reinstalled
- [ ] App rebuilt and tested

---

## 🚨 Common Issues

### Issue 1: "reCAPTCHA SDK is not linked"
✅ **Fixed**: Already installed `pod 'GoogleMLKit/BarcodeScanning'` and `RecaptchaEnterprise`

### Issue 2: "operation-not-allowed"
✅ **Fix**: Enable Phone authentication in Firebase Console (current step)

### Issue 3: "Missing reCAPTCHA token"
- Ensure reCAPTCHA key is properly configured
- Check that App Check is initialized before authentication
- Verify bundle ID matches across all platforms

### Issue 4: SMS not sending
- Ensure Firebase project has billing enabled
- Check SMS quota in Firebase Console
- Verify phone number format is correct (+country code)

---

## 📱 Quick Command Reference

```bash
# Check Firebase configuration
cat ios/oct7appfrontmain/GoogleService-Info.plist | grep BUNDLE_ID

# Rebuild iOS app
cd ios && pod install && cd ..
npx react-native run-ios

# Check logs
npx react-native log-ios

# Clean all caches
watchman watch-del-all
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

---

## 🔐 Security Notes

1. **Never commit** your reCAPTCHA site key to version control if it's a production key
2. Use **environment variables** for sensitive keys
3. Enable **App Check** in production to prevent abuse
4. Set up **rate limiting** in Firebase Console
5. Use **test phone numbers** during development to avoid SMS costs

---

## Next Steps

1. ✅ Complete Firebase Console setup (enable Phone auth)
2. ✅ Create reCAPTCHA key in Google Cloud
3. ✅ Add key to your app configuration
4. ✅ Add App Attest capability in Xcode
5. ✅ Rebuild and test

After completing these steps, your phone authentication should work! 🎉
