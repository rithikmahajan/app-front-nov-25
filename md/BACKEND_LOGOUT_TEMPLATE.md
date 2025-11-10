# Backend Logout Implementation Template

## 🎯 Quick Implementation Guide

This is a **copy-paste ready** implementation for your backend to handle the logout flow.

---

## 📦 For Node.js + Express + MongoDB

### 1. Install Dependencies (if needed)
```bash
npm install jsonwebtoken express
```

### 2. Logout Route (`routes/auth.js`)

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Session = require('../models/Session'); // Your session model
const AuditLog = require('../models/AuditLog'); // Optional

// Middleware to verify JWT token (but be forgiving for logout)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    // For logout, we're forgiving - even invalid tokens can logout
    if (req.path === '/logout') {
      req.user = null;
      req.token = token;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
};

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { userId, timestamp, reason } = req.body;
    const userIdFromToken = req.user?.id || req.user?.uid || userId;
    
    console.log(`[LOGOUT] User: ${userIdFromToken}, Reason: ${reason || 'not specified'}, Time: ${timestamp || 'now'}`);
    
    // 1. Invalidate all sessions for this user
    if (userIdFromToken) {
      try {
        // Option A: Delete sessions from database
        const deletedCount = await Session.deleteMany({ userId: userIdFromToken });
        console.log(`[LOGOUT] Deleted ${deletedCount.deletedCount} sessions for user: ${userIdFromToken}`);
        
        // Option B: Mark sessions as inactive (if you want to keep history)
        // await Session.updateMany(
        //   { userId: userIdFromToken },
        //   { isActive: false, invalidatedAt: new Date() }
        // );
        
        // If using Redis for sessions
        // await redisClient.del(`session:${userIdFromToken}`);
        
      } catch (sessionError) {
        console.error('[LOGOUT] Session invalidation error:', sessionError);
        // Continue anyway - we still want to complete logout
      }
    }
    
    // 2. Add token to blacklist (if using JWT and want to blacklist)
    // This prevents the token from being reused before natural expiration
    if (req.token && userIdFromToken) {
      try {
        await TokenBlacklist.create({
          token: req.token,
          userId: userIdFromToken,
          invalidatedAt: new Date(),
          reason: reason || 'logout'
        });
      } catch (blacklistError) {
        console.error('[LOGOUT] Blacklist error:', blacklistError);
        // Non-critical - continue
      }
    }
    
    // 3. Log the logout event (for audit trail)
    if (AuditLog && userIdFromToken) {
      try {
        await AuditLog.create({
          userId: userIdFromToken,
          action: 'logout',
          reason: reason || 'user_initiated_logout',
          timestamp: timestamp || new Date().toISOString(),
          metadata: {
            userAgent: req.headers['user-agent'],
            ip: req.ip
          }
        });
      } catch (auditError) {
        console.error('[LOGOUT] Audit log error:', auditError);
        // Non-critical - continue
      }
    }
    
    // 4. Return success response
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
    
    console.log(`[LOGOUT] ✅ Logout completed for user: ${userIdFromToken}`);
    
  } catch (error) {
    console.error('[LOGOUT] ❌ Error during logout:', error);
    
    // Still return success - we want logout to always succeed
    // Local logout on frontend is more important than backend
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      warning: 'Some cleanup operations may have failed'
    });
  }
});

module.exports = router;
```

### 3. Session Model (`models/Session.js`)

```javascript
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  invalidatedAt: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Index for cleanup queries
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ isActive: 1, userId: 1 });

module.exports = mongoose.model('Session', sessionSchema);
```

### 4. Token Blacklist Model (`models/TokenBlacklist.js`) - Optional

```javascript
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  invalidatedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    default: 'logout'
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// TTL index - automatically remove after token would expire anyway
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
```

### 5. Audit Log Model (`models/AuditLog.js`) - Optional

```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'signup', 'password_reset', 'profile_update']
  },
  reason: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

// Index for queries
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

### 6. Middleware to Check Token Blacklist

```javascript
// middleware/checkBlacklist.js
const TokenBlacklist = require('../models/TokenBlacklist');

async function checkTokenBlacklist(req, res, next) {
  const token = req.token; // Set by authenticateToken middleware
  
  if (!token) {
    return next();
  }
  
  try {
    const blacklisted = await TokenBlacklist.findOne({ token });
    
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated'
      });
    }
    
    next();
  } catch (error) {
    console.error('[BLACKLIST] Check error:', error);
    // Don't block request on blacklist check failure
    next();
  }
}

module.exports = checkTokenBlacklist;
```

### 7. Session Cleanup Job (Optional but Recommended)

```javascript
// jobs/sessionCleanup.js
const cron = require('node-cron');
const Session = require('../models/Session');
const TokenBlacklist = require('../models/TokenBlacklist');

function startSessionCleanup() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CLEANUP] Starting session cleanup...');
    
    try {
      // Delete expired sessions
      const expiredSessions = await Session.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      // Delete inactive sessions older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const inactiveSessions = await Session.deleteMany({
        isActive: false,
        invalidatedAt: { $lt: sevenDaysAgo }
      });
      
      // Cleanup old blacklist entries (already handled by TTL index, but just in case)
      const expiredBlacklist = await TokenBlacklist.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`[CLEANUP] ✅ Removed ${expiredSessions.deletedCount} expired sessions`);
      console.log(`[CLEANUP] ✅ Removed ${inactiveSessions.deletedCount} inactive sessions`);
      console.log(`[CLEANUP] ✅ Removed ${expiredBlacklist.deletedCount} expired blacklist entries`);
      
    } catch (error) {
      console.error('[CLEANUP] ❌ Error:', error);
    }
  });
  
  console.log('[CLEANUP] Session cleanup job started (runs every hour)');
}

module.exports = startSessionCleanup;
```

