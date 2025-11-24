# Quick Test Checklist - Authentication & Logout
**Date:** November 24, 2024

---

## ⚡ 15-Minute Quick Test

### Test 1: Phone OTP (2 min) ☐

```
☐ Open app
☐ Tap "Sign in with Phone"
☐ Enter phone number: __________________
☐ Tap "Send OTP"
☐ Receive SMS
☐ Enter OTP code
☐ Result: ☐ Success  ☐ "Authentication Error"
☐ Screenshot taken (if error)
```

**Notes:** ___________________________________________

---

### Test 2: Add Address (1 min) ☐

```
☐ Navigate to addresses screen
☐ Add test address:
   Name: "Test User A"
   Street: "123 Test Street A"
   City: "Test City"
   Zip: "12345"
☐ Save address
☐ Verify address appears in list
```

**Address visible:** ☐ Yes  ☐ No

---

### Test 3: Logout (30 sec) ☐

```
☐ Go to profile/settings
☐ Tap "Logout"
☐ Confirm logout
☐ Returned to login screen
```

**Logout successful:** ☐ Yes  ☐ No

---

### Test 4: Privacy Check - Critical! (2 min) ☐

```
☐ Sign in with DIFFERENT account
   Method used: ☐ Phone  ☐ Google  ☐ Apple
   Account: __________________
☐ Go to addresses screen
☐ Check what's visible
```

**Result:**
- ☐ ✅ PASS: No addresses (or only new user's addresses)
- ☐ ❌ FAIL: Shows "123 Test Street A" 🚨 PRIVACY BUG!

**If FAIL:** 🚨 Stop and report - critical privacy issue!

---

### Test 5: Google Sign-In (3 min) ☐

```
☐ Logout
☐ Tap "Sign in with Google"
☐ Select Google account
☐ Approve permissions
☐ Result: ☐ Success  ☐ Error
☐ If error, check if rollback occurred
```

**Notes:** ___________________________________________

---

### Test 6: Apple Sign-In (3 min - iOS only) ☐

```
☐ Logout
☐ Tap "Sign in with Apple"
☐ Authenticate with Face ID/Touch ID
☐ Approve sign-in
☐ Result: ☐ Success  ☐ Error
☐ If error, check if rollback occurred
```

**Notes:** ___________________________________________

---

## 📊 Quick Results Summary

```
Phone OTP:        ☐ ✅ Works  ☐ ❌ Fails
Google Sign-In:   ☐ ✅ Works  ☐ ❌ Fails
Apple Sign-In:    ☐ ✅ Works  ☐ ❌ Fails  ☐ N/A (Android)
Logout Privacy:   ☐ ✅ Safe   ☐ ❌ LEAKS DATA 🚨
```

---

## 🚨 Critical Issues Found

```
☐ Phone OTP authentication error
☐ Address data persists after logout (PRIVACY ISSUE!)
☐ Google Sign-In fails
☐ Apple Sign-In fails
☐ Other: _________________________________________
```

---

## ✅ All Clear?

If all tests pass:
- ✅ All authentication methods work
- ✅ No privacy violations
- ✅ Logout cleanup working
- ✅ Ready for production

If any test fails:
- ❌ Document the failure
- 📸 Take screenshots
- 📋 Copy console logs
- 🐛 Report to dev team

---

**Tested by:** _____________________  
**Date:** _____________________  
**Device:** _____________________  
**Platform:** ☐ iOS  ☐ Android
