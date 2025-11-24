#!/bin/bash

echo "🔄 Quick fix: Reinstalling app with launch images..."

SIMULATOR_ID="8E52B2F3-D349-4FE5-B47B-E67F8903A65B"
BUNDLE_ID="com.yoraaapparelsprivatelimited.yoraa"

# 1. Stop the app
echo "⏹️  Stopping app..."
xcrun simctl terminate $SIMULATOR_ID $BUNDLE_ID 2>/dev/null || true

# 2. Uninstall the app completely
echo "🗑️  Uninstalling old app..."
xcrun simctl uninstall $SIMULATOR_ID $BUNDLE_ID 2>/dev/null || true

# 3. Find the latest build
echo "🔍 Finding latest build..."
APP_PATH=$(find ios/build/Build/Products/Debug-iphonesimulator -name "YoraaApp.app" 2>/dev/null | head -1)

if [ -z "$APP_PATH" ]; then
  echo "⚠️  No recent build found. Building now..."
  cd ios
  xcodebuild \
    -workspace Yoraa.xcworkspace \
    -scheme YoraaApp \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath build \
    CODE_SIGNING_ALLOWED=NO \
    | grep -E '(error|warning|succeeded|failed|Signing|Installing)'
  
  cd ..
  APP_PATH=$(find ios/build/Build/Products/Debug-iphonesimulator -name "YoraaApp.app" | head -1)
fi

if [ -n "$APP_PATH" ]; then
  echo "📦 Installing app from: $APP_PATH"
  xcrun simctl install $SIMULATOR_ID "$APP_PATH"
  echo "✅ App installed with launch images!"
  
  echo "🚀 Launching app..."
  sleep 2
  xcrun simctl launch $SIMULATOR_ID $BUNDLE_ID
  
  echo ""
  echo "✅ DONE! The app should now fill the entire screen!"
  echo "📱 Check your iPad Air simulator"
else
  echo "❌ Could not find app bundle"
  exit 1
fi
