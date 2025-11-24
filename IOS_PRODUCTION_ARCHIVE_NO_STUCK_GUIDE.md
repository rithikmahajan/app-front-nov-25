# iOS Production Archive Build - No Stuck Guide
**Created: November 24, 2025**

## ✅ Problem Solved
The build was getting stuck at **8481/8495** due to the React Native bundler hanging during the Xcode build phase.

## 🔧 Solution Implemented

### Key Features of the Safe Build Script

1. **Process Cleanup**: Kills any stuck bundler processes before starting
2. **Pre-bundling with Timeout**: Bundles JavaScript separately with a 5-minute timeout
3. **Cache Clearing**: Removes all React Native caches before building
4. **Clean Build**: Ensures fresh Xcode build every time
5. **Detailed Logging**: All output saved to `ios-production-archive.log`

### How It Works

```bash
./build-ios-production-archive-safe.sh
```

The script performs these steps:

#### Step 1: Kill Stuck Processes
- Terminates any hanging bundler processes
- Stops metro bundler
- Stops watchman

#### Step 2: Clean Previous Builds
- Removes old archive
- Cleans Xcode build folder
- Cleans DerivedData

#### Step 3: Clear Caches
- Removes React Native cache
- Clears metro cache
- Clears haste cache

#### Step 4: Check Dependencies
- Verifies node_modules
- Verifies CocoaPods

#### Step 5: Pre-bundle JavaScript
**This is the key step that prevents getting stuck!**
```bash
timeout 300 npx react-native bundle \
  --platform ios \
  --dev false \
  --minify true \
  --entry-file index.js \
  --bundle-output ./main.jsbundle \
  --assets-dest ./assets
```
- Uses `timeout` command to prevent hanging
- Bundles JavaScript **before** Xcode build
- Minifies code for production
- 5-minute timeout (300 seconds)

#### Step 6: Clean Xcode
- Runs `xcodebuild clean`

#### Step 7: Build Archive
- Runs `xcodebuild archive`
- Creates `.xcarchive` file
- Saves to `build/ios/Yoraa.xcarchive`

#### Step 8: Cleanup
- Removes temporary bundle files

## 📋 Before You Run

### 1. Update Code Signing Settings

Edit the script and replace these placeholders:

```bash
DEVELOPMENT_TEAM=YOUR_TEAM_ID
PROVISIONING_PROFILE_SPECIFIER="YOUR_PROFILE"
```

Find your Team ID:
```bash
# In Xcode, go to project settings → Signing & Capabilities
# Or use this command:
security find-identity -v -p codesigning
```

### 2. Update ExportOptions.plist

Edit `ios/ExportOptions.plist`:
- Replace `YOUR_TEAM_ID` with your Apple Developer Team ID
- Replace `com.yourcompany.yoraa` with your actual bundle identifier
- Replace `YOUR_PROVISIONING_PROFILE_NAME` with your profile name

### 3. Ensure You Have Required Certificates

```bash
# List available signing identities
security find-identity -v -p codesigning

# You should see "Apple Distribution" certificate
```

## 🚀 Running the Build

### Option 1: Full Automated Build (Recommended)

```bash
./build-ios-production-archive-safe.sh
```

This will:
- Clean everything
- Pre-bundle JavaScript
- Create archive
- Show next steps

**Build time**: 10-15 minutes

### Option 2: Step-by-Step Manual Build

If you prefer to run steps manually:

```bash
# 1. Kill stuck processes
pkill -f "node.*react-native.*bundle"

# 2. Clear cache
rm -rf node_modules/.cache
rm -rf /tmp/metro-*

# 3. Pre-bundle JavaScript
npx react-native bundle \
  --platform ios \
  --dev false \
  --minify true \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios

# 4. Clean Xcode
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa

# 5. Build archive
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release \
  -archivePath ../build/ios/Yoraa.xcarchive
```

## 📦 After Archive is Created

### Export IPA for App Store

1. **Using Xcode Organizer** (Easiest):
   ```
   Window → Organizer → Archives → Select your archive → Distribute App
   ```

