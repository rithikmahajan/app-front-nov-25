# 🔐 SHA Certificates Needed for Production Google Sign-In

## Current Status in Firebase Console
From your screenshot, you currently have **only 1 SHA certificate** registered:
- ✅ SHA-1: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`

## ⚠️ Problem: You're Missing 2 Critical Certificates!

---

## 📋 ALL SHA Certificates You Need to Add

### 1. Debug Certificate (Development) - ✅ Already Added
**Purpose**: For local development and testing
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **SHA-256**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
- **Status**: ✅ Already registered in Firebase

### 2. Release Certificate (Production Upload) - ❌ MISSING - ADD THIS!
**Purpose**: For release builds you create locally and test before uploading
- **SHA-1**: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
- **SHA-256**: `99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3`
- **Status**: ❌ **MUST ADD TO FIREBASE NOW**
- **This is why Google Sign-In fails in your release builds!**

### 3. Play Store App Signing Certificate - ❌ UNKNOWN - MUST CHECK!
**Purpose**: For apps downloaded from Play Store (Google re-signs your app)
- **How to get**: Go to Play Console → Release → Setup → App Integrity
- **Status**: ❌ **MUST GET FROM PLAY CONSOLE AND ADD TO FIREBASE**
- **This is why Google Sign-In might fail for users who download from Play Store!**

---

## 🎯 Step-by-Step: How to Fix This

### Step 1: Add Release Certificate SHA-1 to Firebase (IMMEDIATE)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `yoraa-android-ios`
3. **Click the gear icon** → **Project settings**
4. **Scroll down** to "Your apps" section
5. **Click on your Android app** (`com.yoraa`)
6. **Click "Add fingerprint"** button
7. **Paste this SHA-1**:
   ```
   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F
   ```
8. **Click "Save"**

### Step 2: Download Updated google-services.json

1. **In Firebase Console**, scroll down and click **"Download google-services.json"**
2. **Replace** the file at: `android/app/google-services.json`
3. **Commit the change** to your repository

### Step 3: Get Play Store App Signing Certificate (CRITICAL!)

⚠️ **This step is ONLY needed after you upload your first AAB to Play Console**

1. **Go to Play Console**: https://play.google.com/console
2. **Select your app**: YORAA
3. **Go to**: Release → Setup → **App Integrity**
4. **Under "App signing key certificate"**, you'll see a SHA-1 and SHA-256
5. **Copy the SHA-1 certificate fingerprint**
6. **Add it to Firebase** (same steps as Step 1)
7. **Download updated google-services.json again**
8. **Upload a NEW AAB** with the updated google-services.json

---

## 🔍 Why You Need All Three Certificates

| Certificate Type | When It's Used | Why It's Needed |
|-----------------|----------------|-----------------|
| **Debug** (5E:8F...) | Local dev with `npx react-native run-android` | Testing during development |
| **Release** (84:87...) | Local release builds with `./gradlew assembleRelease` | Testing production builds before upload |
| **Play Store** (Unknown) | Apps downloaded from Google Play Store | Users who download your app from Play Store |

**Without ALL three**, Google Sign-In will fail in different scenarios!

---

## ⚡ Quick Action Checklist

### Right Now (Before uploading to Play Store):
- [ ] Add Release SHA-1 (`84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`) to Firebase
- [ ] Download updated `google-services.json`
- [ ] Replace `android/app/google-services.json` with the new file
- [ ] Rebuild production AAB (version 8)
- [ ] Test release APK locally to verify Google Sign-In works

### After First Play Store Upload:
- [ ] Go to Play Console → App Integrity
- [ ] Copy the Play Store's SHA-1 certificate
- [ ] Add it to Firebase Console
- [ ] Download updated `google-services.json` again
- [ ] Build and upload NEW AAB (version 9) with updated google-services.json
- [ ] Test in Internal Testing track

---

## 🚨 Common Mistake to Avoid

**DON'T** just add SHA-256 certificates!
- Firebase needs **SHA-1** certificates (not SHA-256)
- Even though SHA-256 is more secure, Google Sign-In uses SHA-1
- You can optionally add SHA-256, but SHA-1 is mandatory

---

## 📝 Summary: What You Need to Do NOW

1. ✅ **Debug SHA-1** is already added - No action needed
2. ❌ **Add Release SHA-1** to Firebase: `84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F`
3. 🔄 **Download** updated `google-services.json`
4. 📦 **Rebuild** AAB with updated file
5. 🎯 **After first Play Store upload**, get Play Store's SHA-1 and repeat steps 2-4

---

## 🔗 Quick Links

- [Firebase Console - Your Project](https://console.firebase.google.com/project/yoraa-android-ios/settings/general/android:com.yoraa)
- [Play Console - App Integrity](https://play.google.com/console/developers/app/app-integrity)
- [How to Get SHA Certificates Guide](https://developers.google.com/android/guides/client-auth)

---

**Last Updated**: November 19, 2025  
**Current Version Code**: 8  
**Status**: Needs Release SHA-1 added to Firebase before production upload
