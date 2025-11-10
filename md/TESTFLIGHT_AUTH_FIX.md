# TestFlight Authentication & Profile Data Fix

## Issues Fixed

### 1. Backend URL Mismatch (CRITICAL)
**Problem**: Production environment (.env.production) had backend URL configured as port `8000`, but `yoraaAPI.js` was hardcoded to use port `8001`. This caused all API calls in TestFlight to fail.

**Solution**:
- Updated `.env.production` to use port `8001` for consistency
- Modified `yoraaAPI.js` to use `environment.getApiUrl()` instead of hardcoded URLs
- Updated `environment.js` default backend URLs to use port `8001`

**Files Changed**:
- `src/services/yoraaAPI.js`
- `.env.production`
- `.env`
- `src/config/environment.js`

### 2. Missing Screen Focus Listeners
**Problem**: ProfileScreen and EditProfile didn't reload user data when navigating back from other screens, causing stale data to persist.

**Solution**:
- Added `useFocusEffect` hook to both ProfileScreen and EditProfile
- Profile data now reloads whenever the screen gains focus
- Ensures user sees latest data after login, profile edits, or navigation

**Files Changed**:
- `src/screens/ProfileScreen.js`
- `src/screens/EditProfile.js`

### 3. Weak Backend Authentication Sync
**Problem**: Backend JWT token wasn't being properly synced after app restart or when switching between screens, causing "authentication required" errors.

**Solution**:
- Enhanced `syncBackendAuth()` to handle errors gracefully without blocking UI
- Added try-catch blocks around backend sync to prevent crashes
- Improved token restoration from AsyncStorage on app initialization
- Added detailed logging for debugging TestFlight issues

**Files Changed**:
- `src/screens/ProfileScreen.js` (loadUserName function)
- `src/screens/EditProfile.js` (loadUserProfile function)
- `src/services/yoraaAPI.js` (initialize method with better logging)

### 4. Profile Data Fallback Logic
**Problem**: App showed "Guest User" instead of falling back to Firebase data when backend wasn't available.

**Solution**:
- Enhanced fallback logic to check for `profile.data.fallback` flag
- Prioritizes: Backend Profile → Firebase Profile → Email-derived name → Guest User
- Gracefully handles backend API failures without blocking user experience

**Files Changed**:
- `src/screens/ProfileScreen.js`
- `src/screens/EditProfile.js`

## Technical Details

### Environment Configuration
```javascript
// Development (localhost)
API_BASE_URL=http://localhost:8001/api

// Production (TestFlight/Release)
BACKEND_URL=http://185.193.19.244:8001/api
```

### Authentication Flow (TestFlight)
1. **App Launch**:
   - App.js initializes yoraaAPI and restores token from AsyncStorage
   - Auth Manager sets up Firebase auth listener
   - Session Manager validates existing sessions

2. **User Login**:
   - Firebase authentication completes
   - Backend receives Firebase ID token
   - Backend returns JWT token
   - Token stored in AsyncStorage for persistence

3. **Screen Navigation**:
   - useFocusEffect triggers data reload
   - syncBackendAuth ensures valid backend token
   - API calls use fresh authentication

4. **Profile Loading**:
   - Check if backend is authenticated
   - Fetch user profile from backend API
   - Fallback to Firebase user data if needed
   - Update UI with latest data

## Testing Checklist

### Local Development
- [ ] Login with phone/email/Google/Apple
- [ ] Verify profile name displays correctly
- [ ] Edit profile and save changes
- [ ] Navigate away and back - data should reload
- [ ] Logout and login - data should persist

### TestFlight Production
- [ ] Fresh install - login flow works
- [ ] Profile name displays after login
- [ ] Edit profile saves to backend
- [ ] Kill app and reopen - user stays logged in
- [ ] Navigate between screens - data updates
- [ ] Check app logs for authentication errors
- [ ] Verify backend URL is correct (8001)

## Common Issues & Solutions

### Issue: "Guest User" persists after login
**Cause**: Backend authentication sync failed
**Solution**: 
- Check backend server is running on port 8001
- Verify Firebase ID token is valid
- Check network connectivity in TestFlight device

### Issue: Profile data doesn't update
**Cause**: Screen focus listeners not triggering
**Solution**:
- Ensure `useFocusEffect` is imported from `@react-navigation/native`
- Verify navigation params are passed correctly
- Check React Navigation version compatibility

### Issue: Authentication errors in TestFlight
**Cause**: Backend URL mismatch or token not persisting
**Solution**:
- Verify `.env.production` is being used for release builds
- Check AsyncStorage has proper iOS permissions
- Enable debug logging to see token restoration

## Debug Commands

### Check Backend URL
```javascript
// In App.js or any component
import yoraaAPI from './src/services/yoraaAPI';
console.log('Backend URL:', yoraaAPI.baseURL);
```

### Check Authentication Status
```javascript
import authManager from './src/services/authManager';
await authManager.debugAuthStatus();
```

### Check Profile API
```javascript
import yoraaAPI from './src/services/yoraaAPI';
const profile = await yoraaAPI.getUserProfile();
console.log('Profile:', profile);
```

## Backend Requirements

The backend must support these endpoints:
- `POST /api/auth/login/firebase` - Exchange Firebase token for JWT
- `GET /api/profile` - Get user profile (authenticated)
- `PUT /api/profile` - Update user profile (authenticated)

Expected profile response format:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "gender": "Male",
    "displayName": "John Doe"
  }
}
```

## Build Instructions

### For TestFlight Release
```bash
# 1. Ensure production environment
export APP_ENV=production

# 2. Install dependencies
cd ios && pod install && cd ..

# 3. Build for release
npx react-native run-ios --configuration Release

# 4. Or build archive for TestFlight
xcodebuild -workspace ios/yoraa.xcworkspace \
  -scheme yoraa \
  -configuration Release \
  -archivePath build/yoraa.xcarchive \
  archive
```

## Monitoring

### Key Metrics to Watch
- Login success rate
- Profile load success rate
- Backend authentication sync success rate
- Token persistence across app restarts

### Logging
All authentication and profile operations now log to console with emojis for easy filtering:
- 🔐 Authentication events
- 👤 User profile events
- 🔄 Data sync/reload events
- ✅ Success operations
- ❌ Error operations
- ⚠️ Warning operations

## Next Steps

1. **Deploy backend**: Ensure backend is running on port 8001
2. **Test locally**: Run through all test scenarios
3. **Build for TestFlight**: Create release build with production env
4. **Upload to TestFlight**: Submit to App Store Connect
5. **Monitor**: Check logs for any authentication issues
6. **Iterate**: Address any edge cases found in testing

## Support

If issues persist:
1. Check device logs in TestFlight
2. Verify backend logs show authentication requests
3. Test with different login methods (phone, email, social)
4. Ensure AsyncStorage permissions are granted
5. Check network connectivity and firewall rules
