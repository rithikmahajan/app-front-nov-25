import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';
import GlobalBackButton from '../components/GlobalBackButton';
import { StarIcon } from '../assets/icons';
import ProductDetailsMainReviewUserThanksForReviewModal from './productdetailsmainreviewuserthanksforreviewmodal';
import { yoraaAPI } from '../services/yoraaAPI';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Image Upload Icon Component (Photo) - Updated to match Figma design precisely
const ImageUploadIcon = () => (
  <Svg width="35" height="35" viewBox="0 0 35 35" fill="none">
    <Path 
      d="M3.5 17.6667C3.5 12.1669 3.5 9.41709 5.20854 7.70854C6.91709 6 9.66695 6 15.1667 6H18.0833C23.5831 6 26.3329 6 28.0415 7.70854C29.75 9.41709 29.75 12.1669 29.75 17.6667V20.5833C29.75 26.0831 29.75 28.8329 28.0415 30.5415C26.3329 32.25 23.5831 32.25 18.0833 32.25H15.1667C9.66695 32.25 6.91709 32.25 5.20854 30.5415C3.5 28.8329 3.5 26.0831 3.5 20.5833V17.6667Z" 
      stroke="#CCD2E3" 
      strokeWidth="2"
    />
    <Path 
      d="M10.7732 18.874C11.5758 18.8063 12.3822 18.9613 13.1023 19.3223C13.9654 19.7551 14.5192 20.4964 14.9636 21.2861C15.4038 22.0685 15.8493 23.1122 16.3826 24.3564L16.4597 24.5381C16.7089 25.1195 16.8572 25.4597 16.9841 25.6924C16.9901 25.7033 16.9973 25.713 17.0027 25.7227C17.0114 25.7157 17.0223 25.7102 17.032 25.7021C17.2363 25.5332 17.4996 25.2717 17.947 24.8242C18.5328 24.2384 19.036 23.7332 19.4841 23.3555C19.9463 22.966 20.45 22.6236 21.0701 22.4365C21.8941 22.188 22.7734 22.1879 23.5974 22.4365C24.2173 22.6236 24.7203 22.9661 25.1824 23.3555C25.627 23.7302 26.1258 24.2305 26.7058 24.8105C26.7038 26.5063 26.6938 27.8083 26.6267 28.8555L24.658 26.8867C24.0365 26.2653 23.6334 25.8649 23.3025 25.5859C22.9857 25.319 22.8363 25.2532 22.7546 25.2285C22.48 25.1457 22.1865 25.1457 21.9119 25.2285C21.8302 25.2532 21.6807 25.3191 21.364 25.5859C21.0331 25.8649 20.6309 26.2653 20.0095 26.8867C19.6034 27.2928 19.2262 27.6715 18.8904 27.9492C18.5508 28.23 18.0937 28.5464 17.4958 28.6514C16.7911 28.775 16.0652 28.6353 15.4568 28.2588C14.9408 27.9394 14.6346 27.4757 14.4236 27.0889C14.2149 26.7063 14.0053 26.2144 13.7791 25.6865L13.7009 25.5049C13.1412 24.1988 12.7663 23.3283 12.4216 22.7158C12.0815 22.1115 11.885 21.975 11.7947 21.9297C11.5547 21.8094 11.2858 21.7577 11.0183 21.7803C10.9176 21.7888 10.6846 21.8425 10.1443 22.2773C9.5967 22.7181 8.9256 23.3866 7.9207 24.3916L6.2966 26.0146C6.2926 25.3934 6.2917 24.7111 6.2917 23.958V21.8965C7.0613 21.1293 7.725 20.4817 8.3162 20.0059C9.0221 19.4377 9.811 18.9553 10.7732 18.874Z" 
      fill="#CCD2E3"
    />
    <Circle 
      cx="22.1875" 
      cy="15.9375" 
      r="2.1875" 
      fill="#CCD2E3"
    />
  </Svg>
);

