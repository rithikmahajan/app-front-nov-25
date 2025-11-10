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
import yoraaBackendAPI from '../services/yoraaBackendAPI';
import RightArrowIcon from '../assets/icons/RightArrowIcon';

const SaleScreen = React.memo(({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching categories for Sale screen...');
      
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
        { id: 'men', name: 'Men' },
        { id: 'women', name: 'Women' },
        { id: 'kids', name: 'Kids' },
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

  // Fetch subcategories with sale items for a specific category
  const fetchSubcategoriesWithSaleItems = useCallback(async (categoryId) => {
    try {
      console.log(`Fetching subcategories with sale items for category ID: ${categoryId}`);
      
      // First, get all subcategories for this category
      const subcategoriesResponse = await apiService.getSubcategoriesByCategory(categoryId);
      console.log('Subcategories API Response:', subcategoriesResponse);
      
      if (subcategoriesResponse && subcategoriesResponse.success) {
        const allSubcategories = subcategoriesResponse.data || [];
        
        // Now fetch sale items for this category to determine which subcategories have sale products
        const saleItemsResponse = await yoraaBackendAPI.getSaleItemsByCategory(categoryId);
        console.log('Sale Items API Response:', saleItemsResponse);
        
        if (saleItemsResponse && saleItemsResponse.success) {
          const saleProducts = saleItemsResponse.data?.products || saleItemsResponse.data?.items || saleItemsResponse.data || [];
          
          // Get unique subcategory IDs that have sale items
          const subcategoriesWithSales = new Set();
          saleProducts.forEach(product => {
            if (product.subcategoryId) {
              subcategoriesWithSales.add(product.subcategoryId);
            }
          });
          
          // Filter subcategories to only show those with sale items
          const filteredSubcategories = allSubcategories.filter(sub => 
            subcategoriesWithSales.has(sub._id)
          );
          
          setCurrentSubcategories(filteredSubcategories);
          console.log(`✅ Loaded ${filteredSubcategories.length} subcategories with sale items for category ${categoryId}`);
        } else {
          console.warn('Sale items API failed or returned no data:', saleItemsResponse);
          setCurrentSubcategories([]);
        }
      } else {
        console.warn('Subcategories API failed or returned no data:', subcategoriesResponse);
        setCurrentSubcategories([]);
      }
      
    } catch (err) {
      console.error('Error fetching subcategories with sale items:', err);
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
        fetchSubcategoriesWithSaleItems(selectedCategory.id);
      } else {
        console.log('No category found for activeTab:', activeTab);
        setCurrentSubcategories([]);
      }
    }
  }, [activeTab, categories, fetchSubcategoriesWithSaleItems]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle returning to Sale with specific tab selection
  useEffect(() => {
    if (route?.params?.returnToCategory) {
      const categoryToRestore = route.params.returnToCategory;
      console.log('🔙 Returning to Sale, restoring tab:', categoryToRestore);
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

  // Get display items based on active tab - only subcategories with sale items
  const displayItems = useMemo(() => {
    const items = [];

    console.log('🔍 Computing displayItems with:');
    console.log('- categories.length:', categories.length);
    console.log('- currentSubcategories.length:', currentSubcategories.length);
    console.log('- activeTab:', activeTab);

    // Add current subcategories to display items (only those with sale items)
    if (currentSubcategories.length > 0) {
      console.log('✅ Adding subcategories with sale items:', currentSubcategories.map(s => s.name));
      
      currentSubcategories.forEach(subcategory => {
        items.push({
          id: subcategory._id,
          name: subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1).toLowerCase(),
          imageUrl: subcategory.imageUrl,
          categoryId: subcategory.categoryId
        });
      });

      console.log(`✅ Added ${currentSubcategories.length} subcategories with sale items for ${activeTab}`);
    } else {
      console.log('❌ No subcategories with sale items to show for', activeTab);
    }
    
    console.log('Final displayItems:', items.map(i => ({ id: i.id, name: i.name })));
    return items;
  }, [categories, currentSubcategories, activeTab]);

  // Optimized navigation handlers with useCallback
  const handleNavigateToProduct = useCallback((subcategoryId, subcategoryName) => {
    console.log('Navigating to Sale Products with subcategory:', subcategoryId, subcategoryName);
    console.log('Current active tab:', activeTab);
    
    // Navigate to ProductViewOne but with sale items only
    navigation?.navigate('ProductViewOne', { 
      subcategoryId, 
      subcategoryName: subcategoryName || 'Products',
      categoryName: activeTab,
      saleOnly: true // Add flag to filter sale items only
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
      accessibilityLabel={`${item.name} category - On Sale`}
      accessibilityHint="Navigate to sale product listing"
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to previous screen"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.shopTitle} accessibilityRole="header">Sale</Text>
        <View style={styles.headerSpacer} />
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
              <Text style={styles.loadingText}>Loading sale items...</Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    {error.includes('Network') ? 'Unable to load latest sale items. Showing cached items.' : 'Loading offline sale items.'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryBannerButton} 
                    onPress={fetchData}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading sale items"
                  >
                    <Text style={styles.retryBannerButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {displayItems.length > 0 ? (
                displayItems.map(renderCategoryItem)
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No sale items available for {activeTab}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for amazing deals!
                  </Text>
                </View>
              )}
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
    paddingTop: 16,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000000',
    lineHeight: 33.6,
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#CA3327',
    letterSpacing: -0.168,
    lineHeight: 33.6,
    fontFamily: 'Montserrat-Medium',
  },
  headerSpacer: {
    width: 32,
  },

  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD',
    paddingTop: 12,
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
    marginTop: 6,
  },
  categoriesContainer: {
    paddingTop: 0,
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
    lineHeight: 16.8,
    fontFamily: 'Montserrat-Regular',
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
  
  // Error Banner
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
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#767676',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
});

export default SaleScreen;
