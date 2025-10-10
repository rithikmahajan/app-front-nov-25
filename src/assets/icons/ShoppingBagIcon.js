import React from 'react';
import { View, StyleSheet } from 'react-native';

const ShoppingBagIcon = ({ size = 16, color = '#14142B' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.bag, { borderColor: color }]} />
    <View style={[styles.handle, { borderColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bag: {
    position: 'absolute',
    width: '79%',
    height: '73%',
    borderWidth: 1,
    borderTopWidth: 0,
    top: '27%',
  },
  handle: {
    position: 'absolute',
    width: '36%',
    height: '37%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    top: '5%',
  },
});

export default ShoppingBagIcon;
