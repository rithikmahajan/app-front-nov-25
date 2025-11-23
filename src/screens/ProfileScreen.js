import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import LogoutModal from './logoutmodal';
import ContactUsScreen from './contactus';
import yoraaAPI from '../services/yoraaAPI';
import authManager from '../services/authManager';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  getResponsiveValue, 
  getResponsiveFontSize, 
  getResponsiveSpacing 
} from '../utils/responsive';

// Arrow Icon Component - SVG Arrow
const ArrowIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <G clipPath="url(#clip0_10417_51749)">
      <Path 
        d="M5.25 2.625L9.625 7L5.25 11.375" 
        stroke="black" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_10417_51749">
        <Rect width="14" height="14" fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

// Icon Components - matching Figma sizes exactly
const OrdersIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M19.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V3.75C0 4.14782 0.158035 4.52936 0.43934 4.81066C0.720644 5.09196 1.10218 5.25 1.5 5.25V13.5C1.5 13.8978 1.65804 14.2794 1.93934 14.5607C2.22064 14.842 2.60218 15 3 15H18C18.3978 15 18.7794 14.842 19.0607 14.5607C19.342 14.2794 19.5 13.8978 19.5 13.5V5.25C19.8978 5.25 20.2794 5.09196 20.5607 4.81066C20.842 4.52936 21 4.14782 21 3.75V1.5C21 1.10218 20.842 0.720644 20.5607 0.43934C20.2794 0.158035 19.8978 0 19.5 0ZM12.75 9H8.25C8.05109 9 7.86032 8.92098 7.71967 8.78033C7.57902 8.63968 7.5 8.44891 7.5 8.25C7.5 8.05109 7.57902 7.86032 7.71967 7.71967C7.86032 7.57902 8.05109 7.5 8.25 7.5H12.75C12.9489 7.5 13.1397 7.57902 13.2803 7.71967C13.421 7.86032 13.5 8.05109 13.5 8.25C13.5 8.44891 13.421 8.63968 13.2803 8.78033C13.1397 8.92098 12.9489 9 12.75 9ZM19.5 3.75H1.5V1.5H19.5V3.75Z" 
      fill="black"
    />
  </Svg>
);

const ContactIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M8.25 7.5C8.25 7.79667 8.16203 8.08668 7.9972 8.33336C7.83238 8.58003 7.59811 8.77229 7.32402 8.88582C7.04994 8.99935 6.74834 9.02906 6.45736 8.97118C6.16639 8.9133 5.89912 8.77044 5.68934 8.56066C5.47956 8.35088 5.3367 8.08361 5.27882 7.79264C5.22094 7.50166 5.25065 7.20006 5.36418 6.92598C5.47771 6.65189 5.66997 6.41762 5.91664 6.2528C6.16332 6.08797 6.45333 6 6.75 6C7.14782 6 7.52936 6.15804 7.81066 6.43934C8.09196 6.72064 8.25 7.10218 8.25 7.5ZM19.5 1.5V15C19.5 15.3978 19.342 15.7794 19.0607 16.0607C18.7794 16.342 18.3978 16.5 18 16.5H1.5C1.10218 16.5 0.720644 16.342 0.43934 16.0607C0.158035 15.7794 0 15.3978 0 15V1.5C0 1.10218 0.158035 0.720644 0.43934 0.43934C0.720644 0.158035 1.10218 0 1.5 0H18C18.3978 0 18.7794 0.158035 19.0607 0.43934C19.342 0.720644 19.5 1.10218 19.5 1.5ZM10.4766 11.8125C10.2339 10.9063 9.6584 10.125 8.865 9.62438C9.28634 9.20553 9.57384 8.67102 9.69104 8.08859C9.80825 7.50616 9.74988 6.90205 9.52334 6.35283C9.29681 5.80361 8.9123 5.33402 8.41857 5.00358C7.92483 4.67315 7.3441 4.49675 6.75 4.49675C6.1559 4.49675 5.57517 4.67315 5.08143 5.00358C4.5877 5.33402 4.20319 5.80361 3.97666 6.35283C3.75012 6.90205 3.69175 7.50616 3.80896 8.08859C3.92616 8.67102 4.21366 9.20553 4.635 9.62438C3.84211 10.1255 3.26681 10.9066 3.02344 11.8125C2.97371 12.0052 3.00257 12.2098 3.10366 12.3812C3.20475 12.5526 3.3698 12.6768 3.5625 12.7266C3.7552 12.7763 3.95975 12.7474 4.13117 12.6463C4.30259 12.5452 4.42683 12.3802 4.47656 12.1875C4.72406 11.2266 5.70094 10.5 6.75 10.5C7.79906 10.5 8.77687 11.2247 9.02344 12.1875C9.07317 12.3802 9.19741 12.5452 9.36883 12.6463C9.54025 12.7474 9.7448 12.7763 9.9375 12.7266C10.1302 12.6768 10.2952 12.5526 10.3963 12.3812C10.4974 12.2098 10.5263 12.0052 10.4766 11.8125ZM16.5 9.75C16.5 9.55109 16.421 9.36032 16.2803 9.21967C16.1397 9.07902 15.9489 9 15.75 9H12C11.8011 9 11.6103 9.07902 11.4697 9.21967C11.329 9.36032 11.25 9.55109 11.25 9.75C11.25 9.94891 11.329 10.1397 11.4697 10.2803C11.6103 10.421 11.8011 10.5 12 10.5H15.75C15.9489 10.5 16.1397 10.421 16.2803 10.2803C16.421 10.1397 16.5 9.94891 16.5 9.75ZM16.5 6.75C16.5 6.55109 16.421 6.36032 16.2803 6.21967C16.1397 6.07902 15.9489 6 15.75 6H12C11.8011 6 11.6103 6.07902 11.4697 6.21967C11.329 6.36032 11.25 6.55109 11.25 6.75C11.25 6.94891 11.329 7.13968 11.4697 7.28033C11.6103 7.42098 11.8011 7.5 12 7.5H15.75C15.9489 7.5 16.1397 7.42098 16.2803 7.28033C16.421 7.13968 16.5 6.94891 16.5 6.75Z" 
      fill="black"
    />
  </Svg>
);

const SettingsIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path 
      d="M16.5664 9.18446C16.5698 9.06063 16.5698 8.93679 16.5664 8.81296L17.8494 7.20999C17.9167 7.12583 17.9633 7.02704 17.9854 6.92159C18.0075 6.81613 18.0045 6.70696 17.9767 6.60286C17.766 5.81234 17.4514 5.05326 17.0411 4.34547C16.9873 4.25287 16.9126 4.17409 16.8231 4.11542C16.7335 4.05675 16.6315 4.0198 16.5251 4.0075L14.4853 3.78048C14.4004 3.69104 14.3144 3.60504 14.2273 3.52249L13.9865 1.4775C13.9741 1.37105 13.937 1.26896 13.8782 1.17938C13.8194 1.0898 13.7404 1.0152 13.6477 0.961528C12.9399 0.551541 12.1808 0.237483 11.3903 0.0276117C11.2862 -0.000199225 11.177 -0.00317108 11.0715 0.0189357C10.9661 0.0410424 10.8673 0.0876096 10.7831 0.154886L9.18446 1.43107C9.06063 1.43107 8.93679 1.43107 8.81296 1.43107L7.20999 0.150586C7.12583 0.0833099 7.02704 0.0367427 6.92159 0.0146359C6.81613 -0.00747081 6.70696 -0.00449912 6.60286 0.0233118C5.81234 0.234025 5.05326 0.548647 4.34547 0.958948C4.25287 1.01272 4.17409 1.08736 4.11542 1.17694C4.05675 1.26651 4.0198 1.36855 4.0075 1.47492L3.78048 3.51819C3.69104 3.60361 3.60504 3.68961 3.52249 3.77618L1.4775 4.01094C1.37105 4.02333 1.26896 4.06041 1.17938 4.11924C1.0898 4.17806 1.0152 4.25701 0.961528 4.34977C0.551625 5.05766 0.237299 5.81672 0.0267518 6.60716C-0.000941599 6.71133 -0.00377406 6.82054 0.0184826 6.92599C0.0407393 7.03145 0.0874624 7.13021 0.154886 7.21429L1.43107 8.81296C1.43107 8.93679 1.43107 9.06063 1.43107 9.18446L0.150586 10.7874C0.0833099 10.8716 0.0367427 10.9704 0.0146359 11.0758C-0.00747081 11.1813 -0.00449912 11.2905 0.0233118 11.3946C0.234025 12.1851 0.548647 12.9442 0.958948 13.652C1.01272 13.7446 1.08736 13.8233 1.17694 13.882C1.26651 13.9407 1.36855 13.9776 1.47492 13.9899L3.51475 14.2169C3.60017 14.3064 3.68617 14.3924 3.77274 14.4749L4.01094 16.5199C4.02333 16.6264 4.06041 16.7285 4.11924 16.818C4.17806 16.9076 4.25701 16.9822 4.34977 17.0359C5.05766 17.4458 5.81672 17.7601 6.60716 17.9707C6.71133 17.9984 6.82054 18.0012 6.92599 17.9789C7.03145 17.9567 7.13021 17.91 7.21429 17.8425L8.81296 16.5664C8.93679 16.5698 9.06063 16.5698 9.18446 16.5664L10.7874 17.8494C10.8716 17.9167 10.9704 17.9633 11.0758 17.9854C11.1813 18.0075 11.2905 18.0045 11.3946 17.9767C12.1852 17.7664 12.9443 17.4517 13.652 17.0411C13.7446 16.9873 13.8233 16.9126 13.882 16.8231C13.9407 16.7335 13.9776 16.6315 13.9899 16.5251L14.2169 14.4853C14.3064 14.4004 14.3924 14.3144 14.4749 14.2273L16.5199 13.9865C16.6264 13.9741 16.7285 13.937 16.818 13.8782C16.9076 13.8194 16.9822 13.7404 17.0359 13.6477C17.4458 12.9398 17.7601 12.1807 17.9707 11.3903C17.9984 11.2861 18.0012 11.1769 17.9789 11.0714C17.9567 10.966 17.91 10.8672 17.8425 10.7831L16.5664 9.18446ZM8.99871 12.4385C8.31837 12.4385 7.65332 12.2368 7.08764 11.8588C6.52196 11.4809 6.08107 10.9436 5.82071 10.3151C5.56036 9.68653 5.49224 8.9949 5.62497 8.32763C5.75769 7.66037 6.08531 7.04745 6.56638 6.56638C7.04745 6.08531 7.66037 5.75769 8.32763 5.62497C8.9949 5.49224 9.68653 5.56036 10.3151 5.82071C10.9436 6.08107 11.4809 6.52196 11.8588 7.08764C12.2368 7.65332 12.4385 8.31837 12.4385 8.99871C12.4385 9.91101 12.0761 10.7859 11.431 11.431C10.7859 12.0761 9.91101 12.4385 8.99871 12.4385Z" 
      fill="black"
    />
  </Svg>
);

