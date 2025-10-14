# 🔥 Firebase Setup - Complete Guide for YORAA App

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [iOS Configuration](#ios-configuration)
5. [Android Configuration](#android-configuration)
6. [Firebase Console Setup](#firebase-console-setup)
7. [Code Implementation](#code-implementation)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide provides complete Firebase setup for the YORAA React Native app, including:
- **Firebase Authentication** (Phone, Google, Apple Sign-In)
- **Firebase Cloud Messaging** (Push Notifications)
- **Firebase App Check** (Security)
- **reCAPTCHA Enterprise** (Phone Auth Verification)

**Current Firebase SDK Version:** `@react-native-firebase/app@23.4.0`

---

## 📦 Prerequisites

Before starting, ensure you have:
- ✅ Node.js >= 18
- ✅ React Native 0.80.2
- ✅ Xcode (for iOS)
- ✅ CocoaPods installed
- ✅ Firebase Project created in [Firebase Console](https://console.firebase.google.com)
- ✅ Apple Developer Account (for iOS)
- ✅ Google Cloud Project (for reCAPTCHA)

---

## 📥 Installation

### Step 1: Install Firebase NPM Packages

```bash
# Core Firebase package
npm install @react-native-firebase/app@^23.4.0

# Firebase Authentication
npm install @react-native-firebase/auth@^23.4.0

# Firebase Cloud Messaging (Push Notifications)
npm install @react-native-firebase/messaging@^23.4.0

# Install dependencies
npm install
```

### Step 2: Install Additional Auth Providers

```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin@^15.0.0

# Apple Authentication
npm install @invertase/react-native-apple-authentication@^2.4.1
```

---

## 🍎 iOS Configuration

### Step 1: Install CocoaPods Dependencies

```bash
cd ios
pod install --repo-update
cd ..
```

### Step 2: Podfile Configuration

Your `ios/Podfile` should include:

```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
def node_require(script)
  require Pod::Executable.execute_command('node', ['-p',
    "require.resolve(
      '#{script}',
      {paths: [process.argv[1]]},
    )", __dir__]).strip
end

node_require('react-native/scripts/react_native_pods.rb')
node_require('react-native-permissions/scripts/setup.rb')

project 'Yoraa.xcodeproj'

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Setup permissions for react-native-permissions
setup_permissions([
  'Camera',
  'Microphone',
  'SpeechRecognition',
])

# Firebase iOS SDK v9+ requires use_frameworks with static linkage
use_frameworks! :linkage => :static

# Enable Static Frameworks for Firebase
$RNFirebaseAsStaticFramework = true

# Enable modular headers for Firebase compatibility
use_modular_headers!

target 'YoraaApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Firebase App Check for phone authentication
  pod 'FirebaseAppCheck'
  
  # Google reCAPTCHA Enterprise for phone authentication
  pod 'RecaptchaEnterprise'

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )

    # Fix for Xcode 15 compatibility
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      end
    end
  end
end
```

### Step 3: Download GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** > **General**
4. Under **Your apps**, select your iOS app
5. Click **Download GoogleService-Info.plist**
6. Copy the file to: `ios/YoraaApp/GoogleService-Info.plist`

**Important:** Add this file to Xcode:
- Open `ios/Yoraa.xcworkspace` in Xcode
- Right-click on `YoraaApp` folder
- Select **Add Files to "YoraaApp"...**
- Choose `GoogleService-Info.plist`
- Ensure **Copy items if needed** is checked
- Ensure **Add to targets: YoraaApp** is checked

### Step 4: Info.plist Configuration

Your `ios/YoraaApp/Info.plist` should include:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Bundle Configuration -->
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>YORAA</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(MARKETING_VERSION)</string>
    <key>CFBundleVersion</key>
    <string>10</string>

    <!-- URL Schemes for Firebase and OAuth -->
    <key>CFBundleURLTypes</key>
    <array>
        <!-- Google Sign-In -->
        <dict>
            <key>CFBundleURLName</key>
            <string>com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92</string>
            </array>
        </dict>
        <!-- App Bundle ID Scheme -->
        <dict>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>CFBundleURLName</key>
            <string>YoraaAppBundleID</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>com.yoraaapparelsprivatelimited.yoraa</string>
            </array>
        </dict>
        <!-- Firebase Phone Auth -->
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
    </array>

    <!-- App Transport Security -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>

    <!-- Permissions -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs access to camera to allow you to take photos for feedback</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app uses your location to check if your pin code is serviceable</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs access to microphone to enable voice search functionality</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>This app needs access to photo library to save photos</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs access to photo library to allow you to select photos for feedback</string>

    <!-- Background Modes for Push Notifications -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
        <string>voip</string>
        <string>fetch</string>
        <string>processing</string>
    </array>

    <!-- React Native Configuration -->
    <key>RCTNewArchEnabled</key>
    <true/>
    
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
```

### Step 5: AppDelegate.swift Configuration

Your `ios/YoraaApp/AppDelegate.swift` should include:

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseAppCheck
import UserNotifications
import AuthenticationServices

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // ==========================================
    // STEP 1: Configure App Check (Security)
    // ==========================================
    // Must be configured BEFORE Firebase.configure()
    #if DEBUG
    let providerFactory = AppCheckDebugProviderFactory()
    print("🔐 Firebase App Check: Using DEBUG provider")
    #else
    let providerFactory = DeviceCheckProviderFactory()
    print("🔐 Firebase App Check: Using PRODUCTION DeviceCheck provider")
    #endif
    AppCheck.setAppCheckProviderFactory(providerFactory)
    
    // ==========================================
    // STEP 2: Initialize Firebase
    // ==========================================
    FirebaseApp.configure()
    print("🔥 Firebase initialized successfully")
    
    // ==========================================
    // STEP 3: Configure Firebase Auth Settings
    // ==========================================
    #if DEBUG
    // Disable app verification for testing (uses test phone numbers only)
    Auth.auth().settings?.isAppVerificationDisabledForTesting = true
    print("📱 Firebase Auth: App verification DISABLED for testing")
    #endif
    
    // ==========================================
    // STEP 4: Configure Push Notifications for Firebase Auth
    // ==========================================
    // Firebase uses APNS for silent phone auth verification
    UNUserNotificationCenter.current().delegate = self
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: { granted, error in
        if granted {
          print("✅ Push notification permissions granted")
        } else {
          print("❌ Push notification permissions denied")
        }
      })
    application.registerForRemoteNotifications()
    
    // ==========================================
    // STEP 5: Initialize React Native
    // ==========================================
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "YoraaApp",
      in: window,
      launchOptions: launchOptions
    )

    print("✅ App launched successfully")
    return true
  }
  
  // ==========================================
  // MARK: - Push Notifications for Firebase Auth
  // ==========================================
  
  /// Called when device successfully registers for remote notifications
  func application(_ application: UIApplication, 
                   didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // Provide APNS token to Firebase Auth for silent push verification
    Auth.auth().setAPNSToken(deviceToken, type: .unknown)
    print("✅ APNS token registered with Firebase Auth")
  }
  
  /// Called when device fails to register for remote notifications
  func application(_ application: UIApplication, 
                   didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("❌ Failed to register for remote notifications: \(error.localizedDescription)")
  }
  
  /// Called when app receives a remote notification
  func application(_ application: UIApplication, 
                   didReceiveRemoteNotification notification: [AnyHashable : Any], 
                   fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    // Check if notification is for Firebase Auth
    if Auth.auth().canHandleNotification(notification) {
      completionHandler(.noData)
      return
    }
    // Handle other notifications if needed
    completionHandler(.noData)
  }
  
  // ==========================================
  // MARK: - URL Scheme Handling for Firebase Auth
  // ==========================================
  
  /// Called when app opens via URL scheme (e.g., OAuth redirects)
  func application(_ application: UIApplication, 
                   open url: URL, 
                   options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Check if URL is for Firebase Auth (reCAPTCHA, OAuth, etc.)
    if Auth.auth().canHandle(url) {
      print("✅ URL handled by Firebase Auth: \(url)")
      return true
    }
    // Handle other URL schemes if needed
    print("ℹ️ URL not handled by Firebase Auth: \(url)")
    return false
  }
}

// ==========================================
// MARK: - React Native Delegate
// ==========================================
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
```

### Step 6: Enable Capabilities in Xcode

1. Open `ios/Yoraa.xcworkspace` in Xcode
2. Select your project in the navigator
3. Select **YoraaApp** target
4. Go to **Signing & Capabilities** tab
5. Enable the following capabilities:

#### Push Notifications
- Click **+ Capability**
- Add **Push Notifications**

#### Background Modes
- Click **+ Capability**
- Add **Background Modes**
- Check:
  - ✅ Remote notifications
  - ✅ Background fetch
  - ✅ Background processing

#### Sign in with Apple
- Click **+ Capability**
- Add **Sign in with Apple**

---

## 🤖 Android Configuration

### Step 1: Download google-services.json

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** > **General**
4. Under **Your apps**, select your Android app
5. Click **Download google-services.json**
6. Copy the file to: `android/app/google-services.json`

### Step 2: Project-level build.gradle

File: `android/build.gradle`

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        
        // Firebase services plugin
        classpath("com.google.gms:google-services:4.4.0")
    }
}
```

### Step 3: App-level build.gradle

File: `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// Apply Google services plugin (MUST be at the bottom)
apply plugin: "com.google.gms.google-services"

android {
    namespace "com.yoraaapparelsprivatelimited.yoraa"
    compileSdk rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.yoraaapparelsprivatelimited.yoraa"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 10
        versionName "1.0.0"
        
        // Required for Firebase
        multiDexEnabled true
    }
    
    signingConfigs {
        release {
            // Add your release signing config here
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    
    // Firebase BOM (manages versions)
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    
    // Firebase dependencies (versions managed by BOM)
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-appcheck'
    
    // Google Play Services
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    
    // Other dependencies
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

### Step 4: AndroidManifest.xml

File: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Firebase Cloud Messaging -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- Firebase Cloud Messaging Service -->
        <service
            android:name="com.google.firebase.messaging.FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

### Step 5: MainApplication Configuration

File: `android/app/src/main/java/com/yourapp/MainApplication.kt`

```kotlin
package com.yoraaapparelsprivatelimited.yoraa

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.google.firebase.FirebaseApp

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Add additional packages here if needed
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }
}
```

---

## 🔧 Firebase Console Setup

### Step 1: Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the following providers:

#### Phone Authentication
- Click on **Phone**
- Toggle **Enable**
- Add test phone numbers (for testing):
  - Example: `+919876543210` with code `123456`
- Click **Save**

#### Google Sign-In
- Click on **Google**
- Toggle **Enable**
- Add **Support email**
- Download config files again after enabling

#### Apple Sign-In
- Click on **Apple**
- Toggle **Enable**
- Add your **Services ID**
- Click **Save**

### Step 2: Configure App Check

1. Navigate to **App Check** in Firebase Console
2. Click **Apps** tab
3. For iOS:
   - Select your iOS app
   - Click **Register**
   - Choose **DeviceCheck** provider
   - For testing, add Debug tokens
4. For Android:
   - Select your Android app
   - Click **Register**
   - Choose **Play Integrity** provider
   - Add your app's SHA-256 fingerprint

### Step 3: Get App Check Debug Token (Development Only)

For iOS:
```bash
# Run your app in debug mode
# Check Xcode console for:
# "Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

Add this token in Firebase Console > App Check > Apps > [Your App] > Debug tokens

### Step 4: Configure reCAPTCHA Enterprise (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **reCAPTCHA Enterprise API**
3. Create a reCAPTCHA Enterprise key:
   - Type: **iOS** or **Android**
   - For iOS: Add your Bundle ID
   - For Android: Add your Package Name and SHA-256 cert fingerprint
4. Copy the **reCAPTCHA Site Key**
5. Add to your Firebase project settings

### Step 5: Enable Cloud Messaging

1. Navigate to **Cloud Messaging** in Firebase Console
2. For iOS:
   - Upload your **APNs Authentication Key** (.p8 file)
   - Or upload **APNs Certificate** (.p12 file)
3. For Android:
   - Get your **Server Key** (legacy) or **FCM Registration token**

---

## 💻 Code Implementation

### 1. Firebase Configuration (firebaseConfig.js)

File: `src/firebaseConfig.js`

```javascript
/**
 * Firebase Configuration for React Native
 * 
 * React Native Firebase automatically initializes Firebase using:
 * - GoogleService-Info.plist (iOS)
 * - google-services.json (Android)
 * 
 * No manual configuration needed!
 */

import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

console.log('✅ Firebase modules loaded successfully');

// Export Firebase modules
export { auth, messaging };
export default auth;
```

### 2. Firebase Phone Authentication Service

File: `src/services/firebasePhoneAuth.js`

```javascript
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

class FirebasePhoneAuthService {
  constructor() {
    this.confirmation = null;
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number with country code (e.g., +917006114695)
   * @returns {Promise<object>} - Confirmation object to verify OTP
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 FIREBASE PHONE AUTH - SEND OTP FLOW                  ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📞 Phone Number: ${phoneNumber}`);
      console.log(`📱 Platform: ${Platform.OS}`);

      // Validate phone number format
      console.log('\n🔍 STEP 1: Validating phone number format...');
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        console.error('❌ Validation failed: Phone number must include country code');
        throw new Error('Phone number must include country code (e.g., +91...)');
      }
      console.log('✅ Phone number format valid');

      // Send OTP
      console.log('\n🔄 STEP 2: Sending OTP via Firebase...');
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('✅ OTP sent successfully');
      console.log('📦 Confirmation Object:', {
        verificationId: confirmation.verificationId ? 'EXISTS' : 'MISSING',
        hasConfirm: typeof confirmation.confirm === 'function'
      });
      
      this.confirmation = confirmation;
      console.log(`⏰ End Time: ${new Date().toISOString()}`);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return { success: true, confirmation };
      
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ SEND OTP ERROR                                ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please include country code.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Phone authentication is not enabled. Please contact support.';
      }
      
      console.log('📱 User-Friendly Error:', errorMessage);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code,
        fullError: error.message,
      };
    }
  }

  /**
   * Verify OTP code
   * @param {object} confirmation - Confirmation object from sendOTP
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise<object>} - User credential or error
   */
  async verifyOTP(confirmation, otpCode) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 FIREBASE PHONE AUTH - VERIFY OTP FLOW                ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📝 OTP Code: ${otpCode}`);

      console.log('\n🔍 STEP 1: Validating inputs...');
      if (!confirmation) {
        console.error('❌ No confirmation object found');
        throw new Error('No confirmation object. Please send OTP first.');
      }

      if (!otpCode || otpCode.length !== 6) {
        console.error('❌ Invalid OTP code length:', otpCode?.length);
        throw new Error('OTP must be 6 digits');
      }
      console.log('✅ Inputs validated');

      // Confirm the OTP code
      console.log('\n🔄 STEP 2: Confirming OTP with Firebase...');
      const userCredential = await confirmation.confirm(otpCode);
      
      console.log('✅ OTP verified successfully');
      console.log('👤 User Details:');
      console.log(`   - UID: ${userCredential.user.uid}`);
      console.log(`   - Phone Number: ${userCredential.user.phoneNumber}`);

      // Get Firebase ID token for backend authentication
      console.log('\n🔄 STEP 3: Getting Firebase ID token...');
      const idToken = await userCredential.user.getIdToken();
      console.log(`✅ ID Token obtained: ${idToken.substring(0, 20)}...`);

      console.log(`⏰ End Time: ${new Date().toISOString()}`);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');

      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          phoneNumber: userCredential.user.phoneNumber,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        },
        idToken,
      };
      
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ VERIFY OTP ERROR                              ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      console.log('📱 User-Friendly Error:', errorMessage);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code,
      };
    }
  }

  /**
   * Get current user
   * @returns {object|null} - Current Firebase user or null
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await auth().signOut();
      this.confirmation = null;
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get Firebase ID token for current user
   * @returns {Promise<string>} - Firebase ID token
   */
  async getIdToken() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user signed in');
      }
      const idToken = await currentUser.getIdToken(true); // Force refresh
      return idToken;
    } catch (error) {
      console.error('❌ Failed to get ID token:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FirebasePhoneAuthService();
```

### 3. Firebase Cloud Messaging Service

File: `src/services/firebaseMessaging.js`

```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FirebaseMessagingService {
  constructor() {
    this.fcmToken = null;
  }

  /**
   * Request notification permissions (iOS only)
   */
  async requestPermissions() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permissions granted:', authStatus);
          return true;
        } else {
          console.log('❌ Notification permissions denied');
          return false;
        }
      }
      return true; // Android doesn't require permission request
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken() {
    try {
      // Request permissions first (iOS)
      await this.requestPermissions();

      // Get FCM token
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('✅ FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for token refresh
   */
  onTokenRefresh(callback) {
    return messaging().onTokenRefresh((token) => {
      console.log('🔄 FCM Token refreshed:', token);
      this.fcmToken = token;
      callback(token);
    });
  }

  /**
   * Listen for foreground messages
   */
  onMessage(callback) {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('📬 Foreground message received:', remoteMessage);
      callback(remoteMessage);
    });
  }

  /**
   * Get initial notification (app opened from quit state)
   */
  async getInitialNotification() {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('🚀 App opened from notification:', remoteMessage);
      return remoteMessage;
    }
    return null;
  }

  /**
   * Listen for notification opened app (background state)
   */
  onNotificationOpenedApp(callback) {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 App opened from background notification:', remoteMessage);
      callback(remoteMessage);
    });
  }

  /**
   * Set background message handler
   * NOTE: Must be called outside of application lifecycle
   */
  static setBackgroundMessageHandler(handler) {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📦 Background message received:', remoteMessage);
      handler(remoteMessage);
    });
  }
}

