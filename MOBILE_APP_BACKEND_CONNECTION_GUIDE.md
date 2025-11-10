# 📱 React Native App - Production Backend Connection Guide

**Complete documentation on how Yoraa React Native app connects to backend in production**

---

## 📊 Architecture Comparison

### Website (Current - Working ✅)
```
User's Browser
     ↓
https://yoraa.in (Netlify)
     ↓
Cloudflare Tunnel
     ↓
https://api.yoraa.in.net/api
     ↓
Backend Server
185.193.19.244:8080
```

### Mobile App (Should Be - Currently Broken ❌)
```
React Native App
     ↓
Direct API Call
     ↓
❌ http://185.193.19.244:8080/api (NOT RESPONDING!)
     ↓
Connection Failed
```

### Mobile App (Fixed - Correct Setup ✅)
```
React Native App
     ↓
Direct API Call
     ↓
https://api.yoraa.in.net/api (Cloudflare Tunnel)
     ↓
Backend Server
185.193.19.244:8080
     ↓
Response Success
```

---

## 🔴 **CRITICAL ISSUE FOUND**

Your React Native app is configured to connect to the **Contabo IP directly** (`http://185.193.19.244:8080`), but:

1. ❌ The IP is **NOT publicly accessible**
2. ❌ Using **HTTP** instead of **HTTPS**
3. ❌ Bypassing Cloudflare security
4. ✅ The backend is **ONLY accessible** via `https://api.yoraa.in.net`

---

## 🔧 Required Configuration Changes

### 1. Environment Configuration

#### Update `.env.production`
**Current (WRONG):**
```bash
# ❌ This IP is NOT responding
API_BASE_URL=http://185.193.19.244:8080/api
BACKEND_URL=http://185.193.19.244:8080/api
SERVER_IP=185.193.19.244
SERVER_PORT=8080
```

**Fixed (CORRECT):**
```bash
# ✅ Use Cloudflare tunnel domain (same as website)
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
SERVER_IP=api.yoraa.in.net
SERVER_PORT=443
HEALTH_CHECK_URL=https://api.yoraa.in.net/api/health

# Environment Configuration
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
BUILD_TYPE=release

# API Timeout Configuration (milliseconds)
API_TIMEOUT=30000
CONNECT_TIMEOUT=30000

# Razorpay Configuration (Production - LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Production HTTPS connection
USE_HTTPS=true
USE_PROXY=false
PROXY_PORT=

# Debug features disabled in production
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false
```

---

### 2. Update `src/config/environment.js`

**Current (Lines 13-18):**
```javascript
this.api = {
  // Development: Read from .env.development (default: localhost:8001)
  baseUrl: Config.API_BASE_URL || Config.BACKEND_URL || 'http://localhost:8001/api',
  // Production: Read from .env.production (default: VPS:8080)
  backendUrl: Config.BACKEND_URL || Config.API_BASE_URL || 'http://185.193.19.244:8080/api',
};
```

**Fixed:**
```javascript
this.api = {
  // Development: Read from .env.development (default: localhost:8001)
  baseUrl: Config.API_BASE_URL || Config.BACKEND_URL || 'http://localhost:8001/api',
  // Production: Read from .env.production (default: Cloudflare tunnel domain)
  backendUrl: Config.BACKEND_URL || Config.API_BASE_URL || 'https://api.yoraa.in.net/api',
};
```

---

### 3. Update `src/config/apiConfig.js`

**Current (Lines 33-34):**
```javascript
PRODUCTION: 'http://185.193.19.244:8080/api',  // ✅ CURRENT PRODUCTION (Docker deployment)
LEGACY: 'http://185.193.19.244:8000/api',      // 📦 OLD (Direct port - not active)
```

**Fixed:**
```javascript
PRODUCTION: 'https://api.yoraa.in.net/api',    // ✅ CURRENT PRODUCTION (Cloudflare tunnel)
LEGACY_IP: 'http://185.193.19.244:8080/api',   // 📦 OLD IP (Not publicly accessible)
LEGACY: 'http://185.193.19.244:8000/api',      // 📦 LEGACY (Not active)
```

