#!/bin/bash

# React Native iOS Production Build Script with Environment Configuration
echo "🍎 Building iOS App for PRODUCTION (TestFlight)..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check current directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.production file...${NC}"
    cat > .env.production << EOF
API_BASE_URL=http://185.193.19.244:8000/api
BACKEND_URL=http://185.193.19.244:8000/api
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
USE_PROXY=false
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false
BUILD_TYPE=release
EOF
    echo -e "${GREEN}✅ .env.production created${NC}"
    echo -e "${RED}⚠️  Please update production URLs if needed${NC}"
fi

echo -e "${BLUE}📋 Production Configuration:${NC}"
echo -e "  🌐 API URL: $(grep API_BASE_URL .env.production | cut -d '=' -f2)"
echo -e "  🏭 Environment: Production"
echo -e "  📱 Build Version: $(grep 'CFBundleVersion' ios/YoraaApp/Info.plist | sed 's/.*<string>\(.*\)<\/string>.*/\1/')"
echo -e "  🛠️  Debug Mode: Disabled"
echo -e "  🔄 Proxy: Disabled"
echo ""

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
cd ios && xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa
cd ..

# Clear React Native cache
echo -e "${YELLOW}🧹 Clearing React Native cache...${NC}"
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Install iOS pods
echo -e "${YELLOW}📦 Installing iOS pods...${NC}"
cd ios && pod install && cd ..

echo -e "${YELLOW}🏗️  Preparing for iOS production build...${NC}"
echo -e "${BLUE}� Instructions:${NC}"
echo -e "  1. Xcode will open with production environment set"
echo -e "  2. Select 'Any iOS Device (arm64)' as destination"
echo -e "  3. Go to Product → Archive"
echo -e "  4. Upload to App Store Connect"
echo ""

# Set environment and open Xcode
echo -e "${YELLOW}🔧 Setting production environment...${NC}"
export ENVFILE=.env.production

# Open Xcode for manual build
echo -e "${YELLOW}🚀 Opening Xcode...${NC}"
open ios/Yoraa.xcworkspace

echo ""
echo -e "${GREEN}✅ Production environment configured${NC}"
echo -e "${GREEN}✅ Xcode workspace opened${NC}"
echo -e "${YELLOW}⏳ Ready for archiving in Xcode...${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps in Xcode:${NC}"
echo -e "  1. Select your team and signing certificate"
echo -e "  2. Select 'Any iOS Device (arm64)' as the destination"
echo -e "  3. Go to Product → Archive"
echo -e "  4. Once archive is complete, click 'Distribute App'"
echo -e "  5. Choose 'App Store Connect' and follow the upload process"
echo ""
echo -e "${GREEN}✅ Build version: $(grep 'CFBundleVersion' ios/YoraaApp/Info.plist | sed 's/.*<string>\(.*\)<\/string>.*/\1/')${NC}"
echo -e "${GREEN}✅ Production environment: Direct backend connection${NC}"
echo -e "${GREEN}✅ Ready for TestFlight deployment!${NC}"
