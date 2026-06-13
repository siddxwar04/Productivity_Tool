import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path, Rect } from 'react-native-svg';

interface StudyFlowLogoProps {
  size?: number;
}

export function StudyFlowLogo({ size = 72 }: StudyFlowLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Defs>
        <LinearGradient id="bookGradient" x1="8" y1="8" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#6C5CE7" />
          <Stop offset="1" stopColor="#A29BFE" />
        </LinearGradient>
      </Defs>

      {/* Back book */}
      <Path
        d="M10 16C10 13.7909 11.7909 12 14 12H34C36.2091 12 38 13.7909 38 16V54C38 56.2091 36.2091 58 34 58H14C11.7909 58 10 56.2091 10 54V16Z"
        fill="url(#bookGradient)"
        opacity={0.72}
      />
      <Rect x="18" y="20" width="3" height="28" rx="1.5" fill="#FFFFFF" opacity={0.35} />

      {/* Front book */}
      <Path
        d="M34 10C34 7.79086 35.7909 6 38 6H58C60.2091 6 62 7.79086 62 10V48C62 50.2091 60.2091 52 58 52H38C35.7909 52 34 50.2091 34 48V10Z"
        fill="url(#bookGradient)"
      />
      <Rect x="42" y="14" width="3" height="24" rx="1.5" fill="#FFFFFF" opacity={0.45} />

      {/* Page fold accent */}
      <Path
        d="M34 10L42 6V14L34 18V10Z"
        fill="#8B7FF0"
        opacity={0.9}
      />
    </Svg>
  );
}
