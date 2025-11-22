# 🔍 Debug Mode Testing Guide - Invite a Friend Fix

## ✅ App Status

**Build**: Successful ✅  
**Mode**: Debug Mode ✅  
**Device**: Rithik's iPhone ✅  
**Status**: App launched and running ✅

---

## 📱 How to Test the Fix

### Step 1: Open the App
The app is already running on your iPhone in Debug mode.

### Step 2: Navigate to Invite a Friend Screen
1. Open the app (if not already open)
2. Go to your Profile
3. Tap "Invite a Friend"

### Step 3: Check Console Logs

Open your Mac's Console app or check the Metro Bundler terminal to see logs:

**Expected Success Logs:**
```
🎁 Fetching invite friend codes from backend
🔍 Trying endpoint: /api/invite-friend/admin/all
✅ Found X invite codes from /api/invite-friend/admin/all
✅ Loaded X invite codes
```

**OR if backend endpoint needs fixing:**
```
🎁 Fetching invite friend codes from backend
🔍 Trying endpoint: /api/invite-friend/admin/all
❌ Endpoint /api/invite-friend/admin/all failed: 403 Forbidden
🔍 Trying endpoint: /api/invite-friend/active
❌ Endpoint /api/invite-friend/active failed: 404 Not Found
🔍 Trying endpoint: /api/invite-friend/public
❌ Endpoint /api/invite-friend/public failed: 404 Not Found
🔍 Trying endpoint: /api/invite-friend/user/available
❌ Endpoint /api/invite-friend/user/available failed: 404 Not Found
🔍 Trying endpoint: /api/promoCode/user/available
✅ Promo codes fetched: []
⚠️ No invite codes available at the moment
```

---

## 🎯 What to Look For

### ✅ Success Scenario
- Screen shows loading spinner
- Then displays invite code(s) in voucher cards
- You can copy the code
- You can share the code

### ⚠️ Backend Issue Scenario
- Screen shows loading spinner
- Then shows "No invite codes available"
- Console shows which endpoint failed
- Need to fix backend endpoint

---

## 🔧 Backend Fix Required

If you see "No invite codes available", your backend needs ONE of these endpoints:

### Quick Fix Option 1: Remove Admin Check

```javascript
// In backend: routes/inviteFriend.js
router.get('/admin/all', authenticateUser, async (req, res) => {
  // REMOVE THIS LINE:
  // if (!req.user.isAdmin) return res.status(403)...
  
  const codes = await InviteFriend.find({ status: 'active' });
  return res.status(200).json({
    success: true,
    data: { inviteCodes: codes }
  });
});
```

### Quick Fix Option 2: Create New Public Endpoint

```javascript
// In backend: routes/inviteFriend.js
router.get('/active', authenticateUser, async (req, res) => {
  const codes = await InviteFriend.find({ status: 'active', isVisible: true });
  return res.status(200).json({
    success: true,
    data: codes
  });
});
```

---

## 📊 API Endpoints Priority

The app tries these endpoints in this order:

1. **`/api/invite-friend/admin/all`** ← Currently gives 403
2. **`/api/invite-friend/active`** ← Try creating this
3. **`/api/invite-friend/public`** 
4. **`/api/invite-friend/user/available`**
5. **`/api/promoCode/user/available`** ← Fallback (returns empty)

---

## 🧪 Test Commands

### Check Backend Endpoint
```bash
# Test if backend returns codes
curl -X GET http://localhost:8001/api/invite-friend/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Debug Logs
```bash
# In your project directory
npx react-native log-ios
```

### Rebuild in Debug Mode
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native run-ios --mode Debug
```

---

## ✅ Verification Checklist

After backend fix:

- [ ] App shows loading spinner
- [ ] Codes display in voucher cards
- [ ] Copy button works (copies code to clipboard)
- [ ] Share button works (opens share sheet)
- [ ] Console shows success logs
- [ ] Backend returns 200 status
- [ ] Response includes invite codes array

---

## 📝 Summary

**Frontend Status**: ✅ Fixed and deployed
**Backend Status**: ⚠️ Needs endpoint fix
**Debug Mode**: ✅ Running
**Next Step**: Fix backend to return active invite codes

---

## 🆘 Troubleshooting

### Issue: Still shows "No codes available"
**Solution**: Check backend endpoint returns codes in correct format

### Issue: App crashes
**Solution**: Check console logs for error details

### Issue: Can't see logs
**Solution**: Run `npx react-native log-ios` in terminal

### Issue: Need to rebuild
**Solution**: Run `npx react-native run-ios --mode Debug`

---

**The app is now running in Debug mode! Navigate to Invite a Friend screen to test the fix! 🚀**
