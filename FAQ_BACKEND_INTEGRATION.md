# FAQ Backend API Integration

## Overview
The FAQ screen (`src/screens/faq_new.js`) has been updated to fetch FAQ data from backend APIs instead of using hardcoded data.

## Backend API Endpoints

### Primary Endpoint
- **GET /api/faqs** - Fetch all FAQs
  - Returns FAQ data in one of two formats:
    1. `{ faqs: [FAQ objects] }`
    2. Direct array of FAQ objects

### Additional Endpoints (Available for future use)
- **GET /api/faqs/:id** - Fetch specific FAQ by ID
- **GET /api/faqs/category/:category** - Fetch FAQs by category

## Expected Data Format

The backend should return FAQ data in the following format:

```json
{
  "faqs": [
    {
      "id": 1,
      "question": "WHAT DO I NEED TO KNOW BEFORE SIGNING UP TO THE YORAA MEMBERSHIP?",
      "answer": "All your purchases in store and online are rewarded with points...",
      "category": "membership",
      "order": 1,
      "isActive": true
    }
  ]
}
```

Or as a direct array:

```json
[
  {
    "id": 1,
    "question": "FAQ Question",
    "answer": "FAQ Answer"
  }
]
```

## Features Implemented

### 1. API Integration
- Uses YoraaAPIClient for consistent API communication
- Automatic token management and error handling
- Proper initialization of API client

### 2. Error Handling
- Graceful fallback to default FAQ data if API fails
- Error messages displayed to users
- Retry functionality for failed requests
- Console logging for debugging

### 3. Loading States
- Loading indicator during API calls
- Pull-to-refresh functionality
- Refresh control integration

### 4. User Experience
- First FAQ item expanded by default (matching original design)
- Smooth expand/collapse animations
- Error notification with retry option
- Responsive design maintained

## Backend Requirements

The backend team needs to implement the following endpoints:

### 1. GET /api/faqs
```javascript
// Example response
{
  "success": true,
  "faqs": [
    {
      "id": 1,
      "question": "FAQ question text",
      "answer": "FAQ answer text",
      "category": "general",
      "order": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Error Response Format
```javascript
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Testing

### Current Behavior
- App loads with default FAQ data on startup
- Attempts to fetch from backend API `/api/faqs`
- Falls back to default data if API call fails
- Shows error message but continues to function

### Testing Scenarios
1. **API Success**: Backend returns valid FAQ data
2. **API Failure**: Backend is down or returns error
3. **Invalid Data**: Backend returns unexpected data format
4. **Network Issues**: Connection timeout or network error

## Implementation Notes

### API Client Integration
The FAQ screen uses the existing `YoraaAPIClient` class which provides:
- Consistent error handling
- Token management
- Request/response logging
- Retry logic

### Fallback Strategy
- Default FAQ data is always available as fallback
- Users can continue using the app even if backend is unavailable
- Error states are user-friendly and non-blocking

### Performance Considerations
- FAQ data is cached in component state
- Pull-to-refresh allows manual data refresh
- Minimal API calls (only on mount and manual refresh)

## Next Steps for Backend Team

1. **Implement FAQ endpoints** in the backend API
2. **Test with various data scenarios** (empty, large datasets, etc.)
3. **Add FAQ admin panel** for content management
4. **Consider caching strategies** for frequently accessed FAQs
5. **Add pagination** if FAQ list becomes large

## Debugging

Console logs are added with `[FAQ]` prefix for easy debugging:
- `[FAQ] Starting to fetch FAQs from backend...`
- `[FAQ] API Response:` - Shows raw API response
- `[FAQ] Successfully loaded FAQs from response.faqs:` - Shows successful load
- `[FAQ] Error fetching FAQs:` - Shows API errors

## Code Files Modified

1. **YoraaAPIClient.js** - Added FAQ API methods
2. **src/screens/faq_new.js** - Updated FAQ screen with API integration (now the active FAQ screen)
3. **src/screens/index.js** - Updated to export the new FAQ screen
4. **src/screens/faq.js** - Removed (old version without backend integration)

The implementation is backward compatible and maintains all existing functionality while adding backend integration capabilities.
