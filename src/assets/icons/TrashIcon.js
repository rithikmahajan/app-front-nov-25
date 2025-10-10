import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const TrashIcon = ({ size = 34 }) => (
  <Svg width={size} height={size} viewBox="0 0 34 34">
    {/* White circular background */}
    <Circle
      cx="17"
      cy="17"
      r="17"
      fill="white"
    />
    {/* Top horizontal line */}
    <Path
      d="M10.25 12.5H11.75H23.75"
      stroke="#CA3327"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Trash can body and lid */}
    <Path
      d="M22.25 12.5V23C22.25 23.3978 22.092 23.7794 21.8107 24.0607C21.5294 24.342 21.1478 24.5 20.75 24.5H13.25C12.8522 24.5 12.4706 24.342 12.1893 24.0607C11.908 23.7794 11.75 23.3978 11.75 23V12.5M14 12.5V11C14 10.6022 14.158 10.2206 14.4393 9.93934C14.7206 9.65804 15.1022 9.5 15.5 9.5H18.5C18.8978 9.5 19.2794 9.65804 19.5607 9.93934C19.842 10.2206 20 10.6022 20 11V12.5"
      stroke="#CA3327"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export default TrashIcon;
