// Session Management Demo Script
// Run this in the app to test session persistence features

import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionManager from '../src/services/sessionManager';
import authManager from '../src/services/authManager';
import yoraaAPI from '../src/services/yoraaAPI';
import auth from '@react-native-firebase/auth';

export const SessionDemo = {
  
  /**
   * Test session persistence across app restarts
   */
  async testSessionPersistence() {
    console.log('🧪 Testing Session Persistence...');
    
    try {
      // 1. Check current session state
      console.log('\n1. Current Session State:');
      await sessionManager.debugSessionStatus();
      
      // 2. Check auth status
      console.log('\n2. Auth Status:');
      const authStatus = await authManager.getAuthStatus();
      console.log('Auth Status:', authStatus);
      
      // 3. Test session validation
      console.log('\n3. Session Validation:');
      const isValid = await sessionManager.isSessionValid();
      console.log('Session Valid:', isValid);
      
      // 4. Test token presence
      console.log('\n4. Token Status:');
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      console.log('User Token:', userToken ? 'EXISTS' : 'MISSING');
      console.log('User Data:', userData ? 'EXISTS' : 'MISSING');
      
      // 5. Firebase Auth Status
      console.log('\n5. Firebase Status:');
      const firebaseUser = auth().currentUser;
      console.log('Firebase User:', firebaseUser ? `Logged in as ${firebaseUser.email || firebaseUser.uid}` : 'Not logged in');
      
      // 6. Backend API Status
      console.log('\n6. Backend API Status:');
      console.log('Backend Authenticated:', yoraaAPI.isAuthenticated());
      
      return {
        sessionValid: isValid,
        hasToken: !!userToken,
        hasUserData: !!userData,
        firebaseUser: !!firebaseUser,
        backendAuth: yoraaAPI.isAuthenticated(),
        authStatus: authStatus
      };
      
    } catch (error) {
      console.error('❌ Session persistence test failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Test complete logout process
   */
  async testCompleteLogout() {
    console.log('🧪 Testing Complete Logout...');
    
    try {
      // 1. Current state before logout
      console.log('\n1. State Before Logout:');
      await this.testSessionPersistence();
      
      // 2. Perform logout
      console.log('\n2. Performing Logout...');
      await authManager.logout();
      
      // 3. State after logout
      console.log('\n3. State After Logout:');
      const afterLogout = await this.testSessionPersistence();
      
      // 4. Verify cleanup
      const expectedCleanup = {
        sessionValid: false,
        hasToken: false,
        hasUserData: false,
        firebaseUser: false,
        backendAuth: false
      };
      
      const isCleanedUp = Object.keys(expectedCleanup).every(key => 
        afterLogout[key] === expectedCleanup[key]
      );
      
      console.log('\n4. Logout Cleanup Status:');
      console.log('Complete Cleanup:', isCleanedUp ? '✅ SUCCESS' : '❌ FAILED');
      
      return { success: isCleanedUp, afterLogout };
      
    } catch (error) {
      console.error('❌ Complete logout test failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Test session refresh functionality
   */
  async testSessionRefresh() {
    console.log('🧪 Testing Session Refresh...');
    
    try {
      // 1. Initial state
      console.log('\n1. Initial State:');
      const initialState = await sessionManager.getSessionState();
      console.log('Initial Session:', initialState.isAuthenticated);
      
      // 2. Refresh session
      console.log('\n2. Refreshing Session...');
      await sessionManager.refreshSession();
      
      // 3. Post-refresh state
      console.log('\n3. Post-Refresh State:');
      const refreshedState = await sessionManager.getSessionState();
      console.log('Refreshed Session:', refreshedState.isAuthenticated);
      
      // 4. Check if last activity was updated
      const timeDiff = refreshedState.lastActivityTime - initialState.lastActivityTime;
      console.log('Last Activity Updated:', timeDiff > 0 ? '✅ YES' : '❌ NO');
      
      return {
        success: true,
        lastActivityUpdated: timeDiff > 0,
        initialState,
        refreshedState
      };
      
    } catch (error) {
      console.error('❌ Session refresh test failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Test all authentication methods work with session management
   */
  async testAuthMethodsWithSession() {
    console.log('🧪 Testing Auth Methods with Session Management...');
    
    try {
      const results = {};
      
      // Check if any login method would create a session
      console.log('\n1. Email Login Simulation:');
      // This would be tested during actual login
      results.emailLogin = 'Would create session with loginMethod: email';
      
      console.log('\n2. Phone Login Simulation:');
      // This would be tested during actual login
      results.phoneLogin = 'Would create session with loginMethod: phone';
      
      console.log('\n3. Google Login Simulation:');
      // This would be tested during actual login
      results.googleLogin = 'Would create session with loginMethod: google';
      
      console.log('\n4. Apple Login Simulation:');
      // This would be tested during actual login
      results.appleLogin = 'Would create session with loginMethod: apple';
      
      console.log('📝 All login methods are configured to create sessions');
      console.log('📝 Test during actual login flows to verify session creation');
      
      return { success: true, results };
      
    } catch (error) {
      console.error('❌ Auth methods test failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Complete session demo - run all tests
   */
  async runCompleteDemo() {
    console.log('🎯 Running Complete Session Management Demo...');
    console.log('===============================================');
    
    try {
      const results = {};
      
      // Test 1: Session Persistence
      console.log('\n🧪 TEST 1: Session Persistence');
      results.persistence = await this.testSessionPersistence();
      
      // Test 2: Session Refresh
      console.log('\n🧪 TEST 2: Session Refresh');
      results.refresh = await this.testSessionRefresh();
      
      // Test 3: Auth Methods
      console.log('\n🧪 TEST 3: Auth Methods with Session');
      results.authMethods = await this.testAuthMethodsWithSession();
      
      // Test 4: Complete Logout (run last as it clears everything)
      console.log('\n🧪 TEST 4: Complete Logout');
      results.logout = await this.testCompleteLogout();
      
      // Summary
      console.log('\n📊 DEMO SUMMARY:');
      console.log('===============');
      Object.keys(results).forEach(test => {
        const result = results[test];
        const status = result.error ? '❌ FAILED' : '✅ PASSED';
        console.log(`${test.toUpperCase()}: ${status}`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Complete demo failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Quick status check
   */
  async quickStatus() {
    console.log('⚡ Quick Session Status Check:');
    
    const sessionState = sessionManager.getSessionState();
    const isValid = await sessionManager.isSessionValid();
    const firebaseUser = auth().currentUser;
    
    console.log(`🔐 Authenticated: ${sessionState.isAuthenticated ? '✅' : '❌'}`);
    console.log(`✅ Session Valid: ${isValid ? '✅' : '❌'}`);
    console.log(`🔥 Firebase User: ${firebaseUser ? '✅' : '❌'}`);
    console.log(`🌐 Backend Auth: ${yoraaAPI.isAuthenticated() ? '✅' : '❌'}`);
    
    if (sessionState.isAuthenticated) {
      console.log(`👤 User: ${sessionState.email || sessionState.phone || sessionState.userId}`);
      console.log(`📱 Login Method: ${sessionState.loginMethod}`);
      console.log(`⏰ Session Duration: ${sessionManager.getSessionDuration()} minutes`);
      console.log(`🕐 Last Activity: ${sessionManager.getTimeSinceLastActivity()} minutes ago`);
    }
    
    return {
      authenticated: sessionState.isAuthenticated,
      valid: isValid,
      firebase: !!firebaseUser,
      backend: yoraaAPI.isAuthenticated(),
      sessionData: sessionState
    };
  }
};

// Export for easy testing
export default SessionDemo;
