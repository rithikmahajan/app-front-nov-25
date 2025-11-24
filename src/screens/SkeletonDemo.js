import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  SkeletonLoader,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ListItemSkeleton,
  CategoryCardSkeleton,
} from '../components/SkeletonLoader';

/**
 * SkeletonDemo Screen
 * Demonstrates all skeleton loader variants
 */
const SkeletonDemo = ({ navigation }) => {
  const [showProductGrid, setShowProductGrid] = useState(true);
  const [showCategoryCards, setShowCategoryCards] = useState(true);
  const [showListItems, setShowListItems] = useState(true);

  // Auto-hide skeletons after 3 seconds to show the effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProductGrid(false);
      setShowCategoryCards(false);
      setShowListItems(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const resetDemo = () => {
    setShowProductGrid(true);
    setShowCategoryCards(true);
    setShowListItems(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Skeleton Loaders Demo</Text>
        <TouchableOpacity onPress={resetDemo}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Grid Skeleton */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Grid Skeleton</Text>
          <Text style={styles.sectionDescription}>
            Used in product listing screens
          </Text>
          {showProductGrid ? (
            <ProductGridSkeleton count={4} columns={2} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                ✓ Content would appear here
              </Text>
            </View>
          )}
        </View>

        {/* Category Card Skeleton */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Card Skeleton</Text>
          <Text style={styles.sectionDescription}>
            Used in category/collection screens
          </Text>
          {showCategoryCards ? (
            <View style={styles.categoryGrid}>
              {[1, 2, 3, 4].map((index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                ✓ Categories would appear here
              </Text>
            </View>
          )}
        </View>

        {/* List Item Skeleton */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>List Item Skeleton</Text>
          <Text style={styles.sectionDescription}>
            Used in list-style product displays
          </Text>
          {showListItems ? (
            <>
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                ✓ List items would appear here
              </Text>
            </View>
          )}
        </View>

        {/* Individual Product Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Single Product Card Skeleton</Text>
          <Text style={styles.sectionDescription}>
            Individual product card placeholder
          </Text>
          <ProductCardSkeleton style={styles.singleCard} />
        </View>

        {/* Custom Skeleton Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Skeleton Components</Text>
          <Text style={styles.sectionDescription}>
            Build your own using the base SkeletonLoader
          </Text>
          
          {/* Custom Example 1: Profile Header */}
          <View style={styles.customExample}>
            <Text style={styles.exampleLabel}>Profile Header</Text>
            <View style={styles.profileSkeleton}>
              <SkeletonLoader width={80} height={80} borderRadius={40} />
              <View style={styles.profileInfo}>
                <SkeletonLoader width="60%" height={20} borderRadius={4} />
                <SkeletonLoader 
                  width="40%" 
                  height={16} 
                  borderRadius={4} 
                  style={styles.marginTop8}
                />
              </View>
            </View>
          </View>

          {/* Custom Example 2: Comment */}
          <View style={styles.customExample}>
            <Text style={styles.exampleLabel}>Comment</Text>
            <View style={styles.commentSkeleton}>
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              <View style={styles.commentContent}>
                <SkeletonLoader width="30%" height={14} borderRadius={4} />
                <SkeletonLoader 
                  width="90%" 
                  height={12} 
                  borderRadius={4}
                  style={styles.marginTop8}
                />
                <SkeletonLoader 
                  width="70%" 
                  height={12} 
                  borderRadius={4}
                  style={styles.marginTop4}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Usage Tips</Text>
          <Text style={styles.infoText}>
            • Use skeleton loaders instead of spinning indicators{'\n'}
            • Match skeleton structure to actual content{'\n'}
            • Show appropriate number of skeleton items{'\n'}
            • Use for initial loading, not for every interaction
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  resetButton: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Montserrat-Medium',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
    fontFamily: 'Montserrat-Regular',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  placeholder: {
    padding: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Montserrat-Medium',
  },
  singleCard: {
    maxWidth: 200,
  },
  customExample: {
    marginBottom: 20,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
  },
  profileSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  commentSkeleton: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  marginTop8: {
    marginTop: 8,
  },
  marginTop4: {
    marginTop: 4,
  },
  infoBox: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  infoText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SkeletonDemo;
