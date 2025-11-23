import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
  PanResponder,
  StyleSheet,
} from "react-native";
import { FontFamilies } from "../constants/styles";
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const DEVICE_HEIGHT = Dimensions.get("window").height;

const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
  MEDIUM: FontFamilies.medium || FontFamilies.bold,
};

const CancelledOrderConfirm = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(DEVICE_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(DEVICE_HEIGHT);
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

  const handleOpen = () => {
    translateY.setValue(DEVICE_HEIGHT);
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
            tension: 200,
            friction: 7,
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
            style={styles.dragHandleContainer}
            {...dragHandlePanResponder.panHandlers}
          >
            <View style={styles.dragHandle} />
          </View>

          <View 
            style={styles.contentContainer}
            {...contentPanResponder.panHandlers}
          >
            <Text style={styles.heading}>
              Your order has been cancelled
            </Text>

            <Text style={styles.subtext}>
              Your cancellation has been processed and you won't be charged. It can take a few minutes for this page to show your order's status updated.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.gotItButton}
            >
              <Text style={styles.gotItButtonText}>
                Got It
              </Text>
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
    paddingBottom: hp(isTablet ? 7.8 : 6.2),
    maxHeight: DEVICE_HEIGHT * 0.6,
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(isTablet ? 4.7 : 3.7),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandle: {
    width: wp(isTablet ? 21.3 : 17.1),
    height: hp(isTablet ? 0.9 : 0.7),
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    marginTop: hp(isTablet ? 1.6 : 1.2),
  },
  contentContainer: {
    paddingHorizontal: wp(isTablet ? 8 : 6.4),
    paddingTop: hp(isTablet ? 3.7 : 3),
    alignItems: 'center',
  },
  heading: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: FONT_FAMILY.MEDIUM,
    textAlign: "center",
    color: '#000000',
    marginBottom: hp(isTablet ? 2.5 : 2),
    lineHeight: fs(isTablet ? 34 : isSmallDevice ? 24 : 28.8),
    letterSpacing: -0.96,
  },
  subtext: {
    textAlign: "center",
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: FONT_FAMILY.REGULAR,
    color: "#767676",
    marginBottom: hp(isTablet ? 5 : 4),
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    letterSpacing: -0.384,
    paddingHorizontal: wp(isTablet ? 2.7 : 2.1),
  },
  buttonContainer: {
    paddingHorizontal: wp(isTablet ? 8 : 6.4),
    paddingTop: hp(isTablet ? 2.5 : 2),
  },
  gotItButton: {
    backgroundColor: "#000000",
    width: "100%",
    paddingVertical: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: wp(isTablet ? 17 : 13.6),
    borderRadius: 100,
    alignItems: "center",
  },
  gotItButtonText: {
    color: "#FFFFFF",
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    lineHeight: fs(isTablet ? 22 : isSmallDevice ? 17 : 19.2),
  },
});

export default CancelledOrderConfirm;