export default new FirebaseMessagingService();
```

### 4. App.js Integration

File: `App.js`

```javascript
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Firebase imports
import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firebaseMessaging from './src/services/firebaseMessaging';

// Your components and providers
import { EnhancedLayout } from './src/components/layout';
import SplashScreen from './src/components/SplashScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Firebase Auth State Observer
  useEffect(() => {
    console.log('🔥 Setting up Firebase Auth state observer...');
    
    const subscriber = auth().onAuthStateChanged((firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'USER SIGNED IN' : 'NO USER');
      
      if (firebaseUser) {
        console.log('👤 Firebase User:', {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          email: firebaseUser.email,
        });
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription
    return subscriber;
  }, []);

  // Initialize Firebase Cloud Messaging
  useEffect(() => {
    console.log('🔔 Initializing Firebase Cloud Messaging...');
    
    // Get FCM token
    firebaseMessaging.getToken().then((token) => {
      if (token) {
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
        // TODO: Send token to your backend
      }
    });

    // Listen for token refresh
    const unsubscribeTokenRefresh = firebaseMessaging.onTokenRefresh((token) => {
      console.log('🔄 FCM Token refreshed');
      // TODO: Send new token to your backend
    });

    // Listen for foreground messages
    const unsubscribeOnMessage = firebaseMessaging.onMessage((message) => {
      console.log('📬 Received foreground notification:', message.notification?.title);
      // TODO: Display notification to user
    });

    // Listen for notification opened app
    const unsubscribeNotificationOpen = firebaseMessaging.onNotificationOpenedApp((message) => {
      console.log('📱 App opened from notification');
      // TODO: Navigate to relevant screen
    });

    // Check if app was opened from a notification
    firebaseMessaging.getInitialNotification().then((message) => {
      if (message) {
        console.log('🚀 App opened from quit state by notification');
        // TODO: Navigate to relevant screen
      }
    });

    // Cleanup
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeNotificationOpen();
    };
  }, []);

  // Show splash screen while initializing
  if (isLoading || initializing) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <EnhancedLayout />
    </GestureHandlerRootView>
  );
}

