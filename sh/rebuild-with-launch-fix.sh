#!/bin/bash

echo "🔨 Rebuilding iOS app with launch images fix..."

# Kill the simulator app
xcrun simctl terminate 8E52B2F3-D349-4FE5-B47B-E67F8903A65B com.yoraaapparelsprivatelimited.yoraa 2>/dev/null || true

# Remove old build
rm -rf ios/build

# Build the app
cd ios
xcodebuild \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build \
  -destination 'platform=iOS Simulator,name=iPad Air (6th generation)' \
  CODE_SIGNING_ALLOWED=NO

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Install the app
  echo "📱 Installing app on simulator..."
  APP_PATH=$(find ios/build/Build/Products/Debug-iphonesimulator -name "YoraaApp.app" | head -1)
  
  if [ -n "$APP_PATH" ]; then
    xcrun simctl install 8E52B2F3-D349-4FE5-B47B-E67F8903A65B "$APP_PATH"
    echo "✅ App installed!"
    
    # Launch the app
    echo "🚀 Launching app..."
    sleep 2
    xcrun simctl launch 8E52B2F3-D349-4FE5-B47B-E67F8903A65B com.yoraaapparelsprivatelimited.yoraa
    echo "✅ App launched! The screen should now fill the entire display."
  else
    echo "❌ Could not find built app"
    exit 1
  fi
else
  echo "❌ Build failed"
  exit 1
fi
