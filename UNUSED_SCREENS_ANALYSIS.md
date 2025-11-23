# Unused Screens Analysis

## Analysis Date: November 23, 2025

### Files Analyzed:
1. `src/screens/profilevisibility.js`
2. `src/screens/SaleCategoryScreen.js`
3. `src/screens/SaleScreen.js`

---

## Results:

### ✅ **profilevisibility.js** - ACTIVELY USED
**Status:** This screen IS being used in the app

**Evidence:**
- Exported in `src/screens/index.js` as `ProfileVisibilityScreen`
- Registered in `src/components/layout.js` (case 'ProfileVisibilityScreen')
- **Actively navigated to from:** `src/screens/settings.js` (line 41)
  ```javascript
  navigation.navigate('ProfileVisibilityScreen');
  ```
- Accessible from Settings → Profile visibility menu item

**Conclusion:** Keep this file - it's a working feature accessible from Settings


---

### ❌ **SaleCategoryScreen.js** - NOT USED
**Status:** This screen is NOT being used in the app

**Evidence:**
- Exported in `src/screens/index.js` as `SaleCategoryScreen`
- Registered in `src/components/layout.js` (case 'SaleCategoryScreen')
- **No navigation calls found** - No `navigation.navigate('SaleCategoryScreen')` anywhere in src/
- Not accessible from bottom navigation bar
- Not accessible from any other screen

**Conclusion:** This file can be safely deleted


---

### ❌ **SaleScreen.js** - NOT USED
**Status:** This screen is NOT being used in the app

**Evidence:**
- Exported in `src/screens/index.js` as `SaleScreen`
- Registered in `src/components/layout.js` (case 'SaleScreen')
- **No navigation calls found** - No `navigation.navigate('SaleScreen')` anywhere in src/
- Not accessible from bottom navigation bar
- Not accessible from any other screen

**Conclusion:** This file can be safely deleted


---

## Recommendation:

### Files to DELETE:
1. ✗ `src/screens/SaleCategoryScreen.js`
2. ✗ `src/screens/SaleScreen.js`

### Files to KEEP:
1. ✓ `src/screens/profilevisibility.js` (actively used from Settings)

### Cleanup Steps:

If you want to remove the unused files, also remove them from:
1. `src/screens/index.js` - Remove their export statements
2. `src/components/layout.js` - Remove their case statements

This will clean up your codebase and reduce bundle size.
