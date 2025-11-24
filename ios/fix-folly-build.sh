#!/bin/bash

# Fix for RCT-Folly build errors in React Native 0.80.x
# This script cleans and reinstalls pods to fix the 'folly/lang/ToAscii.h' not found error

set -e

echo "🧹 Cleaning iOS build artifacts..."

# Navigate to ios directory
cd "$(dirname "$0")"

# Clean derived data
echo "Removing Xcode Derived Data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean pods
echo "Removing Pods directory and Podfile.lock..."
rm -rf Pods
rm -f Podfile.lock

# Clean build folder
echo "Cleaning build folder..."
rm -rf build

echo "📦 Reinstalling CocoaPods dependencies..."
pod install --verbose

echo "✅ Done! You can now build your iOS project."
echo ""
echo "Next steps:"
echo "1. Clean build in Xcode (Cmd+Shift+K)"
echo "2. Build the project (Cmd+B)"
echo ""
echo "Or run: npx react-native run-ios"
