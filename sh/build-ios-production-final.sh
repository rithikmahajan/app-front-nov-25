#!/bin/bash
set -e

echo "🚀 iOS Production Build - Final Solution for Yoraa App"
echo "=================================================="

# Change to project directory
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "📂 Project root: $PROJECT_ROOT"

# Clean and prepare
echo "🧹 Cleaning previous builds and preparing environment..."
rm -rf ios/build
rm -rf ios/ios-builds
rm -rf ios/exportOptions-*.plist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Navigate to iOS directory
cd ios

# Clean Xcode build thoroughly
echo "🧹 Deep cleaning Xcode environment..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
rm -rf build/

# Reinstall CocoaPods
echo "🍫 Reinstalling CocoaPods..."
rm -rf Pods
rm -f Podfile.lock
pod install --repo-update

# Fix keychain access (common fix for errSecInternalComponent)
echo "🔐 Fixing keychain access..."
security unlock-keychain -p "" ~/Library/Keychains/login.keychain-db 2>/dev/null || true

# Create simplified export options
echo "📝 Creating export configuration..."
cat > exportOptions-simple.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>destination</key>
    <string>export</string>
    <key>teamID</key>
    <string>UX6XB9FMNN</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>manageAppVersionAndBuildNumber</key>
    <true/>
</dict>
</plist>
EOF

# Create archive
echo "🏗️ Creating iOS archive..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="YoraaApp-production-$TIMESTAMP"
ARCHIVE_PATH="$HOME/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)/$ARCHIVE_NAME.xcarchive"

# Clean build first
xcodebuild clean \
    -workspace Yoraa.xcworkspace \
    -scheme YoraaApp \
    -configuration Release

echo "📦 Archiving project..."
if xcodebuild archive \
    -workspace Yoraa.xcworkspace \
    -scheme YoraaApp \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -allowProvisioningUpdates \
    -allowProvisioningDeviceRegistration \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM=UX6XB9FMNN \
    CODE_SIGN_IDENTITY="Apple Development" \
    OTHER_CODE_SIGN_FLAGS="--keychain ~/Library/Keychains/login.keychain-db"; then
    
    echo "✅ Archive created successfully!"
    echo "📦 Archive location: $ARCHIVE_PATH"
    
    # Create export directory
    EXPORT_DIR="./ios-builds"
    mkdir -p "$EXPORT_DIR"
    
    echo "🚀 Exporting IPA..."
    if xcodebuild -exportArchive \
        -archivePath "$ARCHIVE_PATH" \
        -exportPath "$EXPORT_DIR" \
        -exportOptionsPlist exportOptions-simple.plist \
        -allowProvisioningUpdates; then
        
        echo "🎉 Export successful!"
        
        # Show results
        echo "📁 Build artifacts:"
        find "$EXPORT_DIR" -name "*.ipa" -exec ls -lh {} \;
        
        echo ""
        echo "✅ iOS Production Build completed successfully!"
        echo "📱 Your app is ready for App Store submission!"
        echo "📦 Archive: $ARCHIVE_PATH"
        echo "📁 IPA files: $PWD/$EXPORT_DIR"
        
    else
        echo "⚠️ Archive created but export failed."
        echo "📦 Archive available at: $ARCHIVE_PATH"
        echo "💡 You can manually export from Xcode → Window → Organizer"
        echo "   1. Open Xcode"
        echo "   2. Window → Organizer"
        echo "   3. Select your archive"
        echo "   4. Click 'Distribute App'"
        echo "   5. Choose 'App Store Connect'"
        echo "   6. Upload or Export"
    fi
    
else
    echo "❌ Archive creation failed"
    echo "🔧 Troubleshooting suggestions:"
    echo "   1. Check Apple Developer account status"
    echo "   2. Verify certificates in Keychain Access"
    echo "   3. Try manual build in Xcode"
    echo "   4. Check provisioning profiles"
    exit 1
fi

# Cleanup
rm -f exportOptions-*.plist

echo ""
echo "🏁 Build process completed!"