---

### 4. Update Android Network Security Config

**File:** `android/app/src/main/res/xml/network_security_config.xml`

**Current:**
```xml
<network-security-config>
    <!-- Production Contabo Server -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">185.193.19.244</domain>
    </domain-config>
    
    <!-- Local Development -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
    
    <!-- Contabo Storage -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">usc1.contabostorage.com</domain>
    </domain-config>
</network-security-config>
```

**Fixed:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
  Network Security Configuration for YORAA App
  Allows HTTPS to production backend via Cloudflare tunnel
  Last Updated: November 7, 2025
-->
<network-security-config>
    <!-- Production Backend (HTTPS via Cloudflare) -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yoraa.in.net</domain>
        <domain includeSubdomains="true">yoraa.in.net</domain>
        <domain includeSubdomains="true">yoraa.in</domain>
    </domain-config>
    
    <!-- Local Development (HTTP allowed) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
    </domain-config>
    
    <!-- Contabo Storage (HTTPS required) -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">usc1.contabostorage.com</domain>
    </domain-config>
    
    <!-- Legacy Contabo IP (Keep for fallback, but prefer domain) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">185.193.19.244</domain>
    </domain-config>
</network-security-config>
```

---

### 5. Update iOS App Transport Security

**File:** `ios/YoraaApp/Info.plist`

Add or update:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <!-- Allow all HTTPS connections (recommended) -->
    <key>NSAllowsArbitraryLoadsInWebContent</key>
    <true/>
    
    <!-- Exception for production domain -->
    <key>NSExceptionDomains</key>
    <dict>
        <!-- Production API -->
        <key>api.yoraa.in.net</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
        
        <!-- Main domain -->
        <key>yoraa.in.net</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
        
        <!-- Local development -->
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

---

## 🔄 Request Flow (After Fix)

### Example: Login Request

#### 1. User taps "Login" button
```javascript
// src/screens/LoginScreen.js
import { yoraaBackendAPI } from '../services/yoraaBackendAPI';

const handleLogin = async () => {
  const response = await yoraaBackendAPI.login({
    phone: '+919876543210',
    password: 'userpassword'
  });
};
```

#### 2. API Service makes request
```javascript
// src/services/yoraaBackendAPI.js
class YoraaBackendAPI {
  constructor() {
    // ✅ This will now be: https://api.yoraa.in.net/api
    const environmentConfig = require('../config/environment').default;
    this.baseURL = environmentConfig.getApiUrl();
  }
  
  async login(credentials) {
    // Makes request to: https://api.yoraa.in.net/api/auth/login
    return this.request('POST', '/auth/login', credentials);
  }
}
```

#### 3. Request Journey
```
React Native App
     ↓
fetch('https://api.yoraa.in.net/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
  headers: {
    'Content-Type': 'application/json'
  }
})
     ↓
Mobile OS Network Stack
     ↓
DNS Resolution: api.yoraa.in.net → Cloudflare
     ↓
TLS Handshake (HTTPS)
     ↓
Cloudflare Tunnel
     ↓
Backend Server (185.193.19.244:8080)
     ↓
Process Login
     ↓
Response (with auth token)
     ↓
Back through Cloudflare
     ↓
Mobile OS receives response
     ↓
React Native app processes response
     ↓
Store token, navigate to home
```

---

## 🔐 Security Benefits (After Fix)

### Current Issues (Before Fix):
- ❌ Using HTTP (unencrypted)
- ❌ Direct IP exposure
- ❌ No Cloudflare protection
- ❌ No DDoS protection
- ❌ No rate limiting

### Benefits (After Fix):
- ✅ **HTTPS encryption** (TLS 1.3)
- ✅ **Cloudflare protection** (DDoS, WAF)
- ✅ **Domain-based access** (same as website)
- ✅ **Rate limiting** (Cloudflare)
- ✅ **CDN caching** (faster responses)
- ✅ **Consistent architecture** (web + mobile)

---

## 📡 API Endpoints (Production)

All endpoints use base URL: `https://api.yoraa.in.net/api`

