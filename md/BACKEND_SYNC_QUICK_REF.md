# Backend Sync Quick Reference Card

## 🚦 Quick Status Check (30 seconds)

### 1. Does your backend have this endpoint?
```bash
curl -X POST http://your-backend/api/auth/logout -v
```
- ✅ Returns 401 (needs auth) = **GOOD**
- ❌ Returns 404 = **MISSING** - Need to implement

### 2. Can you logout with a valid token?
```bash
# First login to get token
TOKEN="your_token_here"

# Then logout
curl -X POST http://your-backend/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"user_initiated_logout"}'
```
- ✅ Returns `{"success":true}` = **GOOD**
- ❌ Returns error = **NOT WORKING**

### 3. Is the token invalidated after logout?
```bash
# Try using the same token
curl -X GET http://your-backend/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```
- ✅ Returns 401 Unauthorized = **GOOD** (token invalidated)
- ❌ Returns 200 OK = **BAD** (token still works!)

---

## 📋 Implementation Checklist

### Must Have (Critical):
- [ ] `POST /api/auth/logout` endpoint
- [ ] Accepts `Authorization: Bearer <token>` header
- [ ] Invalidates user session/token
- [ ] Returns `{ success: true }` on success

### Should Have (Important):
- [ ] Accepts request body: `{ userId, timestamp, reason }`
- [ ] Logs logout events for auditing
- [ ] Handles expired/invalid tokens gracefully
- [ ] Clears session from database/cache

### Nice to Have (Optional):
- [ ] Different handling for `reason: "state_sync"`
- [ ] Session cleanup background job
- [ ] Logout audit dashboard
- [ ] Metrics/monitoring

---

## 🔍 What Frontend Sends

### Request Format:
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userId": "firebase_uid_abc123",
  "timestamp": "2024-10-12T10:30:00.000Z",
  "reason": "user_initiated_logout"
}
```

### Possible Reasons:
- `"user_initiated_logout"` - User clicked "Sign Out"
- `"state_sync"` - Automatic state synchronization

---

## ✅ What Backend Should Do

### On Receiving Logout Request:

1. **Verify Token** (but be forgiving)
   ```javascript
   // Even if token is expired, allow logout
   try {
     const decoded = jwt.verify(token);
     userId = decoded.id;
   } catch {
     // Token invalid - still proceed with logout
   }
   ```

2. **Invalidate Session**
   ```javascript
   // Option 1: Delete from database
   await Session.deleteMany({ userId });
   
   // Option 2: Mark as inactive
   await Session.updateMany({ userId }, { isActive: false });
   
   // Option 3: Add to blacklist
   await TokenBlacklist.create({ userId });
   ```

3. **Log the Event**
   ```javascript
   await AuditLog.create({
     userId,
     action: 'logout',
     reason: req.body.reason,
     timestamp: req.body.timestamp
   });
   ```

4. **Return Success**
   ```javascript
   res.json({
     success: true,
     message: 'User logged out successfully'
   });
   ```

---

## 🧪 Test Commands

### Full Test Script (Copy & Paste):
```bash
#!/bin/bash
BACKEND_URL="http://localhost:3000"

echo "🧪 Testing Backend Logout Flow..."
echo ""

# 1. Login
echo "1️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"
echo ""

# 2. Test authenticated request
echo "2️⃣ Testing token works..."
PROFILE_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BACKEND_URL/api/user/profile" \
  -H "Authorization: Bearer $TOKEN")

if [[ $PROFILE_RESPONSE == *"200"* ]]; then
  echo "✅ Token is valid"
else
  echo "❌ Token doesn't work"
  exit 1
fi
echo ""

# 3. Logout
echo "3️⃣ Logging out..."
LOGOUT_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","timestamp":"2024-10-12T10:30:00.000Z","reason":"user_initiated_logout"}')

if [[ $LOGOUT_RESPONSE == *"200"* ]] && [[ $LOGOUT_RESPONSE == *"success"* ]]; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
  echo "Response: $LOGOUT_RESPONSE"
  exit 1
