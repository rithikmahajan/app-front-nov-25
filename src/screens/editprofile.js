import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
// import DatePicker from 'react-native-date-picker';
import auth from '@react-native-firebase/auth';
import GlobalBackButton from '../components/GlobalBackButton';
import yoraaAPI from '../services/yoraaAPI';
import authManager from '../services/authManager';

const EditProfile = ({ navigation }) => {
  // Loading and user state
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // Firebase user state
  const [profileData, setProfileData] = useState(null); // Backend profile data
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    changePassword: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: new Date(1999, 4, 6),
    gender: '',
    // Address fields
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Delhi',
    pin: '',
    country: '',
    phoneNumber: '',
    countryCode: '+91',
  });

  const [otherDetailsExpanded, setOtherDetailsExpanded] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addressAdded, setAddressAdded] = useState(true);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  // const [showDatePicker, setShowDatePicker] = useState(false);

  // Memoized static options to prevent recreation on each render
  const stateOptions = useMemo(() => [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
  ], []);
  
  const genderOptions = useMemo(() => ['Male', 'Female', 'Other'], []);
  
  const countryCodeOptions = useMemo(() => [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
  ], []);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current Firebase user
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        console.log('👤 Current user:', {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber,
          provider: currentUser.providerData[0]?.providerId || 'unknown'
        });

        // Ensure backend authentication is synced
        await authManager.syncBackendAuth();

        // Try to get profile from backend API
        try {
          const profile = await yoraaAPI.getUserProfile();
          console.log('📊 Profile from backend:', profile);
          
          if (profile && profile.success && profile.data) {
            setProfileData(profile.data);
            populateFormWithProfileData(profile.data, currentUser);
          } else if (profile && profile.data && profile.data.fallback) {
            // Using fallback data, populate from Firebase user
            populateFormWithFirebaseData(currentUser);
          } else {
            // Backend profile exists but might be empty, merge with Firebase
            populateFormWithProfileData(profile?.data || {}, currentUser);
          }
        } catch (profileError) {
          console.warn('⚠️ Could not load backend profile, using Firebase data:', profileError);
          populateFormWithFirebaseData(currentUser);
        }
      } else {
        console.log('❌ No authenticated user found');
        // User not logged in, use default empty form
        resetFormToDefaults();
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
      resetFormToDefaults();
    } finally {
      setIsLoading(false);
    }
  }, [populateFormWithFirebaseData, populateFormWithProfileData, resetFormToDefaults]);

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const populateFormWithProfileData = useCallback((backendProfileData, firebaseUser) => {
    // Merge backend profile data with Firebase user data
    setFormData(prev => ({
      ...prev,
      name: backendProfileData.name || backendProfileData.displayName || firebaseUser.displayName || '',
      email: backendProfileData.email || firebaseUser.email || '',
      phone: backendProfileData.phone || firebaseUser.phoneNumber || '',
      gender: backendProfileData.gender || '',
      // Keep address fields if they exist in profile
      firstName: backendProfileData.firstName || '',
      lastName: backendProfileData.lastName || '',
      address: backendProfileData.address || '',
      apartment: backendProfileData.apartment || '',
      city: backendProfileData.city || '',
      state: backendProfileData.state || 'Delhi',
      pin: backendProfileData.pin || '',
      country: backendProfileData.country || '',
      phoneNumber: backendProfileData.phoneNumber || backendProfileData.phone || firebaseUser.phoneNumber || '',
    }));
  }, []);

  const populateFormWithFirebaseData = useCallback((firebaseUser) => {
    // Populate form with Firebase user data only
    setFormData(prev => ({
      ...prev,
      name: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      phone: firebaseUser.phoneNumber || '',
    }));
  }, []);

  const resetFormToDefaults = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      name: '',
      email: '',
      phone: '',
      gender: '',
    }));
  }, []);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const getPasswordDisplayValue = useCallback((field) => {
    if (formData[field]) {
      return '•'.repeat(formData[field].length);
    }
    return '';
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves
    
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Validation Error', 'Name is required');
        return;
      }
      
      if (!formData.email.trim()) {
        Alert.alert('Validation Error', 'Email is required');
        return;
      }

      // Prepare profile data for API
      const profileUpdateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        apartment: formData.apartment.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pin: formData.pin.trim(),
        country: formData.country.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };

      console.log('💾 Saving profile data:', profileUpdateData);

      // Update profile via API
      const result = await yoraaAPI.updateUserProfile(profileUpdateData);
      
      if (result && result.success) {
        console.log('✅ Profile updated successfully');
        Alert.alert('Success', 'Profile updated successfully!');
        
        // Also update Firebase user profile if displayName changed
        const firebaseUser = auth().currentUser;
        if (firebaseUser && firebaseUser.displayName !== formData.name) {
          try {
            await firebaseUser.updateProfile({ displayName: formData.name });
            console.log('✅ Firebase profile updated');
          } catch (firebaseError) {
            console.warn('⚠️ Could not update Firebase profile:', firebaseError);
          }
        }
        
        // Refresh profile data
        await loadUserProfile();
      } else {
        throw new Error(result?.message || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, isSaving, loadUserProfile]);

  const handleAddOtherDetails = useCallback(() => {
    setOtherDetailsExpanded(!otherDetailsExpanded);
  }, [otherDetailsExpanded]);

  const handleAddAddress = useCallback(() => {
    setShowAddressModal(true);
  }, []);

  const handleCloseAddressModal = useCallback(() => {
    // 300ms ease-out animation
    setTimeout(() => {
      setShowAddressModal(false);
    }, 300);
  }, []);

  const handleAddressDone = useCallback(() => {
    setShowAddressModal(false);
    setShowSuccessModal(true);
  }, []);

  const handleSuccessModalDone = useCallback(() => {
    setShowSuccessModal(false);
    setAddressAdded(true);
  }, []);

  const handleStateSelect = useCallback((state) => {
    setFormData(prev => ({
      ...prev,
      state: state
    }));
    setShowStateDropdown(false);
  }, []);

  const handleCountryCodeSelect = useCallback((countryCode) => {
    setFormData(prev => ({
      ...prev,
      countryCode: countryCode.code
    }));
    setShowCountryCodeDropdown(false);
  }, []);

  const handleGenderSelect = useCallback((gender) => {
    setFormData(prev => ({
      ...prev,
      gender: gender
    }));
    setShowGenderDropdown(false);
  }, []);

  // const handleDatePickerPress = () => {
  //   setShowDatePicker(true);
  // };

  // const handleDateChange = (date) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     dateOfBirth: date
  //   }));
  //   setShowDatePicker(false);
  // };

  // Memoized computed value
  const getFormattedAddress = useMemo(() => {
    const { address, apartment, city, state, pin, country } = formData;
    let addressParts = [];
    
    if (address) addressParts.push(address);
    if (apartment) addressParts.push(apartment);
    if (city) addressParts.push(city);
    if (state) addressParts.push(state);
    if (pin) addressParts.push(pin);
    if (country) addressParts.push(country);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'XYZ Street';
  }, [formData]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton 
          navigation={navigation}
          animationDuration={300}
        />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Form Fields */}
          <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder=""
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder=""
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Change Password Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Change Password</Text>
              <TextInput
                style={styles.textInput}
                value={getPasswordDisplayValue('changePassword')}
                onChangeText={(value) => handleInputChange('changePassword', value)}
                placeholder=""
                secureTextEntry={false}
              />
            </View>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Confirm Password</Text>
              <TextInput
                style={styles.textInput}
                value={getPasswordDisplayValue('confirmPassword')}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder=""
                secureTextEntry={false}
              />
            </View>
          </View>

          {/* Phone Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder=""
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Additional Sections */}
        <View style={styles.additionalContainer}>
          {/* Other Details Container - Always visible as per Figma */}
          <View style={styles.otherDetailsMainContainer}>
            <View style={styles.otherDetailsHeader}>
              <Text style={styles.otherDetailsTitle}>Other Details</Text>
              <TouchableOpacity onPress={handleAddOtherDetails}>
                <Text style={styles.addButton}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            {/* Date of Birth Field */}
            <View style={styles.figmaInputContainer}>
              <View style={styles.figmaInputWrapper}>
                <Text style={styles.figmaFloatingLabel}>Date of Birth</Text>
                <TouchableOpacity style={styles.figmaDatePickerContainer}>
                  <Text style={styles.figmaDateText}>
                    {formData.dateOfBirth.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={styles.figmaCalendarIconContainer}>
                    <Text style={styles.figmaCalendarIcon}>📅</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gender Field */}
            <View style={styles.figmaInputContainer}>
              <View style={styles.figmaInputWrapper}>
                <Text style={styles.figmaFloatingLabel}>Gender</Text>
                <TouchableOpacity 
                  style={styles.figmaGenderPickerContainer} 
                  onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                >
                  <Text style={styles.figmaGenderText}>{formData.gender}</Text>
                  <Text style={styles.figmaDropdownArrow}>▼</Text>
                </TouchableOpacity>
                
                {showGenderDropdown && (
                  <View style={styles.figmaGenderDropdown}>
                    {genderOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.figmaDropdownOption}
                        onPress={() => handleGenderSelect(option)}
                      >
                        <Text style={[
                          styles.figmaDropdownOptionText,
                          formData.gender === option && styles.selectedOption
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.addressMainContainer}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressTitle}>Address</Text>
              <TouchableOpacity onPress={handleAddAddress}>
                <Text style={styles.addButton}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            {/* Saved Address Display */}
            {addressAdded && (
              <View style={styles.figmaAddressContainer}>
                <View style={styles.figmaAddressWrapper}>
                  <Text style={styles.figmaAddressLabel}>Address</Text>
                  <View style={styles.figmaAddressInputContainer}>
                    <Text style={styles.figmaAddressText}>{getFormattedAddress}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

          {/* Spacer for Save Button */}
          <View style={styles.spacer} />
        </ScrollView>
      )}

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Address Modal Header */}
          <View style={styles.modalHeader}>
            <GlobalBackButton 
              onPress={handleCloseAddressModal}
              style={styles.backButton}
            />
            <Text style={styles.modalTitle}>Address</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalScrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.modalFormContainer}>
              {/* First Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="First Name"
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Last Name"
                />
              </View>

              {/* Address */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Address"
                />
              </View>

              {/* Apartment/Suite */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.apartment}
                  onChangeText={(value) => handleInputChange('apartment', value)}
                  placeholder="Apartment,suit"
                />
              </View>

              {/* City */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                />
              </View>

              {/* State Dropdown */}
              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  style={styles.dropdownContainer}
                  onPress={() => setShowStateDropdown(!showStateDropdown)}
                >
                  <Text style={styles.dropdownText}>{formData.state}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                
                {showStateDropdown && (
                  <View style={styles.dropdownOptions}>
                    {stateOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.dropdownOption}
                        onPress={() => handleStateSelect(option)}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          formData.state === option && styles.selectedOption
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* PIN */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.pin}
                  onChangeText={(value) => handleInputChange('pin', value)}
                  placeholder="PIN"
                  keyboardType="numeric"
                />
              </View>

              {/* Country */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                  placeholder="Country"
                />
              </View>

              {/* Phone with Country Code */}
              <View style={styles.inputContainer}>
                <View style={styles.phoneContainer}>
                  <TouchableOpacity 
                    style={styles.countryCodeContainer}
                    onPress={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                  >
                    <Text style={styles.countryCodeText}>
                      {countryCodeOptions.find(c => c.code === formData.countryCode)?.flag} {formData.countryCode}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.phoneInput}
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                  />
                </View>
                
                {showCountryCodeDropdown && (
                  <View style={styles.countryCodeDropdown}>
                    {countryCodeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.code}
                        style={styles.dropdownOption}
                        onPress={() => handleCountryCodeSelect(option)}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          formData.countryCode === option.code && styles.selectedOption
                        ]}>
                          {option.flag} {option.code} {option.country}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Modal Spacer */}
            <View style={styles.modalSpacer} />
          </ScrollView>

          {/* Done Button */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddressDone}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successMessage}>
              Your profile details has been updated!
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={handleSuccessModalDone}>
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

  {/* Date Picker Modal removed for stable build */}

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.saveButtonText, styles.savingText]}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  backArrowLine: {
    width: 14,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    left: 4,
  },
  backArrowHead1: {
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    left: 0,
    top: -3,
    transform: [{ rotate: '45deg' }],
    transformOrigin: 'left center',
  },
  backArrowHead2: {
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    left: 0,
    top: 3,
    transform: [{ rotate: '-45deg' }],
    transformOrigin: 'left center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  placeholder: {
    width: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    zIndex: 1,
    fontFamily: 'Montserrat-Medium',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  additionalContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  additionalSection: {
    marginBottom: 15,
  },
  additionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'Montserrat-ExtraBold',
  },
  addressDisplayContainer: {
    paddingTop: 15,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    marginLeft: 5,
  },
  addressContentContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  addressContent: {
    fontSize: 16,
    color: '#000000',
  },
  expandedContent: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  datePickerContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  datePickerStyle: {
    flex: 1,
    height: 40,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
  },
  dropdownContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 15,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownOption: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedOption: {
    fontWeight: '600',
    color: '#007AFF',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalScrollContainer: {
    flex: 1,
  },
  modalFormContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    minWidth: 100,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000000',
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  countryCodeDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 15,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  modalSpacer: {
    height: 100,
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    maxWidth: 300,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 30,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    minWidth: 120,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 100,
  },
  // Expanded Details Styles
  expandedDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  genderPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  genderText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  calendarIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 18,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
  },
  savingText: {
    marginLeft: 8,
  },
  
  // Figma-specific styles for Other Details section
  otherDetailsMainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 10,
    // No border as per Figma design
  },
  otherDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  otherDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
  },
  
  // Figma Input Styles
  figmaInputContainer: {
    marginBottom: 15,
  },
  figmaInputWrapper: {
    position: 'relative',
  },
  figmaFloatingLabel: {
    position: 'absolute',
    left: 19,
    top: -8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    zIndex: 1,
  },
  figmaDatePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 47,
  },
  figmaDateText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  figmaCalendarIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  figmaCalendarIcon: {
    fontSize: 18,
  },
  figmaGenderPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 47,
  },
  figmaGenderText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  figmaDropdownArrow: {
    fontSize: 14,
    color: '#848688',
  },
  figmaGenderDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  figmaDropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  figmaDropdownOptionText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  
  // Address Section Styles
  addressMainContainer: {
    marginHorizontal: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
  },
  
  // Figma Address Container
  figmaAddressContainer: {
    marginTop: 10,
  },
  figmaAddressWrapper: {
    position: 'relative',
  },
  figmaAddressLabel: {
    position: 'absolute',
    left: 19,
    top: -8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    zIndex: 1,
  },
  figmaAddressInputContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 47,
    justifyContent: 'center',
  },
  figmaAddressText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
});

export default React.memo(EditProfile);
