# reCAPTCHA iOS Configuration Fix

## Problem
The app shows error: `[auth/unknown] The reCAPTCHA SDK is not linked to your app`

## Solution Applied

### ✅ Step 1: Updated Info.plist with Bundle ID URL Scheme
Added the app's bundle ID (`com.yoraaapparelsprivatelimited.yoraa`) to the `CFBundleURLTypes` array in `ios/YoraaApp/Info.plist`.

This allows Firebase reCAPTCHA to properly redirect back to your app after verification.

### 🔑 Your Configuration Details

**Bundle ID:** `com.yoraaapparelsprivatelimited.yoraa`

**reCAPTCHA Keys (from Firebase Console):**
- **iOS Key:** `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- **Android Key:** `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

### 📋 Firebase Console Configuration

**IMPORTANT:** You need to configure the site keys in Firebase Console:

1. Go to Firebase Console → Authentication → Settings
2. Scroll to **"Configured platform site keys"** section
3. Click **"Configure site keys"** button
4. Add the following platforms:

#### iOS Platform Configuration:
```
Platform: iOS
Name: yoraa-ios (or any name you prefer)
Site Key: 6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt
Bundle ID: com.yoraaapparelsprivatelimited.yoraa
```

#### Android Platform Configuration:
```
Platform: Android
Name: yoraa-android (or any name you prefer)
Site Key: 6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_
Package Name: com.yoraaapparelsprivatelimited.yoraa
```

**Important Notes:**
- The "Name" field in Firebase Console can be any descriptive name (e.g., "yoraa-ios", "yoraa-android")
- The "Bundle ID" for iOS and "Package Name" for Android must match EXACTLY: `com.yoraaapparelsprivatelimited.yoraa`
- DO NOT use "yoraa.io.net" or variations - use the exact bundle ID from your Xcode project

### 🛠️ Next Steps

Run these commands to rebuild your iOS app:

```bash
# Navigate to iOS directory
cd ios

# Clean and reinstall pods
rm -rf Pods Podfile.lock
pod install

# Go back to root
cd ..

# Clean React Native cache
npx react-native start --reset-cache &

# In a new terminal, rebuild the app
npx react-native run-ios
```

Or use the automated script:

```bash
# Make executable
chmod +x rebuild-ios.sh

# Run rebuild
./rebuild-ios.sh
```

### 🔍 Verification

After rebuilding:
1. Open the app on iOS simulator/device
2. Go to Phone login
3. Enter a phone number
4. You should see reCAPTCHA verification appear (if enabled in Firebase)
5. Complete reCAPTCHA
6. OTP should be sent successfully

### 🐛 If Still Getting Errors

#### Option A: Verify Firebase Console Setup
1. Make sure you clicked "Configure site keys" in Firebase Console
2. Ensure iOS platform is added with:
   - Correct site key: `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
   - Correct bundle ID: `com.yoraaapparelsprivatelimited.yoraa`

#### Option B: Check Firebase Config File
Verify `ios/YoraaApp/GoogleService-Info.plist` has the correct configuration:
- Should have `BUNDLE_ID: com.yoraaapparelsprivatelimited.yoraa`
- Should match your Firebase project

#### Option C: Temporarily Disable reCAPTCHA (for testing only)
In Firebase Console:
1. Go to Authentication → Settings
2. Find "Phone authentication enforcement mode"
3. Change from "AUDIT" to "OFF"
4. Save changes
5. Try phone authentication again

⚠️ **Warning:** Disabling reCAPTCHA removes protection against SMS fraud. Only use this for testing.

### 📱 What Was Changed

**File Modified:** `ios/YoraaApp/Info.plist`

Added URL scheme entry:
```xml
<dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>YoraaAppBundleID</string>
    <key>CFBundleURLSchemes</key>
    <array>
        <string>com.yoraaapparelsprivatelimited.yoraa</string>
    </array>
</dict>
```

This allows Firebase Auth to handle reCAPTCHA verification properly.

### ✅ Checklist

- [x] Updated Info.plist with bundle ID URL scheme
- [ ] Configured iOS platform site key in Firebase Console
- [ ] Configured Android platform site key in Firebase Console
- [ ] Reinstalled pods
- [ ] Rebuilt iOS app
- [ ] Tested phone authentication

### 📚 References

- [Firebase reCAPTCHA iOS Setup](https://cloud.google.com/recaptcha-enterprise/docs/instrument-ios-apps)
- [React Native Firebase Phone Auth](https://rnfirebase.io/auth/phone-auth)
