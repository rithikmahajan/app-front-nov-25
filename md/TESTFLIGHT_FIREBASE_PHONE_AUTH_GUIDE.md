# 🚀 TestFlight Firebase Phone Authentication Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Current Configuration Status](#current-configuration-status)
3. [Firebase Console Setup](#firebase-console-setup)
4. [iOS Project Verification](#ios-project-verification)
5. [TestFlight-Specific Configuration](#testflight-specific-configuration)
6. [Build and Deploy Steps](#build-and-deploy-steps)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide ensures your Firebase Phone Authentication is properly configured for **TestFlight** and **Production** builds.

**Your Current Configuration:**
- **Project ID:** `yoraa-android-ios`
- **Bundle ID:** `com.yoraaapparelsprivatelimited.yoraa`
- **GoogleService-Info.plist:** ✅ Located at `ios/YoraaApp/GoogleService-Info.plist`
- **Xcode Project:** `Yoraa.xcodeproj`
- **Target:** `YoraaApp`

---

## ✅ Current Configuration Status

### 1. GoogleService-Info.plist Location
```
✅ ios/YoraaApp/GoogleService-Info.plist
```

**Verified Keys:**
- ✅ `PROJECT_ID`: yoraa-android-ios
- ✅ `BUNDLE_ID`: com.yoraaapparelsprivatelimited.yoraa
- ✅ `CLIENT_ID`: Present
- ✅ `REVERSED_CLIENT_ID`: Present
- ✅ `API_KEY`: Present
- ✅ `GOOGLE_APP_ID`: Present

### 2. Xcode Project Integration
```
✅ GoogleService-Info.plist is referenced in Yoraa.xcodeproj (4 references)
✅ File is added to YoraaApp target
```

### 3. Info.plist URL Scheme
```
✅ REVERSED_CLIENT_ID is configured in CFBundleURLTypes
```

---

## 🔥 Firebase Console Setup

### Step 1: Enable Phone Authentication

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers
   ```

2. **Enable Phone Provider:**
   - Click on **"Phone"** in the Sign-in providers list
   - Toggle the switch to **ENABLE** (should turn blue)
   - Click **"Save"**

   ![Firebase Phone Auth Enable](https://i.imgur.com/example.png)

3. **Verify it's enabled:**
   - The Phone provider should show as **"Enabled"** in the list
   - Status indicator should be green

### Step 2: Verify iOS App Registration

1. **Go to Project Settings:**
   ```
   https://console.firebase.google.com/project/yoraa-android-ios/settings/general
   ```

2. **Check iOS App:**
   - Scroll to "Your apps" section
   - Verify iOS app with bundle ID `com.yoraaapparelsprivatelimited.yoraa` exists
   - Download the GoogleService-Info.plist and compare with your local file

3. **Ensure Production Configuration:**
   - You are using the **production** Firebase project (not dev/staging)
   - The PROJECT_ID matches: `yoraa-android-ios`

### Step 3: Add Test Phone Numbers (Optional for Testing)

1. **Go to Phone Authentication Settings:**
   ```
   https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers
   ```

2. **Add Test Numbers:**
   - Click on **Phone** provider
   - Scroll to **"Phone numbers for testing"**
   - Add test numbers (e.g., +1 650-555-3434 with code 123456)
   - This allows testing without sending real SMS

---

## 📱 iOS Project Verification

### Verification Script

Run the automated verification script:

```bash
chmod +x verify-testflight-firebase-config.sh
./verify-testflight-firebase-config.sh
```

This will check:
- ✅ GoogleService-Info.plist location and content
- ✅ Xcode project integration
- ✅ Info.plist URL schemes
- ✅ Firebase dependencies
- ✅ CocoaPods installation

### Manual Verification in Xcode

1. **Open Xcode Project:**
   ```bash
   cd ios
   open Yoraa.xcworkspace
   ```

2. **Verify GoogleService-Info.plist:**
   - In Xcode, locate `GoogleService-Info.plist` in Project Navigator
   - Check it's under the `YoraaApp` folder
   - Ensure it's checked for the `YoraaApp` target (right-click → Get Info → Target Membership)

3. **Verify Info.plist:**
   - Open `Info.plist`
   - Find `CFBundleURLTypes` → `CFBundleURLSchemes`
   - Verify it contains: `com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92`

4. **Check Build Settings:**
   - Select `YoraaApp` target
   - Go to **Build Settings**
   - Search for "Info.plist"
   - Verify path is correct: `YoraaApp/Info.plist`

---

## 🚢 TestFlight-Specific Configuration

### Important: Production vs Development

**For TestFlight, ensure you're using:**
- ✅ **Production** Firebase project (yoraa-android-ios)
- ✅ **Production** GoogleService-Info.plist
- ✅ **Production** Bundle ID (com.yoraaapparelsprivatelimited.yoraa)

⚠️ **Do NOT use:**
- ❌ Development/Staging Firebase projects
- ❌ Different bundle IDs
- ❌ Test GoogleService-Info.plist files

### APNs Configuration (Required for Phone Auth on iOS)

Phone authentication on iOS requires Apple Push Notification service (APNs):

1. **Upload APNs Key/Certificate to Firebase:**
   ```
   https://console.firebase.google.com/project/yoraa-android-ios/settings/cloudmessaging
   ```

2. **Two Options:**

   **Option A: APNs Auth Key (Recommended)**
   - Generate an APNs Auth Key in Apple Developer Center
   - Upload the `.p8` file to Firebase Console
   - Enter your Team ID and Key ID

   **Option B: APNs Certificate**
   - Generate APNs certificate in Apple Developer Center
   - Upload the `.p12` file to Firebase Console

3. **Why it's needed:**
   - Firebase uses silent push notifications for app verification
   - Without APNs, phone auth will fall back to reCAPTCHA (not ideal for production)

---

## 🏗️ Build and Deploy Steps

### Step 1: Clean Build Environment

```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean build folder in Xcode
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa

# Reinstall pods
pod deintegrate
pod install
```

### Step 2: Clean in Xcode

1. Open Xcode:
   ```bash
   open Yoraa.xcworkspace
   ```

2. Clean Build Folder:
   - Menu: **Product → Clean Build Folder** (⌘⇧K)

### Step 3: Archive for TestFlight

1. **Select Generic iOS Device:**
   - In Xcode, select **Any iOS Device (arm64)** as the build destination

2. **Create Archive:**
   - Menu: **Product → Archive**
   - Wait for the build to complete

3. **Upload to App Store Connect:**
   - Once archive completes, the Organizer window will open
   - Click **Distribute App**
   - Select **App Store Connect**
   - Follow the prompts to upload

### Step 4: Process in App Store Connect

1. **Wait for Processing:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app → TestFlight
   - Wait for the build to process (can take 5-30 minutes)

2. **Add to TestFlight:**
   - Once processed, add the build to your test group
   - Ensure compliance information is filled out

### Step 5: Test with TestFlight

1. **Install via TestFlight:**
   - Install the app on a test device via TestFlight

2. **Test Phone Authentication:**
   - Try logging in with a real phone number
   - Verify OTP is received and works

---

## 🐛 Troubleshooting

### Error: "operation-not-allowed"

**Cause:** Phone authentication is not enabled in Firebase Console

**Solution:**
1. Go to Firebase Console
2. Enable Phone provider as described in [Firebase Console Setup](#firebase-console-setup)
3. Rebuild and re-upload to TestFlight

### Error: "Invalid phone number"

**Cause:** Phone number format is incorrect

**Solution:**
- Ensure phone number includes country code (e.g., +1 for US, +91 for India)
- Format: `+[country_code][number]` (e.g., `+19175551234`)

### Error: "Too many requests"

**Cause:** Firebase rate limiting

**Solution:**
- Wait a few minutes before trying again
- Use test phone numbers in Firebase Console for testing
- Check Firebase Quotas: https://console.firebase.google.com/project/yoraa-android-ios/usage

### Phone Auth Works in Simulator but Not TestFlight

**Cause:** APNs not configured or wrong GoogleService-Info.plist

**Solution:**
1. Verify APNs is configured (see [APNs Configuration](#apns-configuration-required-for-phone-auth-on-ios))
2. Ensure you're using production GoogleService-Info.plist
3. Verify PROJECT_ID matches between local file and Firebase Console
4. Clean build and re-upload to TestFlight

### reCAPTCHA Shows Instead of SMS

**Cause:** APNs not configured properly

**Solution:**
- Configure APNs as described in [APNs Configuration](#apns-configuration-required-for-phone-auth-on-ios)
- For production builds, APNs is required for silent push verification

### Build Succeeds but Phone Auth Still Fails

**Checklist:**
- [ ] Phone auth enabled in Firebase Console
- [ ] Correct GoogleService-Info.plist for production
- [ ] PROJECT_ID matches between local and Firebase Console
- [ ] APNs configured in Firebase Console
- [ ] Bundle ID matches in Xcode and Firebase
- [ ] REVERSED_CLIENT_ID in Info.plist matches GoogleService-Info.plist
- [ ] Clean build performed
- [ ] New build uploaded to TestFlight

---

## 📝 Quick Checklist

Before uploading to TestFlight:

- [ ] Phone authentication enabled in Firebase Console
- [ ] Using production GoogleService-Info.plist
- [ ] PROJECT_ID is `yoraa-android-ios`
- [ ] Bundle ID is `com.yoraaapparelsprivatelimited.yoraa`
- [ ] APNs configured in Firebase Console
- [ ] GoogleService-Info.plist is in Xcode project
- [ ] REVERSED_CLIENT_ID in Info.plist
- [ ] Clean build performed
- [ ] Tested locally in simulator (optional but recommended)
- [ ] New archive created
- [ ] Uploaded to TestFlight

---

## 🔗 Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/yoraa-android-ios
- **Phone Auth Providers:** https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers
- **Project Settings:** https://console.firebase.google.com/project/yoraa-android-ios/settings/general
- **Cloud Messaging (APNs):** https://console.firebase.google.com/project/yoraa-android-ios/settings/cloudmessaging
- **App Store Connect:** https://appstoreconnect.apple.com

---

## 📞 Support

If you continue experiencing issues:

1. Run the verification script:
   ```bash
   ./verify-testflight-firebase-config.sh
   ```

2. Check Firebase logs in console
3. Check Xcode console for detailed error messages
4. Verify all steps in this guide have been completed

---

**Last Updated:** October 11, 2025  
**Project:** Yoraa App  
**Firebase Project:** yoraa-android-ios  
**Bundle ID:** com.yoraaapparelsprivatelimited.yoraa
