#!/bin/bash

echo "🧹 Step 1: Cleaning iOS build artifacts..."
cd ios
rm -rf Pods Podfile.lock build
cd ..

echo "🧹 Step 2: Cleaning node_modules..."
rm -rf node_modules package-lock.json yarn.lock

echo "📦 Step 3: Installing npm packages..."
npm install

echo "🍎 Step 4: Installing iOS Pods..."
cd ios
pod deintegrate
pod install --repo-update
cd ..

echo "✅ Fresh installation complete!"
echo "Now run: npx react-native run-ios"
