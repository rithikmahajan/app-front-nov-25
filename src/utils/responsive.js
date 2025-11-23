/**
 * Responsive Design Utilities
 * 
 * Provides helper functions and constants for creating responsive layouts
 * that work seamlessly across all device sizes from small phones to large tablets.
 * 
 * Device Breakpoints:
 * - Small Phone: < 375px (iPhone SE, small Android)
 * - Phone: < 768px (All phones)
 * - Small Tablet: 768px - 1023px (iPad Mini, small tablets)
 * - Tablet: >= 768px (All tablets)
 * - Large Tablet: >= 1024px (iPad Pro, large tablets)
 * 
 * Usage:
 * ```javascript
 * import { getResponsiveValue, DeviceSize, getResponsiveGrid } from '../utils/responsive';
 * 
 * const padding = getResponsiveValue(16, 24, 32); // phone, tablet, largeTablet
 * const { numColumns, itemWidth } = getResponsiveGrid();
 * ```
 */

import React from 'react';
import { Dimensions, Platform } from 'react-native';

/**
 * Get current screen dimensions
 * Note: Use Dimensions.get('window') for most cases, 'screen' includes status bar
 */
export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

/**
 * Width percentage - converts percentage to actual width
 * @param {string} widthPercent - Width percentage (e.g., '50%')
 * @returns {number} Actual width in pixels
 */
export const wp = (widthPercent) => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return (SCREEN_WIDTH * elemWidth) / 100;
};

/**
 * Height percentage - converts percentage to actual height
 * @param {string} heightPercent - Height percentage (e.g., '50%')
 * @returns {number} Actual height in pixels
 */
export const hp = (heightPercent) => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return (SCREEN_HEIGHT * elemHeight) / 100;
};

/**
 * Font size scaler - scales font based on device width
 * @param {number} size - Base font size
 * @returns {number} Scaled font size
 */
export const fs = (size) => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone X width
  const newSize = size * scale;
  return Math.round(newSize);
};

/**
 * Device size detection
 */
