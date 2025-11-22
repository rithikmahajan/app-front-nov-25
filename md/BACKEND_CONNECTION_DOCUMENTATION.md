# 🌐 Backend Connection Documentation - YORAA App

**Last Updated:** November 4, 2025  
**Author:** Development Team  
**Status:** ✅ Active Configuration

---

## 📊 Overview

The YORAA React Native app connects to different backend servers based on the **environment** (development vs production) and **platform** (iOS vs Android). This document explains how the connection works in both scenarios.

---

## 🎯 Quick Reference Table

| Environment | Platform | Backend URL | Port | Use Case |
|------------|----------|-------------|------|----------|
| **Local Development** | iOS Simulator | `http://localhost:8001/api` | 8001 | Local testing with backend on your Mac |
| **Local Development** | Android Emulator | `http://10.0.2.2:8001/api` | 8001 | Local testing (Android uses special localhost mapping) |
| **Production** | All Platforms | `http://185.193.19.244:8080/api` | 8080 | TestFlight, App Store, Physical Devices |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YORAA Mobile App                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Environment Detection (__DEV__)            │    │
│  └─────────────────┬──────────────────────────────────┘    │
│                    │                                         │
│         ┌──────────┴──────────┐                             │
│         │                     │                             │
│    ┌────▼─────┐         ┌────▼─────┐                       │
│    │   DEV    │         │   PROD   │                       │
│    │ __DEV__  │         │ !__DEV__ │                       │
│    └────┬─────┘         └────┬─────┘                       │
│         │                     │                             │
└─────────┼─────────────────────┼─────────────────────────────┘
          │                     │
          │                     │
    ┌─────▼──────┐       ┌─────▼──────────────────────┐
    │   LOCAL    │       │   CONTABO VPS (PRODUCTION) │
    │ BACKEND    │       │   185.193.19.244:8080      │
    │ PORT 8081  │       │   Docker Container         │
    └────────────┘       └────────────────────────────┘
```

---

## 💻 Local Development Configuration

### How It Works

When running the app with **Metro bundler** (development mode), the app automatically detects this using the `__DEV__` flag and connects to your **local backend server**.

### Configuration Files

#### 1. **Environment Variables** (`.env.development`)
```bash
# Local Development Backend
API_BASE_URL=http://localhost:8081/api
BACKEND_URL=http://localhost:8081/api
APP_ENV=development

# Android Emulator Mapping
ANDROID_EMULATOR_URL=http://10.0.2.2:8081/api
IOS_SIMULATOR_URL=http://localhost:8081/api

# Debug Settings
DEBUG_MODE=true
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true
```

#### 2. **Main Backend API Service** (`src/services/yoraaBackendAPI.js`)
```javascript
class YoraaBackendAPI {
  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://localhost:8081/api'        // 🔧 Development
      : 'http://185.193.19.244:8080/api';  // 🚀 Production
    this.token = null;
  }
  
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    // Makes HTTP request to the appropriate backend
  }
}
```

#### 3. **Environment Configuration** (`src/config/environment.js`)
```javascript
class EnvironmentConfig {
  constructor() {
    this.api = {
      // Development: localhost:8081
      baseUrl: Config.API_BASE_URL || 'http://localhost:8081/api',
      // Production: Contabo VPS:8080
      backendUrl: Config.BACKEND_URL || 'http://185.193.19.244:8080/api',
    };
  }
  
  getApiUrl() {
    if (this.isDevelopment) {
      if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to access host machine
        return this.api.baseUrl.replace('localhost', '10.0.2.2');
      } else {
        // iOS Simulator - direct localhost
        return this.api.baseUrl;
      }
    }
    return this.api.backendUrl; // Production
  }
}
```

#### 4. **API Configuration** (`src/config/apiConfig.js`)
```javascript
const getNetworkConfig = () => {
  // In development, this can be configured for localhost
  // In production builds, this returns production URL
  return {
    BASE_URL: 'http://185.193.19.244:8080/api',
  };
};

