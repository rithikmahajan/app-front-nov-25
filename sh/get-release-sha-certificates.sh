#!/bin/bash

# Script to get SHA-1 and SHA-256 certificates from RELEASE keystore
# These are needed for Firebase Authentication in production builds

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║      🔐 Getting RELEASE Keystore SHA Certificates             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if keystore.properties exists
KEYSTORE_PROPS="android/keystore.properties"

if [ ! -f "$KEYSTORE_PROPS" ]; then
    echo "❌ Error: keystore.properties not found at $KEYSTORE_PROPS"
    echo ""
    echo "Please create keystore.properties with:"
    echo "  storeFile=path/to/your/release.keystore"
    echo "  storePassword=your_store_password"
    echo "  keyAlias=your_key_alias"
    echo "  keyPassword=your_key_password"
    exit 1
fi

# Read keystore path from properties file
KEYSTORE_FILE=$(grep "storeFile=" "$KEYSTORE_PROPS" | cut -d'=' -f2)
KEYSTORE_PASS=$(grep "storePassword=" "$KEYSTORE_PROPS" | cut -d'=' -f2)
KEY_ALIAS=$(grep "keyAlias=" "$KEYSTORE_PROPS" | cut -d'=' -f2)

echo "📁 Keystore File: $KEYSTORE_FILE"
echo "🔑 Key Alias: $KEY_ALIAS"
echo ""

# Convert relative path to absolute if needed
if [[ "$KEYSTORE_FILE" != /* ]]; then
    KEYSTORE_FILE="android/$KEYSTORE_FILE"
fi

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ Error: Keystore file not found at $KEYSTORE_FILE"
    exit 1
fi

echo "🔍 Extracting SHA certificates from RELEASE keystore..."
echo ""

# Get SHA-1 and SHA-256
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              📋 RELEASE KEYSTORE CERTIFICATES                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASS" | grep -E "SHA1:|SHA256:"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   🔧 NEXT STEPS                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Copy the SHA-1 and SHA-256 from above"
echo "2. Go to Firebase Console:"
echo "   https://console.firebase.google.com/u/0/project/yoraa-android-ios/settings/general/android:com.yoraa"
echo ""
echo "3. Click 'Add fingerprint' button"
echo "4. Paste the SHA-1 first, save"
echo "5. Click 'Add fingerprint' again"
echo "6. Paste the SHA-256, save"
echo ""
echo "7. Wait 5 minutes for changes to propagate"
echo "8. Rebuild your production APK/AAB"
echo "9. Test phone authentication"
echo ""
echo "✅ After adding these certificates, your production builds will work!"
echo ""
