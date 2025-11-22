#!/bin/bash

# iOS Production Build Script
# This script creates a production build for iOS

set -e  # Exit on any error

echo "🚀 Starting iOS Production Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_status "Cleaning previous build artifacts..."

# Kill any running Metro processes
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# Clean node modules and reinstall
print_status "Cleaning and reinstalling node modules..."
rm -rf node_modules
npm install

# Clean iOS build
print_status "Cleaning iOS build artifacts..."
cd ios
rm -rf Pods Podfile.lock
rm -rf build
rm -rf DerivedData

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

print_status "Installing CocoaPods dependencies..."
pod install --clean-install --repo-update

cd ..

print_status "Creating ios-builds directory..."
mkdir -p ios/ios-builds

print_status "Building production iOS app..."

# Option 1: Use Fastlane (recommended)
if command -v fastlane &> /dev/null; then
    print_status "Using Fastlane to build production app..."
    cd ios
    fastlane release
    cd ..
    print_success "Production build completed using Fastlane!"
else
    # Option 2: Use xcodebuild directly
    print_warning "Fastlane not found. Using xcodebuild directly..."
    
    cd ios
    
    print_status "Building archive..."
    xcodebuild \
        -workspace Yoraa.xcworkspace \
        -scheme YoraaApp \
        -configuration Release \
        -destination generic/platform=iOS \
        -archivePath ./ios-builds/YoraaApp.xcarchive \
        archive
    
    print_status "Exporting IPA..."
    xcodebuild \
        -exportArchive \
        -archivePath ./ios-builds/YoraaApp.xcarchive \
        -exportPath ./ios-builds \
        -exportOptionsPlist ./exportOptions-appstore.plist
    
    cd ..
    
    print_success "Production build completed using xcodebuild!"
fi

print_success "🎉 iOS Production Build Process Completed!"
print_status "📱 Build artifacts are located in: ios/ios-builds/"

# List the generated files
if [ -d "ios/ios-builds" ]; then
    print_status "Generated files:"
    ls -la ios/ios-builds/
fi

print_status "📋 Next steps:"
echo "   1. Test the IPA file on a physical device"
echo "   2. Upload to App Store Connect (if not done automatically)"
echo "   3. Submit for App Store review"
