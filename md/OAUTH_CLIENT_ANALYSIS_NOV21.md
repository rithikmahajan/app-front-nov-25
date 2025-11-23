# ✅ Google Sign-In OAuth Client Analysis - November 21, 2025

## 📋 EXISTING OAUTH CLIENTS IN GOOGLE CLOUD CONSOLE

Based on your Google Cloud Console, you have **5 OAuth Client IDs**:

### 1. `133733122921-n0djd3la1l160af0l8r3sp1c3pjlic12.apps.googleusercontent.com`
- **Type**: Android (client_type: 1)
- **Certificate Hash**: `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Purpose**: Debug/Development key
- **Status**: ✅ Already in google-services.json

### 2. `133733122921-assk3t2oje8fsm07j1i1u590kn7g2bpg.apps.googleusercontent.com`
- **Type**: Android (client_type: 1)
- **Certificate Hash**: `54b7734caa83ca53d26480b5cb46dc297e0285b1`
- **SHA-1**: `54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1`
- **Purpose**: **App Signing Key (Production)** ⭐
- **Status**: ✅ Already in google-services.json

### 3. `133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c.apps.googleusercontent.com`
- **Type**: Android (client_type: 1)
- **Certificate Hash**: `8487d61de8145729d9869c44753535477de47d2f`
- **SHA-1**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- **Purpose**: **Upload Key** ⭐
- **Status**: ✅ Already in google-services.json

### 4. `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
- **Type**: Web (client_type: 3)
- **Purpose**: **Web Client ID** (used in your React Native code) ⭐
- **Status**: ✅ Already in google-services.json & .env

### 5. `133733122921-cr74erk8tdpgt1akts7juqq0cm44bjda.apps.googleusercontent.com`
- **Type**: Web (client_type: 3)
- **Purpose**: Unknown - possibly another web client or iOS
- **Status**: ✅ In google-services.json (other_platform_oauth_client)

---

## 🎯 DIAGNOSIS: Why DEVELOPER_ERROR is Happening

### The Problem:
Your emulator is using a **debug keystore** that doesn't match any of the registered Android OAuth clients.

### Expected Debug Keystore SHA-1:
The standard Android debug keystore usually has SHA-1:
```
A0:BD:B3:12:CA:E9:83:40:E4:F3:BC:F2:56:62:F3:49:3C:86:7C:25
```

### What You Have Registered:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

This might be a custom debug key or from a different machine.

---

## ✅ SOLUTION

### Option 1: Find Your Current Debug Keystore SHA-1 (Recommended)

Run this command to get your actual debug keystore SHA-1:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

**Then:**

1. **If SHA-1 matches** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`:
   - ✅ You already have the correct OAuth client!
   - The issue is likely **timing** (wait 5-10 min) or **cache**
   - Skip to "Clear Cache & Rebuild" below

2. **If SHA-1 is different**:
   - You need to create a new Android OAuth client
   - Go to Step 2 below

### Option 2: Create New Android OAuth Client for Your Debug Keystore

If your debug keystore SHA-1 doesn't match any registered certificate:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials
   - Project: `yoraa-android-ios`

2. **Click "` CREATE CREDENTIALS"** → **OAuth client ID** → **Android**

3. **Fill in:**
   - **Application type**: Android
   - **Name**: `Android client (Debug - Your Machine)`
   - **Package name**: `com.yoraa`
   - **SHA-1 certificate fingerprint**: [Your actual debug keystore SHA-1]

4. **Click CREATE**

### Option 3: Use an Existing Certificate (Quick Fix)

Instead of creating a new OAuth client, you can **use an existing registered keystore**:

The easiest is to use the **Upload Key** since it's already registered:

```bash
# Copy your upload keystore to debug location
cp android/app/upload-keystore.jks ~/.android/debug.keystore
```

⚠️ **WARNING**: This is a quick fix for testing only. Don't use this for production.

---

## 🔧 CLEAR CACHE & REBUILD

After waiting 5-10 minutes for OAuth client changes to propagate:

