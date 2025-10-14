# 🔑 Razorpay Configuration Guide - React Native App

## 📋 Current Status

✅ **Configuration Complete** - The app is properly configured for both test and production environments!

---

## 🎯 How It Works

Your React Native app automatically uses the correct Razorpay key based on the environment:

### Development Mode (Debug Build)
- **Uses**: Test Key `rzp_test_9WNhUijdgxSon5`
- **From**: `.env` file
- **When**: Running with Metro bundler (`npx react-native run-ios` or `run-android`)
- **Purpose**: Safe testing with test cards, no real money involved

### Production Mode (Release Build)
- **Uses**: Live Key `rzp_live_VRU7ggfYLI7DWV`
- **From**: `.env.production` file
- **When**: Building release/archive for App Store or Play Store
- **Purpose**: Real payments with actual cards

---

## 📁 Environment Files

### `.env` (Development/Default)
```env
# Razorpay Configuration (TEST KEYS for development)
RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
```

### `.env.production` (Production)
```env
# Razorpay Configuration (LIVE KEYS for production)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe
```

---

## 🔧 How Keys Are Loaded

The app uses a **priority system** to determine which key to use:

```javascript
// Priority: 
// 1. Environment variable (Config.RAZORPAY_KEY_ID)
// 2. Auto-detect based on __DEV__ flag

const razorpayKey = Config.RAZORPAY_KEY_ID || 
  (__DEV__ ? 'rzp_test_9WNhUijdgxSon5' : 'rzp_live_VRU7ggfYLI7DWV');
```

**Implementation in** `src/screens/bag.js`:
```javascript
const initializeRazorpayPayment = useCallback(async (razorpayOrder, address) => {
  // Load key from environment or fallback to hardcoded based on mode
  const razorpayKey = Config.RAZORPAY_KEY_ID || 
    (__DEV__ ? 'rzp_test_9WNhUijdgxSon5' : 'rzp_live_VRU7ggfYLI7DWV');
  
  console.log('🔑 Razorpay mode:', __DEV__ ? 'TEST' : 'LIVE');
  console.log('🔑 Using Razorpay key:', razorpayKey);
  
  const options = {
    key: razorpayKey,
    amount: razorpayOrder.amount,
    order_id: razorpayOrder.id,
    // ... other options
  };
  
  await RazorpayCheckout.open(options);
});
```

---

## 🧪 Testing with Test Keys

### How to Verify You're in Test Mode

Check the console logs when you tap Checkout:

```
✅ Expected Logs (Test Mode):
🔑 Razorpay mode: TEST
🔑 From environment: true
🔑 Using Razorpay key: rzp_test_9WNhUijdgxSon5
💳 Initializing Razorpay payment with order: {...}
```

### Test Card Details

Use these cards in **test mode only**:

#### ✅ Successful Payment
```
Card Number: 4111 1111 1111 1111
Expiry:      12/28
CVV:         123
Name:        Test User
```

#### ✅ Mastercard
```
Card Number: 5555 5555 5555 4444
Expiry:      12/28
CVV:         123
Name:        Test User
```

#### ❌ Failed Payment (for testing error handling)
```
Card Number: 4000 0000 0000 0002
Expiry:      12/28
CVV:         123
```

#### 🔐 3D Secure Authentication
```
Card Number: 4000 0027 6000 3184
Expiry:      12/28
CVV:         123
```

### Test UPI IDs
```
Success: success@razorpay
Failure: failure@razorpay
```

**Complete test details**: https://razorpay.com/docs/payments/payments/test-card-upi-details/

---

## 🚀 Running the App

### Development (Test Keys)

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android

# Or reload the app
Press 'r' in Metro terminal
```

### Production Build (Live Keys)

#### iOS
```bash
# 1. Clean build folder
cd ios && rm -rf build DerivedData

# 2. Install pods
pod install

# 3. Build release in Xcode
# Product > Scheme > Edit Scheme > Run > Release
# Product > Archive
```

#### Android
```bash
# 1. Clean
cd android && ./gradlew clean

# 2. Build release APK
./gradlew assembleRelease

# 3. Build release AAB
./gradlew bundleRelease
```

---

## 🔍 Troubleshooting

### Issue: "Payment Failed - Unexpected Error"

**Cause**: Using test cards with live key OR live cards with test key

**Solution**: Verify the mode in console logs
```javascript
console.log('🔑 Razorpay mode:', __DEV__ ? 'TEST' : 'LIVE');
```

- If TEST mode: Use test cards only
- If LIVE mode: Use real cards only

### Issue: Key not loading from .env file

**Cause**: Environment variables not synced

**Solution**:
```bash
# 1. Stop Metro bundler (Ctrl+C)

