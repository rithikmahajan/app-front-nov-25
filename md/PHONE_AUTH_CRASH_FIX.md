# 🚨 Firebase Phone Auth Crash Fix

## Problem
The app crashes when trying to send OTP because Firebase Phone Auth on iOS requires App Verification (reCAPTCHA), which tries to present a native UIViewController that conflicts with React Native's architecture.

## Solution: Use Test Phone Numbers (Recommended for Development)

### Step 1: Add Test Phone Numbers in Firebase Console

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your project: **yoraa-android-ios**
3. Click **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Scroll down to **"Phone numbers for testing (optional)"**
6. Click **"Add phone number"**
7. Add these test numbers:

| Phone Number | Verification Code |
|--------------|-------------------|
| +917006114695 | 123456 |
| +919876543210 | 654321 |

8. Click **Save**

### Step 2: Test the App

Now you can test phone authentication WITHOUT sending actual SMS:

1. Open the app
2. Enter: **+91 7006114695** (or just **7006114695**)
3. Click **LOGIN**
4. Enter OTP: **123456**
5. You'll be logged in successfully! ✅

## Alternative Solution: Disable App Verification (Production)

If you need to send real SMS in production:

### Option A: Configure reCAPTCHA Enterprise (Complex)

1. Enable reCAPTCHA Enterprise API in Google Cloud Console
2. Create reCAPTCHA key for iOS
3. Add key to Firebase Console
4. Configure App Attest in Xcode

### Option B: Use Firebase Authentication UI (Simpler)

Install Firebase UI:
```bash
cd ios
pod 'FirebaseUI/Phone Auth'
pod install
```

Then use the pre-built UI which handles reCAPTCHA automatically.

## Current Status

✅ **Working**: Test phone numbers (no SMS sent, instant verification)
❌ **Not Working**: Real phone numbers (requires reCAPTCHA setup)

## Recommended Approach

**For Development**: Use test phone numbers (instant, free, no setup)
**For Production**: Either:
- Set up reCAPTCHA Enterprise properly (complex but secure)
- Use email/password or social login as primary method
- Use phone auth only for account recovery

## Quick Test

```javascript
// Test credentials that work instantly:
Phone: +917006114695
OTP: 123456
```

This bypasses SMS and reCAPTCHA entirely!
