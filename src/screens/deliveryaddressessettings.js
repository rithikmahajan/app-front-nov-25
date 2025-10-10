import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
  TextInput,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

// Dropdown Arrow Icon Component
const DropdownArrowIcon = () => (
  <View style={styles.dropdownArrow}>
    <View style={styles.dropdownLine1} />
    <View style={styles.dropdownLine2} />
  </View>
);

// Checkbox Component
const Checkbox = ({ checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <View style={styles.checkmark} />}
    </View>
  </TouchableOpacity>
);

// Country Flag Component (India)
const IndiaFlag = () => (
  <View style={styles.flagContainer}>
    <View style={styles.flagOrange} />
    <View style={styles.flagWhite} />
    <View style={styles.flagGreen} />
  </View>
);

const DeliveryAddressesSettings = ({ navigation }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const formSlideAnim = React.useRef(new Animated.Value(300)).current;

  // Sample saved address data
  const [savedAddress] = useState({
    name: 'John Smith',
    address: '2950 S 108th St',
    city: '53227, West Allis, US',
    email: 'john@mail.com'
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Smith',
    address: '2950 S 108th St',
    apartment: '',
    city: 'West Allis',
    state: 'Delhi',
    pin: '53227',
    country: 'India',
    phone: '+91'
  });

  React.useEffect(() => {
    // Animate in with 300ms ease out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleBack = () => {
    if (currentView === 'form') {
      // Go back to list view
      Animated.timing(formSlideAnim, {
        toValue: 300,
        duration: 300,
        easing: Easing.in(Easing.back(1.7)),
        useNativeDriver: true,
      }).start(() => {
        setCurrentView('list');
        formSlideAnim.setValue(0);
      });
    } else {
      // Go back to settings
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        easing: Easing.in(Easing.back(1.7)),
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate('Settings');
      });
    }
  };

  const handleEdit = () => {
    setCurrentView('form');
    formSlideAnim.setValue(300);
    Animated.timing(formSlideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  };

  const handleAddAddress = () => {
    setCurrentView('form');
    formSlideAnim.setValue(300);
    Animated.timing(formSlideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  };

  const handleSave = () => {
    // Save the address data
    // Saving address logged - removed for production
    // Set as default logged - removed for production
    
    // Animate back to list view
    Animated.timing(formSlideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.back(1.7)),
      useNativeDriver: true,
    }).start(() => {
      setCurrentView('list');
      formSlideAnim.setValue(0);
    });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderListView = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton 
          navigation={navigation}
          onPress={handleBack}
          animationDuration={300}
          customEasing={Easing.in(Easing.back(1.7))}
        />
        <Text style={styles.headerTitle}>Saved Delivery Address</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Address Card */}
      <View style={styles.addressCard}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{savedAddress.name}</Text>
          <Text style={styles.addressLine}>{savedAddress.address}</Text>
          <Text style={styles.addressLine}>{savedAddress.city}</Text>
          <Text style={styles.addressEmail}>{savedAddress.email}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Add Address Button */}
      <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
        <Text style={styles.addAddressButtonText}>Add Address</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFormView = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          transform: [{ translateX: formSlideAnim }]
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton 
          navigation={navigation}
          onPress={handleBack}
          animationDuration={300}
          customEasing={Easing.in(Easing.back(1.7))}
        />
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* First Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => updateFormData('firstName', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => updateFormData('lastName', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Apartment/Suite */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Apartment,suit"
            value={formData.apartment}
            onChangeText={(text) => updateFormData('apartment', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* City */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => updateFormData('city', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* State Dropdown */}
        <View style={styles.inputContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownText}>{formData.state}</Text>
            <DropdownArrowIcon />
          </View>
        </View>

        {/* PIN */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="PIN"
            value={formData.pin}
            onChangeText={(text) => updateFormData('pin', text)}
            placeholderTextColor="#999999"
            keyboardType="numeric"
          />
        </View>

        {/* Country */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Country"
            value={formData.country}
            onChangeText={(text) => updateFormData('country', text)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Phone with Country Code */}
        <View style={styles.inputContainer}>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCodeContainer}>
              <IndiaFlag />
              <Text style={styles.countryCodeText}>+91</Text>
              <DropdownArrowIcon />
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              value={formData.phone.replace('+91', '')}
              onChangeText={(text) => updateFormData('phone', '+91' + text)}
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Default Address Checkbox */}
        <View style={styles.checkboxRow}>
          <Checkbox 
            checked={isDefaultAddress} 
            onPress={() => setIsDefaultAddress(!isDefaultAddress)} 
          />
          <Text style={styles.checkboxLabel}>Set as default Delivery Address</Text>
        </View>

        {/* Update Address Button */}
        <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
          <Text style={styles.updateButtonText}>Update Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentView === 'list' ? renderListView() : renderFormView()}
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
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },

  // Back Arrow Icon - PNG Image
  backArrowIcon: {
    width: 24,
    height: 24,
  },

  // Address Card Styles
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  addressEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },

  // Add Address Button
  addAddressButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  addAddressButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Form Styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },

  // Dropdown Styles
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  dropdownArrow: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownLine1: {
    width: 8,
    height: 2,
    backgroundColor: '#666666',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    top: 3,
  },
  dropdownLine2: {
    width: 8,
    height: 2,
    backgroundColor: '#666666',
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    top: 3,
  },

  // Phone Input Styles
  phoneContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
  },

  // Flag Styles
  flagContainer: {
    width: 20,
    height: 14,
    flexDirection: 'column',
  },
  flagOrange: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  flagWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#CCCCCC',
  },
  flagGreen: {
    flex: 1,
    backgroundColor: '#138808',
  },

  // Checkbox Styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    width: 6,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#666666',
  },

  // Update Button
  updateButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeliveryAddressesSettings;
