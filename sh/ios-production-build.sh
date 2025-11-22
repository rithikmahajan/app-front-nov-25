#!/bin/bash

# ============================================================================
# iOS Production Build Script - Backend Connection Setup
# Connects iOS app to production backend: https://api.yoraa.in.net/api
# ============================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🚀 iOS Production Build - Backend Connection Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}This script will:${NC}"
echo "  1. ✅ Configure iOS app for production backend"
echo "  2. ✅ Update Info.plist for secure HTTPS"
echo "  3. ✅ Clean build environment"
echo "  4. ✅ Install dependencies"
echo "  5. ✅ Prepare for TestFlight build"
echo ""
echo -e "${YELLOW}Production Backend: ${BOLD}https://api.yoraa.in.net/api${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production not found!${NC}"
    exit 1
fi

# Display current backend configuration
echo -e "${BLUE}📋 Current Production Configuration:${NC}"
echo ""
grep -E "^(API_BASE_URL|BACKEND_URL|APP_ENV)" .env.production | sed 's/^/   /'
echo ""

read -p "Continue with production build setup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Build setup cancelled.${NC}"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 1: Testing Backend Connection${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing production backend..."
if curl -s -f -m 10 "https://api.yoraa.in.net/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is live and responding!${NC}"
    
    # Get health response
    HEALTH_RESPONSE=$(curl -s "https://api.yoraa.in.net/api/health")
    echo -e "${CYAN}Response:${NC} $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Warning: Backend not responding${NC}"
    echo -e "${YELLOW}⚠️  The backend might be down or unreachable${NC}"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 2: Updating Info.plist for Production${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"

if [ ! -f "$INFO_PLIST" ]; then
    echo -e "${RED}❌ Error: Info.plist not found at $INFO_PLIST${NC}"
    exit 1
fi

echo "📝 Backing up current Info.plist..."
cp "$INFO_PLIST" "$INFO_PLIST.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

echo "🔧 Updating App Transport Security settings..."

# Create temporary Info.plist with production settings
cat > "$INFO_PLIST.tmp" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>YORAA</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>com.googleusercontent.apps.133733122921-535l0n0ld9ncak8bnic262sp0vnjrj92</string>
			</array>
		</dict>
		<dict>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLName</key>
			<string>YoraaAppBundleID</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>com.yoraaapparelsprivatelimited.yoraa</string>
			</array>
		</dict>
		<dict>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLName</key>
			<string>FirebasePhoneAuth</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>app-1-133733122921-ios-e10be6f1d6b5008735b3f8</string>
			</array>
		</dict>
	</array>
	<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>googlechrome</string>
		<string>googlechromes</string>
	</array>
	<key>CFBundleVersion</key>
	<string>10</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<false/>
		<key>NSAllowsLocalNetworking</key>
		<true/>
		<key>NSExceptionDomains</key>
		<dict>
			<key>api.yoraa.in.net</key>
			<dict>
				<key>NSIncludesSubdomains</key>
				<true/>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
				<key>NSExceptionRequiresForwardSecrecy</key>
				<true/>
			</dict>
			<key>yoraa.in.net</key>
			<dict>
				<key>NSIncludesSubdomains</key>
				<true/>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
			</dict>
			<key>localhost</key>
			<dict>
				<key>NSExceptionAllowsInsecureHTTPLoads</key>
				<true/>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.0</string>
			</dict>
			<key>usc1.contabostorage.com</key>
			<dict>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
				<key>NSExceptionRequiresForwardSecrecy</key>
				<false/>
			</dict>
		</dict>
	</dict>
	<key>NSCameraUsageDescription</key>
	<string>This app needs access to camera to allow you to take photos for feedback</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>This app uses your location to check if your pin code is serviceable and provide available delivery options in your area.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>This app needs access to microphone to enable voice search functionality</string>
	<key>NSPhotoLibraryAddUsageDescription</key>
	<string>This app needs access to photo library to save images</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>This app needs access to photo library to select images for feedback</string>
	<key>UIAppFonts</key>
	<array>
		<string>Poppins-Black.ttf</string>
		<string>Poppins-Bold.ttf</string>
		<string>Poppins-ExtraBold.ttf</string>
		<string>Poppins-ExtraLight.ttf</string>
		<string>Poppins-Light.ttf</string>
		<string>Poppins-Medium.ttf</string>
		<string>Poppins-Regular.ttf</string>
		<string>Poppins-SemiBold.ttf</string>
		<string>Poppins-Thin.ttf</string>
	</array>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>
</dict>
</plist>
EOF

# Replace Info.plist
mv "$INFO_PLIST.tmp" "$INFO_PLIST"

echo -e "${GREEN}✅ Info.plist updated for production${NC}"
echo ""
echo -e "${CYAN}Changes made:${NC}"
echo "   • NSAllowsArbitraryLoads: false (secure HTTPS only)"
echo "   • Added exception for api.yoraa.in.net (TLS 1.2+)"
echo "   • Kept localhost exception for development testing"
echo "   • Secured Contabo storage with TLS 1.2"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 3: Cleaning Build Environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Derived data cleaned${NC}"
echo ""

echo "🧹 Cleaning iOS build folder..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null || true
echo -e "${GREEN}✅ Build folder cleaned${NC}"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 4: Reinstalling Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 Deintegrating CocoaPods..."
pod deintegrate
echo ""

echo "📦 Installing fresh pods..."
pod install
echo -e "${GREEN}✅ Pods installed successfully${NC}"
echo ""

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 5: Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Verifying configuration files..."
echo ""

# Check GoogleService-Info.plist
if [ -f "ios/YoraaApp/GoogleService-Info.plist" ]; then
    PROJECT_ID=$(/usr/libexec/PlistBuddy -c "Print :PROJECT_ID" "ios/YoraaApp/GoogleService-Info.plist" 2>/dev/null)
    echo -e "${GREEN}✅ Firebase configuration found${NC}"
    echo -e "   Project ID: ${BLUE}$PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  GoogleService-Info.plist not found${NC}"
fi
echo ""

# Check Info.plist
if [ -f "$INFO_PLIST" ]; then
    echo -e "${GREEN}✅ Info.plist configured${NC}"
    
    # Verify NSAppTransportSecurity
    if /usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSExceptionDomains:api.yoraa.in.net" "$INFO_PLIST" > /dev/null 2>&1; then
        echo -e "   ✅ Production backend domain whitelisted"
    fi
fi
echo ""

# Check .env.production
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ Production environment configured${NC}"
    BACKEND_URL=$(grep "^BACKEND_URL=" .env.production | cut -d '=' -f2)
    echo -e "   Backend: ${BLUE}$BACKEND_URL${NC}"
fi
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Production Build Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}${BOLD}📱 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Opening Xcode workspace...${NC}"
echo ""

cd ios
open Yoraa.xcworkspace &
cd ..

sleep 2

echo -e "${BOLD}2. In Xcode, configure for production:${NC}"
echo ""
echo "   ${CYAN}Build Configuration:${NC}"
echo "   • Click scheme selector (top-left)"
echo "   • Edit Scheme → Run"
echo "   • Build Configuration: ${BOLD}Release${NC}"
echo ""
echo "   ${CYAN}Select Device:${NC}"
echo "   • Click device selector"
echo "   • Choose: ${BOLD}Any iOS Device (arm64)${NC}"
echo ""
echo "   ${CYAN}Signing:${NC}"
echo "   • Target → Signing & Capabilities"
echo "   • Enable 'Automatically manage signing'"
echo "   • Select your Apple Developer Team"
echo ""

echo -e "${BOLD}3. Create Archive:${NC}"
echo ""
echo "   • Menu: ${CYAN}Product → Clean Build Folder${NC} (⌘⇧K)"
echo "   • Menu: ${CYAN}Product → Archive${NC}"
echo "   • Wait for build to complete (5-10 minutes)"
echo ""

echo -e "${BOLD}4. Distribute to TestFlight:${NC}"
echo ""
echo "   • In Organizer: ${CYAN}Distribute App${NC}"
echo "   • Select: ${CYAN}App Store Connect${NC}"
echo "   • Follow upload prompts"
echo ""

echo -e "${BOLD}5. Test Backend Connection:${NC}"
echo ""
echo "   ${CYAN}Run test script:${NC}"
echo "   $ ./test-ios-backend-connection.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Your iOS app is now configured for production backend!${NC}"
echo -e "${BLUE}Backend URL:${NC} https://api.yoraa.in.net/api"
echo ""
echo -e "${CYAN}💡 Tip:${NC} Test on a physical device before uploading to TestFlight"
echo ""
echo -e "${BOLD}Good luck with your production build! 🚀${NC}"
echo ""
