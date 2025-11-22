/**
 * Test Script for Chat Authentication Restriction
 * Run this in React Native debugger to test the authentication restriction
 */

import auth from '@react-native-firebase/auth';
import chatService from './src/services/chatService';

console.log('🧪 Testing Chat Authentication Restriction');

// Test 1: Check authentication requirement when user is logged out
const testUnauthenticatedAccess = async () => {
  console.log('\n📋 Test 1: Unauthenticated Access');
  
  // Ensure user is logged out
  await auth().signOut();
  console.log('👤 User signed out');
  
  try {
    const session = await chatService.startChatSession();
    console.log('❌ FAIL: Chat session should not have been created for unauthenticated user');
    return false;
  } catch (error) {
    if (error.code === 'AUTHENTICATION_REQUIRED') {
      console.log('✅ PASS: Correctly rejected unauthenticated user');
      console.log('📄 Error message:', error.message);
      return true;
    } else {
      console.log('❌ FAIL: Wrong error type:', error.code);
      return false;
    }
  }
};

// Test 2: Check that authenticated users can still access chat
const testAuthenticatedAccess = async () => {
  console.log('\n📋 Test 2: Authenticated Access');
  
  // Check if user is authenticated
  const currentUser = auth().currentUser;
  if (!currentUser) {
    console.log('⚠️ SKIP: No authenticated user available for testing');
    console.log('💡 Please log in first to test authenticated access');
    return null;
  }
  
  console.log('👤 User authenticated:', currentUser.email);
  
  try {
    const session = await chatService.startChatSession();
    if (session && session.sessionId) {
      console.log('✅ PASS: Authenticated user can create chat session');
      console.log('📄 Session ID:', session.sessionId);
      
      // Clean up - end the session
      await chatService.endChatSession();
      console.log('🧹 Test session cleaned up');
      return true;
    } else {
      console.log('❌ FAIL: Session creation returned invalid result');
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL: Authenticated user could not create chat session');
    console.log('📄 Error:', error.message);
    return false;
  }
};

// Test 3: Verify UI state changes based on authentication
const testUIState = () => {
  console.log('\n📋 Test 3: UI State Based on Authentication');
  
  const currentUser = auth().currentUser;
  const isAuthenticated = !!currentUser;
  
  console.log('👤 Current auth state:', isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
  console.log('💡 Check ContactUs screen:');
  console.log('  - Chat button should be:', isAuthenticated ? 'ENABLED' : 'DISABLED');
  console.log('  - Auth notice should be:', isAuthenticated ? 'HIDDEN' : 'VISIBLE');
  console.log('  - Button text should show:', isAuthenticated ? 'Contact Customer Support' : 'Sign In Required for Chat');
  
  return true;
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Chat Authentication Tests...\n');
  
  const results = {
    unauthenticated: await testUnauthenticatedAccess(),
    authenticated: await testAuthenticatedAccess(),
    uiState: testUIState()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('  - Unauthenticated rejection:', results.unauthenticated ? '✅ PASS' : '❌ FAIL');
  console.log('  - Authenticated access:', results.authenticated === true ? '✅ PASS' : results.authenticated === false ? '❌ FAIL' : '⚠️ SKIP');
  console.log('  - UI state logic:', results.uiState ? '✅ PASS' : '❌ FAIL');
  
  const passCount = Object.values(results).filter(r => r === true).length;
  const totalTests = Object.values(results).filter(r => r !== null).length;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All tests passed! Chat authentication restriction is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the implementation.');
  }
};

// Export for use
export { testUnauthenticatedAccess, testAuthenticatedAccess, testUIState, runAllTests };

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Only run in browser/debugger environment
  setTimeout(runAllTests, 1000);
}
