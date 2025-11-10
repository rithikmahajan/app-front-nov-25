import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import bundleService from '../services/bundleService';
import SizeSelectionModal from './productdetailsmainsizeselectionchart';

const { width } = Dimensions.get('window');

const ProductDetailScreenshot = ({ route, navigation }) => {
  const { product, productId } = route.params || {};
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isSizeModalVisible, setIsSizeModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [modalActionType, setModalActionType] = useState('addToCart'); // 'addToCart' or 'buyNow'
  
  // Get product ID from either product object or direct productId param
  const currentProductId = product?._id || product?.id || productId;

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bundleService.getBundlesForProduct(currentProductId);
      
      if (response.success && response.data) {
        setBundles(response.data);
        if (response.data.length > 0) {
          setSelectedBundle(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProductId]);

  useEffect(() => {
    if (currentProductId) {
      fetchBundles();
    }
  }, [currentProductId, fetchBundles]);

  const handleAddBundleToCart = async (bundle, actionType = 'addToCart') => {
    try {
      // Set the action type for the modal
      setModalActionType(actionType);
      
      // Set the main product for size selection
      if (bundle && bundle.mainProduct) {
        setSelectedProductForSize(bundle.mainProduct);
        setIsSizeModalVisible(true);
      } else if (product) {
        // Fallback to the product passed in route params
        setSelectedProductForSize(product);
        setIsSizeModalVisible(true);
      } else {
        Alert.alert('Error', 'Product information not available');
      }
    } catch (error) {
      console.error('Error opening size selection:', error);
      Alert.alert(
        'Error',
        'Failed to open size selection',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleSizeModalClose = () => {
    setIsSizeModalVisible(false);
    setSelectedProductForSize(null);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing bundle: ${selectedBundle?.bundleName}`,
        title: selectedBundle?.bundleName,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete the Look</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bundles || bundles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete the Look</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="bag-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
          <Text style={styles.emptyDescription}>
            We're working on finding the perfect items to complement this product.
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete the Look</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bundle Selector Pills */}
        {bundles.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bundleSelector}
          >
            {bundles.map((bundle) => (
              <TouchableOpacity
                key={bundle._id}
                style={[
                  styles.bundlePill,
                  selectedBundle?._id === bundle._id && styles.bundlePillActive,
                ]}
                onPress={() => setSelectedBundle(bundle)}
              >
                <Text
                  style={[
                    styles.bundlePillText,
                    selectedBundle?._id === bundle._id && styles.bundlePillTextActive,
                  ]}
                >
                  {bundle.bundleName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedBundle && (
          <>
            {/* Bundle Title */}
            <View style={styles.titleSection}>
              <Text style={styles.bundleTitle}>{selectedBundle.bundleName}</Text>
              {selectedBundle.description && (
                <Text style={styles.bundleDescription}>
                  {selectedBundle.description}
                </Text>
              )}
            </View>

            {/* Main Product Grid (Nike/Urban Outfitters Style) */}
            <View style={styles.productsGrid}>
              {/* Main Product */}
              <View style={styles.mainProductCard}>
                <Image
                  source={{ uri: selectedBundle.mainProduct.image }}
                  style={styles.mainProductImage}
                  resizeMode="cover"
                />
                <View style={styles.mainProductBadge}>
                  <Text style={styles.mainProductBadgeText}>This Item</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {selectedBundle.mainProduct.productName}
                  </Text>
                  <Text style={styles.productCategory}>
                    {selectedBundle.mainProduct.categoryName}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{selectedBundle.mainProduct.price}
                  </Text>
                </View>
              </View>

              {/* Bundle Items Grid */}
              {selectedBundle.bundleItems.map((item, index) => (
                <View key={item.itemId} style={styles.bundleItemCard}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.bundleItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <Text style={styles.productCategory}>
                      {item.categoryName}
                    </Text>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Pricing Summary */}
            <View style={styles.pricingCard}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Items Total</Text>
                <Text style={styles.pricingValue}>
                  ₹{selectedBundle.totalOriginalPrice}
                </Text>
              </View>
              
              {selectedBundle.discountPercentage > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabelDiscount}>
                    Bundle Discount ({selectedBundle.discountPercentage}%)
                  </Text>
                  <Text style={styles.pricingValueDiscount}>
                    -₹{selectedBundle.discountAmount.toFixed(0)}
                  </Text>
                </View>
              )}
              
              <View style={styles.pricingDivider} />
              
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabelTotal}>Bundle Total</Text>
                <Text style={styles.pricingValueTotal}>
                  ₹{selectedBundle.bundlePrice.toFixed(0)}
                </Text>
              </View>
              
              {selectedBundle.discountPercentage > 0 && (
                <View style={styles.savingsBox}>
                  <Icon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.savingsText}>
                    You save ₹{selectedBundle.discountAmount.toFixed(0)} with this bundle
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddBundleToCart(selectedBundle, 'addToCart')}
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.buyNowButton}
                onPress={() => handleAddBundleToCart(selectedBundle, 'buyNow')}
              >
                <Text style={styles.buyNowButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>

            {/* Why This Bundle Section */}
            <View style={styles.whySection}>
              <Text style={styles.whySectionTitle}>Why this bundle?</Text>
              <View style={styles.whyItem}>
                <Icon name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.whyItemText}>
                  Curated by style experts
                </Text>
              </View>
              <View style={styles.whyItem}>
                <Icon name="pricetag-outline" size={20} color="#10B981" />
                <Text style={styles.whyItemText}>
                  Save {selectedBundle.discountPercentage}% when buying together
                </Text>
              </View>
              <View style={styles.whyItem}>
                <Icon name="star-outline" size={20} color="#10B981" />
                <Text style={styles.whyItemText}>
                  Frequently bought together
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Size Selection Modal */}
      {selectedProductForSize && (
        <SizeSelectionModal
          visible={isSizeModalVisible}
          onClose={handleSizeModalClose}
          product={selectedProductForSize}
          activeSize={selectedSize}
          setActiveSize={setSelectedSize}
          navigation={navigation}
          actionType={modalActionType}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  goBackButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  bundleSelector: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bundlePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  bundlePillActive: {
    backgroundColor: '#000',
  },
  bundlePillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  bundlePillTextActive: {
    color: '#fff',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bundleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  bundleDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  mainProductCard: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  mainProductImage: {
    width: '100%',
    height: width - 32,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  mainProductBadge: {
    position: 'absolute',
    top: 16,
    left: 24,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mainProductBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bundleItemCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  bundleItemImage: {
    width: '100%',
    height: (width / 2) - 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    marginTop: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  pricingCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 16,
    color: '#666',
  },
  pricingValue: {
    fontSize: 16,
    color: '#666',
  },
  pricingLabelDiscount: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  pricingValueDiscount: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  pricingLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  pricingValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  savingsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  whySection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  whySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  whyItemText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
});

export default ProductDetailScreenshot;
