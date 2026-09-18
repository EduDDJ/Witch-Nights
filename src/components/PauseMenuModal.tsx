import React, { useState } from 'react';
import { Play, Settings, BookOpen, LogOut, Pause, RotateCcw, Wrench } from 'lucide-react';
import { OwnedWeapon, OwnedStatItem } from '../types/game';
import { ALL_WEAPONS, ALL_STAT_ITEMS } from '../data/gameData';
import { useLanguage, t } from '../utils/i18n';
import { PentagramIcon } from './PentagramIcon';
import { VampireFangsIcon } from './VampireFangsIcon';
import { BroomIcon } from './BroomIcon';
import {
  Sparkles,
  Flame,
  Skull,
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
  Clover,
  Eye,
  Sprout,
} from 'lucide-react';

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

interface PauseMenuModalProps {
  survivalTime: number;
  weapons?: OwnedWeapon[];
  statItems?: OwnedStatItem[];
  maxWeapons?: number;
  isBossRush?: boolean;
  mobileMode?: boolean;
  onResume: () => void;
  onRestartRun: () => void;
  onOpenDevTools: () => void;
  onOpenOptions: () => void;
  onOpenCollection: () => void;
  onReturnToMainMenu: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  survivalTime,
  weapons = [],
  statItems = [],
  maxWeapons = 5,
  isBossRush = false,
  mobileMode = false,
  onResume,
  onRestartRun,
  onOpenDevTools,
  onOpenOptions,
  onOpenCollection,
  onReturnToMainMenu,
}) => {
  const lang = useLanguage();
  const minutes = Math.floor(survivalTime / 60);
  const seconds = Math.floor(survivalTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const [hoveredItem, setHoveredItem] = useState<{
    name: string;
    tier: number;
    description: string;
    color: string;
    type: 'WEAPON' | 'STAT';
  } | null>(null);

  return (
    <div
      id="pause-menu-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className={`flex ${mobileMode ? 'flex-col' : 'flex-col md:flex-row'} items-center md:items-stretch justify-center gap-4 sm:gap-6 w-full max-w-3xl my-auto`}>
        {/* Left Window: Current Items Arsenal */}
        <div
          id="pause-current-items-window"
          className={`relative w-full ${mobileMode ? 'order-2 max-w-sm sm:max-w-md' : 'order-1 md:order-1 md:w-80'} bg-gradient-to-b from-[#180e2a] via-[#120a20] to-[#0a0512] border-2 border-purple-600/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-purple-950/90 text-slate-100 flex flex-col justify-between gap-3 select-none`}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/60">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-lg font-black font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-300 to-indigo-200">
              {t('current_items', lang)}
            </h3>
            <div className="text-[11px] text-slate-400 font-mono">
              {weapons.length} {t('weapons_label', lang)} {!isBossRush ? `• ${statItems.length} ${t('artifacts_label', lang)}` : ''}
            </div>
          </div>

          <div className="flex flex-col gap-3 my-auto">
            {/* Artifacts Section (Hidden in Boss Rush) */}
            {!isBossRush && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 px-1">
                  {t('artifacts_label', lang)} ({statItems.length}/5)
                </span>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-amber-900/50 shadow-inner w-full">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const owned = statItems[idx];
                    if (!owned) {
                      return (
                        <div
                          key={`pause-empty-artifact-${idx}`}
                          className="flex-1 max-w-[44px] aspect-square rounded-xl border border-amber-950/60 bg-amber-950/15 flex items-center justify-center opacity-30"
                        />
                      );
                    }
                    const def = ALL_STAT_ITEMS.find((s) => s.id === owned.id);
                    if (!def) return null;
                    const IconComp = STAT_ICONS[def.icon] || Droplet;

                    return (
                      <div
                        key={owned.id}
                        onMouseEnter={() =>
                          setHoveredItem({
                            name: def.name,
                            tier: owned.level,
                            description: def.description,
                            color: def.color,
                            type: 'STAT',
                          })
                        }
                        onMouseLeave={() => setHoveredItem(null)}
                        className="relative group cursor-pointer flex-1 max-w-[44px]"
                      >
                        <div
                          className="w-full aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-150 hover:scale-110 shadow-sm"
                          style={{
                            backgroundColor: `${def.color}22`,
                            borderColor: def.color,
                          }}
                        >
                          <IconComp className="w-4 h-4" style={{ color: def.color }} />
                        </div>
                        {/* Tier dots */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
                          {Array.from({ length: def.tiers.length }).map((_, i) => (
                            <span
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: i < owned.level ? def.color : '#334155' }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weapons Section */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/90 px-1">
                {t('weapons_label', lang)} ({weapons.length}/{isBossRush ? 1 : maxWeapons})
              </span>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-purple-900/50 shadow-inner w-full">
                {Array.from({ length: isBossRush ? 1 : maxWeapons }).map((_, idx) => {
                  const owned = weapons[idx];
                  if (!owned) {
                    return (
                      <div
                        key={`pause-empty-weapon-${idx}`}
                        className="flex-1 max-w-[44px] aspect-square rounded-xl border border-purple-950/60 bg-purple-950/20 flex items-center justify-center opacity-30"
                      />
                    );
                  }
                  const def = ALL_WEAPONS.find((w) => w.id === owned.id);
                  if (!def) return null;
                  const IconComp = WEAPON_ICONS[def.icon] || Sparkles;

                  const itemColor = def.iconColor || def.bulletColor;
                  return (
                    <div
                      key={owned.id}
                      onMouseEnter={() =>
                        setHoveredItem({
                          name: def.name,
                          tier: owned.level,
                          description: def.description,
                          color: itemColor,
                          type: 'WEAPON',
                        })
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group cursor-pointer flex-1 max-w-[44px]"
                    >
                      <div
                        className="w-full aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-150 hover:scale-110 shadow-sm"
                        style={{
                          backgroundColor: `${itemColor}22`,
                          borderColor: itemColor,
                        }}
                      >
                        <IconComp className="w-4 h-4" style={{ color: itemColor }} />
                      </div>
                      {/* Tier dots */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
                        {Array.from({ length: def.tiers.length }).map((_, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: i < owned.level ? itemColor : '#334155' }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Item Details Box / Prompt */}
          <div className="min-h-[64px] flex items-center justify-center">
            {hoveredItem ? (
              <div className="w-full p-2.5 rounded-xl bg-black/80 border border-purple-500/50 text-left animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-xs text-slate-200 mb-0.5">
                  <span style={{ color: hoveredItem.color }}>{hoveredItem.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">{hoveredItem.tier >= 7 ? 'Mega Evolved' : `Rank ${hoveredItem.tier}`}</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-tight">{hoveredItem.description}</p>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400/80 text-center italic bg-black/30 p-2 rounded-xl border border-slate-800/60 w-full">
                {t('hover_inspect', lang)}
              </div>
            )}
          </div>
        </div>

        {/* Right Window: Main Pause Menu Card */}
        <div
          id="pause-menu-card"
          className={`relative w-full ${mobileMode ? 'order-1 max-w-sm sm:max-w-md' : 'order-2 md:order-2 md:w-80'} bg-gradient-to-b from-[#180e2a] via-[#120a20] to-[#0a0512] border-2 border-purple-600/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-purple-950/90 text-slate-100 flex flex-col items-center justify-between gap-3.5 select-none`}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/60">
              <Pause className="w-5 h-5 text-purple-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200">
              {t('game_paused', lang)}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{t('total_time', lang)}</span>
              <span className="font-mono font-bold text-amber-300">{formattedTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 my-auto">
            {/* 1. Resume Game */}
            <button
              id="pause-resume-btn"
              onClick={onResume}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 border border-purple-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>{t('resume_game', lang)}</span>
            </button>

            {/* 2. Restart Run */}
            <button
              id="pause-restart-btn"
              onClick={onRestartRun}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 text-cyan-200 hover:text-white font-semibold text-sm border border-cyan-800/50 hover:border-cyan-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>{t('restart_run', lang)}</span>
            </button>

            {/* 3. Dev Tools */}
            <button
              id="pause-devtools-btn"
              onClick={onOpenDevTools}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-amber-950/80 text-amber-200 hover:text-white font-semibold text-sm border border-amber-800/50 hover:border-amber-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>{t('dev_tools', lang)}</span>
            </button>

            {/* 4. Options */}
            <button
              id="pause-options-btn"
              onClick={onOpenOptions}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/80 text-purple-200 hover:text-white font-semibold text-sm border border-purple-700/50 hover:border-purple-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>{t('options', lang)}</span>
            </button>

            {/* 5. Collection */}
            <button
              id="pause-collection-btn"
              onClick={onOpenCollection}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/80 text-purple-200 hover:text-white font-semibold text-sm border border-purple-700/50 hover:border-purple-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span>{t('collection', lang)}</span>
            </button>

            {/* 6. Main Menu */}
            <button
              id="pause-main-menu-btn"
              onClick={onReturnToMainMenu}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 hover:text-rose-100 font-semibold text-sm border border-rose-800/40 hover:border-rose-600/60 flex items-center justify-center gap-2 transition-all cursor-pointer mt-0.5"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{t('quit_to_main_menu', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
