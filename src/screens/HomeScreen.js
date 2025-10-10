import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { apiService } from '../services/apiService';
import { useBag } from '../contexts/BagContext';
import { useFavorites } from '../contexts/FavoritesContext';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import NewIcon from '../assets/icons/NewIcon';
import NewShoppingBagIcon from '../assets/icons/NewShoppingBagIcon';
import RightArrowIcon from '../assets/icons/RightArrowIcon';

const HomeScreen = React.memo(({ navigation }) => {
  const { getBagItemsCount } = useBag();
  const { getFavoritesCount } = useFavorites();
  const [activeTab, setActiveTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
  // Main computed property for display items (Sale button + current subcategories)
  const displayItems = useMemo(() => {
    const items = [];
    
    // Always add the Sale button first
    items.push({
      id: 'sale',
      name: 'Sale',
      isSale: true,
      imageUrl: null
    });

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
      
      // Temporary: Add some test subcategories for debugging
      const selectedCategory = categories.find(cat => 
        cat.name.toLowerCase() === activeTab.toLowerCase()
      );
      
      if (selectedCategory) {
        console.log('🔧 Adding temporary test subcategories for debugging');
        items.push(
          { id: 'test1', name: 'Test Shirt', isSale: false, imageUrl: null },
          { id: 'test2', name: 'Test Pants', isSale: false, imageUrl: null }
        );
      }
    }
    
    console.log('Final displayItems:', items.map(i => ({ id: i.id, name: i.name, isSale: i.isSale })));
    return items;
  }, [categories, currentSubcategories, activeTab]);

  // Optimized navigation handlers with useCallback
  const handleNavigateToSearch = useCallback(() => {
    navigation?.navigate('SearchScreen', { previousScreen: 'Home' });
  }, [navigation]);

  const handleNavigateToFavourites = useCallback(() => {
    const favoritesCount = getFavoritesCount();
    console.log('🔍 HomeScreen: Heart icon tapped, favorites count:', favoritesCount);
    
    if (favoritesCount > 0) {
      // Navigate directly to favourites content if items exist
      console.log('🔍 HomeScreen: Navigating to FavouritesContent');
      navigation?.navigate('FavouritesContent', { previousScreen: 'Home' });
    } else {
      // Navigate to empty favourites screen if no items
      console.log('🔍 HomeScreen: Navigating to favourites (empty state)');
      navigation?.navigate('favourites', { previousScreen: 'Home' });
    }
  }, [navigation, getFavoritesCount]);

    const handleNavigateToBag = useCallback(() => {
    console.log('Attempting to navigate to Bag screen');
    const bagItemsCount = getBagItemsCount();
    
    if (bagItemsCount > 0) {
      // Navigate to bag screen with items
      navigation?.navigate('Bag', { previousScreen: 'Home' });
    } else {
      // Navigate to empty bag screen
      navigation?.navigate('bagemptyscreen', { previousScreen: 'Home' });
    }
  }, [navigation, getBagItemsCount]);

  const handleNavigateToProduct = useCallback((subcategoryId, subcategoryName) => {
    // Check if this is the sale item
    if (subcategoryId === 'sale') {
      console.log('Navigating to Sale screen');
      navigation?.navigate('SaleScreen');
      return;
    }
    
    console.log('Navigating to ProductViewOne with subcategory:', subcategoryId, subcategoryName);
    navigation?.navigate('ProductViewOne', { 
      subcategoryId, 
      subcategoryName: subcategoryName || 'Products'
    });
  }, [navigation]);

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
      accessibilityLabel={`${item.name} category${item.isSale ? ' - On Sale' : ''}`}
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
        <Text style={[styles.categoryName, item.isSale && styles.saleText]}>
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
            accessibilityRole="button"
            accessibilityLabel="Search"
            accessibilityHint="Navigate to search screen"
          >
            <GlobalSearchIcon size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNavigateToFavourites}
            accessibilityRole="button"
            accessibilityLabel="Favourites"
            accessibilityHint="Navigate to favourites"
          >
            <NewIcon size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNavigateToBag}
            accessibilityRole="button"
            accessibilityLabel="Shopping bag"
            accessibilityHint="Navigate to shopping bag"
          >
            <View style={styles.bagIconContainer}>
              <NewShoppingBagIcon size={24} color="#000000" />
              {getBagItemsCount() > 0 && (
                <View style={styles.bagBadge}>
                  <Text style={styles.bagBadgeText}>{getBagItemsCount()}</Text>
                </View>
              )}
            </View>
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>Loading categories...</Text>
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
    paddingTop: 16, // 16px top padding
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16, // Consistent spacing
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.168,
    lineHeight: 33.6, // 1.2 line height as in Figma
    fontFamily: 'Montserrat-Medium',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 23, // Match Figma spacing between icons
  },
  iconButton: {
    padding: 4, // Reduce padding for better visual spacing
  },

  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD',
    paddingTop: 12, // Add top padding to match Figma
    flexDirection: 'row',
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 4,
    flex: 1,
  },
  tab: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    position: 'relative',
  },
  firstTab: {
    paddingLeft: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 16,
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

  // Content Styles
  content: {
    flex: 1,
    marginTop: 6, // Small gap after tabs to match Figma content positioning
  },
  categoriesContainer: {
    paddingTop: 0, // Remove extra top padding
  },

  // Category Item Styles
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  lastCategoryItem: {
    borderBottomWidth: 0,
  },
  categoryImageContainer: {
    marginRight: 16,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  categoryImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.14,
    lineHeight: 16.8, // 1.2 line height as in Figma
    fontFamily: 'Montserrat-Regular',
  },
  saleText: {
    color: '#CA3327',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#CA3327',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  
  // Error Banner (subtle)
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    fontFamily: 'Montserrat-Regular',
    marginRight: 12,
  },
  retryBannerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  retryBannerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  bagIconContainer: {
    position: 'relative',
  },
  bagBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  bagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default HomeScreen;
