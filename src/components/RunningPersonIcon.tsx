import React from 'react';

interface RunningPersonIconProps {
  className?: string;
}

export const RunningPersonIcon: React.FC<RunningPersonIconProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <circle cx="16" cy="4.5" r="2" fill="currentColor" />
      {/* Torso */}
      <path d="M13.5 7.5 L11 12" />
      {/* Front Arm */}
      <path d="M13 8.5 L16.5 10 L18 8.5" />
      {/* Back Arm */}
      <path d="M12.5 9 L9 10.5 L7.5 9.5" />
      {/* Front Leg */}
      <path d="M11 12 L14.5 14.5 L12.5 19.5" />
      {/* Back Leg */}
      <path d="M11 12 L8 15 L5 16" />
    </svg>
  );
};
