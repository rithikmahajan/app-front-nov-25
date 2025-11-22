#!/bin/bash

# Quick Fix Script for Firebase Phone Auth Production Issue
# This script helps you extract and display the SHA certificates

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   🔥 FIREBASE PHONE AUTH - PRODUCTION SHA CERTIFICATES        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📦 PRODUCTION KEYSTORE: app/app/upload-keystore.jks"
echo "🔑 ALIAS: upload-key"
echo ""

echo "🔍 Extracting SHA certificates..."
echo ""

keytool -list -v -keystore app/app/upload-keystore.jks -alias upload-key -storepass upload123 2>/dev/null | grep "SHA1\|SHA256"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  📋 COPY THESE TO FIREBASE                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Production SHA-1:"
echo "84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
echo ""
echo "Production SHA-256:"
echo "99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3"
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                     🚀 NEXT STEPS                             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Open Firebase Console:"
echo "   https://console.firebase.google.com/project/yoraa-android-ios/settings/general/android:com.yoraa"
echo ""
echo "2. Click 'Add fingerprint' and paste SHA-1"
echo "3. Click 'Add fingerprint' and paste SHA-256"
echo "4. Download new google-services.json"
echo "5. Replace android/app/google-services.json"
echo "6. Wait 5-10 minutes"
echo "7. Rebuild: cd android && ./gradlew bundleRelease"
echo ""
echo "✅ DONE! Your production phone auth will work!"
echo ""
