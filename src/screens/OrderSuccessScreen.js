import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTracking } from '../contexts/TrackingContext';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const OrderSuccessScreen = ({ route, navigation }) => {
  const { 
    orderId, 
    awbCode, 
    trackingUrl, 
    estimatedDelivery,
    shiprocketOrderId 
  } = route.params || {};
  
  const { startTracking, getOrderTracking, stopTracking } = useTracking();
  const [currentStatus, setCurrentStatus] = useState('Order Confirmed');
  const [trackingTimeline, setTrackingTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(!awbCode);

  useEffect(() => {
    if (orderId && awbCode) {
      // Start real-time tracking
      const stopTrackingFn = startTracking(orderId, awbCode);
      
      // Cleanup on unmount
      return () => {
        stopTrackingFn();
        stopTracking(orderId);
      };
    }
  }, [orderId, awbCode, startTracking, stopTracking]);

  useEffect(() => {
    // Update status based on tracking data
    const orderTracking = getOrderTracking(orderId);
    if (orderTracking) {
      setCurrentStatus(orderTracking.currentStatus || 'Order Confirmed');
      setTrackingTimeline(orderTracking.timeline || []);
      setIsLoading(false);
    }
  }, [orderId, getOrderTracking]);

  const openTracking = () => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl).catch(err => {
        console.error('Failed to open tracking URL:', err);
        Alert.alert('Error', 'Could not open tracking link');
      });
    } else if (awbCode) {
      // Fallback to generic Shiprocket tracking
      const fallbackUrl = `https://shiprocket.co/tracking/${awbCode}`;
      Linking.openURL(fallbackUrl).catch(err => {
        console.error('Failed to open fallback tracking URL:', err);
        Alert.alert('Error', 'Could not open tracking link');
      });
    } else {
      Alert.alert('Tracking Unavailable', 'Tracking information will be available once your order is shipped.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'order confirmed': return '📦';
      case 'picked up': return '🚚';
      case 'in transit': return '🚛';
      case 'out for delivery': return '🏃‍♂️';
      case 'delivered': return '✅';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.successTitle}>Order Placed Successfully! 🎉</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your purchase. We're preparing your order for shipment.
        </Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID:</Text>
          <Text style={styles.detailValue}>{orderId || 'Generating...'}</Text>
        </View>

        {awbCode && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>AWB Code:</Text>
            <Text style={styles.detailValue}>{awbCode}</Text>
          </View>
        )}

        {shiprocketOrderId && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shipment ID:</Text>
            <Text style={styles.detailValue}>{shiprocketOrderId}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon(currentStatus)}</Text>
            <Text style={styles.statusText}>{currentStatus}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated Delivery:</Text>
          <Text style={styles.detailValue}>
            {formatDeliveryDate(estimatedDelivery)}
          </Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </View>
      )}

      {trackingTimeline.length > 0 && (
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Tracking Timeline</Text>
          
          {trackingTimeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <Text style={styles.timelineIcon}>{getStatusIcon(event.status)}</Text>
                {index < trackingTimeline.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{event.status}</Text>
                <Text style={styles.timelineTime}>{formatDate(event.timestamp)}</Text>
                {event.location && (
                  <Text style={styles.timelineLocation}>{event.location}</Text>
                )}
                {event.description && (
                  <Text style={styles.timelineDescription}>{event.description}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        {(awbCode || trackingUrl) && (
          <TouchableOpacity style={styles.trackButton} onPress={openTracking}>
            <Text style={styles.trackButtonText}>🔍 Track Your Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      {!awbCode && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📧 You will receive tracking information via email and SMS once your order is shipped.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#28a745',
    padding: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    alignItems: 'center',
    paddingTop: isTablet ? hp(4) : isSmallDevice ? hp(2.5) : hp(3),
    paddingBottom: isTablet ? hp(3.5) : isSmallDevice ? hp(2.5) : hp(3),
  },
  successTitle: {
    fontSize: isTablet ? fs(28) : isSmallDevice ? fs(20) : fs(24),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(1),
    lineHeight: isTablet ? fs(36) : isSmallDevice ? fs(26) : fs(30),
  },
  successSubtitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(20) : fs(24),
    paddingHorizontal: wp(4),
  },
  orderDetails: {
    backgroundColor: 'white',
    margin: isTablet ? wp(4) : wp(4.3),
    padding: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isTablet ? hp(2.2) : hp(2),
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? hp(1.8) : hp(1.5),
    flexWrap: 'wrap',
    gap: wp(2),
  },
  detailLabel: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666',
    fontWeight: '500',
    flex: 1,
    minWidth: isTablet ? wp(25) : wp(35),
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
  },
  detailValue: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#333',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
    gap: wp(2),
  },
  statusIcon: {
    fontSize: isTablet ? fs(18) : fs(16),
  },
  statusText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#28a745',
    fontWeight: '600',
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
  },
  loadingContainer: {
    padding: isTablet ? hp(6) : hp(5),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(20) : fs(24),
  },
  timelineContainer: {
    backgroundColor: 'white',
    margin: isTablet ? wp(4) : wp(4.3),
    padding: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: isTablet ? hp(2.2) : hp(2),
  },
  timelineIconContainer: {
    alignItems: 'center',
    width: isTablet ? wp(8) : wp(10.5),
  },
  timelineIcon: {
    fontSize: isTablet ? fs(24) : fs(20),
    marginBottom: hp(1),
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e9ecef',
  },
  timelineContent: {
    flex: 1,
    marginLeft: isTablet ? wp(3) : wp(4.3),
  },
  timelineStatus: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(0.5),
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  timelineTime: {
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
    color: '#666',
    marginBottom: hp(0.5),
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(15) : fs(18),
  },
  timelineLocation: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#007bff',
    marginBottom: hp(0.5),
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
  },
  timelineDescription: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666',
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
  },
  actionButtons: {
    padding: isTablet ? wp(4) : wp(4.3),
    gap: isTablet ? hp(1.8) : hp(1.5),
  },
  trackButton: {
    backgroundColor: '#007bff',
    padding: isTablet ? hp(2.2) : isSmallDevice ? hp(1.6) : hp(2),
    borderRadius: 8,
    alignItems: 'center',
    minHeight: isTablet ? hp(7) : hp(6),
    justifyContent: 'center',
  },
  trackButtonText: {
    color: 'white',
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: 'bold',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  continueButton: {
    backgroundColor: '#28a745',
    padding: isTablet ? hp(2.2) : isSmallDevice ? hp(1.6) : hp(2),
    borderRadius: 8,
    alignItems: 'center',
    minHeight: isTablet ? hp(7) : hp(6),
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: 'bold',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    margin: isTablet ? wp(4) : wp(4.3),
    padding: isTablet ? hp(2.5) : isSmallDevice ? hp(1.6) : hp(2),
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    marginBottom: hp(3),
  },
  infoText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#1565c0',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
  },
});

export default OrderSuccessScreen;
