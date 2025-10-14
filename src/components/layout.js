import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import BottomNavigationBar from './bottomnavigationbar';
import { Colors, FontSizes, FontWeights, Spacing } from '../constants';

// Import core screens individually to prevent cascade failures
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import CollectionScreen from '../screens/CollectionScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Try to import PreferenceSelector safely
let PreferenceSelector;
try {
  PreferenceSelector = require('../screens/preferenceselector').default;
} catch (error) {
  console.warn('PreferenceSelector failed to load:', error);
  PreferenceSelector = () => null;
}

// Import other commonly used screens  
import SearchScreen from '../screens/search';
import FiltersScreen from '../screens/filters';
import BagScreen from '../screens/bag';
import ProductDetailsMain from '../screens/productdetailsmain';

// For other screens, we'll use dynamic imports to prevent cascade failures

// Sale screens will be loaded dynamically

// Placeholder content components for each tab
const HomeContent = ({ navigation }) => <HomeScreen navigation={navigation} />;
const ShopContent = ({ navigation }) => <ShopScreen navigation={navigation} />;
const CollectionContent = ({ navigation }) => <CollectionScreen navigation={navigation} />;
const RewardsContent = ({ navigation, route }) => <RewardsScreen navigation={navigation} route={route} />;
const ProfileContent = ({ navigation }) => <ProfileScreen navigation={navigation} />;

// Helper function to safely load screens
const loadScreen = (screenName) => {
  try {
    const screens = require('../screens');
    return screens[screenName];
  } catch (error) {
    console.warn(`Failed to load screen ${screenName}:`, error);
    return null;
  }
};

