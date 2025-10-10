import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import YoraaLogo from '../assets/icons/YoraaLogo';

const { height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Simple dots animation
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);

    // Auto-hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <YoraaLogo width={250} height={55} color="#000000" />
      </View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading{dots}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
});

export default SplashScreen;
