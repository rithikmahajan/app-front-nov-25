# Android Emulator Backend Connection - Quick Start Guide

## ✅ Current Status

**Backend**: Running on `http://localhost:8001` ✅
**Emulator**: Running (emulator-5556 - Medium Phone API 36) ✅
**App**: Installed and running ✅

---

## 🎯 How It Works

Your app is already configured to automatically connect to the backend when running on Android emulator!

### Automatic URL Configuration

The app uses `src/config/environment.js` which automatically detects the platform:

- **Android Emulator**: `http://10.0.2.2:8001/api`
- **iOS Simulator**: `http://localhost:8001/api`
- **Production**: `https://api.yoraa.in.net/api`

### Configuration Files

1. **`.env.development`** - Contains development URLs
   ```
   API_BASE_URL=http://localhost:8001/api
   ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
   ```

2. **`src/config/environment.js`** - Handles platform detection
   ```javascript
   if (this.platform.isAndroid) {
     // Automatically converts localhost to 10.0.2.2
     const url = this.api.baseUrl.replace('localhost', '10.0.2.2');
     return url; // Returns: http://10.0.2.2:8001/api
   }
   ```

---

## 🚀 Quick Commands

### Start Backend
```bash
# Your backend should already be running on port 8001
curl http://localhost:8001/health
# Output: {"status":"healthy",...}
```

### List Available Emulators
```bash
$ANDROID_HOME/emulator/emulator -list-avds
```

### Start Emulator
```bash
# Start Medium Phone API 36
$ANDROID_HOME/emulator/emulator -avd "Medium_Phone_API_36.0" &

# Or start Large Tablet
$ANDROID_HOME/emulator/emulator -avd "Large_Tablet_10inch" &
```

### Check Running Devices
```bash
/Users/rithikmahajan/Library/Android/sdk/platform-tools/adb devices -l
```

### Run React Native App
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native run-android
```

### View Logs
```bash
# View React Native logs
npx react-native log-android

# View device logs
adb -s emulator-5556 logcat | grep -i yoraa
```

---

## 🧪 Testing Backend Connection

### Method 1: From Your Mac
```bash
curl http://localhost:8001/health
curl http://localhost:8001/api/status
```

### Method 2: From Emulator (via adb)
```bash
# Test network connectivity
adb -s emulator-5556 shell ping -c 1 10.0.2.2

# The emulator might not have curl, so test from the app instead
```

### Method 3: From React Native App

Open your app on the emulator and:

1. **Look for the Backend Test Button** (if you have it in your app)
2. **Check the logs**:
   ```bash
   npx react-native log-android | grep -i "API\|backend\|http"
   ```

3. **Test with Chrome DevTools**:
   - Shake the device (or Cmd+M on Mac)
   - Select "Debug"
   - Open Chrome: `chrome://inspect`
   - Run in console:
     ```javascript
     fetch('http://10.0.2.2:8001/health')
       .then(res => res.json())
       .then(data => console.log('✅ Backend connected:', data))
       .catch(err => console.error('❌ Connection failed:', err));
     ```

---

## 📱 Your Available Emulators

1. **Large_Tablet_10inch** (emulator-5554)
   - Good for testing tablet layouts

2. **Medium_Phone_API_36.0** (emulator-5556) ⭐ Currently running
   - Good for testing phone layouts
   - API Level 36 (latest Android)

3. **Medium_Tablet**
   - Medium-sized tablet testing

4. **Pixel_4_-_API_30_-_Google_Play**
   - Google Play services testing

---

## 🔧 Troubleshooting

### App Can't Connect to Backend

**Check 1: Backend is running**
```bash
curl http://localhost:8001/health
```

**Check 2: Emulator is running**
```bash
adb devices
# Should show: emulator-5556    device
```

**Check 3: Network connectivity**
```bash
adb -s emulator-5556 shell ping -c 1 10.0.2.2
```

**Check 4: App is using correct URL**
- Look for console logs: `"🤖 Android Emulator URL: http://10.0.2.2:8001/api"`
- Check in app debug screen

### Rebuild the App

If you made changes to .env files:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Port Issues

If port 8001 is busy:
```bash
# Check what's using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Restart backend
node index.js  # or whatever your backend start command is
```

---

## 📋 Environment Variables Reference

### Development (.env.development)
```
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api
APP_ENV=development
```

### Production (.env.production)
```
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=production
```

---

## 🎉 Current Setup Summary

✅ **Backend**: Running on `http://localhost:8001`
✅ **Emulator**: Medium_Phone_API_36.0 (emulator-5556)
✅ **App**: Installed and running
✅ **Auto-config**: Android automatically uses `10.0.2.2:8001`

**Your app should now be able to connect to the backend automatically!**

---

## 🔗 Special Android Emulator IPs

When using Android Emulator, these special IPs are available:

| IP Address | Description |
|------------|-------------|
| `10.0.2.2` | **Your Mac's localhost** (use this!) |
| `10.0.2.3` | First DNS server |
| `10.0.2.15` | Emulator's own IP |

---

## 📖 Next Steps

1. ✅ Emulator is running
2. ✅ App is installed
3. ✅ Backend is connected
4. 🎯 **Test your API calls in the app**
5. 🎯 **Check the logs for connection status**
6. 🎯 **Build your features!**

Happy coding! 🚀
