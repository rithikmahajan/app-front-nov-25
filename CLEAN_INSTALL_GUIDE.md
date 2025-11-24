# Clean Install Guide - RCT-Folly Fix

## Issue
The `'folly/lang/ToAscii.h' file not found` error is caused by corrupted or incomplete pod installations with React Native 0.80.x.

## Current Status

✅ **Step 1: Fresh Node Modules Install** - IN PROGRESS
- Removed old `node_modules` and `package-lock.json`
- Running `npm install` to get fresh dependencies

## Next Steps

### Step 2: Clean iOS Pods
Once npm install completes, run:
```bash
cd ios
rm -rf Pods Podfile.lock build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod install --verbose
```

### Step 3: Build the Project
```bash
# Clean build in Xcode (Cmd+Shift+K)
# Then build (Cmd+B)

# OR from terminal:
npx react-native run-ios
```

## Backup Configurations Found

- `/ios/Podfile` - Main configuration
- `/ios/Podfile 2.lock` - Backup lock file (can compare if needed)

## Notes

- React Native version: 0.80.2
- Using Hermes engine
- Firebase integration with static frameworks
- CocoaPods version: 1.16.2

## If Issues Persist

1. Check that Xcode Command Line Tools are installed:
   ```bash
   xcode-select --install
   ```

2. Clear all caches:
   ```bash
   watchman watch-del-all
   rm -rf /tmp/metro-*
   rm -rf /tmp/haste-map-*
   npm start -- --reset-cache
   ```

3. Use the helper script:
   ```bash
   cd ios
   ./fix-folly-build.sh
   ```
