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
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },

  // Back Arrow Icon
  backArrowIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backArrowLine: {
    width: 12,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
  },
  backArrowHead: {
    width: 0,
    height: 0,
    borderRightWidth: 6,
    borderLeftWidth: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightColor: '#000000',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    left: 6,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Preference Row
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  preferenceText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 12,
  },

  // Checkbox Styles
  checkboxContainer: {
    padding: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
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
    width: 6,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },

  // Save Button
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CommunicationPreferences;
