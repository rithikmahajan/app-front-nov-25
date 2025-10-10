import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { FontSizes, FontWeights, Spacing } from '../constants/styles';

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
    paddingHorizontal: Spacing.xl || 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12.84,
    width: 327,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: Spacing.xl || 24,
    paddingHorizontal: Spacing.lg || 16,
    paddingBottom: 80, // Add extra space for the button
  },
  emojiContainer: {
    marginBottom: Spacing.sm || 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
    lineHeight: 48,
  },
  checkIconContainer: {
    marginTop: 16,
    marginBottom: Spacing.lg || 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconBackground: {
    width: 81,
    height: 81,
    borderRadius: 40.5,
    backgroundColor: 'rgba(251, 188, 5, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 54.166,
    height: 54.166,
    borderRadius: 27.083,
    backgroundColor: '#FBBC05',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: FontWeights.bold || 'bold',
  },
  mainMessage: {
    fontSize: FontSizes.lg || 16,
    fontWeight: FontWeights.bold || 'bold',
    color: '#43484B',
    textAlign: 'center',
    lineHeight: 22.5,
    width: 230,
    marginBottom: Spacing.lg || 16,
    marginTop: Spacing.md || 12,
  },
  subtitle: {
    fontSize: FontSizes.md || 14,
    fontWeight: FontWeights.regular || '400',
    color: '#6E768A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl || 24,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    width: 234,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl || 24,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg || 16,
    fontWeight: FontWeights.semiBold || '600',
    lineHeight: 22.5,
  },
});

export default DeleteAccountConfirmationModal;
