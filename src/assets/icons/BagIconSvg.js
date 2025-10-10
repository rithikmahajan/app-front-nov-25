import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const BagIconSvg = ({ size = 27, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 27 27" fill="none">
    <G clipPath="url(#clip0_10759_39807)">
      <Path 
        d="M22.8252 7.99829L23.6992 25.7522H4.39258L5.2666 7.99829H22.8252Z" 
        stroke={color} 
        strokeWidth="2"
      />
      <Path 
        d="M9.18066 11.4177L9.18066 6.24532C9.18066 4.95492 9.69327 3.71738 10.6057 2.80494C11.5182 1.89249 12.7557 1.37988 14.0461 1.37988C15.3365 1.37988 16.574 1.89249 17.4865 2.80494C18.3989 3.71738 18.9115 4.95492 18.9115 6.24532V11.4177" 
        stroke={color} 
        strokeWidth="2"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_10759_39807">
        <Rect width="27" height="27" fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

export default BagIconSvg;
