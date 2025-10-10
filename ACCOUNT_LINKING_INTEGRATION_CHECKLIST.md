# Account Linking - Integration Checklist

## ✅ Pre-Integration Verification

### Backend Ready?
- [ ] Backend has `/api/auth/link-provider` endpoint
- [ ] Backend has `/api/auth/linked-providers` endpoint  
- [ ] Backend has `/api/auth/apple-signin` endpoint (optional, can use firebase login)
- [ ] Backend returns 409 with correct structure:
  ```json
  {
    "success": false,
    "data": {
      "email": "user@example.com",
      "existing_methods": ["email"],
      "status": "account_exists"
    }
  }
  ```
- [ ] Backend accepts JWT token in Authorization header for link endpoint
- [ ] Backend links providers correctly

### Dependencies Installed?
- [ ] `@react-native-firebase/auth` - Already installed ✅
- [ ] `@invertase/react-native-apple-authentication` - Already installed ✅
- [ ] `@react-native-google-signin/google-signin` - Already installed ✅
- [ ] `@react-native-async-storage/async-storage` - Already installed ✅

---

## 📋 Integration Steps

### Step 1: Verify New Files Exist
```bash
# Check components
ls -la src/components/AccountLinkModal.js
ls -la src/components/ReAuthModal.js

# Check service
ls -la src/services/accountLinkingService.js

# Check documentation
ls -la ACCOUNT_LINKING_*.md
```

**Expected Output:**
- ✅ All files should exist
- ✅ No "file not found" errors

---

### Step 2: Test Basic Import
Open React Native Debugger and check:

```javascript
// In loginaccountemail.js
import AccountLinkModal from '../components/AccountLinkModal';
import ReAuthModal from '../components/ReAuthModal';
import accountLinkingService from '../services/accountLinkingService';
```

**Expected Result:**
- ✅ No import errors
- ✅ No "module not found" errors

---

### Step 3: Test With Backend

#### 3.1: Create Email Account
```bash
# In your app:
1. Go to "Sign Up"
2. Create account with:
   - Email: test@example.com
   - Password: Test123!
3. Verify account created
4. Sign out
```

#### 3.2: Trigger Conflict
```bash
# In your app:
1. Click "Sign in with Apple"
2. Use Apple ID with email: test@example.com
3. Complete Apple authentication
```

**Expected Result:**
- ✅ AccountLinkModal should appear
- ✅ Should show: "Account with test@example.com exists using Email/Password"
- ✅ Two buttons: "Link Apple..." and "Cancel..."

If modal doesn't appear:
```bash
# Check console for:
⚠️ Account conflict detected - propagating to UI
🔗 Handling account conflict...

# If you see these, modal should appear
# If not, check:
- Backend is returning 409
- error.isAccountConflict is true
- setShowLinkModal is being called
```

---

#### 3.3: Test Cancel Flow
```bash
1. Click "Cancel and use Email/Password"
```

**Expected Result:**
- ✅ Modal closes
- ✅ Back at login screen
- ✅ No errors in console

---

#### 3.4: Test Link Flow
```bash
1. Trigger conflict again (Apple sign in)
2. Click "Link Apple to existing account"
3. ReAuthModal should appear
4. Enter password: Test123!
5. Click "Verify & Link Account"
```

**Expected Result:**
- ✅ ReAuthModal appears
- ✅ Shows password field
- ✅ Loading indicator during process
- ✅ Success alert appears
- ✅ User navigated to Home

**Console should show:**
```
🔐 Re-authenticating user with email...
✅ Re-authentication successful
🔗 Linking apple to existing account...
✅ Provider linked successfully
✅ Account linking complete!
```

---

### Step 4: Verify Account Linked

```bash
# Sign out and try both methods:

# Method 1: Email/Password
1. Sign in with test@example.com / Test123!
✅ Should work

# Method 2: Apple
1. Sign in with Apple (same Apple ID)
✅ Should work
✅ Should NOT show conflict modal
✅ Should go directly to Home
```

---

## 🧪 Additional Tests

### Test Google Linking
```bash
1. Create new account with email
2. Sign out
3. Try Google Sign In (same email)
4. Should show conflict modal
5. Link Google account
6. Should succeed
```

### Test Apple to Email Linking
```bash
1. Create new account with Apple
2. Sign out  
3. Try Email Sign In (same email)
4. Should show conflict modal
5. Link email account
6. Should succeed
```

### Test Wrong Password
```bash
1. Trigger conflict
2. Choose to link
3. Enter wrong password
4. Should show error
5. Modal should stay open
6. Enter correct password
7. Should succeed
```

### Test Network Error
```bash
1. Turn on Airplane Mode
2. Trigger conflict
3. Try to link
4. Should show network error
5. Turn off Airplane Mode
6. Retry should work
```

---

## 🐛 Troubleshooting

