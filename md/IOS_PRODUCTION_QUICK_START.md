# 🚀 iOS Production Build - Quick Reference

**One-page guide to build iOS app for production with backend connection**

---

## ⚡ Quick Start (30 seconds)

```bash
# Run this ONE command to set everything up
./ios-production-build.sh
```

This will:
- ✅ Configure backend connection to `https://api.yoraa.in.net/api`
- ✅ Update Info.plist for secure HTTPS
- ✅ Clean build environment
- ✅ Install dependencies
- ✅ Open Xcode ready for archive

---

## 📋 What Gets Configured

### 1. Backend URL
- **Development:** `http://localhost:8001/api`
- **Production:** `https://api.yoraa.in.net/api` ✅

### 2. Info.plist Security
```xml
NSAllowsArbitraryLoads: false  (secure HTTPS only)
Exception for: api.yoraa.in.net (TLS 1.2+)
```

### 3. Environment Variables
```bash
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=production
BUILD_TYPE=release
```

---

## 🏗️ Build Process in Xcode

After running the script, Xcode will open. Follow these steps:

### 1. Select Release Configuration
```
Top bar → Scheme selector → Edit Scheme
  → Run → Build Configuration: Release
```

### 2. Select Device
```
Top bar → Device selector
  → Any iOS Device (arm64)
```

### 3. Clean Build
```
Menu → Product → Clean Build Folder (⌘⇧K)
```

### 4. Create Archive
```
Menu → Product → Archive
Wait 5-10 minutes for build to complete
```

### 5. Distribute to App Store
```
Organizer window → Distribute App
  → App Store Connect
  → Upload
```

---

## 🧪 Test Before Building

```bash
# Test backend connectivity
./test-ios-backend-connection.sh
```

Expected output:
```
✅ Health check passed
✅ Categories endpoint working
✅ Products endpoint working
✅ SSL certificate valid
✅ DNS resolution successful
✅ Response time is good
```

---

## 🔧 Manual Commands (if needed)

### Clean Everything
```bash
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod install
cd ..
```

### Test Backend Manually
```bash
curl https://api.yoraa.in.net/api/health
curl https://api.yoraa.in.net/api/categories
```

### Check Current Config
```bash
cat .env.production | grep BACKEND_URL
```

---

## 🎯 Architecture

```
iOS Device
    ↓
App makes API call
    ↓
https://api.yoraa.in.net/api
    ↓
Cloudflare Tunnel (SSL)
    ↓
Backend Server
185.193.19.244:8080
```

**Same backend URL as web app!**

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate && pod install
cd ..
./ios-production-build.sh
```

### Backend Connection Error
```bash
# Test connectivity
./test-ios-backend-connection.sh

# Check backend status
curl https://api.yoraa.in.net/api/health
```

### Certificate Issues
```
Xcode → Preferences → Accounts
  → Download Manual Profiles
  → Try archive again
```

---

## ✅ Pre-Upload Checklist

- [ ] Run `./ios-production-build.sh` ✅
- [ ] Run `./test-ios-backend-connection.sh` ✅
- [ ] Backend health check passes ✅
- [ ] Build configuration: Release ✅
- [ ] Device: Any iOS Device (arm64) ✅
- [ ] Bundle ID correct ✅
- [ ] Signing configured ✅
- [ ] Version number incremented ✅
- [ ] Test on physical device ✅

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.production` | Production backend URL |
| `ios/YoraaApp/Info.plist` | App security settings |
| `src/config/environment.js` | API URL logic |
| `src/config/apiConfig.js` | API configuration |
| `ios-production-build.sh` | Setup script |
| `test-ios-backend-connection.sh` | Test script |

---

## 🔗 Backend Configuration

**Production URL:** `https://api.yoraa.in.net/api`

**Key Endpoints:**
- Health: `/health`
- Categories: `/categories`
- Products: `/products`
- Cart: `/cart`
- Orders: `/orders`

**Security:**
- HTTPS only (TLS 1.2+)
- Cloudflare SSL
- CORS enabled for mobile app
- 30-second timeout

---

## 📞 Quick Commands

```bash
# Complete setup
./ios-production-build.sh

# Test connection
./test-ios-backend-connection.sh

# Test backend manually
curl https://api.yoraa.in.net/api/health

# Open Xcode
open ios/Yoraa.xcworkspace

# Check environment
cat .env.production
```

---

## 🎉 Success Indicators

You know everything is working when:

1. ✅ Script completes without errors
2. ✅ Backend test passes all checks
3. ✅ Xcode builds successfully
4. ✅ Archive created
5. ✅ Upload to App Store Connect succeeds
6. ✅ TestFlight processes build

---

## 📚 Full Documentation

For detailed information, see:
- [IOS_PRODUCTION_BUILD_GUIDE.md](./IOS_PRODUCTION_BUILD_GUIDE.md)
- [MOBILE_APP_BACKEND_CONNECTION_GUIDE.md](./MOBILE_APP_BACKEND_CONNECTION_GUIDE.md)

---

**Last Updated:** November 7, 2025  
**Backend:** `https://api.yoraa.in.net/api`  
**Status:** ✅ Production Ready
