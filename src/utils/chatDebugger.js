/**
 * 🔍 REACT NATIVE FIREBASE JWT CHAT DEBUGGER
 * 
 * Use this in your React Native app to debug Firebase JWT chat integration
 * Import and call debugChatIntegration() from any component
 */

import auth from '@react-native-firebase/auth';

// Use the same URL configuration as your main API service
const BASE_URL = __DEV__
  ? 'http://localhost:8001'        // Development (port 8001)
  : 'http://185.193.19.244:8080';  // Production (port 8080)class ReactNativeChatDebugger {
  constructor() {
    this.results = {
      firebaseAuth: false,
      tokenGeneration: false,
      backendConnection: false,
      authValidation: false,
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
    
    console.log(`${emoji[type]} [CHAT_DEBUG] ${message}`);
  }

  async checkFirebaseAuth() {
    this.log('Checking Firebase authentication status...', 'debug');
    
    try {
      const currentUser = auth().currentUser;
      
      if (currentUser) {
        this.log(`Firebase Auth: SUCCESS - User: ${currentUser.uid}`, 'success');
        this.log(`User Email: ${currentUser.email}`, 'info');
        this.log(`User Name: ${currentUser.displayName}`, 'info');
        this.log(`Email Verified: ${currentUser.emailVerified}`, 'info');
        this.results.firebaseAuth = true;
        return currentUser;
      } else {
        this.log('Firebase Auth: NO USER - User not authenticated', 'error');
        this.results.errors.push('User not authenticated with Firebase');
        return null;
      }
    } catch (error) {
      this.log(`Firebase Auth: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Firebase auth error: ${error.message}`);
      return null;
    }
  }

  async generateFirebaseToken(user) {
    this.log('Generating Firebase ID token...', 'debug');
    
    try {
      const idToken = await user.getIdToken(true); // Force refresh
      this.log('Firebase Token: SUCCESS - Token generated', 'success');
      this.log(`Token length: ${idToken.length}`, 'debug');
      this.log(`Token preview: ${idToken.substring(0, 50)}...`, 'debug');
      this.results.tokenGeneration = true;
      return idToken;
    } catch (error) {
      this.log(`Firebase Token: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Token generation error: ${error.message}`);
      return null;
    }
  }

  async testBackendConnection() {
    this.log('Testing backend connection...', 'debug');
    
    try {
      const response = await fetch(`${DEBUG_BASE_URL}/health`);
      
      if (response.ok) {
        const data = await response.json();
        this.log(`Backend Connection: SUCCESS - ${JSON.stringify(data)}`, 'success');
        this.results.backendConnection = true;
        return true;
      } else {
        this.log(`Backend Connection: FAILED - Status ${response.status}`, 'error');
        this.results.errors.push(`Backend connection failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log(`Backend Connection: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Backend connection error: ${error.message}`);
      return false;
    }
  }

  async testAuthValidation(idToken) {
    this.log('Testing Firebase JWT validation...', 'debug');
    
    try {
      const response = await fetch(`${DEBUG_BASE_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      this.log(`Auth Validation Response: ${JSON.stringify(data, null, 2)}`, 'debug');
      
      if (response.ok && data.success) {
        this.log(`Auth Validation: SUCCESS - User validated`, 'success');
        this.results.authValidation = true;
        return true;
      } else {
        this.log(`Auth Validation: FAILED - ${data.message}`, 'error');
        this.results.errors.push(`Auth validation failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      this.log(`Auth Validation: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Auth validation error: ${error.message}`);
      return false;
    }
  }

  async testChatSessionCreation(idToken, user) {
    this.log('Testing chat session creation...', 'debug');
    
    const sessionData = {
      sessionId: `debug_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userInfo: {
        isGuest: false,
        userId: user.uid,
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || user.email || 'User',
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        authSource: 'firebase'
      },
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    try {
      this.log(`Chat Session Request Data: ${JSON.stringify(sessionData, null, 2)}`, 'debug');
      
      const response = await fetch(`${DEBUG_BASE_URL}/api/chat/session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      const data = await response.json();
      
      this.log(`Chat Session Response Status: ${response.status}`, 'debug');
      this.log(`Chat Session Response: ${JSON.stringify(data, null, 2)}`, 'debug');
      
      if (response.ok && data.success) {
        this.log(`Chat Session: SUCCESS - Session created: ${data.data?.sessionId}`, 'success');
        this.results.chatSession = true;
        return true;
      } else {
        this.log(`Chat Session: FAILED - ${data.message}`, 'error');
        this.log(`Full Error Response: ${JSON.stringify(data, null, 2)}`, 'error');
        this.results.errors.push(`Chat session failed: ${data.message} (Status: ${response.status})`);
        return false;
      }
    } catch (error) {
      this.log(`Chat Session: ERROR - ${error.message}`, 'error');
      this.results.errors.push(`Chat session error: ${error.message}`);
      return false;
    }
  }

  async runComprehensiveDiagnostic() {
    this.log('🚀 Starting Comprehensive Firebase JWT Chat Diagnostic...', 'info');
    this.log('================================================================', 'info');
    
    // Step 1: Check Firebase authentication
    const user = await this.checkFirebaseAuth();
    if (!user) {
      this.generateReport();
      return this.results;
    }
    
    // Step 2: Generate Firebase ID token
    const idToken = await this.generateFirebaseToken(user);
    if (!idToken) {
      this.generateReport();
      return this.results;
    }
    
    // Step 3: Test backend connection
    await this.testBackendConnection();
    
    // Step 4: Test authentication validation
    await this.testAuthValidation(idToken);
    
    // Step 5: Test chat session creation
    await this.testChatSessionCreation(idToken, user);
    
    // Generate final report
    this.generateReport();
    return this.results;
  }

  generateReport() {
    this.log('================================================================', 'info');
    this.log('🔍 COMPREHENSIVE DIAGNOSTIC REPORT', 'info');
    this.log('================================================================', 'info');
    
    this.log(`Firebase Authentication: ${this.results.firebaseAuth ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Token Generation: ${this.results.tokenGeneration ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Backend Connection: ${this.results.backendConnection ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Auth Validation: ${this.results.authValidation ? '✅ PASS' : '❌ FAIL'}`, 'info');
    this.log(`Chat Session Creation: ${this.results.chatSession ? '✅ PASS' : '❌ FAIL'}`, 'info');
    
    if (this.results.errors.length > 0) {
      this.log('❌ ERRORS FOUND:', 'error');
      this.results.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    } else {
      this.log('✅ NO ERRORS FOUND - Firebase JWT integration is working!', 'success');
    }
    
    this.log('================================================================', 'info');
    this.generateRecommendations();
  }

  generateRecommendations() {
    this.log('💡 RECOMMENDATIONS:', 'info');
    
    if (!this.results.firebaseAuth) {
      this.log('• User needs to log in with Firebase Auth first', 'warning');
      this.log('• Check if Firebase Auth is properly initialized', 'warning');
    }
    
    if (!this.results.tokenGeneration) {
      this.log('• Check Firebase Auth configuration', 'warning');
      this.log('• Verify network connectivity for token refresh', 'warning');
    }
    
    if (!this.results.backendConnection) {
      this.log('• Check if backend server is running', 'warning');
      this.log('• Verify backend URL in configuration', 'warning');
      this.log('• Check network connectivity', 'warning');
    }
    
    if (!this.results.authValidation) {
      this.log('• Backend Firebase Admin SDK may not be configured', 'warning');
      this.log('• Check backend authentication middleware', 'warning');
      this.log('• Verify Firebase project ID matches', 'warning');
    }
    
    if (!this.results.chatSession) {
      this.log('• Backend chat session endpoint may have issues', 'warning');
      this.log('• Check backend database connection', 'warning');
      this.log('• Review backend server logs for errors', 'warning');
    }
    
    this.log('================================================================', 'info');
  }
}

// Export the debugging function
export const debugChatIntegration = async () => {
  const diagnostic = new ReactNativeChatDebugger();
  return await diagnostic.runComprehensiveDiagnostic();
};

// Export the class for advanced usage
export { ReactNativeChatDebugger };

// Default export
export default debugChatIntegration;
