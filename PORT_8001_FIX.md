# 🔧 Backend Port Configuration Fix - Port 8001

## Problem Identified
The app was making API requests to **port 8081** (Metro bundler) instead of **port 8001** (your backend server), causing 404 errors.

## Root Cause
The `src/config/networkConfig.js` file had hardcoded URLs pointing to port **8081** instead of **8001**.

## Fix Applied
Updated `src/config/networkConfig.js` to use the correct ports:

### Development (Local Testing)
- **iOS Simulator**: `http://localhost:8001/api`
- **Android Emulator**: `http://10.0.2.2:8001/api`
- **Android Device**: `http://localhost:8001/api`
- **WebSocket**: `ws://localhost:8001`

### Production (VPS Server)
- **API URL**: `http://185.193.19.244:8080/api`
- **WebSocket**: `ws://185.193.19.244:8080`

## How to Test

### Option 1: Reload in Simulator
1. In the iOS Simulator, press `Cmd + D` or shake device
2. Select **"Reload"**
3. The app should now connect to port 8001

### Option 2: Restart Metro Bundler
```bash
# Kill existing Metro process
lsof -ti:8081 | xargs kill -9

# Start fresh Metro bundler with cache cleared
npx react-native start --reset-cache
```

Then reload the app in the simulator.

## Verification
After reload, you should see:
- ✅ Environment config showing: `http://localhost:8001/api`
- ✅ Categories loading successfully
- ✅ No more 404 errors

## Current Status
- ✅ Backend server is running on port 8001 (verified)
- ✅ Backend is returning data correctly (verified with curl)
- ✅ Configuration files updated
- ⏳ **NEXT STEP**: Reload the app to apply changes

## Quick Commands

### Check if backend is running:
```bash
lsof -ti:8001
```

### Test backend directly:
```bash
curl http://localhost:8001/api/categories
```

### Reload app:
Press `r` in Metro terminal or `Cmd + D` in iOS Simulator → Reload
