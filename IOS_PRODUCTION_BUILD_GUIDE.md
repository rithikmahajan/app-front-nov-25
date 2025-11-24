# 📱 iOS Production Release Build Guide

**Date:** November 23, 2025  
**App:** YORAA  
**Purpose:** Complete guide to build iOS production release with .env.production variables

---

## 🎯 Overview

This guide covers building a production-ready iOS app with production environment variables for App Store distribution.

---

## 📋 Prerequisites

### Required Tools
- ✅ **Xcode 15+** (latest version recommended)
- ✅ **CocoaPods** installed (`sudo gem install cocoapods`)
- ✅ **Node.js & npm** installed
- ✅ **Active Apple Developer Account** ($99/year)

### Required Files
- ✅ `.env.production` - Production environment variables
- ✅ Valid **Signing Certificate** (Distribution)
- ✅ Valid **Provisioning Profile** (App Store or Ad Hoc)

### Verify Prerequisites
```bash
# Check Xcode
xcodebuild -version

# Check CocoaPods
pod --version

# Check Node/npm
node --version
npm --version

# Check signing identity
security find-identity -v -p codesigning
```

---

## 🚀 Quick Start (Recommended Method)

### Method 1: Using Build Script (Easiest)

```bash
# Make script executable
chmod +x build-ios-production-release.sh

# Run the script
./build-ios-production-release.sh
```

The script will:
1. ✅ Copy `.env.production` → `.env` and `ios/.env`
2. ✅ Clean previous builds
3. ✅ Install dependencies (npm & pods)
4. ✅ Give you build options (Xcode or command-line)

---

## 📝 Manual Step-by-Step Process

### Step 1: Prepare Environment Variables

```bash
# Copy production env to active .env
cp .env.production .env

# Also copy to iOS folder for native access
cp .env.production ios/.env

# Verify the file
cat .env | grep API_BASE_URL
```

**Expected output:**
```
API_BASE_URL=https://api.yoraa.in.net
```

### Step 2: Clean Previous Builds

```bash
# Kill Metro bundler if running
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Clean iOS builds
cd ios
rm -rf Pods Podfile.lock build DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
cd ..
```

### Step 3: Install Dependencies

```bash
# Install npm packages
npm install

# Install CocoaPods
cd ios
pod install --repo-update
cd ..
```

### Step 4: Configure Xcode Project

Open Xcode:
```bash
open ios/Yoraa.xcworkspace
```

**Important: Always open `.xcworkspace`, NOT `.xcodeproj`**

### Step 5: Verify Build Settings

In Xcode:

1. **Select Target:** YoraaApp
2. **Signing & Capabilities:**
   - ✅ Team: Select your Apple Developer team
   - ✅ Signing Certificate: Distribution
   - ✅ Provisioning Profile: Match App ID
   
3. **Build Settings → Search "Code Signing":**
   - Code Signing Identity (Release): iOS Distribution
   - Code Signing Style: Automatic (recommended) or Manual
   
4. **General Tab:**
   - Bundle Identifier: `com.yoraa` (must match App Store)
   - Version: Update if needed (e.g., 1.2)
   - Build: Update (e.g., 12)

### Step 6: Build Archive

#### Option A: Using Xcode GUI (Recommended)

1. **Select Device:**
   - Click device dropdown at top
   - Select: **"Any iOS Device (arm64)"**
   - Do NOT select simulator

2. **Set Scheme to Release:**
   - Product → Scheme → Edit Scheme
   - Select "Archive" on left
   - Build Configuration: **Release**
   - Click "Close"

3. **Create Archive:**
   - Product → Archive
   - Wait for build to complete (5-10 minutes)
   - Archive window will open automatically

4. **Distribute App:**
   - Click "Distribute App"
   - Choose method:
     - **App Store Connect** - For TestFlight & App Store
     - **Ad Hoc** - For testing on specific devices
     - **Development** - For development devices
     - **Enterprise** - For enterprise distribution

#### Option B: Using Command Line

```bash
cd ios

# Create archive
xcodebuild clean archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -archivePath ./build/YoraaApp.xcarchive \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates

# Export IPA (create exportOptions.plist first)
xcodebuild -exportArchive \
  -archivePath ./build/YoraaApp.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist
```

---

## 📄 exportOptions.plist

Create this file at `ios/exportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

**Methods available:**
- `app-store` - App Store distribution
- `ad-hoc` - Ad Hoc testing
- `development` - Development testing
- `enterprise` - Enterprise distribution

---

## 🔐 Signing & Certificates

### Find Your Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Account → Membership
3. Copy your **Team ID**

### Create/Verify Certificates

1. **Xcode → Preferences → Accounts**
2. Select your Apple ID
3. Click "Manage Certificates"
4. Ensure you have:
   - ✅ Apple Distribution certificate
   - ✅ iOS App Store provisioning profile

### Automatic Signing (Recommended)

In Xcode:
- ✅ Enable "Automatically manage signing"
- ✅ Select your Team
- Xcode handles the rest

### Manual Signing

If you prefer manual:
1. Download certificates from Apple Developer Portal
2. Download provisioning profiles
3. Install both in Xcode
4. Select them in Build Settings

---

## 🔍 Verification Checklist

Before submitting to App Store:

### Build Configuration
- [ ] Scheme set to **Release**
- [ ] Device target is **Any iOS Device** (not simulator)
- [ ] Bundle ID matches App Store listing: `com.yoraa`
- [ ] Version number updated (if new version)
- [ ] Build number incremented

### Environment Variables
- [ ] `.env.production` copied to `.env`
- [ ] `.env.production` copied to `ios/.env`
- [ ] API_BASE_URL points to production: `https://api.yoraa.in.net`
- [ ] Razorpay uses **LIVE** keys (rzp_live_...)
- [ ] DEBUG_MODE=false
- [ ] BUILD_TYPE=release

