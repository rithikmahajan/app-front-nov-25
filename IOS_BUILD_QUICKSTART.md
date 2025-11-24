# 🚀 iOS Production Build - Quick Start

## One-Command Build

```bash
./build-ios-production-release.sh
```

This script will:
1. ✅ Set up production environment (.env.production)
2. ✅ Clean previous builds
3. ✅ Install dependencies
4. ✅ Give you build options

---

## Manual Quick Steps

### 1. Setup Environment
```bash
cp .env.production .env
cp .env.production ios/.env
```

### 2. Install & Clean
```bash
npm install
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### 3. Build in Xcode
```bash
open ios/Yoraa.xcworkspace
```

**In Xcode:**
1. Select: **"Any iOS Device (arm64)"**
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

---

## Environment Check

```bash
# Verify production API is set
cat .env | grep API_BASE_URL
# Should show: API_BASE_URL=https://api.yoraa.in.net

# Check Razorpay is LIVE mode
cat .env | grep RAZORPAY_KEY_ID
# Should show: RAZORPAY_KEY_ID=rzp_live_...
```

---

## Current Configuration

- ✅ **Version Code:** 12 (Android)
- ✅ **Bundle ID:** com.yoraa
- ✅ **Team ID:** UX6XB9FMNN
- ✅ **iPad Icons:** Added (152x152, 167x167) ✅
- ✅ **API:** https://api.yoraa.in.net
- ✅ **Razorpay:** Live Mode

---

## Build Checklist

Before archiving:
- [ ] `.env.production` copied to `.env` and `ios/.env`
- [ ] Pod install completed
- [ ] Scheme set to "Release"
- [ ] Device: "Any iOS Device (arm64)"
- [ ] Signing: Valid certificate & profile
- [ ] Version/Build numbers updated

---

## Upload to App Store

**Option 1: Xcode**
- Window → Organizer → Archives → Distribute

**Option 2: Transporter App**
- Export IPA → Open Transporter → Upload

---

## Troubleshooting

### Build fails?
```bash
# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
cd ios
rm -rf Pods Podfile.lock build
pod install
```

### Signing issues?
```bash
# Check certificates
security find-identity -v -p codesigning
```

### Environment not loading?
```bash
# Verify files exist
ls -la .env ios/.env
# Re-copy if needed
cp .env.production .env
cp .env.production ios/.env
```

---

## Files Created

1. ✅ `build-ios-production-release.sh` - Automated build script
2. ✅ `IOS_PRODUCTION_BUILD_GUIDE.md` - Complete documentation
3. ✅ `ios/exportOptions.plist` - Export configuration (already exists)
4. ✅ All iPad icons added to AppIcon.appiconset

---

## Next Steps

1. Run: `./build-ios-production-release.sh`
2. Choose option 1 (Archive in Xcode)
3. Wait for build to complete
4. Upload to App Store Connect
5. Submit for review

📚 **Full Guide:** See `IOS_PRODUCTION_BUILD_GUIDE.md`

Good luck! 🎉
