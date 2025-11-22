# 🚀 Quick Start: Simulator with Production Data

## ✅ Configuration Complete!

Your simulator is now configured to use **PRODUCTION backend** with **real-time data**.

---

## 🎯 Start Development Now

### Option 1: Quick Start (Recommended)
```bash
# Clean start with production backend
npm start -- --reset-cache
```

Then in a **new terminal**:
```bash
# Launch iOS Simulator
npm run ios
```

### Option 2: Full Clean Build
If you have issues:
```bash
# Stop everything (Ctrl+C in all terminals)

# Clean Metro cache
npm start -- --reset-cache

# In new terminal, run:
npm run ios
```

---

## 🔍 Verify It's Working

Once the app opens, check for these signs:

### In Terminal Console:
```
✅ Should see:
[DEVELOPMENT] ℹ️ Using backend: https://api.yoraa.in.net/api
🚀 Production URL: https://api.yoraa.in.net/api

❌ Should NOT see:
localhost:8001
10.0.2.2
```

### In the App:
- ✅ Real products from production database
- ✅ Images loading from AWS S3
- ✅ All data is live and real

---

## ⚠️ IMPORTANT: You're Using LIVE Data!

### ✅ Safe to Do:
- Browse products
- View categories
- Test navigation
- Check UI layouts
- Test search functionality
- View product details

### ❌ DO NOT:
- Place real orders
- Create test user accounts
- Modify production data
- Test payment flows
- Delete anything
- Create spam content

---

## 🔄 Switch Between Backends

### Quick Switch Scripts

**Switch to Production (current):**
```bash
./switch-to-production.sh
npm start -- --reset-cache
npm run ios
```

**Switch back to Localhost:**
```bash
./switch-to-localhost.sh
npm start -- --reset-cache
npm run ios
```

---

## 📱 Current Configuration

```
Environment: Development
Backend: https://api.yoraa.in.net/api (PRODUCTION)
Data: Real-time production data
Debug: Enabled
Logs: Visible in console
```

---

## 🎨 Perfect For:

✅ **UI Testing** - See how app looks with real data  
✅ **Layout Testing** - Test with actual product images and text  
✅ **Performance** - Check with production data volume  
✅ **Integration** - Verify API responses  
✅ **Design Review** - Show real data to stakeholders  

---

## 💡 Pro Tips

### Keep Two Terminals Open

**Terminal 1 - Metro Bundler:**
```bash
npm start
```
Leave this running - shows logs

**Terminal 2 - App Launch:**
```bash
npm run ios
```
Use this to rebuild when needed

### Quick Reload
- Press `R` in Metro terminal to reload
- Or shake simulator and tap "Reload"

### Debug Menu
- Press `Cmd + D` in simulator
- Access dev menu options

---

## 🐛 Troubleshooting

### "Network request failed"
```bash
# Test backend connection
curl https://api.yoraa.in.net/api/health

# Should return success response
```

### Still seeing localhost errors
```bash
# Full clean
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm start -- --reset-cache
npm run ios
```

### Environment not updating
```bash
# Check current config
cat .env.development | grep API_BASE_URL

# Should show: API_BASE_URL=https://api.yoraa.in.net/api
```

---

## ✅ You're All Set!

**Run these commands now:**

```bash
# Terminal 1
npm start -- --reset-cache
```

Wait for Metro to start, then:

```bash
# Terminal 2 (new terminal window)
npm run ios
```

🎉 **You'll see real production data in your simulator!**

---

**Backend:** https://api.yoraa.in.net/api  
**Status:** ✅ Connected to Production  
**Data:** Real-time  
**Debug:** Enabled
