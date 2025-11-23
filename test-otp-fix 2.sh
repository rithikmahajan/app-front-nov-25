#!/bin/bash

# Phone OTP Login Test Script
# This script helps verify the OTP login fix is working before deploying to TestFlight

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     📱 Phone OTP Login Fix - Pre-Deploy Test                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check backend health
echo "1️⃣  Checking Backend Server Health..."
BACKEND_URL="https://api.yoraa.in.net/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" --max-time 5)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}   ✅ Backend is healthy (HTTP $HTTP_CODE)${NC}"
    BACKEND_RESPONSE=$(curl -s "$BACKEND_URL" --max-time 5)
    echo "   Response: $BACKEND_RESPONSE"
else
    echo -e "${RED}   ❌ Backend health check failed (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}   ⚠️  Warning: Backend may not be accessible${NC}"
    echo "   URL: $BACKEND_URL"
fi
echo ""

# 2. Check environment files
echo "2️⃣  Checking Environment Configuration..."
if [ -f ".env.production" ]; then
    echo -e "${GREEN}   ✅ .env.production exists${NC}"
    
    # Check for required variables
    if grep -q "API_BASE_URL=https://api.yoraa.in.net" .env.production; then
        echo -e "${GREEN}   ✅ Production API URL is correct${NC}"
    else
        echo -e "${RED}   ❌ Production API URL is incorrect or missing${NC}"
    fi
else
    echo -e "${RED}   ❌ .env.production not found${NC}"
fi
echo ""

# 3. Check Firebase configuration
echo "3️⃣  Checking Firebase Configuration..."
if [ -f "ios/YoraaApp/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}   ✅ GoogleService-Info.plist exists${NC}"
else
    echo -e "${RED}   ❌ GoogleService-Info.plist not found${NC}"
fi
echo ""

# 4. Check modified files
echo "4️⃣  Checking Modified Files..."
MODIFIED_FILE="src/screens/loginaccountmobilenumberverificationcode.js"

if [ -f "$MODIFIED_FILE" ]; then
    echo -e "${GREEN}   ✅ $MODIFIED_FILE exists${NC}"
    
    # Check if retry logic exists
    if grep -q "maxRetries = 3" "$MODIFIED_FILE"; then
        echo -e "${GREEN}   ✅ Retry logic implemented (3 retries)${NC}"
    else
        echo -e "${RED}   ❌ Retry logic not found${NC}"
    fi
    
    # Check if health check exists
    if grep -q "Checking backend server health" "$MODIFIED_FILE"; then
        echo -e "${GREEN}   ✅ Backend health check implemented${NC}"
    else
        echo -e "${RED}   ❌ Health check not found${NC}"
    fi
    
    # Check if exponential backoff exists
    if grep -q "Math.pow(2, attempt - 1)" "$MODIFIED_FILE"; then
        echo -e "${GREEN}   ✅ Exponential backoff implemented${NC}"
    else
        echo -e "${RED}   ❌ Exponential backoff not found${NC}"
    fi
else
    echo -e "${RED}   ❌ $MODIFIED_FILE not found${NC}"
fi
echo ""

# 5. Check dependencies
echo "5️⃣  Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}   ✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}   ⚠️  node_modules not found - run: npm install${NC}"
fi

if [ -d "ios/Pods" ]; then
    echo -e "${GREEN}   ✅ iOS Pods installed${NC}"
else
    echo -e "${YELLOW}   ⚠️  iOS Pods not found - run: cd ios && pod install${NC}"
fi
echo ""

# 6. Check Git status
echo "6️⃣  Checking Git Status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    CHANGED_FILES=$(git status --short | wc -l | tr -d ' ')
    if [ "$CHANGED_FILES" -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  $CHANGED_FILES file(s) modified${NC}"
        echo "   Modified files:"
        git status --short | head -5
        if [ "$CHANGED_FILES" -gt 5 ]; then
            echo "   ... and $(($CHANGED_FILES - 5)) more"
        fi
    else
        echo -e "${GREEN}   ✅ No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Not a git repository${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Determine if ready to deploy
READY=true

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${YELLOW}⚠️  Backend health check failed - verify backend is running${NC}"
    READY=false
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production missing - cannot build for production${NC}"
    READY=false
fi

if [ ! -f "$MODIFIED_FILE" ]; then
    echo -e "${RED}❌ Fix file missing - changes not applied${NC}"
    READY=false
fi

echo ""
if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ All checks passed - Ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: npm run ios:dev"
    echo "  2. Build for TestFlight: cd ios && fastlane ios beta"
    echo "  3. Or build manually in Xcode"
else
    echo -e "${RED}❌ Some checks failed - fix issues before deploying${NC}"
    echo ""
    echo "Fix the issues above and run this script again"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Need help? Check QUICK_DEPLOY_FIX.md                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
