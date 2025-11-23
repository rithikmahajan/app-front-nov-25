import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { useAddress } from '../contexts/AddressContext';
import GlobalBackButton from '../components/GlobalBackButton';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
} from '../utils/responsive';

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

  // Modal visibility states
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);

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
    countryCode: '+91',
    phone: ''
  });

  // Memoized static options to prevent recreation on each render
  const stateOptions = useMemo(() => [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ], []);
  
  const countryCodeOptions = useMemo(() => [
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
    { code: '+291', country: 'Eritrea', flag: '�🇷' },
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
    { code: '+1671', country: 'Guam', flag: '🇬�🇺' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
    { code: '+224', country: 'Guinea', flag: '🇬🇳' },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+592', country: 'Guyana', flag: '🇬�' },
    { code: '+509', country: 'Haiti', flag: '🇭🇹' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+354', country: 'Iceland', flag: '🇮�🇸' },
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
    { code: '+687', country: 'New Caledonia', flag: '🇳�' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+505', country: 'Nicaragua', flag: '🇳�🇮' },
    { code: '+227', country: 'Niger', flag: '🇳🇪' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+683', country: 'Niue', flag: '🇳🇺' },
    { code: '+672', country: 'Norfolk Island', flag: '🇳🇫' },
    { code: '+1670', country: 'Northern Mariana Islands', flag: '�🇵' },
    { code: '+47', country: 'Norway', flag: '�🇳🇴' },
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
    { code: '+1869', country: 'Saint Kitts and Nevis', flag: '�🇳' },
    { code: '+1758', country: 'Saint Lucia', flag: '🇱�🇨' },
    { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵�' },
    { code: '+1784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲' },
    { code: '+239', country: 'Sao Tome and Principe', flag: '🇸🇹' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+221', country: 'Senegal', flag: '🇸�🇳' },
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
    { code: '+1340', country: 'Virgin Islands, U.S.', flag: '�🇮' },
    { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+212', country: 'Western Sahara', flag: '🇪🇭' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  ], []);

  // Handler functions
  const handleStateSelect = useCallback((state) => {
    setFormData(prev => ({
      ...prev,
      state: state
    }));
    setShowStateDropdown(false);
  }, []);

  const handleCountryCodeSelect = useCallback((option) => {
    setFormData(prev => ({
      ...prev,
      countryCode: option.code
    }));
    setShowCountryCodeDropdown(false);
  }, []);

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
      countryCode: address.phone?.substring(0, 3) || '+91',
      phone: address.phone?.substring(3) || ''
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
      countryCode: '+91',
      phone: ''
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
        phone: formData.countryCode + formData.phone,
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
    <>
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
            onPress={handleBack}
            style={styles.backButton}
          />
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
      </Animated.View>

      {/* Add Address Button - Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
          <Text style={styles.addAddressButtonText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    </>
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
          onPress={handleBack}
          style={styles.backButton}
        />
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
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => setShowStateDropdown(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownLabel}>State</Text>
              <Text style={styles.dropdownValue}>{formData.state || 'Select State'}</Text>
            </View>
            <ChevronDownIcon color="#000000" size={18} />
          </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.countryCodeContainer}
              onPress={() => setShowCountryCodeDropdown(true)}
              activeOpacity={0.7}
            >
              <View style={styles.phoneCodeContent}>
                <Text style={styles.phoneLabel}>Phone</Text>
                <View style={styles.phoneCodeRow}>
                  <IndiaFlag />
                  <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
                  <ChevronDownIcon color="#000000" size={18} />
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.phoneDivider} />
            <TextInput
              style={styles.phoneInput}
              placeholder="1234567890"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
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
      
      {/* State Selection Modal */}
      <Modal
        visible={showStateDropdown}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStateDropdown(false)}
      >
        <SafeAreaView style={styles.selectorModalContainer}>
          <View style={styles.swipeIndicator} />
          
          <View style={styles.selectorModalHeader}>
            <Text style={styles.selectorModalTitle}>Select State</Text>
            <TouchableOpacity
              onPress={() => setShowStateDropdown(false)}
              style={styles.selectorModalCloseButton}
            >
              <Text style={styles.selectorModalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={stateOptions}
            keyExtractor={(item, index) => `state-${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => handleStateSelect(item)}
              >
                <Text style={styles.selectorItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.selectorModalList}
          />
        </SafeAreaView>
      </Modal>

      {/* Country Code Selection Modal */}
      <Modal
        visible={showCountryCodeDropdown}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryCodeDropdown(false)}
      >
        <SafeAreaView style={styles.selectorModalContainer}>
          <View style={styles.swipeIndicator} />
          
          <View style={styles.selectorModalHeader}>
            <Text style={styles.selectorModalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => setShowCountryCodeDropdown(false)}
              style={styles.selectorModalCloseButton}
            >
              <Text style={styles.selectorModalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={countryCodeOptions}
            keyExtractor={(item, index) => `country-${item.code}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => handleCountryCodeSelect(item)}
              >
                <Text style={styles.selectorItemText}>
                  {item.flag} {item.country} ({item.code})
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.selectorModalList}
          />
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: getResponsiveSpacing(16),
    paddingTop: getResponsiveSpacing(12),
    paddingBottom: getResponsiveSpacing(20),
  },
  backButton: {
    padding: getResponsiveSpacing(8),
    marginLeft: getResponsiveSpacing(-8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(20),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.5,
    color: '#000000',
  },
  headerSpacer: {
    width: getResponsiveValue(40, 45, 50),
  },

  // Back Arrow Icon - PNG Image
  backArrowIcon: {
    width: getResponsiveValue(24, 27, 30),
    height: getResponsiveValue(24, 27, 30),
  },

  // Swipeable Container Styles
  swipeableContainer: {
    marginHorizontal: getResponsiveSpacing(20),
    marginTop: getResponsiveSpacing(10),
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
    width: getResponsiveValue(120, 135, 150),
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: getResponsiveSpacing(30),
    zIndex: 1,
  },
  deleteIndicator: {
    width: getResponsiveValue(4, 5, 6),
    height: getResponsiveValue(60, 68, 75),
    backgroundColor: '#FF3B30',
    borderRadius: 2,
  },

  // Address Card Styles
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(20),
    backgroundColor: '#FFFFFF',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getResponsiveSpacing(4),
  },
  addressLine: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    marginBottom: getResponsiveSpacing(2),
  },
  addressEmail: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    marginTop: getResponsiveSpacing(4),
  },
  editButton: {
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
  },
  editButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#000000',
  },

  // Add Address Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(34),
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
  },
  addAddressButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: getResponsiveSpacing(16),
    alignItems: 'center',
  },
  addAddressButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
    color: '#FFFFFF',
  },

  // Form Styles
  formContainer: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(24),
    paddingTop: getResponsiveSpacing(20),
  },
  inputContainer: {
    marginBottom: getResponsiveSpacing(12),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 12,
    paddingHorizontal: getResponsiveSpacing(19),
    paddingVertical: getResponsiveSpacing(15),
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    height: getResponsiveValue(47, 54, 60),
  },

  // Dropdown Styles
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 12,
    paddingHorizontal: getResponsiveSpacing(19),
    paddingVertical: getResponsiveSpacing(10),
    backgroundColor: '#FFFFFF',
    height: getResponsiveValue(47, 54, 60),
  },
  dropdownContent: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: getResponsiveFontSize(12),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.3,
    color: '#000000',
    marginBottom: getResponsiveSpacing(2),
  },
  dropdownValue: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
    color: '#000000',
  },
  dropdownText: {
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
  },
  dropdownArrow: {
    width: getResponsiveValue(12, 14, 16),
    height: getResponsiveValue(12, 14, 16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownLine1: {
    width: getResponsiveValue(8, 9, 10),
    height: 2,
    backgroundColor: '#666666',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    top: getResponsiveValue(3, 4, 5),
  },
  dropdownLine2: {
    width: getResponsiveValue(8, 9, 10),
    height: 2,
    backgroundColor: '#666666',
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    top: getResponsiveValue(3, 4, 5),
  },

  // Phone Input Styles
  phoneContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: getResponsiveValue(47, 54, 60),
    overflow: 'hidden',
  },
  countryCodeContainer: {
    paddingHorizontal: getResponsiveSpacing(19),
    paddingVertical: getResponsiveSpacing(6),
    justifyContent: 'center',
  },
  phoneCodeContent: {
    flexDirection: 'column',
  },
  phoneLabel: {
    fontSize: getResponsiveFontSize(12),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.3,
    color: '#000000',
    marginBottom: getResponsiveSpacing(2),
  },
  phoneCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
    color: '#000000',
    marginLeft: getResponsiveSpacing(6),
    marginRight: getResponsiveSpacing(6),
  },
  phoneDivider: {
    width: 1,
    backgroundColor: '#979797',
    marginVertical: getResponsiveSpacing(8),
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(19),
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
    color: '#000000',
  },

  // Flag Styles
  flagContainer: {
    width: getResponsiveValue(20, 22, 24),
    height: getResponsiveValue(14, 16, 18),
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
    marginTop: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(32),
  },
  checkboxContainer: {
    marginRight: getResponsiveSpacing(12),
  },
  checkbox: {
    width: getResponsiveValue(20, 22, 24),
    height: getResponsiveValue(20, 22, 24),
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
    width: getResponsiveValue(6, 7, 8),
    height: getResponsiveValue(10, 11, 12),
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  checkboxLabel: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
    color: '#666666',
  },

  // Update Button
  updateButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: getResponsiveSpacing(16),
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(40),
  },
  updateButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
    color: '#FFFFFF',
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(60),
  },
  loadingText: {
    marginTop: getResponsiveSpacing(16),
    fontSize: getResponsiveFontSize(16),
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(60),
    paddingHorizontal: getResponsiveSpacing(40),
  },
  emptyText: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getResponsiveSpacing(8),
  },
  emptySubtext: {
    fontSize: getResponsiveFontSize(14),
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
    paddingHorizontal: getResponsiveSpacing(12),
    paddingVertical: getResponsiveSpacing(4),
    borderRadius: 12,
    marginTop: getResponsiveSpacing(8),
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Selector Modal Styles
  selectorModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  swipeIndicator: {
    width: getResponsiveValue(36, 40, 44),
    height: getResponsiveValue(5, 6, 7),
    backgroundColor: '#C7C7CC',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: getResponsiveSpacing(12),
    marginBottom: getResponsiveSpacing(8),
  },
  selectorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(16),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  selectorModalTitle: {
    fontSize: getResponsiveFontSize(17),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.41,
    color: '#000000',
  },
  selectorModalCloseButton: {
    padding: getResponsiveSpacing(4),
  },
  selectorModalCloseText: {
    fontSize: getResponsiveFontSize(17),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.41,
    color: '#007AFF',
  },
  selectorModalList: {
    paddingVertical: getResponsiveSpacing(8),
  },
  selectorItem: {
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(20),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  selectorItemText: {
    fontSize: getResponsiveFontSize(17),
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.41,
    color: '#000000',
  },
});

export default DeliveryAddressesSettings;
