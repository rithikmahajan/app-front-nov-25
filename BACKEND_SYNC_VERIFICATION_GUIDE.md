# Backend Sync Verification Guide

## 🎯 Purpose

This guide helps you verify that your backend is properly synchronized with the frontend logout flow and handles all authentication state changes correctly.

## 📋 Quick Checklist

- [ ] Backend has `/api/auth/logout` endpoint
- [ ] Endpoint accepts Bearer token authentication
- [ ] Endpoint processes logout request body
- [ ] Backend invalidates user sessions on logout
- [ ] Backend returns proper success/error responses
- [ ] Backend logs logout events for auditing
- [ ] Backend handles expired/invalid tokens gracefully
- [ ] Backend cleans up user session data

---

## 🔍 Backend Endpoint Verification

### 1. Check Logout Endpoint Exists

**Method 1: Using curl**
```bash
curl -X POST http://your-backend-url/api/auth/logout \
  -H "Content-Type: application/json" \
  -v

# Expected: 401 Unauthorized (no token provided)
# This confirms the endpoint exists and requires authentication
```

**Method 2: Using Postman/Insomnia**
```
POST http://your-backend-url/api/auth/logout
Headers:
  Content-Type: application/json

Expected Response: 401 Unauthorized
```

✅ **Pass Criteria:** Endpoint exists and returns 401 without token

---

### 2. Test Logout with Valid Token

**Step 1: Get a valid token**
```bash
# Login first to get a token
curl -X POST http://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword"
  }'

# Copy the token from response
# Response should look like:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { ... }
# }
```

**Step 2: Test logout with token**
```bash
curl -X POST http://your-backend-url/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "test_user_id",
    "timestamp": "2024-10-12T10:30:00.000Z",
    "reason": "user_initiated_logout"
  }' \
  -v

# Expected Response:
# Status: 200 OK
# {
#   "success": true,
#   "message": "User logged out successfully"
# }
```

✅ **Pass Criteria:** 
- Returns 200 OK
- Returns success: true
- Session is invalidated

---

### 3. Verify Session Invalidation

**Test that the token can't be used after logout:**

```bash
# After logout, try to use the same token for an authenticated request
curl -X GET http://your-backend-url/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v

# Expected Response:
# Status: 401 Unauthorized
# {
#   "success": false,
#   "message": "Invalid or expired token"
# }
```

✅ **Pass Criteria:** Previously valid token is now rejected

---

### 4. Test State Sync Logout

**Simulate state synchronization:**

```bash
curl -X POST http://your-backend-url/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "reason": "state_sync",
    "timestamp": "2024-10-12T10:30:00.000Z"
  }' \
  -v

# Expected Response:
# Status: 200 OK
# {
#   "success": true,
#   "message": "User logged out successfully"
# }
```

✅ **Pass Criteria:** Handles state_sync reason correctly

---

### 5. Test Invalid Token Handling

**Test logout with invalid token:**

```bash
curl -X POST http://your-backend-url/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_12345" \
  -d '{
    "reason": "user_initiated_logout"
  }' \
  -v

# Expected Response:
# Status: 401 Unauthorized
# {
#   "success": false,
#   "message": "Invalid or expired token"
# }
```

✅ **Pass Criteria:** Returns 401 for invalid tokens (frontend handles this gracefully)

---

## 🔄 Integration Testing with Frontend

### Test 1: End-to-End Logout Flow

**Setup:**
1. Start your backend server
2. Start your React Native app
3. Enable network logging on backend

**Steps:**
1. Login to the app (email/phone/Apple/Google)
2. Monitor backend logs
3. Click "Sign Out" in the app
4. Check backend received logout request

**Backend Should Log:**
```
[INFO] POST /api/auth/logout
[INFO] User ID: firebase_uid_xxxxx
[INFO] Logout reason: user_initiated_logout
[INFO] Session invalidated for user: firebase_uid_xxxxx
[INFO] Response: 200 OK
```

