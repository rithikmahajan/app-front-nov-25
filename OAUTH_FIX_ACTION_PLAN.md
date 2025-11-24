# 🚨 URGENT: Google OAuth Client ID Resolution

## Issues Found

### 1. ❌ google-services.json in WRONG location
- **Current**: `app/google-services.json` 
- **Should be**: `android/app/google-services.json`

### 2. ✅ Web Client ID is CORRECT
- Your `.env.production` has: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
- This ID exists in `google-services.json` ✓

### 3. ⚠️ Multiple OAuth Client IDs Detected
The `google-services.json` has **7 different** OAuth Client IDs, which suggests:
- Multiple OAuth clients were created in Google Cloud Console
- Some might be duplicates or from testing
- This can cause conflicts

---

## 🔧 IMMEDIATE FIX

### Step 1: Move google-services.json to Correct Location

```bash
# From project root
mv app/google-services.json android/app/google-services.json
```

### Step 2: Clean and Rebuild

```bash
# Clean all build artifacts
cd android
./gradlew clean
cd ..

# Remove cached files
rm -rf android/app/build
rm -rf android/.gradle
rm -rf node_modules/.cache

# Rebuild production AAB
./build-android-production.sh
# Select: 2 (AAB for Play Store)
```

---

## 🔍 Root Cause: OAuth Client ID Conflict

The error "OAuth 2.0 client ID already exists" happens when:

1. **You try to add a SHA-1 fingerprint** that's already associated with another OAuth client
2. **Multiple Android OAuth clients exist** for the same package name

---

## 🎯 SOLUTION: Clean Up Google Cloud Console

### Go to Google Cloud Console

1. **Visit**: https://console.cloud.google.com/
2. **Select project**: yoraa-android-ios
3. **Navigate to**: APIs & Services → Credentials

### Review ALL OAuth 2.0 Client IDs

You should see something like this:

```
OAuth 2.0 Client IDs:
├── Web client (auto created by Google Service)
│   └── ID: 133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk...
│
├── Android client 1
│   ├── Package: com.yoraa
│   └── SHA-1: ???
│
├── Android client 2
│   ├── Package: com.yoraa
│   └── SHA-1: ???
│
└── ... (possibly more)
```

### DELETE Duplicate Android Clients

**Keep ONLY:**
- ✅ **1 Web client** (the one with ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk...`)
- ✅ **1 Android client** with:
  - Package name: `com.yoraa`
  - SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`

**Delete:**
- ❌ Any Android clients with wrong/old SHA-1
- ❌ Any duplicate Android clients
- ❌ Any clients with wrong package names

### Create NEW Android Client (if needed)

If you deleted all Android clients or none match your SHA-1:

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth 2.0 Client ID"**
3. Choose **Application type**: **Android**
4. Fill in:
   ```
   Name: Yoraa Android App
   Package name: com.yoraa
   SHA-1 certificate fingerprint: 84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
   ```
5. Click **"CREATE"**

### Update Firebase

1. **Go to**: https://console.firebase.google.com/
2. **Select**: yoraa-android-ios project
3. **Navigate to**: Project Settings (gear icon)
4. **Select your Android app**: com.yoraa
5. **Scroll to**: SHA certificate fingerprints
6. **Verify this SHA-1 is added**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
   - If not present, click "Add fingerprint" and add it
7. **Download NEW google-services.json**
8. **Replace**: `android/app/google-services.json` with the new file

---

## 📋 Quick Commands to Run NOW

```bash
# 1. Move google-services.json to correct location
mv app/google-services.json android/app/google-services.json

# 2. Verify your release SHA-1 (copy this for Google Cloud Console)
cd android && ./gradlew signingReport | grep -A 5 "Variant: release"

# 3. Clean build
./gradlew clean
cd ..

# 4. Rebuild production
./build-android-production.sh
```

---

## ✅ Verification Checklist

Before testing:

- [ ] google-services.json is at `android/app/google-services.json`
- [ ] Only 1 Web OAuth client exists in Google Cloud Console
- [ ] Only 1 Android OAuth client exists with correct SHA-1
- [ ] SHA-1 `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` is in Firebase Console
- [ ] Latest google-services.json downloaded from Firebase
- [ ] Clean build completed without errors
- [ ] .env.production has correct Web Client ID

---

## 🧪 Test After Fix

```bash
# Build release APK for testing
cd android
ENVFILE=../.env.production ./gradlew assembleRelease
cd ..

# Install on device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Test Google Sign-In
# Should work without DEVELOPER_ERROR
```

---

## 💡 Key Points

1. **The Web Client ID in your .env.production is CORRECT** ✓
2. **The file location was WRONG** (now fixed)
3. **Too many OAuth clients** in Google Cloud Console (need cleanup)
4. **The SHA-1 fingerprint** must match exactly in all places

---

## ⏰ Timeline

1. **Immediate (2 min)**: Move google-services.json file
2. **Next (10 min)**: Clean up Google Cloud Console OAuth clients
3. **Then (5 min)**: Update Firebase and download new google-services.json
4. **Finally (10 min)**: Clean rebuild and test

**Total time**: ~30 minutes to fully resolve

---

## 📞 Still Getting Error?

If after ALL these steps you still see "OAuth 2.0 client ID already exists":

1. **Wait 10 minutes** - Google Cloud changes can take time to propagate
2. **Clear app data** on your device before testing
3. **Try incognito browser** when managing Google Cloud Console
4. **Restart Android Studio** if building from IDE

The issue is almost certainly from having multiple/duplicate OAuth clients in Google Cloud Console. Clean them up first!
