import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Crosshair } from 'lucide-react';

interface VirtualJoystickProps {
  size?: number; // Outer base diameter in pixels
  className?: string;
  variant?: 'movement' | 'cursor';
  eventName?: string;
  idPrefix?: string;
  label?: string;
  onMove?: (vector: { x: number; y: number; active: boolean }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = 112,
  className = '',
  variant = 'movement',
  eventName,
  idPrefix,
  label,
  onMove,
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);

  const resolvedEventName = eventName || (variant === 'cursor' ? 'cursor-joystick-move' : 'joystick-move');
  const resolvedIdPrefix = idPrefix || (variant === 'cursor' ? 'cursor-joystick' : 'virtual-joystick');
  const isCursor = variant === 'cursor';

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

      const vector = { x: normX, y: normY, active: true };
      if (onMove) {
        onMove(vector);
      }
      window.dispatchEvent(new CustomEvent(resolvedEventName, { detail: vector }));
    },
    [maxRadius, onMove, resolvedEventName]
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

    const zeroVector = { x: 0, y: 0, active: false };
    if (onMove) {
      onMove(zeroVector);
    }
    window.dispatchEvent(new CustomEvent(resolvedEventName, { detail: zeroVector }));
  };

  // Reset if unmounted
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent(resolvedEventName, { detail: { x: 0, y: 0, active: false } }));
    };
  }, [resolvedEventName]);

  return (
    <div
      id={`${resolvedIdPrefix}-container`}
      className={`relative select-none touch-none flex flex-col items-center ${className}`}
    >
      {/* Optional Label */}
      {label && (
        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-300/80 mb-0.5 pointer-events-none drop-shadow">
          {label}
        </span>
      )}

      <div
        ref={baseRef}
        id={`${resolvedIdPrefix}-base`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`relative rounded-full backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing group transition-colors duration-150 ${
          isCursor
            ? 'bg-slate-950/85 border-2 border-rose-500/50 shadow-[0_4px_24px_rgba(244,63,94,0.35)] hover:border-rose-400/80'
            : 'bg-slate-950/80 border-2 border-purple-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.85)] hover:border-purple-400/80'
        }`}
      >
        {/* Subtle Cardinal Direction Indicators / Crosshair Ticks */}
        {isCursor ? (
          <>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full bg-rose-400/70 pointer-events-none" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full bg-rose-400/70 pointer-events-none" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-2 rounded-full bg-rose-400/70 pointer-events-none" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-0.5 h-2 rounded-full bg-rose-400/70 pointer-events-none" />
            {/* Outer Ring Accent */}
            <div className="absolute inset-2 rounded-full border border-rose-800/30 pointer-events-none" />
            {/* Center Resting Crosshair */}
            <Crosshair className="w-5 h-5 text-rose-500/40 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/40 pointer-events-none" />
            {/* Outer Ring Accent */}
            <div className="absolute inset-2 rounded-full border border-purple-800/30 pointer-events-none" />
            {/* Center Resting Reticle */}
            <div className="w-4 h-4 rounded-full border border-purple-600/40 pointer-events-none opacity-60" />
          </>
        )}

        {/* Draggable Knob (Thumbstick) */}
        <div
          id={`${resolvedIdPrefix}-knob`}
          className={`absolute top-1/2 left-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full pointer-events-none flex items-center justify-center ${
            isCursor
              ? 'bg-gradient-to-tr from-rose-700 via-fuchsia-600 to-amber-400 border border-amber-300/80 shadow-[0_2px_14px_rgba(244,63,94,0.6)]'
              : 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-400 border border-cyan-300/70 shadow-[0_2px_12px_rgba(56,189,248,0.45)]'
          }`}
          style={{
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Knob Center Icon/Rune */}
          {isCursor ? (
            <Crosshair className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          )}

          {isDragging && (
            <div
              className={`absolute inset-0 rounded-full animate-pulse ${
                isCursor ? 'bg-rose-300/25' : 'bg-cyan-300/20'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
