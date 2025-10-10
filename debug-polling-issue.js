/**
 * Debug Script to Check Polling Issues
 * Run this in your React Native debugger console to check for polling issues
 */

// Check if there are multiple polling intervals running
console.log('=== POLLING DEBUG INFO ===');

// 1. Check ChatService state
import chatService from './src/services/chatService';

console.log('📊 Chat Service Status:');
console.log('- Active Session:', chatService.activeSession);
console.log('- Is Polling:', chatService.isPolling);
console.log('- Polling Interval:', chatService.messagePollingInterval);
console.log('- Last Message ID:', chatService.lastMessageId);
console.log('- Polling Delay:', chatService.pollingDelay);

// 2. Check if session is still active when it shouldn't be
if (chatService.activeSession) {
  console.log('🔍 Active Session Details:');
  console.log('- Session ID:', chatService.activeSession.sessionId);
  console.log('- Status:', chatService.activeSession.status);
  console.log('- Messages Count:', chatService.activeSession.messages?.length || 0);
  console.log('- Start Time:', chatService.activeSession.startTime);
  console.log('- End Time:', chatService.activeSession.endTime);
}

// 3. Check for memory leaks - multiple timeouts
const originalSetTimeout = global.setTimeout;
let timeoutCount = 0;

global.setTimeout = function(...args) {
  timeoutCount++;
  console.log(`⏰ Timeout created #${timeoutCount}:`, args[1]); // Log delay
  return originalSetTimeout.apply(this, args);
};

// Wait a few seconds and check timeout count
setTimeout(() => {
  console.log(`📈 Total timeouts created in last 10 seconds: ${timeoutCount}`);
  
  // Reset
  global.setTimeout = originalSetTimeout;
}, 10000);

console.log('=== END DEBUG INFO ===');
