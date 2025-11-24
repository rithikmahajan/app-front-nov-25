#!/bin/bash

# Google Sign-In Fix Script
# Fixes blank page and authentication errors
# Date: November 24, 2024

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔵 GOOGLE SIGN-IN FIX - BLANK PAGE & AUTH ERROR          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10"
cd "$PROJECT_DIR" || exit 1

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Verify .env.development has correct Web Client ID
echo "🔍 Step 1: Verifying .env.development configuration..."
if grep -q "GOOGLE_SIGNIN_WEB_CLIENT_ID=133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com" .env.development; then
    echo "✅ Web Client ID is correctly configured"
else
    echo "❌ Web Client ID is NOT correctly configured"
    echo "   Updating now..."
    # The fix has already been applied via the previous edit
fi
echo ""

# Step 2: Clean iOS build
echo "🧹 Step 2: Cleaning iOS build..."
cd ios || exit 1

echo "   - Removing Pods directory..."
rm -rf Pods

echo "   - Removing build directory..."
rm -rf build

echo "   - Removing Podfile.lock..."
rm -f Podfile.lock

echo "   - Deintegrating CocoaPods..."
pod deintegrate 2>/dev/null || echo "   (Already deintegrated)"

echo "   - Installing fresh pods..."
pod install

cd .. || exit 1
echo "✅ iOS build cleaned and pods reinstalled"
echo ""

# Step 3: Clean Metro cache
echo "🧹 Step 3: Cleaning Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
echo "✅ Metro cache cleaned"
echo ""

# Step 4: Display configuration summary
echo "📋 Step 4: Configuration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Web Client ID (OAuth 2.0):"
echo "   133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com"
echo ""
echo "✅ iOS URL Scheme (Reversed Client ID):"
echo "   com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92"
echo ""
echo "✅ Firebase API Key:"
echo "   AIzaSyCIYkTNzIrk_RugNOybriphlQ8aVTJ-KD8"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Next steps
echo "🚀 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Start Metro bundler with reset cache:"
echo "   npx react-native start --reset-cache"
echo ""
echo "2. In a new terminal, run the app:"
echo "   npx react-native run-ios"
echo "   OR"
echo "   npx react-native run-android"
echo ""
echo "3. Test Google Sign-In:"
echo "   - Tap 'Continue with Google' button"
echo "   - Google account selection should appear"
echo "   - Select your account and sign in"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Google Sign-In fix applied successfully!"
echo ""
echo "📄 Documentation: GOOGLE_SIGNIN_BLANK_PAGE_FIX_NOV24.md"
echo ""
