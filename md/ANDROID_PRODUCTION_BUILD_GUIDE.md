# 🚀 Android Production Build Guide

## Quick Start

```bash
./build-android-production.sh
```

## What This Does

1. **Verifies Configuration**
   - Checks `.env.production` exists
   - Displays production backend URL
   - Verifies keystore files

2. **Cleans Previous Builds**
   - Removes old build artifacts
   - Ensures clean build state

3. **Builds Production Release**
   - Choose APK or AAB format
   - Uses `.env.production` configuration
   - Signs with upload keystore

## Build Options

### APK (Option 1)
- For direct installation and testing
- Can be installed via `adb install`
- Useful for QA/testing before Play Store

### AAB (Option 2) - **Recommended for Play Store**
- Android App Bundle format
- Required for Play Store uploads
- Smaller download size for users
- Optimized per-device

## Production Configuration

Your `.env.production` is configured with:

```bash
✅ Backend API: https://api.yoraa.in.net/api
✅ Production MongoDB: (accessed via backend)
✅ Environment: production
✅ Debug Mode: false
✅ Razorpay: Live keys
✅ HTTPS: Enabled
✅ Build Type: release
```

## Build Output Locations

### APK
```
android/app/build/outputs/apk/release/app-release.apk
```

### AAB
```
android/app/build/outputs/bundle/release/app-release.aab
```

Both are also copied to the root directory for easy access.

## Play Store Upload Steps

1. Run: `./build-android-production.sh`
2. Choose option `2` for AAB
3. Go to [Google Play Console](https://play.google.com/console)
4. Select your app
5. Navigate to "Release" → "Production"
6. Click "Create new release"
7. Upload the `app-release.aab` file
8. Fill in release notes
9. Review and roll out

## Verification Checklist

Before uploading to Play Store:

- [ ] Backend URL is production: `https://api.yoraa.in.net/api`
- [ ] Debug mode is disabled
- [ ] Live Razorpay keys are configured
- [ ] Version code is incremented in `android/app/build.gradle`
- [ ] Build is signed with upload keystore
- [ ] Tested on physical device

## Version Management

Current version in `android/app/build.gradle`:
```gradle
versionCode 5
versionName "1.0"
```

**Important:** Increment `versionCode` before each Play Store upload!

## Troubleshooting

### Build Fails
```bash
# Check the log
cat build-production.log

# Clean and retry
cd android
./gradlew clean
cd ..
./build-android-production.sh
```

### Keystore Issues
Verify keystore files exist:
```bash
ls -la android/app/upload-keystore.jks
ls -la android/upload-keystore.properties
```

### Environment Not Loading
The script uses:
```bash
export ENVFILE=.env.production
```
This is handled automatically by the build script.

## Manual Build Commands

If you prefer manual control:

### Build APK
```bash
export ENVFILE=.env.production
cd android
./gradlew assembleRelease
```

### Build AAB
```bash
export ENVFILE=.env.production
cd android
./gradlew bundleRelease
```

## What Gets Connected

✅ **Production Backend:** `https://api.yoraa.in.net/api`
- All API calls go to production server
- Backend connects to production MongoDB
- Cloudflare tunnel provides secure access

✅ **Production Database:** 
- MongoDB accessed through backend API
- No direct database connection from app

✅ **Live Payment Gateway:**
- Razorpay live keys configured
- Real transactions enabled

## Build Time

Expect 3-10 minutes depending on:
- Machine specs
- First build vs incremental
- APK vs AAB (AAB takes slightly longer)

## After Build

The script will show:
- Build success/failure
- Output file location
- File size
- Next steps for deployment

---

**Last Updated:** November 18, 2025
**Production Backend:** https://api.yoraa.in.net/api
**Build Configuration:** Release/Production
