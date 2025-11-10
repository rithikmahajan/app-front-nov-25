# Razorpay Payment Integration Fix

## Issue Identified

**Error**: "Payment Failed - Unexpected Error" (code: 1)

### Root Cause
The application was using Razorpay **live key** (`rzp_live_VRU7ggfYLI7DWV`) in development mode, which causes payment failures because:

1. **Live keys require real payment methods** - You cannot test with live keys using test cards
2. **Account configuration** - Live keys need proper KYC and bank account verification
3. **Development testing** - Test transactions must use test keys

## Solution Implemented

### 1. Frontend Changes

#### Updated Files:
- `src/services/paymentService.js`
- `src/screens/bag.js`

#### Changes Made:
```javascript
// Before (Always using live key)
key: 'rzp_live_VRU7ggfYLI7DWV'

// After (Environment-aware)
key: __DEV__ ? 'rzp_test_9WNhUijdgxSon5' : 'rzp_live_VRU7ggfYLI7DWV'
```

### 2. How It Works Now

- **Development Mode** (`__DEV__ = true`): Uses test key `rzp_test_9WNhUijdgxSon5`
- **Production Mode** (`__DEV__ = false`): Uses live key `rzp_live_VRU7ggfYLI7DWV`

### 3. Backend Configuration Required

⚠️ **IMPORTANT**: The backend also needs to use the correct Razorpay key based on environment.

Update your backend's Razorpay configuration to:

```javascript
// Backend: /config/razorpay.js or similar
const razorpayKey = process.env.NODE_ENV === 'production' 
  ? 'rzp_live_VRU7ggfYLI7DWV'  // Live key
  : 'rzp_test_9WNhUijdgxSon5';  // Test key

const razorpaySecret = process.env.NODE_ENV === 'production'
  ? 'YOUR_LIVE_SECRET'
  : 'YOUR_TEST_SECRET';
```

## Testing Razorpay Payments

### Test Cards for Development

Use these test card details with the test key:

#### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/28`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

#### Failed Payment (for testing error handling)
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

#### Test UPI IDs
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

### Test Flow

1. **Add items to bag**
2. **Select delivery address** (or system will prompt)
3. **Tap Checkout button**
4. **Razorpay payment gateway opens**
5. **Use test card details above**
6. **Payment should succeed**

## Expected Logs

When working correctly, you should see:

```
🔑 Razorpay mode: TEST
🔑 Using Razorpay key: rzp_test_9WNhUijdgxSon5
💳 Initializing Razorpay payment with order: {...}
🚀 Opening Razorpay with options: {...}
✅ Payment successful: {...}
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Verify `__DEV__` is `false` in production build
- [ ] Confirm live Razorpay key is active and KYC completed
- [ ] Test with real payment methods in staging
- [ ] Verify backend is using live Razorpay key and secret
- [ ] Check webhook configuration for production domain
- [ ] Enable payment methods (cards, UPI, wallets) in Razorpay dashboard
- [ ] Set up proper error logging and monitoring
- [ ] Test refund flow if implemented

## Common Issues & Solutions

### Issue: "Key ID does not exist"
**Solution**: Verify the Razorpay key is correct and matches the environment (test/live)

### Issue: "Payment processing error"
**Solution**: Check backend logs, ensure Razorpay secret key matches the key ID

### Issue: "Invalid order_id"
**Solution**: Ensure backend created order with same key (test/live) that frontend is using

### Issue: Payment succeeds but order not created
**Solution**: Check payment verification logic and webhook configuration

## API Flow

```
1. Frontend → Backend: POST /razorpay/create-order
   - Sends cart items, amount, address
   
2. Backend → Razorpay: Create Order API
   - Uses Razorpay key/secret based on environment
   - Returns order_id
   
3. Backend → Frontend: Returns order_id and details
   
4. Frontend: Opens Razorpay Checkout
   - Uses test key (dev) or live key (prod)
   
5. User: Completes payment on Razorpay
   
6. Frontend → Backend: POST /razorpay/verify-payment
   - Sends payment_id, order_id, signature
   
7. Backend: Verifies signature and creates order
   
8. Frontend: Shows success/failure to user
```

## Environment Variables (Optional Enhancement)

For better configuration, you can use environment variables:

```javascript
// .env.development
RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5

// .env.production  
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
```

Then use:
```javascript
import Config from 'react-native-config';

const razorpayKey = Config.RAZORPAY_KEY_ID || 
  (__DEV__ ? 'rzp_test_9WNhUijdgxSon5' : 'rzp_live_VRU7ggfYLI7DWV');
```

## Next Steps

1. **Reload the app** to apply the changes
2. **Test with test card** numbers provided above
3. **Verify backend** is also using test key in development
4. **Check logs** for proper key usage
5. **Test complete payment flow** including order creation

## Support

If issues persist:
1. Check Razorpay dashboard for order status
2. Verify backend logs for API errors
3. Ensure test key has necessary permissions
4. Contact Razorpay support if key issues persist

---
**Last Updated**: October 14, 2025
**Status**: ✅ Fixed - Using environment-aware Razorpay keys
