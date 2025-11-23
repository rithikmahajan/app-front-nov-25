#!/bin/bash

# 🔍 Get Android Debug Keystore SHA-1 Fingerprint
# November 21, 2025

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 ANDROID DEBUG KEYSTORE SHA-1 FINGERPRINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DEBUG_KEYSTORE="$HOME/.android/debug.keystore"

if [ ! -f "$DEBUG_KEYSTORE" ]; then
    echo "${RED}❌ Debug keystore not found at: $DEBUG_KEYSTORE${NC}"
    echo ""
    echo "${YELLOW}This is unusual. The debug keystore is usually created automatically.${NC}"
    echo ""
    echo "To create it manually, run:"
    echo "  keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000"
    exit 1
fi

echo "${GREEN}✅ Debug keystore found!${NC}"
echo "   Location: $DEBUG_KEYSTORE"
echo ""

echo "${BLUE}📋 Extracting fingerprints...${NC}"
echo ""

# Get all fingerprints
FINGERPRINTS=$(keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to read keystore${NC}"
    exit 1
fi

# Extract specific fingerprints
MD5=$(echo "$FINGERPRINTS" | grep "MD5:" | cut -d: -f2- | tr -d ' ')
SHA1=$(echo "$FINGERPRINTS" | grep "SHA1:" | cut -d: -f2- | tr -d ' ')
SHA256=$(echo "$FINGERPRINTS" | grep "SHA256:" | cut -d: -f2- | tr -d ' ')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}🔑 DEBUG KEYSTORE FINGERPRINTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}MD5:${NC}"
echo "  $MD5"
echo ""
echo "${YELLOW}SHA-1:${NC}"
echo "  $SHA1"
echo ""
echo "${YELLOW}SHA-256:${NC}"
echo "  $SHA256"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Compare with known certificates
echo "${BLUE}📊 Certificate Comparison:${NC}"
echo ""

echo "Your Certificates:"
echo "  ${GREEN}Debug SHA-1:${NC}        $SHA1"
echo ""

echo "From google-services.json:"
echo "  Upload Key SHA-1:    84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
echo "  Registered SHA-1:    5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25"
echo ""

echo "From Google Play Console:"
echo "  App Signing SHA-1:   54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}📝 NEXT STEPS TO FIX GOOGLE SIGN-IN:${NC}"
echo ""
echo "1. Go to Google Cloud Console:"
echo "   ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
echo ""
echo "2. Select project: ${GREEN}yoraa-android-ios${NC}"
echo ""
echo "3. Click ${GREEN}'+ CREATE CREDENTIALS'${NC} → ${GREEN}'OAuth client ID'${NC} → ${GREEN}'Android'${NC}"
echo ""
echo "4. Fill in:"
echo "   - ${YELLOW}Name:${NC} Android client (Debug)"
echo "   - ${YELLOW}Package name:${NC} com.yoraa"
echo "   - ${YELLOW}SHA-1 certificate fingerprint:${NC}"
echo "     ${GREEN}$SHA1${NC}"
echo ""
echo "5. Click ${GREEN}'CREATE'${NC}"
echo ""
echo "6. Wait 5-10 minutes for propagation"
echo ""
echo "7. Clear app data and rebuild:"
echo "   ${BLUE}\$ANDROID_HOME/platform-tools/adb shell pm clear com.yoraa${NC}"
echo "   ${BLUE}npx react-native run-android${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}📖 For detailed instructions, see:${NC}"
echo "   GOOGLE_SIGNIN_DEVELOPER_ERROR_FIX_NOV21.md"
echo ""
