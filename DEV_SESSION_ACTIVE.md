# 🔧 Development Environment - Active Session

**Started:** November 24, 2025  
**Configuration:** Local Development Mode  
**Status:** ✅ RUNNING

---

## 🌐 Active Services

### Backend API
- **URL:** http://localhost:8001/api
- **Status:** ✅ Running
- **Health:** http://localhost:8001/api/health
- **Database:** Local MongoDB
- **Logs:** Enhanced debugging enabled

### Frontend App
- **Platform:** iOS Simulator
- **Device:** Fresh iPhone 15
- **Mode:** Development (`__DEV__ = true`)
- **API Target:** http://localhost:8001/api
- **Metro Bundler:** Port 8081

### Configuration Files
- **Environment:** `.env.development`
- **API URL:** `localhost:8001/api`
- **Debug Mode:** Enabled
- **Hot Reload:** Active

---

## 📊 What You'll See

### Metro Bundler Terminal
```
📱 iOS Development URL: http://localhost:8001/api
✅ Metro bundler started
```

### Backend Terminal (Your Other Terminal)
```
🔍 [DEBUG] POST /api/users/update-fcm-token - 127.0.0.1
📱 FCM Token Update Request - User: <userId>
Decoded token payload: {...}
```

### iOS Simulator
- App launches automatically
- All API calls go to localhost:8001
- Errors show with detailed logging

---

## 🧪 Testing Flow

### 1. **Sign In with Apple**
   - Backend logs show full authentication flow
   - JWT token generation visible
   - User lookup queries logged

### 2. **FCM Token Registration**
   - Watch for `POST /api/users/update-fcm-token`
   - See the "User not found" error with details
   - Compare with production logs

### 3. **API Requests**
   - Every request logged in backend terminal
   - See request headers, body, and response
   - Debug in real-time!

---

## 🔍 Monitoring Commands

### Check Backend Health
```bash
curl http://localhost:8001/api/health
```

### Watch Backend Logs
```bash
# Backend terminal shows real-time logs
# Look for:
# - 🔍 [DEBUG] lines
# - Error messages
# - Database queries
```

### Check Metro Status
```bash
lsof -ti:8081  # Metro bundler port
```

### Check Simulator Status
```bash
xcrun simctl list devices | grep Booted
```

---

## 🐛 Active Debugging Tasks

### Primary Issue: FCM Token Registration Error
- **Error:** User not found (404)
- **User ID:** 68dae3fd47054fe75c651493
- **Status:** Debugging with local backend
- **Next:** Watch backend logs during sign-in

### What to Look For:
1. Does user exist in local database?
2. Is JWT decoded correctly?
3. Is the user ID format correct (ObjectId vs string)?
4. Do other endpoints find the user successfully?

---

## 🛠️ Quick Actions

### Restart App
```bash
# Just reload in simulator
Press Cmd + R in simulator
# Or force restart:
./run-ios-unlocked.sh
```

### Clear Metro Cache
```bash
rm -rf $TMPDIR/metro-*
npx react-native start --reset-cache
```

### Restart Backend
```bash
# In backend terminal:
# Press Ctrl+C to stop
npm run dev
```

### View Backend Database
```bash
# If you have MongoDB Compass or CLI:
mongosh
use yoraa_dev
db.users.findOne({_id: ObjectId("68dae3fd47054fe75c651493")})
```

---

## 📱 Simulator Controls

### Unlock Simulator
```bash
Cmd + L  # Or click and drag lock screen up
```

### Reload App
```bash
Cmd + R  # Fast refresh
```

### Open Dev Menu
```bash
Cmd + D  # Shows React Native dev menu
```

### Enable Hot Reload
```bash
Cmd + D → Enable Fast Refresh
```

---

## ✅ Success Indicators

### App Connected to Local Backend ✅
- Metro logs show: `📱 iOS Development URL: http://localhost:8001/api`
- Backend logs show incoming requests
- No "Network Error" in app

### Debugging Active ✅
- Backend terminal shows detailed logs
- Can see JWT tokens, user IDs, database queries
- Error messages include full context

---

## 🎯 Current Session Goals

1. ✅ **Connect frontend to local backend** - DONE
2. ✅ **Launch iOS app** - IN PROGRESS
3. ⏳ **Test Apple Sign In** - NEXT
4. ⏳ **Debug FCM token error** - NEXT
5. ⏳ **Identify root cause** - PENDING
6. ⏳ **Fix and verify** - PENDING

---

## 📞 Quick Help

### Problem: App shows production URL
**Solution:** 
```bash
./connect-local-backend.sh
./run-ios-unlocked.sh
```

### Problem: Backend not responding
**Solution:**
```bash
curl http://localhost:8001/api/health
# If fails, restart backend
```

### Problem: Simulator locked
**Solution:**
```bash
Press Cmd + L in simulator
```

### Problem: Metro bundler issues
**Solution:**
```bash
lsof -ti:8081 | xargs kill -9
./run-ios-unlocked.sh
```

---

## 📚 Documentation Reference

- `LOCAL_BACKEND_CONNECTION_GUIDE.md` - Complete setup guide
- `FCM_TOKEN_REGISTRATION_ERROR_BACKEND_REPORT.md` - Error analysis
- `IOS_LOCK_COMPLETE_GUIDE.md` - Simulator unlock solutions

---

## 💡 Pro Tips

1. **Keep backend terminal visible** - Watch logs in real-time
2. **Use Cmd+R** in simulator for quick reload
3. **Check Metro terminal** for bundle errors
4. **Monitor network tab** in React Native debugger
5. **Compare local vs production behavior**

---

**🎉 Your development environment is live! Ready to debug the FCM issue!**

**Next Step:** Sign in with Apple and watch the backend logs! 🔍
