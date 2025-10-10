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
import { Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/styles';
import GlobalBackButton from '../components/GlobalBackButton';

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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backArrowIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: Colors.textPrimary,
    left: 6,
  },
  backArrowHead: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.textPrimary,
    transform: [{ rotate: '-45deg' }],
    left: 2,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  learnMore: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  radioContainer: {
    marginBottom: Spacing.lg,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: Colors.textPrimary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textPrimary,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  radioDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
  },
});

export default ProfileVisibilityScreen;
