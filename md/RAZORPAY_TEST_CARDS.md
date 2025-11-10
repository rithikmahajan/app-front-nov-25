# Razorpay Test Card Quick Reference

## ✅ Test Cards for Successful Payments

### Visa
```
Card Number: 4111 1111 1111 1111
Expiry:      12/28
CVV:         123
Name:        Test User
```

### Mastercard
```
Card Number: 5555 5555 5555 4444
Expiry:      12/28
CVV:         123
Name:        Test User
```

### American Express
```
Card Number: 3782 822463 10005
Expiry:      12/28
CVV:         1234 (4 digits)
Name:        Test User
```

## ❌ Test Cards for Failed Payments

### Generic Failure
```
Card Number: 4000 0000 0000 0002
Expiry:      12/28
CVV:         123
```

### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry:      12/28
CVV:         123
```

## 💸 Test UPI IDs

### Successful Payment
```
UPI ID: success@razorpay
```

### Failed Payment
```
UPI ID: failure@razorpay
```

## 📱 Test Wallets

### Paytm
- Use any test phone number
- OTP will be auto-filled in test mode

### PhonePe, Google Pay
- Available in test mode
- No actual money will be deducted

## 🔑 Current Configuration

**Test Key** (Development): `rzp_test_9WNhUijdgxSon5`  
**Live Key** (Production): `rzp_live_VRU7ggfYLI7DWV`

The app automatically uses:
- ✅ **Test key** when `__DEV__` is `true` (Metro/Debug builds)
- ✅ **Live key** when `__DEV__` is `false` (Release builds)

## 🧪 How to Test

1. **Run the app** in development mode
2. **Add items** to your bag
3. **Select/Add** a delivery address
4. **Tap Checkout** button
5. **Razorpay payment screen** will open
6. **Select Card Payment**
7. **Enter test card details** from above
8. **Complete payment**
9. **Verify order** is created successfully

## 📊 Expected Behavior

### In Development (Test Mode)
- ✅ Razorpay watermark visible
- ✅ "Test Mode" indicator
- ✅ Test cards work
- ✅ No real money charged
- ✅ Can test multiple times

### In Production (Live Mode)
- ✅ No test mode indicators
- ✅ Only real cards work
- ✅ Actual money charged
- ✅ Real transactions

## ⚠️ Important Notes

1. **Test cards only work with test key** - They will fail with live key
2. **Real cards only work with live key** - They will fail with test key
3. **Backend must use matching key** - Test key frontend → Test key backend
4. **Never commit API keys** - Use environment variables
5. **Check Razorpay dashboard** - View all test transactions

## 🔍 Debugging

If payment fails, check console for:
```
🔑 Razorpay mode: TEST
🔑 Using Razorpay key: rzp_test_9WNhUijdgxSon5
```

If you see `LIVE` instead of `TEST`, the app needs to be rebuilt in debug mode.

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Dashboard**: https://dashboard.razorpay.com/

---
**Mode**: Development/Test  
**Last Updated**: October 14, 2025
