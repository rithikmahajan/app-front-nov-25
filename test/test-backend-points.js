#!/usr/bin/env node

/**
 * Test script to verify backend API responses for rewards system
 * This helps debug why points are showing as 0 or static values
 */

const BASE_URL = 'http://185.193.19.244:8080';

async function testBackendAPIs() {
  console.log('🧪 Testing Backend APIs for Rewards System\n');
  console.log('=' .repeat(60));
  
  // Test 1: Loyalty Tiers (Public)
  console.log('\n1️⃣ Testing GET /api/loyalty/tiers (Public)');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/loyalty/tiers`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.tiers) {
      console.log(`\n✨ Found ${data.data.tiers.length} tiers:`);
      data.data.tiers.forEach(tier => {
        console.log(`   - ${tier.name}: ${tier.pointsRequired} points (${tier.color})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: User Loyalty Status (Requires Auth)
  console.log('\n\n2️⃣ Testing GET /api/loyalty/user/status (Authenticated)');
  console.log('-'.repeat(60));
  console.log('⚠️  This requires a valid auth token');
  console.log('📋 To test with your token:');
  console.log('   1. Login to the app');
  console.log('   2. Check the app console logs for the auth token');
  console.log('   3. Run this command:\n');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log(`        ${BASE_URL}/api/loyalty/user/status\n`);
  
  // Try without auth to see the error
  try {
    const response = await fetch(`${BASE_URL}/api/loyalty/user/status`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly returns 401 without authentication');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Banner Config (Public)
  console.log('\n\n3️⃣ Testing GET /api/manage-banners-rewards (Public)');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/manage-banners-rewards`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 DEBUGGING TIPS:');
  console.log('   • If tiers show [100, 200, 300, 400, 500] → User has 0 points');
  console.log('   • If user should have points but shows 0:');
  console.log('     1. Check if backend is returning correct points in /api/loyalty/user/status');
  console.log('     2. Verify auth token is being sent correctly');
  console.log('     3. Check console logs in the app for API responses');
  console.log('   • Check React Native console for detailed logs');
  console.log('\n📱 To see app logs:');
  console.log('   npx react-native log-ios');
  console.log('   or');
  console.log('   npx react-native log-android\n');
}

// Run tests
testBackendAPIs().catch(console.error);
