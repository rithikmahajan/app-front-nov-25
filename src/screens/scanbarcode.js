import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  Easing,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import { GlobalBackButton } from '../components';

const { width, height } = Dimensions.get('window');

// Simple TickIcon component
const TickIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Text style={[styles.tickIcon, { fontSize: size, color }]}>✓</Text>
);

// Main Barcode Scanner Screen with instructions
const BarcodeInstructionScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleGoBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const handleNextTip = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('ManualProductNumber');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.screenContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton navigation={navigation} style={styles.backButton} onPress={handleGoBack} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>SCAN THE PRICE TAG TO{'\n'}EXPLORE AN ITEM</Text>
          
          <Text style={styles.description}>
            Align the price tag within the screen frame{'\n'}
            and make sure the code is legible. A{'\n'}
            successful scan gives you product{'\n'}
            information such as availability and{'\n'}
            customer reviews
          </Text>
        </View>

        {/* Next Tip Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextTip}>
            <Text style={styles.nextButtonText}>Next Tip</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// Manual Product Number Screen
const ManualProductNumberScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleGoBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const handleStartScanning = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('CameraScanning');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.screenContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton navigation={navigation} style={styles.backButton} onPress={handleGoBack} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>MANUALLY ADDING{'\n'}PRODUCT NUMBER</Text>
          
          <Text style={styles.description}>
            You'll find the 14 digit product number on{'\n'}
            the lower right side of the tag
          </Text>
        </View>

        {/* Start Scanning Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.startScanningButton} onPress={handleStartScanning}>
            <Text style={styles.startScanningButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// Simple Camera Scanning Screen - Uses existing camera approach
const CameraScanningScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    console.log('CameraScanningScreen: Requesting camera permission...');
    requestCameraPermission();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      console.log('Requesting permission for:', permission);
      const result = await request(permission);
      console.log('Permission result:', result);
      
      if (result === RESULTS.GRANTED) {
        console.log('Camera permission granted');
        setHasPermission(true);
      } else {
        console.log('Camera permission denied');
        setHasPermission(false);
      }
    } catch (error) {
      console.log('Camera permission error:', error);
      setHasPermission(false);
    }
  };

  const handleGoBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('SearchScreen');
    });
  };

  const handleProductNumber = () => {
    Animated.timing(slideAnim, {
      toValue: -height,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('EnterGTIN');
    });
  };

  const handleStartScanning = async () => {
    setIsScanning(true);
    
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 1,
    };

    try {
      console.log('Opening camera for barcode scanning...');
      
      // Since we don't have a dedicated barcode scanner, we'll simulate the scanning experience
      // In a real implementation, you'd integrate with a barcode scanning library
      setTimeout(() => {
        setIsScanning(false);
        Alert.alert(
          'Barcode Scanner',
          'Camera opened successfully! Point your camera at a barcode to scan.',
          [
            {
              text: 'Try Sample Code',
              onPress: () => {
                // Simulate a scanned barcode
                Alert.alert(
                  'Barcode Scanned',
                  'Sample Code: 1234567890123\nType: EAN-13',
                  [
                    {
                      text: 'Scan Again',
                      onPress: () => handleStartScanning()
                    },
                    {
                      text: 'Use This Code',
                      onPress: () => {
                        navigation.navigate('SearchScreen', { scannedCode: '1234567890123', barcodeType: 'ean-13' });
                      }
                    }
                  ]
                );
              }
            },
            {
              text: 'Close',
              onPress: () => setIsScanning(false)
            }
          ]
        );
      }, 1000);
      
    } catch (error) {
      console.log('Camera error:', error);
      setIsScanning(false);
      Alert.alert('Camera Error', 'Failed to open camera');
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>No access to camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Animated.View 
        style={[
          styles.cameraContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.cameraHeader}>
          <GlobalBackButton navigation={navigation} style={styles.cameraBackButton} onPress={handleGoBack} iconColor="#FFFFFF" />
        </View>

        {/* Simple Scanning Interface */}
        <View style={styles.scanningInterface}>
          <Text style={styles.cameraInstruction}>
            {isScanning ? 'Opening camera...' : 'Fit the code within the frame of the screen'}
          </Text>
          
          {/* Scanning Frame */}
          <View style={styles.scanningFrame}>
            <View style={styles.markerContainer}>
              <View style={[styles.marker, styles.topLeft]} />
              <View style={[styles.marker, styles.topRight]} />
              <View style={[styles.marker, styles.bottomLeft]} />
              <View style={[styles.marker, styles.bottomRight]} />
              
              {isScanning ? (
                <View style={styles.scanningIndicator}>
                  <Text style={styles.scanningText}>Opening camera...</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.scanButton} onPress={handleStartScanning}>
                  <Text style={styles.scanButtonText}>Tap to Scan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.productNumberButton} onPress={handleProductNumber}>
            <Text style={styles.productNumberButtonText}>Enter Product Number Manually</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// Enter GTIN Screen
