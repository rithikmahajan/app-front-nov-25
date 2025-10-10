/**
 * 🔍 TEMPORARY CHAT DEBUG COMPONENT
 * 
 * Add this component to your app temporarily to debug the chat integration
 * You can add it to any screen or create a debug screen
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { debugChatIntegration } from '../utils/chatDebugger';

const ChatDebugComponent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      console.log('🔍 Starting chat integration diagnostic...');
      const diagnosticResults = await debugChatIntegration();
      setResults(diagnosticResults);
      
      // Show quick summary
      const passCount = Object.values(diagnosticResults).filter(v => v === true).length;
      const totalTests = 5;
      
      Alert.alert(
        'Diagnostic Complete',
        `✅ ${passCount}/${totalTests} tests passed\n❌ ${diagnosticResults.errors.length} errors found\n\nCheck console for detailed results.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      Alert.alert('Diagnostic Error', `Failed to run diagnostic: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    return status ? '#28a745' : '#dc3545';
  };

  const getStatusText = (status) => {
    return status ? '✅ PASS' : '❌ FAIL';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Chat Integration Debugger</Text>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runDiagnostic}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
        </Text>
      </TouchableOpacity>

      {results && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Test Results</Text>
          
          <View style={styles.testResult}>
            <Text style={[styles.testName, { color: getStatusColor(results.firebaseAuth) }]}>
              Firebase Authentication: {getStatusText(results.firebaseAuth)}
            </Text>
          </View>
          
          <View style={styles.testResult}>
            <Text style={[styles.testName, { color: getStatusColor(results.tokenGeneration) }]}>
              Token Generation: {getStatusText(results.tokenGeneration)}
            </Text>
          </View>
          
          <View style={styles.testResult}>
            <Text style={[styles.testName, { color: getStatusColor(results.backendConnection) }]}>
              Backend Connection: {getStatusText(results.backendConnection)}
            </Text>
          </View>
          
          <View style={styles.testResult}>
            <Text style={[styles.testName, { color: getStatusColor(results.authValidation) }]}>
              Auth Validation: {getStatusText(results.authValidation)}
            </Text>
          </View>
          
          <View style={styles.testResult}>
            <Text style={[styles.testName, { color: getStatusColor(results.chatSession) }]}>
              Chat Session Creation: {getStatusText(results.chatSession)}
            </Text>
          </View>

          {results.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>❌ Errors Found:</Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  {index + 1}. {error}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Text style={styles.note}>
        💡 Check the console for detailed logs and recommendations
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  testResult: {
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 5,
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatDebugComponent;
