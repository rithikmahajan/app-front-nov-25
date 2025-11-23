#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🚀 REBUILD PRODUCTION APP WITH FIREBASE FIX              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Checklist:"
echo "  ✅ SHA-256 added to Firebase Console"
echo "  ✅ google-services.json updated"
echo "  ⏰ Waiting for Firebase propagation (recommended: 5-10 mins)"
echo ""

read -p "Have you waited 5-10 minutes since adding SHA to Firebase? (y/n): " response

if [[ "$response" != "y" ]]; then
    echo ""
    echo "⏰ Please wait 5-10 minutes for Firebase to propagate the changes."
    echo "   Then run this script again."
    exit 0
fi

echo ""
echo "🧹 Step 1: Cleaning previous builds..."
cd android
./gradlew clean
cd ..

echo ""
echo "🏗️  Step 2: Building production AAB..."
cd android
./gradlew bundleRelease
cd ..

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ BUILD SUCCESSFUL!                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📦 Your production AAB is ready at:"
    echo "   android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Upload app-release.aab to Google Play Console"
    echo "   2. Test phone authentication on the production build"
    echo "   3. Phone OTP should now work! 🎉"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
