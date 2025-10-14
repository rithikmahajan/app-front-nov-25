/**
 * Order Error Handler Utility
 * Handles enhanced error responses from backend for invalid cart items
 * 
 * Backend Error Response Format:
 * {
 *   error: "Invalid item IDs",
 *   message: "Some items in your cart are no longer available",
 *   invalidItems: [
 *     {
 *       itemId: "...",
 *       name: "Product Name",
 *       sku: "...",
 *       size: "M",
 *       reason: "Item no longer available or has been removed",
 *       availableSizes: [{ sku: "...", size: "L", stock: 10 }]
 *     }
 *   ],
 *   suggestion: "Please remove these items from your cart and try again"
 * }
 */

import { Alert } from 'react-native';

/**
 * Check if error response has detailed invalid items information
 */
export const hasInvalidItemsDetails = (error) => {
  return error && error.invalidItems && Array.isArray(error.invalidItems) && error.invalidItems.length > 0;
};

/**
 * Format invalid items for display
 */
export const formatInvalidItemsList = (invalidItems) => {
  if (!invalidItems || invalidItems.length === 0) {
    return '';
  }
  
  return invalidItems.map(item => {
    const name = item.name || 'Unknown item';
    const size = item.size ? ` (${item.size})` : '';
    const reason = item.reason ? ` - ${item.reason}` : '';
    return `• ${name}${size}${reason}`;
  }).join('\n');
};

/**
 * Get item names from invalid items list
 */
export const getInvalidItemNames = (invalidItems) => {
  if (!invalidItems || invalidItems.length === 0) {
    return '';
  }
  
  return invalidItems.map(item => item.name || 'Unknown item').join(', ');
};

/**
 * Check if any invalid items have available alternatives
 */
export const hasAvailableAlternatives = (invalidItems) => {
  if (!invalidItems || invalidItems.length === 0) {
    return false;
  }
  
  return invalidItems.some(item => 
    item.availableSizes && 
    Array.isArray(item.availableSizes) && 
    item.availableSizes.length > 0
  );
};

/**
 * Format available sizes for display
 */
export const formatAvailableSizes = (availableSizes) => {
  if (!availableSizes || availableSizes.length === 0) {
    return '';
  }
  
  const inStock = availableSizes.filter(s => s.stock > 0);
  
  if (inStock.length === 0) {
    return 'No sizes currently in stock';
  }
  
  return inStock.map(s => `• ${s.size} (${s.stock} in stock)`).join('\n');
};

/**
 * Show detailed error alert with options to remove invalid items
 */
export const showInvalidItemsAlert = (error, navigation, removeItemsCallback) => {
  const invalidItems = error.invalidItems || [];
  const message = error.message || 'Some items in your cart are unavailable';
  const suggestion = error.suggestion || 'Please update your cart';
  
  const invalidItemsList = formatInvalidItemsList(invalidItems);
  
  const alertMessage = `${message}\n\n${invalidItemsList}\n\n${suggestion}`;
  
  const buttons = [];
  
  // Add "Auto-Remove" button if we have a callback function
  if (removeItemsCallback && typeof removeItemsCallback === 'function') {
    buttons.push({
      text: 'Auto-Remove',
      onPress: () => {
        removeItemsCallback(invalidItems);
        Alert.alert(
          'Cart Updated',
          'Unavailable items have been removed from your cart',
          [
            {
              text: 'OK',
              onPress: () => navigation?.navigate?.('bag')
            }
          ]
        );
      }
    });
  }
  
  // Add "Review Cart" button
  buttons.push({
    text: 'Review Cart',
    onPress: () => navigation?.navigate?.('bag'),
    style: 'default'
  });
  
  // Add "Cancel" button
  buttons.push({
    text: 'Cancel',
    style: 'cancel'
  });
  
  Alert.alert('Cart Issue', alertMessage, buttons);
};

/**
 * Show alert for items with available alternative sizes
 */
export const showAlternativeSizesAlert = (invalidItem, navigation, onSelectSize) => {
  if (!invalidItem.availableSizes || invalidItem.availableSizes.length === 0) {
    return;
  }
  
  const inStock = invalidItem.availableSizes.filter(s => s.stock > 0);
  
  if (inStock.length === 0) {
    Alert.alert(
      invalidItem.name,
      `Size "${invalidItem.size}" is no longer available and there are no other sizes in stock.`,
      [
        {
          text: 'OK',
          onPress: () => navigation?.navigate?.('bag')
        }
      ]
    );
    return;
  }
  
  const availableSizesList = formatAvailableSizes(invalidItem.availableSizes);
  
  Alert.alert(
    invalidItem.name,
    `Size "${invalidItem.size}" is unavailable.\n\nAvailable sizes:\n${availableSizesList}`,
    [
      {
        text: 'Choose Size',
        onPress: () => {
          if (onSelectSize && typeof onSelectSize === 'function') {
            onSelectSize(invalidItem);
          } else {
            navigation?.navigate?.('bag');
          }
        }
      },
      {
        text: 'Remove Item',
        onPress: () => navigation?.navigate?.('bag'),
        style: 'destructive'
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};

/**
 * Main error handler for order creation errors
 * Intelligently routes to appropriate handler based on error type
 */
export const handleOrderCreationError = (error, navigation, removeItemsCallback) => {
  console.log('🔍 Handling order creation error:', error);
  
  // Check if error has detailed invalid items information
  if (hasInvalidItemsDetails(error)) {
    console.log('📋 Error has detailed invalid items information');
    showInvalidItemsAlert(error, navigation, removeItemsCallback);
    return true; // Indicate that we handled this error
  }
  
  // Check for old-style "Invalid item IDs" error message
  if (error.error === 'Invalid item IDs' || 
      error.message?.includes('Invalid item IDs') || 
      error.message?.includes('no longer available')) {
    console.log('📋 Legacy invalid items error detected');
    
    Alert.alert(
      'Cart Issue',
      'Some products in your cart are no longer available. Please refresh your cart and remove any unavailable items to continue.',
      [
        {
          text: 'Refresh Cart',
          onPress: async () => {
            // Navigate to bag and force a refresh with validation
            if (navigation) {
              navigation.navigate('bag', { refresh: true, forceReload: true, autoValidate: true });
            }
          },
          style: 'default'
        },
        {
          text: 'Review Cart',
          onPress: () => navigation?.navigate?.('bag'),
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
    return true;
  }
  
  // Not an invalid items error, return false to let caller handle it
  return false;
};

/**
 * Parse error response from API
 * Handles both axios error responses and direct error objects
 */
export const parseErrorResponse = (error) => {
  // Check if this is an axios error with response data
  if (error.response && error.response.data) {
    return error.response.data;
  }
  
  // Check if error has the error fields directly
  if (error.error || error.message || error.invalidItems) {
    return error;
  }
  
  // Return generic error object
  return {
    error: error.message || 'An unknown error occurred',
    message: error.message || 'Please try again'
  };
};

export default {
  hasInvalidItemsDetails,
  formatInvalidItemsList,
  getInvalidItemNames,
  hasAvailableAlternatives,
  formatAvailableSizes,
  showInvalidItemsAlert,
  showAlternativeSizesAlert,
  handleOrderCreationError,
  parseErrorResponse
};
