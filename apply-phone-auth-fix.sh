#!/bin/bash
# Fix for loginaccountmobilenumberverificationcode.js
# This script patches the confirmation object handling

FILE="src/screens/loginaccountmobilenumberverificationcode.js"

echo "🔧 Applying phone authentication fix..."

# Create backup
cp "$FILE" "$FILE.backup.nov21"
echo "✅ Backup created: $FILE.backup.nov21"

# Apply the fix using sed
# Replace the confirmation check with activeConfirmation logic

# For macOS sed (BSD sed)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS version
  sed -i '' '131,135s/if (!confirmation) {/\/\/ ✅ CRITICAL FIX: Use ref as fallback if state confirmation is lost\n    const activeConfirmation = confirmation || confirmationRef.current;\n\n    if (!activeConfirmation) {/' "$FILE"
  
  sed -i '' '136s/Alert.alert('\''Error'\'', '\''No verification session found. Please request a new OTP.'\'');/Alert.alert(\n        '\''Error'\'',\n        '\''No verification session found. Please request a new OTP.'\'',\n        [\n          {\n            text: '\''Request New OTP'\'',\n            onPress: () => navigation.goBack()\n          },\n          {\n            text: '\''Cancel'\'',\n            style: '\''cancel'\''\n          }\n        ]\n      );/' "$FILE"
  
  sed -i '' '147s/const verificationResult = await confirmation.confirm(code);/const verificationResult = await activeConfirmation.confirm(code);/' "$FILE"
else
  # Linux version  
  sed -i '131,135s/if (!confirmation) {/\/\/ ✅ CRITICAL FIX: Use ref as fallback if state confirmation is lost\n    const activeConfirmation = confirmation || confirmationRef.current;\n\n    if (!activeConfirmation) {/' "$FILE"
  
  sed -i '136s/Alert.alert('\''Error'\'', '\''No verification session found. Please request a new OTP.'\'');/Alert.alert(\n        '\''Error'\'',\n        '\''No verification session found. Please request a new OTP.'\'',\n        [\n          {\n            text: '\''Request New OTP'\'',\n            onPress: () => navigation.goBack()\n          },\n          {\n            text: '\''Cancel'\'',\n            style: '\''cancel'\''\n          }\n        ]\n      );/' "$FILE"
  
  sed -i '147s/const verificationResult = await confirmation.confirm(code);/const verificationResult = await activeConfirmation.confirm(code);/' "$FILE"
fi

echo "✅ Fix applied successfully!"
echo ""
echo "📝 Changes made:"
echo "  1. Added activeConfirmation = confirmation || confirmationRef.current"
echo "  2. Updated confirmation check to use activeConfirmation"
echo "  3. Added 'Request New OTP' button in error alert"
echo "  4. Changed confirmation.confirm() to activeConfirmation.confirm()"
echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "  1. Add production SHA-256 to Firebase Console"
echo "  2. Download and replace google-services.json"
echo "  3. Rebuild production APK"
echo ""
echo "📖 See PHONE_AUTH_FIX_NOV21.md for complete instructions"
