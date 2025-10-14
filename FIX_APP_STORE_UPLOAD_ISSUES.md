# App Store Upload Issues - Resolution Guide

## Issues Fixed

### ✅ Issue 1: BGTaskSchedulerPermittedIdentifiers - FIXED
**Problem:** Missing Info.plist value for BGTaskSchedulerPermittedIdentifiers

**Solution:** Updated `ios/YoraaApp/Info.plist` to use the actual bundle identifier instead of the variable:
```xml
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>com.yoraaapparelsprivatelimited.yoraa</string>
</array>
```

### ⚠️ Issue 2: Upload Symbols Failed - ACTION REQUIRED
**Problem:** The dSYM file UUIDs don't match the expected UUIDs for the app binary.

**Root Cause:** This typically happens when:
- Build artifacts are cached and out of sync
- Multiple builds exist with different symbols
- Archive was created from a dirty build state

## Steps to Fix Symbol Upload Issue

### Step 1: Clean Build Environment in Xcode

1. **Open Xcode:**
   ```bash
   open /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios/Yoraa.xcworkspace
   ```

2. **In Xcode Menu:**
   - Product → Clean Build Folder (Shift + Cmd + K)
   - Or hold Option key: Product → Clean Build Folder

3. **Close Xcode completely**

### Step 2: Clean DerivedData (Choose ONE method)

**Method A: Using Finder (Safer)**
1. Open Finder
2. Press `Cmd + Shift + G`
3. Go to: `~/Library/Developer/Xcode/DerivedData`
4. Delete all folders inside (or just the Yoraa-related ones)

**Method B: Using Terminal**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
```

### Step 3: Clean Archives (Optional but Recommended)
```bash
# List existing archives
ls -la ~/Library/Developer/Xcode/Archives/

# If you want to start fresh, remove old archives for Yoraa
# Be careful - this removes ALL archives for this app!
# find ~/Library/Developer/Xcode/Archives -name "*Yoraa*" -type d
```

### Step 4: Rebuild and Archive in Xcode

1. **Open Xcode:**
   ```bash
   open /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios/Yoraa.xcworkspace
   ```

2. **Select the correct scheme:**
   - Click on the scheme dropdown (top left)
   - Select "Yoraa" (not YoraaApp)
   - Select "Any iOS Device (arm64)" as the destination

3. **Create Archive:**
   - Product → Archive
   - Wait for the archive to complete

4. **Verify Debug Symbols are included:**
   - In the Organizer window that appears
   - Right-click on your new archive → Show in Finder
   - Right-click the .xcarchive → Show Package Contents
   - Navigate to: `dSYMs/`
   - Verify that `Yoraa.app.dSYM` exists

### Step 5: Upload to App Store

1. **In Xcode Organizer:**
   - Select your new archive
   - Click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload"
   - Check "Include bitcode" (if available)
   - Check "Upload your app's symbols" ✅ IMPORTANT
   - Click "Next" and follow the prompts

2. **Verify Upload:**
   - Go to App Store Connect
   - Check that the build appears
   - Verify symbols were uploaded (should show "Yes" in the build details)

## Alternative: Command Line Archive (Advanced)

If you prefer command line, you can create the archive using:

```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios

# Clean
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa

# Archive
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release \
  -archivePath ~/Desktop/Yoraa.xcarchive \
  -destination 'generic/platform=iOS' \
  DEBUG_INFORMATION_FORMAT=dwarf-with-dsym

# Export for App Store
xcodebuild -exportArchive \
  -archivePath ~/Desktop/Yoraa.xcarchive \
  -exportPath ~/Desktop/YoraaExport \
  -exportOptionsPlist exportOptions.plist
```

## Troubleshooting

### If symbols still don't match:
1. Check that you're using the same Xcode version for building and uploading
2. Verify code signing is correct (check Certificates in Xcode)
3. Make sure you're selecting "Any iOS Device" not a simulator
4. Ensure you're building the Release configuration, not Debug

### If BGTaskSchedulerPermittedIdentifiers error persists:
The Info.plist has been updated, but make sure:
1. You're uploading a NEW archive created AFTER the fix
2. The bundle identifier matches: `com.yoraaapparelsprivatelimited.yoraa`

## Quick Verification Checklist

Before uploading:
- [ ] Info.plist contains correct BGTaskSchedulerPermittedIdentifiers
- [ ] DerivedData has been cleaned
- [ ] New archive created with Release configuration
- [ ] Archive destination is "Any iOS Device (arm64)"
- [ ] dSYM files exist in the archive
- [ ] "Upload your app's symbols" is checked during upload
- [ ] Code signing is valid

## Expected Result

After following these steps:
✅ No BGTaskSchedulerPermittedIdentifiers error
✅ Symbols upload successfully
✅ Build appears in App Store Connect
✅ Build is ready for TestFlight or App Review

---

**Note:** The most important fix is cleaning your build environment and creating a fresh archive. The symbol mismatch happens because old build artifacts are being mixed with new ones.
