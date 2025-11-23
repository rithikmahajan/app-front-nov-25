# 🔧 Google Sign-In Production Fix Guide

## Problem
Google Sign-In shows `DEVELOPER_ERROR` in production builds but works fine locally.

## Root Cause
The production AAB is signed with a **release keystore** that has a different SHA-1 certificate than the debug keystore. Firebase needs both SHA-1 certificates registered.

---

## ✅ Solution Applied

### 1. Updated `.env.production` with Correct Firebase Keys
```bash
FIREBASE_API_KEY=AIzaSyCIYkTNzIrk_RugNOybriphlQ8aVTJ-KD8
GOOGLE_SIGNIN_WEB_CLIENT_ID=133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

### 2. Updated `googleAuthService.js` to Use Environment Variables
The service now reads the Web Client ID from the environment configuration.

---

## 🔑 Your Certificate Fingerprints

### Debug Certificate (Development)
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Status**: ✅ Already registered in Firebase (1st OAuth client)

### Release Certificate (Production)
- **SHA-1**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- **SHA-256**: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`
- **Status**: ✅ Already registered in Firebase (2nd OAuth client)

---

## 📋 Verification Steps in Firebase Console

### Step 1: Verify SHA-1 Certificates
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **yoraa-android-ios**
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click on your Android app (`com.yoraa`)
6. Under **SHA certificate fingerprints**, verify both certificates are listed:
   - `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (Debug)
   - `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` (Release)

### Step 2: Download Latest google-services.json
If you added any certificates, download the updated `google-services.json`:
1. In Firebase Console, click **Download google-services.json**
2. Replace: `android/app/google-services.json`

### Step 3: Verify OAuth 2.0 Client IDs in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **yoraa-android-ios**
3. Go to **APIs & Services** → **Credentials**
4. Verify you have these OAuth 2.0 Client IDs:
   - **Web client (auto created by Google Service)**: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
   - **Android client (Debug)**: With SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - **Android client (Release)**: With SHA-1 `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`

---

## 🔨 Rebuild Production AAB

After verifying Firebase configuration:

```bash
# Clean previous builds
cd android
./gradlew clean
cd ..

# Build new production AAB
./build-android-production.sh
# Select option: 2 (AAB for Play Store)
```

---

## 🧪 Testing the Fix

### Test Locally First
```bash
# Build release APK for testing
cd android
ENVFILE=../.env.production ./gradlew assembleRelease
cd ..

# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Test Google Sign-In
```

### Upload to Play Console
1. Upload the new AAB to **Internal Testing** track first
2. Test thoroughly before promoting to Production
3. Verify Google Sign-In works in the internal test version

---

## 🚨 Common Issues & Solutions

### Issue 1: Still Getting DEVELOPER_ERROR
**Solution**: Make sure you've registered the **Release SHA-1** in Firebase Console:
- SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`

### Issue 2: Error 10 (Developer Console Mismatch)
**Solution**: Package name must match exactly:
- Firebase: `com.yoraa`
- build.gradle: `com.yoraa`
- Google Cloud Console: `com.yoraa`

### Issue 3: Works in Internal Testing but NOT in Production
**Solution**: Play Store uses a different signing key (Google-managed). Get the SHA-1 from Play Console:
1. Go to **Play Console** → **Release** → **Setup** → **App Integrity**
2. Copy the **SHA-1 certificate fingerprint** under "App signing key certificate"
3. Add this SHA-1 to Firebase Console
4. Download updated `google-services.json`
5. Rebuild and upload new AAB

---

## 📝 Checklist Before Upload

- [ ] Verified both SHA-1 certificates in Firebase Console
- [ ] Updated `.env.production` with correct credentials
- [ ] Downloaded latest `google-services.json` (if updated)
- [ ] Built new AAB with version code 7
- [ ] Tested release APK locally
- [ ] Google Sign-In works in release build
- [ ] Ready to upload to Play Console

---

## 🎯 Next Steps

1. **Verify Firebase Configuration** (see Step 1-3 above)
2. **Rebuild Production AAB** (if needed)
3. **Upload to Internal Testing Track** first
4. **Test thoroughly** before promoting to production
5. **If issue persists**: Check Play Console's App Integrity section for the actual signing certificate SHA-1

---

## 📞 Important Notes

- **Debug builds** use `android/app/debug.keystore` (SHA-1: `5E:8F...F6:25`)
- **Release builds** use `android/app/upload-keystore.jks` (SHA-1: `84:87...7D:2F`)
- **Play Store** may re-sign with its own key (check App Integrity in Play Console)
- All three SHA-1s must be registered in Firebase for Google Sign-In to work everywhere

---

## 🔗 Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Play Console App Integrity](https://play.google.com/console/developers/app/app-integrity)
- [React Native Google Sign-In Docs](https://react-native-google-signin.github.io/docs/android-guide)

---

**Last Updated**: November 19, 2025
**App Version Code**: 7
**Package**: com.yoraa
