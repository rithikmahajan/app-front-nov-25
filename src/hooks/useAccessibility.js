/**
 * Accessibility utilities and hooks for React Native
 * Provides comprehensive accessibility support following WCAG guidelines
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to generate comprehensive accessibility props
 * @param {Object} config - Accessibility configuration
 */
export const useAccessibility = (config) => {
  const {
    label,
    hint,
    role = 'button',
    state = {},
    actions = [],
    value,
    liveRegion,
    importantForAccessibility = 'yes',
  } = config;

  return useMemo(() => {
    const props = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
      importantForAccessibility,
    };

    // Add state information
    if (Object.keys(state).length > 0) {
      props.accessibilityState = state;
    }

    // Add value for inputs and sliders
    if (value !== undefined) {
      props.accessibilityValue = typeof value === 'object' ? value : { text: String(value) };
    }

    // Add custom actions
    if (actions.length > 0) {
      props.accessibilityActions = actions;
    }

    // Add live region for dynamic content
    if (liveRegion) {
      props.accessibilityLiveRegion = liveRegion;
    }

    return props;
  }, [label, hint, role, state, actions, value, liveRegion, importantForAccessibility]);
};

/**
 * Hook for form field accessibility
 * @param {Object} config - Form field configuration
 */
export const useFormAccessibility = (config) => {
  const {
    label,
    required = false,
    invalid = false,
    errorMessage,
    helpText,
    value,
  } = config;

  return useAccessibility({
    label: `${label}${required ? ', required' : ''}`,
    hint: invalid && errorMessage ? errorMessage : helpText,
    role: 'none', // Let the TextInput handle its own role
    state: {
      required,
      invalid,
    },
    value: value ? { text: String(value) } : undefined,
    liveRegion: invalid ? 'assertive' : undefined,
  });
};

/**
 * Hook for button accessibility with state management
 * @param {Object} config - Button configuration
 */
export const useButtonAccessibility = (config) => {
  const {
    label,
    disabled = false,
    loading = false,
    pressed = false,
    expanded = false,
    onPress,
  } = config;

  const accessibilityProps = useAccessibility({
    label: loading ? `${label}, loading` : label,
    hint: disabled ? 'Button is disabled' : undefined,
    role: 'button',
    state: {
      disabled,
      busy: loading,
      pressed,
      expanded,
    },
  });

  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  return {
    ...accessibilityProps,
    onPress: handlePress,
  };
};

/**
 * Hook for navigation accessibility
 * @param {Object} config - Navigation configuration
 */
export const useNavigationAccessibility = (config) => {
  const {
    label,
    currentPage,
    totalPages,
    isBack = false,
  } = config;

  return useAccessibility({
    label: isBack ? `Go back to ${label}` : `Navigate to ${label}`,
    hint: totalPages ? `Page ${currentPage} of ${totalPages}` : undefined,
    role: 'button',
  });
};

/**
 * Hook for list item accessibility
 * @param {Object} config - List item configuration
 */
export const useListItemAccessibility = (config) => {
  const {
    label,
    position,
    totalItems,
    selected = false,
    onSelect,
  } = config;

  return useAccessibility({
    label: `${label}, ${position} of ${totalItems}`,
    hint: selected ? 'Selected' : 'Double tap to select',
    role: 'button',
    state: {
      selected,
    },
    actions: onSelect ? [{ name: 'activate', label: 'Select item' }] : [],
  });
};

/**
 * Hook for modal accessibility
 * @param {Object} config - Modal configuration
 */
export const useModalAccessibility = (config) => {
  const {
    title,
    visible,
    onClose,
  } = config;

  const modalProps = useAccessibility({
    label: `${title} dialog`,
    role: 'none', // Modal handles its own role
    importantForAccessibility: visible ? 'yes' : 'no-hide-descendants',
  });

  const closeButtonProps = useButtonAccessibility({
    label: `Close ${title} dialog`,
    onPress: onClose,
  });

  return {
    modalProps,
    closeButtonProps,
  };
};

/**
 * Announce changes to screen readers
 * @param {string} message - Message to announce
 * @param {number} delay - Delay before announcement
 */
export const announceForAccessibility = (message, delay = 0) => {
  if (Platform.OS === 'ios') {
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);
  } else {
    // Android equivalent
    setTimeout(() => {
      AccessibilityInfo.setAccessibilityFocus?.(message);
    }, delay);
  }
};

/**
 * Check if screen reader is enabled
 * @returns {Promise<boolean>} Whether screen reader is enabled
 */
export const isScreenReaderEnabled = async () => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    return false;
  }
};

/**
 * Hook to track screen reader status
 */
export const useScreenReader = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkScreenReader = async () => {
      const enabled = await isScreenReaderEnabled();
      if (isMounted) {
        setIsEnabled(enabled);
      }
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (isMounted) {
          setIsEnabled(enabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return isEnabled;
};

/**
 * Color contrast utilities for accessibility
 */
export const getAccessibleColors = () => ({
  // High contrast colors for better accessibility
  primaryText: '#000000',
  secondaryText: '#666666',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#000000',
  secondary: '#666666',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  
  // Focus indicators
  focusOutline: '#0066CC',
  focusBackground: 'rgba(0, 102, 204, 0.1)',
});

/**
 * Accessibility-compliant touch target sizes
 */
export const getTouchTargetSizes = () => ({
  minimum: 44, // iOS minimum
  recommended: 48, // Android minimum/recommended
  large: 56, // Large touch targets for better accessibility
});

export default {
  useAccessibility,
  useFormAccessibility,
  useButtonAccessibility,
  useNavigationAccessibility,
  useListItemAccessibility,
  useModalAccessibility,
  announceForAccessibility,
  isScreenReaderEnabled,
  useScreenReader,
  getAccessibleColors,
  getTouchTargetSizes,
};
