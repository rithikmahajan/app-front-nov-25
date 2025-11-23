# Back Navigation Fix for Review Flow - November 21, 2025

## Problem
When users were in the review flow and pressed the back button on the login screen, they were being navigated to the wrong screen (Rewards screen by default) instead of returning to the review screen where they initiated the sign-in.

## User Flow Before Fix
```
Review Screen → "Sign In Required" Alert → Login Screen → 
[User presses back] → Rewards Screen ❌ (Wrong!)
```

## User Flow After Fix
```
Review Screen → "Sign In Required" Alert → Login Screen → 
[User presses back] → Review Screen ✅ (Correct!)
```

## Solution Implemented

### 1. Login Screen Back Navigation
**File:** `src/screens/loginaccountmobilenumber.js`

Added `fromReview` handling in the GlobalBackButton `onPress` handler:
- Check if user came from review flow (`route?.params?.fromReview`)
- If yes, navigate back to the appropriate review screen
- Preserve all review data during navigation
- Support dynamic return screen based on `returnScreen` parameter

```javascript
onPress={() => {
  if (route?.params?.fromCheckout) {
    navigation && navigation.navigate('Bag');
  } else if (route?.params?.fromReview) {
    // Return to the screen where the sign-in was initiated
    const returnScreen = route?.params?.returnScreen || 'ProductDetailsReviewThreePointSelection';
    navigation && navigation.navigate(returnScreen, {
      reviewData: route?.params?.reviewData,
      product: route?.params?.reviewData?.product,
      productId: route?.params?.reviewData?.productId,
      order: route?.params?.reviewData?.order
    });
  } else if (route?.params?.fromOrders) {
    navigation && navigation.navigate('Profile');
  } else {
    navigation && navigation.navigate('Rewards');
  }
}}
```

### 2. Verification Code Screen Back Navigation
**File:** `src/screens/loginaccountmobilenumberverificationcode.js`

Added `fromReview` handling to ensure back navigation preserves review context:
- When user presses back from OTP screen during review flow
- Navigate back to login screen with review data intact
- Allows user to change phone number or cancel

```javascript
onPress={() => {
  if (route?.params?.fromReview) {
    // Go back to login screen with review data preserved
    navigation && navigation.navigate('LoginAccountMobileNumber', {
      fromReview: true,
      returnScreen: route?.params?.returnScreen,
      reviewData: route?.params?.reviewData
    });
  } else {
    // Default behavior - just go back to login screen
    navigation && navigation.navigate('LoginAccountMobileNumber');
  }
}}
```

## Navigation Flows Supported

### From Three-Point Rating Screen
```
ProductDetailsReviewThreePointSelection (Size/Comfort/Durability)
  ↓ "Sign In Required"
LoginAccountMobileNumber
  ↓ [Back Button]
ProductDetailsReviewThreePointSelection (with ratings preserved)
```

### From Written Review Screen
```
ProductDetailsWrittenUserReview (Star rating + text)
  ↓ "Sign In Required"
LoginAccountMobileNumber
  ↓ [Back Button]
ProductDetailsWrittenUserReview (with review data preserved)
```

### OTP Screen Back Navigation
```
LoginAccountMobileNumberVerificationCode
  ↓ [Back Button]
LoginAccountMobileNumber (with review data preserved)
  ↓ [Back Button]
Appropriate Review Screen (with data preserved)
```

## Data Preserved During Back Navigation

When navigating back, the following data is preserved:
- ✅ Rating selections (size, comfort, durability)
- ✅ Review text
- ✅ Star rating
- ✅ Selected images
- ✅ Product information
- ✅ Order information (if from orders flow)

## Context-Aware Navigation

The back button now intelligently handles different contexts:
- **From Checkout** → Returns to Bag
- **From Review** → Returns to appropriate review screen
- **From Orders** → Returns to Profile
- **Default** → Returns to Rewards

## Files Modified
1. ✅ `src/screens/loginaccountmobilenumber.js` - Added fromReview back navigation
2. ✅ `src/screens/loginaccountmobilenumberverificationcode.js` - Added fromReview back navigation

## User Experience Impact

**Before:**
- ❌ User loses context when pressing back
- ❌ User ends up on wrong screen
- ❌ Confusing navigation experience
- ❌ May need to navigate back to product manually

**After:**
- ✅ User returns to exact screen they were on
- ✅ All data preserved
- ✅ Intuitive navigation experience
- ✅ Can continue or cancel seamlessly

## Testing Scenarios

### Test 1: Back from Login (Rating Screen)
1. Go to three-point rating screen
2. Select ratings for size, comfort, durability
3. Tap "Next"
4. See "Sign In Required" alert
5. Tap "Sign In"
6. **Press back button on login screen**
7. ✅ Should return to rating screen with selections intact

### Test 2: Back from Login (Review Screen)
1. Go to written review screen
2. Enter star rating, text, and images
3. Tap "Post Review"
4. See "Sign In Required" alert
5. Tap "Sign In"
6. **Press back button on login screen**
7. ✅ Should return to review screen with all content intact

### Test 3: Back from OTP Screen
1. Follow Test 1 or Test 2
2. Enter phone number on login screen
3. Tap "Login"
4. **Press back button on OTP screen**
5. ✅ Should return to login screen
6. **Press back button again**
7. ✅ Should return to original review screen with data intact

### Test 4: Back from Checkout (Baseline)
1. Go to bag/checkout
2. Tap checkout
3. See "Sign In Required"
4. Tap "Sign In"
5. **Press back button**
6. ✅ Should return to Bag (existing behavior maintained)

## Edge Cases Handled

1. **Missing returnScreen parameter** - Defaults to `ProductDetailsReviewThreePointSelection`
2. **Missing reviewData** - Gracefully handles undefined data
3. **Mixed navigation contexts** - Priority order ensures correct behavior
4. **Deep navigation stack** - Preserves all necessary parameters

## Compatibility

- ✅ Works with phone number login
- ✅ Works with Apple Sign-In (cancellation)
- ✅ Works with Google Sign-In (cancellation)
- ✅ Maintains existing checkout flow
- ✅ Maintains existing orders flow
- ✅ Maintains default Rewards flow

---

**Status:** COMPLETE ✅
**Date:** November 21, 2025
**Impact:** HIGH - Significantly improves navigation UX in review flow
**Related:** REVIEW_AUTHENTICATION_FIX_NOV21.md
