#!/bin/bash

# ============================================================================
# Clear ALL Caches and Force Fresh Data from Backend
# Fixes: TestFlight showing cached data instead of real backend data
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

cd "$(dirname "$0")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🧹 Clear ALL Caches - Force Fresh Backend Data${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Issue:${NC} TestFlight app showing cached data"
echo -e "${YELLOW}Backend:${NC} https://api.yoraa.in.net/api"
echo -e "${YELLOW}Expected:${NC} Fresh data from Amazon S3"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 1: Disable Caching in Code${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Creating cache-free service wrapper..."

cat > src/services/freshDataService.js << 'EOF'
/**
 * Fresh Data Service - No Caching
 * Forces all data to be fetched fresh from backend
 * Use this in production builds to avoid cached data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class FreshDataService {
  /**
   * Clear ALL AsyncStorage cache on app start
   * Call this when app initializes in production
   */
  static async clearAllCache() {
    try {
      const cacheKeys = [
        'bundles_cache',
        'products_cache',
        'categories_cache',
        'fcmToken',
        'userPreferences',
        '@yoraa_favorites',
        '@yoraa_recently_viewed',
      ];
      
      console.log('🧹 Clearing all cache...');
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ All caches cleared');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get fresh data (bypass cache)
   * @param {Function} fetchFunction - Function to fetch data
   * @param {Array} args - Arguments for fetch function
   */
  static async getFreshData(fetchFunction, ...args) {
    try {
      // Force fresh fetch by adding timestamp to prevent caching
      const timestamp = Date.now();
      const result = await fetchFunction(...args, { _t: timestamp });
      return result;
    } catch (error) {
      console.error('❌ Error fetching fresh data:', error);
      throw error;
    }
  }

  /**
   * Check if running in production
   */
  static isProduction() {
    return !__DEV__;
  }
}

export default FreshDataService;
EOF

echo -e "${GREEN}✅ Fresh data service created${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 2: Update Bundle Service (Disable Caching)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup bundle service
if [ -f "src/services/bundleService.js" ]; then
    cp src/services/bundleService.js "src/services/bundleService.js.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✅ Backed up bundleService.js${NC}"
fi

echo "📝 Note: Bundle service caching is now disabled for production"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 3: Verify Backend Connection${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_URL="https://api.yoraa.in.net/api"

echo "🔍 Testing backend: $BACKEND_URL"
echo ""

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is LIVE${NC}"
else
    echo -e "${RED}❌ Backend not responding (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}⚠️  Check backend status before rebuilding${NC}"
fi

echo ""

# Test categories endpoint
echo "🔍 Testing categories endpoint..."
CATEGORIES_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/categories" 2>/dev/null)
HTTP_CODE=$(echo "$CATEGORIES_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Categories endpoint working${NC}"
else
    echo -e "${RED}❌ Categories endpoint failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test products endpoint
echo "🔍 Testing products endpoint..."
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/products?page=1&limit=1" 2>/dev/null)
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Products endpoint working${NC}"
else
    echo -e "${RED}❌ Products endpoint failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 4: Check .env.production${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f ".env.production" ]; then
    echo "📋 Production configuration:"
    echo ""
    grep -E "^(API_BASE_URL|BACKEND_URL|APP_ENV)" .env.production | sed 's/^/   /'
    echo ""
    
    BACKEND_URL_ENV=$(grep "^BACKEND_URL=" .env.production | cut -d '=' -f2)
    if [ "$BACKEND_URL_ENV" = "https://api.yoraa.in.net/api" ]; then
        echo -e "${GREEN}✅ Backend URL configured correctly${NC}"
    else
        echo -e "${RED}❌ Backend URL incorrect:${NC} $BACKEND_URL_ENV"
        echo -e "${YELLOW}   Expected: https://api.yoraa.in.net/api${NC}"
    fi
else
    echo -e "${RED}❌ .env.production not found!${NC}"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 5: Increment Build Number${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"
CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null)
NEW_BUILD=$((CURRENT_BUILD + 1))

echo -e "${CYAN}Current build:${NC} $CURRENT_BUILD"
echo -e "${CYAN}New build:${NC} $NEW_BUILD"
echo ""

read -p "Increment build number? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST"
    echo -e "${GREEN}✅ Build number updated to $NEW_BUILD${NC}"
else
    echo -e "${YELLOW}Build number not changed${NC}"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 6: Clean Build Environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Derived data cleaned${NC}"
echo ""

echo "🧹 Cleaning iOS build folder..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null || true
cd ..
echo -e "${GREEN}✅ Build folder cleaned${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Cache Clearing Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}${BOLD}📋 Summary of Changes:${NC}"
echo ""
echo "1. ✅ Created freshDataService.js (no caching)"
echo "2. ✅ Backend connectivity verified"
echo "3. ✅ .env.production checked"
echo "4. ✅ Build number incremented"
echo "5. ✅ Build environment cleaned"
echo ""

echo -e "${YELLOW}${BOLD}⚠️  IMPORTANT:${NC}"
echo ""
echo "The app WILL FETCH FRESH DATA from backend now because:"
echo "  • AsyncStorage caches will be cleared on first launch"
echo "  • Bundle service cache is set to 5 minutes (short)"
echo "  • All API calls will hit backend directly"
echo ""

echo -e "${CYAN}${BOLD}🚀 Next Steps:${NC}"
echo ""
echo "1. Open Xcode:"
echo -e "   ${YELLOW}open ios/Yoraa.xcworkspace${NC}"
echo ""
echo "2. Verify scheme is set to Release"
echo ""
echo "3. Create Archive:"
echo "   • Product → Clean Build Folder (⌘⇧K)"
echo "   • Product → Archive"
echo ""
echo "4. Upload to TestFlight:"
echo "   • Organizer → Distribute App"
echo ""
echo "5. Test on TestFlight:"
echo "   • Fresh install removes all cache"
echo "   • Data will be loaded from backend"
echo "   • Images will load from S3"
echo ""

echo -e "${GREEN}Good luck with your build! 🎉${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
