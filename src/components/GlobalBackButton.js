import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import BackIcon from '../assets/icons/BackIcon';
import { BorderRadius } from '../constants';

const GlobalBackButton = ({ 
  navigation, 
  style = {}, 
  iconColor = '#000000', 
  iconSize = 24,
  backgroundColor = 'transparent',
  onPress,
  animateOnPress = true,
  animationDuration = 300,
  customEasing = Easing.out(Easing.back(1.7))
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (animateOnPress) {
      // Scale down animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Handle navigation
    if (onPress) {
      onPress();
    } else if (navigation && navigation.goBack) {
      if (animationDuration > 0) {
        setTimeout(() => {
          navigation.goBack();
        }, animationDuration);
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor },
          style
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <BackIcon color={iconColor} size={iconSize} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
  },
});

export default GlobalBackButton;
