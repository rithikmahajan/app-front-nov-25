import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Easing,
  PanResponder,
} from 'react-native';
import {
  createGestureTracker,
} from './advancegesturesetuptoapplytoallmodals';

const { width: screenWidth } = Dimensions.get('window');

const PreferenceSelector = ({ navigation, visible = true, onClose, route }) => {
  const [selectedPreference, setSelectedPreference] = useState('female'); // Default to female as shown in Figma
  const [isDragging, setIsDragging] = useState(false); // Add drag state tracking
  
  // Enhanced animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current; // Add backdrop opacity control
  
  // Advanced gesture state tracking
  const gestureTracker = createGestureTracker();

  // Advanced dismiss handler using the utility
  const handleDismiss = useCallback(() => {
    // First close the modal with animation, then navigate
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
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Check if this is coming from authentication flow
      const user = route?.params?.user;
      const isNewUser = route?.params?.isNewUser;
      
      if (navigation) {
        if (user && isNewUser) {
          // If user dismisses during onboarding, go back to terms
          navigation.navigate('TermsAndConditions', {
            previousScreen: route?.params?.previousScreen,
            user: user,
            isNewUser: isNewUser
          });
        } else {
          // Fallback navigation
          navigation.navigate('LoginAccountMobileNumber');
        }
      }
      if (onClose) {
        onClose();
      }
    });
  }, [navigation, onClose, slideAnim, opacityAnim, backdropOpacity, route?.params]);  // Animation effect when modal becomes visible - enhanced for backdrop
  useEffect(() => {
    if (visible) {
      // Start entrance animation (down to up)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Reset animation values when not visible
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
      backdropOpacity.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim, backdropOpacity]);

  // Memoize static preferences data
  const preferences = useMemo(() => [
    { id: 'male', icon: '♂', label: 'Male' },
    { id: 'female', icon: '♀', label: 'Female' },  
    { id: 'unisex', icon: '⚥', label: 'Unisex' },
  ], []);

  // Memoize callback functions to prevent re-renders
  const handlePreferenceSelect = useCallback((preferenceId) => {
    setSelectedPreference(preferenceId);
  }, []);

  const handleLetsYoraa = useCallback(() => {
    // Selected preference logged - removed for production
    
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
    ]).start(() => {
      // Check if this is coming from authentication flow
      const user = route?.params?.user;
      const isNewUser = route?.params?.isNewUser;
      const fromCheckout = route?.params?.fromCheckout;
      
      if (navigation) {
        if (user && isNewUser) {
          // Check if user came from checkout flow
          if (fromCheckout) {
            // Navigate to delivery options after completing onboarding from checkout
            navigation.navigate('deliveryoptionsstepone');
          } else {
            // Navigate to Home after completing regular onboarding
            navigation.navigate('Home');
          }
        } else {
          // Fallback to LoginAccountMobileNumber for other cases
          navigation.navigate('LoginAccountMobileNumber');
        }
      }
      if (onClose) {
        onClose();
      }
    });
  }, [navigation, onClose, slideAnim, opacityAnim, route?.params]);

  // Enhanced PanResponder with proper closing functionality
  const panResponder = useRef(
    PanResponder.create({
      // Allow gesture to start on any touch
      onStartShouldSetPanResponder: (evt, gestureState) => {
        console.log('Start gesture check:', gestureState);
        return true; // Always try to capture gestures
      },
      
      // Much more responsive gesture detection
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const isVerticalGesture = Math.abs(dy) > Math.abs(dx);
        const isDownwardGesture = dy > 2; // Very low threshold for immediate response
        const hasSufficientMovement = Math.abs(dy) > 1; // Any movement counts
        
        console.log('Move gesture check:', { 
          dy, 
          dx, 
          isVertical: isVerticalGesture, 
          isDownward: isDownwardGesture,
          sufficient: hasSufficientMovement,
          result: isVerticalGesture && isDownwardGesture && hasSufficientMovement
        });
        
        return isVerticalGesture && isDownwardGesture && hasSufficientMovement;
      },
      
      // Capture handlers to ensure gesture priority
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        console.log('Start capture check');
        return false; // Let other components handle if needed
      },
      
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const isVerticalGesture = Math.abs(dy) > Math.abs(dx);
        const isDownwardGesture = dy > 2;
        console.log('Move capture check:', { dy, dx, shouldCapture: isVerticalGesture && isDownwardGesture });
        return isVerticalGesture && isDownwardGesture; // Capture vertical downward gestures
      },
      
      // Gesture started
      onPanResponderGrant: (evt, gestureState) => {
        console.log('Gesture started!');
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
      
      // Follow finger movement
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        console.log('Moving:', dy);
        
        // Enhanced movement with elastic resistance
        if (dy > 0) {
          panY.setValue(dy);
        } else if (dy < 0) {
          const resistance = Math.max(0.1, 1 - Math.abs(dy) / 100);
          panY.setValue(dy * resistance);
        }
        
        // Dynamic backdrop opacity
        const dragProgress = Math.min(1, Math.abs(dy) / 150);
        const newOpacity = Math.max(0.4, 1 - (dragProgress * 0.4));
        backdropOpacity.setValue(newOpacity);
      },
      
      // Handle release
      onPanResponderRelease: (evt, gestureState) => {
        console.log('Gesture released:', gestureState.dy, gestureState.vy);
        panY.flattenOffset();
        setIsDragging(false);
        gestureTracker.isActive = false;
        
        const { dy, vy } = gestureState;
        
        // Clear dismissal logic - dismiss if dragged far or fast swipe
        const shouldDismiss = dy > 100 || (Math.abs(vy) > 0.8 && vy > 0);
        
        if (shouldDismiss) {
          console.log('Dismissing modal');
          handleDismiss();
        } else {
          console.log('Returning to position');
          // Snap back
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              tension: 300,
              friction: 30,
              useNativeDriver: false,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
      
      // Allow termination for better responsiveness
      onPanResponderTerminationRequest: () => true,
      
      // Handle termination gracefully
      onPanResponderTerminate: () => {
        setIsDragging(false);
        gestureTracker.isActive = false;
        
        // Snap back to original position
        Animated.parallel([
          Animated.spring(panY, {
            toValue: 0,
            tension: 300,
            friction: 30,
            useNativeDriver: false,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  const handleBackdropPress = useCallback(() => {
    // Dismiss modal when backdrop is pressed using advanced dismiss
    handleDismiss();
  }, [handleDismiss]);

  // Animation interpolations
  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0], // Start 300px below, end at normal position
    }),
    panY
  );

  const animatedModalStyle = {
    transform: [{ translateY }],
    opacity: opacityAnim,
  };

  const animatedBackdropStyle = {
    ...styles.modalOverlay,
    backgroundColor: backdropOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
    }),
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // We handle animation manually
      onRequestClose={handleDismiss} // Handle hardware back button
    >
      <Animated.View style={animatedBackdropStyle} pointerEvents="box-none">
        {/* Backdrop touch area - closes modal when pressed */}
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={handleBackdropPress}
        />
        
        {/* Modal content with gesture handling - remove TouchableWithoutFeedback */}
        <Animated.View 
          style={[styles.modalContainer, animatedModalStyle]}
          {...panResponder.panHandlers}
        >
            {/* Enhanced Swipe Handle Indicator - shows drag state */}
            <View style={[
              styles.swipeHandle, 
              isDragging && styles.swipeHandleActive
            ]} />
            
            {/* Header Icon */}
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIcon}>
                {/* Computer/Monitor Icon */}
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
                  isSelected && styles.preferenceOptionSelected,
                ]}
                onPress={() => handlePreferenceSelect(preference.id)}
              >
                <Text style={[
                  styles.preferenceIcon,
                  isSelected && styles.preferenceIconSelected,
                ]}>
                  {preference.icon}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Let's YORAA Button */}
        <TouchableOpacity 
          style={styles.letsYoraaButton} 
          onPress={handleLetsYoraa}
        >
          <Text style={styles.letsYoraaButtonText}>
            Let's YORAA
          </Text>
        </TouchableOpacity>
        </Animated.View>
    </Animated.View>
  </Modal>
);
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'flex-end', // Position at bottom for slide up effect
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    width: screenWidth,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: screenWidth * 1.6,
    maxHeight: screenWidth * 1.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 20,
    alignSelf: 'center',
  },
  swipeHandleActive: {
    backgroundColor: '#2196F3',
    width: 60,
    height: 5,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIconContainer: {
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  computerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    width: 28,
    height: 20,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: 2,
    position: 'relative',
  },
  stand: {
    width: 12,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 1,
    marginBottom: 1,
  },
  base: {
    width: 18,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  headerIconText: {
    fontSize: 24,
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    textAlign: 'center',
    marginBottom: 64,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  preferencesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  preferenceOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceOptionSelected: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F8F8',
    borderColor: '#D0D0D0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  preferenceIcon: {
    fontSize: 28,
    color: '#CCCCCC',
    fontWeight: '300',
  },
  preferenceIconSelected: {
    fontSize: 36,
    color: '#000000',
    fontWeight: '400',
  },
  letsYoraaButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    width: screenWidth - 80,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  letsYoraaButtonDisabled: {
    backgroundColor: '#E8E8E8',
    shadowOpacity: 0,
    elevation: 0,
  },
  letsYoraaButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  letsYoraaButtonTextDisabled: {
    color: '#AAAAAA',
  },
});

export default React.memo(PreferenceSelector);
