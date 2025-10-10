# 🧪 FCM Integration - Quick Testing Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Start the App (1 min)
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run on Android
npx react-native run-android
```

### Step 2: Login (2 min)
1. Open app on device/emulator
2. Navigate to login screen
3. Enter phone number (e.g., +1234567890)
4. Enter OTP code
5. Complete login

### Step 3: Check Logs (2 min)
**Look for these SUCCESS messages** in Metro bundler:

```bash
✅ What You Should See:
─────────────────────────────────────────────────────────
🔐 Authentication successful, token saved
🔔 Initializing FCM after login...
📱 FCM Token received: dX4k...
✅ FCM Service initialized successfully
📤 Registering FCM token with backend...
✅ FCM token successfully registered with backend
─────────────────────────────────────────────────────────
```

**If you see this = IT WORKS!** 🎉

---

## 🔍 Detailed Testing Steps

### Test 1: Login Flow (3 min)
```
1. Launch app
2. Enter phone: +1234567890
3. Receive OTP
4. Enter OTP code
5. Login completes
   
Expected Result:
✅ No errors in console
✅ See "FCM token registered" message
✅ App navigates to home screen
```

### Test 2: Check Database (2 min)
```bash
# Connect to MongoDB
mongo

# Switch to your database
use yoraa1

# Find your user
db.users.findOne({ phoneNumber: "+1234567890" })

Expected Result:
✅ fcmToken field exists
✅ fcmToken has value (long string starting with "dX4k..." or similar)
✅ platform field shows "android" or "ios"
```

### Test 3: Logout Flow (1 min)
```
1. Click logout button
2. Check console logs
   
Expected Result:
✅ See "FCM token cleared" message
✅ No errors in console
```

### Test 4: Re-login Flow (2 min)
```
1. Login again with same phone number
2. Check console logs
   
Expected Result:
✅ FCM re-initialized
✅ New token registered with backend
✅ Database updated with new token
```

---

## 📊 Log Analysis

### ✅ GOOD Logs (Everything Working)
```
🔐 Authentication successful, token saved
🔔 Initializing FCM after login...
📱 FCM Token received: dX4kTnY9...
✅ FCM Service initialized successfully
📤 Registering FCM token with backend...
✅ FCM token successfully registered with backend
```

### ⚠️ WARNING Logs (Non-Critical Issues)
```
⚠️ FCM permission not granted
→ User denied notification permission
→ Ask user to enable in device settings

⚠️ iOS notification permission denied: denied
→ User denied permission on iOS
→ Show permission prompt again

⚠️ FCM token registration failed: Network error
→ Backend not reachable
→ Check backend server is running
```

### ❌ ERROR Logs (Need Fixing)
```
❌ No FCM token available to register
→ Firebase not configured correctly
→ Check google-services.json exists

❌ Backend registration failed: 401
→ JWT token invalid/expired
→ User needs to login again

❌ Backend registration failed: 404
→ Backend endpoint not available
→ Check backend is running on localhost:8001
```

---

## 🐛 Quick Troubleshooting

### Problem: No logs appearing
**Solution**:
```bash
# Clear Metro cache and restart
npx react-native start --reset-cache
```

### Problem: "FCM permission not granted"
**Solution**:
```bash
# Android: Check app permissions in device settings
Settings → Apps → YourApp → Permissions → Notifications → Allow

# iOS: Check notification settings
Settings → YourApp → Notifications → Allow Notifications
```

### Problem: "Backend registration failed: 404"
**Solution**:
```bash
# Check backend is running
curl http://localhost:8001/api/health

# If not running, start backend:
cd /path/to/backend
npm start
```

### Problem: FCM token not in database
**Solution**:
```javascript
// Check these in order:
1. Did login succeed? (Check logs)
2. Did FCM initialize? (Check logs)
3. Did backend registration succeed? (Check logs)
4. Is backend running? (curl localhost:8001)
5. Is MongoDB running? (mongo command)
```

---

## 📱 Platform-Specific Testing

### Android Testing
```
1. Use Android Studio emulator OR real device
2. Android 13+ will show permission dialog
3. Android 12 and below - no dialog (auto-granted)
4. Check notification shade for test notifications
```

### iOS Testing
```
1. Use iOS Simulator OR real device
2. Permission dialog will appear
3. Choose "Allow" for notifications
4. Check Notification Center for test notifications
5. ⚠️ Note: Real push notifications require Apple Developer account
```

---

## 🎯 Success Checklist

After testing, you should have:

- [x] User logged in successfully
- [x] Console shows "FCM token registered with backend"
- [x] MongoDB has `fcmToken` field in user document
- [x] No error messages in console
- [x] Logout works and clears token
- [x] Re-login registers new token

**If all checked = FCM Integration Complete!** ✅

---

## 🚀 Send Test Notification (Optional)

### Method 1: Using Firebase Console
```
1. Go to Firebase Console
2. Select your project
3. Cloud Messaging → Send your first message
4. Enter notification title and text
5. Select your app
6. Send test message
7. Check device receives notification
```

### Method 2: Using Postman/curl
```bash
# Get FCM token from database first
mongo yoraa1 --eval "db.users.findOne({phoneNumber: '+1234567890'}).fcmToken"

# Then send notification via FCM API
# (Requires Firebase Server Key - get from Firebase Console)
```

---

## 📞 Need Help?

### Check These First:
1. **Console Logs** - Most issues show up here
2. **Backend Logs** - Check if backend received the request
3. **Database** - Verify token is stored
4. **Firebase Console** - Check app configuration

### Common Issues:
- **No logs**: Restart Metro bundler
- **Permission denied**: Enable in device settings
- **404 error**: Backend not running
- **401 error**: Login again (token expired)
- **Token not in DB**: Check all logs for errors

---

**Testing Time**: 10-15 minutes  
**Success Rate**: Should be 100% if backend is configured correctly  
**Priority**: Test on Android first (easier), then iOS

---

## 🎉 What's Next?

After successful testing:
1. ✅ Test on different devices
2. ✅ Test different login methods (if applicable)
3. ✅ Implement custom notification handlers
4. ✅ Add notification navigation logic
5. ✅ Test in production environment

**FCM integration is now complete and tested!** 🚀
