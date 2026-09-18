import React from 'react';
import { BookOpen, Play, Settings, HelpCircle, Skull, Trophy } from 'lucide-react';
import { getLanguage, t } from '../utils/i18n';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenBossRush: () => void;
  onOpenCollection: () => void;
  onOpenOptions: () => void;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  hasTrueWitchTrophy?: boolean;
  unlockedCount: number;
  totalCount: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenBossRush,
  onOpenCollection,
  onOpenOptions,
  onOpenTutorial,
  onOpenAchievements,
  hasTrueWitchTrophy = false,
  unlockedCount,
  totalCount,
}) => {
  const currentLang = getLanguage();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#0a0712] via-[#120b22] to-[#080510] text-slate-100 select-none overflow-hidden font-sans">
      {/* Mystical Background Visuals */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-rose-600/15 rounded-full blur-[90px]" />
      </div>

      {/* Decorative occult circle pattern */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-purple-500/10 rounded-full pointer-events-none flex items-center justify-center animate-[spin_120s_linear_infinite]">
        <div className="w-[420px] h-[420px] border border-purple-400/15 rounded-full border-dashed" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-10 w-full z-10">
        {/* Top Header */}
        <header className="text-center flex flex-col items-center">
          {/* Title "Witch Nights" */}
          <h1
            id="main-title"
            className="text-6xl sm:text-8xl md:text-9xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-purple-100 via-purple-300 to-indigo-400 drop-shadow-[0_10px_30px_rgba(147,51,234,0.4)]"
          >
            WITCH NIGHTS
          </h1>
        </header>

        {/* Middle Controls & Buttons */}
        <main className="flex flex-col items-center w-full max-w-lg">
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full">
            {/* Left Column: Prominent "Start Game" button */}
            <div className="flex-1 w-full flex flex-col items-center">
              <button
                id="start-game-button"
                onClick={onStartGame}
                className="group relative w-full h-full min-h-[140px] px-8 py-6 rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xl sm:text-2xl shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 hover:-translate-y-0.5 transition-all duration-200 border-2 border-purple-400/50 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />
                <Play className="w-10 h-10 fill-white text-white group-hover:scale-110 transition-transform drop-shadow-md" />
                <span>{t('start_game', currentLang)}</span>
              </button>
            </div>

            {/* Column with "Collection" button and Tutorial/Achievements/Options under it */}
            <div className="flex-1 w-full flex flex-col items-center gap-2">
              <button
                id="collection-button"
                onClick={onOpenCollection}
                className="group relative w-full px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-purple-950/80 text-purple-200 hover:text-white font-bold text-lg border-2 border-purple-700/50 hover:border-purple-400 shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                <span>{t('collection', currentLang)}</span>
                <span className="text-xs bg-purple-900/80 border border-purple-600/50 px-2 py-0.5 rounded-full text-purple-300 font-mono">
                  {unlockedCount}/{totalCount}
                </span>
              </button>

              {/* Sub-row under Collection */}
              <div className="flex w-full gap-2">
                {/* Left column: Tutorial on top, Achievements directly under it with exact same size */}
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    id="tutorial-button"
                    onClick={onOpenTutorial}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 hover:border-purple-500/70 text-purple-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer hover:scale-105"
                    title={currentLang === 'en' ? 'Learn how to play' : 'Aprenda a jogar'}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t('tutorial', currentLang)}</span>
                  </button>

                  <button
                    id="achievements-button"
                    onClick={onOpenAchievements}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 hover:border-purple-500/70 text-purple-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer hover:scale-105"
                    title={currentLang === 'en' ? 'View Achievements' : 'Ver Conquistas'}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('achievements', currentLang)}</span>
                  </button>
                </div>

                {/* Right column: Options spanning the same height */}
                <div className="flex-1 flex flex-col">
                  <button
                    id="options-button"
                    onClick={onOpenOptions}
                    className="w-full h-full inline-flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 hover:border-purple-500/70 text-purple-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer hover:scale-105"
                    title={currentLang === 'en' ? 'Game Options' : 'Opções de Jogo'}
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>{t('options', currentLang)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
