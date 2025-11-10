# 🚀 Frontend Quick Setup - Contabo Production

**Last Updated:** October 15, 2025

---

## ⚡ TL;DR - Copy & Paste Configuration

### 📍 Production Server
```
IP: 185.193.19.244
Port: 8080
API: http://185.193.19.244:8080/api
Health: http://185.193.19.244:8080/health
```

---

## 🎯 React Native / Expo

### .env.production
```env
API_BASE_URL=http://185.193.19.244:8080/api
BACKEND_URL=http://185.193.19.244:8080/api
SERVER_IP=185.193.19.244
SERVER_PORT=8080
API_TIMEOUT=30000
```

### Quick Config
```javascript
const API_CONFIG = {
  BASE_URL: 'http://185.193.19.244:8080/api',
  TIMEOUT: 30000,
};

import axios from 'axios';
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Add token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 🎯 Flutter

### api_config.dart
```dart
class ApiConfig {
  static const String baseUrl = 'http://185.193.19.244:8080/api';
  static const int timeout = 30000;
}
```

### Quick Setup
```dart
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: 'http://185.193.19.244:8080/api',
  connectTimeout: Duration(milliseconds: 30000),
  receiveTimeout: Duration(milliseconds: 30000),
));

// Add token
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    final token = await getAuthToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  },
));
```

---

## 🎯 Web (React/Vue/Next.js)

### .env.production
```env
REACT_APP_API_URL=http://185.193.19.244:8080/api
NEXT_PUBLIC_API_URL=http://185.193.19.244:8080/api
VUE_APP_API_URL=http://185.193.19.244:8080/api
```

### Quick Config
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://185.193.19.244:8080/api';

import axios from 'axios';
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});
```

---

## 📱 iOS Configuration

### Info.plist ✅ ALREADY CONFIGURED
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
  </dict>
</dict>
```

**Status:** ✅ Already added to `ios/YoraaApp/Info.plist`

---

## 📱 Android Configuration

### network_security_config.xml ✅ ALREADY CONFIGURED
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">185.193.19.244</domain>
    </domain-config>
</network-security-config>
```

**Status:** ✅ Created at `android/app/src/main/res/xml/network_security_config.xml`

### AndroidManifest.xml ✅ ALREADY CONFIGURED
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ...>
```

**Status:** ✅ Already updated in `android/app/src/main/AndroidManifest.xml`

---

## ✅ Test Connection

### Browser
```
http://185.193.19.244:8080/health
```

### Terminal
```bash
curl http://185.193.19.244:8080/health
```

### In App (JavaScript)
```javascript
fetch('http://185.193.19.244:8080/health')
  .then(res => res.json())
  .then(data => console.log('✅ Connected:', data))
  .catch(err => console.error('❌ Failed:', err));
```

### In App (Flutter)
```dart
final response = await dio.get('http://185.193.19.244:8080/health');
print('✅ Connected: ${response.data}');
```

---

## 🔗 Key Endpoints

| Endpoint | URL |
|----------|-----|
| Health | `http://185.193.19.244:8080/health` |
| Login | `http://185.193.19.244:8080/api/auth/login` |
| Register | `http://185.193.19.244:8080/api/auth/register` |
| Products | `http://185.193.19.244:8080/api/products` |
| Categories | `http://185.193.19.244:8080/api/categories` |
| Cart | `http://185.193.19.244:8080/api/cart` |
| Orders | `http://185.193.19.244:8080/api/orders` |
| Order Create | `http://185.193.19.244:8080/api/orders/create` |
| Tracking | `http://185.193.19.244:8080/api/orders/:id/tracking` |
| Profile | `http://185.193.19.244:8080/api/profile` |

---

## 🚀 Switch to Production

### Quick Commands

**Copy production config:**
```bash
cp .env.production .env
```

**Start Metro with reset:**
```bash
npm start -- --reset-cache
```

**Build iOS Release:**
```bash
npx react-native run-ios --configuration Release
```

**Build Android Release:**
```bash
cd android && ./gradlew assembleRelease
```

---

## 🚨 Common Issues

### Cannot Connect
✅ **Fixed** - Network config already set up
- iOS: NSAppTransportSecurity exception added
- Android: network_security_config.xml created

### 401 Unauthorized
- Check auth token is being sent
- Re-login to refresh token

### Timeout
- Increase timeout: `API_TIMEOUT=60000`
- Check internet connection

---

## ✅ Configuration Status

| Component | Status | File |
|-----------|--------|------|
| Production .env | ✅ Configured | `.env.production` |
| iOS Network Config | ✅ Done | `ios/YoraaApp/Info.plist` |
| Android Network Config | ✅ Done | `android/.../network_security_config.xml` |
| Android Manifest | ✅ Updated | `android/.../AndroidManifest.xml` |

---

## 📖 Full Documentation

**For detailed setup guide, see:**
`FRONTEND_ENVIRONMENT_SETUP_COMPLETE.md`

**For API reference, see:**
`PRODUCTION_API_QUICK_REFERENCE.js`

---

## 🎯 Next Steps

1. ✅ Environment configured
2. ✅ Network security set up
3. ✅ Platform configs updated
4. **Switch to production:** `cp .env.production .env`
5. **Test connection:** Visit health endpoint
6. **Build and deploy!** 🚀

---

**Configuration Status:** ✅ Complete  
**Backend Status:** ✅ Live on Contabo  
**Last Verified:** October 15, 2025

**Your app is ready to connect to production! 📦🚀**
