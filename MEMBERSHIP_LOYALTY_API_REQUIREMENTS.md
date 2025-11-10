# Membership & Loyalty Program API Requirements

## Overview
This document outlines the backend API requirements to make the "Join Us" membership/loyalty program screen fully dynamic. Based on the screenshot, the screen displays different membership tiers (Bronze, Silver, Gold, Platinum, Black) with associated benefits and rewards.

---

## 🎯 Required API Endpoints

### 1. **Get Membership Tiers Configuration**
**Endpoint:** `GET /api/loyalty/tiers` or `GET /api/membership/tiers`

**Purpose:** Fetch all membership tier levels with their configurations, benefits, and visual properties.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "programName": "YORAA",
    "tagline": "free delivery and priority assist. Join YORAA today.",
    "tiers": [
      {
        "id": "bronze",
        "name": "Bronze",
        "level": 1,
        "color": "#CD7F32",
        "pointsRequired": 0,
        "pointsToNextTier": 200,
        "icon": "https://cdn.example.com/icons/bronze.png",
        "modelImage": "https://cdn.example.com/models/bronze-model.jpg",
        "description": "Join by creating an Account",
        "benefits": [
          {
            "id": "welcome-reward",
            "title": "Welcome reward",
            "description": "Enjoy a welcome reward to spend in your first month.",
            "icon": "gift"
          },
          {
            "id": "birthday-reward",
            "title": "Birthday reward",
            "description": "Celebrate your birthday month with a special discount.",
            "icon": "cake"
          },
          {
            "id": "private-sale",
            "title": "Private members' sale",
            "description": "Unlocked after your first order.",
            "icon": "tag"
          }
        ],
        "ctaButton": {
          "text": "Join Us",
          "action": "signup"
        }
      },
      {
        "id": "silver",
        "name": "Silver",
        "level": 2,
        "color": "#C0C0C0",
        "pointsRequired": 200,
        "pointsToNextTier": 300,
        "icon": "https://cdn.example.com/icons/silver.png",
        "modelImage": "https://cdn.example.com/models/silver-model.jpg",
        "description": "Spend $200 to unlock Silver tier",
        "benefits": [
          {
            "id": "welcome-reward",
            "title": "Welcome reward",
            "description": "Enhanced welcome bonus for Silver members.",
            "icon": "gift"
          },
          {
            "id": "birthday-reward",
            "title": "Birthday reward",
            "description": "Bigger birthday discount than Bronze.",
            "icon": "cake"
          },
          {
            "id": "free-shipping",
            "title": "Free standard shipping",
            "description": "Enjoy free shipping on all orders.",
            "icon": "truck"
          },
          {
            "id": "early-access",
            "title": "Early access to sales",
            "description": "Shop sales 24 hours before everyone else.",
            "icon": "clock"
          }
        ],
        "ctaButton": {
          "text": "Upgrade to Silver",
          "action": "upgrade"
        }
      },
      {
        "id": "gold",
        "name": "Gold",
        "level": 3,
        "color": "#FFD700",
        "pointsRequired": 500,
        "pointsToNextTier": 500,
        "icon": "https://cdn.example.com/icons/gold.png",
        "modelImage": "https://cdn.example.com/models/gold-model.jpg",
        "description": "Spend $500 to unlock Gold tier",
        "benefits": [
          {
            "id": "all-previous",
            "title": "All Silver benefits",
            "description": "Plus exclusive Gold perks.",
            "icon": "star"
          },
          {
            "id": "priority-shipping",
            "title": "Priority shipping",
            "description": "Get your orders faster with priority handling.",
            "icon": "rocket"
          },
          {
            "id": "exclusive-events",
            "title": "Exclusive events",
            "description": "Invitations to members-only events.",
            "icon": "calendar"
          },
          {
            "id": "personal-stylist",
            "title": "Personal stylist consultation",
            "description": "One free styling session per year.",
            "icon": "user"
          }
        ],
        "ctaButton": {
          "text": "Upgrade to Gold",
          "action": "upgrade"
        }
      },
      {
        "id": "platinum",
        "name": "Platinum",
        "level": 4,
        "color": "#E5E4E2",
        "pointsRequired": 1000,
        "pointsToNextTier": 500,
        "icon": "https://cdn.example.com/icons/platinum.png",
        "modelImage": "https://cdn.example.com/models/platinum-model.jpg",
        "description": "Spend $1000 to unlock Platinum tier",
        "benefits": [
          {
            "id": "all-previous",
            "title": "All Gold benefits",
            "description": "Plus premium Platinum perks.",
            "icon": "star"
          },
          {
            "id": "concierge-service",
            "title": "Concierge service",
            "description": "24/7 dedicated customer support.",
            "icon": "headset"
          },
          {
            "id": "double-points",
            "title": "Double points",
            "description": "Earn 2x points on every purchase.",
            "icon": "coins"
          },
          {
            "id": "vip-access",
            "title": "VIP access",
            "description": "First access to new collections and collaborations.",
            "icon": "crown"
          }
        ],
        "ctaButton": {
          "text": "Upgrade to Platinum",
          "action": "upgrade"
        }
      },
      {
        "id": "black",
        "name": "Black",
        "level": 5,
        "color": "#000000",
        "pointsRequired": 1500,
        "pointsToNextTier": null,
        "icon": "https://cdn.example.com/icons/black.png",
        "modelImage": "https://cdn.example.com/models/black-model.jpg",
        "description": "By invitation only",
        "benefits": [
          {
            "id": "all-previous",
            "title": "All Platinum benefits",
            "description": "Plus ultimate Black tier exclusives.",
            "icon": "diamond"
          },
          {
            "id": "unlimited-free-returns",
            "title": "Unlimited free returns",
            "description": "Return any item, anytime, free of charge.",
            "icon": "refresh"
          },
          {
            "id": "exclusive-products",
            "title": "Black-only products",
            "description": "Access to limited edition Black tier exclusives.",
            "icon": "lock"
          },
          {
            "id": "luxury-experiences",
            "title": "Luxury experiences",
            "description": "Complimentary tickets to fashion shows and events.",
            "icon": "ticket"
          }
        ],
        "ctaButton": {
          "text": "By Invitation Only",
          "action": "invitation_only"
        }
      }
    ],
    "ctaButton": {
      "text": "Join Us",
      "backgroundColor": "#000000",
      "textColor": "#FFFFFF",
      "action": "navigate_signup"
    }
  }
}
```

---

### 2. **Get User's Current Membership Status**
**Endpoint:** `GET /api/loyalty/user/status` or `GET /api/user/membership`

**Purpose:** Fetch the authenticated user's current membership tier, points, and progress.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "userId": "user_12345",
    "currentTier": {
      "id": "bronze",
      "name": "Bronze",
      "level": 1
    },
    "points": {
      "total": 150,
      "current": 150,
      "used": 0,
      "lifetime": 150
    },
    "nextTier": {
      "id": "silver",
      "name": "Silver",
      "level": 2,
      "pointsRequired": 200,
      "pointsRemaining": 50,
      "progressPercentage": 75
    },
    "memberSince": "2024-01-15T10:30:00Z",
    "benefits": [
      {
        "id": "welcome-reward",
        "title": "Welcome reward",
        "description": "Enjoy a welcome reward to spend in your first month.",
        "status": "claimed",
        "claimedDate": "2024-01-16T10:30:00Z"
      },
      {
        "id": "birthday-reward",
        "title": "Birthday reward",
        "description": "Celebrate your birthday month with a special discount.",
        "status": "available",
        "expiryDate": "2024-12-31T23:59:59Z"
      },
      {
        "id": "private-sale",
        "title": "Private members' sale",
        "description": "Unlocked after your first order.",
        "status": "locked",
        "unlockCondition": "Make your first order"
      }
    ],
    "achievements": [
      {
        "id": "first-purchase",
        "title": "First Purchase",
        "description": "Made your first purchase",
        "earnedDate": "2024-01-20T10:30:00Z",
        "icon": "shopping-bag"
      }
    ],
    "statistics": {
      "totalOrders": 5,
      "totalSpent": 150.00,
      "averageOrderValue": 30.00,
      "favoriteCategory": "Women's Clothing"
    }
  }
}
```

