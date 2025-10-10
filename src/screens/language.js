import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { FontFamilies } from '../constants';
import GlobalBackButton from '../components/GlobalBackButton';

const Language = ({ navigation, route }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const LANGUAGES = [
    { name: 'English', native: 'English' },
    { name: 'Chinese', native: 'Chinese' },
    { name: 'Spanish', native: 'Spanish' },
    { name: 'German', native: 'German' },
    { name: 'French', native: 'French' },
    { name: 'Russian', native: 'Russian' },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    // Handle language selection logic here
    // You can implement language change logic here
    // For now, just go back to previous screen after a small delay
    setTimeout(() => {
      handleBackPress();
    }, 200);
  };

  const handleBackPress = () => {
    // Check if we have previousScreen in route params
    const previousScreen = route?.params?.previousScreen;
    console.log('Language Screen - Previous Screen:', previousScreen);
    console.log('Language Screen - All route params:', route?.params);
    
    if (previousScreen === 'Rewards') {
      // Navigate back to RewardsScreen specifically
      console.log('Navigating to Rewards screen');
      navigation.navigate('Rewards');
    } else {
      // Default fallback to goBack
      console.log('Using navigation.goBack()');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton}>
          <GlobalBackButton onPress={handleBackPress} />
        </View>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          Choose the language you'd like to browse the app in
        </Text>
      </View>

      {/* Language List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(item)}
            >
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageName}>
                  {item.name}
                </Text>
                <Text style={styles.languageNative}>
                  {item.native}
                </Text>
              </View>
              {selectedLanguage === item.name && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
            {index < LANGUAGES.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 68,
    height: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    flex: 1,
  },
  headerRight: {
    width: 68,
    height: 24,
  },
  subtitleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#000000',
    letterSpacing: -0.072,
    lineHeight: 14.4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 21,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#000000',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    color: '#029CFE',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginLeft: 0,
    marginRight: 0,
  },
});

export default Language;
