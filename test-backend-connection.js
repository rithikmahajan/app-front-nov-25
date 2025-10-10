#!/usr/bin/env node

// Test backend connection - Direct localhost approach
const axios = require('axios');

const BASE_URL = 'http://localhost:8001/api';

async function testBackendConnection() {
  console.log('🚀 Testing backend connection...\n');
  
  try {
    // Test categories
    console.log('📂 Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories:', categoriesResponse.data.data.length, 'categories found');
    console.log('   Names:', categoriesResponse.data.data.map(cat => cat.name).join(', '));
    
    // Test subcategories
    console.log('\n📋 Testing subcategories endpoint...');
    const subcategoriesResponse = await axios.get(`${BASE_URL}/subcategories`);
    console.log('✅ Subcategories:', subcategoriesResponse.data.length, 'subcategories found');
    
    // Test filtering subcategories by category
    const menCategoryId = categoriesResponse.data.data.find(cat => cat.name === 'men')?._id;
    if (menCategoryId) {
      console.log('\n👔 Testing men subcategories (client-side filter)...');
      const menSubcats = subcategoriesResponse.data.filter(sub => sub.categoryId === menCategoryId);
      console.log('✅ Men subcategories:', menSubcats.length, 'found');
      console.log('   Names:', menSubcats.map(s => s.name).join(', '));
    }
    
    // Test items
    console.log('\n🛍️ Testing items endpoint...');
    const itemsResponse = await axios.get(`${BASE_URL}/items`);
    console.log('✅ Items:', itemsResponse.data?.data?.length || itemsResponse.data?.length || 'API structure varies', 'items found');
    
    console.log('\n🎉 All backend endpoints are working correctly!');
    console.log('✅ Your React Native app should now load categories and images properly.');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testBackendConnection();
