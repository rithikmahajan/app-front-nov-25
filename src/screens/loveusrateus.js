import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import GlobalBackButton from '../components/GlobalBackButton';

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
          {star <= 4 ? (
            // Filled stars (first 4)
            <Svg width="45" height="32" viewBox="0 0 45 32" fill="none">
              <Path
                d="M23.6558 11.1753C23.3551 11.1782 23.0611 11.0894 22.8151 10.9213C22.5691 10.7532 22.3835 10.5143 22.2846 10.2383L19.1039 0.936539C19.0027 0.662351 18.8169 0.425233 18.5719 0.2576C18.3268 0.0899667 18.0345 0 17.7348 0C17.4352 0 17.1429 0.0899667 16.8978 0.2576C16.6528 0.425233 16.4669 0.662351 16.3658 0.936539L13.1676 10.2213C13.0686 10.4973 12.883 10.7361 12.637 10.9042C12.391 11.0723 12.097 11.1612 11.7963 11.1582H1.43515C1.13706 11.1514 0.844419 11.2368 0.599511 11.4021C0.354603 11.5675 0.170101 11.8042 0.0726491 12.0782C-0.0226684 12.3514 -0.0242315 12.6473 0.0681953 12.9215C0.160622 13.1957 0.342048 13.4333 0.58523 13.5987L8.99684 19.3867C9.23736 19.5494 9.41755 19.783 9.51067 20.0531C9.60379 20.3231 9.60489 20.6152 9.5138 20.8859L6.30688 30.2388C6.23886 30.4443 6.22285 30.6627 6.26023 30.8755C6.2976 31.0883 6.38725 31.2892 6.52155 31.4611C6.65754 31.6341 6.83348 31.7736 7.03516 31.8683C7.23684 31.963 7.45859 32.0103 7.68253 32.0063C7.98633 32.0051 8.28209 31.9113 8.52807 31.7379L16.8783 25.9925C17.1281 25.8224 17.4256 25.7312 17.7305 25.7312C18.0353 25.7312 18.3329 25.8224 18.5826 25.9925L26.9328 31.7379C27.1788 31.9113 27.4746 32.0051 27.7784 32.0063C28.0023 32.0103 28.2241 31.963 28.4258 31.8683C28.6274 31.7736 28.8034 31.6341 28.9394 31.4611C29.0737 31.2892 29.1633 31.0883 29.2007 30.8755C29.2381 30.6627 29.2221 30.4443 29.154 30.2388L25.9471 20.8944C25.856 20.6237 25.8571 20.3317 25.9502 20.0616C26.0434 19.7916 26.2236 19.5579 26.4641 19.3952L34.8801 13.6285C35.1232 13.4631 35.3047 13.2255 35.3971 12.9513C35.4895 12.6772 35.488 12.3812 35.3926 12.108C35.2952 11.834 35.1107 11.5973 34.8658 11.4319C34.6209 11.2666 34.3282 11.1812 34.0301 11.1881L23.6558 11.1753Z"
                fill="#FBBC05"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
          ) : (
            // Empty star with black outline (5th star)
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

// Image Icon Component - Exact SVG from user
const ImageIcon = () => (
  <Svg width="69" height="64" viewBox="0 0 69 64" fill="none">
    <Path
      d="M1 15C1 7.26801 7.26801 1 15 1H54C61.732 1 68 7.26801 68 15V49C68 56.732 61.732 63 54 63H15C7.26801 63 1 56.732 1 49V15Z"
      stroke="#CCD2E3"
      strokeWidth="2"
      strokeDasharray="10 10"
      fill="none"
    />
    <Path
      d="M21.375 31.0417C21.375 25.5419 21.375 22.7921 23.0835 21.0835C24.7921 19.375 27.5419 19.375 33.0417 19.375H35.9583C41.4581 19.375 44.2079 19.375 45.9165 21.0835C47.625 22.7921 47.625 25.5419 47.625 31.0417V33.9583C47.625 39.4581 47.625 42.2079 45.9165 43.9165C44.2079 45.625 41.4581 45.625 35.9583 45.625H33.0417C27.5419 45.625 24.7921 45.625 23.0835 43.9165C21.375 42.2079 21.375 39.4581 21.375 33.9583V31.0417Z"
      stroke="#CCD2E3"
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M28.7734 28.874C29.5761 28.8063 30.3825 28.9613 31.1025 29.3222C31.9657 29.7551 32.5195 30.4964 32.9639 31.2861C33.4041 32.0684 33.8496 33.1122 34.3828 34.3564L34.46 34.5381C34.7092 35.1195 34.8574 35.4596 34.9844 35.6924C34.9904 35.7033 34.9975 35.713 35.0029 35.7226C35.0116 35.7156 35.0225 35.7102 35.0322 35.7021C35.2365 35.5332 35.4998 35.2716 35.9473 34.8242C36.5331 34.2384 37.0362 33.7331 37.4844 33.3554C37.9465 32.9659 38.4502 32.6236 39.0703 32.4365C39.8943 32.188 40.7737 32.1879 41.5977 32.4365C42.2175 32.6236 42.7206 32.966 43.1826 33.3554C43.6273 33.7302 44.1261 34.2305 44.7061 34.8105C44.704 36.5063 44.6941 37.8082 44.627 38.8554L42.6582 36.8867C42.0368 36.2652 41.6337 35.8648 41.3027 35.5859C40.986 35.319 40.8365 35.2531 40.7549 35.2285C40.4802 35.1456 40.1868 35.1456 39.9121 35.2285C39.8305 35.2532 39.6809 35.319 39.3643 35.5859C39.0333 35.8648 38.6312 36.2653 38.0098 36.8867C37.6037 37.2928 37.2265 37.6714 36.8906 37.9492C36.551 38.23 36.0939 38.5464 35.4961 38.6513C34.7913 38.775 34.0655 38.6353 33.457 38.2588C32.9411 37.9393 32.6348 37.4756 32.4238 37.0888C32.2152 36.7063 32.0055 36.2143 31.7793 35.6865L31.7012 35.5049C31.1414 34.1987 30.7665 33.3283 30.4219 32.7158C30.0817 32.1114 29.8852 31.975 29.7949 31.9297C29.555 31.8094 29.286 31.7577 29.0186 31.7802C28.9178 31.7888 28.6848 31.8424 28.1445 32.2773C27.597 32.718 26.9259 33.3866 25.9209 34.3916L24.2969 36.0146C24.2928 35.3933 24.292 34.711 24.292 33.958V31.8965C25.0615 31.1293 25.7252 30.4816 26.3164 30.0058C27.0223 29.4377 27.8113 28.9552 28.7734 28.874Z"
      fill="#CCD2E3"
    />
    <Path
      d="M41.0625 28.125C42.2713 28.125 43.25 27.1463 43.25 25.9375C43.25 24.7287 42.2713 23.75 41.0625 23.75C39.8537 23.75 38.875 24.7287 38.875 25.9375C38.875 27.1463 39.8537 28.125 41.0625 28.125Z"
      fill="#CCD2E3"
    />
  </Svg>
);

// Camera Icon Component - Exact SVG from user
const CameraIcon = () => (
  <Svg width="69" height="64" viewBox="0 0 69 64" fill="none">
    <Path
      d="M1 15C1 7.26801 7.26801 1 15 1H54C61.732 1 68 7.26801 68 15V49C68 56.732 61.732 63 54 63H15C7.26801 63 1 56.732 1 49V15Z"
      stroke="#CCD2E3"
      strokeWidth="2"
      strokeDasharray="10 10"
      fill="none"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M27.9484 24.285L25.583 24.8764C24.3588 25.1824 23.5 26.2824 23.5 27.5443V39.75C23.5 41.2688 24.7312 42.5 26.25 42.5H42.75C44.2688 42.5 45.5 41.2688 45.5 39.75V27.5443C45.5 26.2824 44.6412 25.1824 43.417 24.8764L41.0516 24.285L38.9364 21.1123C38.6814 20.7298 38.2521 20.5 37.7924 20.5H31.2076C30.7479 20.5 30.3186 20.7298 30.0636 21.1123L27.9484 24.285ZM26.25 21.875L24.9161 22.2085C22.4676 22.8206 20.75 25.0205 20.75 27.5443V39.75C20.75 42.7876 23.2124 45.25 26.25 45.25H42.75C45.7876 45.25 48.25 42.7876 48.25 39.75V27.5443C48.25 25.0205 46.5324 22.8206 44.0839 22.2085L42.75 21.875L41.2246 19.5869C40.4595 18.4393 39.1716 17.75 37.7924 17.75H31.2076C29.8284 17.75 28.5405 18.4393 27.7754 19.5869L26.25 21.875Z"
      fill="#CCD2E3"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M40 32.875C40 35.9126 37.5376 38.375 34.5 38.375C31.4624 38.375 29 35.9126 29 32.875C29 29.8374 31.4624 27.375 34.5 27.375C37.5376 27.375 40 29.8374 40 32.875ZM37.25 32.875C37.25 34.3938 36.0188 35.625 34.5 35.625C32.9812 35.625 31.75 34.3938 31.75 32.875C31.75 31.3562 32.9812 30.125 34.5 30.125C36.0188 30.125 37.25 31.3562 37.25 32.875Z"
      fill="#CCD2E3"
    />
    <Path
      d="M41.375 30.125C42.1344 30.125 42.75 29.5094 42.75 28.75C42.75 27.9906 42.1344 27.375 41.375 27.375C40.6156 27.375 40 27.9906 40 28.75C40 29.5094 40.6156 30.125 41.375 30.125Z"
      fill="#CCD2E3"
    />
  </Svg>
);

const LoveUsRateUs = ({ navigation }) => {
  const [rating, setRating] = useState(4); // Default to 4 stars as shown in Figma
  const [feedback, setFeedback] = useState('');

  const handleBack = () => {
    navigation.navigate('Profile');
  };

  const handleSubmitFeedback = () => {
    // Handle feedback submission
    navigation.navigate('Profile');
  };

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
            />
          </View>
          <Text style={styles.characterCount}>50 characters</Text>
        </View>

        {/* Upload Buttons */}
        <View style={styles.uploadButtonsContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <ImageIcon />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton}>
            <CameraIcon />
          </TouchableOpacity>
        </View>

        {/* Send Feedback Button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmitFeedback}>
          <Text style={styles.sendButtonText}>Send feedback</Text>
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

  // Upload Buttons
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 47,
    marginHorizontal: 30,
    marginBottom: 30,
  },
  uploadButton: {
    width: 69,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
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
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    lineHeight: 22.5,
  },
});

export default LoveUsRateUs;
