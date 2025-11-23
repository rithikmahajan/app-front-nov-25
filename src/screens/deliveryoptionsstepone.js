import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { useShiprocket } from '../contexts/ShiprocketContext';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
} from '../utils/responsive';

const DeliveryOptionsStepOneScreen = ({ navigation, route }) => {
  const [postcode, setPostcode] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [deliveryOptionsLoaded, setDeliveryOptionsLoaded] = useState(false);
  const [shiprocketOptions, setShiprocketOptions] = useState([]);
  const [deliveryType, setDeliveryType] = useState(''); // 'domestic' or 'international'

  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Get currency context for pricing
  const { 
    formatPrice,
    updateLocation 
  } = useCurrencyContext();

  // Get Shiprocket context for serviceability check
  const { checkServiceability } = useShiprocket();

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Animation functions
  const triggerUnserviceableAnimation = () => {
    // Reset animation values
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);
    
    // Animate in sequence: fade in, scale up, slide up
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const resetForNewPostcode = () => {
    setDeliveryOptionsLoaded(false);
    setShiprocketOptions([]);
    setSelectedOption(null);
    setDeliveryType('');
    
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);
  };

  const handlePostcodeChange = (text) => {
    setPostcode(text);
    
    // If user starts typing after seeing results, reset the view
    if (deliveryOptionsLoaded && text !== postcode) {
      resetForNewPostcode();
    }
  };

  // Function to detect if postcode is domestic (Indian) or international
  const detectDeliveryType = (inputPostcode) => {
    // Indian postal codes are 6 digits (PIN codes)
    const indianPostcodePattern = /^[1-9][0-9]{5}$/;
    
    if (indianPostcodePattern.test(inputPostcode.trim())) {
      return {
        isDomestic: true,
        country: 'India',
        deliveryType: 'domestic'
      };
    } else {
      return {
        isDomestic: false,
        country: 'International',
        deliveryType: 'international'
      };
    }
  };

  const handleUpdatePress = async () => {
    if (!postcode.trim()) {
      Alert.alert('Error', 'Please enter a valid postcode');
      return;
    }

    try {
      setIsValidating(true);
      
      // Reset previous state when starting new search
      if (deliveryOptionsLoaded) {
        resetForNewPostcode();
      }
      const detectedType = detectDeliveryType(postcode);
      setDeliveryType(detectedType.deliveryType);
      console.log('🌍 Detected delivery type:', detectedType, 'for postcode:', postcode);
      
      // Update location context with detected delivery type
      await updateLocation({
        postcode: postcode.trim(),
        country: detectedType.country,
        currency: detectedType.isDomestic ? 'INR' : 'USD',
        isDomestic: detectedType.isDomestic
      });
      
      // Use Shiprocket serviceability check to get real delivery options
      // Default pickup pincode (you may want to make this configurable)
      const pickupPincode = '110001'; // Default pickup location (Delhi)
      const estimatedWeight = 0.5; // Default weight in kg
      
      console.log('🚚 Checking Shiprocket serviceability...');
      const serviceabilityResult = await checkServiceability(
        pickupPincode,
        postcode.trim(),
        estimatedWeight
      );
      
      if (serviceabilityResult.success && serviceabilityResult.data?.available_couriers?.length > 0) {
        console.log('✅ Delivery options available:', serviceabilityResult.data.available_couriers.length);
        
        // Transform Shiprocket courier data into our format
        const transformedOptions = serviceabilityResult.data.available_couriers.map(courier => {
          // Use freight_charge for fallback data or rate for real Shiprocket data
          const deliveryCost = courier.freight_charge || courier.rate || 0;
          
          return {
            id: courier.courier_company_id,
            name: `${detectedType.isDomestic ? 'Domestic' : 'International'} ${courier.courier_name}`,
            description: `${courier.delivery_performance || 'Standard'} delivery via ${courier.courier_name}`,
            cost: deliveryCost,
            free: deliveryCost === 0,
            estimatedDays: courier.estimated_delivery_days || 'N/A',
            courierCompanyId: courier.courier_company_id,
            isDomestic: detectedType.isDomestic,
            shiprocketData: courier // Store original data for later use
          };
        });

        // Add FREE DELIVERY option as the first option for all Indian pincodes
        const freeDeliveryOption = {
          id: 'free_delivery_yoraa',
          name: 'Free Delivery',
          description: 'Standard delivery across India at no extra cost',
          cost: 0,
          free: true,
          estimatedDays: '7-10 days',
          courierCompanyId: 'yoraa_free',
          isDomestic: detectedType.isDomestic,
          isDefault: true // Mark this as default option
        };

        // Combine free delivery with other options (free delivery first)
        const allOptions = [freeDeliveryOption, ...transformedOptions];
        
        setShiprocketOptions(allOptions);
        setDeliveryOptionsLoaded(true);
        
        // Auto-select FREE DELIVERY option by default
        setSelectedOption(freeDeliveryOption);
        
        console.log('📦 All delivery options (including free):', allOptions);
      } else {
        console.log('⚠️ No Shiprocket courier options available, but providing free delivery for Indian pincode:', postcode);
        
        // Even if Shiprocket doesn't have options, provide free delivery for Indian pincodes
        if (detectedType.isDomestic) {
          const freeDeliveryOption = {
            id: 'free_delivery_yoraa',
            name: 'Free Delivery',
            description: 'Standard delivery across India at no extra cost',
            cost: 0,
            free: true,
            estimatedDays: '7-10 days',
            courierCompanyId: 'yoraa_free',
            isDomestic: true,
            isDefault: true
          };

          setShiprocketOptions([freeDeliveryOption]);
          setSelectedOption(freeDeliveryOption);
          setDeliveryOptionsLoaded(true);
          
          console.log('✅ Free delivery option provided as fallback');
        } else {
          // For international pincodes, show unserviceable if no options
          console.log('❌ No delivery options available for international postcode:', postcode);
          setShiprocketOptions([]);
          setDeliveryOptionsLoaded(true);
          setSelectedOption(null);
          
          // Trigger unserviceable animation
          triggerUnserviceableAnimation();
        }
      }
      
    } catch (error) {
      console.error('Error validating postcode:', error);
      Alert.alert('Validation Error', 'Failed to validate postcode. Please try again.');
      setDeliveryOptionsLoaded(false);
      setShiprocketOptions([]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleContinueToStepTwo = () => {
    console.log('🚀 Continue button pressed');
    console.log('Selected option:', selectedOption);
    
    if (!selectedOption) {
      Alert.alert('Selection Required', 'Please select a delivery option to continue.');
      return;
    }

    const navigationData = {
      selectedDeliveryOption: selectedOption,
      postcode: postcode.trim(),
      deliveryType: deliveryType,
      isDomestic: selectedOption.isDomestic,
      // Pass through checkout flow parameters
      fromCheckout: route?.params?.fromCheckout,
      returnScreen: route?.params?.returnScreen,
      bagData: route?.params?.bagData
    };
    
    console.log('📤 Navigating to DeliveryOptionsStepTwo with data:', navigationData);

    // Navigate to step two with selected delivery option data
    navigation.navigate('DeliveryOptionsStepTwo', navigationData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Postcode Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Postcode"
            placeholderTextColor={Colors.gray600}
            value={postcode}
            onChangeText={handlePostcodeChange}
            keyboardType="numeric"
            maxLength={10}
            autoCapitalize="none"
          />
        </View>

        {/* Update Button - Always show for postcode updates */}
        <TouchableOpacity 
          style={[styles.updateButton, isValidating && styles.updateButtonDisabled]} 
          onPress={handleUpdatePress}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.updateButtonText}>
              {deliveryOptionsLoaded ? 'Try Different Postcode' : 'Update'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Delivery Options - Only show after postcode validation */}
        {deliveryOptionsLoaded && (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Delivery Options</Text>
            
            {shiprocketOptions && shiprocketOptions.length > 0 ? (
                <>
                  {/* Real-time delivery options from Shiprocket */}
                  {shiprocketOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.id || index}
                      style={styles.optionRow}
                      onPress={() => handleOptionSelect(option)}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, selectedOption === option && styles.checkboxChecked]}>
                          {selectedOption === option && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>
                          {option.name}
                        </Text>
                        <Text style={styles.optionSubtitle}>
                          {option.description}
                          {option.estimatedDays !== 'N/A' && ` • ${option.estimatedDays} days`}
                        </Text>
                        {!option.free && (
                          <Text style={styles.optionPrice}>{formatPrice(option.cost)}</Text>
                        )}
                        {option.free && (
                          <Text style={styles.optionPriceFree}>FREE</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <>
                  {/* Animated Unserviceable message when no delivery options available */}
                  <Animated.View 
                    style={[
                      styles.unserviceableContainer,
                      {
                        opacity: fadeAnim,
                        transform: [
                          { scale: scaleAnim },
                          { translateY: slideAnim }
                        ]
                      }
                    ]}
                  >
                    <Text style={styles.unserviceableIcon}>📦</Text>
                    <Text style={styles.unserviceableTitle}>Service Not Available</Text>
                    <Text style={styles.unserviceableMessage}>
                      Sorry, we don't deliver to this postcode yet. 
                    </Text>
                    <Text style={styles.unserviceableSubMessage}>
                      Please try a different postcode above or contact our support team.
                    </Text>
                  </Animated.View>
                  
                  {/* Clear Postcode Button */}
                  <TouchableOpacity 
                    style={styles.clearPostcodeButton} 
                    onPress={() => {
                      resetForNewPostcode();
                      setPostcode('');
                      // Focus back to input for immediate retry
                      // Note: You could add a ref to the TextInput for this
                    }}
                  >
                    <Text style={styles.clearPostcodeButtonText}>Clear & Try Again</Text>
                  </TouchableOpacity>
                </>
              )}

            {/* Continue Button */}
            <TouchableOpacity 
              style={[styles.updateButton, !selectedOption && styles.updateButtonDisabled]} 
              onPress={handleContinueToStepTwo}
              disabled={!selectedOption}
            >
              <Text style={styles.updateButtonText}>Continue</Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              All dates and prices are subject to change. Actual delivery options will be calculated at checkout.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Delivery Options Step Two Modal */}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: {
    width: getResponsiveValue(40, 45, 50),
    height: getResponsiveValue(40, 45, 50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: getResponsiveFontSize(24),
    color: Colors.black,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: getResponsiveValue(40, 45, 50),
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(24),
  },
  inputContainer: {
    marginTop: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(24),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 6,
    paddingHorizontal: getResponsiveSpacing(12),
    paddingVertical: getResponsiveSpacing(15),
    fontSize: getResponsiveFontSize(16),
    color: Colors.black,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '500',
    color: Colors.black,
    marginBottom: getResponsiveSpacing(16),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(24),
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  checkboxContainer: {
    marginRight: getResponsiveSpacing(22),
  },
  checkbox: {
    width: getResponsiveValue(20, 22, 24),
    height: getResponsiveValue(20, 22, 24),
    borderRadius: getResponsiveValue(10, 11, 12),
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.black,
  },
  checkMark: {
    color: Colors.white,
    fontSize: getResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: Colors.black,
    marginBottom: getResponsiveSpacing(4),
  },
  optionSubtitle: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.gray600,
    marginBottom: getResponsiveSpacing(2),
  },
  optionPrice: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.gray600,
  },
  disclaimer: {
    fontSize: getResponsiveFontSize(12),
    color: Colors.gray600,
    marginTop: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(24),
    lineHeight: getResponsiveValue(16, 18, 20),
  },
  updateButton: {
    backgroundColor: Colors.black,
    borderRadius: 50,
    paddingVertical: getResponsiveSpacing(16),
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(24),
  },
  updateButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: Colors.white,
  },
  updateButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  checkboxDisabled: {
    width: getResponsiveValue(20, 22, 24),
    height: getResponsiveValue(20, 22, 24),
    borderRadius: getResponsiveValue(10, 11, 12),
    borderWidth: 2,
    borderColor: Colors.gray400,
    backgroundColor: Colors.gray100,
  },
  optionTitleDisabled: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: Colors.gray400,
    marginBottom: getResponsiveSpacing(4),
  },
  optionPriceFree: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.green600,
    fontWeight: '600',
  },
  unserviceableContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: getResponsiveSpacing(24),
    marginVertical: getResponsiveSpacing(20),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fed7d7',
    shadowColor: '#e53e3e',
    shadowOffset: {
      width: 0,
      height: getResponsiveValue(4, 5, 6),
    },
    shadowOpacity: 0.1,
    shadowRadius: getResponsiveValue(8, 9, 10),
    elevation: 4,
  },
  unserviceableIcon: {
    fontSize: getResponsiveFontSize(48),
    marginBottom: getResponsiveSpacing(12),
  },
  unserviceableTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: getResponsiveSpacing(12),
    textAlign: 'center',
  },
  unserviceableMessage: {
    fontSize: getResponsiveFontSize(16),
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8),
    lineHeight: getResponsiveValue(22, 25, 28),
    fontWeight: '500',
  },
  unserviceableSubMessage: {
    fontSize: getResponsiveFontSize(14),
    color: '#718096',
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 22, 24),
  },
  clearPostcodeButton: {
    backgroundColor: '#667eea',
    paddingVertical: getResponsiveSpacing(14),
    paddingHorizontal: getResponsiveSpacing(28),
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: getResponsiveSpacing(16),
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: getResponsiveValue(2, 3, 4),
    },
    shadowOpacity: 0.25,
    shadowRadius: getResponsiveValue(4, 5, 6),
    elevation: 3,
  },
  clearPostcodeButtonText: {
    color: '#ffffff',
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
  },
});

export default DeliveryOptionsStepOneScreen;
