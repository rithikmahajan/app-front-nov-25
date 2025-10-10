import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
  PanResponder,
} from "react-native";
import { FontFamilies } from "../constants/styles";

const DEVICE_HEIGHT = Dimensions.get("window").height;

// Font constants to match your app structure
const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
  MEDIUM: FontFamilies.medium || FontFamilies.bold, // Fallback to bold if medium not available
};

const CancelledOrderConfirm = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  // Debug logging
  useEffect(() => {
    console.log('CancelledOrderConfirm mounted');
  }, []);

  useEffect(() => {
    if (visible) {
      // Reset translateY to starting position first
      translateY.setValue(DEVICE_HEIGHT);
      // Animate modal up with faster, more responsive animation
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200, // Higher tension for faster response
        friction: 7,  // Lower friction for quicker animation
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: DEVICE_HEIGHT,
      useNativeDriver: true,
      tension: 200, // Higher tension for faster close
      friction: 7,  // Lower friction for quicker animation
    }).start(() => {
      setVisible(false);
    });
  };

  const handleOpen = () => {
    // Ensure the modal starts from the bottom
    translateY.setValue(DEVICE_HEIGHT);
    setVisible(true);
  };

  // Pan responder for drag handle - always allows drag to close (following orderscancelordermodal pattern)
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
            tension: 200,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  // Pan responder for content area - only for downward swipes (following orderscancelordermodal pattern)
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
            tension: 200,
            friction: 7,
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
              alignItems: 'center',
            }}
            {...contentPanResponder.panHandlers}
          >
            {/* Heading */}
            <Text
              style={{
                fontSize: 24,
                fontFamily: FONT_FAMILY.MEDIUM,
                textAlign: "center",
                color: '#000000',
                marginBottom: 16,
                lineHeight: 28.8,
                letterSpacing: -0.96,
              }}
            >
              Your order has been cancelled
            </Text>

            {/* Subtext */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontFamily: FONT_FAMILY.REGULAR,
                color: "#767676",
                marginBottom: 32,
                lineHeight: 24,
                letterSpacing: -0.384,
                paddingHorizontal: 8,
              }}
            >
              Your cancellation has been processed and you won't be charged. It can take a few minutes for this page to show your order's status updated.
            </Text>
          </View>

          {/* Button Container - separate from content pan responder */}
          <View style={{
            paddingHorizontal: 24,
            paddingTop: 16,
          }}>
            {/* Got It Button */}
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
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: 16,
                lineHeight: 19.2,
              }}>
                Got It
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default CancelledOrderConfirm;
