import React from 'react';
import { Play, Skull, X, Trophy, Sparkles, Swords, Compass } from 'lucide-react';
import { getLanguage, t } from '../utils/i18n';

interface GameModeSelectModalProps {
  onSelectNormalRun: () => void;
  onSelectBossRush: () => void;
  onClose: () => void;
  hasTrueWitchTrophy?: boolean;
}

export const GameModeSelectModal: React.FC<GameModeSelectModalProps> = ({
  onSelectNormalRun,
  onSelectBossRush,
  onClose,
  hasTrueWitchTrophy = false,
}) => {
  const currentLang = getLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-950 via-purple-950/60 to-slate-950 border-2 border-purple-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/80 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          title={currentLang === 'en' ? 'Close' : 'Fechar'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-200 tracking-tight">
            {currentLang === 'en' ? 'Select Game Mode' : 'Selecionar Modo de Jogo'}
          </h2>
        </div>

        {/* 2 Game Mode Cards: Normal Run (Left) & Boss Rush (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* LEFT: Normal Run */}
          <button
            id="select-normal-run-card"
            onClick={onSelectNormalRun}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 via-purple-950/40 to-slate-900/90 border-2 border-purple-500/40 hover:border-purple-400 shadow-xl hover:shadow-purple-700/30 hover:-translate-y-1 transition-all duration-200 text-left cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/50 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white text-white" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-2 flex items-center gap-2">
                <span>{currentLang === 'en' ? 'Normal Run' : 'Modo Normal'}</span>
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
                {currentLang === 'en'
                  ? 'Classic survival mode. Defeat waves of monsters, level up, collect magical artifacts, and challenge timed bosses.'
                  : 'Modo sobrevivência clássico. Derrote hordas de monstros, suba de nível, colete artefatos e encare os chefes no tempo.'}
              </p>
            </div>

            <div className="w-full py-3 px-4 rounded-xl bg-purple-700 group-hover:bg-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors">
              <Compass className="w-4 h-4 text-purple-200" />
              <span>{currentLang === 'en' ? 'Start Normal Run' : 'Iniciar Modo Normal'}</span>
            </div>
          </button>

          {/* RIGHT: Boss Rush */}
          <button
            id="select-boss-rush-card"
            onClick={onSelectBossRush}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-stone-950 via-purple-950/60 to-stone-950 border-2 border-amber-500/50 hover:border-amber-400 shadow-xl hover:shadow-amber-900/30 hover:-translate-y-1 transition-all duration-200 text-left cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-900/50 group-hover:scale-110 transition-transform relative">
                <Skull className="w-6 h-6 text-white" />
                {hasTrueWitchTrophy && (
                  <div className="absolute -top-2 -right-2 bg-stone-950 p-1 rounded-full border border-cyan-400 shadow-lg">
                    <Trophy className="w-4 h-4 text-cyan-300 fill-cyan-400/40 animate-pulse" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2 flex items-center gap-2">
                <span>{currentLang === 'en' ? 'Boss Rush' : 'Invasão de Chefes'}</span>
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
                {currentLang === 'en'
                  ? 'Pure boss battles locked at Level 1. Face back-to-back bosses or practice against individual bosses in Singular Fight.'
                  : 'Desafio direto de chefes no Nível 1. Enfrente chefes em sequência ou treine contra chefes individuais na Luta Singular.'}
              </p>
            </div>

            <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 group-hover:from-amber-500 group-hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors">
              <Swords className="w-4 h-4 text-amber-200" />
              <span>{currentLang === 'en' ? 'Enter Boss Rush' : 'Entrar na Invasão'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
