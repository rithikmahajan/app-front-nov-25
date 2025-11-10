import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { yoraaAPI } from '../services/yoraaAPI';
import authManager from '../services/authManager';
import { Alert } from 'react-native';
import { validateProductAndSize, validateCart as validateCartUtil } from '../utils/productValidation';

const BagContext = createContext();

export const BagProvider = ({ children }) => {
  // Initialize with empty bag items
  const [bagItems, setBagItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize API and load cart from backend
  useEffect(() => {
    const initializeBag = async () => {
      try {
        await yoraaAPI.initialize();
        if (yoraaAPI.isAuthenticated()) {
          await loadBagFromAPI();
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing bag:', error);
        setInitialized(true);
      }
    };

    initializeBag();

    // Listen for auth state changes and sync cart
    const removeAuthListener = authManager.addAuthStateListener(async (user) => {
      if (user && yoraaAPI.isAuthenticated()) {
        // User signed in - sync local cart to server, then load server cart
        // Get current bag items at the time of auth change
        setBagItems(currentItems => {
          if (currentItems.length > 0) {
            // Sync local cart to server asynchronously
            (async () => {
              try {
                console.log('🔄 Syncing local cart to server...', currentItems.length, 'items');
                for (const item of currentItems) {
                  await yoraaAPI.addToCart(item.id, item.size, item.quantity);
                }
                console.log('✅ Local cart synced to server successfully');
              } catch (error) {
                console.error('❌ Error syncing local cart to server:', error);
              }
            })();
          }
          return currentItems; // Don't modify state here
        });
        
        // Load cart from API after a brief delay to allow sync to complete
        setTimeout(() => loadBagFromAPI(), 500);
      } else if (!user) {
        // User signed out, clear cart
        setBagItems([]);
      }
    });

    return removeAuthListener;
  }, []); // Only run once on mount

  // Load bag items from API
  const loadBagFromAPI = async () => {
    if (!yoraaAPI.isAuthenticated()) {
      return;
    }

    try {
      setLoading(true);
      const response = await yoraaAPI.getCart();
      
      if (response && response.items) {
        // Convert API response to local format
        const cartItems = response.items.map(item => ({
          id: item.itemId || item._id || item.id,
          name: item.itemDetails?.productName || item.productName || item.name || 'Product',
          productName: item.itemDetails?.productName || item.productName || item.name || 'Product',
          title: item.itemDetails?.title || item.title || '',
          price: item.itemDetails?.price || item.price || 0,
          size: item.sizeId || item.size || 'M',
          quantity: item.quantity || 1,
          sku: item.sku || item.itemDetails?.sku || `SKU-${item.itemId || item._id || item.id}`,
          brand: item.itemDetails?.brand || item.brand || 'Brand',
          image: item.itemDetails?.images?.[0]?.url || item.image,
          images: item.itemDetails?.images || item.images || [],
          addedAt: item.addedAt || new Date().toISOString(),
        }));

        // Deduplicate items with same ID and size by combining quantities
        const deduplicatedItems = cartItems.reduce((acc, currentItem) => {
          const existingIndex = acc.findIndex(
            item => item.id === currentItem.id && item.size === currentItem.size
          );
          
          if (existingIndex >= 0) {
            // Item already exists, add quantities
            acc[existingIndex].quantity += currentItem.quantity;
          } else {
            // New item, add to array
            acc.push(currentItem);
          }
          
          return acc;
        }, []);

        setBagItems(deduplicatedItems);
      }
    } catch (error) {
      console.error('Error loading bag from API:', error);
      // Don't show error to user for initial load
    } finally {
      setLoading(false);
    }
  };

  const addToBag = async (product, selectedSize = null) => {
    // Default size if not provided
    const size = selectedSize || product.sizes?.[0]?.size || product.size || 'M';
    
    // Find the SKU for the selected size dynamically
    let sku = null;
    if (product.sizes && Array.isArray(product.sizes)) {
      const sizeVariant = product.sizes.find(sizeObj => sizeObj.size === size);
      sku = sizeVariant?.sku || null;
    }
    
    // Validate product exists in backend before adding
    const productId = product.id || product._id;
    console.log(`🔍 Validating product ${productId} with size ${size} against backend...`);
    
    const validationResult = await validateProductAndSize({
      id: productId,
      sku: sku,
      size: size
    });
    
    if (!validationResult.valid) {
      console.log('❌ Product validation failed, not adding to cart');
      // Error alert is shown by validateProductAndSize
      return;
    }
    
    console.log('✅ Product validation passed, proceeding to add to cart');
    
    console.log(`🛒 Adding to bag - Product ID: ${productId}, Size: ${size}, SKU: ${sku}`);
    console.log('Current bag items:', bagItems.map(item => `${item.id}-${item.size} (qty: ${item.quantity})`));
    
    const existingItemIndex = bagItems.findIndex(
      item => item.id === productId && item.size === size
    );

    if (existingItemIndex >= 0) {
      console.log(`✅ Item already exists at index ${existingItemIndex}, increasing quantity`);
    } else {
      console.log(`🆕 New item, adding to bag`);
    }

    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      const newBagItems = [...bagItems];
      newBagItems[existingItemIndex].quantity += 1;
      setBagItems(newBagItems);

      // Sync with backend only if authenticated
      if (yoraaAPI.isAuthenticated()) {
        try {
          await yoraaAPI.updateCartItem(
            product.id || product._id,
            size,
            newBagItems[existingItemIndex].quantity
          );
          console.log('✅ Item quantity updated in backend cart successfully');
        } catch (error) {
          // Revert optimistic update on error
          const revertedBagItems = [...bagItems];
          setBagItems(revertedBagItems);
          
          const errorMessage = yoraaAPI.handleError(error);
          console.error('Error updating cart item:', errorMessage);
          Alert.alert('Error', 'Failed to update cart. Please try again.');
        }
      } else {
        // For unauthenticated users, keep the update in local cart only
        console.log('📱 Item quantity updated in local cart (guest shopping mode)');
      }
    } else {
      // New item, add to bag
      let price = 0;
      let regularPrice = 0;
      
      // Extract price from sizes array for the selected size
      if (product.sizes && Array.isArray(product.sizes) && size) {
        const selectedSizeVariant = product.sizes.find(s => s.size === size);
        if (selectedSizeVariant) {
          // Use sale price if available, otherwise regular price
          price = selectedSizeVariant.salePrice || selectedSizeVariant.regularPrice || 0;
          regularPrice = selectedSizeVariant.regularPrice || price;
          
          console.log(`💰 Extracted price for size ${size}:`, {
            salePrice: selectedSizeVariant.salePrice,
            regularPrice: selectedSizeVariant.regularPrice,
            finalPrice: price,
            stock: selectedSizeVariant.stock
          });
        } else {
          console.warn(`⚠️ Size ${size} not found in product sizes array`);
        }
      } else {
        // Fallback to product-level price if exists
        price = product.price || product.salePrice || product.regularPrice || 0;
        regularPrice = product.regularPrice || price;
        
        console.warn(`⚠️ No sizes array found, using product-level price: ${price}`);
      }
      
      // Ensure prices are valid numbers
      price = Number(price) || 0;
      regularPrice = Number(regularPrice) || 0;

      const newItem = {
        ...product,
        id: product.id || product._id,
        name: product.name || product.productName || product.title || 'Product',
        productName: product.productName || product.name || 'Product',
        title: product.title || '',
        price: price,              // Current selling price (from salePrice or regularPrice)
        regularPrice: regularPrice, // Original price
        salePrice: price,           // Same as price for consistency
        size: size,
        quantity: 1,
        sku: sku || product.sku || `SKU-${product.id || product._id}`,
        addedAt: new Date().toISOString(),
      };
      
      // Optimistic update
      setBagItems(prevItems => [...prevItems, newItem]);

      // Sync with backend only if authenticated and SKU is available
      if (yoraaAPI.isAuthenticated()) {
        if (!sku) {
          console.warn('⚠️ No SKU found for product, skipping backend sync:', {
            productId: product.id || product._id,
            size,
            productSizes: product.sizes
          });
        } else {
          try {
            console.log('🔍 Adding to cart with SKU:', { 
              productId: product.id || product._id, 
              size, 
              sku,
              productSizes: product.sizes 
            });
            
            await yoraaAPI.addToCart(product.id || product._id, size, 1, sku);
            console.log('✅ Item synced to backend cart successfully');
          } catch (error) {
            // Revert optimistic update on error
            setBagItems(prevItems => prevItems.filter(item => 
              !(item.id === newItem.id && item.size === newItem.size)
            ));
            
            const errorMessage = yoraaAPI.handleError(error);
            console.error('Error adding to cart:', errorMessage);
            console.error('Error details:', { 
              productId: product.id || product._id, 
              size, 
              productSizes: product.sizes 
            });
            Alert.alert('Error', `Failed to add item to cart: ${errorMessage}`);
          }
        }
      } else {
        // For unauthenticated users, keep the item in local cart only
        console.log('📱 Item added to local cart (guest shopping mode)');
        // Show success message for guest users
        Alert.alert('Added to Cart', `${product.productName || product.name || 'Item'} has been added to your cart.`);
      }
    }
  };

  const removeFromBag = async (productId, size) => {
    // Optimistic update
    setBagItems(prevItems => 
      prevItems.filter(item => !(item.id === productId && item.size === size))
    );

    // Sync with backend
    if (yoraaAPI.isAuthenticated()) {
      try {
        await yoraaAPI.removeFromCart(productId, size);
      } catch (error) {
        // For removal errors, we might want to reload the cart to ensure consistency
        console.error('Error removing from cart:', yoraaAPI.handleError(error));
        await loadBagFromAPI();
      }
    }
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromBag(productId, size);
      return;
    }

    // Optimistic update
    setBagItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Sync with backend
    if (yoraaAPI.isAuthenticated()) {
      try {
        await yoraaAPI.updateCartItem(productId, size, newQuantity);
      } catch (error) {
        console.error('Error updating cart quantity:', yoraaAPI.handleError(error));
        // Reload from API to ensure consistency
        await loadBagFromAPI();
      }
    }
  };

  const updateSize = (productId, oldSize, newSize) => {
    setBagItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.size === oldSize
          ? { ...item, size: newSize }
          : item
      )
    );
  };

  const clearBag = async () => {
    // Optimistic update
    setBagItems([]);

    // Sync with backend
    if (yoraaAPI.isAuthenticated()) {
      try {
        await yoraaAPI.clearCart();
        console.log('✅ Cart cleared successfully from backend');
      } catch (error) {
        const errorMessage = yoraaAPI.handleError(error);
        console.error('❌ Error clearing cart:', errorMessage);
        
        // Check error type and handle appropriately
        const statusCode = error.status || error.response?.status || 0;
        
        if (statusCode >= 500) {
          console.log('🔄 Server error during cart clear - keeping local cart cleared');
          console.log('ℹ️  The server is experiencing issues, but your cart has been cleared locally as requested');
          // Don't reload from API on server errors to avoid user confusion
          // The local cart has been cleared optimistically, which is the user's intent
        } else if (statusCode >= 400) {
          // For client errors (4xx), reload from API to ensure consistency
          console.log('🔄 Client error during cart clear - reloading from API to ensure consistency');
          await loadBagFromAPI();
        } else {
          // For other errors, assume server issue and keep cart cleared
          console.log('🔄 Network/unknown error during cart clear - keeping local cart cleared');
        }
      }
    } else {
      console.log('📱 Cart cleared locally (guest mode)');
    }
  };

  const getBagCount = () => {
    return bagItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getBagItemsCount = () => {
    return bagItems.length;
  };

  const getTotalPrice = () => {
    return bagItems.reduce((total, item) => {
      let price = 0;
      
      // Handle nested size structure - prices are in the sizes array
      if (item.sizes && Array.isArray(item.sizes) && item.size) {
        // Find the selected size variant
        const selectedSizeVariant = item.sizes.find(sizeObj => sizeObj.size === item.size);
        
        if (selectedSizeVariant) {
          // Use sale price first, then regular price
          if (selectedSizeVariant.salePrice && Number(selectedSizeVariant.salePrice) > 0) {
            price = Number(selectedSizeVariant.salePrice);
          } else if (selectedSizeVariant.regularPrice && Number(selectedSizeVariant.regularPrice) > 0) {
            price = Number(selectedSizeVariant.regularPrice);
          }
        }
      }
      // Fallback to direct item properties (for backward compatibility)
      else {
        // Check for sale price first (discounted price)
        if (item.salePrice && Number(item.salePrice) > 0) {
          price = Number(item.salePrice);
        } 
        // Check for regular price
        else if (item.regularPrice && Number(item.regularPrice) > 0) {
          price = Number(item.regularPrice);
        }
        // Fallback to item.price
        else if (item.price) {
          // Handle different price formats: "$10.00", "US$10.00", "10.00", etc.
          if (typeof item.price === 'string') {
            // Remove currency symbols and convert to number
            price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
          } else {
            price = Number(item.price);
          }
        }
      }
      
      // If price is still not a valid number, default to 0
      if (isNaN(price) || price <= 0) {
        console.warn(`⚠️ Invalid price for item ${item.id || item._id}: Could not find valid price in sizes array or item properties`);
        console.log('📊 Item structure debug:', {
          itemId: item.id || item._id,
          selectedSize: item.size,
          hasSizesArray: !!(item.sizes && Array.isArray(item.sizes)),
          sizesCount: item.sizes ? item.sizes.length : 0,
          directPrice: item.price,
          directSalePrice: item.salePrice,
          directRegularPrice: item.regularPrice
        });
        price = 0;
      }
      
      return total + (price * item.quantity);
    }, 0);
  };

  const isInBag = (productId, size) => {
    return bagItems.some(item => item.id === productId && item.size === size);
  };

  // Safety function to remove duplicates and ensure data integrity
  const deduplicateBagItems = useCallback(() => {
    const deduplicatedItems = bagItems.reduce((acc, currentItem) => {
      const existingIndex = acc.findIndex(
        item => item.id === currentItem.id && item.size === currentItem.size
      );
      
      if (existingIndex >= 0) {
        console.warn(`🚨 Found duplicate item: ${currentItem.id}-${currentItem.size}, merging quantities`);
        // Item already exists, add quantities
        acc[existingIndex].quantity += currentItem.quantity;
      } else {
        // New item, add to array
        acc.push(currentItem);
      }
      
      return acc;
    }, []);

    if (deduplicatedItems.length !== bagItems.length) {
      console.log(`🔧 Removed ${bagItems.length - deduplicatedItems.length} duplicate items from bag`);
      setBagItems(deduplicatedItems);
    }
  }, [bagItems]);

  // Auto-deduplicate when bagItems change
  useEffect(() => {
    const duplicates = bagItems.filter((item, index, arr) => 
      arr.findIndex(other => other.id === item.id && other.size === item.size) !== index
    );
    
    if (duplicates.length > 0) {
      console.warn(`🚨 Detected ${duplicates.length} duplicate items, auto-deduplicating...`);
      deduplicateBagItems();
    }
  }, [bagItems, deduplicateBagItems]);

  // Validate cart items against backend
  const validateAndCleanCart = useCallback(async () => {
    console.log('🔍 Validating cart items against backend...');
    
    if (bagItems.length === 0) {
      return { valid: true, removedItems: [] };
    }
    
    // Use the comprehensive validateCart utility
    const validationResult = await validateCartUtil(bagItems);
    
    if (!validationResult.valid) {
      console.log(`🗑️ Found ${validationResult.invalidItems.length} invalid items in cart`);
      
      // Remove invalid items from local cart
      setBagItems(validationResult.validItems);
      
      // Also remove from backend if authenticated
      if (yoraaAPI.isAuthenticated()) {
        for (const item of validationResult.invalidItems) {
          try {
            await yoraaAPI.removeFromCart(item.id || item._id, item.size);
            console.log(`✅ Removed invalid item ${item.id || item._id} from backend`);
          } catch (error) {
            console.error('Error removing invalid item from backend:', error);
          }
        }
      }
      
      return { 
        valid: false, 
        removedItems: validationResult.invalidItems,
        message: validationResult.message
      };
    }
    
    console.log('✅ All cart items validated successfully');
    return { valid: true, removedItems: [] };
  }, [bagItems]);

  const value = {
    bagItems,
    addToBag,
    removeFromBag,
    updateQuantity,
    updateSize,
    clearBag,
    getBagCount,
    getBagItemsCount,
    getTotalPrice,
    isInBag,
    loadBagFromAPI,
    deduplicateBagItems,
    validateAndCleanCart,
    loading,
    initialized,
  };

  return (
    <BagContext.Provider value={value}>
      {children}
    </BagContext.Provider>
  );
};

export const useBag = () => {
  const context = useContext(BagContext);
  if (!context) {
    throw new Error('useBag must be used within a BagProvider');
  }
  return context;
};
