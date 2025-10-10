/**
 * Safe React Native wrapper to handle NativeEventEmitter issues
 * This file provides a patched version of react-native that handles
 * null NativeEventEmitter initialization gracefully
 */

// Import all react-native exports first
const ReactNative = require('react-native');

// Create a safe version of NativeEventEmitter
class SafeNativeEventEmitter extends ReactNative.NativeEventEmitter {
  constructor(nativeModule) {
    if (ReactNative.Platform.OS === 'ios' && (nativeModule === null || nativeModule === undefined)) {
      // Create a dummy module for iOS when null is passed
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

// Export all React Native components and APIs
module.exports = {
  ...ReactNative,
  // Override NativeEventEmitter with our safe version
  NativeEventEmitter: SafeNativeEventEmitter,
};
