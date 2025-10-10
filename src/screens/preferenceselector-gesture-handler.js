import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Modal,
  Easing,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const PreferenceSelectorWithGestureHandler = ({ navigation, visible = true, onClose }) => {
  const [selectedPreference, setSelectedPreference] = useState('female');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const panRef = useRef();

  // Animation effect when modal becomes visible
  useEffect(() => {
    if (visible) {
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
      ]).start();
    } else {
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim]);

  const preferences = useMemo(() => [
    { id: 'male', icon: '♂', label: 'Male' },
    { id: 'female', icon: '♀', label: 'Female' },  
    { id: 'unisex', icon: '⚥', label: 'Unisex' },
  ], []);

  const handlePreferenceSelect = useCallback((preferenceId) => {
    setSelectedPreference(preferenceId);
  }, []);

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
    ]).start(() => {
      if (navigation) {
        navigation.navigate('Home');
      }
      if (onClose) {
        onClose();
      }
    });
  }, [navigation, onClose, slideAnim, opacityAnim]);

  // Modern gesture handler using react-native-gesture-handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = useCallback((event) => {
    const { state, translationY, velocityY } = event.nativeEvent;

    if (state === State.END) {
      const dismissThreshold = 120;
      const velocityThreshold = 700;

      const shouldDismiss = 
        translationY > dismissThreshold || 
        (translationY > 50 && velocityY > velocityThreshold);

      if (shouldDismiss) {
        // Dismiss modal
        Animated.parallel([
          Animated.timing(panY, {
            toValue: 400,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]).start(() => {
          panY.setValue(0);
          slideAnim.setValue(0);
          opacityAnim.setValue(0);
          
          if (onClose) {
            onClose();
          }
          
          if (navigation && navigation.goBack) {
            navigation.goBack();
          }
        });
      } else {
        // Snap back
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 120,
          friction: 9,
          overshootClamping: true,
        }).start();
      }
    }
  }, [panY, opacityAnim, slideAnim, onClose, navigation]);

  const handleBackdropPress = useCallback(() => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: 300,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      panY.setValue(0);
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
      
      if (onClose) {
        onClose();
      }
      
      if (navigation && navigation.goBack) {
        navigation.goBack();
      }
    });
  }, [panY, opacityAnim, slideAnim, onClose, navigation]);

  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    }),
    panY
  );

  const animatedModalStyle = {
    transform: [{ translateY }],
    opacity: opacityAnim,
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        <TouchableWithoutFeedback>
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            activeOffsetY={15}
            failOffsetX={[-20, 20]}
            shouldCancelWhenOutside={false}
          >
            <Animated.View 
              style={[styles.modalContainer, animatedModalStyle]}
            >
              {/* Swipe Handle Indicator */}
              <View style={styles.swipeHandle} />
              
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

              <Text style={styles.title}>Pick your preference!</Text>
              
              <Text style={styles.subtitle}>
                Select your personalised shopping experience
              </Text>

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

              <TouchableOpacity 
                style={styles.letsYoraaButton} 
                onPress={handleLetsYoraa}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Let's Yoraa!</Text>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    minHeight: 400,
    maxHeight: '80%',
  },
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
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
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreferenceSelectorWithGestureHandler;
