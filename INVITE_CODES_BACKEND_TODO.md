# 🔧 Invite Codes Backend Implementation Required

## Current Status
❌ **The invite codes feature is not working because backend endpoints are missing**

## What's Happening Now
The mobile app is trying to fetch invite codes but all endpoints are failing:
- ❌ `/api/invite-friend/admin/all` → 403 Forbidden (admin only)
- ❌ `/api/invite-friend/active` → 404 Not Found
- ❌ `/api/invite-friend/public` → 404 Not Found
- ❌ `/api/invite-friend/user/available` → 404 Not Found

## What's Needed
The backend team needs to implement **ONE** of these user-accessible endpoints:

### Option 1: `/api/invite-friend/user` (RECOMMENDED)
**Purpose**: Return active invite codes for the current user

**Method**: `GET`

**Authentication**: Required (JWT Bearer token)

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "code": "INVITE322",
      "description": "Invite friends and get ₹10 off",
      "discountType": "flat",
      "discountValue": 10,
      "maxRedemptions": 100,
      "redemptionCount": 0,
      "status": "active",
      "expiryDate": "2024-12-31T23:59:59.000Z",
      "minOrderValue": 0,
      "terms": "Valid for new users only",
      "isVisible": true
    }
  ],
  "message": "Invite codes fetched successfully"
}
```

### Option 2: `/api/invite-friend/available`
Same as Option 1, returns all available active invite codes.

### Option 3: `/api/user/invite-codes`
Same format, alternative URL structure.

---

## Backend Implementation Guide

### Step 1: Create the Route

```javascript
// routes/inviteFriend.js or routes/user.js

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const InviteFriend = require('../models/InviteFriend');

// GET /api/invite-friend/user - Fetch active invite codes
router.get('/user', authenticateUser, async (req, res) => {
  try {
    // Fetch all active invite codes that are:
    // 1. Status = 'active'
    // 2. Not expired
    // 3. Not maxed out on redemptions
    // 4. Visible to users
    
    const activeCodes = await InviteFriend.find({ 
      status: 'active',
      isVisible: true,
      $or: [
        { expiryDate: { $gt: new Date() } },  // Not expired
        { expiryDate: null }                   // No expiry
      ],
      $expr: { $lt: ['$redemptionCount', '$maxRedemptions'] } // Not maxed out
    })
    .select('-__v -createdBy -updatedAt')  // Exclude internal fields
    .lean();
    
    console.log(`✅ Found ${activeCodes.length} active invite codes for user ${req.user.id}`);
    
    return res.status(200).json({
      success: true,
      data: activeCodes,
      message: 'Invite codes fetched successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching invite codes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invite codes',
      data: null
    });
  }
});

module.exports = router;
```

### Step 2: Register the Route

```javascript
// app.js or server.js

const inviteFriendRoutes = require('./routes/inviteFriend');
app.use('/api/invite-friend', inviteFriendRoutes);
```

### Step 3: Verify Your Schema

Make sure your `InviteFriend` model has these fields:

```javascript
const inviteFriendSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['flat', 'percentage'], required: true },
  discountValue: { type: Number, required: true },
  maxRedemptions: { type: Number, default: 100 },
  redemptionCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  expiryDate: { type: Date },
  minOrderValue: { type: Number, default: 0 },
  terms: { type: String },
  isVisible: { type: Boolean, default: true }
}, {
  timestamps: true
});
```

---

## Testing the Endpoint

### 1. Create Test Data (if needed)

```javascript
// Run this in your backend console or create a seed script
const InviteFriend = require('./models/InviteFriend');

await InviteFriend.create([
  {
    code: 'INVITE322',
    description: 'Invite friends and get ₹10 off',
    discountType: 'flat',
    discountValue: 10,
    maxRedemptions: 100,
    status: 'active',
    isVisible: true,
    terms: 'Valid for new users only'
  },
  {
    code: 'REFERRAL15',
    description: 'Get 15% off when you refer a friend',
    discountType: 'percentage',
    discountValue: 15,
    maxRedemptions: 50,
    status: 'active',
    isVisible: true,
    minOrderValue: 100
  }
]);
```

### 2. Test with cURL

```bash
curl -X GET http://your-backend-url/api/invite-friend/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Expected Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "code": "INVITE322",
      "description": "Invite friends and get ₹10 off",
      "discountType": "flat",
      "discountValue": 10,
      ...
    },
    {
      "_id": "...",
      "code": "REFERRAL15",
      "description": "Get 15% off when you refer a friend",
      "discountType": "percentage",
      "discountValue": 15,
      ...
    }
  ],
  "message": "Invite codes fetched successfully"
}
```

---

## Once Implemented

After the backend implements this endpoint, the mobile app will:
- ✅ Automatically fetch and display invite codes
- ✅ Show them in the "Invite Friends" screen
- ✅ Allow users to copy/share the codes
- ✅ Display discount information clearly

No changes needed on the frontend - it's already ready to consume the endpoint!

---

## Current Frontend Changes

✅ Updated frontend to:
- Try user-accessible endpoints only (no admin endpoints)
- Reduce console error noise when endpoints don't exist
- Show graceful "coming soon" message instead of errors
- Handle missing endpoints gracefully

---

## Questions?

Contact the mobile app team for:
- Response format clarification
- Field mapping questions
- Testing assistance
