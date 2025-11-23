# Skeleton Loader Implementation Guide

## Overview
Skeleton loaders (also called skeleton screens or shimmer effects) have been implemented throughout the app to provide better user experience during data loading. This is a common pattern used by major applications like Facebook, LinkedIn, and YouTube.

## What are Skeleton Loaders?
Skeleton loaders are placeholder UI elements that mimic the structure of the actual content while data is being fetched. They:
- Improve perceived performance
- Reduce user frustration during loading
- Provide visual feedback that content is coming
- Look more professional than simple spinning indicators

## Available Components

### 1. SkeletonLoader (Base Component)
The foundation component that creates animated shimmer effect.

```javascript
import SkeletonLoader from '../components/SkeletonLoader';

<SkeletonLoader 
  width="100%" 
  height={20} 
  borderRadius={4}
/>
```

**Props:**
- `width`: Width of skeleton (string or number, default: '100%')
- `height`: Height of skeleton (number, default: 20)
- `borderRadius`: Border radius (number, default: 4)
- `style`: Additional custom styles

### 2. ProductCardSkeleton
Mimics a product card layout with image, title, description, and action buttons.

```javascript
import { ProductCardSkeleton } from '../components/SkeletonLoader';

<ProductCardSkeleton />
```

### 3. ProductGridSkeleton
Displays multiple product card skeletons in a grid layout.

```javascript
import { ProductGridSkeleton } from '../components/SkeletonLoader';

<ProductGridSkeleton count={6} columns={2} />
```

**Props:**
- `count`: Number of skeleton cards to show (default: 6)
- `columns`: Number of columns in grid (default: 2)

### 4. ListItemSkeleton
For list-style product displays (horizontal layout).

```javascript
import { ListItemSkeleton } from '../components/SkeletonLoader';

<ListItemSkeleton />
```

### 5. CategoryCardSkeleton
For category listing screens.

```javascript
import { CategoryCardSkeleton } from '../components/SkeletonLoader';

<CategoryCardSkeleton />
```

## Implementation Examples

### Example 1: Product Listing Screen

**Before (using ActivityIndicator):**
```javascript
{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#000000" />
    <Text style={styles.loadingText}>Loading products...</Text>
  </View>
) : (
  <View style={styles.productsGrid}>
    {products.map((product) => renderProduct(product))}
  </View>
)}
```

**After (using Skeleton Loader):**
```javascript
import { ProductGridSkeleton } from '../components/SkeletonLoader';

{loading ? (
  <ProductGridSkeleton count={6} columns={2} />
) : (
  <View style={styles.productsGrid}>
    {products.map((product) => renderProduct(product))}
  </View>
)}
```

### Example 2: Category Screen

**Before:**
```javascript
{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#000000" />
    <Text style={styles.loadingText}>Loading categories...</Text>
  </View>
) : (
  displayItems.map(renderCategoryItem)
)}
```

**After:**
```javascript
import { CategoryCardSkeleton } from '../components/SkeletonLoader';

{loading ? (
  <View style={styles.skeletonGrid}>
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <CategoryCardSkeleton key={index} />
    ))}
  </View>
) : (
  displayItems.map(renderCategoryItem)
)}
```

### Example 3: Custom Skeleton Layout

```javascript
import SkeletonLoader from '../components/SkeletonLoader';

const CustomSkeleton = () => (
  <View style={styles.container}>
    <SkeletonLoader width={80} height={80} borderRadius={8} />
    <View style={styles.details}>
      <SkeletonLoader width="90%" height={16} borderRadius={4} />
      <SkeletonLoader width="70%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonLoader width="50%" height={20} borderRadius={4} style={{ marginTop: 12 }} />
    </View>
  </View>
);
```

## Screens Updated

The following screens have been updated to use skeleton loaders:

1. **ProductViewTwo** (`src/screens/productviewtwo.js`)
   - Uses `ProductGridSkeleton` for product loading

2. **HomeScreen** (`src/screens/HomeScreen.js`)
   - Uses `CategoryCardSkeleton` for category loading

3. **CollectionScreen** (`src/screens/CollectionScreen.js`)
   - Uses `ProductGridSkeleton` for item loading

## Best Practices

### 1. Match Skeleton to Content
The skeleton should closely match the structure of the actual content:
```javascript
// If your product card looks like this:
<View>
  <Image /> // 200px height
  <Text />  // Product name
  <Text />  // Description
  <View>    // Price + buttons
</View>

// Your skeleton should mirror this structure
<ProductCardSkeleton />
```

### 2. Show Appropriate Number of Skeletons
Show the same number of skeleton items as you expect to load:
```javascript
// If you typically show 6 products in a grid
<ProductGridSkeleton count={6} columns={2} />

// If you show 4 categories
{[1, 2, 3, 4].map((i) => <CategoryCardSkeleton key={i} />)}
```

### 3. Maintain Layout Consistency
Ensure skeleton dimensions match your actual content:
```javascript
// If your image is 150px tall
<SkeletonLoader width="100%" height={150} borderRadius={8} />
```

### 4. Don't Overuse
Use skeletons for initial loading, not for every interaction:
```javascript
// ✅ Good - First time loading
{loading && !products.length && <ProductGridSkeleton />}

// ❌ Bad - Refresh or pagination
{refreshing && <ProductGridSkeleton />}  // Use RefreshControl instead
```

## Customization

### Change Animation Speed
Edit the duration in `SkeletonLoader.js`:
```javascript
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 1000,  // Change this value (in milliseconds)
  easing: Easing.inOut(Easing.ease),
  useNativeDriver: true,
}),
```

### Change Colors
Edit the skeleton backgroundColor in `SkeletonLoader.js`:
```javascript
skeleton: {
  backgroundColor: '#E1E9EE',  // Change this color
},
```

### Add New Skeleton Types
Create new skeleton components following the existing pattern:
```javascript
export const YourCustomSkeleton = () => {
  return (
    <View style={styles.yourContainer}>
      <SkeletonLoader width="100%" height={100} borderRadius={8} />
      <SkeletonLoader width="80%" height={16} borderRadius={4} />
    </View>
  );
};
```

## Performance Considerations

1. **Use Native Driver**: All animations use `useNativeDriver: true` for better performance
2. **Cleanup**: Animations are properly cleaned up in `useEffect` return
3. **Reusable**: Components are memoized to prevent unnecessary re-renders

## Troubleshooting

### Skeleton not appearing
- Check that the component is imported correctly
- Verify the loading state is true when expected
- Check console for any errors

### Animation not smooth
- Ensure `useNativeDriver: true` is set
- Check device performance (older devices may have reduced animation)
- Verify no other heavy operations during loading

### Layout issues
- Match skeleton dimensions to actual content
- Use flexbox properties consistently
- Test on different screen sizes

## Future Enhancements

Potential improvements:
- Add gradient shimmer effect
- Create more skeleton variants (list, grid, card)
- Add dark mode support
- Create skeleton for specific screens (Profile, Cart, etc.)

## References

- React Native Animated API: https://reactnative.dev/docs/animated
- Design patterns: Facebook, LinkedIn skeleton screens
- Performance: https://reactnative.dev/docs/performance
