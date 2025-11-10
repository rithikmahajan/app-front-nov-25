/**
 * Shiprocket Service
 * Handles all Shiprocket API interactions for order tracking
 */

const SHIPROCKET_EMAIL = 'support@yoraa.in';
const SHIPROCKET_PASSWORD = 'R@0621thik';
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Token caching to avoid repeated authentication
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket authentication token
 * Uses cached token if still valid, otherwise fetches new one
 */
export const getShiprocketToken = async () => {
  try {
    // Return cached token if still valid (10 hour expiry)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('✅ Using cached Shiprocket token');
      return cachedToken;
    }

    console.log('🔐 Authenticating with Shiprocket...');
    
    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
      })
    });

    const data = await response.json();

    if (!data.token) {
      throw new Error('Failed to get Shiprocket token');
    }

    // Cache token for 10 hours
    cachedToken = data.token;
    tokenExpiry = Date.now() + (10 * 60 * 60 * 1000);

    console.log('✅ Shiprocket authentication successful');
    return cachedToken;

  } catch (error) {
    console.error('❌ Shiprocket authentication error:', error);
    throw error;
  }
};

/**
 * Fetch tracking details for a shipment using AWB code
 * @param {string} awbCode - Air Waybill tracking number
 * @returns {Promise<Object>} Tracking data from Shiprocket
 */
export const fetchTrackingDetails = async (awbCode) => {
  try {
    if (!awbCode) {
      throw new Error('AWB code is required');
    }

    console.log(`📦 Fetching tracking for AWB: ${awbCode}`);
    
    const token = await getShiprocketToken();

    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Shiprocket API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Tracking data fetched successfully');
    return data;

  } catch (error) {
    console.error('❌ Error fetching tracking details:', error);
    throw error;
  }
};

/**
 * Map Shiprocket status codes to customer-friendly names
 * @param {string} status - Shiprocket status code
 * @returns {string} Customer-friendly status name
 */
export const mapShiprocketStatus = (status) => {
  const statusMap = {
    'OP': 'Order Placed',
    'OFP': 'Out for Pickup',
    'PKD': 'Picked Up',
    'PUD': 'Pickup Done',
    'IT': 'In Transit',
    'RAD': 'Reached Destination',
    'OFD': 'Out for Delivery',
    'DLVD': 'Delivered',
    'RTO': 'Return to Origin',
    'RTOIP': 'RTO in Progress',
    'RTOD': 'RTO Delivered',
    'LOST': 'Lost',
    'DAMAGED': 'Damaged',
    'CANCELLED': 'Cancelled',
    'DEX': 'Delivery Exception',
    'HOLD': 'On Hold',
    'CNF': 'Confirmed'
  };

  return statusMap[status] || status;
};

/**
 * Map Shiprocket status to tracking modal format
 * Filters and transforms statuses for the tracking modal
 * @param {string} status - Shiprocket status code
 * @returns {string|null} Modal-compatible status or null if not relevant
 */
export const mapToModalStatus = (status) => {
  const modalStatusMap = {
    'OP': 'Packing',
    'OFP': 'Picked',
    'PKD': 'Picked',
    'PUD': 'Picked',
    'IT': 'In Transit',
    'RAD': 'In Transit',
    'OFD': 'In Transit',
    'DLVD': 'Delivered'
  };

  return modalStatusMap[status] || null;
};

/**
 * Transform Shiprocket tracking data to modal format
 * @param {Object} trackingData - Raw Shiprocket tracking response
 * @returns {Array} Formatted tracking steps for modal
 */
export const transformTrackingForModal = (trackingData) => {
  try {
    if (!trackingData?.tracking_data?.shipment_track_activities) {
      return [];
    }

    const activities = trackingData.tracking_data.shipment_track_activities;

    // Filter and transform activities for modal display
    const transformedSteps = activities
      .map(activity => {
        const modalStatus = mapToModalStatus(activity.status);
        
        if (!modalStatus) return null;

        return {
          status: modalStatus,
          location: activity.location || 'Location not available',
          timestamp: formatTimestamp(activity.date)
        };
      })
      .filter(step => step !== null);

    // Remove duplicates (keep latest occurrence)
    const uniqueSteps = [];
    const seenStatuses = new Set();

    for (let i = transformedSteps.length - 1; i >= 0; i--) {
      const step = transformedSteps[i];
      if (!seenStatuses.has(step.status)) {
        uniqueSteps.unshift(step);
        seenStatuses.add(step.status);
      }
    }

    return uniqueSteps;

  } catch (error) {
    console.error('❌ Error transforming tracking data:', error);
    return [];
  }
};

/**
 * Format timestamp to IST with 12-hour format
 * @param {string} timestamp - ISO timestamp or date string
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
};

/**
 * Get current shipment status
 * @param {Object} trackingData - Raw Shiprocket tracking response
 * @returns {Object} Current status information
 */
export const getCurrentStatus = (trackingData) => {
  try {
    if (!trackingData?.tracking_data?.shipment_track?.[0]) {
      return {
        status: 'Unknown',
        statusFriendly: 'Status not available',
        deliveredDate: null,
        estimatedDelivery: null
      };
    }

    const shipment = trackingData.tracking_data.shipment_track[0];

    return {
      status: shipment.current_status,
      statusFriendly: mapShiprocketStatus(shipment.current_status),
      deliveredDate: shipment.delivered_date || null,
      estimatedDelivery: shipment.edd || null,
      courierName: shipment.courier_name || 'Courier',
      destination: shipment.destination || '',
      origin: shipment.origin || ''
    };

  } catch (error) {
    console.error('Error getting current status:', error);
    return {
      status: 'Unknown',
      statusFriendly: 'Status not available'
    };
  }
};

/**
 * Check if order can be cancelled based on status
 * @param {string} status - Current order status
 * @returns {boolean} Whether order can be cancelled
 */
export const canCancelOrder = (status) => {
  const nonCancellableStatuses = ['DLVD', 'RTO', 'RTOD', 'CANCELLED', 'LOST'];
  return !nonCancellableStatuses.includes(status);
};

/**
 * Get status color for UI display
 * @param {string} status - Shiprocket status code
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'DLVD': '#32862B',        // Green - Delivered
    'OFD': '#007AFF',         // Blue - Out for Delivery
    'IT': '#007AFF',          // Blue - In Transit
    'PKD': '#007AFF',         // Blue - Picked
    'OP': '#767676',          // Gray - Order Placed
    'CANCELLED': '#EA4335',   // Red - Cancelled
    'RTO': '#EA4335',         // Red - Return to Origin
    'LOST': '#EA4335',        // Red - Lost
    'DAMAGED': '#EA4335',     // Red - Damaged
    'HOLD': '#FBBC05',        // Yellow - On Hold
    'DEX': '#FBBC05'          // Yellow - Delivery Exception
  };

  return colorMap[status] || '#767676';
};

export default {
  getShiprocketToken,
  fetchTrackingDetails,
  mapShiprocketStatus,
  mapToModalStatus,
  transformTrackingForModal,
  formatTimestamp,
  getCurrentStatus,
  canCancelOrder,
  getStatusColor
};
