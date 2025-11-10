# App Store Upload Issues - Resolution Guide

## Issues Resolved

### 1. ✅ Missing BGTaskSchedulerPermittedIdentifiers

**Error:**
```
Missing info.plist key "BGTaskSchedulerPermittedIdentifiers" must contain a plist for the hermes framework
```

**Resolution:**
- Added `BGTaskSchedulerPermittedIdentifiers` key to `Info.plist`
- Added `processing` to `UIBackgroundModes` array
- This allows the app to schedule background tasks

**Location:** `ios/YoraaApp/Info.plist`

```xml
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
</array>
```

---

### 2. ✅ Missing dSYM for Hermes Framework

**Error:**
```
Upload Symbol File: The archive's dSYM folder doesn't include a DWARF file for the hermes framework
```

**Resolution:**
Multiple layers of fixes implemented:

#### A. Podfile Configuration
The `Podfile` already includes post_install hooks to:
- Set `DEBUG_INFORMATION_FORMAT = 'dwarf-with-dsym'` for Release builds
- Set `GENERATE_DSYM = 'YES'`
- Disable stripping for Hermes framework

#### B. Build Script
Created `ios/fix-upload-issues.sh` that:
- Automatically generates Hermes dSYM during Archive builds
- Verifies dSYM UUID matches
- Copies dSYM to proper location
- Runs only for Release configurations

---

## How to Upload to App Store

### Step 1: Clean Build
```bash
cd ios
rm -rf build
rm -rf Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### Step 2: Install Pods
```bash
pod install
```

### Step 3: Archive in Xcode

1. Open `Yoraa.xcworkspace` in Xcode (NOT .xcodeproj)
2. Select "Any iOS Device (arm64)" or a real device as build target
3. Product → Scheme → Edit Scheme
4. Under "Archive" → Build Configuration → Select "Release"
5. Close scheme editor
6. Product → Archive
7. Wait for archive to complete

### Step 4: Validate Archive

1. In Organizer window, select your archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Click "Next"
5. Select "Upload"
6. Click "Next" and let Xcode validate

### Step 5: Fix Any Remaining Issues

If you still see warnings about missing dSYM:

```bash
cd ios
./fix-upload-issues.sh
```

Then create a new archive.

---

## Verification Checklist

Before uploading, verify:

- [ ] `Info.plist` contains `BGTaskSchedulerPermittedIdentifiers`
- [ ] Build configuration is set to "Release"
- [ ] Archive build succeeded without errors
- [ ] Archive includes dSYM files (check in Organizer)
- [ ] App validation passes in Xcode

---

## Optional: Manual dSYM Fix

If automatic fixes don't work, run manually:

```bash
cd ios

# Find Hermes framework
HERMES_FRAMEWORK=$(find Pods -name "hermes.framework" -type d | head -1)

# Generate dSYM
xcrun dsymutil "$HERMES_FRAMEWORK/hermes" -o "$HERMES_FRAMEWORK.dSYM"

# Verify
xcrun dwarfdump --uuid "$HERMES_FRAMEWORK.dSYM"
```

---

## Build Settings Verification

In Xcode, verify these settings for **Release** configuration:

1. Target → Build Settings
2. Search for "Debug Information Format"
3. Ensure it's set to: **DWARF with dSYM File**
4. Search for "Strip Debug Symbols During Copy"
5. For main target: **YES**
6. For Hermes: **NO** (handled by Podfile)

---

## Common Issues & Solutions

### Issue: "Upload Symbol File" Warning Persists

**Solution:**
This is often a warning that doesn't prevent upload. Apple will generate dSYMs server-side if needed. You can safely proceed with upload.

### Issue: "Missing Compliance" After Upload

**Solution:**
In App Store Connect:
1. Go to your app version
2. Answer export compliance questions
3. Usually answer "No" if not using custom encryption beyond HTTPS

### Issue: Build Fails with "Undefined symbols"

**Solution:**
```bash
cd ios
pod deintegrate
pod install
```

Clean build and try again.

---

## Next Steps After Upload

1. Wait for processing (15-30 minutes)
2. Check App Store Connect for build status
3. Add to TestFlight or submit for review
4. Monitor crash reports in Xcode Organizer

---

## Files Modified

1. `ios/YoraaApp/Info.plist` - Added BGTaskSchedulerPermittedIdentifiers
2. `ios/fix-upload-issues.sh` - Created build script for dSYM fixes
3. `ios/Podfile` - Already had dSYM fixes in place

---

## References

- [Apple: Generating dSYM Files](https://developer.apple.com/documentation/xcode/building-your-app-to-include-debugging-information)
- [React Native: Hermes](https://reactnative.dev/docs/hermes)
- [BGTaskScheduler Documentation](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler)
