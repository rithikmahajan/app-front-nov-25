r# Testing Guide: Promo Code Separation

## Quick Test Checklist

### ✅ Test 1: Invite a Friend Screen
**Navigate to:** Profile → Invite a Friend

**Expected Results:**
- [ ] Screen loads successfully
- [ ] Shows ONLY invite codes (e.g., SAVE3, INVITE322)
- [ ] Does NOT show regular promo codes (e.g., WELCOME10, SAVE20)
- [ ] "Share Code" button works for each code
- [ ] Copy functionality works

**Console Logs to Look For:**
```
✅ InviteAFriend: Loaded X invite-friend codes only
```

**If Wrong Codes Appear:**
```
🚫 InviteAFriend: Excluding non-invite code: XXXXX
```

---

### ✅ Test 2: Cart/Bag Screen
**Navigate to:** Add items to cart → Bag → Scroll to promo codes section

**Expected Results:**
- [ ] Screen loads successfully
- [ ] Shows ONLY regular promo codes (e.g., WELCOME10, SAVE20)
- [ ] Does NOT show invite codes (e.g., SAVE3, INVITE322)
- [ ] "Apply" button works for each code
- [ ] Applied code updates the total price

**Console Logs to Look For:**
```
✅ Cart: Loaded X regular promo codes (invite codes excluded)
```

**If Invite Codes Appear:**
```
🚫 Cart: Excluding invite-friend code: XXXXX
```

---

### ✅ Test 3: Authentication State

**Test A: Logged Out User**
1. Log out of the app
2. Navigate to Bag screen
3. **Expected:** No promo codes shown (or empty state)

**Test B: Logged In User**
1. Log in to the app
2. Navigate to Bag screen
3. **Expected:** Regular promo codes displayed
4. Navigate to Invite a Friend screen
5. **Expected:** Invite codes displayed

---

## Detailed Testing Steps

### Test Case 1: Invite Screen Shows Only Invite Codes

**Steps:**
1. Open the app
2. Ensure you are logged in
3. Navigate to: Profile → Invite a friend
4. Wait for codes to load
5. Verify the codes shown

**Expected Behavior:**
- ✅ Shows codes marked as "invite" type
- ✅ Codes have "Share Code" buttons
- ✅ Each code shows discount details
- ❌ Does NOT show regular promo codes

**Test Data:**
| Code | Type | Should Show in Invite Screen? |
|------|------|------------------------------|
| SAVE3 | invite | ✅ YES |
| INVITE322 | invite | ✅ YES |
| WELCOME10 | promo | ❌ NO |
| SAVE20 | promo | ❌ NO |

---

### Test Case 2: Cart Shows Only Regular Promo Codes

**Steps:**
1. Open the app
2. Ensure you are logged in
3. Add at least one item to cart
4. Navigate to: Bag/Cart
5. Scroll to the promo codes section
6. Expand the "Promo Codes Available" section
7. Verify the codes shown

**Expected Behavior:**
- ✅ Shows codes marked as "promo" type
- ✅ Codes have "Apply" buttons
- ✅ Each code shows discount details
- ❌ Does NOT show invite-friend codes

**Test Data:**
| Code | Type | Should Show in Cart? |
|------|------|---------------------|
| SAVE3 | invite | ❌ NO |
| INVITE322 | invite | ❌ NO |
| WELCOME10 | promo | ✅ YES |
| SAVE20 | promo | ✅ YES |

---

### Test Case 3: Code Application Works Correctly

**Invite Screen:**
1. Navigate to Invite a Friend
2. Tap "Share Code" on any invite code
3. **Expected:** Share dialog opens with invite message
4. Tap "Copy" icon on any code
5. **Expected:** Alert shows with copy/share options

**Cart Screen:**
1. Navigate to Cart/Bag
2. Tap "Apply" on any promo code
3. **Expected:** 
   - Code is marked as "Applied"
   - Total price updates with discount
   - Can only apply one code at a time

---

## Console Log Reference

### Normal Operation Logs:

#### Invite Screen:
```javascript
🎁 Fetching invite friend codes from backend
🔍 Trying endpoint: /api/invite-friend/active
✅ Found X active invite codes from /api/invite-friend/active
✅ InviteAFriend: Loaded X invite-friend codes only
```

