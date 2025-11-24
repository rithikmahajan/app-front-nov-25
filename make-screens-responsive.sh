#!/bin/bash

# Comprehensive script to make remaining screens responsive
# This adds responsive imports and converts hardcoded values to responsive ones

echo "🎨 Making remaining critical screens responsive..."
echo ""

# List of critical screens to update
declare -A screens=(
  ["bagemptyscreen.js"]="Bag empty state"
  ["bagquantityselectormodaloverlay.js"]="Bag quantity selector"
  ["bagsizeselectormodaloverlay.js"]="Bag size selector"
  ["InviteAFriend.js"]="Invite a friend"
)

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10/src/screens

for file in "${!screens[@]}"; do
  description="${screens[$file]}"
  
  if [ ! -f "$file" ]; then
    echo "⏭️  Skipping $file (not found)"
    continue
  fi
  
  echo "📝 Processing: $file ($description)"
  
  # Check if already has responsive imports
  if grep -q "getResponsive" "$file"; then
    echo "✅ Already responsive: $file"
    continue
  fi
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Add responsive imports after StyleSheet import
  if grep -q "StyleSheet" "$file"; then
    sed -i.tmp "/import.*StyleSheet/a\\
import { getResponsiveFontSize, getResponsiveSpacing, getResponsiveValue, getResponsiveGrid } from '../utils/responsive';
" "$file"
    
    # Common replacements for hardcoded values
    # fontSize: 16 -> fontSize: getResponsiveFontSize(16)
    sed -i.tmp -E "s/fontSize: ([0-9]+),/fontSize: getResponsiveFontSize(\1),/g" "$file"
    
    # padding: 16 -> padding: getResponsiveSpacing(16)
    sed -i.tmp -E "s/padding: ([0-9]+),/padding: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingHorizontal: ([0-9]+),/paddingHorizontal: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingVertical: ([0-9]+),/paddingVertical: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingTop: ([0-9]+),/paddingTop: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingBottom: ([0-9]+),/paddingBottom: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingLeft: ([0-9]+),/paddingLeft: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/paddingRight: ([0-9]+),/paddingRight: getResponsiveSpacing(\1),/g" "$file"
    
    # margin variants
    sed -i.tmp -E "s/margin: ([0-9]+),/margin: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginHorizontal: ([0-9]+),/marginHorizontal: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginVertical: ([0-9]+),/marginVertical: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginTop: ([0-9]+),/marginTop: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginBottom: ([0-9]+),/marginBottom: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginLeft: ([0-9]+),/marginLeft: getResponsiveSpacing(\1),/g" "$file"
    sed -i.tmp -E "s/marginRight: ([0-9]+),/marginRight: getResponsiveSpacing(\1),/g" "$file"
    
    # gap
    sed -i.tmp -E "s/gap: ([0-9]+),/gap: getResponsiveSpacing(\1),/g" "$file"
    
    # borderRadius
    sed -i.tmp -E "s/borderRadius: ([0-9]+),/borderRadius: getResponsiveValue(\1, \1 * 1.2, \1 * 1.4),/g" "$file"
    
    # Clean up temp files
    rm -f "$file.tmp"
    
    echo "✅ Made responsive: $file"
  else
    echo "⚠️  No StyleSheet import found in: $file"
  fi
  
  echo ""
done

echo "🎉 All screens processed!"
echo ""
echo "📋 Files updated:"
for file in "${!screens[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  fi
done
echo ""
echo "💾 Backup files created with .backup extension"
echo "🔍 Please review and test the changes"
