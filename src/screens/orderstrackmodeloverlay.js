import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions, Animated, PanResponder } from "react-native";
import { FontFamilies, FontSizes } from "../constants/styles";

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
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  // Static master steps
  const masterSteps = [
    { status: "Packing" },
    { status: "Picked" },
    { status: "In Transit" },
    { status: "Delivered" },
  ];

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
    });
  };

  const handleOpen = (data) => {
    setTrackingData(data || []);
    translateY.setValue(DEVICE_HEIGHT);
    setVisible(true);
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

  const isStatusCompleted = (status) =>
    trackingData.find((step) => step.status === status);

  const getStepDetails = (status) =>
    trackingData.find((step) => step.status === status) || {};

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

              {masterSteps.map((step, index) => {
                const isFilled = isStatusCompleted(step.status);
                const stepData = getStepDetails(step.status);
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
                      <Text
                        style={{
                          fontSize: FONT_SIZE.XS,
                          fontFamily: FONT_FAMILY.REGULAR,
                          color: "gray",
                        }}
                        numberOfLines={1}
                      >
                        {stepData.location || ""}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

export default TrackingModal;
