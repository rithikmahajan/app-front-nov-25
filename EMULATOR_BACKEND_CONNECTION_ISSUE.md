# Android Emulator Backend Connection Issue - Diagnostic Report

**Date**: November 18, 2025  
**App**: Yoraa Mobile App  
**Platform**: Android Emulator  
**Status**: 🔴 Connection Failed

---

## 📸 Current Problem

The Android app is showing TWO critical errors at the bottom of the screen:

1. **⚠️ No auth token found - request may require authentication**
2. **🆔 RN Error: Data fetch error: AxiosError: Network Error**

Additionally, the app displays:
- Yellow warning banner: "Unable to load latest categories. Showing cached categories."
- "Test Shirt" and "Test Pants" items (cached/fallback data)
- The "Retry" button is visible but not resolving the issue

---

## 🔍 Root Cause Analysis

### Issue 1: Network Connection Failure
**Error Type**: `AxiosError: Network Error`

**What This Means**:
The app cannot reach the backend API at all. This is a network-level failure, not an HTTP error (like 404 or 500).

**Possible Causes**:
1. ✅ Backend server is NOT running on `localhost:8001`
2. ✅ Android emulator cannot reach `10.0.2.2:8001`
3. ✅ Firewall blocking the connection
4. ✅ Wrong URL configuration in the app
5. ✅ Metro bundler serving old cached code

### Issue 2: Missing Authentication Token
**Error Type**: `No auth token found`

**What This Means**:
The app is trying to make authenticated requests but no token is available in storage.

**Expected Flow**:
1. User logs in → Token stored in AsyncStorage
2. Subsequent API calls → Token attached to headers
3. Backend validates token → Returns data

**Current State**: Token is missing, causing requests to fail authorization

---

## 🛠️ Diagnostic Steps

### Step 1: Verify Backend Server Status

Run from your Mac terminal:
```bash
# Check if backend is running
curl -v http://localhost:8001/health

# Check subcategories endpoint
curl -v http://localhost:8001/api/subcategories

# Check if port 8001 is listening
lsof -i :8001
```

**Expected Result**:
- Backend responds with JSON data
- Port 8001 shows a process listening

**If Backend Not Running**:
```bash
# Navigate to your backend directory
cd /path/to/yoraa-backend

# Start the backend server
npm start
# OR
node server.js
# OR
yarn start
```

---

### Step 2: Verify Emulator Network Configuration

The Android emulator uses special IP addresses:
- `10.0.2.2` → Maps to your Mac's `localhost`
- `127.0.0.1` in emulator → Emulator's own localhost (NOT your Mac)

**Test from Emulator**:
```bash
# Check what's running in the emulator
adb -s emulator-5556 shell

# Inside emulator shell:
# (Note: Most emulators don't have curl, so this may not work)
ping 10.0.2.2
```

**Check ADB Connection**:
```bash
# List connected devices
adb devices -l

# Should show something like:
# emulator-5556    device product:sdk_google_phone_x86_64
```

---

### Step 3: Verify App Configuration

Check the environment configuration:

**File**: `src/config/environment.js`

**Expected Configuration**:
```javascript
getApiUrl() {
  if (this.platform.isAndroid) {
    // Android emulator special IP
    return 'http://10.0.2.2:8001/api';
  }
  if (this.platform.isIOS) {
    // iOS simulator can use localhost
    return 'http://localhost:8001/api';
  }
  // Production
  return 'https://api.yoraa.in.net/api';
}
```

**Verify Current URL**:
Look for console logs in Metro bundler:
```
🔧 Base URL: http://10.0.2.2:8001/api  ← Should see this
🤖 Android Emulator URL: http://10.0.2.2:8001/api
```

---

### Step 4: Check Metro Bundler

**Current Issue**: Metro showing `EADDRINUSE` error
```
error listen EADDRINUSE: address already in use :::8081
```

**Solution**:
```bash
# Kill all Metro processes
pkill -f "react-native"
pkill -f "metro"

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Clear Metro cache and restart
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native start --reset-cache
```

---

### Step 5: Rebuild the App

**Why Rebuild?**
The app may be using cached code with old URL configuration.

**Steps**:
```bash
# 1. Stop Metro if running
pkill -f "react-native"

# 2. Clean Android build
cd android
./gradlew clean
cd ..

# 3. Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 4. Start Metro with fresh cache
npx react-native start --reset-cache &

# 5. In new terminal, rebuild and install app
npx react-native run-android --mode=debug
```

---

## 🔧 Quick Fix Checklist

Use this checklist to systematically resolve the issue:

- [ ] **Backend Server Running**
  ```bash
  curl http://localhost:8001/health
  ```
  ✅ Should return: `{"status":"healthy"}`

- [ ] **Metro Bundler Running**
  ```bash
  # Should see Metro on port 8081
  lsof -i :8081
  ```
  ✅ Should show Metro process

- [ ] **Emulator Running**
  ```bash
  adb devices
  ```
  ✅ Should show: `emulator-5556 device`

- [ ] **Environment Config Correct**
  - Check `src/config/environment.js`
  - Verify `10.0.2.2` for Android

- [ ] **App Rebuilt**
  ```bash
  npx react-native run-android
  ```

- [ ] **Network Request Visible**
  - Check Metro logs for API calls
  - Look for `🔄 Fetching subcategories...`

- [ ] **Test Network from App**
  - Open DevTools in app (Cmd+D → Debug)
  - Check Network tab for failed requests

---

## 📱 Testing Backend Connection from App

### Enable Debug Logging

Add this to your Collection screen temporarily:

