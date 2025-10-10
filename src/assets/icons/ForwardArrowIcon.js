import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ForwardArrowIcon = ({ color = '#000000', size = 14 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M5.25 2.625L9.625 7L5.25 11.375"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ForwardArrowIcon;
