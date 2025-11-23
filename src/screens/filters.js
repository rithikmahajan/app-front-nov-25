import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { yoraaAPI } from '../services/yoraaAPI';
import { FilterOptionsSkeleton } from '../components/SkeletonLoader';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const FiltersScreen = ({ navigation, route }) => {
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 450, max: 29950200 });
  const [maxPrice, setMaxPrice] = useState(29950200);
  const [minPrice, setMinPrice] = useState(450);
  const [selectedSort, setSelectedSort] = useState(null);
  const [sortOptions, setSortOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const slideAnim = useRef(new Animated.Value(hp(100))).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Pan responder for drag to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        panY.setOffset(panY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        panY.flattenOffset();
        
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleGoBack();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Load dynamic filters from API
  const loadFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading dynamic filters from backend...');
      
      // Initialize API client
      await yoraaAPI.initialize();
      
      // ⚠️ BACKEND REQUIREMENT: GET /api/filters/public/active
      // This endpoint should return active filters configured in admin panel
      const response = await yoraaAPI.makeRequest('/api/filters/public/active');
      
      if (response.success && response.data) {
        console.log('✅ Filters loaded successfully:', response.data);
        
        setFilters(response.data.filters || []);
        setSortOptions(response.data.sortOptions || [
          { key: 'price_asc', label: 'ASCENDING PRICE' },
          { key: 'price_desc', label: 'DESCENDING PRICE' },
          { key: 'newest', label: 'NEW' },
          { key: 'popularity', label: 'POPULAR' }
        ]);
        
        if (response.data.priceSettings) {
          const { minPrice: apiMinPrice, maxPrice: apiMaxPrice } = response.data.priceSettings;
          setMinPrice(apiMinPrice);
          setMaxPrice(apiMaxPrice);
          setPriceRange({ min: apiMinPrice, max: apiMaxPrice });
          console.log('💰 Price range set:', { min: apiMinPrice, max: apiMaxPrice });
        } else {
          // Default price range if not provided
          setMinPrice(450);
          setMaxPrice(50000);
          setPriceRange({ min: 450, max: 50000 });
        }
      } else {
        throw new Error('No filter data received from backend');
      }
      
    } catch (apiError) {
      console.error('❌ Failed to load filters from API:', apiError);
      setError(`Backend filters endpoint not implemented yet. Please ask backend team to implement: GET /api/filters/public/active`);
      
      // ⚠️ CRITICAL: Backend needs to implement filter endpoints
      // Show error that filters are not available
      setFilters([]);
      setSortOptions([
        { key: 'price_asc', label: 'ASCENDING PRICE' },
        { key: 'price_desc', label: 'DESCENDING PRICE' },
        { key: 'newest', label: 'NEW' },
        { key: 'popularity', label: 'POPULAR' }
      ]);
      setMinPrice(450);
      setMaxPrice(50000);
      setPriceRange({ min: 450, max: 50000 });
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset pan animation
    panY.setValue(0);
    
    // Load filters on mount
    loadFilters();
    
    // Animate slide up on mount
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, panY]);

  // Toggle filter value selection
  const toggleFilterValue = (filterKey, valueId, valueName) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      if (!updated[filterKey]) {
        updated[filterKey] = [];
      }
      
      const index = updated[filterKey].findIndex(item => item.id === valueId);
      if (index > -1) {
        updated[filterKey].splice(index, 1);
        if (updated[filterKey].length === 0) {
          delete updated[filterKey];
        }
      } else {
        updated[filterKey].push({ id: valueId, name: valueName });
      }
      
      return updated;
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedSort(null);
  };

  const handleGoBack = () => {
    panY.setValue(0);
    
    Animated.timing(slideAnim, {
      toValue: hp(100),
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (route.params?.previousScreen) {
        navigation.navigate(route.params.previousScreen, route.params?.previousParams || {});
      } else if (navigation.goBack) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    });
  };

  const handleApplyFilters = async () => {
    try {
      const filterParams = {
        filters: selectedFilters,
        priceRange,
        sort: selectedSort
      };

      console.log('🔄 Applying filters:', filterParams);

      // Initialize API client
      await yoraaAPI.initialize();
      
      // Build query parameters for filtering
      const params = new URLSearchParams({
        page: '1',
        limit: '50', // Get more results
        sortBy: selectedSort || 'createdAt',
        sortOrder: selectedSort === 'price_asc' ? 'asc' : 'desc'
      });

      // Add price filters
      if (priceRange.min > 450) {
        params.append('priceMin', priceRange.min.toString());
      }
      if (priceRange.max < maxPrice) {
        params.append('priceMax', priceRange.max.toString());
      }

      // Add filter parameters
      Object.keys(selectedFilters).forEach(filterKey => {
        selectedFilters[filterKey].forEach(filterValue => {
          params.append(`filter_${filterKey}`, filterValue.name);
        });
      });

      console.log('📋 Filter params:', params.toString());

      // ⚠️ BACKEND REQUIREMENT: GET /api/items/filtered
      // This endpoint should support filtering by color, size, price range, and sorting
      const response = await yoraaAPI.makeRequest(`/api/items/filtered?${params}`);
      
      if (response.success && response.data) {
        console.log('✅ Filtered items received:', response.data.items?.length || 0);
        
        // Pass filtered results back to previous screen
        if (route.params?.onApplyFilters) {
          route.params.onApplyFilters(response.data.items || [], filterParams);
        }
      } else {
        throw new Error('Failed to get filtered items from backend');
      }
      
    } catch (apiError) {
      console.error('❌ Failed to apply filters via API:', apiError);
      
      // Show error to user that filtering is not available yet
      setError(`Backend filtering endpoint not implemented yet. Please ask backend team to implement: GET /api/items/filtered`);
      
      // Pass empty results and filter params for potential local filtering
      if (route.params?.onApplyFilters) {
        route.params.onApplyFilters([], {
          filters: selectedFilters,
          priceRange,
          sort: selectedSort,
          error: 'Backend filtering not available'
        });
      }
    }
    
    handleGoBack();
  };

  const formatPrice = (price) => {
    if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹ ${(price / 1000).toFixed(0)}K`;
    }
    return `₹ ${price}`;
  };

  const renderFilterSection = (filter) => {
    const isColorFilter = filter.key === 'color';
    
    return (
      <View key={filter._id} style={styles.filterSection}>
        <Text style={styles.filterTitle}>{filter.key.toUpperCase()}</Text>
        {filter.values.map((value) => {
          const isSelected = selectedFilters[filter.key]?.some(item => item.id === value._id);
          
          return (
            <TouchableOpacity
              key={value._id}
              style={[
                styles.filterOption,
                isColorFilter && styles.colorOption
              ]}
              onPress={() => toggleFilterValue(filter.key, value._id, value.name)}
            >
              {isColorFilter && (
                <View 
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: value.code || '#000000' }
                  ]} 
                />
              )}
              <Text style={[
                isColorFilter ? styles.colorName : styles.optionText,
                isSelected && (isColorFilter ? styles.selectedColorName : styles.selectedOptionText)
              ]}>
                {value.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSortOptions = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>SORT BY</Text>
      {sortOptions.map((sortOption) => (
        <TouchableOpacity
          key={sortOption.key}
          style={styles.sortRow}
          onPress={() => setSelectedSort(sortOption.key)}
        >
          <Text style={[
            styles.sortText,
            selectedSort === sortOption.key && styles.selectedSortText
          ]}>
            {sortOption.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.skeletonWrapper}>
          <View style={styles.modalHandle} />
          <View style={styles.filterHeader}>
            <View style={styles.headerPlaceholder} />
          </View>
          <ScrollView style={styles.filterContent}>
            <FilterOptionsSkeleton />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: panY }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearButton}>CLEAR FILTERS</Text>
          </TouchableOpacity>
          <View style={styles.dragIndicator} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>⚠️ Dynamic Filters Not Available</Text>
              <Text style={styles.errorText}>
                The backend filter API endpoints are not implemented yet. 
                Please contact the development team to implement the required endpoints:
              </Text>
              <Text style={styles.errorCode}>• GET /api/filters/public/active</Text>
              <Text style={styles.errorCode}>• GET /api/items/filtered</Text>
              <Text style={styles.errorFooter}>
                See BACKEND_FILTER_REQUIREMENTS.md for full specification.
              </Text>
            </View>
          )}

          {/* Price Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>PRICE</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPrice}
                value={priceRange.max}
                onValueChange={(value) => setPriceRange(prev => ({ ...prev, max: value }))}
                minimumTrackTintColor="#000000"
                maximumTrackTintColor="#E5E5E5"
                thumbStyle={styles.sliderThumb}
              />
              <View style={styles.priceLabels}>
                <Text style={styles.priceText}>{formatPrice(priceRange.min)}</Text>
                <Text style={styles.priceText}>{formatPrice(priceRange.max)}</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Filters */}
          {filters.length > 0 ? (
            filters.map(renderFilterSection)
          ) : (
            !loading && (
              <View style={styles.noFiltersContainer}>
                <Text style={styles.noFiltersTitle}>🔧 Filters Not Available</Text>
                <Text style={styles.noFiltersText}>
                  Dynamic filters will appear here once the backend team implements the filter API endpoints.
                </Text>
              </View>
            )
          )}

          {/* Sort Options */}
          {renderSortOptions()}
        </ScrollView>

        {/* Apply Button */}
        <TouchableOpacity style={styles.viewResultsButton} onPress={handleApplyFilters}>
          <Text style={styles.viewResultsText}>VIEW RESULTS</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: hp(1.2),
    fontFamily: 'Montserrat-Medium',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    color: '#000000',
  },
  skeletonWrapper: {
    backgroundColor: '#FFFFFF',
    height: hp(85),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  headerPlaceholder: {
    height: hp(2.5),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    height: hp(85),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 3 : 2.5),
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: wp(isTablet ? 6 : 5.3),
    top: hp(2.5),
    zIndex: 1,
    padding: hp(0.6),
  },
  backButtonText: {
    fontSize: fs(isTablet ? 20 : 18),
    color: '#000000',
    fontWeight: '500',
  },
  dragIndicator: {
    position: 'absolute',
    top: hp(1.2),
    width: wp(isTablet ? 12 : 10.6),
    height: hp(0.5),
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  clearButton: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    fontWeight: '500',
    color: '#FF0000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    position: 'absolute',
    right: wp(isTablet ? 6 : 5.3),
    top: hp(2.5),
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: wp(isTablet ? 6 : 5.3),
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: wp(isTablet ? 5 : 4),
    marginVertical: hp(isTablet ? 1.5 : 1.2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  errorTitle: {
    color: '#856404',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  errorText: {
    color: '#856404',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    textAlign: 'center',
    marginBottom: hp(1),
    lineHeight: fs(isTablet ? 20 : 16),
  },
  errorCode: {
    color: '#721C24',
    fontSize: fs(isTablet ? 13 : 11),
    fontFamily: 'Courier',
    backgroundColor: '#F8D7DA',
    padding: hp(0.5),
    marginVertical: hp(0.3),
    borderRadius: 3,
  },
  errorFooter: {
    color: '#856404',
    fontSize: fs(isTablet ? 12 : 10),
    textAlign: 'center',
    marginTop: hp(1),
    fontStyle: 'italic',
  },
  noFiltersContainer: {
    backgroundColor: '#F8F9FA',
    padding: wp(isTablet ? 6 : 5.3),
    marginVertical: hp(isTablet ? 1.5 : 1.2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    alignItems: 'center',
  },
  noFiltersTitle: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#495057',
    marginBottom: hp(1),
  },
  noFiltersText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: fs(isTablet ? 20 : 16),
  },
  filterSection: {
    paddingVertical: hp(isTablet ? 3 : 2.5),
  },
  filterTitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: hp(isTablet ? 2.2 : 1.8),
  },
  sliderContainer: {
    paddingHorizontal: wp(isTablet ? 4 : 2.6),
  },
  slider: {
    width: '100%',
    height: hp(isTablet ? 6 : 5),
  },
  sliderThumb: {
    backgroundColor: '#000000',
    width: wp(isTablet ? 6 : 5.3),
    height: wp(isTablet ? 6 : 5.3),
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(isTablet ? 1.5 : 1.2),
  },
  priceText: {
    fontFamily: 'Montserrat-Light',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    color: '#000000',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 1.2 : 1),
  },
  colorOption: {
    alignItems: 'center',
  },
  colorCircle: {
    width: wp(isTablet ? 3.5 : 3.2),
    height: wp(isTablet ? 3.5 : 3.2),
    marginRight: wp(isTablet ? 5 : 4),
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  colorName: {
    fontFamily: 'Montserrat-Light',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedColorName: {
    fontWeight: '600',
  },
  optionText: {
    fontFamily: 'Montserrat-Light',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedOptionText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sortRow: {
    paddingVertical: hp(isTablet ? 1.2 : 1),
  },
  sortText: {
    fontFamily: 'Montserrat-Light',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedSortText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  viewResultsButton: {
    margin: wp(isTablet ? 6 : 5.3),
    height: hp(isTablet ? 5.5 : isSmallDevice ? 4.5 : 3.8),
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  viewResultsText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    fontWeight: '500',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default FiltersScreen;