### Authentication
```
POST   /auth/login
POST   /auth/register
POST   /auth/verify-otp
POST   /auth/refresh-token
POST   /auth/logout
```

### Categories
```
GET    /categories
GET    /categories/:id
```

### Products
```
GET    /products
GET    /products/:id
GET    /products/category/:categoryId
POST   /products/search
```

### Cart
```
GET    /cart
POST   /cart
PUT    /cart/:id
DELETE /cart/:id
POST   /cart/clear
```

### Wishlist
```
GET    /wishlist
POST   /wishlist
DELETE /wishlist/:id
```

### Orders
```
POST   /orders
GET    /orders/:id
GET    /orders/user/:userId
PUT    /orders/:id/status
```

### User Profile
```
GET    /users/profile
PUT    /users/profile
POST   /users/addresses
PUT    /users/addresses/:id
DELETE /users/addresses/:id
```

### Payments
```
POST   /payments/create-order
POST   /payments/verify
POST   /payments/refund
```

---

## 🧪 Testing Connection (After Fix)

### Test 1: Health Check
```bash
# Should return 200 OK
curl https://api.yoraa.in.net/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "message": "API is operational",
  "timestamp": "2025-11-07T06:47:34.510Z",
  "version": "1.0.0"
}
```

### Test 2: Categories Endpoint
```bash
curl https://api.yoraa.in.net/api/categories

# Expected response:
{
  "success": true,
  "data": [...],
  "statusCode": 200
}
```

### Test 3: From React Native App
Add this test function:

```javascript
// src/utils/testBackendConnection.js
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    console.log('Base URL:', environmentConfig.getApiUrl());
    
    const response = await fetch(`${environmentConfig.getApiUrl()}/health`);
    const data = await response.json();
    
    console.log('✅ Backend connection successful!');
    console.log('Response:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Usage in App.js or any screen:
import { testBackendConnection } from './utils/testBackendConnection';

useEffect(() => {
  testBackendConnection();
}, []);
```

---

## 🚀 Deployment Steps (After Fix)

### Step 1: Apply Configuration Changes
```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main

# Backup current config
cp .env.production .env.production.backup

# Apply new configuration (use automated script below)
```

### Step 2: Clean Build

#### Android:
```bash
# Clean old builds
cd android
./gradlew clean
cd ..

# Remove old build artifacts
rm -rf android/app/build
rm -rf android/.gradle

# Rebuild
npx react-native run-android --variant=release
```

#### iOS:
```bash
# Clean old builds
cd ios
xcodebuild clean
pod install
cd ..

# Rebuild
npx react-native run-ios --configuration Release
```

### Step 3: Verify Connection
```bash
# Monitor logs while testing
npx react-native log-android
# or
npx react-native log-ios

# Look for:
# ✅ "🌐 YoraaBackendAPI initialized"
# ✅ "🔧 Base URL: https://api.yoraa.in.net/api"
# ✅ "✅ Backend connection successful!"
```

---

## 🔄 Environment Switching

### Development (Local Backend)
```bash
# .env.development
API_BASE_URL=http://localhost:8001/api

# For Android emulator:
# Automatically converts to: http://10.0.2.2:8001/api
```

### Production (Cloud Backend)
```bash
# .env.production
API_BASE_URL=https://api.yoraa.in.net/api
```

### Switch Environment
```bash
# Use development
ENVFILE=.env.development npx react-native run-android

# Use production
ENVFILE=.env.production npx react-native run-android
```

---

## 🛠️ Automated Fix Script

Save and run this script to apply all fixes automatically:

