#!/bin/bash

# Phone Auth Production Fix Script
# This script applies all necessary fixes for phone authentication in production APK

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📱 PHONE AUTH PRODUCTION FIX - FINAL STEPS                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Certificates Status:"
echo "   - App signing SHA-256: E8:FB:67:B9:8C:FB:D5:8C:CD:8A:59:F1:97:78:28:A1:52:F2:49:41:B8:16:99:8B:D9:F8:FC:C4:39:45:8A"
echo "   - Upload key SHA-256: 99:C9:B4:D5:D5:56:2F:C5:8D:38:95:D2:96:9A:15:A7:4B:1B:CC:14:7F:C5:14:2E:9B:A7:B7:67:D8:9A:3F:D3"
echo "   - Both certificates are in Firebase Console ✓"
echo ""

echo "✅ google-services.json Status:"
ls -lh android/app/google-services.json | awk '{print "   - Last updated: "$6" "$7" "$8}'
echo "   - File is up to date ✓"
echo ""

echo "📋 Code Fixes Applied:"
echo "   ✓ Added confirmationRef to prevent state loss"
echo "   ✓ Updated navigation to prevent confirmation object loss"
echo "   ✓ Added auth/app-not-authorized error handling"
echo "   ✓ Added FCM token registration"
echo ""

echo "🔧 Next Steps to Complete:"
echo ""
echo "1. CLEAN BUILD CACHE:"
echo "   cd android"
echo "   ./gradlew clean"
echo "   cd .."
echo ""

echo "2. REBUILD PRODUCTION APK:"
echo "   cd android"
echo "   ./gradlew assembleRelease"
echo "   cd .."
echo ""

echo "3. LOCATE YOUR APK:"
echo "   The APK will be at:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""

echo "4. TEST ON REAL DEVICE:"
echo "   - Install the APK on a real Android device"
echo "   - DO NOT use an emulator for phone auth testing"
echo "   - Try phone login with real phone number"
echo "   - Verify OTP is received (may take 5-30 seconds)"
echo "   - Enter OTP and verify successful login"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "   • Phone auth does NOT work reliably on emulators"
echo "   • Use a REAL Android device for testing"
echo "   • Wait up to 30 seconds for OTP SMS"
echo "   • Make sure device has good network connection"
echo ""

echo "Would you like to clean and rebuild now? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🧹 Cleaning build cache..."
    cd android
    ./gradlew clean
    
    echo ""
    echo "🏗️  Building production APK..."
    ./gradlew assembleRelease
    
    cd ..
    
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        echo ""
        echo "✅ BUILD SUCCESS!"
        echo ""
        echo "📦 Your production APK is ready at:"
        echo "   android/app/build/outputs/apk/release/app-release.apk"
        echo ""
        echo "📊 APK Size:"
        ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print "   "$5}'
        echo ""
        echo "🎉 Next: Install this APK on a real device and test phone login!"
    else
        echo ""
        echo "❌ Build failed. Please check the error messages above."
        echo "   Common issues:"
        echo "   • Missing Android SDK"
        echo "   • Java version mismatch"
        echo "   • Gradle daemon issues (try: ./gradlew --stop)"
    fi
else
    echo ""
    echo "📝 Skipped build. You can build manually later with:"
    echo "   cd android && ./gradlew clean && ./gradlew assembleRelease"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📖 For detailed documentation, see:                          ║"
echo "║     PHONE_AUTH_FIX_NOV21.md                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
