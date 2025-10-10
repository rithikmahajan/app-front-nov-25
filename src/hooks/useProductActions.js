// Comprehensive Product Actions Hook
// This hook provides consistent cart and favorites functionality across all product screens

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import authManager from '../services/authManager';

export const useProductActions = (navigation = null) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToBag } = useBag();

  const handleToggleFavorite = useCallback(async (product) => {
    try {
      // Try to sync backend auth if needed
      await authManager.syncBackendAuth();
      
      const productId = product._id || product.id;
      const productName = product.productName || product.name || 'Product';
      
      const wasAdded = await toggleFavorite(productId);
      
      // Optional: Show feedback
      if (wasAdded) {
        console.log(`Added ${productName} to favorites`);
      } else {
        console.log(`Removed ${productName} from favorites`);
      }
      
      return wasAdded;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [toggleFavorite]);

  const handleAddToCart = useCallback(async (product, options = {}) => {
    try {
      // Try to sync backend auth if needed
      await authManager.syncBackendAuth();
      
      const productName = product.productName || product.name || 'Product';
      const { forceNavigateToSizeSelection = false, showAlert = true } = options;
      
      // Check if product has multiple sizes and needs size selection
      if (
        (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 1) && 
        (forceNavigateToSizeSelection || !options.selectedSize)
      ) {
        // Navigate to size selection if navigation is available
        if (navigation) {
          navigation.navigate('SizeSelectionModal', { 
            product, 
            previousScreen: 'ProductList' 
          });
          return;
        } else {
          // Fallback: use first available size
          const defaultSize = product.sizes[0]?.size || 'M';
          await addToBag(product, defaultSize);
          
          if (showAlert) {
            Alert.alert(
              'Added to Cart', 
              `${productName} has been added to your cart with size ${defaultSize}.`
            );
          }
        }
      } else {
        // Add directly to cart
        const selectedSize = options.selectedSize || 
                           (product.sizes?.[0]?.size) || 
                           product.size || 
                           'M';
        
        await addToBag(product, selectedSize);
        
        if (showAlert) {
          Alert.alert('Added to Cart', `${productName} has been added to your cart.`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Error handling is done in the context
    }
  }, [addToBag, navigation]);

  const handleProductPress = useCallback((product, navigationTarget = 'ProductDetailsMain') => {
    if (navigation) {
      navigation.navigate(navigationTarget, { 
        product, 
        previousScreen: 'ProductList' 
      });
    }
  }, [navigation]);

  const checkIsFavorite = useCallback((product) => {
    const productId = product._id || product.id;
    return isFavorite(productId);
  }, [isFavorite]);

  return {
    handleToggleFavorite,
    handleAddToCart,
    handleProductPress,
    checkIsFavorite,
  };
};
