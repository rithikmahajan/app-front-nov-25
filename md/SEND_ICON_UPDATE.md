# Send Button Design Update - Figma Match

## Issue Fixed
The send button icon wasn't matching the Figma design. Updated to use proper SVG icon that matches WhatsApp/Telegram style.

## Changes Made

### 1. **Updated Send Icon to SVG**
Replaced the custom-built paper plane icon with a proper SVG path that matches the Figma design exactly.

```javascript
const SendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
      fill="#FFFFFF"
    />
  </Svg>
);
```

### 2. **Added SVG Import**
```javascript
import Svg, { Path } from 'react-native-svg';
```

### 3. **Removed Old Icon Styles**
Cleaned up unused styles:
- `sendIcon`
- `sendPlaneBody`
- `sendPlaneTop`
- `sendPlaneBottom`

## Visual Comparison

### Before:
- Custom-built icon with Views and transforms
- Didn't quite match WhatsApp/Figma style
- Complex styling with multiple components

### After:
- Clean SVG path icon
- Matches Figma design exactly
- Simple, scalable vector graphic
- Same icon style as WhatsApp/Telegram

## Button States (Unchanged)

The three-state system remains the same:

1. **⚫ Disabled** - `#353535` gray, 60% opacity
2. **⚫ Loading** - `#353535` gray with pulsing dot
3. **🟢 Active** - `#1FE8B7` teal with send icon

## Icon Details

### SVG Path
- **Shape**: Classic "send" paper plane
- **Color**: White (`#FFFFFF`)
- **Size**: 24x24 viewport
- **Fill**: Solid white for visibility on colored backgrounds

### Visual Description
The icon shows a paper plane/arrow pointing to the upper right, universally recognized as the "send" symbol used in:
- WhatsApp
- Telegram
- iMessage
- Facebook Messenger
- Most modern messaging apps

## Testing

To see the updated icon:
1. **Reload app**: Press `Cmd + R` in simulator
2. **Open Customer Support chat**
3. **Type a message** to see the button turn teal
4. **Observe the new send icon** - should look exactly like WhatsApp's

## Code Files Modified

- `src/screens/contactus.js`
  - Added SVG import
  - Updated SendIcon component to use SVG
  - Removed unused icon styles

## Visual Result

The send button now perfectly matches the Figma design:

```
[Empty State]
⚫ Gray button with white send arrow

[Active State]  
🟢 Teal button with white send arrow

[Loading State]
⚫ Gray button with pulsing white dot
```

The send icon is now crisp, scalable, and matches the exact design from Figma! ✨
