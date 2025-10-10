import React from 'react';
import Svg, { Path } from 'react-native-svg';

const NewIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 23 23" fill="none">
    <Path d="M2.65669 3.61494C0.392267 5.87937 0.392269 9.55072 2.65669 11.8151L11.4397 20.5981L11.5 20.5377L11.5605 20.5982L20.3435 11.8152C22.6079 9.5508 22.6079 5.87944 20.3435 3.61502C18.079 1.35059 14.4077 1.3506 12.1432 3.61502L11.8537 3.90461C11.6584 4.09987 11.3418 4.09987 11.1466 3.90461L10.8569 3.61494C8.59247 1.35052 4.92111 1.35052 2.65669 3.61494Z" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export default NewIcon;
