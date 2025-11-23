# 🔧 Google Sign-In DEVELOPER_ERROR Fix - November 21, 2025

## 🚨 ERROR
```
Google Sign In Error
Google Sign In failed on Android. DEVELOPER_ERROR. Follow troubleshooting instructions at
https://react-native-google-signin.github.io/docs/troubleshooting
```

## 🎯 ROOT CAUSE

The `DEVELOPER_ERROR` occurs because Google Sign-In requires an **Android OAuth 2.0 Client ID** in Google Cloud Console that matches your app's certificate fingerprint.

### Current Situation:
- ✅ Web Client ID is configured: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
- ❌ No Android OAuth client for your debug/emulator certificate
- ❌ No Android OAuth client for App Signing Key (production)

---

## ✅ SOLUTION - Step by Step

### Step 1: Identify Your Current Certificate

Since you're testing on **emulator**, we need to check which certificate is being used:

```bash
# Get debug keystore SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

Expected output (debug certificate):
```
SHA1: A0:BD:B3:12:CA:E9:83:40:E4:F3:BC:F2:56:62:F3:49:3C:86:7C:25
```

### Step 2: Go to Google Cloud Console

1. **Open Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials
   - **Project**: Select `yoraa-android-ios` (Project ID: 133733122921)

2. **Check Existing Android OAuth Clients**:
   - Look for any existing Android OAuth clients
   - You should see clients with:
     - Upload Key: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
     - Debug Key: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### Step 3: Create Missing Android OAuth Clients

You need to create **THREE** Android OAuth clients (if not already created):

#### A. Debug Keystore (for Emulator/Local Development)

Click **"+ CREATE CREDENTIALS"** → **OAuth client ID** → **Android**

Fill in:
- **Name**: `Android client (Debug)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: 
  ```
  A0:BD:B3:12:CA:E9:83:40:E4:F3:BC:F2:56:62:F3:49:3C:86:7C:25
  ```
  *(or whatever your debug keystore SHA-1 is)*

Click **CREATE**.

#### B. Upload Keystore (for Internal Testing)

Click **"+ CREATE CREDENTIALS"** → **OAuth client ID** → **Android**

Fill in:
- **Name**: `Android client (Upload Key)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: 
  ```
  84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
  ```

Click **CREATE**.

#### C. App Signing Key (for Production)

Click **"+ CREATE CREDENTIALS"** → **OAuth client ID** → **Android**

Fill in:
- **Name**: `Android client (App Signing Key - Production)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: 
  ```
  54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1
  ```

Click **CREATE**.

### Step 4: Verify Web Client Exists

Make sure you have a **Web application** OAuth client:
- Type: **Web application**
- Client ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`

This is the one used in your app code (webClientId).

---

## 🔧 UPDATE YOUR CODE (Optional - Already Correct)

Your current `.env` file has:
```env
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id
```

Update it to:
```env
GOOGLE_SIGNIN_WEB_CLIENT_ID=133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

But actually, your code already has the correct fallback:
```javascript
const webClientId = Config.GOOGLE_SIGNIN_WEB_CLIENT_ID || 
                   '133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com';
```

So this is already working correctly! ✅

---

## 🧪 TESTING AFTER FIX

### 1. Wait for OAuth Client Activation
After creating OAuth clients in Google Cloud Console, wait **5-10 minutes** for propagation.

### 2. Rebuild the App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3. Test Google Sign-In
1. Open the app on emulator
2. Click "Log into your account"
3. Click the Google (G) icon
4. Should see Google account picker
5. Select an account
6. Should sign in successfully ✅

---

## 🔍 VERIFICATION CHECKLIST

### In Google Cloud Console:
- [ ] Web OAuth client exists (client_type: 3)
  - Client ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
  
- [ ] Android OAuth client for Debug exists
  - Package: `com.yoraa`
  - SHA-1: Your debug keystore SHA-1
  
- [ ] Android OAuth client for Upload Key exists
  - Package: `com.yoraa`
  - SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
  
- [ ] Android OAuth client for App Signing Key exists
  - Package: `com.yoraa`
  - SHA-1: `54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1`

### In Firebase Console:
- [x] google-services.json updated ✅
- [x] All SHA fingerprints added ✅
- [x] Firebase Authentication enabled ✅

---

## 📊 Certificate Matrix

| Environment | Certificate Type | SHA-1 | Firebase | Google Cloud OAuth | 
|------------|------------------|-------|----------|-------------------|
| **Debug/Emulator** | Debug Keystore | `A0:BD:B3:12:...` | ✅ Auto | ⚠️ **Need to Create** |
| **Internal Testing** | Upload Key | `84:87:D6:1D...` | ✅ Added | ⚠️ **Need to Create** |
| **Production** | App Signing Key | `54:B7:73:4C...` | ✅ Added | ⚠️ **Need to Create** |

---

## 🆘 TROUBLESHOOTING

### Still Getting DEVELOPER_ERROR After Creating OAuth Clients?

1. **Wait 5-10 minutes** for Google's servers to propagate the changes

2. **Clear app data** on emulator:
   ```bash
   $ANDROID_HOME/platform-tools/adb shell pm clear com.yoraa
   ```

3. **Rebuild the app**:
   ```bash
   cd android && ./gradlew clean && cd .. && npx react-native run-android
   ```

4. **Verify package name** matches exactly: `com.yoraa`

5. **Check SHA-1** is correct for your keystore

### How to Get Debug Keystore SHA-1

Default location:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line starting with `SHA1:` and copy that fingerprint.

### Wrong Package Name?

Make sure `package="com.yoraa"` in:
- `android/app/src/main/AndroidManifest.xml`
- Google Cloud OAuth clients
- Firebase console

---

## 🎯 QUICK FIX SUMMARY

**The DEVELOPER_ERROR means:**
> "I found your Web Client ID, but I can't find an Android OAuth client that matches your app's certificate fingerprint."

**To fix:**
1. Go to Google Cloud Console
2. Create Android OAuth clients for all three certificates (debug, upload, app signing)
3. Wait 5-10 minutes
4. Clear app data and rebuild
5. Test Google Sign-In ✅

---

## 📱 WHAT EACH OAUTH CLIENT DOES

### Web Client ID (Type 3)
- Used by your React Native app code
- Required for `GoogleSignin.configure({ webClientId })`
- Already configured: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com` ✅

### Android Client ID (Type 1)
- **NOT used directly in your code**
- Google automatically matches it based on:
  - Package name (`com.yoraa`)
  - Certificate SHA-1 fingerprint
- **You need one for EACH certificate** (debug, upload, production)

---

## 📚 REFERENCES

- Google Sign-In Troubleshooting: https://react-native-google-signin.github.io/docs/troubleshooting
- OAuth Client Setup: https://developers.google.com/identity/sign-in/android/start-integrating
- App Signing Guide: `GOOGLE_PLAY_APP_SIGNING_CERTIFICATES_NOV21.md`

---

**Last Updated**: November 21, 2025
**Status**: ⚠️ ACTION REQUIRED - Create Android OAuth clients in Google Cloud Console
**Next Step**: Go to https://console.cloud.google.com/apis/credentials
