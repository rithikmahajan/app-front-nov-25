import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { yoraaAPI } from '../services/yoraaAPI';

const ProductDetailsReviewThreePointSelection = ({ navigation, route }) => {
  const [sizeRating, setSizeRating] = useState(null); // 0-4 scale (Perfect = 2)
  const [comfortRating, setComfortRating] = useState(null);
  const [durabilityRating, setDurabilityRating] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Get product information from route params
  const product = route?.params?.product;
  const productId = product?._id || product?.id || product?.productId || route?.params?.productId;
  const reviewData = route?.params?.reviewData;

  console.log('🔍 ThreePointSelection - Product:', product);
  console.log('🔍 ThreePointSelection - Product ID:', productId);

  // Restore rating data if user is returning from login
  useEffect(() => {
    if (reviewData) {
      if (reviewData.sizeRating !== undefined && reviewData.sizeRating !== null) {
        setSizeRating(reviewData.sizeRating);
      }
      if (reviewData.comfortRating !== undefined && reviewData.comfortRating !== null) {
        setComfortRating(reviewData.comfortRating);
      }
      if (reviewData.durabilityRating !== undefined && reviewData.durabilityRating !== null) {
        setDurabilityRating(reviewData.durabilityRating);
      }
      console.log('✅ Restored rating data after login:', reviewData);
    }
  }, [reviewData]);

  // Get product image URL from API data
  const getProductImageUrl = () => {
    if (!product) return null;
    
    // Check various image fields from backend
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return null;
  };

  // Check if all ratings are selected
  const isAllSelected = sizeRating !== null && comfortRating !== null && durabilityRating !== null;

  const handleBackPress = () => {
    if (navigation) {
      navigation.navigate('ProductDetailsMainReview');
    }
  };

  const handleNext = async () => {
    // Only proceed if all ratings are selected
    if (!isAllSelected) {
      return;
    }

    if (!productId) {
      Alert.alert('Error', 'Product information is missing. Please try again.');
      return;
    }

    // Check if user is authenticated before proceeding
    const isAuthenticated = yoraaAPI.isAuthenticated();
    console.log('🔍 handleNext - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      // User is not authenticated, navigate to LoginAccountMobileNumber for login
      console.log('🔒 User not authenticated, navigating to LoginAccountMobileNumber to sign in');
      Alert.alert(
        'Sign In Required',
        'Please sign in to rate this product.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => {
              navigation.navigate('LoginAccountMobileNumber', { 
                fromReview: true,
                returnScreen: 'ProductDetailsReviewThreePointSelection',
                reviewData: {
                  sizeRating,
                  comfortRating,
                  durabilityRating,
                  productId: productId,
                  product,
                  order: route?.params?.order
                }
              });
            }
          }
        ]
      );
      return;
    }

    try {
      setIsSubmittingRating(true);
      console.log('📊 Submitting detailed product ratings...');

      // Convert ratings to 1-5 scale for API (0-4 scale to 1-5 scale)
      const ratingData = {
        sizeRating: sizeRating + 1, // Convert 0-4 to 1-5
        comfortRating: comfortRating + 1, // Convert 0-4 to 1-5  
        durabilityRating: durabilityRating + 1, // Convert 0-4 to 1-5
        // Additional context
        size: sizeRating,
        comfort: comfortRating,
        durability: durabilityRating
      };

      console.log('📊 Rating data to submit:', ratingData);

      const response = await yoraaAPI.submitProductRating(productId, ratingData);

      if (response.success) {
        console.log('✅ Detailed ratings submitted successfully');
        
        // Navigate to written user review screen with rating data
        const nextScreenData = {
          size: sizeRating,
          comfort: comfortRating,
          durability: durabilityRating,
          detailedRatingsSubmitted: true
        };
        
        navigation.navigate('ProductDetailsWrittenUserReview', { 
          reviewData: nextScreenData,
          product: product,
          productId: productId,
          order: route?.params?.order
        });
      } else {
        console.error('❌ Failed to submit detailed ratings:', response.message);
        Alert.alert(
          'Rating Submission Failed', 
          response.message || 'Failed to submit your ratings. You can continue with the review.'
        );
        
        // Still allow user to continue to written review
        const nextScreenData = {
          size: sizeRating,
          comfort: comfortRating,
          durability: durabilityRating,
          detailedRatingsSubmitted: false
        };
        
        navigation.navigate('ProductDetailsWrittenUserReview', { 
          reviewData: nextScreenData,
          product: product,
          productId: productId,
          order: route?.params?.order
        });
      }
    } catch (error) {
      console.error('❌ Error submitting detailed ratings:', error);
      Alert.alert(
        'Network Error', 
        'Failed to submit ratings due to network issues. You can continue with the review.'
      );
      
      // Still allow user to continue to written review
      const nextScreenData = {
        size: sizeRating,
        comfort: comfortRating,
        durability: durabilityRating,
        detailedRatingsSubmitted: false
      };
      
      navigation.navigate('ProductDetailsWrittenUserReview', { 
        reviewData: nextScreenData,
        product: product,
        productId: productId,
        order: route?.params?.order
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderRatingScale = (rating, setRating, labels) => (
    <View style={styles.ratingScale}>
      {/* Rating dots */}
      <View style={styles.ratingRow}>
        {[0, 1, 2, 3, 4].map((index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.ratingDotContainer}
              onPress={() => setRating(index)}
            >
              <View style={[
                styles.ratingDot,
                rating === index && styles.ratingDotSelected
              ]} />
            </TouchableOpacity>
            {/* Connecting line between dots (not after last dot) */}
            {index < 4 && <View style={styles.ratingLine} />}
          </React.Fragment>
        ))}
      </View>
      
      {/* Labels */}
      <View style={styles.ratingLabels}>
        <Text style={styles.ratingLabelLeft}>{labels.left}</Text>
        {labels.center && <Text style={styles.ratingLabelCenter}>{labels.center}</Text>}
        <Text style={styles.ratingLabelRight}>{labels.right}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton 
          onPress={handleBackPress}
          style={styles.headerButton}
          iconSize={20}
        />
        
        <Text style={styles.headerTitle}>How was your product</Text>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <View style={styles.productImage}>
            {getProductImageUrl() ? (
              <Image
                source={{ uri: getProductImageUrl() }}
                style={styles.productImageActual}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}
          </View>
        </View>

        {/* Size Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>How was the size?</Text>
          {renderRatingScale(sizeRating, setSizeRating, {
            left: 'Too Small',
            center: 'Perfect',
            right: 'Too Big'
          })}
        </View>

        {/* Comfort Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>How was the comfort?</Text>
          {renderRatingScale(comfortRating, setComfortRating, {
            left: 'Uncomfortable',
            right: 'Comfortable'
          })}
        </View>

        {/* Durability Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>How was the durability?</Text>
          {renderRatingScale(durabilityRating, setDurabilityRating, {
            left: 'Non-Durable',
            center: 'Perfect',
            right: 'Durable'
          })}
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={[
            styles.nextButton,
            (!isAllSelected || isSubmittingRating) && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={!isAllSelected || isSubmittingRating}
        >
          {isSubmittingRating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.nextButtonText,
              (!isAllSelected || isSubmittingRating) && styles.nextButtonTextDisabled
            ]}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  // Product Image
  productImageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  productImage: {
    width: 122,
    height: 123,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImageActual: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  noImageText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },

  // Rating Container
  ratingContainer: {
    paddingHorizontal: 31,
    marginBottom: 35,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121420',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: -0.08,
    fontFamily: 'Montserrat-SemiBold',
  },

  // Rating Scale
  ratingScale: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 0,
    width: 313,
  },
  ratingDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingDot: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'transparent',
  },
  ratingDotSelected: {
    backgroundColor: '#000000',
  },
  ratingLine: {
    height: 1,
    backgroundColor: '#000000',
    width: 51,
    flex: 0,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 313,
    paddingTop: 10,
  },
  ratingLabelLeft: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.06,
    fontFamily: 'Montserrat-Regular',
  },
  ratingLabelCenter: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -25 }],
    letterSpacing: -0.06,
    fontFamily: 'Montserrat-Regular',
  },
  ratingLabelRight: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.06,
    fontFamily: 'Montserrat-Regular',
  },

    // Next Button
  nextButton: {
    marginHorizontal: 30,
    marginTop: 40,
    marginBottom: 20,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0,
    fontFamily: 'Montserrat-SemiBold',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
});

export default ProductDetailsReviewThreePointSelection;
