# Phone Authentication Fix - Production APK Issues

## Date: November 21, 2024

## Issues Identified

Based on the screenshots provided, there are **3 critical issues** affecting phone authentication in the production APK:

### Issue 1: Browser SessionStorage Error (Screenshot 1)
**Error Message**: "Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared."

**Root Cause**: This is a Google OAuth/Sign-In related error that occurs when:
- The app tries to use Google Sign-In
- Browser session storage is not accessible
- Using signInWithRedirect in a partitioned storage environment

### Issue 2: Firebase Authentication Not Authorized (Screenshot 2)
**Error Message**: `[auth/app-not-authorized] This app is not authorized to use Firebase Authentication. Please verify that the correct package name, SHA-1, and SHA-256 are configured in the Firebase Console.`

**Root Cause**: 
- **CRITICAL**: The production APK's SHA-256 certificate is **NOT** registered in Firebase Console
- When you build a release APK, Google Play App Signing generates a **different** certificate
- This new certificate's SHA-256 fingerprint must be added to Firebase Console

**Impact**: Phone authentication completely fails in production APK builds

### Issue 3: No Verification Session Found (Screenshot 3)
**Error Message**: "No verification session found. Please request a new OTP."

**Root Cause**:
- The confirmation object from Firebase is being lost during navigation between screens
- React Native navigation doesn't preserve complex objects in route params
- The `confirmation` object gets garbage collected or loses its methods

---

## Solutions Implemented

### Fix 1: Confirmation Object Persistence

**File**: `src/screens/loginaccountmobilenumberverificationcode.js`

**Changes Made**:

1. **Added `confirmationRef` to prevent loss during re-renders**:
```javascript
const confirmationRef = useRef(null);

useEffect(() => {
  if (route.params.confirmation) {
    setConfirmation(route.params.confirmation);
    confirmationRef.current = route.params.confirmation; // Store in ref too
  }
}, [route?.params]);
```

2. **Use ref as fallback in handleVerification**:
```javascript
const activeConfirmation = confirmation || confirmationRef.current;

if (!activeConfirmation) {
  Alert.alert(
    'Error',
    'No verification session found. Please request a new OTP.',
    [
      {
        text: 'Request New OTP',
        onPress: () => navigation.goBack()
      }
    ]
  );
  return;
}

// Use activeConfirmation instead of confirmation
const verificationResult = await activeConfirmation.confirm(code);
```

### Fix 2: Navigation Timing Issue

**File**: `src/screens/loginaccountmobilenumber.js`

**Changes Made**:

1. **Navigate immediately without Alert to prevent state loss**:
```javascript
// ✅ Navigate immediately
if (navigation) {
  navigation.navigate('LoginAccountMobileNumberVerificationCode', {
    phoneNumber: formattedPhoneNumber,
    verificationId: result.confirmation.verificationId,
    confirmation: result.confirmation,
    countryCode: selectedCountry.code,
    mobileNumber: mobileNumber,
    fromCheckout: route?.params?.fromCheckout,
    fromReview: route?.params?.fromReview,
    reviewData: route?.params?.reviewData
  });
  
  // Show success message after navigation (delayed)
  setTimeout(() => {
    Alert.alert('OTP Sent', 'A verification code has been sent...');
  }, 500);
}
```

2. **Added specific error handling for auth/app-not-authorized**:
```javascript
if (result.errorCode === 'auth/app-not-authorized') {
  Alert.alert(
    'Authentication Error',
    'This app is not authorized to use Firebase Authentication.\n\n' +
    'This is usually caused by:\n' +
    '• Missing or incorrect SHA-256 certificate in Firebase Console\n' +
    '• Outdated google-services.json file\n\n' +
    'Please contact support or try again later.',
    [{ text: 'OK' }]
  );
  return;
}
```

---

## CRITICAL: Production APK SHA-256 Certificate Setup

