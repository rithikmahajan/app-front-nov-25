#!/bin/bash
set -e

echo "🔨 Pre-building React Native bundle for production..."

# Build the bundle
npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/ \
  --reset-cache

echo "✅ Bundle created at ios/main.jsbundle"

# Copy to build output location
BUILD_DIR="$HOME/Library/Developer/Xcode/DerivedData/Yoraa-bltqvkmcjaygjdalqqwydqszhotp/Build/Intermediates.noindex/ArchiveIntermediates/Yoraa/BuildProductsPath/Release-iphoneos"
if [ -d "$BUILD_DIR" ]; then
    echo "📦 Copying bundle to build directory..."
    cp ios/main.jsbundle "$BUILD_DIR/main.jsbundle" 2>/dev/null || true
fi

echo "✅ Pre-build complete!"