// Camera Icon Component - Updated to match Figma design precisely
const CameraUploadIcon = () => (
  <Svg width="33" height="33" viewBox="0 0 28 28" fill="none">
    <Path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.1984 6.53504L4.83303 7.12638C3.60882 7.43243 2.75 8.53238 2.75 9.79427V22C2.75 23.5188 3.98122 24.75 5.5 24.75H22C23.5188 24.75 24.75 23.5188 24.75 22V9.79427C24.75 8.53238 23.8912 7.43243 22.667 7.12638L20.3016 6.53504L18.1864 3.36229C17.9314 2.97976 17.5021 2.75 17.0424 2.75H10.4576C9.9979 2.75 9.56858 2.97976 9.31356 3.36229L7.1984 6.53504ZM5.5 4.125L4.16605 4.45849C1.71764 5.07059 0 7.2705 0 9.79427V22C0 25.0376 2.46243 27.5 5.5 27.5H22C25.0376 27.5 27.5 25.0376 27.5 22V9.79427C27.5 7.2705 25.7824 5.07059 23.3339 4.45849L22 4.125L20.4746 1.83686C19.7095 0.689292 18.4216 0 17.0424 0H10.4576C9.07843 0 7.79047 0.689291 7.02543 1.83686L5.5 4.125Z" 
      fill="#CCD2E3"
    />
    <Path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M19.25 13.75C19.25 16.7876 16.7876 19.25 13.75 19.25C10.7124 19.25 8.25 16.7876 8.25 13.75C8.25 10.7124 10.7124 8.25 13.75 8.25C16.7876 8.25 19.25 10.7124 19.25 13.75ZM16.5 13.75C16.5 15.2688 15.2688 16.5 13.75 16.5C12.2312 16.5 11 15.2688 11 13.75C11 12.2312 12.2312 11 13.75 11C15.2688 11 16.5 12.2312 16.5 13.75Z" 
      fill="#CCD2E3"
    />
    <Path 
      d="M20.625 11C21.3844 11 22 10.3844 22 9.625C22 8.86561 21.3844 8.25 20.625 8.25C19.8656 8.25 19.25 8.86561 19.25 9.625C19.25 10.3844 19.8656 11 20.625 11Z" 
      fill="#CCD2E3"
    />
  </Svg>
);

