# 🛠️ Opening Developer Tools - Quick Guide

## ✅ Your App is Now Starting in Development Mode!

### Metro Bundler is Running:
- Dev server: `http://localhost:8081`
- The simulator will open automatically
- Dev tools are **ENABLED** ✅

---

## 🎯 How to Open the Developer Menu

Once the simulator opens and the app loads:

### Method 1: Keyboard Shortcut (EASIEST) ⌨️
Press **`Cmd + D`** on your keyboard while the simulator is in focus

### Method 2: From Terminal
In the Metro bundler terminal, press **`d`** to open Dev Menu

### Method 3: Shake Gesture
In the iOS Simulator menu bar: **Hardware → Shake Gesture** (or press `Ctrl + Cmd + Z`)

---

## 🔧 Available Metro Commands

While Metro is running, you can press:
- **`r`** - Reload the app
- **`d`** - Open Dev Menu
- **`j`** - Open Chrome DevTools

---

## 📱 What You'll See in the Dev Menu

When the dev menu opens, you'll see options like:
- ✅ **Reload** - Refresh the app
- ✅ **Debug** - Open Chrome debugger  
- ✅ **Show Inspector** - Inspect UI elements
- ✅ **Show Perf Monitor** - Performance metrics
- ✅ **Open React DevTools** - Custom menu item (we added this!)
- ✅ **Toggle Element Inspector**
- ✅ **Configure Bundler**

---

## 🚀 Optional: Install Standalone React DevTools

For a better debugging experience:

```bash
# Install globally (only need to do once)
npm install -g react-devtools

# Then start it in a new terminal
react-devtools
```

Then reload your app (`Cmd + R`), and it will auto-connect!

---

## 🎉 You're All Set!

Your app is launching with:
- ✅ Development mode enabled (`__DEV__ = true`)
- ✅ Metro bundler running with fresh cache
- ✅ Dev menu accessible via `Cmd + D`
- ✅ Custom dev tools menu item added
- ✅ Console logging for debugging

**Wait for the simulator to fully load, then press `Cmd + D` to open the dev menu!**
