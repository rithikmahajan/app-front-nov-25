#!/bin/bash

# Script to fix Hermes dSYM issues for App Store upload
# This script ensures proper debug symbols are included

echo "🔧 Fixing Hermes dSYM for App Store upload..."

# Set paths
PROJECT_DIR="$(dirname "$0")"
HERMES_FRAMEWORK_PATH="$PROJECT_DIR/Pods/hermes-engine/destroot"
BUILD_DIR="$PROJECT_DIR/build"

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Function to fix Hermes dSYM
fix_hermes_dsym() {
    echo "📦 Processing Hermes framework..."
    
    # Find Hermes framework
    HERMES_FRAMEWORK=$(find "$PROJECT_DIR/Pods" -name "hermes.framework" -type d | head -1)
    
    if [ -z "$HERMES_FRAMEWORK" ]; then
        echo "❌ Hermes framework not found!"
        return 1
    fi
    
    echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK"
    
    # Check if dSYM already exists
    HERMES_DSYM="${HERMES_FRAMEWORK}.dSYM"
    
    if [ ! -d "$HERMES_DSYM" ]; then
        echo "🔨 Creating dSYM for Hermes framework..."
        
        # Create dSYM using dsymutil
        dsymutil "$HERMES_FRAMEWORK/hermes" -o "$HERMES_DSYM"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully created Hermes dSYM"
        else
            echo "⚠️  Warning: Could not create dSYM for Hermes"
        fi
    else
        echo "✅ Hermes dSYM already exists"
    fi
}

# Function to verify dSYM
verify_dsym() {
    HERMES_FRAMEWORK=$(find "$PROJECT_DIR/Pods" -name "hermes.framework" -type d | head -1)
    HERMES_DSYM="${HERMES_FRAMEWORK}.dSYM"
    
    if [ -d "$HERMES_DSYM" ]; then
        echo "🔍 Verifying dSYM..."
        dwarfdump --uuid "$HERMES_DSYM"
        echo "✅ dSYM verification complete"
        return 0
    else
        echo "❌ dSYM not found for verification"
        return 1
    fi
}

# Main execution
echo "🚀 Starting Hermes dSYM fix process..."

# Run the fix
fix_hermes_dsym

# Verify the result
verify_dsym

echo "🎉 Hermes dSYM fix process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run this script before creating your archive"
echo "2. Create archive using Xcode: Product > Archive"
echo "3. Upload to App Store Connect"
echo ""
echo "Note: The dSYM warning should be resolved in future uploads."
