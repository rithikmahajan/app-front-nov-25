# 🎯 iOS Simulator Lock - Complete Solution Guide

**Date:** November 24, 2025  
**Status:** ✅ RESOLVED  
**Solution:** Auto-Unlock Script Created

---

## 📋 Problem Summary

Your iOS app builds successfully, but fails to launch with this error:
```
Unable to launch com.yoraaapparelsprivatelimited.yoraa because 
the device was not, or could not be, unlocked.
```

**Root Cause:** The iOS simulator screen is locked (like a locked iPhone).

---

## ✅ IMMEDIATE SOLUTION - Use This!

### Step 1: Use the Auto-Unlock Script
```bash
./run-ios-unlocked.sh
```

This script automatically:
- ✅ Checks simulator status
- ✅ Unlocks the simulator
- ✅ Launches your app
- ✅ Handles everything for you!

### Step 2: If Script Doesn't Work

**Manual unlock in 3 commands:**
```bash
# 1. Unlock the simulator
osascript -e 'tell application "Simulator" to activate' \
          -e 'tell application "System Events" to keystroke "l" using command down'

# 2. Wait a moment
sleep 2

# 3. Launch the app
npx react-native run-ios
```

---

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Navigate to project
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Make script executable (only needed once)
chmod +x run-ios-unlocked.sh

# Run the app with auto-unlock
./run-ios-unlocked.sh
```

### Every Subsequent Run
```bash
./run-ios-unlocked.sh
```

---

## 🔧 Alternative Solutions

### Option A: Physical Unlock
1. Find the **iOS Simulator** window on your Mac
2. Click on the simulator window
3. Press **`Cmd + L`** on your keyboard
4. The lock screen will unlock
5. Run: `npx react-native run-ios`

### Option B: Restart Simulator
```bash
# Kill simulator
killall Simulator

# Wait a moment
sleep 2

# Relaunch with app
npx react-native run-ios
```

### Option C: Use Specific Simulator
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

---

## 🎨 Enhanced Workflow (Optional)

### Add npm Scripts
Edit your `package.json` and add:
```json
{
  "scripts": {
    "ios": "npx react-native run-ios",
    "ios:unlock": "./run-ios-unlocked.sh",
    "ios:clean": "cd ios && xcodebuild clean && cd .. && npx react-native run-ios"
  }
}
```

Then use:
```bash
npm run ios:unlock    # Auto-unlock and run
npm run ios:clean     # Clean build and run
```

### Add Shell Alias (Recommended!)
Add to your `~/.zshrc`:
```bash
# iOS Development Aliases
alias iosrun='./run-ios-unlocked.sh'
alias iosclean='cd ios && xcodebuild clean && cd .. && ./run-ios-unlocked.sh'
alias ioskill='killall Simulator'
```

Then reload shell:
```bash
source ~/.zshrc
```

Now from your project directory:
```bash
iosrun        # Quick launch with auto-unlock
iosclean      # Clean build + launch
ioskill       # Kill simulator
```

---

## 🔍 Troubleshooting

### Issue 1: "Simulator not found"
**Solution:**
```bash
# Open simulator first
open -a Simulator

# Wait for it to start
sleep 5

# Then run
./run-ios-unlocked.sh
```

### Issue 2: "Build succeeds but app doesn't appear"
**Solution:**
```bash
# Check what's booted
xcrun simctl list devices | grep Booted

# Restart simulator
killall Simulator
sleep 2

# Try again
./run-ios-unlocked.sh
```

### Issue 3: "Permission denied" for script
**Solution:**
```bash
chmod +x run-ios-unlocked.sh
```

### Issue 4: Still getting lock error
**Solution - Nuclear Option:**
```bash
# 1. Close all simulators
killall Simulator

# 2. Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 3. Clear iOS build
cd ios && xcodebuild clean && cd ..

# 4. Reinstall pods
cd ios && pod install && cd ..

# 5. Run with auto-unlock
./run-ios-unlocked.sh
```

---

## 📱 Understanding the Error

### What Error Code 10002 Means
```
com.apple.dt.CoreDeviceError error 10002 (0x2712)
```
- **10002** = Device/Simulator is in a locked state
- **NOT a build error** - your code compiled fine!
- **Just a UI state issue** - simulator screen is locked

### Why It Happens
- Simulator locks automatically after inactivity (like a real iPhone)
- Running `npx react-native run-ios` builds app successfully
- But can't launch because simulator UI is locked
- Need to unlock before app can open

### Why It's Not Serious
- ✅ Your code is fine
- ✅ Your build is fine
- ✅ Your setup is fine
- 🔒 Just need to unlock the screen

---

## ✅ Prevention Checklist

Before running iOS builds:

- [ ] **Simulator is open** - `open -a Simulator`
- [ ] **Simulator is unlocked** - Press `Cmd + L`
- [ ] **Using auto-unlock script** - `./run-ios-unlocked.sh`
- [ ] **Metro bundler running** - Should start automatically

---

## 🎯 Best Practices

### Daily Development Workflow

```bash
# Morning startup:
1. Open Terminal
2. cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
3. ./run-ios-unlocked.sh

# That's it! Everything else is automatic.
```

### When Making Code Changes

```bash
# Code is hot-reloaded automatically!
# No need to rebuild unless you:
# - Add new native dependencies
# - Change native code
# - Modify iOS configuration

# If rebuild needed:
./run-ios-unlocked.sh
```

### Clean Build (When Things Go Wrong)

```bash
# Full clean and rebuild:
cd ios
xcodebuild clean
pod install
cd ..
./run-ios-unlocked.sh
```

---

## 📊 Success Indicators

After running `./run-ios-unlocked.sh`, you should see:

```
🚀 Starting iOS build process...

📱 Checking simulator status...
✅ Simulator is running

🔓 Unlocking simulator...
✅ Simulator unlocked

🚀 Launching React Native app...

info Building (using "xcodebuild -workspace Yoraa.xcworkspace...")
success Successfully built the app
info Installing "/path/to/build/..."
info Launching "com.yoraaapparelsprivatelimited.yoraa"
success Successfully launched the app on the simulator
```

---

## 🆘 Quick Reference

| Problem | Command |
|---------|---------|
| **Quick launch** | `./run-ios-unlocked.sh` |
| **Manual unlock** | Press `Cmd + L` in simulator |
| **Restart simulator** | `killall Simulator` |
| **Clean build** | `cd ios && xcodebuild clean && cd ..` |
| **Reinstall pods** | `cd ios && pod install && cd ..` |
| **Check running simulator** | `xcrun simctl list devices \| grep Booted` |
| **List all simulators** | `xcrun simctl list devices` |

---

## 🎉 Summary

**The Fix:**
```bash
./run-ios-unlocked.sh
```

That's literally all you need! The script handles:
- ✅ Simulator unlock
- ✅ App building
- ✅ App launching
- ✅ Error handling

**No more lock screen errors!** 🎊

---

## 📞 If You Still Have Issues

1. **Try the nuclear option** (full clean rebuild):
   ```bash
   killall Simulator
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   cd ios && xcodebuild clean && pod install && cd ..
   ./run-ios-unlocked.sh
   ```

2. **Check Xcode directly**:
   ```bash
   open ios/Yoraa.xcworkspace
   # Then build from Xcode (Cmd + R)
   ```

3. **Verify simulator health**:
   ```bash
   xcrun simctl list devices
   # Look for any errors or invalid devices
   ```

---

**Created:** November 24, 2025  
**Last Updated:** November 24, 2025  
**Status:** ✅ Working Solution Provided
