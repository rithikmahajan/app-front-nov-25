import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Import the latest gesture implementations
import AdvancedGestureBottomSheet from './AdvancedGestureBottomSheet';
import ModernGestureBottomSheet from './ModernGestureBottomSheet';

/**
 * Simple integration example showing how to use the latest gesture control
 * Replace your current PreferenceSelector usage with one of these implementations
 */
const GestureIntegrationExample = ({ navigation }) => {
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [implementationType, setImplementationType] = useState('advanced'); // 'advanced' or 'modern'

  // Example: Trigger from your existing code
  const handleShowPreferences = () => {
    setShowPreferenceModal(true);
  };

  const handleClosePreferences = () => {
    setShowPreferenceModal(false);
  };

  // Choose which implementation to render
  const renderPreferenceModal = () => {
    if (implementationType === 'advanced') {
      return (
        <AdvancedGestureBottomSheet
          navigation={navigation}
          visible={showPreferenceModal}
          onClose={handleClosePreferences}
        />
      );
    } else {
      return (
        <ModernGestureBottomSheet
          navigation={navigation}
          visible={showPreferenceModal}
          onClose={handleClosePreferences}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gesture Control Integration</Text>
        <Text style={styles.subtitle}>
          Ready-to-use implementations with advanced finger control
        </Text>

        {/* Implementation Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Choose Implementation:</Text>
          
          <View style={styles.selectorButtons}>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                implementationType === 'advanced' && styles.selectedSelector
              ]}
              onPress={() => setImplementationType('advanced')}
            >
              <Text style={[
                styles.selectorText,
                implementationType === 'advanced' && styles.selectedSelectorText
              ]}>
                🚀 Advanced
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectorButton,
                implementationType === 'modern' && styles.selectedSelector
              ]}
              onPress={() => setImplementationType('modern')}
            >
              <Text style={[
                styles.selectorText,
                implementationType === 'modern' && styles.selectedSelectorText
              ]}>
                ⚡ Modern
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>✨ Latest Features</Text>
          <Text style={styles.featureItem}>🎯 Full finger drag control</Text>
          <Text style={styles.featureItem}>📍 Intelligent snap points</Text>
          <Text style={styles.featureItem}>🛡️ Safe gesture boundaries</Text>
          <Text style={styles.featureItem}>⚡ 60fps performance</Text>
          <Text style={styles.featureItem}>👀 Visual feedback</Text>
          <Text style={styles.featureItem}>🌍 Cross-platform compatible</Text>
          <Text style={styles.featureItem}>🎨 Dynamic backdrop opacity</Text>
          <Text style={styles.featureItem}>🔄 Velocity-based dismissal</Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={handleShowPreferences}
        >
          <Text style={styles.testButtonText}>
            Test {implementationType === 'advanced' ? 'Advanced' : 'Modern'} Gesture Control
          </Text>
          <Text style={styles.testButtonSubtext}>
            Drag, swipe, and control with your finger
          </Text>
        </TouchableOpacity>

        {/* Integration Code Preview */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeTitle}>💻 Integration Code:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`// Replace your current PreferenceSelector with:
import ${implementationType === 'advanced' ? 'AdvancedGestureBottomSheet' : 'ModernGestureBottomSheet'} from './src/screens/${implementationType === 'advanced' ? 'AdvancedGestureBottomSheet' : 'ModernGestureBottomSheet'}';

// Usage
<${implementationType === 'advanced' ? 'AdvancedGestureBottomSheet' : 'ModernGestureBottomSheet'}
  visible={showModal}
  onClose={() => setShowModal(false)}
  navigation={navigation}
/>`}
            </Text>
          </View>
        </View>
      </View>

      {/* Render the selected implementation */}
      {renderPreferenceModal()}
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
    marginBottom: 30,
    lineHeight: 22,
  },
  selectorContainer: {
    marginBottom: 30,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  selectedSelector: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  selectedSelectorText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  featuresContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 6,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testButtonSubtext: {
    color: '#E3F2FD',
    fontSize: 14,
    fontWeight: '500',
  },
  codeContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    color: '#E8E8E8',
    fontFamily: 'Courier New',
    lineHeight: 16,
  },
});

export default GestureIntegrationExample;
