import React, { useState } from 'react';
import { PlayerStats, OwnedWeapon, OwnedStatItem } from '../types/game';
import { ALL_WEAPONS, ALL_STAT_ITEMS, getEnemyLevel } from '../data/gameData';
import { WitchPortrait } from './WitchPortrait';
import { RunningPersonIcon } from './RunningPersonIcon';
import { VampireFangsIcon } from './VampireFangsIcon';
import { PentagramIcon } from './PentagramIcon';
import { BroomIcon } from './BroomIcon';
import { VirtualJoystick } from './VirtualJoystick';
import {
  Sparkles,
  Flame,
  Skull,
  BookOpen,
  Crosshair,
  Zap,
  Radio,
  Droplet,
  Maximize2,
  Shield,
  Wind,
  Footprints,
  Compass,
  Heart,
  Sword,
  Pause,
  Clover,
  Eye,
} from 'lucide-react';

import { BossInstance } from '../types/game';

interface GameHUDProps {
  player: PlayerStats;
  weapons: OwnedWeapon[];
  statItems: OwnedStatItem[];
  maxWeapons?: number;
  survivalTime: number; // in seconds
  isHurt: boolean;
  gameSpeed?: number;
  onToggleSpeed?: () => void;
  onTriggerTestDeal?: () => void;
  onTriggerTestBoss?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onTriggerDash?: () => void;
  onOpenPauseMenu?: () => void;
  boss?: BossInstance | null;
  isBossFight?: boolean;
  bossTimer?: number;
  mobileMode?: boolean;
  instaKill?: boolean;
}

const WEAPON_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Skull,
  BookOpen,
  Crosshair,
  Zap,
  Radio,
  Pentagram: PentagramIcon,
  Sword,
};