---

### 3. **Get Membership Program Configuration**
**Endpoint:** `GET /api/loyalty/config` or `GET /api/membership/program-config`

**Purpose:** Fetch general configuration for the loyalty program (colors, thresholds, rules).

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "programEnabled": true,
    "programName": "YORAA Rewards",
    "currency": "points",
    "pointsSystem": {
      "earnRate": {
        "perDollarSpent": 1,
        "perReferral": 50,
        "perReview": 10,
        "perSocialShare": 5
      },
      "redemptionRate": {
        "pointsPerDollar": 100,
        "minimumRedemption": 500
      }
    },
    "tierSystem": {
      "evaluationPeriod": "12 months",
      "evaluationCriteria": "total_spend",
      "downgradePeriod": "12 months"
    },
    "progressBarColors": [
      "#CD7F32",  // Bronze
      "#FFD700",  // Gold (not Silver - matches screenshot)
      "#808080",  // Gray
      "#DDA0DD",  // Purple
      "#000000"   // Black
    ],
    "features": {
      "showProgressBar": true,
      "showModelImages": true,
      "allowTierDowngrade": false,
      "showPointsBalance": true,
      "enableReferralProgram": true
    },
    "ui": {
      "headerText": "free delivery and priority assist. Join YORAA today.",
      "joinButtonText": "Join Us",
      "theme": {
        "primaryColor": "#000000",
        "accentColor": "#FFFFFF",
        "progressBarHeight": 4,
        "tierCardBorderRadius": 12
      }
    }
  }
}
```

---

### 4. **Join Membership Program**
**Endpoint:** `POST /api/loyalty/join` or `POST /api/membership/signup`

**Purpose:** Enroll a user in the membership program (typically on account creation).

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tierId": "bronze",
  "referralCode": "FRIEND123",
  "acceptTerms": true,
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "interests": ["womens-fashion", "accessories"]
  }
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Successfully joined the YORAA Rewards program!",
  "data": {
    "memberId": "member_67890",
    "userId": "user_12345",
    "currentTier": {
      "id": "bronze",
      "name": "Bronze",
      "level": 1
    },
    "welcomeBonus": {
      "points": 100,
      "couponCode": "WELCOME10",
      "couponValue": 10,
      "expiryDate": "2024-12-31T23:59:59Z"
    },
    "memberSince": "2024-11-06T10:30:00Z"
  }
}
```

