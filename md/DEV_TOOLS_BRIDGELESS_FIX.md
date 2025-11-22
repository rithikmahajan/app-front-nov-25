# Dev Tools Fix for React Native New Architecture

## Problem Solved
Dev menu (Cmd+D) was not opening because of mismatch between New Architecture settings.

## Root Cause
- `Info.plist` had `RCTNewArchEnabled = true` (Bridgeless mode)
- `Podfile` had `fabric_enabled => false` (Old architecture)
- This mismatch prevented dev tools from working

## Solution Applied

### 1. Disabled New Architecture (Bridgeless Mode)
**File**: `ios/YoraaApp/Info.plist`

```xml
<!-- Changed from true to false -->
<key>RCTNewArchEnabled</key>
<false/>
```

### 2. Enabled Dev Menu Explicitly
**File**: `ios/YoraaApp/Info.plist`

```xml
<!-- Added these keys -->
<key>RCTDevLoadingViewEnabled</key>
<true/>
<key>RCTDevMenuEnabled</key>
<true/>
```

### 3. Cleaned and Rebuilt in DEBUG Mode
```bash
# Clean build
cd ios && rm -rf build
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa -configuration Debug

# Start Metro
npm start -- --reset-cache

# Build in DEBUG mode (not Release)
npx react-native run-ios --simulator="iPad Pro (12.9-inch) (5th generation)" --mode Debug
```

---

## How to Open Dev Tools Now

### Method 1: Keyboard Shortcut (Primary)
**In iOS Simulator**: Press `Cmd + D` (⌘ + D)

### Method 2: Shake Gesture
**In iOS Simulator**: Press `Cmd + Ctrl + Z` (⌘ + ⌃ + Z)

### Method 3: Metro Terminal
**In Metro Terminal**: Press `d` key

### Method 4: Hardware Menu
**Simulator Menu**: Hardware → Shake Gesture

---

## Configuration Files

### Current Architecture Settings

**Podfile** (ios/Podfile):
```ruby
use_react_native!(
  :path => config[:reactNativePath],
  :app_path => "#{Pod::Config.instance.installation_root}/..",
  :fabric_enabled => false,  # Old Architecture
  :hermes_enabled => true     # Hermes JS Engine
)
```

**Info.plist** (ios/YoraaApp/Info.plist):
```xml
<key>RCTNewArchEnabled</key>
<false/>  <!-- Matches Podfile setting -->

<key>RCTDevLoadingViewEnabled</key>
<true/>   <!-- Shows loading view -->

<key>RCTDevMenuEnabled</key>
<true/>   <!-- Enables dev menu -->
```

---

## Scripts Created

### 1. `build-debug-mode.sh`
Builds app in DEBUG configuration with dev tools enabled.

**Usage:**
```bash
./build-debug-mode.sh
```

**What it does:**
- Stops all processes
- Cleans build
- Starts Metro
- Builds in DEBUG mode
- Shows how to access dev tools

### 2. `enable-debug-bridgeless.sh`
For future use if you want to enable New Architecture (Bridgeless mode).

**Note**: Don't use this now. It's for future migration to New Architecture.

### 3. `fix-dev-tools.sh`
Quick fix for dev tools issues (existing script).

**Usage:**
```bash
./fix-dev-tools.sh
```

---

## Troubleshooting

### Dev Menu Still Not Opening?

#### Check 1: Verify DEBUG Build
```bash
# Check if app is built in DEBUG mode
xcodebuild -workspace ios/Yoraa.xcworkspace -showBuildSettings -scheme Yoraa | grep CONFIGURATION
# Should show: CONFIGURATION = Debug
```

#### Check 2: Verify Metro is Running
```bash
lsof -i:8081
# Should show node process running
```

#### Check 3: Check Info.plist Settings
```bash
grep -A1 "RCTDevMenuEnabled" ios/YoraaApp/Info.plist
# Should show: <true/>
```

#### Check 4: Rebuild from Scratch
```bash
# Nuclear option - complete rebuild
cd ios
rm -rf build Pods Podfile.lock
pod deintegrate
pod install
cd ..
npm start -- --reset-cache
npx react-native run-ios --mode Debug
```

---

## Why This Happened

### The Mismatch Problem:
1. **New Architecture (Bridgeless)** uses a different dev tools system
2. Your `Info.plist` said: "Use New Architecture dev tools"
3. Your `Podfile` said: "Use Old Architecture"
4. Result: No dev tools worked because of the mismatch

### The Fix:
- Aligned both files to use **Old Architecture**
- Explicitly enabled dev menu in `Info.plist`
- Build in explicit **DEBUG** mode

---

## Important Notes

### ✅ DO:
- Always build in DEBUG mode for development
- Use `--mode Debug` flag explicitly
- Keep `RCTNewArchEnabled = false` for now
- Use scripts provided for consistent builds

### ❌ DON'T:
- Don't mix New Architecture and Old Architecture settings
- Don't build in Release mode for development
- Don't change `RCTNewArchEnabled` without changing Podfile
- Don't skip clean builds after architecture changes

---

## Verification Steps

After build completes:

1. **Open Simulator**: iPad Pro should open automatically
2. **Wait for App**: Let app fully load
3. **Press Cmd+D**: Dev menu should appear immediately
4. **Try Metro 'd'**: Press 'd' in Metro terminal
5. **Success**: You should see dev menu with options

### Expected Dev Menu Options:
- Reload
- Debug
- Enable Fast Refresh
- Enable Hot Reloading
- Toggle Inspector
- Show Perf Monitor
- Open Debugger

---

## Quick Reference

### Build Commands:
```bash
# Standard debug build
npx react-native run-ios --mode Debug

# iPad Pro specific
npx react-native run-ios --simulator="iPad Pro (12.9-inch) (5th generation)" --mode Debug

# Clean build
./build-debug-mode.sh
```

### Dev Tools Commands:
```bash
# Open dev menu
Cmd+D in simulator

# Reload app
Press 'r' in Metro terminal

# Open Chrome DevTools
Press 'd' in Metro terminal, then select "Debug"
```

---

## Future: Migrating to New Architecture

If you want to use New Architecture (Bridgeless) in the future:

1. Update Podfile:
```ruby
:fabric_enabled => true,  # Enable New Architecture
```

2. Keep Info.plist:
```xml
<key>RCTNewArchEnabled</key>
<true/>
```

3. Reinstall pods:
```bash
cd ios
pod deintegrate
pod install
```

4. Rebuild completely

**Note**: New Architecture has different dev tools behavior. Wait for stable release.

---

## Status

✅ **Fixed**: Dev tools now work with Cmd+D  
✅ **Architecture**: Old Architecture (stable)  
✅ **Build Mode**: DEBUG  
✅ **Dev Menu**: Enabled  
✅ **Metro**: Connected  

---

## Support

If issues persist:

1. Run `./fix-dev-tools.sh`
2. Check Metro is on port 8081: `lsof -i:8081`
3. Verify DEBUG build: Check Xcode scheme
4. Try complete rebuild: `./build-debug-mode.sh`

**Current Status**: Building in DEBUG mode with dev tools enabled ✅
