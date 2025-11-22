# Razorpay Payment Integration Troubleshooting Guide

## Current Issue
Razorpay payment is failing immediately when `RazorpayCheckout.open()` is called on physical iOS device. The error object is not providing detailed information.

## Debugging Steps Completed

### 1. ✅ Package Installation
- `react-native-razorpay` version 2.3.0 is installed
- Razorpay pod is installed in `ios/Pods/razorpay-pod`

### 2. ✅ Configuration Verified
- Using LIVE key: `rzp_live_VRU7ggfYLI7DWV`
- Order ID is valid: `order_RcxYVO8rr5tJXQ`
- Amount is valid: `899` (in paise = ₹8.99)
- All required fields are present

### 3. ✅ Code Implementation
- Import statement is correct
- Error handling has been enhanced
- Module availability check added

## Common iOS Issues with Razorpay

### Issue 1: Native Module Not Linked Properly
**Symptoms:** RazorpayCheckout.open() fails immediately with no error details

**Solution:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Issue 2: Framework Not Embedded
**Check:** 
1. Open `YoraaApp.xcworkspace` in Xcode
2. Go to Target → General → Frameworks, Libraries, and Embedded Content
3. Find `Razorpay.framework`
4. Ensure it's set to "Embed & Sign" (NOT "Do Not Embed")

### Issue 3: Build Phase Missing
**Check:**
1. Open Xcode → YoraaApp target → Build Phases
2. Verify "Embed Frameworks" phase exists
3. Razorpay.framework should be listed there

### Issue 4: Swift Standard Libraries
**Check:**
1. Xcode → Build Settings → Search for "Always Embed Swift Standard Libraries"
2. Should be set to "YES"

### Issue 5: iOS Deployment Target Mismatch
**Check:**
1. Razorpay requires iOS 11.0+
2. Verify in Xcode: Target → General → Deployment Info → iOS Deployment Target
3. Should be iOS 11.0 or higher

## Testing on Physical Device

### Prerequisites for Physical Device Testing:
1. **Valid Apple Developer Account** - Required for device provisioning
2. **Device Provisioning Profile** - Device must be registered
3. **Code Signing** - Proper certificates installed
4. **Network Connection** - Razorpay needs internet to load payment UI

### Device-Specific Checks:
```bash
# Check if app is running in Debug mode
# (Some payment SDKs behave differently in Debug vs Release)

# Try building in Release mode:
npx react-native run-ios --configuration Release --device "Your Device Name"
```

## Enhanced Error Logging

The payment service now includes comprehensive error logging:
- Razorpay SDK error object details
- Error code mapping (0=cancelled, 1=failed, 2=network, 3=timeout)
- All error properties extraction

## Next Steps to Debug

### Step 1: Check Xcode Console
When payment fails, check Xcode console (not Metro console) for native errors:
```bash
# Open Xcode
# Window → Devices and Simulators
# Select your device → View Device Logs
# Look for "Razorpay" or "Payment" related errors
```

### Step 2: Verify Pod Installation
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Step 3: Clean Build
```bash
cd ios
xcodebuild clean
cd ..
rm -rf ios/build
npx react-native run-ios
```

### Step 4: Check Framework Embedding
Run this script to verify Razorpay framework:
```bash
cd ios
ls -la Pods/razorpay-pod/
```

Expected output should show `Razorpay.framework` or `Razorpay.xcframework`

### Step 5: Test with Minimal Options
Create a test function with minimal Razorpay options:
```javascript
const testPayment = async () => {
  try {
    const result = await RazorpayCheckout.open({
      key: 'rzp_live_VRU7ggfYLI7DWV',
      amount: '100', // ₹1
      name: 'Test',
      description: 'Test Payment',
      currency: 'INR',
    });
    console.log('✅ Payment success:', result);
  } catch (error) {
    console.error('❌ Payment error:', error);
    console.error('Error code:', error.code);
    console.error('Error description:', error.description);
  }
};
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 0 | Payment cancelled by user | User intentionally closed payment UI |
| 1 | Payment failed | Card declined, insufficient funds, etc. |
| 2 | Network error | Check internet connection |
| 3 | Payment timeout | Retry payment |

## Razorpay SDK Version Compatibility

Current version: `react-native-razorpay@2.3.0`
- iOS: Razorpay iOS SDK 1.3.x
- React Native: 0.60+ (Auto-linking supported)

## Additional Resources

- [Razorpay React Native Documentation](https://razorpay.com/docs/payment-gateway/react-native-integration/)
- [GitHub Issues](https://github.com/razorpay/react-native-razorpay/issues)
- [iOS Integration Guide](https://razorpay.com/docs/payment-gateway/react-native-integration/standard/#ios)

## Workaround: Try Test Mode First

If live payments are failing, try test mode to isolate the issue:

```javascript
// Use test key temporarily
key: 'rzp_test_xxxxxxxxxxxxxxxx'
```

If test mode works but live mode doesn't:
- Check if live API key is activated on Razorpay dashboard
- Verify business KYC is completed
- Ensure live mode is enabled for your account

## Contact Razorpay Support

If issue persists:
1. Collect Xcode console logs
2. Note exact error code/message
3. Contact Razorpay support: support@razorpay.com
4. Mention: React Native iOS physical device, immediate failure on open()
