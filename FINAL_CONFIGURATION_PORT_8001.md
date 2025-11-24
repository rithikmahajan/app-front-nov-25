# ✅ FINAL CONFIGURATION - Corrected Backend Port

**Date**: November 24, 2025  
**Backend Port**: **8001** (NOT 5000!)

---

## ✅ Current Setup

### Backend Configuration
- **Port**: `8001` 
- **URL**: `http://localhost:8001/api`
- **Both iOS & Android use**: `localhost:8001`

### How It Works

#### iOS Simulator ✅
- Uses `http://localhost:8001/api` directly
- No special configuration needed
- Just works!

#### Android Emulator ✅
- Uses `http://localhost:8001/api` (same as iOS!)
- Requires **`adb reverse`** to map localhost to host machine
- Command: `adb reverse tcp:8001 tcp:8001`

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd /Users/rithikmahajan/Desktop/oct-7-backend-admin-main
npm start
```

Verify it's running:
```bash
lsof -i :8001
```

### 2. Start Development Environment
```bash
./start-dev-complete.sh
```

This automatically:
- ✅ Checks backend is running on port 8001
- ✅ Checks Android emulator is running
- ✅ Sets up `adb reverse tcp:8081 tcp:8081` (Metro)
- ✅ Sets up `adb reverse tcp:8001 tcp:8001` (Backend)
- ✅ Starts Metro if needed

### 3. For Android
**Tap the "RELOAD" button on your emulator!**

Or manually:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb shell input keyevent 82  # Opens dev menu
```

### 4. For iOS
```bash
npx react-native run-ios
```

---

## 📁 Configuration Files

### `.env.development`
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
```

### `src/config/environment.js`
```javascript
// Uses localhost:8001 for BOTH iOS and Android
// Android emulator uses adb reverse to map localhost to host
```

### `android/.../network_security_config.xml`
```xml
<!-- Allows cleartext (HTTP) traffic to localhost -->
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">10.0.2.2</domain>
</domain-config>
```

---

## 🔧 Key Commands

### Set Up Port Forwarding (Android)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Forward Metro bundler
adb reverse tcp:8081 tcp:8081

# Forward Backend API
adb reverse tcp:8001 tcp:8001
```

### Check What's Running
```bash
# Check backend
lsof -i :8001

# Check Metro
lsof -i :8081

# Check emulator connection
adb devices

# Check port forwarding
adb reverse --list
```

### Reload App
```bash
# Android - open dev menu
adb shell input keyevent 82

# Or just tap RELOAD button on emulator screen!
```

---

## ✅ What Was Fixed

### Original Issue
- You were right! Backend is on port **8001**, not 5000
- I had incorrectly changed it to 5000

### Corrections Made
1. ✅ `.env.development` → Changed back to port **8001**
2. ✅ `start-dev-complete.sh` → Updated to check/forward port **8001**
3. ✅ `adb reverse` → Set up for port **8001**

---

## 🎯 Current Status

### Android ✅
- Port forwarding configured: `adb reverse tcp:8001 tcp:8001`
- Uses `http://localhost:8001/api`
- **Action**: Tap "RELOAD" button on emulator

### iOS 🔄
- Uses `http://localhost:8001/api` 
- CocoaPods installed successfully
- Build is running (wait for completion)

---

## 🔍 Troubleshooting

### Android: Can't Connect to Backend
**Check port forwarding:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb reverse tcp:8001 tcp:8001
adb reverse --list  # Verify it's set up
```

**Check backend is running:**
```bash
lsof -i :8001
curl http://localhost:8001/api/health
```

### iOS: Build Errors
**Already fixed!** Pods were reinstalled successfully.

### Backend Not Responding
**Start the backend:**
```bash
cd /Users/rithikmahajan/Desktop/oct-7-backend-admin-main
npm start
```

---

## 📚 Why This Approach is Better

### Original Approach (What We're Using) ✅
```javascript
// Same URL for both platforms!
API_BASE_URL: 'http://localhost:8001/api'
```

**Advantages:**
- ✅ Same configuration for iOS and Android
- ✅ Cleaner code
- ✅ Just run `adb reverse` once per emulator session
- ✅ Easier to maintain

### Alternative Approach (Not Using)
```javascript
// Different URLs per platform
Platform.OS === 'android' 
  ? 'http://10.0.2.2:8001/api'  // Android only
  : 'http://localhost:8001/api'  // iOS only
```

**Disadvantages:**
- ❌ Platform-specific code
- ❌ Different URLs to maintain
- ❌ More complex

---

## ✅ Final Checklist

- [x] Backend port corrected to **8001**
- [x] `.env.development` updated
- [x] Port forwarding configured (`adb reverse tcp:8001 tcp:8001`)
- [x] Network security config allows localhost
- [x] iOS pods installed successfully
- [x] Scripts updated to use port 8001
- [ ] **Android: Tap RELOAD button** ← Do this now!
- [ ] **iOS: Wait for build to complete**

---

**Everything is now correctly configured for port 8001!** 🎉

Just **tap RELOAD on Android** and you're good to go!