fi
echo ""

# 4. Verify token is invalidated
echo "4️⃣ Verifying token is invalidated..."
VERIFY_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BACKEND_URL/api/user/profile" \
  -H "Authorization: Bearer $TOKEN")

if [[ $VERIFY_RESPONSE == *"401"* ]]; then
  echo "✅ Token invalidated successfully"
else
  echo "❌ Token still works after logout!"
  exit 1
fi
echo ""

echo "🎉 All tests passed! Backend is in sync."
```

**Save as:** `test-backend-sync.sh`
**Run:** `chmod +x test-backend-sync.sh && ./test-backend-sync.sh`

---

## 📊 Frontend Logs to Look For

### ✅ Successful Backend Sync:
```
📤 Notifying backend of logout state...
✅ Backend notified of logout: { success: true, message: "..." }
```

### ⚠️ Backend Unavailable (but handled):
```
📤 Notifying backend of logout state...
⚠️ Backend logout notification failed: Network request failed
✅ All auth storage cleared  ← Still succeeds locally!
```

### 🔄 State Sync Working:
```
⚠️ Backend token exists but no Firebase user - syncing state...
🔄 Syncing logout state with backend...
✅ Backend logout state synced
```

---

## 🐛 Common Problems & Quick Fixes

### Problem: Endpoint returns 404
**Quick Fix:**
```javascript
// Add to your backend routes
router.post('/auth/logout', authenticateToken, async (req, res) => {
  await invalidateUserSession(req.user.id);
  res.json({ success: true, message: 'Logged out' });
});
```

### Problem: Token still works after logout
**Quick Fix:**
```javascript
// Ensure session is actually deleted
await Session.deleteMany({ userId: req.user.id });
// OR add to blacklist
await TokenBlacklist.create({ token: req.token });
```

### Problem: 401 on logout (can't logout)
**Quick Fix:**
```javascript
// Make logout forgiving
router.post('/auth/logout', async (req, res) => {
  // Don't require valid token - always allow logout
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    await invalidateUserSession(decoded.id);
  } catch (e) {
    // Token invalid - that's OK for logout
  }
  res.json({ success: true });
});
```

---

## 📈 Monitoring (Optional but Recommended)

### Simple Log Monitoring:
```bash
# Watch backend logs for logout events
tail -f backend.log | grep "logout"

# Expected to see:
[INFO] POST /api/auth/logout
[INFO] Session invalidated for user: xxx
[INFO] Response: 200 OK
```

### Database Check:
```sql
-- Check active sessions
SELECT COUNT(*) FROM sessions WHERE is_active = true;

-- Check recent logouts
SELECT * FROM audit_logs 
WHERE action = 'logout' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ Final Verification (3 Steps)

### Step 1: Backend Test
```bash
./test-backend-sync.sh
# Should show: 🎉 All tests passed!
```

### Step 2: Frontend Test
1. Login to app
2. Click "Sign Out"
3. Check logs show: `✅ Backend notified of logout`

### Step 3: Integration Test
1. Login to app
2. Check backend receives login
3. Click "Sign Out"
4. Check backend receives logout
5. Verify session deleted/invalidated

---

## 🎯 Summary

**Your backend is in sync if:**

| Test | Expected Result | Status |
|------|----------------|---------|
| Endpoint exists | Returns 401 without token | ☐ |
| Logout with token | Returns 200 + success: true | ☐ |
| Token invalidated | Returns 401 on next use | ☐ |
| Audit log | Logout event recorded | ☐ |
| Frontend integration | Logs show backend notified | ☐ |

**All checked?** ✅ **You're good to go!**

---

## 📞 Need Help?

1. ✅ Run `test-backend-sync.sh` first
2. ✅ Check backend logs for errors
3. ✅ Verify database session is deleted
4. ✅ Test with Postman/curl manually
5. ✅ Review `BACKEND_SYNC_VERIFICATION_GUIDE.md` for details

**Remember:** Frontend handles backend failures gracefully, but ideally backend should always be in sync! 🎯
