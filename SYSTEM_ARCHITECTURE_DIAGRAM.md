# Invite Friend System - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (iOS)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │   InviteAFriend Screen (src/screens/)             │   │
│  │                                                     │   │
│  │   [Loading Spinner] or [Empty State] or           │   │
│  │   ┌──────────────────────────────────────┐        │   │
│  │   │  Voucher Card: INVITE322             │        │   │
│  │   │  ₹10 off your next order             │        │   │
│  │   │  [Copy]  [Share]                     │        │   │
│  │   └──────────────────────────────────────┘        │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          │ fetchInviteCodes()              │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │   yoraaAPI.js (src/services/)                     │   │
│  │                                                     │   │
│  │   getInviteFriendCodes() {                        │   │
│  │     1. /api/invite-friend/active          ←─┐    │   │
│  │     2. /api/invite-friend/public            │    │   │
│  │     3. /api/invite-friend/user/available    │    │   │
│  │     4. /api/promoCode/user/available        │    │   │
│  │   }                                         │    │   │
│  └─────────────────────────────────────────────┼────┘   │
└──────────────────────────────────────────────────│────────┘
                                                   │
                                                   │ HTTP GET
                                                   │ + JWT Token
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                            │
│                   (Node.js + Express)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │   NEW ENDPOINT (NEEDS TO BE CREATED)              │   │
│  │                                                     │   │
│  │   GET /api/invite-friend/active                   │   │
│  │                                                     │   │
│  │   middleware: authenticateUser                    │   │
│  │                                                     │   │
│  │   logic:                                          │   │
│  │     - Find active invite codes                    │   │
│  │     - Filter by expiry date                       │   │
│  │     - Check redemption count < max                │   │
│  │     - Return as JSON                              │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          │ Query                            │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │   MongoDB Collection: invitefriends               │   │
│  │                                                     │   │
│  │   {                                                │   │
│  │     code: "INVITE322",                            │   │
│  │     description: "Invite friends...",             │   │
│  │     discountType: "flat",                         │   │
│  │     discountValue: 10,                            │   │
│  │     maxRedemptions: 100,                          │   │
│  │     redemptionCount: 0,                           │   │
│  │     status: "active",                             │   │
│  │     isVisible: true                               │   │
│  │   }                                                │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### Current State (NOT WORKING)

```
Mobile App                    Backend
─────────                    ─────────

1. User opens Invite screen
   │
   ├─→ GET /api/invite-friend/active
   │                             │
   │                             ├─→ 404 Not Found ❌
   │   ←─────────────────────────┘
   │
   ├─→ GET /api/invite-friend/public
   │                             │
   │                             ├─→ 404 Not Found ❌
   │   ←─────────────────────────┘
   │
   ├─→ GET /api/promoCode/user/available
   │                             │
   │                             ├─→ 200 OK
   │   ←─────────────────────────┤   { data: [] } ❌
   │
   ▼
"No invite codes available" 
```

### After Backend Fix (WORKING)

```
Mobile App                    Backend                 Database
─────────                    ─────────                ────────

1. User opens Invite screen
   │
   ├─→ GET /api/invite-friend/active
   │   Authorization: Bearer <JWT>
   │                             │
   │                             ├─→ Authenticate user ✅
   │                             │
   │                             ├─→ Query DB
   │                             │      │
   │                             │      ├─→ Find active codes
   │                             │      │   status: 'active'
   │                             │      │   isVisible: true
   │                             │      │   Not expired
   │                             │      │
   │                             │   ←──┤   [INVITE322]
   │                             │
   │   ←─────────────────────────┤
   │   200 OK                    │
   │   {
   │     success: true,
   │     data: [{
   │       code: "INVITE322",
   │       discountValue: 10,
   │       ...
   │     }]
   │   }
   │
   ▼
┌──────────────────────┐
│  Voucher Card        │
│  Code: INVITE322     │
│  ₹10 off            │
│  [Copy] [Share]     │
└──────────────────────┘
```

## Data Models

### InviteFriend Schema (Backend)

```javascript
{
  _id: ObjectId,
  code: String,              // "INVITE322"
  description: String,       // "Invite friends and get ₹10 off"
  discountType: String,      // "flat" or "percentage"
  discountValue: Number,     // 10
  maxRedemptions: Number,    // 100
  redemptionCount: Number,   // 0
  status: String,            // "active" or "inactive"
  expiryDate: Date,          // ISO date or null
  minOrderValue: Number,     // 0
  terms: String,             // "Valid for new users"
  isVisible: Boolean,        // true
  createdAt: Date,
  updatedAt: Date
}
```

### Frontend State (Mobile App)

