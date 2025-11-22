#!/bin/bash

# ============================================================================
# PRE-BUILD DIAGNOSTIC - Verify all requirements before building
# ============================================================================

echo "🔍 iOS Production Build Diagnostic"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Xcode installation
echo "1. Checking Xcode..."
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version | head -1)
    echo "   ✅ $XCODE_VERSION"
else
    echo "   ❌ Xcode not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: CocoaPods installation
echo "2. Checking CocoaPods..."
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo "   ✅ CocoaPods $POD_VERSION"
else
    echo "   ❌ CocoaPods not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Node.js installation
echo "3. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js $NODE_VERSION"
else
    echo "   ❌ Node.js not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Pods installed
echo "4. Checking Pods installation..."
if [ -d "ios/Pods" ]; then
    POD_COUNT=$(find ios/Pods -name "*.podspec" 2>/dev/null | wc -l)
    echo "   ✅ Pods installed ($POD_COUNT pods)"
else
    echo "   ⚠️  Pods not installed - run 'cd ios && pod install'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 5: Codegen files
echo "5. Checking React Native codegen files..."
if [ -d "ios/build/generated/ios" ]; then
    CODEGEN_COUNT=$(find ios/build/generated/ios -type f 2>/dev/null | wc -l)
    if [ "$CODEGEN_COUNT" -ge 40 ]; then
        echo "   ✅ Codegen files present ($CODEGEN_COUNT files)"
    else
        echo "   ⚠️  Insufficient codegen files ($CODEGEN_COUNT found, need 40+)"
        echo "      Run: cd ios && pod install"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ Codegen directory missing"
    echo "      Run: cd ios && pod install"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Xcode project file
echo "6. Checking Xcode project..."
if [ -f "ios/Yoraa.xcodeproj/project.pbxproj" ]; then
    echo "   ✅ Xcode project found"
    
    # Check for critical settings
    if grep -q "ENABLE_USER_SCRIPT_SANDBOXING = NO" ios/Yoraa.xcodeproj/project.pbxproj; then
        echo "   ✅ User script sandboxing disabled"
    else
        echo "   ⚠️  User script sandboxing not disabled (Xcode 16 issue)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ Xcode project not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Podfile
echo "7. Checking Podfile configuration..."
if [ -f "ios/Podfile" ]; then
    echo "   ✅ Podfile found"
    
    if grep -q "ENABLE_USER_SCRIPT_SANDBOXING" ios/Podfile; then
        echo "   ✅ Xcode 16 fixes in Podfile"
    else
        echo "   ⚠️  Missing Xcode 16 fixes in Podfile"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "CoreAudioTypes" ios/Podfile; then
        echo "   ✅ CoreAudioTypes framework fix present"
    else
        echo "   ⚠️  CoreAudioTypes framework fix missing"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ Podfile not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 8: Device connection
echo "8. Checking connected devices..."
DEVICES=$(xcrun xctrace list devices 2>&1 | grep -E "iPhone|iPad" | grep -v "Simulator")
if [ -n "$DEVICES" ]; then
    echo "   ✅ Physical device(s) connected:"
    echo "$DEVICES" | while read line; do
        echo "      - $line"
    done
else
    echo "   ⚠️  No physical device connected"
    echo "      Connect device for installation or build archive only"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 9: Xcode processes
echo "9. Checking for running Xcode processes..."
XCODE_PROCS=$(ps aux | grep -E "xcodebuild|Xcode" | grep -v grep | wc -l)
if [ "$XCODE_PROCS" -gt 0 ]; then
    echo "   ⚠️  $XCODE_PROCS Xcode process(es) running"
    echo "      This may cause 'database locked' errors"
    echo "      Run: pkill -9 xcodebuild && pkill -9 Xcode"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ No conflicting Xcode processes"
fi

# Check 10: DerivedData
echo "10. Checking DerivedData..."
DERIVED_DATA_SIZE=$(du -sh ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null | awk '{print $1}' | head -1)
if [ -n "$DERIVED_DATA_SIZE" ]; then
    echo "   ⚠️  DerivedData exists ($DERIVED_DATA_SIZE)"
    echo "      Consider cleaning for fresh build"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ DerivedData clean"
fi

# Summary
echo ""
echo "===================================="
echo "📊 Diagnostic Summary"
echo "===================================="
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ System ready for production build!"
    echo ""
    echo "Run: ./FINAL-PRODUCTION-BUILD.sh"
    exit 0
else
    echo "❌ Fix $ERRORS error(s) before building"
    exit 1
fi