```bash
# 1. Clear app data on emulator
$ANDROID_HOME/platform-tools/adb shell pm clear com.yoraa

# 2. Clear React Native cache
npx react-native start --reset-cache &

# 3. Rebuild the app
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 🧪 VERIFICATION SCRIPT

Run this to check your debug keystore:

```bash
#!/bin/bash
echo "Your debug keystore SHA-1:"
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d: -f2-

echo ""
echo "Registered Android OAuth clients in google-services.json:"
echo "1. 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 (Debug)"
echo "2. 54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1 (App Signing)"
echo "3. 84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F (Upload)"
```

---

## 📊 OAUTH CLIENT MAPPING

| Client ID | Type | Certificate/SHA-1 | Purpose | In google-services.json? |
|-----------|------|-------------------|---------|-------------------------|
| `...pjlic12` | Android | `5E:8F:16:06...` | Debug | ✅ Yes |
| `...n7g2bpg` | Android | `54:B7:73:4C...` | **App Signing (Production)** | ✅ Yes |
| `...hkvknb9c` | Android | `84:87:D6:1D...` | **Upload Key** | ✅ Yes |
| `...o8ukkk` | Web | N/A | **Web Client (for code)** | ✅ Yes |
| `...m44bjda` | Web | N/A | Web/Other | ✅ Yes |

---

## 🎯 QUICK FIX STEPS

### If you want Google Sign-In to work RIGHT NOW on emulator:

```bash
# Step 1: Get your debug keystore SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA1:"

# Step 2: Compare with registered certificates
# If it matches 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
#   → Wait 5-10 minutes for propagation
#   → Clear app data: adb shell pm clear com.yoraa
#   → Rebuild: npx react-native run-android

# If it doesn't match any:
#   → Go to Google Cloud Console
#   → Create new Android OAuth client with your SHA-1
#   → Wait 5-10 minutes
#   → Clear app data and rebuild
```

---

## ✅ EXPECTED BEHAVIOR AFTER FIX

1. **On Emulator/Debug:**
   - Click Google Sign-In button
   - See Google account picker
   - Select account
   - ✅ Sign in successfully

2. **On Production (Play Store):**
   - Click Google Sign-In button
   - See Google account picker
   - Select account
   - ✅ Sign in successfully (uses App Signing Key OAuth client)

---

## 🔍 TROUBLESHOOTING

### Still Getting DEVELOPER_ERROR?

1. **Check package name is exactly**: `com.yoraa`
   ```bash
   grep 'package=' android/app/src/main/AndroidManifest.xml
   ```

2. **Verify Web Client ID in code**:
   ```bash
   grep 'GOOGLE_SIGNIN_WEB_CLIENT_ID' .env
   ```
   Should be: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`

3. **Check Google Play Services on emulator**:
   ```bash
   adb shell dumpsys package com.google.android.gms | grep version
   ```

4. **Enable verbose logging**:
   Add to `googleAuthService.js`:
   ```javascript
   GoogleSignin.configure({
     webClientId: '133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com',
     offlineAccess: true,
     forceCodeForRefreshToken: true,
   });
   
   // Then check logs
   console.log('Google Sign-In configured with:', await GoogleSignin.getTokens());
   ```

---

## 📝 SUMMARY

### You Already Have:
- ✅ Web Client ID (for code)
- ✅ Android OAuth client for App Signing Key (production)
- ✅ Android OAuth client for Upload Key (internal testing)
- ✅ Android OAuth client for a debug key (SHA-1: `5E:8F:16:06...`)

### You Might Need:
- ⚠️ Android OAuth client for YOUR CURRENT debug keystore (if different from `5E:8F:16:06...`)

### Next Action:
1. Run the command below to get your debug keystore SHA-1
2. If it matches `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` → just wait & rebuild
3. If different → create new Android OAuth client with your SHA-1

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA1:"
```

---

**Last Updated**: November 21, 2025
**Status**: ✅ All OAuth clients exist - Need to verify debug keystore match
**Next Step**: Check if your debug keystore SHA-1 matches `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
