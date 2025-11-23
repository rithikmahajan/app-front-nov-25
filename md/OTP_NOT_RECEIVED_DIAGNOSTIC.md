# 🚨 OTP Not Received - Diagnostic Checklist

**Issue:** OTP SMS not received on physical device, resend timer not starting

---

## 🔍 CRITICAL CHECKS

### 1. Verify Phone Authentication is ENABLED in Firebase

**MOST COMMON ISSUE!**

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers

2. Look for **"Phone"** in the sign-in providers list

3. **MUST show "Enabled"** - if it says "Disabled", that's your problem!

4. If disabled:
   - Click on "Phone"
   - Toggle to "Enabled"
   - Click "Save"

---

### 2. Check Firebase SMS Quota

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/authentication/usage

2. Check if SMS quota is available

3. If quota exceeded:
   - Upgrade to Blaze (pay-as-you-go) plan
   - Or wait for quota to reset

---

### 3. Verify Phone Number Format

**Must include country code with + sign**

✅ Correct: `+919876543210`  
❌ Wrong: `9876543210`  
❌ Wrong: `919876543210`  
❌ Wrong: `+91 9876543210` (no spaces)

---

### 4. Check Firebase Console Logs

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/authentication/users

2. Check if authentication attempts are showing up

3. Look for errors in the logs

---

### 5. Verify Test Phone Numbers (If Testing)

If you added test phone numbers in Firebase Console:

**⚠️ Test phone numbers DON'T work in production builds on real devices!**

Test numbers only work in:
- Debug builds
- Emulators
- Firebase Test Lab

For production APK on real device: **MUST use real phone numbers**

---

## 🔧 CODE FIX APPLIED

I've updated the code to:

1. ✅ Remove the incorrect `forceResend` parameter
2. ✅ Add detailed logging
3. ✅ Properly configure app verification

---

## 🚀 REBUILD REQUIRED

The code change needs a rebuild:

```bash
cd android
./gradlew clean
ENVFILE=../.env.production ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 📱 TESTING STEPS

After rebuild:

1. Open app on device
2. Enter phone number: `+[country code][number]`
3. Tap LOGIN
4. Check console/logcat for these logs:

**Expected Success Logs:**
```
📱 Platform: android
🏗️  Build Type: PRODUCTION
🔐 Production build detected - enabling app verification...
✅ App verification enabled for production
🔒 SafetyNet/Play Integrity will be used
🔄 Sending OTP via Firebase...
✅ OTP sent successfully!
📬 Confirmation ID: Present
```

**If you see these errors:**

- `auth/app-not-authorized` → SHA certificates issue
- `auth/quota-exceeded` → Firebase SMS quota exceeded
- `auth/invalid-phone-number` → Phone number format wrong
- `auth/too-many-requests` → Too many attempts, wait 1 hour
- `SafetyNet attestation failed` → Play Integrity API issue

---

## 🎯 MOST LIKELY CAUSES

Based on your screenshot (OTP screen shown but no SMS):

### 1. Phone Authentication NOT Enabled (80% probability)
**Check Firebase Console NOW**

### 2. SMS Quota Exceeded (15% probability)
**Check Firebase Console Usage tab**

### 3. Phone Number Format Wrong (5% probability)
**Ensure it starts with +**

---

## ✅ QUICK FIX STEPS

1. **Check Phone Auth Enabled:**
   https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers

2. **If enabled, rebuild app:**
   ```bash
   cd android
   ./gradlew clean
   ENVFILE=../.env.production ./gradlew assembleRelease
   ```

3. **Install fresh APK:**
   ```bash
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

4. **Test again with real phone number**

---

## 📊 VERIFICATION CHECKLIST

Before testing again:

- [ ] Phone Authentication shows "Enabled" in Firebase Console
- [ ] SMS quota available (check Usage tab)
- [ ] Fresh google-services.json downloaded (already done)
- [ ] Code fix applied (already done)
- [ ] App rebuilt with latest code
- [ ] Fresh APK installed on device
- [ ] Testing with real phone number (not test number)
- [ ] Phone number starts with +

---

**Next Action:** Check if Phone Authentication is enabled in Firebase Console!
