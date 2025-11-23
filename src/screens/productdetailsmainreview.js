import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';
import BottomNavigationBar from '../components/bottomnavigationbar';
import GlobalBackButton from '../components/GlobalBackButton';
import { StarIcon } from '../assets/icons';
import { yoraaAPI } from '../services/yoraaAPI';



const ProductDetailsMainReview = ({ navigation, route }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get product data from route params
  const product = route?.params?.product;
  const productId = product?._id || product?.id || product?.productId;
  
  console.log('🔍 Product received in reviews:', product);
  console.log('🔍 Product ID extracted:', productId);

  // Debug logging to understand what data we're receiving
  console.log('🔍 ProductDetailsMainReview - Route params:', route?.params);
  console.log('🔍 ProductDetailsMainReview - Product:', product);
  console.log('🔍 ProductDetailsMainReview - Product ID:', productId);

  const handleBackPress = () => {
    if (navigation) {
      // Navigate back to ProductDetailsMain with the product data
      if (product) {
        navigation.navigate('ProductDetailsMain', { product });
      } else {
        navigation.goBack();
      }
    }
  };

  const handleTabChange = (tabName) => {
    if (navigation) {
      // Map tab names to screen names
      switch(tabName) {
        case 'Shop':
          navigation.navigate('Bag');
          break;
        default:
          navigation.navigate(tabName);
          break;
      }
    }
  };

  const filterOptions = ['All', 'Photos', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  // Fetch product reviews and rating stats
  const fetchReviewData = useCallback(async (showRefreshIndicator = false) => {
    if (!productId) {
      console.error('❌ No product ID available for fetching reviews');
      console.error('❌ Product object received:', product);
      console.error('❌ Route params:', route?.params);
      setLoading(false);
      return;
    }
    
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📋 Fetching review data for product:', productId);

      // Fetch reviews and rating stats in parallel
      const [reviewsResponse, statsResponse] = await Promise.all([
        yoraaAPI.getProductReviews(productId, { 
          limit: 50,
          page: 1 
        }),
        yoraaAPI.getProductRatingStats(productId)
      ]);

      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data?.reviews || []);
      } else {
        console.log('⚠️ No reviews found for this product');
        setReviews([]);
      }

      if (statsResponse.success) {
        setRatingStats(statsResponse.data);
      } else {
        console.log('⚠️ No rating stats found for this product');
        // Set default stats if none found
        setRatingStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recommendationPercentage: 0
        });
      }

    } catch (error) {
      console.error('❌ Error fetching review data:', error);
      Alert.alert(
        'Error',
        'Failed to load reviews. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      // Set empty data on error
      setReviews([]);
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationPercentage: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId, product, route?.params]);

  // Handle marking review as helpful
  const handleMarkHelpful = async (reviewId) => {
    try {
      console.log('👍 Marking review as helpful:', reviewId);
      
      const response = await yoraaAPI.markReviewHelpful(reviewId);
      
      if (response.success) {
        // Update the local reviews state to reflect the change
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId || review._id === reviewId
              ? { ...review, helpful: (review.helpful || 0) + 1, userMarkedHelpful: true }
              : review
          )
        );
        
        Alert.alert('Success', 'Thank you for your feedback!');
      } else {
        Alert.alert('Error', response.message || 'Failed to mark review as helpful');
      }
    } catch (error) {
      console.error('❌ Error marking review as helpful:', error);
      Alert.alert('Error', 'Failed to mark review as helpful. Please try again.');
    }
  };

  // Filter reviews based on selected filter
  const getFilteredReviews = () => {
    if (selectedFilter === 'All') {
      return reviews;
    }
    
    if (selectedFilter === 'Photos') {
      return reviews.filter(review => review.hasPhotos || review.photos?.length > 0);
    }
    
    if (selectedFilter.includes('Star')) {
      const rating = parseInt(selectedFilter.split(' ')[0], 10);
      return reviews.filter(review => review.rating === rating);
    }
    
    return reviews;
  };

  // Load data when component mounts or product changes
  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString || 'Unknown date';
    }
  };

  const renderReviewItem = (review) => {
    const reviewId = review.id || review._id;
    const reviewerName = review.name || review.userName || review.user?.name || 'Anonymous';
    const reviewDate = formatDate(review.date || review.createdAt);
    const isVerified = review.verified || review.isVerified || false;
    const helpfulCount = review.helpful || review.helpfulCount || 0;
    const userMarkedHelpful = review.userMarkedHelpful || false;

    return (
      <View key={reviewId} style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {reviewerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.reviewerDetails}>
              <View style={styles.nameAndVerified}>
                <Text style={styles.reviewerName}>{reviewerName}</Text>
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.reviewDate}>{reviewDate}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= (review.rating || 0)} size={16} />
            ))}
          </View>
        </View>
        
        {review.title && (
          <Text style={styles.reviewTitle}>{review.title}</Text>
        )}
        <Text style={styles.reviewContent}>
          {review.content || review.comment || review.reviewText || 'No review text available'}
        </Text>
        
        <View style={styles.reviewFooter}>
          <TouchableOpacity 
            style={[
              styles.helpfulButton, 
              userMarkedHelpful && styles.helpfulButtonActive
            ]}
            onPress={() => !userMarkedHelpful && handleMarkHelpful(reviewId)}
            disabled={userMarkedHelpful}
          >
            <Text style={[
              styles.helpfulText,
              userMarkedHelpful && styles.helpfulTextActive
            ]}>
              {userMarkedHelpful ? '✓ Helpful' : 'Helpful'} ({helpfulCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get filtered reviews
  const filteredReviews = getFilteredReviews();
  
  // Calculate dynamic stats
  const averageRating = ratingStats?.averageRating || 0;
  const totalReviews = ratingStats?.totalReviews || reviews.length || 0;
  const recommendationPercentage = ratingStats?.recommendationPercentage || 0;
  const ratingDistribution = ratingStats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Calculate percentage for rating bars
  const getRatingPercentage = (rating) => {
    if (totalReviews === 0) return 0;
    return Math.round((ratingDistribution[rating] / totalReviews) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton onPress={handleBackPress} />
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Loading State */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>

        {/* Bottom Navigation */}
        <BottomNavigationBar 
          activeTab="Home" 
          onTabChange={handleTabChange}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton onPress={handleBackPress} />
        
        <Text style={styles.headerTitle}>Reviews</Text>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchReviewData(true)}
      >
        {/* Overall Rating Section */}
        <View style={styles.overallRatingContainer}>
          <View style={styles.leftRatingScore}>
            <Text style={styles.ratingScoreMain}>
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= Math.round(averageRating)} size={24} />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.rightRatingScore}>
            <Text style={styles.recommendPercent}>
              {recommendationPercentage > 0 ? Math.round(recommendationPercentage) : 0}%
            </Text>
            <Text style={styles.recommendText}>
              of customers recommend{'\n'}this product
            </Text>
          </View>
        </View>

        {/* Rating Breakdown */}
        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} style={styles.ratingRow}>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <StarIcon filled={true} size={16} />
              <View style={styles.ratingBarBackground}>
                <View 
                  style={[
                    styles.ratingBarFill, 
                    { width: `${getRatingPercentage(rating)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.ratingCount}>
                {ratingDistribution[rating] || 0}
              </Text>
            </View>
          ))}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredReviews.length > 0 ? (
            filteredReviews.map(renderReviewItem)
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>
                {selectedFilter === 'All' 
                  ? 'No reviews yet for this product'
                  : `No reviews found for ${selectedFilter.toLowerCase()}`
                }
              </Text>
              <Text style={styles.noReviewsSubtext}>
                Be the first to write a review!
              </Text>
            </View>
          )}
        </View>

        {/* Write Review Button */}
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={() => navigation.navigate('ProductDetailsReviewThreePointSelection', {
            product: product,
            productId: productId,
            order: route?.params?.order
          })}
        >
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar 
        activeTab="Home" 
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  headerButton: {
    width: isTablet ? wp(4) : wp(6),
    height: isTablet ? hp(3) : hp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },

  scrollContainer: {
    flex: 1,
  },

  // Overall Rating
  overallRatingContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
  leftRatingScore: {
    flex: 1,
    alignItems: 'flex-start',
  },
  ratingScoreMain: {
    fontSize: isTablet ? fs(54) : isSmallDevice ? fs(40) : fs(48),
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: hp(1),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
    gap: wp(1),
  },
  totalReviews: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666666',
    fontFamily: 'SF Pro Display',
  },
  rightRatingScore: {
    flex: 1,
    alignItems: 'flex-end',
  },
  recommendPercent: {
    fontSize: isTablet ? fs(54) : isSmallDevice ? fs(40) : fs(48),
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: hp(1),
  },
  recommendText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666666',
    fontFamily: 'SF Pro Display',
    textAlign: 'right',
    lineHeight: isTablet ? fs(23) : isSmallDevice ? fs(17) : fs(20),
  },

  // Rating Breakdown
  ratingBreakdown: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.4),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  ratingNumber: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#000000',
    width: wp(3),
    marginRight: wp(2),
  },
  ratingBarBackground: {
    flex: 1,
    height: hp(1),
    backgroundColor: '#F0F0F0',
    borderRadius: wp(1),
    marginHorizontal: wp(3),
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: wp(1),
  },
  ratingCount: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#666666',
    width: wp(5),
    textAlign: 'right',
  },

  // Filter
  filterContainer: {
    paddingVertical: hp(2),
  },
  filterScroll: {
    paddingHorizontal: wp(5),
  },
  filterButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: wp(3),
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'SF Pro Display',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Reviews
  reviewsList: {
    paddingHorizontal: wp(5),
  },
  reviewItem: {
    paddingVertical: hp(2.4),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  reviewerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: isTablet ? wp(8) : wp(10),
    height: isTablet ? wp(8) : wp(10),
    borderRadius: isTablet ? wp(4) : wp(5),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  avatarText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#666666',
  },
  reviewerDetails: {
    flex: 1,
  },
  nameAndVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  reviewerName: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginRight: wp(2),
  },
  verifiedBadge: {
    width: isTablet ? wp(3) : wp(4),
    height: isTablet ? wp(3) : wp(4),
    borderRadius: isTablet ? wp(1.5) : wp(2),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: fs(10),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666666',
    fontFamily: 'SF Pro Display',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: wp(0.5),
  },
  reviewTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: hp(1),
  },
  reviewContent: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#333333',
    fontFamily: 'SF Pro Display',
    lineHeight: isTablet ? fs(23) : isSmallDevice ? fs(17) : fs(20),
    marginBottom: hp(1.5),
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  helpfulButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
    borderRadius: wp(4),
    backgroundColor: '#F5F5F5',
  },
  helpfulText: {
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
    color: '#666666',
    fontFamily: 'SF Pro Display',
  },

  // Write Review Button
  writeReviewButton: {
    margin: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(6.25),
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  writeReviewText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Display',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  loadingText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#666666',
    marginTop: hp(1.5),
    fontFamily: 'SF Pro Display',
  },

  // No Reviews State
  noReviewsContainer: {
    padding: wp(10),
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: hp(1),
    fontFamily: 'SF Pro Display',
  },
  noReviewsSubtext: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
  },

  // Helpful Button States
  helpfulButtonActive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  helpfulTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default ProductDetailsMainReview;