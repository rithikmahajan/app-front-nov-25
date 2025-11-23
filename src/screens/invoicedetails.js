import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GlobalBackButton from '../components/GlobalBackButton';
import auth from '@react-native-firebase/auth';
import { apiService } from '../services/apiService';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// User Icon Component
const UserIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>👤</Text>
  </View>
);

// Bag Icon Component
const BagIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>🛍️</Text>
  </View>
);

// Share Icon Component
const ShareIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M14.2857 5.14283L12.0251 2.85712L9.71425 5.14283M12 2.85712V13.1428M8.57139 7.42854H7.42854C6.82233 7.42854 6.24095 7.66936 5.81229 8.09802C5.38364 8.52667 5.14282 9.10805 5.14282 9.71426V17.7143C5.14282 18.3205 5.38364 18.9018 5.81229 19.3305C6.24095 19.7592 6.82233 20 7.42854 20H16.5714C17.1776 20 17.759 19.7592 18.1876 19.3305C18.6163 18.9018 18.8571 18.3205 18.8571 17.7143V9.71426C18.8571 9.10805 18.6163 8.52667 18.1876 8.09802C17.759 7.66936 17.1776 7.42854 16.5714 7.42854H15.4285" 
      stroke="#767676" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const InvoiceDetails = ({ navigation, route }) => {
  const { invoice } = route.params || {};
  const order = invoice?.fullOrderData || {};
  
  // State for enriched product data
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Get user info from Firebase or order data
  const currentUser = auth().currentUser;
  const userEmail = currentUser?.email || order.user_email || 'N/A';
  const userPhone = currentUser?.phoneNumber || order.user_phone || 'N/A';
  const userName = currentUser?.displayName || order.user_name || 'Customer';

  // Fetch full product details for items without images
  useEffect(() => {
    const enrichOrderItems = async () => {
      if (!order.items || order.items.length === 0) {
        console.log('No items to enrich');
        return;
      }

      setLoadingProducts(true);
      
      try {
        console.log('🖼️ Enriching order items with product images...');
        
        const enrichedPromises = order.items.map(async (item) => {
          // Check if item already has image
          const hasImage = item.images?.[0]?.url || item.images?.[0] || item.image || item.thumbnail;
          
          if (hasImage) {
            console.log(`✅ Item ${item.id || item._id} already has image`);
            return item;
          }

          // If no image, fetch full product details
          const productId = item.product_id || item.productId || item.id || item._id;
          
          if (!productId) {
            console.warn('⚠️ No product ID found for item:', item);
            return item;
          }

          try {
            console.log(`📦 Fetching product details for ID: ${productId}`);
            const productResponse = await apiService.getItemById(productId);
            
            if (productResponse.success && productResponse.data) {
              const productData = productResponse.data;
              console.log(`✅ Got product data with images:`, productData.images?.length || 0);
              
              // Merge product images into item
              return {
                ...item,
                images: productData.images || [],
                image: productData.images?.[0]?.url || productData.images?.[0] || item.image,
                thumbnail: productData.images?.[0]?.url || productData.images?.[0],
              };
            }
          } catch (err) {
            console.error(`❌ Failed to fetch product ${productId}:`, err.message);
          }
          
          return item;
        });

        const enriched = await Promise.all(enrichedPromises);
        setEnrichedItems(enriched);
        console.log('✅ Order items enriched with product images');
        
      } catch (error) {
        console.error('❌ Error enriching order items:', error);
        // Fallback to original items
        setEnrichedItems(order.items);
      } finally {
        setLoadingProducts(false);
      }
    };

    enrichOrderItems();
  }, [order.items]);

  // Use enriched items if available, otherwise use original
  const displayItems = enrichedItems.length > 0 ? enrichedItems : (order.items || []);

  const handleBack = () => {
    console.log('InvoiceDetails: handleBack called');
    console.log('Navigation object:', navigation);
    try {
      navigation.navigate('Invoice');
      console.log('InvoiceDetails: Successfully navigated to Invoice');
    } catch (error) {
      console.error('InvoiceDetails: Navigation error:', error);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      Alert.alert(
        'Download Started',
        `Invoice for Order #${invoice?.orderNumber || 'N/A'} is being downloaded to your device.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Download Failed',
        'Failed to download invoice. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShareInvoice = async () => {
    try {
      const orderDate = invoice?.date || 'N/A';
      const amount = invoice?.amount || 'N/A';
      const orderNum = invoice?.orderNumber || 'N/A';
      
      await Share.share({
        message: `Invoice #${orderNum}\nOrder ${invoice?.statusText || 'Status'}\nDate: ${orderDate}\nAmount: ${amount}`,
        title: `Invoice #${orderNum}`,
        ...(Platform.OS === 'ios' && {
          url: `https://yoraa.app/invoice/${orderNum}`,
        }),
      });
    } catch (error) {
      Alert.alert(
        'Share Failed',
        'Failed to share invoice. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4CD964'; // Green for delivered
      case 'cancelled':
        return '#EA4335'; // Red for cancelled
      case 'exchange':
        return '#FBBC05'; // Yellow for exchange
      default:
        return '#767676'; // Gray default
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'exchange':
        return 'Exchange Requested';
      default:
        return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <GlobalBackButton onPress={handleBack} />
        </View>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order ID and Status */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderIdText}>
            Orders ID: #{invoice?.orderNumber?.slice(-4) || order._id?.slice(-4) || '1234'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice?.status) }]}>
            <Text style={styles.statusBadgeText}>
              {getStatusText(invoice?.status)}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Dated:</Text>
          <Text style={styles.dateValue}>{invoice?.date || 'N/A'}</Text>
        </View>

        {/* Product Image Section */}
        <View style={styles.productImageSection}>
          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>Loading product images...</Text>
            </View>
          ) : displayItems && displayItems.length > 0 ? (
            <>
              <View style={styles.productImageGrid}>
                {displayItems.slice(0, 6).map((item, index) => {
                  // Get product image from various possible sources
                  const productImage = 
                    item.images?.[0]?.url ||  // First image URL from images array
                    item.images?.[0] ||        // First image as string
                    item.image ||              // Direct image property
                    item.thumbnail ||          // Thumbnail property
                    item.product?.images?.[0]?.url ||  // Product object images
                    item.product?.image ||     // Product object image
                    item.productId?.images?.[0]?.url || // productId object with images
                    item.productId?.image ||   // productId object image
                    null;

                  console.log(`Product ${index} (${item.name || item.product_name || 'Unknown'}):`, {
                    productImage,
                    hasImages: !!item.images,
                    imagesLength: item.images?.length,
                    fullItem: item
                  });

                  // Use larger size for single product
                  const isSingleProduct = displayItems.length === 1;

                  return (
                    <View key={`product-${index}-${item.id || item._id}`} style={[
                      styles.productImageItem,
                      isSingleProduct && styles.productImageItemSingle
                    ]}>
                      <Image 
                        source={{ uri: productImage }} 
                        style={styles.productImageThumb}
                        resizeMode="contain"
                        onError={(e) => {
                          console.error(`Failed to load image for product ${index}:`, e.nativeEvent.error);
                        }}
                        onLoad={() => {
                          console.log(`✅ Successfully loaded image for product ${index}`);
                        }}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={styles.imageIndicators}>
                <View style={[styles.indicator, styles.activeIndicator]} />
                {displayItems.length > 1 && (
                  Array(Math.min(displayItems.length - 1, 4)).fill(0).map((_, i) => (
                    <View key={`indicator-${i}`} style={styles.indicator} />
                  ))
                )}
              </View>
            </>
          ) : null}
        </View>

        {/* Download and Share Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Text style={styles.downloadButtonText}>Download Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareInvoice}
            activeOpacity={0.8}
          >
            <ShareIcon />
          </TouchableOpacity>
        </View>

        {/* Order Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <BagIcon />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Order Info</Text>
              <Text style={styles.infoDetail}>
                Shipping: {order.shipping_method || order.shipping_status || 'Standard'}
              </Text>
              <Text style={styles.infoDetail}>
                Payment Method: {order.payment_method || 'Razorpay'}
              </Text>
              <Text style={styles.infoDetail}>
                Status: {order.payment_status || 'Pending'}
              </Text>
              {order.total_price && (
                <Text style={styles.infoDetail}>
                  Total Amount: ${order.total_price}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <UserIcon />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Customer</Text>
              <Text style={styles.infoDetail}>Full Name: {userName}</Text>
              <Text style={styles.infoDetail}>Email: {userEmail}</Text>
              <Text style={styles.infoDetail}>Phone: {userPhone}</Text>
            </View>
          </View>
        </View>

        {/* Billing Address Section */}
        {order.address && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <BagIcon />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Billed to</Text>
                <Text style={styles.infoDetail}>
                  Address: {order.address.street || ''}, {order.address.city || ''}, {order.address.state || ''} {order.address.pincode || order.address.postal_code || ''}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Delivery Address Section */}
        {order.address && (
          <View style={styles.deliverySection}>
            <Text style={styles.infoTitle}>Delivered to</Text>
            <Text style={styles.infoDetail}>
              Address: {order.address.street || ''}, {order.address.city || ''}, {order.address.state || ''} {order.address.pincode || order.address.postal_code || ''}
            </Text>
          </View>
        )}

        {/* Payment Info Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>payment info</Text>
          <View style={styles.paymentRow}>
            <View style={styles.cardIcon} />
            <Text style={styles.paymentDetail}>
              {order.payment_method || 'Card'} **** **** {order.razorpay_order_id?.slice(-4) || '****'}
            </Text>
          </View>
          {order.razorpay_order_id && (
            <Text style={styles.paymentDetail}>
              Transaction ID: {order.razorpay_order_id}
            </Text>
          )}
          <Text style={styles.paymentDetail}>Business name: {userName}</Text>
          <Text style={styles.paymentDetail}>Phone: {userPhone}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingVertical: hp(isTablet ? 1.8 : 1.5),
    backgroundColor: '#FFFFFF',
    paddingTop: hp(isTablet ? 2.5 : 2),
  },
  backButtonContainer: {
    width: wp(isTablet ? 22 : 18),
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  headerSpacer: {
    width: wp(isTablet ? 22 : 18),
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
    paddingVertical: hp(isTablet ? 3.1 : 2.5),
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(isTablet ? 1.5 : 1.2),
  },
  orderIdText: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: wp(isTablet ? 4 : 3.2),
    paddingVertical: hp(isTablet ? 1.2 : 1),
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'OpenSans-SemiBold',
  },

  dateContainer: {
    flexDirection: 'row',
    marginBottom: hp(isTablet ? 4.6 : 3.7),
  },
  dateLabel: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontWeight: '600',
    color: '#232321',
    marginRight: wp(isTablet ? 3.3 : 2.6),
    fontFamily: 'Montserrat-SemiBold',
  },
  dateValue: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#70706E',
    alignSelf: 'flex-end',
    fontFamily: 'Montserrat-SemiBold',
  },

  productImageSection: {
    marginBottom: hp(isTablet ? 4.6 : 3.7),
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: wp(isTablet ? 6.6 : 5.3),
    height: hp(isTablet ? 72 : isSmallDevice ? 52 : 58),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(isTablet ? 1.5 : 1.2),
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  productImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  productImageItem: {
    width: wp(isTablet ? 26.6 : isSmallDevice ? 18 : 21.3),
    height: wp(isTablet ? 26.6 : isSmallDevice ? 18 : 21.3),
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    margin: wp(isTablet ? 1.6 : 1.3),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImageItemSingle: {
    width: '90%',
    height: '95%',
    maxWidth: wp(isTablet ? 133 : 106),
    maxHeight: hp(isTablet ? 65 : 52),
    margin: 0,
    backgroundColor: 'transparent',
  },
  productImagePlaceholder: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
  },
  productImageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  noImageText: {
    fontSize: fs(isTablet ? 12 : isSmallDevice ? 9 : 10),
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(isTablet ? 3.1 : 2.5),
  },
  indicator: {
    width: wp(isTablet ? 3.3 : 2.6),
    height: hp(isTablet ? 0.3 : 0.25),
    backgroundColor: '#848688',
    marginHorizontal: wp(isTablet ? 0.6 : 0.5),
  },
  activeIndicator: {
    backgroundColor: '#000000',
    width: wp(isTablet ? 11.3 : 9),
  },

  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(isTablet ? 4.6 : 3.7),
    gap: wp(isTablet ? 6.6 : 5.3),
  },
  downloadButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  shareButton: {
    width: wp(isTablet ? 16 : 12.8),
    height: wp(isTablet ? 16 : 12.8),
    borderRadius: wp(isTablet ? 8 : 6.4),
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoSection: {
    marginBottom: hp(isTablet ? 3.1 : 2.5),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: wp(isTablet ? 16 : 12.8),
    height: wp(isTablet ? 16 : 12.8),
    backgroundColor: '#232321',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(isTablet ? 5.3 : 4.3),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    color: '#FFFFFF',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    fontWeight: '600',
    color: '#232321',
    marginBottom: hp(isTablet ? 1.2 : 1),
    fontFamily: 'Montserrat-SemiBold',
  },
  infoDetail: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#70706E',
    marginBottom: hp(isTablet ? 0.6 : 0.5),
    lineHeight: fs(isTablet ? 33 : isSmallDevice ? 24 : 28),
    fontFamily: 'Montserrat-SemiBold',
  },

  deliverySection: {
    marginBottom: hp(isTablet ? 4.6 : 3.7),
    marginLeft: wp(isTablet ? 21.3 : 17),
  },

  paymentSection: {
    marginBottom: hp(isTablet ? 4.6 : 3.7),
  },
  sectionTitle: {
    fontSize: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    fontWeight: '600',
    color: '#232321',
    marginBottom: hp(isTablet ? 2.5 : 2),
    fontFamily: 'Montserrat-SemiBold',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(isTablet ? 1.2 : 1),
  },
  cardIcon: {
    width: wp(isTablet ? 12 : 9.6),
    height: hp(isTablet ? 3.2 : 2.6),
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: wp(isTablet ? 2.6 : 2.1),
  },
  paymentDetail: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#70706E',
    marginBottom: hp(isTablet ? 0.6 : 0.5),
    fontFamily: 'OpenSans-SemiBold',
  },

  shareIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    color: '#767676',
  },
});

export default InvoiceDetails;
