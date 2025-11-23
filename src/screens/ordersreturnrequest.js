import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
} from 'react-native';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const { height } = Dimensions.get('window');

const OrdersReturnRequest = ({ navigation, route }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Animate modal slide up with 250ms duration, ease in (down to up)
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
      // Add easing for smooth animation
    }).start();
  }, [slideAnim]);

  const handleGoBack = () => {
    // Animate modal slide down before navigation
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Orders');
    });
  };

  const handleRequestReturn = () => {
    // Navigate to the return accepted modal
    navigation.navigate('OrdersReturnAcceptedModal');
  };

  // Pan responder for drag handle - always allows drag to close
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Always respond to any movement on the drag handle
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          // Lower threshold for drag handle - close modal
          handleGoBack();
        } else {
          // Snap back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  // Pan responder for content area - only for downward swipes
  const contentPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to significant downward swipes
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Higher threshold for content area - close modal
          handleGoBack();
        } else {
          // Snap back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      onRequestClose={handleGoBack}
    >
      <View style={styles.overlay}>
        {/* Backdrop - tap to close */}
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleGoBack}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Drawer Handle - draggable area */}
          <View 
            style={styles.drawerHandleContainer}
            {...dragHandlePanResponder.panHandlers}
          >
            <View style={styles.drawerHandle} />
          </View>
          
          {/* Content Container with swipe down capability */}
          <View 
            style={styles.contentWrapper}
            {...contentPanResponder.panHandlers}
          >
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <View style={styles.icon}>
                  {/* Exclamation mark icon */}
                  <View style={styles.exclamationLine} />
                  <View style={styles.exclamationDot} />
                </View>
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title}>Requesting return!</Text>
              
              {/* Description */}
              <Text style={styles.description}>
                Please note that Rs. 200 reverse shipment charges for India and Rs.1300 for International are applicable. Charges vary for International Delivery. Please read our return and exchange policies before proceeding.
              </Text>
            </View>
          </View>

          {/* Button Container - separate from content pan responder */}
          <View style={styles.buttonContainer}>
            {/* Go Back Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </TouchableOpacity>

            {/* Request Return Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRequestReturn}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Request Return</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
    minHeight: isTablet ? hp(40) : isSmallDevice ? hp(42) : hp(44),
    position: 'relative',
  },
  drawerHandle: {
    width: isTablet ? wp(10) : isSmallDevice ? wp(15) : wp(17),
    height: isTablet ? hp(0.8) : hp(0.75),
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    alignSelf: 'center',
  },
  drawerHandleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: isTablet ? hp(4) : hp(3.8),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingTop: isTablet ? hp(1.5) : hp(1.25),
  },
  contentWrapper: {
    paddingTop: isTablet ? hp(3) : isSmallDevice ? hp(2) : hp(2.5),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? hp(3.5) : isSmallDevice ? hp(2.5) : hp(3),
  },
  iconBackground: {
    width: isTablet ? wp(15) : isSmallDevice ? wp(20) : wp(21.5),
    height: isTablet ? hp(10) : isSmallDevice ? hp(9.5) : hp(10),
    borderRadius: isTablet ? wp(7.5) : isSmallDevice ? wp(10) : wp(10.75),
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: isTablet ? wp(10) : isSmallDevice ? wp(13) : wp(14.5),
    height: isTablet ? hp(6.8) : isSmallDevice ? hp(6.4) : hp(6.8),
    borderRadius: isTablet ? wp(5) : isSmallDevice ? wp(6.5) : wp(7.25),
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationLine: {
    width: isTablet ? wp(0.8) : wp(1.1),
    height: isTablet ? hp(2.2) : isSmallDevice ? hp(1.8) : hp(2),
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: hp(0.5),
  },
  exclamationDot: {
    width: isTablet ? wp(0.8) : wp(1.1),
    height: isTablet ? hp(0.6) : hp(0.5),
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: isTablet ? wp(8) : isSmallDevice ? wp(5) : wp(6.4),
    marginBottom: isTablet ? hp(3.5) : isSmallDevice ? hp(2.5) : hp(3),
  },
  title: {
    fontSize: isTablet ? fs(28) : isSmallDevice ? fs(20) : fs(24),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: isTablet ? hp(1.8) : isSmallDevice ? hp(1.2) : hp(1.5),
    letterSpacing: -0.96,
    lineHeight: isTablet ? fs(36) : isSmallDevice ? fs(26) : fs(30),
  },
  description: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#767676',
    textAlign: 'center',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
    paddingHorizontal: isTablet ? wp(4) : wp(0),
  },
  buttonContainer: {
    paddingHorizontal: isTablet ? wp(6) : isSmallDevice ? wp(4) : wp(5.3),
    gap: isTablet ? hp(2) : isSmallDevice ? hp(1.4) : hp(1.75),
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: isTablet ? hp(2.2) : isSmallDevice ? hp(1.6) : hp(2),
    paddingHorizontal: isTablet ? wp(12) : isSmallDevice ? wp(10) : wp(13.5),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isTablet ? hp(7) : hp(6),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: isTablet ? hp(2.2) : isSmallDevice ? hp(1.6) : hp(2),
    paddingHorizontal: isTablet ? wp(12) : isSmallDevice ? wp(10) : wp(13.5),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    minHeight: isTablet ? hp(7) : hp(6),
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
  },
});

export default OrdersReturnRequest;
