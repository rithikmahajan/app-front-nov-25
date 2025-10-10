// Backend Compatibility Test Suite
// Based on the Frontend Integration Guide

import yoraaAPI from '../services/yoraaAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BackendCompatibilityTests = {
  
  // Test 1: Verify token is stored after Apple Sign In
  async testTokenStorage() {
    console.log('🧪 Test 1: Verify token storage');
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      console.log('Stored token:', token ? 'EXISTS' : 'MISSING');
      console.log('Stored userData:', userData ? 'EXISTS' : 'MISSING');
      
      if (token && userData) {
        console.log('✅ Test 1 PASSED: Token and user data stored correctly');
        return true;
      } else {
        console.log('❌ Test 1 FAILED: Missing token or user data');
        return false;
      }
    } catch (error) {
      console.error('❌ Test 1 ERROR:', error);
      return false;
    }
  },

  // Test 2: Verify token is sent with cart/wishlist requests
  async testAuthenticatedRequests() {
    console.log('🧪 Test 2: Verify authenticated requests');
    
    try {
      const isAuthenticated = yoraaAPI.isAuthenticated();
      console.log('Authentication status:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('❌ Test 2 FAILED: Not authenticated');
        return false;
      }

      // Test wishlist request
      console.log('Testing wishlist request...');
      const wishlistResponse = await yoraaAPI.getWishlist();
      console.log('Wishlist response:', wishlistResponse);

      // Test cart request
      console.log('Testing cart request...');
      const cartResponse = await yoraaAPI.getCart();
      console.log('Cart response:', cartResponse);

      console.log('✅ Test 2 PASSED: Authenticated requests working');
      return true;
    } catch (error) {
      console.error('❌ Test 2 ERROR:', error);
      return false;
    }
  },

  // Test 3: Test cart operations
  async testCartOperations(testItemId = 'test-item-123') {
    console.log('🧪 Test 3: Test cart operations');
    
    try {
      if (!yoraaAPI.isAuthenticated()) {
        console.log('❌ Test 3 FAILED: Not authenticated');
        return false;
      }

      // Test add to cart
      console.log('Testing add to cart...');
      const addResult = await yoraaAPI.addToCart(testItemId, 'M', 1);
      console.log('Add to cart result:', addResult);

      // Test get cart
      console.log('Testing get cart...');
      const cartResult = await yoraaAPI.getCart();
      console.log('Get cart result:', cartResult);

      console.log('✅ Test 3 PASSED: Cart operations working');
      return true;
    } catch (error) {
      console.error('❌ Test 3 ERROR:', error);
      return false;
    }
  },

  // Test 4: Test wishlist operations
  async testWishlistOperations(testItemId = 'test-item-456') {
    console.log('🧪 Test 4: Test wishlist operations');
    
    try {
      if (!yoraaAPI.isAuthenticated()) {
        console.log('❌ Test 4 FAILED: Not authenticated');
        return false;
      }

      // Test add to wishlist
      console.log('Testing add to wishlist...');
      const addResult = await yoraaAPI.addToWishlist(testItemId);
      console.log('Add to wishlist result:', addResult);

      // Test get wishlist
      console.log('Testing get wishlist...');
      const wishlistResult = await yoraaAPI.getWishlist();
      console.log('Get wishlist result:', wishlistResult);

      console.log('✅ Test 4 PASSED: Wishlist operations working');
      return true;
    } catch (error) {
      console.error('❌ Test 4 ERROR:', error);
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Backend Compatibility Test Suite...');
    console.log('=' .repeat(50));
    
    const results = {
      tokenStorage: await this.testTokenStorage(),
      authenticatedRequests: await this.testAuthenticatedRequests(),
      cartOperations: await this.testCartOperations(),
      wishlistOperations: await this.testWishlistOperations()
    };

    console.log('=' .repeat(50));
    console.log('📊 Test Results Summary:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    return results;
  },

  // Quick debug helper
  async quickDebug() {
    console.log('🔍 Quick Debug Info:');
    
    // Check authentication
    const isAuth = yoraaAPI.isAuthenticated();
    console.log('1. Authentication:', isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED');
    
    // Check token storage
    const tokenStatus = await yoraaAPI.debugTokenStatus();
    console.log('2. Token Status:', tokenStatus);
    
    // Check API base URL
    console.log('3. API Base URL:', yoraaAPI.baseURL || 'NOT SET');
    
    return {
      authenticated: isAuth,
      tokenStatus,
      baseURL: yoraaAPI.baseURL
    };
  }
};

// Export individual test functions for convenience
export const {
  testTokenStorage,
  testAuthenticatedRequests, 
  testCartOperations,
  testWishlistOperations,
  runAllTests,
  quickDebug
} = BackendCompatibilityTests;

export default BackendCompatibilityTests;