**Frontend Should Log:**
```
🔐 Starting complete logout process...
📤 Notifying backend of logout state...
✅ Backend notified of logout: { success: true, message: "User logged out successfully" }
✅ All auth storage cleared
✅ Complete logout process finished - backend notified, local state cleared
```

✅ **Pass Criteria:** Backend receives request and invalidates session

---

### Test 2: Logout with Backend Unavailable

**Setup:**
1. Login to the app
2. **Stop your backend server**
3. Click "Sign Out"

**Frontend Should:**
- ⚠️ Show warning: `Backend logout notification failed`
- ✅ Still complete local logout
- ✅ Clear all local tokens
- ✅ Navigate to Rewards screen

**Expected Frontend Logs:**
```
📤 Notifying backend of logout state...
⚠️ Backend logout notification failed: Network request failed
✅ All auth storage cleared
✅ Auth storage service cleared
✅ New guest session initialized for logged-out state
```

**Recovery Test:**
1. Restart backend
2. Restart app
3. Should initialize in guest mode (no errors)

✅ **Pass Criteria:** Logout succeeds locally even when backend is down

---

### Test 3: State Synchronization

**Setup:**
1. Login to the app
2. Monitor backend logs
3. Simulate state mismatch:
   - Manually clear Firebase auth (not recommended in production)
   - Keep backend token in AsyncStorage
4. Restart app

**Backend Should Log:**
```
[INFO] POST /api/auth/logout
[INFO] Logout reason: state_sync
[INFO] Session invalidated for user
[INFO] Response: 200 OK
```

**Frontend Should Log:**
```
⚠️ Backend token exists but no Firebase user - syncing state...
🔄 Syncing logout state with backend...
✅ Backend logout state synced
✅ Local auth state cleared
```

✅ **Pass Criteria:** Backend receives sync request and clears session

---

## 🗄️ Backend Database Verification

### Check User Session Table

**Before Logout:**
```sql
-- Example for SQL databases
SELECT * FROM user_sessions WHERE user_id = 'test_user_id';

-- Expected: Active session record exists
-- session_id: abc123
-- user_id: test_user_id
-- token: eyJhbGc...
-- expires_at: 2024-10-13T10:30:00.000Z
-- is_active: true
```

**After Logout:**
```sql
SELECT * FROM user_sessions WHERE user_id = 'test_user_id';

-- Expected: Session is invalidated
-- Option 1: Record deleted
-- Option 2: is_active: false
-- Option 3: expires_at updated to past time
```

✅ **Pass Criteria:** Session no longer active in database

---

### Check Logout Audit Log

**If you have audit logging:**
```sql
SELECT * FROM audit_logs 
WHERE user_id = 'test_user_id' 
  AND action = 'logout' 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected fields:
-- user_id: test_user_id
-- action: logout
-- reason: user_initiated_logout
-- timestamp: 2024-10-12T10:30:00.000Z
-- ip_address: (if tracked)
-- created_at: 2024-10-12T10:30:00.000Z
```

✅ **Pass Criteria:** Logout events are properly logged

---

## 🔐 Backend Implementation Checklist

### Required Backend Code Components

#### ✅ 1. Logout Route Handler

**Express.js Example:**
```javascript
// routes/auth.js
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { userId, timestamp, reason } = req.body;
    const userIdFromToken = req.user.id; // From JWT middleware
    
    console.log(`[LOGOUT] User: ${userIdFromToken}, Reason: ${reason}, Timestamp: ${timestamp}`);
    
    // Invalidate session
    await invalidateUserSession(userIdFromToken);
    
    // Log the logout event
    await logAuditEvent({
      userId: userIdFromToken,
      action: 'logout',
      reason: reason || 'user_initiated_logout',
      timestamp: timestamp || new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});
```

#### ✅ 2. Session Invalidation Logic

```javascript
// services/sessionService.js
async function invalidateUserSession(userId) {
  // Option 1: Delete session from database
  await Session.deleteMany({ userId: userId });
  
  // Option 2: Mark as inactive
  await Session.updateMany(
    { userId: userId },
    { isActive: false, invalidatedAt: new Date() }
  );
  
  // Option 3: Add token to blacklist (if using JWT)
  await TokenBlacklist.create({
    userId: userId,
    invalidatedAt: new Date()
  });
  
  // Clear any Redis/cache sessions
  await redisClient.del(`session:${userId}`);
  
  console.log(`[SESSION] Invalidated all sessions for user: ${userId}`);
}
```

