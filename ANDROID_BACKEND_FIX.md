# Android Backend Connection Fix

## Problem
The Android app shows "Network request failed" because the backend server is only listening on `localhost` (IPv6 ::1), which the Android emulator cannot access.

## Solution
The backend needs to listen on `0.0.0.0` instead of `localhost` to allow Android emulator access via `10.0.2.2`.

## Quick Fix

### Step 1: Stop Current Backend
```bash
# Find and kill the process on port 8001
lsof -ti:8001 | xargs kill -9
```

### Step 2: Start Backend on 0.0.0.0
Your backend server needs to bind to `0.0.0.0` instead of `localhost`.

If your backend is an Express.js server, change:
```javascript
// FROM:
app.listen(8001, 'localhost', () => { ... })

// TO:
app.listen(8001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:8001');
})
```

Or simply remove the host parameter:
```javascript
app.listen(8001, () => {
  console.log('Server running on port 8001');
})
```

### Step 3: Verify Backend is Accessible
```bash
# Test from host machine
curl http://localhost:8001/api/health

# Test from Android emulator perspective (requires adb)
adb shell "curl -v http://10.0.2.2:8001/api/health"
```

## Current Status

✅ **App is configured correctly:**
- Using `http://10.0.2.2:8001/api` for Android
- Environment detection working
- API service properly initialized

❌ **Backend issue:**
- Listening on `localhost` (IPv6 only)
- Android emulator cannot connect
- Shows "Network request failed"

## Expected Logs After Fix

When working correctly, you should see in Android logcat:
```
✅ Categories loaded from backend
✅ Delivery options received
✅ Wishlist synced
```

Instead of:
```
❌ Network request failed
⚠️ Backend delivery options not available, using fallback
```

## Alternative: Use Production Backend

If you don't need to test with local backend, you can temporarily use production:

1. Edit `.env`:
```bash
APP_ENV=production
BACKEND_URL=https://api.yoraa.in.net/api
```

2. Rebuild the app:
```bash
npx react-native run-android
```

This will connect to your production backend instead.
