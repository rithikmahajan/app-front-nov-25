import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const HeartFilledIcon = (props) => (
  <Svg width={21} height={21} viewBox="0 0 21 21" fill="none" {...props}>
    <G clipPath="url(#clip0_heart_filled)">
      <Path
        d="M10.5 17.7793L17.2759 10.9063C17.9871 10.1952 18.3866 9.23075 18.3866 8.22509C18.3866 7.21942 17.9871 6.25495 17.2759 5.54384C16.5648 4.83273 15.6004 4.43323 14.5947 4.43323C13.589 4.43323 12.6246 4.83273 11.9134 5.54384L10.5 6.8602L9.08661 5.54384C8.37549 4.83273 7.41102 4.43323 6.40536 4.43323C5.39969 4.43323 4.43522 4.83273 3.72411 5.54384C3.01299 6.25495 2.61349 7.21942 2.61349 8.22509C2.61349 9.23075 3.01299 10.1952 3.72411 10.9063L10.5 17.7793Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_heart_filled">
        <Rect width={19.4118} height={19.4118} fill="white" transform="translate(0.794128 0.794067)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default HeartFilledIcon;
