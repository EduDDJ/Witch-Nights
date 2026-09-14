import React, { useState } from 'react';
import { Volume2, VolumeX, Wind, Crosshair, Sparkles, X, Sliders, Smartphone, RotateCcw, Check, BookOpen, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import { GameOptions, DashMode } from '../types/game';
import { soundEngine } from '../utils/audio';

export interface DownloadableAsset {
  id: string;
  name: string;
  filename: string;
  imgurUrl: string;
  directUrl: string;
  localPath: string;
}

export const ASSET_DOWNLOAD_FILES: DownloadableAsset[] = [
  {
    id: 'VEXYkzW',
    name: 'Pitchfork Peasant',
    filename: 'peasant_pitchfork.png',
    imgurUrl: 'https://imgur.com/a/VEXYkzW',
    directUrl: 'https://i.imgur.com/uvH316Y.png',
    localPath: '/assets/downloads/peasant_pitchfork.png',
  },
  {
    id: '2OlDOSQ',
    name: 'Torch Peasant',
    filename: 'peasant_torch.png',
    imgurUrl: 'https://imgur.com/a/2OlDOSQ',
    directUrl: 'https://i.imgur.com/kKhEjFq.png',
    localPath: '/assets/downloads/peasant_torch.png',
  },
  {
    id: 'A4uLXgD',
    name: 'Village Knight',
    filename: 'village_knight.png',
    imgurUrl: 'https://imgur.com/a/A4uLXgD',
    directUrl: 'https://i.imgur.com/VMPhtDP.png',
    localPath: '/assets/downloads/village_knight.png',
  },
  {
    id: 'XmJBDFi',
    name: 'Carnivore Plant',
    filename: 'carnivore_plant.png',
    imgurUrl: 'https://imgur.com/a/XmJBDFi',
    directUrl: 'https://i.imgur.com/qe0cqr1.png',
    localPath: '/assets/downloads/carnivore_plant.png',
  },
  {
    id: '7msjxyi',
    name: 'NightBear',
    filename: 'night_bear.png',
    imgurUrl: 'https://imgur.com/a/7msjxyi',
    directUrl: 'https://i.imgur.com/iHevmHN.png',
    localPath: '/assets/downloads/night_bear.png',
  },
];

interface OptionsModalProps {
  options: GameOptions;
  onChangeOptions: (updated: Partial<GameOptions>) => void;
  onClose: () => void;
  onResetProgress?: () => void;
  onResetCollection?: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  options,
  onChangeOptions,
  onClose,
  onResetProgress,
  onResetCollection,
}) => {
  const isMobile = options.mobileMode;
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [downloadZipSuccess, setDownloadZipSuccess] = useState<boolean>(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const triggerReset = onResetProgress || onResetCollection;

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

  const handleDownloadSingleFile = async (item: DownloadableAsset) => {
    setDownloadingFileId(item.id);
    try {
      let blob: Blob | null = null;
      try {
        const res = await fetch(item.localPath);
        if (res.ok) blob = await res.blob();
      } catch (err) {
        console.warn('Local path fetch error', err);
      }
      if (!blob) {
        try {
          const res = await fetch(item.directUrl);
          if (res.ok) blob = await res.blob();
        } catch (err) {
          console.warn('Direct URL fetch error', err);
        }
      }
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = item.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Fallback: open URL
        window.open(item.directUrl, '_blank');
      }
    } catch (err) {
      console.error('Download single file error', err);
      window.open(item.directUrl, '_blank');
    } finally {
      setTimeout(() => setDownloadingFileId(null), 1000);
    }
  };

  const handleDownloadAllZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      for (const item of ASSET_DOWNLOAD_FILES) {
        let blob: Blob | null = null;
        try {
          const res = await fetch(item.localPath);
          if (res.ok) blob = await res.blob();
        } catch (err) {
          console.warn('Local fetch error', err);
        }
        if (!blob) {
          try {
            const res = await fetch(item.directUrl);
            if (res.ok) blob = await res.blob();
          } catch (err) {
            console.warn('Direct fetch error', err);
          }
        }
        if (blob) {
          zip.file(item.filename, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'witch_nights_sprites.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setDownloadZipSuccess(true);
      setTimeout(() => setDownloadZipSuccess(false), 3500);
    } catch (err) {
      console.error('Error creating sprites zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
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

            {/* Brightness Slider */}
            <div className="flex flex-col gap-1 pt-1.5 border-t border-purple-900/30">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-300">
                <span className="font-semibold">Screen Brightness</span>
                <span className="font-mono font-bold text-amber-300">
                  {options.brightness}%
                </span>
              </div>
              <input
                id="brightness-slider"
                type="range"
                min="50"
                max="150"
                step="5"
                value={options.brightness}
                onChange={(e) => onChangeOptions({ brightness: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>50% (Dark)</span>
                <span>100% (Default)</span>
                <span>150% (Bright)</span>
              </div>
            </div>
          </div>

          {/* GAME ASSETS & SPRITES DOWNLOAD SECTION */}
          <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-2' : 'p-3.5 gap-2.5'}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
                <Download className="w-4 h-4 text-amber-400" />
                Game Sprites & Assets
              </div>
              {downloadZipSuccess && (
                <span className="text-[10px] sm:text-xs text-emerald-400 font-mono flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Downloaded ZIP!
                </span>
              )}
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Download the 5 game character & enemy PNG sprite files (Pitchfork Peasant, Torch Peasant, Village Knight, Carnivore Plant, NightBear).
            </p>

            {/* Main ZIP Download Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                id="download-all-assets-btn"
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isDownloadingZip}
                className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-900/80 via-purple-900/80 to-indigo-900/80 hover:from-amber-800 hover:via-purple-800 hover:to-indigo-800 text-amber-200 hover:text-white font-bold text-xs sm:text-sm border border-amber-500/50 hover:border-amber-300 shadow-md shadow-purple-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Packaging Sprites ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Download All 5 Files (.ZIP)</span>
                  </>
                )}
              </button>
            </div>

            {/* Individual File Download Pills */}
            <div className="pt-2 border-t border-purple-900/30 flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-purple-400" />
                <span>Or download individual PNGs:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ASSET_DOWNLOAD_FILES.map((item) => {
                  const isDownloadingThis = downloadingFileId === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`download-asset-${item.id}`}
                      type="button"
                      onClick={() => handleDownloadSingleFile(item)}
                      disabled={isDownloadingThis}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-purple-950/80 border border-purple-900/40 hover:border-purple-600/70 text-slate-300 hover:text-white text-[11px] transition-all cursor-pointer group text-left"
                      title={`Download ${item.filename}`}
                    >
                      <span className="truncate pr-1 font-medium">{item.name}</span>
                      <span className="flex items-center gap-1 text-[9px] text-amber-400/90 group-hover:text-amber-300 shrink-0 font-mono bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/40">
                        {isDownloadingThis ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Download className="w-2.5 h-2.5" />
                        )}
                        PNG
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLLECTION PROGRESS & DATA SECTION */}
          {triggerReset && (
            <div className={`rounded-xl bg-purple-950/40 border border-purple-800/40 flex flex-col ${isMobile ? 'p-2.5 gap-2' : 'p-3.5 gap-2.5'}`}>
              <div className="font-semibold text-purple-200 flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  Collection & Progress
                </span>
                {resetSuccess && (
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-mono flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" /> Progress Reset
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Reset Progress</div>
                  <div className="text-[10px] text-slate-400">Clear unlocked codex entries & Boss Rush records</div>
                </div>
                <button
                  id="options-reset-progress-btn"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-rose-950/60 hover:bg-rose-900/90 text-rose-300 hover:text-white border border-rose-700/60 flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          )}
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

      {/* Full-Screen Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          id="collection-reset-confirm-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            id="collection-reset-confirm-card"
            className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#1c112e] to-[#0f0a1c] border-2 border-rose-500/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl shadow-rose-950/80 text-center flex flex-col gap-5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/70">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 tracking-wide">
                Reset Progress?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
                Are you sure you want to reset all unlocked items in your collection and your Boss Rush best time? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-center mt-2">
              <button
                id="reset-confirm-no-btn"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-600 shadow-md hover:text-white"
              >
                No, Cancel
              </button>
              <button
                id="reset-confirm-yes-btn"
                onClick={() => {
                  if (triggerReset) {
                    triggerReset();
                    setResetSuccess(true);
                    setTimeout(() => setResetSuccess(false), 3000);
                  }
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-rose-950/70 border border-rose-400/40"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