export default App;
```

### 5. Background Message Handler

File: `index.js`

```javascript
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📦 Background notification received:', remoteMessage);
  
  // TODO: Handle background notification
  // You can store data, update badge, etc.
});

AppRegistry.registerComponent(appName, () => App);
```

---

## 🧪 Testing

### Test Phone Numbers (Development)

Add these in Firebase Console > Authentication > Sign-in method > Phone > Add test phone number:

```
+917006114695 → 123456
+919876543210 → 123456
+911234567890 → 123456
```

### Testing Phone Authentication

```javascript
import firebasePhoneAuth from './src/services/firebasePhoneAuth';

// 1. Send OTP
const sendOTP = async () => {
  const result = await firebasePhoneAuth.sendOTP('+917006114695');
  if (result.success) {
    console.log('✅ OTP sent successfully');
    // Save confirmation for next step
    setConfirmation(result.confirmation);
  } else {
    console.error('❌ Error:', result.error);
  }
};

// 2. Verify OTP
const verifyOTP = async (otpCode) => {
  const result = await firebasePhoneAuth.verifyOTP(confirmation, otpCode);
  if (result.success) {
    console.log('✅ User signed in:', result.user);
    console.log('🔑 ID Token:', result.idToken);
    // Use ID token for backend authentication
  } else {
    console.error('❌ Error:', result.error);
  }
};
```

### Testing Cloud Messaging

1. Get FCM token from console logs
2. Go to Firebase Console > Cloud Messaging
3. Click **Send your first message**
4. Enter notification title and text
5. Click **Send test message**
6. Paste your FCM token
7. Click **Test**

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Phone authentication is not enabled"
**Solution:** Enable Phone authentication in Firebase Console > Authentication > Sign-in method

#### 2. "Invalid phone number"
**Solution:** Ensure phone number includes country code (e.g., `+917006114695`)

#### 3. "Too many requests"
**Solution:** 
- Wait for rate limit to reset
- Use test phone numbers during development
- Enable App Check to prevent abuse

#### 4. "Firebase App Check failed"
**Solution:**
- For iOS DEBUG: Add debug token in Firebase Console
- For iOS PRODUCTION: Ensure DeviceCheck is enabled
- For Android: Ensure Play Integrity is configured

#### 5. "APNS token not set"
**Solution:**
- Ensure Push Notifications capability is enabled in Xcode
- Upload APNs authentication key (.p8) in Firebase Console
- Check that `application.registerForRemoteNotifications()` is called

#### 6. iOS Build Errors
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install --repo-update
cd ..
```

