# Dependency Recovery Guide - Yoraa App

**Last Updated:** November 24, 2025  
**Project:** Yoraa React Native App (iOS & Android)

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Node.js & NPM Setup](#nodejs--npm-setup)
3. [iOS Dependencies (CocoaPods)](#ios-dependencies-cocoapods)
4. [Android Dependencies](#android-dependencies)
5. [Complete Recovery Steps](#complete-recovery-steps)
6. [Verification Steps](#verification-steps)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Current Working Environment
- **OS:** macOS 26.1 (arm64/Apple Silicon)
- **Xcode:** 16.4 (Build version 16F6)
- **Node.js:** v20.19.5
- **NPM:** 10.8.2
- **Ruby:** 3.2.2 (2023-03-30)
- **RubyGems:** 3.4.10
- **CocoaPods:** 1.16.2
- **Gradle:** 8.14.1
- **Java:** 17.0.12 (Eclipse Adoptium)

---

## 📦 Node.js & NPM Setup

### Installing Node.js

```bash
# Using NVM (Node Version Manager) - Recommended
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install specific Node version
nvm install 20.19.5
nvm use 20.19.5
nvm alias default 20.19.5

# Verify installation
node --version  # Should output: v20.19.5
npm --version   # Should output: 10.8.2
```

### Package Dependencies

#### Production Dependencies (from package.json)

```json
{
  "@invertase/react-native-apple-authentication": "^2.4.1",
  "@react-native-async-storage/async-storage": "^1.24.0",
  "@react-native-community/datetimepicker": "^8.4.5",
  "@react-native-community/netinfo": "^11.4.1",
  "@react-native-community/slider": "^5.0.1",
  "@react-native-firebase/app": "^23.4.0",
  "@react-native-firebase/auth": "^23.4.0",
  "@react-native-firebase/messaging": "^23.4.0",
  "@react-native-google-signin/google-signin": "^15.0.0",
  "@react-native-picker/picker": "^2.11.4",
  "@react-native-voice/voice": "^3.2.4",
  "@react-native/new-app-screen": "0.80.2",
  "@reduxjs/toolkit": "^2.9.0",
  "axios": "^1.12.2",
  "base-64": "^1.0.0",
  "invariant": "^2.2.4",
  "react": "19.1.0",
  "react-native": "0.80.2",
  "react-native-config": "^1.5.9",
  "react-native-element-dropdown": "^2.12.4",
  "react-native-gesture-handler": "^2.28.0",
  "react-native-image-picker": "^8.2.1",
  "react-native-permissions": "^5.4.2",
  "react-native-qrcode-scanner": "^1.5.5",
  "react-native-razorpay": "^2.3.0",
  "react-native-svg": "^15.13.0",
  "react-native-video": "^6.17.0",
  "react-native-vision-camera": "^4.7.2",
  "react-native-webview": "^13.16.0",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0"
}
```

#### Development Dependencies (from package.json)

```json
{
  "@babel/core": "^7.28.4",
  "@babel/preset-env": "^7.28.3",
  "@babel/runtime": "^7.28.4",
  "@react-native-community/cli": "latest",
  "@react-native-community/cli-platform-android": "latest",
  "@react-native-community/cli-platform-ios": "latest",
  "@react-native/babel-preset": "0.80.2",
  "@react-native/eslint-config": "0.80.2",
  "@react-native/metro-config": "0.80.2",
  "eslint": "^8.19.0",
  "express": "^5.1.0",
  "http-proxy-middleware": "^3.0.5",
  "jest": "^29.6.3",
  "prettier": "2.8.8",
  "react-test-renderer": "19.1.0"
}
```

### Installing NPM Dependencies

```bash
# Navigate to project root
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Clean install (recommended for recovery)
rm -rf node_modules
rm package-lock.json

# Install all dependencies
npm install

# Or use clean cache if needed
npm cache clean --force
npm install
```

---

## 🍎 iOS Dependencies (CocoaPods)

### Installing Ruby & CocoaPods

```bash
# Ruby should be 3.2.2 or compatible
ruby --version

# Install CocoaPods (if not installed)
sudo gem install cocoapods -v 1.16.2

# Or use latest
sudo gem install cocoapods

# Verify installation
pod --version  # Should output: 1.16.2
```

### Podfile Configuration

**Location:** `ios/Podfile`

**Key Settings:**
- **Platform:** iOS 13.4+ (minimum)
- **Use Frameworks:** Static linkage (required for Firebase)
- **Hermes:** Enabled
- **Fabric (New Architecture):** Disabled

**Permissions Required:**
- Camera
- Microphone
- SpeechRecognition

### Key CocoaPods Dependencies

```ruby
# Firebase SDK
pod 'Firebase/Core'
pod 'Firebase/Auth'
pod 'Firebase/Messaging'
pod 'FirebaseAppCheck'

# Google reCAPTCHA Enterprise
pod 'RecaptchaEnterprise'
```

### Auto-linked React Native Pods

The following are auto-linked via `use_native_modules!`:
- React Native core libraries
- React Native Firebase modules
- React Native Permissions
- React Native Camera/Vision Camera
- All other RN libraries in package.json

### Installing CocoaPods

```bash
# Navigate to iOS directory
cd ios

# Clean CocoaPods installation (recommended for recovery)
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Deintegrate (if previously installed)
pod deintegrate

# Install pods
pod install --repo-update

# Or for troubleshooting
pod install --repo-update --verbose

# Return to project root
cd ..
```

### Critical Xcode 16 Compatibility Settings

The Podfile includes **essential post_install hooks** for Xcode 16 compatibility:

1. **Disable User Script Sandboxing** (CRITICAL)
   ```ruby
   config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
   ```

2. **Consistent Deployment Target**
   ```ruby
   config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
   ```

3. **Exclude arm64 for Simulator** (Firebase compatibility)
   ```ruby
   config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
   ```

4. **RCT-Folly C++20 Fix** (Xcode 16)
   - Automated sed commands fix New.h compatibility

---

## 🤖 Android Dependencies

### System Requirements

- **Java:** 17.0.12 (Eclipse Adoptium)
- **Gradle:** 8.14.1
- **Build Tools Version:** From root build.gradle
- **Compile SDK:** From root build.gradle
- **Min SDK:** From root build.gradle
- **Target SDK:** From root build.gradle

### Installing Java

```bash
# Using SDKMAN (recommended)
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 17
sdk install java 17.0.12-tem
sdk use java 17.0.12-tem

# Verify
java -version
```

### Gradle Configuration

**Location:** `android/gradle.properties`

**Key Settings:**
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

### Installing Android Dependencies

```bash
# Navigate to android directory
cd android

# Clean build (recommended for recovery)
./gradlew clean

# Build to download dependencies
./gradlew assembleDebug

# Or for release
./gradlew assembleRelease

# Return to project root
cd ..
```

---

## 🔄 Complete Recovery Steps

### Full Clean Installation (From Scratch)

```bash
#!/bin/bash
# Complete dependency recovery script

PROJECT_DIR="/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10"

echo "🧹 Step 1: Cleaning existing installations..."
cd "$PROJECT_DIR"

# Clean Node modules
rm -rf node_modules
rm -f package-lock.json

# Clean iOS
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods
pod deintegrate
cd ..

# Clean Android
cd android
./gradlew clean
cd ..

# Clean Metro bundler cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*
watchman watch-del-all

echo "📦 Step 2: Installing Node dependencies..."
npm install

echo "🍎 Step 3: Installing iOS dependencies..."
cd ios
pod install --repo-update
cd ..

echo "🤖 Step 4: Installing Android dependencies..."
cd android
./gradlew assembleDebug
cd ..

echo "✅ Recovery complete!"
```

### Quick Recovery (Partial Clean)

```bash
#!/bin/bash
# Quick dependency recovery

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Reinstall node modules
rm -rf node_modules && npm install

# Reinstall pods
cd ios && rm -rf Pods && pod install && cd ..

# Clean Android build
cd android && ./gradlew clean && cd ..

echo "✅ Quick recovery complete!"
```

---

## ✅ Verification Steps

### Verify Node Installation

```bash
node --version    # Should be v20.19.5
npm --version     # Should be 10.8.2
npm list --depth=0  # Should show all packages without errors
```

### Verify iOS Installation

```bash
cd ios
pod --version     # Should be 1.16.2
ls Pods           # Should show all installed pods
cd ..
```

### Verify Android Installation

```bash
cd android
./gradlew --version  # Should show Gradle 8.14.1
./gradlew tasks     # Should list all tasks without errors
cd ..
```

### Test Builds

```bash
# iOS (requires Mac with Xcode)
npm run ios

# Android
npm run android

# Or production builds
npm run ios:prod
npm run android:prod
```

---

## 🔧 Troubleshooting

### Common Node.js Issues

#### Issue: `npm install` fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Version mismatch errors

```bash
# Use exact Node version
nvm install 20.19.5
nvm use 20.19.5

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### Common CocoaPods Issues

#### Issue: `pod install` fails

```bash
# Update CocoaPods repo
pod repo update

# Clear CocoaPods cache
rm -rf ~/Library/Caches/CocoaPods
pod cache clean --all

# Deintegrate and reinstall
cd ios
pod deintegrate
rm -rf Pods Podfile.lock
pod install --repo-update --verbose
cd ..
```

#### Issue: Xcode build fails with sandboxing error

**Solution:** Ensure `ENABLE_USER_SCRIPT_SANDBOXING = NO` is set in Podfile post_install hook (already configured).

#### Issue: Firebase/Swift module errors

**Solution:** Already configured in Podfile:
- `EXCLUDED_ARCHS[sdk=iphonesimulator*]` = 'arm64'
- Build library for distribution enabled for Firebase pods

#### Issue: RCT-Folly build errors (Xcode 16)

**Solution:** Podfile includes automatic sed fixes for New.h file (already configured).

### Common Android Issues

#### Issue: Gradle build fails

```bash
cd android

# Clean and rebuild
./gradlew clean
./gradlew assembleDebug --stacktrace

# Clear Gradle cache if needed
rm -rf ~/.gradle/caches
./gradlew clean build
```

#### Issue: Java version mismatch

```bash
# Check current Java version
java -version

# Install correct version (17.0.12)
sdk install java 17.0.12-tem
sdk use java 17.0.12-tem
```

#### Issue: Out of memory errors

**Solution:** Already configured in gradle.properties:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### Metro Bundler Issues

```bash
# Clear Metro cache
watchman watch-del-all
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# Start with clean cache
npm start -- --reset-cache
```

---

## 📝 Important Notes

### Environment Files

The project uses environment-specific configurations:
- `.env.development` - Development environment
- `.env.production` - Production environment

Ensure these files exist with proper API keys and endpoints.

### Firebase Configuration

Required files:
- **iOS:** `ios/GoogleService-Info.plist`
- **Android:** `android/app/google-services.json`

### Code Signing (iOS)

For production builds, ensure:
- Provisioning profiles are installed
- Certificates are valid
- Bundle identifier matches

### Android Keystore

For production builds:
- Keystore file location: Check `android/app/build.gradle`
- Ensure keystore passwords are configured

---

## 🚀 Quick Reference Commands

```bash
# Full clean install
npm install && cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Production iOS build
npm run build:ios:prod

# Production Android build
npm run build:android:prod

# Clean everything
rm -rf node_modules ios/Pods android/build && npm install && cd ios && pod install && cd ..
```

---

## 📞 Support & Documentation

- **React Native:** https://reactnative.dev/docs/environment-setup
- **CocoaPods:** https://guides.cocoapods.org/
- **React Native Firebase:** https://rnfirebase.io/
- **Gradle:** https://docs.gradle.org/

---

**✨ This guide ensures you can recover from any node_modules or CocoaPods corruption without trial and error!**
