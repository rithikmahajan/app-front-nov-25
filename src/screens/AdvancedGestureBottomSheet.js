import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  Modal,
  Easing,
  PanResponder,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const AdvancedGestureBottomSheet = ({ navigation, visible = true, onClose }) => {
  const [selectedPreference, setSelectedPreference] = useState('female');
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Gesture state tracking
  const gestureTracker = useRef({
    isActive: false,
    startY: 0,
    currentY: 0,
    velocity: 0,
    lastTimestamp: 0,
  }).current;

  // Sheet dimensions and constraints
  const SHEET_MIN_HEIGHT = 400;
  const SHEET_MAX_HEIGHT = screenHeight * 0.9;
  const DISMISS_THRESHOLD = 150;
  const VELOCITY_THRESHOLD = 1000;
  const SNAP_POINTS = useMemo(() => [0, SHEET_MIN_HEIGHT, SHEET_MAX_HEIGHT], [SHEET_MIN_HEIGHT, SHEET_MAX_HEIGHT]);

  // Animation effect when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset pan position
      panY.setValue(0);
      
      // Start entrance animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Reset all animation values
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
      backdropOpacity.setValue(0);
      panY.setValue(0);
      setIsDragging(false);
    }
  }, [visible, slideAnim, opacityAnim, backdropOpacity, panY]);

  const preferences = useMemo(() => [
    { id: 'male', icon: '♂', label: 'Male' },
    { id: 'female', icon: '♀', label: 'Female' },  
    { id: 'unisex', icon: '⚥', label: 'Unisex' },
  ], []);

  const handlePreferenceSelect = useCallback((preferenceId) => {
    setSelectedPreference(preferenceId);
  }, []);

  // Find nearest snap point
  const findNearestSnapPoint = useCallback((currentPosition, velocity) => {
    const currentPos = Math.max(0, currentPosition);
    
    // If velocity is high enough, determine direction
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      if (velocity > 0) {
        // Fast downward - dismiss
        return SHEET_MAX_HEIGHT;
      } else {
        // Fast upward - snap to min height
        return 0;
      }
    }
    
    // Find closest snap point
    let nearest = SNAP_POINTS[0];
    let minDistance = Math.abs(currentPos - nearest);
    
    SNAP_POINTS.forEach(point => {
      const distance = Math.abs(currentPos - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    return nearest;
  }, [VELOCITY_THRESHOLD, SHEET_MAX_HEIGHT, SNAP_POINTS]);

  // Animate to snap point
  const animateToSnapPoint = useCallback((snapPoint, velocity = 0) => {
    const shouldDismiss = snapPoint >= DISMISS_THRESHOLD;
    
    if (shouldDismiss) {
      // Dismiss animation
      Animated.parallel([
        Animated.timing(panY, {
          toValue: SHEET_MAX_HEIGHT,
          duration: Math.max(200, 400 - Math.abs(velocity) * 0.1),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Reset and close
        panY.setValue(0);
        slideAnim.setValue(0);
        opacityAnim.setValue(0);
        backdropOpacity.setValue(0);
        setIsDragging(false);
        
        if (onClose) {
          onClose();
        }
        if (navigation && navigation.goBack) {
          navigation.goBack();
        }
      });
    } else {
      // Snap back animation
      Animated.spring(panY, {
        toValue: snapPoint,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
        velocity: velocity * 0.001,
      }).start(() => {
        setIsDragging(false);
      });
    }
  }, [panY, opacityAnim, backdropOpacity, slideAnim, onClose, navigation, SHEET_MAX_HEIGHT, DISMISS_THRESHOLD]);

  // Advanced PanResponder with latest gesture control
  const panResponder = useRef(
    PanResponder.create({
      // Enhanced gesture detection
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to touches within the sheet area
        const touchY = evt.nativeEvent.pageY;
        const sheetTop = screenHeight - SHEET_MIN_HEIGHT;
        return touchY > sheetTop - 100; // Add some tolerance
      },
      
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // More precise gesture detection
        const isVerticalGesture = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10;
        const hasMinMovement = Math.abs(dy) > 5;
        
        return isVerticalGesture && hasMinMovement;
      },
      
      // Enhanced capture handlers for better control
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => {
        // Capture if we're already dragging
        return isDragging;
      },
      
      // Gesture start
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        
        // Setup gesture tracking
        gestureTracker.isActive = true;
        gestureTracker.startY = evt.nativeEvent.pageY;
        gestureTracker.currentY = gestureTracker.startY;
        gestureTracker.lastTimestamp = evt.timeStamp;
        
        // Set offset for smooth continuation
        panY.setOffset(panY._value);
        panY.setValue(0);
      },
      
      // Gesture move - this is where the magic happens
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        const currentTime = evt.timeStamp;
        
        // Update gesture state for velocity calculation
        gestureTracker.currentY = evt.nativeEvent.pageY;
        const timeDelta = currentTime - gestureTracker.lastTimestamp;
        
        if (timeDelta > 0) {
          const distance = gestureTracker.currentY - gestureTracker.startY;
          gestureTracker.velocity = distance / timeDelta;
        }
        
        gestureTracker.lastTimestamp = currentTime;
        
        // Enhanced movement with resistance
        let newY = dy;
        
        if (dy < 0) {
          // Upward movement - add resistance
          const resistance = Math.min(0.5, Math.abs(dy) / 200);
          newY = dy * (1 - resistance);
        } else {
          // Downward movement - allow free movement
          newY = dy;
        }
        
        // Apply the movement
        panY.setValue(newY);
        
        // Update backdrop opacity based on drag position
        const dragProgress = Math.max(0, Math.min(1, newY / DISMISS_THRESHOLD));
        const newBackdropOpacity = 1 - (dragProgress * 0.5);
        backdropOpacity.setValue(newBackdropOpacity);
      },
      
      // Gesture end
      onPanResponderRelease: (evt, gestureState) => {
        panY.flattenOffset();
        gestureTracker.isActive = false;
        
        const { vy } = gestureState;
        const finalVelocity = gestureTracker.velocity || vy;
        
        // Enhanced release logic with snap points
        const currentPosition = panY._value;
        const snapPoint = findNearestSnapPoint(currentPosition, finalVelocity);
        
        // Animate to the determined snap point
        animateToSnapPoint(snapPoint, finalVelocity);
      },
      
      // Gesture termination
      onPanResponderTerminationRequest: () => {
        // Allow termination if not actively dragging
        return !isDragging;
      },
      
      onPanResponderTerminate: () => {
        // Reset on termination
        panY.flattenOffset();
        gestureTracker.isActive = false;
        setIsDragging(false);
        
        // Snap back to original position
        animateToSnapPoint(0, 0);
      },
      
      // Block native components (Android)
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  const handleLetsYoraa = useCallback(() => {
    // Start exit animation before navigation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (navigation) {
        navigation.navigate('Home');
      }
      if (onClose) {
        onClose();
      }
    });
  }, [navigation, onClose, slideAnim, opacityAnim, backdropOpacity]);

  const handleBackdropPress = useCallback(() => {
    animateToSnapPoint(SHEET_MAX_HEIGHT, 0);
  }, [animateToSnapPoint, SHEET_MAX_HEIGHT]);

  // Enhanced animation interpolations
  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SHEET_MIN_HEIGHT, 0],
    }),
    panY
  );

  const animatedModalStyle = {
    transform: [{ translateY }],
    opacity: opacityAnim,
  };

  const backdropStyle = {
    opacity: backdropOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  };

  const swipeHandleStyle = {
    opacity: isDragging ? 0.8 : 0.4,
    transform: [{
      scaleX: isDragging ? 1.2 : 1,
    }],
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        {/* Animated backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        {/* Backdrop touchable */}
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1} 
          onPress={handleBackdropPress}
        />
        
        {/* Bottom sheet */}
        <TouchableWithoutFeedback>
          <Animated.View 
            style={[styles.bottomSheet, animatedModalStyle]}
            {...panResponder.panHandlers}
          >
            {/* Enhanced swipe handle with visual feedback */}
            <Animated.View style={[styles.swipeHandle, swipeHandleStyle]} />
            
            {/* Drag indicator area */}
            <View style={styles.dragArea} />
            
            {/* Header Icon */}
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIcon}>
                <View style={styles.computerIcon}>
                  <View style={styles.screen} />
                  <View style={styles.stand} />
                  <View style={styles.base} />
                </View>
                <View style={styles.checkmarkOverlay}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Pick your preference!</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Select your personalised shopping experience
            </Text>

            {/* Preference Options */}
            <View style={styles.preferencesContainer}>
              {preferences.map((preference) => {
                const isSelected = selectedPreference === preference.id;
                return (
                  <TouchableOpacity
                    key={preference.id}
                    style={[
                      styles.preferenceOption,
                      isSelected && styles.selectedPreference,
                    ]}
                    onPress={() => handlePreferenceSelect(preference.id)}
                    activeOpacity={0.7}
                    disabled={isDragging} // Disable during drag
                  >
                    <Text style={[
                      styles.preferenceIcon,
                      isSelected && styles.selectedIcon,
                    ]}>
                      {preference.icon}
                    </Text>
                    <Text style={[
                      styles.preferenceLabel,
                      isSelected && styles.selectedLabel,
                    ]}>
                      {preference.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={[styles.letsYoraaButton, isDragging && styles.buttonDisabled]}
              onPress={handleLetsYoraa}
              activeOpacity={0.8}
              disabled={isDragging}
            >
              <Text style={styles.buttonText}>Let's Yoraa!</Text>
            </TouchableOpacity>
            
            {/* Safe area for gesture detection */}
            <View style={styles.gestureArea} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 400, // Allow backdrop touches above the sheet
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 34,
    minHeight: 400,
    maxHeight: screenHeight * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  swipeHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  dragArea: {
    height: 20,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  computerIcon: {
    alignItems: 'center',
  },
  screen: {
    width: 32,
    height: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
    marginBottom: 2,
  },
  stand: {
    width: 2,
    height: 8,
    backgroundColor: '#666',
    marginBottom: 1,
  },
  base: {
    width: 16,
    height: 2,
    backgroundColor: '#666',
    borderRadius: 1,
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  preferencesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  preferenceOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPreference: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  preferenceIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#666666',
  },
  selectedIcon: {
    color: '#2196F3',
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectedLabel: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  letsYoraaButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gestureArea: {
    height: 20,
    width: '100%',
    marginTop: 8,
  },
});

export default AdvancedGestureBottomSheet;
