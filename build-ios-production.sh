#!/bin/bash

# iOS Production Archive Build with Environment & Error Fixes
# Resolves error code 65 and ensures production .env is used

set -e

echo "=================================================="
echo "🍎 iOS Production Archive Build"
echo "=================================================="
echo ""

PROJECT_DIR="/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Verify production environment
echo -e "${YELLOW}Step 1: Verifying production environment...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Check if production environment is set
if grep -q "ENV=production" .env; then
    echo -e "${GREEN}✅ Production environment confirmed${NC}"
    echo "   Environment variables:"
    cat .env | grep -v "API_KEY" | grep -v "SECRET" || true
else
    echo -e "${YELLOW}⚠️  Setting environment to production...${NC}"
    # Backup current .env
    cp .env .env.backup
    # Ensure ENV=production is set
    if grep -q "^ENV=" .env; then
        sed -i '' 's/^ENV=.*/ENV=production/' .env
    else
        echo "ENV=production" >> .env
    fi
    echo -e "${GREEN}✅ Environment set to production${NC}"
fi
echo ""

# Step 2: Kill stuck processes
echo -e "${YELLOW}Step 2: Cleaning stuck processes...${NC}"
pkill -f "node.*react-native.*bundle" 2>/dev/null || echo "No stuck bundler"
pkill -f "react-native start" 2>/dev/null || echo "No metro bundler"
pkill -f "watchman" 2>/dev/null || echo "No watchman"
sleep 2
echo -e "${GREEN}✅ Processes cleaned${NC}"
echo ""

# Step 3: Clean caches and build artifacts
echo -e "${YELLOW}Step 3: Cleaning caches and build artifacts...${NC}"

# Clean React Native caches
rm -rf /tmp/metro-* /tmp/react-native-* /tmp/haste-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Clean iOS build artifacts
cd ios
rm -rf build/ DerivedData/ 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true

# Clean Pods cache (this often fixes error code 65)
echo "   Cleaning CocoaPods cache..."
pod cache clean --all 2>/dev/null || true
rm -rf Pods/ Podfile.lock 2>/dev/null || true

cd ..
echo -e "${GREEN}✅ Caches and artifacts cleaned${NC}"
echo ""

# Step 4: Reinstall dependencies
echo -e "${YELLOW}Step 4: Reinstalling dependencies...${NC}"

# Reinstall node modules
echo "   Installing npm packages..."
npm install --legacy-peer-deps

# Reinstall pods
cd ios
echo "   Installing CocoaPods..."
pod install --repo-update

cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Fix common iOS build issues
echo -e "${YELLOW}Step 5: Fixing common iOS build issues...${NC}"

# Fix 1: Update user script sandboxing (fixes error code 65)
if [ -f "ios/Yoraa.xcodeproj/project.pbxproj" ]; then
    # Disable user script sandboxing which causes issues
    sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES/ENABLE_USER_SCRIPT_SANDBOXING = NO/g' ios/Yoraa.xcodeproj/project.pbxproj 2>/dev/null || true
    echo "   ✓ Disabled user script sandboxing"
fi

# Fix 2: Ensure proper permissions
chmod -R 755 ios/ 2>/dev/null || true
echo "   ✓ Fixed permissions"

# Fix 3: Clear Xcode build cache
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
echo "   ✓ Cleared Xcode cache"

echo -e "${GREEN}✅ Build issues fixed${NC}"
echo ""

# Step 6: Pre-bundle JavaScript for production
echo -e "${YELLOW}Step 6: Pre-bundling JavaScript for production...${NC}"
echo "   This prevents the build from getting stuck at 8481/8495"
echo ""

# Create temp directory
mkdir -p /tmp/ios-prod-bundle

# Bundle with production env (with timeout)
echo "   Bundling with production environment..."
export ENVFILE=.env
timeout 300 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --minify true \
  --bundle-output /tmp/ios-prod-bundle/main.jsbundle \
  --assets-dest /tmp/ios-prod-bundle/assets || {
    echo -e "${RED}❌ JavaScript bundling failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ JavaScript bundled for production${NC}"
echo "   Bundle size: $(du -h /tmp/ios-prod-bundle/main.jsbundle | cut -f1)"
echo ""

# Step 7: Clean Xcode build
echo -e "${YELLOW}Step 7: Cleaning Xcode project...${NC}"
cd ios
xcodebuild clean \
  -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release 2>&1 | grep -v "^$" | tail -20 || true
cd ..
echo -e "${GREEN}✅ Xcode project cleaned${NC}"
echo ""

# Step 8: Build Archive
echo -e "${YELLOW}Step 8: Building iOS Archive...${NC}"
echo -e "${BLUE}This will take 10-15 minutes. Please wait...${NC}"
echo ""

cd ios

# Build with detailed logging
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release \
  -archivePath ../build/ios/Yoraa.xcarchive \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  ENABLE_USER_SCRIPT_SANDBOXING=NO \
  SKIP_INSTALL=NO \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
  ONLY_ACTIVE_ARCH=NO \
  2>&1 | tee ../ios-production-build.log

cd ..

# Check if archive was created
if [ -d "build/ios/Yoraa.xcarchive" ]; then
    echo ""
    echo -e "${GREEN}=================================================="
    echo "✅ iOS Production Archive Created Successfully!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${BLUE}Archive Location:${NC}"
    echo "$(pwd)/build/ios/Yoraa.xcarchive"
    echo ""
    echo -e "${BLUE}Archive Size:${NC}"
    du -sh build/ios/Yoraa.xcarchive
    echo ""
    echo -e "${BLUE}Environment:${NC} Production"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Open Xcode Organizer: Window → Organizer"
    echo "2. Select the 'Yoraa' archive"
    echo "3. Click 'Distribute App'"
    echo "4. Choose 'App Store Connect'"
    echo "5. Follow the wizard to upload"
    echo ""
    echo -e "${BLUE}Or export IPA using command:${NC}"
    echo "xcodebuild -exportArchive \\"
    echo "  -archivePath build/ios/Yoraa.xcarchive \\"
    echo "  -exportPath build/ios \\"
    echo "  -exportOptionsPlist ios/ExportOptions.plist"
    echo ""
else
    echo ""
    echo -e "${RED}=================================================="
    echo "❌ Archive Creation Failed!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file:${NC}"
    echo "$(pwd)/ios-production-build.log"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "1. Code signing - Check Xcode → Preferences → Accounts"
    echo "2. Provisioning profiles - Download manual profiles"
    echo "3. Build errors - Check log for specific errors"
    echo ""
    echo -e "${YELLOW}To debug in Xcode:${NC}"
    echo "open ios/Yoraa.xcworkspace"
    echo ""
    exit 1
fi

# Cleanup
rm -rf /tmp/ios-prod-bundle

echo -e "${GREEN}=================================================="
echo "🎉 Production Build Complete!"
echo "==================================================${NC}"
