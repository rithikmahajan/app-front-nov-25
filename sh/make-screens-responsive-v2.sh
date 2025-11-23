#!/bin/bash

# Comprehensive script to make remaining screens responsive
# This adds responsive imports and converts hardcoded values to responsive ones

set -e  # Exit on error
set -u  # Exit on undefined variable

echo "🎨 Making remaining critical screens responsive..."
echo ""

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10/src/screens

# Array of files to process
files=(
  "bagemptyscreen.js"
  "bagquantityselectormodaloverlay.js"
  "bagsizeselectormodaloverlay.js"
  "InviteAFriend.js"
)

success_count=0
skip_count=0
error_count=0

for file in "${files[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Processing: $file"
  
  if [ ! -f "$file" ]; then
    echo "⏭️  File not found, skipping..."
    ((skip_count++))
    continue
  fi
  
  # Check if already has responsive imports
  if grep -q "from '../utils/responsive'" "$file"; then
    echo "✅ Already has responsive imports"
    ((skip_count++))
    continue
  fi
  
  echo "🔧 Adding responsive utilities..."
  
  # Create backup
  cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
  
  # Check if file has StyleSheet import
  if ! grep -q "StyleSheet" "$file"; then
    echo "⚠️  No StyleSheet import found, skipping..."
    ((skip_count++))
    continue
  fi
  
  # Add responsive imports using perl for better compatibility
  perl -i -pe 'if (/import.*StyleSheet/ && !$done) {
    $_ .= "import { getResponsiveFontSize, getResponsiveSpacing, getResponsiveValue, getResponsiveGrid } from '\''../utils/responsive'\'';\n";
    $done = 1;
  }' "$file"
  
  # Verify the import was added
  if ! grep -q "from '../utils/responsive'" "$file"; then
    echo "❌ Failed to add imports"
    ((error_count++))
    continue
  fi
  
  echo "✅ Added responsive imports"
  echo "🔄 Converting hardcoded values..."
  
  # Convert fontSize values
  perl -i -pe 's/fontSize:\s*(\d+),/fontSize: getResponsiveFontSize($1),/g' "$file"
  
  # Convert padding values
  perl -i -pe 's/padding:\s*(\d+),/padding: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingHorizontal:\s*(\d+),/paddingHorizontal: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingVertical:\s*(\d+),/paddingVertical: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingTop:\s*(\d+),/paddingTop: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingBottom:\s*(\d+),/paddingBottom: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingLeft:\s*(\d+),/paddingLeft: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/paddingRight:\s*(\d+),/paddingRight: getResponsiveSpacing($1),/g' "$file"
  
  # Convert margin values
  perl -i -pe 's/margin:\s*(\d+),/margin: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginHorizontal:\s*(\d+),/marginHorizontal: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginVertical:\s*(\d+),/marginVertical: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginTop:\s*(\d+),/marginTop: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginBottom:\s*(\d+),/marginBottom: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginLeft:\s*(\d+),/marginLeft: getResponsiveSpacing($1),/g' "$file"
  perl -i -pe 's/marginRight:\s*(\d+),/marginRight: getResponsiveSpacing($1),/g' "$file"
  
  # Convert gap
  perl -i -pe 's/gap:\s*(\d+),/gap: getResponsiveSpacing($1),/g' "$file"
  
  # Convert borderRadius (using getResponsiveValue for 3-tier scaling)
  perl -i -pe 's/borderRadius:\s*(\d+),/borderRadius: getResponsiveValue($1, $1 * 1.2, $1 * 1.4),/g' "$file"
  
  echo "✅ Converted hardcoded values to responsive"
  
  # Verify the file is still valid JavaScript (basic check)
  if grep -q "StyleSheet.create" "$file" && grep -q "export default" "$file"; then
    echo "✅ File structure looks valid"
    ((success_count++))
  else
    echo "⚠️  Warning: File structure might have issues"
    ((error_count++))
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Processing complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Successfully updated: $success_count"
echo "  ⏭️  Skipped: $skip_count"
echo "  ❌ Errors: $error_count"
echo ""
echo "💾 Backup files created with timestamp"
echo "🔍 Please review and test the changes"
echo ""

if [ $error_count -gt 0 ]; then
  echo "⚠️  Some files had errors. Please review them manually."
  exit 1
fi

exit 0
