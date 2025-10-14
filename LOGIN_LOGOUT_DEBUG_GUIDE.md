# 🔍 Login/Logout Debug Quick Reference

## 🎯 What Was Fixed

### **Problem 1: URL Mismatch** ✅ FIXED
- **Before**: App initialized with `http://185.193.19.244:8080` but then switched to `http://localhost:8001/api`
- **After**: Consistent URL throughout entire app lifecycle
- **Fix**: Proper URL parsing in `yoraaAPI.js` constructor

### **Problem 2: Multiple Initializations** ✅ FIXED
- **Before**: 6+ initializations creating duplicate guest sessions
- **After**: Single initialization with lock mechanism
- **Fix**: Added `isInitializing` lock and promise caching

### **Problem 3: Guest Session Chaos** ✅ FIXED
- **Before**: 3 different guest sessions during logout
- **After**: Controlled single guest session transition
- **Fix**: Centralized session management with 100ms delay

---

## 📊 Log Patterns to Watch

### ✅ **CORRECT Login Flow**
```javascript
🌐 Environment.getApiUrl() returning: http://185.193.19.244:8080/api
🌐 YoraaAPI initialized with baseURL: http://185.193.19.244:8080
🔄 Initializing YoraaAPI service...
🔒 Sign-in lock activated
✅ Backend authentication successful
   - User Status: 👋 EXISTING USER
🔓 Sign-in lock released
```

### ✅ **CORRECT Logout Flow**
```javascript
🔐 Starting complete logout process...
🔒 Logout lock activated
✅ Tokens cleared from memory immediately
📤 Notifying backend of logout state...
✅ Backend notified of logout
📊 Old guest session: guest_xxx → New: guest_yyy
🔓 Logout lock released
```

### ❌ **INCORRECT Patterns (Should NOT See)**
```javascript
// URL switching:
baseURL: http://185.193.19.244:8080
Base URL: http://localhost:8001/api  ❌

// Multiple rapid initializations:
🔄 Initializing YoraaAPI service...
🔄 Initializing YoraaAPI service...
🔄 Initializing YoraaAPI service...  ❌

// Multiple guest sessions at once:
🆕 Generated new guest session ID: guest_xxx
🆕 Generated new guest session ID: guest_yyy  ❌
```

---

## 🧪 Test Scenarios

### **Test 1: Fresh App Start**
1. Kill app completely
2. Launch app
3. **Watch for**: Single initialization, one guest session

**Expected Logs**:
```
🌐 YoraaAPI initialized with baseURL: http://185.193.19.244:8080
🔄 Initializing YoraaAPI service...
🆕 Generated new guest session ID: guest_[UNIQUE_ID]
```

---

### **Test 2: Apple Login**
1. Start from logged-out state
2. Tap "Sign in with Apple"
3. Complete authentication
4. **Watch for**: No duplicate initializations

**Expected Logs**:
```
🔒 Sign-in lock activated
🔄 Authenticating with Yoraa backend...
✅ Backend authentication successful
✅ Token set in memory immediately
🗑️ Cleared guest session after transfer
🔓 Sign-in lock released
```

**Count These**:
- `🔄 Initializing YoraaAPI service...` = Should appear 0 times (already initialized)
- `🆕 Generated new guest session` = Should appear 0 times (using authenticated session)

---

### **Test 3: Logout**
1. From logged-in state
2. Go to Profile → Logout
3. **Watch for**: Single guest session creation

**Expected Logs**:
```
🔐 Starting complete logout process...
🔒 Logout lock activated
✅ All auth storage cleared
📊 Old guest session: guest_[OLD] → New: guest_[NEW]
🔓 Logout lock released
```

**Count These**:
- `🆕 Generated new guest session` = Should appear EXACTLY 1 time
- `🔄 Initializing YoraaAPI service...` = Should appear 0 times

---

### **Test 4: Re-login After Logout**
1. Complete logout
2. Wait 5 seconds
3. Login with Apple again
4. **Watch for**: Clean re-authentication

**Expected Logs**:
```
🔒 Sign-in lock activated
🔄 Authenticating with Yoraa backend...
   - User Status: 👋 EXISTING USER
✅ Guest cart transferred: 0 items
✅ Guest wishlist transferred: 0 items
```

---

## 🔧 Quick Debug Commands

### Check Current State
```bash
# Filter logs for URLs
adb logcat | grep "baseURL\|Base URL"  # Android
# iOS: Look in Metro logs

# Count initializations (should be 1)
adb logcat | grep "Initializing YoraaAPI" | wc -l

# Track guest sessions
adb logcat | grep "guest session"
```

### Clear State for Clean Test
```javascript
// Add to App.js temporarily for testing:
import AsyncStorage from '@react-native-async-storage/async-storage';

// In App.js useEffect:
AsyncStorage.clear().then(() => console.log('✅ Storage cleared'));
```

### Force Rebuild
```bash
# iOS
cd ios && rm -rf build Pods Podfile.lock
pod install
cd .. && npx react-native run-ios --reset-cache

# Android
cd android && ./gradlew clean
cd .. && npx react-native run-android --reset-cache
```

---

## 🎯 Success Criteria

| Metric | Before Fix | After Fix |
|--------|-----------|-----------|
| Initializations per app start | 6+ | 1 |
| Guest sessions on logout | 3 | 1 |
| URL consistency | ❌ Mixed | ✅ Consistent |
| Re-login after logout | ❌ Fails | ✅ Works |
| Backend notification on logout | ⚠️ Sometimes | ✅ Always |

---

## 📱 Real Device vs Simulator

### iOS Simulator
- Should use: `http://185.193.19.244:8080`
- Can also use: `http://localhost:8080` (if backend running locally)

### iOS Real Device
- Must use: `http://185.193.19.244:8080` (IP address)
- Cannot use: `http://localhost` (no access to Mac)

### Android Emulator
- Should use: `http://185.193.19.244:8080`
- Or: `http://10.0.2.2:8080` (for localhost)

### Android Real Device
- Must use: `http://185.193.19.244:8080` (IP address)
- Or: `http://192.168.x.x:8080` (if same WiFi network)

---

## 🚨 Emergency Rollback

If fixes cause issues, revert with:

```bash
git diff src/services/yoraaAPI.js
git diff src/config/environment.js

# If needed:
git checkout HEAD -- src/services/yoraaAPI.js
git checkout HEAD -- src/config/environment.js
```

---

## 📞 Troubleshooting

### Issue: Still seeing multiple initializations
**Solution**: Check if components are creating new YoraaAPI instances
```bash
grep -r "new YoraaAPIService" src/
```

### Issue: URLs still inconsistent
**Solution**: Clear Metro cache
```bash
npm start -- --reset-cache
```

### Issue: Logout but still authenticated
**Solution**: Check backend /api/auth/logout endpoint
```bash
curl -X POST http://185.193.19.244:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Guest session persists after login
**Solution**: Verify transferAllGuestData() is called
```javascript
// Should see in logs:
✅ Guest cart transferred: X items
✅ Guest wishlist transferred: Y items
🗑️ Cleared guest session after transfer
```

---

**Quick Status Check**: Look for these emojis in logs
- 🔒 = Lock activated (good!)
- 🔓 = Lock released (good!)
- ✅ = Success
- ❌ = Error (investigate!)
- ⚠️ = Warning (may be OK)
- 🔄 = Process running
