#!/bin/bash

echo "🔧 Fixing React Native codegen issue and rebuilding..."

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Step 1: Reinstall pods to regenerate codegen files
echo "📦 Reinstalling CocoaPods..."
cd ios
pod install --repo-update

# Step 2: Clean everything
echo "🧹 Cleaning build artifacts..."
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

# Step 3: Build and install
echo "🔨 Building for iPad Pro 9.7-inch..."
cd ..
npx react-native run-ios --simulator "iPad Pro (9.7-inch)"

echo "✅ Done!"
