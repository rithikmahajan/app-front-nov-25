# 🔥 FIREBASE PHONE AUTH PRODUCTION FIX - SHA-256 Missing

## 🚨 PROBLEM
Your app is working fine in **debug builds** but failing with this error in **production/release builds** on the Play Store:

```
[auth/app-not-authorized] This app is not authorized to use Firebase Authentication.
Please verify that the correct package name, SHA-1, and SHA-256 are configured in the Firebase Console.
A play_integrity_token was passed, but no matching SHA-256 was registered in the Firebase console.
```

## 🎯 ROOT CAUSE
Your **production keystore** (upload-keystore.jks) SHA certificates are **NOT registered** in Firebase Console.

Firebase currently has these certificates registered (from your screenshot):
- ✅ SHA-1: `5D:8F:15:D5:2E:E3:C2:E2:46:B3:54:75:9C:F5:7B:91:3B:1E`
- ✅ SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` 
- ✅ SHA-256: `FA:D6:17:45:0C:B9:D5:7B:6F:6E:BE:7A:9C:2B:3B:9F:73:4B:7B:BA:6F:B9:0B:83:92:60:75:91:0B:3D:0E`
- ✅ SHA-256: (another one)

But your **PRODUCTION KEYSTORE** has these certificates (NOT YET REGISTERED):
- ❌ **SHA-1**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- ❌ **SHA-256**: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`

## ✅ SOLUTION

### Step 1: Copy These Certificates

**Production SHA-1:**
```
84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
```

**Production SHA-256:**
```
99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3
```

### Step 2: Add to Firebase Console

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select project: **yoraa-android-ios**
   - Click on **Settings** ⚙️ (gear icon) → **Project settings**

2. **Navigate to your Android app:**
   - Scroll down to "Your apps"
   - Find the Android app with package name: `com.yoraa`
   - Click on it to expand

3. **Add SHA-1 Certificate:**
   - Click the **"Add fingerprint"** button
   - Paste: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
   - Click **Save**

4. **Add SHA-256 Certificate:**
   - Click **"Add fingerprint"** button again
   - Paste: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`
   - Click **Save**

### Step 3: Download Updated google-services.json

1. After adding the fingerprints, click **"Download google-services.json"**
2. Replace the existing file at: `android/app/google-services.json`
3. Commit this change to your repository

### Step 4: Wait for Propagation

⏰ **Wait 5-10 minutes** for Firebase to propagate the changes across their servers.

### Step 5: Rebuild Production App

```bash
# Clean previous builds
cd android
./gradlew clean
cd ..

# Build new release AAB
cd android
./gradlew bundleRelease
cd ..
```

Your new production build will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 6: Test

1. Upload the new AAB to Google Play Console (Internal Testing or Production)
2. Download and test the app
3. Try phone authentication - it should work now! ✅

## 📋 VERIFICATION CHECKLIST

After completing the above steps, verify:

- [ ] SHA-1 `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` is in Firebase Console
- [ ] SHA-256 `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3` is in Firebase Console
- [ ] Downloaded latest `google-services.json` and replaced in project
- [ ] Waited 5-10 minutes for propagation
- [ ] Built new production AAB with `./gradlew bundleRelease`
- [ ] Uploaded new build to Play Console
- [ ] Tested phone authentication in production

## 🔍 WHY THIS HAPPENED

**Debug keystore** (used during development):
- Located at: `android/app/debug.keystore`
- Certificates were already registered in Firebase
- Phone auth works fine in debug builds

**Production keystore** (used for Play Store releases):
- Located at: `app/app/upload-keystore.jks`
- Certificates were NOT registered in Firebase
- Phone auth fails in production builds

When you build a production APK/AAB:
1. Android signs it with the **production keystore** (upload-keystore.jks)
2. Firebase verifies the app's signature using Play Integrity API
3. Firebase checks if the SHA-256 matches any registered fingerprint
4. **If no match found** → `auth/app-not-authorized` error ❌
5. **If match found** → Phone auth works ✅

## 🎉 EXPECTED RESULT

After adding the SHA-256 certificate:
- ✅ Phone authentication will work in production builds
- ✅ Users can login with OTP on Play Store version
- ✅ No more `auth/app-not-authorized` errors

## 📝 ADDITIONAL NOTES

### For Google Sign-In
If you're also using Google Sign-In, make sure to add the same SHA-1 and SHA-256 to:
- Firebase Console (already done above)
- Google Cloud Console → Credentials → OAuth 2.0 Client IDs

### For Future Reference
Keep these certificates documented:

**Debug Keystore** (android/app/debug.keystore):
- SHA-1: `5D:8F:15:D5:2E:E3:C2:E2:46:B3:54:75:9C:F5:7B:91:3B:1E`
- Password: `android`
- Alias: `androiddebugkey`

**Production Keystore** (app/app/upload-keystore.jks):
- SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- SHA-256: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`
- Password: `upload123`
- Alias: `upload-key`

### To Get SHA Certificates Anytime

Run this command:
```bash
keytool -list -v -keystore app/app/upload-keystore.jks -alias upload-key -storepass upload123 | grep "SHA1\|SHA256"
```

---

**Created:** 20 November 2025
**Issue:** Firebase Phone Auth failing in production with `auth/app-not-authorized`
**Solution:** Add production keystore SHA-256 to Firebase Console
