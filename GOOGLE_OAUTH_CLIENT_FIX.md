# 🔧 Google OAuth 2.0 Client ID Fix Guide

## Problem
Google Sign-In shows `DEVELOPER_ERROR` with message about OAuth 2.0 client IDs already existing.

## Root Cause
The SHA-1 certificate fingerprint you're trying to add is already associated with a different OAuth 2.0 client, or there's a mismatch between:
1. The package name in your app (`com.yoraa`)
2. The SHA-1 certificate from your signing key
3. The OAuth Client ID configuration in Google Cloud Console

---

## ✅ Your Current Configuration

### Package Name
```
com.yoraa
```

### SHA-1 Certificate (Release/Production)
```
84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
```

### Web Client ID (from .env.production)
```
133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

---

## 🔨 Solution Steps

### Step 1: Clean Up Existing OAuth 2.0 Clients in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: **yoraa-android-ios**

2. **Navigate to Credentials**
   - Click: **APIs & Services** → **Credentials**

3. **Review Existing OAuth 2.0 Client IDs**
   - Look for all OAuth 2.0 Client IDs listed
   - You should see:
     - Web client (auto created by Google Service)
     - Android clients (one or more)

4. **Delete Duplicate/Old Android Clients**
   - For each Android OAuth client:
     - Check if the SHA-1 matches: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
     - Check if the package name is: `com.yoraa`
   - Delete any Android clients that:
     - Have wrong package names
     - Have old/different SHA-1 certificates
     - Are duplicates

5. **Keep ONLY:**
   - ✅ Web client (auto created by Google Service) - ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`
   - ✅ One Android client with the correct SHA-1 and package name

---

### Step 2: Create New Android OAuth Client (If Needed)

If you deleted the Android client or need to create a new one:

1. **Click "Create Credentials"** → **OAuth 2.0 Client ID**

2. **Select Application Type**: **Android**

3. **Fill in Details**:
   ```
   Name: Yoraa Android (Production)
   Package name: com.yoraa
   SHA-1 certificate fingerprint: 84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
   ```

4. **Click "Create"**

5. **Important**: You don't need to copy the Client ID from this Android client. The Android client is just for authentication - your app uses the **Web Client ID**.

---

### Step 3: Update Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: **yoraa-android-ios**

2. **Go to Project Settings**
   - Click the gear icon ⚙️ → **Project Settings**

3. **Select Your Android App**
   - Scroll to **Your apps** section
   - Click on your app: `com.yoraa`

4. **Update SHA Certificate Fingerprints**
   - Under **SHA certificate fingerprints**
   - Make sure this SHA-1 is added: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
   - If it's not there, click **Add fingerprint** and paste it

5. **Download Updated google-services.json**
   - Click **Download google-services.json**
   - Replace the file at: `android/app/google-services.json`

---

### Step 4: Verify google-services.json

After downloading, verify the file contains the correct OAuth client:

```bash
# Check the Web Client ID in google-services.json
grep -A 2 '"oauth_client":' android/app/google-services.json | grep '"client_id":'
```

You should see the Web Client ID: `133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com`

---

### Step 5: Verify .env.production Configuration

Ensure your `.env.production` has the correct Web Client ID:

```bash
GOOGLE_SIGNIN_WEB_CLIENT_ID=133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com
```

---

### Step 6: Clean and Rebuild

```bash
# Clean previous builds
cd android
./gradlew clean
cd ..

# Remove old build artifacts
rm -rf android/app/build
rm -rf android/.gradle

# Rebuild production AAB
./build-android-production.sh
# Select: 2 (AAB for Play Store)
```

---

## 🧪 Testing the Fix

### Test Locally First

```bash
# Build release APK for local testing
cd android
ENVFILE=../.env.production ./gradlew assembleRelease
cd ..

# Install on connected device
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

**Test Google Sign-In:**
1. Open the app
2. Tap on Google Sign-In button
3. Select a Google account
4. Verify it signs in successfully without DEVELOPER_ERROR

---

## 📋 Common Issues & Solutions

### Issue 1: "OAuth 2.0 client ID already exists"
**Solution**: Delete the duplicate OAuth client in Google Cloud Console before creating a new one.

### Issue 2: Still getting DEVELOPER_ERROR
**Checklist**:
- [ ] Correct SHA-1 in Google Cloud Console Android OAuth client
- [ ] Correct SHA-1 in Firebase Console
- [ ] Correct package name (`com.yoraa`) everywhere
- [ ] Downloaded latest `google-services.json` from Firebase
- [ ] Web Client ID matches in `.env.production` and `google-services.json`
- [ ] Clean build after all changes

### Issue 3: Works in debug but not release
**Solution**: Make sure you're using the **release keystore SHA-1**, not debug SHA-1.
- Debug SHA-1: Different (for development)
- Release SHA-1: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F` (for production)

---

## 🎯 Quick Verification Commands

```bash
# 1. Verify your release SHA-1
cd android && ./gradlew signingReport | grep -A 5 "Variant: release"

# 2. Verify package name
grep "applicationId" android/app/build.gradle

# 3. Verify Web Client ID in .env.production
grep "GOOGLE_SIGNIN_WEB_CLIENT_ID" .env.production

# 4. Verify google-services.json has correct client ID
grep -A 2 '"oauth_client":' android/app/google-services.json | grep '"client_id":'
```

---

## ✅ Expected Result

After completing all steps:
- Google Sign-In should work in production builds
- No DEVELOPER_ERROR
- Users can sign in with their Google accounts seamlessly

---

## 📞 Need Help?

If the issue persists after following all steps:
1. Double-check the SHA-1 matches exactly (including colons)
2. Wait 5-10 minutes after making changes in Google Cloud Console (changes need to propagate)
3. Clear app data and cache before testing
4. Try on a different device to rule out device-specific issues
