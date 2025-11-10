import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const GlobalCartIcon = ({ size = 23, color = '#000000', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 23 23" fill="none">
    <G clipPath="url(#clip0_646_9529)">
      <Path 
        d="M19.5403 6.71155L20.2952 22.0387H3.63501L4.38989 6.71155H19.5403Z" 
        stroke={color}
        strokeWidth="1.5"
        fill={filled ? color : 'none'}
      />
      <Path 
        d="M7.82037 9.72615L7.82037 5.32004C7.82037 4.22082 8.25704 3.16662 9.03431 2.38935C9.81158 1.61208 10.8658 1.17542 11.965 1.17542C13.0642 1.17542 14.1184 1.61208 14.8957 2.38935C15.673 3.16662 16.1096 4.22082 16.1096 5.32004V9.72615" 
        stroke={color}
        strokeWidth="1.5"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_646_9529">
        <Rect width="23" height="23" fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

export default GlobalCartIcon;
