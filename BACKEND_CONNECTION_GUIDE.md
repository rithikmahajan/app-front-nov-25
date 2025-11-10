# 🌐 Backend Connection Guide - Yoraa App

**Last Updated:** November 1, 2025  
**Project:** Yoraa React Native App  
**Backend Server:** Contabo VPS (185.193.19.244:8080)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Local Development Setup](#local-development-setup)
3. [Production Setup](#production-setup)
4. [How It Works](#how-it-works)
5. [Environment Configuration Files](#environment-configuration-files)
6. [API Services](#api-services)
7. [Switching Between Environments](#switching-between-environments)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Yoraa app uses **different backend URLs** depending on whether you're running it in:
- **Development mode** (iOS Simulator/Android Emulator with Metro bundler)
- **Production mode** (TestFlight/App Store builds)

### Quick Reference

| Environment | Backend URL | Port | Purpose |
|------------|-------------|------|---------|
| **Local Development** | `http://localhost:8001/api` | 8001 | iOS Simulator with local backend |
| **Local Development** | `http://10.0.2.2:8001/api` | 8001 | Android Emulator with local backend |
| **Production** | `http://185.193.19.244:8080/api` | 8080 | TestFlight/App Store (Contabo VPS Docker) |

---

## 💻 Local Development Setup

### Prerequisites
- Backend server running locally on port **8001**
- Metro bundler running
- iOS Simulator or Android Emulator

### Configuration

#### 1. Environment Variables (`.env` or `.env.development`)

```bash
# Development Environment Variables
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true

# Platform-specific URLs
LOCAL_SERVER_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api

# Debug features enabled
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Build configuration
BUILD_TYPE=debug
```

#### 2. How the App Detects Local Development

The app uses the `__DEV__` flag (automatically set by React Native):

```javascript
// In src/services/yoraaBackendAPI.js
this.baseURL = __DEV__ 
  ? 'http://localhost:8001/api'        // Development
  : 'http://185.193.19.244:8080/api';  // Production
```

When running with Metro bundler:
- `__DEV__ = true` → Uses `localhost:8001`
- App connects to your local backend server

#### 3. Starting Local Development

```bash
# Terminal 1: Start your local backend on port 8001
cd /path/to/backend
npm start  # or yarn start

# Terminal 2: Start Metro bundler
cd /path/to/yoraa-app
npm start -- --reset-cache

# Terminal 3: Run the app
npx react-native run-ios
# or
npx react-native run-android
```

### Important Notes for Local Development

⚠️ **iOS Simulator:**
- Uses `localhost:8001` directly
- Make sure your backend is running on port 8001

⚠️ **Android Emulator:**
- Cannot use `localhost` directly
- Uses `10.0.2.2:8001` (Android's special IP for host machine)
- Configure this in `apiConfig.js` if needed

⚠️ **Physical Device:**
- Cannot use `localhost`
- Must use your computer's IP address (e.g., `192.168.1.100:8001`)
- Run `./find-ip.sh` to find your IP
- Update `.env.development` with your IP address

---

## 🚀 Production Setup

### Configuration

#### 1. Environment Variables (`.env.production`)

```bash
# Production Environment Variables
API_BASE_URL=http://185.193.19.244:8080/api
BACKEND_URL=http://185.193.19.244:8080/api
SERVER_IP=185.193.19.244
SERVER_PORT=8080
HEALTH_CHECK_URL=http://185.193.19.244:8080/health

# Environment Configuration
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
BUILD_TYPE=release

# API Timeout Configuration
API_TIMEOUT=30000
CONNECT_TIMEOUT=30000

# Production Features
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false
USE_PROXY=false
```

#### 2. How the App Detects Production

When building for TestFlight/App Store:
1. **Xcode creates a Release build** → `__DEV__ = false`
2. **Bundle is created** → `process.env.NODE_ENV = "production"`
3. **App connects to** → `http://185.193.19.244:8080/api`

#### 3. Building for Production

```bash
# Build for TestFlight
./build-for-testflight-complete.sh

# Or manually:
cd ios
xcodebuild -workspace YoraaApp.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -archivePath ./build/YoraaApp.xcarchive \
  archive
```

---

## 🔧 How It Works

### 1. Main API Service Configuration

**File:** `src/services/yoraaBackendAPI.js`

```javascript
class YoraaBackendAPI {
  constructor() {
    // Environment-based API URLs
    this.baseURL = __DEV__ 
      ? 'http://localhost:8001/api'        // Development
      : 'http://185.193.19.244:8080/api';  // Production
    this.token = null;
  }
  
  // Makes requests to: ${this.baseURL}${endpoint}
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    // ... makes HTTP request
  }
}
```

### 2. API Config Service

**File:** `src/config/apiConfig.js`

```javascript
const getNetworkConfig = () => {
  // Always use production backend for builds
  return {
    BASE_URL: 'http://185.193.19.244:8080/api',
  };
};

export const API_CONFIG = {
  BASE_URL: networkConfig.BASE_URL,
  BACKEND_URL: networkConfig.BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
```

### 3. Environment Config

**File:** `src/config/environment.js`

```javascript
class EnvironmentConfig {
  constructor() {
    this.env = Config.APP_ENV || (__DEV__ ? 'development' : 'production');
    this.isDevelopment = this.env === 'development' || __DEV__;
    this.isProduction = this.env === 'production' && !__DEV__;
    
    this.api = {
      baseUrl: Config.API_BASE_URL || 'http://localhost:8001/api',
      backendUrl: Config.BACKEND_URL || 'http://185.193.19.244:8080/api',
    };
  }
  
  getApiUrl() {
    return this.isDevelopment ? this.api.baseUrl : this.api.backendUrl;
  }
}
```

### 4. Axios Clients

Multiple services use axios with the base URL:

```javascript
// src/services/apiService.js
import { API_CONFIG } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

---

## 📁 Environment Configuration Files

### File Structure

```
project-root/
├── .env                    # Currently active environment
├── .env.development        # Local development config
├── .env.production         # Production config
├── src/
│   ├── config/
│   │   ├── apiConfig.js         # API URL configuration
│   │   └── environment.js       # Environment detection
│   └── services/
│       ├── yoraaBackendAPI.js   # Main API service
│       ├── apiService.js        # Axios-based API service
│       ├── bundleService.js     # Bundle API
│       └── enhancedApiService.js # Enhanced API
└── ios/
    └── YoraaApp/
        └── Info.plist           # iOS network security config
```

### iOS Network Security Configuration

**File:** `ios/YoraaApp/Info.plist`

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>185.193.19.244</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
    <key>localhost</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
```

This allows HTTP (non-HTTPS) connections to:
- Production server: `185.193.19.244`
- Local development: `localhost`

---

## 🔄 Switching Between Environments

### Method 1: Using the Switch Script (Recommended)

```bash
# Run the environment switcher
./switch-env.sh

# Select:
# 1) Development (localhost:8001)
# 2) Production (185.193.19.244:8080)

# Then restart Metro
npm start -- --reset-cache
```

### Method 2: Manual Switching

```bash
# Switch to development
cp .env.development .env
npm start -- --reset-cache

# Switch to production
cp .env.production .env
npm start -- --reset-cache
```

### Method 3: Direct Environment Variable

```bash
# Run with specific environment
ENVFILE=.env.development npx react-native run-ios

# Or for production testing
ENVFILE=.env.production npx react-native run-ios
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Network Request Failed" in Development

**Problem:** App can't connect to local backend

**Solutions:**
- ✅ Verify backend is running: `curl http://localhost:8001/api/health`
- ✅ Check if port 8001 is in use: `lsof -i :8001`
- ✅ Restart Metro bundler: `npm start -- --reset-cache`
- ✅ Check `.env` file points to correct URL
- ✅ For Android, verify using `10.0.2.2:8001` instead of `localhost:8001`

#### 2. "Network Request Failed" in Production

**Problem:** TestFlight build can't connect to production server

**Solutions:**
- ✅ Verify server is accessible: `curl http://185.193.19.244:8080/api/health`
- ✅ Check iOS `Info.plist` allows HTTP to `185.193.19.244`
- ✅ Verify `__DEV__` is `false` in release build
- ✅ Check build configuration is "Release" not "Debug"

#### 3. Wrong Backend URL Being Used

**Problem:** App connects to wrong backend

**Check these in order:**
```bash
# 1. Check .env file
cat .env | grep API_BASE_URL

# 2. Check if __DEV__ is set correctly
# In your code, add: console.log('__DEV__:', __DEV__);

# 3. Clear cache and rebuild
npm start -- --reset-cache
npx react-native run-ios

# 4. For production builds, verify Release configuration
cat ios/YoraaApp.xcodeproj/project.pbxproj | grep -A 5 "Release"
```

#### 4. Android Emulator Can't Connect to Localhost

**Problem:** Android emulator shows network errors

**Solution:**
Android emulators can't use `localhost`. Update your config:

```javascript
// In src/config/apiConfig.js
if (Platform.OS === 'android' && __DEV__) {
  return {
    BASE_URL: 'http://10.0.2.2:8001/api',  // Android emulator
  };
}
```

#### 5. Physical Device Can't Connect in Development

**Problem:** Testing on physical device shows network errors

**Solution:**
Physical devices need your computer's IP address:

```bash
# Find your IP
./find-ip.sh
# Or manually: ifconfig | grep "inet " | grep -v 127.0.0.1

# Update .env.development
API_BASE_URL=http://192.168.1.100:8001/api  # Use your actual IP

# Restart Metro
npm start -- --reset-cache
```

---

## 🧪 Testing Connection

### Test Scripts Available

```bash
# Test backend connection
./test-backend-connection.js

# Test all API endpoints
./test-api.sh

# Test authentication flow
./test-auth-fix.sh

# Check API configuration
./check-api-config.sh
```

### Manual Testing

```bash
# Test local backend
curl http://localhost:8001/api/health

# Test production backend
curl http://185.193.19.244:8080/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://185.193.19.244:8080/api/user/profile
```

---

## 📊 Connection Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     APP STARTUP                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Check __DEV__ │
            └────────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    __DEV__ = true          __DEV__ = false
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────────┐
│   DEVELOPMENT   │     │     PRODUCTION      │
│                 │     │                     │
│  localhost:8001 │     │ 185.193.19.244:8080 │
│                 │     │                     │
│ - Metro bundler │     │ - TestFlight        │
│ - Hot reload    │     │ - App Store         │
│ - Debug enabled │     │ - Debug disabled    │
└─────────────────┘     └─────────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   API Services        │
         │ - yoraaBackendAPI.js  │
         │ - apiService.js       │
         │ - bundleService.js    │
         └──────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │  Backend Endpoints    │
         │ - /api/auth/*         │
         │ - /api/user/*         │
         │ - /api/products/*     │
         │ - /api/cart/*         │
         └──────────────────────┘
```

---

## 🔐 Security Considerations

### Development
- ✅ Debug mode enabled
- ✅ HTTP connections allowed for localhost
- ✅ Detailed logging enabled
- ⚠️ Never commit tokens or sensitive data

### Production
- ✅ Debug mode disabled
- ✅ HTTP allowed only for specific domain (185.193.19.244)
- ✅ Minimal logging
- ✅ Token refresh mechanism in place
- ✅ Secure storage for auth tokens
- ⚠️ Consider migrating to HTTPS in future

---

## 📚 Related Documentation

- [`BACKEND_CONNECTION_ANALYSIS.md`](./BACKEND_CONNECTION_ANALYSIS.md) - Detailed connection analysis
- [`BACKEND_CONNECTION_FIX.md`](./BACKEND_CONNECTION_FIX.md) - Connection fixes applied
- [`PRODUCTION_API_QUICK_REFERENCE.js`](./PRODUCTION_API_QUICK_REFERENCE.js) - API endpoints reference
- [`SEARCH_API_QUICK_REFERENCE.md`](./SEARCH_API_QUICK_REFERENCE.md) - Search API documentation
- [`CART_API_DOCUMENTATION.md`](./CART_API_DOCUMENTATION.md) - Cart API documentation

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check existing documentation files
2. Review console logs for specific error messages
3. Test backend connectivity directly with curl
4. Verify environment variables are loaded correctly
5. Check React Native debugger for network requests

---

**Last Updated:** November 1, 2025  
**Maintainer:** Development Team  
**Version:** 1.0.0
