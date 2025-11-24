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
import auth from '@react-native-firebase/auth';
import GlobalBackButton from '../components/GlobalBackButton';
import { AppleIcon, GoogleIcon, CaretDownIcon } from '../assets/icons';
import appleAuthService from '../services/appleAuthService';
import googleAuthService from '../services/googleAuthService';
import firebasePhoneAuthService from '../services/firebasePhoneAuth';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

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
  const [isSocialLoading, setIsSocialLoading] = useState(false);

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
    const debugTimestamp = new Date().toISOString();
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          🔐 PHONE LOGIN DEBUG SESSION STARTED                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`⏰ Timestamp: ${debugTimestamp}`);
    console.log(`📱 Login Method: Phone`);
    console.log(`🌍 Country Code: ${selectedCountry.code}`);
    console.log(`📞 Phone Number: ${mobileNumber}`);
    console.log(`🛒 From Checkout: ${route?.params?.fromCheckout ? 'YES' : 'NO'}`);
    
    try {
      if (!mobileNumber.trim()) {
        console.log('❌ Validation failed: Empty phone number');
        Alert.alert('Error', 'Please enter a valid mobile number');
        return;
      }

      if (mobileNumber.length < 10) {
        console.log('❌ Validation failed: Phone number too short');
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
        return;
      }

      setIsLoading(true);
      
      // Format phone number with country code
      const formattedPhoneNumber = `${selectedCountry.code}${mobileNumber.replace(/[^\d]/g, '')}`;
      
      console.log('\n🔄 STEP 1: Sending OTP via Firebase');
      console.log(`📱 Formatted Phone: ${formattedPhoneNumber}`);
      console.log(`⏰ OTP Request Time: ${new Date().toISOString()}`);
      
      // Send OTP using Firebase Phone Auth Service
      const result = await firebasePhoneAuthService.sendOTP(formattedPhoneNumber);
      
      if (!result.success) {
        const errorMsg = result.fullError || result.error || 'Failed to send OTP';
        console.log('\n❌ STEP 1 FAILED: OTP Send Error');
        console.error('❌ Firebase Error Code:', result.errorCode);
        console.error('❌ Error Message:', result.error);
        console.error('❌ Full Error:', errorMsg);
        
        // ✅ CRITICAL FIX: Handle auth/app-not-authorized error specifically
        if (result.errorCode === 'auth/app-not-authorized') {
          Alert.alert(
            'Authentication Error',
            'This app is not authorized to use Firebase Authentication.\n\n' +
            'This is usually caused by:\n' +
            '• Missing or incorrect SHA-256 certificate in Firebase Console\n' +
            '• Outdated google-services.json file\n\n' +
            'Please contact support or try again later.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        throw new Error(errorMsg);
      }
      
      console.log('✅ STEP 1 SUCCESS: OTP sent successfully');
      console.log('📦 Confirmation Object:', result.confirmation ? 'EXISTS' : 'MISSING');
      console.log('📦 Confirmation Keys:', result.confirmation ? Object.keys(result.confirmation) : 'N/A');
      console.log('📦 Has verificationId:', result.confirmation?.verificationId ? 'YES' : 'NO');
      console.log('📦 Has confirm method:', typeof result.confirmation?.confirm === 'function' ? 'YES' : 'NO');
      console.log(`⏰ OTP Sent Time: ${new Date().toISOString()}`);
      
      // ✅ CRITICAL FIX: Store confirmation in a ref to prevent loss during navigation
      if (!result.confirmation) {
        console.error('❌ CRITICAL: No confirmation object returned from Firebase!');
        Alert.alert('Error', 'Failed to initialize OTP session. Please try again.');
        return;
      }
      
      // ✅ Navigate immediately without Alert to prevent state loss
      console.log('\n🚀 Navigating to OTP Verification Screen');
      console.log('📦 Navigation Params:', {
        phoneNumber: formattedPhoneNumber,
        hasConfirmation: !!result.confirmation,
        verificationId: result.confirmation?.verificationId,
        countryCode: selectedCountry.code,
        mobileNumber: mobileNumber,
        fromCheckout: route?.params?.fromCheckout,
        fromReview: route?.params?.fromReview
      });
      
      // Navigate to verification code screen with confirmation object
      if (navigation) {
        // ✅ CRITICAL: Pass the actual confirmation object with verificationId
        navigation.navigate('LoginAccountMobileNumberVerificationCode', {
          phoneNumber: formattedPhoneNumber,
          verificationId: result.confirmation.verificationId, // ✅ NEW: Pass verificationId separately
          confirmation: result.confirmation,
          countryCode: selectedCountry.code,
          mobileNumber: mobileNumber,
          fromCheckout: route?.params?.fromCheckout,
          fromReview: route?.params?.fromReview,
          reviewData: route?.params?.reviewData
        });
        
        // Show success message after navigation (only in development)
        if (__DEV__) {
          setTimeout(() => {
            Alert.alert(
              'OTP Sent',
              `A verification code has been sent to ${formattedPhoneNumber}\n\n⏱️ SMS may take 5-30 seconds to arrive.\n\nIf you don't receive it within 30 seconds, use "Resend Code" on the next screen.`,
              [{ text: 'OK' }]
            );
          }, 500);
        }
      }
      
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                  ❌ PHONE LOGIN ERROR                         ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please enter a valid phone number.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/app-not-authorized') {
        errorMessage = 'App not authorized. Please verify that the correct package name, SHA-1, and SHA-256 are configured in the Firebase Console.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('📱 Showing Alert:', errorMessage);
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setIsLoading(false);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
  };

  const handleSignUp = () => {
    // Navigate to create account screen
    if (navigation) {
      navigation.navigate('CreateAccountMobileNumber');
    }
  };

  const handleSocialLogin = async (provider) => {
    const debugTimestamp = new Date().toISOString();
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log(`║        🔐 ${provider.toUpperCase()} LOGIN DEBUG SESSION STARTED              ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`⏰ Timestamp: ${debugTimestamp}`);
    console.log(`🔑 Provider: ${provider}`);
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`🛒 From Checkout: ${route?.params?.fromCheckout ? 'YES' : 'NO'}`);
    
    if (provider === 'apple') {
      if (Platform.OS !== 'ios') {
        console.log('❌ Platform check failed: Not iOS');
        Alert.alert('Error', 'Apple Sign In is only available on iOS devices');
        return;
      }

      if (!appleAuthService.isAppleAuthAvailable()) {
        console.log('❌ Apple Auth not available on device');
        Alert.alert('Error', 'Apple Sign In is not available on this device');
        return;
      }

      setIsSocialLoading(true);
      
      try {
        console.log('\n🔄 STEP 1: Initiating Apple Sign In');
        console.log(`⏰ Apple Sign In Start: ${new Date().toISOString()}`);
        const userCredential = await appleAuthService.signInWithApple();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('⚠️ Apple Sign In cancelled by user');
          return;
        }
        
        console.log('\n✅ STEP 1 SUCCESS: Apple Sign In completed');
        console.log('📦 User Credential Details:');
        console.log(`   - UID: ${userCredential.user.uid}`);
        console.log(`   - Email: ${userCredential.user.email}`);
        console.log(`   - Display Name: ${userCredential.user.displayName}`);
        console.log(`   - Phone: ${userCredential.user.phoneNumber || 'N/A'}`);
        console.log(`   - Email Verified: ${userCredential.user.emailVerified}`);
        console.log(`   - Is Anonymous: ${userCredential.user.isAnonymous}`);
        console.log(`   - Provider ID: ${userCredential.user.providerData?.[0]?.providerId || 'N/A'}`);
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        console.log(`👤 User Type: ${isNewUser ? 'NEW USER' : 'EXISTING USER'}`);
        console.log(`⏰ Sign In Complete Time: ${new Date().toISOString()}`);
        
        // Check Firebase authentication state
        console.log('\n🔍 STEP 2: Verifying Firebase Auth State');
        // CRITICAL FIX: Use auth().currentUser.getIdToken() instead of firebaseUser.getIdToken()
        // In React Native Firebase, getIdToken() must be called on the currentUser from auth()
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Firebase user not found after authentication');
        }
        const firebaseToken = await currentUser.getIdToken(true);
        console.log(`✅ Firebase Token Retrieved: ${firebaseToken.substring(0, 20)}...`);
        console.log(`📝 Token Length: ${firebaseToken.length} characters`);
        
        // Navigate based on user type and context
        const fromCheckout = route?.params?.fromCheckout;
        const fromReview = route?.params?.fromReview;
        
        console.log('\n🚀 STEP 3: Determining Navigation Path');
        console.log(`   - From Checkout: ${fromCheckout}`);
        console.log(`   - From Review: ${fromReview}`);
        console.log(`   - Is New User: ${isNewUser}`);
        
        if (fromCheckout) {
          console.log('📍 Navigation Decision: Terms & Conditions (from checkout)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (fromReview) {
          console.log('📍 Navigation Decision: Terms & Conditions (from review)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromReview: true,
            reviewData: route?.params?.reviewData
          });
        } else if (isNewUser) {
          console.log('📍 Navigation Decision: Terms & Conditions (new user)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          console.log('📍 Navigation Decision: Home (existing user)');
          navigation.navigate('Home');
        }
        
        console.log('✅ STEP 3 SUCCESS: Navigation completed');
        
      } catch (error) {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  ❌ APPLE LOGIN ERROR                         ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.error('❌ Error Type:', error.constructor.name);
        console.error('❌ Error Code:', error.code);
        console.error('❌ Error Message:', error.message);
        console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
        console.error('❌ Stack Trace:', error.stack);
        
        Alert.alert('Error', error.message || 'Apple Sign In failed. Please try again.');
      } finally {
        setIsSocialLoading(false);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      }
    } else if (provider === 'google') {
      // Check if Google Sign-in is available before proceeding
      if (!googleAuthService.isAvailable()) {
        console.log('❌ Google Sign-in not available');
        Alert.alert(
          'Google Sign-in Unavailable', 
          'Google Sign-in is not available on this device. This may be due to missing Google Play Services or a configuration issue.'
        );
        return;
      }

      setIsSocialLoading(true);
      
      try {
        console.log('\n🔄 STEP 1: Starting Google Sign In');
        console.log(`⏰ Google Sign In Start: ${new Date().toISOString()}`);
        
        // Android-specific pre-check
        if (Platform.OS === 'android') {
          console.log('🔍 Performing Android-specific checks...');
          const configCheck = await googleAuthService.checkAndroidConfiguration();
          
          if (!configCheck.success) {
            console.error('❌ Android configuration check failed:', configCheck.message);
            throw new Error(configCheck.message);
          }
          
          console.log('✅ Android configuration check passed:', configCheck.message);
        }
        
        const userCredential = await googleAuthService.signInWithGoogle();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('⚠️ Google Sign In cancelled by user');
          return;
        }
        
        console.log('\n✅ STEP 1 SUCCESS: Google Sign In completed');
        console.log('📦 User Credential Details:');
        console.log(`   - UID: ${userCredential.user.uid}`);
        console.log(`   - Email: ${userCredential.user.email}`);
        console.log(`   - Display Name: ${userCredential.user.displayName}`);
        console.log(`   - Phone: ${userCredential.user.phoneNumber || 'N/A'}`);
        console.log(`   - Email Verified: ${userCredential.user.emailVerified}`);
        console.log(`   - Is Anonymous: ${userCredential.user.isAnonymous}`);
        console.log(`   - Provider ID: ${userCredential.user.providerData?.[0]?.providerId || 'N/A'}`);
        console.log(`   - Photo URL: ${userCredential.user.photoURL || 'N/A'}`);
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        console.log(`👤 User Type: ${isNewUser ? 'NEW USER' : 'EXISTING USER'}`);
        console.log(`⏰ Sign In Complete Time: ${new Date().toISOString()}`);
        
        // Check Firebase authentication state
        console.log('\n🔍 STEP 2: Verifying Firebase Auth State');
        // CRITICAL FIX: Use auth().currentUser.getIdToken() instead of firebaseUser.getIdToken()
        // In React Native Firebase, getIdToken() must be called on the currentUser from auth()
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Firebase user not found after authentication');
        }
        const firebaseToken = await currentUser.getIdToken(true);
        console.log(`✅ Firebase Token Retrieved: ${firebaseToken.substring(0, 20)}...`);
        console.log(`📝 Token Length: ${firebaseToken.length} characters`);
        
        // Navigate based on user type and context (same logic as Apple Sign In)
        const fromCheckout = route?.params?.fromCheckout;
        const fromReview = route?.params?.fromReview;
        
        console.log('\n🚀 STEP 3: Determining Navigation Path');
        console.log(`   - From Checkout: ${fromCheckout}`);
        console.log(`   - From Review: ${fromReview}`);
        console.log(`   - Is New User: ${isNewUser}`);
        
        if (fromCheckout) {
          console.log('📍 Navigation Decision: Terms & Conditions (from checkout)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (fromReview) {
          console.log('📍 Navigation Decision: Terms & Conditions (from review)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromReview: true,
            reviewData: route?.params?.reviewData
          });
        } else if (isNewUser) {
          console.log('📍 Navigation Decision: Terms & Conditions (new user)');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          console.log('📍 Navigation Decision: Home (existing user)');
          navigation.navigate('Home');
        }
        
        console.log('✅ STEP 3 SUCCESS: Navigation completed');
        
      } catch (error) {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                 ❌ GOOGLE LOGIN ERROR                         ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.error('❌ Error Type:', error.constructor.name);
        console.error('❌ Error Code:', error.code);
        console.error('❌ Error Message:', error.message);
        console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
        console.error('❌ Stack Trace:', error.stack);
        
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
        
        console.log('📱 Showing Alert:', errorMessage);
        Alert.alert('Google Sign In Error', errorMessage);
      } finally {
        setIsSocialLoading(false);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
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
            onPress={() => {
              if (route?.params?.fromCheckout) {
                navigation && navigation.navigate('Bag');
              } else if (route?.params?.fromReview) {
                // Return to the screen where the sign-in was initiated
                const returnScreen = route?.params?.returnScreen || 'ProductDetailsReviewThreePointSelection';
                navigation && navigation.navigate(returnScreen, {
                  reviewData: route?.params?.reviewData,
                  product: route?.params?.reviewData?.product,
                  productId: route?.params?.reviewData?.productId,
                  order: route?.params?.reviewData?.order
                });
              } else if (route?.params?.fromOrders) {
                navigation && navigation.navigate('Profile');
              } else {
                navigation && navigation.navigate('Rewards');
              }
            }}
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
            style={[styles.socialButton, isSocialLoading && styles.socialButtonDisabled]}
            onPress={() => handleSocialLogin('apple')}
            disabled={isSocialLoading}
          >
            <AppleIcon width={42} height={42} color="#332218" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, isSocialLoading && styles.socialButtonDisabled]}
            onPress={() => handleSocialLogin('google')}
            disabled={isSocialLoading}
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
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    paddingTop: hp(isTablet ? 3.1 : 2.5),
  },
  titleContainer: {
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginTop: hp(isTablet ? 6.2 : 5),
  },
  title: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: fs(isTablet ? 56 : isSmallDevice ? 40 : 48),
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: hp(isTablet ? 7.7 : 6.2),
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: hp(isTablet ? 4.6 : 3.7),
    width: wp(isTablet ? 41 : 33),
  },
  toggleButton: {
    flex: 1,
    height: hp(isTablet ? 4.6 : 3.7),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
  },
  toggleText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  toggleTextActive: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginHorizontal: wp(isTablet ? 12.6 : 10.1),
    marginTop: hp(isTablet ? 7.7 : 6.2),
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: hp(isTablet ? 7.2 : 5.9),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: wp(isTablet ? 3.7 : 2.9),
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: wp(isTablet ? 8.3 : 6.6),
    height: wp(isTablet ? 8.3 : 6.6),
    borderRadius: wp(isTablet ? 4.2 : 3.3),
    overflow: 'hidden',
    marginRight: wp(isTablet ? 2.6 : 2.1),
  },
  countryCode: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    marginRight: wp(isTablet ? 1.3 : 1.1),
    letterSpacing: -0.35,
  },
  separator: {
    width: 1,
    height: hp(isTablet ? 5.2 : 4.2),
    backgroundColor: '#E9E9E9',
    marginRight: wp(isTablet ? 5.3 : 4.3),
  },
  mobileInput: {
    flex: 1,
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    height: '100%',
    letterSpacing: -0.35,
  },
  emailInput: {
    flex: 1,
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    height: '100%',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    letterSpacing: -0.35,
  },
  loginButton: {
    marginHorizontal: wp(isTablet ? 12.6 : 10.1),
    marginTop: hp(isTablet ? 7.7 : 6.2),
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: hp(isTablet ? 7.9 : 6.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loginButtonText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
  },
  loginButtonTextDisabled: {
    color: '#999999',
  },
  dividerContainer: {
    alignItems: 'center',
    marginTop: hp(isTablet ? 6.2 : 5),
  },
  dividerText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    opacity: 0.6,
    letterSpacing: 0.24,
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(isTablet ? 6.6 : 5.3),
    marginTop: hp(isTablet ? 3.1 : 2.5),
  },
  socialButton: {
    width: wp(isTablet ? 13.9 : 11.2),
    height: wp(isTablet ? 13.9 : 11.2),
    borderRadius: wp(isTablet ? 7 : 5.6),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(isTablet ? 9.3 : 7.5),
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginBottom: hp(isTablet ? 6.2 : 5),
  },
  signupText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
  },
  signupLink: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    textDecorationLine: 'underline',
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalSafeArea: {
    flex: 1,
  },
  swipeIndicator: {
    width: wp(isTablet ? 13.3 : 10.6),
    height: hp(isTablet ? 0.8 : 0.6),
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: hp(isTablet ? 1.2 : 1),
    marginBottom: hp(isTablet ? 1.2 : 1),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
    paddingVertical: hp(isTablet ? 2.5 : 2),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 16 : 18),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingVertical: hp(isTablet ? 1.2 : 1),
  },
  modalCloseText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#007AFF',
  },
  modalList: {
    paddingBottom: hp(isTablet ? 3.1 : 2.5),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
    paddingVertical: hp(isTablet ? 2.5 : 2),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryItemText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  flagEmoji: {
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 16 : 18),
  },
  chevronContainer: {
    marginLeft: wp(isTablet ? 1.3 : 1.1),
  },
});

export default LoginAccountMobileNumber;
