import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChevronDownIcon = ({ color = '#000000', size = 18 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4.5 6.75L9 11.25L13.5 6.75"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronDownIcon;
