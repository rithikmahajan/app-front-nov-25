const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
  },
  watchFolders: [],
  resolver: {
    blockList: [
      /node_modules\/react-native\/ReactCommon\/.*/,
      /node_modules\/react-native\/ReactAndroid\/.*/,
      /node_modules\/react-native\/React\/Base\/.*/,
      /node_modules\/react-native\/third-party\/.*/,
      /ios\/Pods\/.*/,
      /ios\/build\/.*/,
      /android\/build\/.*/,
      /android\/\.gradle\/.*/,
    ],
    alias: {
      // Create a safer version of react-native for NativeEventEmitter
      'react-native$': path.resolve(__dirname, 'src/utils/react-native-safe.js'),
    },
  },
  watcher: {
    additionalExts: ['ts', 'tsx'],
    watchman: {
      deferStates: ['hg.update'],
    },
  },
  transformer: {
    // Enable Hermes for better performance and error handling
    hermesCommand: 'node_modules/react-native/sdks/hermesc/%OS-BIN%/hermesc',
    enableBabelRCLookup: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
