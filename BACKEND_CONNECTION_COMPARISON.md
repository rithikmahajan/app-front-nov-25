# 🔄 Backend Connection - Website vs Mobile App

**Quick comparison of how website and mobile app connect to backend**

---

## 📊 Side-by-Side Comparison

| Aspect | Website (✅ Working) | Mobile App (❌ Broken) | Mobile App (✅ Fixed) |
|--------|---------------------|----------------------|---------------------|
| **Base URL** | `https://api.yoraa.in.net/api` | `http://185.193.19.244:8080/api` | `https://api.yoraa.in.net/api` |
| **Protocol** | HTTPS | HTTP | HTTPS |
| **Access Method** | Cloudflare Tunnel | Direct IP | Cloudflare Tunnel |
| **Backend Status** | ✅ Responding | ❌ Not Responding | ✅ Responding |
| **Security** | TLS 1.3 + Cloudflare WAF | Unencrypted | TLS 1.3 + Cloudflare WAF |
| **DDoS Protection** | ✅ Yes (Cloudflare) | ❌ No | ✅ Yes (Cloudflare) |
| **CDN Caching** | ✅ Yes | ❌ No | ✅ Yes |
| **Rate Limiting** | ✅ Yes (Cloudflare) | ❌ No | ✅ Yes (Cloudflare) |

---

## 🌐 Website Architecture (Current - Working)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSITE PRODUCTION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. User visits https://yoraa.in
   ↓
2. Netlify CDN serves static assets (HTML/CSS/JS)
   ↓
3. React app makes API call:
   fetch('https://api.yoraa.in.net/api/products')
   ↓
4. DNS resolves api.yoraa.in.net → Cloudflare
   ↓
5. Cloudflare Tunnel (HTTPS encryption)
   ↓
6. Backend Server: 185.193.19.244:8080 (HTTP internally)
   ↓
7. Response through Cloudflare (HTTPS)
   ↓
8. Website receives data
   ↓
9. ✅ SUCCESS: Products displayed
```

**Configuration:**
```javascript
// .env.production
VITE_API_URL=https://api.yoraa.in.net/api

// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,  // https://api.yoraa.in.net/api
  withCredentials: true,
  timeout: 30000
});
```

---

## 📱 Mobile App Architecture (Current - BROKEN)

```
┌─────────────────────────────────────────────────────────────────┐
│                  MOBILE APP BROKEN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. User opens app
   ↓
2. React Native app makes API call:
   fetch('http://185.193.19.244:8080/api/products')
   ↓
3. DNS resolves 185.193.19.244
   ↓
4. Attempts direct HTTP connection
   ↓
5. ❌ CONNECTION REFUSED
   (Port 8080 not publicly accessible)
   ↓
6. ❌ FAILURE: Network request failed
```

**Current Configuration (WRONG):**
```bash
# .env.production
API_BASE_URL=http://185.193.19.244:8080/api  # ❌ NOT RESPONDING
BACKEND_URL=http://185.193.19.244:8080/api   # ❌ NOT RESPONDING

# src/config/environment.js
backendUrl: 'http://185.193.19.244:8080/api', // ❌ WRONG
```

**Why This Fails:**
- ❌ IP `185.193.19.244` port `8080` is NOT publicly accessible
- ❌ Using HTTP (unencrypted)
- ❌ Bypassing Cloudflare security
- ❌ Different architecture than website

---

## 📱 Mobile App Architecture (After Fix - WORKING)

```
┌─────────────────────────────────────────────────────────────────┐
│                  MOBILE APP FIXED FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. User opens app
   ↓
2. React Native app makes API call:
   fetch('https://api.yoraa.in.net/api/products')
   ↓
3. DNS resolves api.yoraa.in.net → Cloudflare
   ↓
4. TLS handshake (HTTPS encryption)
   ↓
5. Cloudflare Tunnel
   ↓
6. Backend Server: 185.193.19.244:8080 (HTTP internally)
   ↓
7. Response through Cloudflare (HTTPS)
   ↓
8. Mobile app receives data
   ↓
9. ✅ SUCCESS: Products displayed
```

**Fixed Configuration:**
```bash
# .env.production
API_BASE_URL=https://api.yoraa.in.net/api  # ✅ CORRECT
BACKEND_URL=https://api.yoraa.in.net/api   # ✅ CORRECT

# src/config/environment.js
backendUrl: 'https://api.yoraa.in.net/api', // ✅ CORRECT
```

**Why This Works:**
- ✅ Same URL as website uses
- ✅ Using HTTPS (encrypted)
- ✅ Through Cloudflare tunnel
- ✅ Consistent architecture
- ✅ DDoS protection
- ✅ CDN caching

---

## 🔑 Key Differences

### Website
- **Framework:** React (Vite)
- **Environment:** Browser
- **Config File:** `.env.production` with `VITE_API_URL`
- **API Service:** `axios` with `withCredentials: true`
- **Hosting:** Netlify
- **URL:** `https://yoraa.in`

### Mobile App
- **Framework:** React Native
- **Environment:** iOS/Android native
- **Config File:** `.env.production` with `API_BASE_URL`
- **API Service:** `fetch` or custom `yoraaBackendAPI`
- **Distribution:** App Store / Play Store
- **URL:** N/A (native app)

