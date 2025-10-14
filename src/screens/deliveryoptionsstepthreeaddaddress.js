import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  PanResponder,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAddress } from '../contexts/AddressContext';
import { CaretDownIcon } from '../assets/icons';
import GlobalBackButton from '../components/GlobalBackButton';

const { height: screenHeight } = Dimensions.get('window');

// Indian states and union territories data
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttarakhand', 
  'Uttar Pradesh', 'West Bengal', 'Jammu and Kashmir', 'Ladakh',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Puducherry'
].sort();

// PIN code validation function
const validatePinCodeWithState = (pinCode, selectedState) => {
  if (!pinCode || pinCode.length !== 6) {
    return { isValid: false, message: 'PIN code must be 6 digits' };
  }

  const pinPrefix = pinCode.substring(0, 3);
  
  // PIN code ranges for each state/UT
  const stateRanges = {
    'Andhra Pradesh': ['515', '517', '518', '519', '520', '521', '522', '523', '524', '525', '526', '527', '528', '529', '530', '531', '532', '533', '534', '535'],
    'Arunachal Pradesh': ['790', '791', '792'],
    'Assam': ['781', '782', '783', '784', '785', '786', '787', '788'],
    'Bihar': ['800', '801', '802', '803', '804', '805', '811', '812', '813', '814', '815', '816', '821', '822', '823', '824', '825', '831', '841', '842', '843', '844', '845', '846', '847', '848', '849', '851', '852', '853', '854', '855'],
    'Chhattisgarh': ['490', '491', '492', '493', '494', '495', '496', '497'],
    'Delhi': ['110'],
    'Goa': ['403'],
    'Gujarat': ['360', '361', '362', '363', '364', '365', '370', '380', '381', '382', '383', '384', '385', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396'],
    'Haryana': ['121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136'],
    'Himachal Pradesh': ['170', '171', '172', '173', '174', '175', '176', '177'],
    'Jharkhand': ['829'],
    'Karnataka': ['560', '561', '562', '563', '564', '565', '571', '572', '573', '574', '575', '576', '577', '581', '582', '583', '584', '585', '586', '587', '590', '591'],
    'Kerala': ['670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '693', '694', '695'],
    'Madhya Pradesh': ['450', '451', '452', '453', '454', '455', '456', '457', '458', '459', '460', '461', '462', '463', '464', '465', '466', '467', '468', '469', '470', '471', '472', '473', '474', '475', '476', '477', '478', '479', '480', '481', '482', '483', '484', '485', '486', '487', '488'],
    'Maharashtra': ['400', '401', '402', '404', '405', '410', '411', '412', '413', '414', '415', '416', '417', '418', '421', '422', '423', '424', '425', '431', '432', '433', '434', '435', '436', '440', '441', '442', '443', '444', '445'],
    'Manipur': ['795'],
    'Meghalaya': ['793', '794'],
    'Mizoram': ['796'],
    'Nagaland': ['797', '798'],
    'Odisha': ['751', '752', '753', '754', '755', '756', '757', '758', '759', '760', '761', '762', '763', '764', '765', '766', '767', '768', '769', '770'],
    'Punjab': ['140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159'],
    'Rajasthan': ['301', '302', '303', '304', '305', '306', '307', '311', '312', '313', '314', '321', '322', '323', '324', '325', '326', '327', '331', '332', '333', '334', '335', '341', '342', '343', '344', '345'],
    'Sikkim': ['737'],
    'Tamil Nadu': ['600', '601', '602', '603', '604', '606', '608', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '630', '631', '632', '633', '634', '635', '636', '637', '638', '639', '641', '642', '643'],
    'Telangana': ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509'],
    'Tripura': ['799'],
    'Uttarakhand': ['244', '245', '246', '247', '248', '249', '260', '263'],
    'Uttar Pradesh': ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '214', '215', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '241', '242', '243', '251', '252', '253', '254', '271', '272', '273', '274', '275', '276', '277', '281', '282', '283', '284', '285'],
    'West Bengal': ['700', '701', '702', '703', '704', '705', '711', '712', '713', '714', '715', '716', '717', '721', '722', '723', '724', '731', '732', '733', '734', '735', '736', '741', '742', '743'],
    'Jammu and Kashmir': ['180', '181', '182', '183', '184', '185', '186', '188', '190', '191', '192', '193', '194'],
    'Ladakh': ['194'],
    'Andaman and Nicobar Islands': ['744'],
    'Chandigarh': ['160'],
    'Dadra and Nagar Haveli and Daman and Diu': ['396'],
    'Lakshadweep': ['682'],
    'Puducherry': ['605', '607', '609', '533']
  };

  const validRanges = stateRanges[selectedState];
  if (!validRanges) {
    return { isValid: false, message: 'Invalid state selected' };
  }

  if (validRanges.includes(pinPrefix)) {
    return { isValid: true, message: '' };
  } else {
    return { isValid: false, message: `PIN code doesn't match ${selectedState}` };
  }
};

// Country codes data
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
];

