# 🚀 QUICK START - Backend Connection Guide

**Status:** ✅ Configuration Complete | **Action:** Reload App

---

## ⚡ 30-Second Setup

### For Backend Team
```bash
cd /path/to/backend
PORT=8001 npm run dev
```

### For Frontend Team
```bash
# Reload React Native app
# Press 'r' in Metro terminal
# OR press Cmd+R in iOS Simulator
```

**That's it!** Your app will now connect properly in both local and production.

---

## 🎯 What Changed

### ✅ Fixed (No More Hardcoded URLs)

All URLs now come from **environment variables**:

| Environment | Source File | URL |
|------------|-------------|-----|
| Local Dev | `.env.development` | `http://localhost:8001/api` |
| Production | `.env.production` | `http://185.193.19.244:8080/api` |

### 🔧 Files Updated

1. **`src/config/apiConfig.js`** - Now uses `environmentConfig`
2. **`src/services/yoraaBackendAPI.js`** - Now uses `environmentConfig`
3. **`src/config/environment.js`** - Enhanced with better logging

---

## 📋 Environment Variables

### `.env.development` (Local Dev)
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api
APP_ENV=development
```

### `.env.production` (Live)
```bash
API_BASE_URL=http://185.193.19.244:8080/api
BACKEND_URL=http://185.193.19.244:8080/api
SERVER_IP=185.193.19.244
SERVER_PORT=8080
APP_ENV=production
```

---

## 🧪 Verify Configuration

```bash
# Run automated test
node test-backend-config.js

# Expected: ✅ Passed: 17/17
```

---

## 🔍 Expected Logs After Reload

### ✅ Correct (Port 8001)
```
🔧 Base URL: http://localhost:8001/api
📱 iOS Simulator URL: http://localhost:8001/api
🌐 YoraaBackendAPI initialized
✅ Backend Connected!
```

### ❌ Incorrect (Old Port 8081)
```
🔧 Base URL: http://localhost:8081/api
```

If you see port 8081, **reload the app again** (Cmd+R).

---

## 🆘 Quick Troubleshooting

### Problem: Network Error

**Check Backend:**
```bash
lsof -i :8001
# If nothing, start backend:
PORT=8001 npm run dev
```

### Problem: Still Shows Port 8081

**Full Restart:**
```bash
# Kill Metro
killall node

# Clear cache and restart
npx react-native start --reset-cache

# In another terminal
npx react-native run-ios
```

### Problem: Android Can't Connect

**Check URL in logs:**
```
Should be: http://10.0.2.2:8001/api
Not:       http://localhost:8001/api
```

If wrong, the app needs to reload.

---

## 📞 Need Help?

1. Read: `BACKEND_CONNECTION_FIX_COMPLETE.md` (detailed guide)
2. Test: `node test-backend-config.js` (validates setup)
3. Check: `BACKEND_CONNECTION_DOCUMENTATION.md` (complete reference)

---

## ✅ Success Checklist

- [ ] Backend running on port 8001: `PORT=8001 npm run dev`
- [ ] React Native app reloaded (Press `r` or `Cmd+R`)
- [ ] Logs show port 8001 (not 8081)
- [ ] Test API: `curl http://localhost:8001/health`
- [ ] App connects successfully ✅

---

**Last Updated:** November 4, 2025  
**Configuration:** ✅ Perfect (17/17 tests passed)
