# ✅ reCAPTCHA Configuration - Complete Manual Setup

## 🎯 What Was Done

### 1. iOS Configuration ✅
**File Modified:** `ios/YoraaApp/Info.plist`

Added URL scheme for reCAPTCHA:
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

### 2. Android Configuration ✅
**Files Modified:**
- `android/app/src/main/AndroidManifest.xml` - Fixed manifest merger conflict
- `android/gradle.properties` - Enabled Jetifier for AndroidX migration

Added to AndroidManifest.xml:
```xml
tools:replace="android:appComponentFactory"
android:appComponentFactory="androidx.core.app.CoreComponentFactory"
```

Added to gradle.properties:
```properties
android.enableJetifier=true
```

---

## 🔑 Your reCAPTCHA Keys

**iOS Key:** `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
**Android Key:** `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

**iOS Bundle ID:** `com.yoraaapparelsprivatelimited.yoraa`
**Android Package Name:** `com.yoraapparelsprivatelimited.yoraa`

---

## 🔥 CRITICAL: Firebase Console Configuration Required

### ⚠️ YOU MUST DO THIS MANUALLY IN FIREBASE CONSOLE

The reCAPTCHA keys are **NOT stored in your code**. They are configured in Firebase Console only.

### Step-by-Step Firebase Console Setup:

#### 1. Login to Firebase Console
```
URL: https://console.firebase.google.com/
Project: yoraa-android-ios
```

#### 2. Navigate to Authentication Settings
```
Left Menu: Authentication
Top Tab: Settings (gear icon)
Scroll Down: Find "reCAPTCHA" section
```

#### 3. Click "Configure site keys"
Look for this button in the reCAPTCHA section (visible in your screenshot)

#### 4. Add iOS Platform
```
┌────────────────────────────────────────────┐
│ Platform:   iOS-9 (or iOS)                 │
│ Name:       yoraa-ios                      │
│ Site Key:   6Lc5t-UrAAAAANbZi1nLmgC8E426zp-│
│             gF5CKLIkt                      │
│ Bundle ID:  com.yoraaapparelsprivatelimited│
│             .yoraa                         │
└────────────────────────────────────────────┘
```
Click **"Add"** or **"Save"**

#### 5. Add Android Platform
```
┌────────────────────────────────────────────┐
│ Platform:      Android                     │
│ Name:          yoraa-android               │
│ Site Key:      6LfV0uUrAAAAALtIIPs9vd2uSE │
│                ExW8L3isMybRL_              │
│ Package Name:  com.yoraapparelsprivatelimit│
│                ed.yoraa                    │
└────────────────────────────────────────────┘
```
Click **"Add"** or **"Save"**

#### 6. Save All Changes
**IMPORTANT:** Click the **"Save"** button at the bottom of the page!

#### 7. Verify Configuration
You should see both platforms listed:
```
Configured platform site keys
┌──────────┬──────────────┬──────────────────────┐
│ Platform │ Name         │ Bundle/Package       │
├──────────┼──────────────┼──────────────────────┤
│ iOS-9    │ yoraa-ios    │ com.yoraaapparel...  │
│ Android  │ yoraa-android│ com.yoraapparel...   │
└──────────┴──────────────┴──────────────────────┘
```

---

## 🚀 Build Commands

### iOS Build:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### Android Build:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## ✅ Testing Checklist

After Firebase Console configuration and rebuilding:

### iOS Testing:
- [ ] App builds successfully
- [ ] Navigate to Phone Login
- [ ] Enter phone number with country code (e.g., +919876543210)
- [ ] NO "reCAPTCHA SDK not linked" error appears
- [ ] OTP is sent successfully
- [ ] Can verify OTP and login

### Android Testing:
- [ ] App builds successfully  
- [ ] Navigate to Phone Login
- [ ] Enter phone number with country code
- [ ] NO reCAPTCHA errors
- [ ] OTP is sent successfully
- [ ] Can verify OTP and login

---

## 🐛 Troubleshooting

### Still Getting "reCAPTCHA SDK not linked" Error?

**Check these:**

1. ✅ **Did you configure in Firebase Console?**
   - Go to Firebase Console → Authentication → Settings
   - Click "Configure site keys"
   - Add both iOS and Android platforms
   - **CLICK SAVE!**

