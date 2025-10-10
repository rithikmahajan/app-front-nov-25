import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import AdvancedGestureBottomSheet from './AdvancedGestureBottomSheet';
import ModernGestureBottomSheet from './ModernGestureBottomSheet';
import PreferenceSelector from './preferenceselector'; // Your current implementation

/**
 * Comprehensive test component for all gesture implementations
 * This allows you to test and compare all three approaches
 */
const GestureComparisonTest = ({ navigation }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModern, setShowModern] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🎮 Gesture Control Test Lab</Text>
        <Text style={styles.subtitle}>
          Test all three gesture implementations
        </Text>

        <View style={styles.implementationsContainer}>
          
          {/* Advanced PanResponder Implementation */}
          <View style={styles.implementationCard}>
            <Text style={styles.cardTitle}>🚀 Advanced PanResponder</Text>
            <Text style={styles.cardDescription}>
              Latest enhanced implementation with intelligent snap points, 
              advanced velocity tracking, and comprehensive gesture safety.
            </Text>
            <Text style={styles.cardFeatures}>
              ✅ Intelligent snap points{'\n'}
              ✅ Advanced velocity detection{'\n'}
              ✅ Gesture boundaries{'\n'}
              ✅ Dynamic backdrop opacity{'\n'}
              ✅ Visual feedback
            </Text>
            <TouchableOpacity 
              style={[styles.testButton, styles.advancedButton]}
              onPress={() => setShowAdvanced(true)}
            >
              <Text style={styles.buttonText}>Test Advanced</Text>
            </TouchableOpacity>
          </View>

          {/* Modern Gesture Handler Implementation */}
          <View style={styles.implementationCard}>
            <Text style={styles.cardTitle}>⚡ Modern Gesture Handler</Text>
            <Text style={styles.cardDescription}>
              Ultra-high performance implementation using react-native-gesture-handler. 
              Runs on UI thread for 60fps performance.
            </Text>
            <Text style={styles.cardFeatures}>
              ⚡ 60fps UI thread performance{'\n'}
              ✅ Modern gesture recognition{'\n'}
              ✅ Better iOS/Android parity{'\n'}
              ✅ Reduced bridge usage{'\n'}
              ✅ Advanced state management
            </Text>
            <TouchableOpacity 
              style={[styles.testButton, styles.modernButton]}
              onPress={() => setShowModern(true)}
            >
              <Text style={styles.buttonText}>Test Modern</Text>
            </TouchableOpacity>
          </View>

          {/* Original Implementation */}
          <View style={styles.implementationCard}>
            <Text style={styles.cardTitle}>📱 Your Current Implementation</Text>
            <Text style={styles.cardDescription}>
              Your existing preference selector with the enhanced gesture control 
              that was already working well.
            </Text>
            <Text style={styles.cardFeatures}>
              ✅ Production ready{'\n'}
              ✅ Well-tested{'\n'}
              ✅ Solid performance{'\n'}
              ✅ Enhanced gestures{'\n'}
              ✅ Stable implementation
            </Text>
            <TouchableOpacity 
              style={[styles.testButton, styles.originalButton]}
              onPress={() => setShowOriginal(true)}
            >
              <Text style={styles.buttonText}>Test Current</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>🧪 Test Instructions</Text>
          
          <View style={styles.instructionGroup}>
            <Text style={styles.instructionHeader}>Basic Gestures:</Text>
            <Text style={styles.instructionText}>• Swipe down slowly → Should spring back</Text>
            <Text style={styles.instructionText}>• Swipe down far → Should dismiss</Text>
            <Text style={styles.instructionText}>• Quick flick down → Should dismiss with velocity</Text>
          </View>

          <View style={styles.instructionGroup}>
            <Text style={styles.instructionHeader}>Advanced Tests:</Text>
            <Text style={styles.instructionText}>• Swipe up → Should have resistance</Text>
            <Text style={styles.instructionText}>• Horizontal swipe → Should not dismiss</Text>
            <Text style={styles.instructionText}>• Tap backdrop → Should dismiss</Text>
            <Text style={styles.instructionText}>• Drag and hold → Should follow finger</Text>
          </View>

          <View style={styles.instructionGroup}>
            <Text style={styles.instructionHeader}>Performance Check:</Text>
            <Text style={styles.instructionText}>• Watch for smooth 60fps animation</Text>
            <Text style={styles.instructionText}>• Check responsive gesture tracking</Text>
            <Text style={styles.instructionText}>• Notice visual feedback on handle</Text>
            <Text style={styles.instructionText}>• Observe backdrop opacity changes</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>🎯 Recommendations</Text>
          
          <View style={styles.recommendationItem}>
            <Text style={styles.recommendationLabel}>🥇 For Production:</Text>
            <Text style={styles.recommendationText}>
              Use <Text style={styles.highlight}>Advanced PanResponder</Text> - 
              Most stable and feature-complete
            </Text>
          </View>

          <View style={styles.recommendationItem}>
            <Text style={styles.recommendationLabel}>⚡ For Performance:</Text>
            <Text style={styles.recommendationText}>
              Use <Text style={styles.highlight}>Modern Gesture Handler</Text> - 
              Highest performance for complex apps
            </Text>
          </View>

          <View style={styles.recommendationItem}>
            <Text style={styles.recommendationLabel}>🔄 Migration Path:</Text>
            <Text style={styles.recommendationText}>
              Current → Advanced → Modern (gradual upgrade)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Implementations */}
      <AdvancedGestureBottomSheet
        navigation={navigation}
        visible={showAdvanced}
        onClose={() => setShowAdvanced(false)}
      />

      <ModernGestureBottomSheet
        navigation={navigation}
        visible={showModern}
        onClose={() => setShowModern(false)}
      />

      <PreferenceSelector
        navigation={navigation}
        visible={showOriginal}
        onClose={() => setShowOriginal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  implementationsContainer: {
    marginBottom: 30,
  },
  implementationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFeatures: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  advancedButton: {
    backgroundColor: '#2196F3',
  },
  modernButton: {
    backgroundColor: '#FF6B35',
  },
  originalButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#F1F8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#D4E7FF',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 16,
  },
  instructionGroup: {
    marginBottom: 16,
  },
  instructionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
    lineHeight: 18,
    paddingLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 16,
  },
  recommendationItem: {
    marginBottom: 12,
  },
  recommendationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 18,
    paddingLeft: 8,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FF6F00',
  },
});

export default GestureComparisonTest;
