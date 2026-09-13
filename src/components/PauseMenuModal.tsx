import React from 'react';
import { Play, Settings, BookOpen, LogOut, Pause, RotateCcw, Wrench } from 'lucide-react';

interface PauseMenuModalProps {
  survivalTime: number;
  onResume: () => void;
  onRestartRun: () => void;
  onOpenDevTools: () => void;
  onOpenOptions: () => void;
  onOpenCollection: () => void;
  onReturnToMainMenu: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  survivalTime,
  onResume,
  onRestartRun,
  onOpenDevTools,
  onOpenOptions,
  onOpenCollection,
  onReturnToMainMenu,
}) => {
  const minutes = Math.floor(survivalTime / 60);
  const seconds = Math.floor(survivalTime % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      id="pause-menu-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="pause-menu-card"
        className="relative w-full max-w-sm bg-gradient-to-b from-[#180e2a] via-[#120a20] to-[#0a0512] border-2 border-purple-600/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-purple-950/90 text-slate-100 flex flex-col items-center gap-4 select-none"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/60 mb-0.5">
            <Pause className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-2xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200">
            GAME PAUSED
          </h2>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Survival Time:</span>
            <span className="font-mono font-bold text-amber-300">{formattedTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          {/* 1. Resume Game */}
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 border border-purple-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Resume Game</span>
          </button>

          {/* 2. Restart Run */}
          <button
            id="pause-restart-btn"
            onClick={onRestartRun}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 text-cyan-200 hover:text-white font-semibold text-sm border border-cyan-800/50 hover:border-cyan-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Restart Run</span>
          </button>

          {/* 3. Dev Tools */}
          <button
            id="pause-devtools-btn"
            onClick={onOpenDevTools}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-amber-950/80 text-amber-200 hover:text-white font-semibold text-sm border border-amber-800/50 hover:border-amber-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Dev Tools</span>
          </button>

          {/* 4. Options */}
          <button
            id="pause-options-btn"
            onClick={onOpenOptions}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/80 text-purple-200 hover:text-white font-semibold text-sm border border-purple-700/50 hover:border-purple-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Options</span>
          </button>

          {/* 5. Collection */}
          <button
            id="pause-collection-btn"
            onClick={onOpenCollection}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/80 text-purple-200 hover:text-white font-semibold text-sm border border-purple-700/50 hover:border-purple-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span>Collection</span>
          </button>

          {/* 6. Main Menu */}
          <button
            id="pause-main-menu-btn"
            onClick={onReturnToMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 hover:text-rose-100 font-semibold text-sm border border-rose-800/40 hover:border-rose-600/60 flex items-center justify-center gap-2 transition-all cursor-pointer mt-0.5"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
