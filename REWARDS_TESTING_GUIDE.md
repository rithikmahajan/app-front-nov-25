# Quick Testing Guide - Rewards Screen

## What You Should See Now

### 1. App Opens to Rewards Tab ✅
```
┌─────────────────────────────┐
│   [Rewards]   [Giveaways]   │ ← Rewards is active by default
└─────────────────────────────┘
```

### 2. Loading State (Brief)
```
┌─────────────────────────────┐
│                             │
│       ⏳ (spinner)          │
│   Loading rewards...        │
│                             │
└─────────────────────────────┘
```

### 3. Success State - With Points
```
┌─────────────────────────────┐
│  WANT 10% OFF               │ ← From backend banner API
│  YOUR NEXT PURCHASE?        │
│  PLUS REWARD GIVEAWAY...    │
│                             │
│  ● ─── ● ─── ● ─── ● ─── ● │ ← Tier circles
│ 250  200  300  400  500     │ ← Shows 250 for achieved tiers
│                             │
│  The journey to becoming    │
│  ✨ XCLUSIVE               │
│                             │
│  Current Points             │ ← Clickable
│       250                   │
│             50 Points Used  │
└─────────────────────────────┘
```

### 4. Success State - Zero Points
```
┌─────────────────────────────┐
│  WANT 10% OFF               │
│  YOUR NEXT PURCHASE?        │
│  PLUS REWARD GIVEAWAY...    │
│                             │
│  ● ─── ● ─── ● ─── ● ─── ● │
│ 100  200  300  400  500     │ ← Base points (not achieved)
│                             │
│  The journey to becoming    │
│  ✨ XCLUSIVE               │
│                             │
│  No purchases yet           │
│  ┌───────────────────────┐  │
│  │  Shop Now to Earn    │  │ ← Button navigates to Home
│  │  Points              │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 5. Error State (If Backend Down)
```
┌─────────────────────────────┐
│                             │
│   Connection Error          │
│                             │
│   Unable to connect to      │
│   backend. Please check...  │
│                             │
│   ┌───────────────────┐     │
│   │      Retry       │     │ ← Retry button
│   └───────────────────┘     │
│                             │
└─────────────────────────────┘
```

## Test Scenarios

### Scenario 1: New User (0 Points)
1. Open app
2. Go to Rewards tab (should be default)
3. Expected: See "No purchases yet" with Shop Now button
4. Click "Shop Now"
5. Expected: Navigate to Home screen

### Scenario 2: User with Points
1. Log in with an account that has points
2. Go to Rewards tab
3. Expected: See actual points displayed
4. Expected: Achieved tier circles show your points
5. Click "Current Points"
6. Expected: Navigate to Points History

### Scenario 3: Not Logged In
1. Don't log in
2. Go to Rewards tab
3. Expected: See tier circles with base points (100, 200, 300, 400, 500)
4. Expected: No points section visible

### Scenario 4: Network Error
1. Turn off WiFi/data
2. Go to Rewards tab
3. Expected: See "Connection Error" with Retry button
4. Turn on WiFi/data
5. Click "Retry"
6. Expected: Data loads successfully

## Console Logs to Check

Look for these emoji logs in your React Native console:

```
🎯 Fetching rewards data...
📦 Banner response: { data: { ... } }
📦 Tiers response: { tiers: [...] }
📦 User loyalty status: { points: { ... } }
✅ Rewards banner fetched successfully
✅ Loyalty tiers fetched successfully
✅ User loyalty status fetched successfully
```

If you see errors:
```
❌ Banner fetch failed: [error message]
❌ Tiers fetch failed: [error message]
❌ User Loyalty Status API Error: [error message]
```

## API Test Command

Run this to test backend endpoints:
```bash
node test-rewards-backend.js
```

Expected output:
```
🚀 Starting Rewards Backend Integration Tests

📋 Test 1: Get Rewards Banner
✅ SUCCESS: https://api.youraa.in/api/manage-banners-rewards

📋 Test 2: Get Loyalty Tiers
✅ SUCCESS: https://api.youraa.in/api/loyalty/tiers

📋 Test 3: Get User Loyalty Status (Auth Required)
⚠️  Auth required - skipping for now

📊 TEST SUMMARY
Banner Endpoint: SUCCESS
Tiers Endpoint: SUCCESS
User Status Endpoint: SKIPPED

✅ All critical endpoints are working!
```

## Troubleshooting

### Problem: "Connection Error" shown immediately
**Solution**: 
1. Check backend URL in `src/services/yoraaAPI.js`
2. Verify backend is running
3. Run `node test-rewards-backend.js` to test endpoints

### Problem: Shows tier circles but says "No purchases yet" when I have points
**Solution**:
1. Make sure you're logged in
2. Check console for "📦 User loyalty status" log
3. Verify `/api/loyalty/user/status` endpoint returns correct data

### Problem: Tier circles show wrong numbers
**Solution**:
1. Check `/api/loyalty/tiers` endpoint response
2. Verify it returns: `{ tiers: [{ pointsRequired: 100 }, ...] }`
3. Check console for "📦 Tiers response" log

### Problem: Banner text not showing
**Solution**:
1. Check `/api/manage-banners-rewards` endpoint
2. Verify it returns: `{ data: { headerText: "...", ... } }`
3. Check console for "📦 Banner response" log

### Problem: Shop Now button doesn't navigate
**Solution**:
1. Check React Navigation is properly configured
2. Verify 'Home' route exists in your navigator
3. Check console for navigation errors

## Success Checklist ✅

- [ ] App opens to Rewards tab (not Giveaways)
- [ ] Loading spinner shows briefly
- [ ] Banner text displays from API
- [ ] Tier circles show: 100, 200, 300, 400, 500
- [ ] If logged in with points: actual points display
- [ ] If logged in with 0 points: "No purchases yet" shows
- [ ] Shop Now button navigates to Home
- [ ] Retry button works if error occurs
- [ ] No static/fallback data is shown
- [ ] Console logs show API calls with emojis

## All Done! 🎉

The rewards system is now fully integrated with your backend API. No static data, all real-time!
