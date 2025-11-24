# 🔌 Connect Frontend to Local Backend - Complete Guide

**Date:** November 24, 2025  
**Status:** Configuration Ready  
**Local Backend:** http://localhost:8001/api

---

## 🎯 Quick Start (3 Simple Steps)

### Step 1: Run the Auto-Connect Script
```bash
./connect-local-backend.sh
```

This script will:
- ✅ Verify `.env.development` is configured for `localhost:8001`
- ✅ Check if local backend is running
- ✅ Clean Metro bundler cache
- ✅ Start Metro with development environment
- ✅ Set everything up automatically!

### Step 2: Launch iOS App
```bash
./run-ios-unlocked.sh
```

### Step 3: Watch the Magic! 🎉
Your app will now connect to your local backend at `http://localhost:8001/api`

---

## 📋 What's Already Configured

### ✅ Your `.env.development` File
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
APP_ENV=development
```

### ✅ Your `environment.js` Logic
```javascript
getApiUrl() {
  if (this.isDevelopment) {
    return this.api.baseUrl; // Returns http://localhost:8001/api
  }
  return this.api.backendUrl; // Production URL
}
```

**This means:** When running in development mode (`__DEV__ = true`), your app automatically uses `localhost:8001`! ✨

---

## 🔍 How It Works

### Environment Detection Flow

1. **App starts** → React Native checks `__DEV__` flag
2. **`__DEV__ = true`** → Development mode activated
3. **Environment.js** reads `.env.development`
4. **API calls** use `http://localhost:8001/api`
5. **Backend logs** show your requests! 📊

### File Priority
```
1. .env.development  (Development builds)
2. .env              (Fallback/Production)
```

When you run `npx react-native run-ios` in debug mode, it automatically uses `.env.development`!

---

## 🚀 Complete Workflow

### Full Setup from Scratch

```bash
# 1. Ensure backend is running
cd /path/to/backend
npm run dev
# Should see: "Server running on http://localhost:8001"

# 2. Return to frontend directory
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# 3. Connect to local backend (auto-configures everything)
./connect-local-backend.sh

# 4. Launch iOS app with auto-unlock
./run-ios-unlocked.sh
```

### Quick Launch (If Already Set Up)

```bash
# Just launch the app - it will auto-connect to localhost:8001
./run-ios-unlocked.sh
```

---

## 📱 Platform-Specific Instructions

### iOS Simulator (Easy!)
iOS Simulator can directly access `localhost`:
```bash
# Just run the app!
./run-ios-unlocked.sh

# Or manually:
npx react-native run-ios
```

**Why it works:** iOS Simulator shares the same network as your Mac, so `localhost:8001` = Mac's localhost:8001 ✅

### Android Emulator (Needs Port Forwarding)
Android Emulator sees `localhost` as itself, not your Mac. Need to forward ports:

```bash
# 1. Forward port 8001 from Mac to Emulator
adb reverse tcp:8001 tcp:8001

# 2. Run the app
npx react-native run-android
```

**Why it's needed:** Android Emulator runs in a separate VM. `adb reverse` makes your Mac's `localhost:8001` accessible to the emulator.

**Alternative for Android:** You can also use your Mac's IP address:
```bash
# Find your Mac's local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update .env.development temporarily:
API_BASE_URL=http://192.168.1.X:8001/api
```

---

## 🔧 Troubleshooting

### Issue 1: App Still Connects to Production API

**Symptoms:**
- App shows: `🚀 Production URL: https://api.yoraa.in.net/api`
- Backend logs show no requests

**Solution:**
```bash
# 1. Clean everything
rm -rf $TMPDIR/metro-* $TMPDIR/haste-*

# 2. Kill Metro
lsof -ti:8081 | xargs kill -9

# 3. Run connect script
./connect-local-backend.sh

# 4. Launch app fresh
./run-ios-unlocked.sh
```

### Issue 2: "Network request failed"

**Symptoms:**
- App shows network errors
- Can't connect to API

**Check these:**

```bash
# 1. Is backend running?
curl http://localhost:8001/api/health
# Should return: {"status":"ok"}

# 2. Is Metro using correct env?
# Check Metro logs for: "📱 iOS Development URL: http://localhost:8001/api"

# 3. Clear and restart
./connect-local-backend.sh
```

### Issue 3: Environment Not Switching

**Symptoms:**
- Changes to `.env.development` don't take effect

**Solution:**
```bash
# Environment files are cached by Metro!
# Must restart Metro with --reset-cache

# Kill Metro
lsof -ti:8081 | xargs kill -9

# Start with clean cache
ENVFILE=.env.development npx react-native start --reset-cache

# In another terminal:
./run-ios-unlocked.sh
```

### Issue 4: Seeing Both localhost AND Production URLs

**Symptoms:**
- Logs show both URLs being used

**Cause:** Multiple Metro instances or mixed environments

**Solution:**
```bash
# Nuclear option - kill everything and restart
killall node
killall Simulator
sleep 2

# Start fresh
./connect-local-backend.sh
./run-ios-unlocked.sh
```

