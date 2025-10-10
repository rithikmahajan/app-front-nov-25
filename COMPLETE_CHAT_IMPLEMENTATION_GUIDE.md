# Complete Real-Time Chat Support Implementation Guide

## Overview

This document provides a comprehensive implementation guide for the real-time chat support system in the Yoraa mobile application. The chat system enables users to communicate with customer support representatives in real-time, maintains complete session records, and includes a rating system for feedback collection.

**Important**: This implementation does NOT include voice chat functionality - it is text-based messaging only.

**Authentication Requirement**: As of October 6, 2025, chat functionality has been restricted to authenticated users only. Guest users cannot initiate chat sessions and must sign in to access customer support chat.

## System Architecture

### Frontend Components (Already Implemented)
- **ContactUsScreen**: Main UI component with modal and full-screen chat interfaces
- **ChatService**: Real-time messaging service with session lifecycle management
- **YoraaAPI**: Backend API integration layer with authentication handling

### Backend Requirements (To Be Implemented)
- RESTful API endpoints for chat functionality
- Database schema for session and message storage
- Real-time message delivery system (HTTP polling based)
- Admin dashboard for support representatives

## Complete API Specification

### 1. Create Chat Session
**Endpoint**: `POST /api/chat/session`
**Authentication**: Required (Firebase JWT token mandatory - guest users no longer supported)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {firebase_jwt_token} (REQUIRED - no longer optional)
```

**Request Body**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "userInfo": {
    "isGuest": false,
    "userId": "firebase_user_id_12345",
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "startTime": "2025-12-06T15:30:00.000Z",
  "status": "active"
}
```

**Note**: Guest user sessions are no longer supported. All requests must include valid authentication.

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "chat_1733514600000_abc123def",
    "status": "active",
    "createdAt": "2025-12-06T15:30:00.000Z",
    "estimatedWaitTime": 120
  },
  "message": "Chat session created successfully"
}
```

**Error Response (400/500)**:
```json
{
  "success": false,
  "error": {
    "code": "SESSION_CREATION_FAILED",
    "message": "Failed to create chat session"
  },
  "timestamp": "2025-12-06T15:30:00.000Z"
}
```

### 2. Send Chat Message
**Endpoint**: `POST /api/chat/message`
**Authentication**: Not required for active sessions

**Request Body**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "messageId": "msg_1733514660000_user789",
  "message": "Hello, I need help with my order #ORD12345",
  "sender": "user",
  "timestamp": "2025-12-06T15:31:00.000Z"
}
```

**Admin Message Request**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "messageId": "msg_1733514720000_admin123",
  "message": "Hello! I'd be happy to help you with your order. Let me look that up for you.",
  "sender": "admin",
  "timestamp": "2025-12-06T15:32:00.000Z",
  "adminId": "admin_user_12345"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_1733514660000_user789",
    "status": "sent",
    "timestamp": "2025-12-06T15:31:00.000Z",
    "deliveredAt": "2025-12-06T15:31:01.000Z"
  },
  "message": "Message sent successfully"
}
```

### 3. Poll for New Messages
**Endpoint**: `GET /api/chat/poll/{sessionId}?after={lastMessageId}&limit={number}`
**Authentication**: Not required for active sessions

**Parameters**:
- `sessionId`: Chat session identifier
- `after`: Last message ID received (optional)
- `limit`: Maximum messages to return (default: 50, max: 100)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_1733514720000_admin123",
        "message": "Hello! I'd be happy to help you with your order. Let me look that up for you.",
        "sender": "admin",
        "timestamp": "2025-12-06T15:32:00.000Z",
        "adminInfo": {
          "name": "Sarah",
          "department": "Customer Service"
        }
      },
      {
        "messageId": "msg_1733514780000_admin124",
        "message": "I can see your order #ORD12345 was shipped yesterday. Here's the tracking number: TRK789456123",
        "sender": "admin",
        "timestamp": "2025-12-06T15:33:00.000Z",
        "adminInfo": {
          "name": "Sarah",
          "department": "Customer Service"
        }
      }
    ],
    "sessionEnded": false,
    "sessionStatus": "active",
    "hasMoreMessages": false
  },
  "message": "Messages retrieved successfully"
}
```

**Session Ended Response**:
```json
{
  "success": true,
  "data": {
    "messages": [],
    "sessionEnded": true,
    "sessionStatus": "ended_by_admin",
    "endReason": "Issue resolved",
    "hasMoreMessages": false
  },
  "message": "Session has been ended"
}
```