#### ✅ 3. Token Authentication Middleware

```javascript
// middleware/auth.js
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted (after logout)
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}
```

#### ✅ 4. Audit Logging

```javascript
// services/auditService.js
async function logAuditEvent({ userId, action, reason, timestamp }) {
  try {
    await AuditLog.create({
      userId: userId,
      action: action,
      reason: reason,
      timestamp: timestamp,
      createdAt: new Date()
    });
    
    console.log(`[AUDIT] Logged ${action} for user: ${userId}`);
  } catch (error) {
    console.error('[AUDIT ERROR]', error);
    // Don't throw - audit logging should not break the main flow
  }
}
```

---

## 🧪 Backend API Testing Script

### Automated Test Script (Node.js)

```javascript
// test-backend-logout.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

async function testBackendLogoutFlow() {
  console.log('🧪 Starting Backend Logout Flow Tests...\n');
  
  try {
    // Test 1: Login
    console.log('📝 Test 1: Login to get token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful, token received\n');
    
    // Test 2: Verify token works
    console.log('📝 Test 2: Verify token works...');
    const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Token is valid, profile fetched\n');
    
    // Test 3: Logout
    console.log('📝 Test 3: Logout with valid token...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {
      userId: profileResponse.data.user._id,
      timestamp: new Date().toISOString(),
      reason: 'user_initiated_logout'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (logoutResponse.data.success) {
      console.log('✅ Logout successful\n');
    } else {
      console.log('❌ Logout failed:', logoutResponse.data.message, '\n');
    }
    
    // Test 4: Verify token is invalidated
    console.log('📝 Test 4: Verify token is invalidated...');
    try {
      await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Token still works after logout (FAIL)\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token invalidated successfully\n');
      } else {
        console.log('❌ Unexpected error:', error.message, '\n');
      }
    }
    
    // Test 5: Logout with invalid token
    console.log('📝 Test 5: Logout with invalid token...');
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {
        reason: 'test'
      }, {
        headers: { Authorization: 'Bearer invalid_token_12345' }
      });
      console.log('❌ Invalid token accepted (FAIL)\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token rejected correctly\n');
      } else {
        console.log('❌ Unexpected error:', error.message, '\n');
      }
    }
    
    console.log('🎉 All tests completed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testBackendLogoutFlow();
```

**To run:**
```bash
npm install axios
node test-backend-logout.js
```

**Expected Output:**
```
🧪 Starting Backend Logout Flow Tests...

📝 Test 1: Login to get token...
✅ Login successful, token received

📝 Test 2: Verify token works...
✅ Token is valid, profile fetched

📝 Test 3: Logout with valid token...
✅ Logout successful

📝 Test 4: Verify token is invalidated...
✅ Token invalidated successfully

📝 Test 5: Logout with invalid token...
✅ Invalid token rejected correctly

🎉 All tests completed!
```

---

## 📊 Backend Monitoring & Health Checks

### Key Metrics to Monitor

1. **Logout Request Rate**
   ```
   Endpoint: POST /api/auth/logout
   Metric: Requests per minute
   Alert: Unusual spike (might indicate mass logout issue)
   ```

2. **Logout Success Rate**
   ```
   Calculation: (Successful logouts / Total logout attempts) * 100
   Expected: > 95%
   Alert: < 90%
   ```

3. **Session Invalidation Time**
   ```
   Metric: Time from logout request to session invalidation
   Expected: < 100ms
   Alert: > 500ms
   ```

4. **Token Validation After Logout**
   ```
   Test: Use invalidated token for authenticated request
   Expected: Always 401
   Alert: Any 200 responses
   ```

### Health Check Endpoint

