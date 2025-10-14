/**
 * YORAA Fashion App
 * React Native App with Bottom Navigation
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  SafeAreaView,
  Platform,
  AppState,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EnhancedLayout } from './src/components/layout';
import SplashScreen from './src/components/SplashScreen';
import { Colors } from './src/constants';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { BagProvider } from './src/contexts/BagContext';
import { AddressProvider } from './src/contexts/AddressContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { ShiprocketProvider } from './src/contexts/ShiprocketContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Firebase imports
import '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';

// Authentication services
import authManager from './src/services/authManager';
import sessionManager from './src/services/sessionManager';
import yoraaAPI from './src/services/yoraaAPI';
import recaptchaService from './src/services/recaptchaService';
import authStorageService from './src/services/authStorageService';

// Main App Component with Routing
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isNativeModulesReady, setIsNativeModulesReady] = useState(false);
  
  // Authentication state
  const [initializing, setInitializing] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Ref to track if component is mounted (prevent setState on unmounted component)
  const isMountedRef = useRef(true);

  // Initialize native modules safely
  useEffect(() => {
    const initializeNativeModules = async () => {
      try {
        // Wait a bit for native modules to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test if gesture handler is available
        if (Platform.OS === 'ios') {
          // Gesture handler should be available now
          setIsNativeModulesReady(true);
        } else {
          setIsNativeModulesReady(true);
        }
      } catch (error) {
        console.warn('Native modules initialization warning:', error);
        // Continue anyway - app should still work
        setIsNativeModulesReady(true);
      }
    };

    initializeNativeModules();
  }, []);

  // Initialize authentication services
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication services...');
        
        // Initialize reCAPTCHA Enterprise for iOS phone auth
        // Using the reCAPTCHA site key from Firebase Console
        await recaptchaService.initialize('6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt');
        
        // Initialize YoraaAPI first
        await yoraaAPI.initialize();
        
        // Check if user has stored auth data
        const isAuthenticated = await authStorageService.isAuthenticated();
        console.log('🔐 Stored authentication found:', isAuthenticated);
        
        if (isAuthenticated) {
          const userData = await authStorageService.getUserData();
          const token = await authStorageService.getAuthToken();
          
          // CRITICAL: Validate that auth data is complete
          if (userData && token && (userData._id || userData.uid)) {
            console.log('✅ Restoring user session:', { userId: userData._id || userData.uid });
            
            // Sync token with yoraaAPI
            if (yoraaAPI.userToken !== token) {
              yoraaAPI.userToken = token;
              console.log('✅ Backend token synced from storage');
            }
            
            // CRITICAL FOR TESTFLIGHT: Verify Firebase user exists and sync backend
            const firebaseUser = getAuth().currentUser;
            if (firebaseUser) {
              console.log('🔍 Firebase user found on init, verifying backend auth...');
              const backendAuth = yoraaAPI.isAuthenticated();
              
              if (!backendAuth) {
                console.log('⚠️ Backend not authenticated on app start, syncing...');
                try {
                  await authManager.syncBackendAuth();
                  console.log('✅ Backend auth synced on app start');
                } catch (syncError) {
                  console.error('❌ Failed to sync backend auth on app start:', syncError);
                  // Clear invalid session
                  await authStorageService.clearAuthData();
                  console.log('🧹 Cleared invalid auth data due to sync failure');
                }
              } else {
                console.log('✅ Backend already authenticated on app start');
              }
            } else {
              // No Firebase user but we have tokens - this is invalid state
              console.warn('⚠️ Stored tokens found but no Firebase user - clearing invalid session');
              await authStorageService.clearAuthData();
            }
          } else {
            // Incomplete auth data - clear it
            console.warn('⚠️ Incomplete auth data found - clearing invalid session');
            await authStorageService.clearAuthData();
          }
        }
        
        // Auth Manager will initialize session manager internally
        // This will handle Firebase auth state changes and session persistence
        console.log('✅ Authentication services initialized');
        
        setAuthInitialized(true);
        
      } catch (error) {
        console.error('❌ Authentication initialization failed:', error);
        setAuthInitialized(true); // Continue anyway
      }
    };

    initializeAuth();
  }, []);

  // Firebase Auth state listener - enhanced with session management
  useEffect(() => {
    const authStateChanged = async (firebaseUser) => {
      console.log('🔥 App.js - Firebase Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      // Update last activity if user is authenticated
      if (firebaseUser && authInitialized) {
        try {
          await sessionManager.updateLastActivity();
        } catch (error) {
          console.warn('⚠️ Failed to update last activity:', error);
        }
      }
      
      if (initializing) setInitializing(false);
    };

    const authInstance = getAuth();
    const subscriber = authInstance.onAuthStateChanged(authStateChanged);
    return subscriber; // Cleanup subscription on unmount
  }, [initializing, authInitialized]);

  // App state change listener - refresh auth when app becomes active
  useEffect(() => {
    const { AppState } = require('react-native');
    
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active' && authInitialized) {
        try {
          console.log('📱 App became active, refreshing authentication...');
          
          // CRITICAL: Check if sign-in is currently in progress
          // If it is, wait for it to complete instead of reinitializing
          if (yoraaAPI.isSigningIn) {
            console.log('⏳ Sign-in currently in progress, waiting for completion...');
            
            // Wait for the sign-in to complete
            if (yoraaAPI.signInPromise) {
              await yoraaAPI.signInPromise;
              console.log('✅ Sign-in completed, token should be available');
            }
            
            // Verify authentication status
            const isAuth = yoraaAPI.isAuthenticated();
            console.log('🔐 Auth status after sign-in completion:', isAuth ? 'AUTHENTICATED ✅' : 'NOT AUTHENTICATED ❌');
            
            return; // Skip reinitialization since sign-in just completed
          }
          
          // Reinitialize yoraaAPI to ensure token is loaded from storage
          await yoraaAPI.reinitialize();
          
          const isAuth = yoraaAPI.isAuthenticated();
          console.log('🔐 Auth status after reinitialization:', isAuth ? 'AUTHENTICATED ✅' : 'NOT AUTHENTICATED ❌');
          
          // If authenticated, sync with backend
          if (isAuth) {
            await authManager.refreshAuth();
          } else {
            // Not authenticated with backend, try Firebase auth
            const currentUser = getAuth().currentUser;
            if (currentUser) {
              console.log('🔄 Firebase user found, syncing with backend...');
              await authManager.syncBackendAuth();
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to refresh auth on app active:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [authInitialized]);

  const handleSplashFinish = () => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error('Error finishing splash:', error);
      setHasError(true);
    }
  };

  // Add a fallback UI for critical errors
  if (hasError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Something went wrong. Please restart the app.
        </Text>
      </SafeAreaView>
    );
  }

  // Show splash screen until everything is ready
  if (isLoading || !isNativeModulesReady || initializing || !authInitialized) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  try {
    return (
      <GestureHandlerRootView style={styles.container}>
        <ErrorBoundary>
          <CurrencyProvider>
            <ShiprocketProvider>
              <FavoritesProvider>
                <BagProvider>
                  <AddressProvider>
                    <View style={styles.container}>
                    <StatusBar
                      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                      backgroundColor={Colors.background}
                      translucent={false}
                    />
                    <EnhancedLayout />
                    </View>
                  </AddressProvider>
                </BagProvider>
              </FavoritesProvider>
            </ShiprocketProvider>
          </CurrencyProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    );
  } catch (error) {
    console.error('Critical error in App component:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          App failed to load. Please restart.
        </Text>
      </SafeAreaView>
    );
  }
}

// Alternative App Component with Manual Routing (if you prefer more control)
const AppWithManualRouting = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentRoute, setCurrentRoute] = useState('Home');

  const handleRouteChange = (route) => {
    setCurrentRoute(route);
    // Navigation logging removed for production
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#FFFFFF"
      />
      
      {/* App Header */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>YORAA</Text>
        <Text style={styles.appSubtitle}>Fashion Forward</Text>
        <Text style={styles.currentRoute}>Current: {currentRoute}</Text>
      </View>

      {/* Main Layout with Routing */}
      <EnhancedLayout 
        initialRoute={currentRoute}
        onRouteChange={handleRouteChange}
      />
    </SafeAreaView>
  );
};

// Router Component for managing navigation state
const Router = ({ children, initialRoute = 'Home' }) => {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [routeHistory, setRouteHistory] = useState([initialRoute]);

  const navigateTo = (route) => {
    if (route !== currentRoute) {
      setCurrentRoute(route);
      setRouteHistory(prev => [...prev, route]);
      // Navigation logging removed for production
    }
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const newHistory = routeHistory.slice(0, -1);
      const previousRoute = newHistory[newHistory.length - 1];
      setRouteHistory(newHistory);
      setCurrentRoute(previousRoute);
      // Navigation logging removed for production
    }
  };

  const routerProps = {
    currentRoute,
    navigateTo,
    goBack,
    routeHistory,
    canGoBack: routeHistory.length > 1,
  };

  return React.cloneElement(children, routerProps);
};

// Enhanced App with Router
const AppWithRouter = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="#FFFFFF"
        />
        
        <Router initialRoute="Home">
          <EnhancedLayout />
        </Router>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default App;
export { AppWithManualRouting, AppWithRouter, Router };
