#!/bin/bash

echo "🔍 Getting SHA-1 Certificates for Google Sign-In Fix..."
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         GOOGLE SIGN-IN SHA-1 CERTIFICATE EXTRACTOR           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Debug keystore
echo "📱 DEBUG KEYSTORE (for development/testing):"
echo "=============================================="
cd android
./gradlew signingReport 2>/dev/null | grep -A 3 "Variant: debug" | grep "SHA1:"
DEBUG_SHA1=$(./gradlew signingReport 2>/dev/null | grep -A 3 "Variant: debug" | grep "SHA1:" | awk '{print $2}')
cd ..
echo ""

if [ ! -z "$DEBUG_SHA1" ]; then
    echo "✅ Debug SHA-1 Found: $DEBUG_SHA1"
else
    echo "⚠️  Could not extract SHA-1 automatically. Running full report..."
    echo ""
    cd android
    ./gradlew signingReport | grep -A 10 "Variant: debug"
    cd ..
fi
echo ""

# Release keystore (if exists)
if [ -f "android/app/upload-keystore.jks" ]; then
    echo "🔐 RELEASE KEYSTORE (for production):"
    echo "=============================================="
    echo "Enter your keystore password when prompted..."
    echo ""
    RELEASE_SHA1=$(keytool -list -v -keystore android/app/upload-keystore.jks -alias upload-key 2>/dev/null | grep "SHA1:" | awk '{print $2}')
    
    if [ ! -z "$RELEASE_SHA1" ]; then
        echo "✅ Release SHA-1: $RELEASE_SHA1"
    else
        echo "⚠️  Could not extract SHA-1. Please run manually:"
        echo "   keytool -list -v -keystore android/app/upload-keystore.jks -alias upload-key"
    fi
    echo ""
else
    echo "ℹ️  No release keystore found (android/app/upload-keystore.jks)"
    echo ""
fi

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    NEXT STEPS TO FIX ERROR                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. 📋 Copy the SHA-1 certificate(s) above"
echo ""
echo "2. 🌐 Go to Firebase Console:"
echo "   https://console.firebase.google.com/"
echo ""
echo "3. ⚙️  Navigate to:"
echo "   Your Project > ⚙️ Settings > Project settings > Your apps"
echo ""
echo "4. 📱 Select your Android app:"
echo "   Package name: com.yoraa"
echo ""
echo "5. ➕ Click 'Add fingerprint' and paste:"
if [ ! -z "$DEBUG_SHA1" ]; then
    echo "   Debug SHA-1:   $DEBUG_SHA1"
fi
if [ ! -z "$RELEASE_SHA1" ]; then
    echo "   Release SHA-1: $RELEASE_SHA1"
fi
echo ""
echo "6. 💾 Download the updated google-services.json"
echo ""
echo "7. 📁 Replace the file at:"
echo "   android/app/google-services.json"
echo ""
echo "8. 🔄 Clean and rebuild your app:"
echo "   cd android && ./gradlew clean"
echo "   cd .. && npx react-native run-android"
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                     ADDITIONAL INFO                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 Read the full guide: GOOGLE_SIGNIN_FIX.md"
echo ""
echo "🔗 Google Sign-In Troubleshooting:"
echo "   https://react-native-google-signin.github.io/docs/troubleshooting"
echo ""
echo "✅ After adding SHA-1 to Firebase, the error will be resolved!"
echo ""
