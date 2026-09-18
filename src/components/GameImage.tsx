import React, { useState, useEffect } from 'react';
import { resolveAssetPath } from '../utils/assets';

interface GameImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alternateFallbacks?: string[];
  alt: string;
  className?: string;
}

export const GameImage: React.FC<GameImageProps> = ({
  src,
  fallbackSrc,
  alternateFallbacks = [],
  alt,
  className = '',
  ...props
}) => {
  // Build ordered list of candidate URLs
  const candidates: string[] = [];

  const addCandidate = (url?: string) => {
    if (!url) return;
    const resolved = resolveAssetPath(url);
    if (resolved && !candidates.includes(resolved)) {
      candidates.push(resolved);
    }
    // Also include direct raw url if different from resolved
    if (url && !candidates.includes(url)) {
      candidates.push(url);
    }
  };

  addCandidate(src);
  if (fallbackSrc) addCandidate(fallbackSrc);
  alternateFallbacks.forEach(addCandidate);

  const [candidateIndex, setCandidateIndex] = useState(0);

  // Reset candidate index when primary src changes
  useEffect(() => {
    setCandidateIndex(0);
  }, [src]);

  const currentSrc = candidates[candidateIndex] || src;

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
      {...props}
    />
  );
};