---

## 📊 Verify Connection

### Check App Logs (Metro Terminal)
When app starts, you should see:
```
📱 iOS Development URL: http://localhost:8001/api
🔍 Using adb reverse: Run `adb reverse tcp:8001 tcp:8001` if needed
```

### Check Backend Logs
When you make requests, backend should show:
```
🔍 [DEBUG] POST /api/auth/login - 127.0.0.1
STEP 1: Login request received
Email: user@example.com
STEP 2: Finding user by email...
✅ User found: 507f1f77bcf86cd799439011
```

### Test Connection
```bash
# From your Mac terminal:
curl http://localhost:8001/api/health

# Should return:
{"status":"ok","timestamp":"2025-11-24T..."}
```

---

## 🎨 Advanced: Manual Configuration

If you prefer to configure manually:

### Option A: Environment Variable
```bash
# Set before running app
ENVFILE=.env.development npx react-native run-ios
```

### Option B: Modify .env Directly
```bash
# Temporarily rename files
mv .env .env.production.backup
mv .env.development .env

# Run app
npx react-native run-ios

# Restore after testing
mv .env .env.development
mv .env.production.backup .env
```

### Option C: Force Development in Code
Edit `src/config/environment.js`:
```javascript
constructor() {
  // Force development mode (temporary for testing)
  this.env = 'development';
  this.isDevelopment = true;
  this.isProduction = false;
  // ... rest of code
}
```

**⚠️ Remember to revert this before production build!**

---

## 📝 Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| **Connect to local backend** | `./connect-local-backend.sh` |
| **Run iOS with local backend** | `./run-ios-unlocked.sh` |
| **Run Android with local backend** | `adb reverse tcp:8001 tcp:8001 && npx react-native run-android` |
| **Check backend health** | `curl http://localhost:8001/api/health` |
| **Kill Metro bundler** | `lsof -ti:8081 \| xargs kill -9` |
| **Clear Metro cache** | `rm -rf $TMPDIR/metro-*` |
| **Start Metro (clean)** | `npx react-native start --reset-cache` |

### Environment Files

| File | Purpose | API URL |
|------|---------|---------|
| `.env.development` | Development builds | `http://localhost:8001/api` |
| `.env` | Production builds | `https://api.yoraa.in.net/api` |

### Debug Checklist

- [ ] Backend running on `localhost:8001`
- [ ] `.env.development` has correct URL
- [ ] Metro bundler restarted with `--reset-cache`
- [ ] App built in debug mode (`__DEV__ = true`)
- [ ] For Android: `adb reverse tcp:8001 tcp:8001` executed
- [ ] Simulator/Emulator unlocked

---

## 🎯 Success Indicators

After connecting to local backend, you'll see:

### In Metro Terminal
```
📱 iOS Development URL: http://localhost:8001/api
[PRODUCTION] 10:52:00 ℹ️ API Request Object
```

Wait, that says `[PRODUCTION]`? Don't worry! That's just the log prefix from `environment.js`. The important part is the URL being used.

### In Backend Terminal
```
🔍 [DEBUG] GET /api/categories - 127.0.0.1
🔍 Request headers: {authorization: "Bearer eyJ..."}
✅ Categories fetched successfully
```

### In App UI
- No "Network Error" messages
- Data loads successfully
- Check Settings → About (if you have one) should show "Development" mode

---

## 🔄 Switching Back to Production

When you want to test production:

```bash
# Option 1: Build release version
npx react-native run-ios --configuration Release

# Option 2: Temporarily use production env
ENVFILE=.env npx react-native run-ios

# Option 3: Update environment.js
# Set this.env = 'production' (remember to revert!)
```

---

## ✅ Summary

### What You Have Now

1. ✅ **Automatic Configuration** - `.env.development` ready with `localhost:8001`
2. ✅ **Smart Environment Detection** - `environment.js` automatically uses dev URL
3. ✅ **Auto-Connect Script** - `./connect-local-backend.sh` handles everything
4. ✅ **Auto-Unlock Script** - `./run-ios-unlocked.sh` launches app smoothly

### One-Command Workflow

```bash
# That's it! This connects to localhost:8001 automatically
./run-ios-unlocked.sh
```

### The App Will:
- ✅ Detect development mode (`__DEV__ = true`)
- ✅ Read `.env.development`
- ✅ Use `http://localhost:8001/api`
- ✅ Send all requests to your local backend
- ✅ Show detailed logs in backend terminal

---

**🎉 You're all set! Your frontend is ready to connect to the local backend for debugging!**

---

## 📞 Need Help?

If you see issues:

1. **Check backend:** `curl http://localhost:8001/api/health`
2. **Check Metro logs:** Look for "Development URL" message
3. **Run connect script:** `./connect-local-backend.sh`
4. **Clean restart:** Kill Metro, clear cache, restart

**Most Common Issue:** Metro cache not cleared. Solution: `./connect-local-backend.sh`
