# 🔐 Complete reCAPTCHA Reconfiguration Guide

## Your reCAPTCHA Keys
- **iOS Key:** `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- **Android Key:** `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

## Your App Identifiers
- **iOS Bundle ID:** `com.yoraaapparelsprivatelimited.yoraa`
- **Android Package Name:** `com.yoraapparelsprivatelimited.yoraa`

---

## 🎯 Part 1: Firebase Console Configuration (CRITICAL!)

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **yoraa-android-ios**
3. Navigate to: **Authentication** → **Settings** tab
4. Scroll down to the **reCAPTCHA** section

### Step 2: Configure Platform Site Keys
You should see a button that says **"Configure site keys"** - click it.

#### Add iOS Platform:
```
Platform Type: iOS-9
Name: yoraa-ios
Site Key: 6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt
Bundle ID: com.yoraaapparelsprivatelimited.yoraa
```

**Click "Add" or "Save"**

#### Add Android Platform:
```
Platform Type: Android
Name: yoraa-android
Site Key: 6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_
Package Name: com.yoraapparelsprivatelimited.yoraa
```

**Click "Add" or "Save"**

### Step 3: Verify reCAPTCHA Settings
In the same settings page, check:
- **Phone authentication enforcement mode:** Should be set to "AUDIT" or "ENFORCE"
- **SMS fraud risk threshold score:** Set appropriately (Block max 0 for strict, higher for lenient)

### Step 4: Save All Changes
Make sure to click **"Save"** at the bottom of the page.

---

## 🛠️ Part 2: iOS App Configuration

### What's Already Done ✅
- [x] Bundle ID URL scheme added to Info.plist
- [x] Firebase SDK dependencies installed
- [x] RecaptchaInterop pod included

### Verify Info.plist Configuration

The file `ios/YoraaApp/Info.plist` should have this URL scheme (already added):

```xml
<dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>YoraaAppBundleID</string>
    <key>CFBundleURLSchemes</key>
    <array>
        <string>com.yoraaapparelsprivatelimited.yoraa</string>
    </array>
</dict>
```

This allows Firebase to redirect back to your app after reCAPTCHA verification.

---

## 📱 Part 3: Android App Configuration

### Step 1: Verify AndroidManifest.xml

Let me check and update if needed...

### Step 2: Ensure Google Services Plugin

Already configured in `android/app/build.gradle`:
```groovy
apply plugin: "com.google.gms.google-services"
```

---

## 🚀 Part 4: Rebuild Your Apps

### For iOS:

```bash
# Clean and rebuild iOS
cd ios
rm -rf Pods Podfile.lock build
pod install
cd ..

# Reset cache and rebuild
npx react-native start --reset-cache &

# In a new terminal
npx react-native run-ios
```

### For Android:

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

---

## 🧪 Part 5: Testing

### Test Phone Authentication:

1. **Launch the app** (iOS or Android)
2. **Navigate to Phone Login**
3. **Enter a phone number** (use your real number or a test number)
4. **Observe the behavior:**
   - ✅ **Expected:** reCAPTCHA challenge may appear (if threshold reached)
   - ✅ **Expected:** OTP sent successfully
   - ❌ **Error:** "reCAPTCHA SDK not linked" means Firebase Console config incomplete

### Debug Output:

Check console logs for:
```
Sending OTP to: +[phone_number]
OTP sent successfully. Verification ID: [id]
```

---

## 🔍 Verification Checklist

