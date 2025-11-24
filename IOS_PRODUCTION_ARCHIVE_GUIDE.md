# iOS Production Archive - Xcode Guide

## Automated Build (Recommended)

Run the automated script:
```bash
chmod +x build-ios-production-archive.sh
./build-ios-production-archive.sh
```

## Manual Build in Xcode

### Step 1: Open Xcode Workspace
```bash
open ios/Yoraa.xcworkspace
```

### Step 2: Select Generic iOS Device
1. In Xcode, click on the device selector near the top-left (next to the scheme name)
2. Select **"Any iOS Device (arm64)"** or **"Generic iOS Device"**
3. DO NOT select a simulator - archives can only be created for real devices

### Step 3: Clean Build Folder
1. Go to **Product** → **Clean Build Folder** (⇧⌘K)
2. Wait for cleaning to complete

### Step 4: Create Archive
1. Go to **Product** → **Archive** (or press ⇧⌘B then ⇧⌘R)
2. Wait for the archive process to complete (this may take 5-10 minutes)
3. Xcode will automatically open the **Organizer** window when done

### Step 5: Organizer Window
Once the archive is created, you'll see it in the Organizer:

1. The archive will be listed with the version number and date
2. Click **"Distribute App"** button on the right

### Step 6: Distribution Options
Choose your distribution method:

#### For App Store:
1. Select **"App Store Connect"**
2. Click **Next**
3. Select **"Upload"** (to upload to TestFlight/App Store)
4. Click **Next**
5. Review settings and click **Upload**

#### For Ad Hoc/Enterprise:
1. Select **"Ad Hoc"** or **"Enterprise"**
2. Click **Next**
3. Select distribution certificate and provisioning profile
4. Click **Export**
5. Choose a location to save the IPA file

### Step 7: Upload to App Store Connect
If you chose "Upload":
1. Xcode will validate your app
2. Fix any issues that appear
3. Once validated, it will upload to App Store Connect
4. You'll receive an email when processing is complete (usually 5-30 minutes)

## Troubleshooting

### Error: "No accounts with App Store Connect access"
**Solution:**
1. Go to **Xcode** → **Preferences** → **Accounts**
2. Add your Apple Developer account
3. Select your team

### Error: "Signing certificate not found"
**Solution:**
1. Go to **Xcode** → **Preferences** → **Accounts**
2. Select your account → **Manage Certificates**
3. Click **+** → **Apple Distribution**

### Error: "Provisioning profile doesn't match"
**Solution:**
1. In Xcode project settings, select the target **"Yoraa"**
2. Go to **Signing & Capabilities** tab
3. Check **"Automatically manage signing"**
4. Select your team

### Archive button is grayed out
**Solution:**
- Make sure you've selected **"Any iOS Device"** or **"Generic iOS Device"**
- Archives cannot be created when a simulator is selected

## Verification Checklist

Before archiving, ensure:
- [ ] Bundle Identifier is correct (e.g., com.yourcompany.yoraa)
- [ ] Version and Build numbers are incremented
- [ ] Signing is configured correctly (Team selected)
- [ ] All dependencies are installed (pod install)
- [ ] Generic iOS Device is selected (not simulator)
- [ ] Configuration is set to "Release"

## Build Configuration Details

### Release Configuration
Location: `ios/Yoraa.xcodeproj/project.pbxproj`

Key settings for Release:
- **Build Configuration**: Release
- **Code Signing**: Automatic
- **Bitcode**: Disabled (for newer React Native)
- **Architecture**: arm64

## Post-Archive Steps

### Access Archives Later
1. Go to **Window** → **Organizer** (⇧⌘⌥O)
2. Select **Archives** tab
3. All your archives are listed here

### TestFlight
After uploading to App Store Connect:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **TestFlight** tab
3. Wait for processing to complete
4. Add internal/external testers
5. Submit for Beta Review (for external testers)

### App Store Submission
1. Go to App Store Connect
2. Create a new version in **App Store** tab
3. Fill in all required metadata
4. Select the build from TestFlight
5. Submit for review

## Common Build Settings

### Info.plist Location
`ios/Yoraa/Info.plist`

### Version Management
- **Version** (CFBundleShortVersionString): User-facing version (e.g., 1.0.0)
- **Build** (CFBundleVersion): Build number (must increment for each upload)

### Increment Build Number
```bash
cd ios
agvtool next-version -all
```

## Archive Output

When using the automated script:
- **Archive**: `build/ios/Yoraa.xcarchive`
- **IPA**: `build/ios/export/Yoraa.ipa`

## Opening Archive in Organizer

```bash
open build/ios/Yoraa.xcarchive
```

Or open Organizer directly:
```bash
# Open Organizer
open -a Xcode
# Then: Window → Organizer
```

## Support

For issues with:
- **Signing**: Check Apple Developer Portal
- **Upload**: Check App Store Connect status
- **Build errors**: Check Xcode build logs

---

**Created**: November 24, 2025
**Last Updated**: November 24, 2025
