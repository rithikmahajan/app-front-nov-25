# 🔄 Simulator Connected to Production Backend

## 📅 Date: November 15, 2025

**Status: Simulator now uses PRODUCTION backend with REAL-TIME data**

---

## ✅ What Changed

Your iOS Simulator (and Android Emulator) will now connect to the **production backend** instead of localhost.

### Previous Configuration (Localhost)
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
```

### Current Configuration (Production)
```bash
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
```

---

## 🚀 How to Use

### 1. Restart Metro Bundler
You need to restart Metro to pick up the new environment variables:

```bash
# Stop current Metro (Ctrl+C if running)
# Then start fresh with development environment
npm run start:dev
```

Or simply:
```bash
npm start -- --reset-cache
```

### 2. Rebuild the App (Recommended)
To ensure changes take effect:

**For iOS Simulator:**
```bash
npm run ios
```

**For Android Emulator:**
```bash
npm run android
```

---

## 🎯 What You'll See

### Real Production Data
- ✅ **Real products** from your production database
- ✅ **Real users** (don't create test accounts!)
- ✅ **Real orders** and transactions
- ✅ **Real images** from AWS S3
- ✅ **Live backend** responses

### Debug Features Still Enabled
- ✅ Console logs visible
- ✅ React Native debugger works
- ✅ Hot reload active
- ✅ Development tools available
- ✅ Flipper enabled

---

## ⚠️ IMPORTANT WARNINGS

### 🚨 You're Using LIVE Production Data!

**Be Careful:**
- ❌ Don't create fake/test orders
- ❌ Don't modify production data
- ❌ Don't test payment flows with real money
- ❌ Don't spam the production database
- ✅ Only view and browse data
- ✅ Use read-only operations
- ✅ Test UI/UX only

### 💡 Best Practices
1. **View Only** - Browse products, check layouts
2. **No Orders** - Don't place real orders while testing
3. **No Signups** - Don't create test user accounts
4. **No Payments** - Don't trigger payment transactions
5. **Read Operations** - Safe to fetch/display data

---

## 🔙 Switch Back to Localhost

When you want to go back to local development:

### Quick Switch Commands

**Switch to Production Backend:**
```bash
# Copy this into .env.development
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
```

**Switch to Localhost Backend:**
```bash
# Copy this into .env.development
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
```

### Or Use These Files

I'll create helper scripts for you to quickly switch...

---

## 📋 Step-by-Step: Start Development with Production Data

### Step 1: Stop Everything
```bash
# Press Ctrl+C in all terminal windows to stop:
# - Metro bundler
# - Any running simulators
```

### Step 2: Clean Cache (Important!)
```bash
# Clear React Native cache
npm start -- --reset-cache
```

### Step 3: Start Metro
In Terminal 1:
```bash
npm start
```

Wait for Metro to start (you'll see "Metro waiting on port 8081")

### Step 4: Run Simulator
In Terminal 2 (new terminal):
```bash
# For iOS
npm run ios

# OR for Android
npm run android
```

### Step 5: Verify Connection
Once the app opens, check the console logs for:
```
[DEVELOPMENT] ℹ️ Using backend: https://api.yoraa.in.net/api
✅ Backend authentication token loaded from storage
```

---

## 🔍 Verify Production Connection

### Check in App Console
Look for these logs when app starts:
```
🚀 Production URL: https://api.yoraa.in.net/api
[DEVELOPMENT] ℹ️ Using backend: https://api.yoraa.in.net/api
```

### Test API Call
Open your app and:
1. Navigate to Shop screen
2. You should see real products from production
3. Check console for successful API calls

### Quick Test
```bash
# In a new terminal, verify backend is reachable
curl https://api.yoraa.in.net/api/health

# Should return: {"status":"ok"} or similar
```

---

## 🛠️ Troubleshooting

### Issue: Still seeing localhost errors
**Solution:**
```bash
# Full clean and restart
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm start -- --reset-cache
```

Then in new terminal:
```bash
npm run ios
```

### Issue: "Network request failed"
**Solution:**
- Check internet connection
- Verify backend is up: `curl https://api.yoraa.in.net/api/health`
- Check iOS Simulator has network access

### Issue: Images not loading
**Solution:**
- AWS S3 images should load automatically
- Check console for image URL format
- Verify URLs start with: `https://rithik-27-yoraa-app-bucket.s3...`

### Issue: Authentication errors
**Solution:**
- You may need to log in again
- Use real production credentials
- Or browse as guest if available

---

## 💻 Development Workflow

### Recommended Setup

**Terminal 1 (Metro):**
```bash
npm start
```
Keep this running - shows logs and bundles code

**Terminal 2 (Simulator):**
```bash
npm run ios
# or
npm run android
```
Launches and runs the app

**Terminal 3 (Optional - API Testing):**
```bash
# Test API endpoints
curl https://api.yoraa.in.net/api/products | jq .
```

---

## 📊 What Data You'll See

### Products
- ✅ All live products from production
- ✅ Real prices and inventory
- ✅ Actual product images from AWS S3
- ✅ Live product descriptions

### Users (if you log in)
- ✅ Real user accounts
- ⚠️ Use your own test account or browse as guest

### Orders
- ✅ Can view if implemented
- ⚠️ Don't create test orders!

### Categories
- ✅ Real category data
- ✅ Live category images

---

## 🎨 Great for Testing

### UI/UX Testing
- ✅ See how app looks with real data
- ✅ Test layouts with actual product images
- ✅ Verify text overflow/truncation
- ✅ Check loading states with real API latency

### Performance Testing
- ✅ Test with production data volume
- ✅ Check image loading performance
- ✅ Verify pagination with real product count
- ✅ Test search with real data

### Integration Testing
- ✅ Verify API integration works
- ✅ Check data formatting
- ✅ Test error handling
- ✅ Validate data parsing

---

## 🔄 Quick Reference

### Environment Files
- **Development (Simulator):** `.env.development` ← Modified to use production
- **Production (App Store):** `.env.production` ← Unchanged, still production

### Current Setup
```
.env.development → https://api.yoraa.in.net/api (PRODUCTION)
.env.production → https://api.yoraa.in.net/api (PRODUCTION)
```

### Commands
```bash
# Start with production data
npm start
npm run ios

# Switch back to localhost later
# (Edit .env.development manually)
```

---

## 📝 Notes

### Advantages
- ✅ See real data in simulator
- ✅ Test UI with production content
- ✅ Verify API integration
- ✅ Debug with live data
- ✅ No need to run local backend

### Considerations
- ⚠️ Using production database
- ⚠️ All actions are real
- ⚠️ Be careful with write operations
- ⚠️ Network latency vs localhost
- ⚠️ API rate limits may apply

---

## 🎯 Summary

### What's Happening Now
Your iOS Simulator connects to:
```
https://api.yoraa.in.net/api
```

Instead of:
```
http://localhost:8001/api
```

### To Start Development
```bash
# Terminal 1
npm start

# Terminal 2
npm run ios
```

### To Switch Back to Localhost
Edit `.env.development`:
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
```

Then restart Metro and rebuild app.

---

**Updated:** `.env.development`  
**Date:** November 15, 2025  
**Status:** ✅ Simulator connected to production backend  
**Data:** Real-time production data  
**Debug Mode:** Still enabled
