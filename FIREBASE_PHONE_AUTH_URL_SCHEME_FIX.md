# Firebase Phone Auth URL Scheme Fix

## Problem Identified
The app was **crashing with a Fatal Error** when attempting phone authentication:

```
Fatal error: Please register custom URL scheme app-1-133733122921-ios-e10be6f1d6b5008735b3f8 in the app's Info.plist file.
```

**Root Cause:** Firebase Phone Authentication on iOS requires a custom URL scheme to be registered in `Info.plist` for handling authentication callbacks.

## Solution Applied

### 1. Added Custom URL Scheme to Info.plist
Added the Firebase Phone Auth URL scheme to `/ios/YoraaApp/Info.plist`:

```xml
<dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>FirebasePhoneAuth</string>
    <key>CFBundleURLSchemes</key>
    <array>
        <string>app-1-133733122921-ios-e10be6f1d6b5008735b3f8</string>
    </array>
</dict>
```

**Important:** The URL scheme format is: `app-1-{GOOGLE_APP_ID}-ios-{REVERSED_CLIENT_ID}`

Where:
- `GOOGLE_APP_ID`: `133733122921` (from GoogleService-Info.plist)
- `REVERSED_CLIENT_ID`: `e10be6f1d6b5008735b3f8` (from GoogleService-Info.plist)

### 2. Firebase Phone Auth Service
The service at `/src/services/firebasePhoneAuth.js` is already properly implemented using:

```javascript
import auth from '@react-native-firebase/auth';

// Send OTP
const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

// Verify OTP
const userCredential = await confirmation.confirm(otpCode);
```

## How to Find the URL Scheme

If you need to find the URL scheme for a different Firebase project:

1. Open `/ios/YoraaApp/GoogleService-Info.plist`
2. Find these values:
   ```xml
   <key>GOOGLE_APP_ID</key>
   <string>1:133733122921:ios:e10be6f1d6b5008735b3f8</string>
   
   <key>REVERSED_CLIENT_ID</key>
   <string>com.googleusercontent.apps.133733122921-f7mallth51qdmvl984o01s9dae48ptcr</string>
   ```

3. Extract:
   - App number: `133733122921` (from GOOGLE_APP_ID)
   - iOS ID: `e10be6f1d6b5008735b3f8` (from GOOGLE_APP_ID after `:ios:`)

4. Construct URL scheme:
   ```
   app-1-{APP_NUMBER}-ios-{IOS_ID}
   app-1-133733122921-ios-e10be6f1d6b5008735b3f8
   ```

## Testing Instructions

### 1. Rebuild the iOS App
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### 2. Test Phone Authentication

1. **Navigate to Login Screen**
2. **Enter Test Phone Number**: `+917006114695` (or any test number configured in Firebase Console)
3. **Press LOGIN Button** - App should NOT crash
4. **Enter OTP Code**: `123456` (for test numbers)
5. **Verify Success**: User should be authenticated

### 3. Expected Logs

You should see these logs in the console:
```
[FirebasePhoneAuth] Sending OTP to: +917006114695
[FirebasePhoneAuth] iOS: Using signInWithPhoneNumber
[FirebasePhoneAuth] ✅ OTP sent successfully (iOS)
[FirebasePhoneAuth] Verifying OTP: 123456
[FirebasePhoneAuth] ✅ OTP verified successfully
[FirebasePhoneAuth] User UID: xyz123...
```

## Verification Checklist

- [x] Custom URL scheme added to Info.plist
- [x] Multi-factor authentication disabled in Firebase Console
- [x] Test phone numbers configured in Firebase Console
- [x] App verification disabled in DEBUG mode (AppDelegate.swift)
- [x] Firebase Phone Auth service properly implemented
- [ ] iOS app rebuilt with new Info.plist configuration
- [ ] Phone authentication tested successfully

## Additional Configuration (Already Done)

### AppDelegate.swift (DEBUG Mode)
```swift
#if DEBUG
// Disable app verification for testing
Auth.auth().settings?.isAppVerificationDisabledForTesting = true
#endif
```

### Firebase Console Test Phone Numbers
Go to Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing:
- `+91 7006114695` → `123456`
- `+91 9119060487` → `123456`
- `+91 8717000084` → `123456`

## Common Issues and Solutions

### Issue 1: "Custom URL scheme not registered" Error
**Solution:** Add the URL scheme to Info.plist (FIXED in this commit)

### Issue 2: App Crash on signInWithPhoneNumber
**Solution:** 
- Disable multi-factor auth in Firebase Console (DONE)
- Add URL scheme to Info.plist (DONE)
- Use test phone numbers (RECOMMENDED)

### Issue 3: reCAPTCHA Verification Crash
**Solution:** Disable app verification in DEBUG mode (DONE in AppDelegate.swift)

## References

- [React Native Firebase - Phone Auth](https://rnfirebase.io/auth/phone-auth)
- [Firebase iOS Setup - Custom URL Schemes](https://firebase.google.com/docs/auth/ios/phone-auth)
- [React Native Firebase - Installation](https://rnfirebase.io/)

## Next Steps

1. **Rebuild the iOS app** to apply Info.plist changes
2. **Test phone authentication** with the test phone numbers
3. **Monitor logs** for any errors
4. **Remove DEBUG flag** before production deployment

---

**Status:** ✅ URL Scheme Added - Ready for Testing

**Date Fixed:** October 11, 2025

**Firebase Project:** yoraa-android-ios  
**Bundle ID:** com.yoraaapparelsprivatelimited.yoraa  
**URL Scheme:** app-1-133733122921-ios-e10be6f1d6b5008735b3f8
