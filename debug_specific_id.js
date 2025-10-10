// Test if the specific ID exists in any user's wishlist
const axios = require('axios');

async function findWishlistItem() {
  try {
    console.log('🔍 Searching for ID: 68dae6951b37817f21efe0ea');
    
    // Let's try to search using different session approaches
    // First try without authentication to see general error
    try {
      const response = await axios.get('http://localhost:8001/api/wishlist/');
      console.log('No auth response:', response.data);
    } catch (error) {
      console.log('No auth error (expected):', error.response?.data);
    }
    
    // Let's try to understand the backend's expected data format by 
    // checking if this is a MongoDB ObjectId format issue
    const testId = '68dae6951b37817f21efe0ea';
    console.log('ID Length:', testId.length); // Should be 24 for MongoDB ObjectId
    console.log('ID format valid:', /^[0-9a-fA-F]{24}$/.test(testId));
    
    // Try to get more info about the API endpoints
    console.log('\n🔍 Testing different endpoint approaches...');
    
    // Test if the removal endpoint expects different parameters
    const testEndpoints = [
      `http://localhost:8001/api/wishlist/remove/${testId}`,
      `http://localhost:8001/api/wishlist/remove?itemId=${testId}`,
      `http://localhost:8001/api/wishlist/${testId}/remove`,
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`\n🔍 Testing: ${endpoint}`);
        const response = await axios.delete(endpoint);
        console.log('✅ Success:', response.data);
        break;
      } catch (error) {
        console.log('❌ Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          endpoint: endpoint
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
}

findWishlistItem();
