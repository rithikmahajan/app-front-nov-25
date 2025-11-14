# Referral Code Dynamic Implementation

## Overview
The Invite a Friend screen has been updated to dynamically fetch referral codes from the backend API and display appropriate states based on the data availability.

## Changes Made

### 1. Backend API Integration (`src/services/yoraaAPI.js`)

Added a new method `getUserReferralCode()` that:
- Fetches the user's referral code from the backend
- Tries multiple endpoints in order:
  1. Primary: `/api/referral/code` (GET) - User-specific referral endpoint
  2. Fallback: User profile endpoint if referral code is included in profile data
- Returns structured response with:
  - `code`: The referral code string
  - `userName`: User's name to display
  - `benefit`: Description of the referral benefit
- Handles authentication checks
- Returns appropriate empty state when no code is available

### 2. Dynamic UI Implementation (`src/screens/InviteAFriend.js`)

#### Features Added:
1. **Loading State**
   - Shows ActivityIndicator while fetching data
   - Displays "Loading your referral code..." message
   - Centered and professional loading UI

2. **Empty State**
   - Shows when no referral code is available
   - Includes:
     - Info icon (SVG)
     - "No Referral Code Available" title
     - Helpful message for the user
     - Retry button to fetch again

3. **Success State** (Original design)
   - Displays the voucher-style referral code card
   - Shows dynamic user name
   - Shows dynamic referral code
   - Shows dynamic benefit text
   - Copy and Share functionality

#### State Management:
- `referralCode`: Stores the fetched code (null when not available)
- `userName`: Stores the user's name from API
- `benefit`: Stores the benefit description
- `isLoading`: Tracks loading state

#### API Integration:
- Calls `yoraaAPI.getUserReferralCode()` on component mount
- Automatically handles success, empty, and error scenarios
- Retry functionality allows users to refetch if needed

### 3. Enhanced User Experience

#### Copy Button:
- Shows alert with referral code
- Provides options to either Share or dismiss
- Handles cases where no code is available

#### Share Button:
- Only visible when referral code exists
- Shares formatted message with code
- Uses native Share API
- Validates code existence before sharing

## Backend Requirements

For full functionality, the backend should implement one of these endpoints:

### Option 1: Dedicated Referral Endpoint (Recommended)
```
GET /api/referral/code
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "code": "RITHIK27",
    "userName": "Rithik",
    "benefit": "Invite a friend and get additional 10% off on your 1st purchase"
  }
}
```

### Option 2: Include in User Profile
```
GET /api/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Rithik",
    "email": "user@example.com",
    "referralCode": "RITHIK27",
    ...
  }
}
```

### Empty State Response (when no code available):
```
{
  "success": true,
  "data": null,
  "message": "No referral code available"
}
```

## User Flows

### Flow 1: Successful Code Fetch
1. User navigates to "Invite a Friend"
2. Loading indicator appears
3. API call successful with code
4. Voucher card displays with code
5. User can copy or share the code

### Flow 2: No Code Available
1. User navigates to "Invite a Friend"
2. Loading indicator appears
3. API returns no code (or 404)
4. Empty state screen displays
5. User sees helpful message
6. User can tap Retry button

### Flow 3: Error Handling
1. User navigates to "Invite a Friend"
2. Loading indicator appears
3. API call fails (network/auth error)
4. Empty state screen displays
5. User can tap Retry to try again

## Testing

### To Test with Mock Data:
The API service will show empty state if:
- Backend endpoint is not implemented (404)
- User is not authenticated
- API returns null/empty data

### To Test with Real Backend:
1. Implement one of the backend endpoints above
2. Ensure authentication is working
3. Return referral code data in the specified format

## UI States

### Loading State
- Centered spinner
- Gray loading text
- Clean and minimal

### Empty State
- Info icon (80x80px)
- Bold title: "No Referral Code Available"
- Gray descriptive text
- Black retry button
- Centered layout

### Success State
- Voucher-style card with dashed border
- User name at top
- Referral code with copy icon
- Horizontal divider
- Benefit description
- Black "Invite Now" button

## Design Notes

- All styles maintain consistency with existing app design
- Uses Montserrat font family
- Black (#000000) for primary actions
- Gray (#6C6C6C) for secondary text
- White (#FFFFFF) background
- Maintains exact Figma specifications for success state
- Responsive and accessible UI components

## Files Modified

1. **src/services/yoraaAPI.js**
   - Added `getUserReferralCode()` method

2. **src/screens/InviteAFriend.js**
   - Added dynamic state management
   - Added loading UI
   - Added empty state UI
   - Enhanced error handling
   - Improved user feedback

## Future Enhancements

Potential improvements:
1. Add Clipboard API integration for true copy-to-clipboard
2. Add analytics tracking for referral shares
3. Add referral usage statistics
4. Add referral rewards tracking
5. Add social media sharing options
6. Add QR code generation for referral code
