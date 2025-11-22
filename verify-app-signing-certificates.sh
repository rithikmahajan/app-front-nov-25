#!/bin/bash

# 🔍 Verify App Signing Certificates Configuration
# November 21, 2025

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 GOOGLE PLAY APP SIGNING CERTIFICATES VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📋 Expected Certificates from Google Play Console:"
echo ""
echo "${BLUE}App Signing Key (Google-managed):${NC}"
echo "  SHA-1:   54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1"
echo "  SHA-256: E8:FB:67:B8:8C:FB:D5:BC:0C:CD:0A:59:F1:97:7B:28:A1:52:F2:A9:41:B8:16:99:88:D9:FB:FC:C4:39:45:8A"
echo ""
echo "${BLUE}Upload Key (Your keystore):${NC}"
echo "  SHA-1:   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
echo "  SHA-256: 99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if google-services.json exists
if [ ! -f "android/app/google-services.json" ]; then
    echo "${RED}❌ google-services.json not found!${NC}"
    exit 1
fi

echo "📄 Checking current google-services.json configuration..."
echo ""

# Extract OAuth clients
echo "${YELLOW}Current OAuth Clients in google-services.json:${NC}"
cat android/app/google-services.json | grep -A 5 "oauth_client" | grep -E "client_id|certificate_hash" | head -20
echo ""

# Check for App Signing Key SHA-1 (lowercase, no colons)
APP_SIGNING_SHA1_LOWER="54b7734caa83ca53d26480b5cb46dc297e0285b1"
UPLOAD_KEY_SHA1_LOWER="8487d61de8145729d9869c44753535477de47d2f"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Certificate Verification:"
echo ""

if grep -q "$APP_SIGNING_SHA1_LOWER" android/app/google-services.json; then
    echo "${GREEN}✅ App Signing Key SHA-1 found in google-services.json${NC}"
else
    echo "${RED}❌ App Signing Key SHA-1 NOT found in google-services.json${NC}"
    echo "   ${YELLOW}You need to add this to Firebase Console:${NC}"
    echo "   54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1"
fi

if grep -q "$UPLOAD_KEY_SHA1_LOWER" android/app/google-services.json; then
    echo "${GREEN}✅ Upload Key SHA-1 found in google-services.json${NC}"
else
    echo "${YELLOW}⚠️  Upload Key SHA-1 NOT found in google-services.json${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for keystore
if [ -f "android/app/upload-keystore.jks" ]; then
    echo "${GREEN}✅ upload-keystore.jks found${NC}"
    echo ""
    echo "📋 Verifying keystore certificates..."
    
    # Get SHA-1 from keystore
    KEYSTORE_SHA1=$(keytool -list -v -keystore android/app/upload-keystore.jks -alias upload -storepass yoraa2024 2>/dev/null | grep "SHA1:" | cut -d: -f2- | tr -d ' ')
    KEYSTORE_SHA256=$(keytool -list -v -keystore android/app/upload-keystore.jks -alias upload -storepass yoraa2024 2>/dev/null | grep "SHA256:" | cut -d: -f2- | tr -d ' ')
    
    echo "  Keystore SHA-1:   $KEYSTORE_SHA1"
    echo "  Expected SHA-1:   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
    
    if [ "$KEYSTORE_SHA1" == "84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F" ]; then
        echo "${GREEN}  ✅ Keystore SHA-1 matches Upload Key${NC}"
    else
        echo "${RED}  ❌ Keystore SHA-1 does NOT match${NC}"
    fi
    
    echo ""
    echo "  Keystore SHA-256: $KEYSTORE_SHA256"
    echo "  Expected SHA-256: 99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3"
    
    if [ "$KEYSTORE_SHA256" == "99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3" ]; then
        echo "${GREEN}  ✅ Keystore SHA-256 matches Upload Key${NC}"
    else
        echo "${RED}  ❌ Keystore SHA-256 does NOT match${NC}"
    fi
else
    echo "${RED}❌ upload-keystore.jks not found${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Go to Firebase Console:"
echo "   https://console.firebase.google.com/project/yoraa-android-ios/settings/general"
echo ""
echo "2. Find Android app (com.yoraa) and add these SHA fingerprints:"
echo "   ${BLUE}App Signing SHA-1:${NC}"
echo "   54:B7:73:4C:AA:83:CA:53:D2:64:80:B5:CB:46:DC:29:7E:02:85:B1"
echo ""
echo "   ${BLUE}App Signing SHA-256:${NC}"
echo "   E8:FB:67:B8:8C:FB:D5:BC:0C:CD:0A:59:F1:97:7B:28:A1:52:F2:A9:41:B8:16:99:88:D9:FB:FC:C4:39:45:8A"
echo ""
echo "3. Download new google-services.json and replace:"
echo "   android/app/google-services.json"
echo ""
echo "4. Go to Google Cloud Console for OAuth:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "5. Create Android OAuth client with App Signing SHA-1"
echo ""
echo "6. Build and test new release"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}📖 For detailed instructions, see:${NC}"
echo "   GOOGLE_PLAY_APP_SIGNING_CERTIFICATES_NOV21.md"
echo ""
