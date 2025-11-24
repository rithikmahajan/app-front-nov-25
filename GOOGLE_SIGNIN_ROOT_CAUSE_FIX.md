# 🚨 Google Sign-In DEVELOPER_ERROR - Root Cause Analysis & Fix

## Problem Identified
You're getting `DEVELOPER_ERROR` even after:
- ✅ Adding SHA-1 certificates to Firebase
- ✅ Updating google-services.json
- ✅ Rebuilding the APK

This means the issue is NOT with Firebase, but with **Google Cloud Console OAuth configuration**.

---

## 🔍 Root Cause

The `DEVELOPER_ERROR` happens when:
1. **OAuth Client is missing** in Google Cloud Console
2. **Package name mismatch** in OAuth client
3. **SHA-1 not registered** in the OAuth client (not just Firebase)

Firebase Console only creates the **Web Client ID**, but you also need an **Android OAuth Client** for each SHA-1 certificate.

---

## ✅ SOLUTION: Manually Create Android OAuth Clients

### Step 1: Go to Google Cloud Console

1. **Open**: https://console.cloud.google.com/apis/credentials?project=yoraa-android-ios
2. **Click**: "Create Credentials" → "OAuth 2.0 Client ID"

### Step 2: Create Android OAuth Client for RELEASE Certificate

**Client Type**: Android

**Configuration:**
- **Application type**: Android
- **Name**: `YORAA Android (Release)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`

**Click "Create"**

### Step 3: Create Android OAuth Client for DEBUG Certificate

**Client Type**: Android

**Configuration:**
- **Application type**: Android
- **Name**: `YORAA Android (Debug)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**Click "Create"**

### Step 4: Verify OAuth Clients Were Created

After creating, you should see:
1. ✅ **Web client** (already exists): `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
2. ✅ **Android client (Release)**: Package `com.yoraa`, SHA-1 `84:87...`
3. ✅ **Android client (Debug)**: Package `com.yoraa`, SHA-1 `5E:8F...`

---

## 🎯 Alternative: Use Firebase to Auto-Create OAuth Clients

### Option A: Delete and Re-add SHA-1 in Firebase

Sometimes Firebase doesn't automatically create the OAuth client. Try this:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/yoraa-android-ios/settings/general/android:com.yoraa
2. **Remove both SHA-1 certificates** (click X next to each)
3. **Click "Save"**
4. **Wait 2 minutes**
5. **Add them back**:
   - `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
6. **Download new google-services.json**
7. **Replace** `android/app/google-services.json`
8. **Rebuild APK**

---

## 🔧 Debugging: Check Current OAuth Clients

### Check What OAuth Clients Exist

1. Go to: https://console.cloud.google.com/apis/credentials?project=yoraa-android-ios
2. Look for OAuth 2.0 Client IDs
3. **You MUST have**:
   - 1 Web client (type 3)
   - 2 Android clients (type 1) - one for each SHA-1

### Expected OAuth Clients

Based on your `google-services.json`, you should have:

```json
// Web Client (type 3)
"client_id": "133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com"

// Android Client for Release (type 1)
"client_id": "133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c.apps.googleusercontent.com"
"certificate_hash": "8487d61de8145729d9869c44753535477de47d2f"

// Android Client for Debug (type 1)  
"client_id": "133733122921-d2pkd5k046e4isoiulnrsf8m6mj38j4p.apps.googleusercontent.com"
"certificate_hash": "5e8f16062ea3cd2c4a0d547876baa6f38cabf625"
```

---

## ⚠️ Common Issues

### Issue 1: OAuth Clients Not Created Automatically

**Symptom**: SHA-1 added to Firebase but Google Sign-In still fails

**Solution**: Manually create OAuth clients in Google Cloud Console (see Step 1-3 above)

### Issue 2: Package Name Mismatch

**Check**: Ensure OAuth client package is `com.yoraa` (not `com.yoraapparelsprivatelimited.yoraa`)

**Fix**: Edit OAuth client in Google Cloud Console, change package name

### Issue 3: Wrong Web Client ID

**Check**: Make sure you're using the Web Client ID (type 3), not Android client ID

**Your correct Web Client ID**:
```
133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

---

## 📋 Complete Checklist

### In Firebase Console
- [ ] SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` added
- [ ] SHA-1 `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` added
- [ ] Downloaded latest google-services.json

### In Google Cloud Console
- [ ] Web OAuth client exists (type 3)
- [ ] Android OAuth client for Debug SHA-1 exists
- [ ] Android OAuth client for Release SHA-1 exists
- [ ] All OAuth clients have package name: `com.yoraa`
- [ ] All OAuth clients are ENABLED (not restricted)

### In Your App
- [ ] google-services.json updated in `android/app/`
- [ ] Web Client ID in `.env.production` is correct
- [ ] APK rebuilt with updated configuration
- [ ] Old app uninstalled before testing

---

## 🎯 Quick Fix Commands

### Rebuild Fresh APK
```bash
cd android
ENVFILE=../.env.production ./gradlew clean assembleRelease
cd ..
```

### Install on Device
```bash
# Uninstall old version
adb uninstall com.yoraa

# Install fresh build
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Check Logcat for Errors
```bash
adb logcat | grep -i "google\|oauth\|signin"
```

---

## 🔑 Your Certificate Reference

**Debug Keystore (Development)**
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Keystore: `android/app/debug.keystore`
- Alias: `androiddebugkey`
- Password: `android`

**Release Keystore (Production)**
- SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- Keystore: `android/app/upload-keystore.jks`
- Alias: `upload-key`
- Password: `upload123`

**Web Client ID (for both)**
```
133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

---

## 💡 Most Likely Solution

Based on your error, the most likely issue is:

**Missing Android OAuth Client in Google Cloud Console**

Firebase only creates the Web Client automatically. You need to **manually create Android OAuth clients** in Google Cloud Console for each SHA-1 certificate.

**Action**: Follow Steps 1-3 above to create the OAuth clients.

---

## 📞 Final Verification

After creating OAuth clients:

1. **Wait 5 minutes** for changes to propagate
2. **Rebuild APK**:
   ```bash
   cd android && ENVFILE=../.env.production ./gradlew clean assembleRelease && cd ..
   ```
3. **Uninstall old app**: `adb uninstall com.yoraa`
4. **Install fresh app**: `adb install android/app/build/outputs/apk/release/app-release.apk`
5. **Test Google Sign-In** - it should work now! ✅

---

**Last Updated**: November 19, 2025  
**Status**: Needs OAuth clients created in Google Cloud Console
