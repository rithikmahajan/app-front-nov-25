# Quick Integration Test Script

**Use these test product IDs** (confirmed to exist in backend):
- `68da56fc0561b958f6694e1d` - Product 36
- `68da56fc0561b958f6694e19` - Product 34

---

## 🧪 Test Sequence (Copy-Paste Ready)

### Test 1: Product API Response Structure ✅

```bash
# Expected: 200 response with data wrapper
curl http://185.193.19.244:8000/api/products/68da56fc0561b958f6694e1d

# Should return:
# {
#   "statusCode": 200,
#   "data": {
#     "_id": "68da56fc0561b958f6694e1d",
#     "productName": "Product 36",
#     "status": "live",
#     "sizes": [...]
#   },
#   "success": true
# }
```

**✅ PASS Criteria**: Response has `data._id` field  
**❌ FAIL if**: Response structure is different or 404

---

### Test 2: Cart Update Endpoint ✅

```bash
# Replace YOUR_TOKEN with actual JWT token from app
export TOKEN="YOUR_JWT_TOKEN_HERE"

# Test update endpoint (should return 200, not 404)
curl -X PUT http://185.193.19.244:8000/api/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "68da56fc0561b958f6694e1d",
    "size": "small",
    "quantity": 2
  }'

# Should return:
# {
#   "statusCode": 200,
#   "data": { "items": [...], "totalItems": 2, "totalPrice": ... },
#   "success": true
# }
```

**✅ PASS Criteria**: Status 200, no 404 error  
**❌ FAIL if**: Status 404 or "endpoint not found"

---

### Test 3: Cart Remove Endpoint ✅

```bash
# Test remove endpoint (should return 200, not 404)
curl -X DELETE http://185.193.19.244:8000/api/cart/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "68da56fc0561b958f6694e1d",
    "size": "small"
  }'

# Should return:
# {
#   "statusCode": 200,
#   "data": { "items": [], "totalItems": 0 },
#   "success": true
# }
```

**✅ PASS Criteria**: Status 200, item removed  
**❌ FAIL if**: Status 404

---

### Test 4: Razorpay Order Creation ✅

```bash
# CRITICAL TEST - This was failing before
curl -X POST http://185.193.19.244:8000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 1752,
    "cart": [
      {
        "id": "68da56fc0561b958f6694e1d",
        "name": "Product 36",
        "quantity": 1,
        "price": 1752,
        "size": "small",
        "sku": "SKU036"
      }
    ],
    "staticAddress": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phoneNumber": "+918717000084",
      "address": "Test Address",
      "city": "Test City",
      "state": "Test State",
      "country": "India",
      "pinCode": "180001",
      "addressType": "HOME"
    },
    "userId": "68dae3fd47054fe75c651493",
    "paymentMethod": "razorpay"
  }'

# Should return:
# {
#   "statusCode": 200,
#   "data": {
#     "orderId": "order_NnnDzh8nGLddHu",
#     "amount": 175200,
#     "currency": "INR"
#   },
#   "success": true
# }
```

**✅ PASS Criteria**: Status 200, orderId returned  
**❌ FAIL if**: "Invalid item IDs" error or 400 status

---

## 🎯 Frontend App Testing

### Test 5: Product Validation in App

**Steps**:
1. Open app
2. Navigate to product with ID `68da56fc0561b958f6694e1d`
3. Try to add to cart

**Expected Console Logs**:
```
🔍 Validating product 68da56fc0561b958f6694e1d with size small against backend...
🔍 Backend response structure: {"statusCode":200,"data":{...},"success":true}
✅ Product exists: Product 36
✅ Product validation passed, proceeding to add to cart
```

**❌ Should NOT See**:
```
❌ Product not found
❌ Product validation failed
```

---

### Test 6: Cart Operations in App

**Steps**:
1. Add product to cart
2. Update quantity
3. Check console logs

**Expected Console Logs** (No 404s!):
```
🛒 Adding to bag - Product ID: 68da56fc0561b958f6694e1d, Size: small, SKU: SKU036
✅ Item already exists at index 0, increasing quantity
✅ Cart updated successfully
```

**❌ Should NOT See**:
```
⚠️ Cart endpoint not available: /api/cart/update - using local cart only
❌ API Error [404] /api/cart/update
```

---

### Test 7: Complete Checkout in App

**Steps**:
1. Add product to cart (Product 36)
2. Go to Bag/Cart screen
3. Click "Proceed to Checkout"
4. Fill shipping address
5. Click "Place Order"

**Expected Flow**:
```
🔍 Validating product... ✅
📦 Sending order creation request... ✅
✅ Order created successfully
🎯 Initiating Razorpay payment
[Razorpay payment screen appears]
```

**❌ Should NOT See**:
```
❌ API Error [400] /api/razorpay/create-order: {error: 'Invalid item IDs'}
❌ Complete order flow error: Some products in your cart are no longer available
```

---

## 📊 Test Results Template

Copy this and fill in your results:

```
=== INTEGRATION TEST RESULTS ===
Date: October 14, 2025
Tester: [Your Name]

Test 1: Product API Structure
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 2: Cart Update Endpoint
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 3: Cart Remove Endpoint
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 4: Razorpay Order Creation
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 5: Product Validation in App
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 6: Cart Operations in App
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Test 7: Complete Checkout in App
Status: [ ] PASS [ ] FAIL
Notes: _______________________

Overall Integration Status: [ ] SUCCESS [ ] NEEDS FIX

Issues Found (if any):
1. _______________________
2. _______________________
3. _______________________
```

---

## 🔍 Common Issues & Quick Fixes

### Issue: "Invalid token" or 401 errors
**Fix**: Get a fresh JWT token from the app (login again)

### Issue: Product 404
**Fix**: Verify product ID exists in backend database

### Issue: Still seeing cart 404s
**Fix**: Verify backend server is running and endpoints are deployed

### Issue: Razorpay still says "Invalid item IDs"
**Fix**: Check backend logs to verify ObjectId conversion is working

---

## ✅ Success Checklist

- [ ] All 7 tests pass
- [ ] No 404 errors in console
- [ ] No "Invalid item IDs" errors
- [ ] Razorpay payment screen appears
- [ ] Cart syncs with backend (no warnings)
- [ ] Product validation passes

**If all checked**: 🎉 INTEGRATION SUCCESSFUL! Ready for production.

---

## 🚀 Next Steps After Successful Testing

1. **Document any minor issues** encountered
2. **Test with more products** from the backend
3. **Test on multiple devices** to verify cart sync
4. **Complete a real payment** with test card
5. **Monitor logs** for any unexpected errors
6. **Enable for all users** in production

---

**Quick Tip**: Keep this test script handy for regression testing after any future changes!
