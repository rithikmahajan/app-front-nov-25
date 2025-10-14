# 🔥 CRITICAL: Update GoogleService-Info.plist After Enabling Phone Auth

## ⚠️ Current Issue
You just enabled Phone Authentication in Firebase Console, but your iOS app is still using the **OLD GoogleService-Info.plist** that was downloaded BEFORE phone auth was enabled.

**This is why you're still getting the error!**

---

## ✅ REQUIRED STEPS (DO THIS NOW)

### Step 1: Download Updated GoogleService-Info.plist

1. **Go to Firebase Console:** https://console.firebase.google.com/project/yoraa-android-ios/settings/general

2. **Scroll down** to "Your apps" section

3. **Find your iOS app:**
   - Bundle ID: `com.yoraaapparelsprivatelimited.yoraa`
   - App ID: `1:133733122921:ios:e10be6f1d6b5008735b3f8`

4. **Click the "GoogleService-Info.plist" button** to download

5. The file will download to your **Downloads folder**

---

### Step 2: Tell Me When Downloaded

After downloading, tell me the filename (e.g., "GoogleService-Info (12).plist") and I'll update it in your app automatically.

**Or run this command:**

```bash
# Replace XX with the actual number from your Downloads
cp ~/Downloads/GoogleService-Info\ \(XX\).plist ~/Desktop/oct-7-appfront-main/ios/YoraaApp/GoogleService-Info.plist
```

---

### Step 3: Rebuild the App

After updating the plist file:

```bash
cd ~/Desktop/oct-7-appfront-main
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## 🎯 Why This Is Needed

Firebase configuration files (GoogleService-Info.plist for iOS) contain:
- ✅ Enabled authentication providers
- ✅ API keys
- ✅ Project configuration
- ✅ App-specific settings

When you **enable a new authentication method** (like Phone Auth) in Firebase Console, the configuration changes. You MUST download a fresh GoogleService-Info.plist to get the updated settings.

---

## 🔍 Verification

After updating and rebuilding, the app should:
1. ✅ No longer show "[auth/operation-not-allowed]" error
2. ✅ Accept test phone number: `+917006114695`
3. ✅ Show OTP verification screen immediately
4. ✅ Accept test OTP: `123456`
5. ✅ Successfully authenticate

---

**📥 DOWNLOAD THE FILE NOW!**
