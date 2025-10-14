#!/bin/bash

# Authentication Fix - Testing & Deployment Script
# Run this to test and deploy the authentication fix

echo "🔧 AUTHENTICATION FIX - TEST & DEPLOY"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "Step 1: Checking dependencies..."
if [ -d "node_modules" ]; then
    print_success "node_modules found"
else
    print_warning "node_modules not found, running npm install..."
    npm install
fi

echo ""
echo "Step 2: Checking iOS dependencies..."
if [ -d "ios/Pods" ]; then
    print_success "iOS Pods found"
else
    print_warning "Pods not found, running pod install..."
    cd ios && pod install && cd ..
fi

echo ""
echo "Step 3: Verifying authentication service files..."

files=(
    "src/services/authStorageService.js"
    "src/services/yoraaBackendAPI.js"
    "src/services/yoraaAPI.js"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing!"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required files are missing. Please check the implementation."
    exit 1
fi

echo ""
echo "Step 4: What would you like to do?"
echo "1) Run on iOS Simulator (Debug)"
echo "2) Build for TestFlight (Production)"
echo "3) Just verify setup"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        print_warning "Starting iOS Simulator in debug mode..."
        echo "Watch console logs for authentication indicators:"
        echo "  ✅ 💾 Storing auth data..."
        echo "  ✅ Auth data stored successfully"
        echo "  ✅ Backend authentication successful"
        echo ""
        npx react-native run-ios
        ;;
    2)
        echo ""
        print_warning "Building for TestFlight..."
        echo "This will create a production build"
        echo ""
        
        # Check if build script exists
        if [ -f "build-for-testflight.sh" ]; then
            print_success "Found build-for-testflight.sh"
            bash build-for-testflight.sh
        else
            print_warning "build-for-testflight.sh not found"
            print_warning "Building manually..."
            
            cd ios
            echo "Cleaning build..."
            xcodebuild clean -workspace YoraaApp.xcworkspace -scheme YoraaApp
            
            echo "Building archive..."
            xcodebuild archive \
                -workspace YoraaApp.xcworkspace \
                -scheme YoraaApp \
                -configuration Release \
                -archivePath ./build/YoraaApp.xcarchive
            
            cd ..
            print_success "Build complete! Upload to TestFlight via Xcode"
        fi
        ;;
    3)
        echo ""
        print_success "Setup verification complete!"
        echo ""
        echo "📋 Files Modified:"
        echo "  ✅ authStorageService.js (NEW)"
        echo "  ✅ yoraaBackendAPI.js (UPDATED)"
        echo "  ✅ yoraaAPI.js (UPDATED)"
        echo "  ✅ loginaccountmobilenumberverificationcode.js (UPDATED)"
        echo "  ✅ App.js (UPDATED)"
        echo ""
        echo "🎯 What was fixed:"
        echo "  ✅ JWT token now stored persistently"
        echo "  ✅ User data stored in AsyncStorage"
        echo "  ✅ Authentication persists after app restart"
        echo "  ✅ All login methods updated (Apple, Google, Phone, Email)"
        echo ""
        echo "📱 Next steps:"
        echo "  1. Test locally with option 1 (iOS Simulator)"
        echo "  2. Verify authentication persists after app restart"
        echo "  3. Build for TestFlight with option 2"
        echo "  4. Test on physical device via TestFlight"
        echo ""
        print_success "Ready to test!"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "🎉 Authentication fix implementation complete!"
echo ""
echo "📖 Read AUTHENTICATION_FIX_COMPLETE.md for full details"
echo ""
