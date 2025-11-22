#!/bin/bash

# ============================================
# Android Backend Connection Diagnostic Tool
# ============================================

echo ""
echo "🔍 ANDROID BACKEND CONNECTION ANALYSIS"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check Production Backend URLs
echo "📋 TEST 1: Production Backend Configuration"
echo "-------------------------------------------"

echo ""
echo "Expected Configuration:"
echo "  • Contabo IP: 185.193.19.244:8080 (NOT RESPONDING)"
echo "  • Domain: https://yoraa.in.net (ACTIVE ✅)"
echo ""

# Test Contabo IP
echo -n "Testing Contabo IP (185.193.19.244:8080)... "
if curl -s --connect-timeout 5 http://185.193.19.244:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
    CONTABO_STATUS="✅"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    CONTABO_STATUS="❌"
fi

# Test Domain
echo -n "Testing Domain (https://yoraa.in.net)... "
if curl -s --connect-timeout 5 https://yoraa.in.net/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
    DOMAIN_STATUS="✅"
    echo -e "${GREEN}  Backend is LIVE and responding!${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    DOMAIN_STATUS="❌"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Test 2: Check Environment Files
echo "📋 TEST 2: Environment File Configuration"
echo "-------------------------------------------"
echo ""

if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    echo ""
    echo "Current Configuration:"
    grep -E "(API_BASE_URL|BACKEND_URL|SERVER_IP)" .env.production | sed 's/^/  /'
    echo ""
    
    # Check if using old IP
    if grep -q "185.193.19.244:8080" .env.production; then
        echo -e "${YELLOW}⚠️  WARNING: Using Contabo IP (185.193.19.244:8080)${NC}"
        echo -e "${YELLOW}   This IP is NOT responding!${NC}"
        echo ""
        echo -e "${BLUE}💡 RECOMMENDATION: Update to use domain instead${NC}"
        echo -e "${BLUE}   Change to: https://yoraa.in.net/api${NC}"
    fi
else
    echo -e "${RED}❌ .env.production NOT found${NC}"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Test 3: Check Source Code Configuration
echo "📋 TEST 3: Source Code Configuration Check"
echo "-------------------------------------------"
echo ""

FILES_TO_CHECK=(
    "src/config/environment.js"
    "src/services/yoraaBackendAPI.js"
    "src/config/apiConfig.js"
)

echo "Checking for hardcoded URLs..."
echo ""

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "📄 $file:"
        if grep -q "185.193.19.244" "$file"; then
            echo -e "  ${YELLOW}⚠️  Contains Contabo IP (185.193.19.244)${NC}"
            grep -n "185.193.19.244" "$file" | head -3 | sed 's/^/    /'
        else
            echo -e "  ${GREEN}✅ No hardcoded Contabo IP${NC}"
        fi
        
        if grep -q "yoraa.in.net" "$file"; then
            echo -e "  ${GREEN}✅ Contains domain (yoraa.in.net)${NC}"
        fi
        echo ""
    fi
done

echo "-------------------------------------------"
echo ""

# Test 4: Android Network Security Config
echo "📋 TEST 4: Android Network Security Config"
echo "-------------------------------------------"
echo ""

NETWORK_CONFIG="android/app/src/main/res/xml/network_security_config.xml"

if [ -f "$NETWORK_CONFIG" ]; then
    echo "✅ Network security config exists"
    echo ""
    echo "Allowed domains:"
    grep -E "domain includeSubdomains" "$NETWORK_CONFIG" | sed 's/^/  /'
    echo ""
    
    if grep -q "185.193.19.244" "$NETWORK_CONFIG"; then
        echo -e "${GREEN}✅ Contabo IP (185.193.19.244) is allowed${NC}"
    fi
    
    if grep -q "yoraa.in.net" "$NETWORK_CONFIG"; then
        echo -e "${GREEN}✅ Domain (yoraa.in.net) is allowed${NC}"
    else
        echo -e "${YELLOW}⚠️  Domain (yoraa.in.net) NOT in allowed list${NC}"
    fi
else
    echo -e "${RED}❌ Network security config NOT found${NC}"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Test 5: Check Android App Status
echo "📋 TEST 5: Android App Status"
echo "-------------------------------------------"
echo ""

ADB_PATH="~/Library/Android/sdk/platform-tools/adb"

# Check for connected devices
DEVICE_COUNT=$(eval "$ADB_PATH devices | grep -v 'List' | grep 'device' | wc -l | xargs")

if [ "$DEVICE_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  No Android devices/emulators connected${NC}"
elif [ "$DEVICE_COUNT" -eq "1" ]; then
    echo -e "${GREEN}✅ 1 Android device/emulator connected${NC}"
    echo ""
    eval "$ADB_PATH devices -l"
    echo ""
    
    # Check if app is installed
    if eval "$ADB_PATH shell pm list packages | grep -q com.yoraa"; then
        echo -e "${GREEN}✅ YORAA app is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  YORAA app is NOT installed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Multiple devices connected ($DEVICE_COUNT)${NC}"
    echo ""
    eval "$ADB_PATH devices -l"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Summary and Recommendations
echo "📊 SUMMARY & RECOMMENDATIONS"
echo "============================================"
echo ""

echo "Backend Status:"
echo "  • Contabo IP (185.193.19.244:8080): $CONTABO_STATUS"
echo "  • Domain (https://yoraa.in.net): $DOMAIN_STATUS"
echo ""

if [ "$DOMAIN_STATUS" == "✅" ] && [ "$CONTABO_STATUS" == "❌" ]; then
    echo -e "${RED}⚠️  CRITICAL ISSUE FOUND!${NC}"
    echo ""
    echo "Your Android app is likely configured to use:"
    echo "  http://185.193.19.244:8080/api"
    echo ""
    echo "But the backend is actually running on:"
    echo "  https://yoraa.in.net/api"
    echo ""
    echo -e "${BLUE}🔧 REQUIRED FIXES:${NC}"
    echo ""
    echo "1. Update .env.production:"
    echo "   API_BASE_URL=https://yoraa.in.net/api"
    echo "   BACKEND_URL=https://yoraa.in.net/api"
    echo ""
    echo "2. Update android/app/src/main/res/xml/network_security_config.xml"
    echo "   Add: <domain includeSubdomains=\"true\">yoraa.in.net</domain>"
    echo ""
    echo "3. Update src/config/environment.js fallback URLs"
    echo ""
    echo "4. Rebuild the Android app"
    echo ""
    echo "Would you like me to create a fix script? (y/n)"
elif [ "$DOMAIN_STATUS" == "✅" ]; then
    echo -e "${GREEN}✅ Backend is LIVE and responding${NC}"
    echo ""
    echo "If Android app still can't connect, check:"
    echo "  1. Environment configuration matches domain"
    echo "  2. Network security config allows yoraa.in.net"
    echo "  3. App was rebuilt after configuration changes"
else
    echo -e "${RED}❌ Backend is NOT responding on either URL${NC}"
    echo ""
    echo "Contact backend team to verify deployment status"
fi

echo ""
echo "============================================"
echo ""
