# 🔧 Google Sign-In - Correct Fix for com.yoraa

## 🚨 Current Issue

You added the SHA-1 to the WRONG Firebase app!

- ❌ You added SHA-1 to: `com.yoraapparelsprivatelimited.yoraa`
- ✅ You need to add it to: `com.yoraa` (your actual app)

## ✅ Correct Solution

### Step 1: Go to Firebase Console

**IMPORTANT:** You need to add the SHA-1 to the app with package name `com.yoraa`

1. Go to: https://console.firebase.google.com/
2. Select project: **yoraa-android-ios**
3. Click ⚙️ Settings > Project settings
4. Scroll to "Your apps" section

### Step 2: Find the CORRECT Android App

Look for the app with:
- **Package name:** `com.yoraa` (NOT `com.yoraapparelsprivatelimited.yoraa`)
- **App nickname:** Yoraa or similar

If you don't see an app with package name `com.yoraa`, you need to:
1. Click "Add app" > Android
2. Enter package name: `com.yoraa`
3. Download the google-services.json
4. Continue with adding SHA-1

### Step 3: Add SHA-1 to com.yoraa App

Select the `com.yoraa` app and:
1. Click "Add fingerprint"
2. Paste this SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
3. Click "Save"
4. Download the NEW google-services.json for `com.yoraa`

### Step 4: Replace File

```bash
# Copy the downloaded file
cp ~/Downloads/google-services.json android/app/google-services.json
```

### Step 5: Verify the File

Check that the file has `com.yoraa` as package name:
```bash
cat android/app/google-services.json | grep "package_name"
```

You should see:
```json
"package_name": "com.yoraa"
```

NOT `com.yoraapparelsprivatelimited.yoraa`

### Step 6: Clean and Rebuild

```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

---

## 📋 Quick Checklist

- [ ] Found Firebase app with package name `com.yoraa`
- [ ] Added SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] Downloaded google-services.json from `com.yoraa` app
- [ ] Verified file has "package_name": "com.yoraa"
- [ ] Replaced android/app/google-services.json
- [ ] Clean build: `cd android && ./gradlew clean`
- [ ] Rebuild: `npx react-native run-android`

---

## 🎯 Why This Matters

Your app's `build.gradle` defines:
```gradle
applicationId "com.yoraa"
```

Firebase must have an app with the SAME package name and your SHA-1 certificate.

Currently:
- ❌ SHA-1 is in wrong app (`com.yoraapparelsprivatelimited.yoraa`)
- ✅ Need SHA-1 in correct app (`com.yoraa`)

