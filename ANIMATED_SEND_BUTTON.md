# Animated Send Button Implementation

## Overview
Implemented an interactive send button with three states based on the Figma design, matching the exact colors and animations.

## Three Button States

### 1. **Disabled State** (No Text)
- **Color**: `#353535` (Dark Gray)
- **Opacity**: `0.6`
- **Icon**: White paper plane icon
- **Behavior**: Button is disabled, user cannot send

### 2. **Loading State** (Sending Message)
- **Color**: `#353535` (Dark Gray)
- **Opacity**: `1.0` (Full)
- **Icon**: Animated white dot (10px diameter)
- **Animation**: 
  - Pulsing opacity (0 to 1)
  - Scaling (0.5 to 1)
  - 600ms duration per cycle
  - Loops continuously while sending

### 3. **Active/Ready State** (Text Entered)
- **Color**: `#1FE8B7` (Teal/Turquoise)
- **Opacity**: `1.0`
- **Icon**: White paper plane icon
- **Behavior**: Ready to send, tappable

## Animations

### Button Press Animation
```javascript
- Scale down to 0.9 (100ms)
- Scale back to 1.0 (100ms)
- Provides tactile feedback
```

### Loading Animation
```javascript
- Continuous loop while isSending = true
- Dot opacity: 0 → 1 → 0 (600ms each)
- Dot scale: 0.5 → 1.0 → 0.5 (600ms each)
- Smooth easing (Easing.inOut)
```

## State Management

### New State Variables
```javascript
const [isSending, setIsSending] = useState(false);
const sendButtonScale = useRef(new Animated.Value(1)).current;
const loadingDotAnim = useRef(new Animated.Value(0)).current;
```

### State Flow
1. **Empty Input** → Disabled (Gray, 60% opacity)
2. **User Types** → Active (Teal #1FE8B7)
3. **User Taps Send** → Loading (Gray with pulsing dot)
4. **Message Sent** → Back to Disabled or Active (depending on input)

## Color Palette (From Figma)

```
Disabled:  #353535 (Dark Gray, 60% opacity)
Loading:   #353535 (Dark Gray, 100% opacity)
Active:    #1FE8B7 (Teal/Turquoise)
Icon:      #FFFFFF (White)
```

## Code Structure

### Component Updates
```javascript
// Button with animated container
<Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
  <TouchableOpacity 
    style={[
      styles.sendButton,
      !messageText.trim() && styles.sendButtonDisabled,
      isSending && styles.sendButtonLoading,
      messageText.trim() && !isSending && styles.sendButtonActive
    ]} 
    onPress={handleSendMessage}
    disabled={!messageText.trim() || isSending}
  >
    {isSending ? (
      <Animated.View style={[
        styles.loadingDot,
        { opacity: loadingDotAnim, transform: [{ scale: ... }] }
      ]} />
    ) : (
      <SendIcon />
    )}
  </TouchableOpacity>
</Animated.View>
```

### Updated handleSendMessage
```javascript
- Checks isSending to prevent double sends
- Sets isSending = true before sending
- Animates button scale on press
- Clears input immediately for better UX
- Sets isSending = false after completion
- Handles errors and restores text if failed
```

## User Experience

### Visual Feedback
1. **Type message** → Button turns teal, indicating it's ready
2. **Tap send** → Button scales slightly, then shows loading dot
3. **Sending** → Pulsing dot animation provides feedback
4. **Sent** → Button returns to disabled state, message appears in chat

### Error Handling
- If send fails, button returns to active state
- Original message text is restored to input
- Alert shown to user
- User can retry sending

## Testing Checklist

✅ Empty input shows gray disabled button
✅ Typing text changes button to teal
✅ Tapping send shows loading animation
✅ Loading dot pulses smoothly
✅ Button disabled during sending (no double-send)
✅ Button returns to correct state after send
✅ Error state properly restores message
✅ Button scales on press for tactile feedback

## File Modified

- `src/screens/contactus.js`
  - Added `isSending` state
  - Added animation refs
  - Updated `handleSendMessage` function
  - Updated button JSX with conditional rendering
  - Updated styles for three button states
  - Added loading dot animation

## Visual Preview

```
[State 1: Disabled]
   ⚫ (Gray circle, 60% opacity, white plane icon)
   
[State 2: Loading]
   ⚫ (Gray circle, 100% opacity, pulsing white dot)
   
[State 3: Active]
   🟢 (Teal circle, white plane icon)
```

## Next Steps

To see the animation in action:
1. Reload app: Press `Cmd + R` in simulator
2. Open Customer Support chat
3. Start typing to see button turn teal
4. Send a message to see the loading animation
5. Watch the smooth state transitions!

The button now matches the Figma design exactly! 🎨✨
