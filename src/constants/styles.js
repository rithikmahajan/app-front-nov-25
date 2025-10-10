// Common style constants for the YORAA app
import { Platform } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSizes = {
  xs: 10,
  sm: 11,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 28,
};

export const FontWeights = {
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: 'bold',
};

export const FontFamilies = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
};

export const Layout = {
  headerHeight: 70,
  tabBarHeight: Platform.OS === 'ios' ? 84 : 64,
  bottomSafeArea: Platform.OS === 'ios' ? 34 : 0,
};

export default {
  Spacing,
  FontSizes,
  FontWeights,
  FontFamilies,
  BorderRadius,
  Shadows,
  Layout,
};
