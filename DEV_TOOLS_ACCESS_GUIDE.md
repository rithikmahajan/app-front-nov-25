# Developer Tools Access Guide

## Problem
After building the app, the Metro dev menu and developer tools are not easily accessible, making it hard to reload the app or access debugging features.

## Solutions

### 1. **Access the Dev Menu**

#### iOS Simulator
- Press `Cmd + D` to open the dev menu
- Or use the menu: `Device → Shake` (Cmd + Ctrl + Z)

#### iOS Physical Device
- Shake your device to open the dev menu
- Or use accessibility shortcuts in Settings

#### Android Emulator
- Press `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
- Or press the menu button in the emulator

#### Android Physical Device
- Shake your device to open the dev menu
- Or run: `adb shell input keyevent 82`

### 2. **Ensure Metro is Running**

The Metro bundler MUST be running for dev tools to work. If it stops:

```bash
# Start Metro manually
npm start

# Or use our custom script with cache clearing
./start-metro.sh

# Or start with reset cache
npm start -- --reset-cache
```

### 3. **Two-Terminal Workflow (RECOMMENDED)**

**Terminal 1 - Metro Bundler:**
```bash
npm start
# OR
./start-metro.sh
```

**Terminal 2 - Build and Run:**
```bash
# For iOS
npm run ios

# For Android
npm run android
```

Keep Terminal 1 running! Don't close it after the build completes.

### 4. **Enhanced Dev Menu Options**

We've added these custom menu items to the dev menu:
- **Reload App** - Quickly reload JS bundle
- **Toggle Element Inspector** - Inspect UI elements
- **Open React DevTools** - Connect to React DevTools
- **Show Dev Menu** - Show the dev menu

### 5. **Quick Reload Methods**

#### Without Opening Dev Menu:
- **iOS Simulator**: Press `Cmd + R`
- **Android Emulator**: Press `R` twice quickly

#### With Metro Terminal:
- In the Metro terminal, press `R` to reload
- Press `D` to open dev menu

### 6. **Enable Fast Refresh**

Fast Refresh should be enabled by default. To verify:
1. Open Dev Menu (Cmd+D / Cmd+M)
2. Check "Enable Fast Refresh" is checked
3. Now code changes will update automatically!

### 7. **Common Issues & Fixes**

#### Issue: "Unable to load script from assets"
```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### Issue: Dev menu not opening
```bash
# Clear watchman
watchman watch-del-all

# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# Clear node modules
rm -rf node_modules
npm install

# Restart Metro
npm start
```

#### Issue: Changes not reflecting
1. Make sure Metro is running
2. Enable Fast Refresh in dev menu
3. Try manual reload (Cmd+R or R in Metro)
4. If still not working, restart Metro with `--reset-cache`

### 8. **Keyboard Shortcuts Reference**

| Action | iOS Simulator | Android Emulator |
|--------|--------------|------------------|
| Dev Menu | Cmd + D | Cmd + M |
| Reload | Cmd + R | R (twice) |
| Element Inspector | Cmd + D → Toggle Inspector | Cmd + M → Toggle Inspector |
| Performance Monitor | Dev Menu → Perf Monitor | Dev Menu → Perf Monitor |

### 9. **Metro Terminal Commands**

While Metro is running, you can press:
- **R** - Reload all connected apps
- **D** - Open dev menu in all connected apps
- **I** - Open iOS simulator
- **A** - Open Android emulator
- **Ctrl + C** - Stop Metro

### 10. **Best Practice Development Flow**

```bash
# Step 1: Start Metro (keep this running)
npm start

# Step 2: In a new terminal, build and run
npm run ios
# or
npm run android

# Step 3: Make code changes
# - Fast Refresh will auto-update
# - If needed, press Cmd+D (iOS) or Cmd+M (Android) for dev menu
# - Or press Cmd+R to manually reload

# Step 4: Never close Metro terminal!
# Keep it running while developing
```

### 11. **Debug on Physical Device**

#### iOS Physical Device:
1. Connect device via USB
2. Start Metro: `npm start`
3. Build to device: `npm run ios -- --device`
4. Shake device or use accessibility shortcut for dev menu

#### Android Physical Device:
1. Enable USB debugging on device
2. Connect via USB
3. Run: `adb devices` to verify connection
4. Start Metro: `npm start`
5. Run: `npm run android`
6. Shake device or run: `adb shell input keyevent 82`

### 12. **Remote Debugging**

To debug JS remotely:
1. Open Dev Menu (Cmd+D / Cmd+M)
2. Select "Debug"
3. Chrome will open at `http://localhost:8081/debugger-ui`
4. Use Chrome DevTools for debugging

### 13. **React DevTools**

Install standalone React DevTools:
```bash
npm install -g react-devtools

# Start React DevTools
react-devtools
```

Then open Dev Menu → "Open React DevTools"

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  YORAA DEV TOOLS QUICK REFERENCE        │
├─────────────────────────────────────────┤
│  iOS Dev Menu:        Cmd + D           │
│  Android Dev Menu:    Cmd + M           │
│  Reload:             Cmd + R            │
│  Start Metro:         npm start         │
│  Build iOS:          npm run ios        │
│  Build Android:      npm run android    │
└─────────────────────────────────────────┘
```

## Remember:
🔴 **ALWAYS keep Metro terminal running while developing!**  
🔴 **Don't close Metro after build completes!**  
✅ **Use two terminals: one for Metro, one for builds**  
✅ **Enable Fast Refresh for auto-updates**  
✅ **Press Cmd+D (iOS) or Cmd+M (Android) for dev menu**
