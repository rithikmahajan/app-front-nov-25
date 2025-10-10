import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const VisaIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#1A1F71"/>
    <Path 
      d="M9.5 4.5h1.2l-.75 5h-1.2l.75-5zm2.8 0h1.1l.5 3.2.5-3.2h1.1l-.9 5h-1l-.4-2.7-.4 2.7h-1l-.9-5zm-4.8 0h1.1l-.2 1.2h.8l-.1.8h-.8l-.2 1.2h.9l-.1.8h-2l.6-4zm-2.2 0h1l-.15 1h.7l.15-1h1l-.6 4h-1l.2-1.2h-.7l-.2 1.2h-1l.6-4z" 
      fill="white"
    />
  </Svg>
);

export const MasterCardIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#EB001B"/>
    <Path 
      d="M10 3a4 4 0 0 0-1.8 7.6A4 4 0 0 0 10 11a4 4 0 0 0 1.8-.4A4 4 0 0 0 10 3z" 
      fill="#FF5F00"
    />
    <Path 
      d="M14 3a4 4 0 0 1 1.8 7.6A4 4 0 0 1 14 11a4 4 0 0 1-1.8-.4A4 4 0 0 1 14 3z" 
      fill="#F79E1B"
    />
  </Svg>
);

export const AmexIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#006FCF"/>
    <Path 
      d="M5 4.5h2l.3.8.3-.8h2v5h-1.2v-3l-.4 1h-.8l-.4-1v3H5v-5zm4.5 0h3v.8h-1.8v.8h1.7v.8h-1.7v.8h1.8v.8h-3v-5zm4 0h1.2l.8 1.5v-1.5h1.2l.4.8.4-.8h1.2v5h-1.2l-.4-.8-.4.8h-1.2v-1.5l-.8 1.5h-1.2v-5z" 
      fill="white"
    />
  </Svg>
);

export const PayPalIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#003087"/>
    <Path 
      d="M6 4h2.5c1.4 0 2.5.6 2.5 2s-1.1 2-2.5 2h-1L7.2 10H6L6 4zm1.2 3h1c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1l.1 1.6zm4-3h1.2L12.1 6h1.4c1.4 0 2.5.6 2.5 2s-1.1 2-2.5 2h-1l-.3 2h-1.2l.8-6zm1.3 3h1c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1l.1 1.6z" 
      fill="#009CDE"
    />
  </Svg>
);

export const DiscoverIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#FF6000"/>
    <Path 
      d="M3 5h3.5c1.4 0 2.5 1.1 2.5 2.5S7.9 10 6.5 10H3V5zm1.2 1v3h2.3c.7 0 1.3-.6 1.3-1.5S7.2 6 6.5 6H4.2zm5.8-1h1.2V10H10V5zm2 0h1.2l1.5 3V5h1.2v5h-1.2l-1.5-3v3H12V5zm4 0h3v1h-1.8v1h1.7v1h-1.7v1h1.8v1h-3V5z" 
      fill="white"
    />
  </Svg>
);

export const GooglePayIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#5F6368"/>
    <Path 
      d="M6 4.5h2.5c1 0 1.8.4 1.8 1.3 0 .5-.3.9-.7 1.1.5.2.9.6.9 1.2 0 1-.8 1.4-1.9 1.4H6v-5zm1.2 2h1.2c.4 0 .7-.2.7-.6s-.3-.6-.7-.6H7.2v1.2zm0 2.2h1.3c.5 0 .8-.2.8-.7s-.3-.7-.8-.7H7.2v1.4zm4.8-4.2h2.5c1.4 0 2.5.6 2.5 2s-1.1 2-2.5 2h-1L13.2 10H12l.8-5.5zm1.3 3h1c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1l.1 1.6zm4-3h1.2l-.3 2.2 1.4-2.2h1.4l-1.8 2.5 1.1 2.5h-1.4l-.7-1.7-.7 1.7h-1.4l1.5-3.5L18 4.5z" 
      fill="white"
    />
  </Svg>
);

