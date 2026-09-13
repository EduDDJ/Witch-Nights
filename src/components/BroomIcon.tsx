import React from 'react';

interface BroomIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom Witch's Broom Icon component:
 * Features a diagonal wooden broom handle with bound straw bristles.
 */
export const BroomIcon: React.FC<BroomIconProps> = ({
  className = 'w-5 h-5',
  style,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Wooden Broom Handle extending diagonally from top right to center left */}
      <line x1="20" y1="4" x2="9" y2="15" strokeWidth="2.2" />

      {/* Twine / Leather Binding Ring wrapping the bristles */}
      <line x1="8" y1="14" x2="10" y2="16" strokeWidth="2.6" />

      {/* Straw Bristle Fan Fill */}
      <path d="M9 15 L3 18 L5 21 L10 16 Z" fill="currentColor" fillOpacity="0.3" />

      {/* Individual Straw Bristle Lines */}
      <path d="M9 15 L3 18" />
      <path d="M8.5 15.5 L3.5 19.5" />
      <path d="M9.5 14.5 L4.5 21" />
      <path d="M10 16 L5 21" />

      {/* Wind / Magic Motion Trail Accents */}
      <path d="M16 3 L19 2" strokeWidth="1.2" opacity="0.75" />
      <path d="M21 5 L22 8" strokeWidth="1.2" opacity="0.75" />
    </svg>
  );
};
