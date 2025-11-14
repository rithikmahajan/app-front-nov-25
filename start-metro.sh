#!/bin/bash

# Start Metro Bundler with better dev experience
# This ensures Metro stays running and provides better feedback

echo "🚀 Starting Metro Bundler for Yoraa App"
echo "=================================="
echo ""
echo "📱 Dev Menu Access:"
echo "  - iOS Simulator: Press Cmd+D"
echo "  - iOS Device: Shake your device"
echo "  - Android Emulator: Press Cmd+M"
echo "  - Android Device: Shake your device"
echo ""
echo "🔥 Features Enabled:"
echo "  ✅ Fast Refresh"
echo "  ✅ Hot Module Replacement"
echo "  ✅ Source Maps"
echo "  ✅ Remote JS Debugging"
echo ""
echo "🌐 Metro running at: http://localhost:8081"
echo "=================================="
echo ""

# Clear watchman and metro cache
echo "🧹 Clearing cache..."
watchman watch-del-all 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

# Start Metro with reset cache
npx react-native start --reset-cache
