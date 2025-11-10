import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HeartIcon = ({ size = 23, color = '#000000', filled = false }) => {
  // Calculate the scale factor based on the desired size vs original size (23x23)
  const scale = size / 23;
  
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 23 23" 
      fill="none"
      style={{ transform: [{ scale }] }}
    >
      <Path 
        d="M2.65666 3.61494C0.392237 5.87937 0.392239 9.55072 2.65666 11.8151L11.4396 20.5981L11.5 20.5377L11.5604 20.5982L20.3434 11.8152C22.6078 9.5508 22.6078 5.87944 20.3434 3.61502C18.079 1.35059 14.4076 1.3506 12.1432 3.61502L11.8536 3.90461C11.6584 4.09987 11.3418 4.09987 11.1465 3.90461L10.8569 3.61494C8.59244 1.35052 4.92108 1.35052 2.65666 3.61494Z" 
        stroke={color} 
        fill={filled ? color : 'none'}
        strokeWidth="1.5"
      />
    </Svg>
  );
};

export default HeartIcon;