```javascript
useEffect(() => {
  const testConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      console.log('🔧 API URL:', API_CONFIG.BASE_URL);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Backend Response Status:', response.status);
      const data = await response.json();
      console.log('✅ Backend Response Data:', data);
    } catch (error) {
      console.error('❌ Backend Connection Failed:', error);
      console.error('❌ Error Type:', error.name);
      console.error('❌ Error Message:', error.message);
    }
  };
  
  testConnection();
}, []);
```

**Expected Logs** (Success):
```
🧪 Testing backend connection...
🔧 API URL: http://10.0.2.2:8001/api
✅ Backend Response Status: 200
✅ Backend Response Data: { status: 'healthy' }
```

**Expected Logs** (Failure):
```
🧪 Testing backend connection...
🔧 API URL: http://10.0.2.2:8001/api
❌ Backend Connection Failed: [Error: Network Error]
❌ Error Type: AxiosError
❌ Error Message: Network Error
```

---

## 🔐 Authentication Token Issue

### Issue
The app is attempting authenticated requests without a token.

### Why This Happens
1. User hasn't logged in yet
2. Token expired and not refreshed
3. Token was cleared from AsyncStorage
4. App trying to access protected endpoints before login

### Solution Options

#### Option 1: Make Subcategories Public (Recommended for Testing)

**Backend Change** - Remove auth requirement:
```javascript
// In backend routes
app.get('/api/subcategories', subcategoriesController.getAll);
// Remove: authenticateToken middleware
```

#### Option 2: Handle Unauthenticated Requests

**App Change** - Add token check:
```javascript
// In apiService or similar
const getSubcategories = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Only add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/subcategories`, { headers });
    // ...
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Option 3: Implement Guest Access

**Backend** - Allow guest users:
```javascript
// Return public data for unauthenticated users
app.get('/api/subcategories', optionalAuth, subcategoriesController.getAll);
```

---

## 📊 Network Error Breakdown

| Error Type | Meaning | Common Causes |
|------------|---------|---------------|
| `Network Error` | Cannot reach server | Server down, wrong URL, firewall |
| `ERR_CONNECTION_REFUSED` | Server actively refused | Wrong port, server not listening |
| `ERR_NAME_NOT_RESOLVED` | DNS lookup failed | Invalid hostname |
| `ECONNABORTED` | Request timeout | Server too slow, network issue |
| `401 Unauthorized` | Auth failed | Missing/invalid token |
| `404 Not Found` | Endpoint doesn't exist | Wrong API path |
| `500 Internal Server Error` | Server crashed | Backend bug |

**Your Error**: `Network Error` → Server likely not reachable at `10.0.2.2:8001`

---

## 🎯 Most Likely Solution

Based on the errors, here's the most probable fix:

### **Backend Server Not Running**

**Verify**:
```bash
curl http://localhost:8001/health
```

If this fails → **Start your backend server**

**Find Your Backend**:
```bash
# Search for backend directory
find ~/Desktop -name "package.json" -path "*/backend/*" 2>/dev/null
find ~/Desktop -name "server.js" 2>/dev/null
```

**Start Backend**:
```bash
cd /path/to/your/backend
npm install  # If first time
npm start    # Or node server.js
```

**Verify Backend Started**:
```bash
# Should see something like:
# Server running on http://localhost:8001
# Database connected
```

---

## 🚨 Emergency Workaround - Use Production API

If you can't get local backend running immediately:

**1. Switch to Production API**:

Edit `.env.development`:
```bash
# Temporarily use production
API_BASE_URL=https://api.yoraa.in.net/api
```

**2. Rebuild App**:
```bash
npx react-native run-android
```

**⚠️ Note**: This is only for testing. Switch back to local development once backend is running.

---

## 📝 Resolution Steps Summary

**Order of Operations**:

1. **Start Backend Server** (Port 8001)
   ```bash
   cd /path/to/backend && npm start
   ```

2. **Verify Backend**
   ```bash
   curl http://localhost:8001/health
   ```

3. **Kill Old Metro**
   ```bash
   pkill -f "react-native" && pkill -f "metro"
   ```

4. **Start Fresh Metro**
   ```bash
   npx react-native start --reset-cache
   ```

5. **Rebuild App** (New Terminal)
   ```bash
   npx react-native run-android
   ```

6. **Test in App**
   - Pull down to refresh in Collection screen
   - Check Metro logs for successful API calls

---

## 📞 Support Information

**Related Files**:
- `ANDROID_BACKEND_DEBUG.md` - Previous debug attempts
- `ANDROID_EMULATOR_BACKEND_GUIDE.md` - Setup guide
- `src/config/environment.js` - URL configuration
- `src/services/yoraaBackendAPI.js` - API client

**Key Directories**:
- Backend: `/path/to/yoraa-backend` (find and confirm)
- App: `/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10`
- Android SDK: `/Users/rithikmahajan/Library/Android/sdk`

**Useful Commands**:
```bash
# Check all processes
lsof -i :8001  # Backend
lsof -i :8081  # Metro
adb devices    # Emulators

# View logs
npx react-native log-android
adb logcat | grep -i yoraa
```

---

## ✅ Success Indicators

You'll know it's fixed when you see:

1. **No error messages** at bottom of app
2. **Real data** instead of "Test Shirt" / "Test Pants"
3. **Success banner** instead of yellow warning
4. **Metro logs** showing successful API calls:
   ```
   ✅ Subcategories fetched: {...}
   ✅ Processed items (5): [...]
   ```

---

**Last Updated**: November 18, 2025  
**Status**: Awaiting backend server verification
