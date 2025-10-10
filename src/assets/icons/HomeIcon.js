import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ active, color = '#848688', size = 18 }) => {
  const iconColor = active ? '#000000' : color;
  
  return (
    <Svg width={size} height={size * 1.176} viewBox="0 0 18 20" fill="none">
      <Path
        d="M1 19V9L8.5 2L17 9V16.5C17 17.1667 16.7 18.5 15.5 18.5C14.3 18.5 6.66667 18.5 3 18.5"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default HomeIcon;
