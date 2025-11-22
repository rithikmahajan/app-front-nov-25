# 🔐 Google Play App Signing Certificates - November 21, 2025

## 📋 IMPORTANT: Two Different Certificates

Google Play uses **TWO different certificates** for your app:

### 1. **App Signing Key** (Google-managed) - Use for API Registration
This is the certificate that Google uses to sign your app when users download it from Play Store.
**This is what you should register with Firebase, Google Sign-In, and other API providers.**

### 2. **Upload Key** (You manage) - Use for Uploading APK/AAB
This is the certificate you use to sign your app before uploading to Play Console.

---

## 🎯 YOUR CERTIFICATES FROM GOOGLE PLAY CONSOLE

### App Signing Key Certificate (Google-managed)
**These are the certificates users see when they download your app:**

- **SHA-1**: `54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1`
- **SHA-256**: `E8:FB:67:B8:8C:FB:D5:BC:0C:CD:0A:59:F1:97:7B:28:A1:52:F2:A9:41:B8:16:99:88:D9:FB:FC:C4:39:45:8A`
- **MD5**: `12:91:AF:2A:A2:E0:99:5F:AE:FB:BD:7E:32:56:AA:05`

### Upload Key Certificate (Your keystore)
**These are from your `upload-keystore.jks`:**

- **SHA-1**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- **SHA-256**: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`
- **MD5**: `C4:49:C2:D3:E6:93:72:32:BE:ED:36:1A:1B:79:C2:04`

---

## ✅ STEP-BY-STEP: Add App Signing Certificates to Firebase

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Select project: **yoraa-android-ios**
3. Click **Settings** ⚙️ → **Project settings**

### Step 2: Find Your Android App

1. Scroll down to "Your apps"
2. Find the Android app with package name: `com.yoraa`
3. You'll see "SHA certificate fingerprints" section

### Step 3: Add App Signing Key SHA-1

**Click "Add fingerprint"** and add:
```
54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1
```

### Step 4: Add App Signing Key SHA-256

**Click "Add fingerprint"** again and add:
```
E8:FB:67:B8:8C:FB:D5:BC:0C:CD:0A:59:F1:97:7B:28:A1:52:F2:A9:41:B8:16:99:88:D9:FB:FC:C4:39:45:8A
```

### Step 5: Verify Upload Key is Already Added

Check that these are already in Firebase (they should be from your previous setup):
- ✅ SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- ✅ SHA-256: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`

### Step 6: Download Updated google-services.json

1. After adding the fingerprints, download the new `google-services.json`
2. Replace the file at: `android/app/google-services.json`

---

## 🔑 STEP-BY-STEP: Add App Signing Certificate to Google Cloud Console (for Google Sign-In)

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Select project: **yoraa-android-ios** (or the project linked to your app)
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your Android OAuth Client

Look for an OAuth 2.0 Client ID with:
- Type: **Android**
- Package name: `com.yoraa`
- SHA-1: `8487d61de8145729d9869c44753535477de47d2f` (your upload key)

### Step 3: Create New OAuth Client for App Signing Key

Click **"+ CREATE CREDENTIALS"** → **OAuth client ID** → **Android**

Fill in:
- **Name**: `Android client (App Signing Key)`
- **Package name**: `com.yoraa`
- **SHA-1 certificate fingerprint**: `54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1`

Click **CREATE**.

### Step 4: Keep Both OAuth Clients

You should now have **TWO** Android OAuth clients:
1. **Upload Key** OAuth client (for testing/debug)
   - SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
2. **App Signing Key** OAuth client (for production)
   - SHA-1: `54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1`

### Step 5: Get Web Client ID

Make sure you have a **Web client** OAuth ID for Google Sign-In:
- Look for OAuth 2.0 Client ID with Type: **Web application**
- Copy the **Client ID** (should look like `133733122921-xxxxx.apps.googleusercontent.com`)

---

## 📱 UPDATE YOUR CODE

### Update google-services.json

After Step 6 above, you should have a new `google-services.json` that includes both certificates.

### Verify Your Google Sign-In Configuration

Your current config in `google-services.json` shows:
```json
{
  "client_id": "133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c.apps.googleusercontent.com",
  "client_type": 1,
  "android_info": {
    "package_name": "com.yoraa",
    "certificate_hash": "8487d61de8145729d9869c44753535477de47d2f"
  }
}
```

This will be automatically updated when you download the new `google-services.json`.

---

## 🧪 TESTING

### For Phone Authentication (Firebase)

After adding the App Signing Key certificates:

1. **Internal Testing Track**: Should work immediately
2. **Production**: Should work for all users downloading from Play Store

### For Google Sign-In

After creating the OAuth client:

1. **Build and upload a new version**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Upload to Play Console** (Internal Testing first)

3. **Test on a device** that downloads from Play Store

---

## ⚠️ IMPORTANT NOTES

### Why Two Certificates?

- **Upload Key**: You use this to sign the AAB/APK before uploading to Play Console
- **App Signing Key**: Google re-signs your app with this before distributing to users

### Which Certificate to Register?

For **production apps on Play Store**, you MUST register:
- ✅ **App Signing Key** (the one Google uses)
- ✅ **Upload Key** (optional, but good for testing)

### Google Sign-In Requirement

Google Sign-In requires:
- Android OAuth client with **App Signing Key SHA-1**
- Web OAuth client ID in your app code

---

## 📝 CHECKLIST

- [x] Add App Signing SHA-1 to Firebase Console ✅ **COMPLETED Nov 21**
- [x] Add App Signing SHA-256 to Firebase Console ✅ **COMPLETED Nov 21**
- [x] Verify Upload Key certificates are in Firebase ✅ **COMPLETED Nov 21**
- [x] Download new google-services.json ✅ **COMPLETED Nov 21**
- [x] Replace android/app/google-services.json ✅ **COMPLETED Nov 21**
- [ ] Create OAuth client in Google Cloud with App Signing SHA-1 ⚠️ **PENDING**
- [x] Verify Web OAuth client exists ✅ **COMPLETED Nov 21**
- [ ] Build new release
- [ ] Test Phone Auth in production
- [ ] Test Google Sign-In in production

---

## 🆘 TROUBLESHOOTING

### Phone Auth Still Fails

```
[auth/app-not-authorized] This app is not authorized to use Firebase Authentication.
```

**Solution**: Make sure you added **both** SHA-1 AND SHA-256 of the App Signing Key.

### Google Sign-In Shows "Developer Error"

```
[GoogleSignIn] Developer error
```

**Solution**: Create Android OAuth client with App Signing Key SHA-1 in Google Cloud Console.

### "Invalid SHA-1" Error

**Solution**: Make sure you're using the SHA-1 from **App Signing Key**, not Upload Key, for production.

---

## 📚 REFERENCES

- Google Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Firebase SHA Fingerprints: https://support.google.com/firebase/answer/9137403
- Google Sign-In Setup: https://developers.google.com/identity/sign-in/android/start-integrating

---

**Last Updated**: November 21, 2025
**Status**: ✅ Firebase Updated | ⚠️ Google Cloud OAuth Pending

---

## ✅ UPDATE LOG

**November 21, 2025 - 2:30 PM**
- ✅ Added App Signing Key SHA-1 to Firebase Console
- ✅ Added App Signing Key SHA-256 to Firebase Console (auto-added)
- ✅ Downloaded new google-services.json
- ✅ Replaced android/app/google-services.json
- ⚠️ **Next**: Create Android OAuth client in Google Cloud Console
