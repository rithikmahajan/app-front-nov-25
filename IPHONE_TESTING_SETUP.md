# 📱 iPhone Testing Setup Guide

## ✅ Current Status

**Device Connected:** Rithik's iPhone (iOS 26.1)  
**Device ID:** 00008130-000C79462E43001C  
**Team:** UX6XB9FMNN  
**Bundle ID:** com.yoraaapparelsprivatelimited.yoraa  
**Build Status:** In Progress... ⏳

---

## 🚀 Installation Steps

### Step 1: Keep iPhone Unlocked
- Make sure your iPhone is **unlocked** during the build process
- Keep the screen active to prevent connection issues

### Step 2: Trust This Computer (If Prompted)
If this is the first time connecting your iPhone to this Mac:
1. Unlock your iPhone
2. A prompt will appear: **"Trust This Computer?"**
3. Tap **"Trust"**
4. Enter your iPhone passcode if required

### Step 3: Wait for Build to Complete
The build process will:
- ✅ Install dependencies
- ✅ Build the iOS app
- ✅ Install the app on your iPhone
- ✅ Launch the app

This typically takes 2-5 minutes.

---

## 📱 After Installation

### First Launch - Trust Developer Certificate

When you first open the app, you may see:
> **"Untrusted Enterprise Developer"**

**To fix this:**
1. On your iPhone, go to: **Settings** → **General** → **VPN & Device Management**
2. Under "Developer App", tap on: **Yoraa Apparels Private Limited**
3. Tap **"Trust Yoraa Apparels Private Limited"**
4. Tap **"Trust"** again to confirm
5. Go back and open the app again

---

## 🔧 Troubleshooting

### Issue: "Device Not Found"
```bash
# Check connected devices
xcrun xctrace list devices

# Reconnect your iPhone
# - Unplug USB cable
# - Plug back in
# - Unlock iPhone
```

### Issue: "Code Signing Error"
```bash
# Open Xcode and check signing
open ios/Yoraa.xcworkspace

# In Xcode:
# 1. Select YoraaApp target
# 2. Go to "Signing & Capabilities"
# 3. Check "Automatically manage signing"
# 4. Select your team
```

### Issue: "Build Failed"
```bash
# Clean and rebuild
cd ios
rm -rf build
cd ..
npx react-native run-ios --device="Rithik's iPhone"
```

### Issue: "App Crashes on Launch"
```bash
# Check logs in real-time
npx react-native log-ios
```

---

## 🔄 Rebuilding the App

To rebuild and reinstall after making changes:

```bash
npx react-native run-ios --device="Rithik's iPhone"
```

Or use the device ID:
```bash
npx react-native run-ios --device="00008130-000C79462E43001C"
```

---

## 📊 Viewing Logs

To see console logs from your iPhone:

```bash
npx react-native log-ios
```

Or monitor Metro bundler:
```bash
npm start
```

---

## 🎯 Quick Commands

| Task | Command |
|------|---------|
| Install on iPhone | `npx react-native run-ios --device="Rithik's iPhone"` |
| List devices | `xcrun xctrace list devices` |
| View logs | `npx react-native log-ios` |
| Clean build | `cd ios && rm -rf build && cd ..` |
| Reinstall pods | `cd ios && pod install && cd ..` |

---

## ✨ Tips for Testing

1. **Keep USB Connected**: The app will communicate with Metro bundler on your Mac
2. **Enable Hot Reload**: Shake your iPhone and enable "Fast Refresh" for instant updates
3. **Use Developer Menu**: Shake your iPhone to access debug options
4. **WiFi Alternative**: After first install, you can use WiFi debugging (requires setup)

---

## 📝 Next Steps

Once the build completes:
1. ✅ Check your iPhone - the Yoraa app should appear
2. ✅ Trust the developer certificate (Settings → General → VPN & Device Management)
3. ✅ Launch the app
4. ✅ Start testing!

---

## 🆘 Need Help?

**If build fails**, check the terminal output for specific errors.

**Common fixes:**
- Clean build: `cd ios && xcodebuild clean -workspace Yoraa.xcworkspace -scheme YoraaApp`
- Reinstall pods: `cd ios && pod install`
- Check Xcode signing settings

**For detailed logs:**
```bash
npx react-native run-ios --device="Rithik's iPhone" --verbose
```

---

**Last Updated:** November 7, 2025  
**Status:** Build in progress... check terminal for updates! 🚀