### 4. Get Chat Messages (History)
**Endpoint**: `GET /api/chat/messages/{sessionId}?page={number}&limit={number}`

**Parameters**:
- `sessionId`: Chat session identifier
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50, max: 100)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_1733514660000_user789",
        "message": "Hello, I need help with my order #ORD12345",
        "sender": "user",
        "timestamp": "2025-12-06T15:31:00.000Z"
      },
      {
        "messageId": "msg_1733514720000_admin123",
        "message": "Hello! I'd be happy to help you with your order.",
        "sender": "admin",
        "timestamp": "2025-12-06T15:32:00.000Z",
        "adminInfo": {
          "name": "Sarah",
          "department": "Customer Service"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 2,
      "hasNext": false,
      "hasPrevious": false
    }
  },
  "message": "Messages retrieved successfully"
}
```

### 5. End Chat Session
**Endpoint**: `POST /api/chat/session/end`
**Authentication**: Not required for active sessions

**User Ending Session**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "endTime": "2025-12-06T15:45:00.000Z",
  "status": "ended_by_user",
  "userId": "firebase_user_id_12345"
}
```

**Admin Ending Session**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "endTime": "2025-12-06T15:45:00.000Z",
  "status": "ended_by_admin",
  "adminId": "admin_user_12345",
  "endReason": "Issue resolved successfully"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "chat_1733514600000_abc123def",
    "status": "ended_by_user",
    "endTime": "2025-12-06T15:45:00.000Z",
    "duration": 900,
    "messageCount": 8,
    "endedBy": "user"
  },
  "message": "Chat session ended successfully"
}
```

### 6. Submit Chat Rating
**Endpoint**: `POST /api/chat/rating`
**Authentication**: Not required for ended sessions

**Request Body**:
```json
{
  "sessionId": "chat_1733514600000_abc123def",
  "rating": 5,
  "feedback": "Excellent customer service! Sarah was very helpful and resolved my issue quickly.",
  "timestamp": "2025-12-06T15:46:00.000Z",
  "categories": ["helpful", "quick_response", "issue_resolved"]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "ratingId": "rating_1733515560000_abc123",
    "sessionId": "chat_1733514600000_abc123def",
    "rating": 5,
    "feedback": "Excellent customer service! Sarah was very helpful and resolved my issue quickly.",
    "submittedAt": "2025-12-06T15:46:00.000Z"
  },
  "message": "Rating submitted successfully"
}
```

### 7. Get Chat History (For Authenticated Users)
**Endpoint**: `GET /api/chat/history?page={number}&limit={number}`
**Authentication**: Required

**Request Headers**:
```
Authorization: Bearer {firebase_jwt_token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "chat_1733514600000_abc123def",
        "startTime": "2025-12-06T15:30:00.000Z",
        "endTime": "2025-12-06T15:45:00.000Z",
        "status": "ended_by_user",
        "rating": 5,
        "feedback": "Excellent customer service!",
        "messageCount": 8,
        "duration": 900,
        "adminInfo": {
          "name": "Sarah",
          "department": "Customer Service"
        },
        "lastMessage": {
          "message": "Thank you for contacting us!",
          "sender": "admin",
          "timestamp": "2025-12-06T15:44:30.000Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSessions": 1,
      "hasNext": false,
      "hasPrevious": false
    }
  },
  "message": "Chat history retrieved successfully"
}
```

## Database Schema

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NULL,
  user_info JSON NOT NULL,
  is_guest BOOLEAN DEFAULT false,
  guest_session_id VARCHAR(255) NULL,
  status ENUM('active', 'ended', 'ended_by_admin', 'ended_by_user') DEFAULT 'active',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  duration INT NULL COMMENT 'Duration in seconds',
  message_count INT DEFAULT 0,
  admin_id VARCHAR(255) NULL,
  admin_info JSON NULL,
  end_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_guest_session (guest_session_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at)
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender ENUM('user', 'admin') NOT NULL,
  sender_info JSON NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  message_type ENUM('text', 'system') DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_session_id (session_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_sender (sender),
  INDEX idx_session_timestamp (session_id, timestamp),
  INDEX idx_created_at (created_at)
);
```

### Chat Ratings Table
```sql
CREATE TABLE chat_ratings (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NULL,
  categories JSON NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_session_id (session_id),
  INDEX idx_rating (rating),
  INDEX idx_timestamp (timestamp),
  
  -- Ensure one rating per session
  UNIQUE KEY unique_session_rating (session_id)
);
```

