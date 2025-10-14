#!/bin/bash

# 🔍 Firebase Phone Auth Configuration Checker
# Quick verification of all required configurations

echo "🔍 Firebase Phone Auth Configuration Checker"
echo "============================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check 1: GoogleService-Info.plist exists
echo -e "${BLUE}1. Checking GoogleService-Info.plist...${NC}"
if [ -f "ios/YoraaApp/GoogleService-Info.plist" ]; then
    echo -e "   ${GREEN}✅ File exists${NC}"
else
    echo -e "   ${RED}❌ File not found${NC}"
    ((ERRORS++))
fi

# Check 2: REVERSED_CLIENT_ID in GoogleService-Info.plist
echo -e "\n${BLUE}2. Checking REVERSED_CLIENT_ID in GoogleService-Info.plist...${NC}"
REVERSED_CLIENT_ID=$(grep -A 1 "REVERSED_CLIENT_ID" ios/YoraaApp/GoogleService-Info.plist | tail -1 | sed 's/<string>//g' | sed 's/<\/string>//g' | xargs)
if [ ! -z "$REVERSED_CLIENT_ID" ]; then
    echo -e "   ${GREEN}✅ Found: $REVERSED_CLIENT_ID${NC}"
else
    echo -e "   ${RED}❌ Not found${NC}"
    ((ERRORS++))
fi

# Check 3: Info.plist exists
echo -e "\n${BLUE}3. Checking Info.plist...${NC}"
if [ -f "ios/YoraaApp/Info.plist" ]; then
    echo -e "   ${GREEN}✅ File exists${NC}"
else
    echo -e "   ${RED}❌ File not found${NC}"
    ((ERRORS++))
fi

# Check 4: REVERSED_CLIENT_ID in Info.plist
echo -e "\n${BLUE}4. Checking REVERSED_CLIENT_ID in Info.plist...${NC}"
if [ ! -z "$REVERSED_CLIENT_ID" ] && grep -q "$REVERSED_CLIENT_ID" ios/YoraaApp/Info.plist; then
    echo -e "   ${GREEN}✅ REVERSED_CLIENT_ID is configured${NC}"
else
    echo -e "   ${RED}❌ REVERSED_CLIENT_ID not found in Info.plist${NC}"
    echo -e "   ${YELLOW}   Expected: $REVERSED_CLIENT_ID${NC}"
    ((ERRORS++))
fi

# Check 5: CFBundleURLTypes in Info.plist
echo -e "\n${BLUE}5. Checking CFBundleURLTypes in Info.plist...${NC}"
if grep -q "CFBundleURLTypes" ios/YoraaApp/Info.plist; then
    echo -e "   ${GREEN}✅ CFBundleURLTypes section exists${NC}"
else
    echo -e "   ${RED}❌ CFBundleURLTypes section not found${NC}"
    ((ERRORS++))
fi

# Check 6: Firebase Auth package
echo -e "\n${BLUE}6. Checking Firebase Auth package...${NC}"
if grep -q "@react-native-firebase/auth" package.json; then
    VERSION=$(grep "@react-native-firebase/auth" package.json | sed 's/.*: "//g' | sed 's/".*//g')
    echo -e "   ${GREEN}✅ @react-native-firebase/auth installed (version: $VERSION)${NC}"
else
    echo -e "   ${RED}❌ @react-native-firebase/auth not installed${NC}"
    ((ERRORS++))
fi

# Check 7: Firebase App package
echo -e "\n${BLUE}7. Checking Firebase App package...${NC}"
if grep -q "@react-native-firebase/app" package.json; then
    VERSION=$(grep "@react-native-firebase/app" package.json | sed 's/.*: "//g' | sed 's/".*//g')
    echo -e "   ${GREEN}✅ @react-native-firebase/app installed (version: $VERSION)${NC}"
else
    echo -e "   ${RED}❌ @react-native-firebase/app not installed${NC}"
    ((ERRORS++))
fi

