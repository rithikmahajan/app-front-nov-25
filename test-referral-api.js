/**
 * Test script to debug referral code API endpoints
 * Run with: node test-referral-api.js
 */

const BASE_URL = 'http://localhost:3001'; // Update with your backend URL

// Test function to check all possible endpoints
async function testReferralEndpoints() {
  console.log('🧪 Testing Referral Code API Endpoints\n');
  console.log('Backend URL:', BASE_URL);
  console.log('=' .repeat(60));
  
  // You'll need to replace this with an actual user token
  const testToken = 'YOUR_USER_TOKEN_HERE';
  
  const endpoints = [
    '/api/referral/code',
    '/api/promoCode/user/available',
    '/api/promoCode',
    '/api/promoCode/codes',
    '/api/profile'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing: ${endpoint}`);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success (${response.status})`);
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ Failed (${response.status})`);
        console.log('Error:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`❌ Request failed:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!');
}

// Instructions
console.log(`
📋 INSTRUCTIONS:
1. Update BASE_URL with your backend URL (currently: ${BASE_URL})
2. Get a valid user token from your app (check AsyncStorage or login response)
3. Replace 'YOUR_USER_TOKEN_HERE' with the actual token
4. Run: node test-referral-api.js

This will help identify which endpoint works and what data structure it returns.
`);

// Uncomment to run the test
// testReferralEndpoints();
