import React from 'react';
import { 
  Skull, 
  RotateCcw, 
  Home, 
  Sparkles, 
  Sword, 
  Target,
  Flame,
  BookOpen,
  Crosshair,
  Zap,
  Radio,
  Maximize2,
  Shield,
  Wind,
  Footprints,
  Compass,
  Heart,
  Clover,
  Eye,
  Sprout
} from 'lucide-react';
import { OwnedWeapon, OwnedStatItem } from '../types/game';
import { ALL_WEAPONS, ALL_STAT_ITEMS } from '../data/gameData';
import { VampireFangsIcon } from './VampireFangsIcon';
import { PentagramIcon } from './PentagramIcon';
import { BroomIcon } from './BroomIcon';

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
};

interface GameOverModalProps {
  stats: {
    time: number;
    level: number;
    kills: number;
    bossesKilled: number;
    totalDamage?: number;
    killerName?: string;
  };
  isVictory?: boolean;
  isBossRush?: boolean;
  weapons: OwnedWeapon[];
  statItems: OwnedStatItem[];
  onRestart: () => void;
  onReturnToMenu: () => void;
}

const ItemIcon: React.FC<{ 
  def: any; 
  owned: OwnedWeapon | OwnedStatItem; 
  type: 'WEAPON' | 'STAT' 
}> = ({ 
  def, 
  owned, 
  type 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const kills = (owned as OwnedWeapon).kills || 0;
  const isWeapon = type === 'WEAPON';
  const IconComponent = isWeapon ? WEAPON_ICONS[def.icon] : STAT_ICONS[def.icon];

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl
        border-2 transition-all duration-200 cursor-help
        ${isWeapon 
          ? 'bg-purple-950/40 border-purple-500/50 group-hover:border-purple-400 group-hover:bg-purple-900/60' 
          : 'bg-amber-950/40 border-amber-500/50 group-hover:border-amber-400 group-hover:bg-amber-900/60'}
      `}>
        {IconComponent ? (
          <IconComponent className={isWeapon ? "w-6 h-6 text-purple-300" : "w-6 h-6 text-amber-300"} />
        ) : (
          def.icon
        )}
      </div>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in zoom-in duration-200 pointer-events-none">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-2xl min-w-[140px]">
            <div className={`text-sm font-bold mb-1 ${isWeapon ? 'text-purple-300' : 'text-amber-300'}`}>
              {def.name}
            </div>
            <div className="flex flex-col gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <div className="flex items-center gap-2 text-sky-400">
                <Sparkles className="w-3 h-3" />
                <span>{owned.level >= 7 ? 'Mega Evolved' : `Rank ${owned.level}`}</span>
              </div>
              {isWeapon && (
                <div className="flex items-center gap-2 text-rose-400">
                  <Sword className="w-3 h-3" />
                  <span>{kills} Kills</span>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-stone-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isVictory = false,
  isBossRush = false,
  weapons,
  statItems,
  onRestart,
  onReturnToMenu,
}) => {
  const mins = Math.floor(stats.time / 60);
  const secs = Math.floor(stats.time % 60);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalDmgFormatted = stats.totalDamage !== undefined ? Math.round(stats.totalDamage).toLocaleString() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-lg bg-gradient-to-b ${isVictory ? 'from-stone-950 via-amber-950/40 to-stone-950 border-2 border-amber-500/70 shadow-amber-950/70' : 'from-stone-950 via-rose-950/40 to-stone-950 border-2 border-rose-600/70 shadow-rose-950/70'} rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative`}>
        <div className={`w-16 h-16 rounded-2xl ${isVictory ? 'bg-amber-950 border border-amber-500/60 text-amber-300 shadow-amber-950/50' : 'bg-rose-950 border border-rose-600/60 text-rose-400 shadow-rose-950/50'} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
          {isVictory ? <Sparkles className="w-9 h-9" /> : <Skull className="w-9 h-9" />}
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r ${isVictory ? 'from-amber-300 via-yellow-200 to-amber-400' : 'from-red-400 via-rose-200 to-amber-200'} tracking-wide mb-1 uppercase`}>
          {isVictory ? 'Congratulations!' : `THE WITCH WAS DEFEATED BY ${stats.killerName || 'THE SHADOWS'}`}
        </h2>
        <p className="text-stone-400 text-xs sm:text-sm mb-6">
          {isVictory ? 'You have conquered every Boss in the realm and triumphed in the ultimate Boss Rush!' : 'The shadows have claimed your soul. Your deeds are engraved in the Grimoire.'}
        </p>

        {/* Stats Grid */}
        <div className={`grid ${isBossRush ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-3 mb-6 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800`}>
          <div className="flex flex-col p-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">TOTAL TIME</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-amber-300 mt-0.5">{formattedTime}</span>
          </div>
          <div className="flex flex-col p-1 border-l border-stone-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">BOSSES KILLED</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-emerald-200 mt-0.5">{stats.bossesKilled}</span>
          </div>
          {!isBossRush && (
            <div className="flex flex-col p-1 border-t border-stone-800 sm:border-t-0 sm:border-l sm:border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">ENEMIES SLAIN</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-purple-200 mt-0.5">{stats.kills}</span>
            </div>
          )}
          {totalDmgFormatted !== null ? (
            <div className={`flex flex-col p-1 border-l border-stone-800 ${!isBossRush ? 'border-t sm:border-t-0' : ''}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">TOTAL DAMAGE</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-sky-200 mt-0.5">{totalDmgFormatted}</span>
            </div>
          ) : (
            <div className={`flex flex-col p-1 border-l border-stone-800 ${!isBossRush ? 'border-t sm:border-t-0' : ''}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">LEVEL</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-sky-200 mt-0.5">{stats.level}</span>
            </div>
          )}
        </div>

        {/* Acquired Armaments (Hidden in Boss Rush) */}
        {!isBossRush && (
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-4">
              Final Run Arsenal
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              {weapons.map((w) => {
                const def = ALL_WEAPONS.find((item) => item.id === w.id);
                if (!def) return null;
                return <ItemIcon key={w.id} def={def} owned={w} type="WEAPON" />;
              })}
              {statItems.map((s) => {
                const def = ALL_STAT_ITEMS.find((item) => item.id === s.id);
                if (!def) return null;
                return <ItemIcon key={s.id} def={def} owned={s} type="STAT" />;
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            id="restart-run-button"
            onClick={onRestart}
            className="flex-1 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button
            id="menu-return-button"
            onClick={onReturnToMenu}
            className="py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-sm border border-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" /> Menu
          </button>
        </div>
      </div>
    </div>
  );
};
