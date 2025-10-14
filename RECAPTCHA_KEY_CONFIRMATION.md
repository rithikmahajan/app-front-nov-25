# ✅ reCAPTCHA Key Configuration Confirmation

## Your Question: Is `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt` being used?

### Answer: **YES, but it needs to be configured in Firebase Console**

## 🔑 Your reCAPTCHA Keys

**iOS Site Key:** `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
**Android Site Key:** `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

## 📱 Your App Bundle Identifiers

**iOS Bundle ID:** `com.yoraaapparelsprivatelimited.yoraa`
**Android Package Name:** `com.yoraapparelsprivatelimited.yoraa`

## ⚠️ CRITICAL: There's a Mismatch!

Notice the difference:
- **iOS:** `yoraa**a**pparelsprivatelimited` (has double 'a')
- **Android:** `yoraa**p**parelsprivatelimited` (single 'a')

This could cause issues! You need to decide which one is correct.

## 🎯 How reCAPTCHA Works with Firebase Phone Auth

### Important Understanding:
1. **You DON'T add these keys to your React Native code**
2. **Firebase SDK handles reCAPTCHA automatically**
3. **Keys are configured ONLY in Firebase Console**
4. **The keys you provided are used by Firebase's backend servers**

### The Flow:
```
User enters phone number in app
        ↓
App calls: auth().signInWithPhoneNumber(phoneNumber)
        ↓
Firebase SDK communicates with Firebase servers
        ↓
Firebase checks reCAPTCHA configuration in Console
        ↓
Firebase uses the site keys you configured
        ↓
reCAPTCHA verification happens (if enabled)
        ↓
SMS OTP is sent
```

## 📋 What You MUST Do in Firebase Console

### Step 1: Go to Firebase Console
Navigate to: **Authentication → Settings → reCAPTCHA**

### Step 2: Click "Configure site keys"
(You can see this button in your screenshot)

### Step 3: Add iOS Platform

```
┌─────────────────────────────────────────────────────┐
│ Platform Type:  iOS-9                               │
│ Name:           yoraa-ios                           │
│ Site Key:       6Lc5t-UrAAAAANbZi1nLmgC8E426zp-     │
│                 gF5CKLIkt                           │
│ Bundle ID:      com.yoraaapparelsprivatelimited.    │
│                 yoraa                               │
└─────────────────────────────────────────────────────┘
```

### Step 4: Add Android Platform

```
┌─────────────────────────────────────────────────────┐
│ Platform Type:  Android                             │
│ Name:           yoraa-android                       │
│ Site Key:       6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3    │
│                 isMybRL_                            │
│ Package Name:   com.yoraapparelsprivatelimited.     │
│                 yoraa                               │
└─────────────────────────────────────────────────────┘
```

## ⚠️ IMPORTANT: Fix the Bundle ID Mismatch

You have different bundle identifiers:

**Option 1: Use the iOS version everywhere**
- Change Android package to: `com.yoraaapparelsprivatelimited.yoraa`
- Update in: `android/app/build.gradle`
- Update in: Firebase Console Android platform config

**Option 2: Use the Android version everywhere**
- Change iOS bundle to: `com.yoraapparelsprivatelimited.yoraa`
- Update in: Xcode project settings
- Update in: Firebase Console iOS platform config

**Recommended:** Check which one is registered in Google Play Store / App Store and use that.

## ✅ Current Status

### What I've Fixed:
- [x] Added bundle ID URL scheme to `ios/YoraaApp/Info.plist`
- [x] Verified Firebase configuration files are correct
- [x] Created rebuild scripts

### What YOU Need to Do:
- [ ] **Fix the bundle ID mismatch between iOS and Android**
- [ ] **Configure the site keys in Firebase Console** (click "Configure site keys" button)
- [ ] Add iOS platform with key `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- [ ] Add Android platform with key `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`
- [ ] Rebuild iOS app
- [ ] Test phone authentication

## 🔍 Verification

After configuring in Firebase Console, the keys will be used automatically by Firebase SDK when:
- User attempts phone authentication
- Firebase checks if reCAPTCHA is required
- Firebase validates the request against the configured platforms

## 🚀 Next Steps

1. **First:** Decide on the correct bundle ID and fix the mismatch
2. **Second:** Configure the site keys in Firebase Console (screenshot shows where)
3. **Third:** Run the rebuild script:
   ```bash
   chmod +x rebuild-ios.sh
   ./rebuild-ios.sh
   ```
4. **Fourth:** Test the phone authentication

## 📞 How to Test

1. Open the app
2. Go to Login → Phone
3. Enter a test phone number
4. You should NOT see the reCAPTCHA error anymore
5. OTP should be sent successfully

## 🐛 If You Still Get the Error

The error `[auth/unknown] The reCAPTCHA SDK is not linked to your app` means:
- Firebase Console configuration is incomplete, OR
- The bundle ID in Firebase doesn't match your app, OR
- The URL scheme in Info.plist is missing (✅ Fixed)

Make sure ALL three are correct!

## Summary

**Q: Is `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt` being used?**

**A:** It WILL BE used by Firebase once you configure it in Firebase Console. It's not in your code, it's in Firebase's backend configuration. The keys are already generated (you showed them in the screenshot), but you need to click "Configure site keys" and add the platform configurations with these keys.
