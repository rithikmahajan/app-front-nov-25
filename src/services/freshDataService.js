/**
 * Fresh Data Service - No Caching
 * Forces all data to be fetched fresh from backend
 * Use this in production builds to avoid cached data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class FreshDataService {
  /**
   * Clear ALL AsyncStorage cache on app start
   * Call this when app initializes in production
   */
  static async clearAllCache() {
    try {
      const cacheKeys = [
        'bundles_cache',
        'products_cache',
        'categories_cache',
        'fcmToken',
        'userPreferences',
        '@yoraa_favorites',
        '@yoraa_recently_viewed',
      ];
      
      console.log('🧹 Clearing all cache...');
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ All caches cleared');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get fresh data (bypass cache)
   * @param {Function} fetchFunction - Function to fetch data
   * @param {Array} args - Arguments for fetch function
   */
  static async getFreshData(fetchFunction, ...args) {
    try {
      // Force fresh fetch by adding timestamp to prevent caching
      const timestamp = Date.now();
      const result = await fetchFunction(...args, { _t: timestamp });
      return result;
    } catch (error) {
      console.error('❌ Error fetching fresh data:', error);
      throw error;
    }
  }

  /**
   * Check if running in production
   */
  static isProduction() {
    return !__DEV__;
  }
}

export default FreshDataService;
