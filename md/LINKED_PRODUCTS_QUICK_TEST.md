# 🚀 Linked Products - Quick Test Guide

## Test These Product IDs:

```
690a3f41eb2dfd498bb4db9b  (Purple shirt - should show 3 variants)
690a3f8deb2dfd498bb4dc29  (Green shirt - should show 3 variants)
690a3f72eb2dfd498bb4dbd0  (Khaki shirt - should show 3 variants)
```

## Expected Behavior:

### ✅ FOR PRODUCTS IN A GROUP:
1. Product image loads at top
2. "Try On" button appears
3. **3 variant tiles appear below Try On button**
4. Current product tile has white border + black badge
5. Clicking another tile navigates to that product

### ✅ FOR PRODUCTS NOT IN A GROUP:
1. Product image loads at top
2. "Try On" button appears
3. **No variant tiles shown** (correct!)
4. Product info appears normally

## Console Logs to Look For:

```
✅ GOOD LOGS:
🔄 Fetching linked products for item: 690a3f41eb2dfd498bb4db9b
✅ Linked Products API Response: { success: true, ... }
📦 Found 3 linked products

❌ BAD LOGS:
❌ Error fetching item group
Failed to switch product variant
```

## Files Changed:

- `src/services/apiService.js` (line 383-407)
- `src/screens/productdetailsmain.js` (multiple sections)

## If Issues Occur:

1. **Check:** Is backend running?
2. **Check:** Network tab shows `/item-groups/by-item/...` call?
3. **Check:** API returns success: true?
4. **Clear cache:** Restart Metro bundler
5. **Rebuild:** `npx react-native run-ios`

---

**Status: ✅ Fixed and Ready**  
**Debug Badge:** Top-left shows "Linked Products: X"  
**Remove before production:** Delete debug View in renderImageSlider()
