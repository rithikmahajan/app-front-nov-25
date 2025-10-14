/**
 * Comprehensive User Endpoint Testing Script
 * Tests: Login, Profile Get, Profile Update, Logout
 * Date: 11 October 2025
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8001/api';
let authToken = '';
let userId = '';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.bold}${colors.blue}${title}${colors.reset}`);
  console.log(`${'='.repeat(70)}\n`);
}

function logError(message, error) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
  } else {
    console.log(`   Error:`, error.message);
  }
}

// Test 1: User Login with Phone Number
async function testLogin() {
  logSection('TEST 1: User Login (Phone Number)');
  
  try {
    // Try with a verified user
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      phNo: '9999999999',
      password: 'Test@123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id || response.data.data.user._id;
      
      log('✅', 'Login Successful!', colors.green);
      console.log('   Token:', authToken.substring(0, 50) + '...');
      console.log('   User ID:', userId);
      console.log('   User Name:', response.data.data.user.name);
      console.log('   User Email:', response.data.data.user.email);
      console.log('   User Phone:', response.data.data.user.phone);
      return true;
    } else {
      log('❌', 'Login Failed: Unexpected response format', colors.red);
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Login Failed', error);
    
    // Try alternative login methods
    log('⚠️', 'Trying alternative login credentials...', colors.yellow);
    
    // Try with email
    try {
      const emailResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'rithikmahajan272727@gmail.com',
        password: 'test123'
      });
      
      if (emailResponse.data.success) {
        authToken = emailResponse.data.data.token;
        userId = emailResponse.data.data.user.id || emailResponse.data.data.user._id;
        log('✅', 'Login with Email Successful!', colors.green);
        console.log('   Token:', authToken.substring(0, 50) + '...');
        console.log('   User ID:', userId);
        return true;
      }
    } catch (emailError) {
      logError('Email login also failed', emailError);
    }
    
    return false;
  }
}

// Test 2: Get User Profile
async function testGetProfile() {
  logSection('TEST 2: Get User Profile (GET /api/profile)');
  
  if (!authToken) {
    log('⏭️', 'Skipping - No auth token', colors.yellow);
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      log('✅', 'Profile Retrieved Successfully!', colors.green);
      console.log('   Profile Data:');
      console.log(JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      log('❌', 'Profile Retrieval Failed', colors.red);
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Get Profile Failed', error);
    return false;
  }
}

// Test 3: Update User Profile (New PUT /api/profile endpoint)
async function testUpdateProfile() {
  logSection('TEST 3: Update User Profile (PUT /api/profile)');
  
  if (!authToken) {
    log('⏭️', 'Skipping - No auth token', colors.yellow);
    return false;
  }
  
  try {
    const updateData = {
      firstName: 'TestUser',
      lastName: 'Updated',
      email: 'testupdated@example.com',
      phone: '+919876543210',
      preferences: {
        currency: 'INR',
        language: 'en',
        notifications: true
      }
    };
    
    log('📝', 'Updating profile with data:', colors.blue);
    console.log(JSON.stringify(updateData, null, 2));
    
    const response = await axios.put(`${BASE_URL}/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      log('✅', 'Profile Updated Successfully!', colors.green);
      console.log('   Updated Profile:');
      console.log(JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      log('❌', 'Profile Update Failed', colors.red);
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Update Profile Failed', error);
    return false;
  }
}

// Test 4: Verify Profile Update
async function testVerifyProfileUpdate() {
  logSection('TEST 4: Verify Profile Update (GET /api/profile)');
  
  if (!authToken) {
    log('⏭️', 'Skipping - No auth token', colors.yellow);
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      log('✅', 'Profile Retrieved Successfully!', colors.green);
      
      const profile = response.data.data;
      
      // Verify the updates
      const checks = [
        { field: 'firstName', expected: 'TestUser', actual: profile.firstName },
        { field: 'lastName', expected: 'Updated', actual: profile.lastName },
        { field: 'email', expected: 'testupdated@example.com', actual: profile.email }
      ];
      
      console.log('\n   Verification Results:');
      let allPassed = true;
      checks.forEach(check => {
        const passed = check.actual === check.expected;
        if (passed) {
          log('  ✅', `${check.field}: ${check.actual}`, colors.green);
        } else {
          log('  ❌', `${check.field}: Expected "${check.expected}", got "${check.actual}"`, colors.red);
          allPassed = false;
        }
      });
      
      return allPassed;
    } else {
      log('❌', 'Profile Verification Failed', colors.red);
      return false;
    }
  } catch (error) {
    logError('Verify Profile Failed', error);
    return false;
  }
}

// Test 5: Logout
async function testLogout() {
  logSection('TEST 5: User Logout (POST /api/auth/logout)');
  
  if (!authToken) {
    log('⏭️', 'Skipping - No auth token', colors.yellow);
    return false;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success || response.status === 200) {
      log('✅', 'Logout Successful!', colors.green);
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      
      // Clear token
      const oldToken = authToken;
      authToken = '';
      
      // Verify token is invalid now
      log('🔍', 'Verifying token is invalidated...', colors.blue);
      try {
        await axios.get(`${BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${oldToken}`
          }
        });
        log('⚠️', 'Warning: Token still valid after logout!', colors.yellow);
        return false;
      } catch (verifyError) {
        if (verifyError.response && verifyError.response.status === 401) {
          log('✅', 'Token successfully invalidated!', colors.green);
          return true;
        } else {
          log('❌', 'Unexpected error during token verification', colors.red);
          return false;
        }
      }
    } else {
      log('❌', 'Logout Failed', colors.red);
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Logout Failed', error);
    return false;
  }
}

// Test 6: Test Unauthorized Access
async function testUnauthorizedAccess() {
  logSection('TEST 6: Test Unauthorized Access (No Token)');
  
  try {
    await axios.get(`${BASE_URL}/profile`);
    log('❌', 'Security Issue: Accessed profile without token!', colors.red);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✅', 'Unauthorized access correctly blocked!', colors.green);
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message || 'No token provided');
      return true;
    } else {
      logError('Unexpected error', error);
      return false;
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('🚀', 'Starting Comprehensive User Endpoint Tests', colors.bold);
  log('📅', `Date: ${new Date().toLocaleString()}`, colors.blue);
  log('🌐', `Backend URL: ${BASE_URL}`, colors.blue);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Verify Update', fn: testVerifyProfileUpdate },
    { name: 'Logout', fn: testLogout },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      log('❌', `Test "${test.name}" threw an error:`, colors.red);
      console.error(error);
    }
  }
  
  // Summary
  logSection('TEST SUMMARY');
  log('📊', `Total Tests: ${results.total}`, colors.blue);
  log('✅', `Passed: ${results.passed}`, colors.green);
  log('❌', `Failed: ${results.failed}`, colors.red);
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  log('📈', `Success Rate: ${percentage}%`, percentage >= 80 ? colors.green : colors.red);
  
  if (results.passed === results.total) {
    log('🎉', 'ALL TESTS PASSED!', colors.green + colors.bold);
  } else {
    log('⚠️', 'SOME TESTS FAILED - Please review above', colors.yellow);
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
