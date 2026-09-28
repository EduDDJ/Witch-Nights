import React from 'react';
import { GameImage } from './GameImage';

interface PentagramIconProps {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const PentagramIcon: React.FC<PentagramIconProps> = ({
  className = 'w-5 h-5',
  style,
  ...props
}) => {
  return (
    <GameImage
      src="assets/aistudio/pentagram.png"
      fallbackSrc="assets/pentagram.png"
      alternateFallbacks={['https://i.imgur.com/DikcnTS.png']}
      alt="Pentagram"
      className={`${className || "w-full h-full object-contain"} [image-rendering:pixelated] drop-shadow-md`}
      style={style}
      {...props}
    />
  );
};
