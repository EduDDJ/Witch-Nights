import React from 'react';

interface WitchPortraitProps {
  isHurt?: boolean;
  size?: number;
}

export const WitchPortrait: React.FC<WitchPortraitProps> = ({ isHurt = false, size = 64 }) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 flex-shrink-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 shadow-lg ${
        isHurt ? 'border-red-500 scale-95 shadow-red-900/50' : 'border-purple-500/60 shadow-purple-950/40'
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isHurt ? 'saturate(2) hue-rotate(330deg)' : 'none' }}
      >
        {/* Background occult aura */}
        <circle cx="50" cy="55" r="45" fill="#1e1035" />
        <circle cx="50" cy="50" r="38" fill="#2d134d" opacity="0.6" />

        {/* Raven Hair Back */}
        <path d="M 22 45 C 18 68, 22 90, 30 95 L 70 95 C 78 90, 82 68, 78 45 Z" fill="#181124" />

        {/* Face */}
        <ellipse cx="50" cy="56" rx="20" ry="24" fill="#fae8e0" />

        {/* Hair bangs */}
        <path d="M 30 46 C 40 50, 42 42, 50 48 C 58 42, 60 50, 70 46 C 70 38, 30 38, 30 46 Z" fill="#1f1630" />
        <path d="M 28 46 Q 24 64 29 76 Q 34 68 33 50 Z" fill="#1f1630" />
        <path d="M 72 46 Q 76 64 71 76 Q 66 68 67 50 Z" fill="#1f1630" />

        {/* Eyes (glowing purple/magenta) */}
        <ellipse cx="42" cy="56" rx="3.5" ry="4.5" fill="#a855f7" />
        <ellipse cx="58" cy="56" rx="3.5" ry="4.5" fill="#a855f7" />
        <circle cx="43" cy="55" r="1.4" fill="#ffffff" />
        <circle cx="59" cy="55" r="1.4" fill="#ffffff" />

        {/* Eyeliner/eyebrows */}
        <path d="M 37 50 Q 43 48 46 51" stroke="#3b0764" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 63 50 Q 57 48 54 51" stroke="#3b0764" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Lips */}
        <path d="M 46 68 Q 50 71 54 68" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Witch Hat Brim */}
        <ellipse cx="50" cy="39" rx="30" ry="8.5" fill="#110c1c" stroke="#581c87" strokeWidth="1.5" />
        {/* Hat Ribbon */}
        <path d="M 37 38 C 45 40, 55 40, 63 38 L 64 34.5 C 55 36.5, 45 36.5, 36 34.5 Z" fill="#c084fc" />
        {/* Hat Cone */}
        <path d="M 36 37 L 50 14 Q 52 13 54 15 L 64 37 Z" fill="#160f24" stroke="#581c87" strokeWidth="1" />
        {/* Hat Tip curve */}
        <path d="M 50 14 Q 56 10 61 14 Q 55 16 53 15 Z" fill="#160f24" />

        {/* Golden Buckle on Hat Ribbon */}
        <rect x="47.5" y="34.5" width="5" height="4.5" rx="1" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />

        {/* Mystical Rune forehead dot */}
        <circle cx="50" cy="48" r="1.5" fill="#d946ef" />
      </svg>
    </div>
  );
};