---

### 5. **Get Available Rewards**
**Endpoint:** `GET /api/loyalty/rewards` or `GET /api/membership/rewards`

**Purpose:** Fetch all available rewards that users can claim with their points.

**Query Parameters:**
- `tierId` (optional): Filter rewards by specific tier
- `category` (optional): Filter by reward category (discount, product, experience)
- `status` (optional): available, claimed, expired

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "reward_001",
        "title": "Welcome Reward",
        "description": "Enjoy a welcome reward to spend in your first month.",
        "type": "discount_coupon",
        "value": 10,
        "valueType": "percentage",
        "pointsCost": 0,
        "availableForTiers": ["bronze", "silver", "gold", "platinum", "black"],
        "conditions": {
          "minimumPurchase": 50,
          "applicableCategories": ["all"],
          "firstPurchaseOnly": true
        },
        "validityPeriod": {
          "validFrom": "signup_date",
          "validFor": "30 days"
        },
        "imageUrl": "https://cdn.example.com/rewards/welcome.jpg",
        "status": "available"
      },
      {
        "id": "reward_002",
        "title": "Birthday Reward",
        "description": "Celebrate your birthday month with a special discount.",
        "type": "discount_coupon",
        "value": 15,
        "valueType": "percentage",
        "pointsCost": 0,
        "availableForTiers": ["bronze", "silver", "gold", "platinum", "black"],
        "conditions": {
          "minimumPurchase": 0,
          "birthdayMonthOnly": true
        },
        "validityPeriod": {
          "validFrom": "birthday_month_start",
          "validFor": "30 days"
        },
        "imageUrl": "https://cdn.example.com/rewards/birthday.jpg",
        "status": "locked"
      },
      {
        "id": "reward_003",
        "title": "Private Members' Sale Access",
        "description": "Unlocked after your first order.",
        "type": "early_access",
        "pointsCost": 0,
        "availableForTiers": ["bronze", "silver", "gold", "platinum", "black"],
        "conditions": {
          "minimumOrders": 1
        },
        "imageUrl": "https://cdn.example.com/rewards/private-sale.jpg",
        "status": "locked",
        "unlockCondition": "Complete your first order"
      }
    ],
    "userEligibility": {
      "totalPointsAvailable": 150,
      "claimableRewardsCount": 2,
      "lockedRewardsCount": 1
    }
  }
}
```

---

### 6. **Claim a Reward**
**Endpoint:** `POST /api/loyalty/rewards/claim` or `POST /api/membership/rewards/claim`

**Purpose:** Allow user to claim a reward using their points.

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rewardId": "reward_001",
  "pointsToUse": 100
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Reward claimed successfully!",
  "data": {
    "claimId": "claim_123",
    "reward": {
      "id": "reward_001",
      "title": "Welcome Reward",
      "couponCode": "WELCOME10-USER12345",
      "value": 10,
      "valueType": "percentage"
    },
    "pointsUsed": 100,
    "remainingPoints": 50,
    "validUntil": "2024-12-06T23:59:59Z",
    "claimedAt": "2024-11-06T10:30:00Z"
  }
}
```

