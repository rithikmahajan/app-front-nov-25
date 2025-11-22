#!/bin/bash

# ============================================================================
# iOS TestFlight Rebuild Script - After Cache Fix
# Run this to rebuild app with backend connection fixes
# ============================================================================

set -e

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
echo -e "${BOLD}🔄 iOS TestFlight Rebuild - Backend Connection Fix${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}This rebuild includes:${NC}"
echo "  ✅ Production backend connection fix"
echo "  ✅ Cache clearing on first launch"
echo "  ✅ Environment variables properly injected"
echo ""

cd "$(dirname "$0")"

# Check symlink exists
echo -e "${BLUE}📋 Checking configuration...${NC}"
echo ""

if [ -L "ios/.env.production" ]; then
    echo -e "${GREEN}✅ .env.production symlink exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating .env.production symlink...${NC}"
    cd ios
    ln -sf ../.env.production .env.production
    cd ..
    echo -e "${GREEN}✅ Symlink created${NC}"
fi
echo ""

# Test backend
echo -e "${BLUE}🔍 Testing backend connection...${NC}"
if curl -s -f -m 10 "https://api.yoraa.in.net/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is live!${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    echo -e "${YELLOW}Please check backend before building${NC}"
    exit 1
fi
echo ""

# Show backend URL
BACKEND_URL=$(grep "^BACKEND_URL=" .env.production | cut -d '=' -f2)
echo -e "${CYAN}Production Backend:${NC} ${BOLD}$BACKEND_URL${NC}"
echo ""

read -p "Ready to rebuild for TestFlight? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rebuild cancelled.${NC}"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 1: Cleaning Build Environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

echo "🧹 Cleaning iOS build folder..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 2: Reinstalling Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 Deintegrating pods..."
pod deintegrate
echo ""

echo "📦 Installing fresh pods..."
pod install
echo -e "${GREEN}✅ Pods installed${NC}"
echo ""

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 3: Opening Xcode${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}Opening Xcode workspace...${NC}"
cd ios
open Yoraa.xcworkspace &
cd ..
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Ready to Archive!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}${BOLD}📋 In Xcode:${NC}"
echo ""
echo -e "${CYAN}1. Increment Build Number${NC}"
echo "   • Select project → General"
echo "   • Current: Build 10"
echo "   • Change to: Build 11 (or next available)"
echo ""
echo -e "${CYAN}2. Verify Configuration${NC}"
echo "   • Scheme: Release"
echo "   • Device: Any iOS Device (arm64)"
echo ""
echo -e "${CYAN}3. Clean Build Folder${NC}"
echo "   • Product → Clean Build Folder (⌘⇧K)"
echo ""
echo -e "${CYAN}4. Create Archive${NC}"
echo "   • Product → Archive"
echo "   • Wait 5-10 minutes"
echo ""
echo -e "${CYAN}5. Distribute to TestFlight${NC}"
echo "   • Organizer → Distribute App"
echo "   • App Store Connect → Upload"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BOLD}📝 After Upload:${NC}"
echo ""
echo "  1. Wait for Apple to process (20-30 minutes)"
echo "  2. Check App Store Connect for new build"
echo "  3. Add to TestFlight test group"
echo "  4. ${YELLOW}IMPORTANT:${NC} Tell testers to:"
echo "     • Delete old app first"
echo "     • Install fresh from TestFlight"
echo "     • This ensures cache is cleared"
echo ""

echo -e "${GREEN}🎉 Your rebuild includes the backend connection fix!${NC}"
echo ""
echo -e "${CYAN}💡 Tip:${NC} After testers install, verify:"
echo "   • Products load from backend"
echo "   • Cart operations work"
echo "   • No cached/stale data"
echo ""
