import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

const TryOnProTips = ({ navigation, route }) => {
  const { product, previousScreen } = route?.params || {};

  const handleNext = () => {
    // Navigate to upload photo screen
    navigation?.navigate('TryOnUploadPhotoFromGallery', { 
      product, 
      previousScreen: 'TryOnProTips' 
    });
  };

  const handleBack = () => {
    if (previousScreen) {
      navigation?.goBack();
    } else {
      navigation?.navigate('ProductDetailsMain');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <GlobalBackButton />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>PRO TIPS</Text>
          
          {/* Tips List */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipText}>
              Use a well lit environment for best accuracy
            </Text>
            
            <Text style={styles.tipText}>
              Wear form fitting clothes for an accurate try on experience
            </Text>
            
            <Text style={styles.tipText}>
              Upload full body images for better results
            </Text>
            
            <Text style={styles.tipText}>
              Select an image with similar body type if not sure of uploading your own image
            </Text>
            
            <Text style={styles.tipText}>
              Ensure your camera is stable for real time try on
            </Text>
          </View>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 68,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 314,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    textAlign: 'justify',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 51,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 19.2, // 1.2 line height
  },
});

export default TryOnProTips;