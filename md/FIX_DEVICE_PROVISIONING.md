# 🔧 Fix: Device Not in Provisioning Profile

## ❌ The Problem

Your iPhone (ID: `00008130-000C79462E43001C`) is **not registered** in the provisioning profile.

**Error:**
```
Provisioning profile "iOS Team Provisioning Profile: com.yoraaapparelsprivatelimited.yoraa" 
doesn't include the currently selected device "Rithik's iPhone" (identifier 00008130-000C79462E43001C).
```

---

## ✅ Solution: 2 Options

### **Option 1: Use Automatic Signing (EASIEST - Recommended)**

This will automatically handle device registration for you.

#### Steps:

1. **Open Xcode:**
   ```bash
   open ios/Yoraa.xcworkspace
   ```

2. **Select the YoraaApp target:**
   - Click on "Yoraa" project in the left panel
   - Select "YoraaApp" under TARGETS

3. **Go to "Signing & Capabilities" tab**

4. **Enable Automatic Signing:**
   - ✅ Check "Automatically manage signing"
   - Select your Team: **Yoraa Apparels Private Limited (UX6XB9FMNN)**
   - Xcode will automatically:
     - Register your device
     - Create/update provisioning profiles
     - Download necessary certificates

5. **Build again:**
   ```bash
   npx react-native run-ios --device="00008130-000C79462E43001C"
   ```

---

### **Option 2: Manual Device Registration**

If automatic signing doesn't work, register the device manually:

#### Step 1: Register Device in Apple Developer Portal

1. Go to [Apple Developer - Devices](https://developer.apple.com/account/resources/devices/list)
2. Sign in with your Apple ID
3. Click **"+"** to add a new device
4. Fill in:
   - **Platform:** iOS
   - **Device Name:** Rithik's iPhone
   - **Device ID (UDID):** `00008130-000C79462E43001C`
5. Click **"Continue"** and **"Register"**

#### Step 2: Update Provisioning Profile

1. Go to [Apple Developer - Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Find: **"iOS Team Provisioning Profile: com.yoraaapparelsprivatelimited.yoraa"**
3. Click on it, then click **"Edit"**
4. Under "Devices", find and check **"Rithik's iPhone"**
5. Click **"Save"** or **"Generate"**
6. **Download** the new provisioning profile
7. **Double-click** the downloaded file to install it

#### Step 3: Refresh Xcode

```bash
# In Xcode: Preferences → Accounts → Select your Apple ID → Download Manual Profiles
# Or run this command:
open "x-apple-automation://com.apple.dt.Xcode?command=downloadManualProfiles"
```

#### Step 4: Clean and Rebuild

```bash
cd ios
rm -rf build DerivedData
cd ..
npx react-native run-ios --device="00008130-000C79462E43001C"
```

---

## 🚀 Quick Fix Script (Option 1 - Automatic)

I'll create a script to do this automatically:

