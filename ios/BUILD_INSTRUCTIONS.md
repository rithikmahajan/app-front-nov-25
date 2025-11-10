# iOS Production Build Instructions

## Status: Ready to Build in Xcode

All configuration is complete:
- ✅ Production environment configured (.env.production)
- ✅ CocoaPods installed (113 pods with dynamic frameworks)
- ✅ React Native bundle pre-built (main.jsbundle)
- ✅ Sandbox fixes applied for CocoaPods scripts
- ✅ Info.plist configured for production
- ✅ Backend verified: https://api.yoraa.in.net/api

## Build Using Xcode (RECOMMENDED)

1. **Open Xcode:**
   ```bash
   open Yoraa.xcworkspace
   ```

2. **Select the scheme:**
   - Click on "Yoraa" next to the Run/Stop buttons
   - Select "Yoraa" scheme
   - Select "Any iOS Device (arm64)" or your connected device

3. **Select Release configuration:**
   - Product menu → Scheme → Edit Scheme
   - Select "Archive" on the left
   - Build Configuration: Release
   - Click "Close"

4. **Create Archive:**
   - Product menu → Archive
   - Wait for build to complete (5-10 minutes)

5. **Upload to App Store:**
   - When Organizer opens, select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the prompts

## Why Xcode GUI Works

The command-line `xcodebuild` has sandbox restrictions that block:
- CocoaPods framework embedding scripts
- Resource copying scripts

Xcode.app has full disk access entitlements, so these operations work fine in the GUI.

## Alternative: Command Line (Advanced)

If you need command-line builds for CI/CD:

```bash
# Grant Terminal full disk access in System Settings → Privacy & Security
# Then run:
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios
xcodebuild -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release \
  -archivePath "$PWD/build/Yoraa.xcarchive" \
  archive \
  SKIP_BUNDLING=1 \
  -allowProvisioningUpdates
```

## Troubleshooting

### If build fails with "Bundle React Native code" error:
- The pre-built bundle exists at: `ios/main.jsbundle`
- SKIP_BUNDLING=1 flag should use it

### If you see sandbox errors:
- Use Xcode GUI instead
- Or grant Terminal/iTerm full disk access in System Settings

### Backend connectivity:
- Production: https://api.yoraa.in.net/api
- Verified working: ✅

## Next Steps After Archive

1. **Code Signing:** Xcode will handle automatically
2. **Upload:** Use Organizer → Distribute App
3. **TestFlight:** Available within 5-10 minutes
4. **App Store:** Submit for review from App Store Connect

---
**Configuration Files:**
- Environment: `.env.production`
- iOS Config: `ios/Yoraa/Info.plist`
- CocoaPods: `ios/Podfile` (dynamic frameworks)
- Bundle: `ios/main.jsbundle` (pre-built)