const ProfileScreen = React.memo(({ navigation }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [isLoadingUserName, setIsLoadingUserName] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleEditProfile = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('EditProfile', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handleOrders = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('Orders', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handleContactUs = useCallback(() => {
    setShowContactUsModal(true);
  }, []);

  const handleSettings = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('Settings', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handleInvoices = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('Invoice', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handleLoveUs = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('LoveUsRateUs', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handleInviteFriend = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('InviteAFriend', { previousScreen: 'Profile' });
    }
  }, [navigation]);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://yoraa.co').catch(err => {
      if (__DEV__) {
        console.error('Failed to open URL:', err);
      }
    });
  }, []);

  const handleTermsConditions = useCallback(() => {
    Linking.openURL('https://yoraa.app').catch(err => {
      if (__DEV__) {
        console.error('Failed to open URL:', err);
      }
    });
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleCloseLogoutModal = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setShowLogoutModal(false);
      console.log('🔐 Profile screen initiating sign out...');
      
      // The actual logout logic is now handled by the LogoutModal
      // This callback is called after the logout process is complete
      
      // Don't manually clear state - let the auth state listener handle it
      // The onAuthStateChanged listener will set userName to 'Guest User'
      
      console.log('✅ Profile screen sign out complete - waiting for auth state update');
      
    } catch (error) {
      console.error('❌ Profile screen sign out error:', error);
    }
  }, []);

  const loadUserName = useCallback(async () => {
    try {
      // Get current Firebase user
      const currentUser = auth().currentUser;
      if (currentUser) {
        console.log('👤 Loading user name for ProfileScreen:', {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email
        });

        // ✅ INSTANT LOAD: Set name immediately from Firebase (no waiting)
        let quickName = '';
        if (currentUser.displayName) {
          quickName = currentUser.displayName;
        } else if (currentUser.email) {
          const emailName = currentUser.email.split('@')[0];
          quickName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        } else {
          quickName = 'User';
        }
        
        // Set name instantly - no loading state
        setUserName(quickName);
        setIsAuthenticated(true);
        setIsLoadingUserName(false);
        console.log('✅ Quick name set instantly:', quickName);

        // ✅ BACKGROUND UPDATE: Try to get better name from backend (non-blocking)
        setTimeout(async () => {
          try {
            // Check backend auth status quickly
            const isBackendAuth = yoraaAPI.isAuthenticated();
            
            if (isBackendAuth) {
              // Only fetch if backend is already authenticated (no sync/retry delays)
              const profile = await yoraaAPI.getUserProfile();
              
              if (profile && profile.success && profile.data && !profile.data.fallback) {
                let displayName = '';
                
                if (profile.data.firstName && profile.data.lastName) {
                  displayName = `${profile.data.firstName} ${profile.data.lastName}`;
                } else if (profile.data.firstName) {
                  displayName = profile.data.firstName;
                } else if (profile.data.name || profile.data.displayName) {
                  displayName = profile.data.name || profile.data.displayName;
                }
                
                // Only update if we got a better name
                if (displayName && displayName !== quickName) {
                  setUserName(displayName);
                  console.log('✅ Updated with backend profile name:', displayName);
                }
              }
            } else {
              console.log('ℹ️ Backend not authenticated - using Firebase name');
            }
          } catch (profileError) {
            console.log('ℹ️ Background profile update failed (non-critical):', profileError.message);
            // Keep using the quick name - no error to user
          }
        }, 100); // Small delay to not block rendering
        
      } else {
        console.log('❌ No authenticated user found for ProfileScreen');
        setUserName('Guest User');
        setIsAuthenticated(false);
        setIsLoadingUserName(false);
      }
    } catch (error) {
      console.error('❌ Error loading user name for ProfileScreen:', error);
      setUserName('Guest User');
      setIsAuthenticated(false);
      setIsLoadingUserName(false);
    }
  }, []);

  // Load user name on component mount
  useEffect(() => {
    loadUserName();
  }, [loadUserName]);

  // Add auth state listener to reload when user signs in/out
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('🔄 Auth state changed in ProfileScreen, reloading user data...');
        loadUserName();
      } else {
        setUserName('Guest User');
        setIsAuthenticated(false);
        setIsLoadingUserName(false);
      }
    });

    return unsubscribe;
  }, [loadUserName]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileContainer}>
          {isLoadingUserName ? (
            <View style={styles.nameLoadingContainer}>
              <SkeletonLoader width="60%" height={24} borderRadius={4} />
            </View>
          ) : (
            <Text style={styles.clientName} accessibilityRole="header">{userName}</Text>
          )}
          {isAuthenticated ? (
            <TouchableOpacity 
              style={styles.editProfileButton} 
              onPress={handleEditProfile}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              accessibilityHint="Navigate to edit profile screen"
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.signInButton} 
              onPress={() => navigation?.navigate('LoginAccountMobileNumber')}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityHint="Navigate to login screen"
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleOrders}
            accessibilityRole="button"
            accessibilityLabel="Orders"
            accessibilityHint="View your order history"
          >
            <OrdersIcon />
            <Text style={styles.actionButtonText}>Orders</Text>
          </TouchableOpacity>
          
          <View style={styles.actionDivider} />
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleContactUs}
            accessibilityRole="button"
            accessibilityLabel="Contact Us"
            accessibilityHint="Open contact support modal"
          >
            <ContactIcon />
            <Text style={styles.actionButtonText}>Contact Us</Text>
          </TouchableOpacity>
          
          <View style={styles.actionDivider} />
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityHint="Navigate to app settings"
          >
            <SettingsIcon />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleInvoices}
          accessibilityRole="button"
          accessibilityLabel="Invoices"
          accessibilityHint="View your invoice history"
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Invoices</Text>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleLoveUs}
          accessibilityRole="button"
          accessibilityLabel="Love Us rate Us"
          accessibilityHint="Rate and review the app"
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Love Us rate Us</Text>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleInviteFriend}
          accessibilityRole="button"
          accessibilityLabel="Invite a friend"
          accessibilityHint="Share the app with friends"
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Invite a friend</Text>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handlePrivacyPolicy}
          accessibilityRole="button"
          accessibilityLabel="Privacy policy"
          accessibilityHint="Open privacy policy in browser"
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Privacy policy</Text>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleTermsConditions}
          accessibilityRole="button"
          accessibilityLabel="Terms and Conditions"
          accessibilityHint="Open terms and conditions in browser"
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>T&C</Text>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        {isAuthenticated && (
          <TouchableOpacity 
            style={[styles.menuItem, styles.lastMenuItem]} 
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            accessibilityHint="Sign out of your account"
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Logout</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      <LogoutModal
        visible={showLogoutModal}
        onClose={handleCloseLogoutModal}
        onSignOut={handleSignOut}
        navigation={navigation}
      />
      
      <ContactUsScreen
        visible={showContactUsModal}
        navigation={{ goBack: () => setShowContactUsModal(false) }}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: getResponsiveSpacing(80),
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Profile Header Styles - matching Figma positioning
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(24),
    marginBottom: getResponsiveSpacing(30),
  },
  clientName: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: '500',
    color: '#000000',
    marginBottom: getResponsiveSpacing(30),
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 100,
    paddingHorizontal: getResponsiveSpacing(51),
    paddingVertical: getResponsiveSpacing(16),
  },
  editProfileText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(51),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveValue(180, 200, 220),
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },

  // Navigation Container - matching Figma layout
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: getResponsiveSpacing(28),
    marginBottom: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(10),
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionDivider: {
    width: 1,
    height: getResponsiveValue(31, 35, 40),
    backgroundColor: '#000000',
    marginHorizontal: 0, // Remove horizontal margins so dividers don't extend to screen edges
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '400',
    color: '#000000',
    marginTop: getResponsiveSpacing(10),
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.3,
  },

  // Menu Items - matching Figma spacing and style
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(32),
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    minHeight: getResponsiveValue(76, 84, 92),
  },
  lastMenuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  menuItemContent: {
    flex: 1,
    gap: getResponsiveSpacing(6),
  },
  menuItemTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: getResponsiveFontSize(19.2),
  },
  menuItemSubtitle: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.3,
    lineHeight: getResponsiveFontSize(12),
  },
  nameLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(30),
  },
  loadingText: {
    marginLeft: getResponsiveSpacing(8),
    fontSize: getResponsiveFontSize(16),
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
  },
});

export default ProfileScreen;