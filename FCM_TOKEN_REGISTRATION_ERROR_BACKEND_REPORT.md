# 🚨 FCM Token Registration Error - Backend Investigation Required

**Date:** November 24, 2025  
**Priority:** HIGH  
**Status:** Backend User Lookup Failure  
**Error Code:** 404 - User Not Found

---

## 📋 Executive Summary

The FCM (Firebase Cloud Messaging) token registration is **failing consistently** with a `404 User not found` error, despite:
- ✅ User successfully authenticating via Apple Sign-In
- ✅ Valid JWT token being generated and used
- ✅ User ID being correctly decoded from the token
- ✅ User completing the full authentication flow

**Root Cause:** Backend database query is failing to find the user by their MongoDB `_id` even though the ID is present in the JWT token payload.

---

## 🔍 Error Details

### Frontend Error
```
RN Error: ❌ Error registering FCM token with backend: 
AxiosError: Request failed with status code 404
```

**Call Stack:**
- `fcmService.js:212` - FCM token registration attempt
- `appleAuthService.js:304` - Warning: FCM registration failed (non-critical): User not found

### Backend Error (from nodemon logs)
```
📱 FCM Token Update Request - User: 68dae3fd47054fe75c651493, Platform: ios
❌ User not found: 68dae3fd47054fe75c651493
POST /api/users/update-fcm-token 404 8.239 ms - 44
```

---

## 🔐 Authentication Flow Analysis

### 1. **JWT Token Payload (Successfully Decoded)**
```javascript
{
  _id: '68dae3fd47054fe75c651493',        // ⚠️ This ID should exist in DB
  firebaseUid: 'QvABW0kxruOvHTSIIFHbawTm9Kg2',
  email: 'rithikmahajan27@gmail.com',
  name: 'Rithik Mahajan',
  phNo: '8717000084',
  isVerified: true,
  isEmailVerified: true,
  isPhoneVerified: false,
  isProfile: true,
  authProvider: 'apple',
  iat: 1763961840,
  exp: 1766553840
}
```

### 2. **User Authentication Status**
- ✅ Apple Sign-In: **SUCCESS**
- ✅ Firebase Authentication: **SUCCESS**
- ✅ JWT Token Generation: **SUCCESS**
- ✅ Token Verification: **SUCCESS**
- ✅ Cart Transfer: **SUCCESS** (0 items)
- ✅ Wishlist Transfer: **SUCCESS** (0 items)
- ❌ FCM Token Registration: **FAILED** (404)

### 3. **API Calls Timeline**
```
1. [05:24:00.174Z] POST /api/users/update-fcm-token
   - Token decoded successfully
   - User ID extracted: 68dae3fd47054fe75c651493
   - Database lookup: FAILED ❌
   - Response: 404 User not found
```

---

## 🎯 Critical Questions for Backend Team

### 1. **Database Query Issue**
**Question:** Why is the user lookup failing for ID `68dae3fd47054fe75c651493`?

**Possible Scenarios:**
- [ ] User doesn't exist in the database (but then how was JWT generated?)
- [ ] Wrong database connection/collection being queried
- [ ] ObjectId format mismatch (string vs ObjectId)
- [ ] User document was deleted but JWT is still valid
- [ ] Database replication lag

**Required Investigation:**
```javascript
// Backend team should verify:
1. Does this user exist in the database?
   db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493") })

2. Is the user being queried from the correct collection?

3. Are there any soft-delete flags that might be filtering out the user?

4. Is the JWT signing service using a different user service than the FCM update endpoint?
```

### 2. **Endpoint Implementation**
**Question:** What is the exact implementation of `/api/users/update-fcm-token`?

**Expected Implementation:**
```javascript
// Should look something like:
const userId = req.user._id; // From decoded JWT
const user = await User.findById(userId); // ⚠️ This is failing

if (!user) {
  return res.status(404).json({ message: 'User not found' });
}
```

**Required Information:**
- How is the user ID being extracted from the JWT?
- What database query is being used?
- Is there any middleware that might be modifying the request?

### 3. **JWT Generation vs Lookup Mismatch**
**Question:** Are different user services being used for:
- JWT generation (login/signup)
- FCM token update endpoint

**Evidence of Discrepancy:**
- User authenticates successfully (JWT created)
- Same user ID can't be found moments later
- Other endpoints work (cart/wishlist transfer) ✅

---

## 📤 Frontend Request Details

### Request Configuration
```javascript
// From fcmService.js:177-195
POST /api/users/update-fcm-token
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
}
Body: {
  fcmToken: 'dV8etFdpqkIbtR61Gue6...',
  platform: 'ios'
}
```

### JWT Token Details
- **Format:** Bearer token
- **Algorithm:** HS256
- **User ID in Payload:** `68dae3fd47054fe75c651493`
- **Expiration:** Valid (exp: 1766553840)
- **Issued At:** 1763961840

---

## ✅ Working API Endpoints (for comparison)

These endpoints work successfully with the **same JWT token**:

### 1. Cart Transfer
```
POST /api/cart/transfer - SUCCESS ✅
```

### 2. Wishlist Transfer
```
POST /api/wishlist/transfer - SUCCESS ✅
```