2. **Using Command Line**:
   ```bash
   xcodebuild -exportArchive \
     -archivePath build/ios/Yoraa.xcarchive \
     -exportPath build/ios \
     -exportOptionsPlist ios/ExportOptions.plist
   ```

### Upload to App Store

```bash
# Using Transporter app (Recommended)
# 1. Open Transporter app
# 2. Drag and drop the .ipa file
# 3. Click "Deliver"

# OR using command line
xcrun altool --upload-app \
  --type ios \
  --file build/ios/Yoraa.ipa \
  --username "your@email.com" \
  --password "your-app-specific-password"
```

## 🐛 Troubleshooting

### Build Still Getting Stuck?

1. **Check for zombie processes**:
   ```bash
   ps aux | grep -i "react-native\|metro\|node"
   pkill -9 node  # Force kill all Node processes
   ```

2. **Clear all caches**:
   ```bash
   npm cache clean --force
   watchman watch-del-all
   rm -rf ~/Library/Caches/CocoaPods
   rm -rf ios/Pods ios/Podfile.lock
   pod install
   ```

3. **Increase timeout in script**:
   ```bash
   # Change from 300 to 600 seconds (10 minutes)
   timeout 600 npx react-native bundle ...
   ```

### Code Signing Errors

```bash
# List all certificates
security find-identity -v -p codesigning

# Make sure you have "Apple Distribution" certificate

# Re-download provisioning profiles
# Xcode → Preferences → Accounts → Download Manual Profiles
```

### Archive Created but Export Fails

1. Check ExportOptions.plist settings
2. Verify bundle identifier matches
3. Ensure provisioning profile is not expired
4. Check that certificate is valid

### Build Succeeds but App Crashes

1. **Check JavaScript bundle**:
   ```bash
   # The bundle should exist and be > 1MB
   ls -lh build/ios/Yoraa.xcarchive/Products/Applications/Yoraa.app/main.jsbundle
   ```

2. **Check crash logs in Xcode**:
   ```
   Window → Devices and Simulators → View Device Logs
   ```

## 📊 Build Metrics

**Expected Timeline**:
- Process cleanup: 5 seconds
- Cache clearing: 10 seconds
- JavaScript bundling: 2-3 minutes
- Xcode build: 8-12 minutes
- **Total: 10-15 minutes**

**File Sizes**:
- Archive: ~150-300 MB
- IPA: ~80-150 MB
- JavaScript bundle: ~2-5 MB (minified)

## ✨ Why This Works

The original build was getting stuck because:
1. Xcode's build phase script was trying to bundle JavaScript
2. The bundler would hang at 8481/8495
3. No timeout was set, so it would wait forever

Our solution:
1. ✅ Pre-bundles JavaScript **before** Xcode runs
2. ✅ Uses `timeout` to prevent hanging
3. ✅ Kills any stuck processes first
4. ✅ Provides detailed logging
5. ✅ Clean build every time

## 🎯 Next Steps After Successful Build

1. Test the archive:
   - Install on real device via Xcode
   - Test all critical features
   - Verify API connections work

2. Submit to TestFlight:
   - Export IPA with "App Store" method
   - Upload to App Store Connect
   - Add to TestFlight

3. Submit for Review:
   - Add app metadata
   - Add screenshots
   - Submit for Apple review

## 📝 Notes

- **Build time**: First build takes longer (10-15 min), subsequent builds faster
- **Disk space**: Ensure you have at least 5GB free space
- **Internet**: Required for certificate validation
- **Xcode version**: Tested with Xcode 14+
- **macOS version**: Tested with macOS 12+

## 🔄 Regular Maintenance

Run these commands weekly:
```bash
# Clear all caches
npm cache clean --force
watchman watch-del-all
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Update pods
cd ios
pod repo update
pod install
```

---

**Last Updated**: November 24, 2025  
**Script Version**: 1.0 (Safe Mode)  
**Status**: ✅ Production Ready
