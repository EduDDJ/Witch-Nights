import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  size?: number; // Outer base diameter in pixels
  className?: string;
  onMove?: (vector: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = 112,
  className = '',
  onMove,
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);

  const maxRadius = (size / 2) - 16; // Max travel distance for knob

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      let clampedX = dx;
      let clampedY = dy;
      if (dist > maxRadius) {
        clampedX = (dx / dist) * maxRadius;
        clampedY = (dy / dist) * maxRadius;
      }

      setKnobPos({ x: clampedX, y: clampedY });

      // Normalized direction vector (-1 to 1)
      const normX = clampedX / maxRadius;
      const normY = clampedY / maxRadius;

      const vector = { x: normX, y: normY };
      if (onMove) {
        onMove(vector);
      }
      window.dispatchEvent(new CustomEvent('joystick-move', { detail: vector }));
    },
    [maxRadius, onMove]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId && activePointerIdRef.current !== null) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }
    activePointerIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });

    const zeroVector = { x: 0, y: 0 };
    if (onMove) {
      onMove(zeroVector);
    }
    window.dispatchEvent(new CustomEvent('joystick-move', { detail: zeroVector }));
  };

  // Reset if unmounted
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('joystick-move', { detail: { x: 0, y: 0 } }));
    };
  }, []);

  return (
    <div
      id="virtual-joystick-container"
      className={`relative select-none touch-none ${className}`}
    >
      <div
        ref={baseRef}
        id="virtual-joystick-base"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="relative rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-purple-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.85)] flex items-center justify-center cursor-grab active:cursor-grabbing group transition-colors duration-150 hover:border-purple-400/80"
      >
        {/* Subtle Cardinal Direction Indicators */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />

        {/* Outer Ring Accent */}
        <div className="absolute inset-2 rounded-full border border-purple-800/30 pointer-events-none" />

        {/* Center Resting Reticle */}
        <div className="w-4 h-4 rounded-full border border-purple-600/40 pointer-events-none opacity-60" />

        {/* Draggable Knob (Thumbstick) */}
        <div
          id="virtual-joystick-knob"
          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full pointer-events-none bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-400 border border-cyan-300/70 shadow-[0_2px_12px_rgba(56,189,248,0.45)] flex items-center justify-center"
          style={{
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Knob Core Rune */}
          <div className="w-3.5 h-3.5 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          {isDragging && (
            <div className="absolute inset-0 rounded-full bg-cyan-300/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
