# Quick Fix: Change Category Order to Women → Kids → Men

## 🎯 Current Situation

**Code shows:** Men → Women → Kids  
**Screenshot shows:** Women → Kids → Men  
**Problem:** Order is hardcoded, doesn't match desired order

## ⚡ Quick Fix (5 minutes)

### Step 1: Edit the File

Open: `src/screens/ShopScreen.js`

### Step 2: Change Line 96

**FROM:**
```javascript
const TABS = ['Men', 'Women', 'Kids'];
```

**TO:**
```javascript
const TABS = ['Women', 'Kids', 'Men'];
```

### Step 3: Change Line 99 (Default Selected Tab)

**FROM:**
```javascript
const [selectedTab, setSelectedTab] = useState('Men');
```

**TO:**
```javascript
const [selectedTab, setSelectedTab] = useState('Women');
```

### Step 4: Rebuild the App

```bash
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main
npx react-native run-ios
```

## ✅ Expected Result

- Women tab appears first (leftmost)
- Kids tab appears second (middle)
- Men tab appears third (rightmost)
- Women tab is selected by default when screen loads

## 🔍 Why This Happens

The category order is **hardcoded** in the frontend code. It's a simple JavaScript array that determines the order of tabs.

```javascript
// This array controls EVERYTHING about category order
const TABS = ['Men', 'Women', 'Kids'];
          //   ^1st   ^2nd     ^3rd
```

**The order in this array is the order you see on screen, left to right.**

## 🎨 Want Different Orders? Just Change the Array!

**Women First (Business-Focused):**
```javascript
const TABS = ['Women', 'Men', 'Kids'];
```

**Kids First (Seasonal - Back to School):**
```javascript
const TABS = ['Kids', 'Women', 'Men'];
```

**Alphabetical:**
```javascript
const TABS = ['Kids', 'Men', 'Women'];
```

## ⚠️ Important Notes

1. **Must rebuild app** - This is code change, not config
2. **All users see same order** - No personalization currently
3. **Cannot change remotely** - Need app update to change
4. **Match the default** - Make sure `selectedTab` matches first item in TABS array

## 🚀 Better Long-Term Solution

See `CATEGORY_ORDER_MANAGEMENT.md` for how to make this:
- ✅ Backend-controlled
- ✅ Changeable without app update
- ✅ Different per user/region
- ✅ A/B testable

## 📋 Testing After Change

- [ ] Women tab is on the left
- [ ] Kids tab is in the middle  
- [ ] Men tab is on the right
- [ ] Women tab is selected (underlined) by default
- [ ] Clicking each tab loads correct products
- [ ] Sale items update when switching tabs

---

**Need help making this change? Copy the code above and paste it into the exact line numbers mentioned!**
