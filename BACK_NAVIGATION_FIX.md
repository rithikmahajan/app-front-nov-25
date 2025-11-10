# Back Navigation Fix - Reviews Screen

## Issue
When pressing the back button on the Reviews screen, it wasn't navigating correctly back to the Product Details Main screen.

## Root Cause
The `handleBackPress()` function in `productdetailsmainreview.js` was using:
```javascript
navigation.navigate('ProductDetailsMain');
```

This caused issues because:
1. **No product data passed**: The navigate method wasn't passing the product data back
2. **Creates new screen instance**: `navigate()` can create a new instance instead of going back
3. **Lost state**: The Product Details Main screen lost its state and had to reload

## Solution

Changed from `navigation.navigate()` to `navigation.goBack()`:

### Before:
```javascript
const handleBackPress = () => {
  if (navigation) {
    navigation.navigate('ProductDetailsMain');
  }
};
```

### After:
```javascript
const handleBackPress = () => {
  if (navigation) {
    // Use goBack to return to ProductDetailsMain with existing state
    navigation.goBack();
  }
};
```

## Benefits

1. **Preserves State**: Returns to the exact screen state user left from
2. **Maintains Product Data**: Product details remain loaded
3. **Better Performance**: No need to refetch or reload data
4. **Proper Navigation Stack**: Correctly pops the Reviews screen from the stack
5. **Better UX**: Smooth back navigation without reloading

## How It Works

### Navigation Flow:
1. User on Product Details Main screen
2. User taps "20 Reviews" or "Be the first to review"
3. Reviews screen opens with product data passed via route params
4. User taps back button
5. **Now**: `goBack()` returns to previous screen with all state intact
6. Product Details Main screen appears exactly as user left it

### Alternative Approaches Considered:

**Option 1**: Pass product data back
```javascript
navigation.navigate('ProductDetailsMain', { product });
```
❌ Problem: Still creates new instance, might cause duplicate screens

**Option 2**: Use replace
```javascript
navigation.replace('ProductDetailsMain', { product });
```
❌ Problem: Removes Reviews from stack, breaks forward navigation

**Option 3**: Use goBack() ✅ **CHOSEN**
```javascript
navigation.goBack();
```
✅ Correct: Properly handles navigation stack and preserves state

## Testing

To verify the fix works:

1. **Navigate to Product Details**
   - Open any product from the home screen or collection

2. **Open Reviews**
   - Tap on the review count link (e.g., "20 Reviews")
   - Or tap "Be the first to review this product"

3. **Press Back**
   - Tap the back button (< icon) in top left
   - Should smoothly return to Product Details screen
   - Product data should still be visible
   - No reloading or flickering

4. **Verify State Preserved**
   - Scroll position should be maintained (if possible)
   - Selected size/variant should still be selected
   - Images should be on same position
   - No need to refetch data

## Related Files

- `/src/screens/productdetailsmainreview.js` - Reviews screen with fixed back navigation
- `/src/screens/productdetailsmain.js` - Product details screen that user returns to

## Navigation Stack Example

```
Stack Before:
[Home] → [Collection] → [ProductDetailsMain]

User taps "Reviews":
[Home] → [Collection] → [ProductDetailsMain] → [Reviews]

User taps Back (with fix):
[Home] → [Collection] → [ProductDetailsMain] ← Returns here correctly
```

## Notes

- This is the standard React Navigation pattern for back navigation
- `goBack()` is preferred over `navigate()` for back buttons
- The product data is automatically preserved because we're returning to the existing screen instance
- No need to pass parameters when going back
