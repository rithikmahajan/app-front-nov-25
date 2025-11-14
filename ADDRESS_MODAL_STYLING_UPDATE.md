# Address Modal Styling Update - Figma Match

## Overview
Updated the Address modal in `src/screens/editprofile.js` to match the Figma design specifications, including full-screen modal selectors for State and Country Code similar to the login screen.

## Latest Fix (Modal Nesting) ✅
**Issue**: State and Country Code FlatList modals were not opening
**Solution**: Moved the selector modals INSIDE the Address Modal as nested modals
- ✅ State Selection Modal now nested inside Address Modal
- ✅ Country Code Selection Modal now nested inside Address Modal
- ✅ React Native requires child modals to be nested, not siblings
- ✅ Modals now open smoothly on top of Address Modal

## Latest Updates (Modal-Based Selectors)

### Full-Screen Modal Selectors
- ✅ Replaced inline dropdowns with full-screen modal selectors
- ✅ State selector now opens in a modal with FlatList (like login screen)
- ✅ Country Code selector now opens in a modal with FlatList
- ✅ Added swipe indicator at top of modals
- ✅ "Select State" / "Select Country" titles with "Done" button
- ✅ Smooth animations with slide presentation style
- ✅ Comprehensive state list (all 28 Indian states + 8 union territories)

## Latest Updates (Dropdown Icons)

### Chevron Down Icon
- ✅ Created new `ChevronDownIcon` component using SVG
- ✅ SVG path matches Figma specifications exactly:
  - ViewBox: 0 0 18 18
  - Path: M4.5 6.75L9 11.25L13.5 6.75
  - Stroke: 2px with round linecap and linejoin
- ✅ Replaced text arrow "▼" with proper SVG icon
- ✅ Applied to both State dropdown and Phone country code dropdown
- ✅ Icon size: 18px, color: #000000

## Changes Made

### 1. **Modal Header**
- ✅ Centered title "Address" with proper positioning
- ✅ Back button positioned absolutely on the left
- ✅ Updated padding: `paddingTop: 54px`, `paddingBottom: 12px`
- ✅ Font: Montserrat-Medium, 20px, letterSpacing: -0.5

### 2. **Input Fields**
- ✅ Border: 1px (instead of 2px)
- ✅ Border color: `#979797` (instead of #000000)
- ✅ Border radius: 12px
- ✅ Height: 47px (fixed)
- ✅ Padding: 19px horizontal, 15px vertical
- ✅ Font size: 14px with letterSpacing: -0.35
- ✅ Font family: Montserrat-Regular
- ✅ Spacing between inputs: 12px margin-bottom

### 3. **Form Container**
- ✅ Padding: 24px horizontal, 33px top
- ✅ Background: white with rounded top corners (22px)

### 4. **State Dropdown**
- ✅ Two-line layout with label "State" on top
- ✅ Label: 12px, Montserrat-Regular, letterSpacing: -0.3
- ✅ Value: 14px, Montserrat-Medium, letterSpacing: -0.35
- ✅ Dropdown arrow: ▼ (14px, black)
- ✅ Vertical padding adjusted to fit content properly

### 5. **Phone Input**
- ✅ Combined container with country code and phone number
- ✅ Two-section layout with visual divider (1px line)
- ✅ Country code section:
  - Label "Phone" on top (12px)
  - Flag emoji + country code (14px, Montserrat-Medium)
  - Dropdown arrow
- ✅ Phone number input on right side with placeholder "1234567890"

### 6. **Dropdown Options**
- ✅ Border: 1px, color `#979797`
- ✅ Border radius: 12px
- ✅ Top position: 50px (adjusted)
- ✅ Option padding: 12px vertical, 19px horizontal
- ✅ Subtle border between options: 0.5px

### 7. **Done Button**
- ✅ Background: black (#000000)
- ✅ Border radius: 100px (fully rounded)
- ✅ Padding: 16px vertical
- ✅ Text: white, 16px, Montserrat-Medium
- ✅ Container padding: 20px horizontal, 30px vertical

## Visual Design Match

### Colors
- **Primary Black**: `#000000` (button, focused inputs, text)
- **Gray Border**: `#979797` (default input borders)
- **White Background**: `#FFFFFF`

### Typography
- **Montserrat-Medium**: Titles, values, button text
- **Montserrat-Regular**: Labels, placeholders, regular text

### Spacing
- **Input height**: 47px (consistent)
- **Input spacing**: 12px between fields
- **Border radius**: 12px for inputs, 100px for button
- **Padding**: Consistent 19px horizontal for inputs

## Files Modified
- `src/screens/editprofile.js` (styles and JSX structure)
- `src/assets/icons/ChevronDownIcon.js` (new SVG icon component)

## Testing Recommendations
1. Open the Address modal from Edit Profile screen
2. Verify all input fields have correct styling
3. Test State dropdown functionality
4. Test Country Code dropdown in phone field
5. Verify back button and Done button work correctly
6. Check spacing and alignment match Figma
7. Test on both iOS and Android devices

## Notes
- The first input field can have a focused state with 2px black border (as shown in Figma)
- All measurements follow Figma specs precisely
- Font weights and letter spacing match design system
- Dropdown arrows use Unicode character ▼ for consistency