---

### 7. **Get Points History**
**Endpoint:** `GET /api/loyalty/points/history` or `GET /api/membership/points/transactions`

**Purpose:** Fetch user's points earning and spending history.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): earned, spent, all
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_001",
        "type": "earned",
        "points": 50,
        "description": "Purchase #12345",
        "orderId": "order_12345",
        "date": "2024-11-05T14:30:00Z",
        "balanceAfter": 150
      },
      {
        "id": "txn_002",
        "type": "earned",
        "points": 100,
        "description": "Welcome bonus",
        "date": "2024-11-01T10:00:00Z",
        "balanceAfter": 100
      }
    ],
    "summary": {
      "totalEarned": 150,
      "totalSpent": 0,
      "currentBalance": 150
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2,
      "itemsPerPage": 20
    }
  }
}
```

---

### 8. **Get Membership Benefits by Tier**
**Endpoint:** `GET /api/loyalty/benefits/:tierId` or `GET /api/membership/tiers/:tierId/benefits`

**Purpose:** Get detailed benefits information for a specific tier.

**Path Parameters:**
- `tierId`: bronze, silver, gold, platinum, black

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "tierId": "bronze",
    "tierName": "Bronze",
    "benefits": [
      {
        "id": "welcome-reward",
        "title": "Welcome reward",
        "description": "Enjoy a welcome reward to spend in your first month.",
        "icon": "gift",
        "category": "discount",
        "value": "10% off",
        "terms": "Valid on purchases over $50. Cannot be combined with other offers."
      },
      {
        "id": "birthday-reward",
        "title": "Birthday reward",
        "description": "Celebrate your birthday month with a special discount.",
        "icon": "cake",
        "category": "discount",
        "value": "15% off",
        "terms": "Valid during your birthday month on all regular-priced items."
      },
      {
        "id": "private-sale",
        "title": "Private members' sale",
        "description": "Unlocked after your first order.",
        "icon": "tag",
        "category": "early_access",
        "value": "Early access to sales",
        "terms": "Access granted 24 hours before public sale starts.",
        "unlockCondition": {
          "type": "order_count",
          "required": 1,
          "current": 0
        }
      }
    ]
  }
}
```

---

### 9. **Upgrade Tier Eligibility Check**
**Endpoint:** `GET /api/loyalty/upgrade/eligibility` or `GET /api/membership/upgrade-check`

**Purpose:** Check if user is eligible for tier upgrade and what's needed.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "currentTier": {
      "id": "bronze",
      "name": "Bronze",
      "level": 1
    },
    "eligible": false,
    "nextTier": {
      "id": "silver",
      "name": "Silver",
      "level": 2,
      "requirements": {
        "totalSpend": 200,
        "currentSpend": 150,
        "remainingSpend": 50,
        "progressPercentage": 75
      }
    },
    "estimatedUpgradeDate": "2024-12-15T00:00:00Z",
    "recommendations": [
      "Spend $50 more to reach Silver tier",
      "You're 75% of the way there!"
    ]
  }
}
```

---

### 10. **Get Referral Program Details**
**Endpoint:** `GET /api/loyalty/referral` or `GET /api/membership/referral-program`

**Purpose:** Fetch user's referral code and referral program details.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "referralCode": "RITHIK123",
    "referralLink": "https://yoraa.com/join?ref=RITHIK123",
    "referralRewards": {
      "pointsPerReferral": 50,
      "refereeBonus": 100,
      "minimumPurchaseRequired": 25
    },
    "referralStats": {
      "totalReferrals": 3,
      "successfulReferrals": 2,
      "pendingReferrals": 1,
      "totalPointsEarned": 100
    },
    "referralHistory": [
      {
        "id": "ref_001",
        "refereeName": "John D.",
        "status": "completed",
        "pointsEarned": 50,
        "joinDate": "2024-10-15T10:30:00Z"
      },
      {
        "id": "ref_002",
        "refereeName": "Sarah M.",
        "status": "completed",
        "pointsEarned": 50,
        "joinDate": "2024-10-20T10:30:00Z"
      },
      {
        "id": "ref_003",
        "refereeName": "Mike K.",
        "status": "pending",
        "pointsEarned": 0,
        "joinDate": "2024-11-01T10:30:00Z",
        "pendingReason": "Awaiting first purchase"
      }
    ]
  }
}
```

