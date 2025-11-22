#!/bin/bash

# ============================================================================
# iOS Production Backend Diagnostic & Fix Script
# Diagnoses why TestFlight shows cached data instead of real backend data
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
echo -e "${BOLD}🔍 iOS Production Backend Diagnostic${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}Checking why TestFlight shows cached data...${NC}"
echo ""

# Change to project root
cd "$(dirname "$0")"

# Check 1: Backend connectivity
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 1: Backend Connectivity${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_URL="https://api.yoraa.in.net/api"
echo "Testing: $BACKEND_URL/health"

if curl -s -f -m 10 "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
    RESPONSE=$(curl -s "$BACKEND_URL/health")
    echo -e "${CYAN}Response:${NC} $RESPONSE"
else
    echo -e "${RED}❌ Backend not responding!${NC}"
    echo -e "${YELLOW}⚠️  This could be why you're seeing cached data${NC}"
fi
echo ""

# Check 2: Environment configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 2: Environment Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production exists${NC}"
    echo ""
    BACKEND_URL_ENV=$(grep "^BACKEND_URL=" .env.production | cut -d '=' -f2)
    API_BASE_URL_ENV=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
    APP_ENV=$(grep "^APP_ENV=" .env.production | cut -d '=' -f2)
    BUILD_TYPE=$(grep "^BUILD_TYPE=" .env.production | cut -d '=' -f2)
    
    echo -e "${CYAN}Configuration:${NC}"
    echo "  BACKEND_URL: $BACKEND_URL_ENV"
    echo "  API_BASE_URL: $API_BASE_URL_ENV"
    echo "  APP_ENV: $APP_ENV"
    echo "  BUILD_TYPE: $BUILD_TYPE"
    echo ""
    
    if [ "$BACKEND_URL_ENV" = "https://api.yoraa.in.net/api" ]; then
        echo -e "${GREEN}✅ Backend URL is correct${NC}"
    else
        echo -e "${RED}❌ Backend URL is incorrect!${NC}"
        echo -e "${YELLOW}Expected: https://api.yoraa.in.net/api${NC}"
    fi
else
    echo -e "${RED}❌ .env.production not found!${NC}"
fi
echo ""

# Check 3: Xcode scheme configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 3: Xcode Build Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCHEME_FILE="ios/Yoraa.xcodeproj/xcshareddata/xcschemes/Yoraa.xcscheme"

if [ -f "$SCHEME_FILE" ]; then
    echo -e "${GREEN}✅ Scheme file exists${NC}"
    
    # Check if scheme is set to Release for Archive
    if grep -q "buildConfiguration = \"Release\"" "$SCHEME_FILE"; then
        echo -e "${GREEN}✅ Archive configuration uses Release build${NC}"
    else
        echo -e "${RED}❌ Archive configuration might not be using Release${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Scheme file not found (might be okay)${NC}"
fi
echo ""

# Check 4: Info.plist configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 4: Info.plist Security Settings${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"

if [ -f "$INFO_PLIST" ]; then
    echo -e "${GREEN}✅ Info.plist exists${NC}"
    
    ARBITRARY_LOADS=$(/usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSAllowsArbitraryLoads" "$INFO_PLIST" 2>/dev/null)
    
    if [ "$ARBITRARY_LOADS" = "false" ]; then
        echo -e "${GREEN}✅ NSAllowsArbitraryLoads: false (secure)${NC}"
    else
        echo -e "${YELLOW}⚠️  NSAllowsArbitraryLoads: $ARBITRARY_LOADS${NC}"
    fi
    
    if /usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSExceptionDomains:api.yoraa.in.net" "$INFO_PLIST" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ api.yoraa.in.net exception configured${NC}"
    else
        echo -e "${RED}❌ api.yoraa.in.net exception NOT configured${NC}"
    fi
else
    echo -e "${RED}❌ Info.plist not found!${NC}"
fi
echo ""

# Check 5: Caching configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 5: App Caching Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}Searching for cache implementations...${NC}"
echo ""

# Check for AsyncStorage cache
if grep -r "AsyncStorage" src/services/*.js > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  AsyncStorage caching found in services${NC}"
    echo ""
    grep -l "AsyncStorage" src/services/*.js | while read file; do
        echo "  📄 $file"
        grep -n "getCached\|cache\|setItem" "$file" | head -3 | sed 's/^/     /'
    done
    echo ""
    echo -e "${RED}🚨 THIS IS LIKELY THE ISSUE!${NC}"
    echo -e "${YELLOW}   Your app is caching data locally and not fetching from backend${NC}"
fi

# Check for axios cache
if grep -r "cache.*maxAge\|cache.*ttl" src/ > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Axios response caching found${NC}"
    grep -rn "cache.*maxAge\|cache.*ttl" src/ | head -5
fi
echo ""

# Check 6: react-native-config integration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Check 6: React Native Config Integration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "react-native-config" package.json; then
    echo -e "${GREEN}✅ react-native-config is installed${NC}"
else
    echo -e "${RED}❌ react-native-config NOT installed!${NC}"
    echo -e "${YELLOW}   This is required to read .env.production in iOS${NC}"
fi
echo ""

# Check for .env.production symlink in ios folder
if [ -L "ios/.env.production" ] || [ -f "ios/.env.production" ]; then
    echo -e "${GREEN}✅ .env.production accessible in ios folder${NC}"
else
    echo -e "${RED}❌ .env.production NOT accessible in ios folder${NC}"
    echo -e "${YELLOW}   react-native-config might not be able to read it${NC}"
fi
echo ""

# Diagnosis Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}📊 Diagnosis Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}Most Likely Causes of Cached Data in TestFlight:${NC}"
echo ""
echo "1. ${BOLD}App is using AsyncStorage cache${NC}"
echo "   → Data is stored locally and displayed even offline"
echo "   → Cache might have long expiry (5+ minutes)"
echo ""
echo "2. ${BOLD}Build was created in Debug mode${NC}"
echo "   → __DEV__ flag is true"
echo "   → App uses development URL (localhost)"
echo "   → Falls back to cached data when backend unreachable"
echo ""
echo "3. ${BOLD}.env.production not bundled correctly${NC}"
echo "   → Archive didn't include production environment"
echo "   → App defaults to development config"
echo ""
echo "4. ${BOLD}App not rebuilt after config changes${NC}"
echo "   → Old bundle still has localhost URL hardcoded"
echo "   → Need to clean build and re-archive"
echo ""

# Solutions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}✅ Solutions${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}Option 1: Quick Fix - Disable Caching (Recommended)${NC}"
echo ""
echo "Add this to your app initialization:"
echo ""
cat << 'EOF'
// In App.js or index.js - BEFORE any API calls
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all cache on app start (production only)
if (!__DEV__) {
  AsyncStorage.clear();
  console.log('🧹 Cache cleared for production');
}
EOF
echo ""

echo -e "${CYAN}Option 2: Force Fresh Build (Recommended)${NC}"
echo ""
echo "Run these commands:"
echo ""
echo "  # 1. Clean everything"
echo "  cd ios"
echo "  rm -rf ~/Library/Developer/Xcode/DerivedData/*"
echo "  pod deintegrate && pod install"
echo "  cd .."
echo ""
echo "  # 2. Set Xcode to Release"
echo "  # In Xcode: Scheme → Edit Scheme → Build Configuration: Release"
echo ""
echo "  # 3. Create new archive"
echo "  # Product → Clean Build Folder (⌘⇧K)"
echo "  # Product → Archive"
echo ""

echo -e "${CYAN}Option 3: Verify Environment in Code (Debug)${NC}"
echo ""
echo "Add this temporarily to see what environment is being used:"
echo ""
cat << 'EOF'
// In App.js - useEffect
useEffect(() => {
  console.log('🔍 Environment Check:');
  console.log('__DEV__:', __DEV__);
  console.log('Config.APP_ENV:', Config.APP_ENV);
  console.log('Config.BACKEND_URL:', Config.BACKEND_URL);
  console.log('Config.BUILD_TYPE:', Config.BUILD_TYPE);
}, []);
EOF
echo ""

echo -e "${CYAN}Option 4: Test Backend Connection in App${NC}"
echo ""
echo "Add this to verify backend connectivity:"
echo ""
cat << 'EOF'
// Test backend connection
useEffect(() => {
  async function testBackend() {
    try {
      const response = await fetch('https://api.yoraa.in.net/api/health');
      const data = await response.json();
      console.log('✅ Backend connected:', data);
      Alert.alert('Backend Status', `Connected: ${data.success}`);
    } catch (error) {
      console.error('❌ Backend error:', error);
      Alert.alert('Backend Error', error.message);
    }
  }
  testBackend();
}, []);
EOF
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🎯 Recommended Action Plan${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Add AsyncStorage.clear() to App.js (for production)"
echo "2. Clean build in Xcode"
echo "3. Verify scheme is set to Release"
echo "4. Create fresh archive"
echo "5. Upload to TestFlight"
echo "6. Test and verify real backend data loads"
echo ""
echo -e "${GREEN}This should fix the cached data issue! 🚀${NC}"
echo ""