// Enhanced Layout with improved navigation handling
const EnhancedLayout = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [headerTitle, setHeaderTitle] = useState('YORAA');
  const [routeParams, setRouteParams] = useState(null);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  // Navigation context for handling screen navigation
  const navigation = {
    navigate: (screenName, params) => {
      if (screenName === 'PreferenceSelector') {
        // Handle PreferenceSelector as a modal
        setShowPreferenceModal(true);
        return;
      }
      
      if (['Home', 'Shop', 'Collection', 'Rewards', 'Profile'].includes(screenName)) {
        setActiveTab(screenName);
        setCurrentScreen(screenName);
      } else {
        setCurrentScreen(screenName);
      }
      setRouteParams(params || null);
    },
    replace: (screenName, params) => {
      // Replace current screen with new screen (similar to navigate but more explicit)
      if (['Home', 'Shop', 'Collection', 'Rewards', 'Profile'].includes(screenName)) {
        setActiveTab(screenName);
        setCurrentScreen(screenName);
      } else {
        setCurrentScreen(screenName);
      }
      setRouteParams(params || null);
    },
    goBack: () => {
      // Handle back navigation to previous screen
      if (routeParams?.previousScreen) {
        setCurrentScreen(routeParams.previousScreen);
        if (['Home', 'Shop', 'Collection', 'Rewards', 'Profile'].includes(routeParams.previousScreen)) {
          setActiveTab(routeParams.previousScreen);
        }
      } else {
        // Default back to Home if no previous screen
        setCurrentScreen('Home');
        setActiveTab('Home');
      }
      
      setRouteParams(null);
    },
    canGoBack: () => {
      // Return true if there's a previous screen to go back to
      return routeParams?.previousScreen != null;
    },
    route: { params: routeParams },
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentScreen(tabName);
    setHeaderTitle(tabName === 'Home' ? 'YORAA' : tabName);
  };

  // Dynamic screen renderer with fallback
  const renderScreen = (screenName, props = {}) => {
    try {
      const ScreenComponent = loadScreen(screenName);
      if (ScreenComponent) {
        return <ScreenComponent {...props} />;
      }
      throw new Error(`Screen ${screenName} not found`);
    } catch (error) {
      console.warn(`Failed to render screen ${screenName}:`, error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Screen "{screenName}" failed to load.
          </Text>
        </View>
      );
    }
  };

  const renderContent = () => {
    try {
      switch (currentScreen) {
        case 'Home':
          return <HomeContent navigation={navigation} />;
        case 'favourites':
          return renderScreen('FavouritesScreen', { navigation });
        case 'FavouritesContent':
          return renderScreen('FavouritesContent', { navigation });
        case 'FavouritesContentEditView':
          return renderScreen('FavouritesContentEditView', { navigation });
        case 'FavouritesModalOverlayForSizeSelection':
          return renderScreen('FavouritesModalOverlayForSizeSelection', { navigation, route: { params: routeParams } });
        case 'FavouritesAddedToBagConfirmationModal':
          return renderScreen('FavouritesAddedToBagConfirmationModal', { navigation, route: { params: routeParams } });
        case 'FavouritesSizeChartReference':
          return renderScreen('FavouritesSizeChartReference', { navigation, route: { params: routeParams } });
        case 'Shop':
          return <ShopContent navigation={navigation} />;
        case 'Collection':
          return <CollectionContent navigation={navigation} />;
        case 'Filters':
          return <FiltersScreen navigation={navigation} route={{ params: routeParams }} />;
        case 'SearchScreen':
          return <SearchScreen navigation={navigation} route={{ params: routeParams }} />;
        case 'ScanBarcode':
          return renderScreen('ScanBarcodeFlow', { navigation });
        case 'SaleScreen':
          return renderScreen('SaleScreen', { navigation, route: { params: routeParams } });
        case 'SaleCategoryScreen':
          return renderScreen('SaleCategoryScreen', { navigation, route: { params: routeParams } });
        case 'Rewards':
          return <RewardsContent navigation={navigation} route={{ params: routeParams }} />;
        case 'RewardsScreen':
          return <RewardsScreen navigation={navigation} route={{ params: routeParams }} />;
        case 'Profile':
          return <ProfileContent navigation={navigation} />;
        case 'Bag':
          return <BagScreen navigation={navigation} route={{ params: routeParams }} />;
        case 'bagemptyscreen':
          return renderScreen('BagEmptyScreen', { navigation, route: { params: routeParams } });
        case 'BagContent':
          return renderScreen('BagContent', { navigation, route: { params: routeParams } });
        case 'CreateAccountMobileNumber':
          return renderScreen('CreateAccountMobileNumber', { navigation, route: { params: routeParams } });
        case 'CreateAccountEmail':
          return renderScreen('CreateAccountEmail', { navigation, route: { params: routeParams } });
        case 'CreateAccountEmailSuccessModal':
          return renderScreen('CreateAccountEmailSuccessModal', { navigation });
        case 'CreateAccountMobileNumberVerification':
          return renderScreen('CreateAccountMobileNumberVerification', { navigation });
        case 'CreateAccountMobileNumberAccountCreatedConfirmationModal':
          return renderScreen('CreateAccountMobileNumberAccountCreatedConfirmationModal', { navigation });
        case 'LoginAccountMobileNumber':
          return renderScreen('LoginAccountMobileNumber', { navigation, route: { params: routeParams } });
        case 'LoginAccountEmail':
          return renderScreen('LoginAccountEmail', { navigation, route: { params: routeParams } });
        case 'ForgotLoginPassword':
          return renderScreen('ForgotLoginPassword', { navigation });
        case 'ForgotLoginPasswordVerificationCode':
          return renderScreen('ForgotLoginPasswordVerificationCode', { navigation, route: { params: routeParams } });
        case 'forgotloginpqasswordcreatenewpasword':
          return renderScreen('ForgotLoginPasswordCreateNewPassword', { navigation, route: { params: routeParams } });
        case 'ForgotLoginPasswordConfirmationModal':
          return renderScreen('ForgotLoginPasswordConfirmationModal', { navigation });
        case 'LoginAccountMobileNumberVerificationCode':
          return renderScreen('LoginAccountMobileNumberVerificationCode', { navigation });
        case 'LoginAccountEmailVerificationCode':
          return renderScreen('LoginAccountEmailVerificationCode', { navigation, route: { params: routeParams } });
        case 'TermsAndConditions':
          return renderScreen('TermsAndConditions', { navigation, route: { params: routeParams } });
        case 'Orders':
          return renderScreen('OrdersScreen', { navigation, route: { params: routeParams } });
        case 'OrdersReturnExchange':
          return renderScreen('OrdersReturnExchange', { navigation, route: { params: routeParams } });
        case 'OrdersReturnRequest':
          return renderScreen('OrdersReturnRequest', { navigation, route: { params: routeParams } });
        case 'OrdersReturnAcceptedModal':
          return renderScreen('OrdersReturnAcceptedModal', { navigation, route: { params: routeParams } });
        case 'OrdersExchangeSizeSelectionChart':
          return renderScreen('OrdersExchangeSizeSelectionChart', { navigation, route: { params: routeParams } });
        case 'OrdersCancelOrder':
          return renderScreen('OrdersCancelOrderModal', { navigation, route: { params: routeParams } });
        case 'EditProfile':
          return renderScreen('EditProfile', { navigation });
        case 'Settings':
          return renderScreen('SettingsScreen', { navigation });
        case 'DeliveryAddressesSettings':
          return renderScreen('DeliveryAddressesSettings', { navigation });
        case 'CommunicationPreferences':
          return renderScreen('CommunicationPreferences', { navigation });  
        case 'ProfileVisibilityScreen':
          return renderScreen('ProfileVisibilityScreen', { navigation });
        case 'LinkedAccount':
          return renderScreen('LinkedAccountScreen', { navigation });
        case 'DeleteAccount':
          return renderScreen('DeleteAccount', { navigation });
        case 'DeleteAccountConfirmation':
          return renderScreen('DeleteAccountConfirmation', { navigation });
        case 'ContactUs':
          return renderScreen('ContactUsScreen', { navigation });
        case 'Invoice':
          return renderScreen('InvoiceScreen', { navigation });
        case 'InvoiceDetails':
          return renderScreen('InvoiceDetails', { navigation, route: { params: routeParams } });
        case 'LoveUsRateUs':
          return renderScreen('LoveUsRateUs', { navigation, route: { params: routeParams } });
        case 'FAQ':
          return renderScreen('FAQScreen', { navigation });
        case 'ProductViewOne':
          return renderScreen('ProductViewOne', { navigation, route: { params: routeParams } });
        case 'ProductViewTwo':
          return renderScreen('ProductViewTwo', { navigation });
        case 'ProductViewThree':
          return renderScreen('ProductViewThree', { navigation });
        case 'ProductDetailsMain':
          return <ProductDetailsMain navigation={navigation} route={{ params: routeParams }} />;
        case 'TryOnProTips':
          return renderScreen('TryOnProTips', { navigation, route: { params: routeParams } });
        case 'TryOnUploadPhotoFromGallery':
          return renderScreen('TryOnUploadPhotoFromGallery', { navigation, route: { params: routeParams } });
        case 'TryUploadFromGalleryUploadModal':
          return renderScreen('TryUploadFromGalleryUploadModal', { navigation, route: { params: routeParams } });
        case 'ProductDetailsMainReview':
          return renderScreen('ProductDetailsMainReview', { navigation, route: { params: routeParams } });
        case 'ProductDetailsReviewThreePointSelection':
          return renderScreen('ProductDetailsReviewThreePointSelection', { navigation, route: { params: routeParams } });
        case 'ProductDetailsWrittenUserReview':
          return renderScreen('ProductDetailsWrittenUserReview', { navigation, route: { params: routeParams } });
        case 'DeliveryOptionsStepOneScreen':
          return renderScreen('DeliveryOptionsStepOneScreen', { navigation });
        case 'deliveryoptionsstepone':
          return renderScreen('DeliveryOptionsStepOneScreen', { navigation, route: { params: routeParams } });
        case 'deliveryaddress':
          return renderScreen('DeliveryAddress', { navigation, route: { params: routeParams } });
        case 'DeliveryOptionsStepTwo':
          return renderScreen('DeliveryOptionsStepTwoScreen', { navigation, route: { params: routeParams } });
        case 'Language':
          return renderScreen('Language', { navigation, route: { params: routeParams } });
        case 'Region':
          return renderScreen('Region', { navigation });
        case 'MembersExclusive':
          return renderScreen('MembersExclusive', { navigation });
        case 'PointsHistory':
          return renderScreen('PointsHistory', { navigation, route: { params: routeParams } });
        case 'InviteAFriend':
          return renderScreen('InviteAFriend', { navigation, route: { params: routeParams } });
        case 'Inbox':
          return renderScreen('Inbox', { navigation, route: { params: routeParams } });
        case 'OrderConfirmationPhone':
        case 'orderconfirmationphone':
          return renderScreen('OrderConfirmationPhone', { navigation, route: { params: routeParams } });
        case 'DeliveryOptionsStepFourIfCustomRequired':
          return renderScreen('DeliveryOptionsStepFourIfCustomRequired', { navigation, route: { params: routeParams } });
        case 'DeliveryOptionsStepThreeAddAddress':
          return renderScreen('DeliveryOptionsStepThreeAddAddress', { navigation, route: { params: routeParams } });
        default:
          return <HomeContent />;
      }
    } catch (error) {
      console.error('Error rendering screen:', currentScreen, error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Screen failed to load. Please try again.
          </Text>
        </View>
      );
    }
  };

  const shouldShowBottomNav = ['Home', 'Shop', 'Collection', 'Rewards', 'Profile'].includes(currentScreen);
  const shouldShowHeader = ['Profile'].includes(currentScreen);

  const handleClosePreferenceModal = () => {
    setShowPreferenceModal(false);
    // Don't navigate here - let the PreferenceSelector handle its own navigation
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Dynamic Header - Only show for main tabs except Collection and Home */}
        {shouldShowHeader && activeTab !== 'Home' && activeTab !== 'Profile' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {renderContent()}
        </View>
      </SafeAreaView>

      {/* Bottom Navigation - Only show for main tabs */}
      {shouldShowBottomNav && (
        <BottomNavigationBar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* PreferenceSelector Modal */}
      <PreferenceSelector 
        visible={showPreferenceModal}
        navigation={navigation}
        onClose={handleClosePreferenceModal}
        route={{ params: routeParams }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export { EnhancedLayout };
export default EnhancedLayout;
