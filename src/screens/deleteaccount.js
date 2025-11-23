import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { Colors } from '../constants/colors';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants/styles';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
} from '../utils/responsive';

const DeleteAccount = ({ navigation }) => {
  const [isFirstCheckboxChecked, setIsFirstCheckboxChecked] = useState(false);
  const [isSecondCheckboxChecked, setIsSecondCheckboxChecked] = useState(false);

  const handleTermsAndConditionsPress = () => {
    // Replace with your actual terms and conditions URL
    const termsUrl = 'https://yoraa.com/terms-and-conditions';
    Linking.openURL(termsUrl).catch(err => {
      if (__DEV__) {
        console.error('Error opening terms and conditions:', err);
      }
      Alert.alert('Error', 'Unable to open terms and conditions');
    });
  };

  const handleContinue = () => {
    if (!isFirstCheckboxChecked || !isSecondCheckboxChecked) {
      Alert.alert(
        'Action Required',
        'Please select all checkboxes before proceeding.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to delete account confirmation screen
    navigation.navigate('DeleteAccountConfirmation', { previousScreen: 'DeleteAccount' });
  };

  const renderCheckbox = (isChecked, onPress) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Accounts</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.guidelineSection}>
          <Text style={styles.guidelineTitle}>General Guideline</Text>
          <Text style={styles.guidelineText}>
            Read deletion{' '}
            <Text style={styles.termsLink} onPress={handleTermsAndConditionsPress}>
              terms and conditions
            </Text>
            {' '}carefully.
          </Text>
        </View>

        <View style={styles.checkboxSection}>
          <View style={styles.checkboxRow}>
            {renderCheckbox(isFirstCheckboxChecked, () => setIsFirstCheckboxChecked(!isFirstCheckboxChecked))}
            <Text style={styles.checkboxText}>
              Yes , proceed for account deletion
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            {renderCheckbox(isSecondCheckboxChecked, () => setIsSecondCheckboxChecked(!isSecondCheckboxChecked))}
            <Text style={styles.checkboxText}>
              I completely consent that i have gone through the terms and conditions very carefully and wish to delete my account
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!isFirstCheckboxChecked || !isSecondCheckboxChecked) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isFirstCheckboxChecked || !isSecondCheckboxChecked}
        >
          <Text style={[
            styles.continueButtonText,
            (!isFirstCheckboxChecked || !isSecondCheckboxChecked) && styles.continueButtonTextDisabled
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.lg),
    paddingVertical: getResponsiveSpacing(Spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    marginRight: getResponsiveSpacing(Spacing.lg),
    padding: getResponsiveSpacing(Spacing.sm),
  },
  backButtonText: {
    fontSize: getResponsiveFontSize(24),
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(FontSizes.xl),
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.xxl),
  },
  guidelineSection: {
    marginBottom: getResponsiveSpacing(Spacing.xxxl),
  },
  guidelineTitle: {
    fontSize: getResponsiveFontSize(FontSizes.xl),
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: getResponsiveSpacing(Spacing.md),
  },
  guidelineText: {
    fontSize: getResponsiveFontSize(FontSizes.md),
    color: Colors.textPrimary,
    lineHeight: getResponsiveValue(20, 23, 26),
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  checkboxSection: {
    marginBottom: getResponsiveSpacing(Spacing.xxxl * 2),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSpacing(Spacing.lg),
  },
  checkboxContainer: {
    marginRight: getResponsiveSpacing(Spacing.md),
    marginTop: getResponsiveSpacing(2),
  },
  checkbox: {
    width: getResponsiveValue(20, 23, 26),
    height: getResponsiveValue(20, 23, 26),
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  checkmark: {
    color: Colors.background,
    fontSize: getResponsiveFontSize(12),
    fontWeight: FontWeights.bold,
  },
  checkboxText: {
    flex: 1,
    fontSize: getResponsiveFontSize(FontSizes.md),
    color: Colors.textSecondary,
    lineHeight: getResponsiveValue(20, 23, 26),
  },
  continueButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: getResponsiveSpacing(Spacing.lg),
    borderRadius: BorderRadius.xxxl,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: getResponsiveSpacing(Spacing.xxl),
  },
  continueButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  continueButtonText: {
    color: Colors.background,
    fontSize: getResponsiveFontSize(FontSizes.lg),
    fontWeight: FontWeights.medium,
  },
  continueButtonTextDisabled: {
    color: Colors.backgroundSecondary,
  },
});

export default DeleteAccount;
