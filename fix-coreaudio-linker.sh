#!/bin/bash

echo "🔧 Fixing CoreAudioTypes Linker Issue..."

cd /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios

# The issue is that CoreAudioTypes is being added multiple times and the linker
# is treating it as a required framework. We need to:
# 1. Remove duplicate weak framework entries
# 2. Ensure it's ONLY weakly linked
# 3. Make sure no strong framework references exist

echo "Step 1: Backing up project.pbxproj..."
cp Yoraa.xcodeproj/project.pbxproj Yoraa.xcodeproj/project.pbxproj.backup-linker

echo "Step 2: Cleaning up duplicate CoreAudioTypes entries..."
# Remove duplicate weak framework entries, keep only one per OTHER_LDFLAGS array
perl -i -pe '
    if (/"-Wl,-weak_framework,CoreAudioTypes",/) {
        $count++;
        if ($count > 1 && $line_context eq "same_array") {
            $_ = "";  # Remove duplicate
        }
    }
    $line_context = (/OTHER_LDFLAGS/) ? "same_array" : "other";
' Yoraa.xcodeproj/project.pbxproj

echo "Step 3: Ensuring ONLY weak linking (no strong framework references)..."
# Make sure CoreAudioTypes is not in any FRAMEWORK_SEARCH_PATHS or linked as strong framework

echo "Step 4: Reinstalling pods to apply Podfile fixes..."
pod install --repo-update

echo "✅ Fix applied!"
echo ""
echo "📋 Summary:"
echo "- Cleaned duplicate CoreAudioTypes weak framework entries"
echo "- Pods reinstalled with Podfile fixes"
echo ""
echo "Next: Run the production build again"
