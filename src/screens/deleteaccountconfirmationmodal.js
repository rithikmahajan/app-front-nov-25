import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { FontWeights } from '../constants/styles';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  getScreenDimensions,
} from '../utils/responsive';

const DeleteAccountConfirmationModal = ({ navigation, visible, onClose }) => {
  const handleDone = () => {
    onClose && onClose();
    // Navigate to Rewards screen after confirming deletion
    if (navigation && navigation.navigate) {
      navigation.navigate('Rewards');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        {/* Sad face emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>☹️</Text>
        </View>

        {/* Success icon with yellow background */}
        <View style={styles.checkIconContainer}>
          <View style={styles.checkIconBackground}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>
        </View>          {/* Main message */}
          <Text style={styles.mainMessage}>
            Sorry to see you go hope we could serve you better next time !
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your account has been deleted
          </Text>

          {/* Done button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(24),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12.84,
    width: getResponsiveValue(327, 380, 420),
    maxWidth: getResponsiveValue(
      getScreenDimensions().width * 0.9,
      getScreenDimensions().width * 0.7,
      getScreenDimensions().width * 0.6
    ),
    alignItems: 'center',
    position: 'relative',
    paddingVertical: getResponsiveSpacing(24),
    paddingHorizontal: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(80),
  },
  emojiContainer: {
    marginBottom: getResponsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: getResponsiveFontSize(32),
    lineHeight: getResponsiveValue(48, 54, 60),
  },
  checkIconContainer: {
    marginTop: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconBackground: {
    width: getResponsiveValue(81, 92, 102),
    height: getResponsiveValue(81, 92, 102),
    borderRadius: getResponsiveValue(40.5, 46, 51),
    backgroundColor: 'rgba(251, 188, 5, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: getResponsiveValue(54.166, 61.5, 68),
    height: getResponsiveValue(54.166, 61.5, 68),
    borderRadius: getResponsiveValue(27.083, 30.75, 34),
    backgroundColor: '#FBBC05',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize(24),
    fontWeight: FontWeights.bold || 'bold',
  },
  mainMessage: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: FontWeights.bold || 'bold',
    color: '#43484B',
    textAlign: 'center',
    lineHeight: getResponsiveValue(22.5, 25, 28),
    width: getResponsiveValue(230, 270, 310),
    maxWidth: '90%',
    marginBottom: getResponsiveSpacing(16),
    marginTop: getResponsiveSpacing(12),
  },
  subtitle: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: FontWeights.regular || '400',
    color: '#6E768A',
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 22, 24),
    marginBottom: getResponsiveSpacing(24),
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    width: getResponsiveValue(234, 270, 300),
    height: getResponsiveValue(48, 54, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getResponsiveSpacing(24),
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize(16),
    fontWeight: FontWeights.semiBold || '600',
    lineHeight: getResponsiveValue(22.5, 25, 28),
  },
});

export default DeleteAccountConfirmationModal;
