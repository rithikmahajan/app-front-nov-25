# Backend API Issue - Address Endpoints Missing

## Issue Summary
The frontend application is attempting to call address-related API endpoints that are returning 404 errors, indicating these endpoints are either not implemented or not properly configured on the backend.

## Critical Error Details

### Error Logs
```
[DEVELOPMENT] 10:29:02 ❌ API Response Error 
{
  message: 'Request failed with status code 404', 
  code: 'ERR_BAD_REQUEST', 
  status: 404, 
  url: '/address/user'
}
```

### Impact
- Users cannot access the Bag/Cart screen properly
- Address loading fails during checkout flow
- "Buy Now" feature navigation to cart is affected
- User experience is degraded with error messages

---

## Required Backend Fixes

### 1. Missing Endpoint: GET /api/address/user

**Current Status:** 404 Not Found

**Required Implementation:**
- **Endpoint:** `GET /api/address/user`
- **Full URL:** `http://localhost:8001/api/address/user`
- **Authentication:** Required (Bearer Token)
- **Purpose:** Fetch all saved addresses for the authenticated user

**Expected Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "address_id_123",
      "userId": "user_id_456",
      "fullName": "John Doe",
      "phoneNumber": "+1234567890",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "isDefault": true,
      "addressType": "home",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid/missing token)
- `404` - User not found
- `500` - Server error

---

### 2. Related Address Endpoints (Likely Also Missing)

Based on the frontend implementation, the following endpoints are also expected:

#### POST /api/address/user
**Purpose:** Create a new address for the user

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": false,
  "addressType": "home"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_address_id",
    "userId": "user_id",
    ...addressData
  }
}
```

#### PUT /api/address/user/:addressId
**Purpose:** Update an existing address

**Request Body:** Same as POST

**Response:** Same as POST

#### DELETE /api/address/user/:addressId
**Purpose:** Delete an address

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

#### PUT /api/address/user/:addressId/default
**Purpose:** Set an address as default

**Response:**
```json
{
  "success": true,
  "message": "Default address updated successfully"
}
```

---

## Frontend Implementation Details

### Current Frontend API Call
**File:** `src/context/AddressContext.js`

```javascript
// Line ~30
const response = await apiService.get('/address/user');
```

**File:** `src/services/apiService.js`

The API service constructs the full URL as:
```javascript
`${API_BASE_URL}/api/address/user`
// Results in: http://localhost:8001/api/address/user
```

---

## Database Schema Suggestion

```javascript
const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'India'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});
```

---

## Testing Checklist

After implementing the endpoints, please verify:

- [ ] GET /api/address/user returns empty array for users with no addresses
- [ ] GET /api/address/user returns user's addresses when they exist
- [ ] POST /api/address/user successfully creates a new address
- [ ] PUT /api/address/user/:id successfully updates an address
- [ ] DELETE /api/address/user/:id successfully deletes an address
- [ ] Setting isDefault=true for one address sets others to false
- [ ] Authentication is properly enforced on all endpoints
- [ ] Proper error messages are returned for invalid data
- [ ] User can only access their own addresses (authorization check)

---

## Additional Notes

### Authentication
All address endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The backend should extract the user ID from the JWT token to ensure users can only access their own addresses.

### Validation
Please implement proper validation for:
- Phone number format
- Zip code format
- Required fields
- String length limits
- SQL injection prevention
- XSS prevention

---

## Priority
🔴 **HIGH PRIORITY** - This is blocking the checkout flow and "Buy Now" functionality

---

## Contact
If you need clarification on any of the expected behaviors or response formats, please contact the frontend team.

## Related Files (Frontend)
- `src/context/AddressContext.js` - Address state management
- `src/services/apiService.js` - API service layer
- `src/screens/Bag.js` - Cart/Bag screen (uses addresses)
- `src/screens/productdetailsmain.js` - Product details with Buy Now
- `src/screens/productdetailsmainsizeselectionchart.js` - Size selection with Buy Now flow
