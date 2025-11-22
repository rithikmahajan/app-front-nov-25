#!/bin/bash
set -e

echo "🚀 Starting iOS Production Build with Auto-Capability Resolution for Yoraa App..."

# Change to project directory
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "📂 Project root: $PROJECT_ROOT"

# Function to detect and handle capability issues
handle_capability_issues() {
    echo "🔧 Detecting and resolving Apple Sign-In capability issues..."
    
    # Check if we have Apple Sign-In entitlements
    if grep -q "com.apple.developer.applesignin" ios/YoraaApp/YoraaAppRelease.entitlements; then
        echo "📱 Apple Sign-In capability detected in entitlements"
        
        # Create multiple export option plists for different scenarios
        echo "� Creating export configuration files..."
        
        # Export options with Apple Sign-In (primary attempt)
        cat > ios/exportOptions-appstore-applesignin.plist << EOF
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
    <key>signingCertificate</key>
    <string>iOS Distribution</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.yoraaapparelsprivatelimited.yoraa</key>
        <string>match AppStore com.yoraaapparelsprivatelimited.yoraa</string>
    </dict>
</dict>
</plist>
EOF

        # Export options without Apple Sign-In (fallback)
        cat > ios/exportOptions-appstore-fallback.plist << EOF
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
</dict>
</plist>
EOF

        # Create fallback entitlements without Apple Sign-In
        cat > ios/YoraaApp/YoraaAppReleaseFallback.entitlements << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>
</dict>
</plist>
EOF
        
        echo "✅ Export configuration files created"
    fi
}

# Smart export function with multiple fallback strategies
smart_export_archive() {
    local archive_path="$1"
    local export_dir="$2"
    
    echo "🚀 Starting smart export with multiple fallback strategies..."
    
    # Strategy 1: Try with original Apple Sign-In capability
    echo "📱 Strategy 1: Attempting export with Apple Sign-In capability..."
    if xcodebuild -exportArchive \
        -archivePath "$archive_path" \
        -exportPath "$export_dir/strategy1" \
        -exportOptionsPlist ios/exportOptions-appstore-applesignin.plist 2>/dev/null; then
        echo "✅ Strategy 1 successful: Export with Apple Sign-In capability completed"
        cp -r "$export_dir/strategy1/"*.ipa "$export_dir/" 2>/dev/null || true
        return 0
    fi
    
    echo "⚠️  Strategy 1 failed, trying Strategy 2..."
    
    # Strategy 2: Try with automatic signing and default export options
    echo "📱 Strategy 2: Attempting export with automatic signing..."
    if xcodebuild -exportArchive \
        -archivePath "$archive_path" \
        -exportPath "$export_dir/strategy2" \
        -exportOptionsPlist ios/exportOptions-appstore-fallback.plist 2>/dev/null; then
        echo "✅ Strategy 2 successful: Export with automatic signing completed"
        cp -r "$export_dir/strategy2/"*.ipa "$export_dir/" 2>/dev/null || true
        return 0
    fi
    
    echo "⚠️  Strategy 2 failed, trying Strategy 3..."
    
    # Strategy 3: Modify entitlements and try again
    echo "📱 Strategy 3: Attempting export without Apple Sign-In entitlements..."
    
    # Backup and modify project
    cp ios/Yoraa.xcodeproj/project.pbxproj ios/Yoraa.xcodeproj/project.pbxproj.capability_backup
    sed -i '' 's/YoraaApp\/YoraaAppRelease.entitlements/YoraaApp\/YoraaAppReleaseFallback.entitlements/g' ios/Yoraa.xcodeproj/project.pbxproj
    
    # Try export without Apple Sign-In
    if xcodebuild -exportArchive \
        -archivePath "$archive_path" \
        -exportPath "$export_dir/strategy3" \
        -exportOptionsPlist ios/exportOptions-appstore-fallback.plist 2>/dev/null; then
        echo "✅ Strategy 3 successful: Export without Apple Sign-In completed"
        cp -r "$export_dir/strategy3/"*.ipa "$export_dir/" 2>/dev/null || true
        
        # Restore original project
        mv ios/Yoraa.xcodeproj/project.pbxproj.capability_backup ios/Yoraa.xcodeproj/project.pbxproj
        return 0
    fi
    
    # Restore original project
    mv ios/Yoraa.xcodeproj/project.pbxproj.capability_backup ios/Yoraa.xcodeproj/project.pbxproj
    
    echo "❌ All export strategies failed"
    return 1
}

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf ios/ios-builds
rm -rf ios/exportOptions-*.plist

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Navigate to iOS directory
cd ios

# Clean Xcode build
echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

# Install CocoaPods
echo "🍫 Installing CocoaPods dependencies..."
pod install --verbose

# Handle capability detection and configuration
handle_capability_issues

echo "🏗️ Starting Archive creation..."

# Create archive using xcodebuild directly for better control
ARCHIVE_NAME="YoraaApp-production-$(date +%Y%m%d-%H%M%S)"
ARCHIVE_PATH="$HOME/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)/$ARCHIVE_NAME.xcarchive"
EXPORT_DIR="./ios-builds"

# Create export directory
mkdir -p "$EXPORT_DIR"

echo "📦 Creating archive at: $ARCHIVE_PATH"

# Archive the project
if xcodebuild archive \
    -workspace Yoraa.xcworkspace \
    -scheme YoraaApp \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM=UX6XB9FMNN; then
    
    echo "✅ Archive creation successful!"
    
    # Smart export with fallback strategies
    if smart_export_archive "$ARCHIVE_PATH" "$EXPORT_DIR"; then
        echo "🎉 Export successful!"
        
        # List generated files
        echo "📁 Generated files:"
        find "$EXPORT_DIR" -name "*.ipa" -exec ls -lh {} \; 2>/dev/null || echo "IPA files will be in export subdirectories"
        
        # Show archive location
        echo "📦 Archive location: $ARCHIVE_PATH"
        
        echo "✅ iOS Production Build completed successfully!"
        echo "📱 Your app is ready for App Store submission!"
        
    else
        echo "❌ Export failed with all strategies"
        echo "📋 Archive was created successfully at: $ARCHIVE_PATH"
        echo "💡 You can manually export from Xcode Organizer"
        exit 1
    fi
    
else
    echo "❌ Archive creation failed"
    exit 1
fi

# Cleanup temporary files
rm -f ios/exportOptions-*.plist
rm -f ios/YoraaApp/YoraaAppReleaseFallback.entitlements

echo "🎉 Build process finished successfully!"
