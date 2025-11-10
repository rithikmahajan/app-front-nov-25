/**
 * Backend Shiprocket Service - Complete Implementation
 * This should be integrated into your Node.js backend
 * 
 * CREDENTIALS TO USE:
 * - For API operations: support@yoraa.in (API User with permissions)
 * - For dashboard login: contact@yoraa.in (Main account)
 */

const axios = require('axios');

// Shiprocket Configuration
const SHIPROCKET_CONFIG = {
  // Use API User credentials (has order management permissions)
  API_USER_EMAIL: 'support@yoraa.in',
  API_USER_PASSWORD: 'R@0621thik',
  
  // Main account credentials (for reference, use API user for operations)
  MAIN_ACCOUNT_EMAIL: 'contact@yoraa.in',
  MAIN_ACCOUNT_PASSWORD: 'R@2727thik',
  
  BASE_URL: 'https://apiv2.shiprocket.in/v1/external',
  COMPANY_ID: '5783639'
};

// Token cache to avoid repeated authentication
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket authentication token
 * Uses API User credentials which have order management permissions
 */
async function getShiprocketToken() {
  try {
    // Return cached token if still valid (9 hours - 1 hour buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('✅ Using cached Shiprocket token');
      return cachedToken;
    }

    console.log('🔐 Authenticating with Shiprocket API...');
    
    // Use API User credentials (support@yoraa.in) for order operations
    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/auth/login`,
      {
        email: SHIPROCKET_CONFIG.API_USER_EMAIL,
        password: SHIPROCKET_CONFIG.API_USER_PASSWORD
      },
      {
        headers: { 
          'Content-Type': 'application/json' 
        }
      }
    );

    if (!response.data || !response.data.token) {
      throw new Error('Failed to get Shiprocket token - Invalid response');
    }

    // Cache token for 9 hours (tokens expire in 10 hours)
    cachedToken = response.data.token;
    tokenExpiry = Date.now() + (9 * 60 * 60 * 1000);

    console.log('✅ Shiprocket authentication successful');
    console.log(`📝 Token valid until: ${new Date(tokenExpiry).toLocaleString()}`);
    
    return cachedToken;

  } catch (error) {
    console.error('❌ Shiprocket authentication error:', error.response?.data || error.message);
    cachedToken = null;
    tokenExpiry = null;
    throw new Error(`Shiprocket auth failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Create Shiprocket order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Shiprocket order response
 */
async function createShiprocketOrder(orderData) {
  try {
    const token = await getShiprocketToken();

    console.log('📦 Creating Shiprocket order...');

    // Prepare order payload according to Shiprocket API
    const payload = {
      order_id: orderData.orderId, // Your internal order ID
      order_date: orderData.orderDate || new Date().toISOString().split('T')[0],
      pickup_location: "Primary", // Your pickup location name in Shiprocket
      channel_id: "", // Leave empty for API orders
      comment: orderData.comment || "Order created via API",
      billing_customer_name: orderData.customer.name,
      billing_last_name: orderData.customer.lastName || "",
      billing_address: orderData.customer.address,
      billing_address_2: orderData.customer.address2 || "",
      billing_city: orderData.customer.city,
      billing_pincode: orderData.customer.pincode,
      billing_state: orderData.customer.state,
      billing_country: orderData.customer.country || "India",
      billing_email: orderData.customer.email,
      billing_phone: orderData.customer.phone,
      shipping_is_billing: orderData.shippingIsBilling !== false, // Default true
      shipping_customer_name: orderData.shipping?.name || orderData.customer.name,
      shipping_last_name: orderData.shipping?.lastName || orderData.customer.lastName || "",
      shipping_address: orderData.shipping?.address || orderData.customer.address,
      shipping_address_2: orderData.shipping?.address2 || orderData.customer.address2 || "",
      shipping_city: orderData.shipping?.city || orderData.customer.city,
      shipping_pincode: orderData.shipping?.pincode || orderData.customer.pincode,
      shipping_country: orderData.shipping?.country || orderData.customer.country || "India",
      shipping_state: orderData.shipping?.state || orderData.customer.state,
      shipping_email: orderData.shipping?.email || orderData.customer.email,
      shipping_phone: orderData.shipping?.phone || orderData.customer.phone,
      order_items: orderData.items.map(item => ({
        name: item.name,
        sku: item.sku || item.id,
        units: item.quantity,
        selling_price: item.price,
        discount: item.discount || 0,
        tax: item.tax || 0,
        hsn: item.hsn || "" // HSN code for tax purposes
      })),
      payment_method: orderData.paymentMethod || "Prepaid",
      shipping_charges: orderData.shippingCharges || 0,
      giftwrap_charges: orderData.giftwrapCharges || 0,
      transaction_charges: orderData.transactionCharges || 0,
      total_discount: orderData.totalDiscount || 0,
      sub_total: orderData.subTotal,
      length: orderData.dimensions?.length || 10, // cm
      breadth: orderData.dimensions?.breadth || 10, // cm
      height: orderData.dimensions?.height || 10, // cm
      weight: orderData.dimensions?.weight || 0.5 // kg
    };

    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/orders/create/adhoc`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.order_id) {
      console.log('✅ Shiprocket order created successfully');
      console.log(`📦 Shiprocket Order ID: ${response.data.order_id}`);
      console.log(`🏷️  Shipment ID: ${response.data.shipment_id}`);
      
      return {
        success: true,
        orderId: response.data.order_id,
        shipmentId: response.data.shipment_id,
        status: response.data.status,
        data: response.data
      };
    } else {
      throw new Error('Invalid response from Shiprocket');
    }

  } catch (error) {
    console.error('❌ Shiprocket order creation error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
}

/**
 * Generate AWB (Air Waybill) for shipment
 * @param {number} shipmentId - Shiprocket shipment ID
 * @param {number} courierId - Courier company ID
 */
async function generateAWB(shipmentId, courierId) {
  try {
    const token = await getShiprocketToken();

    console.log(`📋 Generating AWB for shipment ${shipmentId}...`);

    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_id: courierId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.awb_assign_status === 1) {
      console.log('✅ AWB generated successfully');
      console.log(`🏷️  AWB Code: ${response.data.response.data.awb_code}`);
      
      return {
        success: true,
        awbCode: response.data.response.data.awb_code,
        courierId: response.data.response.data.courier_id,
        courierName: response.data.response.data.courier_name
      };
    } else {
      throw new Error('Failed to generate AWB');
    }

  } catch (error) {
    console.error('❌ AWB generation error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get available courier services for a shipment
 * @param {number} shipmentId - Shiprocket shipment ID
 */
async function getAvailableCouriers(shipmentId) {
  try {
    const token = await getShiprocketToken();

    console.log(`🚚 Fetching available couriers for shipment ${shipmentId}...`);

    const response = await axios.get(
      `${SHIPROCKET_CONFIG.BASE_URL}/courier/serviceability/?shipment_id=${shipmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data) {
      console.log(`✅ Found ${response.data.data.available_courier_companies.length} available couriers`);
      return response.data.data.available_courier_companies;
    }

    return [];

  } catch (error) {
    console.error('❌ Error fetching couriers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Track shipment by AWB code
 * @param {string} awbCode - Air Waybill tracking number
 */
async function trackShipment(awbCode) {
  try {
    const token = await getShiprocketToken();

    console.log(`📍 Tracking shipment: ${awbCode}`);

    const response = await axios.get(
      `${SHIPROCKET_CONFIG.BASE_URL}/courier/track/awb/${awbCode}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      console.log('✅ Tracking data retrieved');
      return response.data;
    }

    throw new Error('No tracking data available');

  } catch (error) {
    console.error('❌ Tracking error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Complete order flow: Create order, get couriers, generate AWB
 * @param {Object} orderData - Order details
 */
async function createCompleteShipment(orderData) {
  try {
    // Step 1: Create order in Shiprocket
    const orderResult = await createShiprocketOrder(orderData);
    
    if (!orderResult.success) {
      throw new Error(`Order creation failed: ${orderResult.error}`);
    }

    const { shipmentId } = orderResult;

    // Step 2: Get available couriers
    const couriers = await getAvailableCouriers(shipmentId);
    
    if (!couriers || couriers.length === 0) {
      throw new Error('No couriers available for this shipment');
    }

    // Step 3: Select best courier (you can customize this logic)
    const bestCourier = couriers.sort((a, b) => a.rate - b.rate)[0]; // Cheapest
    console.log(`📦 Selected courier: ${bestCourier.courier_name} (₹${bestCourier.rate})`);

    // Step 4: Generate AWB
    const awbResult = await generateAWB(shipmentId, bestCourier.courier_company_id);

    return {
      success: true,
      orderId: orderResult.orderId,
      shipmentId: shipmentId,
      awbCode: awbResult.awbCode,
      courier: {
        id: awbResult.courierId,
        name: awbResult.courierName,
        rate: bestCourier.rate
      }
    };

  } catch (error) {
    console.error('❌ Complete shipment creation failed:', error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  getShiprocketToken,
  createShiprocketOrder,
  generateAWB,
  getAvailableCouriers,
  trackShipment,
  createCompleteShipment
};

// Example usage (for testing):
if (require.main === module) {
  // Test authentication
  getShiprocketToken()
    .then(token => {
      console.log('✅ Token obtained:', token.substring(0, 20) + '...');
    })
    .catch(error => {
      console.error('❌ Test failed:', error.message);
    });
}
