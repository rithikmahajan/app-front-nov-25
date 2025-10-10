// Centralized product data source
export const PRODUCTS = [
  {
    id: '1',
    name: 'Cosmic Unity 3 N7',
    brand: 'Basketball Shoes', 
    price: 'US$170',
    colors: '1 Colours',
    image: null, // Placeholder for now
    category: 'TOP WEAR',
  },
  {
    id: '2',
    name: 'Nike Benassi N7',
    brand: 'Slides',
    price: 'US$35',
    colors: '1 Colours', 
    image: null, // Placeholder for now
    category: 'TOP WEAR',
  },
  {
    id: '3',
    name: 'Nike Sportswear Club Fleece N7',
    brand: 'Pullover Hoodie',
    price: 'US$60',
    colors: '5 Colours',
    image: null, // Placeholder for now
    category: 'BOTTOM WEAR',
  },
  {
    id: '4',
    name: 'Nike Sportswear Club Fleece N7',
    brand: 'Joggers',
    price: 'US$60',
    colors: '5 Colours',
    image: null, // Placeholder for now
    category: 'BOTTOM WEAR',
  },
];

// Function to get product by ID
export const getProductById = (id) => {
  return PRODUCTS.find(product => product.id === id);
};

// Function to get products by category
export const getProductsByCategory = (category) => {
  return PRODUCTS.filter(product => product.category === category);
};

// Function to get products by IDs (useful for favorites)
export const getProductsByIds = (ids) => {
  return PRODUCTS.filter(product => ids.includes(product.id));
};
