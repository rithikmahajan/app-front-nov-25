import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { yoraaAPI } from '../services/yoraaAPI';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return '#32862b'; // Green for delivered - exact Figma color
    case 'cancelled':
      return '#ea4335'; // Red for cancelled - exact Figma color
    case 'exchange':
      return '#fbbc05'; // Yellow for exchange - exact Figma color
    default:
      return '#767676'; // Gray default
  }
};

const InvoiceScreen = ({ navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders/invoices from backend
  const fetchInvoices = useCallback(async () => {
    try {
      setError(null);
      console.log('📄 Fetching invoices from backend...');
      
      const response = await yoraaAPI.getUserOrders();
      
      if (response.success && response.data && response.data.length > 0) {
        // Transform orders into invoice format
        const transformedInvoices = response.data.map(order => {
          const firstItem = order.items?.[0] || {};
          const firstQuantity = order.item_quantities?.[0] || {};
          
          // Extract image from various possible sources
          const productImage = 
            firstItem.images?.[0]?.url ||      // Image array with URL objects
            firstItem.images?.[0] ||           // Image array with strings
            firstItem.image ||                 // Direct image property
            firstItem.thumbnail ||             // Thumbnail property
            firstItem.product?.images?.[0]?.url || // Nested product object
            firstItem.product?.image ||
            null;
          
          console.log('🖼️ Order item image:', {
            orderId: order._id,
            productImage,
            firstItem: firstItem
          });
          
          return {
            id: order._id || order.id,
            orderId: order._id || order.id,
            status: order.order_status?.toLowerCase(),
            statusText: getStatusTextFromOrder(order.order_status),
            productName: firstItem.name || firstItem.description || 'Product',
            productDetails: firstItem.description || '',
            size: firstQuantity.sku || firstQuantity.size || 'N/A',
            image: productImage,
            date: order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'N/A',
            orderNumber: order.razorpay_order_id || order._id?.slice(-8) || 'N/A',
            amount: order.total_price ? `$${order.total_price}` : 'N/A',
            // Full order data for invoice details
            fullOrderData: order,
          };
        });
        
        console.log('✅ Invoices transformed:', transformedInvoices.length);
        setInvoices(transformedInvoices);
      } else {
        console.log('ℹ️ No orders found for user');
        setInvoices([]);
      }
    } catch (err) {
      console.error('❌ Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again.');
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Get status text from order status
  const getStatusTextFromOrder = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'Order delivered';
      case 'cancelled':
        return 'Order canceled';
      case 'return_requested':
        return 'Return Requested';
      case 'exchange_requested':
        return 'Exchange Requested';
      case 'pending':
        return 'Order Pending';
      case 'processing':
        return 'Order Processing';
      case 'shipped':
        return 'Order Shipped';
      default:
        return 'Order Status';
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvoices();
  }, [fetchInvoices]);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleBack = () => {
    console.log('Invoice: handleBack called');
    console.log('Invoice: selectedInvoice:', selectedInvoice);
    if (selectedInvoice) {
      setSelectedInvoice(null);
      console.log('Invoice: Cleared selectedInvoice');
    } else {
      console.log('Invoice: Navigating to Profile');
      try {
        navigation.navigate('Profile');
        console.log('Invoice: Successfully navigated to Profile');
      } catch (err) {
        console.error('Invoice: Navigation error:', err);
      }
    }
  };

  const handleViewInvoice = (invoice) => {
    // Navigate to invoice details screen with full order data
    navigation.navigate('InvoiceDetails', { invoice });
  };

  const renderInvoiceItem = (invoice) => (
    <View key={invoice.id} style={styles.invoiceItem}>
      {/* Product Content */}
      <View style={styles.productContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {invoice.image && (
            <Image 
              source={{ uri: invoice.image }} 
              style={styles.productImage}
              resizeMode="cover"
              onError={(e) => {
                console.error('Failed to load invoice image:', e.nativeEvent.error);
              }}
              onLoad={() => {
                console.log('✅ Successfully loaded invoice image');
              }}
            />
          )}
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <View style={styles.statusAndNameContainer}>
            {/* Status Header */}
            <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
              {invoice.statusText}
            </Text>
            <Text style={styles.productName}>{invoice.productName}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            {invoice.productDetails && (
              <Text style={styles.productDescription} numberOfLines={2}>
                {invoice.productDetails}
              </Text>
            )}
            <Text style={styles.productSize}>{invoice.size}</Text>
          </View>
        </View>
      </View>

      {/* View Invoice Button */}
      <TouchableOpacity 
        style={styles.viewInvoiceButton}
        onPress={() => handleViewInvoice(invoice)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewInvoiceText}>view Invoice</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <GlobalBackButton onPress={handleBack} />
          </View>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no invoices
  if (!loading && invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <GlobalBackButton onPress={handleBack} />
          </View>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No Invoices Yet</Text>
          <Text style={styles.emptyMessage}>
            Your invoices will appear here once you place an order
          </Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main list view return
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <GlobalBackButton onPress={handleBack} />
          </View>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
            />
          }
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchInvoices}
                activeOpacity={0.8}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {invoices.map(renderInvoiceItem)}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  animatedContainer: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingBottom: hp(isTablet ? 1.8 : 1.5),
    backgroundColor: '#FFFFFF',
    paddingTop: hp(isTablet ? 2.5 : 2),
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  backButtonContainer: {
    width: wp(isTablet ? 22 : 18),
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: hp(isTablet ? 1.5 : 1.2),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 0,
  },
  headerSpacer: {
    width: wp(isTablet ? 22 : 18),
    opacity: 0,
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
    paddingTop: hp(isTablet ? 3.1 : 2.5),
    paddingBottom: hp(isTablet ? 3.1 : 2.5),
  },

  invoiceItem: {
    backgroundColor: 'transparent',
    marginBottom: hp(isTablet ? 6.2 : 5),
    width: '100%',
  },

  productContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(isTablet ? 3.7 : 3),
    gap: wp(isTablet ? 4.6 : 3.7),
  },
  imageContainer: {
    width: wp(isTablet ? 46 : isSmallDevice ? 33 : 37.3),
    height: wp(isTablet ? 46 : isSmallDevice ? 33 : 37.3),
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    flexShrink: 0,
  },
  imagePlaceholder: {
    fontSize: fs(isTablet ? 48 : isSmallDevice ? 32 : 40),
  },
  productDetails: {
    flex: 1,
    flexDirection: 'column',
    gap: hp(isTablet ? 1.2 : 1),
    alignSelf: 'stretch',
  },
  statusAndNameContainer: {
    flexDirection: 'column',
    gap: hp(isTablet ? 0.5 : 0.4),
  },
  descriptionContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  statusText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '500',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: fs(isTablet ? 19 : isSmallDevice ? 16 : 17),
    marginBottom: 0,
  },
  productName: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: fs(isTablet ? 19 : isSmallDevice ? 16 : 17),
    marginBottom: 0,
  },
  productDescription: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: fs(isTablet ? 19 : isSmallDevice ? 16 : 17),
    marginBottom: 0,
  },
  productSize: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: fs(isTablet ? 19 : isSmallDevice ? 16 : 17),
    marginBottom: 0,
  },

  viewInvoiceButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: wp(isTablet ? 16.8 : 13.6),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e4e4',
  },
  viewInvoiceText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: fs(isTablet ? 22 : isSmallDevice ? 17 : 19),
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
  },
  loadingText: {
    marginTop: hp(isTablet ? 1.8 : 1.5),
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 13.3 : 10.6),
    paddingTop: hp(isTablet ? 15.5 : 12.5),
  },
  emptyIcon: {
    fontSize: fs(isTablet ? 76 : isSmallDevice ? 56 : 64),
    marginBottom: hp(isTablet ? 3.1 : 2.5),
  },
  emptyTitle: {
    fontSize: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: hp(isTablet ? 1.2 : 1),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: hp(isTablet ? 5 : 4),
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
  },
  shopNowButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: wp(isTablet ? 16.8 : 13.6),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp(isTablet ? 60 : 48),
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },

  errorContainer: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: wp(isTablet ? 5.3 : 4.3),
    marginBottom: hp(isTablet ? 3.1 : 2.5),
    borderWidth: 1,
    borderColor: '#EA4335',
  },
  errorText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#EA4335',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: hp(isTablet ? 1.8 : 1.5),
  },
  retryButton: {
    backgroundColor: '#EA4335',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 1.5 : 1.2),
    paddingHorizontal: wp(isTablet ? 8 : 6.4),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
});

export default InvoiceScreen;
