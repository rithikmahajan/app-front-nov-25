# 🔥 Firebase Phone Authentication Setup Checklist

## ❌ Current Error
```
[auth/operation-not-allowed] This operation is not allowed. 
You must enable this service in the console.
```

**Root Cause:** Phone authentication provider is disabled in Firebase Console.

---

## ✅ REQUIRED STEPS IN FIREBASE CONSOLE

### 1. Enable Phone Authentication Provider
1. Go to: https://console.firebase.google.com/
2. Select project: **yoraa-android-ios**
3. Navigate to: **Authentication** → **Sign-in method**
4. Find **Phone** in the providers list
5. Click on **Phone**
6. Check the **Enable** toggle
7. Click **Save**

### 2. Verify Firebase Project Settings
- Project ID: `yoraa-android-ios`
- iOS App: Bundle ID `com.yoraaapparelsprivatelimited.yoraa`
- App ID: `1:133733122921:ios:e10be6f1d6b5008735b3f8`

### 3. Add Test Phone Numbers (Recommended for Development)
In **Authentication** → **Sign-in method** → **Phone numbers for testing**:

| Phone Number | Verification Code |
|--------------|------------------|
| +917006114695 | 123456 |
| +919119060487 | 123456 |
| +918717000084 | 123456 |

**Benefits:**
- ✅ No SMS costs during development
- ✅ Instant verification (no waiting for SMS)
- ✅ No reCAPTCHA required
- ✅ Works in simulator/emulator

### 4. Verify SMS Multi-Factor Authentication is DISABLED
- Go to: **Authentication** → **Sign-in method** → **Advanced** section
- Find: **SMS Multi-Factor Authentication**
- Ensure: **Enable** checkbox is **UNCHECKED**
- Status: ❌ Disabled (required for simple phone auth)

---

## 📱 iOS App Configuration (Already Done ✅)

### Info.plist URL Scheme
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>app-1-133733122921-ios-e10be6f1d6b5008735b3f8</string>
        </array>
    </dict>
</array>
```

### GoogleService-Info.plist
- ✅ Latest version (11) copied to `ios/YoraaApp/`
- ✅ Contains correct project credentials
- ✅ Pods installed successfully

### AppDelegate.swift
- ✅ Firebase initialized
- ✅ App Check configured
- ✅ APNS configured for phone auth

---

## 🧪 TESTING STEPS (After Enabling in Console)

### Test with Test Phone Number
1. Enter phone: `+917006114695`
2. Press LOGIN
3. Should receive OTP screen immediately (no SMS sent)
4. Enter OTP: `123456`
5. Should authenticate successfully

### Test with Real Phone Number (Production)
1. Enter your real phone: `+91XXXXXXXXXX`
2. Press LOGIN
3. Should send real SMS with OTP
4. Enter the OTP from SMS
5. Should authenticate successfully

---

## 🚨 Common Issues & Solutions

### Issue 1: "[auth/operation-not-allowed]"
**Cause:** Phone provider not enabled in Firebase Console  
**Fix:** Enable Phone provider in Authentication → Sign-in method

### Issue 2: "[auth/invalid-phone-number]"
**Cause:** Phone number format incorrect  
**Fix:** Ensure format is `+91XXXXXXXXXX` (with country code)

### Issue 3: "[auth/quota-exceeded]"
**Cause:** Too many SMS requests (Firebase free tier limit)  
**Fix:** Use test phone numbers for development

### Issue 4: App crashes on login
**Cause:** Missing URL scheme in Info.plist  
**Fix:** Already added `app-1-133733122921-ios-e10be6f1d6b5008735b3f8`

### Issue 5: "[auth/app-not-authorized]"
**Cause:** Bundle ID mismatch or SHA keys not configured  
**Fix:** Verify bundle ID matches Firebase Console

---

## 📚 Documentation References

- **React Native Firebase Phone Auth:** https://rnfirebase.io/auth/phone-auth
- **Firebase Console:** https://console.firebase.google.com/
- **iOS Setup Guide:** https://rnfirebase.io/auth/phone-auth#ios

---

## 🎯 NEXT STEP

**👉 GO TO FIREBASE CONSOLE NOW AND ENABLE PHONE AUTHENTICATION**

After enabling:
1. Close the app completely
2. Reopen the app
3. Try logging in with `+917006114695`
4. You should see the OTP screen immediately

---

**Last Updated:** October 11, 2025  
**Status:** ⏳ Waiting for Firebase Console configuration
