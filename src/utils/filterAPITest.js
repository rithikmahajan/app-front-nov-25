// API Test Helper for Filters
// Run this to test if the backend filter endpoints are working

import { yoraaAPI } from '../services/yoraaAPI';

export const testFilterAPI = async () => {
  try {
    console.log('🧪 Testing Filter API Endpoints...');
    
    // Initialize API client
    await yoraaAPI.initialize();
    
    console.log('✅ API Client initialized');
    
    // Test 1: Get active filters
    try {
      console.log('📋 Testing /api/filters/public/active...');
      const filtersResponse = await yoraaAPI.makeRequest('/api/filters/public/active');
      
      if (filtersResponse.success) {
        console.log('✅ Filters API working!');
        console.log('📄 Filters:', filtersResponse.data.filters?.length || 0, 'found');
        console.log('💰 Price Settings:', filtersResponse.data.priceSettings);
        console.log('🔄 Sort Options:', filtersResponse.data.sortOptions?.length || 0, 'found');
      } else {
        console.log('❌ Filters API returned error:', filtersResponse.message);
      }
    } catch (error) {
      console.log('❌ Filters API failed:', error.message);
      console.log('💡 Falling back to default filters...');
    }
    
    // Test 2: Test filtered items endpoint
    try {
      console.log('🔍 Testing /api/items/filtered...');
      const testParams = new URLSearchParams({
        priceMin: '500',
        priceMax: '10000',
        sort: 'price_asc',
        filters: JSON.stringify({
          color: [{id: 'test', name: 'Black'}]
        })
      });
      
      const itemsResponse = await yoraaAPI.makeRequest(`/api/items/filtered?${testParams}`);
      
      if (itemsResponse.success) {
        console.log('✅ Filtered Items API working!');
        console.log('🛍️ Items found:', itemsResponse.data.items?.length || 0);
        console.log('📊 Pagination:', itemsResponse.data.pagination);
      } else {
        console.log('❌ Filtered Items API returned error:', itemsResponse.message);
      }
    } catch (error) {
      console.log('❌ Filtered Items API failed:', error.message);
    }
    
    console.log('🏁 API Test Complete!');
    
  } catch (error) {
    console.error('💥 API Test failed completely:', error);
  }
};

export const logFilterInfo = (filters, selectedFilters, priceRange, sortOptions) => {
  console.log('📊 Current Filter State:');
  console.log('  Filters available:', filters.length);
  console.log('  Selected filters:', Object.keys(selectedFilters).length);
  console.log('  Price range:', priceRange);
  console.log('  Sort options:', sortOptions.length);
  
  filters.forEach(filter => {
    console.log(`  📝 ${filter.key}: ${filter.values.length} options`);
    if (selectedFilters[filter.key]) {
      console.log(`    ✅ Selected: ${selectedFilters[filter.key].map(s => s.name).join(', ')}`);
    }
  });
};
