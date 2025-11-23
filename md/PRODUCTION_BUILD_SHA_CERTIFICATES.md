# 🔐 Production Build - SHA Certificates for Firebase

**Generated on:** November 20, 2025

## ✅ Your Production Keystore SHA Certificates

These certificates MUST be added to Firebase Console for phone authentication to work in production builds.

### SHA-1 Certificate
```
84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
```

### SHA-256 Certificate
```
99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3
```

---

## 🔥 Add to Firebase Console - CRITICAL STEPS

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **yoraa-android-ios**
3. Click **Settings** ⚙️ (gear icon) → **Project settings**

### Step 2: Find Your Android App
1. Scroll down to "Your apps" section
2. Find the Android app with package name: **com.yoraa**
3. Click to expand the app details

### Step 3: Add SHA-1 Fingerprint
1. Click the **"Add fingerprint"** button
2. Paste this SHA-1:
   ```
   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
   ```
3. Click **Save**

### Step 4: Add SHA-256 Fingerprint
1. Click **"Add fingerprint"** button again
2. Paste this SHA-256:
   ```
   99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3
   ```
3. Click **Save**

### Step 5: Download Updated google-services.json
1. After adding fingerprints, click **"Download google-services.json"**
2. Replace the file at: `android/app/google-services.json`
3. This is IMPORTANT - the new file includes your production certificates

### Step 6: Wait for Propagation
⏰ Wait **5-10 minutes** for Firebase to propagate changes across servers

---

## 📦 After Adding to Firebase

Once you've added the certificates to Firebase Console:

### Option A: Use the Build Script (Recommended)
```bash
./build-android-production.sh
```
Then select:
- Option 1 for APK (testing)
- Option 2 for AAB (Play Store)

### Option B: Manual Build
```bash
# Clean previous builds
cd android
./gradlew clean

# For AAB (Play Store)
./gradlew bundleRelease

# For APK (Testing)
./gradlew assembleRelease

cd ..
```

---

## 🎯 Why This Is Critical

**Without these SHA certificates in Firebase:**
- ❌ Phone authentication will fail in production builds
- ❌ Users will see error: "This app is not authorized to use Firebase Authentication"
- ❌ App will work in debug but fail in release/production

**With these SHA certificates added:**
- ✅ Phone authentication works perfectly
- ✅ OTP sent and verified successfully
- ✅ Production app fully functional

---

## 📋 Verification Checklist

Before uploading to Play Store:

- [ ] SHA-1 certificate added to Firebase Console
- [ ] SHA-256 certificate added to Firebase Console
- [ ] Downloaded updated google-services.json
- [ ] Replaced android/app/google-services.json with new file
- [ ] Waited 5-10 minutes for propagation
- [ ] Built new production APK/AAB with updated google-services.json
- [ ] Tested phone authentication on production build
- [ ] Verified OTP is received and login works

---

## 🚀 Production Build Output

After building, your files will be at:

**AAB (for Play Store):**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**APK (for testing):**
```
android/app/build/outputs/apk/release/app-release.apk
```

Both will also be copied to the root directory for easy access.

---

## 🔄 Next Steps After Build

1. **Test the APK locally** (if you built APK)
   - Install on a physical device
   - Test phone authentication
   - Verify OTP works

2. **Upload to Play Store** (if you built AAB)
   - Go to Google Play Console
   - Create new release
   - Upload app-release.aab
   - Submit for review

---

## ⚠️ Important Notes

- These certificates are from your **upload-keystore.jks** file
- Keep this keystore file safe - if you lose it, you can't update your app
- The SHA certificates never change unless you create a new keystore
- You only need to add these to Firebase once (unless you change keystores)

---

**Build Status:** Ready to build ✅
**Environment:** Production (.env.production)
**Backend API:** https://api.yoraa.in.net
**Keystore:** upload-keystore.jks verified ✅
