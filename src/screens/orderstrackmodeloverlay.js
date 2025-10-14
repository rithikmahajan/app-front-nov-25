import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions, Animated, PanResponder, ActivityIndicator, Alert } from "react-native";
import { FontFamilies, FontSizes } from "../constants/styles";
import shiprocketService from "../services/shiprocketService";

const DEVICE_HEIGHT = Dimensions.get("window").height;

// Font constants to match your app structure
const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
};

const FONT_SIZE = {
  XS: FontSizes.xs,
  S: FontSizes.sm,
  LARGE: FontSizes.xl,
};

// Simple cross icon component since Vector 2.svg is not available
const CrossIcon = ({ width, height }) => (
  <View
    style={{
      width: width,
      height: height,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ fontSize: width * 0.8, color: '#000', fontWeight: 'bold' }}>×</Text>
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
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <Animated.View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: DEVICE_HEIGHT * 0.7,
            transform: [{ translateY }],
          }}
          {...contentPanResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Drag Handle */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 10,
              }}
              {...dragHandlePanResponder.panHandlers}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#ccc",
                  borderRadius: 2,
                }}
              />
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: FONT_SIZE.LARGE,
                    fontFamily: FONT_FAMILY.BOLD,
                  }}
                >
                  Order Status
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <CrossIcon
                    width={DEVICE_HEIGHT * 0.02}
                    height={DEVICE_HEIGHT * 0.02}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  height: 1,
                  width: "100%",
                  alignSelf: "center",
                  backgroundColor: "#ccc",
                  marginVertical: 10,
                }}
              />

              {/* Loading indicator */}
              {loading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={{ marginTop: 10, fontSize: FONT_SIZE.S, color: '#666' }}>
                    Fetching real-time tracking...
                  </Text>
                </View>
              )}

              {/* Error message */}
              {error && !loading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: FONT_SIZE.S, color: '#E53E3E', textAlign: 'center' }}>
                    {error}
                  </Text>
                  <Text style={{ marginTop: 10, fontSize: FONT_SIZE.XS, color: '#666', textAlign: 'center' }}>
                    Showing basic order status
                  </Text>
                </View>
              )}

              {/* Tracking steps */}
              {!loading && masterSteps.map((step, index) => {
                const isFilled = isStatusCompleted(step.status, step.shiprocketStatus);
                const stepData = getStepDetails(step.status, step.shiprocketStatus);
                const isLast = index === masterSteps.length - 1;

                return (
                  <View key={index} style={{ flexDirection: "row", gap: 10 }}>
                    {/* Dot & Line */}
                    <View style={{ alignItems: "center", alignSelf: "flex-start" }}>
                      {/* Dot */}
                      <View
                        style={{
                          width: DEVICE_HEIGHT * 0.02,
                          height: DEVICE_HEIGHT * 0.02,
                          borderRadius: DEVICE_HEIGHT * 0.01,
                          borderColor: isFilled ? "black" : "gray",
                          borderWidth: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isFilled && (
                          <View
                            style={{
                              width: DEVICE_HEIGHT * 0.01,
                              height: DEVICE_HEIGHT * 0.01,
                              borderRadius: DEVICE_HEIGHT * 0.005,
                              backgroundColor: "black",
                            }}
                          />
                        )}
                      </View>

                      {/* Line below dot */}
                      {!isLast && (
                        <View
                          style={{
                            height: DEVICE_HEIGHT * 0.04,
                            width: DEVICE_HEIGHT * 0.002,
                            backgroundColor: isFilled ? "black" : "gray",
                          }}
                        />
                      )}
                    </View>

                    {/* Text Info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: FONT_SIZE.S,
                          fontFamily: FONT_FAMILY.REGULAR,
                          color: "#000",
                        }}
                      >
                        {step.status}
                      </Text>
                      {stepData.location && (
                        <Text
                          style={{
                            fontSize: FONT_SIZE.XS,
                            fontFamily: FONT_FAMILY.REGULAR,
                            color: "gray",
                          }}
                          numberOfLines={1}
                        >
                          {stepData.location}
                        </Text>
                      )}
                      {stepData.timestamp && (
                        <Text
                          style={{
                            fontSize: FONT_SIZE.XS,
                            fontFamily: FONT_FAMILY.REGULAR,
                            color: "gray",
                            marginTop: 2,
                          }}
                        >
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

              {/* Cancel Order Button */}
              {!loading && canCancelOrder() && (
                <View style={{ marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E4E4E4' }}>
                  <TouchableOpacity
                    onPress={handleCancelOrder}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E53E3E',
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: FONT_SIZE.S,
                      fontFamily: FONT_FAMILY.BOLD,
                      color: '#E53E3E',
                    }}>
                      Cancel Order
                    </Text>
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: FONT_SIZE.XS,
                    fontFamily: FONT_FAMILY.REGULAR,
                    color: '#999',
                    textAlign: 'center',
                    marginTop: 8,
                  }}>
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

export default TrackingModal;
