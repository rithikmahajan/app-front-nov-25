import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../constants';
import authManager from '../services/authManager';
import { yoraaAPI } from '../services/yoraaAPI';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sample user data
const USER_POINTS = {
  current: 100,
  used: 0,
  level: 'bronze', // bronze, silver, gold, platinum, black
};

const LEVELS = [
  { name: 'bronze', points: 100, color: '#CD7F32' },
  { name: 'silver', points: 200, color: '#D9D9D9' },
  { name: 'gold', points: 300, color: '#D4AF37' },
  { name: 'platinum', points: 400, color: '#B075A5' },
  { name: 'black', points: 500, color: '#000000' },
];

const LANGUAGES = [
  { code: 'en', name: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी (India)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (España)', flag: '🇪🇸' },
];

const REGIONS = [
  { code: 'UK', name: 'United Kingdom (GBP £)', flag: '🇬🇧' },
  { code: 'IN', name: 'India (USD $)', flag: '🇮🇳' },
  { code: 'US', name: 'United States (USD $)', flag: '🇺🇸' },
];

const SHOPPING_PREFERENCES = ['Women', 'Men'];
const ADDITIONAL_PREFERENCES = ['Boy', 'Women', 'Mens', 'Girls'];

const RewardsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('giveaways'); // Default to giveaways as per requirement
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('IN');
  const [selectedShoppingPreference, setSelectedShoppingPreference] = useState('Women');

  // Handle navigation back from other screens with specific sub-tab
  useEffect(() => {
    if (route?.params?.activeSubTab) {
      setActiveTab(route.params.activeSubTab);
    }
  }, [route?.params?.activeSubTab]);

  // Handle post-login navigation for checkout flow
  useEffect(() => {
    const removeAuthListener = authManager.addAuthStateListener(async (user) => {
      // Only handle navigation if coming from checkout and user just signed in
      if (user && route?.params?.fromCheckout && yoraaAPI.isAuthenticated()) {
        console.log('✅ User signed in from checkout flow, navigating to delivery options');
        
        // Small delay to ensure auth state is fully settled
        setTimeout(() => {
          navigation.navigate('deliveryoptionsstepone', {
            fromCheckout: true,
            bagData: route?.params?.bagData,
            returnScreen: 'bag'
          });
        }, 500);
      }
    });

    return removeAuthListener;
  }, [navigation, route?.params?.fromCheckout, route?.params?.bagData]);
  const [selectedAdditionalPreferences, setSelectedAdditionalPreferences] = useState(['Boy']);
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'rewards' && styles.activeTab]}
        onPress={() => setActiveTab('rewards')}
      >
        <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>
          Rewards
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'giveaways' && styles.activeTab]}
        onPress={() => setActiveTab('giveaways')}
      >
        <Text style={[styles.tabText, activeTab === 'giveaways' && styles.activeTabText]}>
          Giveaways
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRewardsTab = () => (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Black promotional section */}
      <View style={styles.promoSection}>
        <Text style={styles.promoWant}>WANT</Text>
        <Text style={styles.promoDiscount}>10% OFF</Text>
        <Text style={styles.promoSubtext}>YOUR NEXT PURCHASE?</Text>
        <Text style={styles.promoBonus}>PLUS REWARD GIVEAWAY AND MORE!</Text>
        
        <Text style={styles.promoQuestion}>What are you waiting for?</Text>
        <Text style={styles.promoCTA}>Become arewards member today!</Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.levelIndicator}>
          {LEVELS.map((level, index) => (
            <View key={level.name} style={styles.levelPoint}>
              <View style={[
                styles.levelDot,
                { backgroundColor: level.color },
                USER_POINTS.current >= level.points && styles.levelDotActive
              ]}>
                <Text style={[
                  styles.levelPoints,
                  { color: level.name === 'silver' || level.name === 'gold' || level.name === 'platinum' ? '#000000' : '#FFFFFF' }
                ]}>
                  {level.points}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <Text style={styles.journeyText}>
          The journey to becoming ✨ XCLUSIVE
        </Text>
        
        <View style={styles.pointsSection}>
          <TouchableOpacity onPress={() => navigation.navigate('PointsHistory', { previousScreen: 'Rewards', activeSubTab: activeTab })}>
            <Text style={styles.currentPointsLabel}>Current Points</Text>
          </TouchableOpacity>
          <View style={styles.pointsRow}>
            <Text style={styles.currentPoints}>{USER_POINTS.current}</Text>
            <View style={styles.pointsUsedSection}>
              <Text style={styles.pointsUsed}>{USER_POINTS.used}</Text>
              <Text style={styles.pointsUsedLabel}>Points Used</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderGiveawaysTab = () => (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContentContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Dynamic yellow section */}
      <Animated.View style={[styles.yellowSection, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 200],
            outputRange: [0, -50],
            extrapolate: 'clamp',
          })
        }]
      }]}>
        <TouchableOpacity 
          style={styles.membersExclusiveButton}
          onPress={() => navigation.navigate('MembersExclusive', { previousScreen: 'Rewards' })}
        >
          <Text style={styles.membersExclusiveText}>MEMBERS EXCLUSIVE</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Static content below */}
      <View style={styles.staticContent}>
        {/* Sign in and Create Account buttons */}
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation && navigation.navigate('LoginAccountMobileNumber', { fromCheckout: route?.params?.fromCheckout })}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={() => navigation && navigation.navigate('CreateAccountMobileNumber', { fromCheckout: route?.params?.fromCheckout })}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Language and Region */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Language and region</Text>
          
          <TouchableOpacity 
            style={styles.preferenceItem}
            onPress={() => navigation.navigate('Language', { previousScreen: 'Rewards' })}
          >
            <View style={styles.preferenceLeft}>
              <Text style={styles.flagIcon}>🌐</Text>
              <View>
                <Text style={styles.preferenceMain}>English (United kingdom)</Text>
                <Text style={styles.preferenceLabel}>Language</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.preferenceItem}
            onPress={() => navigation.navigate('Region', { previousScreen: 'Rewards' })}
          >
            <View style={styles.preferenceLeft}>
              <Text style={styles.flagIcon}>🇮🇳</Text>
              <View>
                <Text style={styles.preferenceMain}>India (USD $)</Text>
                <Text style={styles.preferenceLabel}>Region</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <Text style={styles.shippingNote}>
            You are currently shipping to India and your order will be billed in USD $
          </Text>
        </View>

        {/* Shopping Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>My shopping preferences</Text>
          
          {SHOPPING_PREFERENCES.map((pref) => (
            <TouchableOpacity
              key={pref}
              style={styles.radioItem}
              onPress={() => setSelectedShoppingPreference(pref)}
            >
              <Text style={styles.radioLabel}>{pref}</Text>
              <View style={styles.radioButton}>
                {selectedShoppingPreference === pref && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
          
          <Text style={styles.preferenceNote}>
            Tailor your app experience with the items most suited to you
          </Text>
        </View>

        {/* Additional Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Additional preferences</Text>
          
          {ADDITIONAL_PREFERENCES.map((pref, index) => (
            <TouchableOpacity
              key={pref}
              style={[
                styles.checkboxItem, 
                index === ADDITIONAL_PREFERENCES.length - 1 && styles.lastCheckboxItem
              ]}
              onPress={() => {
                if (selectedAdditionalPreferences.includes(pref)) {
                  setSelectedAdditionalPreferences(prev => prev.filter(p => p !== pref));
                } else {
                  setSelectedAdditionalPreferences(prev => [...prev, pref]);
                }
              }}
            >
              <Text style={
                pref === 'Women' && !selectedAdditionalPreferences.includes(pref) 
                  ? styles.checkboxLabelGrayed 
                  : styles.checkboxLabel
              }>
                {pref}
              </Text>
              <View style={styles.checkbox}>
                {selectedAdditionalPreferences.includes(pref) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderTabButtons()}
      {activeTab === 'rewards' ? renderRewardsTab() : renderGiveawaysTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 0, // Remove any bottom padding from SafeAreaView
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContentContainer: {
    paddingBottom: 120, // Moderate padding for bottom navigation
  },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD',
    backgroundColor: '#FFFFFF',
    height: 46,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },

  // Rewards Tab Styles
  promoSection: {
    backgroundColor: '#000000',
    padding: 40,
    alignItems: 'center',
    height: 499,
    justifyContent: 'center',
  },
  promoWant: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.3,
  },
  promoDiscount: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
    fontFamily: 'Montserrat-Bold',
  },
  promoSubtext: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  promoBonus: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 40,
    fontFamily: 'Montserrat-Bold',
  },
  promoQuestion: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  promoCTA: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },

  progressSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    width: '100%',
  },
  levelPoint: {
    alignItems: 'center',
  },
  levelDot: {
    width: 39,
    height: 39,
    borderRadius: 19.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelDotActive: {
    // Active state styling if needed
  },
  levelPoints: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  levelLine: {
    width: 30,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  journeyText: {
    fontSize: 13,
    color: '#6F6F6F',
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  pointsSection: {
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 37,
    width: '100%',
  },
  currentPointsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    textDecorationLine: 'underline',
    fontFamily: 'Montserrat-Medium',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 37,
  },
  currentPoints: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 19,
    fontFamily: 'Montserrat-Medium',
  },
  pointsUsedSection: {
    alignItems: 'flex-end',
  },
  pointsUsed: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CA3327',
    lineHeight: 19,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'right',
  },
  pointsUsedLabel: {
    fontSize: 16,
    color: '#CD4035',
    marginTop: 8,
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    textAlign: 'right',
  },

  // Giveaways Tab Styles
  yellowSection: {
    backgroundColor: '#FFFB25',
    paddingTop: 17,
    paddingBottom: 17,
    paddingHorizontal: 20,
    height: 300, // Increased back to a reasonable size
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  expiresText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  giveawayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 250,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  membersExclusiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    height: 23,
    width: 204,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },
  membersExclusiveText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },

  staticContent: {
    backgroundColor: '#FFFFFF',
    paddingTop: 17,
    paddingHorizontal: 20,
    paddingBottom: 40, // Increased bottom padding
    flex: 1,
    minHeight: 124,
  },
  expiresTextStatic: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  giveawayTitleStatic: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },

  // Auth Buttons
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20, // Increased horizontal margin for better spacing
    marginTop: 15, // Further reduced from 30 to position buttons closer to yellow section
    marginBottom: 30,
    paddingHorizontal: 0,
    alignItems: 'center', // Ensure buttons are centered
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 20, // Reduced from 51 to make button smaller
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
    width: 140, // Reduced from 162 to make room for Create Account button
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 15, // Reduced padding for better text fit
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
    width: 180, // Increased width to accommodate "Create Account" text properly
    marginLeft: 20, // Reduced margin to fit both buttons
  },
  createAccountButtonText: {
    color: '#000000',
    fontSize: 15, // Slightly reduced font size for better fit
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },

  // Preferences Sections
  preferencesSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  flagIcon: {
    fontSize: 20,
  },
  preferenceMain: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#767676',
    marginTop: 2,
    fontFamily: 'Montserrat-Medium',
  },
  chevron: {
    fontSize: 20,
    color: '#000000',
  },
  shippingNote: {
    fontSize: 10,
    color: '#767676',
    marginTop: 10,
    lineHeight: 12,
    fontFamily: 'Montserrat-Medium',
  },

  // Radio buttons
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
  },
  radioLabel: {
    fontSize: 15,
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  radioButton: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#000000',
  },
  preferenceNote: {
    fontSize: 10,
    color: '#767676',
    marginTop: 6,
    lineHeight: 12,
    fontFamily: 'Montserrat-Medium',
  },

  // Checkboxes
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
  },
  lastCheckboxItem: {
    borderBottomWidth: 0, // Remove border from last item
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  checkboxLabelGrayed: {
    fontSize: 15,
    color: '#D6D6D6',
    fontFamily: 'Montserrat-Medium',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#BCBCBC',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111111',
  },
});

export default RewardsScreen;
