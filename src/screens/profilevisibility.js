import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import GlobalBackButton from '../components/GlobalBackButton';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// Radio Button Component
const RadioButton = ({ selected, onPress, label, description }) => (
  <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
    <View style={styles.radioRow}>
      <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
      <View style={styles.radioTextContainer}>
        <Text style={styles.radioLabel}>{label}</Text>
        {description && <Text style={styles.radioDescription}>{description}</Text>}
      </View>
    </View>
  </TouchableOpacity>
);

const ProfileVisibilityScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [profileVisibility, setProfileVisibility] = useState('Social'); // Default to Social
  const [locationSharing, setLocationSharing] = useState('Share my location with friends only'); // Default option

  useEffect(() => {
    // Animate in with 300ms ease out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleBack = () => {
    // Animate out then navigate back
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.back(1.7)),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Settings');
    });
  };

  const handleSave = () => {
    // Handle save logic here
    // Navigate back after saving
    handleBack();
  };

  const profileOptions = [
    {
      value: 'Private',
      label: 'Private: Profile visible to only you',
    },
    {
      value: 'Social',
      label: 'Social: Profile visible to friends',
    },
    {
      value: 'Public',
      label: 'Public: Profile visible to everyone',
    },
  ];

  const locationOptions = [
    {
      value: 'Share my location with friends only',
      label: 'Share my location with friends only',
    },
    {
      value: "Don't share my location",
      label: "Don't share my location",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX: slideAnim }],
          },
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
          <Text style={styles.headerTitle}>Product Review Visibility</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Choose how you will appear on any Nike product reviews you complete. 
              Changing these settings will also affect your visibility for connecting 
              with friends on the YORAA Club and YORAA apps.{' '}
              <Text style={styles.learnMore}>Learn More</Text>
            </Text>
          </View>

          {/* Profile Visibility Options */}
          <View style={styles.sectionContainer}>
            {profileOptions.map((option) => (
              <RadioButton
                key={option.value}
                selected={profileVisibility === option.value}
                onPress={() => setProfileVisibility(option.value)}
                label={option.label}
              />
            ))}
          </View>

          {/* Location Sharing Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Location Sharing</Text>
            {locationOptions.map((option) => (
              <RadioButton
                key={option.value}
                selected={locationSharing === option.value}
                onPress={() => setLocationSharing(option.value)}
                label={option.label}
              />
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp(3.1) : wp(4.3),
    paddingVertical: isTablet ? hp(1.95) : hp(1.47),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: isTablet ? wp(1.3) : wp(2.1),
  },
  backArrowIcon: {
    width: isTablet ? wp(3.1) : wp(6.4),
    height: isTablet ? hp(2.9) : hp(2.9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowLine: {
    position: 'absolute',
    width: isTablet ? wp(1.6) : wp(3.2),
    height: 2,
    backgroundColor: Colors.textPrimary,
    left: isTablet ? wp(0.8) : wp(1.6),
  },
  backArrowHead: {
    position: 'absolute',
    width: isTablet ? wp(0.8) : wp(1.6),
    height: isTablet ? hp(0.73) : hp(0.73),
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.textPrimary,
    transform: [{ rotate: '-45deg' }],
    left: isTablet ? wp(0.26) : wp(0.53),
  },
  headerTitle: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: isTablet ? wp(5.2) : wp(10.7),
  },
  scrollContainer: {
    flex: 1,
  },
  descriptionContainer: {
    paddingHorizontal: isTablet ? wp(3.1) : wp(4.3),
    paddingVertical: isTablet ? hp(2.9) : hp(2.4),
  },
  description: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    color: Colors.textPrimary,
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
  },
  learnMore: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  sectionContainer: {
    paddingHorizontal: isTablet ? wp(3.1) : wp(4.3),
    marginBottom: isTablet ? hp(2.9) : hp(2.4),
  },
  sectionTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(15) : fs(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: isTablet ? hp(2.3) : hp(1.95),
  },
  radioContainer: {
    marginBottom: isTablet ? hp(2.3) : hp(1.95),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: isTablet ? wp(3.1) : wp(5.3),
    height: isTablet ? wp(3.1) : wp(5.3),
    borderRadius: isTablet ? wp(1.55) : wp(2.65),
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? wp(1.95) : wp(3.2),
    marginTop: hp(0.24),
  },
  radioButtonSelected: {
    borderColor: Colors.textPrimary,
  },
  radioButtonInner: {
    width: isTablet ? wp(1.25) : wp(2.1),
    height: isTablet ? wp(1.25) : wp(2.1),
    borderRadius: isTablet ? wp(0.625) : wp(1.05),
    backgroundColor: Colors.textPrimary,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    color: Colors.textPrimary,
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
  },
  radioDescription: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(11),
    color: Colors.textSecondary,
    marginTop: isTablet ? hp(0.73) : hp(0.49),
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16),
  },
  saveButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 50,
    paddingVertical: isTablet ? hp(2.3) : hp(1.95),
    marginHorizontal: isTablet ? wp(3.1) : wp(4.3),
    marginBottom: isTablet ? hp(4.7) : hp(3.9),
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(15) : fs(16),
    fontWeight: '600',
  },
});

export default ProfileVisibilityScreen;
