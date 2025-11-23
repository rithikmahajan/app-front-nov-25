import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const DEVICE_HEIGHT = Dimensions.get("window").height;

const FONT_FAMILY = {
  REGULAR: 'Montserrat-Regular',
  BOLD: 'Montserrat-Bold',
};

const CancelOrderRequest = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
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
      tension: 150,
      friction: 6,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleOpen = (order) => {
    console.log('📦 Opening cancel order modal with order:', order);
    setOrderData(order);
    setVisible(true);
  };

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
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

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
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  useImperativeHandle(ref, () => ({
    open(order) {
      handleOpen(order);
    },
    close() {
      handleClose();
    },
  }));

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY }] }
          ]}
        >
          <View 
            style={styles.dragHandleArea}
            {...dragHandlePanResponder.panHandlers}
          >
            <View style={styles.dragHandle} />
          </View>

          <View 
            style={styles.contentContainer}
            {...contentPanResponder.panHandlers}
          >
            <Text style={styles.heading}>
              Want to cancel your order?
            </Text>

            <Text style={styles.subtext}>
              You can cancel orders for a short time after they are placed - free of charge.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.goBackButton}
            >
              <Text style={styles.goBackButtonText}>
                Go Back
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={async () => {
                if (isSubmitting) return;
                
                setIsSubmitting(true);
                try {
                  Animated.spring(translateY, {
                    toValue: DEVICE_HEIGHT,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 6,
                  }).start(() => {
                    setVisible(false);
                    setIsSubmitting(false);
                    props.onRequestConfirmed?.(orderData);
                  });
                } catch (error) {
                  console.error('Error handling cancel order:', error);
                  setIsSubmitting(false);
                }
              }}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.cancelButtonText}>
                  Cancel Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: isTablet ? hp(6.6) : isSmallDevice ? hp(5.5) : hp(6.2),
    maxHeight: DEVICE_HEIGHT * 0.6,
  },
  dragHandleArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: isTablet ? hp(4) : isSmallDevice ? hp(3.3) : hp(3.7),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandle: {
    width: isTablet ? wp(21.3) : isSmallDevice ? wp(17.1) : wp(17.1),
    height: isTablet ? hp(0.8) : isSmallDevice ? hp(0.7) : hp(0.74),
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    marginTop: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
  },
  contentContainer: {
    paddingHorizontal: isTablet ? wp(8) : isSmallDevice ? wp(5.3) : wp(6.4),
    paddingTop: isTablet ? hp(3.1) : isSmallDevice ? hp(2.6) : hp(3),
    gap: isTablet ? hp(1.6) : isSmallDevice ? hp(1.3) : hp(1.5),
  },
  heading: {
    fontSize: isTablet ? fs(28) : isSmallDevice ? fs(20) : fs(24),
    fontFamily: FONT_FAMILY.BOLD,
    textAlign: "left",
    color: '#000000',
    letterSpacing: -0.96,
    lineHeight: isTablet ? fs(33.6) : isSmallDevice ? fs(24) : fs(28.8),
  },
  subtext: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontFamily: FONT_FAMILY.REGULAR,
    color: "#767676",
    letterSpacing: -0.384,
    lineHeight: isTablet ? fs(28) : isSmallDevice ? fs(21) : fs(24),
  },
  buttonContainer: {
    paddingHorizontal: isTablet ? wp(6.7) : isSmallDevice ? wp(4.3) : wp(5.3),
    paddingTop: isTablet ? hp(2.1) : isSmallDevice ? hp(1.7) : hp(2),
    gap: isTablet ? hp(1.8) : isSmallDevice ? hp(1.5) : hp(1.7),
  },
  goBackButton: {
    backgroundColor: "#000000",
    width: "100%",
    paddingVertical: isTablet ? hp(2.1) : isSmallDevice ? hp(1.7) : hp(2),
    paddingHorizontal: isTablet ? wp(17.1) : isSmallDevice ? wp(10.7) : wp(13.6),
    borderRadius: 100,
    alignItems: "center",
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    lineHeight: isTablet ? fs(21.6) : isSmallDevice ? fs(16.8) : fs(19.2),
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    width: "100%",
    paddingVertical: isTablet ? hp(2.1) : isSmallDevice ? hp(1.7) : hp(2),
    paddingHorizontal: isTablet ? wp(17.1) : isSmallDevice ? wp(10.7) : wp(13.6),
    borderRadius: 100,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000000",
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    lineHeight: isTablet ? fs(21.6) : isSmallDevice ? fs(16.8) : fs(19.2),
  },
});

export default CancelOrderRequest;
