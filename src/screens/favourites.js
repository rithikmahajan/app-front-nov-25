import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import HeartIcon from '../assets/icons/HeartIcon';
import { useFavorites } from '../contexts/FavoritesContext';
import FavouritesContent from './favouritescontent';

const FavouritesScreen = React.memo(({ navigation }) => {
  const { favorites } = useFavorites();

  // Check if we should show content or empty state
  // Directly check favorites.size to ensure reactivity
  const hasFavorites = favorites && favorites.size > 0;

  // Optimized handler with useCallback
  const handleAddFavouritesNow = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // If there are favorites, show the content directly
  if (hasFavorites) {
    return <FavouritesContent navigation={navigation} />;
  }

  // Empty state - no favorites
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle} accessibilityRole="header">Favourites</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Heart Icon */}
          <View style={styles.heartIconContainer}>
            <View style={styles.heartIconCircle}>
              <HeartIcon size={35} color="#14142B" filled={false} />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.emptyText}>
              Your <Text style={styles.boldText}>Favourites</Text> is empty.
            </Text>
            <Text style={styles.descriptionText}>
              When you add products, they'll
            </Text>
            <Text style={styles.descriptionText}>
              appear here.
            </Text>
          </View>
        </View>

        {/* Add Favourites Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.addFavouritesButton}
            onPress={handleAddFavouritesNow}
            accessibilityRole="button"
            accessibilityLabel="Add Favourites Now"
            accessibilityHint="Navigate to home to browse products"
          >
            <Text style={styles.buttonText}>Add Favourites Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    width: 68,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.4,
    flex: 1,
  },
  headerRight: {
    width: 68,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heartIconContainer: {
    marginBottom: 20,
  },
  heartIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamilies.montserrat,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.384,
    lineHeight: 24,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: FontFamilies.montserrat,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.384,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  addFavouritesButton: {
    backgroundColor: Colors.black,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: 19.2,
  },
});

export default FavouritesScreen;
