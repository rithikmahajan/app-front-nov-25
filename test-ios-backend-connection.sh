#!/bin/bash

# ============================================================================
# iOS Backend Connection Test Script
# Tests connection to production backend: https://api.yoraa.in.net/api
# ============================================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🔍 iOS Backend Connection Test${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_URL="https://api.yoraa.in.net/api"

echo -e "${CYAN}Testing backend:${NC} ${BOLD}$BACKEND_URL${NC}"
echo ""

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 1: Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing: $BACKEND_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo -e "${CYAN}Response:${NC} $RESPONSE_BODY"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}HTTP Code:${NC} $HTTP_CODE"
    echo -e "${YELLOW}Response:${NC} $RESPONSE_BODY"
fi
echo ""

# Test 2: Categories Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 2: Categories Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing: $BACKEND_URL/categories"
CATEGORIES_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/categories" 2>/dev/null)
HTTP_CODE=$(echo "$CATEGORIES_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CATEGORIES_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Categories endpoint working${NC}"
    
    # Try to parse category count
    if command -v jq &> /dev/null; then
        CATEGORY_COUNT=$(echo "$RESPONSE_BODY" | jq '.data | length' 2>/dev/null)
        if [ ! -z "$CATEGORY_COUNT" ]; then
            echo -e "${CYAN}Categories found:${NC} $CATEGORY_COUNT"
        fi
    fi
    
    # Show first 200 characters of response
    echo -e "${CYAN}Response preview:${NC} ${RESPONSE_BODY:0:200}..."
else
    echo -e "${RED}❌ Categories endpoint failed${NC}"
    echo -e "${YELLOW}HTTP Code:${NC} $HTTP_CODE"
fi
echo ""

# Test 3: Products Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 3: Products Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing: $BACKEND_URL/products?page=1&limit=5"
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/products?page=1&limit=5" 2>/dev/null)
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PRODUCTS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Products endpoint working${NC}"
    
    # Try to parse product count
    if command -v jq &> /dev/null; then
        PRODUCT_COUNT=$(echo "$RESPONSE_BODY" | jq '.data.items | length' 2>/dev/null)
        if [ ! -z "$PRODUCT_COUNT" ]; then
            echo -e "${CYAN}Products returned:${NC} $PRODUCT_COUNT"
        fi
    fi
else
    echo -e "${RED}❌ Products endpoint failed${NC}"
    echo -e "${YELLOW}HTTP Code:${NC} $HTTP_CODE"
fi
echo ""

# Test 4: SSL/TLS Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 4: SSL/TLS Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Checking SSL certificate..."
SSL_INFO=$(echo | openssl s_client -connect api.yoraa.in.net:443 -servername api.yoraa.in.net 2>/dev/null | openssl x509 -noout -text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate valid${NC}"
    
    # Extract issuer
    ISSUER=$(echo "$SSL_INFO" | grep "Issuer:" | head -1)
    if [ ! -z "$ISSUER" ]; then
        echo -e "${CYAN}$ISSUER${NC}"
    fi
    
    # Check TLS version
    TLS_VERSION=$(echo | openssl s_client -connect api.yoraa.in.net:443 2>/dev/null | grep "Protocol" | head -1)
    if [ ! -z "$TLS_VERSION" ]; then
        echo -e "${CYAN}$TLS_VERSION${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not verify SSL certificate${NC}"
fi
echo ""

# Test 5: DNS Resolution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 5: DNS Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Resolving: api.yoraa.in.net"
DNS_RESULT=$(nslookup api.yoraa.in.net 2>/dev/null | grep "Address:" | tail -1)

if [ ! -z "$DNS_RESULT" ]; then
    echo -e "${GREEN}✅ DNS resolution successful${NC}"
    echo -e "${CYAN}$DNS_RESULT${NC}"
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
fi
echo ""

# Test 6: Response Time
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Test 6: Response Time${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Measuring response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BACKEND_URL/health" 2>/dev/null)

if [ ! -z "$RESPONSE_TIME" ]; then
    # Convert to milliseconds
    MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null)
    
    if [ ! -z "$MS" ]; then
        echo -e "${CYAN}Response time:${NC} ${BOLD}${MS%.*}ms${NC}"
        
        # Evaluate performance
        THRESHOLD=1000
        if (( ${MS%.*} < $THRESHOLD )); then
            echo -e "${GREEN}✅ Response time is good (< ${THRESHOLD}ms)${NC}"
        else
            echo -e "${YELLOW}⚠️  Response time is slow (> ${THRESHOLD}ms)${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Could not measure response time${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}📊 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Info.plist configuration
echo -e "${CYAN}iOS Configuration:${NC}"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    # Check NSAllowsArbitraryLoads
    ARBITRARY_LOADS=$(/usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSAllowsArbitraryLoads" "$INFO_PLIST" 2>/dev/null)
    
    if [ "$ARBITRARY_LOADS" = "false" ]; then
        echo -e "${GREEN}✅ NSAllowsArbitraryLoads: false (secure)${NC}"
    else
        echo -e "${YELLOW}⚠️  NSAllowsArbitraryLoads: $ARBITRARY_LOADS${NC}"
    fi
    
    # Check for api.yoraa.in.net exception
    if /usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSExceptionDomains:api.yoraa.in.net" "$INFO_PLIST" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ api.yoraa.in.net exception configured${NC}"
    else
        echo -e "${RED}❌ api.yoraa.in.net exception NOT configured${NC}"
        echo -e "${YELLOW}   Run: ./ios-production-build.sh${NC}"
    fi
else
    echo -e "${RED}❌ Info.plist not found${NC}"
fi
echo ""

# Check .env.production
echo -e "${CYAN}Environment Configuration:${NC}"
echo ""

if [ -f ".env.production" ]; then
    BACKEND_URL_ENV=$(grep "^BACKEND_URL=" .env.production | cut -d '=' -f2)
    API_BASE_URL_ENV=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
    
    if [ "$BACKEND_URL_ENV" = "https://api.yoraa.in.net/api" ]; then
        echo -e "${GREEN}✅ BACKEND_URL configured correctly${NC}"
        echo -e "   $BACKEND_URL_ENV"
    else
        echo -e "${RED}❌ BACKEND_URL incorrect${NC}"
        echo -e "   Current: $BACKEND_URL_ENV"
        echo -e "   Expected: https://api.yoraa.in.net/api"
    fi
    
    if [ "$API_BASE_URL_ENV" = "https://api.yoraa.in.net/api" ]; then
        echo -e "${GREEN}✅ API_BASE_URL configured correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  API_BASE_URL: $API_BASE_URL_ENV${NC}"
    fi
else
    echo -e "${RED}❌ .env.production not found${NC}"
fi
echo ""

# Final verdict
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count successful tests
TESTS_PASSED=0
TESTS_TOTAL=3

# Health check
if [ "$HTTP_CODE" = "200" ]; then
    ((TESTS_PASSED++))
fi

# Info.plist check
if [ -f "$INFO_PLIST" ] && /usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSExceptionDomains:api.yoraa.in.net" "$INFO_PLIST" > /dev/null 2>&1; then
    ((TESTS_PASSED++))
fi

# Environment check
if [ -f ".env.production" ] && [ "$BACKEND_URL_ENV" = "https://api.yoraa.in.net/api" ]; then
    ((TESTS_PASSED++))
fi

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}${BOLD}✅ All checks passed! iOS app is ready for production.${NC}"
elif [ $TESTS_PASSED -gt 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠️  Some checks passed ($TESTS_PASSED/$TESTS_TOTAL). Review warnings above.${NC}"
else
    echo -e "${RED}${BOLD}❌ Configuration needs attention. Run: ./ios-production-build.sh${NC}"
fi

echo ""
echo -e "${CYAN}📱 Next steps:${NC}"
echo "   1. If issues found, run: ./ios-production-build.sh"
echo "   2. Test on physical iOS device"
echo "   3. Create archive in Xcode"
echo "   4. Upload to TestFlight"
echo ""
