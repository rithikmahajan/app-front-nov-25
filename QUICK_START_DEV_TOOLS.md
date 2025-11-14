# 🚀 QUICK START: Developer Tools Access

## The Problem You're Facing
After running `npm run ios`, the build completes but you can't access:
- Reload option
- Dev menu
- Metro bundler tools
- Fast refresh features

## ✅ THE SOLUTION (Use Two Terminals!)

### Terminal 1: Start Metro (Keep This Running!)
```bash
npm start
```
**DO NOT CLOSE THIS TERMINAL!** Keep it running while developing.

### Terminal 2: Build and Run
```bash
npm run ios
# or
npm run android
```

## 🎯 Quick Access Methods

### iOS Simulator
| Action | Shortcut |
|--------|----------|
| **Open Dev Menu** | `Cmd + D` |
| **Reload App** | `Cmd + R` |
| **Shake Gesture** | `Ctrl + Cmd + Z` |

### Android Emulator
| Action | Shortcut |
|--------|----------|
| **Open Dev Menu** | `Cmd + M` (Mac) or `Ctrl + M` (Windows) |
| **Reload App** | Press `R` twice quickly |

## 📱 In the Dev Menu You'll Find:
- **Reload** - Refresh the app
- **Enable Fast Refresh** - Auto-reload on code changes
- **Toggle Element Inspector** - Debug UI layout
- **Show Perf Monitor** - Performance metrics
- **Debug** - Open Chrome DevTools

## 🔥 New Scripts We Added

```bash
# Start Metro with cache clearing (recommended for fresh start)
npm run start:clean

# Our custom Metro starter with helpful info
npm run start:metro

# Clean everything and start fresh
npm run dev:clean
```

## 💡 Pro Tips

1. **Always Keep Metro Running**
   - Terminal 1 = Metro (never close)
   - Terminal 2 = Build commands

2. **Enable Fast Refresh** (Auto-reload on save)
   - Open Dev Menu (`Cmd+D` / `Cmd+M`)
   - Check "Enable Fast Refresh"
   - Now your changes appear automatically!

3. **Quick Reload Without Dev Menu**
   - iOS: Just press `Cmd + R`
   - Android: Press `R` twice in Metro terminal

4. **Can't See Dev Menu?**
   - Make sure Metro is running in Terminal 1
   - Check Metro terminal isn't showing errors
   - Try: `npm run start:clean` then rebuild

## 🆘 Emergency Fixes

### Metro Not Connecting?
```bash
# Kill all Metro processes
killall -9 node

# Clean and restart
npm run dev:clean
```

### Still Having Issues?
```bash
# Full reset
rm -rf node_modules
npm install
npm run dev:clean
```

## 📚 Full Documentation
See `DEV_TOOLS_ACCESS_GUIDE.md` for complete details.

---

## ⚡ Remember:
- 🔴 **KEEP METRO RUNNING** (Terminal 1)
- 🔴 **DON'T CLOSE IT AFTER BUILD**
- ✅ Press `Cmd+D` (iOS) or `Cmd+M` (Android) for dev menu
- ✅ Fast Refresh = Auto-reload on save