### Firebase Console ✓
- [ ] Logged into Firebase Console
- [ ] Selected "yoraa-android-ios" project
- [ ] Clicked "Configure site keys" in Authentication → Settings
- [ ] Added iOS platform with key `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- [ ] Added Android platform with key `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`
- [ ] Verified Bundle ID matches: `com.yoraaapparelsprivatelimited.yoraa`
- [ ] Verified Package Name matches: `com.yoraapparelsprivatelimited.yoraa`
- [ ] Saved all changes

### iOS App ✓
- [x] Info.plist has bundle ID URL scheme
- [ ] Pods reinstalled
- [ ] App rebuilt
- [ ] Tested phone authentication

### Android App ✓
- [x] google-services.json is up to date
- [ ] Gradle clean and rebuild
- [ ] Tested phone authentication

---

## 🐛 Troubleshooting

### Error: "reCAPTCHA SDK not linked"

**Causes:**
1. ❌ Firebase Console not configured (site keys not added)
2. ❌ Bundle ID mismatch
3. ❌ Info.plist missing URL scheme
4. ❌ Pods not reinstalled after changes

**Solutions:**
1. ✅ Complete Firebase Console configuration (Part 1 above)
2. ✅ Verify bundle IDs match exactly
3. ✅ Check Info.plist (already fixed)
4. ✅ Run `cd ios && pod install && cd ..`

### Error: "auth/invalid-phone-number"

**Solution:** Make sure phone number includes country code (e.g., `+919876543210`)

### Error: "auth/too-many-requests"

**Solution:** 
- Wait a few minutes
- Or temporarily disable reCAPTCHA in Firebase Console for testing

### reCAPTCHA Not Showing

**This is normal!** reCAPTCHA only appears when:
- Firebase detects suspicious activity
- SMS quota is being exceeded
- Fraud risk threshold is reached

For normal requests, OTP is sent directly without reCAPTCHA.

---

## 📝 Important Notes

### About reCAPTCHA Keys:

1. **Keys are NOT in your code** - They're configured in Firebase Console only
2. **Firebase SDK handles everything** - No manual reCAPTCHA implementation needed
3. **Keys are platform-specific:**
   - iOS key: `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
   - Android key: `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

### About Bundle IDs:

⚠️ **IMPORTANT:** There's a slight difference:
- **iOS:** `com.yoraa**a**pparelsprivatelimited.yoraa` (double 'a')
- **Android:** `com.yoraa**p**parelsprivatelimited.yoraa` (single 'a')

Make sure to use the EXACT bundle ID/package name when configuring in Firebase Console!

### reCAPTCHA Enforcement Modes:

- **OFF:** No reCAPTCHA verification (not recommended for production)
- **AUDIT:** Monitor but don't block (recommended for testing)
- **ENFORCE:** Block suspicious requests (recommended for production)

---

## 🎬 Quick Start Commands

### Complete iOS Rebuild:
```bash
cd ios && rm -rf Pods Podfile.lock && pod install && cd .. && npx react-native run-ios
```

### Complete Android Rebuild:
```bash
cd android && ./gradlew clean && cd .. && npx react-native run-android
```

---

## ✅ Expected Outcome

After completing all steps:

1. ✅ No "reCAPTCHA SDK not linked" error
2. ✅ Phone authentication works smoothly
3. ✅ OTP sent and received successfully
4. ✅ User can sign in with phone number

---

## 🆘 Still Having Issues?

### Check These:

1. **Firebase Console Screenshot Verification:**
   - Do you see both platforms listed under "Configured platform site keys"?
   - Do the bundle IDs match exactly?

2. **App Build Verification:**
   - Did you rebuild the app after making changes?
   - Did pods install without errors?

3. **Network/Firebase Connection:**
   - Is the device/simulator connected to internet?
   - Is Firebase project active and not paused?

### Temporary Workaround (Testing Only):

If you need to test immediately, you can temporarily disable reCAPTCHA:

1. Firebase Console → Authentication → Settings
2. Find "Phone authentication enforcement mode"
3. Change to **"OFF"**
4. Test phone authentication
5. **Remember to turn it back ON for production!**

---

## 📚 References

- [Firebase Phone Auth - iOS](https://firebase.google.com/docs/auth/ios/phone-auth)
- [Firebase Phone Auth - Android](https://firebase.google.com/docs/auth/android/phone-auth)
- [reCAPTCHA Enterprise for iOS](https://cloud.google.com/recaptcha-enterprise/docs/instrument-ios-apps)
- [React Native Firebase Docs](https://rnfirebase.io/auth/phone-auth)

---

## 🎯 Summary

**What you have:**
- ✅ iOS reCAPTCHA key: `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- ✅ Android reCAPTCHA key: `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`

**What you need to do:**
1. Configure these keys in Firebase Console (click "Configure site keys")
2. Add iOS platform with the iOS key
3. Add Android platform with the Android key
4. Rebuild your apps
5. Test phone authentication

**Most critical step:** Firebase Console configuration! The error you're seeing means Firebase can't find the platform configuration for your app's bundle ID.
