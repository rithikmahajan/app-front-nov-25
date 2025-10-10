import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CameraIcon = ({ width = 20, height = 20, color = '#000000' }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M2 6C2 4.89543 2.89543 4 4 4H6L7 2H13L14 4H16C17.1046 4 18 4.89543 18 6V15C18 16.1046 17.1046 17 16 17H4C2.89543 17 2 16.1046 2 15V6Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 13.5C11.933 13.5 13.5 11.933 13.5 10C13.5 8.067 11.933 6.5 10 6.5C8.067 6.5 6.5 8.067 6.5 10C6.5 11.933 8.067 13.5 10 13.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CameraIcon;