### Admin Users Table (Optional)
```sql
CREATE TABLE admin_users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255) NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_active TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_department (department)
);
```

## Frontend Implementation Details

### Chat Service Flow (Already Implemented)

1. **Session Creation**: User starts chat → `chatService.startChatSession()` → API call
2. **Message Sending**: User types message → `chatService.sendMessage()` → API call
3. **Message Polling**: Every 2 seconds → `yoraaAPI.pollForMessages()` → Update UI
4. **Session Ending**: User/Admin ends → `chatService.endChatSession()` → Show rating
5. **Rating Submission**: User rates → `chatService.submitRating()` → Clear session

### Key Frontend Features Implemented:
- ✅ Real-time message polling (2-second intervals)
- ✅ Session lifecycle management
- ✅ User-initiated session ending
- ✅ 5-star rating system with feedback
- ✅ Message status indicators (sending/sent/failed)
- ✅ Auto-scroll to new messages
- ✅ Error handling and retry logic
- ✅ Guest user support
- ✅ Firebase authentication integration

## Admin Dashboard Requirements

### Essential Admin Features:
1. **Active Sessions Dashboard**
   - List all active chat sessions
   - Show user information and wait time
   - Quick session assignment to admins

2. **Chat Interface**
   - Real-time messaging with customers
   - User context and history
   - Canned response templates
   - Session notes and internal comments

3. **Session Management**
   - Transfer chats between admins
   - End sessions with reasons
   - Escalate to supervisors
   - Set session priority levels

4. **Analytics and Reporting**
   - Daily/weekly chat volume
   - Average response times
   - Customer satisfaction scores
   - Common issues and categories

### Admin API Endpoints Required:
```
GET /api/admin/chat/active-sessions
GET /api/admin/chat/session/{sessionId}
POST /api/admin/chat/message
POST /api/admin/chat/session/assign
POST /api/admin/chat/session/transfer
GET /api/admin/chat/analytics
GET /api/admin/chat/reports
```

## Real-Time Communication Strategy

### HTTP Polling Implementation (Current)
- Frontend polls every 2 seconds for new messages
- Efficient for moderate chat volumes
- Simple to implement and debug
- Works across all network conditions

```javascript
// Polling logic (already implemented in frontend)
const pollForMessages = async () => {
  try {
    const response = await yoraaAPI.pollForMessages(sessionId, lastMessageId);
    if (response.success && response.data.messages.length > 0) {
      processNewMessages(response.data.messages);
    }
    // Check if session ended by admin
    if (response.data.sessionEnded) {
      handleSessionEnded();
    }
  } catch (error) {
    console.error('Polling error:', error);
  }
  
  // Schedule next poll
  setTimeout(pollForMessages, 2000);
};
```

### WebSocket Enhancement (Future)
For better real-time performance and reduced server load:

```javascript
// WebSocket connection (future enhancement)
const ws = new WebSocket(`wss://api.yoraa.in/chat/${sessionId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_message') {
    addMessageToChat(data.message);
  } else if (data.type === 'session_ended') {
    handleSessionEnded();
  }
};

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'authenticate',
    sessionId: sessionId,
    token: userToken
  }));
};
```

## Error Handling Specification

### Common Error Codes:
- `SESSION_NOT_FOUND`: Chat session doesn't exist
- `SESSION_EXPIRED`: Session has been inactive too long
- `MESSAGE_SEND_FAILED`: Failed to deliver message
- `INVALID_RATING`: Rating value out of range
- `AUTHENTICATION_FAILED`: Invalid or expired token
- `RATE_LIMITED`: Too many requests

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "The chat session was not found or has expired",
    "details": {
      "sessionId": "chat_1733514600000_abc123def",
      "timestamp": "2025-12-06T15:30:00.000Z"
    }
  },
  "timestamp": "2025-12-06T15:30:00.000Z"
}
```

## Security Implementation

### Authentication & Authorization:
1. **User Authentication**: Firebase JWT tokens for authenticated users
2. **Guest Sessions**: Secure session IDs for guest users
3. **Admin Authentication**: Separate admin token system
4. **Session Validation**: Verify session ownership before operations

### Data Protection:
1. **Input Validation**: Sanitize all message content
2. **Rate Limiting**: Prevent spam and abuse
3. **Data Encryption**: Encrypt sensitive information in database
4. **Audit Logging**: Log all chat operations for security

