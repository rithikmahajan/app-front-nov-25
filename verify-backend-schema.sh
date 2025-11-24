#!/bin/bash

# 🔍 Backend Schema Verification Script
# This script helps verify the authProvider enum issue
# Run this on your backend server

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Backend authProvider Schema Verification Script            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Find User model files
echo "🔍 Searching for User model files..."
echo ""

USER_MODEL_FILES=$(find . -type f \( -name "*user*.js" -o -name "*User*.js" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)

if [ -z "$USER_MODEL_FILES" ]; then
    echo "❌ No User model files found!"
    echo "Please run this from your backend project root directory."
    exit 1
fi

echo "📁 Found User model files:"
echo "$USER_MODEL_FILES"
echo ""

# Search for authProvider enum definition
echo "🔍 Searching for authProvider enum definition..."
echo ""

for file in $USER_MODEL_FILES; do
    echo "📄 Checking: $file"
    
    # Search for authProvider enum
    ENUM_FOUND=$(grep -A 5 "authProvider.*{" "$file" | grep -E "enum.*\[.*\]" 2>/dev/null)
    
    if [ ! -z "$ENUM_FOUND" ]; then
        echo "✅ Found authProvider enum in: $file"
        echo ""
        echo "Current enum values:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        grep -A 10 "authProvider" "$file" | head -15
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Check if 'phone' is in the enum
        HAS_PHONE=$(grep -A 5 "authProvider.*{" "$file" | grep -E "enum.*\[.*'phone'.*\]|enum.*\[.*\"phone\".*\]" 2>/dev/null)
        
        if [ -z "$HAS_PHONE" ]; then
            echo "❌ ERROR: 'phone' is NOT in the authProvider enum!"
            echo ""
            echo "This is the root cause of the production error:"
            echo "  'User validation failed: authProvider: \`phone\` is not a valid enum value'"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🔧 FIX REQUIRED:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "Add 'phone' to the enum array in: $file"
            echo ""
            echo "Example:"
            echo "  enum: ['apple', 'google', 'facebook', 'phone']  // ✅ Add 'phone'"
            echo ""
            echo "Or if you have 'email'/'password':"
            echo "  enum: ['apple', 'google', 'email', 'password', 'phone']"
            echo ""
        else
            echo "✅ SUCCESS: 'phone' is already in the authProvider enum!"
            echo ""
        fi
        
        # Check for google.com / apple.com mapping
        echo "🔍 Checking for Firebase provider mapping logic..."
        MAPPING_FOUND=$(grep -r "sign_in_provider\|google\.com\|apple\.com" "$file" 2>/dev/null)
        
        if [ -z "$MAPPING_FOUND" ]; then
            echo "⚠️  WARNING: No Firebase provider mapping found"
            echo ""
            echo "Firebase returns values like 'google.com' and 'apple.com'"
            echo "but your enum likely expects 'google' and 'apple'"
            echo ""
            echo "Recommended: Add mapping logic in your login endpoint"
            echo ""
        fi
    fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Firebase Auth Provider Values Reference                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Firebase ID token contains these sign_in_provider values:"
echo ""
echo "  • Phone Auth:       'phone'"
echo "  • Apple Sign In:    'apple.com'"
echo "  • Google Sign In:   'google.com'"
echo "  • Email/Password:   'password'"
echo "  • Facebook:         'facebook.com'"
echo ""
echo "Your backend enum MUST either:"
echo "  1. Include these exact values, OR"
echo "  2. Map them to your enum values"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Search for Firebase auth controller
echo "🔍 Searching for Firebase auth controller..."
echo ""

AUTH_CONTROLLERS=$(find . -type f \( -name "*auth*controller*.js" -o -name "*authController*.js" -o -name "*auth*.js" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | grep -E "(controller|route)" | head -5)

if [ ! -z "$AUTH_CONTROLLERS" ]; then
    echo "📁 Found auth controller files:"
    echo "$AUTH_CONTROLLERS"
    echo ""
    
    for controller in $AUTH_CONTROLLERS; do
        # Check for Firebase login endpoint
        FIREBASE_LOGIN=$(grep -n "firebase.*login\|login.*firebase\|verifyIdToken" "$controller" 2>/dev/null | head -3)
        
        if [ ! -z "$FIREBASE_LOGIN" ]; then
            echo "✅ Found Firebase login code in: $controller"
            echo "$FIREBASE_LOGIN"
            echo ""
        fi
    done
fi

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Next Steps                                                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Review the enum values shown above"
echo "2. Add 'phone' to the authProvider enum if missing"
echo "3. Optionally add mapping logic for '.com' suffixes"
echo "4. Restart your backend server"
echo "5. Test Phone Auth login - error should be fixed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
