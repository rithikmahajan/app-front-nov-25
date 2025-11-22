#!/usr/bin/env node

/**
 * Test script to verify rewards backend integration
 * Run with: node test-rewards-backend.js
 */

const API_BASE_URL = 'https://api.youraa.in'; // Update with your actual backend URL

async function testEndpoint(url, requiresAuth = false) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // If endpoint requires auth, you'll need to add a token here
    if (requiresAuth) {
      // headers['Authorization'] = 'Bearer YOUR_TEST_TOKEN';
      console.log('⚠️  Auth required - skipping for now (add token to test)');
      return { status: 'skipped', reason: 'auth required' };
    }
    
    console.log(`🔄 Testing: ${url}`);
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS: ${url}`);
      console.log('📦 Response:', JSON.stringify(data, null, 2));
      return { status: 'success', data };
    } else {
      console.log(`❌ FAILED: ${url}`);
      console.log(`📛 Status: ${response.status}`);
      console.log('📦 Response:', JSON.stringify(data, null, 2));
      return { status: 'failed', data };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${url}`);
    console.log(`📛 Message: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Rewards Backend Integration Tests\n');
  console.log(`🌐 API Base URL: ${API_BASE_URL}\n`);
  console.log('=' .repeat(60));
  
  // Test 1: Banner endpoint
  console.log('\n📋 Test 1: Get Rewards Banner');
  console.log('-'.repeat(60));
  const bannerResult = await testEndpoint(`${API_BASE_URL}/api/manage-banners-rewards`);
  
  // Test 2: Loyalty tiers endpoint
  console.log('\n📋 Test 2: Get Loyalty Tiers');
  console.log('-'.repeat(60));
  const tiersResult = await testEndpoint(`${API_BASE_URL}/api/loyalty/tiers`);
  
  // Test 3: User loyalty status (requires auth)
  console.log('\n📋 Test 3: Get User Loyalty Status (Auth Required)');
  console.log('-'.repeat(60));
  const statusResult = await testEndpoint(`${API_BASE_URL}/api/loyalty/user/status`, true);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Banner Endpoint: ${bannerResult.status.toUpperCase()}`);
  console.log(`Tiers Endpoint: ${tiersResult.status.toUpperCase()}`);
  console.log(`User Status Endpoint: ${statusResult.status.toUpperCase()}`);
  
  const criticalEndpointsWorking = 
    bannerResult.status === 'success' && 
    tiersResult.status === 'success';
  
  if (criticalEndpointsWorking) {
    console.log('\n✅ All critical endpoints are working!');
    console.log('   The rewards screen should display properly.');
  } else {
    console.log('\n❌ Some critical endpoints are not working.');
    console.log('   The rewards screen may show an error.');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. If banner/tiers endpoints are working, open the app and check the Rewards tab');
  console.log('2. The default tab should now be "Rewards" (not Giveaways)');
  console.log('3. If you have 0 points, you should see "No purchases yet" with a Shop Now button');
  console.log('4. The tier circles should show: 100, 200, 300, 400, 500');
  console.log('5. To test user status endpoint, log in to the app and it will fetch automatically');
  console.log('\n');
}

// Run tests
runTests().catch(console.error);
