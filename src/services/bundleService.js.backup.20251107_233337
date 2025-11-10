import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';
import environmentConfig from '../config/environment';

const BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Create axios instance for bundle API calls
const bundleClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
bundleClient.interceptors.request.use(
  async (config) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken') || 
                        await AsyncStorage.getItem('authToken');
      
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    environmentConfig.log('Bundle API Request', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    environmentConfig.log('Bundle API Request Error', error.message, 'error');
    return Promise.reject(error);
  }
);

// Response interceptor
bundleClient.interceptors.response.use(
  (response) => {
    environmentConfig.log('Bundle API Response', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    // Don't log 404 as error - it just means no bundles are configured
    if (error.response?.status === 404) {
      environmentConfig.log('Bundle API Response', {
        status: 404,
        message: 'No bundles found (expected)',
      }, 'info');
    } else {
      environmentConfig.log('Bundle API Response Error', {
        status: error.response?.status,
        message: error.message,
      }, 'error');
    }
    return Promise.reject(error);
  }
);

/**
 * Bundle Service Class - Handles product bundle API requests
 */
class BundleService {
  /**
   * Get all active bundles
   * @param {Object} params - Query parameters (page, limit, status, etc.)
   * @returns {Promise<Object>} Response with all active bundles
   */
  async getAllBundles(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 10,
        status: 'active',
        ...params
      };
      
      console.log('🎁 Fetching all active bundles...');
      const response = await bundleClient.get('/items/bundles', { params: defaultParams });
      
      if (response.data && response.data.success) {
        const bundles = response.data.data?.bundles || [];
        console.log(`✅ Fetched ${bundles.length} bundles`);
        return {
          success: true,
          bundles: bundles,
          pagination: response.data.data?.pagination,
        };
      }
      
      return {
        success: false,
        bundles: [],
        message: 'No bundles found',
      };
    } catch (error) {
      console.error('❌ Error fetching all bundles:', error.message);
      return {
        success: false,
        bundles: [],
        error: error.message,
      };
    }
  }

  /**
   * Get bundle by ID
   * @param {string} bundleId - Bundle ID
   * @returns {Promise<Object>} Response with bundle details
   */
  async getBundleById(bundleId) {
    try {
      console.log(`🎁 Fetching bundle: ${bundleId}`);
      const response = await bundleClient.get(`/items/bundles/${bundleId}`);
      
      if (response.data && response.data.success) {
        const bundle = response.data.data;
        console.log(`✅ Fetched bundle: ${bundle?.bundleName}`);
        return {
          success: true,
          bundle: bundle,
        };
      }
      
      return {
        success: false,
        bundle: null,
        message: 'Bundle not found',
      };
    } catch (error) {
      console.error(`❌ Error fetching bundle ${bundleId}:`, error.message);
      return {
        success: false,
        bundle: null,
        error: error.message,
      };
    }
  }

  /**
   * Get bundles for a specific product (MOST IMPORTANT FOR "Complete the Look")
   * @param {string} productId - Product/Item ID
   * @param {number} limit - Maximum number of bundles to return (default: 5)
   * @returns {Promise<Object>} Response with bundles containing this product
   */
  async getBundlesForProduct(productId, limit = 5) {
    try {
      console.log(`🎁 Fetching bundles for product: ${productId}`);
      const response = await bundleClient.get(`/items/bundles/product/${productId}`, {
        params: { limit }
      });
      
      if (response.data && response.data.success) {
        // Backend returns data as an array directly
        const bundles = response.data.data || [];
        console.log(`✅ Found ${bundles.length} bundles for product`);
        return {
          success: true,
          bundles: bundles,
        };
      }
      
      return {
        success: false,
        bundles: [],
        message: 'No bundles found for this product',
      };
    } catch (error) {
      // Handle 404 specifically - it means no bundles exist for this product
      if (error.response?.status === 404) {
        console.log(`ℹ️ No bundles configured for product ${productId}`);
        return {
          success: true,
          bundles: [],
          message: 'No bundles available for this product',
        };
      }
      
      // For other errors, return error state
      console.error(`❌ Error fetching bundles for product ${productId}:`, error.message);
      return {
        success: false,
        bundles: [],
        error: error.message,
      };
    }
  }

  /**
   * Add bundle to cart
   * @param {Object} bundle - Bundle object
   * @param {Function} addToBag - Add to bag function from context
   * @returns {Promise<Object>} Response indicating success/failure
   */
  async addBundleToCart(bundle, addToBag) {
    try {
      console.log(`🛒 Adding bundle to cart: ${bundle.name}`);
      
      if (!bundle.products || bundle.products.length === 0) {
        return {
          success: false,
          message: 'Bundle has no products',
        };
      }

      const addedProducts = [];
      const failedProducts = [];

      // Add each product from the bundle to cart
      for (const product of bundle.products) {
        try {
          // Get the first available size for the product
          const availableSize = product.sizes?.[0];
          
          if (!availableSize) {
            console.warn(`⚠️ No sizes available for product: ${product.name}`);
            failedProducts.push(product.name);
            continue;
          }

          await addToBag(product, availableSize.size, {
            bundleId: bundle._id,
            bundleName: bundle.name,
            bundleDiscount: bundle.discount,
          });
          
          addedProducts.push(product.name);
          console.log(`✅ Added ${product.name} to cart`);
        } catch (error) {
          console.error(`❌ Failed to add ${product.name} to cart:`, error);
          failedProducts.push(product.name);
        }
      }

      if (addedProducts.length === bundle.products.length) {
        return {
          success: true,
          message: `All ${addedProducts.length} items added to cart!`,
          addedProducts,
        };
      } else if (addedProducts.length > 0) {
        return {
          success: true,
          partial: true,
          message: `${addedProducts.length} of ${bundle.products.length} items added to cart`,
          addedProducts,
          failedProducts,
        };
      } else {
        return {
          success: false,
          message: 'Failed to add bundle items to cart',
          failedProducts,
        };
      }
    } catch (error) {
      console.error('❌ Error adding bundle to cart:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cache bundle data in AsyncStorage
   * @param {Array} bundles - Array of bundles to cache
   * @param {string} cacheKey - Cache key identifier
   */
  async cacheBundles(bundles, cacheKey = 'bundles_cache') {
    try {
      const cacheData = {
        data: bundles,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('✅ Bundles cached successfully');
    } catch (error) {
      console.error('❌ Error caching bundles:', error);
    }
  }

  /**
   * Get cached bundle data from AsyncStorage
   * @param {string} cacheKey - Cache key identifier
   * @param {number} maxAge - Maximum cache age in milliseconds (default: 5 minutes)
   * @returns {Promise<Array|null>} Cached bundles or null if expired/not found
   */
  async getCachedBundles(cacheKey = 'bundles_cache', maxAge = 5 * 60 * 1000) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        console.log('⏰ Bundle cache expired');
        return null;
      }

      console.log('✅ Using cached bundles');
      return data;
    } catch (error) {
      console.error('❌ Error reading cached bundles:', error);
      return null;
    }
  }

  /**
   * Track bundle view analytics
   * @param {Object} bundle - Bundle object
   */
  trackBundleView(bundle) {
    try {
      console.log('📊 Bundle Viewed:', {
        bundleId: bundle._id,
        bundleName: bundle.name,
        productCount: bundle.products?.length || 0,
        timestamp: new Date().toISOString(),
      });
      
      // Here you can integrate with your analytics service
      // Example: analytics.track('Bundle Viewed', {...})
    } catch (error) {
      console.error('❌ Error tracking bundle view:', error);
    }
  }

  /**
   * Track bundle add to cart analytics
   * @param {Object} bundle - Bundle object
   */
  trackBundleAddToCart(bundle) {
    try {
      console.log('📊 Bundle Added to Cart:', {
        bundleId: bundle._id,
        bundleName: bundle.name,
        totalValue: bundle.discountedPrice || bundle.totalPrice,
        productCount: bundle.products?.length || 0,
        discount: bundle.discount,
        timestamp: new Date().toISOString(),
      });
      
      // Here you can integrate with your analytics service
      // Example: analytics.track('Bundle Added to Cart', {...})
    } catch (error) {
      console.error('❌ Error tracking bundle add to cart:', error);
    }
  }
}

// Export singleton instance
export const bundleService = new BundleService();
export default bundleService;