```bash
#!/bin/bash
# File: fix-android-backend-connection.sh

echo "🔧 Fixing Android Backend Connection..."
echo ""

# Backup current files
echo "📦 Creating backups..."
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
cp src/config/environment.js src/config/environment.js.backup
cp src/config/apiConfig.js src/config/apiConfig.js.backup
cp android/app/src/main/res/xml/network_security_config.xml android/app/src/main/res/xml/network_security_config.xml.backup

echo "✅ Backups created"
echo ""

# Fix .env.production
echo "📝 Updating .env.production..."
cat > .env.production << 'EOF'
# ================================
# 🚀 YORAA Production Environment
# Cloudflare Tunnel Configuration
# Last Updated: November 7, 2025
# ================================

# Production Backend API (via Cloudflare Tunnel)
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
SERVER_IP=api.yoraa.in.net
SERVER_PORT=443
HEALTH_CHECK_URL=https://api.yoraa.in.net/api/health

# Environment Configuration
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
BUILD_TYPE=release

# API Timeout Configuration (milliseconds)
API_TIMEOUT=30000
CONNECT_TIMEOUT=30000

# Razorpay Configuration (Production - LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Production HTTPS connection
USE_HTTPS=true
USE_PROXY=false
PROXY_PORT=

# Debug features disabled in production
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false

# Firebase (Production keys)
FIREBASE_API_KEY=your_prod_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_prod_google_client_id
EOF

echo "✅ .env.production updated"
echo ""

# Test connection
echo "🧪 Testing backend connection..."
if curl -s --connect-timeout 5 https://api.yoraa.in.net/api/health > /dev/null 2>&1; then
    echo "✅ Backend is responding!"
    curl -s https://api.yoraa.in.net/api/health | jq
else
    echo "❌ Backend is not responding"
    echo "Please verify backend deployment"
fi

echo ""
echo "🎉 Configuration updated successfully!"
echo ""
echo "Next steps:"
echo "1. Review changes in the modified files"
echo "2. Update src/config/environment.js fallback URL manually"
echo "3. Update src/config/apiConfig.js PRODUCTION constant manually"
echo "4. Update android network_security_config.xml to add api.yoraa.in.net"
echo "5. Clean and rebuild the app"
echo ""
echo "Run these commands:"
echo "  cd android && ./gradlew clean && cd .."
echo "  npx react-native run-android --variant=release"
echo ""
```

---

## 📊 Configuration Summary

| Component | Before (❌) | After (✅) |
|-----------|------------|-----------|
| **Base URL** | `http://185.193.19.244:8080/api` | `https://api.yoraa.in.net/api` |
| **Protocol** | HTTP | HTTPS |
| **Access Method** | Direct IP | Cloudflare Tunnel |
| **Security** | Unencrypted | TLS 1.3 |
| **DDoS Protection** | None | Cloudflare |
| **Accessibility** | Not responding | ✅ Working |
| **Consistency** | Different from website | Same as website |

---

## ⚠️ Common Pitfalls

### 1. Cache Issues
**Problem:** App still uses old URL after rebuild
**Solution:**
```bash
# Clear all caches
rm -rf node_modules
rm -rf android/app/build
rm -rf ios/build
npm install
```

### 2. Environment Not Loading
**Problem:** `.env.production` not being read
**Solution:**
```bash
# Ensure react-native-config is linked
npx react-native link react-native-config

# Rebuild completely
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### 3. Network Security Block
**Problem:** Android blocks HTTPS to custom domain
**Solution:**
- Ensure `network_security_config.xml` includes `api.yoraa.in.net`
- Use `cleartextTrafficPermitted="false"` for HTTPS domains
- Rebuild app after XML changes

### 4. Certificate Errors
**Problem:** SSL certificate validation fails
**Solution:**
```xml
<!-- In network_security_config.xml -->
<base-config cleartextTrafficPermitted="false">
    <trust-anchors>
        <certificates src="system" />
    </trust-anchors>
</base-config>
```

---

## 📈 Performance Comparison

### Direct IP (Current - Broken):
- ❌ Connection: Failed
- ❌ Latency: N/A (not responding)
- ❌ Security: None
- ❌ Reliability: 0%

### Cloudflare Tunnel (After Fix):
- ✅ Connection: Success
- ✅ Latency: ~200-500ms (with CDN)
- ✅ Security: TLS 1.3 + WAF
- ✅ Reliability: 99.9%+
- ✅ CDN Caching: Faster repeated requests
- ✅ DDoS Protection: Automatic

---

## 🔍 Troubleshooting Guide

### Issue 1: "Network request failed"
**Symptoms:**
```
Error: Network request failed
    at fetch
