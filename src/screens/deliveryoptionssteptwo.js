import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Colors } from '../constants/colors';
import { useAddress } from '../contexts/AddressContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { useBag } from '../contexts/BagContext';
import yoraaAPI from '../services/yoraaAPI';
import apiService from '../services/apiService';

// Import new order and payment services
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const DeliveryOptionsStepTwoScreen = ({ navigation, route }) => {
  // Get selected delivery option from navigation params
  const { selectedDeliveryOption, postcode } = route.params || {};
  
  // Get bag items from context
  const { bagItems, getTotalPrice, clearBag } = useBag();
  
  // Debug logging
  console.log('📥 DeliveryOptionsStepTwo received params:', route.params);
  console.log('📦 Selected delivery option:', selectedDeliveryOption);
  console.log('📮 Postcode:', postcode);
  
  // State for address form
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '', // Email field for user profile fallback and manual entry
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: postcode || '',
    landmark: '',
  });

  // State for payment loading
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Use AddressContext to save addresses
  const { addAddress } = useAddress();
  
  // Currency context for pricing
  const { formatPrice } = useCurrencyContext();

  // Prefill email from user profile if available (handles login method variations)
  useEffect(() => {
    const prefillUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          console.log('🔍 Current user info:', {
            uid: user.uid,
            email: user.email,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            providerId: user.providerData?.[0]?.providerId
          });

          // Try to get email from Firebase user first
          let userEmail = user.email;
          let userPhone = user.phoneNumber;
          let displayName = user.displayName;

          // If no email from Firebase, try to get from backend profile
          if (!userEmail) {
            try {
              const userProfile = await yoraaAPI.getUserProfile();
              console.log('👤 User profile from backend:', userProfile);
              userEmail = userProfile?.email;
              userPhone = userPhone || userProfile?.phone;
              displayName = displayName || userProfile?.displayName;
            } catch (profileError) {
              console.log('ℹ️ Could not fetch user profile, user will need to enter email manually');
            }
          }

          // Split displayName into firstName and lastName if available
          let firstName = '';
          let lastName = '';
          if (displayName) {
            const nameParts = displayName.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          // Update form with available data
          setAddressForm(prev => ({
            ...prev,
            firstName: firstName,
            lastName: lastName,
            email: userEmail || '',
            phoneNumber: userPhone ? userPhone.replace('+91', '') : prev.phoneNumber
          }));

          console.log('✅ Prefilled user data:', { email: userEmail, phone: userPhone });
        }
      } catch (error) {
        console.error('❌ Error prefilling user data:', error);
      }
    };

    prefillUserData();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleInputChange = (field, value) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!addressForm[field].trim()) {
        Alert.alert('Validation Error', `Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addressForm.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    
    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(addressForm.phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(addressForm.pincode)) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    try {
      // Map form data to backend expected format
      const mappedAddressData = {
        // Use firstName and lastName directly from form
        firstName: addressForm.firstName,
        lastName: addressForm.lastName,
        phone: addressForm.phoneNumber.startsWith('+91') ? addressForm.phoneNumber : `+91${addressForm.phoneNumber}`,
        email: addressForm.email,
        address: addressForm.addressLine1,
        city: addressForm.city,
        state: addressForm.state,
        pinCode: addressForm.pincode,
        country: 'India',
        type: 'home', // Required field for backend validation
        ...(addressForm.addressLine2 && { apartment: addressForm.addressLine2 }),
        ...(addressForm.landmark && { landmark: addressForm.landmark }),
        isDefault: true
      };

      console.log('📍 Mapped address data for backend:', mappedAddressData);

      // Save address with proper mapping
      await addAddress(mappedAddressData);
      console.log('✅ Address saved successfully');

      // Proceed to Razorpay payment processing
      await initiateRazorpayPayment(mappedAddressData);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  const initiateRazorpayPayment = async (addressData) => {
    setPaymentLoading(true); // Set loading state
    
    try {
      console.log('🎯 Initiating Razorpay payment process with new order service...');

      // 🔐 Check authentication status first
      const isAuthenticated = await apiService.checkAuthStatus();
      if (!isAuthenticated) {
        Alert.alert(
          'Authentication Required',
          'Please login to complete your purchase.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => {
              // Navigate to login screen
              // navigation.navigate('Login');
              console.log('🔄 User needs to login');
            }}
          ]
        );
        return;
      }

      // Debug cart information
      console.log('🛒 Cart debug info:', {
        bagItems: bagItems,
        itemCount: bagItems?.length || 0,
        totalPrice: getTotalPrice()
      });

      // Normalize cart items to ensure proper field mapping including price
      const normalizedBagItems = bagItems.map(item => {
        // ✅ FIX: Ensure price is properly extracted from bagItem structure
        let itemPrice = 0;
        
        // Handle nested size structure - prices are in the sizes array
        if (item.sizes && Array.isArray(item.sizes) && item.size) {
          const selectedSizeVariant = item.sizes.find(sizeObj => sizeObj.size === item.size);
          if (selectedSizeVariant) {
            // Use sale price first, then regular price
            if (selectedSizeVariant.salePrice && Number(selectedSizeVariant.salePrice) > 0) {
              itemPrice = Number(selectedSizeVariant.salePrice);
            } else if (selectedSizeVariant.regularPrice && Number(selectedSizeVariant.regularPrice) > 0) {
              itemPrice = Number(selectedSizeVariant.regularPrice);
            }
          }
        }
        // Fallback to direct item properties
        else {
          if (item.salePrice && Number(item.salePrice) > 0) {
            itemPrice = Number(item.salePrice);
          } else if (item.regularPrice && Number(item.regularPrice) > 0) {
            itemPrice = Number(item.regularPrice);
          } else if (item.price) {
            // Handle string prices like "$10.00"
            itemPrice = typeof item.price === 'string' 
              ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
              : Number(item.price);
          }
        }
        
        console.log(`💰 Normalized item price for ${item.name}: ${itemPrice}`);
        
        return {
          ...item,
          id: item.id || item._id || item.itemId || item.productId,
          name: item.name || item.productName || item.title,
          quantity: item.quantity || 1,
          price: itemPrice, // ✅ FIX: Include resolved price
          sku: item.sku || `SKU-${item.id || item._id || item.itemId || Date.now()}`
        };
      });

      console.log('🔄 Normalized cart items:', normalizedBagItems);

      // Validate cart items using new order service
      if (!orderService.validateCart(normalizedBagItems)) {
        return; // Error already shown by validateCart
      }

      // Format address for order service
      const formattedAddress = {
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        email: addressData.email,
        phone: addressData.phone,
        addressLine1: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.pinCode,
        country: addressData.country || 'India'
      };

      // Validate address using order service
      if (!orderService.validateAddress(formattedAddress)) {
        return; // Error already shown by validateAddress
      }

      // Use new payment service for complete order flow
      const result = await paymentService.processCompleteOrder(
        normalizedBagItems, 
        formattedAddress,
        {
          orderNotes: `Delivery via ${selectedDeliveryOption?.name || 'Standard'}`,
          paymentMethod: 'razorpay'
        }
      );

      console.log('✅ Order process completed successfully:', result);

      // Capture bag items before clearing (important for order confirmation)
      const orderItems = normalizedBagItems.map(item => ({
        id: item.id,
        name: item.name,
        size: item.selectedSize?.size || item.size,
        color: item.selectedSize?.color || item.color,
        quantity: item.quantity,
        price: item.selectedSize?.price || item.price,
        sku: item.sku,
        images: item.images || []
      }));

      console.log('📦 Order items captured:', orderItems);

      // Clear cart after successful payment
      clearBag();

      // Navigate to order confirmation screen with enhanced order details
      navigation.navigate('orderconfirmationphone', {
        orderDetails: {
          orderId: result.orderId,
          paymentId: result.paymentId,
          amount: result.orderResponse?.order_details?.final_amount || result.orderResponse?.amount / 100,
          subtotal: result.orderResponse?.cart_calculation?.subtotal || 0,
          shippingCharges: result.orderResponse?.cart_calculation?.shipping_charges || 0,
          currency: 'INR',
          deliveryAddress: addressData,
          deliveryOption: selectedDeliveryOption,
          items: orderItems,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error in order creation process:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Cart validation failed')) {
          errorMessage = 'There was an issue with your cart items. Please check and try again.';
        } else if (error.message.includes('Address validation failed')) {
          errorMessage = 'Please fill all required address fields.';
        } else if (error.message.includes('Amount difference')) {
          errorMessage = 'Order was cancelled due to price changes.';
        } else if (error.message.includes('Authentication Required')) {
          errorMessage = 'Please login to complete your purchase.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Order Error', errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Address</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selected Delivery Option Summary */}
        {selectedDeliveryOption && (
          <View style={styles.deliveryOptionSummary}>
            <Text style={styles.sectionTitle}>Selected Delivery Option</Text>
            <View style={styles.selectedOptionCard}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionName}>{selectedDeliveryOption?.name}</Text>
                <Text style={styles.optionPrice}>
                  {selectedDeliveryOption?.free ? 'FREE' : formatPrice(selectedDeliveryOption?.cost || 0)}
                </Text>
              </View>
              <Text style={styles.optionDescription}>{selectedDeliveryOption?.description}</Text>
              {selectedDeliveryOption?.estimatedDays && (
                <Text style={styles.optionEstimate}>
                  Estimated delivery: {selectedDeliveryOption.estimatedDays} days
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Address Form */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Enter your first name"
              placeholderTextColor={Colors.gray500}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Enter your last name"
              placeholderTextColor={Colors.gray500}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor={Colors.gray500}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email address"
              placeholderTextColor={Colors.gray500}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 1*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.addressLine1}
              onChangeText={(value) => handleInputChange('addressLine1', value)}
              placeholder="House/Flat number, Building name"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              value={addressForm.addressLine2}
              onChangeText={(value) => handleInputChange('addressLine2', value)}
              placeholder="Street, Area, Locality (Optional)"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>City*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Enter city"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.state}
              onChangeText={(value) => handleInputChange('state', value)}
              placeholder="Enter state"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pincode*</Text>
            <TextInput
              style={styles.input}
              value={addressForm.pincode}
              onChangeText={(value) => handleInputChange('pincode', value)}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor={Colors.gray500}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              value={addressForm.landmark}
              onChangeText={(value) => handleInputChange('landmark', value)}
              placeholder="Nearby landmark (Optional)"
              placeholderTextColor={Colors.gray500}
            />
          </View>
        </View>

        {/* Save and Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, paymentLoading && styles.continueButtonDisabled]} 
          onPress={handleSaveAndContinue}
          disabled={paymentLoading}
        >
          <Text style={styles.continueButtonText}>
            {paymentLoading ? 'Processing Order...' : 'Save Address & Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.black,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deliveryOptionSummary: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
  },
  selectedOptionCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.green500,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.green600,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 4,
  },
  optionEstimate: {
    fontSize: 12,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  addressSection: {
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  continueButton: {
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.gray400,
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default DeliveryOptionsStepTwoScreen;
