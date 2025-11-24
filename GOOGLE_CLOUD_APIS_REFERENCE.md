# 🔍 Google Cloud APIs - Quick Reference for Firebase Phone Auth

## The Correct APIs to Enable

**Note:** The API names have changed over time. Here's what you actually need:

---

## ✅ Option 1: Play Integrity API (Recommended - New)

**Search Term:** `Play Integrity API`

**Why:** This is Google's new app verification system that replaced SafetyNet.

**How to Enable:**
1. Go to: https://console.cloud.google.com/apis/library
2. Ensure "yoraa-android-ios" project is selected
3. Search: `Play Integrity API`
4. Click "Play Integrity API"
5. Click "ENABLE"

---

## ✅ Option 2: SafetyNet Attestation API (Legacy - Still Works)

**Search Term:** `SafetyNet Attestation API`

**Why:** This is the older system that still works for Firebase Phone Auth.

**How to Enable:**
1. Go to: https://console.cloud.google.com/apis/library
2. Ensure "yoraa-android-ios" project is selected
3. Search: `SafetyNet Attestation`
4. Click "Android Device Verification" or "SafetyNet Attestation API"
5. Click "ENABLE"

---

## 🔎 What to Search For

Try these search terms in order:

1. **"Play Integrity API"** ← Try this first (new system)
2. **"SafetyNet Attestation"** ← Try this if above not found
3. **"Android Device Verification"** ← Might show SafetyNet
4. **"device verification"** ← Broader search

---

## 📝 Note from Google Cloud Console

Looking at your screenshot, I can see the API Library. The issue is that "Android Device Verification API" might not be the exact name shown.

**What you'll likely see:**
- "Play Integrity API" (Google Enterprise API)
- "Android Management API"
- Or it might already be enabled and not showing in search

---

## ✅ How to Check if APIs Are Already Enabled

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Look at "Enabled APIs & services"
3. Search for:
   - "Play Integrity"
   - "SafetyNet"
   - "Device Verification"

---

## 🎯 IMPORTANT: Firebase Might Not Require This!

Based on React Native Firebase documentation (https://rnfirebase.io/), **you might not need to manually enable any additional APIs** if:

1. ✅ Your SHA certificates are registered (DONE - verified from your screenshot)
2. ✅ SafetyNet dependency is in your app (DONE - we added it)
3. ✅ Phone authentication is enabled in Firebase Console

The Phone Auth **should work** with just these three things!

---

## 🚀 Recommended Next Steps

**Skip the API search for now** and do this instead:

### Step 1: Download Fresh google-services.json

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/settings/general
2. Download the latest google-services.json
3. Replace in your project

### Step 2: Verify Phone Auth is Enabled

1. Go to: https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers
2. Ensure "Phone" shows as "Enabled"

### Step 3: Rebuild and Test

```bash
chmod +x rebuild-production-with-otp-fix.sh
./rebuild-production-with-otp-fix.sh
```

### Step 4: Test OTP

If OTP still doesn't work, THEN we'll enable the APIs. But try without it first since:
- SHA certificates are registered ✅
- SafetyNet code is in place ✅
- Phone auth might already be configured ✅

---

## 🔧 If You Get SafetyNet Error

**Only if you see this error:**
```
SafetyNet attestation failed
```

**Then enable this API:**
1. https://console.cloud.google.com/apis/library/androidcheck.googleapis.com
2. Or search "Play Integrity API"
3. Click Enable

---

## 📊 Summary

| What | Required? | Status |
|------|-----------|--------|
| SHA Certificates | ✅ Required | ✅ Done |
| SafetyNet Code | ✅ Required | ✅ Done |
| Phone Auth Enabled | ✅ Required | ⏳ Check |
| google-services.json | ✅ Required | ⏳ Download |
| Play Integrity API | ⚠️ Maybe | ⏳ Skip for now |

**Recommendation:** Skip the API search, download google-services.json, rebuild, and test first!
