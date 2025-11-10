# Real-Time Chat Support Implementation Guide

## Overview

This document outlines the complete implementation of the real-time chat support system for the Yoraa mobile application. The chat system allows users to communicate with customer support representatives in real-time, maintains session records, and provides a rating system for feedback.

## Architecture

### Frontend Components
- **ContactUsScreen**: Main UI component handling chat interface
- **ChatService**: Real-time messaging service layer
- **YoraaAPI**: Backend API integration layer

### Backend Requirements
The backend needs to implement RESTful APIs and optionally WebSocket support for real-time messaging.

## API Endpoints Required

### 1. Create Chat Session
**Endpoint**: `POST /api/chat/session`

**Request Body**:
```json
{
  "sessionId": "chat_1696629600000_abc123def",
  "userInfo": {
    "isGuest": false,
    "userId": "firebase_user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "startTime": "2025-10-06T10:30:00.000Z",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "chat_1696629600000_abc123def",
    "status": "active",
    "createdAt": "2025-10-06T10:30:00.000Z"
  },
  "message": "Chat session created successfully"
}
```

### 2. Send Chat Message
**Endpoint**: `POST /api/chat/message`

**Request Body**:
```json
{
  "sessionId": "chat_1696629600000_abc123def",
  "message": "Hello, I need help with my order",
  "sender": "user",
  "timestamp": "2025-10-06T10:31:00.000Z",
  "messageId": "msg_1696629660000_xyz789"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_1696629660000_xyz789",
    "status": "sent",
    "timestamp": "2025-10-06T10:31:00.000Z"
  },
  "message": "Message sent successfully"
}
```

### 3. Poll for New Messages
**Endpoint**: `GET /api/chat/poll/{sessionId}?after={lastMessageId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_1696629720000_admin123",
        "message": "Hello! How can I help you today?",
        "sender": "admin",
        "timestamp": "2025-10-06T10:32:00.000Z"
      }
    ],
    "sessionEnded": false
  },
  "message": "Messages retrieved successfully"
}
```

### 4. Get Chat Messages
**Endpoint**: `GET /api/chat/messages/{sessionId}?after={lastMessageId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_1696629660000_xyz789",
        "message": "Hello, I need help with my order",
        "sender": "user",
        "timestamp": "2025-10-06T10:31:00.000Z"
      },
      {
        "messageId": "msg_1696629720000_admin123",
        "message": "Hello! How can I help you today?",
        "sender": "admin",
        "timestamp": "2025-10-06T10:32:00.000Z"
      }
    ]
  },
  "message": "Messages retrieved successfully"
}
```

### 5. End Chat Session
**Endpoint**: `POST /api/chat/session/end`
**Note**: This endpoint can be called by both users and admins to end chat sessions.

**Request Body (Admin)**:
```json
{
  "sessionId": "chat_1696629600000_abc123def",
  "endTime": "2025-10-06T10:45:00.000Z",
  "status": "ended_by_admin",
  "adminId": "admin_user_id"
}
```

**Request Body (User)**:
```json
{
  "sessionId": "chat_1696629600000_abc123def",
  "endTime": "2025-10-06T10:45:00.000Z",
  "status": "ended_by_user",
  "userId": "firebase_user_id"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "chat_1696629600000_abc123def",
    "status": "ended",
    "endTime": "2025-10-06T10:45:00.000Z",
    "duration": 900
  },
  "message": "Chat session ended successfully"
}
```

### 6. Submit Chat Rating
**Endpoint**: `POST /api/chat/rating`

**Request Body**:
```json
{
  "sessionId": "chat_1696629600000_abc123def",
  "rating": 5,
  "feedback": "Excellent customer service!",
  "timestamp": "2025-10-06T10:45:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "ratingId": "rating_1696630500000_abc123",
    "sessionId": "chat_1696629600000_abc123def",
    "rating": 5,
    "feedback": "Excellent customer service!"
  },
  "message": "Rating submitted successfully"
}
```

### 7. Get Chat History (Authenticated Users)
**Endpoint**: `GET /api/chat/history`

**Headers**: `Authorization: Bearer {userToken}`

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "chat_1696629600000_abc123def",
        "startTime": "2025-10-06T10:30:00.000Z",
        "endTime": "2025-10-06T10:45:00.000Z",
        "status": "ended",
        "rating": 5,
        "messageCount": 8,
        "duration": 900
      }
    ]
  },
  "message": "Chat history retrieved successfully"
}
```

## Database Schema

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  user_info JSON,
  is_guest BOOLEAN DEFAULT false,
  guest_session_id VARCHAR(255),
  status ENUM('active', 'ended', 'ended_by_admin', 'ended_by_user') DEFAULT 'active',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  rating INT NULL,
  feedback TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_guest_session (guest_session_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time)
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender ENUM('user', 'admin') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_sender (sender)
);
```

### Chat Ratings Table
```sql
CREATE TABLE chat_ratings (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_rating (rating)
);
```

## Frontend Implementation Details

### Chat Service (chatService.js)

The ChatService handles:
- **Session Management**: Creates and manages chat sessions
- **Real-time Messaging**: Polls for new messages every 2 seconds
- **Message Queue**: Handles message sending with retry logic
- **Event System**: Notifies UI components of chat events

Key Methods:
```javascript
// Start new chat session
await chatService.startChatSession()

// Send message
await chatService.sendMessage(messageText)

// Submit rating (after admin ends session)
await chatService.submitRating(rating, feedback)
```

