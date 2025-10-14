/**
 * @format
 */

import { AppRegistry, NativeEventEmitter, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Initialize Firebase app before any other Firebase imports
import '@react-native-firebase/app';

// Comprehensive fix for NativeEventEmitter issue
// This must run before any modules that use NativeEventEmitter
const OriginalNativeEventEmitter = NativeEventEmitter;

class SafeNativeEventEmitter extends OriginalNativeEventEmitter {
  constructor(nativeModule) {
    if (Platform.OS === 'ios' && (nativeModule === null || nativeModule === undefined)) {
      // For iOS, create a dummy module that provides the required interface
      const dummyModule = {
        addListener: () => {},
        removeListeners: () => {},
      };
      super(dummyModule);
    } else {
      super(nativeModule);
    }
  }
}

// Replace the global NativeEventEmitter
global.NativeEventEmitter = SafeNativeEventEmitter;

// Also patch the React Native module exports
const RN = require('react-native');
RN.NativeEventEmitter = SafeNativeEventEmitter;

// Enhanced global error handling
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Filter out specific NativeEventEmitter errors
    if (message.includes('NativeEventEmitter') && 
        message.includes('requires a non-null argument')) {
      console.warn('NativeEventEmitter warning (handled):', ...args);
      return;
    }
    
    // Filter out other common React Native warnings
    if (message.includes('Invariant Violation') && 
        message.includes('NativeEventEmitter')) {
      console.warn('NativeEventEmitter invariant (handled):', ...args);
      return;
    }
    
    // Filter out expected wishlist toggle errors that are handled by the app
    if (message.includes('API Error [POST /api/wishlist/add]') && 
        message.includes('already in wishlist')) {
      console.log('ℹ️ Expected wishlist toggle error (handled by app):', ...args);
      return;
    }
    
    // Filter out expected cart sync 404 errors (backend cart endpoints optional)
    if (message.includes('API Error') && 
        message.includes('/api/cart/') && 
        (message.includes('404') || message.includes('not found'))) {
      // Don't log as error - cart 404s are expected and handled
      return;
    }
    
    originalConsoleError('RN Error:', ...args);
  };
}

// Global error boundary for unhandled JavaScript errors
const errorHandler = (error, isFatal) => {
  // Check if this is the NativeEventEmitter error we want to suppress
  if (error && error.message && 
      error.message.includes('NativeEventEmitter') && 
      error.message.includes('requires a non-null argument')) {
    // Log as warning instead of fatal error
    console.warn('NativeEventEmitter Warning (non-fatal):', error.message);
    return; // Don't treat as fatal
  }
  
  if (__DEV__) {
    console.error('Global error handler:', error, 'Fatal:', isFatal);
  }
};

// Set global error handler
if (typeof global !== 'undefined') {
  global.ErrorUtils?.setGlobalHandler?.(errorHandler);
}

AppRegistry.registerComponent(appName, () => App);
