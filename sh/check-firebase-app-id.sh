#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🔍 FIREBASE APP ID MISMATCH DETECTED!              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 PROBLEM IDENTIFIED:${NC}"
echo ""
echo "Your google-services.json uses this App ID:"
echo -e "${GREEN}  1:133733122921:android:85c2c3dcb293fdf35b3f8${NC}"
echo ""
echo "But you added SHA certificates to a DIFFERENT app:"
echo -e "${YELLOW}  1:133733122921:android:1e06335e663ae7ed35b3f8${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}📋 CURRENT APP INFO FROM google-services.json:${NC}"
echo ""
cat android/app/google-services.json | grep -A 3 "client_info" | head -6
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ SOLUTION (Choose ONE):${NC}"
echo ""
echo -e "${BLUE}Option 1: Add SHA to the CORRECT app (RECOMMENDED - 2 mins)${NC}"
echo "  1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/settings/general"
echo "  2. Find the app with App ID ending in: ${GREEN}85c2c3dcb293fdf35b3f8${NC}"
echo "  3. Click 'Add fingerprint' and add your SHA certificates"
echo "  4. Wait 5-10 minutes"
echo "  5. Test - should work!"
echo ""

echo -e "${BLUE}Option 2: Use the other app's config (Alternative)${NC}"
echo "  1. In Firebase Console, find app ending in: ${YELLOW}1e06335e663ae7ed35b3f8${NC}"
echo "  2. Download its google-services.json"
echo "  3. Replace android/app/google-services.json"
echo "  4. Rebuild the app"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}📌 RECOMMENDATION:${NC}"
echo "Use Option 1 - it's faster and doesn't require rebuilding."
echo ""

echo -e "${CYAN}🔍 WHY THIS HAPPENED:${NC}"
echo "You likely created multiple Android apps in Firebase Console."
echo "The SHA certificates were added to the wrong app."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ After fixing, your production login should work!${NC}"
echo ""
