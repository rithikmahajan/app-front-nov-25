#!/bin/bash

# Razorpay iOS Diagnostic Script
# Run this to check if Razorpay is properly configured

echo "🔍 Razorpay iOS Configuration Diagnostic"
echo "========================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check package installation
echo "1️⃣ Checking npm package..."
if npm list react-native-razorpay --depth=0 2>/dev/null | grep -q "react-native-razorpay"; then
    VERSION=$(npm list react-native-razorpay --depth=0 2>/dev/null | grep react-native-razorpay | awk '{print $2}')
    echo "   ✅ react-native-razorpay is installed: $VERSION"
else
    echo "   ❌ react-native-razorpay is NOT installed"
    echo "   Run: npm install react-native-razorpay"
    exit 1
fi
echo ""

# Check iOS Pods
echo "2️⃣ Checking iOS Pods..."
if [ -d "ios/Pods" ]; then
    echo "   ✅ Pods directory exists"
    
    if [ -d "ios/Pods/razorpay-pod" ]; then
        echo "   ✅ razorpay-pod is installed"
        
        # Check for framework
        if [ -d "ios/Pods/razorpay-pod/Razorpay.framework" ] || [ -d "ios/Pods/razorpay-pod/Razorpay.xcframework" ]; then
            echo "   ✅ Razorpay framework found"
        else
            echo "   ⚠️  Framework not found in expected location"
            echo "      Checking contents of razorpay-pod:"
            ls -la ios/Pods/razorpay-pod/ 2>/dev/null | head -10
        fi
    else
        echo "   ❌ razorpay-pod NOT found in Pods"
        echo "   Run: cd ios && pod install"
    fi
else
    echo "   ❌ Pods directory not found"
    echo "   Run: cd ios && pod install"
fi
echo ""

# Check Podfile
echo "3️⃣ Checking Podfile..."
if [ -f "ios/Podfile" ]; then
    echo "   ✅ Podfile exists"
    
    # Check for auto-linking or manual entry
    if grep -q "react-native-razorpay" ios/Podfile; then
        echo "   ✅ react-native-razorpay found in Podfile"
    else
        echo "   ℹ️  react-native-razorpay not explicitly in Podfile (may be auto-linked)"
    fi
else
    echo "   ❌ Podfile not found"
fi
echo ""

# Check Xcode workspace
echo "4️⃣ Checking Xcode workspace..."
if [ -d "ios/YoraaApp.xcworkspace" ]; then
    echo "   ✅ YoraaApp.xcworkspace exists"
else
    echo "   ⚠️  YoraaApp.xcworkspace not found"
    echo "      Looking for other .xcworkspace files:"
    find ios -name "*.xcworkspace" -maxdepth 1
fi
echo ""

# Check Info.plist
echo "5️⃣ Checking Info.plist..."
INFO_PLIST="ios/YoraaApp/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    echo "   ✅ Info.plist found"
    
    # Check for URL schemes
    if grep -q "CFBundleURLSchemes" "$INFO_PLIST"; then
        echo "   ✅ URL Schemes configured"
    else
        echo "   ⚠️  No URL Schemes found"
    fi
else
    echo "   ❌ Info.plist not found at expected location"
fi
echo ""

# Check paymentService.js
echo "6️⃣ Checking payment service implementation..."
PAYMENT_SERVICE="src/services/paymentService.js"
if [ -f "$PAYMENT_SERVICE" ]; then
    echo "   ✅ paymentService.js exists"
    
    if grep -q "import RazorpayCheckout from 'react-native-razorpay'" "$PAYMENT_SERVICE"; then
        echo "   ✅ RazorpayCheckout import found"
    else
        echo "   ❌ RazorpayCheckout import NOT found"
    fi
    
    if grep -q "RazorpayCheckout.open" "$PAYMENT_SERVICE"; then
        echo "   ✅ RazorpayCheckout.open() usage found"
    else
        echo "   ❌ RazorpayCheckout.open() NOT found"
    fi
else
    echo "   ❌ paymentService.js not found"
fi
echo ""

# Summary
echo "========================================"
echo "📊 Diagnostic Summary"
echo "========================================"
echo ""

# Collect results
ISSUES=0

if ! npm list react-native-razorpay --depth=0 2>/dev/null | grep -q "react-native-razorpay"; then
    ISSUES=$((ISSUES+1))
fi

if [ ! -d "ios/Pods/razorpay-pod" ]; then
    ISSUES=$((ISSUES+1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All basic checks passed!"
    echo ""
    echo "🔍 Next Steps:"
    echo "   1. Press ⌘R in iOS Simulator to reload the app"
    echo "   2. Try making a payment"
    echo "   3. Check console for detailed error information"
    echo ""
    echo "📖 If payment still fails, check:"
    echo "   - Xcode: Frameworks must be 'Embed & Sign'"
    echo "   - Xcode: Build Settings → Always Embed Swift Standard Libraries = YES"
    echo "   - Xcode Console for native errors"
    echo ""
    echo "📄 See RAZORPAY_TROUBLESHOOTING.md for detailed fixes"
else
    echo "⚠️  Found $ISSUES issue(s) that need attention"
    echo ""
    echo "🔧 Recommended Actions:"
    
    if ! npm list react-native-razorpay --depth=0 2>/dev/null | grep -q "react-native-razorpay"; then
        echo "   1. npm install react-native-razorpay"
    fi
    
    if [ ! -d "ios/Pods/razorpay-pod" ]; then
        echo "   2. cd ios && pod install && cd .."
    fi
    
    echo "   3. npx react-native run-ios"
fi
echo ""
