/**
 * Product Validation Utilities
 * Validates products against backend before adding to cart or checkout
 * Following Backend Team's Razorpay Testing Solution Guide
 */

import { yoraaAPI } from '../services/yoraaAPI';
import { Alert } from 'react-native';

/**
 * Fetch all available products from backend
 */
export const fetchAllProducts = async () => {
  try {
    console.log('📦 Fetching all products from backend...');
    const response = await yoraaAPI.makeRequest('/api/items', 'GET', null, false);
    
    if (response && Array.isArray(response)) {
      console.log(`✅ Fetched ${response.length} products from backend`);
      return response;
    } else {
      console.warn('⚠️ No products found in response');
      return [];
    }
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    return [];
  }
};

/**
 * Check if a specific product exists in backend
 * @param {string} productId - MongoDB ObjectId of the product
 * @returns {Promise<Object|null>} Product data or null if not found
 */
export const checkProductExists = async (productId) => {
  try {
    console.log(`🔍 Checking if product exists: ${productId}`);
    const response = await yoraaAPI.makeRequest(`/api/items/${productId}`, 'GET', null, false);
    
    console.log('🔍 Backend response structure:', JSON.stringify(response, null, 2));
    
    // Handle different response structures
    // Option 1: Direct product object with _id
    if (response && response._id) {
      console.log(`✅ Product exists: ${response.name}`);
      return response;
    }
    // Option 2: Wrapped in data field
    else if (response && response.data && response.data._id) {
      console.log(`✅ Product exists: ${response.data.name || response.data.productName}`);
      return response.data;
    }
    // Option 3: Wrapped in product field
    else if (response && response.product && response.product._id) {
      console.log(`✅ Product exists: ${response.product.name || response.product.productName}`);
      return response.product;
    }
    // Option 4: Success wrapper with data
    else if (response && response.success && response.data) {
      console.log(`✅ Product exists: ${response.data.name || response.data.productName}`);
      return response.data;
    }
    else {
      console.log('❌ Product not found - response structure not recognized');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking product:', error);
    return null;
  }
};

/**
 * Fetch test products for Razorpay testing
 * Uses the new backend endpoint specifically for testing
 */
export const fetchTestProducts = async () => {
  try {
    console.log('🧪 Fetching test products for Razorpay...');
    const response = await yoraaAPI.makeRequest('/api/razorpay/test-products', 'GET', null, false);
    
    if (response && response.success && response.products) {
      console.log(`✅ Fetched ${response.count} test products`);
      return response.products;
    } else {
      console.warn('⚠️ No test products available, fetching from regular products endpoint');
      return await fetchAllProducts();
    }
  } catch (error) {
    console.error('❌ Failed to fetch test products, using regular products:', error);
    return await fetchAllProducts();
  }
};

/**
 * Validate product and size/SKU availability
 * @param {Object} productData - Product data to validate
 * @param {string} productData.id - Product ID
 * @param {string} productData.sku - Product SKU
 * @param {string} productData.size - Product size
 * @returns {Promise<Object>} Validation result
 */
export const validateProductAndSize = async (productData) => {
  const { id, sku, size } = productData;
  
  console.log('🔍 Validating product and size:', { id, sku, size });
  
  // Check if product exists
  const backendProduct = await checkProductExists(id);
  
  if (!backendProduct) {
    return {
      valid: false,
      error: 'Product not found',
      message: 'This product is no longer available'
    };
  }
  
  // Check if product is live
  if (backendProduct.status !== 'live') {
    return {
      valid: false,
      error: 'Product not available',
      message: 'This product is currently unavailable'
    };
  }
  
  // Verify the size/SKU exists
  const sizeExists = backendProduct.sizes?.some(
    s => s.sku === sku && s.size === size
  );
  
  if (!sizeExists) {
    return {
      valid: false,
      error: 'Size not available',
      message: 'This size is no longer available'
    };
  }
  
  // Check stock availability
  const sizeData = backendProduct.sizes.find(s => s.sku === sku);
  if (sizeData && sizeData.stock <= 0) {
    return {
      valid: false,
      error: 'Out of stock',
      message: 'This size is currently out of stock'
    };
  }
  
  console.log('✅ Product and size validated successfully');
  
  return {
    valid: true,
    product: backendProduct,
    sizeData: sizeData
  };
};

/**
 * Validate entire cart against backend
 * @param {Array} cartItems - Array of cart items
 * @returns {Promise<Object>} Validation result
 */
export const validateCart = async (cartItems) => {
  console.log('🛒 Validating cart with backend...');
  
  const invalidItems = [];
  const validItems = [];
  
  for (const item of cartItems) {
    const validation = await validateProductAndSize({
      id: item.id || item._id,
      sku: item.sku,
      size: item.size
    });
    
    if (validation.valid) {
      validItems.push({
        ...item,
        backendProduct: validation.product,
        sizeData: validation.sizeData
      });
    } else {
      invalidItems.push({
        ...item,
        error: validation.error,
        message: validation.message
      });
    }
  }
  
  if (invalidItems.length > 0) {
    console.warn('⚠️ Found invalid items in cart:', invalidItems);
    return {
      valid: false,
      invalidItems,
      validItems,
      message: `${invalidItems.length} item(s) in your cart are no longer available`
    };
  }
  
  console.log('✅ All cart items validated successfully');
  
  return {
    valid: true,
    invalidItems: [],
    validItems
  };
};

/**
 * Show user-friendly error when product validation fails
 * @param {Object} validation - Validation result
 */
export const showValidationError = (validation) => {
  if (validation.valid) return;
  
  const errorMessage = validation.invalidItems?.length > 0
    ? validation.message
    : validation.message || 'Product validation failed';
  
  Alert.alert(
    'Product Not Available',
    errorMessage,
    [
      {
        text: 'Remove from Cart',
        style: 'destructive'
      },
      {
        text: 'Continue Shopping',
        style: 'cancel'
      }
    ]
  );
};

/**
 * Create test cart item from backend product
 * Useful for testing Razorpay checkout
 * @param {Object} product - Backend product object
 * @returns {Object} Cart item formatted for checkout
 */
export const createTestCartItem = (product) => {
  if (!product || !product.sizes || product.sizes.length === 0) {
    console.error('❌ Cannot create test cart item: Invalid product');
    return null;
  }
  
  const testSize = product.sizes[0];
  
  return {
    id: product._id,
    name: product.name,
    sku: testSize.sku,
    size: testSize.size,
    quantity: 1,
    price: product.price || testSize.regularPrice,
    images: product.images || [],
    description: product.description || ''
  };
};

export default {
  fetchAllProducts,
  checkProductExists,
  fetchTestProducts,
  validateProductAndSize,
  validateCart,
  showValidationError,
  createTestCartItem
};
