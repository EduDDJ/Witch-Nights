import React from 'react';

interface VampireFangsIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Minimalistic Vampire Fangs Icon:
 * Two big upside down equilateral triangles separated by four smaller upside down equilateral triangles in between them, all touching each other.
 */
export const VampireFangsIcon: React.FC<VampireFangsIconProps> = ({
  className = 'w-5 h-5',
  style,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* 
        6 touching upside-down triangles along y=5 to y=19:
        1. Big Fang (Left): x=2 to x=7, vertex at (4.5, 19)
        2. Small Triangle 1: x=7 to x=9.5, vertex at (8.25, 13)
        3. Small Triangle 2: x=9.5 to x=12, vertex at (10.75, 13)
        4. Small Triangle 3: x=12 to x=14.5, vertex at (13.25, 13)
        5. Small Triangle 4: x=14.5 to x=17, vertex at (15.75, 13)
        6. Big Fang (Right): x=17 to x=22, vertex at (19.5, 19)
      */}
      <polygon points="2,5 7,5 4.5,19" fillOpacity="0.9" />
      <polygon points="7,5 9.5,5 8.25,13" fillOpacity="0.6" />
      <polygon points="9.5,5 12,5 10.75,13" fillOpacity="0.6" />
      <polygon points="12,5 14.5,5 13.25,13" fillOpacity="0.6" />
      <polygon points="14.5,5 17,5 15.75,13" fillOpacity="0.6" />
      <polygon points="17,5 22,5 19.5,19" fillOpacity="0.9" />
    </svg>
  );
};
