#!/bin/bash

echo "🚀 Building and Installing Production App on Device"
echo "===================================================="
echo ""

# Device UDID
DEVICE_ID="00008130-000C79462E43001C"

# Change to project directory
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios

echo "Step 1/3: Building Release for device..."
echo "⏳ This will take 5-10 minutes..."
echo ""

xcodebuild \
    -workspace "Yoraa.xcworkspace" \
    -scheme "YoraaApp" \
    -configuration Release \
    -sdk iphoneos \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath ~/Library/Developer/Xcode/DerivedData/Yoraa-Production \
    build \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM=UX6XB9FMNN \
    CODE_SIGN_IDENTITY="Apple Development" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    2>&1 | tee ../build-install.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    # Find the built app
    APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/Yoraa-Production/Build/Products/Release-iphoneos -name "*.app" -type d | head -n 1)
    
    if [ -z "$APP_PATH" ]; then
        echo "❌ Could not find built .app file"
        exit 1
    fi
    
    echo "📦 App built at: $APP_PATH"
    echo ""
    echo "Step 2/3: Installing on device..."
    echo ""
    
    # Install on device using ios-deploy or xcrun
    if command -v ios-deploy &> /dev/null; then
        echo "Using ios-deploy..."
        ios-deploy --id "$DEVICE_ID" --bundle "$APP_PATH" --justlaunch
        INSTALL_EXIT_CODE=$?
    else
        echo "Using xcrun devicectl..."
        xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
        INSTALL_EXIT_CODE=$?
    fi
    
    if [ $INSTALL_EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ App installed successfully on device!"
        echo ""
        echo "Step 3/3: Summary"
        echo "================="
        echo "✓ Build: Success"
        echo "✓ Install: Success"
        echo "✓ Device: $DEVICE_ID"
        echo "✓ App Path: $APP_PATH"
        echo ""
        echo "🎉 Production app is ready to use!"
        echo ""
        echo "To launch the app, tap the Yoraa icon on your device."
    else
        echo ""
        echo "⚠️  Build succeeded but installation failed."
        echo "You can manually install from Xcode:"
        echo "1. Open Xcode"
        echo "2. Window > Devices and Simulators"
        echo "3. Select your device"
        echo "4. Click '+' and select: $APP_PATH"
    fi
else
    echo ""
    echo "❌ Build failed with exit code $BUILD_EXIT_CODE"
    echo ""
    echo "Check build-install.log for details"
    exit 1
fi
