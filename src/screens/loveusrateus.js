import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import GlobalBackButton from '../components/GlobalBackButton';
import yoraaAPI from '../services/yoraaBackendAPI';
import authStorageService from '../services/authStorageService';

// Star Rating Component with exact Figma design
const StarRating = ({ rating, onRatingPress }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingPress(star)}
          style={styles.starButton}
        >
          {star <= rating ? (
            // Filled stars
            <Svg width="45" height="32" viewBox="0 0 45 32" fill="none">
              <Path
                d="M23.6558 11.1753C23.3551 11.1782 23.0611 11.0894 22.8151 10.9213C22.5691 10.7532 22.3835 10.5143 22.2846 10.2383L19.1039 0.936539C19.0027 0.662351 18.8169 0.425233 18.5719 0.2576C18.3268 0.0899667 18.0345 0 17.7348 0C17.4352 0 17.1429 0.0899667 16.8978 0.2576C16.6528 0.425233 16.4669 0.662351 16.3658 0.936539L13.1676 10.2213C13.0686 10.4973 12.883 10.7361 12.637 10.9042C12.391 11.0723 12.097 11.1612 11.7963 11.1582H1.43515C1.13706 11.1514 0.844419 11.2368 0.599511 11.4021C0.354603 11.5675 0.170101 11.8042 0.0726491 12.0782C-0.0226684 12.3514 -0.0242315 12.6473 0.0681953 12.9215C0.160622 13.1957 0.342048 13.4333 0.58523 13.5987L8.99684 19.3867C9.23736 19.5494 9.41755 19.783 9.51067 20.0531C9.60379 20.3231 9.60489 20.6152 9.5138 20.8859L6.30688 30.2388C6.23886 30.4443 6.22285 30.6627 6.26023 30.8755C6.2976 31.0883 6.38725 31.2892 6.52155 31.4611C6.65754 31.6341 6.83348 31.7736 7.03516 31.8683C7.23684 31.963 7.45859 32.0103 7.68253 32.0063C7.98633 32.0051 8.28209 31.9113 8.52807 31.7379L16.8783 25.9925C17.1281 25.8224 17.4256 25.7312 17.7305 25.7312C18.0353 25.7312 18.3329 25.8224 18.5826 25.9925L26.9328 31.7379C27.1788 31.9113 27.4746 32.0051 27.7784 32.0063C28.0023 32.0103 28.2241 31.963 28.4258 31.8683C28.6274 31.7736 28.8034 31.6341 28.9394 31.4611C29.0737 31.2892 29.1633 31.0883 29.2007 30.8755C29.2381 30.6627 29.2221 30.4443 29.154 30.2388L25.9471 20.8944C25.856 20.6237 25.8571 20.3317 25.9502 20.0616C26.0434 19.7916 26.2236 19.5579 26.4641 19.3952L34.8801 13.6285C35.1232 13.4631 35.3047 13.2255 35.3971 12.9513C35.4895 12.6772 35.488 12.3812 35.3926 12.108C35.2952 11.834 35.1107 11.5973 34.8658 11.4319C34.6209 11.2666 34.3282 11.1812 34.0301 11.1881L23.6558 11.1753Z"
                fill="#FBBC05"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
          ) : (
            // Empty star with black outline
            <Svg width="45" height="32" viewBox="0 0 45 32" fill="none">
              <Path
                d="M23.6558 11.1753C23.3551 11.1782 23.0611 11.0894 22.8151 10.9213C22.5691 10.7532 22.3835 10.5143 22.2846 10.2383L19.1039 0.936539C19.0027 0.662351 18.8169 0.425233 18.5719 0.2576C18.3268 0.0899667 18.0345 0 17.7348 0C17.4352 0 17.1429 0.0899667 16.8978 0.2576C16.6528 0.425233 16.4669 0.662351 16.3658 0.936539L13.1676 10.2213C13.0686 10.4973 12.883 10.7361 12.637 10.9042C12.391 11.0723 12.097 11.1612 11.7963 11.1582H1.43515C1.13706 11.1514 0.844419 11.2368 0.599511 11.4021C0.354603 11.5675 0.170101 11.8042 0.0726491 12.0782C-0.0226684 12.3514 -0.0242315 12.6473 0.0681953 12.9215C0.160622 13.1957 0.342048 13.4333 0.58523 13.5987L8.99684 19.3867C9.23736 19.5494 9.41755 19.783 9.51067 20.0531C9.60379 20.3231 9.60489 20.6152 9.5138 20.8859L6.30688 30.2388C6.23886 30.4443 6.22285 30.6627 6.26023 30.8755C6.2976 31.0883 6.38725 31.2892 6.52155 31.4611C6.65754 31.6341 6.83348 31.7736 7.03516 31.8683C7.23684 31.963 7.45859 32.0103 7.68253 32.0063C7.98633 32.0051 8.28209 31.9113 8.52807 31.7379L16.8783 25.9925C17.1281 25.8224 17.4256 25.7312 17.7305 25.7312C18.0353 25.7312 18.3329 25.8224 18.5826 25.9925L26.9328 31.7379C27.1788 31.9113 27.4746 32.0051 27.7784 32.0063C28.0023 32.0103 28.2241 31.963 28.4258 31.8683C28.6274 31.7736 28.8034 31.6341 28.9394 31.4611C29.0737 31.2892 29.1633 31.0883 29.2007 30.8755C29.2381 30.6627 29.2221 30.4443 29.154 30.2388L25.9471 20.8944C25.856 20.6237 25.8571 20.3317 25.9502 20.0616C26.0434 19.7916 26.2236 19.5579 26.4641 19.3952L34.8801 13.6285C35.1232 13.4631 35.3047 13.2255 35.3971 12.9513C35.4895 12.6772 35.488 12.3812 35.3926 12.108C35.2952 11.834 35.1107 11.5973 34.8658 11.4319C34.6209 11.2666 34.3282 11.1812 34.0301 11.1881L23.6558 11.1753Z"
                fill="white"
                stroke="black"
                strokeWidth="0.5"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LoveUsRateUs = ({ navigation }) => {
  const [rating, setRating] = useState(0); // Start with 0 stars
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigation.navigate('Profile');
  };

  const handleSubmitFeedback = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    if (feedback.trim().length < 10) {
      Alert.alert('Feedback Too Short', 'Please provide at least 10 characters of feedback.');
      return;
    }

    // For high ratings (4-5 stars), redirect to app store
    if (rating >= 4) {
      Alert.alert(
        'Thank You!',
        'We\'re thrilled you love our app! Would you like to rate us on the App Store/Play Store?',
        [
          {
            text: 'Maybe Later',
            style: 'cancel',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            text: 'Rate Now',
            onPress: () => {
              // Redirect to app store/play store
              const storeUrl = Platform.OS === 'ios' 
                ? 'https://apps.apple.com/app/id[YOUR_APP_ID]' // Replace with your App Store ID
                : 'https://play.google.com/store/apps/details?id=com.yoraaapparelsprivatelimited.yoraa';
              
              Linking.openURL(storeUrl).catch(err => {
                console.error('Error opening store:', err);
                Alert.alert('Error', 'Unable to open app store');
              });
              
              navigation.navigate('Profile');
            },
          },
        ]
      );
      return;
    }

    // For lower ratings (1-3 stars), submit feedback to backend
    try {
      setIsSubmitting(true);

      // Initialize API if not already done
      await yoraaAPI.initialize();

      // Get user data with fallbacks
      let userData = null;
      try {
        userData = await authStorageService.getUserData();
      } catch (error) {
        console.warn('Could not get user data from auth storage:', error);
      }

      // Prepare feedback data with fallbacks
      const feedbackData = {
        rating: rating,
        feedback: feedback.trim(),
        timestamp: new Date().toISOString(),
        userId: userData?.id || userData?._id || 'anonymous',
        userEmail: userData?.email || 'not_provided@example.com',
        userName: userData?.name || 'Anonymous User',
        isAnonymous: !userData || (!userData.id && !userData._id),
      };

      console.log('📝 Submitting feedback:', feedbackData);

      // Submit to backend
      const response = await yoraaAPI.request('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });

      if (response.success) {
        Alert.alert(
          'Thank You!',
          'Your feedback has been submitted successfully. We appreciate your input and will work to improve your experience!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Profile'),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      
      // If it's an authentication error, offer to submit anonymously
      if (error.message.includes('required') || error.message.includes('auth')) {
        Alert.alert(
          'Submit Anonymously?',
          'We couldn\'t verify your account. Would you like to submit your feedback anonymously?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Submit Anonymously',
              onPress: async () => {
                try {
                  const anonymousFeedback = {
                    rating: rating,
                    feedback: feedback.trim(),
                    timestamp: new Date().toISOString(),
                    userId: 'anonymous_' + Date.now(),
                    userEmail: 'anonymous@feedback.com',
                    userName: 'Anonymous User',
                    isAnonymous: true,
                  };

                  const response = await yoraaAPI.request('/feedback', {
                    method: 'POST',
                    body: JSON.stringify(anonymousFeedback),
                  });

                  if (response.success) {
                    Alert.alert(
                      'Thank You!',
                      'Your anonymous feedback has been submitted successfully!',
                      [{ text: 'OK', onPress: () => navigation.navigate('Profile') }]
                    );
                  } else {
                    throw new Error(response.message);
                  }
                } catch (err) {
                  Alert.alert(
                    'Submission Failed',
                    'We\'re sorry, but we couldn\'t submit your feedback right now. Please try again later.',
                    [{ text: 'OK' }]
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Submission Failed',
          error.message || 'Unable to submit feedback. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = feedback.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <GlobalBackButton navigation={navigation} onPress={handleBack} />
          </View>
          <Text style={styles.headerTitle}>Submit your Feedback</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How was your experience ?</Text>
          <StarRating rating={rating} onRatingPress={setRating} />
        </View>

        {/* Comment Box */}
        <View style={styles.commentBoxContainer}>
          <View style={styles.commentBox}>
            <TextInput
              style={styles.commentInput}
              multiline={true}
              numberOfLines={6}
              placeholder="We Would love to hear your feedback. what was positive .what would you like us to improve?"
              value={feedback}
              onChangeText={setFeedback}
              placeholderTextColor="#5A5A5A"
              textAlignVertical="top"
              maxLength={500}
              editable={!isSubmitting}
            />
          </View>
          <Text style={styles.characterCount}>{characterCount} characters</Text>
        </View>

        {/* Send Feedback Button */}
        <TouchableOpacity 
          style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]} 
          onPress={handleSubmitFeedback}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6', // Figma background color
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 17,
    backgroundColor: '#F6F6F6',
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    flex: 1,
    transform: [{ translateX: -34 }], // Offset for centering
  },

  // Rating Section
  ratingSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 72,
  },
  ratingTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#121420',
    marginBottom: 20,
    letterSpacing: -0.07,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  starButton: {
    padding: 0,
  },

  // Comment Box Styles
  commentBoxContainer: {
    marginHorizontal: 29,
    marginBottom: 30,
  },
  commentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 267,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 26,
  },
  commentInput: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#5A5A5A',
    lineHeight: 16,
    flex: 1,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#5A5A5A',
    textAlign: 'right',
    marginTop: 8,
    marginRight: 4,
  },

  // Send Button
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    height: 48,
    marginHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#999999',
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    lineHeight: 22.5,
  },
});

export default LoveUsRateUs;
