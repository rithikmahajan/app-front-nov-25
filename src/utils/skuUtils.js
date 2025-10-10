/**
 * SKU Utility Functions for React Native App
 * Addresses backend requirements for proper SKU handling
 */

// Find size variant with intelligent fallback
export const findSizeVariant = (sizes, sku, sizeName) => {
  if (!Array.isArray(sizes) || sizes.length === 0) return null;
  
  // First, try to find by exact SKU match
  if (sku && sku !== 'undefined' && sku.trim() !== '') {
    const variant = sizes.find(size => size.sku === sku);
    if (variant) return variant;
  }
  
  // If no SKU match and size name provided, try to find by size name
  if (sizeName) {
    const variant = sizes.find(size => size.size === sizeName);
    if (variant) return variant;
  }
  
  // If still no match, try to find first available size with stock > 0
  const availableVariant = sizes.find(size => (size.stock || size.quantity || 0) > 0);
  if (availableVariant) return availableVariant;
  
  // Last resort: return first size
  return sizes[0] || null;
};

// Generate intelligent fallback SKU for items missing one
export const generateFallbackSKU = (item, sizeVariant) => {
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits
  const itemName = (item.productName || item.name || 'PRODUCT')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  const sizeName = (sizeVariant?.size || 'ONESIZE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4);
  
  return `${itemName}_${sizeName}_${timestamp}`;
};

// Validate SKU format
export const isValidSKU = (sku) => {
  if (!sku || typeof sku !== 'string') return false;
  const trimmedSKU = sku.trim();
  return trimmedSKU !== '' && 
         trimmedSKU !== 'undefined' && 
         trimmedSKU !== 'null' && 
         trimmedSKU.length >= 3;
};

// Get the correct price for an item (sale price vs regular price)
export const getItemPrice = (item) => {
  let price = 0;
  let type = 'invalid';
  let originalPrice = null;
  
  // Handle nested size structure - prices are in the sizes array
  if (item.sizes && Array.isArray(item.sizes) && item.size) {
    // Find the selected size variant
    const selectedSizeVariant = item.sizes.find(sizeObj => sizeObj.size === item.size);
    
    if (selectedSizeVariant) {
      // Use sale price first, then regular price
      if (selectedSizeVariant.salePrice && Number(selectedSizeVariant.salePrice) > 0) {
        price = Number(selectedSizeVariant.salePrice);
        type = 'sale';
        originalPrice = Number(selectedSizeVariant.regularPrice || 0);
      } else if (selectedSizeVariant.regularPrice && Number(selectedSizeVariant.regularPrice) > 0) {
        price = Number(selectedSizeVariant.regularPrice);
        type = 'regular';
        originalPrice = null;
      }
    }
  }
  // Fallback to direct item properties (for backward compatibility)
  else {
    // Priority: sale price -> regular price -> price -> 0
    if (item.salePrice && Number(item.salePrice) > 0) {
      price = Number(item.salePrice);
      type = 'sale';
      originalPrice = Number(item.regularPrice || item.price || 0);
    } else if (item.regularPrice && Number(item.regularPrice) > 0) {
      price = Number(item.regularPrice);
      type = 'regular';
      originalPrice = null;
    } else if (item.price && Number(item.price) > 0) {
      price = Number(item.price);
      type = 'fallback';
      originalPrice = null;
    }
  }
  
  return {
    price,
    type,
    originalPrice
  };
};

// Validate cart item before checkout
export const validateCartItem = (cartItem) => {
  const errors = [];
  
  if (!cartItem.itemId && !cartItem._id && !cartItem.id) {
    errors.push('Missing item ID');
  }
  
  // Extract SKU from sizes array if needed
  let itemSku = cartItem.sku;
  
  // Handle nested size structure - SKU is in the sizes array
  if (!isValidSKU(itemSku) && cartItem.sizes && Array.isArray(cartItem.sizes) && cartItem.size) {
    const selectedSizeVariant = cartItem.sizes.find(sizeObj => sizeObj.size === cartItem.size);
    if (selectedSizeVariant) {
      itemSku = selectedSizeVariant.sku;
      console.log(`🔧 Extracted SKU from sizes array: ${itemSku} for size ${cartItem.size}`);
    }
  }
  
  // Debug logging
  console.log(`🔍 SKU Validation for item ${cartItem._id || cartItem.id}:`, {
    directSku: cartItem.sku,
    extractedSku: itemSku,
    selectedSize: cartItem.size,
    hasSizesArray: !!(cartItem.sizes && Array.isArray(cartItem.sizes)),
    sizesCount: cartItem.sizes ? cartItem.sizes.length : 0,
    isValidSku: isValidSKU(itemSku)
  });
  
  if (!isValidSKU(itemSku)) {
    errors.push('Invalid or missing SKU');
  }
  
  if (!cartItem.quantity || cartItem.quantity < 1) {
    errors.push('Invalid quantity');
  }
  
  const priceInfo = getItemPrice(cartItem);
  if (priceInfo.price <= 0) {
    errors.push('Invalid or missing price');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    priceInfo,
    extractedSku: itemSku // Include the extracted SKU for debugging
  };
};

// Validate entire cart before checkout
export const validateCart = (cartItems) => {
  const results = cartItems.map((item, index) => ({
    index,
    item,
    ...validateCartItem(item)
  }));
  
  const invalidItems = results.filter(result => !result.isValid);
  const totalAmount = results.reduce((total, result) => {
    if (result.isValid) {
      return total + (result.priceInfo.price * result.item.quantity);
    }
    return total;
  }, 0);
  
  return {
    isValid: invalidItems.length === 0,
    invalidItems,
    totalItems: cartItems.length,
    validItems: results.filter(result => result.isValid),
    totalAmount
  };
};

// Format cart item for backend API
export const formatCartItemForAPI = (bagItem, index = 0) => {
  let itemId, sku, itemPrice;
  
  // Handle different possible cart item structures
  if (bagItem.item) {
    // Nested item structure
    itemId = bagItem.item._id || bagItem.item.id;
    
    // Look for SKU in nested item's sizes array first
    if (bagItem.item.sizes && Array.isArray(bagItem.item.sizes) && bagItem.size) {
      const selectedSizeVariant = bagItem.item.sizes.find(sizeObj => sizeObj.size === bagItem.size);
      sku = selectedSizeVariant?.sku || bagItem.item.sku || bagItem.item.model || bagItem.item.productCode;
    } else {
      sku = bagItem.item.sku || bagItem.item.model || bagItem.item.productCode;
    }
    
    const priceInfo = getItemPrice(bagItem.item);
    itemPrice = priceInfo.price;
  } else {
    // Direct item structure
    itemId = bagItem._id || bagItem.id;
    
    // Look for SKU in sizes array first
    if (bagItem.sizes && Array.isArray(bagItem.sizes) && bagItem.size) {
      const selectedSizeVariant = bagItem.sizes.find(sizeObj => sizeObj.size === bagItem.size);
      sku = selectedSizeVariant?.sku || bagItem.sku || bagItem.model || bagItem.productCode || bagItem.code;
    } else {
      sku = bagItem.sku || bagItem.model || bagItem.productCode || bagItem.code;
    }
    
    const priceInfo = getItemPrice(bagItem);
    itemPrice = priceInfo.price;
  }
  
  // Generate fallback SKU if needed
  if (!isValidSKU(sku)) {
    sku = generateFallbackSKU(
      bagItem.item || bagItem, 
      { size: bagItem.size || 'OneSize' }
    );
    console.log(`🔧 Generated fallback SKU for item ${itemId}: ${sku}`);
  }
  
  console.log(`📦 Formatted cart item ${index + 1}:`, {
    itemId,
    sku,
    size: bagItem.size,
    quantity: bagItem.quantity,
    unitPrice: itemPrice,
    priceSource: bagItem.sizes ? 'sizes_array' : 'direct_properties'
  });
  
  return {
    itemId,
    sku,
    size: bagItem.size || 'OneSize',
    quantity: Number(bagItem.quantity) || 1,
    unitPrice: itemPrice
  };
};

// Debug cart information
export const debugCart = (cartItems) => {
  console.log('🛒 Cart Debug Info:');
  console.log(`Total Items: ${cartItems.length}`);
  
  cartItems.forEach((item, index) => {
    const validation = validateCartItem(item);
    console.log(`Item ${index + 1}:`, {
      itemId: item.itemId || item._id || item.id,
      sku: item.sku,
      size: item.size || item.sizeName,
      quantity: item.quantity,
      priceInfo: validation.priceInfo,
      hasValidSKU: isValidSKU(item.sku),
      hasNestedItem: !!item.item,
      isValid: validation.isValid,
      errors: validation.errors
    });
  });
  
  const cartValidation = validateCart(cartItems);
  console.log('📊 Cart Summary:', {
    totalItems: cartValidation.totalItems,
    validItems: cartValidation.validItems.length,
    invalidItems: cartValidation.invalidItems.length,
    totalAmount: cartValidation.totalAmount,
    isValid: cartValidation.isValid
  });
  
  return cartValidation;
};
