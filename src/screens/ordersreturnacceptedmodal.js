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
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const OrdersReturnAcceptedModal = ({ navigation, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleDone = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Orders');
    });
  };

  const handleBackdropPress = () => {
    handleDone();
  };

  const iconSize = isTablet ? 72 : isSmallDevice ? 48 : 54;
  const iconBackgroundSize = isTablet ? 108 : isSmallDevice ? 72 : 81;

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
            <View style={styles.iconContainer}>
              <View style={[styles.iconBackground, { 
                width: iconBackgroundSize, 
                height: iconBackgroundSize,
                borderRadius: iconBackgroundSize / 2 
              }]}>
                <Svg width={iconSize} height={iconSize} viewBox="0 0 54 54" fill="none">
                  <G id="Check">
                    <Circle
                      cx="27"
                      cy="27"
                      r="27"
                      fill="#508A7B"
                    />
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

            <View style={styles.contentContainer}>
              <Text style={styles.title}>Return has been accepted !</Text>
              
              <Text style={styles.description}>
                We appreciated your feedback.{'\n'}
                We'll use your feedback to improve{'\n'}
                your experience.
              </Text>
            </View>

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
    width: isTablet ? wp(50) : wp(87),
    maxWidth: isTablet ? 500 : 380,
    minHeight: isTablet ? hp(45) : hp(40),
    paddingVertical: isTablet ? hp(5) : isSmallDevice ? hp(3.5) : hp(4.5),
    paddingHorizontal: isTablet ? wp(6) : wp(5.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? hp(3.5) : isSmallDevice ? hp(2.5) : hp(3),
  },
  iconBackground: {
    backgroundColor: 'rgba(80, 138, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? hp(4.5) : isSmallDevice ? hp(3) : hp(4),
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(2),
  },
  title: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#43484B',
    textAlign: 'center',
    marginBottom: isTablet ? hp(2.2) : isSmallDevice ? hp(1.5) : hp(1.8),
    lineHeight: isTablet ? fs(28) : isSmallDevice ? fs(20) : fs(22.5),
  },
  description: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#6E768A',
    textAlign: 'center',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
    paddingHorizontal: wp(2),
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: isTablet ? hp(2) : isSmallDevice ? hp(1.4) : hp(1.8),
    paddingHorizontal: isTablet ? wp(15) : isSmallDevice ? wp(10) : wp(13.5),
    alignItems: 'center',
    justifyContent: 'center',
    width: isTablet ? wp(40) : isSmallDevice ? wp(70) : wp(62),
    maxWidth: isTablet ? 400 : 280,
    minHeight: isTablet ? hp(6.5) : hp(6),
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(20) : fs(22.5),
  },
});

export default OrdersReturnAcceptedModal;