# Check 8: firebasePhoneAuth service
echo -e "\n${BLUE}8. Checking firebasePhoneAuth service...${NC}"
if [ -f "src/services/firebasePhoneAuth.js" ]; then
    echo -e "   ${GREEN}✅ Service file exists${NC}"
else
    echo -e "   ${RED}❌ Service file not found${NC}"
    ((ERRORS++))
fi

# Check 9: Login screen
echo -e "\n${BLUE}9. Checking login screens...${NC}"
if [ -f "src/screens/loginaccountmobilenumber.js" ]; then
    echo -e "   ${GREEN}✅ loginaccountmobilenumber.js exists${NC}"
else
    echo -e "   ${RED}❌ loginaccountmobilenumber.js not found${NC}"
    ((ERRORS++))
fi

if [ -f "src/screens/loginaccountmobilenumberverificationcode.js" ]; then
    echo -e "   ${GREEN}✅ loginaccountmobilenumberverificationcode.js exists${NC}"
else
    echo -e "   ${RED}❌ loginaccountmobilenumberverificationcode.js not found${NC}"
    ((ERRORS++))
fi

# Check 10: Project ID
echo -e "\n${BLUE}10. Checking Firebase Project ID...${NC}"
PROJECT_ID=$(grep -A 1 "PROJECT_ID" ios/YoraaApp/GoogleService-Info.plist | tail -1 | sed 's/<string>//g' | sed 's/<\/string>//g' | xargs)
if [ ! -z "$PROJECT_ID" ]; then
    echo -e "   ${GREEN}✅ Project ID: $PROJECT_ID${NC}"
else
    echo -e "   ${YELLOW}⚠️  Project ID not found${NC}"
    ((WARNINGS++))
fi

# Check 11: GOOGLE_APP_ID
echo -e "\n${BLUE}11. Checking GOOGLE_APP_ID...${NC}"
GOOGLE_APP_ID=$(grep -A 1 "GOOGLE_APP_ID" ios/YoraaApp/GoogleService-Info.plist | tail -1 | sed 's/<string>//g' | sed 's/<\/string>//g' | xargs)
if [ ! -z "$GOOGLE_APP_ID" ]; then
    echo -e "   ${GREEN}✅ Google App ID: $GOOGLE_APP_ID${NC}"
else
    echo -e "   ${YELLOW}⚠️  Google App ID not found${NC}"
    ((WARNINGS++))
fi

# Summary
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}============================================${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
else
    echo -e "${RED}❌ Found $ERRORS critical error(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
fi

echo -e "\n${YELLOW}📋 Configuration Details:${NC}"
echo -e "   Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "   REVERSED_CLIENT_ID: ${GREEN}$REVERSED_CLIENT_ID${NC}"
echo -e "   GOOGLE_APP_ID: ${GREEN}$GOOGLE_APP_ID${NC}"

echo -e "\n${YELLOW}🔥 Next Steps (CRITICAL):${NC}"
echo -e "1. ${RED}Enable Phone Authentication in Firebase Console${NC}"
echo -e "   URL: ${BLUE}https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers${NC}"
echo -e ""
echo -e "2. ${YELLOW}Add test phone numbers (for testing):${NC}"
echo -e "   Example: +1 650-555-1234 → Code: 123456"
echo -e ""
echo -e "3. ${YELLOW}Configure APNs (for production on real iOS devices):${NC}"
echo -e "   - Get APNs Authentication Key from Apple Developer Portal"
echo -e "   - Upload to Firebase Console → Project Settings → Cloud Messaging"
echo -e ""
echo -e "4. ${GREEN}Run the clean build script:${NC}"
echo -e "   ${BLUE}./fix-firebase-phone-auth.sh${NC}"
echo -e ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 Your app is configured correctly for Firebase Phone Auth!${NC}"
    echo -e "${RED}⚠️  Just enable Phone Auth in Firebase Console and you're good to go!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Please fix the errors above before proceeding.${NC}"
    exit 1
fi
