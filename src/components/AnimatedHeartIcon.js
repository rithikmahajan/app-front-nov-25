import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import HeartIcon from '../assets/icons/HeartIcon';

const AnimatedHeartIcon = ({
  isFavorite = false,
  onPress,
  size = 21,
  style,
  containerStyle,
  animationDuration = 300,
  scaleAnimation = true,
  colorTransition = true,
  unfilledColor = '#000000',
  filledColor = '#FF0000',
  disabled = false,
  ...props
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  
  // Animation when favorite status changes
  useEffect(() => {
    if (scaleAnimation) {
      // Scale up then down animation (heart pop effect)
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (colorTransition) {
      // Opacity pulse for color transition
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: animationDuration / 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: (animationDuration * 2) / 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFavorite, scaleAnimation, colorTransition, animationDuration, scaleValue, opacityValue]);

  const handlePress = () => {
    if (disabled) return;
    
    // Trigger press animation immediately for responsiveness
    if (scaleAnimation) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (onPress) {
      onPress();
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[containerStyle]}
      activeOpacity={0.7}
    >
      <Animated.View style={[animatedStyle, style]}>
        {isFavorite ? (
          <HeartIcon
            size={size}
            color={filledColor}
            filled={true}
            {...props}
          />
        ) : (
          <HeartIcon
            size={size}
            color={unfilledColor}
            filled={false}
            {...props}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedHeartIcon;
