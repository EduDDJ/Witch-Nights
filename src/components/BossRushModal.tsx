import React, { useState } from 'react';
import { Play, X, Trophy, Info, Lock, Flame, User, Swords, Target } from 'lucide-react';
import { CharacterDefinition } from '../types/game';
import { BOSS_POOL } from '../data/gameData';
import { resolveAssetPath } from '../utils/assets';
import { GameImage } from './GameImage';
import { getLanguage, translateCharacterTitle, translateCharacterName, translateBossName } from '../utils/i18n';

interface BossRushModalProps {
  bestTime: number | null;
  characterBestTime: number | null;
  selectedCharacter: CharacterDefinition;
  isTrueWitchUnlocked: boolean;
  isTrueWitchMode: boolean;
  onToggleTrueWitchMode: (enabled: boolean) => void;
  onStartBossRush: (queue?: string[]) => void;
  onOpenCharacterSelect: () => void;
  onClose: () => void;
}

export const BossRushModal: React.FC<BossRushModalProps> = ({
  bestTime,
  characterBestTime,
  selectedCharacter,
  isTrueWitchUnlocked,
  isTrueWitchMode,
  onToggleTrueWitchMode,
  onStartBossRush,
  onOpenCharacterSelect,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'BOSS_RUSH' | 'SINGULAR'>('BOSS_RUSH');
  const [selectedSingleBossId, setSelectedSingleBossId] = useState<string>('carnivore_plant');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const currentLang = getLanguage();

  const formatSecs = (sec: number | null) =>
    sec !== null
      ? `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
      : '-';

  const formattedBestTime = formatSecs(bestTime);
  const formattedCharacterBestTime = formatSecs(characterBestTime);

  const getBossAsset = (bossId: string) => {
    switch (bossId) {
      case 'carnivore_plant':
        return 'assets/aistudio/carnivore_plant.png';
      case 'haunted_eye':
        return 'assets/aistudio/haunted_eye_open.png';
      case 'night_bear':
        return 'assets/aistudio/night_bear.png';
      case 'archmages':
        return 'assets/aistudio/geraldo_rgb.png';
      default:
        return 'assets/aistudio/carnivore_plant.png';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-stone-950 via-purple-950/40 to-stone-950 border-2 border-purple-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/80 text-center relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-200 to-amber-200 tracking-wide mb-3 uppercase">
          {currentLang === 'en' ? 'Boss Challenge Arena' : 'Arena de Desafio dos Chefes'}
        </h2>

        {/* TOP TABS: Boss Rush vs Singular Fight */}
        <div className="flex items-center justify-center p-1 bg-stone-900/90 rounded-2xl border border-stone-800 mb-4">
          <button
            id="boss-rush-tab"
            onClick={() => setActiveTab('BOSS_RUSH')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'BOSS_RUSH'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-900/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>{currentLang === 'en' ? 'Boss Rush' : 'Invasão de Chefes'}</span>
          </button>

          <button
            id="singular-fight-tab"
            onClick={() => setActiveTab('SINGULAR')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'SINGULAR'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-900/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Target className="w-4 h-4 text-rose-300" />
            <span>{currentLang === 'en' ? 'Singular Fight' : 'Luta Singular'}</span>
          </button>
        </div>

        {/* TAB 1: BOSS RUSH MODE */}
        {activeTab === 'BOSS_RUSH' && (
          <div className="animate-in fade-in duration-150">
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 bg-stone-900/60 p-3.5 rounded-2xl border border-stone-800">
              {currentLang === 'en'
                ? "Fight every Boss back-to-back in sequence while locked at Level 1! If defeated, you restart from the first Boss. Defeating a Boss heals +25 HP."
                : "Lute contra cada Chefe em sequência mantendo o Nível 1! Se for derrotado, recomeçará do primeiro Chefe. Derrotar um Chefe cura +25 PV."}
            </p>

            {/* True Witch Mode Toggle Container */}
            <div className="mb-4 bg-stone-900/90 rounded-2xl border border-stone-800 p-3.5 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="true-witch-info-btn"
                    onClick={() => setShowInfo((prev) => !prev)}
                    className="w-6 h-6 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 flex items-center justify-center text-purple-300 hover:text-purple-100 transition-colors cursor-pointer shrink-0"
                    title={currentLang === 'en' ? 'True Witch Mode Details' : 'Detalhes do Modo Bruxa Verdadeira'}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 text-left">
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <Flame className={`w-4 h-4 ${isTrueWitchMode && isTrueWitchUnlocked ? 'text-rose-400' : 'text-stone-500'}`} />
                      {currentLang === 'en' ? 'True Witch Mode' : 'Modo Bruxa Verdadeira'}
                    </span>
                    {!isTrueWitchUnlocked && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                        <Lock className="w-3 h-3 text-amber-500/80" /> {currentLang === 'en' ? 'Locked' : 'Bloqueado'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="true-witch-mode-toggle"
                  disabled={!isTrueWitchUnlocked}
                  onClick={() => onToggleTrueWitchMode(!isTrueWitchMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                    isTrueWitchUnlocked && isTrueWitchMode ? 'bg-rose-600' : 'bg-stone-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isTrueWitchUnlocked && isTrueWitchMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {showInfo && (
                <div className="mt-1 text-left text-xs bg-stone-950/95 border border-purple-800/60 text-purple-200 p-3 rounded-xl leading-relaxed animate-in fade-in duration-150">
                  <p className="font-semibold text-rose-300 mb-1">
                    {currentLang === 'en' ? 'True Witch Mode Rules:' : 'Regras do Modo Bruxa Verdadeira:'}
                  </p>
                  <ul className="list-disc list-inside text-stone-300 text-[11px] space-y-1">
                    {currentLang === 'en' ? (
                      <>
                        <li>Passive HP regeneration is completely disabled.</li>
                        <li>Defeating Bosses will <strong className="text-rose-300">not</strong> heal you (+25 HP heal is disabled).</li>
                        <li>Unlock by conquering standard Boss Rush Mode!</li>
                      </>
                    ) : (
                      <>
                        <li>A regeneração passiva de PV está totalmente desativada.</li>
                        <li>Derrotar Chefes <strong className="text-rose-300">não</strong> irá curar você (cura de +25 PV desativada).</li>
                        <li>Desbloqueie conquistando o modo Invasão de Chefes padrão!</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Start Boss Rush Button */}
            <button
              id="start-boss-rush-modal-button"
              onClick={() => onStartBossRush()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              <span>{currentLang === 'en' ? 'Start Boss Rush' : 'Iniciar Invasão'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: SINGULAR FIGHT MODE */}
        {activeTab === 'SINGULAR' && (
          <div className="animate-in fade-in duration-150">
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
              {currentLang === 'en'
                ? "Select a single Boss to challenge directly at Level 1. Practice strategies without having to fight through the entire queue!"
                : "Selecione um único Chefe para enfrentar diretamente no Nível 1. Treine táticas sem precisar jogar toda a sequência!"}
            </p>

            {/* 4 Bosses per row Grid */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 mb-4">
              {BOSS_POOL.map((b) => {
                const isSelected = selectedSingleBossId === b.id;
                return (
                  <button
                    key={b.id}
                    id={`singular-boss-opt-${b.id}`}
                    onClick={() => setSelectedSingleBossId(b.id)}
                    className={`group relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer text-center ${
                      isSelected
                        ? 'bg-purple-950/80 border-amber-400 shadow-lg shadow-purple-900/60 scale-[1.02]'
                        : 'bg-stone-900/70 border-stone-800 hover:border-purple-600/60 hover:bg-stone-900'
                    }`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-stone-950/80 border border-purple-800/40 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <GameImage
                        src={b.spriteUrl || getBossAsset(b.id)}
                        fallbackSrc={`assets/${b.id === 'carnivore_plant' ? 'carnivore_plant.png' : b.id === 'haunted_eye' ? 'haunted_eye_open.png' : b.id === 'night_bear' ? 'night_bear.png' : 'geraldo_rgb.png'}`}
                        alternateFallbacks={[
                          b.fallbackSpriteUrl || (
                            b.id === 'carnivore_plant'
                              ? 'https://i.imgur.com/kaNPLzb.png'
                              : b.id === 'haunted_eye'
                              ? 'https://i.imgur.com/caqAbHC.png'
                              : b.id === 'night_bear'
                              ? 'https://i.imgur.com/Pjkp2on.png'
                              : 'https://i.imgur.com/w8qU2F1.png'
                          )
                        ]}
                        alt={b.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform [image-rendering:pixelated]"
                      />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-amber-200 font-serif' : 'text-stone-300'}`}>
                      {translateBossName(b.id, b.name, currentLang)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Start Singular Fight Button */}
            <button
              id="start-singular-fight-button"
              onClick={() => onStartBossRush([selectedSingleBossId])}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-amber-900/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Target className="w-5 h-5 text-white" />
              <span>
                {currentLang === 'en'
                  ? `Fight ${translateBossName(selectedSingleBossId, BOSS_POOL.find(b => b.id === selectedSingleBossId)?.name || '', currentLang)}`
                  : `Lutar contra ${translateBossName(selectedSingleBossId, BOSS_POOL.find(b => b.id === selectedSingleBossId)?.name || '', currentLang)}`}
              </span>
            </button>
          </div>
        )}

        {/* Select Character Section */}
        <div className="mt-3.5 flex flex-col items-center gap-2 bg-stone-900/80 p-3 rounded-2xl border border-stone-800">
          <button
            id="boss-rush-select-character-btn"
            onClick={onOpenCharacterSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/60 text-purple-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <User className="w-4 h-4 text-purple-300" />
            <span>{currentLang === 'en' ? 'Select Character' : 'Selecionar Personagem'}</span>
          </button>
          
          <div className="text-xs text-stone-300 flex items-center justify-center gap-1.5 font-medium flex-wrap">
            <span className="text-stone-400">
              {currentLang === 'en' ? 'Current Character:' : 'Personagem Atual:'}
            </span>
            <span className="text-amber-300 font-bold font-serif">
              {translateCharacterName(selectedCharacter.id, selectedCharacter.name, currentLang)}
              {selectedCharacter.title ? ` – ${translateCharacterTitle(selectedCharacter.id, selectedCharacter.title, currentLang)}` : ''}
            </span>
          </div>
        </div>

        {/* Best Times Section */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-stone-300 text-xs sm:text-sm font-medium bg-stone-900/60 p-2.5 rounded-2xl border border-stone-800/80">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-400">
              {currentLang === 'en' ? 'Best Time:' : 'Melhor Tempo:'}
            </span>
            <span className={`font-mono font-bold ${bestTime !== null ? 'text-amber-300' : 'text-stone-400'}`}>
              {formattedBestTime}
            </span>
          </div>

          <span className="text-stone-700 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-stone-400">
              {currentLang === 'en'
                ? `${translateCharacterName(selectedCharacter.id, selectedCharacter.name, currentLang)}'s Best:`
                : `Melhor de ${translateCharacterName(selectedCharacter.id, selectedCharacter.name, currentLang)}:`}
            </span>
            <span className={`font-mono font-bold ${characterBestTime !== null ? 'text-amber-300' : 'text-stone-400'}`}>
              {formattedCharacterBestTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
