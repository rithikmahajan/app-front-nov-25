# 📸 Firebase Console Setup - Step-by-Step Visual Guide

## 🎯 Objective
Configure reCAPTCHA site keys in Firebase Console to fix the error:
> `[auth/unknown] The reCAPTCHA SDK is not linked to your app`

---

## 📋 Before You Start

**Have these ready:**
- ✅ iOS Key: `6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt`
- ✅ Android Key: `6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_`
- ✅ iOS Bundle ID: `com.yoraaapparelsprivatelimited.yoraa`
- ✅ Android Package: `com.yoraapparelsprivatelimited.yoraa`

---

## 🔥 Step-by-Step Instructions

### Step 1: Open Firebase Console
```
🌐 Navigate to: https://console.firebase.google.com/
```

### Step 2: Select Your Project
```
Click on: "yoraa-android-ios"
```

### Step 3: Go to Authentication
```
Left sidebar → Click "Authentication"
```

### Step 4: Click Settings Tab
```
Top navigation → Click "Settings" (gear icon)
```

### Step 5: Scroll to reCAPTCHA Section
```
Scroll down to find the "reCAPTCHA" section
You should see:
- reCAPTCHA enforcement settings
- "Configured platform site keys" section
```

### Step 6: Click "Configure site keys"
```
Look for a button/link that says "Configure site keys"
(This is visible in your screenshot!)

Click it!
```

---

## 📱 Step 7: Add iOS Platform

You'll see a form. Fill it out EXACTLY like this:

### iOS Platform Configuration:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Platform dropdown:                                     │
│  ┌─────────────────────────────┐                       │
│  │ Select Platform ▼           │                       │
│  └─────────────────────────────┘                       │
│  Select: "iOS-9" or "iOS"                               │
│                                                         │
│  Name (descriptive, can be anything):                   │
│  ┌─────────────────────────────┐                       │
│  │ yoraa-ios                   │                       │
│  └─────────────────────────────┘                       │
│                                                         │
│  Site Key:                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Bundle ID (MUST match exactly):                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ com.yoraaapparelsprivatelimited.yoraa            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│         [Cancel]              [Add Platform]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Click "Add Platform" or "Add" button**

---

## 🤖 Step 8: Add Android Platform

Now add the Android configuration. Click "Add another platform" or "Add Platform" again:

### Android Platform Configuration:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Platform dropdown:                                     │
│  ┌─────────────────────────────┐                       │
│  │ Select Platform ▼           │                       │
│  └─────────────────────────────┘                       │
│  Select: "Android"                                      │
│                                                         │
│  Name (descriptive, can be anything):                   │
│  ┌─────────────────────────────┐                       │
│  │ yoraa-android               │                       │
│  └─────────────────────────────┘                       │
│                                                         │
│  Site Key:                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Package Name (MUST match exactly):                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ com.yoraapparelsprivatelimited.yoraa             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│         [Cancel]              [Add Platform]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Click "Add Platform" or "Add" button**

---

## Step 9: Verify Configuration

After adding both platforms, you should see:

```
Configured platform site keys
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Platform    Name            Bundle/Package            │
│  ─────────────────────────────────────────────────────  │
│  iOS-9       yoraa-ios       com.yoraaapparelspri...   │
│  Android     yoraa-android   com.yoraapparelspri...    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 10: Check Other Settings (Same Page)

### reCAPTCHA Enforcement Settings:

Look for these settings on the same page:

```
Phone authentication enforcement mode:
┌─────────────────────────────┐
│ AUDIT                    ▼  │
└─────────────────────────────┘
```

**Recommended:** Keep it as "AUDIT" for testing, change to "ENFORCE" for production.

```
SMS fraud risk threshold score:
┌─────────────────────────────┐
│ Block max (0)            ▼  │
└─────────────────────────────┘
```

**Note:** Lower = stricter. Start with default setting.

---

## Step 11: Save Changes

```
Scroll to bottom of page
Click: [Save] or [Save Changes] button
```

**⚠️ IMPORTANT:** Make sure you click Save!

---

## ✅ Step 12: Verify Success

You should see a success message like:
```
✓ Settings saved successfully
```

---

## 🎯 What You Should See After Configuration

In the Firebase Console, you should now see:

```
┌─────────────────────────────────────────────────────────┐
│ reCAPTCHA                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Phone authentication enforcement mode: AUDIT            │
│                                                         │
│ SMS fraud risk threshold score: Block max (0)           │
│                                                         │
│ Configured platform site keys                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ iOS-9  | yoraa-ios  | com.yoraaapparelspri...  │    │
│ │ Android| yoraa-android| com.yoraapparelspri... │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Bundle ID
```
DON'T use: yoraa.io.net
DON'T use: com.yoraa
DON'T use: yoraa-ios (this is just the name, not bundle ID)
```

### ✅ Correct Bundle IDs
```
iOS:     com.yoraaapparelsprivatelimited.yoraa
Android: com.yoraapparelsprivatelimited.yoraa
```

### ❌ Wrong Site Keys
```
DON'T swap the keys!
iOS key on Android = Won't work
Android key on iOS = Won't work
```

### ✅ Correct Mapping
```
iOS Platform     → iOS Key (6Lc5t-Ur...)
Android Platform → Android Key (6LfV0uUr...)
```

### ❌ Forgetting to Save
```
After adding platforms, you MUST click [Save]!
```

---

## 🔍 Troubleshooting

### Can't Find "Configure site keys" Button?

Look for these alternate locations:
- Under "Configured platform site keys" section
- As a link/button near reCAPTCHA settings
- Try clicking on the reCAPTCHA section header

### Form Looks Different?

Firebase updates their UI occasionally. Look for:
- Fields asking for: Platform Type, Site Key, Bundle ID/Package Name
- The concept is the same even if UI looks different

### Already Have Platforms Configured?

If you see existing platforms:
1. Click the edit icon (pencil) next to each platform
2. Verify the Site Key and Bundle ID/Package Name match
3. Update if needed
4. Save changes

---

## 📱 After Firebase Console Setup

Once you've saved the configuration in Firebase Console, you need to:

### 1. Rebuild iOS App
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### 2. Rebuild Android App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3. Test
- Open the app
- Go to Phone Login
- Enter a phone number
- You should NOT see the reCAPTCHA error anymore!

---

## 🎉 Success Criteria

You'll know it's working when:

✅ No "reCAPTCHA SDK not linked" error
✅ Phone authentication succeeds
✅ OTP is sent and received
✅ User can sign in with phone number

---

## 📞 Need Help?

If you're still stuck:
1. Take a screenshot of your Firebase Console configuration
2. Take a screenshot of the error message
3. Check that bundle IDs match EXACTLY (including capitalization)
4. Verify you clicked Save in Firebase Console
5. Verify you rebuilt the app after configuration

---

## 📚 Quick Reference Card

```
┌──────────────────────────────────────────────────────────┐
│                  QUICK REFERENCE                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ iOS Configuration:                                       │
│ ─────────────────────────────────────────────────────── │
│ Platform: iOS-9                                          │
│ Site Key: 6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt     │
│ Bundle:   com.yoraaapparelsprivatelimited.yoraa          │
│                                                          │
│ Android Configuration:                                   │
│ ─────────────────────────────────────────────────────── │
│ Platform: Android                                        │
│ Site Key: 6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_     │
│ Package:  com.yoraapparelsprivatelimited.yoraa           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**Remember:** The keys are already generated and shown in your Firebase Console screenshot. You just need to click "Configure site keys" and add the platform mappings! 🚀
