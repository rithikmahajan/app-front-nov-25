import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Alert,
  PanResponder,
} from 'react-native';
import { useAddress } from '../contexts/AddressContext';

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

// Swipeable Address Card Component
const SwipeableAddressCard = ({ address, onEdit, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteThreshold = -120; // Swipe threshold to trigger delete
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate on horizontal swipe (and left swipe specifically)
        return Math.abs(gestureState.dx) > 10 && gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < deleteThreshold) {
          // Delete threshold reached - trigger delete
          Animated.timing(translateX, {
            toValue: -400, // Slide completely off screen
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else if (gestureState.dx < -50) {
          // Partial swipe - snap to reveal delete
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Background - Red Indicator */}
      <View style={styles.deleteBackground}>
        <View style={styles.deleteIndicator} />
      </View>

      {/* Main Card Content */}
      <Animated.View
        style={[
          styles.addressCardSwipeable,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.addressCard}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>
              {address.firstName} {address.lastName}
            </Text>
            <Text style={styles.addressLine}>
              {address.street || address.address}
              {address.apartment ? `, ${address.apartment}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {address.city}, {address.state} {address.zipCode || address.pin}
            </Text>
            <Text style={styles.addressLine}>{address.country}</Text>
            {address.phone && (
              <Text style={styles.addressEmail}>{address.phone}</Text>
            )}
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                resetPosition();
                onEdit(address);
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const DeliveryAddressesSettings = ({ navigation }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const formSlideAnim = React.useRef(new Animated.Value(300)).current;

  // Use AddressContext for real-time data
  const { addresses, loading, loadAddresses, addAddress, updateAddress, deleteAddress } = useAddress();
  const [selectedAddressForEdit, setSelectedAddressForEdit] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pin: '',
    country: 'India',
    email: '',
    phone: '+91'
  });

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

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

  const handleEdit = (address) => {
    setSelectedAddressForEdit(address);
    setFormData({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address: address.address || address.street || '',
      apartment: address.apartment || '',
      city: address.city || '',
      state: address.state || '',
      pin: address.pin || address.zipCode || '',
      country: address.country || 'India',
      email: address.email || '',
      phone: address.phone || '+91'
    });
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
    setSelectedAddressForEdit(null);
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      pin: '',
      country: 'India',
      email: '',
      phone: '+91'
    });
    setCurrentView('form');
    formSlideAnim.setValue(300);
    Animated.timing(formSlideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  };

  const handleSave = async () => {
    try {
      // Prepare address data
      const addressData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pin,
        country: formData.country,
        email: formData.email,
        phone: formData.phone,
        isDefault: isDefaultAddress
      };

      let result;
      if (selectedAddressForEdit) {
        // Update existing address
        result = await updateAddress(selectedAddressForEdit._id, addressData);
      } else {
        // Create new address
        result = await addAddress(addressData);
      }

      if (result.success) {
        Alert.alert(
          'Success',
          selectedAddressForEdit ? 'Address updated successfully' : 'Address added successfully'
        );
        
        // Reload addresses
        await loadAddresses();
        
        // Animate back to list view
        Animated.timing(formSlideAnim, {
          toValue: 300,
          duration: 300,
          easing: Easing.in(Easing.back(1.7)),
          useNativeDriver: true,
        }).start(() => {
          setCurrentView('list');
          formSlideAnim.setValue(0);
          setSelectedAddressForEdit(null);
        });
      } else {
        Alert.alert('Error', result.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAddress(addressId);
            if (result.success) {
              Alert.alert('Success', 'Address deleted successfully');
              await loadAddresses();
            } else {
              Alert.alert('Error', result.message || 'Failed to delete address');
            }
          }
        }
      ]
    );
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Saved Delivery Address</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      )}

      {/* Address List */}
      {!loading && addresses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved addresses yet</Text>
          <Text style={styles.emptySubtext}>Add your first delivery address</Text>
        </View>
      )}

      {!loading && addresses.map((address, index) => (
        <SwipeableAddressCard
          key={address._id || index}
          address={address}
          onEdit={handleEdit}
          onDelete={() => handleDeleteAddress(address._id)}
        />
      ))}

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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>
          {selectedAddressForEdit ? 'Edit Address' : 'Add Address'}
        </Text>
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

        {/* Email */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            placeholderTextColor="#999999"
            keyboardType="email-address"
            autoCapitalize="none"
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

        {/* Save/Update Address Button */}
        <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
          <Text style={styles.updateButtonText}>
            {selectedAddressForEdit ? 'Update Address' : 'Save Address'}
          </Text>
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

  // Swipeable Container Styles
  swipeableContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  addressCardSwipeable: {
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 30,
    zIndex: 1,
  },
  deleteIndicator: {
    width: 4,
    height: 60,
    backgroundColor: '#FF3B30',
    borderRadius: 2,
  },

  // Address Card Styles
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  
  // Address Actions
  addressActions: {
    flexDirection: 'row',
  },
  
  // Default Badge
  defaultBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeliveryAddressesSettings;
