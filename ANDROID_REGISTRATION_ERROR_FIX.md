# Android "App Not Registered" Error - Complete Fix Guide

## Error Message
```
Uncaught Error
'YoraaApp' has not been registered. This can happen if:
* Metro (the local dev server) is run from the wrong folder
* A module failed to load due to an error and 'AppRegistry.registerComponent' wasn't called
```

---

## Quick Fix (Try First)

### Method 1: Reload in Metro Bundler
1. Go to the Metro bundler terminal
2. Press **`r`** to reload the app
3. Wait for the bundle to complete

### Method 2: Reload on Device
1. Shake the Android emulator (Ctrl+M or Cmd+M)
2. Select **"Reload"**
3. Wait for the app to reload

---

## Complete Fix (If Quick Fix Doesn't Work)

### Step 1: Stop Everything
```bash
# Kill all React Native processes
pkill -f "react-native"

# Kill Metro bundler
pkill -f "metro"

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Step 2: Clean All Caches
```bash
# Clean Android build
rm -rf android/app/build
rm -rf android/build

# Clean Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# Clean Watchman (if installed)
watchman watch-del-all
```

### Step 3: Start Fresh
```bash
# Start Metro with cache reset
npx react-native start --reset-cache
```

### Step 4: In a New Terminal, Build Android
```bash
# Build and install the app
npx react-native run-android
```

---

## Automated Fix Script

We've created a script that does all of the above automatically:

```bash
./fix-android-registration.sh
```

---

## Root Causes

### 1. Metro Bundler Cache Issue
- **Symptom**: App works on iOS but not Android
- **Solution**: Clear cache with `--reset-cache`

### 2. Multiple Metro Instances
- **Symptom**: Metro says "already running"
- **Solution**: Kill all metro processes before starting

### 3. Stale Build Artifacts
- **Symptom**: Error after changing app.json or index.js
- **Solution**: Clean build directories

### 4. App Name Mismatch
- **Check**: `app.json` should have:
  ```json
  {
    "name": "YoraaApp",
    "displayName": "YoraaApp"
  }
  ```
- **Check**: `index.js` should have:
  ```javascript
  AppRegistry.registerComponent('YoraaApp', () => App);
  ```

---

## Verification Steps

### 1. Check Metro Bundler
```bash
# Metro should show:
# INFO  Connection established to app='com.yoraa'
```

### 2. Check App Registration
In `index.js`, verify:
```javascript
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 3. Check Android Package Name
In `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.yoraa"  // Should match your package
    // ...
}
```

---

## Still Not Working?

### Try Complete Clean Build

```bash
# 1. Stop everything
pkill -f "react-native"
pkill -f "metro"

# 2. Clean everything
rm -rf android/app/build
rm -rf android/build
rm -rf node_modules
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# 3. Reinstall dependencies
npm install

# 4. Clean Gradle cache
cd android
./gradlew clean
cd ..

# 5. Start fresh
npx react-native start --reset-cache

# 6. In new terminal, rebuild
npx react-native run-android
```

### Check Android Manifest

In `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:name=".MainApplication"
    ...>
    <activity
        android:name=".MainActivity"
        ...>
```

Ensure `MainActivity.java` has:
```java
@Override
protected String getMainComponentName() {
    return "YoraaApp";  // Must match app.json
}
```

---

## Prevention Tips

1. **Always use `--reset-cache`** when you see registration errors
2. **Don't run multiple Metro instances** - check with `lsof -i:8081`
3. **Clean build after changing** app.json, index.js, or native code
4. **Use the fix script** for consistent cleanup

---

## Quick Commands Reference

```bash
# Reload app from Metro terminal
Press 'r'

# Open dev menu on Android
adb shell input keyevent 82

# Check Metro is running
curl http://localhost:8081/status

# List running emulators
adb devices

# Restart emulator connection
adb reverse tcp:8081 tcp:8081

# View Android logs
adb logcat | grep -i "ReactNativeJS"
```

---

## Success Indicators

✅ Metro shows: `INFO Connection established to app='com.yoraa'`
✅ Metro shows: `BUNDLE ./index.js`
✅ No red error screen on Android emulator
✅ App loads successfully

---

## Additional Resources

- [React Native Debugging Guide](https://reactnative.dev/docs/debugging)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)
- [Android Debug Bridge (ADB) Guide](https://developer.android.com/studio/command-line/adb)

---

**Last Updated**: November 24, 2025
