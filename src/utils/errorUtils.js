/**
 * Utility functions for error handling and logging
 */

import { Alert } from 'react-native';

/**
 * Log errors in development mode only
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const logError = (message, error = null, context = {}) => {
  if (__DEV__) {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Show user-friendly error alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional custom buttons
 */
export const showErrorAlert = (title = 'Error', message = 'Something went wrong. Please try again.', buttons = null) => {
  Alert.alert(
    title,
    message,
    buttons || [{ text: 'OK', style: 'default' }]
  );
};

/**
 * Generic async error handler with user feedback
 * @param {Function} asyncFunction - The async function to execute
 * @param {string} errorMessage - Custom error message for users
 * @param {Object} options - Additional options
 */
export const handleAsyncError = async (asyncFunction, errorMessage = 'An error occurred', options = {}) => {
  const { 
    showAlert = true, 
    logToConsole = true, 
    context = {},
    onError = null,
    onSuccess = null 
  } = options;

  try {
    const result = await asyncFunction();
    if (onSuccess) {
      onSuccess(result);
    }
    return { success: true, data: result, error: null };
  } catch (error) {
    if (logToConsole) {
      logError(errorMessage, error, context);
    }
    
    if (showAlert) {
      showErrorAlert('Error', errorMessage);
    }
    
    if (onError) {
      onError(error);
    }
    
    return { success: false, data: null, error };
  }
};

/**
 * Validation helper that returns user-friendly error messages
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} is required`;
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must be less than ${rule.maxLength} characters`;
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Network error handler with retry logic
 * @param {Function} networkCall - The network function to call
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 */
export const handleNetworkError = async (networkCall, maxRetries = 3, delay = 1000) => {
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      const result = await networkCall();
      return { success: true, data: result, error: null };
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt < maxRetries) {
        logError(`Network call failed, retrying (${attempt}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logError('Network call failed after all retries', lastError);
  
  return { success: false, data: null, error: lastError };
};

export default {
  logError,
  showErrorAlert,
  handleAsyncError,
  validateForm,
  handleNetworkError,
};
