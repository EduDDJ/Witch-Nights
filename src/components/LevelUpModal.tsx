import React, { useState, useEffect } from 'react';
import { WeaponDefinition, StatItemDefinition } from '../types/game';
import { Sparkles, Flame, Skull, BookOpen, Crosshair, Zap, Radio, Droplet, Maximize2, Shield, Wind, Footprints, Compass, Heart, ArrowUpCircle, PlusCircle, Clover, Eye, Sprout, RotateCcw } from 'lucide-react';
import { VampireFangsIcon } from './VampireFangsIcon';
import { PentagramIcon } from './PentagramIcon';
import { BroomIcon } from './BroomIcon';

export type LevelUpOption =
  | {
      kind: 'WEAPON_NEW';
      definition: WeaponDefinition;
    }
  | {
      kind: 'WEAPON_UPGRADE';
      definition: WeaponDefinition;
      currentTier: number;
      nextTier: number;
    }
  | {
      kind: 'STAT_NEW';
      definition: StatItemDefinition;
    }
  | {
      kind: 'STAT_UPGRADE';
      definition: StatItemDefinition;
      currentTier: number;
      nextTier: number;
    };

interface LevelUpModalProps {
  level: number;
  options: LevelUpOption[];
  mobileMode?: boolean;
  isDevLevelUp?: boolean;
  hasExtraChoices?: boolean;
  hasRabbitsFoot?: boolean;
  canReroll?: boolean;
  onReroll?: () => void;
  onSelectOption: (option: LevelUpOption) => void;
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
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  options,
  mobileMode = false,
  isDevLevelUp = false,
  hasExtraChoices = false,
  hasRabbitsFoot = false,
  canReroll = false,
  onReroll,
  onSelectOption,
}) => {
  const [isReady, setIsReady] = useState(isDevLevelUp);

  // Show Options HUD for 0.5 seconds before options fade in and allow clicking (prevents accidental clicks with Mobile Movement)
  useEffect(() => {
    if (isDevLevelUp) {
      setIsReady(true);
      return;
    }
    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [level, options, isDevLevelUp]);

  // Keyboard 1, 2, 3, 4, R shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return;
      if (e.key === '1' && options[0]) onSelectOption(options[0]);
      if (e.key === '2' && options[1]) onSelectOption(options[1]);
      if (e.key === '3' && options[2]) onSelectOption(options[2]);
      if (e.key === '4' && options[3]) onSelectOption(options[3]);
      if ((e.key === 'r' || e.key === 'R') && canReroll && onReroll) {
        onReroll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isReady, onSelectOption, canReroll, onReroll]);

  const getShootingTypeLabel = (type: string) => {
    switch (type) {
      case 'NEAREST_ENEMY':
        return { label: 'Nearest Enemy', color: 'bg-sky-950/80 text-sky-300 border-sky-700/60' };
      case 'MOUSE_DIRECTION':
        return { label: 'Mouse Aim', color: 'bg-purple-950/80 text-purple-300 border-purple-700/60' };
      case 'AREA_OF_EFFECT':
        return { label: 'Area of Effect (AoE)', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' };
      default:
        return { label: 'Weapon', color: 'bg-slate-800 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 ${
      mobileMode ? 'p-2 sm:p-4' : 'p-4'
    }`}>
      <div className={`w-full max-h-[94vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border-2 border-purple-600/70 shadow-2xl shadow-purple-950/60 relative ${
        mobileMode
          ? 'max-w-xl rounded-2xl p-3 sm:p-5'
          : 'max-w-2xl rounded-3xl p-5 sm:p-7'
      }`}>
        {/* Glow Header */}
        <div className={`text-center ${mobileMode ? 'mb-2.5 sm:mb-3.5' : 'mb-5'}`}>
          <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 tracking-tight font-serif ${
            mobileMode ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
          }`}>
            LEVEL {level} REACHED!
          </h2>
          <p className={`text-slate-400 ${mobileMode ? 'text-[11px] sm:text-xs mt-0.5' : 'text-xs sm:text-sm mt-1'}`}>
            Defeating these Peasants gives you strength. Select one item to help you in your survival.
          </p>
        </div>

        {/* 3 Choices Grid with 0.5s delayed fade-in */}
        <div className={`flex flex-col relative transition-all duration-300 ease-out ${
          isReady ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        } ${mobileMode ? 'gap-2 sm:gap-2.5' : 'gap-3'}`}>
          {options.map((opt, index) => {
            const isWeapon = opt.kind === 'WEAPON_NEW' || opt.kind === 'WEAPON_UPGRADE';
            const isUpgrade = opt.kind === 'WEAPON_UPGRADE' || opt.kind === 'STAT_UPGRADE';

            let title = '';
            let subtitle = '';
            let description = '';
            let IconComp: React.ElementType = Sparkles;
            let iconColor = '#a855f7';
            let typeBadge = null;
            let tierTag = null;

            if (opt.kind === 'WEAPON_NEW') {
              title = opt.definition.name;
              subtitle = 'NEW WEAPON ACQUIRED';
              const tier1 = opt.definition.tiers[0];
              description = tier1 ? tier1.description : opt.definition.description;
              IconComp = WEAPON_ICONS[opt.definition.icon] || Sparkles;
              iconColor = opt.definition.bulletColor;
              typeBadge = getShootingTypeLabel(opt.definition.shootingType);
              tierTag = <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1"><PlusCircle className="w-3 h-3" /> NEW</span>;
            } else if (opt.kind === 'WEAPON_UPGRADE') {
              title = opt.definition.name;
              const nextTierObj = opt.definition.tiers.find((t) => t.tier === opt.nextTier);
              subtitle = nextTierObj ? nextTierObj.name : `Tier ${opt.nextTier}`;
              description = nextTierObj ? nextTierObj.description : 'Increases weapon prowess.';
              IconComp = WEAPON_ICONS[opt.definition.icon] || Sparkles;
              iconColor = opt.definition.bulletColor;
              typeBadge = getShootingTypeLabel(opt.definition.shootingType);
              tierTag = <span className="bg-amber-950/90 text-amber-300 border border-amber-500/50 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1"><ArrowUpCircle className="w-3 h-3" /> LVL {opt.currentTier} → {opt.nextTier}</span>;
            } else if (opt.kind === 'STAT_NEW') {
              title = opt.definition.name;
              subtitle = 'NEW STAT ARTIFACT';
              const tier1 = opt.definition.tiers[0];
              description = tier1 ? tier1.description : opt.definition.description;
              IconComp = STAT_ICONS[opt.definition.icon] || Droplet;
              iconColor = opt.definition.color || '#eab308';
              typeBadge = { label: 'Passive Artifact', color: 'bg-amber-950/80 text-amber-300 border-amber-700/60' };
              tierTag = <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1"><PlusCircle className="w-3 h-3" /> NEW</span>;
            } else if (opt.kind === 'STAT_UPGRADE') {
              title = opt.definition.name;
              const nextTierObj = opt.definition.tiers.find((t) => t.tier === opt.nextTier);
              subtitle = nextTierObj ? nextTierObj.name : `Tier ${opt.nextTier}`;
              description = nextTierObj ? nextTierObj.description : 'Amplifies passive artifact power.';
              IconComp = STAT_ICONS[opt.definition.icon] || Droplet;
              iconColor = opt.definition.color || '#eab308';
              typeBadge = { label: 'Passive Artifact', color: 'bg-amber-950/80 text-amber-300 border-amber-700/60' };
              tierTag = <span className="bg-amber-950/90 text-amber-300 border border-amber-500/50 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1"><ArrowUpCircle className="w-3 h-3" /> LVL {opt.currentTier} → {opt.nextTier}</span>;
            }

            const isLegendary = Boolean(opt.definition.isLegendary || opt.definition.unlockCondition);

            return (
              <button
                key={index}
                id={`level-up-option-${index}`}
                onClick={() => {
                  if (!isReady) return;
                  onSelectOption(opt);
                }}
                disabled={!isReady}
                className={`w-full text-left group flex items-start rounded-xl sm:rounded-2xl transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer ${
                  isLegendary
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/95 to-amber-950/25 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20 hover:border-amber-300 hover:ring-amber-300 hover:shadow-amber-500/40'
                    : 'bg-slate-900/90 hover:bg-purple-950/60 border-2 border-purple-900/50 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-900/30'
                } ${
                  mobileMode ? 'p-2 sm:p-3 gap-2.5 sm:gap-3.5' : 'p-3.5 sm:p-4 gap-4'
                }`}
              >
                {/* Number Key Hint */}
                <div className={`rounded-lg font-mono font-bold flex items-center justify-center border flex-shrink-0 transition-colors ${
                  isLegendary
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 group-hover:bg-amber-500 group-hover:text-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:bg-purple-600 group-hover:text-white'
                } ${
                  mobileMode ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'
                }`}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105 ${
                    isLegendary ? 'border-amber-400 ring-1 ring-amber-400/40' : ''
                  } ${
                    mobileMode ? 'w-10 h-10' : 'w-12 h-12'
                  }`}
                  style={{
                    backgroundColor: `${iconColor}22`,
                    borderColor: isLegendary ? '#fbbf24' : `${iconColor}66`,
                  }}
                >
                  <IconComp className={mobileMode ? 'w-5 h-5' : 'w-6 h-6'} style={{ color: iconColor }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap mb-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`font-bold transition-colors ${
                        isLegendary
                          ? 'text-amber-200 group-hover:text-amber-100'
                          : 'text-slate-100 group-hover:text-purple-200'
                      } ${
                        mobileMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                      }`}>
                        {title}
                      </h3>
                      {tierTag}
                      {isLegendary && (
                        <span className="bg-amber-950/90 text-amber-300 border border-amber-500/80 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 shadow-sm shadow-amber-500/30">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> LEGENDARY ITEM
                        </span>
                      )}
                    </div>
                    {typeBadge && (
                      <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-md border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                    )}
                  </div>

                  <div className={`font-semibold text-purple-400 ${mobileMode ? 'text-[10px] sm:text-xs mb-0.5' : 'text-xs mb-1'}`}>
                    {subtitle}
                  </div>

                  <p className={`text-slate-300 ${mobileMode ? 'text-[10px] sm:text-xs leading-snug' : 'text-xs leading-relaxed'}`}>
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Channeling Indicator while !isReady */}
        {!isReady && (
          <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center text-purple-300 pointer-events-none animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin mb-1" />
            <span className="text-xs font-semibold tracking-wide">Channeling Arcane Choices...</span>
          </div>
        )}

        {/* Reroll Button (Destiny Control Rank 5) */}
        {canReroll && onReroll && isReady && (
          <div className="flex justify-center mt-3">
            <button
              type="button"
              id="reroll-options-button"
              onClick={onReroll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-950 via-purple-900 to-amber-950 hover:from-amber-900 hover:to-purple-800 text-amber-200 hover:text-white font-bold text-xs sm:text-sm shadow-lg border border-amber-500/60 hover:border-amber-300 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reroll Options (1 Left)</span>
            </button>
          </div>
        )}

        {/* Footer Hint */}
        <div className={`text-center text-slate-400 ${mobileMode ? 'mt-2 text-[10px] sm:text-xs' : 'mt-4 text-xs'}`}>
          {isReady ? (
            <span>
              Press <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">1</kbd>, <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">2</kbd>, <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">3</kbd>{(hasExtraChoices || hasRabbitsFoot) && <span>, or <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">4</kbd></span>}{canReroll && <span> (Press <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">R</kbd> to reroll)</span>} or click to choose.
            </span>
          ) : (
            <span className="text-purple-400 font-medium inline-flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-400" /> Channeling boons...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

