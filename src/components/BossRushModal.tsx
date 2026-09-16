import React, { useState } from 'react';
import { Play, X, Trophy, Info, Lock, Flame, User } from 'lucide-react';
import { CharacterDefinition } from '../types/game';

interface BossRushModalProps {
  bestTime: number | null;
  characterBestTime: number | null;
  selectedCharacter: CharacterDefinition;
  isTrueWitchUnlocked: boolean;
  isTrueWitchMode: boolean;
  onToggleTrueWitchMode: (enabled: boolean) => void;
  onStartBossRush: () => void;
  onOpenCharacterSelect: () => void;
  onClose: () => void;
}

export const BossRushModal: React.FC<BossRushModalProps> = ({
  bestTime,
  characterBestTime,
  selectedCharacter,
  isTrueWitchUnlocked,
  isTrueWitchMode,
  onToggleTrueWitchMode,
  onStartBossRush,
  onOpenCharacterSelect,
  onClose,
}) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const formatSecs = (sec: number | null) =>
    sec !== null
      ? `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
      : '-';

  const formattedBestTime = formatSecs(bestTime);
  const formattedCharacterBestTime = formatSecs(characterBestTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-stone-950 via-purple-950/40 to-stone-950 border-2 border-purple-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-200 to-amber-200 tracking-wide mb-3 uppercase">
          Boss Rush Mode
        </h2>

        <p className="text-stone-300 text-sm leading-relaxed mb-5 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
          Fight every Boss back-to-back while locked at Level 1! If you&apos;re defeated, you have to start again all the way from the first Boss, so come prepared. Every Boss defeated heals you for 25 HP!
        </p>

        {/* True Witch Mode Toggle Container */}
        <div className="mb-5 bg-stone-900/90 rounded-2xl border border-stone-800 p-3.5 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Info Icon Button */}
              <button
                type="button"
                id="true-witch-info-btn"
                onClick={() => setShowInfo((prev) => !prev)}
                className="w-6 h-6 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 flex items-center justify-center text-purple-300 hover:text-purple-100 transition-colors cursor-pointer shrink-0"
                title="True Witch Mode Details"
                aria-label="Information about True Witch Mode"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 text-left">
                <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Flame className={`w-4 h-4 ${isTrueWitchMode && isTrueWitchUnlocked ? 'text-rose-400' : 'text-stone-500'}`} />
                  True Witch Mode
                </span>
                {!isTrueWitchUnlocked && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                    <Lock className="w-3 h-3 text-amber-500/80" /> Locked
                  </span>
                )}
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              id="true-witch-mode-toggle"
              disabled={!isTrueWitchUnlocked}
              onClick={() => onToggleTrueWitchMode(!isTrueWitchMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                isTrueWitchUnlocked && isTrueWitchMode
                  ? 'bg-rose-600'
                  : 'bg-stone-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isTrueWitchUnlocked && isTrueWitchMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Expandable Info Dropdown / Tooltip */}
          {showInfo && (
            <div className="mt-1 text-left text-xs bg-stone-950/95 border border-purple-800/60 text-purple-200 p-3 rounded-xl leading-relaxed animate-in fade-in duration-150">
              <p className="font-semibold text-rose-300 mb-1">True Witch Mode Rules:</p>
              <ul className="list-disc list-inside text-stone-300 text-[11px] space-y-1">
                <li>Passive HP regeneration is completely disabled.</li>
                <li>Defeating Bosses will <strong className="text-rose-300">not</strong> heal you (+25 HP heal is disabled).</li>
                <li>Unlock by conquering standard Boss Rush Mode!</li>
              </ul>
            </div>
          )}
        </div>

        {/* Start Boss Rush Button */}
        <button
          id="start-boss-rush-modal-button"
          onClick={onStartBossRush}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white text-white" />
          <span>Start Boss Rush</span>
        </button>

        {/* Select Character Section under Start Boss Rush */}
        <div className="mt-3.5 flex flex-col items-center gap-2 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
          <button
            id="boss-rush-select-character-btn"
            onClick={onOpenCharacterSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/60 text-purple-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <User className="w-4 h-4 text-purple-300" />
            <span>Select Character</span>
          </button>
          
          <div className="text-xs text-stone-300 flex items-center justify-center gap-1.5 font-medium flex-wrap">
            <span className="text-stone-400">Current Character:</span>
            <span className="text-amber-300 font-bold font-serif">
              {selectedCharacter.name}
              {selectedCharacter.title ? ` – ${selectedCharacter.title}` : ''}
            </span>
          </div>
        </div>

        {/* Best Times Section */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-stone-300 text-xs sm:text-sm font-medium bg-stone-900/60 p-3 rounded-2xl border border-stone-800/80">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-400">Best Time:</span>
            <span className={`font-mono font-bold ${bestTime !== null ? 'text-amber-300' : 'text-stone-400'}`}>
              {formattedBestTime}
            </span>
          </div>

          <span className="text-stone-700 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-stone-400">{selectedCharacter.name}&apos;s Best Time:</span>
            <span className={`font-mono font-bold ${characterBestTime !== null ? 'text-amber-300' : 'text-stone-400'}`}>
              {formattedCharacterBestTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
