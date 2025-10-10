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
import { YoraaAPI } from '../../YoraaAPIClient';
import apiService from '../services/apiService';
import { useBag } from '../contexts/BagContext';

const FavouritesModalOverlayForSizeSelection = ({ route, navigation }) => {
  const { product } = route.params || {};
  const { addToBag } = useBag();
  
  // Product data state
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Size selection state
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedUnit, setSelectedUnit] = useState('cm');
  const [activeTab, setActiveTab] = useState('sizeChart');
  
  // API data for size charts
  const [sizeChartData, setSizeChartData] = useState([]);
  const [sizeChartImage, setSizeChartImage] = useState(null);
  
  // Animation values for gesture handling
  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  
  const loadSizeChartData = useCallback(async () => {
    try {
      // Try to get detailed product info with size chart from API
      if (product?.subcategoryId) {
        const response = await apiService.getFilteredItems({
          subcategory: [product.subcategoryId],
          page: 1,
          limit: 50
        });

        if (response?.data?.items?.length > 0) {
          // Find matching product
          const matchingProduct = response.data.items.find(item => 
            item._id === product._id || 
            item.productName === product.productName ||
            item.title === product.title
          );

          if (matchingProduct) {
            console.log('✅ Found matching product with full data:', matchingProduct.productName);
            
            // Extract size chart data
            if (matchingProduct.sizes && matchingProduct.sizes.length > 0) {
              const sizes = matchingProduct.sizes.map(size => ({
                size: size.size,
                waistCm: size.waistCm || '71.1',
                inseamCm: size.inseamCm || '70.1',
                waistIn: size.waistIn || '28.0',
                inseamIn: size.inseamIn || '27.6',
                available: size.available !== false
              }));
              setSizeChartData(sizes);
            }

            // Extract size chart image
            if (matchingProduct.sizeChartImage?.url) {
              setSizeChartImage({
                url: matchingProduct.sizeChartImage.url,
                filename: matchingProduct.sizeChartImage.filename,
                uploadedAt: matchingProduct.sizeChartImage.uploadedAt
              });
              console.log('✅ Size chart image found:', matchingProduct.sizeChartImage.url);
            }

            // Update product data with full information
            setProductData(matchingProduct);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error loading size chart data:', err);
      // Don't set error here as basic product data should still work
    }
  }, [product]);

  const loadProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading product data for:', product);

      // Set basic product data from props
      setProductData(product);

      // Load size chart data from API
      await loadSizeChartData();
      
    } catch (err) {
      console.error('❌ Error loading product data:', err);
      setError('Failed to load product information');
    } finally {
      setLoading(false);
    }
  }, [product, loadSizeChartData]);

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

  // Generate quantity options (Remove, 1, 2, 3, 4, 5, ...)
  const quantityOptions = [
    { id: 'remove', label: 'Remove', isRemove: true },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}`, label: `${i + 1}` }))
  ];

  // Generate size options from product data or default sizes
  const availableSizes = sizeChartData.length > 0 
    ? sizeChartData.map(size => ({
        id: size.size,
        label: size.size,
        available: size.available
      }))
    : [
        { id: 'S', label: 'S', available: true },
        { id: 'M', label: 'M', available: true },
        { id: 'L', label: 'L', available: true },
        { id: 'XL', label: 'XL', available: true }
      ];

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
                await YoraaAPI.removeFromWishlist(product._id);
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

  const handleUnitToggle = (unit) => {
    setSelectedUnit(unit);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
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

              {/* Quantity Section */}
              <Text style={styles.sectionTitle}>Quantity</Text>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quantityOptionsScrollView}
                contentContainerStyle={styles.quantityOptionsContainer}
              >
                {quantityOptions.map(renderQuantityOption)}
              </ScrollView>

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
            </>
          )}

          {/* Size Chart Section */}
          {!loading && !error && sizeChartData.length > 0 && (
            <>
              <View style={styles.sizeChartHeader}>
                <Text style={styles.sizeChartTitle}>SIZE SELECTION</Text>
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabNavigation}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'sizeChart' && styles.activeTab]}
                  onPress={() => handleTabSwitch('sizeChart')}
                >
                  <Text style={[styles.tabText, activeTab === 'sizeChart' && styles.activeTabText]}>
                    Size Chart
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'howToMeasure' && styles.activeTab]}
                  onPress={() => handleTabSwitch('howToMeasure')}
                >
                  <Text style={[styles.tabText, activeTab === 'howToMeasure' && styles.activeTabText]}>
                    How To Measure
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <View style={styles.tabContent}>
                {activeTab === 'sizeChart' ? (
                  <View style={styles.sizeChartContent}>
                    {/* Unit Toggle */}
                    <View style={styles.unitToggleContainer}>
                      <Text style={styles.selectSizeText}>Select size in</Text>
                      <View style={styles.unitToggle}>
                        <TouchableOpacity
                          style={[styles.unitButton, selectedUnit === 'in' && styles.unitButtonActive]}
                          onPress={() => handleUnitToggle('in')}
                        >
                          <Text style={[styles.unitText, selectedUnit === 'in' && styles.unitTextActive]}>in</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitButton, selectedUnit === 'cm' && styles.unitButtonActive]}
                          onPress={() => handleUnitToggle('cm')}
                        >
                          <Text style={[styles.unitText, selectedUnit === 'cm' && styles.unitTextActive]}>cm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Size Chart Table */}
                    <View style={styles.tableContainer}>
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Size</Text>
                        <Text style={styles.tableHeaderText}>
                          To fit waist({selectedUnit})
                        </Text>
                        <Text style={styles.tableHeaderText}>
                          Inseam Length({selectedUnit})
                        </Text>
                      </View>

                      {/* Table Rows */}
                      {sizeChartData.map((item, index) => (
                        <View 
                          key={item.size} 
                          style={[
                            styles.tableRow,
                            index === sizeChartData.length - 1 && styles.lastTableRow
                          ]}
                        >
                          <Text style={styles.tableCellText}>{item.size}</Text>
                          <Text style={styles.tableCellText}>
                            {selectedUnit === 'cm' ? item.waistCm : item.waistIn}
                          </Text>
                          <Text style={styles.tableCellText}>
                            {selectedUnit === 'cm' ? item.inseamCm : item.inseamIn}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.howToMeasureContent}>
                    {sizeChartImage?.url ? (
                      <View style={styles.measurementImageContainer}>
                        <Image 
                          source={{ uri: sizeChartImage.url }}
                          style={styles.measurementImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.measurementInstructions}>
                          Follow the measurement guide above to find your perfect size.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.noImageContainer}>
                        <Text style={styles.noImageText}>
                          Measurement guide not available for this product.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </>
          )}

          {/* Fallback Size Chart Link */}
          {!loading && !error && sizeChartData.length === 0 && (
            <TouchableOpacity 
              style={styles.sizeChartContainer}
              onPress={handleSizeChart}
            >
              <Text style={styles.sizeChartText}>Size Chart</Text>
            </TouchableOpacity>
          )}

          {/* Add to Bag Button */}
          <TouchableOpacity 
            style={styles.addToBagButton}
            onPress={handleAddToBag}
          >
            <Text style={styles.addToBagButtonText}>Add to Bag</Text>
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
  addToBagButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: 19.2,
  },
});

export default FavouritesModalOverlayForSizeSelection;
