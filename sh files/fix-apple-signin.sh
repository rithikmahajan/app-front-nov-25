#!/bin/bash

echo "🍎 Apple Sign-In Configuration Fix Script"
echo "=========================================="
echo ""

# Clean build to ensure entitlements are applied
echo "🧹 Cleaning build files..."
cd ios
rm -rf build DerivedData
cd ..

echo "✅ Cleaned build files"
echo ""

# Check current entitlements
echo "📋 Current entitlements in YoraaApp.entitlements:"
cat ios/YoraaApp/YoraaApp.entitlements
echo ""

# Verify provisioning profiles
echo "🔍 Checking provisioning profiles..."
security cms -D -i "/Users/rithikmahajan/Library/Developer/Xcode/UserData/Provisioning Profiles/a04a0bfe-6e51-48b2-9942-e8f0f0ecadf8.mobileprovision" | grep -A 10 -B 5 "com.apple.developer.applesignin"
echo ""

echo "📱 Steps to fix Apple Sign-In:"
echo "1. ✅ Added Apple Sign-In entitlement to app"
echo "2. 🔄 You need to verify in Apple Developer Console:"
echo "   - Go to Identifiers → App IDs → com.yoraaapparelsprivatelimited.yoraa"
echo "   - Make sure 'Sign in with Apple' capability is ENABLED"
echo "   - If not enabled, enable it and regenerate your provisioning profile"
echo ""

echo "3. 🔄 If you made changes in Apple Developer Console:"
echo "   - Download the new provisioning profile"
echo "   - Install it by double-clicking"
echo "   - Or refresh in Xcode: Preferences → Accounts → Download Manual Profiles"
echo ""

echo "4. 🏗️ Rebuild and install the app:"
echo "   npx react-native run-ios --device \"00008130-001C118A0179001C\""
echo ""

echo "🆘 Alternative: If you don't want Apple Sign-In:"
echo "   - Remove Apple Sign-In code from your React Native app"
echo "   - Or disable it temporarily for testing"
echo ""

echo "Run this command to rebuild:"
echo "npx react-native run-ios --device \"00008130-001C118A0179001C\""
