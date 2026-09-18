import React, { useEffect } from 'react';
import { Compass, Wind, Sparkles, Skull, X, Check, Swords, Crown, Navigation, Heart, User, Pause } from 'lucide-react';
import { useLanguage, t } from '../utils/i18n';

interface TutorialModalProps {
  onClose: () => void;
  onStartGame?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose, onStartGame }) => {
  const lang = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="tutorial-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="tutorial-modal-container"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-stone-950 via-purple-950/40 to-stone-950 border-2 border-purple-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/80 relative text-left"
      >
        {/* Close Button */}
        <button
          id="close-tutorial-button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/50 text-purple-300 hover:text-white transition-all cursor-pointer"
          title={t('close_tutorial', lang)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-purple-900/60 border border-purple-500/60 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Compass className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-100 to-indigo-200 font-serif tracking-wide">
              {t('how_to_play', lang)}
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/80">
              {t('tutorial_subtitle', lang)}
            </p>
          </div>
        </div>

        {/* Core Mechanics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* 1. Moving & Targeting */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-purple-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-purple-950 flex items-center justify-center border border-purple-700/50">
                <Navigation className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <span>{t('movement_targeting', lang)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-purple-200">
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">W</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">A</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">S</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">D</kbd>
              <span className="text-stone-400 font-sans text-xs self-center">{t('or_arrow_keys', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('movement_desc', lang)}
            </p>
          </div>

          {/* 2. Phase Dash */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-cyan-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-700/50">
                <Wind className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <span>{t('phase_dash', lang)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-200">
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-cyan-700/40">SHIFT</kbd>
              <span className="text-stone-400 font-sans text-xs">{t('or_spacebar', lang)}</span>
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-cyan-700/40">{t('spacebar_key', lang)}</kbd>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('phase_dash_desc', lang)}
            </p>
          </div>

          {/* 3. Pause & Controls */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-amber-800/40 flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-amber-950 flex items-center justify-center border border-amber-700/50">
                <Pause className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>{t('pause_game', lang)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-amber-200">
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-amber-700/40 font-bold">P</kbd>
              <span className="text-stone-400 font-sans text-xs">{t('or_spacebar', lang)}</span>
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-amber-700/40 font-bold">ESC</kbd>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('pause_shortcut_info', lang)}
            </p>
          </div>

          {/* 4. Boss Encounters & AoE Telegraphs */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-red-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-red-950 flex items-center justify-center border border-red-700/50">
                <Crown className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span>{t('boss_encounters', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('boss_encounters_desc', lang)}
            </p>
          </div>

          {/* 5. Vitality & Regeneration */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-emerald-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-700/50">
                <Heart className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span>{t('vitality_regen', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('vitality_regen_desc', lang)}
            </p>
          </div>

          {/* 6. Weapons & Artifacts */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-amber-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-amber-950 flex items-center justify-center border border-amber-700/50">
                <Swords className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>{t('weapons_artifacts', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('weapons_artifacts_desc', lang)}
            </p>
          </div>

          {/* 7. Slain Foes & Red EXP Gems */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-purple-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-purple-950 flex items-center justify-center border border-purple-700/50">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <span>{t('exp_orbs', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('exp_orbs_desc', lang)}
            </p>
          </div>

          {/* 8. The Witch's Deal */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-rose-800/40 flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-rose-950 flex items-center justify-center border border-rose-700/50">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <span>{t('witch_deal_tutorial_section', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('witch_deal_desc', lang)}
            </p>
          </div>

          {/* 9. Characters & Mega Evolution */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-indigo-800/40 flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-indigo-950 flex items-center justify-center border border-indigo-700/50">
                <User className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <span>{t('characters_mega', lang)}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('char_mega_desc1', lang)}
            </p>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('char_mega_desc2', lang)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/40">
          <button
            id="tutorial-close-confirm-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600/50 text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t('understood', lang)}</span>
          </button>
          {onStartGame && (
            <button
              id="tutorial-start-game-btn"
              onClick={() => {
                onClose();
                onStartGame();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{t('play_now', lang)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


