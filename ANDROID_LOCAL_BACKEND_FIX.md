# Android Local Backend Connection Fix

**Date:** November 23, 2025  
**Issue:** Android tablet not showing data from local backend in development mode  
**Root Cause:** Environment configuration was hardcoded for iOS TestFlight, breaking Android local development

## What Went Wrong

After implementing iOS TestFlight fixes, the `src/config/environment.js` file was modified to use **hardcoded URLs**:

```javascript
// ❌ BROKEN - Hardcoded URLs
const url = 'http://10.0.2.2:8001/api';  // Only works for emulators
const url = 'http://localhost:8001/api'; // Only works for iOS
```

This broke the original **dynamic URL replacement** logic that worked for both Android emulators AND physical devices.

## The Solution

**Restored the original working implementation** that dynamically replaces `localhost` with `10.0.2.2`:

```javascript
// ✅ CORRECT - Dynamic replacement from .env.development
const url = this.api.baseUrl.replace('localhost', '10.0.2.2');
```

### How It Works

1. **`.env.development` sets:** `API_BASE_URL=http://localhost:8001/api`
2. **For iOS Simulator:** Uses `http://localhost:8001/api` directly ✅
3. **For Android Emulator:** Replaces `localhost` → `10.0.2.2` = `http://10.0.2.2:8001/api` ✅

## Files Changed

### 1. `src/config/environment.js`
- ✅ Restored to commit `e1d51a4` (working version)
- ✅ Uses `this.api.baseUrl.replace('localhost', '10.0.2.2')` for Android

### 2. `.env.development`
- ✅ Changed back to: `API_BASE_URL=http://localhost:8001/api`
- ✅ Removed hardcoded IP addresses

## Testing

### For Android Emulator
```bash
# Backend MUST listen on 0.0.0.0 (not 127.0.0.1)
node server.js --host 0.0.0.0 --port 8001

# Android emulator will connect to: http://10.0.2.2:8001/api
```

### For iOS Simulator
```bash
# iOS can connect to localhost directly
node server.js --port 8001

# iOS simulator will connect to: http://localhost:8001/api
```

## Key Lessons

1. **Don't hardcode URLs** - Use environment variables
2. **Dynamic URL replacement** works for both emulators and physical devices
3. **Backend MUST listen on 0.0.0.0** for Android emulators to connect
4. **Git history is your friend** - Check previous working commits when debugging

## Rebuild Instructions

After making these changes, you MUST rebuild the Android app:

```bash
# Clean build cache
cd android && ./gradlew clean && cd ..

# Rebuild for Android
npx react-native run-android
```

Or use React Native CLI:
```bash
npm run android
```

## Verification

Check Metro bundler logs for these messages:

✅ **Android:**
```
🤖 Android Emulator URL: http://10.0.2.2:8001/api
```

✅ **iOS:**
```
📱 iOS Simulator URL: http://localhost:8001/api
```

## Related Files
- `src/config/environment.js` - URL logic
- `src/config/apiConfig.js` - API configuration
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

---

**Git Restore Command Used:**
```bash
git checkout e1d51a4 -- src/config/environment.js
```

This restored the working version before iOS TestFlight hardcoding changes.