const ProductDetailsWrittenUserReview = ({ navigation, route }) => {
  const [starRating, setStarRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showThanksModal, setShowThanksModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Get review data from previous screen and product information
  const { reviewData, product, productId } = route.params || {};
  const finalProductId = productId || product?._id || product?.id || product?.productId;
  
  console.log('🔍 Product received in write review:', product);
  console.log('🔍 Final Product ID extracted:', finalProductId);

  // Restore review data if user is returning from login
  useEffect(() => {
    if (reviewData) {
      if (reviewData.starRating) {
        setStarRating(reviewData.starRating);
      }
      if (reviewData.reviewText) {
        setReviewText(reviewData.reviewText);
      }
      if (reviewData.selectedImages) {
        setSelectedImages(reviewData.selectedImages);
      }
      console.log('✅ Restored review data after login:', reviewData);
    }
  }, [reviewData]);

  const handleBackPress = useCallback(() => {
    if (navigation) {
      navigation.navigate('ProductDetailsReviewThreePointSelection');
    }
  }, [navigation]);

  const handleStarPress = useCallback((rating) => {
    setStarRating(rating);
  }, []);

  const handleImageResponse = useCallback((response) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      setSelectedImages(prev => [...prev, imageUri]);
    }
  }, []);

  const showImagePicker = useCallback(() => {
    if (selectedImages.length >= 2) {
      Alert.alert('Maximum Images', 'You can only upload 2 images maximum.');
      return;
    }

    const options = ['Take Photo', 'Choose from Library', 'Cancel'];
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Select Image',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            // Take Photo
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
              },
              handleImageResponse
            );
          } else if (buttonIndex === 1) {
            // Choose from Library
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
              },
              handleImageResponse
            );
          }
        }
      );
    } else {
      // For Android, show Alert with options
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
              },
              handleImageResponse
            );
          }},
          { text: 'Choose from Library', onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
              },
              handleImageResponse
            );
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  }, [selectedImages.length, handleImageResponse]);

  const removeImage = useCallback((index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePostReview = useCallback(async () => {
    // Validate input
    if (!starRating || starRating < 1) {
      Alert.alert('Invalid Review', 'Please select a star rating before submitting.');
      return;
    }

    if (!finalProductId) {
      Alert.alert('Error', 'Product information is missing. Please try again.');
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert('Invalid Review', 'Please write a review before submitting.');
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = yoraaAPI.isAuthenticated();
    console.log('🔍 handlePostReview - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      // User is not authenticated, navigate to LoginAccountMobileNumber for login
      console.log('🔒 User not authenticated, navigating to LoginAccountMobileNumber to sign in');
      Alert.alert(
        'Sign In Required',
        'Please sign in to write a review.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => {
              navigation.navigate('LoginAccountMobileNumber', { 
                fromReview: true,
                returnScreen: 'ProductDetailsWrittenUserReview',
                reviewData: {
                  starRating,
                  reviewText,
                  selectedImages,
                  productId: finalProductId,
                  product,
                  ...reviewData
                }
              });
            }
          }
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📝 Submitting review for product:', finalProductId);

      // Prepare review data for API submission
      const reviewDataToSubmit = {
        rating: starRating,
        comment: reviewText.trim(),
        title: reviewData?.title || '', // Optional title from previous screen
        images: selectedImages, // Include selected images
        // Add any other fields from reviewData if needed
        ...reviewData,
      };

      const response = await yoraaAPI.submitProductReview(finalProductId, reviewDataToSubmit);

      if (response.success) {
        console.log('✅ Review submitted successfully');
        setShowThanksModal(true);
      } else {
        console.error('❌ Failed to submit review:', response.message);
        Alert.alert(
          'Submission Failed', 
          response.message || 'Failed to submit your review. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      
      // Handle duplicate review error specially
      if (error.isDuplicateReviewError) {
        console.log('ℹ️ User has already reviewed this product');
        Alert.alert(
          'Review Already Submitted', 
          'You have already reviewed this product. Each user can only submit one review per product.',
          [
            {
              text: 'View Product',
              onPress: () => {
                if (navigation && navigation.navigate) {
                  navigation.navigate('ProductDetailsMain');
                }
              }
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          '', 
          error.message || 'Failed to submit review. Please check your internet connection and try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewData, starRating, reviewText, finalProductId, selectedImages, navigation, product]);

  const handleContinueShopping = useCallback(() => {
    setShowThanksModal(false);
    
    // Check if user came from orders.js (via rate product flow)
    if (route.params?.order) {
      // Navigate back to orders if user came from orders.js
      if (navigation && navigation.navigate) {
        navigation.navigate('Orders');
      }
    } else {
      // Navigate to productdetailsmain.js if came from regular product details flow
      if (navigation && navigation.navigate) {
        navigation.navigate('ProductDetailsMain');
      }
    }
  }, [navigation, route.params?.order]);

  const handleCloseModal = useCallback(() => {
    setShowThanksModal(false);
    // Navigate back to previous screen
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  const isFormValid = useMemo(() => starRating > 0, [starRating]);

  const renderStars = useCallback(() => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(index)}
            style={styles.starButton}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${index} star${index > 1 ? 's' : ''} out of 5`}
            accessibilityHint="Double tap to rate this product"
          >
            <StarIcon 
              size={35} 
              filled={index <= starRating} 
              fillColor="#FBBC05"
              strokeColor="#000000"
              strokeWidth={0.5}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [starRating, handleStarPress]);

  const renderImageUpload = () => (
    <View style={styles.imageUploadContainer}>
      {/* First image slot */}
      <TouchableOpacity 
        style={styles.imageUploadButton}
        onPress={selectedImages.length === 0 ? showImagePicker : undefined}
        onLongPress={selectedImages.length > 0 ? () => {
          Alert.alert(
            'Remove Image',
            'Do you want to remove this image?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeImage(0) }
            ]
          );
        } : undefined}
        delayLongPress={500}
      >
        {selectedImages.length > 0 ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImages[0] }} style={styles.uploadedImage} />
            <View style={styles.removeImageOverlay}>
              <Text style={styles.removeImageText}>✕</Text>
            </View>
          </View>
        ) : (
          <ImageUploadIcon />
        )}
      </TouchableOpacity>
      
      {/* Second image slot */}
      <TouchableOpacity 
        style={styles.cameraUploadButton}
        onPress={selectedImages.length < 2 ? showImagePicker : undefined}
        onLongPress={selectedImages.length > 1 ? () => {
          Alert.alert(
            'Remove Image',
            'Do you want to remove this image?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeImage(1) }
            ]
          );
        } : undefined}
        delayLongPress={500}
      >
        {selectedImages.length > 1 ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImages[1] }} style={styles.uploadedImage} />
            <View style={styles.removeImageOverlay}>
              <Text style={styles.removeImageText}>✕</Text>
            </View>
          </View>
        ) : (
          <CameraUploadIcon />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F8F9FA" 
        translucent={false}
      />
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <GlobalBackButton 
              onPress={handleBackPress}
              style={styles.headerButton}
              iconSize={20}
            />
            
            <Text style={styles.headerTitle}>Your review</Text>
            
            <View style={styles.headerButton} />
          </View>

      <View style={styles.content}>
        {/* Rating Question */}
        <View style={styles.ratingSection}>
          <Text style={styles.questionText}>What is your opinion of product ?</Text>
          {renderStars()}
        </View>

        {/* Review Text Input */}
        <View style={styles.reviewInputContainer}>
          <TextInput
            style={styles.reviewInput}
            placeholder="Would you like to write anything about this product ?"
            placeholderTextColor="#5A5A5A"
            multiline
            value={reviewText}
            onChangeText={setReviewText}
            maxLength={500}
          />
          <Text style={styles.characterCount}>50 characters</Text>
        </View>

        {/* Image Upload Section */}
        {renderImageUpload()}

        {/* Post Review Button */}
        <TouchableOpacity 
          style={[
            styles.postButton,
            (!isFormValid || isSubmitting) && styles.postButtonDisabled
          ]} 
          onPress={handlePostReview}
          disabled={!isFormValid || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Post your review"
          accessibilityHint={!isFormValid ? "Please select a star rating first" : isSubmitting ? "Submitting your review" : "Submit your review"}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.postButtonText,
              (!isFormValid || isSubmitting) && styles.postButtonTextDisabled
            ]}>Post Review</Text>
          )}
        </TouchableOpacity>
      </View>

        {/* Thanks for Review Modal */}
        <ProductDetailsMainReviewUserThanksForReviewModal
          visible={showThanksModal}
          onContinueShopping={handleContinueShopping}
          onClose={handleCloseModal}
        />
        </View>
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaBottom} />
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 1,
    backgroundColor: '#F8F9FA', // neutral-50 from Figma
  },
  safeAreaBottom: {
    flex: 0,
    backgroundColor: '#F8F9FA', // neutral-50 from Figma
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // neutral-50 from Figma
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5.6),
    paddingVertical: hp(1.4),
    backgroundColor: '#F8F9FA',
    gap: wp(2.7),
  },
  headerButton: {
    width: wp(18),
    height: hp(2.8),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14.5) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
    textAlign: 'center',
    flex: 1,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },

  // Rating Section
  ratingSection: {
    alignItems: 'center',
    marginBottom: hp(4.7),
    paddingTop: hp(6.1),
  },
  questionText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12.5) : fs(14),
    fontWeight: '500',
    color: '#121420',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: hp(2.8),
    letterSpacing: -0.07,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: wp(2.7),
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    padding: 0,
  },

  // Review Input
  reviewInputContainer: {
    marginBottom: hp(3.5),
    marginHorizontal: wp(7.7),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(5.3),
    minHeight: hp(31.3),
    paddingHorizontal: wp(6.9),
    paddingTop: hp(5.3),
    paddingBottom: hp(4.2),
    position: 'relative',
  },
  reviewInput: {
    fontSize: isTablet ? fs(13.5) : isSmallDevice ? fs(11) : fs(12),
    fontFamily: 'Montserrat-Regular',
    color: '#5A5A5A',
    backgroundColor: 'transparent',
    flex: 1,
    textAlignVertical: 'top',
    lineHeight: isTablet ? fs(18) : isSmallDevice ? fs(14.5) : fs(16),
    borderWidth: 0,
    padding: 0,
  },
  characterCount: {
    fontSize: isTablet ? fs(13.5) : isSmallDevice ? fs(11) : fs(12),
    color: '#5A5A5A',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
    position: 'absolute',
    bottom: hp(4.2),
    right: wp(6.1),
    lineHeight: isTablet ? fs(18) : isSmallDevice ? fs(14.5) : fs(16),
  },

  // Image Upload
  imageUploadContainer: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: hp(3.5),
    marginHorizontal: wp(8),
    justifyContent: 'flex-start',
  },
  imageUploadButton: {
    width: wp(18.4),
    height: hp(7.5),
    borderWidth: wp(0.5),
    borderColor: '#CCD2E3',
    borderRadius: wp(4),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  cameraUploadButton: {
    width: wp(18.4),
    height: hp(7.5),
    borderWidth: wp(0.5),
    borderColor: '#CCD2E3',
    borderRadius: wp(4),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginLeft: wp(7.8),
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp(3.5),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  removeImageOverlay: {
    position: 'absolute',
    top: hp(0.2),
    right: wp(0.5),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: wp(2.7),
    width: wp(5.3),
    height: hp(2.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(13.5) : isSmallDevice ? fs(11) : fs(12),
    fontWeight: 'bold',
  },
  imageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIconBackground: {
    width: wp(9.3),
    height: hp(4.1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIconText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14.5) : fs(16),
  },

  // Post Button
  postButton: {
    marginHorizontal: wp(8),
    marginTop: 'auto',
    marginBottom: hp(4.7),
    height: hp(5.6),
    borderRadius: wp(6.4),
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  postButtonText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14.5) : fs(16),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: isTablet ? fs(25) : isSmallDevice ? fs(20.5) : fs(22.5),
  },
  postButtonTextDisabled: {
    color: '#999999',
  },
});

export default ProductDetailsWrittenUserReview;
