import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import { SearchIcon } from '../assets/icons';
import GlobalBackButton from '../components/GlobalBackButton';

// Flag Icon Component (placeholder)
const FlagIcon = ({ country, size = 24 }) => (
  <View style={[styles.flagIcon, { width: size, height: size }]}>
    <Text style={[styles.flagText, { fontSize: size * 0.6 }]}>🏳️</Text>
  </View>
);

// Blue Checkmark Component
const BlueCheckmark = () => (
  <View style={styles.checkmarkContainer}>
    <View style={styles.checkmark}>
      <Text style={styles.checkmarkText}>✓</Text>
    </View>
  </View>
);

const Region = ({ navigation }) => {
  const countryList = [
    { name: "Afghanistan", code: "AF", selected: true },
    { name: "Albania", code: "AL", selected: false },
    { name: "Brazil", code: "BR", selected: false },
    { name: "Belgium", code: "BE", selected: false },
    { name: "Canada", code: "CA", selected: false },
    { name: "Denmark", code: "DK", selected: false },
    { name: "Ethiopia", code: "ET", selected: false },
    { name: "France", code: "FR", selected: false },
    { name: "Germany", code: "DE", selected: false },
    { name: "India", code: "IN", selected: false },
    { name: "Japan", code: "JP", selected: false },
    { name: "Kenya", code: "KE", selected: false },
    { name: "Mexico", code: "MX", selected: false },
    { name: "Nigeria", code: "NG", selected: false },
    { name: "Norway", code: "NO", selected: false },
    { name: "Poland", code: "PL", selected: false },
    { name: "Qatar", code: "QA", selected: false },
    { name: "Russia", code: "RU", selected: false },
    { name: "Spain", code: "ES", selected: false },
    { name: "Thailand", code: "TH", selected: false },
    { name: "United Kingdom", code: "GB", selected: false },
    { name: "United States", code: "US", selected: false },
    { name: "Vietnam", code: "VN", selected: false },
  ];

  const [selectedCountry, setSelectedCountry] = useState("Afghanistan");
  const [searchText, setSearchText] = useState('');

  const alphabet = [
    "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W",
    "X", "Y", "Z"
  ];

  // Filter countries based on search text
  const filteredCountries = countryList.filter(item => {
    const matchesSearch = searchText === '' || 
      item.name.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.name);
    // Handle country selection - you can add logic here to store selected region
    // Navigate back to rewards tab
    navigation.goBack();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <GlobalBackButton onPress={handleBackPress} />
        </View>
        <Text style={styles.headerTitle}>Region</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Choose a country or region. This affects the country you are billed in, availability of items, price and delivery options.
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={Colors.textSecondary} />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor={Colors.textSecondary}
          keyboardType="default"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Countries list with alphabet index */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.countriesScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredCountries.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.countryItem}
              onPress={() => handleCountrySelect(item)}
            >
              <FlagIcon country={item.code} size={24} />
              <Text style={styles.countryName}>
                {item.name}
              </Text>
              {selectedCountry === item.name && <BlueCheckmark />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Alphabet index */}
        <View style={styles.alphabetContainer}>
          {alphabet.map((letter) => (
            <TouchableOpacity 
              key={letter} 
              style={styles.alphabetButton}
            >
              <Text style={styles.alphabetText}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 68,
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  description: {
    fontFamily: FontFamilies.medium,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 13.2,
    letterSpacing: -0.066,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textPrimary,
    marginHorizontal: 24,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    paddingLeft: 11,
    letterSpacing: -0.4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 24,
  },
  countriesScrollView: {
    flex: 1,
    paddingLeft: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
    marginRight: 24,
  },
  flagIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 2,
    marginRight: 16,
  },
  flagText: {
    fontSize: 16,
  },
  countryName: {
    flex: 1,
    fontFamily: FontFamilies.medium,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  checkmarkContainer: {
    marginLeft: 'auto',
  },
  checkmark: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    color: '#029CFE',
    fontWeight: 'bold',
  },
  alphabetContainer: {
    paddingRight: 16,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  alphabetButton: {
    paddingVertical: 1,
    minHeight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphabetText: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    fontWeight: '500',
    color: '#767676',
    textAlign: 'center',
    lineHeight: 19.32,
  },
});

export default Region;
