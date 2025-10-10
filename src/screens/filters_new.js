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
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { YoraaAPI } from '../../YoraaAPIClient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FiltersScreen = ({ navigation, route }) => {
  // Dynamic filter states
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 450, max: 29950200 });
  const [maxPrice, setMaxPrice] = useState(29950200);
  const [minPrice, setMinPrice] = useState(450);
  const [selectedSort, setSelectedSort] = useState(null);
  const [sortOptions, setSortOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation for slide up
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
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
      
      // Initialize API client
      const api = new YoraaAPI();
      await api.initialize();
      
      // Fetch active filters from backend
      const response = await api.makeRequest('/api/filters/public/active');
      
      if (response.success) {
        setFilters(response.data.filters || []);
        setSortOptions(response.data.sortOptions || []);
        
        if (response.data.priceSettings) {
          const { minPrice: apiMinPrice, maxPrice: apiMaxPrice } = response.data.priceSettings;
          setMinPrice(apiMinPrice);
          setMaxPrice(apiMaxPrice);
          setPriceRange({ min: apiMinPrice, max: apiMaxPrice });
        }
      }
    } catch (apiError) {
      console.error('Failed to load filters:', apiError);
      setError('Failed to load filters. Using default options.');
      
      // Fallback to default values if API fails
      setFilters([
        {
          _id: 'color',
          key: 'color',
          priority: 1,
          values: [
            { _id: '1', name: 'Black', code: '#000000', priority: 1 },
            { _id: '2', name: 'Beige', code: '#D6CBB7', priority: 2 },
            { _id: '3', name: 'Blue', code: '#759BC1', priority: 3 },
            { _id: '4', name: 'Brown', code: '#805D42', priority: 4 },
            { _id: '5', name: 'Red', code: '#6E051E', priority: 5 },
            { _id: '6', name: 'Yellow', code: '#EEB712', priority: 6 },
            { _id: '7', name: 'Green', code: '#8AA88D', priority: 7 },
          ]
        },
        {
          _id: 'size',
          key: 'size',
          priority: 2,
          values: [
            { _id: '8', name: 'S', priority: 1 },
            { _id: '9', name: 'M', priority: 2 },
            { _id: '10', name: 'L', priority: 3 },
            { _id: '11', name: 'XL', priority: 4 },
            { _id: '12', name: '36', priority: 5 },
            { _id: '13', name: '38', priority: 6 },
            { _id: '14', name: '40', priority: 7 },
            { _id: '15', name: '42', priority: 8 },
            { _id: '16', name: '43', priority: 9 },
            { _id: '17', name: '44', priority: 10 },
            { _id: '18', name: '45', priority: 11 },
          ]
        }
      ]);
      setSortOptions([
        { key: 'price_asc', label: 'ASCENDING PRICE' },
        { key: 'price_desc', label: 'DESCENDING PRICE' },
        { key: 'newest', label: 'NEW' }
      ]);
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
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
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

      // Apply filters through API
      const api = new YoraaAPI();
      await api.initialize();
      
      const params = new URLSearchParams({
        priceMin: priceRange.min.toString(),
        priceMax: priceRange.max.toString(),
        sort: selectedSort || 'newest',
        filters: JSON.stringify(selectedFilters)
      });
      
      const response = await api.makeRequest(`/api/items/filtered?${params}`);
      
      if (response.success) {
        // Pass filtered results back to previous screen
        if (route.params?.onApplyFilters) {
          route.params.onApplyFilters(response.data.items, filterParams);
        }
      }
    } catch (apiError) {
      console.error('Failed to apply filters:', apiError);
      // Still navigate back with filter params for local filtering
      if (route.params?.onApplyFilters) {
        route.params.onApplyFilters([], {
          filters: selectedFilters,
          priceRange,
          sort: selectedSort
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading filters...</Text>
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
              <Text style={styles.errorText}>{error}</Text>
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
          {filters.map(renderFilterSection)}

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
    marginTop: 10,
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#000000',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  dragIndicator: {
    position: 'absolute',
    top: 10,
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  clearButton: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  errorText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterTitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  sliderContainer: {
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#000000',
    width: 20,
    height: 20,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceText: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    color: '#000000',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorOption: {
    alignItems: 'center',
  },
  colorCircle: {
    width: 12,
    height: 11,
    marginRight: 15,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  colorName: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedColorName: {
    fontWeight: '600',
  },
  optionText: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  sortRow: {
    paddingVertical: 8,
  },
  sortText: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    color: '#000000',
    textTransform: 'uppercase',
  },
  selectedSortText: {
    fontWeight: '600',
  },
  viewResultsButton: {
    margin: 20,
    height: 31,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  viewResultsText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default FiltersScreen;
