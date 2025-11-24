# Quick Test Guide - Buy Now Flow

## 🧪 How to Test

### Prerequisites
- App must be running on emulator or device
- Backend API must be accessible
- User should be on a product details page

---

## Test Case 1: Buy Now Flow ✅

**Steps:**
1. Open the app
2. Navigate to any product (tap on a product from home/collection)
3. Scroll down to see "Buy Now" and "Add to Cart" buttons
4. **Tap "Buy Now" button**
5. Size selection modal should open from bottom
6. **Tap a size** (e.g., "M", "L", "XL")
7. The size should be highlighted
8. **Tap "Confirm Size (X)" button** at the bottom
9. Wait for loading (spinning indicator)

**Expected Result:**
- ✅ Item is added to cart/bag
- ✅ Modal closes smoothly
- ✅ **Bag/Cart screen opens automatically** 
- ✅ You see the item you just added with correct size
- ✅ You can proceed to checkout from there

---

## Test Case 2: Add to Cart Flow ✅

**Steps:**
1. Go back to the same product page
2. **Tap "Add to Cart" button**
3. Size selection modal opens
4. **Tap a different size**
5. **Tap "Confirm Size" button**

**Expected Result:**
- ✅ Item is added to cart
- ✅ Modal closes
- ✅ **You stay on the product page** (don't navigate away)
- ✅ You can continue browsing

---

## Test Case 3: Size Not Selected

**Steps:**
1. Tap "Buy Now" button
2. **Don't select any size**
3. Try to tap "Confirm Size" button (if visible)

**Expected Result:**
- ✅ Alert appears: "Please select a size before confirming"
- ✅ Modal stays open
- ✅ User must select a size to continue

---

## Test Case 4: Multiple Items in Cart

**Steps:**
1. Add first item via "Buy Now" flow → Cart opens with 1 item
2. Go back to browse products
3. Add second item via "Buy Now" flow → Cart opens with 2 items
4. Verify both items are in cart with correct sizes

**Expected Result:**
- ✅ Both items appear in cart
- ✅ Each item shows correct size
- ✅ Cart total updates correctly

---

## Visual Indicators to Check

### Product Page:
- [ ] "Buy Now" button is visible (black background, white text)
- [ ] "Add to Cart" button is visible (white background, black text)
- [ ] Both buttons are below "View Product Details"

### Size Modal:
- [ ] Modal slides up from bottom smoothly
- [ ] Size options are displayed clearly
- [ ] Selected size is highlighted
- [ ] "Confirm Size (X)" button shows selected size
- [ ] Loading spinner appears when confirming

### Bag/Cart Screen:
- [ ] Shows newly added item
- [ ] Item has correct product name
- [ ] Item has correct size (the one you selected)
- [ ] Item has correct price
- [ ] Quantity shows 1 (for first time adding)
- [ ] Can proceed to checkout

---

## Common Issues & Solutions

### Issue: Modal doesn't open
**Solution:** Check console logs, ensure product data is loaded

### Issue: Size not getting selected
**Solution:** Ensure product has sizes array in backend

### Issue: Cart doesn't open after "Buy Now"
**Solution:** 
- Check navigation is working
- Check console for navigation errors
- Verify Bag screen is registered in navigation

### Issue: Item not appearing in cart
**Solution:**
- Check backend API is accessible
- Check network logs in React Native debugger
- Verify `addToBag` function is being called

---

## Debug Logs to Check

When testing, watch the console for these logs:

```
🛒 Adding to bag - Product ID: xxx, Size: M, SKU: xxx
✅ Item added to backend cart successfully
🔄 Navigating to Bag screen...
```

If you see errors, check:
- Network connection
- Backend API status
- Firebase authentication
- Product data structure

---

## Files to Monitor

If you encounter issues, check these files for debugging:

1. `src/screens/productdetailsmain.js` - Buy Now button logic
2. `src/screens/productdetailsmainsizeselectionchart.js` - Size modal logic
3. `src/contexts/BagContext.js` - Cart management
4. `src/screens/BagContent.js` - Cart display

---

## Success Criteria ✅

The feature is working correctly if:

1. ✅ "Buy Now" opens size modal
2. ✅ Size can be selected from modal
3. ✅ "Confirm Size" button works
4. ✅ Item is added to cart/bag
5. ✅ **Cart/Bag screen opens automatically**
6. ✅ Item appears in cart with correct details
7. ✅ Can proceed to checkout

---

## Next Steps After Testing

1. Test on both iOS and Android
2. Test with different products
3. Test with products that have different number of sizes
4. Test with products that are out of stock
5. Test the entire checkout flow
6. Test as guest user and logged-in user

---

**Last Updated:** November 19, 2025
**Feature:** Buy Now Flow with Cart Navigation
**Status:** ✅ Implementation Complete
