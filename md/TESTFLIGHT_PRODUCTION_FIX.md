# 🔧 TestFlight Production Backend Fix

## Problem
TestFlight builds not showing real production data from `https://api.yoraa.in.net/api`.

## Root Cause
React Native environment variables need to be embedded at **build time**, not runtime. If you build an archive without a clean build, old environment variables may still be cached.

## ✅ Solution

### The Complete Clean Build Script
I've created `build-testflight-production.sh` which does:

1. **Verifies** `.env.production` has the correct backend URL
2. **Cleans** all build caches:
   - iOS build folder
   - Pods
   - Xcode derived data
   - Metro cache
3. **Reinstalls** CocoaPods dependencies
4. **Sets** `ENVFILE=.env.production` 
5. **Builds** a clean archive with production environment embedded

### Run the Script

```bash
./build-testflight-production.sh
```

This will:
- Clean everything (5 mins)
- Rebuild with production environment (10-15 mins)
- Create archive at `~/Desktop/YoraaApp.xcarchive`

### Upload to TestFlight

1. **Open Xcode** → Window → Organizer
2. **Select** your archive
3. **Click** "Distribute App"
4. **Choose** "TestFlight & App Store"
5. **Upload** to App Store Connect

## 🔍 How to Verify in TestFlight

Your app already has production environment logging built-in (in `App.js`):

```javascript
// This runs on app launch in production builds
console.log('🔍 Production Environment Check:');
console.log('  __DEV__:', __DEV__);
console.log('  APP_ENV:', Config.APP_ENV);
console.log('  BACKEND_URL:', Config.BACKEND_URL);
```

### Check Logs in Xcode Console

1. Connect your iPhone
2. Open Xcode → Window → Devices and Simulators
3. Select your device
4. Click "Open Console"
5. Install TestFlight build
6. Launch the app
7. Look for these logs:

**✅ Expected (Production):**
```
🔍 Production Environment Check:
  __DEV__: false
  APP_ENV: production
  BACKEND_URL: https://api.yoraa.in.net/api
✅ Backend connected: {status: "ok"}
```

**❌ Wrong (Development):**
```
🔍 Production Environment Check:
  __DEV__: true
  APP_ENV: development
  BACKEND_URL: http://localhost:3000/api
```

## 📋 Current Configuration

### ✅ `.env.production` (Correct)
```bash
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=production
DEBUG_MODE=false
USE_HTTPS=true
```

### ✅ `ios/.env.production` (Correct)
Same as above - matches production config.

### ✅ `ios/YoraaApp/Info.plist` (Updated)
- ✅ Removed: `usc1.contabostorage.com` (old storage)
- ✅ Kept: `api.yoraa.in.net` (current backend)
- ✅ Using: AWS S3 for storage

## 🚨 Why Previous Builds Failed

### 1. **Cached Environment Variables**
If you built without cleaning, Xcode used cached `.env` files from previous builds.

### 2. **Wrong ENVFILE**
Building without explicitly setting `ENVFILE=.env.production` can cause it to use `.env.development`.

### 3. **Derived Data Cache**
Xcode's derived data can contain old compiled environment configs.

## 📝 Important Notes

### For Simulator Testing
Your simulator is already configured to use production:
```bash
# .env.development is temporarily set to production
API_BASE_URL=https://api.yoraa.in.net/api
```

This is fine for testing, but **release builds** use `.env.production`.

### For Development
When you want to go back to localhost:
```bash
./switch-to-localhost.sh
```

### For Production
Switch back to production backend:
```bash
./switch-to-production.sh
```

## 🔐 Storage Configuration

### AWS S3 (Current)
```
Bucket: rithik-27-yoraa-app-bucket
Region: ap-southeast-2 (Sydney)
URL: s3.ap-southeast-2.amazonaws.com
```

### ~~Contabo~~ (Removed)
The old Contabo storage reference has been removed from iOS Info.plist.

## ✨ What's Different Now

| Before | After |
|--------|-------|
| Manual Xcode build | Automated clean build script |
| Environment variables cached | Fresh environment on each build |
| Unclear which env is used | Script verifies production URL |
| No verification | Built-in console logging |
| Contabo in Info.plist | Only AWS S3 and api.yoraa.in.net |

## 🎯 Next Steps

1. ✅ Run `./build-testflight-production.sh`
2. ✅ Wait for build to complete (~15 mins)
3. ✅ Upload archive to TestFlight via Xcode Organizer
4. ✅ Install TestFlight build on device
5. ✅ Check console logs to verify production backend
6. ✅ Test app - should show real production data

## 🐛 Troubleshooting

### "Build Failed" Error
1. Open the project in Xcode
2. Check the build errors
3. Verify signing certificates
4. Try building directly in Xcode

### Still Showing Cached Data
1. Uninstall the app from device completely
2. Reinstall from TestFlight
3. The app automatically clears cache on first launch in production mode

### Wrong Backend URL in Logs
1. Run the clean build script again
2. Make sure `.env.production` has correct URL
3. Check `ENVFILE` is set during build

## 📞 Backend Health Check

The app automatically tests backend connectivity on launch:

```javascript
// From App.js
const response = await fetch(`${Config.BACKEND_URL}/health`);
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

**Summary:** Run `./build-testflight-production.sh` for a clean TestFlight build with production backend properly embedded. Your app will fetch real data from `https://api.yoraa.in.net/api`.
