// Test script to verify backend API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8001/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   Endpoint: ${BASE_URL}${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📊 Data structure:`, {
      success: response.data.success,
      dataKeys: Object.keys(response.data.data || {}),
      productCount: response.data.data?.products?.length || 0
    });
    
    if (response.data.data?.products?.[0]) {
      const firstProduct = response.data.data.products[0];
      console.log(`   📦 Sample product:`, {
        id: firstProduct._id,
        name: firstProduct.productName,
        price: firstProduct.price,
        salePrice: firstProduct.salePrice,
        isSale: firstProduct.isSale,
        category: firstProduct.category
      });
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   📄 Response status: ${error.response.status}`);
      console.log(`   📄 Response data:`, error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Backend API Tests');
  console.log('================================');
  
  const tests = [
    ['/products/sale', 'Get all sale items'],
    ['/products/sale?category=men', 'Get sale items filtered by category'],
    ['/recommendations', 'Get recommendations'],
    ['/items', 'Get all items (fallback)'],
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    if (success) passed++;
  }
  
  console.log('\n📋 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Backend is ready for frontend integration.');
  } else {
    console.log('\n⚠️  Some tests failed. Check backend server status and endpoints.');
  }
}

// Run the tests
runTests().catch(console.error);
