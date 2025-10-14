#!/bin/bash

# ============================================================================
# Firebase Console Quick Access Script
# ============================================================================

echo "🔥 Opening Firebase Console Pages..."
echo ""

PROJECT_ID="yoraa-android-ios"

# Open Firebase Console pages in browser
echo "Opening the following pages in your browser:"
echo ""
echo "1️⃣  Phone Authentication Providers"
echo "2️⃣  Project Settings (iOS App)"
echo "3️⃣  Cloud Messaging (APNs Configuration)"
echo ""

# Authentication Providers
open "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

# Wait a moment
sleep 1

# Project Settings
open "https://console.firebase.google.com/project/$PROJECT_ID/settings/general"

# Wait a moment
sleep 1

# Cloud Messaging for APNs
open "https://console.firebase.google.com/project/$PROJECT_ID/settings/cloudmessaging"

echo ""
echo "✅ Firebase Console pages opened!"
echo ""
echo "📋 Quick Checklist:"
echo "   □ Enable Phone authentication provider"
echo "   □ Verify iOS app is registered with correct Bundle ID"
echo "   □ Upload APNs Auth Key or Certificate (for production)"
echo ""