---

## 🎨 Frontend Implementation Requirements

### State Management
```javascript
// Required state for membership screen
const [membershipTiers, setMembershipTiers] = useState([]);
const [userMembershipStatus, setUserMembershipStatus] = useState(null);
const [programConfig, setProgramConfig] = useState(null);
const [loading, setLoading] = useState(true);
const [selectedTier, setSelectedTier] = useState(null);
```

### API Service Methods Needed

```javascript
// In apiService.js or yoraaAPI.js

export const membershipAPI = {
  // Get all tiers
  async getMembershipTiers() {
    return await apiClient.get('/api/loyalty/tiers');
  },

  // Get user's membership status
  async getUserMembershipStatus() {
    return await apiClient.get('/api/loyalty/user/status');
  },

  // Get program configuration
  async getProgramConfig() {
    return await apiClient.get('/api/loyalty/config');
  },

  // Join membership program
  async joinMembership(data) {
    return await apiClient.post('/api/loyalty/join', data);
  },

  // Get available rewards
  async getRewards(filters = {}) {
    return await apiClient.get('/api/loyalty/rewards', { params: filters });
  },

  // Claim a reward
  async claimReward(rewardId, pointsToUse) {
    return await apiClient.post('/api/loyalty/rewards/claim', {
      rewardId,
      pointsToUse
    });
  },

  // Get points history
  async getPointsHistory(page = 1, limit = 20) {
    return await apiClient.get('/api/loyalty/points/history', {
      params: { page, limit }
    });
  },

  // Get benefits by tier
  async getTierBenefits(tierId) {
    return await apiClient.get(`/api/loyalty/benefits/${tierId}`);
  },

  // Check upgrade eligibility
  async checkUpgradeEligibility() {
    return await apiClient.get('/api/loyalty/upgrade/eligibility');
  },

  // Get referral program details
  async getReferralDetails() {
    return await apiClient.get('/api/loyalty/referral');
  }
};
```

---

## 📋 Data Flow

### 1. **Screen Load Flow**
```
User opens Rewards/Membership screen
    ↓
1. Fetch program configuration (GET /api/loyalty/config)
    ↓
2. Fetch all membership tiers (GET /api/loyalty/tiers)
    ↓
3. If user is authenticated:
   - Fetch user membership status (GET /api/loyalty/user/status)
   - Fetch available rewards (GET /api/loyalty/rewards)
    ↓
4. Render dynamic UI with:
   - Progress bar with tier colors
   - Tier cards with benefits
   - User's current position (if authenticated)
   - CTA button ("Join Us" or "View Benefits")
```

### 2. **Join/Signup Flow**
```
User clicks "Join Us" button
    ↓
1. If not authenticated:
   - Navigate to Sign Up screen
   - After signup, automatically enroll in Bronze tier (POST /api/loyalty/join)
    ↓
2. If authenticated but not enrolled:
   - Show enrollment modal
   - Call POST /api/loyalty/join
    ↓
3. Show success message with welcome bonus
4. Refresh user membership status
```

### 3. **Progress Display Flow**
```
Authenticated user views their progress
    ↓
1. Display current tier position on progress bar
2. Show points balance and progress percentage
3. Display "X points to next tier" message
4. Highlight unlocked benefits
5. Show locked benefits with unlock conditions
```

---

## 🎯 Key Dynamic Elements from Screenshot

### 1. **Header Section**
- Dynamic tagline text
- Dynamic program name
- Configurable background color

### 2. **Progress Bar**
- 5 colored dots representing tiers
- Colors from API response
- Active tier highlighted
- Progress percentage calculated dynamically

### 3. **Join Us Button**
- Dynamic text from API
- Configurable colors
- Action based on auth status

### 4. **Tier Cards (Horizontal Scroll)**
Each card needs:
- Tier name (Bronze, Silver, Gold, etc.)
- Tier color
- Model image URL
- Description text
- List of benefits with icons
- CTA button (text varies by tier)

