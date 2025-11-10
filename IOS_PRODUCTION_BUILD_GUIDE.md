# 📱 iOS Production Build Guide - Backend Connection

**Complete guide to connect iOS app to production backend and create TestFlight build**

---

## 🎯 Overview

This guide will help you:
1. ✅ Configure iOS app to use production backend (`https://api.yoraa.in.net/api`)
2. ✅ Update Info.plist for production security
3. ✅ Create production build for TestFlight
4. ✅ Test backend connectivity

---

## 🔧 Current vs Production Configuration

### Development (Current)
```
iOS Simulator → http://localhost:8001/api
```

### Production (Target)
```
iOS Device → https://api.yoraa.in.net/api → Cloudflare Tunnel → Backend (185.193.19.244:8080)
```

**Same backend URL as web app uses!**

---

## 📋 Step-by-Step Setup

### Step 1: Environment Configuration

Your app is already configured to read from `.env.production`:

**File:** `.env.production`
```bash
# Production Backend (Cloudflare Tunnel)
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
SERVER_IP=api.yoraa.in.net
SERVER_PORT=443

# Environment
APP_ENV=production
BUILD_TYPE=release
DEBUG_MODE=false
```

✅ **Already configured correctly!**

---

### Step 2: Update Info.plist for Production

The current `Info.plist` has `NSAllowsArbitraryLoads=true` which allows HTTP.
For production, we need to:

1. **Keep HTTPS connections secure**
2. **Allow only specific domains**
3. **Remove development-only settings**

**Action Required:** Run the provided script to update Info.plist

---

### Step 3: Update API Configuration

Your code structure:
```
src/config/environment.js → Reads .env files
src/config/apiConfig.js → Uses environment.js
src/services/* → Use apiConfig.js
```

The configuration automatically switches based on `__DEV__` flag:
- **Development:** Uses `.env` or `.env.development`
- **Production:** Uses `.env.production`

✅ **Already configured correctly!**

---

## 🚀 Building for Production

### Method 1: Automated Script (Recommended)

Run the production build script:

```bash
chmod +x ios-production-build.sh
./ios-production-build.sh
```

This script will:
1. ✅ Update Info.plist for production
2. ✅ Clean build environment
3. ✅ Install dependencies
4. ✅ Configure for production backend
5. ✅ Open Xcode for archive creation

---

### Method 2: Manual Build

#### Step A: Update Info.plist
```bash
chmod +x update-ios-info-plist.sh
./update-ios-info-plist.sh
```

#### Step B: Clean and Prepare
```bash
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod install
cd ..
```

#### Step C: Open Xcode
```bash
open ios/Yoraa.xcworkspace
```

#### Step D: Configure Build Settings in Xcode

1. **Select Scheme:**
   - Click scheme selector (top-left)
   - Choose "Yoraa"
   - Edit Scheme → Run
   - Build Configuration: **Release**

2. **Select Device:**
   - Click device selector
   - Choose "Any iOS Device (arm64)"

3. **Verify Bundle Identifier:**
   - Select project → Target "Yoraa"
   - General tab
   - Bundle Identifier: `com.yoraaapparelsprivatelimited.yoraa`

4. **Signing & Capabilities:**
   - Select "Automatically manage signing"
   - Team: Your Apple Developer Team
   - Provisioning Profile: Automatic

#### Step E: Create Archive

1. Clean build folder:
   ```
   Menu: Product → Clean Build Folder (⌘⇧K)
   ```

2. Create archive:
   ```
   Menu: Product → Archive
   ```
   
3. Wait for build (5-10 minutes)

4. In Organizer:
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow prompts to upload

---

## 🔍 Testing Backend Connection

### Test 1: Check Production Backend Availability

```bash
# Test from terminal
curl -X GET https://api.yoraa.in.net/api/health

# Expected Response:
# {"success":true,"message":"API is running","statusCode":200}
```

### Test 2: Test Categories Endpoint

```bash
curl -X GET https://api.yoraa.in.net/api/categories

# Expected: List of categories
```

### Test 3: In-App Testing (Before Build)

Add this to your app (temporary test):

```javascript
// Add to App.js or a test component
useEffect(() => {
  async function testBackend() {
    try {
      const response = await fetch('https://api.yoraa.in.net/api/health');
      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
    }
  }
  testBackend();
}, []);
```

---

## 📱 Info.plist Configuration Changes