2. ✅ **Are the bundle IDs correct?**
   - iOS: `com.yoraaapparelsprivatelimited.yoraa`
   - Android: `com.yoraapparelsprivatelimited.yoraa`
   - Must match EXACTLY (case-sensitive)

3. ✅ **Did you rebuild the apps?**
   - iOS: Clean pods, reinstall, rebuild
   - Android: Clean gradle, rebuild

4. ✅ **Are the site keys correct?**
   - iOS uses: `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
   - Android uses: `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`
   - Don't swap them!

### Android Build Errors?

**Manifest merger errors:**
- ✅ Fixed by adding `tools:replace="android:appComponentFactory"`
- ✅ Fixed by enabling `android.enableJetifier=true`

**Dependency conflicts:**
- Run: `cd android && ./gradlew clean`
- Then rebuild

### iOS Build Errors?

**Pod install fails:**
```bash
cd ios
pod deintegrate
pod install
```

**Cache issues:**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

---

## 📝 Important Notes

### About reCAPTCHA Verification:

1. **Not Always Visible:** reCAPTCHA challenge only appears when Firebase detects suspicious activity or high SMS volume

2. **Normal Behavior:** Most legitimate users won't see reCAPTCHA - OTP is sent directly

3. **Firebase Controls It:** The SDK handles everything automatically

### About the Keys:

- **Site Keys are NOT in your code** - They're configured server-side in Firebase Console
- **Keys are platform-specific** - iOS key ≠ Android key
- **Bundle IDs must match** - Firebase matches requests by bundle ID

### About Phone Authentication Flow:

```
User enters phone → Firebase checks reCAPTCHA config → 
Validates bundle ID → Checks fraud risk → 
Shows reCAPTCHA (if needed) → Sends OTP
```

---

## 🎯 Current Status

### What's Complete:
- ✅ iOS Info.plist configured with bundle ID URL scheme
- ✅ Android manifest fixed for AndroidX compatibility
- ✅ Gradle configured with Jetifier
- ✅ Firebase SDK properly installed and configured
- ✅ Documentation created

### What YOU Need to Do:
- ⏳ Configure site keys in Firebase Console (CRITICAL!)
- ⏳ Add iOS platform configuration
- ⏳ Add Android platform configuration
- ⏳ Save changes in Firebase Console
- ⏳ Test phone authentication on both platforms

---

## 📚 Reference Documents

Created in your workspace:
- `RECAPTCHA_COMPLETE_SETUP_GUIDE.md` - Detailed setup instructions
- `FIREBASE_CONSOLE_SETUP_VISUAL_GUIDE.md` - Visual step-by-step for Firebase Console
- `RECAPTCHA_KEY_CONFIRMATION.md` - Key verification and troubleshooting
- `RECAPTCHA_FIX_GUIDE.md` - Original fix guide

---

## 🆘 Quick Help

### Commands Cheat Sheet:

```bash
# iOS rebuild
cd ios && rm -rf Pods Podfile.lock && pod install && cd .. && npx react-native run-ios

# Android rebuild  
cd android && ./gradlew clean && cd .. && npx react-native run-android

# Clean everything
watchman watch-del-all && rm -rf node_modules && npm install

# Reset Metro
npx react-native start --reset-cache
```

### Firebase Console Direct Link:
```
https://console.firebase.google.com/project/yoraa-android-ios/authentication/settings
```

---

## ✨ Success Criteria

You'll know everything is working when:

✅ App builds without errors on both platforms
✅ Phone login screen appears
✅ Can enter phone number
✅ NO "reCAPTCHA SDK not linked" error
✅ OTP is sent and received
✅ Can verify OTP and complete login
✅ User is authenticated successfully

---

## 🎉 Final Reminder

**The #1 most important step:**

🔥 **GO TO FIREBASE CONSOLE AND CONFIGURE THE SITE KEYS!** 🔥

Everything else is already done in the code. The error you're seeing is because Firebase can't find the platform configuration for your app's bundle ID.

**URL:** https://console.firebase.google.com/project/yoraa-android-ios/authentication/settings

**What to do:** Click "Configure site keys" → Add iOS platform → Add Android platform → SAVE

That's it! 🚀
