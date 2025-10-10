/**
 * Performance optimization hooks and utilities
 * These hooks help prevent unnecessary re-renders and optimize React Native performance
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { InteractionManager, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Optimized style hook that memoizes styles to prevent recreation on each render
 * @param {Function} styleCreator - Function that returns the styles object
 * @param {Array} dependencies - Dependencies array for style recreation
 */
export const useOptimizedStyles = (styleCreator, dependencies = []) => {
  return useMemo(() => styleCreator(), dependencies);
};

/**
 * Debounced callback hook to prevent excessive function calls
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} dependencies - Dependencies for the callback
 */
export const useDebouncedCallback = (callback, delay, dependencies) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, dependencies);
};

/**
 * Throttled callback hook to limit function call frequency
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Array} dependencies - Dependencies for the callback
 */
export const useThrottledCallback = (callback, limit, dependencies) => {
  const lastRan = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRan.current >= limit) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }, dependencies);
};

/**
 * Hook for delaying operations until after interactions are complete
 * Useful for heavy operations that shouldn't block UI interactions
 * @param {Function} callback - Function to run after interactions
 * @param {Array} dependencies - Dependencies for the callback
 */
export const useAfterInteractions = (callback, dependencies = []) => {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      callback();
    });

    return () => task.cancel();
  }, dependencies);
};

/**
 * Optimized animation hook with LayoutAnimation
 * @param {string} type - Animation type ('easeInEaseOut', 'linear', 'spring')
 * @param {number} duration - Animation duration in milliseconds
 */
export const useLayoutAnimation = (type = 'easeInEaseOut', duration = 300) => {
  return useCallback(() => {
    const animationConfig = {
      duration,
      create: {
        type: LayoutAnimation.Types[type],
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types[type],
      },
      delete: {
        type: LayoutAnimation.Types[type],
        property: LayoutAnimation.Properties.opacity,
      },
    };

    LayoutAnimation.configureNext(animationConfig);
  }, [type, duration]);
};

/**
 * Memoized event handlers to prevent unnecessary re-renders
 * @param {Object} handlers - Object containing event handler functions
 * @param {Array} dependencies - Dependencies for the handlers
 */
export const useEventHandlers = (handlers, dependencies = []) => {
  return useMemo(() => {
    const memoizedHandlers = {};
    Object.keys(handlers).forEach(key => {
      memoizedHandlers[key] = (...args) => handlers[key](...args);
    });
    return memoizedHandlers;
  }, dependencies);
};

/**
 * Optimized list rendering hook for FlatList performance
 * @param {Array} data - List data
 * @param {Function} keyExtractor - Function to extract unique keys
 * @param {number} getItemLayout - Function for getItemLayout optimization
 */
export const useOptimizedList = (data, keyExtractor, getItemLayout = null) => {
  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);
  
  const memoizedKeyExtractor = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : index.toString();
  }, [keyExtractor]);

  const memoizedGetItemLayout = useCallback((listData, index) => {
    if (!listData || !Array.isArray(listData) || index < 0) {
      return undefined;
    }
    return getItemLayout ? getItemLayout(listData, index) : undefined;
  }, [getItemLayout]);

  const optimizedProps = {
    data: memoizedData,
    keyExtractor: memoizedKeyExtractor,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 100,
    windowSize: 10,
  };

  // Only include getItemLayout if it's actually provided
  if (getItemLayout) {
    optimizedProps.getItemLayout = memoizedGetItemLayout;
  }

  return optimizedProps;
};

/**
 * Memory-optimized state hook that prevents memory leaks
 * @param {*} initialState - Initial state value
 */
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setOptimizedState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  return [state, setOptimizedState];
};

/**
 * Hook for creating stable style objects that don't change on re-renders
 * @param {Object} styles - Static styles object
 */
export const useStableStyles = (styles) => {
  return useMemo(() => styles, []);
};

export default {
  useOptimizedStyles,
  useDebouncedCallback,
  useThrottledCallback,
  useAfterInteractions,
  useLayoutAnimation,
  useEventHandlers,
  useOptimizedList,
  useOptimizedState,
  useStableStyles,
};
