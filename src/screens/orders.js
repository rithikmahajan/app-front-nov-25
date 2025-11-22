import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import TrackingModal from './orderstrackmodeloverlay';
import CancelOrderRequest from './orderscancelordermodal';
import CancelledOrderConfirm from './orderscancelorderconfirmationmodal';
import { yoraaAPI } from '../services/yoraaAPI';

const OrdersScreen = ({ navigation, route }) => {
  // State management for orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentCancelOrder, setCurrentCancelOrder] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  // Function to get customer-facing actions based on order status
  const getCustomerActions = useCallback((order) => {
    const actions = [];
    
    switch (order.order_status?.toLowerCase()) {
      case 'delivered':
        actions.push(
          { id: 'buy_again', title: 'Buy It Again', style: 'primary' },
          { id: 'return_exchange', title: 'Return/Exchange', style: 'secondary' },
          { id: 'rate_product', title: 'Rate your product', style: 'secondary' }
        );
        break;
      case 'pending':
      case 'processing':
      case 'shipped':
        actions.push(
          { id: 'track', title: 'Track Order', style: 'primary' }
        );
        break;
      case 'cancelled':
        actions.push(
          { id: 'buy_again', title: 'Buy It Again', style: 'primary' }
        );
        break;
      case 'return_requested':
      case 'exchange_requested':
        actions.push(
          { id: 'track', title: 'Track Return/Exchange', style: 'primary' }
        );
        break;
      default:
        actions.push(
          { id: 'buy_again', title: 'Buy It Again', style: 'primary' }
        );
    }
    
    return actions;
  }, []);

  // Function to fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      
      // Check if user is authenticated
      await yoraaAPI.initialize();
      const isAuthenticated = yoraaAPI.isAuthenticated();
      
      if (!isAuthenticated) {
        // User is a guest - show sign-in prompt instead of error
        console.log('👤 Guest user detected - prompting to sign in');
        setIsGuest(true);
        setLoading(false);
        setRefreshing(false);
        setOrders([]);
        return;
      }
      
      setIsGuest(false);
      const response = await yoraaAPI.getUserOrders();
      
      if (response.success) {
        // Check if data exists and is an array
        if (response.data && Array.isArray(response.data)) {
          // Transform API data to match our component structure
          const transformedOrders = response.data.map(order => {
            // Get the first item
            const firstItem = order.items?.[0];
            
            // Extract image URL with proper fallback handling
            let imageUrl = null;
            if (firstItem) {
              // Try multiple image formats
              imageUrl = firstItem.images?.[0]?.url ||  // Image object with url property
                        firstItem.images?.[0] ||         // Direct image URL in array
                        firstItem.image ||               // Direct image property
                        firstItem.thumbnail;             // Thumbnail property
            }
            
            return {
              id: order._id || order.id,
              status: order.order_status,
              statusColor: getStatusColor(order.order_status),
              productName: firstItem?.name || firstItem?.description || 'Product Name',
              productDescription: firstItem?.description || 'Product Description',
              size: order.item_quantities?.[0]?.sku || 'Size Info',
              image: imageUrl, // No fallback - show only actual product images
              actions: getCustomerActions(order),
              orderDate: order.created_at,
              totalAmount: order.total_price,
              paymentStatus: order.payment_status,
              shippingStatus: order.shipping_status,
              razorpayOrderId: order.razorpay_order_id,
              address: order.address,
              // ✅ CRITICAL FIX: Ensure AWB code is extracted from API response
              awbCode: order.awb_code || order.awbCode || order.tracking_number,
              awb_code: order.awb_code || order.awbCode || order.tracking_number,
              shipmentId: order.shipment_id || order.shiprocket_order_id,
              items: order.items || [],
              item_quantities: order.item_quantities || []
            };
          });
          
          console.log('✅ Orders fetched and transformed:', {
            count: transformedOrders.length,
            firstOrderHasAWB: !!transformedOrders[0]?.awbCode,
            sampleAWB: transformedOrders[0]?.awbCode,
            firstOrderImage: transformedOrders[0]?.image,
            firstOrderHasActualImage: transformedOrders[0]?.image && !transformedOrders[0]?.image?.includes('unsplash.com')
          });
          
          setOrders(transformedOrders);
        } else {
          // API success but no data - user has no orders yet
          console.log('✅ API successful but no orders found for user');
          setOrders([]);
        }
      } else {
        // API returned success: false - this is an error
        console.error('❌ API returned success: false');
        setError('Failed to load orders. Please try again.');
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      
      // Check if this is an authentication error
      if (err.message?.includes('Authentication required') || 
          err.message?.includes('log in') || 
          err.code === 'AUTHENTICATION_REQUIRED') {
        console.log('🔐 Authentication error - user needs to sign in');
        setIsGuest(true);
        setOrders([]);
      } else {
        // Only set error for actual network/API errors
        setError('Failed to load orders. Please try again.');
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCustomerActions, getStatusColor]);

  // Helper function to get status color
  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return '#32862B';
      case 'pending':
      case 'processing':
      case 'shipped':
        return '#007AFF';
      case 'cancelled':
        return '#EA4335';
      case 'return_requested':
      case 'exchange_requested':
        return '#FBBC05';
      default:
        return '#767676';
    }
  }, []);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  // Handle sign in navigation for guest users
  const handleSignIn = useCallback(() => {
    navigation.navigate('LoginAccountMobileNumber', { fromOrders: true });
  }, [navigation]);

  const getStatusText = useCallback((status) => {
    switch (status?.toLowerCase()) {
    case 'delivered':
      return 'Order delivered';
    case 'pending':
      return 'Order pending';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'cancelled':
      return 'Order cancelled';
    case 'confirmed':
      return 'Order confirmed';
    case 'exchange_requested':
      return 'Exchange requested';
    case 'return_requested':
      return 'Return requested';
    default:
      return status || 'Unknown status';
  }
  }, []); // End of useCallback

  const OrderCard = useCallback(({ order, onTrack, onCancelOrder, navigation: nav }) => (
  <View style={styles.orderContainer}>
    <View style={styles.productContainer}>
      {order.image ? (
        <Image source={{ uri: order.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.productDetails}>
        {/* Order status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: order.statusColor }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
        <Text style={styles.productName}>{order.productName}</Text>
        <Text style={styles.productDescription}>{order.productDescription}</Text>
        <Text style={styles.productSize}>{order.size}</Text>
        
        {/* Additional order info */}
        {order.orderDate && (
          <Text style={styles.orderDate}>
            Ordered: {new Date(order.orderDate).toLocaleDateString()}
          </Text>
        )}
        {order.totalAmount && (
          <Text style={styles.totalAmount}>
            Total: ₹{order.totalAmount}
          </Text>
        )}
        {order.paymentStatus && (
          <Text style={[
            styles.paymentStatus, 
            order.paymentStatus?.toLowerCase() === 'paid' ? styles.paymentPaid : styles.paymentPending
          ]}>
            Payment: {order.paymentStatus}
          </Text>
        )}
      </View>
    </View>
    
    {/* Customer action buttons */}
    {order.actions && order.actions.map((action, index) => (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionButton,
          action.style === 'primary' ? styles.primaryButton : styles.secondaryButton,
          index > 0 ? styles.actionButtonWithMargin : null
        ]}
        onPress={() => {
          if (action.id === 'track') {
            onTrack(order);
          } else if (action.id === 'return_exchange') {
            navigation?.navigate('OrdersReturnExchange', { order });
          } else if (action.id === 'cancel_order') {
            onCancelOrder(order);
          } else if (action.id === 'rate_product') {
            navigation?.navigate('ProductDetailsMainReview', { order });
          } else if (action.id === 'buy_again') {
            navigation?.navigate('ProductDetailsMain', { order });
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.buttonText,
          action.style === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText
        ]}>
          {action.title}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
  ), [getStatusText, navigation]); // End of OrderCard useCallback

  const trackingModalRef = useRef(null);
  const cancelOrderModalRef = useRef(null);
  const cancelConfirmationModalRef = useRef(null);

  // Get the previous screen from route params
  const previousScreen = route?.params?.previousScreen;

  // Custom back handler
  const handleBackPress = useCallback(() => {
    if (previousScreen === 'OrderConfirmationPhone') {
      navigation.navigate('OrderConfirmationPhone');
    } else {
      navigation?.goBack();
    }
  }, [previousScreen, navigation]);

  // Mock tracking data - you can replace this with actual API data
  const getTrackingData = useCallback((order) => {
    // Return AWB code and order details for real-time Shiprocket tracking
    return {
      awbCode: order.awbCode || order.awb_code,
      orderId: order.id || order._id,
      razorpayOrderId: order.razorpayOrderId || order.razorpay_order_id,
      orderStatus: order.status || order.order_status,
      orderDate: order.orderDate || order.created_at,
      address: order.address,
      totalAmount: order.totalAmount || order.total_price,
      items: order.items || [],
      // Legacy mock data for fallback (if AWB not available)
      mockData: order.status === 'confirmed' ? [
        { status: "Packing", location: "Warehouse Mumbai", timestamp: "2024-01-15 10:30 AM" },
        { status: "Picked", location: "Courier Hub Mumbai", timestamp: "2024-01-15 02:45 PM" },
      ] : order.status === 'delivered' ? [
        { status: "Packing", location: "Warehouse Mumbai", timestamp: "2024-01-15 10:30 AM" },
        { status: "Picked", location: "Courier Hub Mumbai", timestamp: "2024-01-15 02:45 PM" },
        { status: "In Transit", location: "In Transit to Delhi", timestamp: "2024-01-16 08:00 AM" },
        { status: "Delivered", location: "Delivered to Customer", timestamp: "2024-01-17 11:30 AM" },
      ] : []
    };
  }, []); // End of getTrackingData useCallback

  const handleTrackOrder = useCallback((order) => {
    const trackingData = getTrackingData(order);
    console.log('📦 Opening tracking modal with data:', {
      awbCode: trackingData.awbCode,
      orderId: trackingData.orderId,
      hasAddress: !!trackingData.address
    });
    trackingModalRef.current?.openModal(trackingData);
  }, [getTrackingData]);

  const handleCancelOrder = (order) => {
    setCurrentCancelOrder(order);
    cancelOrderModalRef.current?.open(order);
  };

  const handleCancelOrderConfirmed = async (orderData) => {
    // Use orderData if passed, otherwise use currentCancelOrder
    const orderToCancel = orderData || currentCancelOrder;
    
    if (!orderToCancel) {
      console.error('No order selected for cancellation');
      return;
    }

    try {
      console.log('🚫 Cancelling order:', orderToCancel._id || orderToCancel.id);
      
      const orderId = orderToCancel._id || orderToCancel.id;
      
      const response = await yoraaAPI.makeRequest(
        `/api/orders/${orderId}/cancel`,
        'PUT',
        { reason: 'Customer requested cancellation' },
        true
      );

      if (response.success) {
        console.log('✅ Order cancelled successfully');
        
        // Open the confirmation modal
        cancelConfirmationModalRef.current?.open();
        
        // Refresh orders list
        setTimeout(() => {
          fetchOrders();
        }, 1000);
      } else {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (cancelError) {
      console.error('❌ Error cancelling order:', cancelError);
      Alert.alert(
        'Error',
        cancelError.message || 'Failed to cancel order. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.searchContainer}>
          {/* Empty view for layout balance */}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : isGuest ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sign in to view orders</Text>
            <Text style={styles.emptySubText}>Please sign in to view your order history and track shipments</Text>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubText}>Your orders will appear here once you make a purchase</Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onTrack={handleTrackOrder}
              onCancelOrder={handleCancelOrder}
              navigation={navigation}
            />
          ))
        )}
      </ScrollView>

      {/* Tracking Modal */}
      <TrackingModal ref={trackingModalRef} />
      
      {/* Cancel Order Modal */}
      <CancelOrderRequest 
        ref={cancelOrderModalRef} 
        onRequestConfirmed={handleCancelOrderConfirmed}
      />
      
      {/* Cancel Order Confirmation Modal */}
      <CancelledOrderConfirm ref={cancelConfirmationModalRef} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 68,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  searchContainer: {
    width: 68,
    height: 24,
    opacity: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderContainer: {
    marginBottom: 24,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  productImage: {
    width: 140,
    height: 140,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    lineHeight: 16.8,
    marginBottom: 4,
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
  },
  productSize: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    lineHeight: 16.8,
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
  },
  actionButton: {
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonWithMargin: {
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#000000',
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
    marginTop: 4,
    fontFamily: 'Montserrat-Regular',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginTop: 4,
    fontFamily: 'Montserrat-Medium',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'Montserrat-Medium',
  },
  paymentPaid: {
    color: '#32862B',
  },
  paymentPending: {
    color: '#EA4335',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#767676',
    marginTop: 16,
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EA4335',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
  },
  emptySubText: {
    fontSize: 14,
    color: '#767676',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },
});

export default React.memo(OrdersScreen);
