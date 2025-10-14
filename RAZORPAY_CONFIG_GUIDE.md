# 🔑 Razorpay Configuration Guide - React Native App

## 📋 Overview

This guide explains how Razorpay keys are configured in your **React Native mobile application**.

---

## ✅ Current Configuration Status

### Frontend (React Native) - CONFIGURED ✓

The following files have been updated to use environment-aware Razorpay keys:

1. **`src/services/paymentService.js`** - Payment service with test/live key switching
2. **`src/screens/bag.js`** - Checkout screen with environment-aware key selection
3. **Environment files** - Test and live keys configured

### Key Selection Logic

```javascript
// Priority order:
1. Environment variable (Config.RAZORPAY_KEY_ID from .env files)
2. Auto-detect: __DEV__ ? TEST_KEY : LIVE_KEY
```

---

## 📁 Environment Files Updated

### `.env.development` (For local development)
```env
RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
```

### `.env.production` (For production builds)
```env
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe
```

### `.env` (Default fallback)
```env
RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
```

---

## 🧪 Testing Configuration

### Step 1: Verify Current Mode

After building the app, check the console logs:

```
🔑 Razorpay Config: {
  mode: 'TEST',
  fromEnv: true,
  key: 'rzp_test_9WNhUijdgxSon5'
}
```

**What this means:**
- `mode: 'TEST'` → Running in development mode
- `fromEnv: true` → Key loaded from `.env.development`
- `key: 'rzp_test_...'` → Using test key ✅

### Step 2: Test Payment with Test Card

Use these test card details:

```
Card Number: 4111 1111 1111 1111
Expiry:      12/28
CVV:         123
Name:        Test User
```

### Step 3: Expected Behavior

✅ **Success Indicators:**
- Razorpay checkout opens
- Test cards work
- "Test Mode" watermark visible
- Payment succeeds
- No real money charged

❌ **Failure Indicators:**
- "Payment Failed - Unexpected Error" → Using wrong key
- Real cards required → Using live key in development
- Payment immediately fails → Key mismatch with backend

---

## 🔧 Backend Configuration

### ⚠️ Important: Backend Must Match Frontend

Your backend must also use **TEST keys** in development:

```javascript
// Backend configuration (example for Node.js/Express)
const RAZORPAY_KEY_ID = process.env.NODE_ENV === 'production'
  ? 'rzp_live_VRU7ggfYLI7DWV'
  : 'rzp_test_9WNhUijdgxSon5';

const RAZORPAY_KEY_SECRET = process.env.NODE_ENV === 'production'
  ? 'giunOIOED3FhjWxW2dZ2peNe'
  : 'YOUR_TEST_SECRET_HERE';
```

### Backend Environment Variables

Create a `.env` file in your backend project:

```env
# Development
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_9WNhUijdgxSon5
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE

# Production (use separate .env.production)
# NODE_ENV=production
# RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
# RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe
```

---

## 🚀 Building the App

### Development Build (Uses Test Keys)

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### Production Build (Uses Live Keys)

```bash
# iOS
npx react-native run-ios --configuration Release

# Android
cd android && ./gradlew assembleRelease
```

---

## 🔍 Troubleshooting

### Issue 1: Still getting "Payment Failed - Unexpected Error"

**Possible Causes:**
1. Backend is using live key while frontend uses test key
2. Backend is not running
3. Backend Razorpay secret key is incorrect

**Solution:**
- Check backend logs
- Verify backend `.env` file has test keys
- Restart backend server after changing keys

### Issue 2: Environment variables not loading

**Solution:**
```bash
# Clean and rebuild
cd ios
pod install
cd ..
npx react-native run-ios

# For Android
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Issue 3: "Key ID does not exist"

**Solution:**
- Verify the test key is correct in `.env.development`
- Log in to Razorpay Dashboard → Settings → API Keys (Test Mode)
- Regenerate test keys if necessary

---

## 📊 Key Comparison

| Aspect | Test Key | Live Key |
|--------|----------|----------|
| Format | `rzp_test_...` | `rzp_live_...` |
| Environment | Development | Production |
| Test Cards | ✅ Work | ❌ Don't work |
| Real Cards | ❌ Don't work | ✅ Work |
| Money Charged | ❌ No | ✅ Yes |
| Watermark | ✅ "Test Mode" | ❌ None |
| Dashboard | Test Mode | Live Mode |

---

## ✅ Verification Checklist

Before testing payments:

- [ ] `.env.development` has test key
- [ ] `.env.production` has live key
- [ ] `paymentService.js` imports `react-native-config`
- [ ] `bag.js` imports `react-native-config`
- [ ] App rebuilt after changing `.env` files
- [ ] Console shows `mode: 'TEST'`
- [ ] Backend also using test key
- [ ] Backend server is running
- [ ] Test card details ready

---

## 🎯 Quick Test Steps

1. **Start backend** (ensure it uses test key)
2. **Run app** in development mode
3. **Add item** to bag
4. **Select/Add** delivery address
5. **Tap Checkout**
6. **Check console** for `mode: 'TEST'`
7. **Enter test card**: `4111 1111 1111 1111`
8. **Complete payment**
9. **Verify success**

---

## 🔐 Security Best Practices

1. ✅ **Never commit** `.env` files with real keys to git
2. ✅ **Use `.env.example`** with placeholder values
3. ✅ **Store secrets** in secure environment variables
4. ✅ **Rotate keys** periodically
5. ✅ **Use test keys** in all development/staging environments
6. ✅ **Limit access** to live keys

---

## 📞 Support & Resources

- **Razorpay Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Razorpay Dashboard**: https://dashboard.razorpay.com/
- **React Native Config**: https://github.com/luggit/react-native-config
- **Your Backend URL**: http://185.193.19.244:8000

---

## 🎉 What's Next

After successful test payment:

1. ✅ Test with different test cards (success, failure, timeout)
2. ✅ Test error handling (network errors, payment cancellation)
3. ✅ Test order creation after payment
4. ✅ Verify payment details in Razorpay test dashboard
5. ✅ Document any issues or edge cases
6. ✅ Prepare for production deployment

---

**Last Updated**: October 14, 2025  
**Status**: ✅ Configured for Test Mode  
**Next Action**: Test payment with test card

