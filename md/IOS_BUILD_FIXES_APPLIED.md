# iOS Build Fixes Applied - November 8, 2025

## 🎯 Issues Fixed

### 1. **Xcode 16 Linker Errors**
   - ❌ `CoreAudioTypes framework not found`
   - ❌ `SwiftUICore cannot be linked directly`
   - ❌ `Symbol(s) not found for architecture arm64`

### 2. **Build Configuration Issues**
   - Fixed user script sandboxing
   - Fixed architecture settings
   - Fixed deployment target consistency

---

## ✅ Applied Fixes

### Podfile Updates

Added comprehensive post-install hooks to fix:

1. **Weak Framework Linking**
   ```ruby
   config.build_settings['OTHER_LDFLAGS'] ||= ['$(inherited)']
   config.build_settings['OTHER_LDFLAGS'] << '-Wl,-weak_framework,CoreAudioTypes'
   ```

2. **User Script Sandboxing** (Xcode 16 requirement)
   ```ruby
   config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
   ```

3. **Architecture Settings**
   ```ruby
   config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
   config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'i386'
   ```

4. **Deployment Target**
   ```ruby
   config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
   ```

---

## 🚀 Build Scripts Created

### 1. `fix-and-build-ios.sh`
Complete build preparation script that:
- Cleans all build artifacts
- Clears caches (npm, watchman, metro)
- Reinstalls dependencies
- Runs pod install with updates
- Verifies configuration

**Usage:**
```bash
./fix-and-build-ios.sh
```

### 2. `ios/fix-xcode16-linker.sh`
Targeted fix for Xcode 16 linker issues

**Usage:**
```bash
cd ios && ./fix-xcode16-linker.sh
```

---

## 📋 Build Commands

### Quick Build (Recommended)
```bash
# Clean and rebuild everything
./fix-and-build-ios.sh

# Then build
npx react-native run-ios
```

### Simulator Build
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Device Build
```bash
npx react-native run-ios --device
```

### Xcode Build
```bash
open ios/Yoraa.xcworkspace
# Then: Product → Build (⌘B)
```

---

## 🔍 If Build Still Fails

### Step 1: Clean Everything
```bash
cd ios
rm -rf build/ Pods/ Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
cd ..
```

### Step 2: Clear React Native Cache
```bash
npm start -- --reset-cache
# Or
npx react-native start --reset-cache
```

### Step 3: Reinstall Pods
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
cd ..
```

### Step 4: Clean Xcode
In Xcode:
- Product → Clean Build Folder (⌘⇧K)
- Close Xcode
- Reopen and build

---

## 🐛 Common Error Solutions

### Error: "Framework not found CoreAudioTypes"
**Fixed by:** Weak framework linking in Podfile
**Verify:** Check `OTHER_LDFLAGS` in build settings

### Error: "Symbol(s) not found for architecture arm64"
**Fixed by:** Architecture settings in Podfile
**Verify:** Check `ONLY_ACTIVE_ARCH` and `EXCLUDED_ARCHS`

### Error: "User script sandboxing"
**Fixed by:** `ENABLE_USER_SCRIPT_SANDBOXING = NO`
**Verify:** Check in Xcode build settings

### Error: "Unable to boot simulator"
```bash
# Kill simulator
killall Simulator

# Restart simulator
open -a Simulator
```

---

## �� Key Files Modified

1. **`ios/Podfile`**
   - Added comprehensive post_install fixes
   - Added weak framework linking
   - Added architecture fixes

2. **`fix-and-build-ios.sh`**
   - New comprehensive build preparation script

3. **`ios/fix-xcode16-linker.sh`**
   - New targeted linker fix script

---

## ✅ Verification Checklist

After running fixes, verify:

- [ ] No linker errors
- [ ] Build completes successfully
- [ ] App installs on device/simulator
- [ ] App launches without crashes
- [ ] Firebase works
- [ ] All permissions work

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `./fix-and-build-ios.sh` | Complete clean and rebuild |
| `npx react-native run-ios` | Build and run on simulator |
| `npx react-native run-ios --device` | Build and run on device |
| `open ios/Yoraa.xcworkspace` | Open in Xcode |
| `pod install` | Reinstall CocoaPods |
| `npm start -- --reset-cache` | Clear React Native cache |

---

## 📞 Support

If issues persist:

1. **Check Xcode version:**
   ```bash
   xcodebuild -version
   ```

2. **Check CocoaPods version:**
   ```bash
   pod --version
   ```

3. **Check Node version:**
   ```bash
   node --version
   ```

4. **View full build log:**
   ```bash
   npx react-native run-ios 2>&1 | tee build.log
   ```

---

## 🔗 Related Documentation

- [Xcode 16 Release Notes](https://developer.apple.com/documentation/xcode-release-notes)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [CocoaPods Guides](https://guides.cocoapods.org/)

---

**Last Updated:** November 8, 2025  
**Xcode Version:** 16+  
**React Native Version:** 0.80.2  
**iOS Deployment Target:** 13.4+

---

## ✨ Success Indicators

If build is successful, you should see:
```
info Installing "com.yoraaapparelsprivatelimited.yoraa"
info Launching "com.yoraaapparelsprivatelimited.yoraa"
success Successfully launched the app on the device
```

---
