#!/bin/bash

# Phone OTP Login - Quick Test Script
# Tests the authProvider enum fix

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  📱 PHONE OTP LOGIN - QUICK TEST SCRIPT"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you verify the phone OTP login fix.${NC}"
echo ""

# Check if app is running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Verify Code Changes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if the fix is applied
if grep -q "method: 'firebase'" src/services/authenticationService.js; then
    echo -e "${GREEN}✅ Fix applied: method changed to 'firebase'${NC}"
else
    echo -e "${RED}❌ Fix NOT applied: method still using 'phone'${NC}"
    echo "   Please apply the fix from PHONE_AUTH_PROVIDER_ENUM_FIX.md"
    exit 1
fi

if grep -q "yoraaAPI.firebaseLogin" src/services/authenticationService.js; then
    echo -e "${GREEN}✅ Fix applied: using yoraaAPI.firebaseLogin()${NC}"
else
    echo -e "${RED}❌ Fix NOT applied: still using wrong endpoint${NC}"
    echo "   Please apply the fix from PHONE_AUTH_PROVIDER_ENUM_FIX.md"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Manual Testing Instructions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}📱 Test on Simulator/Device:${NC}"
echo ""
echo "1️⃣  Open the app"
echo "2️⃣  Navigate to login screen"
echo "3️⃣  Select 'Sign in with Phone Number'"
echo "4️⃣  Enter phone: +1234567890 (or your test number)"
echo "5️⃣  Tap 'Send OTP'"
echo "6️⃣  Check SMS for OTP code"
echo "7️⃣  Enter the 6-digit OTP"
echo "8️⃣  Submit"
echo ""

echo -e "${GREEN}✅ Expected Result:${NC}"
echo "   • OTP verified successfully"
echo "   • User logged in"
echo "   • Navigate to Home screen"
echo "   • NO 'Authentication Error' alert"
echo ""

echo -e "${RED}❌ If you see this error:${NC}"
echo '   "authProvider: `phone` is not a valid enum value"'
echo "   → The fix was not applied correctly"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Verify Console Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}📋 Look for these logs in Metro/Xcode console:${NC}"
echo ""
echo "  🔄 Confirming OTP with Firebase..."
echo "  ✅ OTP verified successfully"
echo "  👤 Firebase UID: xyz123..."
echo "  🔄 Authenticating with backend server..."
echo "  📋 Auth data: {"
echo "    hasIdToken: true,"
echo -e "    ${GREEN}method: 'firebase',${NC}  ← Should be 'firebase', not 'phone'"
echo "    phoneNumber: '+1234567890'"
echo "  }"
echo "  🔄 Authenticating with Yoraa backend..."
echo "  ✅ Backend authentication successful"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Run the App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Do you want to start the app now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting iOS simulator...${NC}"
    echo ""
    npx react-native run-ios
else
    echo ""
    echo -e "${YELLOW}Skipped app launch.${NC}"
    echo "You can manually run: npx react-native run-ios"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Test Script Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For detailed fix information, see:"
echo "   PHONE_AUTH_PROVIDER_ENUM_FIX.md"
echo ""
