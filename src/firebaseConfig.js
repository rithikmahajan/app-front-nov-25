// Simple Firebase configuration for React Native Firebase
// The Firebase app is automatically initialized by @react-native-firebase/app
// We just need to export the auth instance

import auth from '@react-native-firebase/auth';

console.log('Firebase Auth module loaded successfully');

// Export auth instance - Firebase is auto-initialized on iOS/Android
export { auth };
export default auth;
