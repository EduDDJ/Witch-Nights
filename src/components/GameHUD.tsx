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
  FlaskConical,
  Sprout,
} from 'lucide-react';

import { BossInstance, CharacterDefinition, MobileAimMode } from '../types/game';
import { getLanguage, translateCharacterName, translateBossName, t } from '../utils/i18n';

interface GameHUDProps {
  player: PlayerStats;
  weapons: OwnedWeapon[];
  statItems: OwnedStatItem[];
  character?: CharacterDefinition;
  maxWeapons?: number;
  survivalTime: number; // in seconds
  bossCountdown?: number; // in seconds (5min countdown for normal mode)
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
  mobileAimMode?: MobileAimMode;
  instaKill?: boolean;
  isBossRush?: boolean;
  isTrueWitchMode?: boolean;
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
  FlaskConical,
  Sprout,
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
  Sprout,
};

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  weapons,
  statItems,
  character,
  maxWeapons,
  survivalTime,
  bossCountdown,
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
  mobileAimMode = 'JOYSTICK',
  instaKill = false,
  isBossRush = false,
  isTrueWitchMode = false,
}) => {
  // Clock display logic:
  // In Boss Rush Mode, display standard count-up survival time.
  // In Normal Mode, display the 5-minute countdown (bossCountdown).
  // While in a Bossfight, the timer pauses until the boss is defeated.
  const displayTime = isBossRush ? survivalTime : (bossCountdown !== undefined ? bossCountdown : Math.max(0, 300 - survivalTime));
  const minutes = Math.floor(displayTime / 60);
  const seconds = Math.floor(displayTime % 60);
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
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2 sm:p-5 font-sans overflow-hidden">
      {/* TOP ROW: Compact Player HUD (Left) & Controls/Timer (Right) */}
      <div className="w-full flex flex-col items-center gap-2 sm:gap-4">
        <div className="w-full flex items-start justify-between gap-1.5 sm:gap-4">
          {/* Top Left: Compact Player HUD */}
          <div id="player-hud" className="relative pointer-events-auto flex items-start gap-1.5 sm:gap-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pt-0.5 sm:pt-0 shrink min-w-0">
            {instaKill && (
              <div className="absolute -top-1 sm:-top-4 left-0 bg-rose-950/95 border border-rose-500 text-rose-300 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse tracking-wider uppercase whitespace-nowrap z-20">
                {t('cheats_enabled', getLanguage())}
              </div>
            )}
            {/* Witch's face */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="relative">
                <WitchPortrait 
                  isHurt={isHurt} 
                  size={mobileMode ? 38 : 46} 
                  spriteUrl={character?.spriteUrl}
                  fallbackSpriteUrl={character?.fallbackSpriteUrl}
                  characterName={character ? translateCharacterName(character.id, character.name, getLanguage()) : undefined}
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[8px] sm:text-[9px] rounded px-1 py-0.2 border border-slate-950 shadow">
                  {player.level}
                </div>
              </div>
              {isTrueWitchMode && (
                <div
                  id="true-witch-hud-badge"
                  className="mt-1 bg-gradient-to-r from-rose-950 via-rose-900 to-purple-950 border border-rose-500/80 text-rose-200 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow-md shadow-rose-950/80 tracking-wider uppercase whitespace-nowrap flex items-center gap-0.5 animate-pulse"
                  title={getLanguage() === 'en' ? "True Witch Mode Active" : "Modo Bruxa Verdadeira Ativo"}
                >
                  <Flame className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <span>{getLanguage() === 'en' ? 'True Witch' : 'Bruxa Verdadeira'}</span>
                </div>
              )}
            </div>

            {/* Red HP Bar and Blue EXP Bar */}
            <div className="flex flex-col gap-1 w-24 sm:w-44">
              {/* Red HP Bar */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-rose-300 px-0.5 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    HP
                  </span>
                  <span className="font-mono">{Math.ceil(player.hp)} / {Math.ceil(player.maxHp)}</span>
                </div>
                <div className="relative h-2 sm:h-2.5 w-full bg-black/60 rounded-md overflow-hidden border border-rose-600/40 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-150 rounded-sm"
                    style={{ width: `${healthPercent}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 pointer-events-none" />
                </div>
              </div>

              {/* Blue EXP Bar underneath (Hidden in Boss Rush Mode) */}
              {!isBossRush && (
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-bold text-sky-300 px-0.5 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    <span>EXP</span>
                    <span className="font-mono">{Math.floor(player.exp)} / {player.expToNextLevel}</span>
                  </div>
                  <div className="relative h-1.5 sm:h-2 w-full bg-black/60 rounded-md overflow-hidden border border-sky-600/40 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-150 rounded-sm"
                      style={{ width: `${expPercent}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-40 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Right: Timer & Quick Control Badges */}
          <div className="pointer-events-auto flex flex-col items-end gap-1 sm:gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] shrink-0 z-20">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Survival / Boss Countdown Timer */}
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border shadow transition-colors ${
                  !isBossRush && isBossFight
                    ? 'border-rose-700/60 shadow-rose-950/50'
                    : 'border-purple-900/40'
                }`}
                title={!isBossRush ? (isBossFight ? 'Boss Fight Active (Timer Paused)' : 'Countdown to Next Boss Fight') : 'Run Time'}
              >
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-purple-400">
                  {isBossRush ? 'TIME' : (!isBossFight ? 'BOSS' : 'PAUSED')}
                </span>
                <span
                  className={`font-mono text-sm sm:text-base font-bold drop-shadow ${
                    !isBossRush && isBossFight
                      ? 'text-rose-400'
                      : !isBossRush && displayTime <= 30
                      ? 'text-amber-400 animate-pulse'
                      : 'text-amber-300'
                  }`}
                >
                  {formattedTime}
                </span>
              </div>

              {/* Pause Button (Square with just pause symbol) */}
              <button
                id="hud-pause-btn"
                onClick={onOpenPauseMenu}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950/80 hover:bg-purple-950/90 text-purple-200 border border-purple-800/40 hover:border-purple-500/60 transition-all cursor-pointer shadow flex items-center justify-center shrink-0 active:scale-95 touch-manipulation"
                title="Pause Game (ESC)"
                aria-label="Pause Game"
              >
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
              </button>
            </div>

            {!isBossRush && (
              <div className="flex items-center gap-2">
                {/* Enemy Level */}
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-sm border border-rose-900/40 shadow"
                  title="Current Enemy Level (scales with survival time)"
                >
                  <span className="text-[9px] font-bold tracking-wider text-rose-400">{t('foe_level', getLanguage())}</span>
                  <span className="font-mono text-sm font-bold text-rose-300 drop-shadow">
                    {getEnemyLevel(survivalTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOSS HUD (Bottom Center of the Screen) */}
      {isBossFight && boss && (
        <div
          id="boss-health-hud"
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg sm:max-w-xl pointer-events-auto flex flex-col gap-1.5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)] z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Top Row above the bar: Boss Name & Phase Badge */}
          <div className="flex items-end justify-between px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-100 font-serif tracking-wide drop-shadow-[0_2px_12px_rgba(244,63,94,0.9)]">
                {boss.id === 'archmages'
                  ? (boss.archmagesPhase === 'PHASE2'
                      ? translateBossName('geraldo_rgb', 'Geraldo The RGB', getLanguage())
                      : translateBossName('archmages', boss.name, getLanguage()))
                  : translateBossName(boss.id, boss.name, getLanguage())}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/90 border border-rose-600/80 text-rose-300 shadow">
                {boss.id === 'archmages' && boss.archmagesPhase === 'PHASE2' ? 'PHASE 2' : 'BOSS'}
              </span>
            </div>
          </div>

          {/* Boss Health Bar(s) */}
          {boss.id === 'archmages' && boss.archmagesPhase === 'PHASE1' && boss.archmagesList ? (
            /* Phase 1: 3 Wizard Health Bars side-by-side */
            <div className="grid grid-cols-3 gap-2 w-full">
              {boss.archmagesList.map((wiz) => {
                const percent = Math.max(0, Math.min(100, (wiz.hp / wiz.maxHp) * 100));
                const isKnockedDown = wiz.hp <= 0;
                const isActive = boss.activeArchmageId === wiz.id;

                const gradClass =
                  wiz.id === 'geraldo_red'
                    ? 'from-red-700 via-rose-600 to-red-400'
                    : wiz.id === 'geraldo_green'
                    ? 'from-emerald-700 via-green-500 to-emerald-300'
                    : 'from-blue-700 via-sky-500 to-cyan-300';

                const borderClass =
                  wiz.id === 'geraldo_red'
                    ? 'border-red-500/80'
                    : wiz.id === 'geraldo_green'
                    ? 'border-emerald-500/80'
                    : 'border-blue-500/80';

                return (
                  <div
                    key={wiz.id}
                    className={`flex flex-col gap-1 p-1.5 rounded-xl bg-stone-950/90 border-2 transition-all ${borderClass} ${
                      isActive ? 'ring-2 ring-amber-400/90 shadow-lg shadow-amber-500/30' : 'opacity-90'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span
                        className="truncate max-w-[90px]"
                        style={{ color: wiz.color }}
                      >
                        {translateBossName(wiz.id, wiz.name, getLanguage())}
                      </span>
                      {isKnockedDown ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono flex items-center gap-0.5 animate-pulse">
                          🛡️ SHIELD
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-stone-300">
                          {Math.ceil(wiz.hp)}/{wiz.maxHp}
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-3.5 sm:h-4 bg-stone-900 rounded-md overflow-hidden border border-white/20">
                      <div
                        className={`h-full bg-gradient-to-r ${gradClass} transition-all duration-150 rounded-sm`}
                        style={{ width: `${percent}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : boss.id === 'archmages' && boss.archmagesPhase === 'MERGING' ? (
            /* Merging Animation Banner */
            <div className="relative w-full h-6 bg-stone-950/95 rounded-lg overflow-hidden border-2 border-purple-500 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-green-500 via-blue-500 to-purple-600 opacity-60 animate-pulse" />
              <span className="relative text-xs font-black tracking-widest text-white uppercase drop-shadow-md">
                ⚡ {getLanguage() === 'pt-BR' ? 'FUSÃO...' : 'MERGING...'} ⚡
              </span>
            </div>
          ) : (
            /* Standard / Phase 2 Health Bar */
            <div className={`relative w-full h-5 sm:h-6 bg-stone-950/95 rounded-lg overflow-hidden border-2 shadow-2xl ${
              boss.id === 'archmages' && boss.archmagesPhase === 'PHASE2'
                ? 'border-purple-400 shadow-purple-900/80'
                : 'border-rose-600/90'
            }`}>
              <div
                className={`h-full transition-all duration-150 rounded-sm ${
                  boss.id === 'archmages' && boss.archmagesPhase === 'PHASE2'
                    ? 'bg-gradient-to-r from-red-500 via-amber-400 via-green-400 via-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-red-700 via-rose-500 to-amber-500'
                }`}
                style={{ width: `${bossHealthPercent}%` }}
              />
              {/* Gloss reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
              {/* Centered Numeric HP Readout */}
              <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none">
                {Math.ceil(boss.hp)} / {boss.maxHp}
              </div>
            </div>
          )}
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

          {/* Hover Tooltip Card (Appears ONLY when cursor hovers over an item image outside boss fights) */}
          {hoveredItem && !isBossFight && (
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
                      {hoveredItem.tier >= 7 ? 'Mega Evolved' : `Rank ${hoveredItem.tier}`}
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

          {/* Acquired Weapons & Stat Items List (Disabled during Boss fights) */}
          {!isBossFight && (
            <>
              {/* TOP ROW: Acquired Artifacts (Passives) - Displayed in a row ON TOP of weapons (Hidden in Boss Rush where max is 0) */}
              {!isBossRush && (
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
              )}

              {/* BOTTOM ROW: Acquired Weapons (1 slot in Boss Rush, or up to maxWeapons/5 in Standard mode) */}
              <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-purple-900/60 shadow-xl w-fit">
                {Array.from({ length: isBossRush ? 1 : (maxWeapons || 5) }).map((_, idx) => {
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
                      onMouseEnter={() => {
                        const itemColor = def.iconColor || def.bulletColor;
                        setHoveredItem({
                          id: owned.id,
                          name: def.name,
                          type: 'WEAPON',
                          tier: owned.level,
                          description: def.description,
                          shootingType: def.shootingType,
                          icon: IconComp,
                          color: itemColor,
                        });
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group cursor-pointer"
                    >
                      {/* Weapon Image Tile - 20% smaller (w-9 h-9 instead of w-11 h-11) */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all duration-150 hover:scale-110 hover:shadow-md shadow-purple-950/50"
                        style={{
                          backgroundColor: `${def.iconColor || def.bulletColor}22`,
                          borderColor: def.iconColor || def.bulletColor,
                        }}
                      >
                        <IconComp className="w-4 h-4 transition-transform group-hover:rotate-6" style={{ color: def.iconColor || def.bulletColor }} />
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

        {/* BOTTOM RIGHT: CURSOR JOYSTICK & DASH COOLDOWN CIRCLE */}
        <div className={`pointer-events-auto relative flex flex-col items-center gap-2.5 transition-all duration-300 ${
          mobileMode && isBossFight ? 'mb-24 sm:mb-28' : ''
        }`}>
          {/* Virtual Cursor / Aim Joystick in Mobile Mode (if Joystick Aim is active), positioned directly above Dash button */}
          {mobileMode && mobileAimMode !== 'TOUCH' && (
            <div className="flex flex-col items-center mr-6 sm:mr-8 mb-3 -translate-y-2">
              <VirtualJoystick
                size={108}
                variant="cursor"
                eventName="cursor-joystick-move"
                idPrefix="cursor-joystick"
              />
            </div>
          )}

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
