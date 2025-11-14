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
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
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

// Country codes data - Comprehensive list matching login screen
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
  { code: '+297', country: 'Aruba', flag: '🇦�' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦�' },
  { code: '+1242', country: 'Bahamas', flag: '🇧�🇸' },
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
  { code: '+359', country: 'Bulgaria', flag: '��🇬' },
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
  { code: '+30', country: 'Greece', flag: '��🇷' },
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
  { code: '+52', country: 'Mexico', flag: '🇲�' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'Moldova', flag: '🇲�🇩' },
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
  { code: '+974', country: 'Qatar', flag: '🇶�' },
  { code: '+262', country: 'Reunion', flag: '🇷🇪' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+1869', country: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1758', country: 'Saint Lucia', flag: '🇱�🇨' },
  { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+1784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'Sao Tome and Principe', flag: '�🇹' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸�🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '��' },
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
  { code: '+690', country: 'Tokelau', flag: '��🇰' },
  { code: '+676', country: 'Tonga', flag: '�🇴' },
  { code: '+1868', country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹�🇷' },
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

// Validation functions
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    email: '',
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
        email: finalEditingAddress.email || '',
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
        email: '',
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
    
    // Email validation (optional field)
    if (formData.email && formData.email.trim().length > 0) {
      if (!validateEmail(formData.email)) {
        newErrors.email = showMessages ? 'Please enter a valid email address' : true;
      }
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
        ...(formData.email && { email: formData.email }), // Only include if not empty
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
      case 'email':
        // Email is optional, only validate if not empty
        if (value && value.trim().length > 0) {
          if (!validateEmail(value)) {
            fieldErrors[field] = true;
          } else {
            isValid = true;
          }
        } else {
          // Empty email is valid (optional field)
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
                    <ChevronDownIcon width={18} height={18} color="#848688" />
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
                errors.email && styles.inputError,
                validFields.email && !errors.email && styles.inputValid
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  onBlur={() => handleInputBlur('email')}
                  placeholderTextColor={Colors.gray600}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && validationState === 'full' && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
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
                      <ChevronDownIcon width={18} height={18} color="#848688" />
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

      {/* State Dropdown Modal */}
      <Modal
        visible={showStateDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStateDropdown(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable}
            onPress={() => setShowStateDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.stateModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateDropdown(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={indianStates}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    formData.state === item && styles.stateItemSelected
                  ]}
                  onPress={() => {
                    handleInputChange('state', item);
                    setShowStateDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.stateItemText,
                    formData.state === item && styles.stateItemTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

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
                  <Text style={styles.phonePrefixText}>
                    {item.flag} {item.country} ({item.code})
                  </Text>
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
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    letterSpacing: -0.5,
    flex: 1,
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
    borderColor: '#979797',
    borderRadius: 12,
    paddingHorizontal: 19,
    height: 47,
    backgroundColor: Colors.white,
    justifyContent: 'center',
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
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
    padding: 0,
    height: '100%',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  stateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateValue: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
    flex: 1,
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
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.35,
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
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
    padding: 0,
    height: '100%',
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
    backgroundColor: '#000000',
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
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  errorText: {
    fontSize: 12,
    color: '#CA3327',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '400',
  },
  // State Modal Styles
  stateModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    paddingBottom: 34,
  },
  stateItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stateItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  stateItemText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
  },
  stateItemTextSelected: {
    fontFamily: 'Montserrat-Medium',
    color: '#007AFF',
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
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    letterSpacing: -0.5,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Montserrat-Medium',
  },
  phonePrefixItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  phonePrefixItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  phonePrefixText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
  },
  addressTypeContainer: {
    marginTop: 8,
  },
  addressTypeLabel: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 12,
    letterSpacing: -0.35,
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
    borderColor: '#979797',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addressTypeOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#F8F9FA',
  },
  addressTypeText: {
    fontSize: 14,
    color: '#979797',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.35,
  },
  addressTypeTextSelected: {
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
});

export default AddAddressModal;
