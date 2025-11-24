# 🚀 Quick Start Guide - iOS & Android Development

## Current Status

### Android ✅
- **Status**: Ready to load (just needs reload)
- **Action**: Tap "RELOAD" button on emulator screen

### iOS 🔄
- **Status**: CocoaPods reinstalling (in progress)
- **Action**: Wait for pod install to complete (~3-5 minutes)

---

## For Android (NOW):

### Just Tap RELOAD!
On your Android emulator screen, you see a "RELOAD (R, R)" button.
**Just tap it!** The app will load.

Or from terminal:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb reverse tcp:8081 tcp:8081
adb shell input keyevent 82  # Opens dev menu
```

---

## For iOS (After pod install completes):

### Once pod install finishes:
```bash
npx react-native run-ios
```

The app will build and launch on iOS Simulator.

---

## One-Command Startup (Future):

### For Android:
```bash
./start-dev-complete.sh
```

This automatically:
- Checks backend is running
- Sets up port forwarding
- Starts Metro if needed
- Shows status

### For iOS:
```bash
# Make sure pods are installed first
cd ios && pod install && cd ..

# Then run
npx react-native run-ios
```

---

## Backend Connection

### Android Emulator:
- Uses `http://10.0.2.2:5000` (configured in `src/config/environment.js`)
- Port forwarding: `adb reverse tcp:5000 tcp:5000`

### iOS Simulator:
- Uses `http://localhost:5000` (configured in `src/config/environment.js`)
- No port forwarding needed

---

## Troubleshooting

### Android: "Could not connect to development server"
**Solution:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb reverse tcp:8081 tcp:8081
# Then tap RELOAD on emulator
```

### iOS: Build errors
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### Metro not running
**Solution:**
```bash
pkill -f metro
npx react-native start --reset-cache
```

---

## Next Steps

1. **Android**: Tap RELOAD button now ✅
2. **iOS**: Wait for pod install to finish (currently running)
3. **Start developing!** 🎉

---

## Backend Setup

Make sure your backend is running:
```bash
cd /Users/rithikmahajan/Desktop/oct-7-backend-admin-main
npm start
```

Check it's running:
```bash
lsof -i :5000
```

---

**Everything is set up! Android is ready to reload, iOS is reinstalling pods.** 🚀
