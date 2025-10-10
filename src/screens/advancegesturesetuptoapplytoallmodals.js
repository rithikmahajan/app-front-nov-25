/**
 * ADVANCED GESTURE SETUP FOR ALL MODALS
 * 
 * This file contains all the essential gesture control utilities and configurations
 * that can be applied to any modal/bottom sheet component in the app.
 * 
 * Features:
 * - Advanced PanResponder configuration
 * - Modern react-native-gesture-handler support
 * - Gesture state tracking utilities
 * - Animation helpers
 * - Snap point calculations
 * - Performance optimizations
 */

import { Animated, PanResponder, Easing, Dimensions } from 'react-native';
import { State } from 'react-native-gesture-handler';

const { height: screenHeight } = Dimensions.get('window');

// GESTURE CONFIGURATION CONSTANTS
export const GESTURE_CONFIG = {
  SHEET_MIN_HEIGHT: 400,
  SHEET_MAX_HEIGHT: screenHeight * 0.9,
  DISMISS_THRESHOLD: 150,
  VELOCITY_THRESHOLD: 1000,
  RESISTANCE_FACTOR: 0.1,
  ANIMATION_DURATION: 300,
  SNAP_TENSION: 150,
  SNAP_FRICTION: 10,
};

// GESTURE STATE TRACKER FACTORY
export const createGestureTracker = () => ({
  isActive: false,
  startY: 0,
  currentY: 0,
  velocity: 0,
  lastTimestamp: 0,
});

// VELOCITY CALCULATION UTILITY
export const calculateVelocity = (gestureTracker, currentY, timestamp) => {
  if (!gestureTracker.lastTimestamp) {
    gestureTracker.lastTimestamp = timestamp;
    gestureTracker.currentY = currentY;
    return 0;
  }
  
  const deltaTime = timestamp - gestureTracker.lastTimestamp;
  const deltaY = currentY - gestureTracker.currentY;
  
  gestureTracker.lastTimestamp = timestamp;
  gestureTracker.currentY = currentY;
  
  return deltaTime > 0 ? (deltaY / deltaTime) * 1000 : 0; // pixels per second
};

// SNAP POINT FINDER UTILITY
export const findNearestSnapPoint = (currentPosition, velocity, snapPoints = [0, GESTURE_CONFIG.SHEET_MIN_HEIGHT, GESTURE_CONFIG.SHEET_MAX_HEIGHT]) => {
  const currentPos = Math.max(0, currentPosition);
  
  // If velocity is high enough, determine direction
  if (Math.abs(velocity) > GESTURE_CONFIG.VELOCITY_THRESHOLD) {
    if (velocity > 0) {
      // Fast downward - dismiss
      return GESTURE_CONFIG.SHEET_MAX_HEIGHT;
    } else {
      // Fast upward - snap to min height
      return 0;
    }
  }
  
  // Find closest snap point based on position
  let nearestPoint = snapPoints[0];
  let minDistance = Math.abs(currentPos - nearestPoint);
  
  for (const point of snapPoints) {
    const distance = Math.abs(currentPos - point);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }
  
  return nearestPoint;
};

// ANIMATION TO POSITION UTILITY
export const animateToPosition = (panY, opacityAnim, backdropOpacity, position, callback) => {
  const isClosing = position >= GESTURE_CONFIG.DISMISS_THRESHOLD;
  
  Animated.parallel([
    Animated.timing(panY, {
      toValue: position,
      duration: isClosing ? 250 : GESTURE_CONFIG.ANIMATION_DURATION,
      easing: isClosing ? Easing.out(Easing.cubic) : Easing.out(Easing.back(1.1)),
      useNativeDriver: false,
    }),
    ...(isClosing ? [
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
    ] : [])
  ]).start(callback);
};

// DISMISS SHEET UTILITY
export const dismissSheet = (panY, slideAnim, opacityAnim, backdropOpacity, onClose, navigation) => {
  animateToPosition(panY, opacityAnim, backdropOpacity, GESTURE_CONFIG.SHEET_MAX_HEIGHT, () => {
    panY.setValue(0);
    slideAnim.setValue(0);
    opacityAnim.setValue(0);
    backdropOpacity.setValue(0);
    
    if (onClose) {
      onClose();
    }
    
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  });
};

