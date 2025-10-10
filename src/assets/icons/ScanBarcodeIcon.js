import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const ScanBarcodeIcon = ({ width = 20, height = 20, color = '#000000' }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M2 2V6M2 2H6M2 2L6 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 2V6M18 2H14M18 2L14 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 18V14M2 18H6M2 18L6 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 18V14M18 18H14M18 18L14 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="7" y="8" width="1" height="4" fill={color} />
    <Rect x="9" y="8" width="1" height="4" fill={color} />
    <Rect x="11" y="8" width="1" height="4" fill={color} />
    <Rect x="13" y="8" width="1" height="4" fill={color} />
    <Rect x="8" y="8" width="0.5" height="4" fill={color} />
    <Rect x="10" y="8" width="0.5" height="4" fill={color} />
    <Rect x="12" y="8" width="0.5" height="4" fill={color} />
  </Svg>
);

export default ScanBarcodeIcon;
