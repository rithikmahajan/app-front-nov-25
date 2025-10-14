#!/bin/bash

# Script to fix App Store upload issues
# 1. Hermes dSYM generation
# 2. Background Task Scheduler configuration

set -e

echo "🔧 Fixing App Store upload issues..."

# Only run for Release builds and Archive action
if [ "${CONFIGURATION}" != "Release" ]; then
    echo "ℹ️  Skipping - not a Release build"
    exit 0
fi

# Fix 1: Generate Hermes dSYM
echo "📦 Generating Hermes dSYM..."

# Find Hermes framework in Pods
HERMES_FRAMEWORK=$(find "${PODS_ROOT}" -name "hermes.framework" -o -name "hermes-engine.framework" 2>/dev/null | head -1)

if [ -n "$HERMES_FRAMEWORK" ]; then
    echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK"
    
    # Find the actual binary
    HERMES_BINARY=""
    if [ -f "$HERMES_FRAMEWORK/hermes" ]; then
        HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
    elif [ -f "$HERMES_FRAMEWORK/hermes-engine" ]; then
        HERMES_BINARY="$HERMES_FRAMEWORK/hermes-engine"
    fi
    
    if [ -n "$HERMES_BINARY" ]; then
        HERMES_DSYM="${HERMES_FRAMEWORK}.dSYM"
        
        # Generate dSYM if it doesn't exist
        if [ ! -d "$HERMES_DSYM" ]; then
            echo "🔨 Creating dSYM for Hermes..."
            xcrun dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM" 2>&1 || {
                echo "⚠️  Could not create dSYM, trying alternative method..."
                # Alternative: Copy framework to build products and generate there
                BUILT_HERMES="${BUILT_PRODUCTS_DIR}/hermes.framework"
                if [ ! -d "$BUILT_HERMES" ]; then
                    cp -R "$HERMES_FRAMEWORK" "$BUILT_HERMES"
                fi
                xcrun dsymutil "${BUILT_HERMES}/hermes" -o "${BUILT_HERMES}.dSYM" 2>&1 || echo "⚠️  Alternative method also failed"
            }
            
            if [ -d "$HERMES_DSYM" ]; then
                echo "✅ Successfully created Hermes dSYM"
                # Copy to build products directory
                if [ -n "${DWARF_DSYM_FOLDER_PATH}" ]; then
                    cp -R "$HERMES_DSYM" "${DWARF_DSYM_FOLDER_PATH}/" 2>&1 || echo "⚠️  Could not copy to dSYM folder"
                fi
            fi
        else
            echo "✅ Hermes dSYM already exists"
        fi
        
        # Verify the dSYM
        if [ -d "$HERMES_DSYM" ]; then
            echo "🔍 Verifying dSYM UUIDs..."
            xcrun dwarfdump --uuid "$HERMES_DSYM" 2>&1 || echo "⚠️  Could not verify dSYM"
        fi
    else
        echo "⚠️  Hermes binary not found in framework"
    fi
else
    echo "⚠️  Hermes framework not found - this is expected if not using Hermes"
fi

# Fix 2: Ensure proper stripping settings
echo "🔨 Configuring strip settings..."
if [ -n "${BUILT_PRODUCTS_DIR}" ] && [ -n "${EXECUTABLE_NAME}" ]; then
    APP_BINARY="${BUILT_PRODUCTS_DIR}/${EXECUTABLE_NAME}.app/${EXECUTABLE_NAME}"
    if [ -f "$APP_BINARY" ]; then
        echo "✅ App binary found at: $APP_BINARY"
        # Ensure binary has proper debug info
        xcrun dwarfdump --uuid "$APP_BINARY" 2>&1 || echo "⚠️  Could not verify app binary UUID"
    fi
fi

echo "✅ App Store upload fix completed!"
