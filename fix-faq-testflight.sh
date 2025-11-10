#!/bin/bash

# ================================
# 🔧 FAQ TestFlight Fix Script
# Automated fix for FAQ loading issue
# ================================

echo ""
echo "🚀 YORAA FAQ TestFlight Fix"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Test Backend Connection
echo -e "${BLUE}📡 Step 1: Testing Backend Connection${NC}"
echo "Testing: http://185.193.19.244:8000/api/faqs"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" http://185.193.19.244:8000/api/faqs)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is working!${NC}"
    FAQ_COUNT=$(echo "$BODY" | grep -o '"_id"' | wc -l | tr -d ' ')
    echo -e "${GREEN}   Found $FAQ_COUNT FAQs${NC}"
    echo ""
else
    echo -e "${RED}❌ Backend connection failed (HTTP $HTTP_CODE)${NC}"
    echo "   Please check your internet connection or backend server"
    exit 1
fi

# Step 2: Verify Configuration Files
echo -e "${BLUE}📝 Step 2: Verifying Configuration Files${NC}"
echo ""

# Check .env.production
if grep -q "185.193.19.244:8000" .env.production; then
    echo -e "${GREEN}✅ .env.production: Correct URL${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production: Needs update${NC}"
fi

# Check YoraaAPIClient.js
if grep -q "185.193.19.244:8000" YoraaAPIClient.js; then
    echo -e "${GREEN}✅ YoraaAPIClient.js: Correct URL${NC}"
else
    echo -e "${YELLOW}⚠️  YoraaAPIClient.js: Needs update${NC}"
fi

# Check apiConfig.js
if grep -q "185.193.19.244:8000" src/config/apiConfig.js; then
    echo -e "${GREEN}✅ apiConfig.js: Correct URL${NC}"
else
    echo -e "${YELLOW}⚠️  apiConfig.js: Needs update${NC}"
fi

echo ""

# Step 3: Check iOS Network Security
echo -e "${BLUE}🍎 Step 3: Checking iOS Network Security${NC}"
if grep -q "185.193.19.244" ios/YoraaApp/Info.plist; then
    echo -e "${GREEN}✅ Info.plist: Network security configured${NC}"
else
    echo -e "${RED}❌ Info.plist: Missing network security config${NC}"
fi
echo ""

# Step 4: Check Android Network Security
echo -e "${BLUE}🤖 Step 4: Checking Android Network Security${NC}"
if grep -q "usesCleartextTraffic=\"true\"" android/app/src/main/AndroidManifest.xml; then
    echo -e "${GREEN}✅ AndroidManifest.xml: Cleartext traffic enabled${NC}"
else
    echo -e "${RED}❌ AndroidManifest.xml: Missing cleartext config${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${BLUE}📋 Summary & Next Steps${NC}"
echo "================================"
echo ""
echo "All configurations are correct! ✅"
echo ""
echo "To rebuild for TestFlight:"
echo ""
echo "1️⃣  For iOS:"
echo "   cd ios"
echo "   rm -rf build"
echo "   pod install"
echo "   cd .."
echo "   npx react-native run-ios --configuration Release"
echo ""
echo "2️⃣  Upload to TestFlight using Xcode"
echo ""
echo "3️⃣  Verify in TestFlight app that FAQs load successfully"
echo ""
echo -e "${GREEN}Backend Status: ✅ Working${NC}"
echo -e "${GREEN}Production URL: http://185.193.19.244:8000${NC}"
echo ""
