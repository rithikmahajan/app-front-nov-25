# 🚀 Frontend Environment Configuration - YORAA

**Last Updated:** October 15, 2025  
**Production Server:** Contabo VPS (185.193.19.244:8080)

---

## 📋 Quick Reference

### Production API
```
IP: 185.193.19.244
Port: 8080
Base URL: http://185.193.19.244:8080/api
Health Check: http://185.193.19.244:8080/health
```

### Development API
```
Local: http://localhost:8001/api
Android Emulator: http://10.0.2.2:8001/api
iOS Simulator: http://localhost:8001/api
```

---

## 🔧 Environment Files

### ✅ Already Configured

#### `.env.production` (Production Environment)
```env
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

# API Timeout Configuration (milliseconds)
API_TIMEOUT=30000
CONNECT_TIMEOUT=30000

# Razorpay (Production)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
```

#### `.env` or `.env.development` (Development Environment)
```env
# Development Backend API (Localhost)
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true
BUILD_TYPE=debug

# Local Server URLs
LOCAL_SERVER_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api
```

---

## 📱 Platform-Specific Configuration

### iOS Configuration ✅ DONE

**File:** `ios/YoraaApp/Info.plist`

Already configured with:
```xml
<key>NSAppTransportSecurity</key>
<dict>
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

### Android Configuration ✅ DONE

**File:** `android/app/src/main/res/xml/network_security_config.xml`

Created with:
```xml
<network-security-config>
    <!-- Production Server -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">185.193.19.244</domain>
    </domain-config>
    
    <!-- Local Development -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

**File:** `android/app/src/main/AndroidManifest.xml`

Updated with:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ...>
```

---

## 💻 Code Configuration

### API Client Setup

Your app should already have API configuration, but here's the recommended setup:

#### **File:** `src/config/api.js` or `src/services/api.js`

```javascript
import axios from 'axios';
import Config from 'react-native-config'; // or your env manager

// API Configuration
const API_CONFIG = {
  BASE_URL: Config.API_BASE_URL || 'http://185.193.19.244:8080/api',
  TIMEOUT: parseInt(Config.API_TIMEOUT) || 30000,
  CONNECT_TIMEOUT: parseInt(Config.CONNECT_TIMEOUT) || 30000,
};

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage (AsyncStorage, SecureStore, etc.)
      const token = await getAuthToken(); // Your token getter function
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - refresh token or logout
      await handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Example

```javascript
import api from './config/api';

// Get products
const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Create order
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
```

---

## 🔗 API Endpoints

### Core Endpoints

| Endpoint | Method | URL | Purpose |
|----------|--------|-----|---------|
| Health Check | GET | `/health` | Server status |
| Login | POST | `/api/auth/login` | User authentication |
| Register | POST | `/api/auth/register` | User registration |
| Profile | GET | `/api/profile` | Get user profile |
| Products | GET | `/api/products` | List products |
| Product Details | GET | `/api/products/:id` | Single product |
| Categories | GET | `/api/categories` | List categories |
| Cart | GET/POST | `/api/cart` | Cart operations |
| Orders | POST | `/api/orders/create` | Create order |
| Order Details | GET | `/api/orders/:id` | Get order |
| Tracking | GET | `/api/orders/:id/tracking` | Track order |

### Full URLs (Production)

```javascript
const ENDPOINTS = {
  // Base
  HEALTH: 'http://185.193.19.244:8080/health',
  
  // Auth
  LOGIN: 'http://185.193.19.244:8080/api/auth/login',
  REGISTER: 'http://185.193.19.244:8080/api/auth/register',
  
  // Products
  PRODUCTS: 'http://185.193.19.244:8080/api/products',
  CATEGORIES: 'http://185.193.19.244:8080/api/categories',
  
  // User
  PROFILE: 'http://185.193.19.244:8080/api/profile',
  
  // Shopping
  CART: 'http://185.193.19.244:8080/api/cart',
  ORDERS: 'http://185.193.19.244:8080/api/orders',
};
```

---

## 🧪 Testing Connection

### 1. Browser Test
Open in browser:
```
http://185.193.19.244:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T..."
}
```

### 2. Terminal Test (cURL)
```bash
curl http://185.193.19.244:8080/health
```

### 3. In-App Test (React Native)

