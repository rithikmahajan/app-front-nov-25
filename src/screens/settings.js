import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { ForwardArrowIcon } from '../assets/icons';

const SettingsScreen = ({ navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    // Animate in with 300ms ease out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleDeliveryAddresses = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('DeliveryAddressesSettings');
    }
  };

  const handleCommunicationPreferences = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('CommunicationPreferences');
    }
  };

  const handleProfileVisibility = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProfileVisibilityScreen');
    }
  };

  const handleLinkedAccounts = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('LinkedAccount');
    }
  };

  const handleDeleteAccount = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('DeleteAccount');
    }
  };

  const handleBack = () => {
    // Immediately navigate to Profile screen if animation fails
    const navigateToProfile = () => {
      if (navigation && navigation.navigate) {
        navigation.navigate('Profile');
      }
    };

    // Animate out then navigate back to Profile tab
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.back(1.7)),
      useNativeDriver: true,
    }).start((finished) => {
      // Always navigate to Profile screen, regardless of navigation history
      navigateToProfile();
    });

    // Fallback navigation in case animation fails
    setTimeout(navigateToProfile, 350);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton 
            navigation={navigation}
            onPress={handleBack}
            animationDuration={300}
            customEasing={Easing.in(Easing.back(1.7))}
            iconSize={22}
          />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Settings Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeliveryAddresses}>
            <Text style={styles.menuItemText}>Delivery addresses</Text>
            <ForwardArrowIcon />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleCommunicationPreferences}>
            <Text style={styles.menuItemText}>Communication preferences</Text>
            <ForwardArrowIcon />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleProfileVisibility}>
            <Text style={styles.menuItemText}>Profile visibility</Text>
            <ForwardArrowIcon />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLinkedAccounts}>
            <Text style={styles.menuItemText}>Linked accounts</Text>
            <ForwardArrowIcon />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={handleDeleteAccount}>
            <Text style={[styles.menuItemText, styles.deleteAccountText]}>Delete account</Text>
            <ForwardArrowIcon />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  headerSpacer: {
    width: 24, // Match back button width
  },

  // Back Arrow Icon - Simple Chevron
  backArrowIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevronText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '400',
  },

  // Menu Styles
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
    minHeight: 56,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  deleteAccountText: {
    color: '#000000',
  },
});

export default SettingsScreen;