// Validation functions
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

const AddAddressModal = ({ visible = true, onClose, editingAddress, navigation, route }) => {
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const panY = useRef(new Animated.Value(0)).current;
  const { addAddress, updateAddress, loading } = useAddress();
  
  // Determine if this is being used as a standalone screen or modal
  const isStandaloneScreen = navigation && route;
  const routeEditingAddress = route?.params?.editingAddress || route?.params?.addressData;
  const isEditMode = route?.params?.isEdit || !!editingAddress || !!routeEditingAddress;
  const finalEditingAddress = editingAddress || routeEditingAddress;
  
  // Debug logging
  console.log('📝 AddAddressModal rendered with:', {
    visible,
    hasEditingAddress: !!editingAddress,
    isStandaloneScreen,
    isEditMode,
    finalEditingAddress: finalEditingAddress ? 'Present' : 'None',
    routeParams: route?.params
  });
    const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Select State',
    pin: '',
    country: 'India',
    phone: '',
    phonePrefix: '+91',
    type: 'Home', // Default to Home
  });
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [errors, setErrors] = useState({});
  const [validationState, setValidationState] = useState('none'); // 'none', 'inline', 'full'
  const [validFields, setValidFields] = useState({});
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [showPhonePrefixModal, setShowPhonePrefixModal] = useState(false);

  // Pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        panY.setOffset(panY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        panY.flattenOffset();
        
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close modal if dragged down enough or with enough velocity
          handleClose();
        } else {
          // Snap back to original position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // AddAddressModal visibility changed - logging removed for production

  useEffect(() => {
    // AddAddressModal useEffect triggered - logging removed for production
    if (visible) {
      // Reset pan animation
      panY.setValue(0);
      // Slide up animation with 250ms duration and ease-in timing
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down animation when closing
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, panY]);

  // Effect to populate form when editing an address
  useEffect(() => {
    if (finalEditingAddress && (visible || isStandaloneScreen)) {
      console.log('🔧 Populating form with address data:', JSON.stringify(finalEditingAddress, null, 2));
      
      // Parse phone number to extract prefix and number
      let phonePrefix = '+91';
      // Try both field names - phoneNumber is what's displayed in the list
      let phoneNumber = finalEditingAddress.phoneNumber || finalEditingAddress.phone || '';
      
      console.log('📱 EDITING ADDRESS - Phone parsing:');
      console.log('📱 finalEditingAddress.phoneNumber:', finalEditingAddress.phoneNumber);
      console.log('📱 finalEditingAddress.phone:', finalEditingAddress.phone);
      console.log('📱 Selected value:', phoneNumber);
      console.log('📱 Type:', typeof phoneNumber);
      
      // Convert to string if it's a number
      phoneNumber = String(phoneNumber);
      
      // If phone has a prefix, extract it
      if (phoneNumber.startsWith('+')) {
        // Try to match against known country codes from longest to shortest
        let foundMatch = false;
        const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
        
        for (const cc of sortedCountryCodes) {
          if (phoneNumber.startsWith(cc.code)) {
            phonePrefix = cc.code;
            phoneNumber = phoneNumber.substring(cc.code.length);
            console.log('📱 Matched country code:', phonePrefix);
            console.log('📱 Extracted number:', phoneNumber);
            foundMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          // Fallback: try generic regex if no country code matched
          const match = phoneNumber.match(/^(\+\d{1,3})(.*)$/);
          if (match) {
            phonePrefix = match[1];
            phoneNumber = match[2];
            console.log('📱 Fallback extraction - prefix:', phonePrefix);
            console.log('📱 Fallback extraction - number:', phoneNumber);
          }
        }
      } else if (phoneNumber.length > 10 && !phoneNumber.startsWith('0')) {
        // If the number is longer than 10 digits without +, assume first digits are country code
        // For India: numbers starting with 91 followed by 10 digits
        if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
          phonePrefix = '+91';
          phoneNumber = phoneNumber.substring(2); // Remove '91' prefix
          console.log('📱 Detected 91 prefix without +, extracted number:', phoneNumber);
        } else if (phoneNumber.startsWith('1') && phoneNumber.length === 11) {
          // US/Canada numbers
          phonePrefix = '+1';
          phoneNumber = phoneNumber.substring(1);
          console.log('📱 Detected 1 prefix without +, extracted number:', phoneNumber);
        } else {
          console.log('📱 Long number but unknown format, keeping as is:', phoneNumber);
        }
      } else {
        console.log('📱 Standard 10-digit or shorter number, using default +91');
      }
      
      // Find the country code object
      const countryCode = countryCodes.find(cc => cc.code === phonePrefix) || countryCodes[0];
      setSelectedCountry(countryCode);
      
      console.log('📱 Final parsed values:');
      console.log('📱 Phone prefix:', phonePrefix);
      console.log('📱 Phone number:', phoneNumber);
      console.log('📱 Phone number length:', phoneNumber.length);
      
      setFormData({
        firstName: finalEditingAddress.firstName || '',
        lastName: finalEditingAddress.lastName || '',
        address: finalEditingAddress.address || '',
        apartment: finalEditingAddress.apartment || '',
        city: finalEditingAddress.city || '',
        state: finalEditingAddress.state || 'Select State',
        pin: finalEditingAddress.pinCode || finalEditingAddress.pin || '',
        country: finalEditingAddress.country || 'India',
        phone: phoneNumber,
        phonePrefix: phonePrefix,
        type: finalEditingAddress.type || finalEditingAddress.addressType || 'Home',
      });
    } else if (!finalEditingAddress && (visible || isStandaloneScreen)) {
      // Reset form for adding new address
      setFormData({
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: 'Select State',
        pin: '',
        country: 'India',
        phone: '',
        phonePrefix: '+91',
        type: 'Home',
      });
      setSelectedCountry(countryCodes[0]);
    }
  }, [finalEditingAddress, visible, isStandaloneScreen]);

  const handleClose = () => {
    if (isStandaloneScreen) {
      // Navigate back when used as standalone screen
      if (navigation) {
        const returnScreen = route?.params?.returnScreen;
        if (returnScreen) {
          navigation.navigate(returnScreen);
        } else {
          navigation.goBack();
        }
      }
    } else {
      // Reset pan animation
      panY.setValue(0);
      // Animate out first, then call onClose
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }
  };

  const validateForm = (showMessages = false) => {
    const newErrors = {};

    // Required field validation
    if (!validateRequired(formData.firstName)) {
      newErrors.firstName = showMessages ? 'First name is required' : true;
    }
    if (!validateRequired(formData.lastName)) {
      newErrors.lastName = showMessages ? 'Last name is required' : true;
    }
    if (!validateRequired(formData.address)) {
      newErrors.address = showMessages ? 'Address is required' : true;
    }
    if (!validateRequired(formData.city)) {
      newErrors.city = showMessages ? 'City is required' : true;
    }
    if (!validateRequired(formData.pin)) {
      newErrors.pin = showMessages ? 'PIN code is required' : true;
    } else {
      // Enhanced PIN code validation with state matching
      const pinValidation = validatePinCodeWithState(formData.pin, formData.state);
      if (!pinValidation.isValid) {
        newErrors.pin = showMessages ? pinValidation.message : true;
      }
    }
    if (!validateRequired(formData.phone)) {
      newErrors.phone = showMessages ? 'Phone number is required' : true;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = showMessages ? 'Phone number must be 10 digits' : true;
    }

    setErrors(newErrors);
    setValidationState(showMessages ? 'full' : 'inline');
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = async () => {
    try {
      // Validate form with full error messages
      if (!validateForm(true)) {
        Alert.alert('Validation Error', 'Please correct the errors and try again');
        return;
      }

      // Check if user is authenticated
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Authentication Error', 'Please log in to add an address');
        return;
      }

      // Prepare address data for API - try multiple format variations
      const addressData = {
        // Try common field names that backends expect
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `${formData.phonePrefix}${formData.phone}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pin,
        country: formData.country,
        type: formData.type.toLowerCase(), // Use selected address type
        ...(formData.apartment && { apartment: formData.apartment }), // Only include if not empty
      };

      // Debug logs for phone number saving
      console.log('💾 SAVING ADDRESS - Phone Details:');
      console.log('📱 formData.phone:', formData.phone);
      console.log('📱 formData.phonePrefix:', formData.phonePrefix);
      console.log('📱 Combined phone:', `${formData.phonePrefix}${formData.phone}`);
      console.log('💾 Full address data:', JSON.stringify(addressData, null, 2));

      // Call AddressContext to add or update address
      let result;
      if (finalEditingAddress) {
        // Update existing address
        result = await updateAddress(finalEditingAddress._id, addressData);
      } else {
        // Add new address
        result = await addAddress(addressData);
      }
      
      if (result.success) {
        const successMessage = finalEditingAddress ? 'Address updated successfully' : 'Address added successfully';
        Alert.alert('Success', successMessage, [
          { text: 'OK', onPress: handleClose }
        ]);
        
        // Reset form data
        setFormData({
          firstName: '',
          lastName: '',
          address: '',
          apartment: '',
          city: '',
          state: 'Select State',
          pin: '',
          country: 'India',
          phone: '',
          phonePrefix: '+91',
          type: 'Home',
        });
        setErrors({});
        setValidFields({});
        setValidationState('none');
      } else {
        const errorMessage = finalEditingAddress ? 'Failed to update address' : 'Failed to add address';
        Alert.alert('Error', result.message || errorMessage);
      }
    } catch (error) {
      console.error('Error adding address:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to add address. Please try again.';
      if (error.response?.status === 500) {
        errorMessage = 'Server error. The address data format might be incorrect. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleInputChange = (field, value) => {
    // Debug log for phone number changes
    if (field === 'phone') {
      console.log('📱 Phone number changed:', value);
      console.log('📱 Current formData.phone:', formData.phone);
      console.log('📱 Current formData.phonePrefix:', formData.phonePrefix);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
      // Reset to subtle validation state
      if (validationState === 'full') {
        setValidationState('inline');
      }
    }

    // Re-validate PIN code when state changes
    if (field === 'state' && formData.pin && formData.pin.length === 6) {
      const pinValidation = validatePinCodeWithState(formData.pin, value);
      if (!pinValidation.isValid) {
        setErrors(prev => ({ ...prev, pin: true }));
        setValidationState('inline');
      } else {
        // Clear PIN error if it becomes valid
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pin;
          return newErrors;
        });
        setValidFields(prev => ({ ...prev, pin: true }));
      }
    }
  };

  const handleInputBlur = (field) => {
    // Validate single field on blur for better UX
    const value = formData[field];
    const fieldErrors = {};
    let isValid = false;
    
    switch(field) {
      case 'firstName':
      case 'lastName':
      case 'address':
      case 'city':
        if (!validateRequired(value)) {
          fieldErrors[field] = true;
        } else {
          isValid = true;
        }
        break;
      case 'pin':
        if (!validateRequired(value)) {
          fieldErrors[field] = true;
        } else {
          const pinValidation = validatePinCodeWithState(value, formData.state);
          if (!pinValidation.isValid) {
            fieldErrors[field] = true;
          } else {
            isValid = true;
          }
        }
        break;
      case 'phone':
        if (!validateRequired(value)) {
          fieldErrors[field] = true;
        } else if (!validatePhone(value)) {
          fieldErrors[field] = true;
        } else {
          isValid = true;
        }
        break;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fieldErrors }));
      setValidFields(prev => ({ ...prev, [field]: false }));
      setValidationState('inline');
    } else if (isValid) {
      // Clear any existing error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setValidFields(prev => ({ ...prev, [field]: true }));
    }
  };

  if (!visible && !isStandaloneScreen) {
    return null; // Don't render anything if not visible and not standalone
  }

  return (
    <View style={styles.fullScreenOverlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1}
        onPress={handleClose}
      />
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: panY }
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={styles.modalContent}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            {isStandaloneScreen && (
              <GlobalBackButton 
                navigation={navigation}
                onPress={handleClose}
                animationDuration={300}
                iconSize={22}
              />
            )}
            <Text style={[
              styles.headerTitle,
              isStandaloneScreen && styles.headerTitleStandalone
            ]}>
              {finalEditingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            {!isStandaloneScreen && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>−</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >


            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={[
                styles.inputContainer, 
                errors.firstName && styles.inputError,
                validFields.firstName && !errors.firstName && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  onBlur={() => handleInputBlur('firstName')}
                  placeholderTextColor={Colors.gray600}
                />
                {errors.firstName && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={[
                styles.inputContainer, 
                errors.lastName && styles.inputError,
                validFields.lastName && !errors.lastName && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  onBlur={() => handleInputBlur('lastName')}
                  placeholderTextColor={Colors.gray600}
                />
                {errors.lastName && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>

              <View style={[
                styles.inputContainer, 
                errors.address && styles.inputError,
                validFields.address && !errors.address && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  onBlur={() => handleInputBlur('address')}
                  placeholderTextColor={Colors.gray600}
                />
                {errors.address && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Apartment, suite (optional)"
                  value={formData.apartment}
                  onChangeText={(value) => handleInputChange('apartment', value)}
                  placeholderTextColor={Colors.gray600}
                />
              </View>

              <View style={[
                styles.inputContainer, 
                errors.city && styles.inputError,
                validFields.city && !errors.city && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  onBlur={() => handleInputBlur('city')}
                  placeholderTextColor={Colors.gray600}
                />
                {errors.city && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, errors.state && styles.inputError]}>
                <TouchableOpacity 
                  style={styles.stateContainer}
                  onPress={() => setShowStateDropdown(!showStateDropdown)}
                >
                  <View style={styles.stateContent}>
                    <Text style={styles.stateValue}>{formData.state}</Text>
                    <CaretDownIcon width={18} height={18} color="#848688" />
                  </View>
                </TouchableOpacity>
                {errors.state && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.state}</Text>
                )}
              </View>

              <View style={[
                styles.inputContainer, 
                errors.pin && styles.inputError,
                validFields.pin && !errors.pin && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="PIN"
                  value={formData.pin}
                  onChangeText={(value) => handleInputChange('pin', value)}
                  onBlur={() => handleInputBlur('pin')}
                  placeholderTextColor={Colors.gray600}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.pin && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.pin}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={formData.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                  placeholderTextColor={Colors.gray600}
                />
              </View>

              <View style={[
                styles.inputContainer, 
                errors.phone && styles.inputError,
                validFields.phone && !errors.phone && styles.inputValid
              ]}>
                <View style={styles.phoneInputWrapper}>
                  {/* Country Code Section */}
                  <TouchableOpacity 
                    style={styles.countrySection}
                    onPress={() => setShowPhonePrefixModal(true)}
                  >
                    <View style={styles.flagContainer}>
                      <Text style={styles.flagEmoji}>
                        {selectedCountry.flag}
                      </Text>
                    </View>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <View style={styles.chevronContainer}>
                      <CaretDownIcon width={18} height={18} color="#848688" />
                    </View>
                  </TouchableOpacity>
                  
                  {/* Separator Line */}
                  <View style={styles.separator} />
                  
                  {/* Mobile Number Input */}
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Mobile Number"
                    placeholderTextColor="#848688"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    onBlur={() => handleInputBlur('phone')}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Address Type Selection */}
              <View style={styles.addressTypeContainer}>
                <Text style={styles.addressTypeLabel}>Save address as</Text>
                <View style={styles.addressTypeOptions}>
                  {['Home', 'Work', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.addressTypeOption,
                        formData.type === type && styles.addressTypeOptionSelected
                      ]}
                      onPress={() => handleInputChange('type', type)}
                    >
                      <Text style={[
                        styles.addressTypeText,
                        formData.type === type && styles.addressTypeTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button - Always Visible */}
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity 
              style={[styles.doneButton, loading && styles.doneButtonDisabled]} 
              onPress={handleDone}
              disabled={loading}
            >
              <Text style={styles.doneButtonText}>
                {loading ? (finalEditingAddress ? 'Updating Address...' : 'Adding Address...') : (finalEditingAddress ? 'Update' : 'Done')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* State Dropdown Overlay */}
      {showStateDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity 
            style={styles.dropdownBackdrop} 
            onPress={() => setShowStateDropdown(false)}
          />
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
              {indianStates.map((state, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    formData.state === state && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    handleInputChange('state', state);
                    setShowStateDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    formData.state === state && styles.dropdownItemTextSelected
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Phone Prefix Modal */}
      <Modal
        visible={showPhonePrefixModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhonePrefixModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable}
            onPress={() => setShowPhonePrefixModal(false)}
          />
          <View style={styles.phonePrefixModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowPhonePrefixModal(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={countryCodes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.phonePrefixItem,
                    selectedCountry.code === item.code && styles.phonePrefixItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    handleInputChange('phonePrefix', item.code);
                    setShowPhonePrefixModal(false);
                  }}
                >
                  <Text style={styles.phonePrefixFlag}>{item.flag}</Text>
                  <Text style={styles.phonePrefixCountry}>{item.country}</Text>
                  <Text style={styles.phonePrefixCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: screenHeight * 0.90,
    maxHeight: screenHeight * 0.90,
  },
  modalContent: {
    flex: 1,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#cdcdcd',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    flex: 1,
    letterSpacing: -0.4,
  },
  headerTitleStandalone: {
    marginLeft: 0,
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.black,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginBottom: 80, // Space for fixed button
  },
  scrollContent: {
    paddingBottom: 20, // Normal padding since button is fixed
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
    paddingBottom: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#cdcdcd',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: 54, // Consistent height
    backgroundColor: Colors.white,
    transition: 'all 0.2s ease-in-out', // Smooth transition for validation states
  },
  inputError: {
    borderColor: '#CA3327',
    borderWidth: 1.5,
    backgroundColor: 'rgba(202, 51, 39, 0.02)',
  },
  inputValid: {
    borderColor: '#34C759',
    borderWidth: 1,
    backgroundColor: 'rgba(52, 199, 89, 0.02)',
  },
  input: {
    fontSize: 14,
    color: Colors.black,
    padding: 0,
    margin: 0,
    letterSpacing: -0.35,
    lineHeight: 16,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateValue: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
    letterSpacing: -0.14,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  flagContainer: {
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
    marginRight: 6,
  },
  chevronContainer: {
    marginLeft: 4,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  mobileInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
    margin: 0,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    maxHeight: '40%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.gray100,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.black,
    letterSpacing: -0.14,
  },
  dropdownItemTextSelected: {
    fontWeight: '500',
  },
  countryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area padding for iPhone bottom
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: Colors.black,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.4,
    lineHeight: 19.2,
  },
  errorText: {
    fontSize: 12,
    color: '#CA3327',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '400',
  },
  // Phone Prefix Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  phonePrefixModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  phonePrefixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  phonePrefixItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  phonePrefixFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  phonePrefixCountry: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  phonePrefixCode: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  addressTypeContainer: {
    marginTop: 8,
  },
  addressTypeLabel: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: -0.14,
  },
  addressTypeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  addressTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addressTypeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // Light tint of primary color
  },
  addressTypeText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
    letterSpacing: -0.14,
  },
  addressTypeTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default AddAddressModal;
