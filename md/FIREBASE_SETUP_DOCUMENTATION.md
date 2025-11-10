# Firebase Setup Documentation

## Overview
This document describes how Firebase is configured and integrated into the Yoraa mobile application. The app uses Firebase for authentication (Phone, Google, Apple Sign-In), push notifications (FCM), and cloud messaging.

---

## Table of Contents
1. [Firebase Project Configuration](#firebase-project-configuration)
2. [Platform-Specific Setup](#platform-specific-setup)
3. [Firebase Services Used](#firebase-services-used)
4. [Implementation Architecture](#implementation-architecture)
5. [Configuration Files](#configuration-files)
6. [Authentication Flow](#authentication-flow)
7. [Push Notifications (FCM)](#push-notifications-fcm)
8. [Dependencies](#dependencies)

---

## Firebase Project Configuration

### Project Details
- **Project ID**: `yoraa-android-ios`
- **Project Name**: Yoraa Android iOS
- **Auth Domain**: `yoraa-android-ios.firebaseapp.com`
- **Storage Bucket**: `yoraa-android-ios.firebasestorage.app`
- **Messaging Sender ID**: `133733122921`
- **API Key**: `AIzaSyCCb_fvorV7-6EKUUGvaM3N4hlw32R0iWs`

### iOS Configuration
- **App ID**: `1:133733122921:ios:e10be6f1d6b5008735b3f8`
- **Bundle ID**: `com.yoraaapparelsprivatelimited.yoraa`
- **Client ID**: `133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92.apps.googleusercontent.com`
- **Reversed Client ID**: `com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92`

### Android Configuration
- **Android Client ID**: `133733122921-6k252j8o0n8ej7iqf03t9ngk2fe5ur85.apps.googleusercontent.com`
- **Package Name**: Uses Gradle configuration

---

## Platform-Specific Setup

### iOS Setup

#### 1. GoogleService-Info.plist
Located at: `ios/YoraaApp/GoogleService-Info.plist`

This file contains all Firebase configuration for iOS:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CLIENT_ID</key>
    <string>133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92.apps.googleusercontent.com</string>
    <key>API_KEY</key>
    <string>AIzaSyCCb_fvorV7-6EKUUGvaM3N4hlw32R0iWs</string>
    <key>PROJECT_ID</key>
    <string>yoraa-android-ios</string>
    <!-- ... other configuration ... -->
</dict>
</plist>
```

#### 2. Info.plist Configuration
Located at: `ios/YoraaApp/Info.plist`

Required URL schemes and permissions for Firebase services.

#### 3. Automatic Initialization
Firebase is automatically initialized on iOS through React Native Firebase's native modules. No manual initialization code is required - the library reads the `GoogleService-Info.plist` file.

### Android Setup

#### 1. google-services.json
Located at: `android/app/google-services.json` (not shown in workspace but required)

This file contains all Firebase configuration for Android.

#### 2. Build.gradle Configuration
Located at: `android/app/build.gradle`

```groovy
apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services"
```

The `com.google.gms.google-services` plugin processes the `google-services.json` file and generates necessary resources.

---

## Firebase Services Used

### 1. Firebase Authentication
- **Phone Authentication**: OTP-based sign-in
- **Google Sign-In**: OAuth integration
- **Apple Sign-In**: Sign in with Apple (iOS)
- **Email/Password**: Traditional authentication (if enabled)

### 2. Firebase Cloud Messaging (FCM)
- **Push Notifications**: Real-time notifications
- **Background Messages**: Silent notifications
- **Foreground Messages**: In-app notifications
- **Token Management**: Device token registration and refresh

### 3. Firebase Analytics (Optional)
- **Analytics Collection**: User behavior tracking
- **Event Logging**: Custom event tracking
- **Crashlytics**: Error and crash reporting

---

## Configuration Files

### 1. Main Firebase Config (`src/Firebase.js/Firebaaseconfig.js`)

```javascript
import { initializeApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCb_fvorV7-6EKUUGvaM3N4hlw32R0iWs",
  authDomain: "yoraa-android-ios.firebaseapp.com",
  projectId: "yoraa-android-ios",
  storageBucket: "yoraa-android-ios.firebasestorage.app",
  messagingSenderId: "133733122921",
  appId: "1:133733122921:ios:e10be6f1d6b5008735b3f8"
};

// Initialize Firebase only if no apps exist
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

// Export auth instance
export { auth };
export default auth;
```

**Note**: This explicit initialization may not be necessary for React Native Firebase, as it auto-initializes from platform-specific config files.

### 2. Simple Firebase Config (`src/firebaseConfig.js`)

```javascript
import auth from '@react-native-firebase/auth';

console.log('Firebase Auth module loaded successfully');

// Export auth instance - Firebase is auto-initialized on iOS/Android
export { auth };
export default auth;
```

This is the preferred approach - relying on automatic initialization.

### 3. Firebase JSON Config (`firebase.json`)

```json
{
  "react-native": {
    "crashlytics_auto_collection_enabled": true,
    "analytics_auto_collection_enabled": true,
    "messaging_auto_init_enabled": true,
    "messaging_android_notification_channel_id": "yoraa-notifications",
    "messaging_ios_auto_register_for_remote_messages": true
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

This file configures Firebase features and behavior at the project level.

---

## Implementation Architecture

### Service Layer Organization

```
src/services/
├── authManager.js          # Main authentication orchestrator
├── firebasePhoneAuth.js    # Phone OTP authentication
├── fcmService.js           # Push notification handling
├── sessionManager.js       # Session state management
├── yoraaBackendAPI.js      # Backend API integration
└── chatService.js          # Chat with Firebase auth
```

### 1. Auth Manager (`src/services/authManager.js`)

**Purpose**: Orchestrates Firebase and backend authentication synchronization.

**Key Features**:
- Listens to Firebase auth state changes
- Synchronizes Firebase auth with backend
- Manages session creation and validation
- Handles auth state transitions
- Implements retry logic for race conditions

**Core Flow**:
```javascript
auth().onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    // Create session
    await sessionManager.createSession(userData, loginMethod);
    
    // Authenticate with backend
    const idToken = await firebaseUser.getIdToken();
    await yoraaAPI.firebaseLogin(idToken);
  } else {
    // Handle sign-out
    await sessionManager.clearSession();
  }
});
```

### 2. Firebase Phone Auth (`src/services/firebasePhoneAuth.js`)

**Purpose**: Handles phone number authentication with OTP verification.

**Key Methods**:
- `sendOTP(phoneNumber)`: Sends OTP to phone number
- `verifyOTP(otp)`: Verifies the OTP code
- Platform-specific handling for iOS and Android

**iOS Behavior**:
- Uses Silent Push (APNS) when available
- Falls back to reCAPTCHA if needed
- Supports test phone numbers in development

**Android Behavior**:
- Uses SMS auto-retrieval
- Automatic OTP detection when possible

### 3. Session Manager (`src/services/sessionManager.js`)

**Purpose**: Manages user session state and persistence.

**Features**:
- Session creation and validation
- Last activity tracking
- Auto-logout on session expiry
- Firebase and backend sync verification
- Session state getters

**Session Data Structure**:
```javascript
{
  isAuthenticated: boolean,
  userId: string,
  email: string,
  phoneNumber: string,
  displayName: string,
  photoURL: string,
  loginMethod: 'phone' | 'google' | 'apple',
  lastActivity: timestamp
}
```

### 4. FCM Service (`src/services/fcmService.js`)

**Purpose**: Manages Firebase Cloud Messaging for push notifications.

**Key Features**:
- FCM token generation and management
- Permission requests (iOS/Android)
- Token registration with backend
- Token refresh handling
- Notification listeners (foreground/background)

**Initialization Flow**:
```javascript
1. Request notification permission
2. Get FCM token from Firebase
3. Register token with backend
4. Setup notification listeners
5. Setup token refresh listener
```

---

## Authentication Flow

### Complete Authentication Lifecycle

```mermaid
graph TD
    A[User Initiates Sign In] --> B{Auth Method?}
    B -->|Phone| C[Firebase Phone Auth]
    B -->|Google| D[Google Sign In]
    B -->|Apple| E[Apple Sign In]
    
    C --> F[Get Firebase ID Token]
    D --> F
    E --> F
    
    F --> G[Auth Manager Detects Change]
    G --> H[Create/Update Session]
    H --> I[Authenticate with Backend]
    I --> J[Register FCM Token]
    J --> K[User Logged In]
```

### Backend Integration

**Firebase Login Endpoint**: `/auth/login/firebase`
```javascript
await yoraaAPI.firebaseLogin(idToken);
```

**Firebase Registration Endpoint**: `/auth/register/firebase`
```javascript
await yoraaAPI.registerWithFirebase(idToken, userData);
```

The backend validates the Firebase ID token and creates/updates user records.

---

## Push Notifications (FCM)

### Setup Process

#### 1. Initialization
```javascript
const fcmService = new FCMService();
await fcmService.initialize();
```

#### 2. Permission Request

**iOS**:
```javascript
const authStatus = await messaging().requestPermission();
```

**Android (API 33+)**:
```javascript
const granted = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
);
```

#### 3. Token Management

**Get Token**:
```javascript
const token = await messaging().getToken();
```

**Register with Backend**:
```javascript
await apiClient.post('/notifications/register', {
  fcmToken: token,
  deviceType: Platform.OS
});
```

**Token Refresh**:
```javascript
messaging().onTokenRefresh(async (newToken) => {
  await updateTokenOnBackend(newToken);
});
```

#### 4. Notification Handling

**Foreground Messages**:
```javascript
messaging().onMessage(async (remoteMessage) => {
  // Handle notification while app is open
});
```

**Background Messages**:
```javascript
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // Handle notification while app is in background
});
```

### Notification Channel (Android)

Channel ID: `yoraa-notifications`

Configured in `firebase.json`:
```json
"messaging_android_notification_channel_id": "yoraa-notifications"
```

---

## Dependencies

### NPM Packages

From `package.json`:

```json
{
  "@react-native-firebase/app": "^23.4.0",
  "@react-native-firebase/auth": "^23.4.0",
  "@react-native-firebase/messaging": "^23.4.0",
  "@react-native-google-signin/google-signin": "^15.0.0",
  "@invertase/react-native-apple-authentication": "^2.4.1"
}
```

### Installation Command

```bash
npm install @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/messaging \
  @react-native-google-signin/google-signin \
  @invertase/react-native-apple-authentication
```

### iOS CocoaPods

After installing npm packages, run:
```bash
cd ios && pod install && cd ..
```

### Android Gradle

Ensure `google-services` plugin is in project-level `build.gradle`:
```groovy
classpath 'com.google.gms:google-services:4.3.15'
```

---

## Key Features & Configuration

### 1. Auto-Initialization

Firebase automatically initializes when the app starts by reading:
- **iOS**: `GoogleService-Info.plist`
- **Android**: `google-services.json`

No manual initialization code is required in most cases.

### 2. Auth State Persistence

Firebase maintains auth state across app restarts through:
- Native keychain (iOS)
- SharedPreferences (Android)

### 3. Token Refresh

Firebase automatically refreshes ID tokens before expiration. Get fresh token:
```javascript
const token = await auth().currentUser.getIdToken(true); // Force refresh
```

### 4. Multi-Provider Support

Users can have multiple auth providers linked to one account:
```javascript
firebaseUser.providerData.forEach(provider => {
  console.log(provider.providerId); // 'google.com', 'phone', etc.
});
```

### 5. Error Handling

Common Firebase auth errors:
- `auth/invalid-phone-number`
- `auth/too-many-requests`
- `auth/network-request-failed`
- `auth/no-current-user`
- `auth/operation-not-allowed`

---

## Environment-Specific Configuration

The app supports multiple environments through React Native Config:

### Development vs Production

Scripts in `package.json`:
```json
{
  "start:dev": "ENVFILE=.env.development react-native start",
  "start:prod": "ENVFILE=.env.production react-native start"
}
```

Firebase configuration remains the same across environments, but backend API endpoints may differ.

---

## Testing & Debugging

### Firebase Console Features

1. **Authentication Tab**: View all authenticated users
2. **Phone Auth**: Configure test phone numbers for development
3. **Cloud Messaging**: Send test notifications
4. **Analytics**: View user engagement metrics

### Test Phone Numbers

For development, add test phone numbers in Firebase Console:
- Authentication → Sign-in method → Phone
- Add test phone numbers with verification codes

Example:
```
Phone: +1 650-555-1234
Code: 123456
```

### Debug Logging

Enable verbose Firebase logging:

**iOS**:
```swift
// Add to AppDelegate.m
[FIRApp configure];
[FIRConfiguration sharedInstance].setLoggerLevel = FIRLoggerLevelDebug;
```

**Android**:
```
adb shell setprop log.tag.FirebaseAuth DEBUG
```

---

## Security Considerations

### 1. API Key Protection

The Firebase API key in configuration files is safe to include in client apps. It identifies your Firebase project but doesn't grant access without authentication.

### 2. Security Rules

Configure Firestore and Storage security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Token Validation

Backend must validate Firebase ID tokens:
```javascript
// Backend (Node.js example)
const admin = require('firebase-admin');
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

### 4. Rate Limiting

Firebase automatically rate-limits phone authentication to prevent abuse.

---

## Troubleshooting

### Common Issues

#### 1. "No Current User" Errors
**Cause**: Race condition during sign-in
**Solution**: Auth Manager implements retry logic with exponential backoff

#### 2. iOS Phone Auth Not Working
**Possible Causes**:
- APNS not configured
- App verification disabled in Firebase Console
- GoogleService-Info.plist outdated

**Solution**: Update GoogleService-Info.plist and configure APNS certificates

#### 3. FCM Token Not Received
**Possible Causes**:
- Permission not granted
- Google services not configured properly
- Network issues

**Solution**: Check permission status and verify configuration files

#### 4. Backend Auth Fails
**Cause**: Firebase token expired or invalid
**Solution**: Get fresh token with `getIdToken(true)`

---

## Maintenance & Updates

### Updating Firebase Configuration

1. Download new config files from Firebase Console
2. Replace existing files:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`
3. Clean and rebuild:
   ```bash
   # iOS
   cd ios && pod install && cd ..
   react-native run-ios
   
   # Android
   cd android && ./gradlew clean && cd ..
   react-native run-android
   ```

### Upgrading Firebase SDK

```bash
npm update @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/messaging
cd ios && pod update && cd ..
```

Check [React Native Firebase Release Notes](https://rnfirebase.io/) for breaking changes.

---

## Additional Resources

- **React Native Firebase Docs**: https://rnfirebase.io/
- **Firebase Console**: https://console.firebase.google.com/
- **Firebase Auth Docs**: https://firebase.google.com/docs/auth
- **FCM Docs**: https://firebase.google.com/docs/cloud-messaging

---

## Summary

Firebase is deeply integrated into the Yoraa app, providing:
- ✅ Multi-provider authentication (Phone, Google, Apple)
- ✅ Secure token-based backend integration
- ✅ Push notifications via FCM
- ✅ Session persistence and management
- ✅ Automatic initialization and token refresh
- ✅ Platform-specific optimizations

The implementation uses a service-oriented architecture with clear separation of concerns, making it maintainable and testable.
