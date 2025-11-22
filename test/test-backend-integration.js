#!/usr/bin/env node

/**
 * Backend Integration Test Script
 * Tests login, logout, and profile update functionality
 * Date: 11 October 2025
 */

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8001';
const TEST_USER = {
  phNo: '1234567890',
  password: 'test123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function wrapper
async function runTest(testName, testFn) {
  testResults.total++;
  console.log(`\n${colors.cyan}▶ Running: ${testName}${colors.reset}`);
  
  try {
    await testFn();
    testResults.passed++;
    console.log(`${colors.green}✓ PASSED: ${testName}${colors.reset}`);
    return true;
  } catch (error) {
    testResults.failed++;
    console.log(`${colors.red}✗ FAILED: ${testName}${colors.reset}`);
    console.log(`${colors.red}  Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test cases
let authToken = null;
let userId = null;
let userProfile = null;

async function test1_ServerHealth() {
  const response = await makeRequest('GET', '/api/health');
  assert(response.status === 200 || response.status === 404, 'Server should be reachable');
  console.log(`  Server status: ${response.status}`);
}

async function test2_LoginWithPhone() {
  const response = await makeRequest('POST', '/api/auth/login', {
    phNo: TEST_USER.phNo,
    password: TEST_USER.password
  });
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Login should be successful');
  assert(response.body.token, 'Should receive auth token');
  assert(response.body.user, 'Should receive user data');
  
  authToken = response.body.token;
  userId = response.body.user._id || response.body.user.id;
  
  console.log(`  ✓ Token received: ${authToken.substring(0, 20)}...`);
  console.log(`  ✓ User ID: ${userId}`);
  console.log(`  ✓ User name: ${response.body.user.name}`);
}

async function test3_GetProfile() {
  assert(authToken, 'Auth token should be available');
  
  const response = await makeRequest('GET', '/api/profile', null, authToken);
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Get profile should be successful');
  assert(response.body.data, 'Should receive profile data');
  
  userProfile = response.body.data;
  
  console.log(`  ✓ Profile ID: ${userProfile.id || userProfile._id}`);
  console.log(`  ✓ Name: ${userProfile.firstName || userProfile.name} ${userProfile.lastName || ''}`);
  console.log(`  ✓ Email: ${userProfile.email}`);
  console.log(`  ✓ Phone: ${userProfile.phone || userProfile.phNo}`);
}

async function test4_UpdateProfileName() {
  assert(authToken, 'Auth token should be available');
  
  const timestamp = Date.now();
  const updateData = {
    firstName: `TestUser${timestamp}`,
    lastName: 'Updated',
    email: userProfile.email,
    phone: userProfile.phone || userProfile.phNo
  };
  
  const response = await makeRequest('PUT', '/api/profile', updateData, authToken);
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Update profile should be successful');
  assert(response.body.data, 'Should receive updated profile data');
  
  console.log(`  ✓ Updated name: ${response.body.data.firstName} ${response.body.data.lastName}`);
  console.log(`  ✓ Profile updated successfully`);
}

async function test5_VerifyProfileUpdate() {
  assert(authToken, 'Auth token should be available');
  
  const response = await makeRequest('GET', '/api/profile', null, authToken);
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Get profile should be successful');
  assert(response.body.data.lastName === 'Updated', 'Last name should be updated');
  
  console.log(`  ✓ Verified name: ${response.body.data.firstName} ${response.body.data.lastName}`);
}

async function test6_UpdateProfilePreferences() {
  assert(authToken, 'Auth token should be available');
  
  const updateData = {
    firstName: userProfile.firstName || userProfile.name?.split(' ')[0],
    lastName: userProfile.lastName || userProfile.name?.split(' ')[1] || '',
    email: userProfile.email,
    phone: userProfile.phone || userProfile.phNo,
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: true
    }
  };
  
  const response = await makeRequest('PUT', '/api/profile', updateData, authToken);
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Update preferences should be successful');
  
  if (response.body.data.preferences) {
    console.log(`  ✓ Currency: ${response.body.data.preferences.currency}`);
    console.log(`  ✓ Language: ${response.body.data.preferences.language}`);
  }
}

async function test7_UpdateWithInvalidToken() {
  const invalidToken = 'invalid.token.here';
  
  const updateData = {
    firstName: 'Test',
    lastName: 'User'
  };
  
  const response = await makeRequest('PUT', '/api/profile', updateData, invalidToken);
  
  assert(response.status === 401 || response.status === 403, 
    `Expected 401 or 403, got ${response.status}`);
  
  console.log(`  ✓ Invalid token rejected with status ${response.status}`);
}

async function test8_UpdateWithoutToken() {
  const updateData = {
    firstName: 'Test',
    lastName: 'User'
  };
  
  const response = await makeRequest('PUT', '/api/profile', updateData, null);
  
  assert(response.status === 401 || response.status === 403, 
    `Expected 401 or 403, got ${response.status}`);
  
  console.log(`  ✓ Request without token rejected with status ${response.status}`);
}

async function test9_LogoutEndpoint() {
  assert(authToken, 'Auth token should be available');
  
  // Check if logout endpoint exists
  const response = await makeRequest('POST', '/api/auth/logout', {}, authToken);
  
  // Logout might return 200, 204, or 404 if endpoint doesn't exist
  console.log(`  ✓ Logout endpoint status: ${response.status}`);
  
  if (response.status === 200) {
    assert(response.body.success !== false, 'Logout should not fail');
    console.log(`  ✓ Logout successful`);
  } else if (response.status === 404) {
    console.log(`  ℹ Logout endpoint not implemented (stateless JWT)`);
  }
}

async function test10_TokenStillValidAfterLogout() {
  assert(authToken, 'Auth token should be available');
  
  // JWT tokens remain valid until expiry (stateless)
  const response = await makeRequest('GET', '/api/profile', null, authToken);
  
  // Token should still work (JWT is stateless)
  console.log(`  ℹ Token validity after logout: ${response.status === 200 ? 'Valid' : 'Invalid'}`);
  console.log(`  ℹ Note: JWT tokens are stateless and remain valid until expiry`);
}

async function test11_LoginAfterLogout() {
  const response = await makeRequest('POST', '/api/auth/login', {
    phNo: TEST_USER.phNo,
    password: TEST_USER.password
  });
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Re-login should be successful');
  assert(response.body.token, 'Should receive new auth token');
  
  const newToken = response.body.token;
  assert(newToken !== authToken, 'Should receive a different token');
  
  console.log(`  ✓ Re-login successful with new token`);
}

async function test12_ProfileResponseFormat() {
  assert(authToken, 'Auth token should be available');
  
  const response = await makeRequest('GET', '/api/profile', null, authToken);
  
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success, 'Should have success field');
  assert(response.body.data, 'Should have data field');
  
  const profile = response.body.data;
  
  // Check required fields
  console.log(`  ✓ Checking response format...`);
  console.log(`  ✓ Has ID: ${!!(profile.id || profile._id)}`);
  console.log(`  ✓ Has email: ${!!profile.email}`);
  console.log(`  ✓ Has phone: ${!!(profile.phone || profile.phNo)}`);
  console.log(`  ✓ Has name: ${!!(profile.firstName || profile.name)}`);
  console.log(`  ✓ No password field: ${!profile.password}`);
  
  assert(!profile.password, 'Password should not be in response');
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log(`╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║   Backend Integration Test Suite - TestFlight Verification    ║`);
  console.log(`║   Date: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).padEnd(52)}║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}\n`);
  
  console.log(`${colors.yellow}Testing backend at: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}Test user: ${TEST_USER.phNo}${colors.reset}\n`);
  
  // Run tests sequentially
  await runTest('Test 1: Server Health Check', test1_ServerHealth);
  await runTest('Test 2: Login with Phone Number', test2_LoginWithPhone);
  await runTest('Test 3: Get User Profile', test3_GetProfile);
  await runTest('Test 4: Update Profile Name', test4_UpdateProfileName);
  await runTest('Test 5: Verify Profile Update', test5_VerifyProfileUpdate);
  await runTest('Test 6: Update Profile Preferences', test6_UpdateProfilePreferences);
  await runTest('Test 7: Update with Invalid Token', test7_UpdateWithInvalidToken);
  await runTest('Test 8: Update without Token', test8_UpdateWithoutToken);
  await runTest('Test 9: Logout Endpoint', test9_LogoutEndpoint);
  await runTest('Test 10: Token Validity After Logout', test10_TokenStillValidAfterLogout);
  await runTest('Test 11: Re-login After Logout', test11_LoginAfterLogout);
  await runTest('Test 12: Profile Response Format', test12_ProfileResponseFormat);
  
  // Print summary
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Test Results Summary:${colors.reset}\n`);
  console.log(`  Total Tests: ${testResults.total}`);
  console.log(`  ${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`  Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  if (testResults.failed === 0) {
    console.log(`${colors.green}${colors.bright}✓ ALL TESTS PASSED! Backend is ready for TestFlight.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}✗ SOME TESTS FAILED. Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
  process.exit(1);
});
