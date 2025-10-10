import { initializeApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCb_fvorV7-6EKUUGvaM3N4hlw32R0iWs",
  authDomain: "yoraa-android-ios.firebaseapp.com",
  projectId: "yoraa-android-ios",
  storageBucket: "yoraa-android-ios.firebasestorage.app",
  messagingSenderId: "133733122921",
  appId: "1:133733122921:ios:e10be6f1d6b5008735b3f8"
};

// Initialize Firebase only if no apps exist
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

// Export auth instance
export { auth };
export default auth;