### Rate Limiting Implementation:
```javascript
// Express rate limiting middleware
const rateLimit = require('express-rate-limit');

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each session to 30 messages per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many messages sent. Please wait before sending another message.'
    }
  },
  keyGenerator: (req) => req.body.sessionId || req.ip
});

app.use('/api/chat/message', chatRateLimit);
```

## Testing Strategy

### Backend Testing Checklist:
- [ ] Session creation with authenticated users
- [ ] Session creation with guest users
- [ ] Message sending and receiving
- [ ] Message polling with proper filtering
- [ ] Session ending by users and admins
- [ ] Rating submission and validation
- [ ] Error handling for all endpoints
- [ ] Rate limiting functionality
- [ ] Database integrity and constraints
- [ ] Authentication and authorization

### Load Testing Requirements:
- **Concurrent Sessions**: 100+ simultaneous chats
- **Message Throughput**: 1000+ messages per minute
- **Database Performance**: Sub-100ms response times
- **Memory Usage**: Monitor for memory leaks
- **Connection Handling**: Proper connection pooling

### Integration Testing:
- [ ] End-to-end chat flow
- [ ] Frontend-backend API integration
- [ ] Database transaction integrity
- [ ] Real-time message delivery
- [ ] Session state synchronization
- [ ] Error recovery scenarios

## Deployment Configuration

### Environment Variables:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yoraa_chat
DB_USER=chat_user
DB_PASSWORD=secure_password

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# Chat Configuration
MAX_MESSAGE_LENGTH=1000
SESSION_TIMEOUT_MINUTES=30
POLL_INTERVAL_SECONDS=2
```

### Production Checklist:
- [ ] Database migrations executed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Logging system setup
- [ ] Monitoring alerts configured
- [ ] Backup procedures implemented
- [ ] Admin dashboard deployed

## Monitoring and Analytics

### Key Metrics to Track:
- **Chat Volume**: Sessions created per hour/day
- **Response Times**: Average admin response time
- **Resolution Rate**: Percentage of issues resolved
- **Customer Satisfaction**: Average rating scores
- **API Performance**: Endpoint response times
- **Error Rates**: Failed requests percentage
- **Active Sessions**: Current concurrent chats

### Analytics Dashboard Requirements:
```json
{
  "dailyStats": {
    "totalSessions": 150,
    "averageDuration": 420,
    "messagesExchanged": 1200,
    "satisfactionScore": 4.3,
    "resolutionRate": 85
  },
  "realTimeStats": {
    "activeSessions": 12,
    "waitingCustomers": 3,
    "availableAdmins": 5,
    "averageWaitTime": 45
  },
  "performanceMetrics": {
    "apiResponseTime": 120,
    "databaseQueryTime": 35,
    "messageDeliveryTime": 250
  }
}
```

## Future Enhancements

### Phase 2 Features:
1. **File Attachments**: Support for image and document sharing
2. **Chat Templates**: Pre-written responses for common issues  
3. **Multi-language Support**: Localized chat interface
4. **Chatbot Integration**: AI-powered initial responses
5. **Advanced Analytics**: ML-based sentiment analysis
6. **Mobile Push Notifications**: Alert users of new messages

### Technical Improvements:
1. **WebSocket Implementation**: Replace HTTP polling
2. **Message Encryption**: End-to-end encryption
3. **Offline Support**: Message queuing when offline
4. **Advanced Search**: Full-text search in chat history
5. **Export Functionality**: Download chat transcripts
6. **Integration APIs**: Connect with CRM systems

## Implementation Timeline

### Week 1: Core Backend Setup
- [ ] Database schema creation
- [ ] Basic API endpoints (create session, send message)
- [ ] Authentication integration
- [ ] Basic error handling

### Week 2: Real-time Features
- [ ] Message polling endpoint
- [ ] Session management (end session)
- [ ] Rating system implementation
- [ ] Rate limiting and security

### Week 3: Admin Dashboard
- [ ] Admin authentication system
- [ ] Active sessions dashboard
- [ ] Chat interface for admins
- [ ] Basic analytics

### Week 4: Testing & Deployment
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitoring setup

## Conclusion

This implementation provides a robust, scalable foundation for real-time customer support chat. The HTTP polling approach ensures broad compatibility while maintaining good user experience. The modular architecture allows for easy future enhancements and integrations.

The frontend is fully implemented and ready for integration. The backend implementation following this guide will provide a complete, production-ready chat support system.

---

**Document Version**: 2.0  
**Last Updated**: December 6, 2025  
**Author**: Frontend Development Team  
**Status**: Frontend Complete - Backend Implementation Required  
**Review Required**: Backend Team, DevOps Team, Product Team
