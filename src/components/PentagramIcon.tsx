import React from 'react';

interface PentagramIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const PentagramIcon: React.FC<PentagramIconProps> = ({
  className = 'w-5 h-5',
  style,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Outer Circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Pentagram Star (Inverted) */}
      <path 
        d="M12 3.5 L17 18.88 L3.92 9.37 L20.08 9.37 L7 18.88 Z" 
        transform="rotate(180 12 12)"
      />
    </svg>
  );
};