### Problem
When you build a **release APK** or upload to **Google Play Console**, Google Play App Signing creates a **NEW certificate** different from your debug/local certificate.

### Solution Steps

#### Step 1: Get Production SHA-256 Certificate

**Option A: From Google Play Console (Recommended)**
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to: **Release** → **Setup** → **App signing**
4. Find **App signing key certificate**
5. Copy the **SHA-256 certificate fingerprint**

**Option B: From Uploaded APK**
```bash
# If you have the release APK
keytool -printcert -jarfile app-release.apk
```

**Option C: Using existing script**
```bash
# Run the script in your project
./get-production-sha-certificates.sh
```

#### Step 2: Add SHA-256 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (⚙️ icon)
4. Select **Your apps** tab
5. Find your Android app
6. Scroll to **SHA certificate fingerprints**
7. Click **Add fingerprint**
8. Paste the **SHA-256** from Step 1
9. Click **Save**

#### Step 3: Download Updated google-services.json

1. In Firebase Console, after adding SHA-256
2. Click on your Android app
3. Click **Download google-services.json**
4. Replace the file in: `android/app/google-services.json`
5. Commit the updated file

#### Step 4: Rebuild Production APK

```bash
cd android
./gradlew clean
./gradlew assembleRelease

# Or use your build script
cd ..
./build-android-production.sh
```

---

## Testing Checklist

### Before Release
- [ ] Added production SHA-256 to Firebase Console
- [ ] Downloaded and replaced google-services.json
- [ ] Rebuilt production APK
- [ ] Tested phone auth on real device with production APK
- [ ] Verified OTP is received
- [ ] Verified OTP verification works
- [ ] Confirmed no "app-not-authorized" error
- [ ] Confirmed no "no verification session" error

### During Testing
1. Install production APK on real device
2. Enable airplane mode → disable (to reset network)
3. Clear app data
4. Try phone login
5. Check if OTP arrives (wait up to 30 seconds)
6. Enter OTP
7. Verify successful login

---

## Additional Notes

### Why This Happens
- **Debug builds**: Use your local keystore (debug.keystore)
- **Release builds uploaded to Play Store**: Use Google Play App Signing
- **Different keystores** = **Different SHA certificates**
- Firebase needs **ALL certificates** that will be used

### SHA-1 vs SHA-256
- **SHA-1**: Legacy, required for some older Firebase features
- **SHA-256**: Modern, required for Phone Authentication in production
- **Both should be added** to Firebase Console for maximum compatibility

### sessionStorage Error (Screenshot 1)
This error is separate from phone auth and relates to Google Sign-In. If using Google Sign-In:
1. Ensure Web Client ID is correctly configured
2. Check if google-services.json includes web client credentials
3. Verify OAuth consent screen is properly configured

---

## Quick Reference Commands

```bash
# Get debug SHA-1 and SHA-256
./get-debug-keystore-sha1.sh

# Get production/release SHA-1 and SHA-256
./get-production-sha-certificates.sh

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease

# Install on device for testing
adb install app/build/outputs/apk/release/app-release.apk
```

---

## Files Modified

1. `src/screens/loginaccountmobilenumber.js`
   - Fixed navigation timing to prevent confirmation object loss
   - Added specific auth/app-not-authorized error handling
   - Navigate immediately, show alert after

2. `src/screens/loginaccountmobilenumberverificationcode.js`
   - Added confirmationRef to persist object across re-renders
   - Use ref as fallback when state is lost
   - Better error handling with actionable options

3. `PHONE_AUTH_FIX_NOV21.md` (this file)
   - Complete documentation of issues and fixes
   - Step-by-step SHA-256 setup guide
   - Testing checklist

---

## Support Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/android/phone-auth)
- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [SHA Certificate Fingerprints](https://developers.google.com/android/guides/client-auth)

---

**Last Updated**: November 21, 2024
**Status**: ✅ Code fixes applied, ⚠️ SHA-256 certificate setup required
