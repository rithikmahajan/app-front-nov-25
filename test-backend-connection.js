/**
 * Backend Connection Test Script
 * Run this to verify your backend connectivity
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8001/api';

async function testBackend() {
  console.log('🧪 Testing Backend Connection...\n');
  console.log(`Testing URL: ${BACKEND_URL}\n`);

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing /health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL.replace('/api', '')}/api/health`, {
      timeout: 5000
    });
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Categories endpoint
    console.log('\n2️⃣ Testing /categories endpoint...');
    const categoriesResponse = await axios.get(`${BACKEND_URL}/categories`, {
      timeout: 5000
    });
    console.log('✅ Categories loaded:', categoriesResponse.data.length || 0, 'categories found');
    
    if (categoriesResponse.data.length > 0) {
      console.log('📦 Sample categories:', categoriesResponse.data.slice(0, 3).map(c => c.name || c.title));
    }

    // Test 3: Subcategories endpoint
    console.log('\n3️⃣ Testing /subcategories endpoint...');
    const subcategoriesResponse = await axios.get(`${BACKEND_URL}/subcategories`, {
      timeout: 5000
    });
    console.log('✅ Subcategories loaded:', subcategoriesResponse.data.length || 0, 'subcategories found');

    console.log('\n✅ ALL TESTS PASSED! Backend is working correctly.');
    console.log('\n📱 Your iOS Simulator should use: http://localhost:8001/api');
    console.log('🤖 Your Android Emulator should use: http://10.0.2.2:8001/api (with adb reverse)');
    
  } catch (error) {
    console.error('\n❌ Backend test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Backend is not running on port 8001!');
      console.error('Please start your backend server first.');
    } else if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend();
