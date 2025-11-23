# 🔧 Google OAuth Client ID - FINAL FIX

## 🚨 PROBLEM IDENTIFIED

Your Google Cloud Console has **2 WRONG Android OAuth clients**:
- ❌ `133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c.apps.googleusercontent.com`
- ❌ `133733122921-d2pkd5k046e4isoiulnrsf8m6mj38j4p.apps.googleusercontent.com`

But your app needs to use the **Web Client ID**:
- ✅ `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`

---

## ✅ SOLUTION (Step-by-Step)

### **Step 1: In Google Cloud Console**

Visit: https://console.cloud.google.com/apis/credentials?project=yoraa-android-ios

#### 1.1 Verify the Web Client Exists

Look for **"Web client (auto created by Google Service)"** or a Web application entry.

**It should have Client ID**: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`

✅ If you see it: GREAT! Leave it as is.
❌ If you DON'T see it: You need to regenerate your `google-services.json` from Firebase (see Step 2).

#### 1.2 Delete BOTH Android OAuth Clients

**Delete these TWO Android clients:**
1. Click on `Android client for com.yoraa (auto created by Google Service)` with ID ending in `...9s1868ckbgho2527g4vo64r4hkvknb9c`
2. Click the **trash icon** to delete it
3. Confirm deletion

4. Click on the second Android client with ID ending in `...d2pkd5k046e4isoiulnrsf8m6mj38j4p`
5. Click the **trash icon** to delete it
6. Confirm deletion

#### 1.3 Create ONE New Android OAuth Client

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth 2.0 Client ID"**
3. Choose **Application type**: **Android**
4. Fill in the form:

```
Name: Yoraa Android Production
Package name: com.yoraa
SHA-1 certificate fingerprint: 84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
```

5. Click **"CREATE"**
6. **IMPORTANT**: You DON'T need to save or use the Client ID from this Android client. Your app will use the **Web Client ID** for authentication.

---

### **Step 2: Update Firebase Console**

Visit: https://console.firebase.google.com/project/yoraa-android-ios/settings/general

#### 2.1 Add SHA-1 Certificate

1. Scroll down to **"Your apps"** section
2. Click on your Android app: **com.yoraa**
3. Scroll to **"SHA certificate fingerprints"**
4. Check if this SHA-1 is already there:
   ```
   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
   ```
5. If NOT present:
   - Click **"Add fingerprint"**
   - Paste: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
   - Click **"Save"**

#### 2.2 Download Updated google-services.json

1. Still in Firebase Console, on the same page
2. Click **"Download google-services.json"** button
3. Save the file
4. **Replace** your existing file at: `android/app/google-services.json`

---

### **Step 3: Verify the New google-services.json**

After downloading the new file, verify it has the correct Web Client ID:

```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Check for the correct Web Client ID
cat android/app/google-services.json | python3 -m json.tool | grep "g3f9l1865vk4bchuc8cmu7qpq9o8ukkk"
```

You should see the Web Client ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk...`

---

### **Step 4: Clean Build**

```bash
# Navigate to project root
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Clean Android build
cd android
./gradlew clean
cd ..

# Remove build artifacts
rm -rf android/app/build
rm -rf android/.gradle

# Build production AAB
./build-android-production.sh
# When prompted, select: 2 (AAB for Play Store)
```

---

### **Step 5: Test the Fix**

#### Build Release APK for Testing

```bash
cd android
ENVFILE=../.env.production ./gradlew assembleRelease
cd ..
```

#### Install on Device

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

#### Test Google Sign-In

1. Open the app on your device
2. Navigate to login screen
3. Tap **Google Sign-In** button
4. Select a Google account
5. ✅ **SHOULD WORK** - No more DEVELOPER_ERROR!

---

## 🔍 Why This Works

### The Issue
Google Sign-In on Android requires:
1. **A Web OAuth Client** (for the backend/API authentication)
2. **An Android OAuth Client** (to verify the app's identity via SHA-1)

### The Fix
- Your app uses the **Web Client ID** in the code
- The **Android OAuth Client** with the correct SHA-1 tells Google: "Yes, this app with package `com.yoraa` and SHA-1 `84:87:...` is allowed to use the Web Client ID"
- The two OLD Android clients had WRONG SHA-1 certificates, so Google rejected the authentication

---

## 📋 Final Checklist

Before uploading to Play Store:

- [ ] Deleted BOTH old Android OAuth clients from Google Cloud Console
- [ ] Created ONE new Android OAuth client with correct SHA-1
- [ ] Verified Web Client ID `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk...` exists
- [ ] Added SHA-1 `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` to Firebase
- [ ] Downloaded fresh `google-services.json` from Firebase
- [ ] Replaced `android/app/google-services.json` with new file
- [ ] Clean build completed successfully
- [ ] Tested Google Sign-In on release build - WORKS! ✅

---

## 🎯 Expected Result

**After completing these steps:**
- ✅ Google Sign-In works in production builds
- ✅ No DEVELOPER_ERROR
- ✅ Users can authenticate with their Google accounts
- ✅ Ready to upload to Play Store!

---

## ⏰ Time to Complete

- **Step 1-2**: 5 minutes (Google Cloud + Firebase Console)
- **Step 3**: 1 minute (Verify file)
- **Step 4**: 10 minutes (Clean build)
- **Step 5**: 5 minutes (Test)

**Total**: ~20 minutes

---

## 💡 Quick Reference

**Your Configuration:**
- Package: `com.yoraa`
- Release SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- Web Client ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
- Project: `yoraa-android-ios`

**Files to Update:**
- ✅ `android/app/google-services.json` - Download fresh from Firebase
- ✅ `.env.production` - Already correct, no changes needed

---

## 📞 Still Having Issues?

If you still see errors after following ALL steps:

1. **Wait 5-10 minutes** - Google Cloud changes need time to propagate
2. **Clear app data** on your test device before testing
3. **Uninstall and reinstall** the app completely
4. **Check Firebase Console** - Make sure the SHA-1 shows up under your Android app
5. **Verify Package Name** - Must be exactly `com.yoraa` everywhere

The fix WILL work once you complete all steps correctly! 🚀
