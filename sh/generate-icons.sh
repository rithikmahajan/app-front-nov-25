#!/bin/bash

# Script to generate app icons from SVG

SVG_FILE="/Users/rithikmahajan/yoraa-latest-goa/src/assets/icons/app-icon-square.svg"
IOS_DIR="/Users/rithikmahajan/yoraa-latest-goa/ios/YoraaApp/Images.xcassets/AppIcon.appiconset"
ANDROID_DIR="/Users/rithikmahajan/yoraa-latest-goa/android/app/src/main/res"

echo "Generating iOS icons..."

# iOS icon sizes
convert "$SVG_FILE" -resize 40x40 "$IOS_DIR/Icon-20@2x.png"
convert "$SVG_FILE" -resize 60x60 "$IOS_DIR/Icon-20@3x.png"
convert "$SVG_FILE" -resize 58x58 "$IOS_DIR/Icon-29@2x.png"
convert "$SVG_FILE" -resize 87x87 "$IOS_DIR/Icon-29@3x.png"
convert "$SVG_FILE" -resize 80x80 "$IOS_DIR/Icon-40@2x.png"
convert "$SVG_FILE" -resize 120x120 "$IOS_DIR/Icon-40@3x.png"
convert "$SVG_FILE" -resize 120x120 "$IOS_DIR/Icon-60@2x.png"
convert "$SVG_FILE" -resize 180x180 "$IOS_DIR/Icon-60@3x.png"
convert "$SVG_FILE" -resize 1024x1024 "$IOS_DIR/Icon-1024.png"

echo "Generating Android icons..."

# Android icon sizes
convert "$SVG_FILE" -resize 48x48 "$ANDROID_DIR/mipmap-mdpi/ic_launcher.png"
convert "$SVG_FILE" -resize 72x72 "$ANDROID_DIR/mipmap-hdpi/ic_launcher.png"
convert "$SVG_FILE" -resize 96x96 "$ANDROID_DIR/mipmap-xhdpi/ic_launcher.png"
convert "$SVG_FILE" -resize 144x144 "$ANDROID_DIR/mipmap-xxhdpi/ic_launcher.png"
convert "$SVG_FILE" -resize 192x192 "$ANDROID_DIR/mipmap-xxxhdpi/ic_launcher.png"

# Android round icons
convert "$SVG_FILE" -resize 48x48 "$ANDROID_DIR/mipmap-mdpi/ic_launcher_round.png"
convert "$SVG_FILE" -resize 72x72 "$ANDROID_DIR/mipmap-hdpi/ic_launcher_round.png"
convert "$SVG_FILE" -resize 96x96 "$ANDROID_DIR/mipmap-xhdpi/ic_launcher_round.png"
convert "$SVG_FILE" -resize 144x144 "$ANDROID_DIR/mipmap-xxhdpi/ic_launcher_round.png"
convert "$SVG_FILE" -resize 192x192 "$ANDROID_DIR/mipmap-xxxhdpi/ic_launcher_round.png"

echo "Icon generation complete!"
