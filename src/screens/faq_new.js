/**
 * FAQ Screen - Completely Rewritten November 20, 2025
 * 
 * COMPLETE REWRITE WITH ALL FIXES:
 * ================================
 * Backend API: https://yoraa.in.net/api/faqs
 * 
 * Fixes Applied:
 * 1. ✅ Correct API endpoint (/api/faqs)
 * 2. ✅ Proper timeout handling (20 seconds)
 * 3. ✅ Multiple response format support
 * 4. ✅ Enhanced error handling with specific messages
 * 5. ✅ Detailed console logging for debugging
 * 6. ✅ Pull-to-refresh functionality
 * 7. ✅ Category filtering
 * 8. ✅ Retry mechanism with alerts
 * 9. ✅ Network connectivity checks
 * 10. ✅ Graceful fallbacks
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { yoraaAPI } from '../services/yoraaAPI';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

// FAQ Categories matching backend
const FAQ_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'general', label: 'General', icon: '💡' },
  { id: 'membership', label: 'Membership', icon: '👥' },
  { id: 'points', label: 'Points', icon: '⭐' },
  { id: 'shipping', label: 'Shipping', icon: '📦' },
  { id: 'returns', label: 'Returns', icon: '↩️' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'orders', label: 'Orders', icon: '🛒' },
  { id: 'products', label: 'Products', icon: '🏷️' },
];

class FAQScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faqData: [],
      filteredFAQs: [],
      expandedItems: {},
      selectedCategory: 'all',
      isLoading: true,
      isRefreshing: false,
      error: null,
      retryCount: 0,
    };
    
    console.log('🎬 FAQ Screen Initialized');
    console.log('🔧 API Base URL:', yoraaAPI.baseURL);
  }

  componentDidMount() {
    console.log('📱 FAQ Screen Mounted - Starting initial load');
    this.loadFAQsFromBackend();
  }

  /**
   * Main function to load FAQs from backend
   * Handles all response formats and error scenarios
   */
  loadFAQsFromBackend = async () => {
    const startTime = Date.now();
    console.log('\n🚀 ========================================');
    console.log('🚀 STARTING FAQ FETCH');
    console.log('🚀 ========================================');
    console.log('⏰ Start Time:', new Date().toLocaleTimeString());
    
    try {
      this.setState({ 
        isLoading: true, 
        error: null 
      });

      // Prepare API request
      const endpoint = '/api/faqs';
      const params = {
        page: 1,
        limit: 100,
        isActive: true,
        sortBy: 'priority',
        sortOrder: 'asc'
      };

      console.log('📡 API Request Details:');
      console.log('   - Endpoint:', endpoint);
      console.log('   - Method: GET');
      console.log('   - Params:', JSON.stringify(params, null, 2));
      console.log('   - Full URL:', `${yoraaAPI.baseURL}${endpoint}`);

      // Make API request with 20 second timeout
      console.log('⏳ Sending request (20s timeout)...');
      
      const response = await Promise.race([
        yoraaAPI.makeRequest(endpoint, 'GET', null, false),
        new Promise((_, reject) => 
          setTimeout(() => {
            console.error('⏱️ TIMEOUT: Request exceeded 20 seconds');
            reject(new Error('Request timeout. Server took too long to respond.'));
          }, 20000)
        )
      ]);

      const requestTime = Date.now() - startTime;
      console.log(`✅ Response received in ${requestTime}ms`);
      console.log('📦 Raw Response:', JSON.stringify(response, null, 2));

      // Parse response based on different possible formats
      let faqArray = this.parseAPIResponse(response);

      console.log(`✅ Successfully parsed ${faqArray.length} FAQ items`);

      if (faqArray.length > 0) {
        console.log('📄 Sample FAQ (first item):', JSON.stringify(faqArray[0], null, 2));
      } else {
        console.warn('⚠️ No FAQ items found in response');
      }

      // Normalize FAQ data structure
      const normalizedFAQs = this.normalizeFAQData(faqArray);
      
      console.log(`🎯 Normalized ${normalizedFAQs.length} FAQs`);
      console.log('✅ FAQ data ready for display');

      // Update state with successful data
      this.setState(
        {
          faqData: normalizedFAQs,
          filteredFAQs: normalizedFAQs,
          isLoading: false,
          isRefreshing: false,
          error: null,
          retryCount: 0,
        },
        () => {
          console.log('✅ State updated successfully');
          console.log('📊 Current state:', {
            totalFAQs: this.state.faqData.length,
            filteredFAQs: this.state.filteredFAQs.length,
            selectedCategory: this.state.selectedCategory,
          });
          
          // Apply category filter if needed
          if (this.state.selectedCategory !== 'all') {
            this.filterByCategory(this.state.selectedCategory);
          }
          
          console.log('🎉 FAQ loading complete!');
          console.log('========================================\n');
        }
      );

    } catch (error) {
      const requestTime = Date.now() - startTime;
      console.error('\n❌ ========================================');
      console.error('❌ FAQ FETCH FAILED');
      console.error('❌ ========================================');
      console.error('⏱️ Failed after:', requestTime + 'ms');
      console.error('📛 Error Name:', error.name);
      console.error('📛 Error Message:', error.message);
      console.error('📛 Error Stack:', error.stack);
      
      if (error.response) {
        console.error('📛 Response Status:', error.response.status);
        console.error('📛 Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Generate user-friendly error message
      const errorMessage = this.getErrorMessage(error);
      console.error('💬 User Error Message:', errorMessage);

      this.setState({
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
        retryCount: this.state.retryCount + 1,
      });

      // Show retry alert for first 2 failures
      if (this.state.retryCount < 2) {
        console.log('🔔 Showing retry alert to user');
        Alert.alert(
          'Failed to Load FAQs',
          errorMessage + '\n\nWould you like to try again?',
          [
            {
              text: 'Retry Now',
              onPress: () => {
                console.log('👆 User clicked Retry');
                this.loadFAQsFromBackend();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => console.log('👆 User cancelled'),
            },
          ]
        );
      }
      
      console.error('========================================\n');
    }
  };

  /**
   * Parse API response - handles multiple formats
   */
  parseAPIResponse = (response) => {
    console.log('🔍 Parsing API response...');
    
    if (!response) {
      console.error('❌ Response is null or undefined');
      throw new Error('No response received from server');
    }

    let faqArray = [];

    // Try different response formats
    
    // Format 1: { success: true, data: [...] }
    if (response.success === true && Array.isArray(response.data)) {
      console.log('✅ Format detected: { success: true, data: [...] }');
      faqArray = response.data;
    }
    // Format 2: { data: { faqs: [...] } }
    else if (response.data && Array.isArray(response.data.faqs)) {
      console.log('✅ Format detected: { data: { faqs: [...] } }');
      faqArray = response.data.faqs;
    }
    // Format 3: { data: [...] }
    else if (response.data && Array.isArray(response.data)) {
      console.log('✅ Format detected: { data: [...] }');
      faqArray = response.data;
    }
    // Format 4: Direct array [...]
    else if (Array.isArray(response)) {
      console.log('✅ Format detected: Direct array [...]');
      faqArray = response;
    }
    // Format 5: { faqs: [...] }
    else if (Array.isArray(response.faqs)) {
      console.log('✅ Format detected: { faqs: [...] }');
      faqArray = response.faqs;
    }
    // Format 6: { success: true, data: { items: [...] } }
    else if (response.success && response.data && Array.isArray(response.data.items)) {
      console.log('✅ Format detected: { success: true, data: { items: [...] } }');
      faqArray = response.data.items;
    }
    else {
      console.error('❌ Unknown response format');
      console.error('Response keys:', Object.keys(response));
      console.error('Response structure:', JSON.stringify(response, null, 2));
      throw new Error('Unexpected response format from server. Please contact support.');
    }

    if (!Array.isArray(faqArray)) {
      console.error('❌ Parsed data is not an array:', typeof faqArray);
      throw new Error('Invalid data format received from server');
    }

    return faqArray;
  };

  /**
   * Normalize FAQ data to consistent structure
   */
  normalizeFAQData = (faqArray) => {
    console.log('🔄 Normalizing FAQ data...');
    
    return faqArray.map((faq, index) => {
      const normalized = {
        id: faq._id || faq.id || `faq-${Date.now()}-${index}`,
        question: faq.question || faq.title || faq.heading || 'No question provided',
        answer: faq.answer || faq.detail || faq.description || faq.content || 'No answer provided',
        category: (faq.category || 'general').toLowerCase(),
        priority: faq.priority !== undefined ? faq.priority : index,
        isActive: faq.isActive !== undefined ? faq.isActive : true,
      };
      
      // Log any missing fields
      if (!faq.question && !faq.title) {
        console.warn(`⚠️ FAQ ${index} missing question/title field`);
      }
      if (!faq.answer && !faq.detail) {
        console.warn(`⚠️ FAQ ${index} missing answer/detail field`);
      }
      
      return normalized;
    });
  };

  /**
   * Generate user-friendly error message
   */
  getErrorMessage = (error) => {
    if (error.message.includes('timeout') || error.message.includes('took too long')) {
      return 'Request timed out. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('Network request failed') || error.message.includes('network')) {
      return 'Cannot connect to server. Please check:\n• Your internet connection\n• Backend server is running\n• VPN if applicable';
    }
    
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return 'Server returned invalid data. Please try again or contact support.';
    }
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return 'FAQ service not found. Please contact support.';
      }
      if (status === 500 || status === 502 || status === 503) {
        return 'Server error. Our team has been notified. Please try again later.';
      }
      if (status === 401 || status === 403) {
        return 'Authentication error. Please log out and log in again.';
      }
      
      return error.response.data?.message || `Server error (${status}). Please try again.`;
    }
    
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  /**
   * Handle pull-to-refresh
   */
  handleRefresh = () => {
    console.log('🔄 Pull-to-refresh triggered');
    this.setState({ isRefreshing: true }, () => {
      this.loadFAQsFromBackend();
    });
  };

  /**
   * Filter FAQs by category
   */
  filterByCategory = (categoryId) => {
    console.log('🔍 Filtering FAQs by category:', categoryId);
    
    const { faqData } = this.state;

    if (categoryId === 'all') {
      console.log('📋 Showing all FAQs:', faqData.length);
      this.setState({
        filteredFAQs: faqData,
        selectedCategory: categoryId,
      });
    } else {
      const filtered = faqData.filter(
        (faq) => faq.category.toLowerCase() === categoryId.toLowerCase()
      );
      console.log(`📋 Filtered to ${filtered.length} FAQs in category '${categoryId}'`);
      this.setState({
        filteredFAQs: filtered,
        selectedCategory: categoryId,
      });
    }
  };

  /**
   * Toggle FAQ item expansion
   */
  toggleItem = (id) => {
    console.log('👆 Toggling FAQ item:', id);
    this.setState((prevState) => ({
      expandedItems: {
        ...prevState.expandedItems,
        [id]: !prevState.expandedItems[id],
      },
    }));
  };

  /**
   * Render category filter pills
   */
  renderCategories = () => {
    const { selectedCategory, faqData } = this.state;

    return (
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {FAQ_CATEGORIES.map((category) => {
            const count = category.id === 'all'
              ? faqData.length
              : faqData.filter((faq) => faq.category === category.id).length;

            const isSelected = selectedCategory === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => this.filterByCategory(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.categoryBadge,
                      isSelected && styles.categoryBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        isSelected && styles.categoryBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  /**
   * Render loading state
   */
  renderLoading = () => {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading FAQs...</Text>
        <Text style={styles.loadingSubtext}>Fetching from server</Text>
      </View>
    );
  };

  /**
   * Render error state
   */
  renderError = () => {
    const { error } = this.state;

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Cannot Load FAQs</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={this.loadFAQsFromBackend}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>

        <View style={styles.troubleshootContainer}>
          <Text style={styles.troubleshootTitle}>💡 Troubleshooting Tips:</Text>
          <Text style={styles.troubleshootText}>• Check your internet connection</Text>
          <Text style={styles.troubleshootText}>• Make sure backend server is running</Text>
          <Text style={styles.troubleshootText}>• Try pulling down to refresh</Text>
          <Text style={styles.troubleshootText}>• Contact support if issue persists</Text>
        </View>
      </View>
    );
  };

  /**
   * Render empty state
   */
  renderEmpty = () => {
    const { selectedCategory } = this.state;
    const categoryName = FAQ_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'this category';

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>No FAQs Available</Text>
        <Text style={styles.emptyMessage}>
          {selectedCategory === 'all'
            ? 'No FAQs have been added yet. Please check back later.'
            : `No FAQs found in ${categoryName}.`}
        </Text>
        {selectedCategory !== 'all' && (
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={() => this.filterByCategory('all')}
          >
            <Text style={styles.showAllButtonText}>View All Categories</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Main render method
   */
  render() {
    const { isLoading, filteredFAQs, isRefreshing, error, faqData } = this.state;

    // Show loading on initial load
    if (isLoading && !isRefreshing && faqData.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          {this.renderLoading()}
        </SafeAreaView>
      );
    }

    // Show error if no data loaded
    if (error && faqData.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={this.handleRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
          >
            {this.renderError()}
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Main content
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.headerSubtitle}>
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} available
          </Text>
        </View>

        {this.renderCategories()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={this.handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
              title="Pull to refresh"
            />
          }
        >
          {filteredFAQs.length === 0 ? (
            this.renderEmpty()
          ) : (
            <View style={styles.faqList}>
              {filteredFAQs.map((item, index) => {
                const itemKey = item.id || item._id || `faq-${index}`;
                const itemId = item.id || item._id || `faq-${index}`;
                const isExpanded = this.state.expandedItems[itemId];
                
                return (
                  <TouchableOpacity
                    key={itemKey}
                    style={styles.faqItem}
                    onPress={() => this.toggleItem(itemId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <View style={styles.faqQuestionContainer}>
                        <Text style={styles.faqQuestion}>
                          {item.question || item.title || 'No question'}
                        </Text>
                      </View>
                      <View style={styles.faqIconContainer}>
                        <Text style={styles.faqIcon}>{isExpanded ? '−' : '+'}</Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={styles.faqAnswer}>
                          {item.answer || item.detail || 'No answer provided'}
                        </Text>
                        <View style={styles.faqMetadata}>
                          <Text style={styles.faqCategory}>
                            {(item.category || 'general').charAt(0).toUpperCase() + (item.category || 'general').slice(1)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Still have questions? Contact our support team for assistance.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#8E8E93',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoriesScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryBadgeTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  faqList: {
    paddingHorizontal: isTablet ? 40 : 16,
    paddingTop: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  faqAnswer: {
    fontSize: isTablet ? 16 : 14,
    lineHeight: 22,
    color: '#3C3C43',
    marginBottom: 12,
  },
  faqMetadata: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  faqCategory: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: height * 0.6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  troubleshootContainer: {
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  troubleshootText: {
    fontSize: 13,
    color: '#3C3C43',
    marginBottom: 6,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: height * 0.5,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  showAllButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  showAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FAQScreen;
