import React, { useState } from 'react';
import { CharacterDefinition } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { resolveAssetPath } from '../utils/assets';
import { GameImage } from './GameImage';
import { 
  Play, 
  X, 
  Heart, 
  Wand2, 
  Footprints,
  ChevronRight,
  Sparkles,
  ArrowUpCircle,
  ArrowLeft,
  Shirt,
  Lock
} from 'lucide-react';
import { 
  getLanguage, 
  t, 
  translateCharacterName,
  translateCharacterTitle, 
  translateCharacterDescription,
  translateWeaponName,
  translateStatItemName,
  translateWeaponTierName
} from '../utils/i18n';

interface CharacterSelectModalProps {
  onStartRun: (character: CharacterDefinition) => void;
  onClose: () => void;
  initialCharacter?: CharacterDefinition;
  actionLabel?: string;
  mobileMode?: boolean;
  isGeraldoUnlocked?: boolean;
  isGeraldoGreenUnlocked?: boolean;
  isGeraldoBlueUnlocked?: boolean;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  onStartRun,
  onClose,
  initialCharacter,
  actionLabel,
  mobileMode = false,
  isGeraldoUnlocked = true,
  isGeraldoGreenUnlocked = false,
  isGeraldoBlueUnlocked = false,
}) => {
  const currentLang = getLanguage();
  const safeInitialChar = (() => {
    if (!initialCharacter) return CHARACTERS[0];
    if (['geraldo', 'geraldo_green', 'geraldo_blue'].includes(initialCharacter.id)) {
      if (!isGeraldoUnlocked) return CHARACTERS[0];
      if (initialCharacter.id === 'geraldo_green' && !isGeraldoGreenUnlocked) {
        return CHARACTERS.find((c) => c.id === 'geraldo') || CHARACTERS[0];
      }
      if (initialCharacter.id === 'geraldo_blue' && !isGeraldoBlueUnlocked) {
        return CHARACTERS.find((c) => c.id === 'geraldo') || CHARACTERS[0];
      }
    }
    return initialCharacter;
  })();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition>(safeInitialChar);
  const [showSkinSelect, setShowSkinSelect] = useState<boolean>(false);
  const [isGeraldoHovered, setIsGeraldoHovered] = useState<boolean>(false);

  const defaultActionLabel = (actionLabel === 'Confirm Character' || actionLabel === 'confirm_character')
    ? t('confirm_character', currentLang)
    : (actionLabel || (currentLang === 'en' ? 'Start Run' : 'Iniciar Partida'));

  const charTitle = translateCharacterTitle(selectedCharacter.id, selectedCharacter.title, currentLang);
  const charDesc = translateCharacterDescription(selectedCharacter.id, selectedCharacter.description, currentLang);
  
  const startingWeaponNameTranslated = translateWeaponName(selectedCharacter.startingWeaponId, selectedCharacter.startingWeaponName, currentLang);
  const startingStatItemNameTranslated = selectedCharacter.startingStatItemId && selectedCharacter.startingStatItemName
    ? translateStatItemName(selectedCharacter.startingStatItemId, selectedCharacter.startingStatItemName, currentLang)
    : '';

  const nonGeraldoChars = CHARACTERS.filter(c => !['geraldo', 'geraldo_green', 'geraldo_blue'].includes(c.id));
  const geraldoSkins = CHARACTERS.filter(c => ['geraldo', 'geraldo_green', 'geraldo_blue'].includes(c.id));
  const isGeraldoSelected = ['geraldo', 'geraldo_green', 'geraldo_blue'].includes(selectedCharacter.id);

  return (
    <div 
      id="character-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div 
        className={`relative w-full max-w-3xl bg-gradient-to-b from-[#0f091e] via-[#120b22] to-[#0a0614] border-2 border-purple-600/50 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.25)] flex flex-col text-slate-100 overflow-hidden ${
          mobileMode ? 'max-h-[96vh]' : 'max-h-[85vh]'
        }`}
      >
        {/* Decorative occult ambient glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />

        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-purple-900/40 px-5 py-4 flex-shrink-0 relative z-10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            {showSkinSelect && (
              <button
                onClick={() => setShowSkinSelect(false)}
                className="w-8 h-8 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 flex items-center justify-center text-purple-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
                title={t('back', currentLang)}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-300">
              {showSkinSelect ? (currentLang === 'en' ? 'Select Skin' : 'Selecionar Skin') : t('character_select', currentLang)}
            </h2>
          </div>

          <button
            id="close-character-select-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 hover:border-purple-500/60 flex items-center justify-center text-stone-400 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title={currentLang === 'en' ? 'Back to Main Menu' : 'Voltar ao Menu'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIDDLE SECTION: CHARACTERS ICONS OR SKIN SELECT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 relative z-10 custom-scrollbar">
          {!showSkinSelect ? (
            /* Character Icons Grid */
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5 sm:gap-3">
              {nonGeraldoChars.map((char) => {
                const isSelected = selectedCharacter.id === char.id;
                return (
                  <div
                    key={char.id}
                    id={`char-card-${char.id}`}
                    onClick={() => setSelectedCharacter(char)}
                    className={`group relative flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-950/70 border-2 border-purple-400 ring-4 ring-purple-500/40 shadow-xl shadow-purple-950/60 scale-105'
                        : 'bg-slate-950/60 border border-purple-900/40 hover:border-purple-500/60 hover:bg-purple-950/40 hover:scale-105 shadow-md'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b from-indigo-950/60 to-purple-950/80 border border-purple-500/30 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105">
                      <GameImage
                        src={char.spriteUrl}
                        fallbackSrc={char.id === 'ruby' ? 'assets/witch.png' : char.id === 'glowob' ? 'assets/glowob.png' : 'assets/odalia.png'}
                        alternateFallbacks={[char.fallbackSpriteUrl || 'assets/aistudio/witch.png']}
                        alt={char.name}
                        className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                    <span className={`w-full text-center text-[11px] sm:text-xs font-bold font-serif leading-tight transition-colors break-words px-0.5 ${
                      isSelected ? 'text-purple-200' : 'text-stone-300 group-hover:text-purple-200'
                    }`}>
                      {translateCharacterName(char.id, char.name, currentLang)}
                    </span>
                  </div>
                );
              })}

              {/* Geraldo Card (Shows RGB icon as requested, opens Skin Select when clicked) */}
              <div
                id="char-card-geraldo-group"
                onMouseEnter={() => setIsGeraldoHovered(true)}
                onMouseLeave={() => setIsGeraldoHovered(false)}
                onClick={() => {
                  if (isGeraldoUnlocked) {
                    setShowSkinSelect(true);
                  }
                }}
                className={`group relative flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl transition-all duration-200 ${
                  !isGeraldoUnlocked
                    ? 'bg-stone-950/60 border border-stone-800/80 opacity-70 cursor-not-allowed'
                    : isGeraldoSelected
                    ? 'bg-purple-950/70 border-2 border-purple-400 ring-4 ring-purple-500/40 shadow-xl shadow-purple-950/60 scale-105 cursor-pointer'
                    : 'bg-slate-950/60 border border-purple-900/40 hover:border-purple-500/60 hover:bg-purple-950/40 hover:scale-105 shadow-md cursor-pointer'
                }`}
                title={
                  !isGeraldoUnlocked
                    ? (currentLang === 'en'
                        ? 'Complete the "Color Me Impressed" Achievement to unlock.'
                        : 'Complete a conquista "Mostre Suas Cores Verdadeiras" para desbloquear.')
                    : (currentLang === 'en' ? 'Select Skin' : 'Selecionar Skin')
                }
              >
                {/* Floating Tooltip when hovered while locked */}
                {!isGeraldoUnlocked && isGeraldoHovered && (
                  <div 
                    id="geraldo-locked-hover-msg"
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none w-52 sm:w-60 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="w-2.5 h-2.5 bg-stone-900 border-l border-t border-purple-500/70 rotate-45 -mb-1.5 z-10" />
                    <div className="bg-stone-900/95 border border-purple-500/70 text-amber-300 text-[11px] sm:text-xs text-center px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md font-medium leading-snug whitespace-normal">
                      {currentLang === 'en'
                        ? 'Complete the "Color Me Impressed" Achievement to unlock.'
                        : 'Complete a conquista "Mostre Suas Cores Verdadeiras" para desbloquear.'}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b from-indigo-950/60 to-purple-950/80 border flex items-center justify-center p-1 overflow-hidden transition-transform ${
                    !isGeraldoUnlocked ? 'border-stone-700/60' : 'border-purple-500/30 group-hover:scale-105'
                  }`}>
                    <GameImage
                      src="assets/aistudio/geraldo_rgb.png"
                      fallbackSrc="assets/geraldo_rgb.png"
                      alternateFallbacks={['https://i.imgur.com/w8qU2F1.png', 'assets/geraldo.png']}
                      alt="Geraldo"
                      className={`w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${
                        !isGeraldoUnlocked ? 'grayscale brightness-50 contrast-75' : ''
                      }`}
                    />
                  </div>
                  {/* Badge: Lock icon if locked, Shirt icon if unlocked */}
                  {!isGeraldoUnlocked ? (
                    <div 
                      className="absolute -top-1.5 -right-1.5 bg-stone-900 text-amber-400 p-1 rounded-full shadow-lg border border-amber-500/40 flex items-center justify-center z-10 pointer-events-none"
                      title={currentLang === 'en' ? 'Locked' : 'Bloqueado'}
                    >
                      <Lock className="w-3 h-3" />
                    </div>
                  ) : (
                    <div 
                      className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white p-1 rounded-full shadow-lg border border-purple-300 flex items-center justify-center z-10 pointer-events-none"
                      title={currentLang === 'en' ? 'Select Skin' : 'Selecionar Skin'}
                    >
                      <Shirt className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className={`w-full text-center text-[11px] sm:text-xs font-bold font-serif leading-tight transition-colors break-words px-0.5 ${
                  !isGeraldoUnlocked ? 'text-stone-500' : isGeraldoSelected ? 'text-purple-200' : 'text-stone-300 group-hover:text-purple-200'
                }`}>
                  Geraldo
                </span>
              </div>
            </div>
          ) : (
            /* Select Skin Screen Grid */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {geraldoSkins.map((skin) => {
                  const isSkinSelected = selectedCharacter.id === skin.id;
                  const isSkinUnlocked =
                    skin.id === 'geraldo'
                      ? isGeraldoUnlocked
                      : skin.id === 'geraldo_green'
                      ? isGeraldoGreenUnlocked
                      : isGeraldoBlueUnlocked;

                  const skinName = currentLang === 'en' 
                    ? (skin.id === 'geraldo' ? 'Geraldo The Red' : skin.id === 'geraldo_green' ? 'Geraldo The Green' : 'Geraldo The Blue')
                    : (skin.id === 'geraldo' ? 'Geraldo O Vermelho' : skin.id === 'geraldo_green' ? 'Geraldo O Verde' : 'Geraldo O Azul');

                  const unlockHint =
                    skin.id === 'geraldo_green'
                      ? (currentLang === 'en'
                          ? 'Complete the "Out of the whole Alphabet, Green is my Favorite Number" Achievement to unlock.'
                          : 'Complete a conquista "De todo o Alfabeto, Verde é o meu Número Favorito" para desbloquear.')
                      : skin.id === 'geraldo_blue'
                      ? (currentLang === 'en'
                          ? 'Complete the "Feeling Blue" Achievement to unlock.'
                          : 'Complete a conquista "Sentindo-se Azul" para desbloquear.')
                      : (currentLang === 'en'
                          ? 'Complete the "Color Me Impressed" Achievement to unlock.'
                          : 'Complete a conquista "Mostre Suas Cores Verdadeiras" para desbloquear.');

                  return (
                    <div
                      key={skin.id}
                      onClick={() => {
                        if (isSkinUnlocked) {
                          setSelectedCharacter(skin);
                          setShowSkinSelect(false);
                        }
                      }}
                      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-200 ${
                        !isSkinUnlocked
                          ? 'bg-stone-950/70 border border-stone-800/80 opacity-75 cursor-not-allowed'
                          : isSkinSelected
                          ? 'bg-purple-950/80 border-2 border-purple-400 ring-4 ring-purple-500/40 shadow-xl shadow-purple-950/60 scale-[1.02] cursor-pointer'
                          : 'bg-slate-950/70 border border-purple-900/50 hover:border-purple-500/60 hover:bg-purple-950/40 hover:scale-[1.02] shadow-md cursor-pointer'
                      }`}
                      title={!isSkinUnlocked ? unlockHint : skinName}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`relative w-14 h-14 rounded-xl border flex items-center justify-center p-1.5 flex-shrink-0 ${
                          !isSkinUnlocked
                            ? 'bg-stone-900/80 border-stone-700/60'
                            : 'bg-gradient-to-b from-indigo-950/80 to-purple-950/90 border-purple-500/40'
                        }`}>
                          <GameImage
                            src={skin.spriteUrl}
                            fallbackSrc={`assets/${skin.id === 'geraldo' ? 'geraldo.png' : skin.id === 'geraldo_green' ? 'geraldo_green.png' : 'geraldo_blue.png'}`}
                            alternateFallbacks={[skin.fallbackSpriteUrl || 'https://i.imgur.com/v80iCki.png']}
                            alt={skinName}
                            className={`w-full h-full object-contain [image-rendering:pixelated] ${
                              !isSkinUnlocked ? 'grayscale brightness-50 contrast-75' : ''
                            }`}
                          />
                          {!isSkinUnlocked && (
                            <div className="absolute -top-1.5 -right-1.5 bg-stone-900 text-amber-400 p-1 rounded-full shadow border border-amber-500/40 flex items-center justify-center">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className={`text-sm font-bold font-serif ${
                            !isSkinUnlocked ? 'text-stone-400' : 'text-slate-100 group-hover:text-purple-200'
                          }`}>
                            {skinName}
                          </div>
                          <div className="text-[11px] text-purple-300 font-medium truncate">
                            {currentLang === 'en'
                              ? `Weapon: ${translateWeaponName(skin.startingWeaponId, skin.startingWeaponName, currentLang)}`
                              : `Arma: ${translateWeaponName(skin.startingWeaponId, skin.startingWeaponName, currentLang)}`}
                          </div>
                        </div>

                        {isSkinSelected && isSkinUnlocked && (
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow flex-shrink-0">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Unlock Hint for locked skins */}
                      {!isSkinUnlocked && (
                        <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-[11px] text-amber-300/90 leading-tight">
                          {unlockHint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM HUD: DESCRIPTION PANEL & START RUN BUTTON */}
        <div className="border-t border-purple-900/40 p-3 sm:p-4 bg-gradient-to-r from-[#0a0614] via-[#100a20] to-[#0a0614] flex-shrink-0 relative z-10">
          <div className="rounded-2xl bg-slate-950/90 border border-purple-900/60 shadow-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left/Middle: Character Sprite + Details */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Character Portrait */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-indigo-950/90 via-purple-950/90 to-slate-950 border-2 border-purple-500/70 p-1.5 flex items-center justify-center shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/20 -mt-1 sm:-mt-1.5">
                  <GameImage
                    src={selectedCharacter.spriteUrl}
                    fallbackSrc={
                      selectedCharacter.id === 'ruby'
                        ? 'assets/witch.png'
                        : selectedCharacter.id === 'glowob'
                        ? 'assets/glowob.png'
                        : selectedCharacter.id === 'odalia'
                        ? 'assets/odalia.png'
                        : selectedCharacter.id === 'geraldo_green'
                        ? 'assets/geraldo_green.png'
                        : selectedCharacter.id === 'geraldo_blue'
                        ? 'assets/geraldo_blue.png'
                        : 'assets/geraldo.png'
                    }
                    alternateFallbacks={[selectedCharacter.fallbackSpriteUrl || 'assets/aistudio/witch.png']}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"
                  />
                </div>
                {isGeraldoSelected && (
                  <button
                    onClick={() => setShowSkinSelect(true)}
                    className="absolute -top-2 -right-2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg border border-purple-300 flex items-center justify-center cursor-pointer z-20 transition-transform hover:scale-110 active:scale-95"
                    title={currentLang === 'en' ? 'Select Skin' : 'Selecionar Skin'}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Info Text & Stats */}
              <div className="flex-1 min-w-0 text-left space-y-1">
                {/* Name and Title Label */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100 tracking-wide">
                    {translateCharacterName(selectedCharacter.id, selectedCharacter.name, currentLang)}
                  </h3>
                  <span 
                    id="character-title-label"
                    className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-500/70 text-purple-300 shadow-sm shadow-purple-950/40"
                  >
                    {charTitle}
                  </span>
                </div>

                {/* Character Lore / Description */}
                <p className="text-[11px] sm:text-xs text-stone-300 leading-snug max-w-xl">
                  {charDesc.split(/(\*[^*]+\*)/g).map((chunk, i) => {
                    if (chunk.startsWith('*') && chunk.endsWith('*')) {
                      return <em key={i} className="italic text-purple-200 font-medium">{chunk.slice(1, -1)}</em>;
                    }
                    return chunk;
                  })}
                </p>

                {/* Stat Badges Row: Starting Item, Base Max HP, Speed, Mega Evolution */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {/* Starting Item(s) */}
                  <div 
                    id="char-starting-item"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/50 text-[11px] font-semibold text-indigo-200 shadow-sm"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    <span>
                      {selectedCharacter.startingStatItemName 
                        ? (currentLang === 'en' ? 'Starting Items:' : 'Itens Iniciais:') 
                        : (currentLang === 'en' ? 'Starting Item:' : 'Arma Inicial:')}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {selectedCharacter.startingStatItemName
                        ? `${startingWeaponNameTranslated} & ${startingStatItemNameTranslated}`
                        : startingWeaponNameTranslated}
                    </span>
                  </div>

                  {/* Mega Evolution Badge */}
                  {selectedCharacter.megaEvolutionName && (
                    <div 
                      id="char-mega-evolution-badge"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/60 text-[11px] font-semibold text-amber-200 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{currentLang === 'en' ? 'Mega Evolution:' : 'Megaevolução:'}</span>
                      <span className="text-amber-300 font-bold">
                        {translateWeaponTierName(selectedCharacter.startingWeaponId, 7, selectedCharacter.megaEvolutionName, currentLang)}
                      </span>
                    </div>
                  )}

                  {/* Base Max HP */}
                  <div 
                    id="char-base-hp"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-700/50 text-[11px] font-semibold text-emerald-200 shadow-sm"
                  >
                    <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                    <span>{currentLang === 'en' ? 'Base Max HP:' : 'Vida Máxima Base:'}</span>
                    <span className="text-emerald-300 font-mono font-bold">{selectedCharacter.baseMaxHp}</span>
                  </div>

                  {/* Speed */}
                  <div 
                    id="char-speed"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-700/50 text-[11px] font-semibold text-sky-200 shadow-sm"
                  >
                    <Footprints className="w-3 h-3 text-sky-400" />
                    <span>{currentLang === 'en' ? 'Speed:' : 'Velocidade:'}</span>
                    <span className="text-sky-300 font-mono font-bold">
                      {selectedCharacter.speedLabel === 'Very Fast' ? (currentLang === 'en' ? 'Very Fast' : 'Muito Rápido') :
                       selectedCharacter.speedLabel === 'Fast' ? (currentLang === 'en' ? 'Fast' : 'Rápido') :
                       selectedCharacter.speedLabel === 'Normal' ? (currentLang === 'en' ? 'Normal' : 'Normal') :
                       selectedCharacter.speedLabel === 'Slow' ? (currentLang === 'en' ? 'Slow' : 'Lento') :
                       selectedCharacter.speedLabel}
                    </span>
                  </div>

                  {/* Starting Level Bonus Badge */}
                  {selectedCharacter.startingLevelBonus && selectedCharacter.startingLevelBonus > 0 && (
                    <div 
                      id="char-starting-level-bonus"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-lime-950/80 border border-lime-500/60 text-[11px] font-semibold text-lime-200 shadow-sm"
                    >
                      <ArrowUpCircle className="w-3 h-3 text-lime-400" />
                      <span className="text-lime-300 font-bold">
                        +{selectedCharacter.startingLevelBonus} {currentLang === 'en' ? 'Level' : 'Nível'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: "Start Run" Button */}
            <div className="flex items-center justify-end flex-shrink-0 pt-1 md:pt-0">
              <button
                id="start-run-btn"
                onClick={() => onStartRun(selectedCharacter)}
                className="group relative w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-purple-400/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
                <span>{defaultActionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
