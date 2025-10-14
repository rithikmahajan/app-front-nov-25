# 🔧 Production Server Connection - Configuration Update

**Date:** October 12, 2025  
**Purpose:** Connect iOS simulator to Contabo production server for debugging authentication issues

---

## ✅ Changes Made

### 1. Network Configuration Updated
**File:** `src/config/networkConfig.js`

**Changed:**
- Simulator now connects to: **`http://185.193.19.244:8080/api`**
- Previous: `http://localhost:3001/api` (incorrect port)
- Production URL also updated to match Contabo server

### 2. Connection Verified
✅ **Server Status:** ONLINE  
✅ **Health Endpoint:** Working (HTTP 200)  
✅ **Categories API:** Working  
✅ **Auth Endpoint:** Responding (expects valid Firebase token)

---

## 🎯 What This Reveals

Now when you sign in with Apple/Google/Phone in the simulator, you'll see:

1. **Real backend authentication errors** from the live server
2. **Actual JWT token validation** behavior
3. **Production database interactions**
4. **CORS and network issues** (if any)

---

## 📋 What to Look For

After reloading the app (Cmd+R in simulator), watch for these in the logs:

### ✅ Success Indicators:
```
🔄 Authenticating with Yoraa backend...
🌐 Making public request to: /api/auth/login/firebase
✅ Backend authenticated successfully
✅ Token saved: jwt_...
```

### ❌ Potential Errors:
```
❌ Backend authentication failed: [ERROR MESSAGE]
- "Firebase ID token has expired" → Token refresh needed
- "Invalid Firebase token" → Token generation issue
- "User not found" → Backend user creation issue
- "CORS error" → Server configuration issue
```

---

## 🔄 How to Switch Back to Local Development

When you want to test with local backend (`localhost:8001`), edit `src/config/networkConfig.js`:

```javascript
export const getApiUrl = () => {
  // Comment out production override:
  // return 'http://185.193.19.244:8080/api';
  
  // Uncomment original logic:
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return 'http://localhost:8001/api'; // or your Mac IP
    }
    // ... rest of config
  }
  return NetworkConfig.production.API_URL;
};
```

---

## 🧪 Test Script Created

**File:** `test-contabo-connection.sh`

Run this anytime to verify Contabo server status:
```bash
./test-contabo-connection.sh
```

---

## 📊 Expected Test Results

### Test Flow:
1. **Sign in with Apple/Google** in simulator
2. Firebase authentication succeeds ✅
3. App sends Firebase token to Contabo server
4. **Watch console logs** for backend response
5. Token should be saved and user authenticated

### Debug Logs to Monitor:
```
yoraaAPI.js - Shows API requests/responses
appleAuthService.js - Shows Apple sign-in flow
googleAuthService.js - Shows Google sign-in flow
```

---

## ⚡ Quick Reload Command

Press **Cmd+R** in iOS Simulator to reload with new configuration

---

## 🔍 Next Steps

1. ✅ App reloaded with production server config
2. 🔄 Sign in using Apple/Google/Phone
3. 👀 Watch console for actual backend errors
4. 🐛 Identify specific authentication issues
5. 🔧 Fix based on real production errors

---

## 📝 Notes

- **Server IP:** `185.193.19.244`
- **Port:** `8080`
- **Protocol:** HTTP (not HTTPS)
- **Full URL:** `http://185.193.19.244:8080/api`
- **WebSocket:** `ws://185.193.19.244:8080`

This configuration is **temporary for debugging**. Once authentication is working, we can switch back to local development or configure for production deployment.
