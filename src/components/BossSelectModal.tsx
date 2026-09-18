import React, { useEffect, useState } from 'react';
import { BossDefinition } from '../types/game';
import { Eye, Swords, Sparkles, AlertTriangle, Wrench, X } from 'lucide-react';
import { resolveAssetPath } from '../utils/assets';
import { GameImage } from './GameImage';
import { getLanguage, t, translateBossName } from '../utils/i18n';

interface BossSelectModalProps {
  bosses: BossDefinition[];
  mobileMode?: boolean;
  isDevChoice?: boolean;
  onSelectBoss: (bossId: string) => void;
  onClose?: () => void;
}

export const BossSelectModal: React.FC<BossSelectModalProps> = ({
  bosses,
  mobileMode = false,
  isDevChoice = false,
  onSelectBoss,
  onClose,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard 1, 2, 3, 4 and Escape shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return;
      if (e.key === '1' && bosses[0]) onSelectBoss(bosses[0].id);
      if (e.key === '2' && bosses[1]) onSelectBoss(bosses[1].id);
      if (e.key === '3' && bosses[2]) onSelectBoss(bosses[2].id);
      if (e.key === '4' && bosses[3]) onSelectBoss(bosses[3].id);
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bosses, isReady, onSelectBoss, onClose]);

  return (
    <div
      id="boss-select-modal"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 ${
        mobileMode ? 'p-2 sm:p-4' : 'p-4'
      }`}
    >
      <div
        className={`w-full max-h-[94vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-purple-950/90 to-slate-950 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 relative ${
          mobileMode
            ? 'max-w-xl rounded-2xl p-3 sm:p-5'
            : 'max-w-2xl rounded-3xl p-6 sm:p-8'
        }`}
      >
        {/* Optional Close Button for Dev Mode */}
        {onClose && (
          <button
            id="boss-select-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-amber-950 border border-amber-700/50 hover:border-amber-400 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Glow Header */}
        <div className={`text-center ${mobileMode ? 'mb-3' : 'mb-6'}`}>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-300 font-bold uppercase tracking-widest ${
              mobileMode ? 'px-2 py-0.5 text-[10px] mb-1' : 'px-3.5 py-1 text-xs mb-2'
            }`}
          >
            {isDevChoice ? (
              <>
                <Wrench className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {t('dev_tools_badge', getLanguage())}
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {t('destiny_control_activated', getLanguage())}
              </>
            )}
          </div>
          <h2
            className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 tracking-tight font-serif ${
              mobileMode ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {isDevChoice ? t('dev_choose_boss_title', getLanguage()) : t('choose_boss', getLanguage())}
          </h2>
          <p
            className={`text-slate-300 max-w-lg mx-auto ${
              mobileMode ? 'text-[11px] sm:text-xs mt-0.5' : 'text-xs sm:text-sm mt-1'
            }`}
          >
            {isDevChoice ? t('dev_choose_boss_desc', getLanguage()) : t('choose_boss_desc', getLanguage())}
          </p>
        </div>

        {/* Bosses Selection Grid */}
        <div
          className={`grid grid-cols-1 ${
            bosses.length > 1 ? 'sm:grid-cols-2' : ''
          } gap-3 sm:gap-4 transition-all duration-300 ${
            isReady ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {bosses.map((boss, idx) => {
            const isPlant = boss.id === 'carnivore_plant';
            const isEye = boss.id === 'haunted_eye';
            const isBear = boss.id === 'night_bear';
            const isArchmages = boss.id === 'archmages';

            return (
              <button
                key={boss.id}
                id={`boss-option-${boss.id}`}
                onClick={() => onSelectBoss(boss.id)}
                className={`group relative text-left rounded-2xl p-4 transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isPlant
                    ? 'bg-gradient-to-b from-emerald-950/60 via-slate-900 to-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/40'
                    : isEye 
                    ? 'bg-gradient-to-b from-rose-950/60 via-slate-900 to-rose-950/40 border-rose-500/50 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-900/40'
                    : isArchmages
                    ? 'bg-gradient-to-b from-purple-950/60 via-slate-900 to-indigo-950/40 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/40'
                    : 'bg-gradient-to-b from-stone-950/60 via-slate-900 to-stone-950/40 border-stone-500/50 hover:border-stone-400 hover:shadow-lg hover:shadow-stone-900/40'
                }`}
              >
                {/* Hotkey Tag */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-amber-300 border border-amber-500/30 font-bold">
                    Key [{idx + 1}]
                  </span>
                </div>

                <div>
                  {/* Boss Visual Art Container */}
                  <div className="flex items-center justify-center my-2">
                    <div
                      className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105 shadow-inner ${
                        isPlant
                          ? 'bg-emerald-950/80 border-emerald-500/60 shadow-emerald-900/50'
                          : isEye
                          ? 'bg-rose-950/80 border-rose-500/60 shadow-rose-900/50'
                          : isArchmages
                          ? 'bg-purple-950/80 border-purple-500/60 shadow-purple-900/50'
                          : 'bg-stone-950/80 border-stone-500/60 shadow-stone-900/50'
                      }`}
                    >
                      {isPlant && (
                        <GameImage
                          src="assets/aistudio/carnivore_plant.png"
                          fallbackSrc="assets/carnivore_plant.png"
                          alternateFallbacks={['https://i.imgur.com/kaNPLzb.png']}
                          alt="Carnivore Plant Visual"
                          className="w-20 h-20 object-contain [image-rendering:pixelated] drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      )}

                      {isEye && (
                        <GameImage
                          src="assets/aistudio/haunted_eye_open.png"
                          fallbackSrc="assets/haunted_eye_open.png"
                          alternateFallbacks={['https://i.imgur.com/caqAbHC.png']}
                          alt="Haunted Eye Visual"
                          className="w-20 h-20 object-contain [image-rendering:pixelated] drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      )}

                      {isBear && (
                        <GameImage
                          src="assets/aistudio/night_bear.png"
                          fallbackSrc="assets/night_bear.png"
                          alternateFallbacks={['https://i.imgur.com/Pjkp2on.png']}
                          alt="NightBear Visual"
                          className="w-20 h-20 object-contain [image-rendering:pixelated] drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      )}

                      {isArchmages && (
                        <GameImage
                          src="assets/aistudio/geraldo_rgb.png"
                          fallbackSrc="assets/geraldo_rgb.png"
                          alternateFallbacks={['https://i.imgur.com/w8qU2F1.png', 'assets/geraldo.png']}
                          alt="The 3 Archmages Visual"
                          className="w-20 h-20 object-contain [image-rendering:pixelated] drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      )}
                    </div>
                  </div>

                  {/* Boss Identity */}
                  <div className="text-center mt-2">
                    <h3
                      className={`text-lg sm:text-xl font-bold font-serif ${
                        isPlant ? 'text-emerald-200' : isEye ? 'text-rose-200' : isArchmages ? 'text-purple-200' : 'text-stone-200'
                      }`}
                    >
                      {translateBossName(boss.id, boss.name, getLanguage())}
                    </h3>
                    <div
                      className={`inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full mt-1 ${
                        isPlant
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          : isEye
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : isArchmages
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : 'bg-stone-900/60 text-stone-300 border border-stone-700/50'
                      }`}
                    >
                      {isPlant
                        ? (getLanguage() === 'pt-BR' ? 'O Diabo da Estufa' : "Greenhouse's Devil")
                        : isEye
                        ? (getLanguage() === 'pt-BR' ? 'Espírito Onisciente' : 'All-Seeing Spirit')
                        : isArchmages
                        ? (getLanguage() === 'pt-BR' ? 'Trindade Elemental' : 'Elemental Trinity')
                        : (getLanguage() === 'pt-BR' ? 'Besta Incontrolável' : 'Uncontrollable Beast')}
                    </div>
                  </div>

                  {/* Description & Attacks */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {isPlant ? (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Dispara linhas de vinhas espinhosas esmagadoras pelo bosque.' : 'Spawns crushing thorny vine lines across the grove.'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Libera ataques de mordida mortais em área (AoE).' : 'Unleashes deadly expanding Chomp AoE strikes.'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{getLanguage() === 'pt-BR' ? 'Derrotá-lo desbloqueia o lendário Cepo de Videira!' : 'Defeating it unlocks the legendary Vine Snare!'}</span>
                        </div>
                      </>
                    ) : isEye ? (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Chora lágrimas lentas teleguiadas enquanto fechado e invoca lacaios Mini Olhos para caçá-la.' : 'Weeps slow homing tears while closed and spawns Mini Eye minions to hunt you down.'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{getLanguage() === 'pt-BR' ? 'Quando abrir, você deve desviar o olhar (cursor Y > Bruxa) para evitar a maldição do olhar mortal!' : 'When it opens, you must look away (cursor Y > Witch) to avoid its deadly gaze curse!'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{getLanguage() === 'pt-BR' ? "Derrotá-lo desbloqueia o lendário Olho da Medusa!" : "Defeating it unlocks the legendary Medusa's Eye!"}</span>
                        </div>
                      </>
                    ) : isArchmages ? (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Fase 1: Enfrente 3 Arquemagos (Vermelho, Verde, Azul) que atacam em ciclo.' : 'Phase 1: Battle 3 Archmages (Red, Green, Blue) cycling their signature attacks.'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Fase 2: Fundem-se com feitiços de clonagem e 8 feixes de arco-íris!' : 'Phase 2: Merge with cloning spells and 8-way spinning beams!'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-stone-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Uma fera corpulenta que investe pela arena, ficando tonta após colidir com as paredes 3 vezes.' : 'A hulking beast that charges across the arena, becoming dizzy after crashing into walls 3 times.'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-stone-400 font-bold">•</span>
                          <span>{getLanguage() === 'pt-BR' ? 'Alterne 2 - 1 com "A Mordida": após 2 estados de tontura (Investidas), salta para o topo central e desfere mordidas com uma abertura clara próxima!' : 'Alternates 2 - 1 with "THE Bite": after 2 dizzy states (Charge Attacks), leaps to top center and unleashes bites with a clear opening nearby!'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{getLanguage() === 'pt-BR' ? "Derrotá-lo desbloqueia as lendárias Garras do Urso Noturno!" : "Defeating it unlocks the legendary Nightbear's Claws!"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Select Action Button */}
                <div className="mt-4 pt-2">
                  <div
                    className={`w-full py-2 px-3 rounded-xl font-bold text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      isPlant
                        ? 'bg-emerald-600 group-hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                        : isEye
                        ? 'bg-rose-600 group-hover:bg-rose-500 text-white shadow-md shadow-rose-950'
                        : isArchmages
                        ? 'bg-purple-600 group-hover:bg-purple-500 text-white shadow-md shadow-purple-950'
                        : 'bg-stone-600 group-hover:bg-stone-700 text-white shadow-md shadow-stone-950'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    {getLanguage() === 'pt-BR' ? `Invocar ${translateBossName(boss.id, boss.name, getLanguage())}` : `Summon ${translateBossName(boss.id, boss.name, getLanguage())}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