```javascript
// src/screens/InviteAFriend.js
{
  inviteCodes: [             // Array of codes
    {
      id: "507f...",
      code: "INVITE322",
      description: "Get ₹10 off",
      discountType: "flat",
      discountValue: 10,
      maxRedemptions: 100,
      redemptionCount: 0,
      status: "active",
      expiryDate: "2024-12-31...",
      minOrderValue: 0,
      terms: "Valid for new users",
      isVisible: true
    }
  ],
  isLoading: false,          // Loading state
}
```

## API Endpoint Specification

### Request

```http
GET /api/invite-friend/active HTTP/1.1
Host: localhost:8001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

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
      "isVisible": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Active invite codes fetched successfully"
}
```

### Response (Empty)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": [],
  "message": "No active invite codes available"
}
```

### Response (Error)

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "message": "Authentication required"
}
```

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                            │
└─────────────────────────────────────────────────────────────┘

1. User logs into app
   │
   ▼
2. User navigates to Profile
   │
   ▼
3. User taps "Invite a Friend"
   │
   ▼                                    ┌──────────────────┐
4. App shows loading spinner            │   Loading...     │
   │ (fetching codes from backend)      │   ⟳            │
   │                                    └──────────────────┘
   ▼
5a. IF codes found:
    │                                   ┌──────────────────┐
    ▼                                   │  ╔══════════════╗ │
    Display voucher card(s)             │  ║  INVITE322   ║ │
    │                                   │  ╠══════════════╣ │
    │                                   │  ║ Get ₹10 off ║ │
    │                                   │  ╠══════════════╣ │
    │                                   │  ║ [Copy][Share]║ │
    │                                   │  ╚══════════════╝ │
    │                                   └──────────────────┘
    │
    ├─→ User taps "Copy"
    │   │
    │   ├─→ Code copied to clipboard ✅
    │   └─→ "Code copied!" toast shown
    │
    └─→ User taps "Share"
        │
        └─→ System share sheet opens
            │
            └─→ User shares via WhatsApp/SMS/etc.

5b. IF no codes:
    │                                   ┌──────────────────┐
    ▼                                   │   😢             │
    Display empty state                 │ No invite codes  │
    │                                   │ available        │
    └─→ User can tap "Retry"           │ [Retry]          │
                                        └──────────────────┘
```

## Admin Flow (Backend)

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN CREATES INVITE CODE                      │
└─────────────────────────────────────────────────────────────┘

1. Admin logs into backend admin panel
   │
   ▼
2. Admin navigates to "Invite a Friend" section
   │
   ▼
3. Admin clicks "Create New Code"
   │
   ▼
4. Admin fills form:
   ├─ Code: INVITE322
   ├─ Discount Type: Flat
   ├─ Discount Value: ₹10
   ├─ Max Redemptions: 100
   ├─ Min Order Value: ₹0
   ├─ Expiry Date: 31/12/2024
   ├─ Status: Active
   └─ Visible: Yes
   │
   ▼
5. Admin clicks "Save"
   │
   ▼
6. Code saved to database
   │
   ▼
7. Code immediately available in mobile app
   (users see it on next screen load)
```

## Database Query Logic

```javascript
// Backend: Find active codes
const activeCodes = await InviteFriend.find({
  // Must be active
  status: 'active',
  
  // Must be visible to users
  isVisible: true,
  
  // Either not expired OR no expiry date
  $or: [
    { expiryDate: { $gt: new Date() } },
    { expiryDate: null }
  ],
  
  // Not reached max redemptions
  $expr: { 
    $lt: ['$redemptionCount', '$maxRedemptions'] 
  }
});

// Returns: [{ code: "INVITE322", ... }]
```

## Testing Scenarios

### Scenario 1: Happy Path ✅
```
Given: Backend has INVITE322 code (active, visible, not expired)
When: User opens Invite screen
Then: INVITE322 voucher card is displayed
And: User can copy code successfully
And: User can share code via share sheet
```

### Scenario 2: No Codes Available ⚠️
```
Given: Backend has no active invite codes
When: User opens Invite screen
Then: Empty state is shown
And: "No invite codes available" message is displayed
And: Retry button is available
```

### Scenario 3: Backend Endpoint Missing ❌
```
Given: Backend endpoint not implemented
When: User opens Invite screen
Then: App tries 4 endpoints sequentially
And: All fail with 404
And: Empty state is shown with message
```

### Scenario 4: Multiple Codes 🎯
```
Given: Backend has multiple active codes (INVITE322, WELCOME10, NEW50)
When: User opens Invite screen
Then: All 3 voucher cards are displayed
And: User can copy any code
And: User can share any code
```

---

**This visual guide shows exactly how the system works and what needs to be fixed!**
