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

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 0, // Leading 0 as per Figma
  },
  headerSpacer: {
    width: 68,
    opacity: 0,
  },

  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20, // Normal padding after header
    paddingBottom: 20,
  },

  // Invoice Item Styles
  invoiceItem: {
    backgroundColor: 'transparent',
    marginBottom: 40, // Spacing between invoice items
    width: '100%',
  },

  // Product Styles
  productContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24, // 6 * 4 = 24px gap as per Figma
    gap: 14, // 3.5 * 4 = 14px gap as per Figma
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE', // Changed to match Figma background
    flexShrink: 0,
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  productDetails: {
    flex: 1,
    flexDirection: 'column',
    gap: 8, // 2 * 4 = 8px gap as per Figma
    alignSelf: 'stretch',
  },
  statusAndNameContainer: {
    flexDirection: 'column',
    gap: 3, // 3px gap between status and name as per Figma
  },
  descriptionContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  // Status and Text Styles
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productSize: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },

  // Button Styles
  viewInvoiceButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
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
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2, // 1.2 * 16 = 19.2 as per Figma
    textAlign: 'center',
    whiteSpace: 'pre', // To match Figma whitespace handling
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  shopNowButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },

  // Error Styles
  errorContainer: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EA4335',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#EA4335',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#EA4335',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
});

export default InvoiceScreen;
