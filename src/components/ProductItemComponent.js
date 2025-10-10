import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import HeartFilledIcon from '../assets/icons/HeartFilledIcon';
import { GlobalCartIcon } from '../assets/icons';
import { Colors, FontFamilies } from '../constants';

const ProductItemComponent = ({ 
  product, 
  onPress, 
  style, 
  showCartIcon = true, 
  showHeartIcon = true,
  navigation 
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToBag } = useBag();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Get product data with fallbacks
  const productId = product._id || product.id;
  const productName = product.productName || product.name || 'Product';
  const productPrice = getProductPrice(product);
  const productImage = getProductImage(product);
  const isLiked = isFavorite(productId);

  // Helper function to get product price
  function getProductPrice(item) {
    if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
      // Find the first available size with a price
      const sizeWithPrice = item.sizes.find(size => size.price);
      if (sizeWithPrice) {
        return typeof sizeWithPrice.price === 'number' 
          ? `₹${sizeWithPrice.price}` 
          : sizeWithPrice.price;
      }
    }
    
    if (item.price) {
      return typeof item.price === 'number' ? `₹${item.price}` : item.price;
    }
    
    return 'Price not available';
  }

  // Helper function to get product image
  function getProductImage(item) {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0].url || item.images[0];
    }
    if (item.image) {
      return item.image;
    }
    return null;
  }

  // Handle heart icon press
  const handleHeartPress = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (isTogglingFavorite) return;
    
    try {
      setIsTogglingFavorite(true);
      const wasAdded = await toggleFavorite(productId);
      
      // Show feedback to user
      if (wasAdded) {
        // Optional: Show toast or brief animation
        console.log(`Added ${productName} to favorites`);
      } else {
        console.log(`Removed ${productName} from favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [productId, productName, toggleFavorite, isTogglingFavorite]);

  // Handle cart icon press
  const handleCartPress = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      
      // Check if product has sizes and needs size selection
      if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 1) {
        // Navigate to size selection modal/screen
        if (navigation) {
          navigation.navigate('SizeSelectionModal', { 
            product, 
            previousScreen: 'ProductList' 
          });
        } else {
          // Fallback: add with default size
          await addToBag(product, product.sizes[0]?.size || 'M');
          Alert.alert('Added to Cart', `${productName} has been added to your cart with size ${product.sizes[0]?.size || 'M'}.`);
        }
      } else {
        // Add directly to cart with default or single size
        const defaultSize = product.sizes?.[0]?.size || product.size || 'M';
        await addToBag(product, defaultSize);
        Alert.alert('Added to Cart', `${productName} has been added to your cart.`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Error handling is done in the context
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, productName, addToBag, isAddingToCart, navigation]);

  // Handle product press
  const handleProductPress = useCallback(() => {
    if (onPress) {
      onPress(product);
    } else if (navigation) {
      navigation.navigate('ProductDetailsMain', { 
        product, 
        previousScreen: 'ProductList' 
      });
    }
  }, [product, onPress, navigation]);

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handleProductPress}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {productImage ? (
          <Image 
            source={{ uri: productImage }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Heart Icon - Top Right */}
        {showHeartIcon && (
          <TouchableOpacity 
            style={[styles.iconButton, styles.heartButton]}
            onPress={handleHeartPress}
            disabled={isTogglingFavorite}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              isLiked && styles.likedIconContainer
            ]}>
              <HeartFilledIcon 
                color={isLiked ? "#FF0000" : "#000000"} 
                size={16}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Cart Icon - Bottom Right */}
        {showCartIcon && (
          <TouchableOpacity 
            style={[styles.iconButton, styles.cartButton]}
            onPress={handleCartPress}
            disabled={isAddingToCart}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <GlobalCartIcon 
                size={16} 
                color="#000000"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>
        <Text style={styles.productSubtitle} numberOfLines={1}>
          {product.title || product.brand || 'Brand'}
        </Text>
        <Text style={styles.productPrice}>
          {productPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
  },
  iconButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  heartButton: {
    top: 8,
    right: 8,
  },
  cartButton: {
    bottom: 8,
    right: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedIconContainer: {
    // Add any special styling for liked state if needed
  },
  productInfo: {
    paddingTop: 8,
  },
  productName: {
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: '#000000',
    lineHeight: 18,
  },
  productSubtitle: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#666666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: FontFamilies.semiBold,
    color: '#000000',
    marginTop: 4,
  },
});

export default ProductItemComponent;
