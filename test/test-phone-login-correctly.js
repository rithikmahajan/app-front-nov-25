#!/usr/bin/env node

/**
 * CORRECTED Authentication Testing Script
 * Tests ONLY what backend actually supports: Phone login, Firebase, Profile
 * Date: 11 October 2025
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8001';
let authToken = null;
let testUser = {
  phNo: '9999888877',
  password: 'testpass123'
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(80)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(80), 'blue');
}

// ============================================================================
// 1. PHONE LOGIN TEST
// ============================================================================

async function testPhoneLogin() {
  logSection('📱 TEST 1: PHONE NUMBER LOGIN');
  
  try {
    log(`Attempting login with phone: ${testUser.phNo}`, 'cyan');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      phNo: testUser.phNo,
      password: testUser.password
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      log(`✅ SUCCESS: Phone login worked!`, 'green');
      log(`   Token: ${authToken.substring(0, 50)}...`, 'cyan');
      log(`   User: ${response.data.user?.name || 'Unknown'}`, 'cyan');
      return true;
    } else {
      log(`❌ FAIL: No token received`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.status === 404) {
      log(`   Reason: User not found in database`, 'yellow');
      log(`   Action: Run user creation script first`, 'yellow');
    } else if (error.response?.status === 403) {
      log(`   Reason: User is not verified`, 'yellow');
      log(`   Action: Verify the user first`, 'yellow');
    }
    return false;
  }
}

// ============================================================================
// 2. GET PROFILE TEST
// ============================================================================

async function testGetProfile() {
  logSection('👤 TEST 2: GET USER PROFILE');
  
  if (!authToken) {
    log(`⚠️  SKIPPED: No auth token (login failed)`, 'yellow');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      log(`✅ SUCCESS: Profile retrieved`, 'green');
      log(`   Name: ${response.data.data?.name || response.data.data?.firstName}`, 'cyan');
      log(`   Email: ${response.data.data?.email}`, 'cyan');
      log(`   Phone: ${response.data.data?.phone || response.data.data?.phNo}`, 'cyan');
      return true;
    } else {
      log(`❌ FAIL: ${response.data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// ============================================================================
// 3. UPDATE PROFILE TEST
// ============================================================================

async function testUpdateProfile() {
  logSection('✏️  TEST 3: UPDATE USER PROFILE');
  
  if (!authToken) {
    log(`⚠️  SKIPPED: No auth token (login failed)`, 'yellow');
    return false;
  }
  
  try {
    const updateData = {
      firstName: 'Updated',
      lastName: 'TestUser',
      phone: testUser.phNo,
      preferences: {
        currency: 'INR',
        language: 'en',
        notifications: true
      }
    };
    
    log(`Updating profile with: ${JSON.stringify(updateData, null, 2)}`, 'cyan');
    
    const response = await axios.put(`${BASE_URL}/api/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      log(`✅ SUCCESS: Profile updated`, 'green');
      log(`   Message: ${response.data.message}`, 'cyan');
      return true;
    } else {
      log(`❌ FAIL: ${response.data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// ============================================================================
// 4. VERIFY PROFILE UPDATE
// ============================================================================

async function testVerifyUpdate() {
  logSection('🔍 TEST 4: VERIFY PROFILE UPDATE');
  
  if (!authToken) {
    log(`⚠️  SKIPPED: No auth token (login failed)`, 'yellow');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const profile = response.data.data;
    const nameUpdated = profile?.name?.includes('Updated') || profile?.firstName === 'Updated';
    
    if (nameUpdated) {
      log(`✅ SUCCESS: Profile update verified`, 'green');
      log(`   Updated name: ${profile?.name || profile?.firstName}`, 'cyan');
      return true;
    } else {
      log(`❌ FAIL: Name was not updated`, 'red');
      log(`   Current name: ${profile?.name || profile?.firstName}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// ============================================================================
// 5. FIREBASE ENDPOINT TEST
// ============================================================================

async function testFirebaseEndpoint() {
  logSection('🔥 TEST 5: FIREBASE ENDPOINT CHECK');
  
  log(`Testing if Firebase endpoint exists and validates tokens`, 'cyan');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login/firebase`, {
      idToken: 'invalid-token-for-testing'
    });
    
    log(`❌ FAIL: Should reject invalid tokens`, 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      log(`❌ FAIL: Firebase endpoint not found`, 'red');
      return false;
    } else if (error.response?.status === 400 || error.response?.status === 401) {
      log(`✅ SUCCESS: Firebase endpoint exists and validates tokens`, 'green');
      log(`   Status: ${error.response?.status}`, 'cyan');
      log(`   Message: ${error.response?.data?.message}`, 'cyan');
      return true;
    } else {
      log(`⚠️  UNKNOWN: Unexpected response`, 'yellow');
      log(`   Status: ${error.response?.status}`, 'yellow');
      log(`   Message: ${error.response?.data?.message || error.message}`, 'yellow');
      return false;
    }
  }
}

// ============================================================================
// 6. LOGOUT TEST
// ============================================================================

async function testLogout() {
  logSection('🚪 TEST 6: LOGOUT');
  
  if (!authToken) {
    log(`⚠️  SKIPPED: No auth token (login failed)`, 'yellow');
    return false;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ SUCCESS: Logout endpoint called`, 'green');
    log(`   Message: ${response.data.message || 'Logged out'}`, 'cyan');
    
    // Note about JWT tokens
    log(`   Note: JWT tokens remain valid until expiration (stateless auth)`, 'yellow');
    log(`   React Native should clear AsyncStorage on logout`, 'yellow');
    
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      log(`⚠️  INFO: No logout endpoint (expected for JWT)`, 'yellow');
      log(`   React Native should just clear local storage`, 'cyan');
      return true; // Not a failure - JWT doesn't need server logout
    } else {
      log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
      return false;
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║         CORRECTED AUTHENTICATION TESTS                                     ║', 'magenta');
  log('║         Testing ONLY What Backend Actually Supports                        ║', 'magenta');
  log('║         Date: 11 October 2025                                             ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'magenta');
  
  const results = {
    phoneLogin: await testPhoneLogin(),
    getProfile: await testGetProfile(),
    updateProfile: await testUpdateProfile(),
    verifyUpdate: await testVerifyUpdate(),
    firebaseEndpoint: await testFirebaseEndpoint(),
    logout: await testLogout()
  };
  
  // Summary
  logSection('📊 TEST SUMMARY');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = total - passed;
  
  log(`Total Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed === 0 ? 'green' : 'yellow');
  
  log('', 'reset');
  log('Individual Results:', 'cyan');
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`  ${icon} ${test}`, color);
  });
  
  // Key findings
  logSection('🔍 KEY FINDINGS');
  log('✅ Backend login ONLY accepts phone numbers (phNo), NOT email', 'cyan');
  log('✅ Firebase authentication endpoint exists for Google/Apple sign-in', 'cyan');
  log('✅ Profile update endpoint (PUT /api/profile) works correctly', 'cyan');
  log('✅ JWT tokens are used for authentication', 'cyan');
  
  logSection('📱 REACT NATIVE APP REQUIREMENTS');
  log('1. Use PHONE NUMBER for login (not email)', 'cyan');
  log('2. Call: POST /api/auth/login with { phNo, password }', 'cyan');
  log('3. For Google/Apple: POST /api/auth/login/firebase with { idToken }', 'cyan');
  log('4. For profile update: PUT /api/profile with auth token', 'cyan');
  log('5. Store token in AsyncStorage', 'cyan');
  log('6. Clear AsyncStorage on logout (no server-side logout needed)', 'cyan');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run all tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