# 2. Clear cache
npx react-native start --reset-cache

# 3. Rebuild app
npx react-native run-ios
# or
npx react-native run-android
```

### Issue: Still seeing live key in development

**Cause**: App not rebuilt after .env changes

**Solution**: 
1. Kill the app completely
2. Stop Metro bundler
3. Rebuild from scratch:
```bash
npx react-native run-ios --reset-cache
```

---

## 📊 Expected Payment Flow

### 1. User Taps Checkout
```
🔍 Validating cart items before checkout...
✅ Cart validation passed
✅ User is authenticated with address, initiating Razorpay payment
```

### 2. Creating Razorpay Order
```
🔍 Creating Razorpay order with bag items: [...]
🔍 Using enhanced validated amounts: {...}
📤 Sending Razorpay order data: {...}
✅ Razorpay order created successfully: {...}
```

### 3. Opening Razorpay Checkout
```
💳 Initializing Razorpay payment with order: {...}
🔑 Razorpay mode: TEST
🔑 From environment: true
🔑 Using Razorpay key: rzp_test_9WNhUijdgxSon5
🚀 Opening Razorpay with options: {...}
```

### 4. Payment Success
```
✅ Payment successful: {
  razorpay_payment_id: "pay_xxx",
  razorpay_order_id: "order_xxx",
  razorpay_signature: "xxx"
}
```

---

## ⚠️ Security Best Practices

### ✅ DO
- Use test keys in development
- Use live keys only in production
- Store keys in environment files
- Add `.env` to `.gitignore`
- Verify payment signatures on backend
- Test thoroughly before production

### ❌ DON'T
- Commit API keys to Git
- Use live keys for testing
- Expose keys in client-side code
- Skip payment verification
- Test with live keys and real money

---

## 🎯 Backend Configuration

Your backend also needs to use the correct Razorpay key. The backend should:

1. **Use test keys in development**
   ```env
   RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5
   RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
   ```

2. **Use live keys in production**
   ```env
   RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
   RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe
   ```

3. **API Endpoints**
   - `POST /api/razorpay/create-order` - Creates Razorpay order
   - `POST /api/razorpay/verify-payment` - Verifies payment signature

---

## 📝 Checklist Before Production

- [ ] Test payment flow with test cards in development
- [ ] Verify test mode indicator in Razorpay checkout
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test payment cancellation
- [ ] Verify order creation in backend
- [ ] Test order verification
- [ ] Verify `.env.production` has live keys
- [ ] Verify backend production has live keys
- [ ] Build release version
- [ ] Test release build on device (without Metro)
- [ ] Verify live mode in release build logs
- [ ] Submit to App Store/Play Store

---

## 🆘 Getting Razorpay Test Keys

If you need to get your own test keys:

1. Go to https://dashboard.razorpay.com/
2. **Switch to Test Mode** (toggle at top-left)
3. Navigate to **Settings > API Keys**
4. Click **Generate Test Keys**
5. Copy **Key ID** and **Key Secret**
6. Update `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
   RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
   ```
7. Restart Metro and rebuild app

---

## 📞 Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Dashboard**: https://dashboard.razorpay.com/
- **React Native Integration**: https://razorpay.com/docs/payment-gateway/react-native-integration/

---

## ✅ Current Configuration Summary

| Environment | Key Used | Mode | Source |
|-------------|----------|------|--------|
| Development (Debug) | `rzp_test_9WNhUijdgxSon5` | TEST | `.env` |
| Production (Release) | `rzp_live_VRU7ggfYLI7DWV` | LIVE | `.env.production` |

**Status**: ✅ Properly Configured  
**Auto-switching**: ✅ Enabled  
**Fallback**: ✅ Implemented  
**Last Updated**: October 14, 2025

---

## 🎉 You're All Set!

Your app is configured correctly. Just follow these steps:

1. **Run the app** in development mode
2. **Add items** to bag
3. **Tap Checkout**
4. **Check console** for "🔑 Razorpay mode: TEST"
5. **Use test card** `4111 1111 1111 1111`
6. **Complete payment**
7. **Verify order** creation

The same code will automatically use live keys when you build for production! 🚀
