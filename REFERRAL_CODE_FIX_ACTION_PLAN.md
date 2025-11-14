# Referral Code Not Displaying - Action Plan

## Summary
Your backend has promo codes (visible in screenshot: `INVITE322`), but the app shows "No Referral Code Available".

## What I've Done

### 1. Updated API Integration ✅
Modified `src/services/yoraaAPI.js` to try **4 different endpoints**:
- `/api/referral/code` - Dedicated referral endpoint
- `/api/promoCode/user/available` - User promo codes (most likely to work!)
- `/api/promoCode` - All promo codes  
- `/api/profile` - User profile with referral field

### 2. Added Debug Tools ✅
Created two debugging tools:
- `DEBUG_REFERRAL_CODE.md` - Complete debugging guide
- `src/components/DebugReferralCode.js` - Interactive debugger component
- `test-referral-api.js` - Node.js test script

## Quick Diagnosis Steps

### Option 1: Use the Debug Component (Easiest!)

1. **Add the debug component** to InviteAFriend.js:

```javascript
// At top of file
import DebugReferralCode from '../components/DebugReferralCode';

// In your render method, add at the top:
return (
  <SafeAreaView style={styles.container}>
    {__DEV__ && <DebugReferralCode />}
    
    <View style={styles.header}>
      // ... rest of your code
```

2. **Run the app** and go to "Invite a Friend"
3. **Tap "Run All Tests"** button
4. **Screenshot the output** and share it with me

This will tell us EXACTLY what's failing!

### Option 2: Check Console Logs

1. Open Metro bundler terminal
2. Navigate to "Invite a Friend" in the app
3. Look for these log messages:

```
🎁 Fetching user referral code
⚠️ User not authenticated  <-- Problem: Not logged in
✅ Referral code fetched from [endpoint]  <-- Success!
❌ [endpoint] not available  <-- Problem: Endpoint missing
```

Share these logs with me!

### Option 3: Test Backend Directly

```bash
# Get your auth token from the app (check AsyncStorage or login response)
TOKEN="your_token_here"

# Test the promo code endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/promoCode/user/available

# If that doesn't work, try:
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/promoCode
```

## Most Likely Issues & Solutions

### Issue #1: Wrong Backend Endpoint ⚠️
**Symptom:** All endpoints return 404

**Fix:** Check your backend routes. Based on your screenshot showing the promo code management system, add this endpoint:

```javascript
// Backend route to add
router.get('/api/promoCode/user/available', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's referral code
    const referralCode = await PromoCode.findOne({
      userId: userId,
      type: 'referral',
      active: true
    });
    
    if (referralCode) {
      res.json({
        success: true,
        data: {
          code: referralCode.code,
          userName: req.user.name,
          benefit: referralCode.description || 'Invite a friend and get additional 10% off'
        }
      });
    } else {
      res.json({
        success: true,
        data: null,
        message: 'No referral code found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### Issue #2: Not Authenticated 🔐
**Symptom:** Logs show "User not authenticated"

**Fix:**
1. Make sure user is logged in
2. Check AsyncStorage has valid token
3. Try logging out and back in

### Issue #3: Wrong Data Structure 📦
**Symptom:** API returns data but app doesn't display it

**Fix:** The app expects this format:

```json
{
  "success": true,
  "data": {
    "code": "INVITE322",
    "userName": "Rithik",
    "benefit": "Invite get 10% off"
  }
}
```

If your backend returns different field names, update the parsing in `yoraaAPI.js` around line 1636.

### Issue #4: Promo Code vs Referral Code 🏷️
**Symptom:** Backend has "promo codes" but app looks for "referral code"

**Fix:** The updated code now tries promo code endpoints too! It will use the first available code or one marked as "referral".

## Testing Checklist

- [ ] User is logged in
- [ ] Backend is running (check localhost:3001 or your backend URL)
- [ ] Backend has promo code system implemented
- [ ] User has at least one promo/referral code in the system
- [ ] App can reach backend (check network/WiFi)
- [ ] Token is valid and not expired

## Quick Test Code

Temporarily add this to `InviteAFriend.js` to test with mock data:

```javascript
// In fetchReferralCode function, comment out API call and add:
const response = {
  success: true,
  data: {
    code: 'TEST123',
    userName: 'Test User',
    benefit: 'This is a test'
  }
};
```

If this works, the UI is fine and it's an API issue!

## Next Steps

1. **Add the DebugReferralCode component** and share the output
2. **Check console logs** when opening the screen
3. **Verify backend endpoint** exists and returns data
4. **Share the results** so I can help fix the exact issue

## Files Modified
- ✅ `src/services/yoraaAPI.js` - Updated with 4 endpoint tries
- ✅ `src/screens/InviteAFriend.js` - Dynamic UI with states
- ✅ `src/components/DebugReferralCode.js` - Debug tool
- ✅ `DEBUG_REFERRAL_CODE.md` - Full debug guide
- ✅ `test-referral-api.js` - Test script

Need help? Share:
1. Debug component output (screenshots)
2. Console logs (🎁, ✅, ❌ emojis)
3. Backend endpoint that should work
4. Sample API response from backend
