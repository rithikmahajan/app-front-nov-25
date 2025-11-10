# 🚨 BACKEND API REQUIREMENTS - REWARDS SYSTEM

## ⚠️ CRITICAL: App is Currently Broken

The Rewards screen in the mobile app **CANNOT function** without these backend endpoints. The app will show an error screen until these are implemented.

**Status:** ❌ **BLOCKING PRODUCTION DEPLOYMENT**

---

## Required Endpoints (3 Total)

### 1. ⚠️ **CRITICAL** - Rewards Banner Configuration

**Endpoint:** `GET /api/manage-banners-rewards`  
**Authentication:** Not required (public endpoint)  
**Priority:** 🔴 **HIGHEST** - Blocks entire Rewards screen

#### Request
```http
GET /api/manage-banners-rewards
Content-Type: application/json
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "headerText": "WANT",
    "discountText": "10% OFF",
    "subtitleText": "YOUR NEXT PURCHASE?",
    "bonusText": "PLUS REWARD GIVEAWAY AND MORE!",
    "questionText": "What are you waiting for?",
    "ctaText": "Become a rewards member today!"
  }
}
```

#### Response Fields
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `success` | boolean | ✅ Yes | Indicates if request was successful | `true` |
| `data.headerText` | string | ✅ Yes | Top banner text | "WANT" |
| `data.discountText` | string | ✅ Yes | Main discount offer (large text) | "10% OFF" |
| `data.subtitleText` | string | ✅ Yes | Subtitle under discount | "YOUR NEXT PURCHASE?" |
| `data.bonusText` | string | ✅ Yes | Additional benefits text | "PLUS REWARD GIVEAWAY AND MORE!" |
| `data.questionText` | string | ✅ Yes | Motivational question | "What are you waiting for?" |
| `data.ctaText` | string | ✅ Yes | Call-to-action text | "Become a rewards member today!" |

#### Error Response (404)
```json
{
  "success": false,
  "message": "API endpoint not found: GET /api/manage-banners-rewards",
  "data": null,
  "statusCode": 404
}
```

---

### 2. ⚠️ **CRITICAL** - Loyalty Tiers Configuration

**Endpoint:** `GET /api/loyalty/tiers`  
**Authentication:** Not required (public endpoint)  
**Priority:** 🔴 **HIGHEST** - Blocks tier display (100, 200, 300, 400, 500 circles)

#### Request
```http
GET /api/loyalty/tiers
Content-Type: application/json
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "tiers": [
      {
        "id": "bronze",
        "name": "bronze",
        "pointsRequired": 100,
        "color": "#CD7F32",
        "benefits": ["Welcome reward", "Birthday reward"]
      },
      {
        "id": "silver",
        "name": "silver",
        "pointsRequired": 200,
        "color": "#D9D9D9",
        "benefits": ["All Bronze benefits", "Free shipping"]
      },
      {
        "id": "gold",
        "name": "gold",
        "pointsRequired": 300,
        "color": "#D4AF37",
        "benefits": ["All Silver benefits", "Priority support"]
      },
      {
        "id": "platinum",
        "name": "platinum",
        "pointsRequired": 400,
        "color": "#B075A5",
        "benefits": ["All Gold benefits", "Exclusive events"]
      },
      {
        "id": "black",
        "name": "black",
        "pointsRequired": 500,
        "color": "#000000",
        "benefits": ["All Platinum benefits", "VIP access"]
      }
    ]
  }
}
```

#### Response Fields
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `success` | boolean | ✅ Yes | Indicates if request was successful | `true` |
| `data.tiers` | array | ✅ Yes | Array of tier objects | See below |
| `tier.id` | string | ✅ Yes | Unique tier identifier | "bronze" |
| `tier.name` | string | ✅ Yes | Tier display name | "bronze" |
| `tier.pointsRequired` | number | ✅ Yes | Points needed to reach this tier | 100 |
| `tier.color` | string | ✅ Yes | Hex color for tier badge | "#CD7F32" |
| `tier.benefits` | array | ❌ No | List of tier benefits | ["Benefit 1", "Benefit 2"] |

#### Important Notes
- Tiers MUST be returned in ascending order (lowest to highest points)
- The `pointsRequired` values (100, 200, 300, 400, 500) are displayed as circles in the UI
- Colors must be valid hex codes with # prefix
- The `name` field is used to determine text color (silver, gold, platinum use black text)

