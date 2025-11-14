# 🚨 SOLUTION: How to Open Development Tools in iOS Simulator

## ❌ The Problem
Your app was building in **Release mode** instead of **Debug mode**, which completely disables all development tools, including:
- Dev Menu (Cmd+D)
- React DevTools
- Hot Reload
- Chrome Debugger
- Element Inspector

## ✅ The Solution

### Use the Correct Build Command:

```bash
# ✅ CORRECT - Debug mode (dev tools enabled)
npx react-native run-ios --mode Debug

# ❌ WRONG - This builds Release mode (no dev tools)
npx react-native run-ios
```

## 🎯 How to Open Dev Tools (Once in Debug Mode)

### Method 1: Keyboard Shortcut (Easiest)
1. Make sure the **simulator** window is in focus
2. Press **`Cmd + D`** on your keyboard
3. Dev menu will appear!

### Method 2: Simulator Menu
1. Click on **Hardware** in simulator menu bar
2. Select **Shake Gesture** (or press `Ctrl + Cmd + Z`)
3. Dev menu will appear!

### Method 3: Metro Bundler Terminal
1. In the Metro bundler terminal window
2. Press **`d`** key
3. Dev menu will appear!

## 📱 What You'll See in Debug Mode

When the app loads in Debug mode, you should see console logs like:
```
🛠️ Development mode enabled
📱 Shake device or press Cmd+D (iOS) / Cmd+M (Android) to open dev menu
__DEV__: true
```

## 🔧 Available Dev Menu Options

Once the dev menu opens, you'll see:
- ✅ **Reload** - Refresh the app (or press `Cmd + R`)
- ✅ **Debug** - Open Chrome debugger
- ✅ **Show Inspector** - Inspect UI elements  
- ✅ **Show Perf Monitor** - Performance metrics
- ✅ **Toggle Element Inspector**
- ✅ **Enable/Disable Fast Refresh**
- ✅ **Configure Bundler**
- ✅ **Open React DevTools** - Our custom menu item

## 🚀 Complete Workflow

### 1. Start Metro Bundler
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native start
```

### 2. In a New Terminal, Run Debug Build
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native run-ios --mode Debug
```

### 3. Once Simulator Loads
- Press `Cmd + D` to open dev menu
- Or press `d` in Metro terminal

## 🔍 How to Verify Debug vs Release Mode

### Debug Mode (Dev Tools Available):
```bash
# Command:
npx react-native run-ios --mode Debug

# Build output will show:
Build/Products/Debug-iphonesimulator/YoraaApp.app
```

### Release Mode (NO Dev Tools):
```bash
# Command:
npx react-native run-ios
# (defaults to Release if not specified)

# Build output will show:
Build/Products/Release-iphoneos/YoraaApp.app
```

## 💡 Pro Tips

### Always Use Debug Mode for Development
```bash
# Add this to your package.json scripts:
"scripts": {
  "ios:debug": "react-native run-ios --mode Debug",
  "ios:release": "react-native run-ios --mode Release"
}

# Then run:
npm run ios:debug
```

### Quick Reload
- `Cmd + R` in simulator = Reload app
- No need to rebuild!

### Open React DevTools Standalone
```bash
# Install once:
npm install -g react-devtools

# Then always keep this running:
react-devtools
```

## ⚠️ Common Issues

### Issue: "Dev menu not opening"
**Solution**: Make sure you're running in **Debug mode**
```bash
npx react-native run-ios --mode Debug
```

### Issue: "App builds but no console logs"
**Solution**: You're in Release mode. Rebuild with `--mode Debug`

### Issue: "`__DEV__` is false"
**Solution**: You're in Release mode. Use Debug mode.

### Issue: "Metro bundler not connected"
**Solution**: 
1. Kill Metro: `lsof -ti:8081 | xargs kill -9`
2. Restart: `npx react-native start`
3. Rebuild: `npx react-native run-ios --mode Debug`

## 📝 Summary

**The key difference:**
- **Debug Build**: `--mode Debug` → Dev tools work ✅
- **Release Build**: Default or `--mode Release` → No dev tools ❌

**Always remember:**
```bash
npx react-native run-ios --mode Debug
```

Then press `Cmd + D` to open the dev menu!
