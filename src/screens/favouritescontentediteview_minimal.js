import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { Colors, FontFamilies } from '../constants';
import GlobalBackButton from '../components/GlobalBackButton';

const FavouritesContentEditView = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GlobalBackButton />
        <Text style={styles.title}>Edit Favourites</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>Edit functionality coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamilies.medium,
    color: Colors.text,
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
  },
});

export default FavouritesContentEditView;
