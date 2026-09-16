import React, { useEffect } from 'react';
import { Trophy, X, Check, Lock, Sparkles, Gem } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';

interface AchievementsModalProps {
  completedAchievementIds: string[];
  onClose: () => void;
  mobileMode?: boolean;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  completedAchievementIds,
  onClose,
  mobileMode = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const completedCount = completedAchievementIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      id="achievements-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="achievements-modal-container"
        className={`w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-gradient-to-b from-stone-950 via-purple-950/40 to-stone-950 border-2 border-purple-700/60 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-950/80 relative text-left p-2.5 sm:p-4`}
      >
        {/* Close Button */}
        <button
          id="close-achievements-button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 p-1 sm:p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/50 text-purple-300 hover:text-white transition-all cursor-pointer z-10"
          title="Close Achievements"
        >
          <X className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2.5 pr-8 shrink-0">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-400/50 flex items-center justify-center shadow-md shadow-purple-950/50 shrink-0">
            <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-300 fill-amber-400/20 drop-shadow" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-100 to-indigo-200 font-serif tracking-wide truncate">
                Achievements
              </h2>
              <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-amber-300 shrink-0">
                {completedCount} / {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-900/80 border border-purple-900/50 h-1 sm:h-2 rounded-full mb-1.5 sm:mb-2.5 overflow-hidden p-0.5 shrink-0">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal List of Achievements (Slim vertical cards fitting ~4 in view) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 sm:gap-2 min-h-0">
          {ACHIEVEMENTS.map((ach) => {
            const isCompleted = completedAchievementIds.includes(ach.id);
            const isTrueWitchModeAch = ach.id === 'being_a_witch_isnt_a_job';

            return (
              <div
                key={ach.id}
                id={`achievement-card-${ach.id}`}
                className={`flex items-center justify-between gap-1.5 sm:gap-3 px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-r from-purple-950/40 via-stone-900/90 to-purple-950/30 border-purple-500/50 shadow-sm'
                    : 'bg-stone-900/60 border-stone-800/80 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Left Side: Square Checkbox */}
                <div
                  id={`achievement-checkbox-${ach.id}`}
                  aria-label={isCompleted ? `${ach.title} completed` : `${ach.title} incomplete`}
                  className={`w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                      : 'border-stone-700 bg-stone-950/80 text-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 stroke-[3]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-xs border border-stone-800" />
                  )}
                </div>

                {/* Center Content: Title, Description, and Unlock */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 sm:gap-x-2 sm:gap-y-0.5">
                    <span className={`font-serif font-bold text-[11px] sm:text-sm truncate ${
                      isCompleted ? 'text-purple-100' : 'text-stone-300'
                    }`}>
                      {ach.title}
                    </span>

                    {isTrueWitchModeAch && (
                      <span title="Grants Diamond Trophy" className="inline-flex items-center">
                        <Trophy className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                          isCompleted
                            ? 'text-cyan-300 fill-cyan-400/40 drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]'
                            : 'text-stone-600'
                        }`} />
                      </span>
                    )}

                    <span className={`text-[9px] sm:text-xs flex items-center gap-1 font-medium ${
                      isCompleted ? 'text-amber-300/90' : 'text-stone-400'
                    }`}>
                      <span className="text-purple-400/70">Unlocks:</span>
                      <strong className={isCompleted ? 'text-amber-200' : 'text-stone-300'}>{ach.unlockText}</strong>
                    </span>
                  </div>

                  <p className="text-[9px] sm:text-xs text-stone-400 truncate sm:line-clamp-1 leading-tight mt-0.2 sm:mt-0.5">
                    {ach.description}
                  </p>
                </div>

                {/* Right Side: Status Badge */}
                <div className="shrink-0 flex items-center">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] sm:text-xs font-bold">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">Completed</span>
                      <span className="sm:hidden">Done</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 rounded-md bg-stone-900 border border-stone-700/60 text-stone-500 text-[9px] sm:text-xs font-semibold">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-1.5 pt-1.5 sm:mt-3 sm:pt-2.5 border-t border-purple-900/40 flex justify-end shrink-0">
          <button
            id="close-achievements-bottom-button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-600/50 hover:border-purple-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
