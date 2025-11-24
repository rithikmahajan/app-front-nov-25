#!/bin/bash

# ================================
# 🔧 Connect Frontend to Local Backend
# This script ensures your React Native app connects to localhost:8001
# ================================

set -e

echo "🔧 Configuring Frontend for Local Backend Development"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify .env.development exists and is correct
echo -e "${BLUE}📋 Step 1: Verifying environment configuration...${NC}"

if [ ! -f ".env.development" ]; then
    echo -e "${RED}❌ .env.development not found!${NC}"
    exit 1
fi

# Check if localhost:8001 is configured
if grep -q "localhost:8001" .env.development; then
    echo -e "${GREEN}✅ .env.development correctly configured for localhost:8001${NC}"
else
    echo -e "${YELLOW}⚠️  Updating .env.development to use localhost:8001...${NC}"
    sed -i '' 's|localhost:5000|localhost:8001|g' .env.development
    echo -e "${GREEN}✅ Updated API_BASE_URL to localhost:8001${NC}"
fi

echo ""

# Step 2: Set environment to development
echo -e "${BLUE}📋 Step 2: Setting environment to DEVELOPMENT mode...${NC}"
export APP_ENV=development
export ENVFILE=.env.development
echo -e "${GREEN}✅ Environment set to development${NC}"
echo ""

# Step 3: Verify backend is running
echo -e "${BLUE}📋 Step 3: Checking if local backend is running...${NC}"
if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local backend is running on http://localhost:8001${NC}"
    echo -e "${GREEN}   Backend health check: PASSED${NC}"
else
    echo -e "${RED}❌ Local backend is NOT running on http://localhost:8001${NC}"
    echo -e "${YELLOW}   Please start the backend first with: npm run dev${NC}"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Step 4: Clean Metro bundler cache
echo -e "${BLUE}📋 Step 4: Cleaning Metro bundler cache...${NC}"
rm -rf $TMPDIR/metro-* $TMPDIR/haste-* 2>/dev/null || true
echo -e "${GREEN}✅ Metro cache cleared${NC}"
echo ""

# Step 5: Kill any existing Metro bundler
echo -e "${BLUE}📋 Step 5: Stopping existing Metro bundler...${NC}"
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Metro bundler stopped${NC}"
echo ""

# Step 6: Display configuration
echo -e "${BLUE}📋 Step 6: Current Configuration:${NC}"
echo -e "   Environment: ${GREEN}development${NC}"
echo -e "   API URL: ${GREEN}http://localhost:8001/api${NC}"
echo -e "   Config File: ${GREEN}.env.development${NC}"
echo ""

# Step 7: Start Metro bundler with clean cache
echo -e "${BLUE}📋 Step 7: Starting Metro bundler (clean cache)...${NC}"
echo -e "${YELLOW}   Metro will start in a new terminal window${NC}"
echo ""

# Start Metro in background
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && ENVFILE=.env.development npx react-native start --reset-cache"' &

# Wait for Metro to start
echo "⏳ Waiting for Metro bundler to start..."
sleep 5

# Check if Metro started successfully
if lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Metro bundler started successfully on port 8081${NC}"
else
    echo -e "${RED}❌ Metro bundler failed to start${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Frontend Ready for Local Development!          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo ""
echo -e "   ${YELLOW}For iOS:${NC}"
echo -e "   Run: ${GREEN}./run-ios-unlocked.sh${NC}"
echo -e "   Or:  ${GREEN}npx react-native run-ios${NC}"
echo ""
echo -e "   ${YELLOW}For Android:${NC}"
echo -e "   1. Run: ${GREEN}adb reverse tcp:8001 tcp:8001${NC}"
echo -e "   2. Run: ${GREEN}npx react-native run-android${NC}"
echo ""
echo -e "${BLUE}🔍 Verify Connection:${NC}"
echo -e "   The app will now connect to: ${GREEN}http://localhost:8001/api${NC}"
echo -e "   Check the Metro bundler logs to see API requests"
echo ""
echo -e "${BLUE}📊 Monitor Backend:${NC}"
echo -e "   Your backend terminal will show detailed logs for each request"
echo ""