// ADVANCED PAN RESPONDER FACTORY
export const createAdvancedPanResponder = ({
  panY,
  backdropOpacity,
  gestureTracker,
  onDismiss,
  setIsDragging
}) => {
  return PanResponder.create({
    // Advanced gesture detection - only start for clear downward gestures
    onStartShouldSetPanResponder: () => false,
    
    // Sophisticated movement detection with enhanced thresholds
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const isVerticalGesture = Math.abs(dy) > Math.abs(dx);
      const isDownwardGesture = dy > 20;
      const hasSufficientMovement = Math.abs(dy) > 15;
      
      return isVerticalGesture && isDownwardGesture && hasSufficientMovement;
    },
    
    // Capture phase handlers
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    
    // Gesture activation with enhanced tracking
    onPanResponderGrant: (evt, gestureState) => {
      setIsDragging(true);
      gestureTracker.isActive = true;
      gestureTracker.startY = gestureState.y0;
      gestureTracker.lastTimestamp = Date.now();
      
      panY.setOffset(panY._value);
      panY.setValue(0);
      
      // Visual feedback
      Animated.timing(backdropOpacity, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: false,
      }).start();
    },
    
    // Advanced movement handling with real-time tracking
    onPanResponderMove: (evt, gestureState) => {
      const { dy } = gestureState;
      const currentTime = Date.now();
      
      // Update gesture tracking
      gestureTracker.currentY = gestureState.moveY;
      gestureTracker.velocity = calculateVelocity(gestureTracker, gestureState.moveY, currentTime);
      
      // Enhanced movement with elastic resistance
      if (dy > 0) {
        panY.setValue(dy);
      } else if (dy < 0) {
        const resistance = Math.max(0.05, 1 - Math.abs(dy) / 100);
        panY.setValue(dy * resistance);
      }
      
      // Dynamic backdrop opacity
      const dragProgress = Math.min(1, Math.abs(dy) / GESTURE_CONFIG.DISMISS_THRESHOLD);
      const newOpacity = 1 - (dragProgress * 0.3);
      backdropOpacity.setValue(newOpacity);
    },
    
    // Sophisticated release handling
    onPanResponderRelease: (evt, gestureState) => {
      panY.flattenOffset();
      setIsDragging(false);
      gestureTracker.isActive = false;
      
      const { dy, vy } = gestureState;
      const finalVelocity = gestureTracker.velocity || vy * 1000;
      
      // Advanced dismissal logic
      const distanceThreshold = GESTURE_CONFIG.DISMISS_THRESHOLD;
      const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD * 0.8;
      const combinedThreshold = dy > 80 && Math.abs(finalVelocity) > 500;
      
      const shouldDismiss = 
        dy > distanceThreshold || 
        Math.abs(finalVelocity) > velocityThreshold ||
        combinedThreshold;
      
      if (shouldDismiss) {
        onDismiss();
      } else {
        // Snap back
        const snapTarget = findNearestSnapPoint(dy, finalVelocity);
        Animated.parallel([
          Animated.spring(panY, {
            toValue: snapTarget,
            useNativeDriver: false,
            tension: GESTURE_CONFIG.SNAP_TENSION,
            friction: GESTURE_CONFIG.SNAP_FRICTION,
            overshootClamping: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
    
    // Enhanced termination handling
    onPanResponderTerminationRequest: (evt, gestureState) => {
      return !gestureTracker.isActive || Math.abs(gestureState.dy) < 30;
    },
    
    // Graceful termination
    onPanResponderTerminate: () => {
      setIsDragging(false);
      gestureTracker.isActive = false;
      
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
          tension: GESTURE_CONFIG.SNAP_TENSION,
          friction: GESTURE_CONFIG.SNAP_FRICTION,
          overshootClamping: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    },
    
    // Platform-specific blocking
    onShouldBlockNativeResponder: (evt, gestureState) => {
      return gestureTracker.isActive && Math.abs(gestureState.dy) > 10;
    },
  });
};

// MODERN GESTURE HANDLER FACTORY
export const createModernGestureHandlers = ({
  panY,
  backdropOpacity,
  gestureTracker,
  onDismiss,
  setIsDragging
}) => {
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        setIsDragging(Math.abs(translationY) > 5);
        
        // Update backdrop opacity
        const dragProgress = Math.min(1, Math.abs(translationY) / GESTURE_CONFIG.DISMISS_THRESHOLD);
        const newOpacity = 1 - (dragProgress * 0.3);
        backdropOpacity.setValue(newOpacity);
      }
    }
  );

  const onHandlerStateChange = (event) => {
    const { state, translationY, velocityY } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsDragging(true);
      gestureTracker.isActive = true;
    } else if (state === State.END) {
      setIsDragging(false);
      gestureTracker.isActive = false;
      
      const dismissThreshold = GESTURE_CONFIG.DISMISS_THRESHOLD * 0.8;
      const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD * 0.7;

      const shouldDismiss = 
        translationY > dismissThreshold || 
        (translationY > 50 && velocityY > velocityThreshold);

      if (shouldDismiss) {
        onDismiss();
      } else {
        Animated.parallel([
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
            tension: GESTURE_CONFIG.SNAP_TENSION,
            friction: GESTURE_CONFIG.SNAP_FRICTION,
            overshootClamping: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
  };

  return { onGestureEvent, onHandlerStateChange };
};

// ANIMATION INTERPOLATIONS UTILITY
export const createAnimationInterpolations = (slideAnim, panY, opacityAnim, backdropOpacity) => {
  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    }),
    panY
  );

  const dynamicBackdropOpacity = Animated.multiply(
    opacityAnim,
    backdropOpacity
  );

  return {
    animatedModalStyle: {
      transform: [{ translateY }],
      opacity: opacityAnim,
    },
    animatedBackdropStyle: {
      opacity: dynamicBackdropOpacity,
    },
  };
};

// ENHANCED STYLES FOR GESTURE FEEDBACK
export const GESTURE_STYLES = {
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  
  swipeHandleActive: {
    backgroundColor: '#2196F3',
    width: 60,
    height: 5,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  preferenceOptionDisabled: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.1,
    elevation: 2,
  },
};


