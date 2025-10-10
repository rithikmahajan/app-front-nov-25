import React from 'react';
import Svg, { Path } from 'react-native-svg';

const RightArrowIcon = ({ size = 24, color = '#292526' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M19.92 8.95L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.95" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10" 
        strokeWidth="1.5"
        // Rotate the path to point right
        transform="rotate(270 12 12)"
      />
    </Svg>
  );
};

export default RightArrowIcon;
