/**
 * 🧪 QUICK FIREBASE JWT TEST SCRIPT
 * 
 * Run this to quickly test your Firebase JWT integration
 * Copy and paste this into your React Native app console or create a test button
 */

import auth from '@react-native-firebase/auth';

// Quick test function you can call from anywhere in your app
export const quickChatTest = async () => {
  console.log('🧪 Starting Quick Firebase JWT Chat Test...');
  
  try {
    // Step 1: Check Firebase Auth
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No Firebase user found - please login first');
      return false;
    }
    
    console.log(`✅ Firebase User: ${currentUser.uid} (${currentUser.email})`);
    
    // Step 2: Get Firebase ID Token
    const idToken = await currentUser.getIdToken(true);
    console.log(`✅ Firebase Token Generated (${idToken.length} chars)`);
    console.log(`🔍 Token Preview: ${idToken.substring(0, 100)}...`);
    
    // Step 3: Test Backend URL (use your app's configuration)
    const baseURL = __DEV__ 
      ? 'http://localhost:8001'        // Development
      : 'http://185.193.19.244:8001';  // Production
    
    console.log(`🌐 Testing Backend: ${baseURL}`);
    
    // Step 4: Test Chat Session Creation
    const sessionData = {
      sessionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userInfo: {
        isGuest: false,
        userId: currentUser.uid,
        firebaseUid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email || 'Test User',
        emailVerified: currentUser.emailVerified,
        phoneNumber: currentUser.phoneNumber,
        authSource: 'firebase'
      },
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    console.log('📤 Sending Request to /api/chat/session');
    console.log('📋 Request Data:', JSON.stringify(sessionData, null, 2));
    console.log('🔐 Authorization Header:', `Bearer ${idToken.substring(0, 50)}...`);
    
    const response = await fetch(`${baseURL}/api/chat/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ SUCCESS: Chat session created successfully!');
      console.log(`🎉 Session ID: ${data.data?.sessionId}`);
      return true;
    } else {
      console.error('❌ FAILED: Chat session creation failed');
      console.error(`💥 Error: ${data.message}`);
      console.error(`🔍 Status Code: ${response.status}`);
      
      // Additional debugging for 500 errors
      if (response.status === 500) {
        console.error('🚨 SERVER ERROR (500) - Backend Issues:');
        console.error('• Backend may not have Firebase Admin SDK configured');
        console.error('• Database connection issues');
        console.error('• Authentication middleware problems');
        console.error('• Check backend server logs for detailed error');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('🔍 Full Error:', error);
    return false;
  }
};

// Export for use in components
export default quickChatTest;
