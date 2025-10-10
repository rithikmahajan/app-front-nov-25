import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import GlobalBackButton from '../components/GlobalBackButton';
import { AppleIcon, GoogleIcon, CaretDownIcon } from '../assets/icons';
import phoneAuthService from '../services/phoneAuthService';
import appleAuthService from '../services/appleAuthService';
import googleAuthService from '../services/googleAuthService';

// Comprehensive country codes data
const countryCodes = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+1684', country: 'American Samoa', flag: '🇦🇸' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+1264', country: 'Anguilla', flag: '🇦🇮' },
  { code: '+1268', country: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1242', country: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1246', country: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+1441', country: 'Bermuda', flag: '🇧🇲' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+1345', country: 'Cayman Islands', flag: '🇰🇾' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Congo, Democratic Republic', flag: '🇨🇩' },
  { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+225', country: "Cote d'Ivoire", flag: '🇨🇮' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+1767', country: 'Dominica', flag: '🇩🇲' },
  { code: '+1809', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
  { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱' },
  { code: '+1473', country: 'Grenada', flag: '🇬🇩' },
  { code: '+590', country: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+1671', country: 'Guam', flag: '🇬🇺' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
  { code: '+850', country: 'Korea, North', flag: '🇰🇵' },
  { code: '+82', country: 'Korea, South', flag: '🇰🇷' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+389', country: 'Macedonia', flag: '🇲🇰' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+596', country: 'Martinique', flag: '🇲🇶' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+262', country: 'Mayotte', flag: '🇾🇹' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+1664', country: 'Montserrat', flag: '🇲🇸' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+683', country: 'Niue', flag: '🇳🇺' },
  { code: '+672', country: 'Norfolk Island', flag: '🇳🇫' },
  { code: '+1670', country: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', country: 'Palau', flag: '🇵🇼' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+1787', country: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+262', country: 'Reunion', flag: '🇷🇪' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+1869', country: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1758', country: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+1784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+268', country: 'Swaziland', flag: '🇸🇿' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+670', country: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴' },
  { code: '+1868', country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+1649', country: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+39', country: 'Vatican City', flag: '🇻🇦' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+1284', country: 'Virgin Islands, British', flag: '🇻🇬' },
  { code: '+1340', country: 'Virgin Islands, U.S.', flag: '🇻🇮' },
  { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+212', country: 'Western Sahara', flag: '🇪🇭' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
];

const LoginAccountMobileNumber = ({ navigation, route }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.code === '+91') || countryCodes[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [translateY] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsModalVisible(false);
    translateY.setValue(0); // Reset position when closing
  };

  const openModal = () => {
    translateY.setValue(0); // Reset position when opening
    setIsModalVisible(true);
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Close modal if swiped down significantly or with high velocity
      if (translationY > 100 || velocityY > 1000) {
        setIsModalVisible(false);
      } else {
        // Animate back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryItemText}>{item.flag} {item.country} ({item.code})</Text>
    </TouchableOpacity>
  );

  const handleLogin = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    if (mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Format phone number with country code
      const formattedPhoneNumber = phoneAuthService.formatPhoneNumber(
        selectedCountry.code, 
        mobileNumber
      );
      
      console.log('Sending OTP to:', formattedPhoneNumber);
      
      // Send OTP using Firebase Phone Auth
      const confirmation = await phoneAuthService.sendOTP(formattedPhoneNumber);
      
      Alert.alert(
        'OTP Sent', 
        `A verification code has been sent to ${formattedPhoneNumber}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to verification code screen with confirmation object
              if (navigation) {
                navigation.navigate('LoginAccountMobileNumberVerificationCode', {
                  phoneNumber: formattedPhoneNumber,
                  confirmation: confirmation,
                  countryCode: selectedCountry.code,
                  mobileNumber: mobileNumber,
                  fromCheckout: route?.params?.fromCheckout
                });
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Phone authentication error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // Navigate to create account screen
    if (navigation) {
      navigation.navigate('CreateAccountMobileNumber');
    }
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'apple') {
      if (Platform.OS !== 'ios') {
        Alert.alert('Error', 'Apple Sign In is only available on iOS devices');
        return;
      }

      if (!appleAuthService.isAppleAuthAvailable()) {
        Alert.alert('Error', 'Apple Sign In is not available on this device');
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('Starting Apple Sign In...');
        const userCredential = await appleAuthService.signInWithApple();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('Apple Sign In was cancelled by user');
          return;
        }
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        
        console.log('Apple Sign In successful, isNewUser:', isNewUser);
        
        // Navigate based on user type and context
        const fromCheckout = route?.params?.fromCheckout;
        
        if (fromCheckout) {
          // From checkout: Always go to Terms & Conditions first
          console.log('User from checkout - navigating to Terms & Conditions');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (isNewUser) {
          // New user not from checkout: Show terms and conditions
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          // Returning user not from checkout: Go directly to Home
          console.log('Returning user - navigating directly to HomeScreen');
          navigation.navigate('Home');
        }
        
      } catch (error) {
        console.error('Apple Sign In error:', error);
        Alert.alert('Error', error.message || 'Apple Sign In failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (provider === 'google') {
      // Check if Google Sign-in is available before proceeding
      if (!googleAuthService.isAvailable()) {
        Alert.alert(
          'Google Sign-in Unavailable', 
          'Google Sign-in is not available on this device. This may be due to missing Google Play Services or a configuration issue.'
        );
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('Starting Google Sign In for', Platform.OS);
        
        // Android-specific pre-check
        if (Platform.OS === 'android') {
          console.log('Performing Android-specific Google Sign In checks...');
          const configCheck = await googleAuthService.checkAndroidConfiguration();
          
          if (!configCheck.success) {
            throw new Error(configCheck.message);
          }
          
          console.log('Android configuration check passed:', configCheck.message);
        }
        
        const userCredential = await googleAuthService.signInWithGoogle();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('Google Sign In was cancelled by user');
          return;
        }
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        
        console.log('Google Sign In successful, isNewUser:', isNewUser);
        
        // Navigate based on user type and context (same logic as Apple Sign In)
        const fromCheckout = route?.params?.fromCheckout;
        
        if (fromCheckout) {
          // From checkout: Always go to Terms & Conditions first
          console.log('User from checkout - navigating to Terms & Conditions');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (isNewUser) {
          // New user not from checkout: Show terms and conditions
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          // Returning user not from checkout: Go directly to Home
          console.log('Returning user - navigating directly to Home');
          navigation.navigate('Home');
        }
        
      } catch (error) {
        console.error('Google Sign In error on', Platform.OS, ':', error);
        
        let errorMessage = error.message || 'Google Sign In failed. Please try again.';
        
        // Android-specific error messages
        if (Platform.OS === 'android') {
          if (error.message?.includes('Google Play Services')) {
            errorMessage = 'Please update Google Play Services and try again.';
          } else if (error.message?.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (error.message?.includes('configuration')) {
            errorMessage = 'Google Sign In is not properly configured. Please contact support.';
          }
        }
        
        Alert.alert('Google Sign In Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with Global Back button */}
        <View style={styles.header}>
          <GlobalBackButton 
            navigation={navigation}
            onPress={() => navigation && navigation.navigate('Rewards')}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Log into your account</Text>
        </View>

        {/* Toggle Switch for Phone/Email */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text style={[
                styles.toggleText,
                loginMethod === 'phone' && styles.toggleTextActive,
              ]}>
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setLoginMethod('email');
                if (navigation) {
                  navigation.navigate('LoginAccountEmail');
                }
              }}
            >
              <Text style={[
                styles.toggleText,
                loginMethod === 'email' && styles.toggleTextActive,
              ]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          {loginMethod === 'phone' ? (
            <View style={styles.phoneInputWrapper}>
              {/* Country Code Section */}
              <TouchableOpacity 
                style={styles.countrySection}
                onPress={openModal}
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
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          ) : (
            <TextInput
              style={styles.emailInput}
              placeholder="Email Address"
              placeholderTextColor="#848688"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[
            styles.loginButton,
            (!mobileNumber || isLoading) && styles.loginButtonDisabled
          ]} 
          onPress={handleLogin}
          disabled={!mobileNumber || isLoading}
        >
          <Text style={[
            styles.loginButtonText,
            (!mobileNumber || isLoading) && styles.loginButtonTextDisabled
          ]}>
            {isLoading ? 'SENDING OTP...' : 'LOGIN'}
          </Text>
        </TouchableOpacity>

        {/* Or log in with */}
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>or log in with</Text>
        </View>

        {/* Social Login Options */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
            onPress={() => handleSocialLogin('apple')}
            disabled={isLoading}
          >
            <AppleIcon width={42} height={42} color="#332218" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
            onPress={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <GoogleIcon width={42} height={42} />
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Country Selection Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleStateChange}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ 
                    translateY: translateY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, 500],
                      extrapolate: 'clamp'
                    })
                  }]
                }
              ]}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                {/* Swipe indicator */}
                <View style={styles.swipeIndicator} />
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Country</Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={countryCodes}
                  keyExtractor={(item, index) => `${item.code}-${item.country}-${index}`}
                  renderItem={renderCountryItem}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  contentContainerStyle={styles.modalList}
                />
              </SafeAreaView>
            </Animated.View>
          </PanGestureHandler>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  titleContainer: {
    paddingHorizontal: 33,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 48,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: 30,
    width: 124,
  },
  toggleButton: {
    flex: 1,
    height: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  toggleTextActive: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginHorizontal: 38,
    marginTop: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 47,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 11,
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
    marginRight: 8,
  },
  countryCode: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    marginRight: 4,
    letterSpacing: -0.35,
  },
  separator: {
    width: 1,
    height: 34,
    backgroundColor: '#E9E9E9',
    marginRight: 16,
  },
  mobileInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    height: '100%',
    letterSpacing: -0.35,
  },
  emailInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    height: '100%',
    paddingHorizontal: 16,
    letterSpacing: -0.35,
  },
  loginButton: {
    marginHorizontal: 38,
    marginTop: 50,
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  loginButtonTextDisabled: {
    color: '#999999',
  },
  dividerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    opacity: 0.6,
    letterSpacing: 0.24,
    lineHeight: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 33,
    marginBottom: 40,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    lineHeight: 20,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalSafeArea: {
    flex: 1,
  },
  swipeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
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
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#007AFF',
  },
  modalList: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryItemText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  // Update existing styles to work with new country selector
  flagEmoji: {
    fontSize: 18,
  },
  chevronContainer: {
    marginLeft: 4,
  },
});

export default LoginAccountMobileNumber;
