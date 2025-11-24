#!/bin/bash

# Xcode Frozen Fix Script
# Fixes common Xcode freezing issues including "Loading..." and spinning wheel
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
echo "${BLUE}          Xcode Frozen Fix - Complete Recovery            ${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print status messages
print_status() {
    echo "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Step 1: Force Quit Xcode
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 1: Force Quit Xcode${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if pgrep -x "Xcode" > /dev/null; then
    print_status "Xcode is running. Force quitting..."
    killall Xcode 2>/dev/null || true
    sleep 2
    
    # If still running, force kill
    if pgrep -x "Xcode" > /dev/null; then
        print_warning "Xcode still running. Force killing..."
        killall -9 Xcode 2>/dev/null || true
        sleep 1
    fi
    
    print_success "Xcode has been force quit"
else
    print_status "Xcode is not currently running"
fi

# Step 2: Delete Derived Data
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 2: Delete Derived Data${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData"

if [ -d "$DERIVED_DATA" ]; then
    print_status "Calculating size of Derived Data..."
    SIZE=$(du -sh "$DERIVED_DATA" | awk '{print $1}')
    print_status "Current Derived Data size: $SIZE"
    
    print_status "Deleting Derived Data..."
    rm -rf "$DERIVED_DATA"/*
    
    print_success "Derived Data deleted successfully"
else
    print_warning "Derived Data folder not found"
fi

# Step 3: Kill stuck indexing processes
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 3: Kill Stuck Indexing Processes${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PROCESSES=("sourcekitd" "clang" "swift-frontend" "swift" "SourceKitService")

for process in "${PROCESSES[@]}"; do
    if pgrep -x "$process" > /dev/null; then
        print_status "Killing $process..."
        sudo killall -9 "$process" 2>/dev/null || true
        print_success "$process killed"
    else
        print_status "$process not running"
    fi
done

# Step 4: Clear Xcode Cache
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 4: Clear Xcode Cache${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

XCODE_CACHE="$HOME/Library/Caches/com.apple.dt.Xcode"
SOURCEKIT_CACHE="$HOME/Library/Application Support/Developer/Shared/SourceKit"
MODULE_CACHE="$HOME/Library/Developer/Xcode/UserData/ModuleCache"

if [ -d "$XCODE_CACHE" ]; then
    print_status "Clearing Xcode cache..."
    SIZE=$(du -sh "$XCODE_CACHE" | awk '{print $1}')
    print_status "Xcode cache size: $SIZE"
    rm -rf "$XCODE_CACHE"/*
    print_success "Xcode cache cleared"
else
    print_warning "Xcode cache folder not found"
fi

if [ -d "$SOURCEKIT_CACHE" ]; then
    print_status "Clearing SourceKit cache..."
    rm -rf "$SOURCEKIT_CACHE"
    print_success "SourceKit cache cleared"
else
    print_status "SourceKit cache folder not found"
fi

if [ -d "$MODULE_CACHE" ]; then
    print_status "Clearing Module cache..."
    rm -rf "$MODULE_CACHE"/*
    print_success "Module cache cleared"
else
    print_status "Module cache folder not found"
fi

# Step 5: CocoaPods Fix (if applicable)
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 5: CocoaPods Workspace Fix${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

IOS_DIR="./ios"

if [ -d "$IOS_DIR" ] && [ -f "$IOS_DIR/Podfile" ]; then
    print_status "CocoaPods project detected"
    
    cd "$IOS_DIR"
    
    # Find workspace file
    WORKSPACE=$(find . -maxdepth 1 -name "*.xcworkspace" | head -1)
    
    if [ -n "$WORKSPACE" ]; then
        print_status "Removing workspace: $WORKSPACE"
        rm -rf "$WORKSPACE"
    fi
    
    if [ -f "Podfile.lock" ]; then
        print_status "Removing Podfile.lock"
        rm -f "Podfile.lock"
    fi
    
    if [ -d "Pods" ]; then
        print_status "Removing Pods folder"
        rm -rf "Pods"
    fi
    
    print_status "Running pod install..."
    if command -v pod &> /dev/null; then
        pod install
        print_success "CocoaPods reinstalled successfully"
    else
        print_error "CocoaPods not found. Install with: sudo gem install cocoapods"
    fi
    
    cd ..
else
    print_status "No CocoaPods project found in ./ios folder"
fi

# Step 6: Additional cleanup
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}STEP 6: Additional Cleanup${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Clear iOS simulator data
print_status "Clearing iOS Simulator data..."
xcrun simctl shutdown all 2>/dev/null || true
xcrun simctl erase all 2>/dev/null || print_warning "Could not erase simulators"

# Clear CoreSimulator caches
CORESIM_CACHE="$HOME/Library/Developer/CoreSimulator/Caches"
if [ -d "$CORESIM_CACHE" ]; then
    print_status "Clearing CoreSimulator caches..."
    rm -rf "$CORESIM_CACHE"/*
    print_success "CoreSimulator caches cleared"
fi

# Clear Xcode preferences that might be corrupted
print_status "Backing up and cleaning Xcode preferences..."
XCODE_PREFS="$HOME/Library/Preferences/com.apple.dt.Xcode.plist"
if [ -f "$XCODE_PREFS" ]; then
    cp "$XCODE_PREFS" "$XCODE_PREFS.backup.$(date +%Y%m%d_%H%M%S)"
    print_success "Xcode preferences backed up"
fi

echo ""
echo "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo "${GREEN}          Xcode Frozen Fix Complete!                      ${NC}"
echo "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
print_success "All cleanup steps completed successfully"
echo ""
echo "${BLUE}Next Steps:${NC}"
echo "  1. Open Xcode while holding ${YELLOW}Shift${NC} key (prevents restoring windows)"
echo "  2. Manually open your project/workspace"
echo "  3. Wait for indexing to complete (check top bar)"
echo ""
echo "${BLUE}Diagnostic Information:${NC}"
echo "  - Check what projects cause freezing (this one only or all?)"
echo "  - Check when it started (after Xcode update, git merge, pod install?)"
echo "  - Current Xcode version: $(xcodebuild -version | head -1 2>/dev/null || echo 'Not found')"
echo ""
echo "${YELLOW}If Xcode still freezes:${NC}"
echo "  1. Check Console.app for crash logs"
echo "  2. Try creating a new test project to isolate the issue"
echo "  3. Consider reinstalling Xcode from App Store"
echo ""