export const DeviceSize = (() => {
  const { width } = getScreenDimensions();
  
  return {
    width,
    isSmallPhone: width < 375,
    isPhone: width < 768,
    isSmallTablet: width >= 768 && width < 1024,
    isTablet: width >= 768,
    isLargeTablet: width >= 1024,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
})();

/**
 * Simple device detection helpers
 */
export const device = DeviceSize;
export const isTablet = DeviceSize.isTablet;
export const isSmallDevice = DeviceSize.isSmallPhone;

/**
 * Get responsive value based on device size
 * 
 * @param {number|string} phoneValue - Value for phones (< 768px)
 * @param {number|string} tabletValue - Value for small tablets (768-1023px)
 * @param {number|string} largeTabletValue - Value for large tablets (>= 1024px)
 * @returns {number|string} The appropriate value for current device
 * 
 * @example
 * const fontSize = getResponsiveValue(16, 18, 20);
 * const padding = getResponsiveValue(16, 24, 32);
 */
export const getResponsiveValue = (phoneValue, tabletValue, largeTabletValue) => {
  if (DeviceSize.isLargeTablet && largeTabletValue !== undefined) {
    return largeTabletValue;
  }
  if (DeviceSize.isTablet && tabletValue !== undefined) {
    return tabletValue;
  }
  return phoneValue;
};

/**
 * Get responsive font size with scaling
 * 
 * @param {number} baseSize - Base font size for phones
 * @returns {number} Scaled font size for current device
 * 
 * @example
 * fontSize: getResponsiveFontSize(16) // 16 on phone, ~18 on tablet, ~21 on large tablet
 */
export const getResponsiveFontSize = (baseSize) => {
  const scale = DeviceSize.isLargeTablet ? 1.3 : DeviceSize.isTablet ? 1.15 : 1;
  return Math.round(baseSize * scale);
};

/**
 * Get responsive spacing value
 * 
 * @param {number} baseSpacing - Base spacing for phones
 * @returns {number} Scaled spacing for current device
 * 
 * @example
 * padding: getResponsiveSpacing(16) // 16 on phone, ~24 on tablet
 */
export const getResponsiveSpacing = (baseSpacing) => {
  const scale = DeviceSize.isLargeTablet ? 1.5 : DeviceSize.isTablet ? 1.25 : 1;
  return Math.round(baseSpacing * scale);
};

/**
 * Get responsive grid configuration for FlatList/Grid layouts
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.phoneColumns - Number of columns on phones (default: 2)
 * @param {number} options.tabletColumns - Number of columns on small tablets (default: 3)
 * @param {number} options.largeTabletColumns - Number of columns on large tablets (default: 4)
 * @param {number} options.itemSpacing - Base spacing between items (default: 12)
 * @param {number} options.horizontalPadding - Base horizontal padding (default: 16)
 * @returns {Object} Grid configuration with numColumns, itemWidth, itemSpacing, horizontalPadding
 * 
 * @example
 * const { numColumns, itemWidth, itemSpacing } = getResponsiveGrid();
 * 
 * <FlatList
 *   numColumns={numColumns}
 *   key={`grid-${numColumns}`}
 *   columnWrapperStyle={{ gap: itemSpacing }}
 *   renderItem={({ item }) => (
 *     <View style={{ width: itemWidth }}>
 *       {/* Item content *\/}
 *     </View>
 *   )}
 * />
 */
export const getResponsiveGrid = (options = {}) => {
  const {
    phoneColumns = 2,
    tabletColumns = 3,
    largeTabletColumns = 4,
    itemSpacing: baseItemSpacing = 12,
    horizontalPadding: baseHorizontalPadding = 16,
  } = options;

  const { width: screenWidth } = getScreenDimensions();
  
  let numColumns, itemSpacing, horizontalPadding;
  
  if (DeviceSize.isLargeTablet) {
    numColumns = largeTabletColumns;
    itemSpacing = baseItemSpacing * 1.5;
    horizontalPadding = baseHorizontalPadding * 1.5;
  } else if (DeviceSize.isTablet) {
    numColumns = tabletColumns;
    itemSpacing = baseItemSpacing * 1.25;
    horizontalPadding = baseHorizontalPadding * 1.25;
  } else {
    numColumns = phoneColumns;
    itemSpacing = baseItemSpacing;
    horizontalPadding = baseHorizontalPadding;
  }
  
  const totalSpacing = horizontalPadding * 2 + itemSpacing * (numColumns - 1);
  const itemWidth = (screenWidth - totalSpacing) / numColumns;
  
  return {
    numColumns,
    itemWidth: Math.floor(itemWidth),
    itemSpacing,
    horizontalPadding,
    screenWidth,
  };
};

/**
 * Get responsive touch target size
 * Ensures minimum accessibility standards (44pt minimum on iOS, 48dp on Android)
 * 
 * @param {number} baseSize - Base size for phones (default: 44)
 * @returns {number} Appropriate touch target size
 * 
 * @example
 * const buttonSize = getResponsiveTouchTarget(44); // 44 on phone, 56 on tablet
 */
export const getResponsiveTouchTarget = (baseSize = 44) => {
  const minSize = Platform.OS === 'android' ? 48 : 44;
  const size = getResponsiveValue(baseSize, baseSize * 1.3, baseSize * 1.5);
  return Math.max(size, minSize);
};

/**
 * Get responsive icon size
 * 
 * @param {number} baseSize - Base icon size for phones
 * @returns {number} Scaled icon size
 * 
 * @example
 * <Icon size={getResponsiveIconSize(24)} />
 */
export const getResponsiveIconSize = (baseSize) => {
  return getResponsiveValue(baseSize, baseSize * 1.2, baseSize * 1.4);
};

/**
 * Get responsive modal dimensions
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.phoneWidthPercent - Width percentage on phones (0-1, default: 0.85)
 * @param {number} options.tabletMaxWidth - Max width on tablets in pixels (default: 600)
 * @param {number} options.heightPercent - Height percentage (0-1, default: 0.9)
 * @returns {Object} Modal dimensions with width, maxWidth, height, maxHeight
 * 
 * @example
 * const modalDimensions = getResponsiveModalDimensions();
 * <View style={[styles.modal, modalDimensions]}>
 */
export const getResponsiveModalDimensions = (options = {}) => {
  const {
    phoneWidthPercent = 0.85,
    tabletMaxWidth = 600,
    heightPercent = 0.9,
  } = options;

  const { width: screenWidth, height: screenHeight } = getScreenDimensions();
  
  if (DeviceSize.isTablet) {
    return {
      width: '90%',
      maxWidth: tabletMaxWidth,
      height: screenHeight * heightPercent,
      maxHeight: screenHeight * 0.95,
    };
  }
  
  return {
    width: screenWidth * phoneWidthPercent,
    height: screenHeight * heightPercent,
    maxHeight: screenHeight * 0.95,
  };
};

/**
 * Get responsive container padding
 * 
 * @returns {Object} Padding values for horizontal and vertical
 * 
 * @example
 * const containerPadding = getResponsiveContainerPadding();
 * <View style={[styles.container, containerPadding]}>
 */
export const getResponsiveContainerPadding = () => {
  return {
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(16),
  };
};

/**
 * Get responsive image dimensions maintaining aspect ratio
 * 
 * @param {number} aspectRatio - Aspect ratio (width/height)
 * @param {Object} options - Configuration options
 * @param {number} options.phoneWidthPercent - Width percentage of screen on phones (default: 1.0)
 * @param {number} options.tabletMaxWidth - Max width on tablets (default: 500)
 * @returns {Object} Image dimensions with width and height
 * 
 * @example
 * const imageDimensions = getResponsiveImageDimensions(1.5); // 3:2 aspect ratio
 */
export const getResponsiveImageDimensions = (aspectRatio = 1, options = {}) => {
  const {
    phoneWidthPercent = 1.0,
    tabletMaxWidth = 500,
  } = options;

  const { width: screenWidth } = getScreenDimensions();
  
  let imageWidth;
  if (DeviceSize.isTablet) {
    imageWidth = Math.min(screenWidth * 0.8, tabletMaxWidth);
  } else {
    imageWidth = screenWidth * phoneWidthPercent;
  }
  
  const imageHeight = imageWidth / aspectRatio;
  
  return {
    width: Math.floor(imageWidth),
    height: Math.floor(imageHeight),
  };
};

/**
 * Check if device is in landscape orientation
 * 
 * @returns {boolean} True if landscape
 */
export const isLandscape = () => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

/**
 * Get responsive value with custom breakpoints
 * 
 * @param {Array} breakpoints - Array of [minWidth, value] pairs
 * @param {any} defaultValue - Default value if no breakpoint matches
 * @returns {any} Matched value
 * 
 * @example
 * const columns = getResponsiveValueByBreakpoint([
 *   [1200, 5],
 *   [1024, 4],
 *   [768, 3],
 *   [0, 2]
 * ]);
 */
export const getResponsiveValueByBreakpoint = (breakpoints, defaultValue) => {
  const { width } = getScreenDimensions();
  
  // Sort breakpoints in descending order
  const sortedBreakpoints = [...breakpoints].sort((a, b) => b[0] - a[0]);
  
  for (const [minWidth, value] of sortedBreakpoints) {
    if (width >= minWidth) {
      return value;
    }
  }
  
  return defaultValue;
};

/**
 * Responsive spacing scale
 * Use these instead of hard-coded values
 */
export const ResponsiveSpacing = {
  xs: getResponsiveSpacing(4),
  sm: getResponsiveSpacing(8),
  md: getResponsiveSpacing(16),
  lg: getResponsiveSpacing(24),
  xl: getResponsiveSpacing(32),
  xxl: getResponsiveSpacing(48),
};

/**
 * Responsive font sizes
 * Use these for consistent typography across devices
 */
export const ResponsiveFontSizes = {
  tiny: getResponsiveFontSize(10),
  small: getResponsiveFontSize(12),
  body: getResponsiveFontSize(14),
  bodyLarge: getResponsiveFontSize(16),
  h6: getResponsiveFontSize(18),
  h5: getResponsiveFontSize(20),
  h4: getResponsiveFontSize(22),
  h3: getResponsiveFontSize(24),
  h2: getResponsiveFontSize(28),
  h1: getResponsiveFontSize(32),
  display: getResponsiveFontSize(40),
};

/**
 * Create responsive StyleSheet
 * Helper to create styles with responsive values
 * 
 * @param {Function} stylesFunction - Function that receives responsive helpers and returns styles
 * @returns {Object} StyleSheet styles
 * 
 * @example
 * const styles = createResponsiveStyles((r) => ({
 *   container: {
 *     padding: r.spacing.md,
 *     fontSize: r.fonts.body,
 *   },
 *   button: {
 *     width: r.value(200, 250, 300),
 *     height: r.touchTarget(44),
 *   }
 * }));
 */
export const createResponsiveStyles = (stylesFunction) => {
  const helpers = {
    value: getResponsiveValue,
    font: getResponsiveFontSize,
    spacing: ResponsiveSpacing,
    fonts: ResponsiveFontSizes,
    touchTarget: getResponsiveTouchTarget,
    icon: getResponsiveIconSize,
    device: DeviceSize,
  };
  
  return stylesFunction(helpers);
};

/**
 * Hook for responsive values that update on dimension changes
 * Note: Use cautiously as it re-renders on orientation change
 * 
 * @returns {Object} Current responsive helpers
 * 
 * @example
 * const { value, device } = useResponsive();
 * const padding = value(16, 24, 32);
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = React.useState(getScreenDimensions());
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return {
    dimensions,
    value: getResponsiveValue,
    font: getResponsiveFontSize,
    spacing: ResponsiveSpacing,
    fonts: ResponsiveFontSizes,
    touchTarget: getResponsiveTouchTarget,
    icon: getResponsiveIconSize,
    device: DeviceSize,
    grid: getResponsiveGrid,
    modal: getResponsiveModalDimensions,
    image: getResponsiveImageDimensions,
  };
};

export default {
  DeviceSize,
  getResponsiveValue,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveGrid,
  getResponsiveTouchTarget,
  getResponsiveIconSize,
  getResponsiveModalDimensions,
  getResponsiveContainerPadding,
  getResponsiveImageDimensions,
  getResponsiveValueByBreakpoint,
  isLandscape,
  ResponsiveSpacing,
  ResponsiveFontSizes,
  createResponsiveStyles,
  useResponsive,
};
