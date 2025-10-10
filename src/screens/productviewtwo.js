import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import { GlobalCartIcon } from '../assets/icons';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import { useProductActions } from '../hooks/useProductActions';
import { AnimatedHeartIcon } from '../components';

const ProductViewTwo = ({ navigation }) => {
  const { handleToggleFavorite, handleAddToCart, checkIsFavorite } = useProductActions(navigation);
  const [likedProducts, setLikedProducts] = useState(new Set(['3', '4'])); // Some products pre-liked

  const handleFilterPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Filters', {
        previousScreen: 'ProductViewTwo',
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from ProductViewTwo:', filterParams);
          // Handle filtered results here if needed
        }
      });
    }
  };

  const handleSearchPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SearchScreen', { previousScreen: 'ProductViewTwo' });
    }
  };

  // Mock product data for the 3-column grid layout
  const products = [
    {
      id: '1',
      image: 'chair_jeans1',
    },
    {
      id: '2',
      image: 'orange_jeans',
    },
    {
      id: '3',
      image: 'black_pants1',
    },
    {
      id: '4',
      image: 'chair_jeans2',
    },
    {
      id: '5',
      image: 'orange_jeans2',
    },
    {
      id: '6',
      image: 'black_pants2',
    },
    {
      id: '7',
      image: 'chair_jeans3',
    },
    {
      id: '8',
      image: 'orange_jeans3',
    },
    {
      id: '9',
      image: 'black_pants3',
    },
  ];

  const toggleLike = (productId) => {
    const newLikedProducts = new Set(likedProducts);
    if (newLikedProducts.has(productId)) {
      newLikedProducts.delete(productId);
    } else {
      newLikedProducts.add(productId);
    }
    setLikedProducts(newLikedProducts);
  };

  const BackIcon = () => (
    <Svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <Path d="M8.5 16L1 8.5L8.5 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const GridIcon = () => (
    <View style={styles.gridIcon}>
      <View style={[styles.gridSquare, styles.topLeft]} />
      <View style={[styles.gridSquare, styles.topRight]} />
      <View style={[styles.gridSquare, styles.bottomLeft]} />
      <View style={[styles.gridSquare, styles.bottomRight]} />
    </View>
  );

  // Removed custom FilterIcon, using imported SVG FilterIcon instead

  const renderProduct = (product) => {
    const isLiked = likedProducts.has(product.id);
    
    return (
      <View key={product.id} style={styles.productContainer}>
        {/* Product Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => navigation.navigate('ProductDetailsMain', { product, previousScreen: 'ProductViewTwo' })}
        >
          <View style={styles.imagePlaceholder} />
          
          {/* Animated Heart Icon */}
          <AnimatedHeartIcon
            isFavorite={checkIsFavorite(product)}
            onPress={async () => {
              await handleToggleFavorite(product);
            }}
            size={21}
            containerStyle={styles.heartButton}
            style={styles.heartIconContainer}
            filledColor="#FF0000"
            unfilledColor="#000000"
          />

          {/* Shopping Bag Icon */}
          <TouchableOpacity 
            style={styles.bagButton}
            onPress={async () => {
              await handleAddToCart(product, { showAlert: true });
            }}
          >
            <View style={styles.bagIconContainer}>
              <GlobalCartIcon size={16} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const handleTabChange = (tabName) => {
    if (navigation) {
      navigation.navigate(tabName);
    }
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.navigate('ProductViewOne');
    }
  };

  const handleGridPress = () => {
    if (navigation) {
      navigation.navigate('ProductViewThree');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Control Bar / Header */}
      <View style={styles.controlBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}></Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
            <GlobalSearchIcon size={20} color="#000000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleGridPress}>
            <GridIcon />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid - 3 Columns */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {products.map((product) => renderProduct(product))}
        </View>
      </ScrollView>

      {/* Bottom Navigation - Absolute Position */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigationBar 
          activeTab="Home" 
          onTabChange={handleTabChange}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Control Bar / Header Styles
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    height: 90,
  },
  headerLeft: {
    width: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // Add space for bottom navigation
  },

  // Product Styles
  productContainer: {
    width: '33%', // 3 columns layout
    marginBottom: 2,
    paddingHorizontal: 1,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 0,
  },

  // Heart Button
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIconContainer: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shopping Bag Button
  bagButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bagIconContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icons
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 8,
    height: 15,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
  },

  gridIcon: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  gridSquare: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  topLeft: {
    top: 1,
    left: 1,
  },
  topRight: {
    top: 1,
    right: 1,
  },
  bottomLeft: {
    bottom: 1,
    left: 1,
  },
  bottomRight: {
    bottom: 1,
    right: 1,
  },

  filterIcon: {
    width: 26,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot1: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 2,
    top: 3,
  },
  filterLine1: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 6,
    top: 4.5,
  },
  filterDot2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 10,
    top: 8.5,
  },
  filterLine2: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 2,
    top: 10,
  },
  filterDot3: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 15,
    top: 14,
  },
  filterLine3: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 2,
    top: 15.5,
  },

  heartIcon: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartOutline: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    position: 'relative',
  },
  heartFilled: {
    width: 8,
    height: 8,
    backgroundColor: '#FF0000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },

  bagIcon: {
    width: 10,
    height: 10,
    position: 'relative',
  },
  bagBody: {
    position: 'absolute',
    bottom: 0,
    left: 1,
    right: 1,
    height: 7,
    borderWidth: 1,
    borderColor: '#14142B',
    borderRadius: 1,
  },
  bagHandle: {
    position: 'absolute',
    top: 1,
    left: 3,
    right: 3,
    height: 3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#14142B',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  
  // Bottom Navigation Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default ProductViewTwo;