const EnterGTINScreen = ({ navigation }) => {
  const [gtinNumber, setGtinNumber] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleGoBack = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const handleContinue = () => {
    if (gtinNumber.trim()) {
      setShowSuccessModal(true);
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const handleDone = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessModal(false);
      navigation.navigate('ProductDetailsMain');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.screenContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlobalBackButton navigation={navigation} style={styles.backButton} onPress={handleGoBack} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>PLEASE ENTER EITHER 14 DIGIT GTIN</Text>
          
          <Text style={styles.description}>
            You will find it on the lower right{'\n'}
            side of the tag
          </Text>

          {/* GTIN Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.gtinInput}
              placeholder="GTIN Number"
              placeholderTextColor={Colors.textTertiary}
              value={gtinNumber}
              onChangeText={setGtinNumber}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              gtinNumber.trim() ? styles.continueButtonEnabled : styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!gtinNumber.trim()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.successModal,
              { opacity: modalOpacity }
            ]}
          >
            <View style={styles.checkIcon}>
              <TickIcon size={24} color="#FFFFFF" />
            </View>
            
            <Text style={styles.successTitle}>GTIN verified successfully</Text>
            <Text style={styles.successDescription}>Taking you to the product</Text>
            
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Main component that manages screen flow
const ScanBarcodeFlow = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState('instruction');

  const flowNavigation = {
    ...navigation,
    navigate: (screenName, params) => {
      switch (screenName) {
        case 'ManualProductNumber':
          setCurrentStep('manual');
          break;
        case 'CameraScanning':
          setCurrentStep('camera');
          break;
        case 'EnterGTIN':
          setCurrentStep('gtin');
          break;
        case 'SearchScreen':
          navigation.navigate('SearchScreen');
          break;
        default:
          navigation.navigate(screenName, params);
      }
    },
    goBack: () => {
      switch (currentStep) {
        case 'manual':
          setCurrentStep('instruction');
          break;
        case 'camera':
          navigation.navigate('SearchScreen');
          break;
        case 'gtin':
          setCurrentStep('camera');
          break;
        case 'instruction':
          navigation.navigate('SearchScreen');
          break;
        default:
          navigation.goBack();
      }
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'instruction':
        return <BarcodeInstructionScreen navigation={flowNavigation} />;
      case 'manual':
        return <ManualProductNumberScreen navigation={flowNavigation} />;
      case 'camera':
        return <CameraScanningScreen navigation={flowNavigation} />;
      case 'gtin':
        return <EnterGTINScreen navigation={flowNavigation} />;
      default:
        return <BarcodeInstructionScreen navigation={flowNavigation} />;
    }
  };

  return renderCurrentStep();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.lg, // 16px top padding
  },
  tickIcon: {
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
  },
  cameraHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  cameraBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: -Spacing.xxl, // Slight adjustment to match Figma positioning
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 32, // Better line spacing for title
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.sm, // Add slight top margin
  },
  cameraInstruction: {
    fontSize: FontSizes.md,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  scanFrame: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  scanArea: {
    width: 200,
    height: 280,
    borderWidth: 2,
    borderColor: '#666666',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.lg,
  },
  zoomControls: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  scanResult: {
    fontSize: FontSizes.md,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  cameraButtonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  nextButton: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    marginHorizontal: Spacing.md, // Add horizontal margin to match Figma width
  },
  nextButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  startScanningButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
  },
  startScanningButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.background,
    textAlign: 'center',
  },
  productNumberButton: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  productNumberButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  gtinInput: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
  },
  continueButtonEnabled: {
    opacity: 1,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    minWidth: 300,
  },
  checkIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  doneButton: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    minWidth: 200,
  },
  doneButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.background,
    textAlign: 'center',
  },
  // Camera Scanner Styles
  scanningInterface: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  scanningFrame: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -10 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  marker: {
    position: 'absolute',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    width: 40,
    height: 40,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  permissionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanBarcodeFlow;