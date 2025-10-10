import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';

const LoadingComponent = ({ 
  visible = false, 
  text = 'Loading...', 
  transparent = true,
  size = 'large',
  color = '#000000',
  overlay = true,
}) => {
  if (overlay) {
    return (
      <Modal
        transparent={transparent}
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, styles.inlineText]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  inlineText: {
    marginTop: 0,
    marginLeft: 12,
  },
});

export default LoadingComponent;
