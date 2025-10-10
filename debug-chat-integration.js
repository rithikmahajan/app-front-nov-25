/**
 * 🔍 FIREBASE JWT CHAT INTEGRATION DEBUGGER
 * 
 * This script helps debug the Firebase JWT integration with the backend
 * Run this to identify authentication and API issues
 */

const admin = require('firebase-admin');

class ChatIntegrationDebugger {
  constructor() {
    this.baseURL = 'https://yoraa-backend-u3qv.onrender.com'; // Update with your backend URL
    this.results = {
      firebaseSetup: false,
      tokenGeneration: false,
      backendConnection: false,
      authEndpoint: false,
      chatSession: false,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    };
    
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  async testBackendConnection() {
    this.log('Testing backend connection...', 'debug');
    
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.log(`Backend connection: SUCCESS - ${JSON.stringify(data)}`, 'success');
        this.results.backendConnection = true;
        return true;
      } else {
        this.log(`Backend connection: FAILED - Status ${response.status}`, 'error');
        this.results.errors.push(`Backend connection failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log(`Backend connection: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Backend connection error: ${error.message}`);
      return false;
    }
  }

  async testFirebaseJWTValidation(idToken) {
    this.log('Testing Firebase JWT validation endpoint...', 'debug');
    
    try {
      const response = await fetch(`${this.baseURL}/api/auth/validate-firebase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.log(`Firebase JWT validation: SUCCESS - User: ${data.user?.uid}`, 'success');
        this.results.authEndpoint = true;
        return true;
      } else {
        this.log(`Firebase JWT validation: FAILED - ${data.message}`, 'error');
        this.results.errors.push(`Firebase JWT validation failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      this.log(`Firebase JWT validation: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Firebase JWT validation error: ${error.message}`);
      return false;
    }
  }

  async testChatSessionCreation(idToken) {
    this.log('Testing chat session creation...', 'debug');
    
    const sessionData = {
      sessionId: `debug_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userInfo: {
        isGuest: false,
        userId: "debug-user-123",
        firebaseUid: "debug-user-123",
        email: "debug@example.com",
        name: "Debug User",
        emailVerified: true,
        authSource: 'firebase'
      },
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    try {
      this.log(`Sending chat session request with data: ${JSON.stringify(sessionData, null, 2)}`, 'debug');
      
      const response = await fetch(`${this.baseURL}/api/chat/session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      const data = await response.json();
      
      this.log(`Chat session response: Status ${response.status}`, 'debug');
      this.log(`Chat session response data: ${JSON.stringify(data, null, 2)}`, 'debug');
      
      if (response.ok && data.success) {
        this.log(`Chat session creation: SUCCESS - Session: ${data.data?.sessionId}`, 'success');
        this.results.chatSession = true;
        return true;
      } else {
        this.log(`Chat session creation: FAILED - ${data.message}`, 'error');
        this.log(`Full error response: ${JSON.stringify(data, null, 2)}`, 'error');
        this.results.errors.push(`Chat session creation failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      this.log(`Chat session creation: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Chat session creation error: ${error.message}`);
      return false;
    }
  }

  async generateSampleFirebaseToken() {
    this.log('Attempting to generate sample Firebase token...', 'debug');
    
    try {
      // This would need to be replaced with actual Firebase project credentials
      // For now, return a placeholder to test with real tokens
      this.log('Firebase token generation: Use actual Firebase Auth to get ID token', 'warning');
      return null;
    } catch (error) {
      this.log(`Firebase token generation: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Firebase token generation error: ${error.message}`);
      return null;
    }
  }

  async runFullDiagnostic(firebaseIdToken = null) {
    this.log('🚀 Starting Firebase JWT Chat Integration Diagnostic...', 'info');
    this.log('===============================================', 'info');
    
    // Step 1: Test backend connection
    await this.testBackendConnection();
    
    // Step 2: If no token provided, try to generate one
    if (!firebaseIdToken) {
      this.log('No Firebase ID token provided - please provide one for full testing', 'warning');
      firebaseIdToken = await this.generateSampleFirebaseToken();
    }
    
    if (firebaseIdToken) {
      // Step 3: Test Firebase JWT validation
      await this.testFirebaseJWTValidation(firebaseIdToken);
      
      // Step 4: Test chat session creation
      await this.testChatSessionCreation(firebaseIdToken);
    } else {
      this.log('Skipping Firebase JWT tests - no token available', 'warning');
    }
    
    // Generate final report
    this.generateReport();
  }

  generateReport() {
    this.log('===============================================', 'info');
    this.log('🔍 DIAGNOSTIC REPORT', 'info');
    this.log('===============================================', 'info');
    
    this.log(`Backend Connection: ${this.results.backendConnection ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Firebase JWT Validation: ${this.results.authEndpoint ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Chat Session Creation: ${this.results.chatSession ? '✅ PASS' : '❌ FAIL'}`, 'info');
    
    if (this.results.errors.length > 0) {
      this.log('❌ ERRORS FOUND:', 'error');
      this.results.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }
    
    this.log('===============================================', 'info');
    
    // Provide recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    this.log('💡 RECOMMENDATIONS:', 'info');
    
    if (!this.results.backendConnection) {
      this.log('• Check if backend server is running and accessible', 'warning');
      this.log('• Verify backend URL is correct', 'warning');
    }
    
    if (!this.results.authEndpoint) {
      this.log('• Verify Firebase Admin SDK is properly configured in backend', 'warning');
      this.log('• Check Firebase project ID and service account credentials', 'warning');
      this.log('• Ensure Firebase authentication middleware is implemented', 'warning');
    }
    
    if (!this.results.chatSession) {
      this.log('• Check backend chat session creation logic', 'warning');
      this.log('• Verify database connection and chat table schema', 'warning');
      this.log('• Check for server-side errors in backend logs', 'warning');
    }
    
    this.log('===============================================', 'info');
  }
}

// Export for use in React Native
module.exports = { ChatIntegrationDebugger };

// For Node.js testing
if (require.main === module) {
  const diagnosticTool = new ChatIntegrationDebugger();
  
  // Get Firebase ID token from command line argument
  const firebaseIdToken = process.argv[2];
  
  if (firebaseIdToken) {
    console.log('🔍 Running diagnostic with provided Firebase ID token...');
    diagnosticTool.runFullDiagnostic(firebaseIdToken);
  } else {
    console.log('🔍 Running diagnostic without Firebase ID token...');
    console.log('ℹ️ To test Firebase JWT integration, run: node debug-chat-integration.js YOUR_FIREBASE_ID_TOKEN');
    diagnosticTool.runFullDiagnostic();
  }
}
