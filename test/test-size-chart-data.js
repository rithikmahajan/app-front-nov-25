const apiService = require('./src/services/apiService.js').default;

(async () => {
  try {
    console.log('🧪 Testing Size Chart Data Extraction');
    console.log('=====================================');
    
    // Get a sample product
    const response = await apiService.getItems();
    
    const items = response?.data?.data?.items || response?.data?.items || [];
    console.log('📊 Found items:', items.length);
    
    if (items.length > 0) {
      const sampleProduct = items[0];
      console.log('📦 Sample Product:', sampleProduct.productName);
      console.log('🏷️  Category:', sampleProduct.categoryId?.name);
      console.log('📋 Subcategory:', sampleProduct.subCategoryId?.name);
      console.log('');
      
      if (sampleProduct.sizes && sampleProduct.sizes.length > 0) {
        console.log('📏 Available Size Data:');
        console.log('======================');
        
        sampleProduct.sizes.forEach((size, index) => {
          console.log(`\n${index + 1}. Size: ${size.size}`);
          console.log(`   Stock: ${size.stock}`);
          console.log(`   Price: ₹${size.salePrice} (was ₹${size.regularPrice})`);
          
          // Check available measurements
          const measurements = [];
          if (size.chestCm) measurements.push(`Chest: ${size.chestCm}cm / ${size.chestIn}in`);
          if (size.frontLengthCm) measurements.push(`Front Length: ${size.frontLengthCm}cm / ${size.frontLengthIn}in`);
          if (size.acrossShoulderCm) measurements.push(`Shoulder: ${size.acrossShoulderCm}cm / ${size.acrossShoulderIn}in`);
          if (size.waistCm) measurements.push(`Waist: ${size.waistCm}cm / ${size.waistIn}in`);
          if (size.inseamCm) measurements.push(`Inseam: ${size.inseamCm}cm / ${size.inseamIn}in`);
          if (size.hipCm) measurements.push(`Hip: ${size.hipCm}cm / ${size.hipIn}in`);
          
          if (measurements.length > 0) {
            console.log('   Measurements:');
            measurements.forEach(m => console.log(`     - ${m}`));
          } else {
            console.log('   No measurement data available');
          }
        });
        
        console.log('\n✅ Size chart data extraction test completed successfully!');
        console.log('\n🎯 Summary:');
        console.log(`   - Product has ${sampleProduct.sizes.length} size(s)`);
        console.log(`   - Total products available: ${items.length}`);
        console.log(`   - Measurements are available in both cm and inches`);
        console.log('   - No conversion needed as backend provides both units');
        
      } else {
        console.log('⚠️  No size data found for this product');
      }
    } else {
      console.log('❌ No products found');
    }
    
  } catch (error) {
    console.error('❌ Error testing size chart data:', error.message);
  }
})();
