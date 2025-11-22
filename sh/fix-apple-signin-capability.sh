#!/bin/bash

echo "🍎 Apple Sign-In Capability Setup Guide for Yoraa App"
echo "====================================================="
echo ""
echo "This guide will help you enable Apple Sign-In capability in Apple Developer Console"
echo "to resolve the provisioning profile issue."
echo ""

# App details
BUNDLE_ID="com.yoraaapparelsprivatelimited.yoraa"
TEAM_ID="UX6XB9FMNN"

echo "📱 App Details:"
echo "   Bundle ID: $BUNDLE_ID"
echo "   Team ID: $TEAM_ID"
echo ""

echo "🔧 Step-by-Step Instructions:"
echo ""
echo "1. 🌐 Open Apple Developer Console:"
echo "   → Go to: https://developer.apple.com/account/"
echo "   → Sign in with your Apple Developer account"
echo ""

echo "2. 📱 Navigate to App IDs:"
echo "   → Click 'Certificates, Identifiers & Profiles'"
echo "   → Click 'Identifiers' in the left sidebar"
echo "   → Find and click '$BUNDLE_ID'"
echo ""

echo "3. 🔐 Enable Apple Sign-In Capability:"
echo "   → In the 'Capabilities' section, find 'Sign In with Apple'"
echo "   → Check the checkbox next to 'Sign In with Apple'"
echo "   → Choose configuration (usually 'Enable as a primary App ID')"
echo "   → Click 'Save' at the top right"
echo ""

echo "4. 📋 Update Provisioning Profile:"
echo "   → Go to 'Profiles' in the left sidebar"
echo "   → Find your App Store provisioning profile for '$BUNDLE_ID'"
echo "   → Click on it and then click 'Edit'"
echo "   → The profile should now include 'Sign In with Apple' capability"
echo "   → Click 'Generate' to create new profile"
echo "   → Download the new provisioning profile"
echo ""

echo "5. 🔄 Update Xcode:"
echo "   → Open Xcode"
echo "   → Go to Xcode → Preferences → Accounts"
echo "   → Select your Apple ID and click 'Download Manual Profiles'"
echo "   → Or let Xcode automatically manage signing"
echo ""

echo "6. ✅ Verify Setup:"
echo "   → Open your project in Xcode"
echo "   → Go to Project Settings → YoraaApp target → Signing & Capabilities"
echo "   → Ensure 'Sign In with Apple' capability is listed"
echo "   → Check that provisioning profile is updated"
echo ""

echo "🚀 Alternative: Quick Auto-Fix (if you have developer access):"
echo ""
echo "If you have access to the Apple Developer account, you can also:"
echo "• Use Xcode's automatic signing to handle this"
echo "• Or temporarily disable Apple Sign-In in code if not immediately needed"
echo ""

echo "💡 After completing these steps, run the build script again:"
echo "   ./build-ios-production-smart.sh"
echo ""

# Check if we can provide more specific guidance
echo "🔍 Current Project Status:"
echo ""

# Check entitlements
if [ -f "ios/YoraaApp/YoraaAppRelease.entitlements" ]; then
    echo "✅ Apple Sign-In entitlements found in project"
    if grep -q "com.apple.developer.applesignin" ios/YoraaApp/YoraaAppRelease.entitlements; then
        echo "✅ Apple Sign-In capability is configured in entitlements"
    fi
else
    echo "❌ Entitlements file not found"
fi

# Check if RNAppleAuthentication is installed
if [ -d "node_modules/@invertase/react-native-apple-authentication" ]; then
    echo "✅ Apple Authentication library is installed"
else
    echo "❌ Apple Authentication library not found"
fi

# Check if Apple Sign-In is used in code
if grep -r "appleAuth\|AppleAuthentication\|signInWithApple" src/ >/dev/null 2>&1; then
    echo "✅ Apple Sign-In is actively used in the codebase"
    echo "   → This capability must be enabled in Apple Developer Console"
else
    echo "ℹ️  Apple Sign-In usage not detected in code"
fi

echo ""
echo "📞 Need Help?"
echo "• Apple Developer Support: https://developer.apple.com/support/"
echo "• Apple Sign-In Documentation: https://developer.apple.com/sign-in-with-apple/"
echo ""

# Offer to open relevant URLs
read -p "🌐 Would you like to open Apple Developer Console? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://developer.apple.com/account/resources/identifiers/list"
    echo "🌐 Opened Apple Developer Console in your browser"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Complete the Apple Developer Console setup above"
echo "2. Run: ./build-ios-production-smart.sh"
echo "3. Your iOS app will be ready for App Store submission!"
echo ""
