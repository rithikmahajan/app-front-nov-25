import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const LockIcon = ({ size = 23, color = 'black' }) => (
  <Svg width={size} height={size} viewBox="0 0 23 23" fill="none">
    <G clipPath="url(#clip0_533_7825)">
      <Path d="M19.5403 6.71155L20.2952 22.0387H3.63501L4.38989 6.71155H19.5403Z" stroke={color} strokeWidth={1.5}/>
      <Path d="M7.82043 9.72615L7.82043 5.32004C7.82043 4.22082 8.2571 3.16662 9.03437 2.38935C9.81164 1.61208 10.8658 1.17542 11.9651 1.17542C13.0643 1.17542 14.1185 1.61208 14.8958 2.38935C15.673 3.16662 16.1097 4.22082 16.1097 5.32004V9.72615" stroke={color} strokeWidth={1.5}/>
    </G>
    <Defs>
      <ClipPath id="clip0_533_7825">
        <Rect width={size} height={size} fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

export default LockIcon;