```javascript
// routes/health.js
router.get('/health/auth', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    // Check session storage
    const sessionStatus = await checkSessionStorage();
    
    // Check token blacklist
    const blacklistStatus = await checkTokenBlacklist();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        sessions: sessionStatus,
        tokenBlacklist: blacklistStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Token Still Works After Logout

**Symptoms:**
- User logs out
- Token still accepted for API calls

**Possible Causes:**
1. Session not invalidated in database
2. Token not added to blacklist
3. Cache not cleared

**Solution:**
```javascript
// Ensure all session invalidation steps are completed
async function invalidateUserSession(userId) {
  // 1. Database
  await Session.deleteMany({ userId });
  
  // 2. Cache
  await redisClient.del(`session:${userId}`);
  
  // 3. Blacklist (if using JWT)
  await TokenBlacklist.create({ userId, invalidatedAt: new Date() });
  
  console.log(`✅ All sessions invalidated for user: ${userId}`);
}
```

### Issue 2: 401 Error on Logout Request

**Symptoms:**
- Logout request returns 401
- User can't log out

**Possible Causes:**
1. Token expired before logout
2. Token malformed
3. Authentication middleware issue

**Solution:**
```javascript
// Make logout endpoint more forgiving
router.post('/logout', async (req, res) => {
  try {
    // Try to authenticate, but don't fail if token is invalid
    const token = req.headers['authorization']?.split(' ')[1];
    
    let userId = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      // Token invalid/expired - still allow logout
      console.log('[LOGOUT] Invalid token, proceeding with logout anyway');
    }
    
    // Invalidate session even with invalid token
    if (userId) {
      await invalidateUserSession(userId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    // Still return success for logout
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }
});
```

### Issue 3: Orphaned Sessions in Database

**Symptoms:**
- Database has many old active sessions
- Sessions not cleaned up after logout

**Solution:**
```javascript
// Add session cleanup job
const cron = require('node-cron');

// Run cleanup every hour
cron.schedule('0 * * * *', async () => {
  console.log('[CLEANUP] Starting session cleanup...');
  
  // Delete expired sessions
  const result = await Session.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  // Delete invalidated sessions older than 7 days
  await Session.deleteMany({
    isActive: false,
    invalidatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  console.log(`[CLEANUP] Removed ${result.deletedCount} expired sessions`);
});
```

---

## ✅ Final Verification Checklist

### Backend Implementation
- [ ] `/api/auth/logout` endpoint exists
- [ ] Accepts Bearer token authentication
- [ ] Processes request body (userId, timestamp, reason)
- [ ] Invalidates user sessions
- [ ] Clears session from database
- [ ] Clears session from cache (Redis, etc.)
- [ ] Adds token to blacklist (if using JWT)
- [ ] Logs audit event
- [ ] Returns proper response (200 OK with success: true)
- [ ] Handles invalid tokens gracefully

### Integration Tests
- [ ] End-to-end logout works
- [ ] Backend receives logout requests
- [ ] Sessions are invalidated
- [ ] Tokens can't be used after logout
- [ ] Frontend handles backend failures
- [ ] State sync works correctly

### Database Verification
- [ ] Sessions removed/invalidated after logout
- [ ] Audit logs capture logout events
- [ ] No orphaned sessions
- [ ] Cleanup jobs running

### Monitoring
- [ ] Logout requests logged
- [ ] Success/failure rates tracked
- [ ] Health checks passing
- [ ] Alerts configured

---

## 🎯 Success Criteria

Your backend is **fully synchronized** when:

✅ **All logout requests are processed**
✅ **Sessions are invalidated immediately**
✅ **Tokens can't be reused after logout**
✅ **Audit logs show all logout events**
✅ **State sync requests work**
✅ **Frontend and backend states match**
✅ **No orphaned sessions in database**
✅ **Error handling is graceful**

---

## 📞 Support

If you encounter issues:

1. Check backend logs for errors
2. Verify database session status
3. Test with provided scripts
4. Review common issues section
5. Monitor health check endpoint

**Remember:** The frontend is designed to handle backend failures gracefully, so users can always log out locally even if backend is unavailable!