### 5. **Benefits List**
Each benefit needs:
- Icon/emoji
- Title
- Description
- Lock status (if applicable)
- Unlock condition text

---

## 🔐 Authentication Requirements

### Public (No Auth Required)
- GET /api/loyalty/tiers
- GET /api/loyalty/config

### Authenticated (Requires Bearer Token)
- GET /api/loyalty/user/status
- POST /api/loyalty/join
- GET /api/loyalty/rewards
- POST /api/loyalty/rewards/claim
- GET /api/loyalty/points/history
- GET /api/loyalty/upgrade/eligibility
- GET /api/loyalty/referral

---

## 🎨 Additional UI Considerations

### Images Needed from Backend
1. **Model images** for each tier (full body product showcase)
2. **Tier icons** (bronze, silver, gold, platinum, black badges)
3. **Benefit icons** (gift, cake, tag, truck, clock, etc.)
4. **Reward images** (for rewards catalog)

### Color Scheme
Based on the screenshot, the progress bar uses:
- Orange/Bronze: `#CD7F32`
- Yellow/Gold: `#FFD700`
- Gray: `#808080`
- Purple: `#DDA0DD`
- Black: `#000000`

### Typography
- Header: Large, bold, centered
- Tier titles: Bold, large (e.g., "Bronze")
- Descriptions: Regular, smaller
- Benefits: Medium weight, readable

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] All endpoints return correct response structure
- [ ] Authentication middleware works correctly
- [ ] Points calculation is accurate
- [ ] Tier upgrades happen automatically
- [ ] Benefits unlock based on conditions
- [ ] Images are served correctly (CDN)
- [ ] Error handling for all edge cases

### Frontend Testing
- [ ] Screen loads without errors
- [ ] Progress bar displays correctly
- [ ] Tier cards scroll horizontally
- [ ] Join button works (auth/no-auth)
- [ ] Benefits display with proper icons
- [ ] Model images load properly
- [ ] User's current tier is highlighted
- [ ] Points and progress update in real-time
- [ ] Locked benefits show unlock conditions
- [ ] Responsive design on all screen sizes

---

## 📊 Optional Advanced Features

### Future Enhancements (Nice to Have)
1. **GET /api/loyalty/leaderboard** - Show top members
2. **POST /api/loyalty/points/gift** - Gift points to friends
3. **GET /api/loyalty/challenges** - Special challenges for bonus points
4. **POST /api/loyalty/feedback** - User feedback on program
5. **GET /api/loyalty/notifications** - Membership-related notifications
6. **GET /api/loyalty/analytics** - User's shopping analytics
7. **POST /api/loyalty/preferences** - Update notification preferences

---

## 🚀 Implementation Priority

### Phase 1 (MVP - Essential)
1. GET /api/loyalty/tiers
2. GET /api/loyalty/config
3. GET /api/loyalty/user/status
4. POST /api/loyalty/join

### Phase 2 (Core Features)
5. GET /api/loyalty/rewards
6. POST /api/loyalty/rewards/claim
7. GET /api/loyalty/benefits/:tierId

### Phase 3 (Enhanced Features)
8. GET /api/loyalty/points/history
9. GET /api/loyalty/upgrade/eligibility
10. GET /api/loyalty/referral

---

## 📝 Notes for Backend Team

1. **Points Calculation**: Ensure points are automatically awarded after order completion
2. **Tier Evaluation**: Run nightly job to check and upgrade user tiers
3. **Image Optimization**: Use CDN for all images, serve WebP format
4. **Caching**: Cache tier configuration and program config (rarely changes)
5. **Real-time Updates**: Consider WebSocket for real-time points updates
6. **Localization**: Support multiple languages for tier names and descriptions
7. **Currency Support**: Handle multiple currencies for spend thresholds
8. **Analytics**: Track engagement metrics (views, joins, claims)
9. **A/B Testing**: Support different tier configurations for testing
10. **Security**: Prevent points manipulation and fraud

---

## 🔗 Related Documentation

- **User Authentication API**: Required for protected endpoints
- **Order API**: For calculating points on purchases
- **Coupon API**: For applying reward coupons at checkout
- **Push Notifications API**: For tier upgrade and reward notifications
- **Email Service**: For welcome emails and monthly summaries

---

**Document Version**: 1.0  
**Last Updated**: November 6, 2025  
**Created By**: GitHub Copilot  
**Status**: Ready for Backend Implementation
