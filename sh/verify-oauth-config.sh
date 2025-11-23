#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "   Google OAuth Configuration Verification Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CORRECT_WEB_CLIENT_ID="133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com"
CORRECT_SHA1="84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
CORRECT_PACKAGE="com.yoraa"

echo "1️⃣  Checking Package Name..."
PACKAGE=$(grep "applicationId" android/app/build.gradle | grep -o '"[^"]*"' | tr -d '"')
if [ "$PACKAGE" == "$CORRECT_PACKAGE" ]; then
    echo -e "${GREEN}✅ Package Name: $PACKAGE${NC}"
else
    echo -e "${RED}❌ Package Name: $PACKAGE (Expected: $CORRECT_PACKAGE)${NC}"
fi
echo ""

echo "2️⃣  Checking Release SHA-1 Certificate..."
cd android
CURRENT_SHA1=$(./gradlew signingReport 2>/dev/null | grep -A 5 "Variant: release" | grep "SHA1:" | awk '{print $2}')
cd ..
if [ "$CURRENT_SHA1" == "$CORRECT_SHA1" ]; then
    echo -e "${GREEN}✅ Release SHA-1: $CURRENT_SHA1${NC}"
else
    echo -e "${RED}❌ Release SHA-1: $CURRENT_SHA1${NC}"
    echo -e "${YELLOW}   Expected: $CORRECT_SHA1${NC}"
fi
echo ""

echo "3️⃣  Checking Web Client ID in .env.production..."
ENV_CLIENT_ID=$(grep "GOOGLE_SIGNIN_WEB_CLIENT_ID" .env.production | cut -d'=' -f2)
if [ "$ENV_CLIENT_ID" == "$CORRECT_WEB_CLIENT_ID" ]; then
    echo -e "${GREEN}✅ .env.production Web Client ID: Correct${NC}"
else
    echo -e "${RED}❌ .env.production Web Client ID: $ENV_CLIENT_ID${NC}"
    echo -e "${YELLOW}   Expected: $CORRECT_WEB_CLIENT_ID${NC}"
fi
echo ""

echo "4️⃣  Checking google-services.json..."
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json exists at correct location${NC}"
    
    # Check if correct Web Client ID is present
    if grep -q "$CORRECT_WEB_CLIENT_ID" android/app/google-services.json; then
        echo -e "${GREEN}✅ Correct Web Client ID found in google-services.json${NC}"
    else
        echo -e "${RED}❌ Correct Web Client ID NOT found in google-services.json${NC}"
        echo -e "${YELLOW}   Action: Download fresh google-services.json from Firebase Console${NC}"
    fi
    
    # Count total OAuth clients in file
    TOTAL_CLIENTS=$(cat android/app/google-services.json | python3 -m json.tool 2>/dev/null | grep '"client_id"' | wc -l | xargs)
    echo -e "${YELLOW}ℹ️  Total OAuth Client IDs in file: $TOTAL_CLIENTS${NC}"
else
    echo -e "${RED}❌ google-services.json NOT found at android/app/google-services.json${NC}"
    echo -e "${YELLOW}   Action: Download google-services.json from Firebase Console${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "   Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Package Name: $PACKAGE"
echo "Release SHA-1: $CURRENT_SHA1"
echo ""
echo "Required Web Client ID:"
echo "$CORRECT_WEB_CLIENT_ID"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   Next Steps"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials?project=yoraa-android-ios"
echo ""
echo "2. Delete the 2 OLD Android OAuth clients:"
echo "   - 133733122921-9s1868ckbgho2527g4vo64r4hkvknb9c..."
echo "   - 133733122921-d2pkd5k046e4isoiulnrsf8m6mj38j4p..."
echo ""
echo "3. Create NEW Android OAuth client with:"
echo "   Package: $CORRECT_PACKAGE"
echo "   SHA-1: $CORRECT_SHA1"
echo ""
echo "4. Go to Firebase Console:"
echo "   https://console.firebase.google.com/project/yoraa-android-ios/settings/general"
echo ""
echo "5. Add SHA-1 certificate fingerprint if not present"
echo ""
echo "6. Download fresh google-services.json and replace:"
echo "   android/app/google-services.json"
echo ""
echo "7. Clean build:"
echo "   cd android && ./gradlew clean && cd .."
echo ""
echo "8. Build production AAB:"
echo "   ./build-android-production.sh"
echo ""
echo "═══════════════════════════════════════════════════════════════"