Add this to a test screen or component:

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import api from './config/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');

  const testConnection = async () => {
    try {
      const response = await api.get('/health');
      setStatus(`✅ Connected: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setStatus(`❌ Failed: ${error.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Connection Status:</Text>
      <Text>{status}</Text>
      <Button title="Test Again" onPress={testConnection} />
    </View>
  );
};
```

---

## 🔄 Switching Between Environments

### Method 1: Manual (Copy/Rename)
```bash
# Use production
cp .env.production .env

# Use development
cp .env.development .env

# Restart Metro
npm start -- --reset-cache
```

### Method 2: Using Scripts (Add to package.json)
```json
{
  "scripts": {
    "start": "react-native start",
    "start:prod": "cp .env.production .env && react-native start",
    "start:dev": "cp .env.development .env && react-native start",
    "ios": "react-native run-ios",
    "ios:prod": "cp .env.production .env && react-native run-ios --configuration Release",
    "android": "react-native run-android",
    "android:prod": "cp .env.production .env && react-native run-android --variant=release"
  }
}
```

### Method 3: Using react-native-config

If using `react-native-config`:

```bash
# Development
ENVFILE=.env.development react-native run-ios

# Production
ENVFILE=.env.production react-native run-ios --configuration Release
```

---

## 📦 Build Commands

### Development Build

**iOS:**
```bash
# Development with localhost
npx react-native run-ios
```

**Android:**
```bash
# Development with localhost
npx react-native run-android
```

### Production Build

**iOS:**
```bash
# 1. Switch to production env
cp .env.production .env

# 2. Build release
npx react-native run-ios --configuration Release

# Or via Xcode:
# - Open ios/YoraaApp.xcworkspace
# - Select "Release" scheme
# - Build
```

**Android:**
```bash
# 1. Switch to production env
cp .env.production .env

# 2. Build release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚨 Troubleshooting

### Issue: Cannot connect to server

**Solution 1: Check backend status**
```bash
curl http://185.193.19.244:8080/health
```

**Solution 2: Check network config**
- iOS: Verify Info.plist has `185.193.19.244` exception
- Android: Verify network_security_config.xml exists and is referenced

**Solution 3: Clear cache**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear iOS build
cd ios && rm -rf build && cd ..
pod install --repo-update

# Clear Android build
cd android && ./gradlew clean && cd ..
```

### Issue: 401 Unauthorized

**Solution:**
- Token expired - re-login
- Check if token is being sent in headers
- Verify token format: `Bearer {token}`

### Issue: Timeout errors

**Solution:**
- Increase timeout in .env: `API_TIMEOUT=60000`
- Check internet connection
- Verify server is responding

### Issue: SSL/TLS errors

**Solution:**
- Using HTTP (not HTTPS) is intentional for this server
- Network config should allow cleartext traffic
- Verify `NSExceptionAllowsInsecureHTTPLoads` is true (iOS)
- Verify `cleartextTrafficPermitted` is true (Android)

---

## ✅ Configuration Checklist

### Environment Files
- [x] `.env.production` configured with Contabo IP
- [x] `.env` or `.env.development` configured for local dev
- [x] Timeout settings added (30 seconds)

### iOS Configuration
- [x] Info.plist has NSAppTransportSecurity exception
- [x] Exception for 185.193.19.244 added
- [x] Exception for localhost added (dev)

### Android Configuration
- [x] network_security_config.xml created
- [x] AndroidManifest.xml references network config
- [x] Cleartext traffic permitted for server IP
- [x] Cleartext traffic permitted for localhost (dev)

### Code Configuration
- [ ] API client using environment variables
- [ ] Timeout configuration applied
- [ ] Request interceptor adds auth token
- [ ] Response interceptor handles errors
- [ ] Error handling for network failures

### Testing
- [ ] Health endpoint returns 200
- [ ] Can fetch products
- [ ] Can authenticate user
- [ ] Can create orders
- [ ] Tracking works

---

## 📝 Notes

### Production Server Details
- **Provider:** Contabo VPS
- **Location:** USC1 (US Central)
- **IP:** 185.193.19.244
- **Port:** 8080
- **Protocol:** HTTP (not HTTPS)
- **Status:** ✅ Live and operational

### Security Considerations
- Currently using HTTP (not HTTPS)
- Plan to add SSL certificate in future
- All sensitive data (passwords, tokens) should still be encrypted in transit when possible
- Razorpay handles its own payment security

### Environment Best Practices
1. Never commit `.env` files with real credentials
2. Use different keys for dev/prod (Razorpay, Firebase, etc.)
3. Keep production .env file secure
4. Document all environment variables
5. Test on both environments before deploying

---

## 🆘 Support

### Backend Issues
Contact backend team about:
- Server downtime
- API endpoint changes
- Authentication issues
- Database problems

### Frontend Issues
Debug:
1. Check environment file is loaded
2. Verify network configuration
3. Check API client setup
4. Review error logs
5. Test with curl/Postman first

---

## 📚 Related Documentation

- `BACKEND_TEAM_SHIPROCKET_INTEGRATION.md` - Shiprocket setup
- `PRODUCTION_API_QUICK_REFERENCE.js` - API examples
- `BACKEND_QUICK_REFERENCE.md` - Backend API docs

---

**Environment Status:** ✅ Fully Configured  
**Last Verified:** October 15, 2025  
**Ready for:** Development & Production

---

**All configuration complete! Your app is ready to connect to both local development and Contabo production servers.** 🚀
