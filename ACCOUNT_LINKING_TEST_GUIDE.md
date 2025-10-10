# Account Linking - Quick Test Guide

## Test Scenarios

### Scenario 1: Email User Tries Apple Sign In

**Setup:**
1. Create account with email/password
2. Sign out

**Test:**
1. Click "Sign in with Apple"
2. Use Apple ID with same email
3. ✅ Should show AccountLinkModal
4. ✅ Modal shows: "Account with [email] exists using Email/Password"
5. Click "Link Apple to existing account"
6. ✅ ReAuthModal appears
7. Enter password
8. Click "Verify & Link Account"
9. ✅ Success alert shows
10. ✅ Navigate to Home (or T&C if from checkout)

**Verify:**
- Can sign in with Apple next time
- Can still sign in with email/password
- Both methods access same account

---

### Scenario 2: Apple User Tries Google Sign In

**Setup:**
1. Create account with Apple
2. Sign out

**Test:**
1. Click "Sign in with Google"
2. Use Google account with same email
3. ✅ Should show AccountLinkModal
4. ✅ Modal shows: "Account with [email] exists using Apple"
5. Click "Link Google to existing account"
6. ✅ ReAuthModal appears with "Sign in with Apple"
7. Click "Sign in with Apple"
8. Complete Apple authentication
9. ✅ Success alert shows
10. ✅ Navigate to Home

**Verify:**
- Can sign in with Google next time
- Can still sign in with Apple
- Both methods access same account

---

### Scenario 3: User Cancels Linking

**Test:**
1. Trigger account conflict (any provider)
2. AccountLinkModal appears
3. Click "Cancel and use [existing method]"
4. ✅ Modal closes
5. ✅ User returned to login screen
6. ✅ No changes made to account

---

### Scenario 4: User Cancels Re-Auth

**Test:**
1. Trigger account conflict
2. Click "Link account"
3. ReAuthModal appears
4. Click "Cancel"
5. ✅ Modal closes
6. ✅ User returned to login screen
7. ✅ No changes made to account

---

### Scenario 5: Wrong Password During Re-Auth

**Test:**
1. Trigger email account conflict
2. Proceed to ReAuthModal
3. Enter wrong password
4. ✅ Error alert shows "Incorrect password"
5. ✅ Modal stays open
6. Enter correct password
7. ✅ Linking succeeds

---

### Scenario 6: Already Linked Provider

**Setup:**
1. Link Apple to email account (complete linking)
2. Sign out

**Test:**
1. Sign in with Apple
2. ✅ Should sign in normally (no conflict)
3. ✅ No modals shown
4. ✅ Goes directly to Home

**Alternative Test:**
1. While signed in, try to link Apple again
2. ✅ Backend should return error
3. ✅ Error alert shown

---

## Backend Responses to Verify

### 409 Conflict Response
```json
{
  "success": false,
  "message": "Account exists with different authentication method",
  "data": {
    "status": "account_exists",
    "email": "user@example.com",
    "existing_methods": ["email"],
    "message": "An account with user@example.com already exists using email..."
  }
}
```

### Successful Link Response
```json
{
  "success": true,
  "message": "Successfully linked apple account",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "authProvider": "apple",
      "linkedProviders": ["email", "apple"]
    }
  }
}
```

---

## Console Logs to Look For

### Conflict Detected
```
⚠️ Account conflict detected - propagating to UI
🔗 Handling account conflict...
```

### Re-Authentication
```
🔐 Re-authenticating user with email...
✅ Re-authentication successful
```

### Linking
```
🔗 Linking apple to existing account...
✅ Provider linked successfully
✅ Account linking complete!
```

---

## Edge Cases to Test

1. **Network Failure During Linking**
   - Turn off wifi during re-auth
   - Should show error, allow retry

2. **User Cancels OAuth Flow**
   - Start Apple/Google sign-in
   - Press cancel on OAuth screen
   - Should return gracefully (no crash)

3. **From Checkout Flow**
   - Add item to cart
   - Go to checkout
   - Trigger account conflict
   - Complete linking
   - Should go to Terms & Conditions

4. **Multiple Conflicts**
   - Email account exists
   - Try Apple (conflict, cancel)
   - Try Google (conflict, cancel)
   - Try email login (should work)

5. **Backend Returns 500**
   - Backend error during linking
   - Should show error message
   - Should not crash app

---

## Quick Debugging

### Modal Not Showing?
Check:
```javascript
console.log('Error caught:', error);
console.log('Is conflict?', error.isAccountConflict);
console.log('Error data:', error.data);
```

### Linking Fails?
Check:
```javascript
console.log('User token:', yoraaAPI.userToken?.substring(0, 20));
console.log('Linking data:', linkingData);
```

### Re-Auth Fails?
Check:
```javascript
console.log('Existing method:', linkingData.existingMethod);
console.log('New provider:', linkingData.newProvider);
console.log('Email:', linkingData.email);
```

---

## Testing Checklist

### UI/UX
- [ ] Modals appear smoothly
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Loading states show correctly
- [ ] Success alerts are clear

### Functionality
- [ ] Email → Apple linking works
- [ ] Email → Google linking works
- [ ] Apple → Email linking works
- [ ] Apple → Google linking works
- [ ] Google → Email linking works
- [ ] Google → Apple linking works

### Error Handling
- [ ] Wrong password shows error
- [ ] Network errors handled
- [ ] Backend errors handled
- [ ] User cancellation handled
- [ ] Already linked handled

### Navigation
- [ ] From checkout → T&C
- [ ] Not from checkout → Home
- [ ] Cancel returns to login
- [ ] Success navigates correctly

### State Management
- [ ] Modals close properly
- [ ] State clears after success
- [ ] No memory leaks
- [ ] Re-opens work correctly

---

## Success Criteria

✅ User can link any provider to any other provider
✅ User must re-authenticate before linking
✅ Clear error messages for all failure cases
✅ Smooth UI transitions
✅ No crashes or freezes
✅ Proper navigation after linking
✅ Backend receives correct data
✅ Existing users not affected
✅ New users not affected

---

## Demo Script

1. **Show Conflict**
   - "I have an account with email/password"
   - "Let me try signing in with Apple"
   - "See, it detected the conflict!"

2. **Show Linking Flow**
   - "I want to link my Apple account"
   - "First, I verify my identity with password"
   - "Now linking Apple..."
   - "Success! Linked."

3. **Show Dual Sign-In**
   - "I can sign out and use Apple"
   - "Or I can use email/password"
   - "Both work for the same account!"

---

## Performance Notes

- Modals should appear < 100ms
- Re-auth should complete < 2s
- Linking should complete < 3s
- No lag when typing password
- Smooth transitions between screens
