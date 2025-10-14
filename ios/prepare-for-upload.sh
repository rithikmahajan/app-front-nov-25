#!/bin/bash

# Quick Archive and Upload Script for App Store
# This script helps you prepare for App Store submission

set -e

echo "🚀 Preparing for App Store Upload..."
echo ""

# Step 1: Clean
echo "🧹 Step 1: Cleaning previous builds..."
cd "$(dirname "$0")"
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true
echo "✅ Clean complete"
echo ""

# Step 2: Run fix script
echo "🔧 Step 2: Running upload fixes..."
./fix-upload-issues.sh
echo "✅ Fixes applied"
echo ""

# Step 3: Instructions
echo "📱 Step 3: Create Archive in Xcode"
echo ""
echo "Please complete these steps manually in Xcode:"
echo ""
echo "1. Open Yoraa.xcworkspace (NOT .xcodeproj)"
echo "   Command: open Yoraa.xcworkspace"
echo ""
echo "2. Select target device: Any iOS Device (arm64)"
echo ""
echo "3. Verify scheme settings:"
echo "   - Product → Scheme → Edit Scheme"
echo "   - Archive → Build Configuration = Release"
echo "   - Click Close"
echo ""
echo "4. Create archive:"
echo "   - Product → Archive"
echo "   - Wait for build to complete (5-10 minutes)"
echo ""
echo "5. Upload to App Store Connect:"
echo "   - In Organizer, click 'Distribute App'"
echo "   - Choose 'App Store Connect'"
echo "   - Click 'Upload'"
echo "   - Follow the prompts"
echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ FIXES APPLIED:"
echo "   • BGTaskSchedulerPermittedIdentifiers added"
echo "   • Hermes dSYM configuration updated"
echo "   • Background modes configured"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🎯 Ready to archive! Open Xcode now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    open Yoraa.xcworkspace
    echo "✅ Xcode opened. Follow the steps above to archive."
else
    echo "💡 When ready, run: open Yoraa.xcworkspace"
fi
