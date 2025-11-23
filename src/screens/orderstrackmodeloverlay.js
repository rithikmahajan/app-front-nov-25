import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions, Animated, PanResponder, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { FontFamilies } from "../constants/styles";
import shiprocketService from "../services/shiprocketService";
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const DEVICE_HEIGHT = Dimensions.get("window").height;

// Font constants to match your app structure
const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
};

// Simple cross icon component since Vector 2.svg is not available
const CrossIcon = ({ width, height }) => (
  <View
    style={[
      styles.crossIconContainer,
      { width, height }
    ]}
  >
    <Text style={[styles.crossIconText, { fontSize: width * 0.8 }]}>×</Text>
  </View>
);

const TrackingModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [trackingData, setTrackingData] = useState([]);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  // Static master steps (including Cancelled status)
  const masterSteps = [
    { status: "Packing", shiprocketStatus: "OP" },
    { status: "Picked", shiprocketStatus: "PKD" },
    { status: "In Transit", shiprocketStatus: "IT" },
    { status: "Delivered", shiprocketStatus: "DLVD" },
  ];

  // ✅ NEW: Fetch real-time tracking data from Shiprocket
  const fetchShiprocketTracking = async (awbCode) => {
    if (!awbCode) {
      console.log('⚠️ No AWB code provided for tracking');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📦 Fetching Shiprocket tracking for AWB:', awbCode);
      const data = await shiprocketService.trackByAWB(awbCode);
      
      console.log('✅ Shiprocket tracking data received:', {
        awbCode: data.awbCode,
        status: data.currentStatus,
        activitiesCount: data.activities?.length
      });

      setRealTimeData(data);

      // Map Shiprocket activities to our tracking data format
      if (data.activities && data.activities.length > 0) {
        const mappedData = data.activities.map(activity => ({
          status: shiprocketService.getStatusLabel(activity.status),
          location: activity.location,
          timestamp: activity.date,
          shiprocketStatus: activity.status,
          statusLabel: activity.statusLabel
        }));
        setTrackingData(mappedData);
      }

    } catch (err) {
      console.error('❌ Error fetching Shiprocket tracking:', err);
      setError(err.message || 'Failed to fetch tracking information');
      Alert.alert(
        'Tracking Error',
        'Unable to fetch real-time tracking. Showing order status instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // Animate modal up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 7,
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: DEVICE_HEIGHT,
      useNativeDriver: true,
      tension: 200,
      friction: 7,
    }).start(() => {
      setVisible(false);
      // Reset state when closing
      setTrackingData([]);
      setRealTimeData(null);
      setError(null);
      setOrderInfo(null);
    });
  };

  const handleOpen = (data) => {
    console.log('📦 Opening tracking modal with data:', data);
    
    // Store order info
    setOrderInfo(data);
    
    // Set legacy tracking data (if provided)
    if (data.mockData && Array.isArray(data.mockData)) {
      setTrackingData(data.mockData);
    }
    
    // Open modal
    translateY.setValue(DEVICE_HEIGHT);
    setVisible(true);
    
    // Fetch real-time tracking if AWB code is available
    if (data.awbCode) {
      console.log('✅ AWB code found, fetching Shiprocket data:', data.awbCode);
      fetchShiprocketTracking(data.awbCode);
    } else {
      console.log('⚠️ No AWB code available, using order status only');
      // If no AWB, show basic order status
      const basicStatus = [
        { 
          status: "Order Placed", 
          location: "Processing", 
          timestamp: data.orderDate || new Date().toISOString(),
          shiprocketStatus: "OP"
        }
      ];
      
      if (data.orderStatus === 'confirmed' || data.orderStatus === 'processing') {
        basicStatus.push({
          status: "Processing",
          location: "Your order is being prepared",
          timestamp: data.orderDate || new Date().toISOString(),
          shiprocketStatus: "OP"
        });
      }
      
      setTrackingData(basicStatus);
    }
  };

  // Pan responder for drag handle - always allows drag to close
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  // Pan responder for content area - only for downward swipes
  const contentPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  useImperativeHandle(ref, () => ({
    openModal: handleOpen,
    closeModal: handleClose,
  }));

  const isStatusCompleted = (status, shiprocketStatus) => {
    // Check if tracking data has this status
    const found = trackingData.find((step) => 
      step.status === status || 
      step.shiprocketStatus === shiprocketStatus
    );
    return !!found;
  };

  const getStepDetails = (status, shiprocketStatus) => {
    const found = trackingData.find((step) => 
      step.status === status || 
      step.shiprocketStatus === shiprocketStatus
    );
    return found || {};
  };

  // Helper function to check if order can be cancelled
  const canCancelOrder = () => {
    if (!orderInfo || !realTimeData) return false;
    
    const currentStatus = realTimeData.currentStatus?.toUpperCase();
    const orderStatus = orderInfo.orderStatus?.toUpperCase();
    
    // Check if order is already cancelled
    if (currentStatus === 'CANCELLED' || orderStatus === 'CANCELLED') {
      return false;
    }
    
    // Check if order is delivered
    if (currentStatus === 'DELIVERED' || currentStatus === 'DLVD' || orderStatus === 'DELIVERED') {
      return false;
    }
    
    // Allow cancellation for pending, confirmed, shipped, in transit, out for delivery
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'PKD', 'IT', 'OFD', 'OP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];
    return cancellableStatuses.includes(currentStatus) || cancellableStatuses.includes(orderStatus);
  };

  // Handle cancel order button press
  const handleCancelOrder = () => {
    if (!orderInfo) {
      Alert.alert('Error', 'Order information not available');
      return;
    }
    
    // Close tracking modal
    handleClose();
    
    // Call parent's cancel order handler if provided
    if (props.onCancelOrder) {
      props.onCancelOrder(orderInfo);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={styles.overlay}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              maxHeight: DEVICE_HEIGHT * 0.7,
              transform: [{ translateY }],
            }
          ]}
          {...contentPanResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={styles.dragHandleContainer}
              {...dragHandlePanResponder.panHandlers}
            >
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  Order Status
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <CrossIcon
                    width={isTablet ? hp(2.5) : hp(2)}
                    height={isTablet ? hp(2.5) : hp(2)}
                  />
                </TouchableOpacity>
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={styles.loadingText}>
                    Fetching real-time tracking...
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                  <Text style={styles.errorSubtext}>
                    Showing basic order status
                  </Text>
                </View>
              )}

              {!loading && masterSteps.map((step, index) => {
                const isFilled = isStatusCompleted(step.status, step.shiprocketStatus);
                const stepData = getStepDetails(step.status, step.shiprocketStatus);
                const isLast = index === masterSteps.length - 1;

                return (
                  <View key={index} style={styles.stepRow}>
                    <View style={styles.stepIndicatorContainer}>
                      <View
                        style={[
                          styles.stepDot,
                          { borderColor: isFilled ? "black" : "gray" }
                        ]}
                      >
                        {isFilled && (
                          <View style={styles.stepDotFilled} />
                        )}
                      </View>

                      {!isLast && (
                        <View
                          style={[
                            styles.stepLine,
                            { backgroundColor: isFilled ? "black" : "gray" }
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepContent}>
                      <Text style={styles.stepStatus}>
                        {step.status}
                      </Text>
                      {stepData.location && (
                        <Text
                          style={styles.stepLocation}
                          numberOfLines={1}
                        >
                          {stepData.location}
                        </Text>
                      )}
                      {stepData.timestamp && (
                        <Text style={styles.stepTimestamp}>
                          {new Date(stepData.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {!loading && canCancelOrder() && (
                <View style={styles.cancelSection}>
                  <TouchableOpacity
                    onPress={handleCancelOrder}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>
                      Cancel Order
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.cancelNote}>
                    You can cancel orders before delivery
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: isTablet ? hp(1.5) : hp(1.25),
  },
  dragHandle: {
    width: isTablet ? wp(8) : isSmallDevice ? wp(9) : wp(10.5),
    height: isTablet ? hp(0.6) : hp(0.5),
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: isTablet ? wp(6) : isSmallDevice ? wp(4) : wp(5.3),
    paddingTop: isTablet ? hp(1.5) : hp(1.25),
    paddingBottom: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontFamily: FONT_FAMILY.BOLD,
  },
  crossIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIconText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: isTablet ? hp(1.5) : hp(1.25),
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    color: '#666',
  },
  errorContainer: {
    padding: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    alignItems: 'center',
  },
  errorText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    color: '#E53E3E',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: isTablet ? hp(1.5) : hp(1.25),
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(12),
    color: '#666',
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: "row",
    gap: isTablet ? wp(2.5) : wp(2.7),
  },
  stepIndicatorContainer: {
    alignItems: "center",
    alignSelf: "flex-start",
  },
  stepDot: {
    width: isTablet ? hp(2.5) : isSmallDevice ? hp(1.8) : hp(2),
    height: isTablet ? hp(2.5) : isSmallDevice ? hp(1.8) : hp(2),
    borderRadius: isTablet ? hp(1.25) : isSmallDevice ? hp(0.9) : hp(1),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotFilled: {
    width: isTablet ? hp(1.3) : isSmallDevice ? hp(0.9) : hp(1),
    height: isTablet ? hp(1.3) : isSmallDevice ? hp(0.9) : hp(1),
    borderRadius: isTablet ? hp(0.65) : isSmallDevice ? hp(0.45) : hp(0.5),
    backgroundColor: "black",
  },
  stepLine: {
    height: isTablet ? hp(5) : isSmallDevice ? hp(3.5) : hp(4),
    width: isTablet ? hp(0.3) : hp(0.25),
  },
  stepContent: {
    flex: 1,
  },
  stepStatus: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: FONT_FAMILY.REGULAR,
    color: "#000",
  },
  stepLocation: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(12),
    fontFamily: FONT_FAMILY.REGULAR,
    color: "gray",
  },
  stepTimestamp: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(12),
    fontFamily: FONT_FAMILY.REGULAR,
    color: "gray",
    marginTop: hp(0.25),
  },
  cancelSection: {
    marginTop: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    paddingTop: isTablet ? hp(2.2) : isSmallDevice ? hp(1.6) : hp(1.9),
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E53E3E',
    paddingVertical: isTablet ? hp(2) : isSmallDevice ? hp(1.5) : hp(1.75),
    paddingHorizontal: isTablet ? wp(6) : isSmallDevice ? wp(4) : wp(5.3),
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: FONT_FAMILY.BOLD,
    color: '#E53E3E',
  },
  cancelNote: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(12),
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#999',
    textAlign: 'center',
    marginTop: isTablet ? hp(1.2) : hp(1),
  },
});

export default TrackingModal;
