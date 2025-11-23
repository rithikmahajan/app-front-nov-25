import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TermsAndConditions = ({ navigation, route }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleBackPress = () => {
    // Check if we have previousScreen in route params
    const previousScreen = route?.params?.previousScreen;
    
    if (previousScreen) {
      // Navigate back to the specific previous screen
      navigation.navigate(previousScreen);
    } else {
      // Default fallback navigation based on likely entry points
      // TermsAndConditions is typically accessed from login verification screens
      navigation.goBack();
    }
  };

  const handleRead = async () => {
    // Handle read terms and conditions - open external link
    const url = 'https://yoraa.co';
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the link');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error opening URL:', error);
      }
      Alert.alert('Error', 'Unable to open the link');
    }
  };

  const handleYes = () => {
    if (isAccepted) {
      // Handle acceptance and proceed to HomeScreen
      
      // Get the user data from route params to pass along
      const user = route?.params?.user;
      const isNewUser = route?.params?.isNewUser;
      
      // Check if user is from checkout flow
      const fromCheckout = route?.params?.fromCheckout;
      const fromReview = route?.params?.fromReview;
      const returnScreen = route?.params?.reviewData?.returnScreen;
      
      if (navigation) {
        if (fromCheckout) {
          // From checkout: Skip preferences and go directly to delivery options
          console.log('User from checkout - navigating directly to deliveryoptionsstepone');
          navigation.navigate('deliveryoptionsstepone', {
            returnScreen: 'Bag',
            bagData: route?.params?.bagData,
            fromCheckout: true
          });
        } else if (fromReview) {
          // From review: Return to the appropriate review screen with review data
          const targetScreen = returnScreen || 'ProductDetailsWrittenUserReview';
          console.log(`User from review - navigating back to ${targetScreen}`);
          navigation.navigate(targetScreen, {
            reviewData: route?.params?.reviewData
          });
        } else {
          // Regular flow: Navigate directly to HomeScreen after accepting terms
          console.log('Terms accepted - navigating to HomeScreen');
          navigation.navigate('Home', { 
            user: user,
            isNewUser: isNewUser,
            fromTerms: true
          });
        }
      }
    }
  };

  const toggleAcceptance = () => {
    setIsAccepted(!isAccepted);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <GlobalBackButton onPress={handleBackPress} />
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        
        {/* Main Content Area - Takes up most of the screen */}
        <View style={styles.mainContent}>
          {/* This area is intentionally empty to match the Figma design */}
        </View>

        {/* Bottom Section with Terms and Buttons */}
        <View style={styles.bottomSection}>
          
          {/* Checkbox and Terms Text */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={toggleAcceptance}
            >
              <View style={[
                styles.checkbox,
                isAccepted && styles.checkboxChecked
              ]}>
                {isAccepted && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              I have read and accepted the privacy polices and understand the purchase condition.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.readButton}
              onPress={handleRead}
            >
              <Text style={styles.readButtonText}>Read</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.yesButton,
                !isAccepted && styles.yesButtonDisabled
              ]}
              onPress={handleYes}
              disabled={!isAccepted}
            >
              <Text style={[
                styles.yesButtonText,
                !isAccepted && styles.yesButtonTextDisabled
              ]}>
                Yes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    // Empty space as per Figma design
  },
  bottomSection: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    marginBottom: 30,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#BCBCBC',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#111111',
  },
  checkmark: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    color: '#111111',
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    lineHeight: 24,
    letterSpacing: -0.384,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  readButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    flex: 1,
    maxWidth: SCREEN_WIDTH * 0.42,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  readButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  yesButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000000',
    flex: 1,
    maxWidth: SCREEN_WIDTH * 0.42,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  yesButtonDisabled: {
    borderColor: '#CCCCCC',
  },
  yesButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  yesButtonTextDisabled: {
    color: '#CCCCCC',
  },
});

export default TermsAndConditions;
