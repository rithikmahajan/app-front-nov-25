# 🚀 Fix Phone Authentication - Quick Steps

## Your Project Details
- **Project ID**: `yoraa-android-ios`
- **Bundle ID**: `com.yoraaapparelsprivatelimited.yoraa`
- **Error**: `[auth/operation-not-allowed]` - Phone auth not enabled

---

## ⚡ Quick Fix (5 Minutes)

### Step 1: Enable Phone Authentication in Firebase Console

**Click this link to go directly to your project:**
👉 **https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers**

1. Find **"Phone"** in the provider list
2. Click on it
3. Toggle **"Enable"** to ON
4. Click **"Save"**

✅ **This alone might fix the immediate error!**

---

### Step 2: Enable reCAPTCHA Enterprise API

**Click this link:**
👉 **https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=yoraa-android-ios**

1. Click **"Enable"**
2. Wait for it to activate (usually instant)

---

### Step 3: Create reCAPTCHA Key for iOS

**Click this link:**
👉 **https://console.cloud.google.com/security/recaptcha?project=yoraa-android-ios**

1. Click **"Create Key"**
2. Fill in:
   - **Display name**: `iOS Phone Auth - Yoraa`
   - **Platform type**: Select **"iOS"**
   - **Bundle IDs**: Enter `com.yoraaapparelsprivatelimited.yoraa`
3. Click **"Create"**
4. **COPY THE KEY ID** - it looks like: `6Lxxx...xxxxx`

---

### Step 4: Add the Key to Your App

Create this file: `src/config/recaptcha.config.js`

```javascript
export const RECAPTCHA_CONFIG = {
  siteKey: 'PASTE_YOUR_KEY_ID_HERE', // From step 3
};
```

**OR** run this command (after replacing YOUR_KEY):

```bash
cat > /Users/rithikmahajan/Desktop/oct-7-appfront-main/src/config/recaptcha.config.js << 'EOF'
export const RECAPTCHA_CONFIG = {
  siteKey: 'YOUR_RECAPTCHA_KEY_ID_HERE', // Replace with actual key
};
EOF
```

---

### Step 5: Add App Attest in Xcode

1. Open `ios/YoraaApp.xcworkspace` in Xcode (double-click it)
2. Select **"YoraaApp"** target in left sidebar
3. Go to **"Signing & Capabilities"** tab
4. Click **"+ Capability"** button
5. Search for and add **"App Attest"**
6. Close Xcode

---

### Step 6: Rebuild the App

```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main

# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock build
pod install
cd ..

# Run the app
npx react-native run-ios
```

---

## 🧪 Test It

1. Open the app
2. Click on Phone login
3. Enter: `+91 7006114695`
4. You should now get OTP (or different error if backend issue)

---

## 🔍 If Still Not Working

### Check Firebase Phone Auth Status

Run this command to verify:
```bash
curl -X GET \
  'https://identitytoolkit.googleapis.com/v1/projects/yoraa-android-ios/config' \
  -H 'Authorization: Bearer $(gcloud auth print-access-token)'
```

### Add Test Phone Number (Optional - for development)

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers
2. Click on **"Phone"** provider
3. Scroll to **"Phone numbers for testing"**
4. Add:
   - **Phone**: `+917006114695`
   - **Code**: `123456`
5. Click **"Add"**
6. Click **"Save"**

Now you can test without real SMS!

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Phone provider enabled in Firebase Console
- [ ] reCAPTCHA Enterprise API enabled
- [ ] reCAPTCHA key created with correct bundle ID
- [ ] Key added to app config
- [ ] App Attest capability added in Xcode
- [ ] Pods reinstalled
- [ ] App rebuilt

---

## 🆘 Still Getting Errors?

### Common Issues:

**"reCAPTCHA SDK is not linked"**
- ✅ Already fixed with RecaptchaEnterprise pod

**"operation-not-allowed"** 
- ⚠️ Current issue - follow Step 1 above

**"invalid-app-credential"**
- Check Bundle ID matches: `com.yoraaapparelsprivatelimited.yoraa`
- Verify GoogleService-Info.plist is in the project

**"missing-client-identifier"**
- Ensure GoogleService-Info.plist is added to Xcode project
- Check it's in the "Copy Bundle Resources" build phase

**"quota-exceeded"**
- Enable billing in Firebase Console (required for production SMS)

---

## 📞 Your Next Test

After fixing, try these phone numbers:

**Test Number (if configured):**
- Phone: `+91 7006114695`
- Code: `123456` (if you set it up as test number)

**Real Number:**
- Phone: `+91 7006114695`
- Will receive actual SMS

---

## 🎯 Priority Actions

1. **NOW**: Enable Phone auth in Firebase Console (Step 1)
2. **THEN**: Test the app - might work immediately
3. **IF STILL ERROR**: Complete Steps 2-6

Good luck! 🚀
