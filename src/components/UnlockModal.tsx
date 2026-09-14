import React from 'react';
import { Sprout, Eye, Check, Sparkles, HelpCircle, Flame, Skull, BookOpen, Crosshair, Zap, Sword } from 'lucide-react';
import { ALL_WEAPONS, ALL_STAT_ITEMS } from '../data/gameData';
import { VampireFangsIcon } from './VampireFangsIcon';

interface UnlockModalProps {
  itemId: string;
  mobileMode?: boolean;
  onContinue: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout: Sprout,
  Eye: Eye,
  Fangs: VampireFangsIcon,
  Flame: Flame,
  Skull: Skull,
  BookOpen: BookOpen,
  Crosshair: Crosshair,
  Zap: Zap,
  Sword: Sword,
};

export const UnlockModal: React.FC<UnlockModalProps> = ({ itemId, mobileMode = false, onContinue }) => {
  const item = ALL_WEAPONS.find(w => w.id === itemId) || ALL_STAT_ITEMS.find(s => s.id === itemId);
  const itemName = item ? item.name : 'Unknown Item';
  const iconName = item ? item.icon : '';
  const IconComponent = ICON_MAP[iconName] || HelpCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md bg-gradient-to-b from-stone-950 via-emerald-950/60 to-stone-950 border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-950/80 p-6 text-center relative text-slate-100 ${
        mobileMode ? 'max-w-sm p-4' : ''
      }`}>
        {/* Item Icon Container with Gold Outline */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-950/90 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          <IconComponent className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-serif text-amber-300 tracking-wide mb-1">
          ITEM UNLOCKED!
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <h3 className="text-base sm:text-lg font-bold text-emerald-300">
            {itemName}
          </h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm shadow-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" /> Legendary Item
          </span>
        </div>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed mb-6 bg-stone-900/90 border border-stone-800 p-3.5 rounded-xl shadow-inner">
          {itemName} has been unlocked and can now show up as a level up option! Obtain it in a run in order to discover it!
        </p>

        <button
          id="unlock-continue-btn"
          onClick={onContinue}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Continue
        </button>
      </div>
    </div>
  );
};
