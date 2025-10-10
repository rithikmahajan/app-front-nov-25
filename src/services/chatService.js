// Chat Service for Real-time Messaging
import yoraaAPI from './yoraaAPI';
import auth from '@react-native-firebase/auth';

class ChatService {
  constructor() {
    this.activeSession = null;
    this.messagePollingInterval = null;
    this.messageListeners = [];
    this.sessionListeners = [];
    this.isPolling = false;
    this.lastMessageId = null;
    this.pollingDelay = 2000; // 2 seconds
    this.pollingStartTime = null;
    this.pollCount = 0;
    this.maxPolls = 300; // Maximum 300 polls (10 minutes at 2s intervals)
    this.consecutiveEmptyPolls = 0;
    this.maxConsecutiveEmptyPolls = 10; // Stop after 10 empty polls in a row
  }

  /**
   * Start a new chat session
   * RESTRICTION: Only authenticated users can initiate chat sessions
   */
  async startChatSession() {
    try {
      console.log('🚀 Starting new chat session');
      
      // Check if user is authenticated - GUEST USERS NOT ALLOWED
      const currentUser = auth().currentUser;
      if (!currentUser) {
        const error = new Error('Authentication required to start chat session. Guest users cannot access chat support.');
        error.code = 'AUTHENTICATION_REQUIRED';
        error.requiresLogin = true;
        throw error;
      }
      
      console.log('✅ User authenticated, proceeding with chat session');
      
      // Clear any existing session
      if (this.activeSession) {
        this.stopMessagePolling();
        this.activeSession = null;
        this.lastMessageId = null;
      }
      
      // Get authenticated user info
      let userInfo;
      try {
        const userProfile = await yoraaAPI.getUserProfile();
        userInfo = {
          isGuest: false,
          userId: currentUser.uid,
          email: currentUser.email || userProfile?.email,
          name: currentUser.displayName || userProfile?.name || 'User',
          phone: currentUser.phoneNumber || userProfile?.phone
        };
      } catch (profileError) {
        console.warn('Could not fetch user profile, using basic Firebase info');
        userInfo = {
          isGuest: false,
          userId: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || 'User',
          phone: currentUser.phoneNumber
        };
      }

      // Create session via API
      const response = await yoraaAPI.createChatSession(userInfo);
      
      if (response.success) {
        this.activeSession = {
          sessionId: response.data.sessionId,
          userInfo,
          startTime: new Date(),
          status: 'active',
          messages: []
        };

        // Send initial welcome message
        await this.sendWelcomeMessage();
        
        // Start polling for admin messages
        this.startMessagePolling();
        
        console.log('✅ Chat session started:', this.activeSession.sessionId);
        this.notifySessionListeners('session_started', this.activeSession);
        
        return this.activeSession;
      } else {
        throw new Error(response.message || 'Failed to create chat session');
      }
    } catch (error) {
      console.error('❌ Error starting chat session:', error);
      throw error;
    }
  }

