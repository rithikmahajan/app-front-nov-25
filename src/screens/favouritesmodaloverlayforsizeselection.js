import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import apiService from '../services/apiService';
import { useBag } from '../contexts/BagContext';
import { useFavorites } from '../contexts/FavoritesContext';

const FavouritesModalOverlayForSizeSelection = ({ route, navigation }) => {
  const { product } = route.params || {};
  const { addToBag } = useBag();
  const { removeFromFavorites } = useFavorites();
  
  // Product data state
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Size selection state
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [selectedSize, setSelectedSize] = useState('S');
  
  // API data for size charts
  const [sizeChartData, setSizeChartData] = useState([]);
  const [sizeChartImage, setSizeChartImage] = useState(null);
  
  // Animation values for gesture handling
  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  
  const loadProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading product data for:', product);

      // Fetch complete product data from API
      if (!product?._id && !product?.productId && !product?.itemId) {
        console.log('⚠️ No product ID found');
        setError('Product ID not available');
        setLoading(false);
        return;
      }

      const productId = product._id || product.productId || product.itemId;
      console.log('🔍 Fetching product with ID:', productId);
      
      const response = await apiService.getItemById(productId);

      if (response?.data) {
        const fullProduct = response.data;
        console.log('✅ Full product data loaded:', fullProduct.productName);
        console.log('🔍 Product sizes:', fullProduct.sizes);
        
        // Set the complete product data
        setProductData(fullProduct);

        // Extract size chart data with stock information
        if (fullProduct.sizes && fullProduct.sizes.length > 0) {
          const dynamicSizes = fullProduct.sizes
            .filter(size => size.size) // Only include sizes with size field
            .map(size => {
              // Helper function to safely get value with multiple field name variations
              const getValue = (obj, keys) => {
                for (const key of keys) {
                  if (obj.hasOwnProperty(key)) {
                    const val = obj[key];
                    if (val !== undefined && val !== null && val !== '' && val !== 'N/A' && val !== '-') {
                      const numVal = Number(val);
                      return !isNaN(numVal) ? numVal : val;
                    }
                  }
                }
                return null;
              };
              
              // Extract measurements with camelCase priority to match backend structure
              const chestCm = getValue(size, ['chestCm', 'Chest (cm)', 'chest (cm)']);
              const chestIn = getValue(size, ['chestIn', 'Chest (in)', 'chest (in)']);
              const frontLengthCm = getValue(size, ['frontLengthCm', 'Front Length (cm)', 'length (cm)', 'Length (cm)']);
              const frontLengthIn = getValue(size, ['frontLengthIn', 'Front Length (in)', 'length (in)', 'Length (in)']);
              const shoulderCm = getValue(size, ['acrossShoulderCm', 'Shoulder (cm)', 'shoulder (cm)', 'shoulderCm']);
              const shoulderIn = getValue(size, ['acrossShoulderIn', 'Shoulder (in)', 'shoulder (in)', 'shoulderIn']);
              const waistCm = getValue(size, ['fitWaistCm', 'Waist (cm)', 'waist (cm)', 'waistCm']);
              const waistIn = getValue(size, ['toFitWaistIn', 'Waist (in)', 'waist (in)', 'waistIn']);
              const inseamCm = getValue(size, ['inseamLengthCm', 'Inseam (cm)', 'inseam (cm)', 'inseamCm']);
              const inseamIn = getValue(size, ['inseamLengthIn', 'Inseam (in)', 'inseam (in)', 'inseamIn']);
              const hipCm = getValue(size, ['hipCm', 'Hip (cm)', 'hip (cm)']);
              const hipIn = getValue(size, ['hipIn', 'Hip (in)', 'hip (in)']);
              
              console.log('📏 [Modal] Extracted measurements:', {
                size: size.size,
                chestCm, chestIn, frontLengthCm, frontLengthIn,
                shoulderCm, shoulderIn, waistCm, waistIn, 
                inseamCm, inseamIn, hipCm, hipIn
              });
              
              return {
                size: size.size,
                // Map all available backend fields - use extracted values
                chestCm,
                chestIn,
                frontLengthCm,
                frontLengthIn,
                acrossShoulderCm: shoulderCm,
                acrossShoulderIn: shoulderIn,
                waistCm,
                waistIn,
                inseamCm,
                inseamIn,
                hipCm,
                hipIn,
                quantity: size.quantity || 0,
                stock: size.stock || size.quantity || 0,
                regularPrice: size.regularPrice || 0,
                salePrice: size.salePrice || 0,
                available: (size.stock || size.quantity || 0) > 0
              };
            });
          
          setSizeChartData(dynamicSizes);
          console.log('✅ Size chart data with stock loaded:', dynamicSizes);

          
          // Set first available size as default
          const firstAvailableSize = dynamicSizes.find(s => s.available);
          if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize.size);
          }
        } else {
          console.log('⚠️ No sizes found in product');
          setSizeChartData([]);
          setError('No size information available for this product');
        }

        // Extract size chart image
        if (fullProduct.sizeChartImage?.url) {
          setSizeChartImage({
            url: fullProduct.sizeChartImage.url,
            filename: fullProduct.sizeChartImage.filename,
            uploadedAt: fullProduct.sizeChartImage.uploadedAt
          });
          console.log('✅ Size chart image found:', fullProduct.sizeChartImage.url);
        }
      } else {
        console.log('⚠️ No product data found in API response');
        setError('Product not found in database');
      }
      
    } catch (err) {
      console.error('❌ Error loading product data:', err);
      setError('Failed to load product information');
    } finally {
      setLoading(false);
    }
  }, [product]);

  // Load product data and size chart information
  useEffect(() => {
    if (product) {
      loadProductData();
    }
  }, [product, loadProductData]);



  // Pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes starting from the top 100px of the modal
        const { dy, y0 } = gestureState;
        const modalTop = screenHeight * 0.4; // Approximate modal top position
        return Math.abs(dy) > 10 && dy > 0 && y0 < modalTop + 100;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy >= 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        
        // If dragged down more than 100px or with sufficient velocity, close modal
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModalWithAnimation();
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Generate quantity options based on selected size stock (NO STATIC DATA)
  const getMaxQuantityForSize = () => {
    const selectedSizeData = sizeChartData.find(size => size.size === selectedSize);
    if (selectedSizeData && selectedSizeData.stock > 0) {
      // Limit to max 10 or available stock, whichever is lower
      return Math.min(selectedSizeData.stock, 10);
    }
    return 0; // No stock available
  };

  const maxQuantity = getMaxQuantityForSize();
  
  const quantityOptions = [
    { id: 'remove', label: 'Remove', isRemove: true },
    ...Array.from({ length: maxQuantity }, (_, i) => ({ 
      id: `${i + 1}`, 
      label: `${i + 1}`,
      available: true 
    }))
  ];

  // Generate size options from product data (NO FALLBACK - only show real data)
  const availableSizes = sizeChartData.length > 0 
    ? sizeChartData.map(size => ({
        id: size.size,
        label: size.size,
        available: size.available,
        stock: size.stock,
        quantity: size.quantity
      }))
    : [];

  const handleQuantitySelect = (quantityId) => {
    if (quantityId === 'remove') {
      handleRemoveFromWishlist();
    } else {
      setSelectedQuantity(quantityId);
    }
  };

  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
  };

  const handleRemoveFromWishlist = async () => {
    try {
      Alert.alert(
        'Remove from Wishlist',
        'Are you sure you want to remove this item from your wishlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const productId = product._id || product.productId || product.itemId;
                await removeFromFavorites(productId);
                console.log('✅ Item removed from wishlist');
                navigation.goBack();
                // Optionally refresh the favorites list
              } catch (removeError) {
                console.error('❌ Error removing from wishlist:', removeError);
                Alert.alert('Error', 'Failed to remove item from wishlist');
              }
            }
          }
        ]
      );
    } catch (handlerError) {
      console.error('❌ Error in remove handler:', handlerError);
    }
  };

  const handleAddToBag = async () => {
    try {
      if (!selectedSize) {
        Alert.alert('Select Size', 'Please select a size before adding to bag');
        return;
      }

      // Find the selected size data
      const sizeData = availableSizes.find(size => size.id === selectedSize);
      if (!sizeData?.available) {
        Alert.alert('Size Unavailable', 'This size is currently unavailable');
        return;
      }

      // Add to cart via BagContext (handles both authenticated and guest users)
      const quantity = parseInt(selectedQuantity, 10) || 1;
      
      console.log('🔍 Adding to bag with details:', {
        productId: product._id || product.id,
        selectedSize,
        quantity,
        sizeData,
        availableSizes,
        productSizes: product.sizes
      });
      
      // Use BagContext addToBag method which handles authentication properly
      let addedSuccessfully = true;
      for (let i = 0; i < quantity; i++) {
        try {
          await addToBag(product, selectedSize);
        } catch (itemError) {
          console.error('❌ Error adding individual item:', itemError);
          addedSuccessfully = false;
          throw itemError; // Re-throw to be caught by outer catch
        }
      }
      
      if (addedSuccessfully) {
        console.log('✅ Item added to bag successfully');
        
        // Navigate to confirmation modal
        navigation.navigate('FavouritesAddedToBagConfirmationModal', { 
          product: productData || product, 
          selectedSize, 
          selectedQuantity: quantity,
          fromWishlist: true
        });
      }
      
    } catch (addError) {
      console.error('❌ Error adding to bag:', addError);
      Alert.alert('Error', 'Failed to add item to bag. Please try again.');
    }
  };

  const handleSizeChart = () => {
    // Navigate to size chart modal with full product data
    navigation.navigate('FavouritesSizeChartReference', { 
      product: productData || product,
      sizeChartData,
      sizeChartImage
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const closeModalWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    closeModalWithAnimation();
  };

  const renderQuantityOption = (option) => {
    const isSelected = option.id === selectedQuantity;
    const isRemove = option.isRemove;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.quantityOption,
          isSelected && styles.quantityOptionSelected,
          isRemove && styles.quantityOptionRemove,
        ]}
        onPress={() => handleQuantitySelect(option.id)}
      >
        <Text style={[
          styles.quantityOptionText,
          isSelected && styles.quantityOptionTextSelected,
          isRemove && styles.quantityOptionTextRemove,
        ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSizeOption = (option) => {
    const isSelected = option.id === selectedSize;
    const isDisabled = !option.available;
    const stockCount = option.stock || option.quantity || 0;
    const isLowStock = stockCount > 0 && stockCount <= 3;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.sizeOption,
          isSelected && styles.sizeOptionSelected,
          isDisabled && styles.sizeOptionDisabled,
        ]}
        onPress={() => handleSizeSelect(option.id)}
        disabled={isDisabled}
      >
        <Text style={[
          styles.sizeOptionText,
          isSelected && styles.sizeOptionTextSelected,
          isDisabled && styles.sizeOptionTextDisabled,
        ]}>
          {option.label}
        </Text>
        {!isDisabled && isLowStock && (
          <Text style={styles.lowStockIndicator}>
            {stockCount} left
          </Text>
        )}
        {isDisabled && (
          <Text style={styles.outOfStockIndicator}>
            Out of stock
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Helper functions to get product data
  const getProductImage = () => {
    const currentProduct = productData || product;
    if (currentProduct?.images?.length > 0) {
      return currentProduct.images[0].url;
    }
    return null;
  };

  const getProductPrice = () => {
    const currentProduct = productData || product;
    if (currentProduct?.sizes?.length > 0) {
      const firstSize = currentProduct.sizes[0];
      if (firstSize.salePrice) {
        return `₹${firstSize.salePrice}`;
      } else if (firstSize.regularPrice) {
        return `₹${firstSize.regularPrice}`;
      }
    }
    return currentProduct?.price || 'Price not available';
  };

  const getProductName = () => {
    const currentProduct = productData || product;
    return currentProduct?.productName || currentProduct?.name || 'Product';
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drawer Handle - Enhanced for drag gesture */}
          <TouchableOpacity 
            style={styles.drawerHandleContainer}
            activeOpacity={0.8}
          >
            <View style={styles.drawerHandle} />
          </TouchableOpacity>
          
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.black} />
              <Text style={styles.loadingText}>Loading product details...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadProductData} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Product Section */}
          {!loading && !error && (
            <>
              <View style={styles.productSection}>
                <View style={styles.productImageContainer}>
                  {getProductImage() ? (
                    <Image 
                      source={{ uri: getProductImage() }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder} />
                  )}
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {getProductName()}
                  </Text>
                  <Text style={styles.productCategory}>
                    {productData?.category || product?.category || 'Fashion'}
                  </Text>
                  <Text style={styles.productPrice}>
                    {getProductPrice()}
                  </Text>
                </View>
              </View>

              {/* Show message if no sizes available */}
              {availableSizes.length === 0 && (
                <View style={styles.noSizesContainer}>
                  <Text style={styles.noSizesText}>
                    No sizes available for this product at the moment.
                  </Text>
                </View>
              )}

              {/* Quantity Section - Only show if sizes are available */}
              {availableSizes.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Quantity</Text>
                  {maxQuantity > 0 ? (
                    <ScrollView 
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.quantityOptionsScrollView}
                      contentContainerStyle={styles.quantityOptionsContainer}
                    >
                      {quantityOptions.map(renderQuantityOption)}
                    </ScrollView>
                  ) : (
                    <View style={styles.noStockContainer}>
                      <Text style={styles.noStockText}>
                        Selected size is out of stock
                      </Text>
                    </View>
                  )}

                  {/* Size Section */}
                  <Text style={styles.sectionTitle}>Size</Text>
                  <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.sizeOptionsScrollView}
                    contentContainerStyle={styles.sizeOptionsContainer}
                  >
                    {availableSizes.map(renderSizeOption)}
                  </ScrollView>

                  {/* Size Chart Button - Always visible when sizes are available */}
                  <TouchableOpacity 
                    style={styles.sizeChartButton}
                    onPress={handleSizeChart}
                  >
                    <Text style={styles.sizeChartButtonText}>Size Chart</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* Size Chart Button - Fallback when no size data available */}
          {!loading && !error && availableSizes.length === 0 && (
            <TouchableOpacity 
              style={styles.sizeChartContainer}
              onPress={handleSizeChart}
            >
              <Text style={styles.sizeChartText}>Size Chart</Text>
            </TouchableOpacity>
          )}

          {/* Move to Bag Button */}
          <TouchableOpacity 
            style={[
              styles.addToBagButton,
              (availableSizes.length === 0 || maxQuantity === 0) && styles.addToBagButtonDisabled
            ]}
            onPress={handleAddToBag}
            disabled={availableSizes.length === 0 || maxQuantity === 0}
          >
            <Text style={[
              styles.addToBagButtonText,
              (availableSizes.length === 0 || maxQuantity === 0) && styles.addToBagButtonTextDisabled
            ]}>
              {availableSizes.length === 0 ? 'No Sizes Available' : maxQuantity === 0 ? 'Out of Stock' : 'Move to Bag'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 34,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  drawerHandleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHandle: {
    width: 64,
    height: 6,
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
  },
  // Loading and Error States
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    marginTop: 12,
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
  },
  // Product Section
  productSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    gap: 16,
  },
  productImageContainer: {
    width: 154,
    height: 154,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    lineHeight: 20,
    letterSpacing: -0.16,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    lineHeight: 20,
    letterSpacing: -0.16,
    marginTop: 'auto',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 22,
  },
  // Quantity Options
  quantityOptionsScrollView: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quantityOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
  },
  quantityOption: {
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityOptionSelected: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
  },
  quantityOptionRemove: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  quantityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
  },
  quantityOptionTextSelected: {
    color: Colors.white,
  },
  quantityOptionTextRemove: {
    color: '#FF6B6B',
  },
  
  // Size Options
  sizeOptionsScrollView: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sizeOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sizeOptionSelected: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
  },
  sizeOptionDisabled: {
    backgroundColor: '#F6F6F6',
    borderColor: '#E4E4E4',
    opacity: 0.5,
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
  },
  sizeOptionTextSelected: {
    color: Colors.white,
  },
  lowStockIndicator: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#FF9500',
    marginTop: 2,
  },
  outOfStockIndicator: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#FF6B6B',
    marginTop: 2,
  },
  noSizesContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  noSizesText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    textAlign: 'center',
  },
  noStockContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  noStockText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  sizeOptionTextDisabled: {
    color: '#BABABA',
  },
  // Size Chart Section
  sizeChartHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  sizeChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    letterSpacing: -0.18,
  },
  
  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.black,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
  },
  activeTabText: {
    color: Colors.black,
    fontWeight: '600',
  },
  
  // Tab Content
  tabContent: {
    flex: 1,
  },
  sizeChartContent: {
    padding: 20,
  },
  
  // Unit Toggle
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  selectSizeText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  unitButtonActive: {
    backgroundColor: Colors.black,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
  },
  unitTextActive: {
    color: Colors.white,
  },
  
  // Size Chart Table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCellText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
  },
  
  // How To Measure Content
  howToMeasureContent: {
    padding: 20,
  },
  measurementImageContainer: {
    alignItems: 'center',
  },
  measurementImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 16,
  },
  measurementInstructions: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    textAlign: 'center',
    lineHeight: 20,
  },
  noImageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noImageText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    textAlign: 'center',
  },
  
  // Size Chart Button
  sizeChartButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeChartButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textDecorationLine: 'underline',
    lineHeight: 16.8,
  },
  
  // Fallback Size Chart Link
  sizeChartContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  sizeChartText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textDecorationLine: 'underline',
    lineHeight: 16.8,
  },
  addToBagButton: {
    backgroundColor: Colors.black,
    borderRadius: 100,
    marginHorizontal: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60.283,
  },
  addToBagButtonDisabled: {
    backgroundColor: '#E4E4E4',
    opacity: 0.6,
  },
  addToBagButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: 19.2,
  },
  addToBagButtonTextDisabled: {
    color: '#999999',
  },
});

export default FavouritesModalOverlayForSizeSelection;
