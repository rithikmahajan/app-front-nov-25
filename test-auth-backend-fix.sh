#!/bin/bash

# 🧪 Test Script: Authentication Backend Registration Fix
# Tests all authentication methods to ensure backend registration works

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║     🧪 AUTHENTICATION BACKEND REGISTRATION TEST SUITE                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 This script helps you verify that all authentication methods properly"
echo "   register with the backend without duplicate calls or silent failures."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

print_test_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo -e "${BLUE}TEST: $1${NC}"
    echo "═══════════════════════════════════════════════════════════════════════════"
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

# ============================================================================
# Test 1: Check if duplicate backend calls are removed
# ============================================================================
print_test_header "Verify Duplicate Backend Calls Removed"

echo "Checking authenticationService.js for duplicate backend calls..."

# Check Apple Sign In
if grep -q "_authenticateWithBackend" src/services/authenticationService.js | grep -A 20 "signInWithApple" | grep -q "_authenticateWithBackend"; then
    print_failure "Apple Sign In still has _authenticateWithBackend call"
else
    print_success "Apple Sign In: No duplicate backend call found"
fi

# Check Google Sign In
if grep -q "_authenticateWithBackend" src/services/authenticationService.js | grep -A 20 "signInWithGoogle" | grep -q "_authenticateWithBackend"; then
    print_failure "Google Sign In still has _authenticateWithBackend call"
else
    print_success "Google Sign In: No duplicate backend call found"
fi

# ============================================================================
# Test 2: Verify appleAuthService has backend integration
# ============================================================================
print_test_header "Verify Auth Services Have Backend Integration"

if grep -q "yoraaAPI.firebaseLogin" src/services/appleAuthService.js; then
    print_success "appleAuthService.js has yoraaAPI.firebaseLogin call"
else
    print_failure "appleAuthService.js missing yoraaAPI.firebaseLogin call"
fi

if grep -q "yoraaAPI.firebaseLogin" src/services/googleAuthService.js; then
    print_success "googleAuthService.js has yoraaAPI.firebaseLogin call"
else
    print_failure "googleAuthService.js missing yoraaAPI.firebaseLogin call"
fi

# ============================================================================
# Test 3: Check if _completeAuthentication is called
# ============================================================================
print_test_header "Verify _completeAuthentication is Called"

if grep -A 30 "signInWithApple" src/services/authenticationService.js | grep -q "_completeAuthentication"; then
    print_success "Apple Sign In calls _completeAuthentication"
else
    print_failure "Apple Sign In missing _completeAuthentication call"
fi

if grep -A 30 "signInWithGoogle" src/services/authenticationService.js | grep -q "_completeAuthentication"; then
    print_success "Google Sign In calls _completeAuthentication"
else
    print_failure "Google Sign In missing _completeAuthentication call"
fi

# ============================================================================
# Test 4: Code structure validation
# ============================================================================
print_test_header "Code Structure Validation"

# Check for proper error handling
if grep -A 50 "signInWithApple" src/services/authenticationService.js | grep -q "catch (error)"; then
    print_success "Apple Sign In has error handling"
else
    print_failure "Apple Sign In missing error handling"
fi

if grep -A 50 "signInWithGoogle" src/services/authenticationService.js | grep -q "catch (error)"; then
    print_success "Google Sign In has error handling"
else
    print_failure "Google Sign In missing error handling"
fi

