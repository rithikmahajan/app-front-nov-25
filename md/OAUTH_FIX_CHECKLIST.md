# ✅ Google OAuth Fix - Quick Action Checklist

## What You Need to Do in Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials?project=yoraa-android-ios

---

## Step 1: Check FIRST Android Client

**Client ID:** `133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c.apps.googleusercontent.com`

1. Click on this Android client
2. Check the **SHA-1 certificate fingerprint**
3. Is it: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`?

   - [ ] ✅ YES - Keep this one, delete the other
   - [ ] ❌ NO - Note the SHA-1 and check the next one

---

## Step 2: Check SECOND Android Client

**Client ID:** `133733122921-d2pkd5k046e4isoiulnrsf8m6mj38j4p.apps.googleusercontent.com`

1. Click on this Android client
2. Check the **SHA-1 certificate fingerprint**
3. Is it: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`?

   - [ ] ✅ YES - Keep this one, delete the other
   - [ ] ❌ NO - This needs to be deleted

---

## Step 3: Take Action

### If ONE has the correct SHA-1:
- [ ] Delete the Android client with the WRONG SHA-1
- [ ] Keep the one with the CORRECT SHA-1
- [ ] Done! Skip to Step 4

### If BOTH have wrong SHA-1:
- [ ] Delete BOTH Android clients
- [ ] Create NEW Android OAuth client:
  - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
  - Application type: **Android**
  - Name: `Yoraa Android Production`
  - Package name: `com.yoraa`
  - SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
  - Click "CREATE"

### If BOTH have the same correct SHA-1:
- [ ] Delete ONE of them (they're duplicates causing the error)
- [ ] Keep the other one

---

## Step 4: Update Firebase

Visit: https://console.firebase.google.com/project/yoraa-android-ios/settings/general

- [ ] Click on your Android app (`com.yoraa`)
- [ ] Scroll to "SHA certificate fingerprints"
- [ ] Verify this SHA-1 is present: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- [ ] If not, click "Add fingerprint" and add it
- [ ] Click "Download google-services.json"
- [ ] Replace file at: `android/app/google-services.json`

---

## Step 5: Clean Build

```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
cd android
./gradlew clean
cd ..
./build-android-production.sh
```

---

## Step 6: Test

```bash
cd android
ENVFILE=../.env.production ./gradlew assembleRelease
cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Open app → Try Google Sign-In → Should work! ✅

---

## 🔑 Quick Reference

**Your Configuration (DO NOT CHANGE):**
```
Package: com.yoraa
Release SHA-1: 84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
Web Client ID: 133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

**Files:**
- `.env.production` - Already correct ✓
- `android/app/google-services.json` - Download fresh from Firebase after fixing OAuth clients

---

## ❓ Still Confused?

The key point:
- ✅ **Web Client ID** goes in your `.env.production` (already correct)
- ✅ **Android Client ID** stays in Google Cloud Console (needs correct SHA-1)
- ❌ **Android Client ID** does NOT go in your code

Think of the Android Client as a "permission slip" that says: "App with package `com.yoraa` and SHA-1 `84:87:...` is allowed to use Web Client ID `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk...`"
