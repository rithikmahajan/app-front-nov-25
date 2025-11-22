# Debugging Referral Code Display Issue

## Problem
The backend has promo codes (like `INVITE322`), but the app shows "No Referral Code Available".

## Updated Solution
I've updated the `getUserReferralCode()` method to try **4 different endpoints** to find your referral code:

### Endpoints Tried (in order):
1. `/api/referral/code` - Dedicated referral endpoint
2. `/api/promoCode/user/available` - User-specific promo codes
3. `/api/promoCode` - All promo codes
4. `/api/profile` - User profile with referral code field

## How to Debug

### Step 1: Check Console Logs
Open the app and navigate to "Invite a Friend". Check the console for these logs:

```
🎁 Fetching user referral code
⚠️ User not authenticated, cannot fetch referral code
// OR
✅ Referral code fetched from [endpoint]: [data]
// OR
❌ [endpoint] not available: [error]
```

### Step 2: Verify Authentication
Make sure the user is logged in and has a valid token:

```javascript
// In your app, check:
import yoraaAPI from './services/yoraaAPI';

console.log('Is authenticated?', yoraaAPI.isAuthenticated());
console.log('Token:', yoraaAPI.getUserToken());
```

### Step 3: Test Backend Endpoints Manually

#### Using the test script:
```bash
# 1. Get your user token from the app
# 2. Edit test-referral-api.js and add the token
# 3. Update the BASE_URL to your backend
# 4. Run:
node test-referral-api.js
```

#### Using curl:
```bash
# Replace YOUR_TOKEN with actual token
TOKEN="YOUR_TOKEN_HERE"

# Test endpoint 1
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/referral/code

# Test endpoint 2  
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/promoCode/user/available

# Test endpoint 3
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/promoCode

# Test endpoint 4
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/profile
```

### Step 4: Check Backend Response Format

The app expects one of these response formats:

**Option A: Direct referral code response**
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

**Option B: Promo codes array**
```json
{
  "success": true,
  "data": [
    {
      "code": "INVITE322",
      "type": "referral",
      "description": "Invite get 10% off",
      "userName": "Rithik"
    }
  ]
}
```

**Option C: User profile with referral**
```json
{
  "success": true,
  "data": {
    "name": "Rithik",
    "email": "user@example.com",
    "referralCode": "INVITE322"
  }
}
```

## Common Issues & Solutions

### Issue 1: Authentication Failed
**Symptom:** Logs show "User not authenticated"

**Solution:**
1. Make sure user is logged in
2. Check if token is stored in AsyncStorage
3. Verify token hasn't expired
4. Try logging out and logging back in

### Issue 2: 404 Not Found
**Symptom:** All endpoints return 404

**Solution:**
Check your backend routes. The promo code system in your screenshot suggests `/api/promoCode` should work. Add this backend route:

```javascript
// Backend (Node.js/Express example)
router.get('/api/promoCode/user/available', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const promoCodes = await PromoCode.find({ userId, active: true });
  res.json({ success: true, data: promoCodes });
});
```

### Issue 3: Wrong Data Structure
**Symptom:** Logs show data fetched but screen shows "No code available"

**Solution:**
The app tries to parse the response. Check if your backend returns:
- `code` field (required)
- `description` or fallback text (optional)
- `userName` (optional)

Update the code parsing in `yoraaAPI.js` if your backend uses different field names.

### Issue 4: CORS or Network Error
**Symptom:** Network request failed

**Solution:**
1. Check backend is running
2. Check backend URL in app config
3. Check CORS settings on backend
4. Check device can reach backend (WiFi, localhost vs IP)

## Quick Fix Options

### Option A: Update Backend Endpoint (Recommended)
Add this endpoint to your backend:

```javascript
router.get('/api/promoCode/user/available', auth, async (req, res) => {
  const code = await PromoCode.findOne({ 
    userId: req.user.id, 
    type: 'referral' 
  });
  
  if (code) {
    res.json({
      success: true,
      data: {
        code: code.code,
        userName: req.user.name,
        benefit: code.description
      }
    });
  } else {
    res.json({
      success: true,
      data: null
    });
  }
});
```

### Option B: Update API Call Field Mapping
If your backend uses different field names, update the field mapping in `yoraaAPI.js`:

```javascript
// Line ~1636 in yoraaAPI.js
// Change this:
code: referralCode.code,

// To match your backend field:
code: referralCode.promoCode, // or whatever your field is called
```

### Option C: Use Mock Data (Testing Only)
To test the UI while fixing backend, temporarily add mock data:

```javascript
// In InviteAFriend.js, around line 85
const fetchReferralCode = async () => {
  try {
    setIsLoading(true);
    
    // TEMPORARY: Comment out real API call
    // const response = await yoraaAPI.getUserReferralCode();
    
    // TEMPORARY: Use mock data
    const response = {
      success: true,
      data: {
        code: 'INVITE322',
        userName: 'Rithik',
        benefit: 'Invite a friend and get additional 10% off'
      }
    };
    
    if (response && response.success && response.data) {
      setReferralCode(response.data.code);
      // ... rest of code
    }
  } catch (error) {
    // ...
  }
};
```

## Next Steps

1. **Check console logs** when opening "Invite a Friend" screen
2. **Share the logs** with me so I can see exactly which endpoint is failing
3. **Verify your backend endpoint** returns data in the expected format
4. **Test with curl/Postman** to confirm backend works independently

## Getting Help

Share these details:
1. Console logs from the app (🎁, ✅, ❌, ⚠️ emojis)
2. Backend endpoint that should work
3. Sample response from that endpoint
4. Any error messages

This will help identify the exact issue!
