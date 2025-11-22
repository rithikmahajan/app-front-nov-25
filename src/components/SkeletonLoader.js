import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

/**
 * Skeleton Loader Component
 * Creates animated placeholder loading effect (shimmer)
 */
const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style = {}
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Product Card Skeleton
 * Mimics the product card layout
 */
export const ProductCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.productCard, style]}>
      {/* Product Image Skeleton */}
      <SkeletonLoader 
        width="100%" 
        height={200} 
        borderRadius={8}
        style={styles.imageSkeleton}
      />
      
      {/* Product Name Skeleton */}
      <SkeletonLoader 
        width="80%" 
        height={16} 
        borderRadius={4}
        style={styles.titleSkeleton}
      />
      
      {/* Product Description Skeleton */}
      <SkeletonLoader 
        width="60%" 
        height={14} 
        borderRadius={4}
        style={styles.descriptionSkeleton}
      />
      
      {/* Price and Action Buttons Container */}
      <View style={styles.bottomRow}>
        {/* Price Skeleton */}
        <SkeletonLoader 
          width={60} 
          height={20} 
          borderRadius={4}
        />
        
        {/* Action Buttons Skeleton */}
        <View style={styles.actionButtons}>
          <SkeletonLoader 
            width={32} 
            height={32} 
            borderRadius={16}
            style={styles.iconButton}
          />
          <SkeletonLoader 
            width={32} 
            height={32} 
            borderRadius={16}
          />
        </View>
      </View>
    </View>
  );
};

/**
 * Product Grid Skeleton
 * Shows multiple product card skeletons in a grid
 */
export const ProductGridSkeleton = ({ count = 6, columns = 2 }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  
  return (
    <View style={styles.gridContainer}>
      {items.map((index) => (
        <ProductCardSkeleton 
          key={index} 
          style={[
            styles.gridItem,
            { width: `${(100 / columns) - 3}%` }
          ]}
        />
      ))}
    </View>
  );
};

/**
 * List Item Skeleton
 * For list-style product display
 */
export const ListItemSkeleton = () => {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader 
        width={80} 
        height={80} 
        borderRadius={8}
      />
      <View style={styles.listItemContent}>
        <SkeletonLoader 
          width="70%" 
          height={16} 
          borderRadius={4}
          style={styles.listItemTitle}
        />
        <SkeletonLoader 
          width="50%" 
          height={14} 
          borderRadius={4}
          style={styles.listItemSubtitle}
        />
        <SkeletonLoader 
          width="30%" 
          height={18} 
          borderRadius={4}
        />
      </View>
    </View>
  );
};

/**
 * Category Card Skeleton
 * For category listing screens
 */
export const CategoryCardSkeleton = () => {
  return (
    <View style={styles.categoryCard}>
      <SkeletonLoader 
        width="100%" 
        height={120} 
        borderRadius={8}
      />
      <SkeletonLoader 
        width="60%" 
        height={16} 
        borderRadius={4}
        style={styles.categoryTitle}
      />
    </View>
  );
};

/**
 * Filter Options Skeleton
 * For filter screen loading state
 */
export const FilterOptionsSkeleton = () => {
  return (
    <View style={styles.filterOptionsContainer}>
      {/* Filter Section 1 */}
      <View style={styles.filterSection}>
        <SkeletonLoader 
          width={80} 
          height={16} 
          borderRadius={4}
          style={styles.filterTitle}
        />
        <View style={styles.optionsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader 
              key={i}
              width={60} 
              height={40} 
              borderRadius={20}
              style={styles.optionItem}
            />
          ))}
        </View>
      </View>

      {/* Filter Section 2 */}
      <View style={styles.filterSection}>
        <SkeletonLoader 
          width={100} 
          height={16} 
          borderRadius={4}
          style={styles.filterTitle}
        />
        <SkeletonLoader 
          width="100%" 
          height={40} 
          borderRadius={8}
          style={styles.slider}
        />
      </View>

      {/* Filter Section 3 */}
      <View style={styles.filterSection}>
        <SkeletonLoader 
          width={70} 
          height={16} 
          borderRadius={4}
          style={styles.filterTitle}
        />
        <View style={styles.colorGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonLoader 
              key={i}
              width={40} 
              height={40} 
              borderRadius={20}
              style={styles.colorItem}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  
  // Product Card Skeleton Styles
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imageSkeleton: {
    marginBottom: 12,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descriptionSkeleton: {
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    marginRight: 8,
  },
  
  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  gridItem: {
    marginBottom: 16,
  },
  
  // List Item Skeleton Styles
  listItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  
  // Category Card Skeleton Styles
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  categoryTitle: {
    marginTop: 12,
    alignSelf: 'center',
  },
  listItemTitle: {
    marginBottom: 8,
  },
  listItemSubtitle: {
    marginBottom: 8,
  },
  
  // Filter Options Skeleton Styles
  filterOptionsContainer: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionItem: {
    marginRight: 8,
    marginBottom: 8,
  },
  slider: {
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default SkeletonLoader;
