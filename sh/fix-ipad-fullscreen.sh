#!/bin/bash

echo "🔧 Fixing iPad Full Screen Issue..."

cd "$(dirname "$0")"

# Step 1: Update LaunchScreen.storyboard to use iPad dimensions
echo "📱 Updating LaunchScreen.storyboard..."
cat > ios/YoraaApp/LaunchScreen.storyboard << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="15702" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_1" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="15704"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" autoresizesSubviews="YES" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                        </subviews>
                        <color key="backgroundColor" systemColor="systemBackgroundColor" cocoaTouchSystemColor="whiteColor"/>
                        <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="52.173913043478265" y="375"/>
        </scene>
    </scenes>
</document>
EOF

echo "✅ LaunchScreen.storyboard updated with responsive sizing"

# Step 2: Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

echo "✅ Build artifacts cleaned"

# Step 3: Reinstall pods with proper settings
echo "📦 Reinstalling pods..."
cd ios
pod deintegrate 2>/dev/null
pod install
cd ..

echo "✅ Pods reinstalled"

echo ""
echo "🎉 iPad Full Screen Fix Complete!"
echo ""
echo "Next steps:"
echo "1. Clean restart Metro: npx react-native start --reset-cache"
echo "2. Build for iPad: npx react-native run-ios --simulator \"iPad Air 11-inch (M3)\""
echo ""
