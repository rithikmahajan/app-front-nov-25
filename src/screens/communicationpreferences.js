import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  wp,
  hp,
  fs,
  device,
  isTablet,
  isSmallDevice,
  getScreenDimensions,
} from '../utils/responsive';

// Checkbox Component
const Checkbox = ({ checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <View style={styles.checkmark} />}
    </View>
  </TouchableOpacity>
);

const CommunicationPreferences = ({ navigation }) => {
  const [sendEmails, setSendEmails] = useState(true); // Default to checked as shown in design
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    // Animate in with 300ms ease out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleBack = () => {
    // Animate out with 300ms ease out then navigate back
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Settings');
    });
  };

  const handleSave = () => {
    // Save preferences
    // Data includes: sendEmails preference
    
    // Navigate back with animation
    handleBack();
  };

  const toggleSendEmails = () => {
    setSendEmails(!sendEmails);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton 
            navigation={navigation}
            onPress={handleBack}
            animationDuration={300}
            customEasing={Easing.in(Easing.back(1.7))}
          />
          <Text style={styles.headerTitle}>Communication Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {/* General Communication Section */}
          <Text style={styles.sectionTitle}>General Communication</Text>
          <Text style={styles.sectionDescription}>
            Get updates on your products offers and membership benefits
          </Text>

          {/* Email Preference */}
          <View style={styles.preferenceRow}>
            <Checkbox 
              checked={sendEmails} 
              onPress={toggleSendEmails} 
            />
            <Text style={styles.preferenceText}>Yes, send me emails.</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingTop: getResponsiveSpacing(12),
    paddingBottom: getResponsiveSpacing(20),
  },
  backButton: {
    padding: getResponsiveSpacing(8),
    marginLeft: getResponsiveSpacing(-8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(17),
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: getResponsiveValue(40, 45, 50),
  },

  backArrowIcon: {
    width: getResponsiveValue(24, 28, 32),
    height: getResponsiveValue(24, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backArrowLine: {
    width: getResponsiveValue(12, 14, 16),
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
  },
  backArrowHead: {
    width: 0,
    height: 0,
    borderRightWidth: getResponsiveValue(6, 7, 8),
    borderLeftWidth: 0,
    borderTopWidth: getResponsiveValue(4, 5, 6),
    borderBottomWidth: getResponsiveValue(4, 5, 6),
    borderRightColor: '#000000',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    left: getResponsiveValue(6, 7, 8),
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(8),
  },

  sectionTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getResponsiveSpacing(8),
  },
  sectionDescription: {
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
    lineHeight: getResponsiveValue(22, 25, 28),
    marginBottom: getResponsiveSpacing(32),
  },

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(40),
  },
  preferenceText: {
    fontSize: getResponsiveFontSize(16),
    color: '#666666',
    marginLeft: getResponsiveSpacing(12),
  },

  checkboxContainer: {
    padding: getResponsiveSpacing(2),
  },
  checkbox: {
    width: getResponsiveValue(20, 23, 26),
    height: getResponsiveValue(20, 23, 26),
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    width: getResponsiveValue(6, 7, 8),
    height: getResponsiveValue(10, 11, 12),
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },

  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: getResponsiveSpacing(16),
    alignItems: 'center',
    marginTop: getResponsiveSpacing(20),
  },
  saveButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CommunicationPreferences;