export const ApplePayIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#000000"/>
    <Path 
      d="M8.5 4.2c.3-.4.5-.9.4-1.4-.4 0-.9.3-1.2.6-.3.3-.5.8-.4 1.3.5 0 .9-.2 1.2-.5zm.4 1c-.7 0-1.3.4-1.6.4s-.9-.4-1.5-.4c-.8 0-1.5.4-1.9 1.1-.8 1.4-.2 3.5.6 4.6.4.6.9 1.2 1.5 1.2s.8-.4 1.5-.4.9.4 1.5.4 1-.6 1.4-1.2c.5-.7.7-1.4.7-1.4s-1.4-.5-1.4-2.1c0-1.4 1.1-2.1 1.1-2.1s-.6-1.1-1.6-1.1h-.3zm6.5 0h1.8c.6 0 1 .4 1 1s-.4 1-1 1h-1.8v3h-1.2v-5zm1.2 1.6h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-.5v1zm2.4-1.6h1.2l.8 3.2.8-3.2h1.2l-1.4 5h-1.2l-1.4-5z" 
      fill="white"
    />
  </Svg>
);

export const DinersIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#0079BE"/>
    <Path 
      d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-1.5 2v4a2.5 2.5 0 0 1 0-4zm3 0a2.5 2.5 0 0 1 0 4V5z" 
      fill="white"
    />
  </Svg>
);

export const UnionPayIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#E21836"/>
    <Path 
      d="M4 4.5h1.2l.8 3.2.8-3.2h1.2v5H7v-3.8l-.7 2.8h-.6l-.7-2.8v3.8H4v-5zm5 0h1.2v3.2l1-3.2h1.2v5h-1v-3.8l-.9 3.8h-.5v-5zm4 0h2.5v1h-1.3v1h1.2v1h-1.2v1h1.3v1H13v-5zm3 0h1v2h1v-2h1v5h-1v-2h-1v2h-1v-5z" 
      fill="white"
    />
  </Svg>
);

export const JCBIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#004A9F"/>
    <Path 
      d="M5 4.5h1.2v3.2c0 .8.4 1.3 1.1 1.3s1.1-.5 1.1-1.3V4.5h1.2v3.2c0 1.5-.9 2.3-2.3 2.3s-2.3-.8-2.3-2.3V4.5zm5.5 0h2.5c1.1 0 2 .9 2 2v.5c0 1.1-.9 2-2 2h-2.5v-4.5zm1.2 1v2.5h1.3c.4 0 .8-.4.8-.8v-.9c0-.4-.4-.8-.8-.8h-1.3zm4-1h3v1h-1.8v.8h1.7v.8h-1.7v.9h1.8v1h-3v-4.5z" 
      fill="white"
    />
  </Svg>
);

export const MetroIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#CC0000"/>
    <Path 
      d="M4 4.5h1.8l.7 2.5.7-2.5h1.8v5H7.8v-3l-.6 2h-.4l-.6-2v3H4v-5zm6 0h1.2v2h1.6v-2h1.2v5h-1.2v-2H11.2v2H10v-5zm5 0h3v1h-1.8v.8h1.7v.8h-1.7v.9h1.8v1h-3v-4.5z" 
      fill="white"
    />
  </Svg>
);

export const MaestroIcon = ({ width = 24, height = 14 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 14" fill="none">
    <Rect width="24" height="14" rx="2" fill="#6C6BBD"/>
    <Path 
      d="M10 3a4 4 0 0 0-1.8 7.6A4 4 0 0 0 10 11a4 4 0 0 0 1.8-.4A4 4 0 0 0 10 3z" 
      fill="#ED0006"
    />
    <Path 
      d="M14 3a4 4 0 0 1 1.8 7.6A4 4 0 0 1 14 11a4 4 0 0 1-1.8-.4A4 4 0 0 1 14 3z" 
      fill="#0099DF"
    />
  </Svg>
);
