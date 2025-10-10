import React from 'react';
import Svg, { Path } from 'react-native-svg';

const GlobalCartIcon = ({ size = 19, color = '#14142B' }) => (
  <Svg width={size} height={size} viewBox="0 0 19 19" fill="none">
    <Path 
      d="M16.2561 5.42468L16.8918 18.326H2.87622L3.51294 5.42468H16.2561Z" 
      stroke={color}
    />
    <Path 
      d="M6.46033 8.03472L6.46033 4.39489C6.46033 3.48684 6.82105 2.61598 7.46314 1.97388C8.10523 1.33179 8.9761 0.971069 9.88415 0.971069C10.7922 0.971069 11.6631 1.33179 12.3052 1.97388C12.9473 2.61598 13.308 3.48684 13.308 4.39489V8.03472" 
      stroke={color}
    />
  </Svg>
);

export default GlobalCartIcon;
