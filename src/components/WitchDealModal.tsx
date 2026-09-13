import React, { useEffect } from 'react';
import { CurseChoice } from '../types/game';
import { Sparkles, Sword, Skull, Flame, Wind, AlertTriangle, RotateCcw } from 'lucide-react';

interface WitchDealModalProps {
  curses: CurseChoice[];
  mobileMode?: boolean;
  onSelectCurse: (curse: CurseChoice) => void;
}

const CURSE_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Sword,
  Skull,
  Flame,
  Wind,
  RotateCcw,
};

export const WitchDealModal: React.FC<WitchDealModalProps> = ({ curses, mobileMode = false, onSelectCurse }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && curses[0]) onSelectCurse(curses[0]);
      if (e.key === '2' && curses[1]) onSelectCurse(curses[1]);
      if (e.key === '3' && curses[2]) onSelectCurse(curses[2]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [curses, onSelectCurse]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 ${
      mobileMode ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
    }`}>
      {/* Compact container to prevent any off-screen text */}
      <div className={`w-full max-h-[90vh] overflow-y-auto bg-gradient-to-b from-stone-950 via-rose-950/40 to-stone-950 border-2 border-rose-600/80 shadow-2xl shadow-rose-950/80 relative text-center ${
        mobileMode
          ? 'max-w-lg rounded-xl p-3 sm:p-4'
          : curses.length >= 3 ? 'max-w-3xl rounded-2xl p-4 sm:p-5' : 'max-w-xl rounded-2xl p-4 sm:p-5'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-center gap-2 ${mobileMode ? 'mb-1' : 'mb-1.5'}`}>
          <div className={`rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/50 ${
            mobileMode ? 'w-6 h-6' : 'w-8 h-8'
          }`}>
            <Skull className={mobileMode ? 'w-3.5 h-3.5 text-stone-950' : 'w-4 h-4 text-stone-950'} />
          </div>
          <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-amber-200 to-rose-300 font-serif tracking-wide ${
            mobileMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}>
            THE WITCH'S DEAL
          </h2>
        </div>

        <div className={`inline-flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 font-bold uppercase tracking-wider ${
          mobileMode ? 'px-2 py-0.2 text-[10px] mb-1.5' : 'px-2.5 py-0.5 text-[11px] mb-2'
        }`}>
          <AlertTriangle className="w-3 h-3 text-amber-400" /> Minute 7:30 Epoch
        </div>

        <p className={`text-stone-300 max-w-md mx-auto leading-snug ${
          mobileMode ? 'text-[11px] sm:text-xs mb-2.5' : 'text-xs sm:text-sm mb-3.5'
        }`}>
          The Blood Moon reaches its zenith. Choose 1 of {curses.length} irreversible Midnight Curses:
        </p>

        {/* Curse Choices Grid */}
        <div className={`grid grid-cols-1 ${curses.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} text-left ${mobileMode ? 'gap-2' : 'gap-3'}`}>
          {curses.map((curse, idx) => {
            const IconComp = CURSE_ICONS[curse.icon] || Skull;
            return (
              <button
                key={curse.id}
                id={`curse-deal-choice-${idx}`}
                onClick={() => onSelectCurse(curse)}
                className={`group relative flex flex-col justify-between rounded-xl bg-stone-900/90 hover:bg-rose-950/60 border-2 border-rose-900/70 hover:border-rose-400 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-950/60 cursor-pointer pointer-events-auto ${
                  mobileMode ? 'p-2.5 sm:p-3' : 'p-3.5'
                }`}
              >
                <div className="pointer-events-none">
                  <div className={`flex items-center justify-between gap-2 ${mobileMode ? 'mb-1.5' : 'mb-2'}`}>
                    <div
                      className={`rounded-lg flex items-center justify-center border group-hover:scale-105 transition-transform ${
                        mobileMode ? 'w-7 h-7' : 'w-9 h-9'
                      }`}
                      style={{
                        backgroundColor: `${curse.color}22`,
                        borderColor: `${curse.color}88`,
                      }}
                    >
                      <IconComp className={mobileMode ? 'w-3.5 h-3.5' : 'w-4 h-4'} style={{ color: curse.color }} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300">
                      CURSE #{idx + 1}
                    </span>
                  </div>

                  <h3 className={`font-bold text-slate-100 group-hover:text-rose-200 transition-colors font-serif leading-tight ${
                    mobileMode ? 'text-xs sm:text-sm mb-0.5' : 'text-sm sm:text-base mb-1'
                  }`}>
                    {curse.title}
                  </h3>

                  <div className={`font-medium text-rose-400/90 italic leading-tight ${
                    mobileMode ? 'text-[10px] mb-1.5' : 'text-[11px] mb-2'
                  }`}>
                    "{curse.subtitle}"
                  </div>

                  <p className={`text-stone-200 leading-relaxed bg-black/50 rounded-lg border border-stone-800 ${
                    mobileMode ? 'text-[10px] sm:text-[11px] p-2 leading-snug' : 'text-[11px] sm:text-xs p-2.5'
                  }`}>
                    {curse.description}
                  </p>
                </div>

                <div className={`border-t border-rose-950/80 flex items-center justify-between pointer-events-none ${
                  mobileMode ? 'mt-2 pt-1.5 text-[10px]' : 'mt-3 pt-2 text-[11px]'
                }`}>
                  <span className="text-rose-400 font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Accept Deal &rarr;
                  </span>
                  <span className="text-stone-500 text-[10px]">Press <kbd className="px-1 py-0.5 bg-stone-800 rounded font-mono">{idx + 1}</kbd> or Click</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
