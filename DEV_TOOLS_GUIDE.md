# React Native Developer Tools Guide

## How to Open Developer Tools in Simulator

### Method 1: Keyboard Shortcuts (Easiest)
- **iOS Simulator**: Press `Cmd + D` on your keyboard
- **Android Emulator**: Press `Cmd + M` on your keyboard

### Method 2: Shake Gesture
- **iOS Simulator**: Hardware → Shake Gesture (or `Ctrl + Cmd + Z`)
- **Android Emulator**: Use the shake gesture from the emulator menu

### Method 3: In-App Menu
Once the dev menu opens, you'll see these options:
- **Reload** - Reload the app
- **Debug** - Open Chrome debugger
- **Show Inspector** - Inspect elements
- **Show Perf Monitor** - Show performance metrics
- **Open React DevTools** - Opens standalone React DevTools (custom menu item added)

## Using React DevTools Standalone

### Install React DevTools (if not already installed)
```bash
npm install -g react-devtools
```

### Start React DevTools
```bash
# Open in a new terminal
react-devtools
```

Then reload your app (`Cmd + R` in simulator), and it should automatically connect!

## Troubleshooting

### Dev Menu Not Opening?
1. Make sure you're running a **debug build** (not release)
   ```bash
   npx react-native run-ios
   # NOT: npx react-native run-ios --configuration Release
   ```

2. Check if `__DEV__` is true:
   - Look at the console logs when app starts
   - Should see: "🛠️ Development mode enabled"

3. Try reloading Metro bundler:
   ```bash
   # Kill existing Metro
   lsof -ti:8081 | xargs kill -9
   
   # Start fresh
   npx react-native start --reset-cache
   ```

### React DevTools Not Connecting?
1. Make sure standalone React DevTools is running:
   ```bash
   react-devtools
   ```

2. Reload your app after starting DevTools (`Cmd + R`)

3. Check console for connection messages

### Element Inspector Not Working?
1. Open dev menu (`Cmd + D`)
2. Select "Show Inspector"
3. Tap any element in the app to inspect it

## Current Setup

✅ DevSettings imported in App.js
✅ Custom menu item added: "Open React DevTools"
✅ Development mode logging enabled
✅ Console logs show dev mode status on startup

## Quick Commands

```bash
# Reload app
Cmd + R (in simulator)

# Open dev menu
Cmd + D (iOS) / Cmd + M (Android)

# Open standalone React DevTools
react-devtools

# Start app in debug mode
npx react-native run-ios

# Start app in release mode (dev tools disabled)
npx react-native run-ios --configuration Release
```

## Console Messages to Look For

When dev tools are working, you should see:
```
🛠️ Development mode enabled
📱 Shake device or press Cmd+D (iOS) / Cmd+M (Android) to open dev menu
```

If you see these messages, dev tools are available!
