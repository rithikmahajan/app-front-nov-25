#!/bin/bash

# Script to help identify screens that need responsive fixes
# This will scan all screen files and check which ones need responsive imports

echo "🔍 Scanning screens for responsive design status..."
echo "=================================================="
echo ""

SCREENS_DIR="src/screens"
TOTAL_SCREENS=0
ALREADY_RESPONSIVE=0
NEEDS_FIX=0

# Create output files
> needs_responsive_fix.txt
> already_responsive.txt

# Scan all .js files in screens directory
for file in "$SCREENS_DIR"/*.js; do
    if [ -f "$file" ]; then
        TOTAL_SCREENS=$((TOTAL_SCREENS + 1))
        filename=$(basename "$file")
        
        # Check if file imports responsive utilities
        if grep -q "import.*responsive" "$file"; then
            echo "✅ $filename" >> already_responsive.txt
            ALREADY_RESPONSIVE=$((ALREADY_RESPONSIVE + 1))
        else
            echo "❌ $filename" >> needs_responsive_fix.txt
            NEEDS_FIX=$((NEEDS_FIX + 1))
        fi
    fi
done

echo "📊 Summary:"
echo "--------"
echo "Total screens: $TOTAL_SCREENS"
echo "Already responsive: $ALREADY_RESPONSIVE"
echo "Needs fix: $NEEDS_FIX"
echo ""
echo "📝 Files created:"
echo "  - already_responsive.txt (screens that are already responsive)"
echo "  - needs_responsive_fix.txt (screens that need fixes)"
echo ""

# Show screens that need fixes
echo "🔧 Screens needing responsive fixes:"
echo "-----------------------------------"
cat needs_responsive_fix.txt