### App Configuration
- [ ] All required app icons present (including iPad 152x152 & 167x167) ✅
- [ ] Launch screen configured
- [ ] App permissions configured (Camera, Microphone, etc.)
- [ ] Firebase configuration for production

### Code Signing
- [ ] Valid distribution certificate
- [ ] Valid provisioning profile
- [ ] Team ID configured
- [ ] Signing identity verified

### Testing
- [ ] Archive builds successfully
- [ ] No build errors or warnings (critical ones)
- [ ] App runs on physical device
- [ ] All features work with production API
- [ ] Payment flow tested with Razorpay LIVE mode

---

## 📤 Upload to App Store Connect

### Option 1: Using Xcode (Recommended)

1. After creating archive:
   - Window → Organizer → Archives
2. Select your archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Follow the wizard:
   - Upload
   - Include bitcode: NO (not needed for iOS 14+)
   - Upload symbols: YES
   - Automatically manage signing: YES
6. Click "Upload"
7. Wait for upload to complete

### Option 2: Using Transporter App

1. Export IPA from Xcode Organizer
2. Open **Transporter** app
3. Drag & drop IPA file
4. Click "Deliver"

### Option 3: Using altool (Command Line)

```bash
xcrun altool --upload-app \
  -f YoraaApp.ipa \
  -t ios \
  -u your-apple-id@email.com \
  -p your-app-specific-password
```

---

## 🧪 TestFlight Distribution

After upload to App Store Connect:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **TestFlight** tab
4. Wait for processing (10-60 minutes)
5. Add internal testers (your team)
6. Add external testers (beta users)
7. Submit for Beta App Review (if external)

---

## ❗ Common Issues & Solutions

### Issue: "No signing identity found"

**Solution:**
```bash
# Check available identities
security find-identity -v -p codesigning

# If none found, create one in Xcode:
# Xcode → Preferences → Accounts → Manage Certificates → +
```

### Issue: "Provisioning profile doesn't match"

**Solution:**
1. Xcode → Preferences → Accounts
2. Download Manual Profiles
3. Or enable "Automatically manage signing"

### Issue: "Pod install fails"

**Solution:**
```bash
cd ios
pod deintegrate
pod install --repo-update
```

### Issue: "Build fails with 'Command PhaseScriptExecution failed'"

**Solution:**
```bash
# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install
```

### Issue: "Archive validation fails - Missing icons"

**Solution:**
Already fixed! ✅ All iPad icons (152x152 and 167x167) have been added.

### Issue: "Module 'react-native-config' not found"

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
# Then clean build in Xcode (⇧⌘K)
```

### Issue: Environment variables not loading

**Solution:**
```bash
# Ensure .env files are in place
cp .env.production .env
cp .env.production ios/.env

# Verify they're being read
cat ios/.env | grep API_BASE_URL

# Clean and rebuild
cd ios && pod install
```

---

## 📊 Build Size Optimization

To reduce app size:

1. **Enable Bitcode:** ❌ Not needed for iOS 14+
2. **Optimize Images:** Use compressed assets
3. **Remove unused code:** Check imports
4. **Use App Thinning:** Automatic with App Store

---

## 🔄 Version Management

### Semantic Versioning

- **Major.Minor.Patch** (e.g., 1.2.0)
- Update in `ios/YoraaApp/Info.plist`:
  - `CFBundleShortVersionString`: Version (1.2)
  - `CFBundleVersion`: Build (12)

### In Xcode:

1. Select Target → General
2. **Version:** 1.2 (visible to users)
3. **Build:** 12 (internal tracking)

**Rules:**
- Each upload must have unique build number
- Version can stay same for hotfixes
- Increment version for new features

---

## 📚 Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [React Native iOS Build Guide](https://reactnative.dev/docs/publishing-to-app-store)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)

---

## 🎉 Success Checklist

After successful build & upload:

- [x] Archive created successfully
- [x] IPA exported without errors
- [x] Uploaded to App Store Connect
- [x] Processing complete in App Store Connect
- [x] TestFlight build available
- [x] Internal testing successful
- [x] Ready for App Store submission

---

## 📞 Quick Reference Commands

```bash
# Full production build (automated)
./build-ios-production-release.sh

# Manual steps
cp .env.production .env
cp .env.production ios/.env
npm install
cd ios && pod install && cd ..
open ios/Yoraa.xcworkspace

# Clean everything
rm -rf node_modules ios/Pods ios/Podfile.lock
npm install
cd ios && pod install

# Check signing
security find-identity -v -p codesigning

# Kill Metro
lsof -ti:8081 | xargs kill -9
```

---

## ✅ Summary

You now have:
1. ✅ Automated build script: `build-ios-production-release.sh`
2. ✅ Production environment variables configured
3. ✅ All iPad icons added (152x152, 167x167)
4. ✅ Complete build guide
5. ✅ Troubleshooting solutions

**Next Steps:**
1. Run `./build-ios-production-release.sh`
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

Good luck with your iOS release! 🚀
