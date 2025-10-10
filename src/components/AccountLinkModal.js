import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';

const AccountLinkModal = ({ 
  visible, 
  email, 
  existingMethod, 
  newMethod, 
  onLink, 
  onCancel 
}) => {
  // Format provider names for display
  const formatProviderName = (provider) => {
    if (provider === 'email') return 'Email/Password';
    if (provider === 'google') return 'Google';
    if (provider === 'apple') return 'Apple';
    return provider;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <Text style={styles.title}>Account Already Exists</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              An account with <Text style={styles.emailText}>{email}</Text> already exists using{' '}
              <Text style={styles.providerText}>{formatProviderName(existingMethod)}</Text>.
            </Text>
            
            {/* Options */}
            <Text style={styles.optionsTitle}>Would you like to:</Text>
            
            {/* Link Account Button */}
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={onLink}
              activeOpacity={0.7}
            >
              <Text style={styles.linkButtonText}>
                Link {formatProviderName(newMethod)} to existing account
              </Text>
            </TouchableOpacity>
            
            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>
                Cancel and use {formatProviderName(existingMethod)}
              </Text>
            </TouchableOpacity>
            
            {/* Info Text */}
            <Text style={styles.infoText}>
              Linking accounts allows you to sign in using either method.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalContent: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    color: '#000000',
  },
  providerText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AccountLinkModal;