### Backend Access (Should Be Identical)
- **Both Should Use:** `https://api.yoraa.in.net/api`
- **Both Go Through:** Cloudflare Tunnel
- **Both Use:** HTTPS encryption
- **Both Get:** Same security & performance benefits

---

## 🎯 The Core Issue

### The Problem:
Your **mobile app** is trying to connect to backend using a **different method** than your **website**:

- **Website:** Uses domain `api.yoraa.in.net` → ✅ Works
- **Mobile App:** Uses IP `185.193.19.244` → ❌ Fails

### The Solution:
Make mobile app use the **SAME** backend URL as website:

```diff
- API_BASE_URL=http://185.193.19.244:8080/api
+ API_BASE_URL=https://api.yoraa.in.net/api
```

---

## 📋 What Changed in Backend Deployment?

### Previously (Assumption):
```
Backend was directly accessible on IP:
http://185.193.19.244:8080
```

### Currently (Actual):
```
Backend is behind Cloudflare Tunnel:
https://api.yoraa.in.net → Tunnel → 185.193.19.244:8080

Direct IP access is BLOCKED for security.
```

This is why:
- ✅ Website works (uses domain)
- ❌ Mobile app fails (uses IP)

---

## 🔧 Quick Fix Commands

### Test Backend Accessibility

```bash
# Test old IP (will fail)
curl http://185.193.19.244:8080/api/health
# Result: Connection refused ❌

# Test new domain (will work)
curl https://api.yoraa.in.net/api/health
# Result: {"success":true,"status":"healthy",...} ✅
```

### Apply Fix

```bash
# Run automated fix script
./fix-mobile-backend-connection.sh

# Or manually update .env.production
sed -i '' 's|http://185.193.19.244:8080/api|https://api.yoraa.in.net/api|g' .env.production
```

### Rebuild App

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules && npm install

# Run production build
npx react-native run-android --variant=release
```

---

## ✅ Verification

### Check Configuration

```bash
# Verify .env.production
grep "API_BASE_URL" .env.production
# Expected: API_BASE_URL=https://api.yoraa.in.net/api ✅

# Verify environment.js
grep "backendUrl" src/config/environment.js
# Expected: backendUrl: ... 'https://api.yoraa.in.net/api' ✅
```

### Test in App

Add this to any screen:
```javascript
import environmentConfig from '../config/environment';

useEffect(() => {
  console.log('🔧 API URL:', environmentConfig.getApiUrl());
  // Expected: https://api.yoraa.in.net/api ✅
  
  // Test connection
  fetch(`${environmentConfig.getApiUrl()}/health`)
    .then(r => r.json())
    .then(data => console.log('✅ Backend response:', data))
    .catch(err => console.error('❌ Connection failed:', err));
}, []);
```

Expected log output:
```
🔧 API URL: https://api.yoraa.in.net/api
✅ Backend response: {success: true, status: "healthy", ...}
```

---

## 📊 Environment Comparison

### Website `.env.production`
```bash
VITE_API_URL=https://api.yoraa.in.net/api
VITE_ENV=production
VITE_RAZORPAY_KEY=rzp_live_VRU7ggfYLI7DWV
```

### Mobile App `.env.production` (Before Fix)
```bash
API_BASE_URL=http://185.193.19.244:8080/api  # ❌
BACKEND_URL=http://185.193.19.244:8080/api   # ❌
APP_ENV=production
```

### Mobile App `.env.production` (After Fix)
```bash
API_BASE_URL=https://api.yoraa.in.net/api    # ✅
BACKEND_URL=https://api.yoraa.in.net/api     # ✅
APP_ENV=production
```

---

## 🎯 One-Line Summary

**Problem:** Mobile app connects to `http://185.193.19.244:8080/api` (dead)  
**Solution:** Change to `https://api.yoraa.in.net/api` (alive)  
**Result:** Mobile app works same as website ✅

---

## 📚 Related Files

**Documentation:**
- `MOBILE_APP_BACKEND_CONNECTION_GUIDE.md` - Complete guide
- `PRODUCTION_BACKEND_CONNECTION_GUIDE.md` - Website connection (this prompt)

**Configuration Files:**
- `.env.production` - Environment variables
- `src/config/environment.js` - Environment config class
- `src/config/apiConfig.js` - API configuration
- `android/app/src/main/res/xml/network_security_config.xml` - Android network config

**Scripts:**
- `fix-mobile-backend-connection.sh` - Automated fix
- `check-android-backend-connection.sh` - Diagnostic tool

---

## 🆘 Quick Help

### Issue: App still can't connect after fix

**Check:**
1. Verified `.env.production` has `https://api.yoraa.in.net/api`?
2. Cleaned and rebuilt app?
3. Updated `network_security_config.xml`?
4. Backend is actually responding?

**Test:**
```bash
# 1. Test backend
curl https://api.yoraa.in.net/api/health

# 2. Check app config
grep -r "185.193.19.244" . --exclude-dir=node_modules --exclude-dir=backups

# 3. Rebuild completely
cd android && ./gradlew clean && cd ..
rm -rf node_modules && npm install
npx react-native run-android --variant=release
```

---

**Last Updated:** November 7, 2025  
**Issue:** Mobile app backend connection  
**Status:** 🔧 Fix Available  
**Priority:** 🔴 Critical
