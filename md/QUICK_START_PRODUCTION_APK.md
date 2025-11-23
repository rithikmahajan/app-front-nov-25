# 🚀 Quick Start Guide - Production APK Installation

## 📱 After Build Completes

### 1️⃣ Locate the APK
The production APK will be available at:
```
📁 app-release.apk (in root folder)
```
Or:
```
📁 android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ BEFORE Testing Phone OTP Login

### CRITICAL: Add SHA-256 to Firebase Console

**You MUST complete this step or phone OTP will not work!**

1. **Copy this SHA-256 certificate**:
```
99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3
```

2. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com/
   - Select your YORAA project
   - Click ⚙️ (Settings) → Project Settings
   - Scroll to "Your apps" section
   - Find your Android app (com.yoraa)

3. **Add the SHA-256**:
   - Click "Add fingerprint"
   - Paste the SHA-256 certificate above
   - Click "Save"

4. **Download Updated Configuration**:
   - Click "Download google-services.json"
   - Replace `android/app/google-services.json` with the new file
   - Rebuild APK: `echo "1" | ./build-android-production.sh`

---

## 📲 Install APK on Device

### Method 1: Using ADB (Recommended)
```bash
# Make sure device is connected and USB debugging is enabled
adb install app-release.apk
```

### Method 2: Direct Install
1. Copy `app-release.apk` to your Android device
2. Open the file on your device
3. Allow installation from unknown sources if prompted
4. Tap "Install"

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] App launches successfully
- [ ] No crash on startup
- [ ] Backend connectivity works

### Phone OTP Login
- [ ] Navigate to "Login with Phone"
- [ ] Enter phone number with country code (e.g., +91XXXXXXXXXX)
- [ ] Tap "Send OTP"
- [ ] Wait for SMS (5-60 seconds)
- [ ] Enter 6-digit OTP code
- [ ] Should see "Phone number verified successfully!"
- [ ] Should navigate to Terms and Conditions

### Other Login Methods
- [ ] Email + Password login works
- [ ] Google Sign-In works
- [ ] Logout works

### Core Features
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Razorpay payment

---

## 🐛 Troubleshooting

### "App not authorized to use Firebase Authentication"
**Solution**: Add SHA-256 to Firebase Console (see above)

### Phone OTP not received
**Checks**:
- Wait up to 60 seconds for SMS
- Check phone number format (+91XXXXXXXXXX)
- Verify phone has network coverage
- Check Firebase Console → Authentication → Usage (not exceeded quota)

### "No verification session found"
**Solutions**:
- Ensure you're using the latest APK with the fix
- Check Firebase Console has correct SHA-256
- Try "Resend Code" button

### App crashes on launch
**Checks**:
- Check device Android version (minimum: 7.0)
- Ensure Google Play Services is updated
- Clear app data and reinstall

---

## 📊 What's New in This Release

✅ **Phone OTP Login Fixed**: Works reliably in production builds  
✅ **Service Persistence**: Verification session stored securely  
✅ **Multi-Level Fallback**: 5 different ways to retrieve OTP session  
✅ **Enhanced Logging**: Better error messages for debugging  
✅ **Production Ready**: Signed with release keystore  

---

## 📞 Need Help?

### Check Logs
```bash
# View real-time logs
adb logcat | grep -i firebase

# Or filter for YORAA app
adb logcat | grep -i yoraa
```

### Firebase Console
- Authentication logs: Firebase Console → Authentication
- Phone usage: Firebase Console → Authentication → Usage
- Recent activity: Firebase Console → Authentication → Users

### Backend
- Health check: https://api.yoraa.in.net/api/health
- Should return 200 OK

---

## ⚡ Quick Commands

```bash
# Install APK
adb install app-release.apk

# Uninstall existing app first
adb uninstall com.yoraa && adb install app-release.apk

# View logs
adb logcat | grep -E "(Firebase|YORAA|PhoneAuth)"

# Check if app is running
adb shell ps | grep yoraa

# Clear app data
adb shell pm clear com.yoraa
```

---

## 🎯 Success Indicators

**You'll know it's working when**:
- ✅ OTP SMS arrives within 60 seconds
- ✅ Entering OTP shows success message
- ✅ User navigates to Terms and Conditions
- ✅ User can access app features
- ✅ No error messages in logs

---

**Ready to Test?** 🚀  
**Remember**: Add SHA-256 to Firebase Console FIRST!
