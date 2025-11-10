#!/bin/bash

# Fix Xcode Project Build Settings directly
# This script modifies the Yoraa.xcodeproj to fix Xcode 16 issues

set -e

echo "🔧 Fixing Xcode project build settings..."

cd "$(dirname "$0")"

PROJECT_FILE="Yoraa.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
  echo "❌ Error: Project file not found at $PROJECT_FILE"
  exit 1
fi

# Backup the project file
cp "$PROJECT_FILE" "${PROJECT_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
echo "✅ Created backup of project file"

# Fix ENABLE_USER_SCRIPT_SANDBOXING
echo "📝 Setting ENABLE_USER_SCRIPT_SANDBOXING = NO..."
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES/ENABLE_USER_SCRIPT_SANDBOXING = NO/g' "$PROJECT_FILE"

# Fix IPHONEOS_DEPLOYMENT_TARGET
echo "📝 Setting IPHONEOS_DEPLOYMENT_TARGET = 13.4..."
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9][0-9]*\.[0-9][0-9]*/IPHONEOS_DEPLOYMENT_TARGET = 13.4/g' "$PROJECT_FILE"

# Add OTHER_LDFLAGS if not present (this is more complex, we'll add it via pod install post_install)
echo "✅ Project file updated successfully"

echo ""
echo "🎉 Done! Now run:"
echo "   cd .. && npx react-native run-ios"
echo ""
