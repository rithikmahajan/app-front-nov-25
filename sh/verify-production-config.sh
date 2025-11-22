#!/bin/bash

# Quick Production Environment Verification Script
# Run this before deploying to TestFlight/App Store

echo "🔍 Verifying Production Configuration..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# Check if .env.production exists
echo "1. Checking .env.production file..."
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production exists${NC}"
    
    # Check API_BASE_URL
    API_URL=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
    if [ -n "$API_URL" ]; then
        echo -e "${GREEN}✅ API_BASE_URL configured: $API_URL${NC}"
        
        # Verify it's not localhost
        if [[ "$API_URL" == *"localhost"* ]] || [[ "$API_URL" == *"127.0.0.1"* ]] || [[ "$API_URL" == *"10.0.2.2"* ]]; then
            echo -e "${RED}❌ ERROR: Production URL should not use localhost!${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ Production URL is correct (not localhost)${NC}"
        fi
    else
        echo -e "${RED}❌ ERROR: API_BASE_URL not found in .env.production${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check APP_ENV
    APP_ENV=$(grep "^APP_ENV=" .env.production | cut -d '=' -f2)
    if [ "$APP_ENV" = "production" ]; then
        echo -e "${GREEN}✅ APP_ENV=production${NC}"
    else
        echo -e "${RED}❌ ERROR: APP_ENV should be 'production', found: $APP_ENV${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check DEBUG_MODE
    DEBUG_MODE=$(grep "^DEBUG_MODE=" .env.production | cut -d '=' -f2)
    if [ "$DEBUG_MODE" = "false" ]; then
        echo -e "${GREEN}✅ DEBUG_MODE=false${NC}"
    else
        echo -e "${YELLOW}⚠️  WARNING: DEBUG_MODE should be 'false' in production${NC}"
    fi
else
    echo -e "${RED}❌ ERROR: .env.production file not found!${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "2. Checking iOS .env.production file..."
if [ -f "ios/.env.production" ]; then
    echo -e "${GREEN}✅ ios/.env.production exists${NC}"
    
    IOS_API_URL=$(grep "^API_BASE_URL=" ios/.env.production | cut -d '=' -f2)
    if [ -n "$IOS_API_URL" ]; then
        echo -e "${GREEN}✅ iOS API_BASE_URL configured: $IOS_API_URL${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: ios/.env.production not found (will use root .env.production)${NC}"
fi

echo ""
echo "3. Testing backend connectivity..."
BACKEND_URL=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
if [ -n "$BACKEND_URL" ]; then
    echo "Testing: $BACKEND_URL/health"
    
    # Try to ping the health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" --max-time 10 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Backend is accessible (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  Backend responded but /health endpoint not found (HTTP $HTTP_CODE)${NC}"
        echo -e "${YELLOW}   Trying base URL...${NC}"
        
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" --max-time 10 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
            echo -e "${GREEN}✅ Backend server is reachable${NC}"
        fi
    elif [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}❌ ERROR: Cannot connect to backend (timeout or connection refused)${NC}"
        echo -e "${YELLOW}   Make sure backend is running at: $BACKEND_URL${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${YELLOW}⚠️  Backend responded with HTTP $HTTP_CODE${NC}"
    fi
fi

echo ""
echo "4. Checking react-native-config installation..."
if grep -q "react-native-config" package.json; then
    echo -e "${GREEN}✅ react-native-config is installed${NC}"
else
    echo -e "${RED}❌ ERROR: react-native-config not found in package.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "5. Checking iOS workspace..."
if [ -d "ios/Yoraa.xcworkspace" ]; then
    echo -e "${GREEN}✅ iOS workspace exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: iOS workspace not found, run 'cd ios && pod install'${NC}"
fi

echo ""
echo "6. Checking Android gradle configuration..."
if [ -f "android/app/build.gradle" ]; then
    echo -e "${GREEN}✅ Android build.gradle exists${NC}"
else
    echo -e "${RED}❌ ERROR: android/app/build.gradle not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}Your app is ready for production deployment!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  iOS TestFlight: ./build-for-testflight.sh"
    echo "  iOS App Store:  ./archive-for-appstore.sh"
    echo "  Android:        npm run build:android:prod"
else
    echo -e "${RED}❌ FOUND $ERRORS ERROR(S)${NC}"
    echo -e "${YELLOW}Please fix the errors above before deploying to production.${NC}"
    exit 1
fi
echo "=========================================="