const STAT_ICONS: Record<string, React.ElementType> = {
  Fangs: VampireFangsIcon,
  Droplet: VampireFangsIcon,
  Broom: BroomIcon,
  Maximize2,
  Shield,
  Wind,
  Footprints,
  Zap,
  Compass,
  Heart,
  Clover,
  Eye,
};

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  weapons,
  statItems,
  maxWeapons,
  survivalTime,
  isHurt,
  gameSpeed,
  onToggleSpeed,
  onTriggerTestDeal,
  onTriggerTestBoss,
  soundEnabled,
  onToggleSound,
  onTriggerDash,
  onOpenPauseMenu,
  boss,
  isBossFight,
  bossTimer,
  mobileMode = false,
  instaKill = false,
}) => {
  // Format survival time MM:SS
  const minutes = Math.floor(survivalTime / 60);
  const seconds = Math.floor(survivalTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Boss UI logic
  const bossHealthPercent = isBossFight && boss ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100)) : 0;
  const bossFormattedTimer = bossTimer !== undefined ? `${Math.floor(bossTimer / 60)}:${String(Math.floor(bossTimer % 60)).padStart(2, '0')}` : '';

  // Health % calculation
  const healthPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  // EXP % calculation
  const expPercent = Math.max(0, Math.min(100, (player.exp / player.expToNextLevel) * 100));

  // Dash Cooldown Calculation
  // ratio = dashTimer / dashCooldown (1.0 = fully on cooldown / just dashed; 0.0 = ready)
  const isDashReady = player.dashTimer <= 0;
  const cooldownRatio = isDashReady ? 0 : Math.max(0, Math.min(1, player.dashTimer / player.dashCooldown));

  // State for hovered weapon/item tooltip in bottom-left list
  const [hoveredItem, setHoveredItem] = useState<{
    id: string;
    name: string;
    type: 'WEAPON' | 'STAT';
    tier: number;
    description: string;
    shootingType?: string;
    icon: React.ElementType;
    color: string;
  } | null>(null);

  const [isDashHovered, setIsDashHovered] = useState<boolean>(false);

  const handleDashTrigger = (e?: React.PointerEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onTriggerDash) {
      onTriggerDash();
    }
    window.dispatchEvent(new CustomEvent('trigger-dash'));
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 font-sans">
      {/* TOP ROW: ... */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-full flex items-start justify-between gap-4">
          {/* Top Left: Compact Player HUD */}
          <div id="player-hud" className="relative pointer-events-auto flex items-start gap-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pt-3 sm:pt-0">
            {instaKill && (
              <div className="absolute -top-1 sm:-top-4 left-0 bg-rose-950/95 border border-rose-500 text-rose-300 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse tracking-wider uppercase whitespace-nowrap z-20">
                Cheats Enabled
              </div>
            )}
            {/* Witch's face */}
            <div className="relative shrink-0">
              <WitchPortrait isHurt={isHurt} size={46} />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] rounded px-1 py-0.2 border border-slate-950 shadow">
                {player.level}
              </div>
            </div>

            {/* Red HP Bar and Blue EXP Bar ... */}
            <div className="flex flex-col gap-1 w-36 sm:w-48">
              {/* Red HP Bar ... */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-rose-300 px-0.5 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    HP
                  </span>
                  <span className="font-mono">{Math.ceil(player.hp)} / {Math.ceil(player.maxHp)}</span>
                </div>
                <div className="relative h-2.5 w-full bg-black/60 rounded-md overflow-hidden border border-rose-600/40 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-150 rounded-sm"
                    style={{ width: `${healthPercent}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 pointer-events-none" />
                </div>
              </div>

              {/* Blue EXP Bar underneath */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-[9px] font-bold text-sky-300 px-0.5 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  <span>EXP</span>
                  <span className="font-mono">{Math.floor(player.exp)} / {player.expToNextLevel}</span>
                </div>
                <div className="relative h-2 w-full bg-black/60 rounded-md overflow-hidden border border-sky-600/40 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-150 rounded-sm"
                    style={{ width: `${expPercent}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-40 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Right: Timer & Quick Control Badges */}
          <div className={`pointer-events-auto flex flex-col items-end gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-all duration-200 ${
            mobileMode ? 'mr-12 sm:mr-16' : ''
          }`}>
            <div className="flex items-center gap-2">
              {/* Survival Timer */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-sm border border-purple-900/40 shadow">
                <span className="text-[10px] font-bold tracking-wider text-purple-400">TIME</span>
                <span className="font-mono text-base font-bold text-amber-300 drop-shadow">{formattedTime}</span>
              </div>

              {/* Pause Button (Square with just pause symbol) */}
              <button
                id="hud-pause-btn"
                onClick={onOpenPauseMenu}
                className="w-8 h-8 rounded-lg bg-slate-950/70 hover:bg-purple-950/90 text-purple-200 border border-purple-800/40 hover:border-purple-500/60 transition-all cursor-pointer shadow flex items-center justify-center shrink-0"
                title="Pause Game (ESC)"
                aria-label="Pause Game"
              >
                <Pause className="w-4 h-4 text-purple-300" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Enemy Level */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-sm border border-rose-900/40 shadow"
                title="Current Enemy Level (scales with survival time)"
              >
                <span className="text-[9px] font-bold tracking-wider text-rose-400">FOE LV</span>
                <span className="font-mono text-sm font-bold text-rose-300 drop-shadow">
                  {getEnemyLevel(survivalTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOSS HUD (Bottom Center of the Screen) */}
      {isBossFight && boss && (
        <div
          id="boss-health-hud"
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg sm:max-w-xl pointer-events-auto flex flex-col gap-1.5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)] z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Top Row above the bar: Bigger Boss Name (top-left) & 1:30 Countdown (top-right) */}
          <div className="flex items-end justify-between px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-100 font-serif tracking-wide drop-shadow-[0_2px_12px_rgba(244,63,94,0.9)]">
                {boss.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/90 border border-rose-600/80 text-rose-300 shadow">
                BOSS
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/90 border border-amber-500/60 shadow">
              <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase hidden sm:inline">
                ENRAGE:
              </span>
              <span
                className={`font-mono font-bold text-base sm:text-lg drop-shadow ${
                  bossTimer !== undefined && bossTimer <= 20
                    ? 'text-red-500 animate-pulse'
                    : 'text-amber-300'
                }`}
              >
                {bossFormattedTimer}
              </span>
            </div>
          </div>

          {/* Boss Health Bar */}
          <div className="relative w-full h-5 sm:h-6 bg-stone-950/95 rounded-lg overflow-hidden border-2 border-rose-600/90 shadow-2xl">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-amber-500 transition-all duration-150 rounded-sm"
              style={{ width: `${bossHealthPercent}%` }}
            />
            {/* Gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
            {/* Centered Numeric HP Readout */}
            <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none">
              {Math.ceil(boss.hp)} / {boss.maxHp}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ROW:
          - Bottom Left: Weapons & items list during run (ONLY showing images, description on hover)
          - Bottom Right: Dash Cooldown circle with running person
      */}
      <div className="w-full flex items-end justify-between">
        {/* BOTTOM LEFT: RUN WEAPONS & ITEMS (ONLY IMAGES, DESCRIPTION ON HOVER) */}
        <div className={`pointer-events-auto relative flex flex-col gap-2 transition-all duration-300 ${
          mobileMode && isBossFight ? 'mb-12 sm:mb-14' : ''
        }`}>
          {/* Virtual Joystick placed above the items list when Mobile Mode is enabled */}
          {mobileMode && (
            <div className="mb-1.5 flex items-center">
              <VirtualJoystick size={112} />
            </div>
          )}

          {/* Hover Tooltip Card (Appears ONLY when cursor hovers over an item image) */}
          {hoveredItem && !(mobileMode && isBossFight) && (
            <div
              className={`absolute bottom-full left-0 mb-3 w-64 p-3 rounded-xl bg-slate-950/95 backdrop-blur-md border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                hoveredItem.type === 'STAT'
                  ? 'border-amber-600/80 shadow-amber-950/90'
                  : 'border-purple-600/80 shadow-purple-950/90'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: `${hoveredItem.color}22`, borderColor: hoveredItem.color }}
                >
                  <hoveredItem.icon className="w-4 h-4" style={{ color: hoveredItem.color }} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-serif leading-tight">
                    {hoveredItem.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      Tier {hoveredItem.tier}/6
                    </span>
                    {hoveredItem.shootingType && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300">
                        {hoveredItem.shootingType === 'MOUSE_DIRECTION'
                          ? 'Mouse Aim'
                          : hoveredItem.shootingType === 'NEAREST_ENEMY'
                          ? 'Nearest Enemy'
                          : 'Area of Effect'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-black/40 p-2 rounded-lg border border-stone-800">
                {hoveredItem.description}
              </p>
            </div>
          )}

          {/* Acquired Weapons & Stat Items List (Disabled during Boss fights in Mobile Mode) */}
          {!(mobileMode && isBossFight) && (
            <>
              {/* TOP ROW: Acquired Artifacts (Passives) - Displayed in a row ON TOP of weapons with 5 slots */}
              <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-900/60 shadow-lg w-fit">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const owned = statItems[idx];
                  if (!owned) {
                    return (
                      <div
                        key={`empty-artifact-${idx}`}
                        className="w-9 h-9 rounded-lg border border-amber-950/80 bg-amber-950/20 flex items-center justify-center opacity-40"
                        title={`Empty Artifact Slot ${idx + 1}`}
                      />
                    );
                  }
                  const def = ALL_STAT_ITEMS.find((s) => s.id === owned.id);
                  if (!def) return null;
                  const IconComp = STAT_ICONS[def.icon] || Droplet;

                  return (
                    <div
                      key={owned.id}
                      id={`hud-passive-icon-${owned.id}`}
                      onMouseEnter={() =>
                        setHoveredItem({
                          id: owned.id,
                          name: def.name,
                          type: 'STAT',
                          tier: owned.level,
                          description: def.description,
                          icon: IconComp,
                          color: def.color,
                        })
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group cursor-pointer"
                    >
                      {/* Artifact Image Tile - Yellow/Amber themed to match Collection */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all duration-150 hover:scale-110 hover:shadow-md shadow-orange-950/50"
                        style={{
                          backgroundColor: `${def.color}22`,
                          borderColor: def.color,
                        }}
                      >
                        <IconComp className="w-4 h-4 transition-transform group-hover:rotate-6" style={{ color: def.color }} />
                      </div>
                      {/* Tier indicator pips */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
                        {Array.from({ length: def.tiers.length }).map((_, i) => {
                          const t = i + 1;
                          return (
                            <span
                              key={t}
                              className="w-0.5 h-0.5 rounded-full"
                              style={{ backgroundColor: t <= owned.level ? def.color : '#334155' }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM ROW: Acquired Weapons with empty slots up to maxWeapons (default 5) */}
              <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-purple-900/60 shadow-xl w-fit">
                {Array.from({ length: maxWeapons || 5 }).map((_, idx) => {
                  const owned = weapons[idx];
                  if (!owned) {
                    return (
                      <div
                        key={`empty-weapon-${idx}`}
                        className="w-9 h-9 rounded-lg border border-purple-950/80 bg-purple-950/25 flex items-center justify-center opacity-40"
                        title={`Empty Weapon Slot ${idx + 1}`}
                      />
                    );
                  }
                  const def = ALL_WEAPONS.find((w) => w.id === owned.id);
                  if (!def) return null;
                  const IconComp = WEAPON_ICONS[def.icon] || Sparkles;

                  return (
                    <div
                      key={owned.id}
                      id={`hud-weapon-icon-${owned.id}`}
                      onMouseEnter={() =>
                        setHoveredItem({
                          id: owned.id,
                          name: def.name,
                          type: 'WEAPON',
                          tier: owned.level,
                          description: def.description,
                          shootingType: def.shootingType,
                          icon: IconComp,
                          color: def.bulletColor,
                        })
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group cursor-pointer"
                    >
                      {/* Weapon Image Tile - 20% smaller (w-9 h-9 instead of w-11 h-11) */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all duration-150 hover:scale-110 hover:shadow-md shadow-purple-950/50"
                        style={{
                          backgroundColor: `${def.bulletColor}22`,
                          borderColor: def.bulletColor,
                        }}
                      >
                        <IconComp className="w-4 h-4 transition-transform group-hover:rotate-6" style={{ color: def.bulletColor }} />
                      </div>

                      {/* Tier indicator pips at bottom edge of image */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
                        {[1, 2, 3, 4, 5, 6].map((t) => (
                          <span
                            key={t}
                            className={`w-0.5 h-0.5 rounded-full ${t <= owned.level ? 'bg-amber-400' : 'bg-slate-700/80'}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* BOTTOM RIGHT: DASH COOLDOWN CIRCLE */}
        <div className={`pointer-events-auto relative flex flex-col items-center gap-3 transition-all duration-300 ${
          mobileMode && isBossFight ? 'mb-24 sm:mb-28' : ''
        }`}>
          {/* Subtle Hover Tooltip for Dash */}
          {isDashHovered && (
            <div className="absolute bottom-full mb-3 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-purple-500/80 text-center shadow-xl z-50 whitespace-nowrap animate-in fade-in duration-100">
              <div className="text-[11px] font-bold text-slate-200">
                Dash Ability <span className="font-mono text-cyan-300">[SHIFT]</span>
              </div>
              <div className="text-[10px] text-stone-400">
                {isDashReady ? (
                  <span className="text-cyan-400 font-semibold">Ready to Dash</span>
                ) : (
                  <span>Cooldown: {player.dashTimer.toFixed(1)}s</span>
                )}
              </div>
            </div>
          )}

          <button
            id="hud-dash-cooldown-circle"
            onPointerDown={handleDashTrigger}
            onClick={handleDashTrigger}
            onMouseEnter={() => setIsDashHovered(true)}
            onMouseLeave={() => setIsDashHovered(false)}
            aria-label="Dash Ability"
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full cursor-pointer transition-transform duration-150 active:scale-95 flex items-center justify-center select-none pointer-events-auto ${
              isDashReady
                ? 'shadow-[0_0_24px_rgba(56,189,248,0.55)] ring-2 ring-cyan-400/70 hover:scale-105'
                : 'shadow-lg shadow-black/80 ring-2 ring-stone-700/60'
            }`}
          >
            {/* BASE LAYER: Fully Colorful Circle with Vibrant Running Person Image */}
            <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-400 flex items-center justify-center p-3 border border-cyan-300/40">
              <RunningPersonIcon className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />
              {/* Ready Ring Pulse when fully charged */}
              {isDashReady && (
                <div className="absolute inset-0 rounded-full bg-cyan-400/15 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* OVERLAY LAYER: Gray Circle that recedes from BOTTOM TO TOP as cooldown gets smaller!
                When dash is just used: cooldownRatio = 1.0 -> inset(0 0 0% 0) -> entire circle is gray!
                As cooldown gets smaller (1.0 -> 0.0):
                inset clips off from bottom to top: inset(0 0 ${(1 - cooldownRatio) * 100}% 0)
                At 50% cooldown: bottom 50% reveals color, top 50% is gray.
                At 0% cooldown: inset(0 0 100% 0) -> gray layer is 100% gone, blue circle is fully revealed!
            */}
            {!isDashReady && (
              <div
                className="absolute inset-0 rounded-full overflow-hidden bg-stone-900/95 flex items-center justify-center p-3 border border-stone-600/70 transition-all duration-75 pointer-events-none"
                style={{
                  clipPath: `inset(0 0 ${(1 - cooldownRatio) * 100}% 0)`,
                }}
              >
                <RunningPersonIcon className="w-9 h-9 sm:w-10 sm:h-10 text-stone-500" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
