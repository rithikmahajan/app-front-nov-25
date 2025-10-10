/**
 * FAQ Screen with Backend API Integration
 * 
 * This component fetches FAQ data from the backend API and displays it in an accordion-style interface.
 * 
 * Backend API Endpoints Used:
 * - GET /api/faqs - Fetch all FAQs
 * - GET /api/faqs/:id - Fetch specific FAQ by ID
 * - GET /api/faqs/category/:category - Fetch FAQs by category
 * 
 * Features:
 * - Loads FAQ data from backend API on component mount
 * - Falls back to default FAQ data if API call fails
 * - Pull-to-refresh functionality
 * - Loading states and error handling
 * - Expandable/collapsible FAQ items
 * - Retry functionality for failed API calls
 * 
 * Expected API Response Format:
 * {
 *   faqs: [
 *     {
 *       id: number,
 *       question: string,
 *       answer: string,
 *       category?: string,
 *       order?: number,
 *       isActive?: boolean
 *     }
 *   ]
 * }
 * 
 * Alternative format (direct array):
 * [
 *   {
 *     id: number,
 *     question: string,
 *     answer: string
 *   }
 * ]
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { YoraaAPI } from '../../YoraaAPIClient';

// Plus/Minus Icon Component
const ExpandIcon = ({ isExpanded }) => (
  <View style={styles.iconContainer}>
    {/* Horizontal line */}
    <View style={styles.horizontalLine} />
    {/* Vertical line - hidden when expanded */}
    {!isExpanded && <View style={styles.verticalLine} />}
  </View>
);

// Default FAQ data (fallback if API fails)
const DEFAULT_FAQ_DATA = [
  {
    id: 1,
    question: "WHAT DO I NEED TO KNOW BEFORE SIGNING UP TO THE YORAA MEMBERSHIP?",
    answer: "All your purchases in store and online are rewarded with points. To collect points in store, always remember to scan your membership ID via the H&M app. You can also earn points by completing your profile, earning you 20 points, by recycling your garments earning you 20 points, by bringing your own bag when you shop in-store earning you 5 points, and by inviting your friends to become members. You'll earn 50 points for every new member that completes their first purchase. Your points will be displayed on your membership account which can take up to 24 hours to update."
  },
  {
    id: 2,
    question: "FOR HOW LONG ARE MY POINTS VALID?",
    answer: "Your points are valid for 12 months from the date they were earned. After this period, they will expire and cannot be used for purchases. We recommend using your points regularly to ensure they don't expire."
  },
  {
    id: 3,
    question: "WHEN DO I REACH PLUS LEVEL?",
    answer: "You reach Plus level when you spend $200 or more in a calendar year. Once you achieve Plus status, you'll enjoy additional benefits such as free shipping, early access to sales, and exclusive member events."
  },
  {
    id: 4,
    question: "HOW DO BONUS VOUCHERS WORK?",
    answer: "Bonus vouchers are special rewards that you can earn through various activities like completing your profile, referring friends, or reaching spending milestones. These vouchers can be applied to your purchases for additional discounts."
  },
  {
    id: 5,
    question: "WHY HAVEN'T I RECEIVED MY BONUS VOUCHER YET?",
    answer: "Bonus vouchers typically take 24-48 hours to appear in your account after meeting the requirements. If you still haven't received it after this time, please contact our customer service team for assistance."
  },
  {
    id: 6,
    question: "HOW LONG WILL I KEEP THE PLUS STATUS?",
    answer: "Your Plus status is maintained for one full calendar year from the date you first achieved it. To maintain Plus status for the following year, you'll need to spend $200 or more again during that calendar year."
  }
];

