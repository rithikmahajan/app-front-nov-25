# Quick Reference: Size Selection & Cart Integration

## How It Works Now

### Before (Old Flow):
1. User clicks "Add to Cart"
2. Size modal opens
3. User selects size
4. User clicks "Add to Cart" button at bottom
5. Item added to cart

### After (New Flow):

#### Add to Cart:
1. User clicks "Add to Cart" → Size modal opens
2. User selects size → **Item immediately added + Popup shown**
3. User clicks OK → Modal closes

#### Buy Now:
1. User clicks "Buy Now" → Size modal opens
2. User selects size → **Item added + Navigate to cart**
3. User sees cart with item

## Key Changes

### ✅ Removed:
- Bottom "Add to Cart" button in modal
- Bottom "Buy Now" button in modal
- Button container and styles

### ✅ Added:
- Two buttons on product page: "Add to Cart" & "Buy Now"
- `actionType` prop to modal ('addToCart' | 'buyNow')
- Automatic cart action on size selection
- Success popup for "Add to Cart" flow
- Auto-navigation for "Buy Now" flow

### ✅ Backend Integration:
- Uses `addToBag()` from BagContext
- Real API calls (no static data)
- Validates product before adding
- Supports both authenticated and guest users

## API Flow

```
User Selects Size
    ↓
handleSizeSelect(size)
    ↓
actionType === 'addToCart' ? handleAddToCartWithSize(size) : handleBuyNowWithSize(size)
    ↓
Find SKU for selected size
    ↓
addToBag(product, size, sku) → Backend API
    ↓
If addToCart: Show popup → Close modal
If buyNow: Close modal → Navigate to cart
```

## Code Locations

### Size Selection Modal
**File**: `src/screens/productdetailsmainsizeselectionchart.js`
- Line 29: `actionType` prop definition
- Line 414: `handleSizeSelect()` - triggers cart action
- Line 427: `handleAddToCartWithSize()` - adds and shows popup
- Line 468: `handleBuyNowWithSize()` - adds and navigates

### Product Details Screen
**File**: `src/screens/productdetailsmainscreenshotscreen.js`
- Line 30: `modalActionType` state
- Line 60: `handleAddBundleToCart()` - accepts actionType
- Line 303: Two buttons (Add to Cart & Buy Now)
- Line 339: Modal with actionType prop

## Testing Commands

```bash
# Run the app
npx react-native run-ios

# Check logs
# Look for: "🛒 Adding to bag - Product ID"
# Look for: "✅ Item added to backend cart successfully"
```

## Common Issues & Solutions

### Issue: Size selection doesn't work
**Solution**: Check that `actionType` prop is passed to modal

### Issue: No popup appears
**Solution**: Check Alert.alert is not blocked, check console for errors

### Issue: Item not in cart
**Solution**: Check backend API logs, verify authentication status

### Issue: Modal doesn't close
**Solution**: Check `handleClose()` function, verify animation completion

## Quick Tips

1. **Test with network inspector** to see API calls
2. **Check Redux/Context state** for cart updates
3. **Verify SKU mapping** for correct size variants
4. **Test both authenticated and guest flows**
5. **Check error boundaries** for crash prevention

---

**Implementation Status**: ✅ Complete  
**Backend Integration**: ✅ Fully Integrated  
**Static Data**: ❌ None (All Real APIs)  
**Ready for Production**: ✅ Yes
