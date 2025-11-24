# Android Emulator Backend Connection - SOLVED ✅

**Date**: November 18, 2025  
**Solution**: ADB Port Forwarding  
**Status**: ✅ Working

---

## 🎯 The Solution

Android emulators run in an isolated network and **cannot** directly access:
- `localhost` (resolves to emulator itself)
- `10.0.2.2` (unreliable for newer Android versions)
- `192.168.1.29` (your Mac's IP - blocked by emulator network)

**Solution**: Use `adb reverse` to forward ports from Mac to emulator.

---

## ⚡ Quick Start (Every Time)

When you start your emulator, run this **once**:

```bash
# Option 1: Use the helper script
./setup-android-dev.sh

# Option 2: Manual command
adb reverse tcp:8001 tcp:8001
```

That's it! Your app will now work with `http://localhost:8001/api` 🎉

---

## 🔧 What `adb reverse` Does

```
┌─────────────┐                  ┌──────────────────┐
│   Mac       │                  │  Android Emulator│
│             │                  │                  │
│ Backend     │                  │  Your App        │
│ :8001       │ ◄────────────────│  localhost:8001  │
│             │   Port Forward   │                  │
└─────────────┘                  └──────────────────┘
```

When the app makes a request to `http://localhost:8001/api`:
1. Android thinks it's accessing its own localhost
2. `adb reverse` redirects it to your Mac's port 8001
3. Your backend receives and responds to the request
4. Response flows back through the tunnel to the app

---

## 📱 Testing the Connection

### From Your Mac
```bash
curl http://localhost:8001/health
# Should return: {"status":"healthy",...}
```

### From Emulator
```bash
adb shell "curl http://localhost:8001/health"
# Should return: {"status":"healthy",...}
```

### Verify Port Forwarding
```bash
adb reverse --list
# Should show: tcp:8001 tcp:8001
```

---

## 🚀 Complete Workflow

### First Time Setup

1. **Start Backend** (on Mac)
   ```bash
   cd /path/to/backend
   npm start
   # Backend running on http://localhost:8001
   ```

2. **Start Emulator**
   ```bash
   # Your emulator should already be running
   adb devices
   # Should show your emulator
   ```

3. **Set Up Port Forwarding**
   ```bash
   ./setup-android-dev.sh
   # Or manually: adb reverse tcp:8001 tcp:8001
   ```

4. **Run React Native App**
   ```bash
   npx react-native run-android
   ```

### Every Time You Restart Emulator

Just run:
```bash
./setup-android-dev.sh
```

Port forwarding is **reset** when the emulator restarts, so you need to set it up again.

---

## ✅ Current Configuration

### Environment Config (`src/config/environment.js`)
```javascript
getApiUrl() {
  if (this.isDevelopment) {
    // Both iOS and Android use localhost in development
    // Android uses adb reverse tcp:8001 tcp:8001 for port forwarding
    return 'http://localhost:8001/api';
  }
  // Production
  return 'https://api.yoraa.in.net/api';
}
```

### .env.development
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
```

### AndroidManifest.xml
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

---

## 🧪 Troubleshooting

### Issue 1: "Network Error" in App

**Check port forwarding**:
```bash
adb reverse --list
```

Should show `tcp:8001 tcp:8001`. If not, run:
```bash
adb reverse tcp:8001 tcp:8001
```

---

### Issue 2: Backend Not Responding

**Check if backend is running**:
```bash
curl http://localhost:8001/health
```

If this fails, start your backend:
```bash
cd /path/to/backend
npm start
```

---

### Issue 3: "Connection Refused"

**Check if port 8001 is listening**:
```bash
lsof -i :8001
```

Should show your Node.js backend process.

---

### Issue 4: Port Forwarding Not Working

**Remove and re-add**:
```bash
adb reverse --remove tcp:8001
adb reverse tcp:8001 tcp:8001
```

**Restart adb server**:
```bash
adb kill-server
adb start-server
adb reverse tcp:8001 tcp:8001
```

---

### Issue 5: Multiple Emulators Running

**List devices**:
```bash
adb devices
```

**Target specific device**:
```bash
adb -s emulator-5554 reverse tcp:8001 tcp:8001
```

---

## 📊 Network Comparison

| Method | Works? | Notes |
|--------|--------|-------|
| `localhost` | ❌ | Resolves to emulator itself |
| `127.0.0.1` | ❌ | Same as localhost |
| `10.0.2.2` | ⚠️ | Unreliable, deprecated in newer Android |
| `192.168.1.29` (Mac IP) | ❌ | Blocked by emulator network |
| **`adb reverse` + `localhost`** | ✅ | **RECOMMENDED** |

---

## 🎯 Why This Solution is Better

### ❌ Old Approach (10.0.2.2)
```javascript
// Brittle, platform-specific
if (Platform.OS === 'android') {
  return 'http://10.0.2.2:8001/api';  // Doesn't work on all emulators
} else {
  return 'http://localhost:8001/api';
}
```

### ✅ New Approach (adb reverse)
```javascript
// Clean, same code for both platforms
return 'http://localhost:8001/api';
// Works because adb reverse handles the forwarding
```

**Benefits**:
- ✅ No platform-specific code
- ✅ Works on all Android versions
- ✅ Same URL for iOS and Android
- ✅ Easy to understand and debug
- ✅ Standard Android development practice

---

## 📝 Quick Reference Commands

```bash
# Set up port forwarding
adb reverse tcp:8001 tcp:8001

# List active forwards
adb reverse --list

# Remove specific forward
adb reverse --remove tcp:8001

# Remove all forwards
adb reverse --remove-all

# Test connection from emulator
adb shell "curl http://localhost:8001/health"

# Restart app
adb shell "am force-stop com.yoraa && am start -n com.yoraa/.MainActivity"

# View app logs
adb logcat | grep -i yoraa
```

---

## 🚨 Important Notes

1. **Port forwarding is reset** when emulator restarts
2. **Run `./setup-android-dev.sh`** after restarting emulator
3. **Backend must be running** on Mac's localhost:8001
4. **Works for emulators only**, not physical devices
5. For physical devices, use your Mac's WiFi IP (`192.168.1.29`)

---

## 📱 For Physical Android Devices

If testing on a real Android device:

1. **Connect device and Mac to same WiFi**

2. **Update environment.js**:
   ```javascript
   getApiUrl() {
     if (this.isDevelopment) {
       if (this.platform.isAndroid) {
         // Check if running on emulator or device
         // For device, use Mac's WiFi IP
         return 'http://192.168.1.29:8001/api';
       }
       return 'http://localhost:8001/api';
     }
     return 'https://api.yoraa.in.net/api';
   }
   ```

3. **Ensure backend allows connections** from other devices

---

## ✅ Success Indicators

When everything is working, you'll see:

### In App
- ✅ Categories load immediately
- ✅ No "Network Error" messages
- ✅ Real data from backend (not cached/fallback data)
- ✅ Pull-to-refresh works

### In Metro Console
```
🔧 🤖 Android Dev URL: http://localhost:8001/api
💡 Tip: For Android, ensure `adb reverse tcp:8001 tcp:8001` is running
📡 GET /subcategories
✅ 200 /subcategories
✅ Subcategories fetched: {...}
```

---

## 🎓 Learning Resources

- [ADB Documentation](https://developer.android.com/studio/command-line/adb)
- [Android Emulator Networking](https://developer.android.com/studio/run/emulator-networking)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

---

**Last Updated**: November 18, 2025  
**Status**: ✅ Working  
**Solution**: ADB Port Forwarding

---

🎉 **Your Android emulator is now connected to the backend!**
