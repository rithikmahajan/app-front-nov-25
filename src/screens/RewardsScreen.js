import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import authManager from '../services/authManager';
import { yoraaAPI } from '../services/yoraaAPI';
import auth from '@react-native-firebase/auth';

const SHOPPING_PREFERENCES = ['Women', 'Men'];
const ADDITIONAL_PREFERENCES = ['Boy', 'Women', 'Mens', 'Girls'];

const RewardsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('rewards'); // Default to rewards tab
  const [selectedShoppingPreference, setSelectedShoppingPreference] = useState('Women');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  
  // API-driven state
  const [bannerData, setBannerData] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [loyaltyTiers, setLoyaltyTiers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdditionalPreferences, setSelectedAdditionalPreferences] = useState(['Boy']);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch banner and rewards data from API
  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 Fetching rewards data...');
        
        let bannerSuccess = false;
        let tiersSuccess = false;
        
        // Fetch banner data (required)
        try {
          const bannerResponse = await yoraaAPI.getRewardsBanner();
          console.log('📦 Banner response:', bannerResponse);
          if (bannerResponse?.data) {
            setBannerData(bannerResponse.data);
            bannerSuccess = true;
          }
        } catch (bannerError) {
          console.error('❌ Banner fetch failed:', bannerError.message);
        }
        
        // Fetch loyalty tiers (required)
        try {
          const tiersResponse = await yoraaAPI.getLoyaltyTiers();
          console.log('📦 Tiers response:', tiersResponse);
          if (tiersResponse?.tiers && Array.isArray(tiersResponse.tiers)) {
            setLoyaltyTiers(tiersResponse.tiers);
            tiersSuccess = true;
          }
        } catch (tiersError) {
          console.error('❌ Tiers fetch failed:', tiersError.message);
        }
        
        // Fetch user points if authenticated (optional - can fail gracefully)
        if (isUserAuthenticated) {
          try {
            const loyaltyStatus = await yoraaAPI.getUserLoyaltyStatus();
            console.log('📦 User loyalty status:', loyaltyStatus);
            if (loyaltyStatus) {
              setUserPoints(loyaltyStatus);
              console.log('✅ User points loaded:', loyaltyStatus.points);
            }
          } catch (pointsError) {
            console.log('⚠️ Could not fetch user points:', pointsError.message);
            
            // Check if it's a backend validation error
            if (pointsError.message.includes('userId') || pointsError.message.includes('required')) {
              console.error('🚨 BACKEND ERROR: Backend cannot extract userId from JWT token');
              console.error('📋 Backend team: Check BACKEND_URGENT_FIX_REQUIRED.md for fix');
            }
            
            // Don't throw - user just won't see their points
            setUserPoints(null);
          }
        } else {
          console.log('⚠️ User not authenticated, skipping points fetch');
          setUserPoints(null);
        }
        
        // Only set error if BOTH critical endpoints failed
        if (!bannerSuccess && !tiersSuccess) {
          setError('Unable to connect to backend. Please check your connection and try again.');
        }
        
      } catch (err) {
        console.error('❌ Error fetching rewards data:', err);
        setError(err.message || 'Failed to load rewards data');
      } finally {
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, [isUserAuthenticated]);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = auth().currentUser;
      setIsUserAuthenticated(!!currentUser);
    };

    // Initial check
    checkAuthStatus();

    // Listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setIsUserAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

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
            returnScreen: 'Bag'
          });
        }, 500);
      }
    });

    return removeAuthListener;
  }, [navigation, route?.params?.fromCheckout, route?.params?.bagData]);

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

  const renderRewardsTab = () => {
    // Show loading state
    if (loading) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      );
    }

    // Show error state if API failed
    if (error) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Connection Error</Text>
          <Text style={styles.errorSubtext}>
            {error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Trigger re-fetch by updating a dependency
              setIsUserAuthenticated(prev => prev);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Use API data - no fallbacks
    const banner = bannerData || {};
    const tiers = loyaltyTiers || [];
    const userPointsData = userPoints?.points || null;
    const hasPoints = userPointsData && (userPointsData.current > 0 || userPointsData.used > 0);
    
    // Debug logging
    console.log('🔍 DEBUG - userPoints:', JSON.stringify(userPoints, null, 2));
    console.log('🔍 DEBUG - userPointsData:', JSON.stringify(userPointsData, null, 2));
    console.log('🔍 DEBUG - hasPoints:', hasPoints);

    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Black promotional section - API driven */}
        <View style={styles.promoSection}>
          <Text style={styles.promoWant}>{banner.headerText || 'WANT'}</Text>
          <Text style={styles.promoDiscount}>{banner.discountText || '10% OFF'}</Text>
          <Text style={styles.promoSubtext}>{banner.subtitleText || 'YOUR NEXT PURCHASE?'}</Text>
          <Text style={styles.promoBonus}>{banner.bonusText || 'PLUS REWARD GIVEAWAY AND MORE!'}</Text>
          
          <Text style={styles.promoQuestion}>{banner.questionText || 'What are you waiting for?'}</Text>
          <Text style={styles.promoCTA}>{banner.ctaText || 'Become a rewards member today!'}</Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressSection}>
          {tiers.length > 0 && (
            <View style={styles.levelIndicator}>
              {tiers.map((tier, index) => {
                const tierName = tier.name?.toLowerCase() || '';
                const textColor = (tierName === 'silver' || tierName === 'gold' || tierName === 'platinum') ? '#000000' : '#FFFFFF';
                const currentPoints = userPointsData?.current || 0;
                
                // Show user's current points for ALL tiers (like Flipkart)
                // This displays the user's actual point balance across all circles
                const displayPoints = currentPoints > 0 ? currentPoints : tier.pointsRequired;
                
                // Debug logging for first tier only
                if (index === 0) {
                  console.log('🎯 Tier Display Debug (Flipkart-style):');
                  console.log('  - User current points:', currentPoints);
                  console.log('  - Tier requirement:', tier.pointsRequired);
                  console.log('  - Display value:', displayPoints);
                  console.log('  - Logic: Showing user balance for all circles');
                }
                
                return (
                  <View key={tier.id || tier.name} style={styles.levelPoint}>
                    <View style={[
                      styles.levelDot,
                      { backgroundColor: tier.color || '#CD7F32' },
                      currentPoints >= tier.pointsRequired && styles.levelDotActive
                    ]}>
                      <Text style={[
                        styles.levelPoints,
                        { color: textColor }
                      ]}>
                        {displayPoints}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          
          <Text style={styles.journeyText}>
            The journey to becoming ✨ XCLUSIVE
          </Text>
          
          {/* Show different UI based on whether user has points */}
          {hasPoints ? (
            <View style={styles.pointsSection}>
              <TouchableOpacity onPress={() => navigation.navigate('PointsHistory', { previousScreen: 'Rewards', activeSubTab: activeTab })}>
                <Text style={styles.currentPointsLabel}>Current Points</Text>
              </TouchableOpacity>
              <View style={styles.pointsRow}>
                <Text style={styles.currentPoints}>{userPointsData.current}</Text>
                <View style={styles.pointsUsedSection}>
                  <Text style={styles.pointsUsed}>{userPointsData.used}</Text>
                  <Text style={styles.pointsUsedLabel}>Points Used</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noPointsSection}>
              <Text style={styles.noPointsText}>No purchases yet</Text>
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopNowButtonText}>Shop Now to Earn Points</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 12,
    color: '#CA3327',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
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

  // No points section
  noPointsSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  noPointsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767676',
    marginBottom: 20,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
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
