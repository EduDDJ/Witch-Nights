import React from 'react';
import {
  Sparkles,
  Flame,
  Skull,
  Zap,
  Radio,
  Sprout,
  FlaskConical,
} from 'lucide-react';
import { GameImage } from './GameImage';
import { PentagramIcon } from './PentagramIcon';

export const SpectralArrowIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/spectral_arrow.png"
    fallbackSrc="assets/spectral_arrow.png"
    alternateFallbacks={['https://i.imgur.com/Xn8yFcZ.png']}
    alt="Spectral Arrow"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
    {...props}
  />
);

export const AstralBladeIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/astral_blade.png"
    fallbackSrc="assets/astral_blade.png"
    alternateFallbacks={['https://i.imgur.com/wP5Mlu1.png']}
    alt="Astral Blade"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md rotate-[45deg] scale-135 transform`}
    {...props}
  />
);

export const GrimoireIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/grimoire.png"
    fallbackSrc="assets/grimoire.png"
    alternateFallbacks={['https://i.imgur.com/VqRnYzc.png']}
    alt="Orbiting Grimoire"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
    {...props}
  />
);

export const StellarBeamIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/stellar_beam.png"
    fallbackSrc="assets/stellar_beam.png"
    alternateFallbacks={['https://i.imgur.com/3Op1go9.png']}
    alt="Stellar Beam"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
    {...props}
  />
);

export const SickleIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/sickle.png"
    fallbackSrc="assets/sickle.png"
    alternateFallbacks={['https://i.imgur.com/TYQ1jE7.png']}
    alt="Sickle"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
    {...props}
  />
);

export const ProtractorIcon: React.FC<any> = ({ className, ...props }) => (
  <GameImage
    src="assets/aistudio/protractor.png"
    fallbackSrc="assets/protractor.png"
    alternateFallbacks={['https://i.imgur.com/txF73Vo.png']}
    alt="Protractor"
    className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
    {...props}
  />
);

export const WEAPON_ICONS: Record<string, React.ElementType> = {
  Sparkles: StellarBeamIcon,
  Flame,
  Skull,
  BookOpen: GrimoireIcon,
  Crosshair: SpectralArrowIcon,
  Zap,
  Radio,
  Pentagram: PentagramIcon,
  Sword: AstralBladeIcon,
  Sprout,
  FlaskConical,
  Sickle: SickleIcon,
  Protractor: ProtractorIcon,
};
