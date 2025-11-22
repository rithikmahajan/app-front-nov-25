import { Dimensions, Platform } from 'react-native';

/**
 * Device Detection Utility
 * Detects if the current device is a tablet/iPad
 */

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  
  // iPad detection:
  // - iOS: Check if it's iPad using Platform
  // - Android: Use screen dimensions (tablets are usually > 600dp)
  if (Platform.OS === 'ios') {
    return Platform.isPad || false;
  }
  
  // For Android, consider it a tablet if:
  // 1. Smallest dimension is >= 600dp (common tablet threshold)
  // 2. Aspect ratio is close to 4:3 or 16:10 (typical tablet ratios)
  const smallestDimension = Math.min(width, height);
  return smallestDimension >= 600 && aspectRatio < 2;
};

export const getDeviceType = () => {
  return isTablet() ? 'tablet' : 'phone';
};

export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};
