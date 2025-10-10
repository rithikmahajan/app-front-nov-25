/**
 * Image optimization utilities for React Native
 * Provides optimized image loading, caching, and performance enhancements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Image, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Hook for optimized image loading with fallbacks
 * @param {Object} config - Image configuration
 */
export const useOptimizedImage = (config) => {
  const {
    source,
    fallbackSource,
    width,
    height,
    quality = 0.8,
    priority = 'normal',
  } = config;

  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const optimizedSource = useMemo(() => {
    if (loadError && fallbackSource) {
      return fallbackSource;
    }
    return source;
  }, [source, fallbackSource, loadError]);

  const handleLoad = useCallback((event) => {
    setIsLoading(false);
    if (event?.nativeEvent) {
      const { width: imgWidth, height: imgHeight } = event.nativeEvent;
      setDimensions({ width: imgWidth, height: imgHeight });
    }
  }, []);

  const handleError = useCallback(() => {
    setLoadError(true);
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setLoadError(false);
  }, []);

  // Calculate optimal dimensions
  const optimalDimensions = useMemo(() => {
    if (width && height) {
      return { width, height };
    }

    if (dimensions.width && dimensions.height) {
      const aspectRatio = dimensions.width / dimensions.height;
      
      if (width) {
        return { width, height: width / aspectRatio };
      }
      
      if (height) {
        return { width: height * aspectRatio, height };
      }
      
      // Fit to screen if no dimensions specified
      const maxWidth = screenWidth * 0.9;
      const maxHeight = screenHeight * 0.5;
      
      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
        return {
          width: dimensions.width * scale,
          height: dimensions.height * scale,
        };
      }
    }

    return { width: width || 200, height: height || 200 };
  }, [width, height, dimensions]);

  return {
    source: optimizedSource,
    style: optimalDimensions,
    onLoad: handleLoad,
    onError: handleError,
    onLoadStart: handleLoadStart,
    isLoading,
    hasError: loadError,
    resizeMode: 'contain',
    ...Platform.select({
      ios: {
        priority,
      },
      android: {
        fadeDuration: 300,
      },
    }),
  };
};

/**
 * Hook for lazy image loading
 * @param {string} source - Image source
 * @param {boolean} visible - Whether image is visible
 */
export const useLazyImage = (source, visible = true) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (visible && !shouldLoad) {
      // Delay loading slightly to improve performance
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [visible, shouldLoad]);

  return {
    shouldLoad: shouldLoad && visible,
    source: shouldLoad ? source : null,
  };
};

/**
 * Preload images for better performance
 * @param {Array} imageUris - Array of image URIs to preload
 */
export const preloadImages = async (imageUris) => {
  const promises = imageUris.map(uri => {
    return new Promise((resolve, reject) => {
      Image.prefetch(uri)
        .then(() => resolve(uri))
        .catch(() => reject(uri));
    });
  });

  try {
    await Promise.allSettled(promises);
  } catch (error) {
    // Silent fail for preloading
  }
};

/**
 * Get optimal image size based on device
 * @param {Object} originalSize - Original image dimensions
 * @param {Object} containerSize - Container dimensions
 */
export const getOptimalImageSize = (originalSize, containerSize = {}) => {
  const { width: origWidth, height: origHeight } = originalSize;
  const { width: containerWidth = screenWidth, height: containerHeight = screenHeight } = containerSize;

  const aspectRatio = origWidth / origHeight;
  
  // Calculate optimal size maintaining aspect ratio
  let optimalWidth = containerWidth;
  let optimalHeight = containerWidth / aspectRatio;

  if (optimalHeight > containerHeight) {
    optimalHeight = containerHeight;
    optimalWidth = containerHeight * aspectRatio;
  }

  // Ensure minimum size for visibility
  const minSize = 50;
  if (optimalWidth < minSize) {
    optimalWidth = minSize;
    optimalHeight = minSize / aspectRatio;
  }
  if (optimalHeight < minSize) {
    optimalHeight = minSize;
    optimalWidth = minSize * aspectRatio;
  }

  return {
    width: Math.round(optimalWidth),
    height: Math.round(optimalHeight),
  };
};

/**
 * Image cache utilities
 */
export const ImageCache = {
  /**
   * Clear image cache
   */
  clear: async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS doesn't have a direct cache clear method
        // The cache is managed automatically
        return true;
      } else {
        // Android implementation would require react-native-fast-image or similar
        return true;
      }
    } catch (error) {
      return false;
    }
  },

  /**
   * Get cache size (estimate)
   */
  getSize: async () => {
    // This is an estimate - actual implementation would require native modules
    return Promise.resolve(0);
  },

  /**
   * Check if image is cached
   */
  isImageCached: async (uri) => {
    try {
      // For now, always return false - would need native implementation
      return false;
    } catch (error) {
      return false;
    }
  },
};

/**
 * Image format utilities
 */
export const ImageFormats = {
  /**
   * Get optimal format for platform
   */
  getOptimalFormat: () => {
    return Platform.select({
      ios: 'webp', // iOS supports WebP
      android: 'webp', // Android supports WebP
      default: 'jpeg',
    });
  },

  /**
   * Get compression quality based on use case
   */
  getQuality: (useCase = 'normal') => {
    const qualities = {
      thumbnail: 0.3,
      normal: 0.7,
      high: 0.9,
      lossless: 1.0,
    };

    return qualities[useCase] || qualities.normal;
  },
};

/**
 * Performance-optimized Image component props
 */
export const getOptimizedImageProps = (source, options = {}) => {
  const {
    width,
    height,
    resizeMode = 'cover',
    priority = 'normal',
    quality = 0.8,
  } = options;

  return {
    source,
    style: { width, height },
    resizeMode,
    ...Platform.select({
      ios: {
        priority,
      },
      android: {
        fadeDuration: 200,
      },
    }),
    // Performance optimizations
    accessible: true,
    accessibilityRole: 'image',
    shouldRasterizeIOS: true,
    renderToHardwareTextureAndroid: true,
  };
};

export default {
  useOptimizedImage,
  useLazyImage,
  preloadImages,
  getOptimalImageSize,
  ImageCache,
  ImageFormats,
  getOptimizedImageProps,
};
