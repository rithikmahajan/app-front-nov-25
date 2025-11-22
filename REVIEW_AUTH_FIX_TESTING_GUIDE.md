# Review Authentication Fix - Testing Guide

## Overview
This guide helps you test the review submission authentication fix that ensures users are prompted to sign in before submitting product reviews.

## Test Scenarios

### Scenario 1: Unauthenticated User Tries to Submit Review
**Steps:**
1. Make sure you are NOT logged in to the app
2. Navigate to any product details page
3. Tap "Rate Product" or similar button to start writing a review
4. Fill in:
   - Star rating (select any rating 1-5)
   - Review text (write some text)
   - Optional: Add images
5. Tap "Post Review" button

**Expected Result:**
- Alert appears with title "Sign In Required"
- Message: "Please sign in to write a review."
- Two buttons shown: "Cancel" and "Sign In"

**Verify:**
- Review data (rating, text, images) is NOT lost
- Alert is clear and actionable

### Scenario 2: User Chooses "Cancel" on Sign-In Alert
**Steps:**
1. Follow Scenario 1 steps 1-5
2. When alert appears, tap "Cancel"

**Expected Result:**
- Alert dismisses
- User stays on review screen
- Review data (rating, text, images) is still there

### Scenario 3: User Chooses "Sign In" - Phone Number Login
**Steps:**
1. Follow Scenario 1 steps 1-5
2. When alert appears, tap "Sign In"
3. Select country code and enter phone number
4. Tap "Send verification code"
5. Enter OTP code received
6. Accept Terms & Conditions

**Expected Result:**
- Navigate to login screen
- Complete phone verification
- After accepting terms, return to review screen
- All review data is restored:
  - Star rating preserved
  - Review text preserved
  - Images preserved
- User can immediately tap "Post Review" to submit

### Scenario 4: User Chooses "Sign In" - Apple Sign-In
**Steps:**
1. Follow Scenario 1 steps 1-5
2. When alert appears, tap "Sign In"
3. Tap "Sign in with Apple" button
4. Complete Apple authentication
5. Accept Terms & Conditions (if new user)

**Expected Result:**
- Navigate to login screen
- Complete Apple sign-in
- After accepting terms (or immediately if existing user), return to review screen
- All review data is restored
- User can submit review

### Scenario 5: User Chooses "Sign In" - Google Sign-In
**Steps:**
1. Follow Scenario 1 steps 1-5
2. When alert appears, tap "Sign In"
3. Tap "Sign in with Google" button
4. Complete Google authentication
5. Accept Terms & Conditions (if new user)

**Expected Result:**
- Navigate to login screen
- Complete Google sign-in
- After accepting terms (or immediately if existing user), return to review screen
- All review data is restored
- User can submit review

### Scenario 6: Authenticated User Submits Review (Baseline Test)
**Steps:**
1. Make sure you ARE logged in to the app
2. Navigate to any product details page
3. Tap "Rate Product"
4. Fill in star rating and review text
5. Tap "Post Review"

**Expected Result:**
- NO sign-in alert appears
- Review submits immediately
- Success modal appears ("Thanks for your review")
- User can continue shopping or navigate

### Scenario 7: Review Data Preservation After Failed Login Attempt
**Steps:**
1. Follow Scenario 1 steps 1-5
2. Tap "Sign In"
3. Enter incorrect phone number or cancel authentication
4. Go back to review screen

**Expected Result:**
- Review data should still be there
- User can try signing in again or cancel

## Data Validation Checks

### Check 1: Review Content Preservation
After returning from sign-in, verify:
- [ ] Star rating matches what was selected
- [ ] Review text is exactly the same
- [ ] Number of images matches
- [ ] Images are the correct ones

### Check 2: Product Information
After returning from sign-in, verify:
- [ ] Product ID is maintained
- [ ] Product details are correct
- [ ] Review submits to the correct product

### Check 3: Navigation Flow
Verify the navigation path:
1. Review Screen → Sign In Alert
2. Sign In Alert → Login Screen
3. Login Screen → Verification (for phone) OR Terms (for social)
4. Terms → Review Screen
5. Review Screen → Thank You Modal → Product Details OR Orders

## Edge Cases to Test

### Edge Case 1: Multiple Sign-In Attempts
**Steps:**
1. Start review as unauthenticated user
2. Tap Sign In but cancel
3. Tap Sign In again but cancel
4. Finally complete sign-in

**Expected:** Review data preserved through all attempts

### Edge Case 2: App Backgrounding During Login
**Steps:**
1. Start review as unauthenticated user
2. Tap Sign In
3. During login process, put app in background
4. Return to app and complete login

**Expected:** Review data still preserved

### Edge Case 3: Very Long Review Text
**Steps:**
1. Write a very long review (500+ characters)
2. Add 2 images
3. Sign in when prompted
4. Return to review screen

**Expected:** All text and images preserved

### Edge Case 4: Special Characters in Review
**Steps:**
1. Write review with emojis, special characters (é, ñ, ü, etc.)
2. Sign in when prompted
3. Return to review screen

**Expected:** All special characters preserved correctly

## Console Log Checks

When testing, check the console for these log messages:

**Before Authentication Check:**
```
🔍 handlePostReview - isAuthenticated: false
🔒 User not authenticated, navigating to LoginAccountMobileNumber to sign in
```

**After Successful Login:**
```
✅ Restored review data after login: {reviewData}
```

**Review Submission:**
```
📝 Submitting review for product: {productId}
✅ Review submitted successfully
```

## Success Criteria

The fix is working correctly if:
- [x] Unauthenticated users see clear "Sign In Required" alert
- [x] Review data is preserved during entire login flow
- [x] Users return to review screen after authentication
- [x] Review can be submitted immediately after login
- [x] All sign-in methods (phone, Apple, Google) work correctly
- [x] Authenticated users can still submit reviews normally
- [x] Error messages are clear and helpful

## Regression Testing

Also verify these existing flows still work:
- [ ] Authenticated users writing reviews (should work as before)
- [ ] Checkout flow with sign-in prompt
- [ ] Chat support sign-in prompt
- [ ] Order viewing sign-in prompt

## Known Issues / Limitations

None currently identified. If you find any issues during testing, please document them.

## Reporting Issues

If you encounter any problems, please capture:
1. Steps to reproduce
2. Screenshots/screen recording
3. Console logs
4. Device/OS version
5. App build version
6. Expected vs actual behavior

---

**Last Updated:** November 21, 2025
**Test Status:** Ready for Testing
**Priority:** High - User Experience Impact
