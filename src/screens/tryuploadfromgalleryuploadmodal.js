import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import Svg, { Path, G, ClipPath, Defs, Circle } from 'react-native-svg';

const TryUploadFromGalleryUploadModal = ({ navigation, route }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // Animation refs
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start loader animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(uploadInterval);
          setUploadProgress(100);
          // Complete upload after a short delay
          setTimeout(() => {
            setUploadComplete(true);
            spinAnimation.stop();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    // Animate progress bar
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    return () => {
      clearInterval(uploadInterval);
      spinAnimation.stop();
    };
  }, [progressValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleCancel = () => {
    navigation?.navigate('ProductDetailsMain');
  };

  const handleDone = () => {
    // Navigate to next screen after upload completion
    // For now, navigate back to product details
    navigation?.navigate('ProductDetailsMain');
  };

  if (uploadComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.successContainer}>
          <View style={styles.successModal}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <Svg width={81} height={81} viewBox="0 0 81 81" fill="none">
                <Circle cx={40.5} cy={40.5} r={40.5} fill="#508A7B" opacity={0.1} />
                <Circle cx={40.083} cy={40.083} r={27.083} fill="#508A7B" />
                <Path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M53.7878 30.4597C54.4008 31.0727 54.4008 32.0668 53.7878 32.6788L36.5258 49.9417C35.9128 50.5547 34.9198 50.5547 34.3068 49.9417L26.4597 42.0948C25.8468 41.4818 25.8468 40.4887 26.4597 39.8757C27.0727 39.2627 28.0668 39.2627 28.6788 39.8757L35.4157 46.6127L51.5688 30.4597C52.1818 29.8468 53.1758 29.8468 53.7878 30.4597Z"
                  fill="white"
                />
              </Svg>
            </View>

            {/* Success Text */}
            <Text style={styles.successText}>Photos uploaded successfully</Text>

            {/* Done Button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.uploadContainer}>
        {/* Loader Animation */}
        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.loader,
              { transform: [{ rotate: spin }] }
            ]}
          >
            <Svg width={30} height={30} viewBox="0 0 34 34" fill="none">
              <G clipPath="url(#clip0)">
                <Path
                  d="M32 17H30C30 24.1797 24.1797 30 17 30V32V34C26.3888 34 34 26.3888 34 17H32ZM17 32V30C9.8203 30 4 24.1797 4 17H2H0C0 26.3888 7.61116 34 17 34V32ZM2 17H4C4 9.8203 9.8203 4 17 4V2V0C7.61116 0 0 7.61116 0 17H2ZM17 2V4C24.1797 4 30 9.8203 30 17H32H34C34 7.61116 26.3888 0 17 0V2Z"
                  fill="url(#paint0_angular)"
                />
              </G>
              <Defs>
                <ClipPath id="clip0">
                  <Path d="M0 0H34V34H0V0Z" fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
          </Animated.View>
        </View>

        {/* Upload Text */}
        <Text style={styles.uploadText}>Uploading photos...</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth }
              ]}
            />
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  uploadContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loaderContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    width: 30,
    height: 30,
  },
  uploadText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.4,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
  },
  progressBar: {
    width: 279,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#000000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 24,
  },
  progressText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    zIndex: 1,
  },
  cancelButton: {
    width: 327,
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#000000',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModal: {
    width: 327,
    height: 305,
    backgroundColor: '#FFFFFF',
    borderRadius: 12.84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#43484B',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22.5,
  },
  doneButton: {
    width: 234,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22.5,
  },
});

export default TryUploadFromGalleryUploadModal;
