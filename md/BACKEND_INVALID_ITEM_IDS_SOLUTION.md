# How to Test Razorpay with Real Backend Products

## Problem
The backend is rejecting orders with error: **"Invalid item IDs"**

This means the product ID `68da56fc0561b958f6694e35` doesn't exist in the backend database.

## Solution: Use Real Products

### Step 1: Fetch Real Products from Backend

Instead of using test/mock products, add real products from the backend to your cart.

#### Check Available Products:
```bash
# Get list of products from backend
curl -X GET http://185.193.19.244:8000/api/products

# Or check a specific product
curl -X GET http://185.193.19.244:8000/api/products/68da56fc0561b958f6694e35
```

### Step 2: Verify Product Exists

Before adding to cart, verify the product exists:
```javascript
// In your app
const checkProduct = async (productId) => {
  try {
    const response = await yoraaAPI.makeRequest(`/api/products/${productId}`, 'GET');
    console.log('Product exists:', response);
    return true;
  } catch (error) {
    console.error('Product not found:', error);
    return false;
  }
};
```

### Step 3: Alternative - Ask Backend to Add Product

Contact your backend team and ask them to:

1. **Add the missing product** with ID `68da56fc0561b958f6694e35`:
   ```json
   {
     "_id": "68da56fc0561b958f6694e35",
     "name": "Product 48",
     "price": 3878,
     "sizes": ["small", "medium", "large"],
     "sku": "SKU048",
     ...
   }
   ```

2. **OR provide valid test product IDs** that exist in the database

3. **OR disable strict ID validation** in development environment

## Current Error Details

### Request Sent:
```json
{
  "cart": [
    {
      "id": "68da56fc0561b958f6694e35",  // ❌ Doesn't exist in backend
      "name": "Product 48",
      "quantity": 1,
      "price": 0,  // ⚠️ Also price is 0!
      "size": "small",
      "sku": "PRODUCT48-SMALL-1759589167579-0"  // Auto-generated SKU
    }
  ]
}
```

### Backend Response:
```json
{
  "error": "Invalid item IDs",
  "status": 400
}
```

## Temporary Workaround

### Option A: Use Product from Shop Screen
1. Navigate to Shop/Home screen
2. Browse real products loaded from backend
3. Add a real product to cart
4. Try checkout again

### Option B: Clear Cart and Add Real Product
```javascript
// In your app console or debug
// Clear the current cart
clearBag();

// Add a real product that exists in backend
// (You'll need to get a valid product ID from backend team)
```

## Backend Team Contact Points

**Ask backend team:**
1. "What are valid product IDs for testing Razorpay checkout?"
2. "Can you add Product 48 (ID: 68da56fc0561b958f6694e35) to the database?"
3. "Can we disable strict product ID validation in development?"

## Why This Happens

The product "Product 48" with ID `68da56fc0561b958f6694e35` appears to be:
- Mock data created in frontend
- Test data that doesn't exist in backend database
- A product that was deleted from backend

The frontend code is working correctly - it's just trying to order a product that doesn't exist on the backend.

## Related Files

- **Product List**: Check `src/screens/shop.js` for how products are loaded
- **Product Details**: Check `src/screens/productdetails.js` for product fetching
- **Cart Context**: Check `src/contexts/BagContext.js` for cart management

## Next Steps

1. ✅ **Immediate**: Use real products from the Shop screen for testing
2. ⚠️ **Short-term**: Ask backend team for valid test product IDs
3. 🔧 **Long-term**: Backend should add Product 48 or disable ID validation in dev

---

**Status:** ⚠️ Backend Issue - Product doesn't exist in database  
**Impact:** Cannot test Razorpay with current mock products  
**Resolution:** Need real products from backend or backend team to add test data
