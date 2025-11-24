# 🔧 Google Sign-In DEVELOPER_ERROR Fix

## 📋 Error Details

**Error Message:** "Google Sign In failed on Android. DEVELOPER_ERROR"

**Cause:** SHA-1 certificate fingerprint mismatch between your app and Firebase project configuration.

---

## ✅ Solution: Add Debug Keystore SHA-1 to Firebase

### Step 1: Get Your Debug SHA-1 Certificate

Run this command to get your debug keystore SHA-1:

```bash
cd android
./gradlew signingReport
```

**Look for output like this:**
```
Variant: debug
Config: debug
Store: /Users/yourname/.android/debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX...
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
SHA-256: XX:XX:XX...
```

**Copy the SHA1 value** (the one after "SHA1:")

---

### Step 2: Add SHA-1 to Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Project Settings**
   - Click the ⚙️ (gear icon) next to "Project Overview"
   - Click "Project settings"

3. **Select Your Android App**
   - Scroll down to "Your apps" section
   - Click on your Android app (com.yoraa)

4. **Add SHA Certificate Fingerprint**
   - Click "Add fingerprint" button
   - Paste your SHA-1 certificate
   - Click "Save"

5. **Download New google-services.json**
   - After adding SHA-1, download the updated `google-services.json`
   - Replace the file at: `android/app/google-services.json`

---

### Step 3: Get Production SHA-1 (For Release Builds)

For your production/release builds, also get the SHA-1 from your upload keystore:

```bash
cd android/app
keytool -list -v -keystore upload-keystore.jks -alias upload-key
```

**Enter the keystore password when prompted**

Copy the SHA1 fingerprint and add it to Firebase (same steps as above).

---

## 🚀 Quick Fix Script

I'll create an automated script to get both SHA-1 certificates:

```bash
#!/bin/bash

echo "🔍 Getting SHA-1 Certificates for Google Sign-In..."
echo ""

# Debug keystore
echo "📱 DEBUG KEYSTORE (for development/testing):"
echo "=============================================="
cd android
./gradlew signingReport | grep -A 3 "Variant: debug" | grep "SHA1:"
cd ..
echo ""

# Release keystore (if exists)
if [ -f "android/app/upload-keystore.jks" ]; then
    echo "🔐 RELEASE KEYSTORE (for production):"
    echo "=============================================="
    echo "You'll need to enter your keystore password..."
    keytool -list -v -keystore android/app/upload-keystore.jks -alias upload-key | grep "SHA1:"
    echo ""
fi

echo "📋 Next Steps:"
echo "1. Copy the SHA1 values above"
echo "2. Go to Firebase Console: https://console.firebase.google.com/"
echo "3. Select your project > Project Settings"
echo "4. Add both SHA-1 fingerprints to your Android app"
echo "5. Download new google-services.json and replace android/app/google-services.json"
echo "6. Rebuild your app"
