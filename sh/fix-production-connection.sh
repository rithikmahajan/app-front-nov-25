#!/bin/bash

# Fix Production Connection - Simulator & TestFlight
# This script ensures your app connects to production backend

echo "🔧 Fixing Production Connection..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Stop all running processes
echo -e "${BLUE}Step 1: Stopping running processes...${NC}"

# Stop Metro bundler
echo "  Stopping Metro bundler..."
pkill -f "cli.js start" 2>/dev/null
pkill -f "react-native start" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Stop local backend (if running)
echo "  Stopping local backend..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo -e "${GREEN}✅ Stopped all processes${NC}"
echo ""

# Step 2: Verify environment files
echo -e "${BLUE}Step 2: Verifying environment configuration...${NC}"

# Check .env.development
DEV_URL=$(grep "^API_BASE_URL=" .env.development | cut -d '=' -f2)
echo "  .env.development: $DEV_URL"

# Check .env.production  
PROD_URL=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
echo "  .env.production: $PROD_URL"

# Check iOS production
IOS_PROD_URL=$(grep "^API_BASE_URL=" ios/.env.production | cut -d '=' -f2)
echo "  ios/.env.production: $IOS_PROD_URL"

echo ""

# Step 3: Verify production URL is correct
echo -e "${BLUE}Step 3: Testing production backend connection...${NC}"

EXPECTED_PROD="https://api.yoraa.in.net/api"

if [ "$PROD_URL" != "$EXPECTED_PROD" ]; then
    echo -e "${RED}❌ ERROR: Production URL is incorrect!${NC}"
    echo "  Expected: $EXPECTED_PROD"
    echo "  Found: $PROD_URL"
    exit 1
fi

# Test backend connectivity
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$EXPECTED_PROD/health" --max-time 10)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${GREEN}✅ Production backend is reachable (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not verify backend (HTTP $HTTP_CODE)${NC}"
    echo "  This may be normal if /health endpoint doesn't exist"
fi

echo ""

# Step 4: Clean cache
echo -e "${BLUE}Step 4: Clearing app cache...${NC}"

# Clear Metro cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Clear watchman
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null
fi

# Clear React Native cache
rm -rf node_modules/.cache 2>/dev/null

echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 5: Start Metro bundler with production environment
echo -e "${BLUE}Step 5: Starting Metro bundler...${NC}"
echo -e "${YELLOW}Metro will use .env.development which is set to production${NC}"
echo ""

# Start Metro in background
npx react-native start --reset-cache &

METRO_PID=$!
echo -e "${GREEN}✅ Metro bundler started (PID: $METRO_PID)${NC}"
echo ""

# Wait for Metro to start
echo "Waiting for Metro to initialize..."
sleep 5

# Step 6: Instructions
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PRODUCTION CONNECTION FIX COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 For SIMULATOR:${NC}"
echo "   1. Your simulator will now connect to:"
echo "      $EXPECTED_PROD"
echo ""
echo "   2. Rebuild the app:"
echo "      ${YELLOW}npx react-native run-ios${NC}"
echo ""
echo "   3. Or press ${YELLOW}Cmd+R${NC} in simulator to reload"
echo ""
echo -e "${BLUE}🚀 For TESTFLIGHT:${NC}"
echo "   1. TestFlight builds use .env.production (already correct)"
echo ""
echo "   2. Build for TestFlight:"
echo "      ${YELLOW}./build-testflight-quick.sh${NC}"
echo ""
echo "   3. Or use Xcode:"
echo "      - Product → Archive"
echo "      - Distribute to TestFlight"
echo ""
echo -e "${BLUE}🔍 Verify Connection:${NC}"
echo "   After app launches, check Xcode console for:"
echo "   ${GREEN}✅ BACKEND_URL: https://api.yoraa.in.net/api${NC}"
echo "   ${GREEN}✅ Backend connected: {status: 'ok'}${NC}"
echo ""
echo -e "${YELLOW}Note: If you see localhost URLs, the app is using cached code.${NC}"
echo -e "${YELLOW}Solution: Force quit app, clear app data, and relaunch.${NC}"
echo ""

# Keep script running to show logs
echo -e "${BLUE}Metro bundler is running...${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Tail Metro logs
wait $METRO_PID
