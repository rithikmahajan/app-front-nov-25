import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { bundleService } from '../services/bundleService';

// Icon Components (outside main component to avoid re-renders)
const GiftIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V22H4V12M22 7H2V12H22V7ZM12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7ZM12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7ZM12 7V22"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 4V16M4 10H16"
      stroke="#767676"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Bundle Recommendations Component
 * Displays product bundles with "Frequently Bought Together" recommendations
 */
const BundleRecommendations = ({ productId, navigation, addToBag }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // Normalize bundle data from backend to match component expectations
  const normalizeBundleData = (bundle) => {
    // Backend structure -> Component structure
    return {
      _id: bundle._id,
      name: bundle.bundleName,
      description: bundle.description,
      products: [
        // Include main product first
        {
          _id: bundle.mainProduct.itemId,
          name: bundle.mainProduct.productName,
          productName: bundle.mainProduct.productName,
          images: [bundle.mainProduct.image],
          price: bundle.mainProduct.price,
          category: bundle.mainProduct.categoryName,
          subCategory: bundle.mainProduct.subCategoryName,
        },
        // Then bundle items
        ...bundle.bundleItems.map(item => ({
          _id: item.itemId,
          name: item.productName,
          productName: item.productName,
          images: [item.image],
          price: item.price,
          category: item.categoryName,
          subCategory: item.subCategoryName,
        }))
      ],
      totalPrice: bundle.totalOriginalPrice,
      discountedPrice: bundle.bundlePrice,
      discount: bundle.discountPercentage,
      isActive: bundle.isActive,
      priority: bundle.priority,
    };
  };

  const loadBundles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached bundles first
      const cached = await bundleService.getCachedBundles(`bundle_product_${productId}`);
      if (cached && cached.length > 0) {
        setBundles(cached);
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await bundleService.getBundlesForProduct(productId, 3);
      
      if (response.success && response.bundles.length > 0) {
        // Normalize the bundle data to match component expectations
        const normalizedBundles = response.bundles.map(normalizeBundleData);
        setBundles(normalizedBundles);
        
        // Cache the bundles
        await bundleService.cacheBundles(
          normalizedBundles, 
          `bundle_product_${productId}`
        );
        
        // Track bundle views
        normalizedBundles.forEach(bundle => {
          bundleService.trackBundleView(bundle);
        });
      } else {
        setBundles([]);
      }
    } catch (err) {
      console.error('❌ Error loading bundles:', err);
      // Don't show error for missing bundles, just hide the component
      setError(null);
      setBundles([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadBundles();
    }
  }, [productId, loadBundles]);

  const handleAddBundleToCart = async (bundle) => {
    try {
      setAddingToCart(bundle._id);
      
      // Track analytics
      bundleService.trackBundleAddToCart(bundle);
      
      // Add bundle to cart
      const result = await bundleService.addBundleToCart(bundle, addToBag);
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          result.message,
          [{ text: 'OK', style: 'default' }]
        );
      } else if (result.partial) {
        Alert.alert(
          'Partial Success',
          result.message + '\n\nFailed items: ' + result.failedProducts.join(', '),
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to add bundle to cart',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } catch (err) {
      console.error('❌ Error adding bundle to cart:', err);
      Alert.alert(
        'Error',
        'Failed to add bundle to cart. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return `₹${price.toFixed(2)}`;
  };

  const calculateSavings = (bundle) => {
    if (!bundle.discount || bundle.discount <= 0) return null;
    const savings = bundle.totalPrice - bundle.discountedPrice;
    return {
      amount: savings,
      percentage: bundle.discount,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  // Development mode: Show a message when no bundles are found
  // Remove this block in production
  if (__DEV__ && (!bundles || bundles.length === 0)) {
    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>🎁 Bundle Recommendations (Dev Mode)</Text>
        <Text style={styles.debugText}>
          No bundles configured for this product yet.
        </Text>
        <Text style={styles.debugSubtext}>
          To test: Create a bundle in admin panel with product ID: {productId?.substring(0, 8)}...
        </Text>
      </View>
    );
  }

  if (error || !bundles || bundles.length === 0) {
    return null; // Don't show anything if no bundles or error
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <GiftIcon />
        <Text style={styles.title}>Frequently Bought Together</Text>
      </View>

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bundlesContainer}
      >
        {bundles.map((bundle, bundleIndex) => {
          const savings = calculateSavings(bundle);
          const isAddingThisBundle = addingToCart === bundle._id;

          return (
            <View key={bundle._id || bundleIndex} style={styles.bundleCard}>
              {/* Bundle Header */}
              <View style={styles.bundleHeader}>
                <Text style={styles.bundleName}>{bundle.name}</Text>
                {bundle.description && (
                  <Text style={styles.bundleDescription}>
                    {bundle.description}
                  </Text>
                )}
              </View>

              {/* Products in Bundle */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsRow}
              >
                {bundle.products.map((product, index) => (
                  <React.Fragment key={product._id || index}>
                    <TouchableOpacity
                      style={styles.productItem}
                      onPress={() => {
                        if (navigation) {
                          navigation.navigate('ProductDetailsMain', {
                            product: product,
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {product.images && product.images.length > 0 ? (
                        <Image
                          source={{ uri: product.images[0] }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                      )}
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {product.name || product.productName || 'Product'}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatPrice(product.price)}
                      </Text>
                    </TouchableOpacity>

                    {/* Plus Icon Between Products */}
                    {index < bundle.products.length - 1 && (
                      <View style={styles.plusIconContainer}>
                        <PlusIcon />
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </ScrollView>

              {/* Bundle Pricing */}
              <View style={styles.pricingContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Total:</Text>
                  <Text
                    style={[
                      styles.originalPrice,
                      savings && styles.strikethrough,
                    ]}
                  >
                    {formatPrice(bundle.totalPrice)}
                  </Text>
                </View>

                {savings && (
                  <>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        Save {savings.percentage}%
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Bundle Price:</Text>
                      <Text style={styles.finalPrice}>
                        {formatPrice(bundle.discountedPrice)}
                      </Text>
                    </View>
                    <Text style={styles.savingsText}>
                      You save {formatPrice(savings.amount)}!
                    </Text>
                  </>
                )}
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  isAddingThisBundle && styles.addToCartButtonDisabled,
                ]}
                onPress={() => handleAddBundleToCart(bundle)}
                disabled={isAddingThisBundle}
                activeOpacity={0.7}
              >
                {isAddingThisBundle ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addToCartButtonText}>
                    Add Bundle to Cart
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    marginTop: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 24,
  },
  bundlesContainer: {
    gap: 20,
  },
  bundleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  bundleHeader: {
    marginBottom: 16,
  },
  bundleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 21.6,
    marginBottom: 4,
  },
  bundleDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8,
  },
  productsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  productItem: {
    width: 120,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    marginBottom: 8,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: 14.4,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#767676',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  plusIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pricingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA4335',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28A745',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 4,
  },
  addToCartButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.7,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  
  // Debug styles (for development mode)
  debugContainer: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  debugSubtext: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BundleRecommendations;
