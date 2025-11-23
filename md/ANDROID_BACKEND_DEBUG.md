# Android Backend Connection Debug Guide

## Issue: Data Not Displaying from Backend

### What We Found:

1. ✅ **Backend is running** on `http://localhost:8001`
2. ✅ **Backend is returning data** (5 subcategories confirmed via curl)
3. ✅ **Environment config** is set to use `10.0.2.2` for Android emulator
4. ⚠️  **App showing cached data** instead of live backend data

### Quick Diagnostic Steps:

#### 1. Check Current API URL
Open the Android app and look for these console logs:
```
🤖 Android Emulator URL: http://10.0.2.2:8001/api
```

If you see `localhost` instead of `10.0.2.2`, the app needs to be rebuilt.

#### 2. Verify Backend Response
Test the backend from your Mac terminal:
```bash
curl http://localhost:8001/api/subcategories
```

Should return JSON with subcategories data.

#### 3. Test from Android Emulator
From the Android emulator's perspective:
```bash
# This won't work from Mac terminal, but shows what Android tries
curl http://10.0.2.2:8001/api/subcategories
```

### Common Issues & Solutions:

#### Issue 1: App Still Using localhost
**Solution**: Rebuild the app
```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
npx react-native run-android --mode=debug
```

#### Issue 2: Metro Bundler Cache
**Solution**: Clear cache and restart
```bash
# Kill Metro
pkill -f "react-native"

# Clear cache and restart
npx react-native start --reset-cache
```

#### Issue 3: Backend Not Running
**Solution**: Start the backend server
```bash
# Check if backend is running
curl http://localhost:8001/api/health

# If not, start it (adjust path to your backend)
cd /path/to/backend
npm start
```

### Debugging in CollectionScreen:

The Collection screen logs important information. Look for these in Metro bundler:

```javascript
// Good signs:
🔄 Fetching subcategories...
✅ Subcategories fetched: {...}
✅ Processed items (5): [...]

// Bad signs:
❌ Error fetching subcategories: {...}
⚠️ No subcategories found
```

### Network Request Flow:

1. **App** → `apiService.getSubcategories()`
2. **API Service** → `http://10.0.2.2:8001/api/subcategories` (Android)
3. **Backend** → Returns JSON response
4. **App** → Processes and displays data

### Current URLs Being Used:

- **Development (Android)**: `http://10.0.2.2:8001/api`
- **Development (iOS)**: `http://localhost:8001/api`
- **Production**: `https://api.yoraa.in.net/api`

### If Data Still Not Showing:

1. **Enable Debug Logging**:
   - Open `src/config/environment.js`
   - Ensure `DEBUG_MODE=true` in `.env`
   
2. **Check Metro Logs**:
   - Look for API Request logs
   - Check for network errors
   - Verify response data structure

3. **Test API Directly**:
   - Use Postman or curl
   - Test: `http://localhost:8001/api/subcategories`
   - Verify response matches expected format

4. **Reload App**:
   - Shake device (or Cmd+M)
   - Select "Reload"
   - Or press 'r' in Metro terminal

### Expected API Response Format:

```json
{
  "success": true,
  "message": "Subcategories fetched successfully",
  "data": [
    {
      "_id": "6907a0ceb0bb1899eb2b048a",
      "name": "erty",
      "description": "",
      "categoryId": "6907947705e984b55f0834d9",
      "imageUrl": "https://...",
      "displayOrder": 0,
      "createdAt": "2025-11-02T18:19:59.534Z",
      "updatedAt": "2025-11-02T18:19:59.534Z"
    }
  ],
  "statusCode": 200
}
```

### Next Steps:

1. **Reload the Android app** (press 'r' in Metro or shake device → Reload)
2. **Check Metro bundler logs** for API requests
3. **Navigate to Collection screen** and observe logs
4. **Report back** what you see in the logs

---

**Last Updated**: November 18, 2025
**Status**: Backend Running ✅ | App Rebuilt ✅ | Needs Testing ⏳
