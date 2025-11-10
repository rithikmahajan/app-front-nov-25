# reCAPTCHA Enterprise Setup for iOS Phone Authentication

## ✅ Completed Steps

### 1. Pod Installation
- ✅ Added `RecaptchaEnterprise` pod to Podfile
- ✅ Installed RecaptchaEnterprise SDK (version 18.8.0)
- ✅ RecaptchaEnterpriseSDK (18.8.0) installed successfully

### 2. App Attest Configuration
- ✅ Added App Attest capability to entitlements files:
  - `YoraaApp.entitlements`
  - `YoraaAppRelease.entitlements`
- ✅ Set environment to `production`

### 3. Code Implementation
- ✅ Created `recaptchaService.js` - reCAPTCHA Enterprise service
- ✅ Updated `phoneAuthService.js` to use reCAPTCHA service
- ✅ Updated `App.js` to initialize reCAPTCHA on app startup

## 📋 Required: Firebase Console Setup

You need to configure reCAPTCHA Enterprise in Firebase Console:

### Step 1: Enable reCAPTCHA Enterprise

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Phone**
4. Under "App Verification" section, select **reCAPTCHA Enterprise**

### Step 2: Create reCAPTCHA Enterprise Key (Optional)

For better control, create a dedicated reCAPTCHA Enterprise key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/security/recaptcha)
2. Select your Firebase project
3. Click **"Create Key"**
4. Configure the key:
   - **Display name**: "Yoraa iOS Phone Auth"
   - **Platform**: iOS
   - **Bundle ID**: Your app's bundle ID (check `ios/Yoraa.xcodeproj`)
   - **Type**: Score-based (recommended)
5. Click **Create**
6. Copy the **Key ID** (you'll use this in your app)

### Step 3: Update Environment Variables (If using custom key)

If you created a custom reCAPTCHA key, update your app:

1. Open `App.js`
2. Find the initialization code:
   ```javascript
   await recaptchaService.initialize();
   ```
3. Replace with:
   ```javascript
   await recaptchaService.initialize('YOUR_RECAPTCHA_KEY_ID');
   ```

## 🔧 Xcode Configuration

### Add App Attest Capability in Xcode

1. Open your project in Xcode: `ios/Yoraa.xcodeproj`
2. Select your target (YoraaApp)
3. Go to **Signing & Capabilities** tab
4. Click **"+ Capability"**
5. Search for and add **"App Attest"**
6. Verify it appears in the capabilities list

**Note**: The entitlements files have already been updated with App Attest configuration.

## 🧪 Testing

### Clean Build and Test

1. **Clean Xcode Build**:
   ```bash
   cd ios
   rm -rf build
   rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
   ```

2. **Reinstall Pods** (already done):
   ```bash
   pod install
   ```

3. **Build and Run**:
   ```bash
   cd ..
   npx react-native run-ios
   ```

### Test Phone Authentication

1. Open the app
2. Navigate to phone login
3. Enter your phone number with country code (e.g., +1234567890)
4. Click "Send OTP"
5. Check the console logs for:
   - `✅ Firebase Auth initialized with reCAPTCHA support`
   - `📱 Verifying phone number with reCAPTCHA Enterprise`
   - OTP sent confirmation

### Expected Behavior

- ✅ No more "reCAPTCHA SDK is not linked" error
- ✅ Phone verification should work automatically
- ✅ reCAPTCHA verification happens in the background
- ✅ OTP is sent successfully

## 🐛 Troubleshooting

### Error: "auth/unknown" or reCAPTCHA not linked

**Solution**: Make sure you've:
1. Run `pod install` in ios directory ✅ (Done)
2. Added App Attest capability in Xcode (See Xcode Configuration above)
3. Cleaned and rebuilt the project
4. Enabled reCAPTCHA Enterprise in Firebase Console

### Error: "auth/app-not-authorized"

**Solution**: 
1. Verify your iOS app is registered in Firebase Console
2. Check that the bundle ID matches
3. Download the latest `GoogleService-Info.plist`
4. Enable Phone Authentication in Firebase Console

### Error: "reCAPTCHA Enterprise not initialized"

**Solution**:
1. Check console logs for initialization errors
2. Verify `recaptchaService.initialize()` is called in App.js
3. Check Firebase Auth is properly configured

## 📚 Additional Resources

- [Google Cloud reCAPTCHA iOS Documentation](https://cloud.google.com/recaptcha/docs/instrument-ios-apps)
- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/ios/phone-auth)
- [Apple App Attest Documentation](https://developer.apple.com/documentation/devicecheck/establishing_your_app_s_integrity)

## 🎯 Next Steps

1. ⏳ **Configure reCAPTCHA Enterprise in Firebase Console** (See above)
2. ⏳ **Add App Attest capability in Xcode** (See above)
3. ⏳ **Clean build and test** (See Testing section)
4. ✅ All code changes are complete and ready!

## 📝 Summary of Changes

### Files Modified:
- ✅ `ios/Podfile` - Added RecaptchaEnterprise pod
- ✅ `ios/YoraaApp/YoraaApp.entitlements` - Added App Attest
- ✅ `ios/YoraaApp/YoraaAppRelease.entitlements` - Added App Attest
- ✅ `src/services/recaptchaService.js` - New reCAPTCHA service (CREATED)
- ✅ `src/services/phoneAuthService.js` - Updated to use reCAPTCHA
- ✅ `App.js` - Added reCAPTCHA initialization

### Dependencies Added:
- ✅ RecaptchaEnterprise (18.8.0)
- ✅ RecaptchaEnterpriseSDK (18.8.0)

---

**Status**: ✅ Code implementation complete. Firebase Console configuration required.
