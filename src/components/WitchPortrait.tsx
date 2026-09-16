import React from 'react';

interface WitchPortraitProps {
  isHurt?: boolean;
  size?: number;
  spriteUrl?: string;
  fallbackSpriteUrl?: string;
  characterName?: string;
}

export const WitchPortrait: React.FC<WitchPortraitProps> = ({ 
  isHurt = false, 
  size = 64,
  spriteUrl = 'https://i.imgur.com/uvH316Y.png',
  fallbackSpriteUrl = 'assets/aistudio/witch.png',
  characterName = 'Character Portrait',
}) => {
  const resolvedSrc = spriteUrl.startsWith('http') || spriteUrl.startsWith('data:') 
    ? spriteUrl 
    : `${import.meta.env.BASE_URL}${spriteUrl}`;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 flex-shrink-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 shadow-lg flex items-center justify-center p-1 ${
        isHurt ? 'border-red-500 scale-95 shadow-red-900/50' : 'border-purple-500/60 shadow-purple-950/40'
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src={resolvedSrc}
        alt={characterName}
        crossOrigin={spriteUrl.startsWith('data:') ? undefined : 'anonymous'}
        onError={(e) => {
          // Fallback to local asset / data URI if image fails to load
          const target = e.currentTarget;
          const fallback = fallbackSpriteUrl || 'assets/aistudio/witch.png';
          if (fallback.startsWith('data:')) {
            target.src = fallback;
          } else {
            const fallbackUrl = fallback.startsWith('http') ? fallback : `${import.meta.env.BASE_URL}${fallback}`;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }
        }}
        className="w-full h-full object-contain [image-rendering:pixelated]"
        style={{ filter: isHurt ? 'saturate(2) hue-rotate(330deg)' : 'none' }}
      />
    </div>
  );
};