---

### 3. ⚠️ **HIGH PRIORITY** - User Loyalty Status

**Endpoint:** `GET /api/loyalty/user/status`  
**Authentication:** ✅ **REQUIRED** - Bearer token  
**Priority:** 🟡 **HIGH** - Needed to show user's actual points

#### Request
```http
GET /api/loyalty/user/status
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### Response Format (User with Points)
```json
{
  "success": true,
  "data": {
    "points": {
      "current": 250,
      "used": 50,
      "lifetime": 300
    },
    "currentTier": {
      "id": "silver",
      "name": "Silver",
      "level": 2
    },
    "nextTier": {
      "id": "gold",
      "name": "Gold",
      "pointsRequired": 300,
      "pointsRemaining": 50
    },
    "memberSince": "2024-01-15T10:30:00Z"
  }
}
```

#### Response Format (User with NO Points)
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
    "memberSince": "2024-11-06T10:30:00Z"
  }
}
```

#### Response Fields
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `success` | boolean | ✅ Yes | Indicates if request was successful | `true` |
| `data.points.current` | number | ✅ Yes | Current available points | 250 |
| `data.points.used` | number | ✅ Yes | Total points user has spent | 50 |
| `data.points.lifetime` | number | ❌ No | Total points ever earned | 300 |
| `data.currentTier` | object/null | ✅ Yes | User's current tier (null if no points) | See above |
| `data.nextTier` | object | ✅ Yes | Next tier user can achieve | See above |
| `data.memberSince` | string | ❌ No | ISO 8601 date when user joined | "2024-01-15T10:30:00Z" |

#### Error Responses

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required",
  "statusCode": 401
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

---

## How Points Are Displayed in the App

### Tier Circles Logic

The 5 tier circles (100, 200, 300, 400, 500) display:

**Example 1: User has 0 points**
```
Circles show: [100] [200] [300] [400] [500]
```

**Example 2: User has 150 points (Bronze tier achieved)**
```
Circles show: [150] [200] [300] [400] [500]
          (user's actual points for achieved tier)
```

**Example 3: User has 250 points (Bronze + Silver achieved)**
```
Circles show: [250] [250] [300] [400] [500]
          (user's actual points for both achieved tiers)
```

**Example 4: User has 550 points (All tiers achieved)**
```
Circles show: [550] [550] [550] [550] [550]
          (user's actual points shown in all circles)
```

### Points Display Section

**When user has points (current > 0 OR used > 0):**
```
Current Points
250        50
        Points Used
```

**When user has NO points (current = 0 AND used = 0):**
```
No purchases yet
[Shop Now to Earn Points] → Navigates to Home
```

---

## Implementation Checklist for Backend Team

- [ ] Create `GET /api/manage-banners-rewards` endpoint
  - [ ] Returns banner text configuration
  - [ ] Public endpoint (no auth required)
  - [ ] Return proper JSON structure as specified
  
- [ ] Create `GET /api/loyalty/tiers` endpoint
  - [ ] Returns 5 tiers: bronze (100), silver (200), gold (300), platinum (400), black (500)
  - [ ] Public endpoint (no auth required)
  - [ ] Tiers ordered by pointsRequired ascending
  - [ ] Include color hex codes
  
- [ ] Create `GET /api/loyalty/user/status` endpoint
  - [ ] Requires authentication (Bearer token)
  - [ ] Returns user's current points, used points
  - [ ] Returns current tier (or null if no points)
  - [ ] Returns next tier information
  - [ ] Handle case where user has 0 points
  
- [ ] Test with Postman/Insomnia
  - [ ] Test banner endpoint returns correct format
  - [ ] Test tiers endpoint returns 5 tiers
  - [ ] Test user status with authenticated user
  - [ ] Test user status with user who has 0 points
  - [ ] Test user status with user who has points
  
- [ ] Verify error responses
  - [ ] 404 for missing endpoints
  - [ ] 401 for missing/invalid authentication
  - [ ] 500 for server errors
  
- [ ] Deploy to staging
  - [ ] Verify all 3 endpoints work
  - [ ] Test with mobile app
  - [ ] Verify points calculation is correct

---

