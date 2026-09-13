import React from 'react';
import { Wrench, ArrowUpCircle, Skull, Clock, X, Sparkles, Zap, Plus } from 'lucide-react';

interface DevToolsModalProps {
  currentLevel: number;
  survivalTime: number;
  mobileMode?: boolean;
  instaKill: boolean;
  onInstantLevelUp: () => void;
  onSkipToMinute5: () => void;
  onSkipToMinute730: () => void;
  onToggleInstaKill: () => void;
  onOpenWeaponSelector: () => void;
  onClose: () => void;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({
  currentLevel,
  survivalTime,
  mobileMode = false,
  instaKill,
  onInstantLevelUp,
  onSkipToMinute5,
  onSkipToMinute730,
  onToggleInstaKill,
  onOpenWeaponSelector,
  onClose,
}) => {
  const minutes = Math.floor(survivalTime / 60);
  const seconds = Math.floor(survivalTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      id="devtools-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="devtools-modal-card"
        className={`relative w-full max-w-md bg-gradient-to-b from-[#180e2a] via-[#120a20] to-[#0a0512] border-2 border-amber-500/70 rounded-3xl shadow-2xl shadow-amber-950/80 text-slate-100 flex flex-col select-none ${
          mobileMode ? 'p-4 sm:p-5 gap-3.5 max-h-[92vh] overflow-y-auto' : 'p-6 sm:p-7 gap-5'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/60">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400">
                Dev Tools
              </h2>
              <p className="text-[11px] text-amber-400/80">
                Quick gameplay debugging & testing actions
              </p>
            </div>
          </div>
          <button
            id="devtools-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-amber-950 border border-amber-700/50 hover:border-amber-400 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close Dev Tools"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-purple-900/40">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Current Level</span>
            <span className="text-purple-300 font-mono font-bold text-sm">LVL {currentLevel}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Survival Time</span>
            <span className="text-amber-300 font-mono font-bold text-sm">{formattedTime}</span>
          </div>
        </div>

        {/* Dev Actions Grid */}
        <div className="flex flex-col gap-2.5">
          {/* Action 0: Insta Kill Toggle */}
          <button
            id="dev-action-instakill"
            onClick={onToggleInstaKill}
            className={`group flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer hover:-translate-y-0.5 shadow-md ${
              instaKill
                ? 'bg-rose-950/90 border-rose-500 shadow-rose-950/60'
                : 'bg-slate-900/90 hover:bg-rose-950/50 border-rose-900/50 hover:border-rose-700 shadow-rose-950/20'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                instaKill ? 'bg-rose-600 border-rose-300 text-white' : 'bg-rose-900/60 border-rose-500/50 text-rose-300'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Insta Kill</span>
                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                    instaKill ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {instaKill ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Defeat any enemy & boss in one hit
                </div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              instaKill ? 'bg-rose-500 border-rose-300 text-white font-bold text-xs' : 'border-slate-700 bg-slate-900'
            }`}>
              {instaKill && '✓'}
            </div>
          </button>

          {/* Action 1: Weapon Selector */}
          <button
            id="dev-action-weapon-selector"
            onClick={onOpenWeaponSelector}
            className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-amber-950/80 border-2 border-amber-900/50 hover:border-amber-400 transition-all cursor-pointer hover:-translate-y-0.5 shadow-md shadow-amber-950/40"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 group-hover:text-amber-200 transition-colors">
                  Weapon Selector
                </div>
                <div className="text-[11px] text-slate-400">
                  Select and upgrade any weapon or artifact
                </div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Action 2: Skip to Minute 5:00 */}
          <button
            id="dev-action-skip-min-5"
            onClick={onSkipToMinute5}
            className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/80 border-2 border-emerald-900/50 hover:border-emerald-400 transition-all cursor-pointer hover:-translate-y-0.5 shadow-md shadow-emerald-950/40"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                <Skull className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-200 transition-colors">
                  Skip to Minute 5:00
                </div>
                <div className="text-[11px] text-slate-400">
                  Jump to 05:00 & choose a Boss Fight
                </div>
              </div>
            </div>
            <Clock className="w-4 h-4 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Action 3: Skip to Minute 7:30 */}
          <button
            id="dev-action-skip-min-730"
            onClick={onSkipToMinute730}
            className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-rose-950/80 border-2 border-rose-900/50 hover:border-rose-400 transition-all cursor-pointer hover:-translate-y-0.5 shadow-md shadow-rose-950/40"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-rose-900/60 border border-rose-500/50 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 group-hover:text-rose-200 transition-colors">
                  Skip to Minute 7:30
                </div>
                <div className="text-[11px] text-slate-400">
                  Jump to 07:30 & trigger The Witch's Deal
                </div>
              </div>
            </div>
            <Clock className="w-4 h-4 text-rose-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};

