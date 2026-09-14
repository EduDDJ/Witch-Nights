import React from 'react';

interface WitchPortraitProps {
  isHurt?: boolean;
  size?: number;
}

export const WitchPortrait: React.FC<WitchPortraitProps> = ({ isHurt = false, size = 64 }) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 flex-shrink-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 shadow-lg flex items-center justify-center p-1 ${
        isHurt ? 'border-red-500 scale-95 shadow-red-900/50' : 'border-purple-500/60 shadow-purple-950/40'
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src="https://i.imgur.com/uvH316Y.png"
        alt="Witch Portrait"
        crossOrigin="anonymous"
        onError={(e) => {
          // Fallback to local asset if external image fails to load
          const target = e.currentTarget;
          if (!target.src.includes('1789315841509.png')) {
            target.src = `${import.meta.env.BASE_URL}assets/aistudio/1789315841509.png`;
          }
        }}
        className="w-full h-full object-contain [image-rendering:pixelated]"
        style={{ filter: isHurt ? 'saturate(2) hue-rotate(330deg)' : 'none' }}
      />
    </div>
  );
};