### ContactUs Screen (contactus.js)

Features implemented:
- **Modal Interface**: Bottom sheet modal for contact options
- **Real-time Chat**: Full-screen chat interface
- **Message Status**: Shows sending/sent/failed states
- **Auto-scroll**: Automatically scrolls to new messages
- **Rating System**: 5-star rating with feedback
- **Session Management**: Tracks active sessions and handles admin-initiated session endings

## Real-time Communication

### Polling Implementation
The frontend uses HTTP polling every 2 seconds to fetch new messages:

```javascript
const poll = async () => {
  const response = await yoraaAPI.pollForMessages(
    sessionId,
    lastMessageId
  );
  
  if (response.success && response.data.messages.length > 0) {
    // Process new messages
    processNewMessages(response.data.messages);
  }
  
  // Schedule next poll
  setTimeout(poll, 2000);
};
```

### WebSocket Alternative (Optional Enhancement)
For better real-time performance, consider implementing WebSocket:

```javascript
// WebSocket connection
const ws = new WebSocket(`ws://your-backend.com/chat/${sessionId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleNewMessage(data);
};
```

## Admin Interface Requirements

### Admin Dashboard Features Needed:
1. **Active Chat Sessions List**
   - Show all active chat sessions
   - Display user information and session duration
   - Quick preview of recent messages

2. **Chat Interface for Admins**
   - Real-time message interface
   - User context information
   - Ability to end chat sessions
   - Canned responses/templates

3. **Session Management**
   - Transfer chats between admins
   - Set session status
   - Add internal notes

4. **Analytics Dashboard**
   - Chat volume metrics
   - Response time statistics
   - Customer satisfaction ratings
   - Common issues tracking

### Admin API Endpoints Needed:
```
GET /api/admin/chat/active-sessions
GET /api/admin/chat/session/{sessionId}
POST /api/admin/chat/message
POST /api/admin/chat/session/end
GET /api/admin/chat/analytics
```

## Error Handling

### Frontend Error Scenarios:
1. **Network Connectivity Issues**
   - Retry failed messages
   - Show offline indicator
   - Queue messages for retry

2. **Session Timeout**
   - Detect inactive sessions
   - Prompt user to restart chat
   - Save message draft

3. **API Failures**
   - Show error messages
   - Provide fallback options (email)
   - Graceful degradation

### Backend Error Responses:
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Chat session not found or expired"
  },
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

## Security Considerations

### Authentication
- **Authenticated Users**: Use Firebase JWT tokens
- **Guest Users**: Generate secure session IDs
- **Session Validation**: Verify session ownership

### Data Protection
- **Message Encryption**: Consider encrypting sensitive messages
- **Data Retention**: Implement message retention policies
- **GDPR Compliance**: Allow users to delete chat history

### Rate Limiting
```javascript
// Implement rate limiting for chat APIs
app.use('/api/chat', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many chat requests, please try again later.'
}));
```

## Testing Strategy

### Unit Tests
- ChatService methods
- API integration
- Message handling logic
- Session management

### Integration Tests
- End-to-end chat flow
- Real-time message delivery
- Session persistence
- Rating submission

### Load Testing
- Concurrent chat sessions
- Message throughput
- Database performance
- Memory usage

## Deployment Checklist

### Backend Requirements:
- [ ] Database tables created
- [ ] API endpoints implemented
- [ ] Authentication middleware
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Logging system setup

### Frontend Requirements:
- [ ] Chat service integrated
- [ ] UI components tested
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Accessibility features

### Monitoring:
- [ ] API response time monitoring
- [ ] Error rate tracking
- [ ] Chat session analytics
- [ ] User satisfaction metrics

## Performance Optimization

### Frontend Optimizations:
1. **Message Virtualization**: For long chat histories
2. **Debounced Polling**: Reduce server load
3. **Message Caching**: Store recent messages locally
4. **Lazy Loading**: Load chat history on demand

### Backend Optimizations:
1. **Database Indexing**: Optimize query performance
2. **Connection Pooling**: Manage database connections
3. **Caching Layer**: Redis for session data
4. **Message Queuing**: Handle high-volume messaging

## Monitoring and Analytics

### Key Metrics to Track:
- Average response time
- Chat session duration
- Customer satisfaction scores
- Message delivery success rate
- API endpoint performance
- Concurrent active sessions

### Alerting System:
- High error rates
- Slow response times
- Database connection issues
- Memory/CPU usage spikes

## Future Enhancements

### Phase 2 Features:
1. **File Attachments**: Image and document sharing
2. **Voice Messages**: Audio message support
3. **Chat Transcripts**: Email chat history to users
4. **Multi-language Support**: Localized chat interface
5. **Chatbot Integration**: AI-powered initial responses
6. **Video Chat**: WebRTC integration for video calls

### Technical Improvements:
1. **WebSocket Implementation**: True real-time communication
2. **Message Encryption**: End-to-end encryption
3. **Offline Support**: Message queuing when offline
4. **Push Notifications**: Alert users of new messages

## Conclusion

This implementation provides a robust foundation for real-time customer support chat. The polling-based approach ensures compatibility across all platforms while maintaining good user experience. The modular architecture allows for easy future enhancements and scalability.

For any questions or clarifications needed during implementation, please reach out to the frontend development team.

---

**Document Version**: 1.0  
**Last Updated**: October 6, 2025  
**Author**: Frontend Development Team  
**Review Required**: Backend Team, DevOps Team
