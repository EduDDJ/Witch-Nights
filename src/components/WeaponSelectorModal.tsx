import React, { useState } from 'react';
import { ALL_WEAPONS, ALL_STAT_ITEMS } from '../data/gameData';
import { OwnedWeapon, OwnedStatItem, CharacterDefinition } from '../types/game';
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
  HelpCircle,
  X,
  Plus,
  ArrowUpCircle,
  Sprout,
  Clover,
  Eye,
  FlaskConical,
} from 'lucide-react';
import { VampireFangsIcon } from './VampireFangsIcon';
import { PentagramIcon } from './PentagramIcon';
import { BroomIcon } from './BroomIcon';

interface WeaponSelectorModalProps {
  weapons: OwnedWeapon[];
  statItems: OwnedStatItem[];
  maxWeapons: number;
  character?: CharacterDefinition;
  mobileMode?: boolean;
  onSelect: (itemId: string, category: 'WEAPON' | 'PASSIVE') => void;
  onModifyLevel: (itemId: string, category: 'WEAPON' | 'PASSIVE', delta: number) => void;
  onInstantLevelUp: () => void;
  onClose: () => void;
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
  Sprout,
  FlaskConical,
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

export const WeaponSelectorModal: React.FC<WeaponSelectorModalProps> = ({
  weapons,
  statItems,
  maxWeapons,
  character,
  mobileMode = false,
  onSelect,
  onModifyLevel,
  onInstantLevelUp,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'WEAPONS' | 'PASSIVES'>('WEAPONS');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showUpgradeInfo, setShowUpgradeInfo] = useState<boolean>(false);

  const isWeapon = activeTab === 'WEAPONS';
  
  const sortedItems = isWeapon
    ? [...ALL_WEAPONS].sort((a, b) => {
        const isALeg = Boolean(a.isLegendary);
        const isBLeg = Boolean(b.isLegendary);
        if (isALeg && !isBLeg) return 1;
        if (!isALeg && isBLeg) return -1;
        return 0;
      })
    : [...ALL_STAT_ITEMS].sort((a, b) => {
        const isALeg = Boolean(a.isLegendary);
        const isBLeg = Boolean(b.isLegendary);
        if (isALeg && !isBLeg) return 1;
        if (!isALeg && isBLeg) return -1;
        return 0;
      });

  const selectedItem = activeTab === 'WEAPONS' 
    ? sortedItems.find(w => w.id === selectedItemId)
    : sortedItems.find(s => s.id === selectedItemId);
  
  const ownedWeapon = isWeapon ? weapons.find(w => w.id === selectedItemId) : null;
  const ownedStat = !isWeapon ? statItems.find(s => s.id === selectedItemId) : null;
  const isOwned = !!(ownedWeapon || ownedStat);
  
  const currentLevel = ownedWeapon?.level || ownedStat?.level || 0;

  const rawMaxLevel = selectedItem?.tiers.length || 6;
  const isRespectiveCharacter = isWeapon && character && character.startingWeaponId === selectedItem?.id;
  // Lock Rank 7 Mega Evolution if the player isn't playing as that weapon's respective character
  const maxLevel = (isWeapon && rawMaxLevel >= 7 && !isRespectiveCharacter) ? 6 : rawMaxLevel;

  const isMaxLevel = currentLevel >= maxLevel;
  
  const isFull = isWeapon 
    ? weapons.length >= maxWeapons && !isOwned
    : statItems.length >= 5 && !isOwned;

  const canSelect = !isMaxLevel && !isFull;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl ${mobileMode ? 'max-h-[96vh]' : 'max-h-[92vh]'} bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 border-2 border-amber-600/50 rounded-3xl shadow-2xl shadow-amber-950/70 flex flex-col overflow-hidden relative`}>
        
        {/* Header */}
        <div className={`border-b border-amber-900/50 flex items-center justify-between bg-slate-950/80 ${mobileMode ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-900/40 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 tracking-wide">
                Weapon Selector
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/70">
                Instantly add or upgrade any weapon or artifact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onInstantLevelUp}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/50 hover:border-purple-400 text-purple-200 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <ArrowUpCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              Level Up
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-amber-900 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-2 border-b border-amber-950/60 bg-slate-950/40 text-[11px] sm:text-xs px-6 pt-3 pb-2`}>
          {(['WEAPONS', 'PASSIVES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedItemId(null);
                setShowUpgradeInfo(false);
              }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40 scale-105'
                  : 'bg-slate-900 text-amber-400/60 hover:text-amber-200'
              }`}
            >
              {tab === 'WEAPONS' ? 'Weapons' : 'Artifacts'}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className={`flex-1 overflow-y-auto ${mobileMode ? 'p-3' : 'p-6'}`}>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
            {sortedItems.map((item) => {
              const Icon = (activeTab === 'WEAPONS' ? WEAPON_ICONS[item.icon] : STAT_ICONS[item.icon]) || HelpCircle;
              const owned = activeTab === 'WEAPONS' 
                ? weapons.find(w => w.id === item.id)
                : statItems.find(s => s.id === item.id);
              
              const isSelected = selectedItemId === item.id;
              const color = activeTab === 'WEAPONS' 
                ? ((item as any).iconColor || (item as any).bulletColor)
                : (item as any).color || '#fbbf24';

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'ring-4 ring-amber-500 border-amber-400 scale-110 z-10' 
                      : 'border-slate-800 bg-slate-900/40 hover:border-amber-900 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${color}33` : undefined,
                    borderColor: isSelected ? color : undefined
                  }}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: isSelected ? color : '#64748b' }} />
                  {owned && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 rounded-full border border-slate-950 shadow-sm">
                      {owned.level}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Description Panel */}
          <div className="mt-6 min-h-[140px] rounded-2xl bg-slate-950/90 border border-amber-900/40 p-4 shadow-2xl flex flex-col justify-center">
            {selectedItem ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-150">
                <div className="w-16 h-16 rounded-xl bg-amber-950/20 border-2 border-amber-500/50 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-950/40">
                  {(() => {
                    const Icon = (activeTab === 'WEAPONS' ? WEAPON_ICONS[selectedItem.icon] : STAT_ICONS[selectedItem.icon]) || HelpCircle;
                    const color = activeTab === 'WEAPONS'
                      ? ((selectedItem as any).iconColor || (selectedItem as any).bulletColor)
                      : (selectedItem as any).color || '#fbbf24';
                    return <Icon className="w-8 h-8" style={{ color }} />;
                  })()}
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-100 font-serif">{selectedItem.name}</h3>
                    {isOwned && (
                      <span className="text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full border border-amber-400 uppercase tracking-tighter">
                        {currentLevel >= 7 ? 'MEGA EVOLVED' : `RANK ${currentLevel}`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/70 leading-relaxed italic">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onSelect(selectedItem.id, activeTab === 'WEAPONS' ? 'WEAPON' : 'PASSIVE')}
                    disabled={!canSelect}
                    className={`px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                      canSelect
                        ? 'bg-amber-600 hover:bg-amber-500 text-white border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border-b-4 border-slate-950 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? (isMaxLevel ? 'MAX RANK' : (currentLevel === 6 ? 'MEGA EVOLVE' : 'UPGRADE')) : (isFull ? 'FULL INV' : 'SELECT')}
                  </button>

                  {isOwned && (
                    <button
                      onClick={() => onModifyLevel(selectedItem.id, activeTab === 'WEAPONS' ? 'WEAPON' : 'PASSIVE', -1)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border shadow-md ${
                        currentLevel === 1
                          ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-600 text-rose-200'
                          : 'bg-amber-950/80 hover:bg-amber-900 border-amber-600 text-amber-200'
                      }`}
                    >
                      {currentLevel === 1 ? 'Remove' : 'Downgrade'}
                    </button>
                  )}

                  <button 
                    onClick={() => setShowUpgradeInfo(!showUpgradeInfo)}
                    className="text-[10px] font-bold text-amber-400/60 hover:text-amber-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    {showUpgradeInfo ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-amber-500/40 text-sm italic">
                Select an item from the grid to view details and add to inventory
              </div>
            )}
          </div>

          {/* Details Overlay (Inlined for simplicity in Dev Tool) */}
          {showUpgradeInfo && selectedItem && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Rank Progression
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedItem.tiers
                    .filter((t: any) => t.tier <= maxLevel)
                    .map((t: any) => (
                      <div key={t.tier} className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                        t.tier === currentLevel 
                          ? 'bg-amber-600/20 border-amber-500/50' 
                          : t.tier < currentLevel 
                          ? 'bg-slate-900/40 border-slate-800 opacity-60' 
                          : 'bg-slate-900/60 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded text-amber-400">
                            {t.tier === 7 ? 'Mega Evolved' : `R${t.tier}`}
                          </span>
                          {t.name && <span className="text-xs font-bold text-slate-200">{t.name}</span>}
                        </div>
                        <span className="text-[9px] text-slate-400 text-right leading-tight max-w-[120px]">{t.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
