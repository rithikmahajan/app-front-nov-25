import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { apiService } from '../services/apiService';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import RightArrowIcon from '../assets/icons/RightArrowIcon';
import { CategoryCardSkeleton } from '../components/SkeletonLoader';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const HomeScreen = React.memo(({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and subcategories from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching categories from API...');
      
      // Fetch categories only
      const categoriesResponse = await apiService.getCategories();
      
      console.log('Categories API Response:', categoriesResponse);
      
      let finalCategories = [];

      // Process categories if successful
      if (categoriesResponse && categoriesResponse.success) {
        const apiCategories = categoriesResponse.data || [];
        finalCategories = apiCategories.map((category) => ({
          id: category._id,
          name: category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase(),
          isSale: category.name.toLowerCase() === 'sale',
          originalData: category
        }));
      }

      setCategories(finalCategories);
      
      console.log('Data loaded successfully. Categories:', finalCategories.length);
      
      // Set first main category as active tab if no tab is selected
      if (finalCategories.length > 0) {
        setActiveTab(prev => {
          if (!prev) {
            const firstMainCategory = finalCategories.find(category => 
              ['men', 'women', 'kids'].includes(category.name.toLowerCase())
            );
            return firstMainCategory ? firstMainCategory.name : prev;
          }
          return prev;
        });
      }
      
    } catch (err) {
      console.error('Data fetch error:', err);
      const errorMessage = err.userMessage || err.message || 'Failed to fetch data';
        
      setError(errorMessage);
      
      // Minimal fallback data - only categories for tabs
      const fallbackCategories = [
        { id: 'men', name: 'Men', isSale: false },
        { id: 'women', name: 'Women', isSale: false },
        { id: 'kids', name: 'Kids', isSale: false },
      ];
      
      setCategories(fallbackCategories);
      console.log('Using fallback categories only:', fallbackCategories);
      
      // Set first main category as active tab if no tab is selected
      setActiveTab(prev => {
        if (!prev && fallbackCategories.length > 0) {
          const firstMainCategory = fallbackCategories.find(category => 
            ['men', 'women', 'kids'].includes(category.name.toLowerCase())
          );
          return firstMainCategory ? firstMainCategory.name : prev;
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subcategories for a specific category
  const fetchSubcategoriesForCategory = useCallback(async (categoryId) => {
    try {
      setLoadingSubcategories(true);
      console.log(`Fetching subcategories for category ID: ${categoryId}`);
      
      const response = await apiService.getSubcategoriesByCategory(categoryId);
      console.log('Subcategories API Response:', response);
      
      if (response && response.success) {
        const subcategoriesData = response.data || [];
        setCurrentSubcategories(subcategoriesData);
        console.log(`✅ Loaded ${subcategoriesData.length} subcategories for category ${categoryId}`);
      } else {
        console.warn('Subcategories API failed or returned no data:', response);
        setCurrentSubcategories([]);
      }
      
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setCurrentSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  }, []);

  // Effect to fetch subcategories when active tab changes
  useEffect(() => {
    if (activeTab && categories.length > 0) {
      const selectedCategory = categories.find(cat => 
        cat.name.toLowerCase() === activeTab.toLowerCase()
      );
      
      if (selectedCategory && selectedCategory.id) {
        fetchSubcategoriesForCategory(selectedCategory.id);
      } else {
        console.log('No category found for activeTab:', activeTab);
        setCurrentSubcategories([]);
      }
    }
  }, [activeTab, categories, fetchSubcategoriesForCategory]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle returning to Home with specific tab selection
  useEffect(() => {
    // Check if we need to restore a specific tab when returning from product details
    if (route?.params?.returnToCategory) {
      const categoryToRestore = route.params.returnToCategory;
      console.log('🔙 Returning to Home, restoring tab:', categoryToRestore);
      setActiveTab(categoryToRestore);
      
      // Clear the parameter to prevent interference with future navigations
      if (navigation?.setParams) {
        navigation.setParams({ returnToCategory: undefined });
      }
    }
  }, [route?.params?.returnToCategory, navigation]);

  // Memoize tabs array - include API categories for main navigation
  const tabs = useMemo(() => {
    const mainTabs = [];
    
    // Add main category tabs from API (Men, Women, Kids)
    const mainCategories = categories.filter(category => 
      ['men', 'women', 'kids'].includes(category.name.toLowerCase())
    );
    
    mainCategories.forEach(category => {
      const capitalizedName = category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();
      if (!mainTabs.includes(capitalizedName)) {
        mainTabs.push(capitalizedName);
      }
    });
    
    return mainTabs;
  }, [categories]);

  // Get display items based on active tab - always include Sale + subcategories for selected category
  // Main computed property for display items (current subcategories)
  const displayItems = useMemo(() => {
    const items = [];

    console.log('🔍 Computing displayItems with:');
    console.log('- categories.length:', categories.length);
    console.log('- currentSubcategories.length:', currentSubcategories.length);
    console.log('- activeTab:', activeTab);

    // Add current subcategories to display items
    if (currentSubcategories.length > 0) {
      console.log('✅ Adding subcategories:', currentSubcategories.map(s => s.name));
      
      currentSubcategories.forEach(subcategory => {
        items.push({
          id: subcategory._id,
          name: subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1).toLowerCase(),
          isSale: false,
          imageUrl: subcategory.imageUrl,
          categoryId: subcategory.categoryId
        });
      });

      console.log(`✅ Added ${currentSubcategories.length} subcategories for ${activeTab}`);
    } else {
      console.log('❌ No subcategories to show for', activeTab);
      
      // ✅ REMOVED: Test subcategories (unprofessional in production)
      // Show empty state or skeleton loader instead
      // No items will be added - displayItems will be empty array
    }
    
    console.log('Final displayItems:', items.map(i => ({ id: i.id, name: i.name, isSale: i.isSale })));
    return items;
  }, [categories, currentSubcategories, activeTab]);

  // Optimized navigation handlers with useCallback
  const handleNavigateToSearch = useCallback(() => {
    console.log('🔍 Search icon pressed!');
    console.log('Navigation object:', navigation);
    
    if (!navigation) {
      console.error('❌ Navigation object is undefined!');
      return;
    }
    
    if (typeof navigation.navigate !== 'function') {
      console.error('❌ navigation.navigate is not a function!');
      return;
    }
    
    console.log('✅ Navigating to SearchScreen...');
    navigation.navigate('SearchScreen', { previousScreen: 'Home' });
  }, [navigation]);

  const handleNavigateToProduct = useCallback((subcategoryId, subcategoryName) => {
    console.log('Navigating to ProductViewOne with subcategory:', subcategoryId, subcategoryName);
    console.log('Current active tab:', activeTab);
    
    navigation?.navigate('ProductViewOne', { 
      subcategoryId, 
      subcategoryName: subcategoryName || 'Products',
      categoryName: activeTab // Pass the current category tab
    });
  }, [navigation, activeTab]);

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Memoized category renderer with performance optimization
  const renderCategoryItem = useCallback((item) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.categoryItem,
        item.id === displayItems[displayItems.length - 1]?.id && styles.lastCategoryItem
      ]}
      onPress={() => handleNavigateToProduct(item.id, item.name)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} category`}
      accessibilityHint="Navigate to product listing"
    >
      <View style={styles.categoryImageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.categoryImagePlaceholder} />
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>
          {item.name}
        </Text>
      </View>
      <RightArrowIcon size={24} color="#292526" />
    </TouchableOpacity>
  ), [handleNavigateToProduct, displayItems]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shopTitle} accessibilityRole="header">Shop</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNavigateToSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Search"
            accessibilityHint="Navigate to search screen"
          >
            <GlobalSearchIcon size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                index === 0 && styles.firstTab
              ]}
              onPress={() => handleTabPress(tab)}
              accessibilityRole="tab"
              accessibilityLabel={`${tab} tab`}
              accessibilityState={{ selected: activeTab === tab }}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {loading || loadingSubcategories ? (
            <View style={styles.skeletonGrid}>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </View>
          ) : displayItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products available at the moment</Text>
              <Text style={styles.emptyStateSubText}>Please check back later</Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    {error.includes('Network') ? 'Unable to load latest categories. Showing cached categories.' : 'Loading offline categories.'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryBannerButton} 
                    onPress={fetchData}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading categories"
                  >
                    <Text style={styles.retryBannerButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {displayItems.map(renderCategoryItem)}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: hp(isTablet ? 2.5 : 2),
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingTop: hp(isTablet ? 2.5 : 2),
    paddingBottom: hp(isTablet ? 1.8 : 1.5),
    backgroundColor: '#FFFFFF',
  },
  shopTitle: {
    fontSize: fs(isTablet ? 32 : isSmallDevice ? 24 : 28),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.168,
    lineHeight: fs(isTablet ? 38 : isSmallDevice ? 29 : 34),
    fontFamily: 'Montserrat-Medium',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(isTablet ? 6 : 6.1),
  },
  iconButton: {
    padding: wp(isTablet ? 2.1 : 2.1),
    minWidth: wp(isTablet ? 12 : 10.6),
    minHeight: wp(isTablet ? 12 : 10.6),
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD',
    paddingTop: hp(isTablet ? 1.8 : 1.5),
    flexDirection: 'row',
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingBottom: hp(isTablet ? 0.6 : 0.5),
    flex: 1,
  },
  tab: {
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingTop: 0,
    paddingBottom: hp(isTablet ? 2.5 : 2),
    position: 'relative',
  },
  firstTab: {
    paddingLeft: wp(isTablet ? 5.3 : 4.3),
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
  },
  tabText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    color: '#767676',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  activeTabText: {
    color: '#000000',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000000',
  },

  content: {
    flex: 1,
    marginTop: hp(isTablet ? 0.9 : 0.7),
  },
  categoriesContainer: {
    paddingTop: 0,
  },

  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingVertical: hp(isTablet ? 2.5 : 2),
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  lastCategoryItem: {
    borderBottomWidth: 0,
  },
  categoryImageContainer: {
    marginRight: wp(isTablet ? 5.3 : 4.3),
  },
  categoryImage: {
    width: wp(isTablet ? 23 : isSmallDevice ? 18.5 : 18.6),
    height: wp(isTablet ? 23 : isSmallDevice ? 18.5 : 18.6),
    borderRadius: 8,
  },
  categoryImagePlaceholder: {
    width: wp(isTablet ? 23 : isSmallDevice ? 18.5 : 18.6),
    height: wp(isTablet ? 23 : isSmallDevice ? 18.5 : 18.6),
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.14,
    lineHeight: fs(isTablet ? 19 : isSmallDevice ? 16 : 17),
    fontFamily: 'Montserrat-Regular',
  },
  saleText: {
    color: '#CA3327',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 6.2 : 5),
  },
  loadingText: {
    marginTop: hp(isTablet ? 1.8 : 1.5),
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(isTablet ? 2.6 : 2.1),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 6.2 : 5),
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
  },
  errorText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#CA3327',
    textAlign: 'center',
    marginBottom: hp(isTablet ? 2.5 : 2),
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    paddingHorizontal: wp(isTablet ? 6.6 : 5.3),
    paddingVertical: hp(isTablet ? 1.5 : 1.2),
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingVertical: hp(isTablet ? 1.8 : 1.5),
    marginHorizontal: wp(isTablet ? 5.3 : 4.3),
    marginBottom: hp(isTablet ? 1.2 : 1),
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  errorBannerText: {
    flex: 1,
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    color: '#856404',
    fontFamily: 'Montserrat-Regular',
    marginRight: wp(isTablet ? 4 : 3.2),
  },
  retryBannerButton: {
    paddingHorizontal: wp(isTablet ? 4 : 3.2),
    paddingVertical: hp(isTablet ? 0.9 : 0.7),
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  retryBannerButtonText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 9.3 : 7.5),
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
  },
  emptyStateText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: hp(isTablet ? 1.2 : 1),
  },
  emptyStateSubText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 12 : 13),
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
});

export default HomeScreen;
