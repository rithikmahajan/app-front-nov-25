import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

const OrdersReturnAcceptedModal = ({ navigation, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate modal fade in with 250ms duration, ease out (dissolve)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
      // Ease out animation
    }).start();
  }, [fadeAnim]);

  const handleDone = () => {
    // Animate modal fade out before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to orders.js
      navigation.navigate('Orders');
    });
  };

  const handleBackdropPress = () => {
    // Allow closing modal by tapping backdrop
    handleDone();
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      onRequestClose={handleDone}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }]
              }
            ]}
          >
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
                  <G id="Check">
                    {/* Main green circle */}
                    <Circle
                      cx="27"
                      cy="27"
                      r="27"
                      fill="#508A7B"
                    />
                    {/* White checkmark */}
                    <Path
                      clipRule="evenodd"
                      d="M40.7878 17.54C41.4008 18.1546 41.4008 19.1512 40.7878 19.7648L23.5258 37.0732C22.9128 37.6878 21.9198 37.6878 21.3068 37.0732L13.4597 29.2056C12.8468 28.591 12.8468 27.5953 13.4597 26.9807C14.0727 26.3661 15.0668 26.3661 15.6788 26.9807L22.4157 33.7355L38.5688 17.54C39.1818 16.9253 40.1758 16.9253 40.7878 17.54Z"
                      fill="white"
                      fillRule="evenodd"
                    />
                  </G>
                </Svg>
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title}>Return has been accepted !</Text>
              
              {/* Description */}
              <Text style={styles.description}>
                We appreciated your feedback.{'\n'}
                We'll use your feedback to improve{'\n'}
                your experience.
              </Text>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13.47,
    width: 327,
    minHeight: 320,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBackground: {
    width: 81,
    height: 81,
    borderRadius: 40.5,
    backgroundColor: 'rgba(80, 138, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#43484B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22.5,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#6E768A',
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    width: 234,
    height: 48,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 22.5,
  },
});

export default OrdersReturnAcceptedModal;
