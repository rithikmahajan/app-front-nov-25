import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import PreferenceSelector from './preferenceselector';
import PreferenceSelectorWithGestureHandler from './preferenceselector-gesture-handler';

/**
 * Test component to demonstrate both gesture implementations
 * This component allows you to test and compare both approaches
 */
const GestureTestScreen = ({ navigation }) => {
  const [showPanResponder, setShowPanResponder] = useState(false);
  const [showGestureHandler, setShowGestureHandler] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gesture Control Test</Text>
        <Text style={styles.subtitle}>
          Test both gesture implementations for bottom sheet dismissal
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => setShowPanResponder(true)}
          >
            <Text style={styles.buttonText}>
              Test PanResponder Implementation
            </Text>
            <Text style={styles.buttonSubtext}>
              (Current enhanced implementation)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => setShowGestureHandler(true)}
          >
            <Text style={styles.buttonText}>
              Test Gesture Handler Implementation
            </Text>
            <Text style={styles.buttonSubtext}>
              (Modern react-native-gesture-handler)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Test Instructions:</Text>
          <Text style={styles.instructionText}>
            • Swipe down to dismiss bottom sheet
          </Text>
          <Text style={styles.instructionText}>
            • Quick flick down for velocity dismissal
          </Text>
          <Text style={styles.instructionText}>
            • Partial swipe should spring back
          </Text>
          <Text style={styles.instructionText}>
            • Horizontal swipes should not dismiss
          </Text>
          <Text style={styles.instructionText}>
            • Tap backdrop to dismiss
          </Text>
        </View>
      </View>

      {/* PanResponder Implementation */}
      <PreferenceSelector
        navigation={navigation}
        visible={showPanResponder}
        onClose={() => setShowPanResponder(false)}
      />

      {/* Gesture Handler Implementation */}
      <PreferenceSelectorWithGestureHandler
        navigation={navigation}
        visible={showGestureHandler}
        onClose={() => setShowGestureHandler(false)}
      />
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
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  testButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#E3F2FD',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default GestureTestScreen;
