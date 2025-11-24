#!/bin/bash

# Fix VisionCamera iOS 13 availability warnings
# This script patches the VisionCamera extension to add @available attribute

set -e

VISION_CAMERA_FILE="node_modules/react-native-vision-camera/ios/Core/Extensions/UIApplication+interfaceOrientation.swift"

if [ -f "$VISION_CAMERA_FILE" ]; then
    echo "🔧 Patching VisionCamera for iOS 13+ compatibility..."
    
    # Check if already patched
    if grep -q "@available(iOS 13.0, \*)" "$VISION_CAMERA_FILE"; then
        echo "✅ VisionCamera already patched"
    else
        # Add @available attribute before the extension
        sed -i '' 's/extension UIApplication {/@available(iOS 13.0, *)\
extension UIApplication {/' "$VISION_CAMERA_FILE"
        echo "✅ VisionCamera patched successfully"
    fi
else
    echo "⚠️  VisionCamera file not found at: $VISION_CAMERA_FILE"
fi