### 8. Main App Setup (`app.js` or `server.js`)

```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const startSessionCleanup = require('./jobs/sessionCleanup');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start cleanup job
startSessionCleanup();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

---

## 📦 For Node.js + Express + PostgreSQL

### Database Schema

```sql
-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  invalidated_at TIMESTAMP,
  last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_is_active ON sessions(is_active, user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Token blacklist table (optional)
CREATE TABLE token_blacklist (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  invalidated_at TIMESTAMP DEFAULT NOW(),
  reason VARCHAR(100),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_blacklist_token ON token_blacklist(token);
CREATE INDEX idx_blacklist_expires_at ON token_blacklist(expires_at);

-- Audit logs table (optional)
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
```

### Logout Route (PostgreSQL version)

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post('/logout', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId, timestamp, reason } = req.body;
    const userIdFromToken = req.user?.id || userId;
    
    console.log(`[LOGOUT] User: ${userIdFromToken}, Reason: ${reason}`);
    
    await client.query('BEGIN');
    
    // 1. Delete sessions
    const deleteResult = await client.query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userIdFromToken]
    );
    console.log(`[LOGOUT] Deleted ${deleteResult.rowCount} sessions`);
    
    // 2. Add to blacklist (optional)
    if (req.token) {
      await client.query(
        'INSERT INTO token_blacklist (token, user_id, reason, expires_at) VALUES ($1, $2, $3, $4)',
        [req.token, userIdFromToken, reason || 'logout', new Date(Date.now() + 24 * 60 * 60 * 1000)]
      );
    }
    
    // 3. Log audit event
    await client.query(
      'INSERT INTO audit_logs (user_id, action, reason, timestamp) VALUES ($1, $2, $3, $4)',
      [userIdFromToken, 'logout', reason || 'user_initiated_logout', timestamp || new Date()]
    );
    
    await client.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[LOGOUT] Error:', error);
    
    // Still return success
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } finally {
    client.release();
  }
});
```

---

## 📦 For Python + Flask

```python
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from datetime import datetime
from models import db, Session, AuditLog, TokenBlacklist

auth_bp = Blueprint('auth', __name__)

# Middleware to verify token
def authenticate_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'No token provided'}), 401
        
        try:
            token = auth_header.split(' ')[1]  # Bearer TOKEN
            decoded = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            request.user = decoded
            request.token = token
        except jwt.InvalidTokenError:
            # For logout, be forgiving
            if request.path.endswith('/logout'):
                request.user = None
                request.token = token
            else:
                return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

@auth_bp.route('/logout', methods=['POST'])
@authenticate_token
def logout():
    try:
        data = request.get_json()
        user_id = request.user.get('id') if request.user else data.get('userId')
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        reason = data.get('reason', 'user_initiated_logout')
        
        print(f"[LOGOUT] User: {user_id}, Reason: {reason}")
        
        # 1. Delete sessions
        if user_id:
            deleted_count = Session.query.filter_by(user_id=user_id).delete()
            db.session.commit()
            print(f"[LOGOUT] Deleted {deleted_count} sessions")
        
        # 2. Add to blacklist (optional)
        if request.token and user_id:
            blacklist = TokenBlacklist(
                token=request.token,
                user_id=user_id,
                reason=reason
            )
            db.session.add(blacklist)
        
        # 3. Log audit event
        if user_id:
            audit = AuditLog(
                user_id=user_id,
                action='logout',
                reason=reason,
                timestamp=timestamp
            )
            db.session.add(audit)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User logged out successfully'
        }), 200
        
    except Exception as e:
        print(f"[LOGOUT] Error: {str(e)}")
        db.session.rollback()
        
        # Still return success
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
```

---

## 🧪 Test Your Implementation

```bash
# Save this as test-logout.sh
#!/bin/bash

BACKEND_URL="http://localhost:3000"

# 1. Login
echo "Logging in..."
LOGIN_RESP=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}')

TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"
echo ""

# 2. Logout
echo "Logging out..."
LOGOUT_RESP=$(curl -s -X POST "$BACKEND_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","timestamp":"2024-10-12T10:30:00.000Z","reason":"user_initiated_logout"}')

if [[ $LOGOUT_RESP == *"success\":true"* ]]; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
  echo "Response: $LOGOUT_RESP"
  exit 1
fi
echo ""

# 3. Verify token is invalidated
echo "Verifying token is invalidated..."
VERIFY_RESP=$(curl -s -w "%{http_code}" -X GET "$BACKEND_URL/api/user/profile" \
  -H "Authorization: Bearer $TOKEN")

if [[ $VERIFY_RESP == *"401"* ]]; then
  echo "✅ Token invalidated"
else
  echo "❌ Token still works!"
  exit 1
fi

echo ""
echo "🎉 All tests passed!"
```

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Endpoint `/api/auth/logout` responds
- [ ] Returns 401 without token
- [ ] Returns 200 with valid token
- [ ] Sessions are deleted/invalidated
- [ ] Token can't be reused after logout
- [ ] Audit logs are created
- [ ] Frontend integration works
- [ ] Error handling is graceful

---

## 🎯 Summary

**Minimum Required:**
1. ✅ Logout endpoint that accepts Bearer token
2. ✅ Invalidates/deletes user sessions
3. ✅ Returns `{ success: true }`

**Recommended:**
4. ✅ Logs audit events
5. ✅ Handles invalid tokens gracefully
6. ✅ Background cleanup job

**Your backend is ready when all tests pass!** 🚀
