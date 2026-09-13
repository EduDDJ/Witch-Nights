import React from 'react';
import { Volume2, VolumeX, Wind, Crosshair, Sparkles, X, Sliders, Smartphone } from 'lucide-react';
import { GameOptions, DashMode } from '../types/game';
import { soundEngine } from '../utils/audio';

interface OptionsModalProps {
  options: GameOptions;
  onChangeOptions: (updated: Partial<GameOptions>) => void;
  onClose: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  options,
  onChangeOptions,
  onClose,
}) => {
  const isMobile = options.mobileMode;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChangeOptions({ soundVolume: val });
    soundEngine.setVolume(val / 100);
    soundEngine.playTestBeep();
  };

  const handleToggleSound = () => {
    const next = !options.soundEnabled;
    onChangeOptions({ soundEnabled: next });
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.playTestBeep();
    }
  };

  const handleSelectDashMode = (mode: DashMode) => {
    onChangeOptions({ dashMode: mode });
  };

  return (
    <div
      id="options-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="options-modal-card"
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#170e28] via-[#120b22] to-[#0a0614] border-2 border-purple-600/70 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-950/80 text-slate-100 flex flex-col select-none ${
          isMobile ? 'p-3.5 sm:p-5 gap-3' : 'p-5 sm:p-7 gap-5'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-purple-800/40 ${isMobile ? 'pb-2.5' : 'pb-3.5'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/50 ${
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <Sliders className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
            <div>
              <h2 className={`font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200 ${
                isMobile ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              }`}>
                Game Options
              </h2>
              <p className="text-[10px] sm:text-xs text-purple-400/80">Configure audio, mobile layout, and controls</p>
            </div>
          </div>
          <button
            id="options-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-purple-950 border border-purple-700/50 hover:border-purple-400 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close options"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Content */}
        <div className={`flex flex-col text-sm ${isMobile ? 'gap-2.5' : 'gap-4'}`}>
          {/* MOBILE MODE SECTION */}
          <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-1.5' : 'p-3.5 gap-2.5'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
                <Smartphone className="w-4 h-4 text-sky-400" />
                Mobile Mode
              </span>
              <button
                id="toggle-mobile-mode-btn"
                onClick={() => onChangeOptions({ mobileMode: !options.mobileMode })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  options.mobileMode
                    ? 'bg-sky-950/80 border-sky-600/70 text-sky-300 hover:bg-sky-900'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {options.mobileMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Adds an on-screen movement joystick above your items list, compacts menus for smaller screens, and adjusts top HUD positioning.
            </p>
          </div>

          {/* AUDIO SECTION */}
          <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-1.5' : 'p-3.5 gap-2.5'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
                {options.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                Sound Effects
              </span>
              <button
                id="toggle-sound-btn"
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  options.soundEnabled
                    ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900'
                    : 'bg-rose-950/80 border-rose-600/70 text-rose-300 hover:bg-rose-900'
                }`}
              >
                {options.soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Loudness Slider */}
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-300">
                <span>Volume</span>
                <span className="font-mono font-bold text-amber-300">
                  {options.soundEnabled ? `${options.soundVolume}%` : 'Muted'}
                </span>
              </div>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="100"
                value={options.soundVolume}
                onChange={handleVolumeChange}
                disabled={!options.soundEnabled}
                className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* DASH DIRECTION SECTION */}
          <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-1.5' : 'p-3.5 gap-2.5'}`}>
            <div>
              <div className="font-semibold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
                <Wind className="w-4 h-4 text-cyan-400" />
                Dash Direction
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="dash-mode-movement-btn"
                onClick={() => handleSelectDashMode('MOVEMENT')}
                className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  options.dashMode === 'MOVEMENT'
                    ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-100 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/50 border-purple-900/40 text-slate-400 hover:border-purple-700/60'
                }`}
              >
                <Wind className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${options.dashMode === 'MOVEMENT' ? 'text-cyan-300' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    Movement Direction
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dashes along WASD movement.
                  </div>
                </div>
              </button>

              <button
                id="dash-mode-cursor-btn"
                onClick={() => handleSelectDashMode('CURSOR')}
                className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  options.dashMode === 'CURSOR'
                    ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-100 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/50 border-purple-900/40 text-slate-400 hover:border-purple-700/60'
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${options.dashMode === 'CURSOR' ? 'text-cyan-300' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-xs">
                    Cursor Aim
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dashes toward cursor.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* VISUALS & COMBAT FEEDBACK */}
          <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-2' : 'p-3.5 gap-2.5'}`}>
            <div className="font-semibold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Visual Feedback
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Screen Shake</div>
                <div className="text-[10px] text-slate-400">Subtle camera recoil on impactful strikes</div>
              </div>
              <button
                id="toggle-screenshake-btn"
                onClick={() => onChangeOptions({ screenShake: !options.screenShake })}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  options.screenShake
                    ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {options.screenShake ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-purple-900/30">
              <div>
                <div className="text-xs font-semibold text-slate-200">Damage Numbers</div>
                <div className="text-[10px] text-slate-400">Show floating combat damage values</div>
              </div>
              <button
                id="toggle-damage-numbers-btn"
                onClick={() => onChangeOptions({ damageNumbers: !options.damageNumbers })}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  options.damageNumbers
                    ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {options.damageNumbers ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end border-t border-purple-800/30 ${isMobile ? 'pt-1.5' : 'pt-2.5'}`}>
          <button
            id="options-confirm-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-950/60 border border-purple-400/40 transition-all cursor-pointer"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
};
