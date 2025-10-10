/**
 * 🧪 Quick Backend Connection Test
 * Run this to verify your setup is working
 */

const testConnection = async () => {
  console.log('🚀 React Native Backend Connection Test');
  console.log('=====================================');
  
  // Import the enhanced API service
  try {
    const { ApiService } = require('./src/services/enhancedApiService');
    
    console.log('📡 Testing backend connection...');
    
    // Test the health endpoint
    const healthCheck = await ApiService.healthCheck();
    if (healthCheck.success) {
      console.log('✅ Backend connection successful!');
      console.log('📊 Health status:', healthCheck.data);
    } else {
      console.log('❌ Backend connection failed:', healthCheck.error);
      console.log('🔧 Possible causes:');
      console.log('   • Backend server not running on localhost:8001');
      console.log('   • Wrong IP address in configuration');
      console.log('   • Firewall blocking connections');
    }
    
    // Test categories endpoint
    console.log('\n📂 Testing categories endpoint...');
    const categories = await ApiService.getCategories();
    if (categories.success) {
      console.log(`✅ Categories loaded: ${categories.count} categories found`);
      console.log('📋 Category names:', categories.data.map(cat => cat.name).join(', '));
    } else {
      console.log('❌ Categories failed:', categories.error);
    }
    
  } catch (error) {
    console.error('❌ Test setup error:', error.message);
    console.log('\n📋 Setup checklist:');
    console.log('1. Update IP address in configuration files');
    console.log('2. Start backend server: PORT=8001 npm start');
    console.log('3. Restart Metro bundler with --reset-cache');
  }
};

// Export for use in React Native
module.exports = { testConnection };

// Run test if called directly
if (require.main === module) {
  testConnection().catch(console.error);
}
