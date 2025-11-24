#!/bin/bash

# 🔥 Firebase Phone Auth Production Verification Script
# This script checks if all requirements for Firebase Phone Auth in production are met

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🔥 Firebase Phone Auth Production Setup Verification          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Checking Build Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check SafetyNet dependency
if grep -q "play-services-safetynet" android/app/build.gradle; then
    pass "SafetyNet API dependency found in build.gradle"
else
    fail "SafetyNet API dependency MISSING in build.gradle"
    echo "   Add: implementation 'com.google.android.gms:play-services-safetynet:18.1.0'"
fi

# Check Firebase Auth dependency
if grep -q "firebase-auth" android/app/build.gradle; then
    pass "Firebase Auth dependency found"
else
    fail "Firebase Auth dependency MISSING"
fi

# Check google-services.json
if [ -f "android/app/google-services.json" ]; then
    pass "google-services.json exists"
    
    # Check if it's updated recently
    MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d" android/app/google-services.json 2>/dev/null || stat -c "%y" android/app/google-services.json 2>/dev/null | cut -d' ' -f1)
    echo "   Last modified: $MODIFIED"
    
    if [ -z "$MODIFIED" ]; then
        warn "Could not determine google-services.json modification date"
    fi
else
    fail "google-services.json NOT FOUND"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Checking Code Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if app verification is properly configured
if grep -q "appVerificationDisabledForTesting" src/services/authenticationService.js; then
    pass "App verification configuration found in authenticationService.js"
else
    warn "App verification configuration might be missing"
fi

# Check Firebase import
if grep -q "@react-native-firebase/auth" src/services/authenticationService.js; then
    pass "Firebase Auth imported correctly"
else
    fail "Firebase Auth import MISSING"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Checking Keystore and Certificates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if keystore exists
if [ -f "android/app/upload-keystore.jks" ]; then
    pass "Release keystore found"
    
    echo ""
    echo "📋 Your SHA Certificates (Add these to Firebase Console):"
    echo "─────────────────────────────────────────────────────────────────"
    
    # Get SHA certificates
    keytool -list -v -keystore android/app/upload-keystore.jks -storepass upload_store_password -alias upload 2>/dev/null | grep -A2 "Certificate fingerprints" || {
        warn "Could not read keystore automatically"
        echo ""
        echo "   Run manually:"
        echo "   cd android"
        echo "   keytool -list -v -keystore app/upload-keystore.jks -alias upload"
    }
    echo "─────────────────────────────────────────────────────────────────"
else
    fail "Release keystore NOT FOUND at android/app/upload-keystore.jks"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Checking Package Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get package name from build.gradle
PACKAGE_NAME=$(grep "applicationId" android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/' | tr -d ' ')
if [ -n "$PACKAGE_NAME" ]; then
    pass "Package name: $PACKAGE_NAME"
else
    fail "Could not detect package name"
fi

# Check if package name matches in google-services.json
if [ -f "android/app/google-services.json" ]; then
    if grep -q "\"package_name\": \"$PACKAGE_NAME\"" android/app/google-services.json; then
        pass "Package name matches in google-services.json"
    else
        fail "Package name MISMATCH in google-services.json"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Manual Steps Required (Check Firebase Console)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "⚠️  You MUST complete these steps in Firebase Console:"
echo ""
echo "1. Add SHA-1 and SHA-256 certificates:"
echo "   → https://console.firebase.google.com/project/yoraa-android-ios/settings/general"
echo ""
echo "2. Enable SafetyNet/Android Device Verification API:"
echo "   → https://console.cloud.google.com/apis/library"
echo "   → Search: 'Android Device Verification API'"
echo "   → Click 'Enable'"
echo ""
echo "3. Enable Phone Authentication:"
echo "   → https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers"
echo "   → Enable 'Phone' sign-in method"
echo ""
echo "4. Download updated google-services.json:"
echo "   → Project Settings → Your Android app → Download google-services.json"
echo "   → Replace android/app/google-services.json"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Code configuration looks good!                               ║${NC}"
    echo -e "${GREEN}║  📋 Complete the Firebase Console steps above                   ║${NC}"
    echo -e "${GREEN}║  🚀 Then rebuild and test on physical device                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ Some checks failed - fix the issues above                    ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo "📚 For detailed instructions, see:"
echo "   FIREBASE_PHONE_AUTH_PRODUCTION_FIX.md"
echo ""