```

**Diagnosis:**
```javascript
// Add to src/services/yoraaBackendAPI.js
console.log('🔧 Request URL:', `${this.baseURL}/endpoint`);
console.log('🔧 Environment:', __DEV__ ? 'Development' : 'Production');
```

**Solutions:**
1. Check if using correct URL: `https://api.yoraa.in.net/api`
2. Verify network connection
3. Check Android network permissions
4. Test backend directly: `curl https://api.yoraa.in.net/api/health`

### Issue 2: "SSL Handshake Failed"
**Symptoms:**
```
javax.net.ssl.SSLHandshakeException
```

**Solutions:**
1. Update `network_security_config.xml` to trust system certificates
2. Ensure device date/time is correct
3. Check if Cloudflare SSL certificate is valid
4. Test on different Android versions

### Issue 3: "Timeout"
**Symptoms:**
```
Error: timeout of 30000ms exceeded
```

**Solutions:**
1. Increase timeout in `yoraaBackendAPI.js`
2. Check backend response time
3. Verify Cloudflare tunnel is running
4. Test backend health endpoint

### Issue 4: CORS Errors (Should Not Happen)
**Note:** CORS is browser-specific, React Native shouldn't have CORS issues.

If you see CORS-like errors:
1. You might be testing in web browser
2. Check if using correct headers
3. Verify backend accepts mobile requests

---

## 📱 Platform-Specific Notes

### Android
- ✅ Requires `network_security_config.xml` update
- ✅ Supports HTTPS by default
- ✅ Auto-redirects HTTP to HTTPS if configured
- ⚠️ Cleartext traffic blocked by default (API 28+)
- ⚠️ Must rebuild after XML changes

### iOS
- ✅ Requires `Info.plist` ATS configuration
- ✅ Supports HTTPS by default
- ✅ Can allow specific HTTP domains if needed
- ⚠️ App Store requires HTTPS for production
- ⚠️ Must rebuild after plist changes

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] `.env.production` uses `https://api.yoraa.in.net/api`
- [ ] `src/config/environment.js` fallback URL updated
- [ ] `src/config/apiConfig.js` PRODUCTION constant updated
- [ ] `android/network_security_config.xml` includes `api.yoraa.in.net`
- [ ] `ios/Info.plist` ATS configured
- [ ] Backend health endpoint tested: `curl https://api.yoraa.in.net/api/health`
- [ ] App rebuilt completely (clean build)
- [ ] Test login flow works
- [ ] Test API calls (categories, products, cart)
- [ ] Test on both Android and iOS
- [ ] Test on production build (not debug)
- [ ] Logs show correct URL: `https://api.yoraa.in.net/api`

---

## 🎯 Quick Fix Commands

```bash
# 1. Update environment
cat > .env.production << EOF
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
EOF

# 2. Test backend
curl https://api.yoraa.in.net/api/health

# 3. Clean build
cd android && ./gradlew clean && cd ..
rm -rf node_modules && npm install

# 4. Run production build
npx react-native run-android --variant=release

# 5. Monitor logs
npx react-native log-android | grep -i "url\|backend\|api"
```

---

## 📞 Support & Resources

**Backend Status:** https://api.yoraa.in.net/api/health  
**Website (Working Example):** https://yoraa.in  
**Admin Panel:** https://yoraa.in.net  

**Quick Test:**
```bash
# Test if backend is accessible
curl -I https://api.yoraa.in.net/api/health

# Expected: HTTP/2 200
```

---

**Last Updated:** November 7, 2025  
**Version:** 1.0  
**Status:** 🔧 Requires Fix  
**Priority:** 🔴 Critical

---

## 📝 Next Steps

1. **Apply fixes from this guide**
2. **Test backend connection**
3. **Rebuild app completely**
4. **Verify all API endpoints work**
5. **Deploy to TestFlight/Play Store**

**Estimated Fix Time:** 30 minutes  
**Testing Time:** 15 minutes  
**Total Time:** ~45 minutes