  /**
   * Send welcome message for authenticated users only
   */
  async sendWelcomeMessage() {
    if (!this.activeSession) return;

    const { userInfo } = this.activeSession;
    // Since only authenticated users can access chat, we always have a name
    const welcomeText = `Hello ${userInfo.name}! Welcome to Yoraa customer support. How can we assist you today?`;

    // Add welcome message to local messages
    const welcomeMessage = {
      id: `msg_welcome_${Date.now()}`,
      text: welcomeText,
      sender: 'admin',
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.activeSession.messages.push(welcomeMessage);
    this.notifyMessageListeners('message_received', welcomeMessage);
  }

  /**
   * Send a message from user
   */
  async sendMessage(messageText) {
    if (!this.activeSession || !messageText.trim()) {
      throw new Error('No active session or empty message');
    }

    try {
      console.log('📤 Sending user message');
      
      // Create local message immediately for instant UI update
      const userMessage = {
        id: `msg_user_${Date.now()}`,
        text: messageText.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
      };

      // Add to local messages
      this.activeSession.messages.push(userMessage);
      this.notifyMessageListeners('message_sent', userMessage);

      // Send to backend
      const response = await yoraaAPI.sendChatMessage(
        this.activeSession.sessionId,
        messageText,
        'user'
      );

      if (response.success) {
        // Update message status
        userMessage.status = 'sent';
        userMessage.id = response.data.messageId;
        this.lastMessageId = userMessage.id;
        this.notifyMessageListeners('message_updated', userMessage);
        
        console.log('✅ Message sent successfully');
        return userMessage;
      } else {
        userMessage.status = 'failed';
        this.notifyMessageListeners('message_updated', userMessage);
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Start polling for new messages from admin
   */
  startMessagePolling() {
    if (this.isPolling || !this.activeSession) {
      console.log(`⚠️ Polling start blocked - isPolling: ${this.isPolling}, hasSession: ${!!this.activeSession}`);
      return;
    }

    console.log('🔄 Starting message polling for session:', this.activeSession.sessionId);
    this.isPolling = true;
    this.pollingStartTime = new Date();
    this.pollCount = 0;

    const poll = async () => {
      if (!this.activeSession || (this.activeSession.status && this.activeSession.status !== 'active')) {
        console.log('🛑 Stopping poll - Session ended or inactive:', {
          hasSession: !!this.activeSession,
          status: this.activeSession?.status
        });
        this.stopMessagePolling();
        return;
      }

      // Check polling limits
      if (this.pollCount >= this.maxPolls) {
        console.log('🛑 Maximum poll count reached, stopping polling');
        this.stopMessagePolling();
        return;
      }

      if (this.consecutiveEmptyPolls >= this.maxConsecutiveEmptyPolls) {
        console.log('🛑 Too many consecutive empty polls, stopping polling');
        this.stopMessagePolling();
        return;
      }

      try {
        this.pollCount++;
        const timeSinceStart = new Date() - this.pollingStartTime;
        
        // Only log every 5th poll to reduce console spam
        if (this.pollCount % 5 === 0 || this.pollCount <= 5) {
          console.log(`📡 Poll #${this.pollCount} (${Math.round(timeSinceStart/1000)}s since start)`);
        }
        
        const response = await yoraaAPI.pollForMessages(
          this.activeSession.sessionId,
          this.lastMessageId
        );

        if (response.success && response.data.messages && response.data.messages.length > 0) {
          // Reset consecutive empty polls counter
          this.consecutiveEmptyPolls = 0;
          
          console.log(`📨 Received ${response.data.messages.length} new message(s)`);
          
          // Process new messages
          response.data.messages.forEach(msg => {
            const newMessage = {
              id: msg.messageId || msg.id,
              text: msg.message || msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            this.activeSession.messages.push(newMessage);
            this.lastMessageId = newMessage.id;
            this.notifyMessageListeners('message_received', newMessage);
          });
        } else {
          // Increment consecutive empty polls
          this.consecutiveEmptyPolls++;
        }

        // Check if session was ended by admin
        if (response.data.sessionEnded) {
          this.handleSessionEnded();
          return;
        }

        // Smart polling: Reduce frequency if no new messages
        if (response.success && (!response.data.messages || response.data.messages.length === 0)) {
          // No new messages - increase delay (max 10 seconds)
          this.pollingDelay = Math.min(this.pollingDelay * 1.2, 10000);
        } else if (response.success && response.data.messages && response.data.messages.length > 0) {
          // New messages found - reset to fast polling
          this.pollingDelay = 2000;
        }

      } catch (error) {
        console.error('❌ Error polling for messages:', error);
        // On error, slow down polling
        this.pollingDelay = Math.min(this.pollingDelay * 1.5, 15000);
      }

      // Schedule next poll with smart delay
      this.messagePollingInterval = setTimeout(poll, this.pollingDelay);
      
      // Only log scheduling details every 10th poll or when delay changes
      if (this.pollCount % 10 === 0 || this.pollingDelay > 2000) {
        if (this.pollingDelay > 2000) {
          console.log(`⏱️ Smart polling: Next poll in ${Math.round(this.pollingDelay/1000)}s (reduced frequency after ${this.consecutiveEmptyPolls} empty polls)`);
        } else {
          console.log(`⏱️ Next poll in ${this.pollingDelay/1000}s`);
        }
      }
    };

    // Start polling
    poll();
  }

  /**
   * Stop message polling
   */
  stopMessagePolling() {
    console.log('⏹️ Stopping message polling - Current status:', {
      isPolling: this.isPolling,
      hasInterval: !!this.messagePollingInterval,
      sessionId: this.activeSession?.sessionId
    });
    this.isPolling = false;
    
    if (this.messagePollingInterval) {
      clearTimeout(this.messagePollingInterval);
      this.messagePollingInterval = null;
      console.log('✅ Polling interval cleared');
    }
  }

  /**
   * End the current chat session
   */
  async endChatSession(rating = null, feedback = null) {
    if (!this.activeSession) {
      console.log('⚠️ No active chat session to end');
      return null; // Return null instead of throwing error
    }

    // Check if session is already ended
    if (this.activeSession.status && this.activeSession.status.startsWith('ended')) {
      console.log('⚠️ Chat session already ended');
      return { ...this.activeSession };
    }

    try {
      console.log('🔚 Ending chat session');
      
      // Stop polling
      this.stopMessagePolling();
      
      // Send end session request to backend
      const response = await yoraaAPI.endChatSession(
        this.activeSession.sessionId,
        rating,
        feedback
      );

      if (response.success) {
        this.activeSession.status = 'ended_by_user';
        this.activeSession.endTime = new Date();
        this.activeSession.rating = rating;
        this.activeSession.feedback = feedback;
        
        this.notifySessionListeners('session_ended', this.activeSession);
        
        console.log('✅ Chat session ended successfully');
        
        // Don't clear the session yet - preserve it for rating submission
        // It will be cleared after rating is submitted or when a new session starts
        return { ...this.activeSession };
      } else {
        throw new Error(response.message || 'Failed to end chat session');
      }
    } catch (error) {
      console.error('❌ Error ending chat session:', error);
      throw error;
    }
  }

  /**
   * Handle session ended by admin
   */
  handleSessionEnded() {
    if (!this.activeSession) return;

    console.log('📞 Session ended by admin');
    
    this.stopMessagePolling();
    this.activeSession.status = 'ended_by_admin';
    this.activeSession.endTime = new Date();
    
    this.notifySessionListeners('session_ended_by_admin', this.activeSession);
  }

  /**
   * Submit rating for completed session
   */
  async submitRating(rating, feedback = '') {
    if (!this.activeSession) {
      throw new Error('No chat session found');
    }

    // Allow rating submission for ended sessions (ended by user or admin)
    if (this.activeSession.status === 'active') {
      throw new Error('Cannot rate an active session. Please end the session first.');
    }

    try {
      console.log('⭐ Submitting chat rating for session:', this.activeSession.sessionId);
      
      const response = await yoraaAPI.submitChatRating(
        this.activeSession.sessionId,
        rating,
        feedback
      );

      if (response.success) {
        if (this.activeSession) {
          this.activeSession.rating = rating;
          this.activeSession.feedback = feedback;
        }
        
        // Clear the session after successful rating submission
        this.activeSession = null;
        this.lastMessageId = null;
        
        console.log('✅ Chat rating submitted successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('❌ Error submitting chat rating:', error);
      throw error;
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession() {
    return this.activeSession;
  }

  /**
   * Check if there's an active session
   */
  hasActiveSession() {
    return this.activeSession && this.activeSession.status === 'active';
  }

  /**
   * Add message listener
   */
  addMessageListener(listener) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add session listener
   */
  addSessionListener(listener) {
    this.sessionListeners.push(listener);
    return () => {
      this.sessionListeners = this.sessionListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify message listeners
   */
  notifyMessageListeners(event, data) {
    this.messageListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  /**
   * Notify session listeners
   */
  notifySessionListeners(event, data) {
    this.sessionListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  /**
   * Emergency stop for all polling (use if multiple instances detected)
   */
  emergencyStopPolling() {
    console.log('🚨 EMERGENCY STOP - Clearing all polling');
    this.isPolling = false;
    
    // Clear any timeouts that might be running
    for (let i = 0; i < 1000; i++) {
      clearTimeout(i);
    }
    
    this.messagePollingInterval = null;
    console.log('🚨 All timeouts cleared');
  }

  /**
   * Cleanup on app close/unmount
   */
  cleanup() {
    console.log('🧹 Cleaning up ChatService');
    this.stopMessagePolling();
    this.messageListeners = [];
    this.sessionListeners = [];
    this.activeSession = null;
    this.lastMessageId = null;
    this.pollCount = 0;
    this.pollingStartTime = null;
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