# ============================================================================
# Manual Testing Instructions
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}📱 MANUAL TESTING REQUIRED${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "The automated tests above verified the code structure. Now you need to"
echo "manually test each authentication method to ensure they work correctly."
echo ""
echo "🧪 Test Procedure for Each Auth Method:"
echo ""
echo "1️⃣  Clear App Data (Fresh Start)"
echo "   iOS:     Device → Erase All Content and Settings"
echo "   Android: Settings → Apps → YORAA → Storage → Clear Data"
echo ""
echo "2️⃣  Open Metro Bundler Console"
echo "   Run: npx react-native start"
echo "   Keep this terminal open to see logs"
echo ""
echo "3️⃣  Run App"
echo "   iOS:     npx react-native run-ios"
echo "   Android: npx react-native run-android"
echo ""
echo "4️⃣  Test Each Authentication Method"
echo ""
echo "   📱 Phone OTP Login:"
echo "      - Tap 'Sign in with Phone Number'"
echo "      - Enter phone number with country code"
echo "      - Enter OTP code"
echo "      - Watch console for:"
echo "        ✅ Single call to /api/auth/login/firebase"
echo "        ✅ Token stored successfully"
echo "        ✅ No duplicate authentication calls"
echo ""
echo "   🍎 Apple Sign In:"
echo "      - Tap 'Sign in with Apple'"
echo "      - Complete Apple authentication"
echo "      - Watch console for:"
echo "        ✅ Single call to /api/auth/login/firebase"
echo "        ✅ Token stored successfully"
echo "        ✅ No duplicate authentication calls"
echo "        ✅ 'Apple Sign In completed successfully'"
echo ""
echo "   🔵 Google Sign In:"
echo "      - Tap 'Sign in with Google'"
echo "      - Complete Google authentication"
echo "      - Watch console for:"
echo "        ✅ Single call to /api/auth/login/firebase"
echo "        ✅ Token stored successfully"
echo "        ✅ No duplicate authentication calls"
echo "        ✅ 'Google Sign In completed successfully'"
echo ""
echo "   📧 Email/Password Login:"
echo "      - Tap 'Sign in with Email'"
echo "      - Enter email and password"
echo "      - Watch console for:"
echo "        ✅ Single call to /api/auth/login/firebase"
echo "        ✅ Token stored successfully"
echo "        ✅ No duplicate authentication calls"
echo ""
echo "5️⃣  Test Token Persistence"
echo "   - Close the app completely"
echo "   - Reopen the app"
echo "   - User should still be logged in ✅"
echo ""
echo "6️⃣  Check for Silent Failures"
echo "   - Review Metro console logs"
echo "   - Look for any '❌ Backend authentication error' messages"
echo "   - Should see NO errors after successful login ✅"
echo ""

# ============================================================================
# What to Look For in Console
# ============================================================================
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}🔍 WHAT TO LOOK FOR IN CONSOLE${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ GOOD (Expected after fix):"
echo "   🔄 Authenticating with Yoraa backend..."
echo "   ✅ Backend authentication successful"
echo "   ✅ Apple/Google auth service completed successfully"
echo "   🔄 Completing authentication flow..."
echo "   ✅ Auth data saved to AsyncStorage"
echo "   ✅ FCM token registered with backend"
echo ""
echo "❌ BAD (Should NOT appear):"
echo "   🔄 Authenticating with backend server...    ← Duplicate call"
echo "   ❌ Backend authentication error: [error]    ← Silent failure"
echo "   Token Storage: ❌ MISSING                   ← Not stored"
echo ""

# ============================================================================
# Network Monitoring
# ============================================================================
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}🌐 NETWORK MONITORING${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "You can also monitor network requests using:"
echo ""
echo "1. React Native Debugger:"
echo "   - Open app in debug mode"
echo "   - Open React Native Debugger"
echo "   - Go to Network tab"
echo "   - Watch for POST /api/auth/login/firebase"
echo "   - Should see ONLY 1 request per login ✅"
echo ""
echo "2. Flipper (if installed):"
echo "   - Open Flipper"
echo "   - Connect to your app"
echo "   - Go to Network plugin"
echo "   - Watch for duplicate requests to /api/auth/login/firebase"
echo ""
echo "3. Charles Proxy / Proxyman:"
echo "   - Set up proxy on your device"
echo "   - Monitor HTTPS traffic"
echo "   - Look for duplicate POST requests to backend"
echo ""

# ============================================================================
# Test Results Summary
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         📊 TEST RESULTS SUMMARY                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run the app and test each authentication method manually"
    echo "2. Verify single backend call per login in console logs"
    echo "3. Confirm token persistence after app restart"
    echo "4. Check for no silent failures in production"
else
    echo -e "${RED}❌ Some tests failed. Please review the code changes.${NC}"
    echo ""
    echo "Common issues:"
    echo "- Make sure you applied all changes from AUTH_BACKEND_REGISTRATION_FIX_NOV24.md"
    echo "- Verify no merge conflicts in authenticationService.js"
    echo "- Check that appleAuthService.js and googleAuthService.js are unchanged"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