#### Cart Screen:
```javascript
🎟️ Fetching promo codes, user authenticated: true
✅ Available promo codes fetched successfully
✅ Filtered X regular promo codes (excluded invite codes)
✅ Cart: Loaded X regular promo codes (invite codes excluded)
```

---

### Debug Logs (Filtering in Action):

#### If non-invite code reaches Invite Screen:
```javascript
🚫 InviteAFriend: Excluding non-invite code: WELCOME10
```

#### If invite code reaches Cart Screen:
```javascript
🚫 Cart: Excluding invite-friend code: SAVE3
```

---

## Edge Cases to Test

### Edge Case 1: No Codes Available
**Scenario:** Backend returns empty array

**Invite Screen Expected:**
- Shows empty state message
- "No Invite Codes Available" message
- Retry button appears

**Cart Screen Expected:**
- Shows empty state message
- "No promo codes available right now"
- Can still proceed to checkout

---

### Edge Case 2: Network Error
**Scenario:** API calls fail

**Expected Behavior:**
- Error message displayed
- Retry option available
- App doesn't crash
- Can still use the app (codes optional)

---

### Edge Case 3: Mixed Response
**Scenario:** Backend returns both types of codes in one endpoint

**Expected Behavior:**
- Each screen filters appropriately
- Invite screen shows only invite codes
- Cart shows only promo codes
- Console logs show filtered codes

---

## Validation Checklist

Before considering the feature complete, verify:

- [ ] Invite screen shows ONLY invite codes
- [ ] Cart screen shows ONLY regular promo codes
- [ ] No overlap between the two screens
- [ ] Share functionality works on invite codes
- [ ] Apply functionality works on promo codes
- [ ] Console logs show correct filtering
- [ ] Empty states display correctly
- [ ] Error states handled gracefully
- [ ] Works for both logged in and logged out states
- [ ] No crashes or errors in console

---

## Troubleshooting

### Issue: Both screens show same codes

**Check:**
1. Verify `yoraaAPI.js` changes are applied
2. Check console logs for filter messages
3. Verify `codeType` field is being set

**Solution:**
- Codes from `/api/invite-friend/*` should have `codeType: 'invite'`
- Codes from `/api/promoCode/*` should have `codeType: 'promo'`

---

### Issue: No codes showing anywhere

**Check:**
1. User authentication status
2. Network connection
3. Backend API availability
4. Console for error messages

**Solution:**
- Ensure user is logged in
- Check backend endpoints are accessible
- Review error logs in console

---

### Issue: Codes appear but can't apply/share

**Check:**
1. Code data structure
2. Button handlers
3. Console for JavaScript errors

**Solution:**
- Verify code object has required fields
- Check if handlers are properly bound
- Review error messages

---

## Success Criteria

✅ **Feature is complete when:**

1. Invite a Friend screen shows only invite codes (no regular promos)
2. Cart screen shows only regular promos (no invite codes)
3. All codes are functional (can share/apply)
4. Console logs confirm correct filtering
5. Empty states and errors handled gracefully
6. No crashes or breaking errors

---

## Report Template

Use this template to report test results:

```
## Test Results: Promo Code Separation

**Date:** [Date]
**Tester:** [Name]
**Build:** [Version]

### Invite Screen Tests
- [ ] Shows only invite codes: PASS / FAIL
- [ ] Share functionality works: PASS / FAIL
- [ ] Empty state displays: PASS / FAIL
- Notes: ___________

### Cart Screen Tests
- [ ] Shows only regular promos: PASS / FAIL
- [ ] Apply functionality works: PASS / FAIL
- [ ] Price updates correctly: PASS / FAIL
- Notes: ___________

### Edge Cases
- [ ] No codes scenario: PASS / FAIL
- [ ] Network error handling: PASS / FAIL
- [ ] Authentication states: PASS / FAIL
- Notes: ___________

### Overall Result
- [ ] PASS - Ready for production
- [ ] FAIL - Issues found (see notes)

**Issues Found:**
1. ___________
2. ___________
```

---

## Quick Debug Commands

Open React Native debugger and run:

```javascript
// Check current codes in Invite screen
console.log('Invite codes:', inviteCodes);

// Check current codes in Cart
console.log('Promo codes:', promoCodes.available);

// Force re-fetch invite codes
fetchInviteCodes();

// Force re-fetch promo codes
fetchPromoCodes();
```

---

That's it! Follow this guide to thoroughly test the promo code separation feature. 🎉
