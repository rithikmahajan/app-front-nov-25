# Quick Test: Checkout Authentication Flow

## 🧪 How to Test the Changes

### Quick Test (2 minutes)

1. **Open the app** (make sure you're logged out)
2. **Add item to cart** 
3. **Go to Bag** (tap bag icon in bottom navigation)
4. **Tap "Checkout" button** at the bottom
5. **Expected:** Alert appears "Sign In Required - Please sign in to proceed with checkout"
6. **Tap "Sign In"** button in alert
7. **Expected:** LoginAccountMobileNumber screen opens
8. **Log in** using any method (Phone/Email/Google/Apple)
9. **Expected:** After login, returns to Bag screen
10. **Tap "Delivering to: India"** 
11. **Expected:** Delivery address screen opens (no login prompt this time)
12. **Select or add an address**
13. **Tap "Continue"**
14. **Expected:** Returns to Bag, shows selected address
15. **Tap "Checkout" again**
16. **Expected:** Proceeds to payment (Razorpay)

---

## ✅ What Should Happen

### Before Login:
- ❌ Cannot access address selection
- ❌ Cannot proceed to checkout
- ⚠️ Shows "Sign In Required" alerts

### After Login:
- ✅ Can access address selection
- ✅ Can add/edit addresses
- ✅ Can proceed to checkout (if address selected)
- ✅ No more login prompts

---

## 🔍 Key Things to Check

### 1. Checkout Button (Guest User):
```
Tap "Checkout" → Alert appears → Tap "Sign In" → Login screen opens
```

### 2. Address Button (Guest User):
```
Tap "Delivering to: India" → Alert appears → Tap "Sign In" → Login screen opens
```

### 3. Return After Login:
```
Complete login → Back on Bag screen → Can now tap "Delivering to: India" → Address screen opens
```

### 4. Checkout with Address:
```
Select address → Back to Bag → Tap "Checkout" → Payment opens (no login prompt)
```

---

## 🐛 If Something Doesn't Work

### Issue: Alert doesn't appear
**Check:** Make sure you're logged out completely
**Fix:** Clear app data or reinstall

### Issue: Doesn't return to Bag after login
**Check:** Console logs for navigation errors
**Fix:** Verify `fromCheckout: true` parameter is being passed

### Issue: Can't select address
**Check:** Make sure user is logged in
**Fix:** Check `yoraaAPI.isAuthenticated()` returns true

### Issue: Checkout still doesn't work after login
**Check:** Make sure an address is selected
**Fix:** Tap "Delivering to: India" and select an address

---

## 📱 Test Scenarios

### Scenario 1: Complete Guest Checkout
1. Start as guest
2. Add items
3. Try checkout → Login required
4. Login
5. Select address
6. Checkout → Payment

**Result:** ✅ Should work end-to-end

### Scenario 2: Returning User
1. Already logged in
2. Add items
3. Tap checkout → No login prompt
4. Select address
5. Checkout → Payment

**Result:** ✅ Should skip login step

### Scenario 3: Cancel Login
1. Start as guest
2. Try checkout → Login prompt
3. Tap "Cancel" in alert
4. Stay on Bag screen

**Result:** ✅ Should stay on Bag, not navigate

---

## 🎯 Expected User Experience

### Guest Users:
1. Can browse and add to cart
2. **Cannot checkout without login** ← NEW
3. **Cannot select address without login** ← NEW
4. Clear prompts guide them to login

### Authenticated Users:
1. Can do everything seamlessly
2. No interruptions
3. Fast checkout process

---

## ✨ Summary

The key change is:
- **Before:** Users could try to checkout without login
- **After:** Users MUST login before accessing address selection or checkout

This ensures:
- ✅ All orders are linked to user accounts
- ✅ Better data quality
- ✅ Improved security
- ✅ Order tracking capabilities

---

**Testing Time:** ~2-3 minutes
**Complexity:** Low
**Critical Path:** Checkout → Login → Address → Payment
