# Android Accessibility Role Fix

## Problem
The app crashed on Android with the error:
```
Error while updating property 'accessibilityRole' of a view managed by: AndroidTextInput
Invalid accessibility role value: searchbox
```

This error appeared when navigating to the Search screen on Android, but worked fine on iOS.

## Root Cause
The `TextInput` component in `search.js` was using an invalid `accessibilityRole` value:
```javascript
accessibilityRole="searchbox"  // ❌ Invalid on Android
```

### Why This Worked on iOS but Not Android
- **iOS**: More lenient with accessibility role values and may ignore unknown values
- **Android**: Strictly validates accessibility roles and throws an error for invalid values

### Valid Accessibility Roles in React Native
According to React Native documentation, valid `accessibilityRole` values are:
- `none`
- `button`
- `link`
- `search` ✅ (This is what we need)
- `image`
- `keyboardkey`
- `text`
- `adjustable`
- `imagebutton`
- `header`
- `summary`
- `alert`
- `checkbox`
- `combobox`
- `menu`
- `menubar`
- `menuitem`
- `progressbar`
- `radio`
- `radiogroup`
- `scrollbar`
- `spinbutton`
- `switch`
- `tab`
- `tablist`
- `timer`
- `toolbar`

**Note**: `"searchbox"` is NOT a valid value!

## Solution Applied

### File Modified
`/src/screens/search.js` - Line 979

### Change Made
```javascript
// Before (Invalid)
<TextInput
  style={styles.searchInput}
  placeholder="Search Product"
  placeholderTextColor="#767676"
  value={searchText}
  onChangeText={setSearchText}
  autoFocus={true}
  returnKeyType="search"
  accessibilityRole="searchbox"  // ❌ Invalid
  accessibilityLabel="Search products"
  accessibilityHint="Type to search for products"
/>

// After (Valid)
<TextInput
  style={styles.searchInput}
  placeholder="Search Product"
  placeholderTextColor="#767676"
  value={searchText}
  onChangeText={setSearchText}
  autoFocus={true}
  returnKeyType="search"
  accessibilityRole="search"  // ✅ Valid
  accessibilityLabel="Search products"
  accessibilityHint="Type to search for products"
/>
```

## Testing Steps

### Method 1: Manual Reload (If Metro is Running)
1. In the terminal where Metro is running, press `R` twice to reload
2. Or shake the device and select "Reload"

### Method 2: Full Restart
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native run-android
```

### Verification
1. ✅ App loads without red screen error
2. ✅ Navigate to Home/Shop screen
3. ✅ Tap the search icon
4. ✅ Search screen opens successfully
5. ✅ TextInput is focused and ready to type
6. ✅ No accessibility errors in console

## Expected Result
✅ Search screen works on both iOS and Android  
✅ No accessibility role errors  
✅ Screen readers can properly identify the search input  
✅ Full cross-platform compatibility maintained  

## Prevention
When adding accessibility properties:
1. Always check React Native documentation for valid values
2. Test on both iOS and Android before committing
3. Use TypeScript for better type checking (recommended)
4. Consider using ESLint rules for accessibility

## Related Files
- `/src/screens/search.js` - Fixed
- `/src/screens/HomeScreen.js` - Previously fixed search icon press issue

## Status
🟢 **FIXED** - Ready to test on Android device/emulator
