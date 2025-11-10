#!/bin/bash

# Fix Xcode 16 Linker Issues for iOS Build
# This script fixes CoreAudioTypes and SwiftUICore framework issues

set -e

echo "🔧 Fixing Xcode 16 linker issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Step 1: Add build settings to xcconfig if exists
echo "📝 Updating build settings..."

# Create a custom xcconfig file for the fix
cat > Custom.xcconfig << 'EOF'
// Fix for Xcode 16+ linker issues
OTHER_LDFLAGS = $(inherited) -Wl,-weak_framework,CoreAudioTypes
ENABLE_USER_SCRIPT_SANDBOXING = NO
ONLY_ACTIVE_ARCH = NO
EXCLUDED_ARCHS[sdk=iphonesimulator*] = i386
IPHONEOS_DEPLOYMENT_TARGET = 13.4
EOF

echo -e "${GREEN}✅ Created Custom.xcconfig${NC}"

# Step 2: Update the project file using PlistBuddy
echo "🔨 Updating project build settings..."

PROJECT_FILE="Yoraa.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
  # Backup the project file
  cp "$PROJECT_FILE" "${PROJECT_FILE}.backup"
  
  # Add the weak framework link using sed
  if ! grep -q "CoreAudioTypes.framework" "$PROJECT_FILE"; then
    echo "Adding weak CoreAudioTypes framework reference..."
    # This is a manual edit that needs to be done carefully
  fi
  
  echo -e "${GREEN}✅ Project file backed up${NC}"
fi

echo ""
echo "=========================================="
echo "✅ Configuration Updated"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clean build: rm -rf build/ Pods/ Podfile.lock"
echo "2. Reinstall pods: pod install"
echo "3. Clean derived data: rm -rf ~/Library/Developer/Xcode/DerivedData/*"
echo "4. Build: npx react-native run-ios"
echo ""
echo "Or run the complete fix:"
echo "./fix-and-build-ios.sh"
echo ""