### Current (Development)
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>  <!-- ⚠️ Allows all HTTP - NOT SECURE -->
</dict>
```

### Production (Secure)
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>  <!-- ✅ Secure by default -->
    
    <key>NSExceptionDomains</key>
    <dict>
        <!-- Allow HTTPS with exceptions -->
        <key>api.yoraa.in.net</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
        
        <!-- Local development only -->
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

---

## 🔐 Security Features

### 1. Transport Security
- ✅ HTTPS enforced for production
- ✅ TLS 1.2+ required
- ✅ No arbitrary HTTP loads in production
- ✅ Only whitelisted domains allowed

### 2. Backend Authentication
```javascript
// API calls automatically include credentials
const api = axios.create({
  baseURL: 'https://api.yoraa.in.net/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. Cloudflare Protection
- ✅ DDoS protection
- ✅ SSL/TLS encryption
- ✅ Rate limiting
- ✅ Web Application Firewall (WAF)

---

## 🧪 Verification Checklist

Before submitting to TestFlight:

### Build Configuration
- [ ] Build configuration set to "Release"
- [ ] Bundle identifier correct
- [ ] Version number incremented
- [ ] Signing configured correctly

### Backend Connection
- [ ] `.env.production` has correct URL
- [ ] Info.plist updated for production
- [ ] Test backend connectivity
- [ ] HTTPS enforced

### App Functionality
- [ ] App launches successfully
- [ ] Can fetch products/categories
- [ ] Cart operations work
- [ ] User authentication works
- [ ] Payment integration works

### Security
- [ ] No console.log in production code
- [ ] API keys properly secured
- [ ] HTTPS enforced
- [ ] No development URLs hardcoded

---

## 📊 How iOS App Connects to Backend

### Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    iOS PRODUCTION ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

                    iOS Device (Physical)
                         ↓
                 App makes API call
              (https://api.yoraa.in.net/api/...)
                         ↓
                  Cellular/WiFi Network
                         ↓
                 DNS Resolution
              (api.yoraa.in.net → Cloudflare)
                         ↓
                 Cloudflare Tunnel
                  (SSL/TLS Encryption)
                         ↓
              Backend Server (Node.js)
              185.193.19.244:8080
                         ↓
                 Database Queries
                         ↓
                 Response → Cloudflare
                         ↓
                   iOS Device
```

### Code Flow

```javascript
// 1. Component makes API call
import yoraaAPI from './services/yoraaAPI';

const products = await yoraaAPI.getProducts();

// 2. yoraaAPI uses API_CONFIG
import API_CONFIG from './config/apiConfig';

// 3. API_CONFIG reads from environment
import environmentConfig from './config/environment';

// 4. environment reads .env.production
const apiUrl = Config.BACKEND_URL; // https://api.yoraa.in.net/api

// 5. Request goes through axios
axios.create({
  baseURL: 'https://api.yoraa.in.net/api',
  timeout: 30000,
});

// 6. iOS makes HTTPS request
// 7. Cloudflare handles SSL
// 8. Backend processes request
// 9. Response returns through Cloudflare
// 10. App receives data
```

---

## 🚨 Troubleshooting

### Issue 1: "The network connection was lost"

**Cause:** Info.plist blocking HTTP or domain not whitelisted

**Solution:**
```bash
# Run the update script
./update-ios-info-plist.sh
```

### Issue 2: "Could not connect to the server"

**Cause:** Backend URL incorrect or backend down

**Solution:**
```bash
# Test backend
curl https://api.yoraa.in.net/api/health

# Check .env.production
cat .env.production | grep BACKEND_URL
```

### Issue 3: Archive Build Fails

**Cause:** Pods not installed or cache issues

**Solution:**
```bash
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod install
cd ..
```

### Issue 4: "App Transport Security" Error

**Cause:** Trying to use HTTP in production

**Solution:**
- Ensure all URLs use `https://`
- Check Info.plist has correct exceptions
- Verify `API_BASE_URL` in `.env.production`

---

## 📝 Configuration Files Summary

### `.env.production`
```bash
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=production
BUILD_TYPE=release
```

### `src/config/environment.js`
```javascript
getApiUrl() {
  if (this.isProduction) {
    return 'https://api.yoraa.in.net/api';
  }
  return 'http://localhost:8001/api';
}
```

### `ios/YoraaApp/Info.plist`
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.yoraa.in.net</key>
        <dict>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

---

## 🎯 Quick Start Commands

### Full Production Build
```bash
# One command to rule them all
./ios-production-build.sh
```

### Just Update Info.plist
```bash
./update-ios-info-plist.sh
```

### Test Backend Connection
```bash
./test-ios-backend-connection.sh
```

### Clean Build
```bash
cd ios && rm -rf ~/Library/Developer/Xcode/DerivedData/* && pod deintegrate && pod install && cd ..
```

---

## 📚 Related Documentation

- [Web Backend Connection Guide](./PRODUCTION_BACKEND_CONNECTION_GUIDE.md)
- [Mobile Backend Connection Guide](./MOBILE_APP_BACKEND_CONNECTION_GUIDE.md)
- [iOS TestFlight Build Guide](./build-for-testflight-complete.sh)

---

## ✅ Production Checklist

### Before Archive
- [ ] Run `./ios-production-build.sh`
- [ ] Test backend connectivity
- [ ] Verify `.env.production` settings
- [ ] Check Info.plist updated
- [ ] Test on physical device

### Archive & Upload
- [ ] Build configuration: Release
- [ ] Select "Any iOS Device"
- [ ] Clean build folder
- [ ] Create archive
- [ ] Distribute to App Store Connect

### After Upload
- [ ] Wait for processing (20-30 mins)
- [ ] Add to TestFlight group
- [ ] Test on actual devices
- [ ] Verify backend operations
- [ ] Submit for review

---

## 🆘 Emergency Contacts

**Backend Not Responding:**
```bash
# Check backend status
curl https://api.yoraa.in.net/api/health

# Contact backend team if down
```

**Build Issues:**
```bash
# Clean everything
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf Pods/
rm Podfile.lock
pod install
cd ..
```

**Certificate Issues:**
- Open Xcode
- Preferences → Accounts
- Download Manual Profiles
- Try again

---

**Last Updated:** November 7, 2025  
**Backend URL:** `https://api.yoraa.in.net/api`  
**Build Type:** Production Release  
**Status:** ✅ Ready for TestFlight
