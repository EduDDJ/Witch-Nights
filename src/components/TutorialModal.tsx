import React, { useEffect } from 'react';
import { Compass, Wind, Sparkles, Skull, X, Check, Swords, Crown, Navigation, Heart } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
  onStartGame?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose, onStartGame }) => {
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
          title="Close Tutorial"
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
              How to Play
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/80">
              Master witchcraft, survive monster hordes, conquer formidable bosses, and forge forbidden pacts.
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
              <span>Movement & Targeting</span>
            </div>
            <div className="flex gap-1.5 font-mono text-xs text-purple-200">
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">W</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">A</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">S</kbd>
              <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-purple-700/40">D</kbd>
              <span className="text-stone-400 font-sans text-xs self-center">or Arrow keys</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Navigate seamlessly across the cursed realm. Aim with your <strong>mouse cursor</strong> to guide directional projectiles and targeted spells like Arcana Blast!
            </p>
          </div>

          {/* 2. Phase Dash */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-cyan-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-700/50">
                <Wind className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <span>Phase Dash</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-200">
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-cyan-700/40">SHIFT</kbd>
              <span className="text-stone-400 font-sans text-xs">or</span>
              <kbd className="px-2.5 py-0.5 rounded bg-stone-800 border border-cyan-700/40">SPACEBAR</kbd>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Burst with speed and <strong>total invulnerability (i-frames)</strong> on a <strong>3s cooldown</strong>. Use Dash to pierce dense swarms or dodge lethal attacks! (Cooldown can be reduced by up to 50% with the <em>Broom of Haste</em>).
            </p>
          </div>

          {/* 3. Boss Encounters & AoE Telegraphs */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-red-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-red-950 flex items-center justify-center border border-red-700/50">
                <Crown className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span>Boss Encounters & Hazard Zones</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Formidable bosses like the <strong>Carnivore Plant</strong> emerge during your run. Each boss has a <strong>Base Max HP</strong> (their health at Level 1), which scales by <strong>+12% for every player level</strong>. Watch out for red telegraphed hazard rings—activate your <strong>Phase Dash</strong> to evade!
            </p>
          </div>

          {/* 4. Vitality & Regeneration */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-emerald-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-700/50">
                <Heart className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span>Vitality & Regeneration</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              You possess a natural <strong>passive healing of 0.5 HP/s</strong>. This vital regeneration can be significantly upgraded by finding and leveling up the <strong>Bloodstone</strong> artifact!
            </p>
          </div>

          {/* 5. Weapons & Artifacts */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-amber-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-amber-950 flex items-center justify-center border border-amber-700/50">
                <Swords className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>Weapons & Artifacts</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Equip up to <strong>5 active Weapons</strong> alongside <strong>5 passive Artifacts</strong> that bestow persistent stat enhancements. Every weapon level-up also grants an innate <strong>+10% damage bonus</strong>.
            </p>
          </div>

          {/* 6. Slain Foes & Red EXP Gems */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-purple-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-purple-950 flex items-center justify-center border border-purple-700/50">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <span>EXP Orbs & Enemy Drops</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Defeat foes to harvest EXP: standard cyan gems, elite <strong>Village Knight</strong> red orbs (<strong>10 EXP</strong>), and colossal Boss yellow orbs (<strong>75 EXP</strong>). Enemies also have a 10% chance to drop special items like <strong>Healing Food (+25 HP)</strong>, upgraded orbs, or rare EXP Magnets (~1%).
            </p>
          </div>

          {/* 7. The Witch's Deal */}
          <div className="p-4 rounded-2xl bg-stone-900/85 border border-rose-800/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-rose-950 flex items-center justify-center border border-rose-700/50">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <span>The Witch's Deal</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              When the clock strikes 07:30, a Witch offers 2 forbidden Midnight Curses. Choose a dark bargain for transcendent power at a dangerous cost.
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
            <span>Understood</span>
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
              <span>Play Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