### Modal Not Appearing?

**Check 1: Console Logs**
```
Look for:
✅ "⚠️ Account conflict detected"
❌ "❌ Apple Sign In error:" (should NOT have this)
```

**Check 2: Error Structure**
```javascript
console.log('Error:', error);
console.log('Is conflict?', error.isAccountConflict);
console.log('Has data?', error.data);
```

**Check 3: Backend Response**
```bash
# Use React Native Debugger Network tab
# Look for POST to /api/auth/login/firebase
# Should return 409 with data
```

**Fix:**
- Verify backend returns exact structure from guide
- Verify yoraaAPI.js properly sets isAccountConflict flag
- Verify catch block in loginaccountemail.js checks isAccountConflict

---

### Linking Fails?

**Check 1: JWT Token**
```javascript
console.log('Token:', yoraaAPI.userToken?.substring(0, 20));
// Should show a token, not null
```

**Check 2: Firebase Token**
```javascript
console.log('Firebase user:', auth().currentUser?.uid);
// Should show user ID
```

**Fix:**
- Ensure re-authentication succeeds
- Ensure yoraaAPI.firebaseLogin sets userToken
- Ensure link endpoint receives Authorization header

---

### Wrong Method Shown in ReAuthModal?

**Check:**
```javascript
console.log('Existing method:', linkingData.existingMethod);
console.log('New provider:', linkingData.newProvider);
```

**Fix:**
- Verify backend returns correct existing_methods array
- Verify linkingData.existingMethod is set correctly

---

### Navigation Not Working?

**Check:**
```javascript
console.log('From checkout?', route?.params?.fromCheckout);
console.log('Navigation available?', !!navigation);
```

**Fix:**
- Ensure navigation prop is passed correctly
- Verify TermsAndConditions and Home screens exist
- Check navigation.navigate() calls

---

## 📊 Success Criteria

### Must Have
- [x] AccountLinkModal appears on conflict
- [x] ReAuthModal appears after choosing to link
- [x] Can successfully link Apple to Email account
- [x] Can successfully link Google to Email account
- [x] Can successfully link Email to Apple account
- [x] Can successfully link Email to Google account
- [x] Can sign in with either method after linking
- [x] No crashes or errors
- [x] Proper navigation after success
- [x] Cancel works at every step

### Should Have
- [x] Clear error messages
- [x] Loading states visible
- [x] Password show/hide works
- [x] Wrong password handled gracefully
- [x] Network errors handled
- [x] User can retry after error

### Nice to Have
- [ ] Linked providers shown in account settings
- [ ] Email notification when account linked
- [ ] Audit log of linking events
- [ ] Rate limiting on link attempts

---

## 🚀 Deployment Checklist

### Before TestFlight
- [ ] All tests passing
- [ ] No console errors
- [ ] Backend endpoints verified
- [ ] Error handling tested
- [ ] Navigation tested
- [ ] Both iOS and Android tested (if applicable)

### TestFlight Build
- [ ] Remove devOTP from production
- [ ] Test on real device
- [ ] Test with real Apple ID
- [ ] Test with real Google account
- [ ] Verify analytics/logging working

### Production Release
- [ ] Monitor error rates
- [ ] Check success rates
- [ ] Verify backend logs
- [ ] Have rollback plan ready

---

## 📞 Quick Commands

### Reset Test Account
```javascript
// In backend or database
DELETE FROM users WHERE email = 'test@example.com';
DELETE FROM user_auth_methods WHERE userId = 'user-id';
```

### Check Backend Logs
```bash
# Check for 409 responses
grep "409" backend.log

# Check for link-provider calls
grep "link-provider" backend.log

# Check for errors
grep "ERROR" backend.log
```

### Debug Frontend
```javascript
// Add to loginaccountemail.js catch block:
console.log('Full error:', JSON.stringify(error, null, 2));
console.log('Error keys:', Object.keys(error));
console.log('Response:', error.response);
```

---

## ✅ Final Verification

Run this checklist before considering integration complete:

1. [ ] Created email account successfully
2. [ ] Triggered conflict with Apple
3. [ ] AccountLinkModal appeared correctly
4. [ ] Cancelled linking successfully
5. [ ] Triggered conflict again
6. [ ] Linked Apple successfully
7. [ ] Signed out
8. [ ] Signed in with email - worked
9. [ ] Signed out
10. [ ] Signed in with Apple - worked (no conflict)
11. [ ] Repeated tests with Google
12. [ ] Tested error scenarios
13. [ ] Tested from checkout flow
14. [ ] Verified navigation
15. [ ] No crashes or errors

**If all checked:** ✅ **Ready for Production!**

---

**Need Help?**
1. Check console logs first
2. Verify backend responses
3. Review implementation guide
4. Check test guide for similar scenario
5. Review flow diagram for logic
