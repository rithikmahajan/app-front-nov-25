/**
 * Firebase JWT Chat Integration Test Script
 * 
 * This script tests the complete Firebase JWT integration with the backend chat system.
 * Run this in React Native debugger console to verify the integration works correctly.
 * 
 * Usage:
 * 1. Ensure you're logged in with Firebase
 * 2. Copy and paste this script into React Native debugger console
 * 3. Run: await testFirebaseChatIntegration()
 */

import auth from '@react-native-firebase/auth';
import chatService from './src/services/chatService';
import yoraaAPI from './src/services/yoraaAPI';

console.log('🧪 Firebase JWT Chat Integration Test Suite');

/**
 * Main test function - runs all Firebase JWT integration tests
 */
const testFirebaseChatIntegration = async () => {
  console.log('\n🚀 Starting Firebase JWT Chat Integration Tests...\n');
  
  const results = {
    authentication: null,
    tokenValidation: null,
    sessionCreation: null,
    messageSending: null,
    messagePolling: null,
    sessionEnding: null,
    errorHandling: null
  };
  
  try {
    // Test 1: Authentication Status
    results.authentication = await testAuthentication();
    
    // Test 2: Firebase Token Validation
    results.tokenValidation = await testFirebaseTokenValidation();
    
    // Test 3: Chat Session Creation with Firebase JWT
    results.sessionCreation = await testChatSessionCreation();
    
    // Test 4: Message Sending with Firebase JWT
    results.messageSending = await testMessageSending();
    
    // Test 5: Message Polling with Firebase JWT
    results.messagePolling = await testMessagePolling();
    
    // Test 6: Session Ending with Firebase JWT
    results.sessionEnding = await testSessionEnding();
    
    // Test 7: Error Handling for Invalid Tokens
    results.errorHandling = await testErrorHandling();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
  
  // Print summary
  printTestSummary(results);
  
  return results;
};

/**
 * Test 1: Verify user is authenticated with Firebase
 */
const testAuthentication = async () => {
  console.log('📋 Test 1: Firebase Authentication Status');
  
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      console.log('❌ FAIL: No authenticated Firebase user');
      console.log('💡 Please log in with Firebase first');
      return { success: false, error: 'No authenticated user' };
    }
    
    console.log('✅ PASS: Firebase user authenticated');
    console.log('👤 User:', currentUser.email || currentUser.uid);
    console.log('🔐 Email verified:', currentUser.emailVerified);
    
    return { 
      success: true, 
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified
      }
    };
    
  } catch (error) {
    console.log('❌ FAIL: Authentication check failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test 2: Verify Firebase token can be obtained and is valid
 */
const testFirebaseTokenValidation = async () => {
  console.log('\n📋 Test 2: Firebase Token Validation');
  
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return { success: false, error: 'No authenticated user' };
    }
    
    console.log('🔄 Getting Firebase ID token...');
    const idToken = await currentUser.getIdToken();
    
    if (!idToken) {
      console.log('❌ FAIL: No Firebase ID token obtained');
      return { success: false, error: 'No ID token' };
    }
    
    console.log('✅ PASS: Firebase ID token obtained');
    console.log('🔑 Token length:', idToken.length);
    console.log('🔑 Token preview:', idToken.substring(0, 50) + '...');
    
    // Test token refresh
    console.log('🔄 Testing token refresh...');
    const refreshedToken = await currentUser.getIdToken(true);
    
    if (refreshedToken && refreshedToken !== idToken) {
      console.log('✅ PASS: Token refresh successful');
    } else {
      console.log('ℹ️ INFO: Token refresh returned same token (expected if recent)');
    }
    
    return { 
      success: true, 
      tokenLength: idToken.length,
      refreshWorks: !!refreshedToken
    };
    
  } catch (error) {
    console.log('❌ FAIL: Token validation failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test 3: Test chat session creation with Firebase JWT
 */
const testChatSessionCreation = async () => {
  console.log('\n📋 Test 3: Chat Session Creation with Firebase JWT');
  
  try {
    console.log('🚀 Creating chat session with Firebase authentication...');
    
    const session = await chatService.startChatSession();
    
    if (!session || !session.sessionId) {
      console.log('❌ FAIL: Chat session creation failed');
      return { success: false, error: 'No session created' };
    }
    
    console.log('✅ PASS: Chat session created successfully');
    console.log('📄 Session ID:', session.sessionId);
    console.log('👤 User Info:', session.userInfo);
    console.log('📅 Start Time:', session.startTime);
    
    return { 
      success: true, 
      sessionId: session.sessionId,
      userInfo: session.userInfo
    };
    
  } catch (error) {
    console.log('❌ FAIL: Session creation failed:', error.message);
    console.log('🔍 Error code:', error.code);
    
    if (error.code === 'AUTHENTICATION_REQUIRED') {
      console.log('ℹ️ This is expected if Firebase JWT validation is not working');
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Test 4: Test message sending with Firebase JWT
 */
const testMessageSending = async () => {
  console.log('\n📋 Test 4: Message Sending with Firebase JWT');
  
  try {
    // Check if we have an active session
    if (!chatService.activeSession) {
      console.log('⚠️ SKIP: No active chat session for message testing');
      return { success: false, error: 'No active session' };
    }
    
    console.log('💬 Sending test message...');
    const testMessage = `Test message from Firebase JWT integration - ${new Date().toISOString()}`;
    
    await chatService.sendMessage(testMessage);
    
    console.log('✅ PASS: Message sent successfully');
    console.log('📝 Message:', testMessage);
    
    return { success: true, message: testMessage };
    
  } catch (error) {
    console.log('❌ FAIL: Message sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test 5: Test message polling with Firebase JWT
 */
const testMessagePolling = async () => {
  console.log('\n📋 Test 5: Message Polling with Firebase JWT');
  
  try {
    // Check if we have an active session
    if (!chatService.activeSession) {
      console.log('⚠️ SKIP: No active chat session for polling test');
      return { success: false, error: 'No active session' };
    }
    
    console.log('🔄 Testing message polling...');
    const sessionId = chatService.activeSession.sessionId;
    
    // Test direct API polling
    const pollResult = await yoraaAPI.pollForMessages(sessionId);
    
    if (pollResult && pollResult.success !== undefined) {
      console.log('✅ PASS: Message polling successful');
      console.log('📊 Poll result:', pollResult.success ? 'SUCCESS' : 'NO_NEW_MESSAGES');
      return { success: true, pollResult };
    } else {
      console.log('❌ FAIL: Unexpected polling response');
      return { success: false, error: 'Unexpected response' };
    }
    
  } catch (error) {
    console.log('❌ FAIL: Message polling failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test 6: Test session ending with Firebase JWT
 */
const testSessionEnding = async () => {
  console.log('\n📋 Test 6: Session Ending with Firebase JWT');
  
  try {
    // Check if we have an active session
    if (!chatService.activeSession) {
      console.log('⚠️ SKIP: No active chat session to end');
      return { success: false, error: 'No active session' };
    }
    
    console.log('🏁 Ending chat session...');
    
    await chatService.endChatSession();
    
    console.log('✅ PASS: Chat session ended successfully');
    
    return { success: true };
    
  } catch (error) {
    console.log('❌ FAIL: Session ending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test 7: Test error handling for authentication failures
 */
const testErrorHandling = async () => {
  console.log('\n📋 Test 7: Error Handling for Authentication Failures');
  
  try {
    console.log('🔄 Testing unauthenticated access...');
    
    // Temporarily sign out to test unauthenticated access
    const originalUser = auth().currentUser;
    await auth().signOut();
    
    try {
      await chatService.startChatSession();
      console.log('❌ FAIL: Unauthenticated access should have been blocked');
      
      // Re-authenticate
      if (originalUser) {
        // Note: This is a simplified re-auth, in real scenario user would need to login again
        console.log('🔄 Re-authenticating...');
      }
      
      return { success: false, error: 'Unauthenticated access not blocked' };
      
    } catch (error) {
      if (error.code === 'AUTHENTICATION_REQUIRED') {
        console.log('✅ PASS: Unauthenticated access properly blocked');
        console.log('📄 Error message:', error.message);
        
        // TODO: Re-authenticate here in a real test
        console.log('ℹ️ Note: Please log back in to continue using the app');
        
        return { success: true, errorHandled: true };
      } else {
        console.log('❌ FAIL: Unexpected error type:', error.code);
        return { success: false, error: `Unexpected error: ${error.message}` };
      }
    }
    
  } catch (error) {
    console.log('❌ FAIL: Error handling test failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Print test summary
 */
const printTestSummary = (results) => {
  console.log('\n🎯 Firebase JWT Chat Integration Test Results');
  console.log('================================================');
  
  let passCount = 0;
  let totalCount = 0;
  
  Object.keys(results).forEach(testName => {
    const result = results[testName];
    totalCount++;
    
    if (result && result.success) {
      console.log(`✅ ${testName}: PASS`);
      passCount++;
    } else if (result && result.error) {
      console.log(`❌ ${testName}: FAIL - ${result.error}`);
    } else {
      console.log(`⚠️ ${testName}: SKIPPED`);
    }
  });
  
  console.log('================================================');
  console.log(`📊 Results: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All tests passed! Firebase JWT integration is working correctly.');
  } else if (passCount > 0) {
    console.log('⚠️ Some tests failed. Check the errors above and verify backend implementation.');
  } else {
    console.log('❌ All tests failed. Firebase JWT integration needs attention.');
  }
  
  console.log('\n💡 Next Steps:');
  if (passCount < totalCount) {
    console.log('1. Verify backend Firebase Admin SDK is properly configured');
    console.log('2. Check backend is running and accessible');
    console.log('3. Verify all /api/chat/* endpoints require Firebase JWT authentication');
    console.log('4. Check backend logs for Firebase token validation errors');
  } else {
    console.log('1. Integration is working! Test with real chat scenarios');
    console.log('2. Monitor backend logs for successful Firebase token validations');
    console.log('3. Test edge cases like token expiration and refresh');
  }
};

// Export the test function for manual execution
console.log('\n🚀 Firebase JWT Chat Integration Test Ready!');
console.log('📝 To run tests, execute: testFirebaseChatIntegration()');
console.log('⚠️ Make sure you are logged in with Firebase first\n');

// Make test function available globally
global.testFirebaseChatIntegration = testFirebaseChatIntegration;

export default testFirebaseChatIntegration;
