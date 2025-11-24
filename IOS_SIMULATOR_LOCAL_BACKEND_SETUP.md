# 🔧 iOS Simulator → Local Backend Connection Guide

## ✅ Current Configuration Status

### Environment Variables (`.env.development`)
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
LOCAL_SERVER_URL=http://192.168.1.29:8001/api
```

### Backend Status
✅ **Backend is RUNNING and HEALTHY**
- URL: `http://localhost:8001/api`
- Health Check: ✅ Operational
- Categories Available: **4 categories**

## 🚀 Actions Taken

### 1. Environment Configuration ✅
- ✅ `.env.development` configured for port 8001
- ✅ All URLs point to local backend

### 2. iOS Clean Build 🔨
- ✅ Cleaned Xcode build cache
- ⏳ Rebuilding iOS app with new environment variables

### 3. Debug Component Added 🐛
- ✅ Added `BackendDebug` component to HomeScreen
- Shows real-time backend connection status
- Only visible in DEV mode

## 📱 What You Should See

When the app finishes rebuilding, you'll see:

1. **Debug panel at top of HomeScreen** (only in development)
   - Environment: development
   - Backend URL: http://localhost:8001/api
   - Status: ✅ Connected
   - Categories: 4

2. **Categories should load** from your local database
   - Shirt
   - Jacket
   - (+ 2 more)

## 🔍 Verification Steps

### Step 1: Check Metro Bundler
Look for these logs:
```
[DEVELOPMENT] ℹ️  API Configuration loaded
[DEVELOPMENT] ℹ️  Base URL: http://localhost:8001/api
```

### Step 2: Check App Logs
In Xcode console or Metro, you should see:
```
🧪 Testing backend at: http://localhost:8001/api
✅ Backend working! Categories: 4
```

### Step 3: Visual Confirmation
- Debug panel shows "✅ Connected"
- Categories appear in the list
- No error messages

## 🐛 If Still Not Working

### Check 1: Backend is Running
```bash
curl http://localhost:8001/api/health
# Should return: {"success":true,"status":"healthy",...}
```

### Check 2: Check Backend Data
```bash
curl http://localhost:8001/api/categories
# Should return: Array of 4 categories
```

### Check 3: Restart Metro Bundler
```bash
# Kill Metro
pkill -f Metro

# Start fresh
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native start --reset-cache
```

### Check 4: Rebuild iOS App
```bash
# Clean
cd ios && xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa

# Rebuild
cd .. && npx react-native run-ios
```

## 📊 Backend Test Results

```bash
✅ Health endpoint: Working
✅ Categories endpoint: 4 items
✅ Subcategories endpoint: Working
```

## 🔄 For Android (Future Reference)

When testing on Android emulator:
```bash
# Set up port forwarding
adb reverse tcp:8001 tcp:8001

# Run app
npx react-native run-android
```

## 📝 Important Notes

1. **react-native-config requires rebuild**: Changing `.env` files requires a full rebuild, not just refresh
2. **Metro cache**: Sometimes needs `--reset-cache` flag
3. **Debug component**: Remove `<BackendDebug />` from HomeScreen when done testing

## ✅ Next Steps

1. ⏳ Wait for iOS build to complete
2. 👀 Look for debug panel at top of screen
3. 🎉 Verify it shows "✅ Connected" with 4 categories
4. 🗑️ Remove debug component once confirmed working

---

**Status**: App is currently rebuilding with correct environment variables
**Expected**: Should connect to local backend on port 8001 after rebuild completes
