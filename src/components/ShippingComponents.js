// Shipping Action Components for Shiprocket Integration
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useShiprocket } from '../contexts/ShiprocketContext';

// Status badge component
export const ShippingStatusBadge = ({ order }) => {
  const { getShippingStatus, getStatusColor, getStatusIcon } = useShiprocket();
  
  const status = getShippingStatus(order);
  const color = getStatusColor(status);
  const icon = getStatusIcon(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}>
      <Text style={styles.statusIcon}>{icon}</Text>
      <Text style={styles.statusText}>{status.replace('_', ' ')}</Text>
    </View>
  );
};

// Order action buttons component
export const OrderActionButtons = ({ order, onRefresh }) => {
  const {
    createShipment,
    generateAWB,
    isOperationLoading
  } = useShiprocket();

  const handleCreateShipment = async () => {
    const result = await createShipment(order._id);
    if (result.success && onRefresh) {
      onRefresh();
    }
  };

  const handleGenerateAWB = async () => {
    const result = await generateAWB(order._id);
    if (result.success && onRefresh) {
      onRefresh();
    }
  };

  const openTrackingUrl = () => {
    if (order.trackingUrl) {
      Linking.openURL(order.trackingUrl).catch(() => {
        Alert.alert('Error', 'Unable to open tracking link');
      });
    } else {
      Alert.alert('Info', 'Tracking link not available yet');
    }
  };

  return (
    <View style={styles.actionContainer}>
      {/* Create Shipment Button */}
      {!order.shiprocketOrderId && (
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleCreateShipment}
          disabled={isOperationLoading('create_shipment', order._id)}
        >
          {isOperationLoading('create_shipment', order._id) ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.actionButtonIcon}>📦</Text>
              <Text style={styles.primaryButtonText}>Create Shipment</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Generate AWB Button */}
      {order.shiprocketOrderId && !order.awbNumber && (
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleGenerateAWB}
          disabled={isOperationLoading('generate_awb', order._id)}
        >
          {isOperationLoading('generate_awb', order._id) ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Text style={styles.actionButtonIcon}>📋</Text>
              <Text style={styles.secondaryButtonText}>Generate AWB</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Track Shipment Button */}
      {order.awbNumber && (
        <TouchableOpacity
          style={[styles.actionButton, styles.trackButton]}
          onPress={openTrackingUrl}
        >
          <Text style={styles.actionButtonIcon}>📍</Text>
          <Text style={styles.trackButtonText}>Track Package</Text>
        </TouchableOpacity>
      )}

      {/* AWB Display */}
      {order.awbNumber && (
        <View style={styles.awbContainer}>
          <Text style={styles.awbLabel}>Tracking Number:</Text>
          <Text style={styles.awbNumber}>{order.awbNumber}</Text>
        </View>
      )}
    </View>
  );
};

// Tracking timeline component for detailed tracking
export const TrackingTimeline = ({ orderId }) => {
  const { trackShipment, trackingData, isOperationLoading } = useShiprocket();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefreshTracking = async () => {
    setRefreshing(true);
    await trackShipment(orderId, false); // Force refresh
    setRefreshing(false);
  };

  React.useEffect(() => {
    trackShipment(orderId, true); // Use cache on initial load
  }, [orderId, trackShipment]);

  const timeline = trackingData[orderId]?.shipment_track || [];

  if (isOperationLoading('track_shipment', orderId)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Tracking Timeline</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshTracking}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      {timeline.length > 0 ? (
        <View style={styles.timeline}>
          {timeline.map((event, index) => (
            <View key={index} style={styles.timelineEvent}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventActivity}>{event.activity}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noTrackingText}>No tracking information available</Text>
      )}
    </View>
  );
};

// Return/Exchange request component
export const ReturnExchangeActions = ({ order, onSuccess }) => {
  const { createReturn, createExchange, isOperationLoading } = useShiprocket();

  const handleCreateReturn = async () => {
    Alert.alert(
      'Create Return Request',
      'Are you sure you want to return this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Return',
          onPress: async () => {
            const returnData = {
              returnItems: order.items.map(item => ({
                item_id: item._id,
                quantity: 1,
                reason: 'Customer request'
              })),
              pickupAddress: order.address
            };

            const result = await createReturn(order._id, returnData);
            if (result.success && onSuccess) {
              onSuccess();
            }
          }
        }
      ]
    );
  };

  const handleCreateExchange = async () => {
    Alert.alert(
      'Create Exchange Request',
      'Exchange functionality will redirect to size selection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            // This would navigate to exchange flow
            Alert.alert('Info', 'Exchange flow would be implemented here');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.returnExchangeContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.returnButton]}
        onPress={handleCreateReturn}
        disabled={isOperationLoading('create_return', order._id)}
      >
        {isOperationLoading('create_return', order._id) ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.actionButtonIcon}>↩️</Text>
            <Text style={styles.returnButtonText}>Return Item</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.exchangeButton]}
        onPress={handleCreateExchange}
        disabled={isOperationLoading('create_exchange', order._id)}
      >
        {isOperationLoading('create_exchange', order._id) ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.exchangeButtonText}>Exchange Size</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  actionContainer: {
    padding: 16,
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8
  },
  primaryButton: {
    backgroundColor: '#007AFF'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  trackButton: {
    backgroundColor: '#34C759'
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  awbContainer: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  awbLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4
  },
  awbNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000'
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666'
  },
  timelineContainer: {
    padding: 16
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7'
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  },
  timeline: {
    paddingLeft: 8
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginTop: 4,
    marginRight: 12
  },
  timelineContent: {
    flex: 1
  },
  eventDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2
  },
  eventActivity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2
  },
  eventLocation: {
    fontSize: 14,
    color: '#666666'
  },
  noTrackingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    padding: 32
  },
  returnExchangeContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16
  },
  returnButton: {
    flex: 1,
    backgroundColor: '#FF3B30'
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  exchangeButton: {
    flex: 1,
    backgroundColor: '#FF9500'
  },
  exchangeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default {
  ShippingStatusBadge,
  OrderActionButtons,
  TrackingTimeline,
  ReturnExchangeActions
};
