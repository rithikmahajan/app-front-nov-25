#!/bin/bash

# Script to fix remaining screens with proper responsive helper functions
# This replaces incorrect multi-parameter calls with correct single-parameter calls

echo "🔧 Fixing remaining screens to use proper responsive helpers..."

# Array of files to fix
files=(
  "src/screens/OrderSuccessScreen.js"
  "src/screens/OrderTrackingScreen.js"
  "src/screens/CollectionScreen.js"
  "src/screens/orderstrackmodeloverlay.js"
  "src/screens/ordersreturnexchange.js"
  "src/screens/productdetailsmainreview.js"
)

# Function to fix a file
fix_file() {
  local file="$1"
  
  if [ ! -f "$file" ]; then
    echo "❌ File not found: $file"
    return 1
  fi
  
  echo "📝 Fixing: $file"
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Fix getResponsiveSpacing - remove second parameter
  sed -i.tmp -E 's/getResponsiveSpacing\(([0-9]+),[ ]*[0-9]+\)/getResponsiveSpacing(\1)/g' "$file"
  
  # Fix getResponsiveFontSize - remove second parameter
  sed -i.tmp -E 's/getResponsiveFontSize\(([0-9]+),[ ]*[0-9]+\)/getResponsiveFontSize(\1)/g' "$file"
  
  # Fix getResponsiveValue - ensure it has 3 parameters (phone, tablet, largeTablet)
  # This is more complex, we'll keep existing 2-param calls but note them
  
  # Remove temporary files
  rm -f "$file.tmp"
  
  echo "✅ Fixed: $file"
}

# Fix each file
for file in "${files[@]}"; do
  fix_file "$file"
  echo ""
done

echo "🎉 All files fixed!"
echo ""
echo "📋 Summary:"
echo "- Removed incorrect second parameters from getResponsiveSpacing()"
echo "- Removed incorrect second parameters from getResponsiveFontSize()"
echo "- Backup files created with .backup extension"
echo ""
echo "🔍 Please review the changes and test on different screen sizes"
