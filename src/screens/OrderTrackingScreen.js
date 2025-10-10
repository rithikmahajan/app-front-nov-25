import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useTracking } from '../contexts/TrackingContext';
import { TrackingTimeline as TrackingTimelineComponent } from '../components/TrackingTimeline';
import { useShiprocket } from '../contexts/ShiprocketContext';
import { TrackingTimeline, ShippingStatusBadge, OrderActionButtons, ReturnExchangeActions } from '../components/ShippingComponents';

const OrderTrackingScreen = ({ navigation }) => {
  const {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchOrderStatusCounts,
    startTracking,
    getTrackingData,
    cancelOrder,
    createReturn,
    createExchange
  } = useTracking();

  const [refreshing, setRefreshing] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});
  const [, setActiveTrackingJobs] = useState({});

  // Fetch initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadInitialData = useCallback(async () => {
    try {
      await fetchUserOrders();
      const counts = await fetchOrderStatusCounts();
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error loading initial data:', err);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    }
  }, [fetchUserOrders, fetchOrderStatusCounts]);

  // Start tracking for shipped orders
  useEffect(() => {
    const newTrackingJobs = {};
    
    orders.forEach(order => {
      if (order.awb_code && order.shipping_status !== 'Delivered') {
        const stopFn = startTracking(order.awb_code, 30); // 30 second intervals
        if (stopFn) {
          newTrackingJobs[order.awb_code] = stopFn;
        }
      }
    });

    setActiveTrackingJobs(prev => {
      // Stop previous tracking jobs
      Object.values(prev).forEach(stopFn => stopFn?.());
      return newTrackingJobs;
    });

    // Cleanup on unmount
    return () => {
      Object.values(newTrackingJobs).forEach(stopFn => stopFn?.());
    };
  }, [orders, startTracking]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData]);

  // Open tracking URL in browser
  const openTrackingUrl = useCallback((trackingUrl) => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl).catch(err => {
        console.error('Error opening tracking URL:', err);
        Alert.alert('Error', 'Unable to open tracking link');
      });
    } else {
      Alert.alert('Info', 'Tracking link not available yet');
    }
  }, []);

  // Handle order cancellation
  const handleCancelOrder = useCallback(async (orderId, orderNumber) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${orderNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId, 'User requested cancellation');
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (err) {
              console.error('Error cancelling order:', err);
              Alert.alert('Error', err.message || 'Failed to cancel order');
            }
          }
        }
      ]
    );
  }, [cancelOrder]);

  // Handle return request
  const handleCreateReturn = useCallback(async (orderId, orderNumber) => {
    Alert.alert(
      'Return Order',
      `Create return request for order #${orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await createReturn(orderId, 'Product defective/not as expected');
              Alert.alert('Success', 'Return request created successfully');
            } catch (err) {
              console.error('Error creating return:', err);
              Alert.alert('Error', err.message || 'Failed to create return');
            }
          }
        }
      ]
    );
  }, [createReturn]);

  // Handle exchange request
  const handleCreateExchange = useCallback(async (orderId, orderNumber) => {
    Alert.alert(
      'Exchange Order',
      `Create exchange request for order #${orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              // For now, use first item and default size
              // In a real app, you'd show a picker for item and size selection
              const order = orders.find(o => o._id === orderId);
              const firstItem = order?.items?.[0];
              const firstItemId = firstItem?._id || 'default_item';
              
              await createExchange(orderId, 'Wrong size', firstItemId, 'L');
              Alert.alert('Success', 'Exchange request created successfully');
            } catch (err) {
              console.error('Error creating exchange:', err);
              Alert.alert('Error', err.message || 'Failed to create exchange');
            }
          }
        }
      ]
    );
  }, [createExchange, orders]);

  // Get status color
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Pending': return '#FFA500';
      case 'Processing': return '#1E90FF';
      case 'Shipped': return '#32CD32';
      case 'Delivered': return '#008000';
      case 'Cancelled': return '#FF6347';
      case 'IN_TRANSIT': return '#32CD32';
      case 'DELIVERED': return '#008000';
      default: return '#888888';
    }
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Render order status counts
  const renderStatusCounts = () => {
    if (!statusCounts || Object.keys(statusCounts).length === 0) return null;

    return (
      <View style={styles.statusCountsContainer}>
        <Text style={styles.statusCountsTitle}>Order Summary</Text>
        <View style={styles.statusCountsRow}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <View key={status} style={styles.statusCountItem}>
              <Text style={styles.statusCountNumber}>{count}</Text>
              <Text style={styles.statusCountLabel}>{status}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render individual order card
  const renderOrderCard = useCallback((order) => {
    const tracking = getTrackingData(order.awb_code);
    const orderNumber = order._id.slice(-8);
    
    return (
      <View key={order._id} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.orderStatusContainer}>
            <Text style={[styles.orderStatus, { color: getStatusColor(order.shipping_status) }]}>
              {order.shipping_status}
            </Text>
            <Text style={styles.totalPrice}>₹{order.total_price}</Text>
          </View>
        </View>

        {/* Shiprocket Status Badge */}
        <View style={styles.shiprocketContainer}>
          <ShippingStatusBadge order={order} />
        </View>

        {/* Shiprocket Action Buttons */}
        <OrderActionButtons 
          order={order} 
          onRefresh={() => loadInitialData()} 
        />

        {/* Shiprocket Tracking Timeline */}
        {order.awbNumber && (
          <View style={styles.shiprocketTrackingContainer}>
            <TrackingTimeline orderId={order._id} />
          </View>
        )}

        {/* Order Items Preview */}
        <View style={styles.orderItemsPreview}>
          <Text style={styles.itemsCount}>
            {order.items?.length || order.item_quantities?.length || 0} item(s)
          </Text>
          {order.items?.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemName}>
              • {item.name || item.productName || 'Item'}
            </Text>
          ))}
        </View>

        {/* Delivery Address */}
        {order.address && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Delivery Address:</Text>
            <Text style={styles.addressText}>
              {order.address.firstName} {order.address.lastName}
            </Text>
            <Text style={styles.addressText}>
              {order.address.address}, {order.address.city} - {order.address.pinCode}
            </Text>
          </View>
        )}

        {/* Tracking Section */}
        {order.awb_code && (
          <View style={styles.trackingSection}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Tracking Information</Text>
              {tracking?.lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Updated: {formatDate(tracking.lastUpdated)}
                </Text>
              )}
            </View>
            
            <View style={styles.trackingDetails}>
              <Text style={styles.awbCode}>AWB: {order.awb_code}</Text>
              {order.courier_name && (
                <Text style={styles.courier}>Courier: {order.courier_name}</Text>
              )}
            </View>

            {tracking && !tracking.error && (
              <View style={styles.trackingInfo}>
                <Text style={[styles.trackingStatus, { color: getStatusColor(tracking.status) }]}>
                  Status: {tracking.status}
                </Text>
                {tracking.estimatedDelivery && (
                  <Text style={styles.estimatedDelivery}>
                    Expected: {formatDate(tracking.estimatedDelivery)}
                  </Text>
                )}
                {tracking.destination && (
                  <Text style={styles.destination}>
                    Destination: {tracking.destination}
                  </Text>
                )}
              </View>
            )}

            {tracking?.error && (
              <Text style={styles.trackingError}>
                Tracking Error: {tracking.error}
              </Text>
            )}

            {/* Tracking Timeline */}
            {tracking?.timeline && tracking.timeline.length > 0 && (
              <View style={styles.timelineContainer}>
                <TrackingTimeline 
                  trackingEvents={tracking.timeline}
                  currentStatus={tracking.status}
                />
              </View>
            )}

            {/* Track Package Button */}
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => openTrackingUrl(order.tracking_url)}
            >
              <Text style={styles.trackButtonText}>Track Package</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Actions */}
        <View style={styles.orderActions}>
          {order.shipping_status === 'Pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(order._id, orderNumber)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          
          {order.shipping_status === 'Delivered' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() => handleCreateReturn(order._id, orderNumber)}
              >
                <Text style={styles.returnButtonText}>Return</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exchangeButton}
                onPress={() => handleCreateExchange(order._id, orderNumber)}
              >
                <Text style={styles.exchangeButtonText}>Exchange</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }, [getTrackingData, formatDate, getStatusColor, openTrackingUrl, handleCancelOrder, handleCreateReturn, handleCreateExchange]);

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>Your orders will appear here once you make a purchase</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>My Orders</Text>
      
      {renderStatusCounts()}
      
      {orders.map(renderOrderCard)}
      
      {loading && orders.length > 0 && (
        <View style={styles.bottomLoading}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.bottomLoadingText}>Updating...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  statusCountsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusCountsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  statusCountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statusCountItem: {
    alignItems: 'center'
  },
  statusCountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  statusCountLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 2
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  orderStatusContainer: {
    alignItems: 'flex-end'
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600'
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 2
  },
  orderItemsPreview: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  itemName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  addressContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 1
  },
  trackingSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  lastUpdated: {
    fontSize: 10,
    color: '#666'
  },
  trackingDetails: {
    marginBottom: 8
  },
  awbCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace'
  },
  courier: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  trackingInfo: {
    marginBottom: 8
  },
  trackingStatus: {
    fontSize: 14,
    fontWeight: '500'
  },
  estimatedDelivery: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 2
  },
  destination: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  trackingError: {
    fontSize: 12,
    color: '#FF3B30',
    fontStyle: 'italic',
    marginBottom: 8
  },
  timelineContainer: {
    marginVertical: 8
  },
  trackButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  trackButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  shiprocketContainer: {
    marginTop: 12,
    marginBottom: 8
  },
  shiprocketTrackingContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12
  },
  orderActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  returnButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center'
  },
  returnButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  exchangeButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center'
  },
  exchangeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  bottomLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16
  },
  bottomLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666'
  }
});

export default OrderTrackingScreen;
