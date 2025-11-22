# 🚨 Production Data Not Showing - Root Cause & Fix

## Problem Analysis

You're experiencing **two different issues**:

### 1. **Simulator Showing Local Data** 
**Root Cause:** Your local backend is running on port 3000, and the simulator might be connecting to it instead of production.

**Evidence:**
- Local backend process running: `node index.js` (port 3000)
- Metro bundler running with potentially cached code
- `.env.development` points to production, but app may be using cached local URLs

### 2. **TestFlight Not Receiving Any Data**
**Root Cause:** The TestFlight build was created before we fixed the environment configuration, so it has old environment variables embedded.

---

## ✅ Complete Fix

### Fix Script (Recommended)

Run this single command to fix everything:

```bash
./fix-production-connection.sh
```

**What it does:**
1. ✅ Stops Metro bundler and local backend
2. ✅ Verifies production URL configuration
3. ✅ Tests backend connectivity
4. ✅ Clears all caches
5. ✅ Starts Metro with clean state

### Manual Fix (If Needed)

If you prefer manual steps:

```bash
# 1. Stop everything
pkill -f "react-native start"
lsof -ti:8081 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# 2. Clear cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
watchman watch-del-all

# 3. Start fresh
npx react-native start --reset-cache
```

---

## 🔍 Why This Happened

### For Simulator (Local Data Issue)

1. **Local Backend Running:** Your backend at `~/Desktop/oct-7-backend-admin-main` is running on port 3000
2. **Cached Code:** The simulator app has cached JavaScript bundle with old API URLs
3. **Environment Confusion:** Even though `.env.development` points to production, the app uses cached code

### For TestFlight (No Data Issue)

1. **Old Build:** TestFlight archive was built with old/incorrect environment variables
2. **Environment Embedded at Build Time:** React Native embeds `.env` values when building, not at runtime
3. **Needs Clean Rebuild:** Must create new archive with correct production URLs

---

## 📋 Step-by-Step Solution

### PART 1: Fix Simulator (Immediate)

1. **Run the fix script:**
   ```bash
   ./fix-production-connection.sh
   ```

2. **Rebuild the app:**
   ```bash
   npx react-native run-ios
   ```

3. **Verify in Xcode Console:**
   - Look for: `BACKEND_URL: https://api.yoraa.in.net/api`
   - Should see: `✅ Backend connected`

4. **Test the app:**
   - Browse products - should show production data
   - Check if you see the products from your admin panel screenshot

### PART 2: Fix TestFlight (Takes ~20 mins)

1. **Build new TestFlight archive:**
   ```bash
   ./build-testflight-quick.sh
   ```

2. **Wait for build to complete** (~15-20 minutes)

3. **Upload to TestFlight:**
   - Open Xcode → Window → Organizer
   - Select the new archive
   - Click "Distribute App"
   - Choose "TestFlight & App Store"
   - Upload

4. **Wait for App Store Connect processing** (~10-30 minutes)

5. **Install from TestFlight** on your device

6. **Verify the data** matches production

---

## 🎯 How to Verify It's Working

### In Simulator

After running `npx react-native run-ios`, check Xcode console for:

```
✅ EXPECTED OUTPUT:
🔍 Production Environment Check:
  __DEV__: true
  APP_ENV: development
  BACKEND_URL: https://api.yoraa.in.net/api  ← Should be production URL!
  BUILD_TYPE: undefined
✅ Backend connected: {status: "ok"}
```

```
❌ WRONG OUTPUT (means still using local):
  BACKEND_URL: http://localhost:3000/api     ← Local URL = Problem!
```

### In TestFlight

Connect device to Mac, open Xcode Console, launch TestFlight app:

```
✅ EXPECTED OUTPUT:
🔍 Production Environment Check:
  __DEV__: false                             ← Should be false in TestFlight!
  APP_ENV: production                        ← Should be production!
  BACKEND_URL: https://api.yoraa.in.net/api
✅ Backend connected: {status: "ok"}
```

---

## 🔧 Troubleshooting

### Simulator Still Shows Local Data

**Try these steps:**

1. **Delete app from simulator:**
   ```bash
   # Reset simulator completely
   xcrun simctl erase all
   ```

2. **Clear ALL caches:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   rm -rf node_modules/.cache
   rm -rf $TMPDIR/react-*
   watchman watch-del-all
   ```

3. **Rebuild completely:**
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios --reset-cache
   ```

### TestFlight Still No Data

**Possible causes:**

1. **Old TestFlight Build Still Installed**
   - Solution: Completely uninstall app, reinstall from TestFlight

2. **App Store Connect Not Processed Yet**
   - Solution: Wait 10-30 mins after upload, check App Store Connect

3. **Wrong Build Uploaded**
   - Solution: Check build number in TestFlight matches your new build

4. **Cache in App**
   - Solution: App automatically clears cache on first launch in production mode
   - If not working, add manual clear in app settings

---

## 📱 Current Status

### Environment Files (Correct ✅)

- `.env.development`: `https://api.yoraa.in.net/api` (for simulator)
- `.env.production`: `https://api.yoraa.in.net/api` (for TestFlight)
- `ios/.env.production`: `https://api.yoraa.in.net/api` (for iOS builds)

### Production Backend (Verified ✅)

- URL: `https://api.yoraa.in.net/api`
- Status: Online and accessible
- Data: Products visible in admin panel

### Issues to Fix

- [ ] Simulator connecting to localhost:3000 instead of production
- [ ] TestFlight build has old environment variables
- [ ] Need to clear caches and rebuild

---

## 🚀 Next Actions

### Immediate (For Simulator Testing)

1. Run: `./fix-production-connection.sh`
2. Run: `npx react-native run-ios`
3. Verify production data appears

### For TestFlight Deployment

1. Run: `./build-testflight-quick.sh`
2. Wait for build (~20 mins)
3. Upload to TestFlight via Xcode Organizer
4. Wait for processing (~30 mins)
5. Install and test

---

## 💡 Prevention

To avoid this in future:

### When Testing Locally

```bash
# Use localhost for development
./switch-to-localhost.sh
npm start
```

### When Testing Production in Simulator

```bash
# Use production for testing
./switch-to-production.sh
npm start -- --reset-cache
```

### When Building for TestFlight

```bash
# Always use the build script (ensures clean build)
./build-testflight-quick.sh
```

### Always Remember

1. **Environment variables are embedded at build time** for releases
2. **Simulator uses .env.development** (currently set to production)
3. **TestFlight uses .env.production** (always production)
4. **Cache can cause old URLs to persist** → Always clear cache when switching
5. **Local backend on port 3000** can interfere → Stop it when testing production

---

## Summary

**Root Cause:** 
- Simulator: Local backend running + cached code
- TestFlight: Old build with wrong environment variables

**Solution:**
- Simulator: Stop local backend, clear cache, rebuild
- TestFlight: Create new clean build with correct production config

**Commands:**
```bash
# Fix simulator
./fix-production-connection.sh
npx react-native run-ios

# Fix TestFlight
./build-testflight-quick.sh
# Then upload via Xcode Organizer
```

**Verify:** Check Xcode console logs show production URL and successful backend connection.

---

🎯 **Run `./fix-production-connection.sh` now to start the fix!**
