import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  View,
} from "react-native";
import { FontFamilies } from "../constants/styles";

const DEVICE_HEIGHT = Dimensions.get("window").height;

// Font constants to match your app structure
const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
};

const CancelOrderRequest = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: DEVICE_HEIGHT,
      useNativeDriver: true,
      tension: 150, // Increased tension for faster animation
      friction: 6,  // Reduced friction for faster animation
    }).start(() => {
      setVisible(false);
    });
  };

  const handleOpen = () => {
    setVisible(true);
  };

  // Pan responder for drag handle - always allows drag to close (following bagsizeselectormodaloverlay pattern)
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Always respond to any movement on the drag handle
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          // Lower threshold for drag handle
          handleClose();
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  // Pan responder for content area - only for downward swipes (following bagsizeselectormodaloverlay pattern)
  const contentPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to significant downward swipes
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Higher threshold for content area
          handleClose();
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  useImperativeHandle(ref, () => ({
    open() {
      handleOpen();
    },
    close() {
      handleClose();
    },
  }));

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}>
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            paddingBottom: 50,
            maxHeight: DEVICE_HEIGHT * 0.6,
            transform: [{ translateY }],
          }}
        >
          {/* Drag Handle - draggable area */}
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
            {...dragHandlePanResponder.panHandlers}
          >
            <View style={{
              width: 64,
              height: 6,
              backgroundColor: '#E6E6E6',
              borderRadius: 40,
              marginTop: 10,
            }} />
          </View>

          {/* Content Container with swipe down capability */}
          <View 
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              gap: 12,
            }}
            {...contentPanResponder.panHandlers}
          >
            {/* Heading */}
            <Text
              style={{
                fontSize: 24,
                fontFamily: FONT_FAMILY.BOLD,
                textAlign: "left",
                color: '#000000',
                letterSpacing: -0.96,
                lineHeight: 28.8,
              }}
            >
              Want to cancel your order?
            </Text>

            {/* Subtext */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: FONT_FAMILY.REGULAR,
                color: "#767676",
                letterSpacing: -0.384,
                lineHeight: 24,
              }}
            >
              You can cancel orders for a short time after they are placed - free of charge.
            </Text>
          </View>

          {/* Button Container - separate from content pan responder */}
          <View style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            gap: 14,
          }}>
            {/* Go Back Button (Black CTA) */}
            <TouchableOpacity
              onPress={handleClose}
              style={{
                backgroundColor: "#000000",
                width: "100%",
                paddingVertical: 16,
                paddingHorizontal: 51,
                borderRadius: 100,
                alignItems: "center",
              }}
            >
              <Text style={{ 
                color: "#FFFFFF", 
                fontFamily: FONT_FAMILY.BOLD,
                fontSize: 16,
                lineHeight: 19.2,
              }}>
                Go Back
              </Text>
            </TouchableOpacity>
            
            {/* Cancel Order Button (Outlined) */}
            <TouchableOpacity
              onPress={() => {
                // Close modal and call callback when animation completes
                Animated.spring(translateY, {
                  toValue: DEVICE_HEIGHT,
                  useNativeDriver: true,
                  tension: 150,
                  friction: 6,
                }).start(() => {
                  setVisible(false);
                  props.onRequestConfirmed?.();
                });
              }}
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E4E4E4",
                width: "100%",
                paddingVertical: 16,
                paddingHorizontal: 51,
                borderRadius: 100,
                alignItems: "center",
              }}
            >
              <Text style={{ 
                color: "#000000",  
                fontFamily: FONT_FAMILY.BOLD,
                fontSize: 16,
                lineHeight: 19.2,
              }}>
                Cancel Order
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default CancelOrderRequest;
