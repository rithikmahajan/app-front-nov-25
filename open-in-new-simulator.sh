#!/bin/bash

# Open iOS App in New Simulator
# Created: November 24, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}       Opening App in Fresh iOS Simulator                 ${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print status messages
print_status() {
    echo "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Step 1: Shutdown all simulators
echo "${YELLOW}━━━ Step 1: Shutting down all simulators ━━━${NC}"
print_status "Shutting down all running simulators..."
xcrun simctl shutdown all 2>/dev/null || true
print_success "All simulators shut down"

# Step 2: List available simulators
echo ""
echo "${YELLOW}━━━ Step 2: Available iPhone Simulators ━━━${NC}"
print_status "Fetching available iPhone simulators..."
echo ""

# Get list of iPhone simulators
SIMULATORS=$(xcrun simctl list devices available | grep -i "iPhone" | grep -v "unavailable")
echo "$SIMULATORS"
echo ""

# Use the first iPhone 15 or latest available
DEVICE_ID=$(echo "$SIMULATORS" | grep -i "iPhone 15" | head -1 | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}')

if [ -z "$DEVICE_ID" ]; then
    # Fallback to any available iPhone
    DEVICE_ID=$(echo "$SIMULATORS" | head -1 | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}')
fi

if [ -z "$DEVICE_ID" ]; then
    print_error "No available iPhone simulators found!"
    exit 1
fi

DEVICE_NAME=$(xcrun simctl list devices | grep "$DEVICE_ID" | sed 's/(.*//' | xargs)
print_success "Selected simulator: ${YELLOW}$DEVICE_NAME${NC}"
print_status "Device ID: $DEVICE_ID"

# Step 3: Erase simulator data (fresh start)
echo ""
echo "${YELLOW}━━━ Step 3: Erasing simulator data for fresh start ━━━${NC}"
print_status "Erasing all data from simulator..."
xcrun simctl erase "$DEVICE_ID" 2>/dev/null || print_error "Could not erase simulator data"
print_success "Simulator data erased"

# Step 4: Boot the simulator
echo ""
echo "${YELLOW}━━━ Step 4: Booting simulator ━━━${NC}"
print_status "Booting $DEVICE_NAME..."
xcrun simctl boot "$DEVICE_ID" 2>/dev/null || print_status "Simulator already booted or booting..."
sleep 3
print_success "Simulator booted"

# Step 5: Open Simulator app
echo ""
echo "${YELLOW}━━━ Step 5: Opening Simulator app ━━━${NC}"
open -a Simulator
sleep 2
print_success "Simulator app opened"

# Step 6: Build and run the app
echo ""
echo "${YELLOW}━━━ Step 6: Building and running app ━━━${NC}"
print_status "Starting Metro bundler and building app..."
print_status "This may take a few minutes..."
echo ""

# Change to ios directory if it exists
if [ -d "ios" ]; then
    cd ios
    WORKSPACE="Yoraa.xcworkspace"
    SCHEME="YoraaApp"
    
    if [ -f "$WORKSPACE" ]; then
        print_status "Building from workspace: $WORKSPACE"
        print_status "Using scheme: $SCHEME"
        echo ""
        
        # Build and install the app
        xcodebuild \
            -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Debug \
            -destination "id=$DEVICE_ID" \
            -derivedDataPath build \
            build \
            | grep -E "▸|error:|warning:|note:|failed|succeeded" || true
        
        BUILD_STATUS=${PIPESTATUS[0]}
        
        if [ $BUILD_STATUS -eq 0 ]; then
            print_success "Build completed successfully!"
            
            # Install the app
            print_status "Installing app on simulator..."
            APP_PATH=$(find build/Build/Products/Debug-iphonesimulator -name "*.app" | head -1)
            
            if [ -n "$APP_PATH" ]; then
                xcrun simctl install "$DEVICE_ID" "$APP_PATH"
                print_success "App installed!"
                
                # Get bundle identifier
                BUNDLE_ID=$(defaults read "$APP_PATH/Info.plist" CFBundleIdentifier)
                
                # Launch the app
                print_status "Launching app..."
                xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"
                print_success "App launched successfully!"
            else
                print_error "Could not find built app"
            fi
        else
            print_error "Build failed. Trying with React Native CLI..."
            cd ..
            npx react-native run-ios --simulator="$DEVICE_NAME"
        fi
    else
        print_error "Workspace file not found. Using React Native CLI..."
        cd ..
        npx react-native run-ios --simulator="$DEVICE_NAME"
    fi
else
    print_status "Using React Native CLI..."
    npx react-native run-ios --simulator="$DEVICE_NAME"
fi

echo ""
echo "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo "${GREEN}       App Running in Simulator!                          ${NC}"
echo "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
print_success "Simulator: $DEVICE_NAME"
print_success "Device ID: $DEVICE_ID"
echo ""
print_status "To reload the app: Press ${YELLOW}Cmd + R${NC} in the simulator"
print_status "To open debug menu: Press ${YELLOW}Cmd + D${NC} in the simulator"
echo ""
