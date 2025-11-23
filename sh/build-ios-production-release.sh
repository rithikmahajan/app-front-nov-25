#!/bin/bash

# ============================================================================
# iOS Production Build Script with .env.production
# ============================================================================
# This script builds a production-ready iOS app with production environment
# variables from .env.production file
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# Step 1: Pre-flight Checks
# ============================================================================

print_header "iOS Production Build - Pre-flight Checks"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if iOS directory exists
if [ ! -d "ios" ]; then
    print_error "iOS directory not found."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production with your production environment variables."
    exit 1
fi

print_success "Pre-flight checks passed!"

# ============================================================================
# Step 2: Copy Production Environment Variables
# ============================================================================

print_header "Step 2: Setting Up Production Environment"

# Backup current .env if it exists
if [ -f ".env" ]; then
    print_status "Backing up current .env to .env.backup"
    cp .env .env.backup
fi

# Copy .env.production to .env (root level)
print_status "Copying .env.production to .env (root level)"
cp .env.production .env

# Also copy to ios folder for native access
print_status "Copying .env.production to ios/.env"
cp .env.production ios/.env

print_success "Production environment variables configured!"

# Display API URL being used
API_URL=$(grep "API_BASE_URL" .env.production | cut -d '=' -f2)
print_status "Using API: ${API_URL}"

# ============================================================================
# Step 3: Clean Previous Builds
# ============================================================================

print_header "Step 3: Cleaning Previous Builds"

# Kill any running Metro processes
print_status "Stopping Metro bundler..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# Clean iOS build artifacts
print_status "Cleaning iOS build artifacts..."
cd ios

# Remove Pods and cache
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData

# Clean Xcode derived data
print_status "Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true

cd ..

print_success "Build artifacts cleaned!"

# ============================================================================
# Step 4: Install Dependencies
# ============================================================================

print_header "Step 4: Installing Dependencies"

# Install npm packages
print_status "Installing npm packages..."
npm install

# Install CocoaPods
print_status "Installing CocoaPods dependencies..."
cd ios

# Check if pod is installed
if ! command -v pod &> /dev/null; then
    print_error "CocoaPods not found. Please install it first:"
    print_warning "sudo gem install cocoapods"
    exit 1
fi

# Install pods
pod install --repo-update

cd ..

print_success "Dependencies installed!"

# ============================================================================
# Step 5: Build Options
# ============================================================================

print_header "Step 5: Build Configuration"

echo "Choose your build method:"
echo "1) Archive in Xcode (Recommended for App Store upload)"
echo "2) Build with xcodebuild command-line"
echo "3) Just prepare and open in Xcode manually"
echo ""
read -p "Enter your choice (1-3): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        print_header "Opening Xcode for Manual Archive"
        print_status "Opening Yoraa.xcworkspace in Xcode..."
        print_warning "To create production build in Xcode:"
        echo ""
        echo "  1. Select 'Any iOS Device (arm64)' or your connected device"
        echo "  2. Go to Product → Scheme → Edit Scheme"
        echo "  3. Select 'Archive' → Build Configuration → 'Release'"
        echo "  4. Close scheme editor"
        echo "  5. Go to Product → Archive"
        echo "  6. Wait for archive to complete"
        echo "  7. Click 'Distribute App'"
        echo "  8. Choose distribution method (App Store Connect, Ad Hoc, etc.)"
        echo "  9. Follow the export wizard"
        echo ""
        print_success "Environment is ready with .env.production variables!"
        
        # Open Xcode
        open ios/Yoraa.xcworkspace
        ;;
        
    2)
        print_header "Building with xcodebuild"
        
        # Create build output directory
        mkdir -p ios/build
        
        cd ios
        
        print_status "Creating archive..."
        xcodebuild clean archive \
            -workspace Yoraa.xcworkspace \
            -scheme YoraaApp \
            -configuration Release \
            -archivePath ./build/YoraaApp.xcarchive \
            -destination 'generic/platform=iOS' \
            -allowProvisioningUpdates \
            CODE_SIGN_STYLE=Automatic \
            DEVELOPMENT_TEAM=YOUR_TEAM_ID
        
        print_success "Archive created at ios/build/YoraaApp.xcarchive"
        
        print_status "To export IPA, you can use Xcode Organizer:"
        print_warning "Open Xcode → Window → Organizer → Archives"
        
        cd ..
        ;;
        
    3)
        print_header "Opening Xcode - Manual Build"
        print_success "Environment configured with .env.production"
        print_status "Opening Yoraa.xcworkspace..."
        
        echo ""
        print_warning "Remember to:"
        echo "  - Select 'Release' configuration for production builds"
        echo "  - Use 'Product → Archive' for App Store distribution"
        echo "  - Verify your signing & capabilities settings"
        echo ""
        
        open ios/Yoraa.xcworkspace
        ;;
        
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# ============================================================================
# Step 6: Summary
# ============================================================================

print_header "Build Summary"

echo "✅ Production environment configured:"
echo "   - API URL: ${API_URL}"
echo "   - Environment files:"
echo "     • .env (copied from .env.production)"
echo "     • ios/.env (copied from .env.production)"
echo ""
echo "✅ Dependencies installed:"
echo "   • npm packages installed"
echo "   • CocoaPods installed"
echo ""
echo "✅ Build artifacts cleaned"
echo ""

print_success "iOS Production Build Process Complete!"

print_warning "IMPORTANT NOTES:"
echo "  1. Make sure you have valid signing certificates"
echo "  2. Check your provisioning profiles in Xcode"
echo "  3. Verify bundle identifier matches your App Store listing"
echo "  4. Test the build thoroughly before uploading to App Store"
echo ""
echo "📚 For more info, see: IOS_PRODUCTION_BUILD_GUIDE.md"
echo ""
