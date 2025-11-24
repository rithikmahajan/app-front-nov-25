# Xcode Frozen Fix – Complete Guide

## Quick Fix (Automated)

Run the automated script:
```bash
./fix-xcode-frozen.sh
```

This script will automatically perform all steps below.

---

## Manual Steps (If Needed)

### 1. Force Quit Xcode
- Press `Cmd + Option + Esc`
- Select **Xcode**
- Click **Force Quit**

### 2. Delete Derived Data (Most Common Fix)
1. Quit Xcode completely
2. Open **Finder** → **Go** → **Go to Folder** (or `Cmd + Shift + G`)
3. Paste: `~/Library/Developer/Xcode/DerivedData`
4. Delete everything inside
5. Reopen Xcode

### 3. Kill Stuck Indexing Processes
Open Terminal and run:
```bash
sudo killall -9 sourcekitd
sudo killall -9 clang
sudo killall -9 swift-frontend
```

### 4. Clear Xcode Cache
1. **Finder** → **Go to Folder** → paste: `~/Library/Caches/com.apple.dt.Xcode`
2. Delete all files
3. Also check: `~/Library/Application Support/Developer/Shared`
4. Delete the **SourceKit** folder if it exists

### 5. CocoaPods Workspace Fix (If Applicable)
1. Quit Xcode
2. Go to your `ios` folder and delete:
   - `Pods` folder
   - `Podfile.lock`
   - `YourApp.xcworkspace`
3. Run in Terminal:
   ```bash
   cd ios
   pod install
   ```

### 6. Open Xcode Without Restoring Windows
- Hold **Shift** while clicking the Xcode icon
- Then open your project manually

---

## Diagnostic Questions

If Xcode is still frozen, check:
- ❓ Does it happen in **all projects** or **only this one**?
- ❓ Did it start after an **Xcode update**, **git merge**, or **pod install**?
- ❓ What **Xcode version** are you using?

---

## Advanced Troubleshooting

### Check Console for Errors
1. Open **Console.app**
2. Filter by "Xcode"
3. Look for crash logs or error messages

### Test with New Project
1. Create a new test project
2. If new project works fine → issue is project-specific
3. If new project also freezes → Xcode installation issue

### Complete Xcode Reset
```bash
# Backup first!
rm -rf ~/Library/Developer/Xcode
rm -rf ~/Library/Caches/com.apple.dt.Xcode
rm -rf ~/Library/Application\ Support/Developer/Shared
```

### Reinstall Xcode
1. Delete Xcode from `/Applications`
2. Reinstall from App Store
3. Install Command Line Tools: `xcode-select --install`

---

## What the Automated Script Does

The `fix-xcode-frozen.sh` script performs:
1. ✅ Force quits Xcode
2. ✅ Deletes Derived Data (shows size before deletion)
3. ✅ Kills all stuck indexing processes
4. ✅ Clears Xcode cache
5. ✅ Clears SourceKit cache
6. ✅ Clears Module cache
7. ✅ Fixes CocoaPods workspace (if detected)
8. ✅ Clears iOS Simulator data
9. ✅ Clears CoreSimulator caches
10. ✅ Backs up Xcode preferences

---

## Common Causes of Xcode Freezing

| Cause | Solution |
|-------|----------|
| **Large project indexing** | Delete Derived Data, wait for indexing |
| **Corrupted workspace** | Delete workspace, run `pod install` |
| **SourceKit crash** | Kill `sourcekitd` process |
| **Git merge conflicts** | Resolve conflicts, clean build |
| **Xcode update issues** | Reinstall Xcode |
| **macOS permissions** | Reset Xcode permissions in System Settings |

---

## Prevention Tips

1. **Regular cleanup**: Run the script monthly
2. **Disable unnecessary features**: Turn off live issues if project is large
3. **Use .gitignore**: Exclude `DerivedData` and workspace files
4. **Update regularly**: Keep Xcode and CocoaPods updated
5. **Monitor disk space**: Ensure sufficient free space on Mac

---

## Files Created

- `fix-xcode-frozen.sh` - Automated fix script
- `XCODE_FROZEN_FIX_GUIDE.md` - This guide

---

**Last Updated:** November 24, 2025