export const API_CONFIG = {
  BASE_URL: networkConfig.BASE_URL || environmentConfig.getApiUrl(),
  BACKEND_URL: networkConfig.BASE_URL || environmentConfig.getBackendUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
```

### Prerequisites for Local Development

1. **Start Your Local Backend Server**
   ```bash
   cd your-backend-directory
   npm run dev
   # Ensure it's running on port 8081 (backend default)
   ```

2. **Verify Backend is Running**
   ```bash
   # Test health endpoint
   curl http://localhost:8081/api/health
   
   # Should return: {"status": "healthy"}
   ```

3. **Start Metro Bundler**
   ```bash
   cd /path/to/yoraa-app
   npx react-native start
   ```

4. **Run the App**
   ```bash
   # iOS
   npx react-native run-ios
   
   # Android
   npx react-native run-android
   ```

### Platform-Specific Notes

#### iOS Simulator
- Uses **direct localhost access**: `http://localhost:8081/api`
- No special configuration needed
- Simulator can access Mac's localhost directly

#### Android Emulator
- Uses **special mapping**: `http://10.0.2.2:8081/api`
- `10.0.2.2` is Android's alias for host machine's `localhost`
- Automatically configured in `environment.js`

---

## 🚀 Production Configuration

### How It Works

When you build the app for **TestFlight** or **App Store**, React Native automatically sets `__DEV__` to `false`, and the app connects to the **production backend server** hosted on Contabo VPS.

### Configuration Files

#### 1. **Environment Variables** (`.env.production`)
```bash
# Production Backend API (Contabo Server)
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

# Razorpay (Live Keys)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Production Settings
USE_PROXY=false
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false
```

#### 2. **Backend URL Detection**
```javascript
// Automatically uses production URL when __DEV__ is false
this.baseURL = __DEV__ 
  ? 'http://localhost:8081/api'        // Never used in production builds
  : 'http://185.193.19.244:8080/api';  // ✅ Active in production
```

### Production Server Details

**Server:** Contabo VPS  
**IP Address:** 185.193.19.244  
**Port:** 8080 (Docker container)  
**Protocol:** HTTP  
**Base API URL:** `http://185.193.19.244:8080/api`

#### Available Endpoints
```bash
# Health Check
GET http://185.193.19.244:8080/health

# Authentication
POST http://185.193.19.244:8080/api/auth/register
POST http://185.193.19.244:8080/api/auth/login
POST http://185.193.19.244:8080/api/auth/verify-otp

# User Management
GET http://185.193.19.244:8080/api/user/profile
PUT http://185.193.19.244:8080/api/user/profile

# Products
GET http://185.193.19.244:8080/api/products
GET http://185.193.19.244:8080/api/products/:id

# Cart & Orders
GET http://185.193.19.244:8080/api/cart
POST http://185.193.19.244:8080/api/orders
GET http://185.193.19.244:8080/api/orders/:id
```

### Building for Production

#### iOS (TestFlight/App Store)
```bash
# Clean build
cd ios
rm -rf build Pods
pod install
cd ..

# Build release version
npx react-native run-ios --configuration Release

# Or build archive for TestFlight
xcodebuild -workspace ios/YoraaApp.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -archivePath ios/build/YoraaApp.xcarchive \
  archive
```

#### Android (Play Store)
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Build release APK
cd android
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease
```

### Verify Production Build

1. **Check Build Configuration**
   ```bash
   # iOS - Check Info.plist
   cat ios/YoraaApp/Info.plist | grep 185.193.19.244
   
   # Should show production server IP
   ```

2. **Test Production API**
   ```bash
   # Run test script
   node test-production-api.js
   
   # Or manual test
   curl http://185.193.19.244:8080/health
   ```

---

## 🔄 Switching Between Environments

### Method 1: Using Build Commands

```bash
# Development (uses localhost)
npx react-native run-ios

# Production testing (uses production backend)
npx react-native run-ios --configuration Release
```

### Method 2: Environment Variables

Create `.env.development.local` to override settings:
```bash
# Force production backend in development
API_BASE_URL=http://185.193.19.244:8080/api
APP_ENV=production
```

Then restart Metro:
```bash
# Stop Metro (Ctrl+C)
# Clear cache and restart
npx react-native start --reset-cache
```

### Method 3: Code Override (Temporary Testing)

In `src/config/environment.js`:
```javascript
getApiUrl() {
  // TEMP: Force production backend
  return 'http://185.193.19.244:8080/api';
  
  // Original logic:
  // if (this.isDevelopment) {
  //   return this.api.baseUrl;
  // }
  // return this.api.backendUrl;
}
```

**⚠️ Remember to revert this before committing!**

---

## 🧪 Testing Backend Connection

### Available Test Scripts

```bash
# Test backend connection
./test-backend-connection.js

# Test all API endpoints
./test-api.sh

# Test authentication flow
./test-auth-fix.sh

# Check API configuration
./check-api-config.sh

# Test production backend
./test-contabo-connection.sh
```

### Manual Testing

#### Test Local Backend
```bash
curl http://localhost:8081/api/health
# Expected: {"status":"healthy","timestamp":"..."}
```

#### Test Production Backend
```bash
curl http://185.193.19.244:8080/health
# Expected: {"status":"healthy","uptime":"..."}
```

#### Test with Authentication
```javascript
// In React Native app
import { yoraaBackendAPI } from './src/services/yoraaBackendAPI';

// Login
const response = await yoraaBackendAPI.login({
  phone: '+911234567890',
  password: 'testpassword'
});

console.log('Login response:', response);
```

---

## 🛠️ Troubleshooting

### Issue: "Network request failed" in Development

**Cause:** Local backend not running or wrong port

**Solution:**
```bash
# 1. Check if backend is running
lsof -i :8081

# 2. Start your backend
cd your-backend-directory
npm run dev

# 3. Verify it's accessible
curl http://localhost:8081/api/health
```

### Issue: Android Emulator can't connect to localhost

**Cause:** Android uses special localhost mapping

**Solution:**
The app automatically handles this! It converts `localhost` to `10.0.2.2` for Android.

Verify in logs:
```javascript
// Should show for Android:
// API URL: http://10.0.2.2:8081/api
```

### Issue: Production app not connecting

**Cause:** May be using dev configuration

**Solution:**
```bash
# 1. Verify production build
npx react-native run-ios --configuration Release

# 2. Check backend is accessible
curl http://185.193.19.244:8080/health

# 3. Check app is using production URL
# Look for this in app logs:
# Backend URL: http://185.193.19.244:8080/api
```

### Issue: Certificate/SSL errors

**Cause:** Production server uses HTTP (not HTTPS)

**Solution:**
Ensure iOS `Info.plist` allows insecure HTTP:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

---

## 📝 Configuration Files Summary

| File | Purpose | Local URL | Production URL |
|------|---------|-----------|----------------|
| `.env.development` | Dev environment vars | `http://localhost:8081/api` | N/A |
| `.env.production` | Prod environment vars | N/A | `http://185.193.19.244:8080/api` |
| `src/services/yoraaBackendAPI.js` | Main API service | `localhost:8081` | `185.193.19.244:8080` |
| `src/config/environment.js` | Environment detection | `localhost:8081` | `185.193.19.244:8080` |
| `src/config/apiConfig.js` | API configuration | Uses environment.js | Uses environment.js |
| `ios/YoraaApp/Info.plist` | iOS network config | Allows localhost | Allows 185.193.19.244 |

---

## 🔐 Security Notes

1. **API Keys**: Production uses live Razorpay keys. Never commit these to public repos.
2. **HTTPS**: Consider upgrading production to HTTPS with SSL certificate.
3. **Authentication**: All sensitive endpoints require JWT bearer token.
4. **Network Security**: iOS requires explicit permission for HTTP (non-HTTPS) connections.

---

## 📚 Additional Resources

- **Backend Connection Guide**: `BACKEND_CONNECTION_GUIDE.md`
- **Production Integration**: `md/PRODUCTION_BACKEND_INTEGRATION.md`
- **Backend Handoff**: `md/BACKEND_HANDOFF.md`
- **Environment Setup**: `md/BACKEND_CONFIGURATION_VERIFIED.md`

---

## 🎯 Quick Commands Reference

```bash
# Development
npm start                          # Start Metro bundler
npx react-native run-ios          # Run on iOS Simulator
npx react-native run-android      # Run on Android Emulator

# Production Testing
npx react-native run-ios --configuration Release
npx react-native run-android --variant=release

# Backend Testing
curl http://localhost:8081/api/health           # Local
curl http://185.193.19.244:8080/health         # Production

# Cleanup
npx react-native start --reset-cache           # Clear Metro cache
rm -rf ios/build && cd ios && pod install      # iOS clean
cd android && ./gradlew clean                  # Android clean
```

---

## ✅ Checklist

### For Local Development
- [ ] Local backend running on port 8081
- [ ] Metro bundler started
- [ ] `.env.development` configured
- [ ] Can access `http://localhost:8081/api/health`

### For Production Deployment
- [ ] `.env.production` configured
- [ ] Production backend accessible at `185.193.19.244:8080`
- [ ] Built with Release configuration
- [ ] Tested health endpoint
- [ ] Verified API responses

---

**Document Version:** 1.0  
**Last Verified:** November 4, 2025  
**Maintained By:** YORAA Development Team