## Current App Behavior (Before Backend Implementation)

### What Users See Now:
```
Backend API Required

The rewards system requires backend endpoints to be implemented.

Failed to load banner: API endpoint not found: GET /api/manage-banners-rewards

[Contact Backend Team]
```

### What Users Will See After Implementation:
```
[Black banner with "10% OFF" offer]

[5 tier circles showing: 100, 200, 300, 400, 500]
(or user's actual points if they've achieved tiers)

The journey to becoming ✨ XCLUSIVE

Current Points: [user's points]
Points Used: [user's used points]

OR

No purchases yet
[Shop Now to Earn Points]
```

---

## Testing Instructions for Backend Team

### 1. Test Banner Endpoint
```bash
curl -X GET http://your-api-url/api/manage-banners-rewards
```

**Expected:** JSON with banner text fields

### 2. Test Tiers Endpoint
```bash
curl -X GET http://your-api-url/api/loyalty/tiers
```

**Expected:** JSON with 5 tiers (100, 200, 300, 400, 500 points)

### 3. Test User Status (Authenticated)
```bash
curl -X GET http://your-api-url/api/loyalty/user/status \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
```

**Expected:** JSON with user's points and tier information

### 4. Test User Status (Unauthenticated)
```bash
curl -X GET http://your-api-url/api/loyalty/user/status
```

**Expected:** 401 Unauthorized error

---

## Database Schema Recommendations

### rewards_tiers table
```sql
CREATE TABLE rewards_tiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  points_required INT NOT NULL,
  color VARCHAR(7) NOT NULL,
  level INT NOT NULL,
  benefits JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tiers
INSERT INTO rewards_tiers (id, name, points_required, color, level) VALUES
  ('bronze', 'Bronze', 100, '#CD7F32', 1),
  ('silver', 'Silver', 200, '#D9D9D9', 2),
  ('gold', 'Gold', 300, '#D4AF37', 3),
  ('platinum', 'Platinum', 400, '#B075A5', 4),
  ('black', 'Black', 500, '#000000', 5);
```

### user_loyalty table
```sql
CREATE TABLE user_loyalty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  points_current INT DEFAULT 0,
  points_used INT DEFAULT 0,
  points_lifetime INT DEFAULT 0,
  current_tier_id VARCHAR(50),
  member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (current_tier_id) REFERENCES rewards_tiers(id)
);
```

### rewards_banner_config table
```sql
CREATE TABLE rewards_banner_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  header_text VARCHAR(100),
  discount_text VARCHAR(100),
  subtitle_text VARCHAR(200),
  bonus_text VARCHAR(200),
  question_text VARCHAR(200),
  cta_text VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default banner
INSERT INTO rewards_banner_config (header_text, discount_text, subtitle_text, bonus_text, question_text, cta_text) VALUES
  ('WANT', '10% OFF', 'YOUR NEXT PURCHASE?', 'PLUS REWARD GIVEAWAY AND MORE!', 'What are you waiting for?', 'Become a rewards member today!');
```

---

## Questions? Contact

- **Frontend Team:** Rewards screen implementation complete
- **Backend Team:** Please implement the 3 endpoints above
- **QA Team:** Test after backend deployment

---

## Timeline

🚨 **URGENT:** These endpoints block the Rewards feature from going live.

**Suggested Timeline:**
- Day 1-2: Backend implementation
- Day 3: Backend testing & deployment to staging
- Day 4: Mobile app integration testing
- Day 5: Production deployment

---

## Status Updates

**Current Status:** ❌ Not Implemented  
**Last Updated:** November 6, 2025  
**Assigned To:** Backend Team  
**Tracking:** [Create Ticket/Issue Here]

---

## Additional Notes

1. **No Fallback Data:** The app intentionally has NO fallback data. This surfaces the missing backend functionality immediately rather than hiding it.

2. **Real-Time Points:** All point displays must reflect actual user purchases. No dummy data.

3. **Security:** The user loyalty status endpoint MUST verify the authenticated user's token and only return that user's data.

4. **Performance:** These endpoints will be called on every Rewards screen load. Ensure they're optimized and cached appropriately.

5. **Future Enhancements:** Once basic implementation is complete, we can add:
   - Points history/transactions
   - Rewards redemption
   - Special offers/campaigns
   - Push notifications for points earned
