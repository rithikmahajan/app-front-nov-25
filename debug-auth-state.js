/**
 * Debug Authentication State Utility
 * Run this script to diagnose authentication issues in TestFlight
 * 
 * Usage: node debug-auth-state.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Authentication State Debug Utility\n');
console.log('This utility helps diagnose the "Guest User" issue in TestFlight\n');

console.log('='.repeat(60));
console.log('CRITICAL AUTHENTICATION FLOW CHECKPOINTS');
console.log('='.repeat(60));

const checkpoints = [
  {
    step: 1,
    name: 'Firebase Authentication',
    file: 'src/screens/loginaccountemailverificationcode.js',
    check: 'auth().signInWithEmailAndPassword()',
    what: 'Verify Firebase login succeeds',
    success: 'Firebase user credential returned',
    failure: 'Firebase auth error thrown'
  },
  {
    step: 2,
    name: 'Session Creation',
    file: 'src/services/sessionManager.js',
    check: 'sessionManager.createSession()',
    what: 'Verify session is created and stored',
    success: 'sessionData saved to AsyncStorage',
    failure: 'Session not created or storage failed'
  },
  {
    step: 3,
    name: 'Backend Authentication',
    file: 'src/services/yoraaAPI.js',
    check: 'yoraaAPI.firebaseLogin(idToken)',
    what: 'Verify backend JWT token received and stored',
    success: 'userToken saved to AsyncStorage & yoraaAPI.userToken set',
    failure: 'No token received or storage failed'
  },
  {
    step: 4,
    name: 'Backend Auth Sync',
    file: 'src/services/authManager.js',
    check: 'authManager.syncBackendAuth()',
    what: 'Verify backend auth syncs when Firebase user exists',
    success: 'yoraaAPI.isAuthenticated() returns true',
    failure: 'Backend not authenticated after sync'
  },
  {
    step: 5,
    name: 'Profile Screen Load',
    file: 'src/screens/ProfileScreen.js',
    check: 'loadUserName() execution',
    what: 'Verify profile loads user data correctly',
    success: 'User name displayed from backend or Firebase',
    failure: '"Guest User" displayed when user is authenticated'
  }
];

checkpoints.forEach(checkpoint => {
  console.log(`\nStep ${checkpoint.step}: ${checkpoint.name}`);
  console.log(`  File: ${checkpoint.file}`);
  console.log(`  Check: ${checkpoint.check}`);
  console.log(`  What to verify: ${checkpoint.what}`);
  console.log(`  ✅ Success: ${checkpoint.success}`);
  console.log(`  ❌ Failure: ${checkpoint.failure}`);
});

console.log('\n' + '='.repeat(60));
console.log('COMMON FAILURE SCENARIOS IN TESTFLIGHT');
console.log('='.repeat(60));

const scenarios = [
  {
    scenario: 'Scenario 1: Backend Token Not Persisting',
    symptom: 'User sees "Guest User" after app restart',
    cause: 'userToken not saved to AsyncStorage after firebaseLogin()',
    location: 'src/services/yoraaAPI.js - firebaseLogin() method',
    fix: 'Ensure AsyncStorage.setItem("userToken", token) is called',
    debug: 'Add console.log before and after AsyncStorage.setItem()'
  },
  {
    scenario: 'Scenario 2: Backend Token Not Loading on App Start',
    symptom: 'User sees "Guest User" immediately on app open',
    cause: 'yoraaAPI.initialize() not loading token from AsyncStorage',
    location: 'App.js - initializeAuth() or yoraaAPI.initialize()',
    fix: 'Verify token is loaded: this.userToken = await AsyncStorage.getItem("userToken")',
    debug: 'Log yoraaAPI.userToken immediately after initialize()'
  },
  {
    scenario: 'Scenario 3: Race Condition - Profile Loads Before Backend Auth',
    symptom: 'User sees "Guest User" briefly, then correct name appears',
    cause: 'ProfileScreen renders before authManager.syncBackendAuth() completes',
    location: 'src/screens/ProfileScreen.js - loadUserName()',
    fix: 'Ensure syncBackendAuth() is awaited before loading profile',
    debug: 'Add loading state while backend syncs'
  },
  {
    scenario: 'Scenario 4: Backend Auth Fails Silently',
    symptom: 'Firebase auth succeeds but backend returns error',
    cause: 'yoraaAPI.firebaseLogin() catches error but doesn\'t throw',
    location: 'src/services/yoraaAPI.js - firebaseLogin()',
    fix: 'Ensure errors are thrown, not just logged',
    debug: 'Check backend response in catch block'
  },
  {
    scenario: 'Scenario 5: Session Exists but Backend Token Missing',
    symptom: 'sessionData exists but yoraaAPI.userToken is null',
    cause: 'Session created but firebaseLogin() failed',
    location: 'src/services/authManager.js - onAuthStateChanged',
    fix: 'Verify firebaseLogin() succeeds before creating session',
    debug: 'Log yoraaAPI.isAuthenticated() after firebaseLogin()'
  }
];

scenarios.forEach((s, index) => {
  console.log(`\n${index + 1}. ${s.scenario}`);
  console.log(`   Symptom: ${s.symptom}`);
  console.log(`   Cause: ${s.cause}`);
  console.log(`   Location: ${s.location}`);
  console.log(`   Fix: ${s.fix}`);
  console.log(`   Debug: ${s.debug}`);
});

console.log('\n' + '='.repeat(60));
console.log('DEBUG LOGGING TO ADD');
console.log('='.repeat(60));

const debugLogs = [
  {
    location: 'App.js - after yoraaAPI.initialize()',
    code: `
const debugTokenStatus = await yoraaAPI.debugTokenStatus();
console.log('🔍 Token status after init:', debugTokenStatus);
    `.trim()
  },
  {
    location: 'ProfileScreen.js - before loadUserProfile()',
    code: `
const authStatus = await authManager.getAuthStatus();
console.log('🔍 Auth status in ProfileScreen:', authStatus);
    `.trim()
  },
  {
    location: 'authManager.js - after firebaseLogin()',
    code: `
const backendAuth = yoraaAPI.isAuthenticated();
console.log('🔍 Backend auth after firebaseLogin:', backendAuth);
    `.trim()
  }
];

debugLogs.forEach((log, index) => {
  console.log(`\n${index + 1}. ${log.location}`);
  console.log(`   Add this code:\n${log.code}`);
});

console.log('\n' + '='.repeat(60));
console.log('TESTFLIGHT TESTING STEPS');
console.log('='.repeat(60));

const testingSteps = [
  '1. Install app fresh from TestFlight',
  '2. Open app - verify "Guest User" is shown',
  '3. Navigate to Profile screen - verify "Guest User" is shown',
  '4. Tap "Edit Profile" - should navigate without errors',
  '5. Navigate back and tap login button',
  '6. Complete login flow (email + OTP or social login)',
  '7. After successful login, check Profile screen',
  '   Expected: User\'s actual name should be displayed',
  '   Bug: Shows "Guest User" instead',
  '8. Close app completely (swipe up from app switcher)',
  '9. Reopen app from TestFlight',
  '10. Check Profile screen immediately',
  '    Expected: User\'s name still shown (session persisted)',
  '    Bug: Shows "Guest User" (backend token not loaded)',
  '11. Try to access chat or other authenticated features',
  '    Expected: Works normally',
  '    Bug: Shows "Authentication needed" error',
  '',
  'COLLECT THESE LOGS:',
  '- Firebase auth state on app start',
  '- yoraaAPI.userToken value after initialize()',
  '- sessionData from AsyncStorage',
  '- Backend auth sync success/failure',
  '- Profile screen loadUserName() logs'
];

testingSteps.forEach(step => console.log(step));

console.log('\n' + '='.repeat(60));
console.log('QUICK FIX VERIFICATION');
console.log('='.repeat(60));

console.log('\nAfter applying the fixes, verify these files were updated:\n');

const filesToCheck = [
  {
    file: 'src/services/authManager.js',
    method: 'syncBackendAuth()',
    expected: 'Should have retry logic with exponential backoff'
  },
  {
    file: 'src/screens/ProfileScreen.js',
    method: 'loadUserName()',
    expected: 'Should check yoraaAPI.isAuthenticated() and call syncBackendAuth()'
  },
  {
    file: 'src/screens/EditProfile.js',
    method: 'loadUserProfile()',
    expected: 'Should ensure backend auth before loading profile'
  },
  {
    file: 'src/services/sessionManager.js',
    method: 'isSessionValid()',
    expected: 'Should validate backend auth and retry if needed'
  },
  {
    file: 'App.js',
    location: 'initializeAuth()',
    expected: 'Should sync backend auth if Firebase user exists on app start'
  }
];

filesToCheck.forEach((check, index) => {
  console.log(`${index + 1}. ${check.file}`);
  console.log(`   Method/Location: ${check.method || check.location}`);
  console.log(`   Expected: ${check.expected}\n`);
});

console.log('='.repeat(60));
console.log('NEXT STEPS');
console.log('='.repeat(60));

console.log(`
1. Build the app with these changes
2. Upload to TestFlight
3. Install on a test device
4. Monitor Xcode console logs while testing
5. Focus on these log messages:
   - "Backend auth status:" messages
   - "Backend sync failed" warnings
   - "Backend token synced" confirmations
   - yoraaAPI.isAuthenticated() results

6. If issue persists, add temporary Alert.alert() in ProfileScreen
   to show authentication status:
   
   Alert.alert('Debug', \`
     Firebase User: \${!!auth().currentUser}
     Backend Auth: \${yoraaAPI.isAuthenticated()}
     Session Valid: \${await sessionManager.isSessionValid()}
   \`);

7. Report findings and check logs for specific failure point
`);

console.log('\n✅ Debug utility complete\n');
