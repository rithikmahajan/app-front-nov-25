# 🚨 URGENT: Backend API Issue - User Loyalty Status

## Issue Summary
The `/api/loyalty/user/status` endpoint is returning a **500 error** when called with a valid JWT token.

## Error Details
```
Status: 500
Error: "UserLoyalty validation failed: userId: Path `userId` is required."
```

## What's Happening
1. ✅ User IS logged in (Firebase authentication working)
2. ✅ JWT token IS being sent in Authorization header: `Bearer eyJhbGciOiJIUzI1NiIs...`
3. ✅ API endpoint IS receiving the request
4. ❌ Backend is NOT extracting userId from the JWT token
5. ❌ Backend is trying to create/query UserLoyalty without userId

## Root Cause
The backend `/api/loyalty/user/status` endpoint is not properly:
1. Decoding the JWT token
2. Extracting the userId from the token
3. Using that userId to query the UserLoyalty collection

## Required Fix (Backend Team)

### Current Backend Code (BROKEN):
```javascript
// ❌ This is what's happening now
router.get('/api/loyalty/user/status', authenticateToken, async (req, res) => {
  try {
    // Backend is not extracting userId from req.user
    const userLoyalty = await UserLoyalty.findOne({ userId: ??? });
    // Error: userId is undefined
  }
});
```

### Fixed Backend Code (REQUIRED):
```javascript
// ✅ This is what should happen
router.get('/api/loyalty/user/status', authenticateToken, async (req, res) => {
  try {
    // Extract userId from the decoded JWT token
    const userId = req.user.userId || req.user.id || req.user._id;
    
    console.log('🔍 Authenticated user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }
    
    // Query user loyalty with the extracted userId
    let userLoyalty = await UserLoyalty.findOne({ userId: userId });
    
    // If user doesn't have loyalty record yet, create one
    if (!userLoyalty) {
      userLoyalty = await UserLoyalty.create({
        userId: userId,
        points_current: 0,
        points_used: 0,
        points_lifetime: 0
      });
    }
    
    // Calculate next tier
    const tiers = await LoyaltyTier.find().sort({ pointsRequired: 1 });
    const currentPoints = userLoyalty.points_current;
    
    let currentTier = null;
    let nextTier = tiers[0]; // Default to Bronze
    
    for (const tier of tiers) {
      if (currentPoints >= tier.pointsRequired) {
        currentTier = tier;
      } else if (!nextTier || currentPoints < tier.pointsRequired) {
        nextTier = tier;
        break;
      }
    }
    
    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        points: {
          current: userLoyalty.points_current,
          used: userLoyalty.points_used,
          lifetime: userLoyalty.points_lifetime || (userLoyalty.points_current + userLoyalty.points_used)
        },
        currentTier: currentTier ? {
          id: currentTier.id,
          name: currentTier.name,
          level: currentTier.level
        } : null,
        nextTier: nextTier ? {
          id: nextTier.id,
          name: nextTier.name,
          pointsRequired: nextTier.pointsRequired,
          pointsRemaining: nextTier.pointsRequired - currentPoints
        } : null,
        memberSince: userLoyalty.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /api/loyalty/user/status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty status',
      error: error.message
    });
  }
});
```

## Testing the Fix

After the backend fix, test with:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8001/api/loyalty/user/status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "points": {
      "current": 0,
      "used": 0,
      "lifetime": 0
    },
    "currentTier": null,
    "nextTier": {
      "id": "bronze",
      "name": "Bronze",
      "pointsRequired": 100,
      "pointsRemaining": 100
    },
    "memberSince": "2024-11-06T..."
  }
}
```

## Impact
Without this fix:
- ❌ Tier circles show static "100, 200, 300, 400, 500"
- ❌ User cannot see their actual points
- ❌ Rewards screen shows "No purchases yet" even if user has points
- ❌ Users cannot track their loyalty progress

## Priority
🔴 **CRITICAL** - This blocks the entire rewards feature from working correctly.

## Timeline
This needs to be fixed **IMMEDIATELY** - the frontend is ready and waiting for the backend fix.

---

## Additional Notes

### JWT Token Structure
The JWT token should contain:
```json
{
  "userId": "12345",  // or "id" or "_id"
  "email": "user@example.com",
  "iat": 1699276800,
  "exp": 1699363200
}
```

### authenticateToken Middleware
Make sure your `authenticateToken` middleware is setting `req.user`:
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    
    req.user = decoded;  // ✅ This should contain userId
    next();
  });
}
```

### Frontend is Ready
The frontend code is complete and working. It's correctly:
- ✅ Sending the JWT token
- ✅ Handling the response
- ✅ Displaying points dynamically
- ✅ Showing tier progress

**Only waiting on backend fix.**

---

**Status:** ⏳ Waiting for backend team to fix userId extraction
**Assigned To:** Backend Team
**Created:** November 6, 2025
