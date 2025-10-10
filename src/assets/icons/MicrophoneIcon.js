import React from 'react';
import Svg, { Path } from 'react-native-svg';

const MicrophoneIcon = ({ width = 20, height = 20, color = '#000000' }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 12C11.1046 12 12 11.1046 12 10V4C12 2.89543 11.1046 2 10 2C8.89543 2 8 2.89543 8 4V10C8 11.1046 8.89543 12 10 12Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 16V18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 18H12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MicrophoneIcon;
