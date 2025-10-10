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
} from 'react-native';
import {
  PanGestureHandler,
  State,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

const { height: screenHeight } = Dimensions.get('window');

const ModernGestureBottomSheet = ({ navigation, visible = true, onClose }) => {
  const [selectedPreference, setSelectedPreference] = useState('female');
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Gesture handler refs
  const panRef = useRef();
  
  // Sheet configuration
  const SHEET_MIN_HEIGHT = 400;
  const SHEET_MAX_HEIGHT = screenHeight * 0.9;
  const DISMISS_THRESHOLD = 120;
  const VELOCITY_THRESHOLD = 800;

  // Animation effect when modal becomes visible
  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      
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

  // Dismiss sheet
  const dismissSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: SHEET_MAX_HEIGHT,
        duration: 250,
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
  }, [panY, opacityAnim, backdropOpacity, slideAnim, onClose, navigation, SHEET_MAX_HEIGHT]);

  // Snap back to original position
  const snapBack = useCallback(() => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: false,
      tension: 120,
      friction: 9,
      overshootClamping: true,
    }).start(() => {
      setIsDragging(false);
    });
  }, [panY]);

  // Modern gesture event handler using react-native-gesture-handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        
        // Update backdrop opacity during drag
        const dragProgress = Math.max(0, Math.min(1, translationY / DISMISS_THRESHOLD));
        const newBackdropOpacity = 1 - (dragProgress * 0.4);
        backdropOpacity.setValue(newBackdropOpacity);
        
        // Set dragging state
        if (Math.abs(translationY) > 5) {
          setIsDragging(true);
        }
      }
    }
  );

  // Handle gesture state changes
  const onHandlerStateChange = useCallback((event) => {
    const { state, translationY, velocityY } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsDragging(true);
    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      const shouldDismiss = 
        translationY > DISMISS_THRESHOLD || 
        (translationY > 50 && velocityY > VELOCITY_THRESHOLD);

      if (shouldDismiss) {
        dismissSheet();
      } else {
        snapBack();
      }
    }
  }, [DISMISS_THRESHOLD, VELOCITY_THRESHOLD, dismissSheet, snapBack]);

  const handleLetsYoraa = useCallback(() => {
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
    dismissSheet();
  }, [dismissSheet]);

  // Enhanced animation interpolations
  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SHEET_MIN_HEIGHT, 0],
    }),
    panY.interpolate({
      inputRange: [-100, 0, SHEET_MAX_HEIGHT],
      outputRange: [-20, 0, SHEET_MAX_HEIGHT], // Add resistance at top
      extrapolate: 'clamp',
    })
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
    opacity: isDragging ? 1 : 0.6,
    transform: [{
      scaleX: isDragging ? 1.3 : 1,
    }],
    backgroundColor: isDragging ? '#999' : '#E0E0E0',
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
        
        {/* Bottom sheet with modern gesture handler */}
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={10}
          failOffsetX={[-30, 30]}
          shouldCancelWhenOutside={false}
          enableTrackpadTwoFingerGesture={false}
        >
          <Animated.View style={[styles.bottomSheet, animatedModalStyle]}>
            {/* Enhanced swipe handle with animation */}
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
                    disabled={isDragging}
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
          </Animated.View>
        </PanGestureHandler>
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
    bottom: 400,
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
});

// Export wrapped with gestureHandlerRootHOC for compatibility
export default gestureHandlerRootHOC(ModernGestureBottomSheet);