#### 7. Android Build Errors
**Solution:**
```bash
cd android
./gradlew clean
cd ..
```

### Enable Verbose Logging

#### iOS (AppDelegate.swift)
```swift
// Add in application(_:didFinishLaunchingWithOptions:)
FirebaseConfiguration.shared.setLoggerLevel(.debug)
```

#### Android (MainApplication.kt)
```kotlin
// Add in onCreate()
FirebaseApp.initializeApp(this)
FirebaseApp.getInstance().setDataCollectionDefaultEnabled(true)
```

---

## 📚 Additional Resources

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)

---

## ✅ Checklist

### iOS Setup
- [ ] Install Firebase packages via npm
- [ ] Run `pod install` in ios folder
- [ ] Add GoogleService-Info.plist to Xcode project
- [ ] Configure Info.plist with URL schemes
- [ ] Update AppDelegate.swift with Firebase initialization
- [ ] Enable Push Notifications capability
- [ ] Enable Background Modes capability
- [ ] Enable Sign in with Apple capability (if using)
- [ ] Test on physical device (required for phone auth)

### Android Setup
- [ ] Install Firebase packages via npm
- [ ] Add google-services.json to android/app folder
- [ ] Update build.gradle files
- [ ] Configure AndroidManifest.xml
- [ ] Update MainApplication.kt
- [ ] Add Firebase SHA fingerprints in console
- [ ] Test on physical device or emulator

### Firebase Console
- [ ] Enable Phone authentication
- [ ] Enable Google authentication (if using)
- [ ] Enable Apple authentication (if using)
- [ ] Add test phone numbers
- [ ] Configure App Check
- [ ] Add debug tokens (development)
- [ ] Upload APNs certificate/key (iOS)
- [ ] Configure Cloud Messaging

### Code Implementation
- [ ] Create firebaseConfig.js
- [ ] Create firebasePhoneAuth.js service
- [ ] Create firebaseMessaging.js service
- [ ] Integrate Firebase in App.js
- [ ] Set up background message handler in index.js
- [ ] Test phone authentication flow
- [ ] Test push notifications

---

**🎉 Firebase Setup Complete!**

Your YORAA app is now configured with Firebase Authentication and Cloud Messaging. Test thoroughly before deploying to production.
