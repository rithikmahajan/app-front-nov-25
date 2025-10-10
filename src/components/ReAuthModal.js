import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppleIcon, GoogleIcon } from '../assets/icons';

const ReAuthModal = ({ 
  visible, 
  method, 
  email,
  onAuthenticate, 
  onCancel 
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (method === 'email' && !password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await onAuthenticate(password);
      setPassword(''); // Clear password on success
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async () => {
    setIsLoading(true);
    try {
      await onAuthenticate();
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMethodName = (authMethod) => {
    if (authMethod === 'email') return 'Email/Password';
    if (authMethod === 'google') return 'Google';
    if (authMethod === 'apple') return 'Apple';
    return authMethod;
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
            <Text style={styles.title}>Verify Your Identity</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              To link this account, please sign in with your existing{' '}
              <Text style={styles.methodText}>{formatMethodName(method)}</Text> credentials.
            </Text>
            
            {method === 'email' && (
              <>
                {/* Email Display */}
                <View style={styles.emailContainer}>
                  <Text style={styles.emailLabel}>Email</Text>
                  <Text style={styles.emailValue}>{email}</Text>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#999999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.showPasswordButton}
                    >
                      <Text style={styles.showPasswordText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Authenticate Button */}
                <TouchableOpacity 
                  style={[styles.authButton, isLoading && styles.disabledButton]}
                  onPress={handleAuthenticate}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify & Link Account</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {method === 'google' && (
              <TouchableOpacity 
                style={[styles.socialButton, styles.googleButton, isLoading && styles.disabledButton]}
                onPress={handleSocialAuth}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <>
                    <GoogleIcon width={20} height={20} />
                    <Text style={styles.socialButtonText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {method === 'apple' && (
              <TouchableOpacity 
                style={[styles.socialButton, styles.appleButton, isLoading && styles.disabledButton]}
                onPress={handleSocialAuth}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <AppleIcon width={20} height={20} />
                    <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                      Sign in with Apple
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  methodText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  emailContainer: {
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 6,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  showPasswordButton: {
    paddingHorizontal: 16,
  },
  showPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ReAuthModal;