### 3. Get Cart
```
GET /api/cart/user - SUCCESS ✅
```

### 4. Get Wishlist
```
GET /api/wishlist/?page=1&limit=10 - SUCCESS ✅
```

**Question:** Why do these endpoints find the user but FCM endpoint doesn't?

---

## 🔧 Backend Action Items

### Immediate Actions Required

1. **Verify User Existence**
   ```bash
   # Connect to MongoDB and check:
   db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493") })
   
   # Also check by Firebase UID:
   db.users.findOne({ firebaseUid: "QvABW0kxruOvHTSIIFHbawTm9Kg2" })
   ```

2. **Review FCM Update Endpoint Code**
   - Share the implementation of `/api/users/update-fcm-token`
   - Check how user ID is being extracted and used
   - Verify database query logic

3. **Compare with Working Endpoints**
   - How does `/api/cart/transfer` find the user?
   - How does `/api/wishlist/transfer` find the user?
   - Why do they work but FCM endpoint doesn't?

4. **Check Middleware Chain**
   - Is there authentication middleware that's different for FCM endpoint?
   - Are there any filters/conditions that might exclude this user?

5. **Database Connection Verification**
   - Is the FCM endpoint using the correct database connection?
   - Check for any database switching logic

### Investigation Queries

```javascript
// 1. Find user by _id
db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493") })

// 2. Find user by firebaseUid
db.users.findOne({ firebaseUid: "QvABW0kxruOvHTSIIFHbawTm9Kg2" })

// 3. Find user by email
db.users.findOne({ email: "rithikmahajan27@gmail.com" })

// 4. Check all users with this name
db.users.find({ name: "Rithik Mahajan" })

// 5. Check if user was soft-deleted
db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493"), deleted: { $exists: true } })
```

---

## 🐛 Potential Root Causes (Ranked by Likelihood)

### 1. **ObjectId Conversion Issue** (Most Likely)
```javascript
// Wrong:
const user = await User.findOne({ _id: req.user._id }); // _id is string

// Correct:
const user = await User.findOne({ _id: new ObjectId(req.user._id) });
```

### 2. **Different User Model/Collection**
- FCM endpoint using wrong User model
- Different database being queried

### 3. **Middleware Authentication Issue**
- JWT decoded differently in FCM endpoint
- User ID not properly extracted

### 4. **Soft Delete Flag**
- User has `deleted: true` or similar flag
- FCM endpoint filtering out "deleted" users
- But other endpoints (cart/wishlist) ignore this flag

### 5. **Database Replication Lag**
- User created very recently
- Read replica hasn't synced yet
- But this is unlikely given the time gap

---

## 📊 Success Metrics for Fix

After backend fix is deployed, we should see:

- ✅ `POST /api/users/update-fcm-token` returns `200 OK`
- ✅ Frontend console shows: `✅ FCM token registered with backend`
- ✅ No more `404 User not found` errors
- ✅ FCM token stored in user document
- ✅ Push notifications can be sent to user

---

## 🔄 Temporary Workaround (Frontend)

Currently implemented in `appleAuthService.js`:
```javascript
// FCM registration is non-critical - don't block authentication
if (registerResult.success) {
  console.log('✅ FCM token registered with backend');
} else {
  console.warn('⚠️ FCM registration failed (non-critical):', registerResult.error);
  // Don't throw - user can still use the app
}
```

**Impact:** Users can authenticate and use the app, but:
- ❌ Won't receive push notifications
- ❌ FCM token not saved in backend
- ❌ Marketing/engagement features affected

---

## 📝 Additional Context

### User Details
- **Name:** Rithik Mahajan
- **Email:** rithikmahajan27@gmail.com
- **Phone:** 8717000084
- **Auth Provider:** Apple
- **Firebase UID:** QvABW0kxruOvHTSIIFHbawTm9Kg2
- **MongoDB _id:** 68dae3fd47054fe75c651493
- **Platform:** iOS
- **FCM Token:** dV8etFdpqkIbtR61Gue6... (truncated)

### Environment
- **Backend URL:** (appears to be local/staging)
- **Request Origin:** No origin (mobile app)
- **CORS:** Allowed for mobile/Postman
- **Response Time:** ~8-220ms (fast queries, rules out timeout)

---

## 🎬 Next Steps

1. **Backend Team:** Review this document and investigate the database query issue
2. **Backend Team:** Provide the implementation of `/api/users/update-fcm-token` endpoint
3. **Backend Team:** Compare with working endpoints (cart/wishlist) to identify discrepancy
4. **Backend Team:** Run the investigation queries provided above
5. **Frontend Team:** Wait for backend fix before removing workaround
6. **QA Team:** Test FCM token registration after backend deployment

---

## 📞 Contact Information

**Frontend Reporter:** Rithik Mahajan  
**Error First Occurred:** November 24, 2025, 05:24:00 GMT  
**Frequency:** 100% (every login attempt)  
**Affected Users:** All users attempting Apple Sign-In (potentially all auth methods)

---

**⚠️ CRITICAL:** This issue affects push notification functionality for all users. While not blocking authentication, it significantly impacts user engagement and app functionality. Please prioritize investigation and fix.
