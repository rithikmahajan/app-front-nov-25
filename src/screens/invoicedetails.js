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

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  headerSpacer: {
    width: 68,
  },

  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Order Header Styles
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'OpenSans-SemiBold',
  },

  // Date Styles
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dateLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#232321',
    marginRight: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    alignSelf: 'flex-end',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Product Image Styles
  productImageSection: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 20,
    height: 465,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
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
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImageItemSingle: {
    width: '90%',
    height: '95%',
    maxWidth: 400,
    maxHeight: 420,
    margin: 0,
    backgroundColor: 'transparent',
  },
  productImagePlaceholder: {
    fontSize: 24,
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
    fontSize: 10,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 10,
    height: 2,
    backgroundColor: '#848688',
    marginHorizontal: 2,
  },
  activeIndicator: {
    backgroundColor: '#000000',
    width: 34,
  },

  // Action Section Styles
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info Section Styles
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#232321',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#232321',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  infoDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    marginBottom: 4,
    lineHeight: 27.5,
    fontFamily: 'Montserrat-SemiBold',
  },

  // Delivery Section
  deliverySection: {
    marginBottom: 30,
    marginLeft: 64, // Offset to align with other content
  },

  // Payment Section Styles
  paymentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#232321',
    marginBottom: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 21,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: 8,
  },
  paymentDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    marginBottom: 4,
    fontFamily: 'OpenSans-SemiBold',
  },

  // Share Icon Styles
  shareIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: 16,
    color: '#767676',
  },
});

export default InvoiceDetails;