const FAQScreen = ({ navigation }) => {
  // State management
  const [expandedItems, setExpandedItems] = useState({ 1: true }); // First item expanded by default
  const [faqData, setFaqData] = useState(DEFAULT_FAQ_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch FAQ data from backend
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        console.log('[FAQ] Starting to fetch FAQs from backend...');
        setLoading(true);
        setError(null);
        
        // Initialize API client
        await YoraaAPI.initialize();
        
        // Fetch FAQs from backend
        const response = await YoraaAPI.getFAQs();
        console.log('[FAQ] API Response:', response);
        
        if (response && response.faqs && Array.isArray(response.faqs)) {
          console.log('[FAQ] Successfully loaded FAQs from response.faqs:', response.faqs.length);
          setFaqData(response.faqs);
        } else if (response && Array.isArray(response)) {
          console.log('[FAQ] Successfully loaded FAQs from direct array:', response.length);
          setFaqData(response);
        } else {
          console.warn('[FAQ] Unexpected FAQ response format, using default data:', response);
          setFaqData(DEFAULT_FAQ_DATA);
        }
      } catch (apiError) {
        console.error('[FAQ] Error fetching FAQs:', apiError);
        setError(YoraaAPI.handleError(apiError));
        
        // Use default data as fallback
        setFaqData(DEFAULT_FAQ_DATA);
        
        // Show error alert but don't block the UI
        Alert.alert(
          'FAQ Loading Error',
          'Unable to load FAQs from server. Showing default content.',
          [{ text: 'OK', style: 'default' }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const refreshFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await YoraaAPI.initialize();
      const response = await YoraaAPI.getFAQs();
      
      if (response && response.faqs && Array.isArray(response.faqs)) {
        setFaqData(response.faqs);
      } else if (response && Array.isArray(response)) {
        setFaqData(response);
      } else {
        console.warn('Unexpected FAQ response format:', response);
        setFaqData(DEFAULT_FAQ_DATA);
      }
    } catch (apiError) {
      console.error('Error refreshing FAQs:', apiError);
      setError(YoraaAPI.handleError(apiError));
      setFaqData(DEFAULT_FAQ_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Method to fetch FAQs by category if needed (for future use)
  // eslint-disable-next-line no-unused-vars
  const fetchFAQsByCategory = async (category) => {
    try {
      console.log(`[FAQ] Fetching FAQs for category: ${category}`);
      await YoraaAPI.initialize();
      const response = await YoraaAPI.getFAQsByCategory(category);
      
      if (response && response.faqs && Array.isArray(response.faqs)) {
        setFaqData(response.faqs);
      } else if (response && Array.isArray(response)) {
        setFaqData(response);
      }
    } catch (apiError) {
      console.error('Error fetching FAQs by category:', apiError);
      setError(YoraaAPI.handleError(apiError));
    }
  };

  // Method to fetch individual FAQ details if needed (for future use)
  // eslint-disable-next-line no-unused-vars
  const fetchFAQById = async (faqId) => {
    try {
      console.log(`[FAQ] Fetching FAQ details for ID: ${faqId}`);
      await YoraaAPI.initialize();
      const response = await YoraaAPI.getFAQById(faqId);
      console.log(`[FAQ] FAQ details response:`, response);
      return response;
    } catch (apiError) {
      console.error('Error fetching FAQ by ID:', apiError);
      return null;
    }
  };

  const handleBack = () => {
    console.log('[FAQ] Back button pressed, navigating to Profile');
    if (navigation && navigation.navigate) {
      console.log('[FAQ] Navigation object exists, calling navigate');
      navigation.navigate('Profile');
    } else {
      console.log('[FAQ] Navigation object missing or navigate method not available');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton}>
          <GlobalBackButton 
            navigation={navigation} 
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          />
        </View>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.headerRight} />
      </View>

      {/* FAQ Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshFAQs}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading FAQs...</Text>
          </View>
        )}
        
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load FAQs from server. Showing cached content.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshFAQs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {faqData.map((item, index) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.questionContainer} 
              onPress={() => toggleItem(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Toggle FAQ: ${item.question}`}
              accessibilityState={{ expanded: expandedItems[item.id] }}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <ExpandIcon isExpanded={expandedItems[item.id]} />
            </TouchableOpacity>
            
            {expandedItems[item.id] && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  headerRight: {
    width: 68,
  },

  // Content Styles
  scrollView: {
    flex: 1,
    paddingHorizontal: 32,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  faqItem: {
    marginBottom: 16,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 4,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 16.8, // 1.2 line height
    flex: 1,
    marginRight: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  answerContainer: {
    marginTop: 8,
    paddingRight: 20,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#848688',
    lineHeight: 16.8, // 1.2 line height
    fontFamily: 'Montserrat-Medium',
  },

  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#848688',
    marginTop: 12,
    fontFamily: 'Montserrat-Medium',
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#856404',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Icon Styles
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  horizontalLine: {
    width: 11,
    height: 1.5,
    backgroundColor: '#000000',
    borderRadius: 0.75,
  },
  verticalLine: {
    width: 1.5,
    height: 11,
    backgroundColor: '#000000',
    borderRadius: 0.75,
    position: 'absolute',
  },
});

export default FAQScreen;
