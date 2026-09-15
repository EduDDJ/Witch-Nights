import React, { useState } from 'react';
import { CharacterDefinition } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { 
  Play, 
  X, 
  Heart, 
  Wand2, 
  Footprints,
  ChevronRight
} from 'lucide-react';

interface CharacterSelectModalProps {
  onStartRun: (character: CharacterDefinition) => void;
  onClose: () => void;
  mobileMode?: boolean;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  onStartRun,
  onClose,
  mobileMode = false,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition>(CHARACTERS[0]);

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
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-md shadow-purple-950/50">
              <Wand2 className="w-4 h-4 text-purple-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-300">
              Character Select
            </h2>
          </div>

          <button
            id="close-character-select-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 hover:border-purple-500/60 flex items-center justify-center text-stone-400 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title="Back to Main Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIDDLE SECTION: CHARACTERS ICONS IN ROWS (SLIGHTLY SMALLER) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 relative z-10 custom-scrollbar">
          {/* Character Icons Grid / Rows */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5 sm:gap-3">
            {CHARACTERS.map((char) => {
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
                  {/* Sprite Container (Slightly smaller) */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b from-indigo-950/60 to-purple-950/80 border border-purple-500/30 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105">
                    <img
                      src={char.spriteUrl}
                      alt={char.name}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallbackPath = char.fallbackSpriteUrl || 'assets/aistudio/witch.png';
                        if (!target.src.includes(fallbackPath)) {
                          target.src = `${import.meta.env.BASE_URL}${fallbackPath}`;
                        }
                      }}
                      className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  {/* Character Name Label */}
                  <span className={`text-xs font-bold font-serif transition-colors ${
                    isSelected ? 'text-purple-200' : 'text-stone-300 group-hover:text-purple-200'
                  }`}>
                    {char.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM HUD: DESCRIPTION PANEL & START RUN BUTTON (VERTICALLY COMPACT) */}
        <div className="border-t border-purple-900/40 p-3 sm:p-4 bg-gradient-to-r from-[#0a0614] via-[#100a20] to-[#0a0614] flex-shrink-0 relative z-10">
          <div className="rounded-2xl bg-slate-950/90 border border-purple-900/60 shadow-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left/Middle: Character Sprite + Details */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Character Portrait (Elevated slightly upwards) */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-indigo-950/90 via-purple-950/90 to-slate-950 border-2 border-purple-500/70 p-1.5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/20 -mt-1 sm:-mt-1.5">
                <img
                  src={selectedCharacter.spriteUrl}
                  alt={selectedCharacter.name}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallbackPath = selectedCharacter.fallbackSpriteUrl || 'assets/aistudio/witch.png';
                    if (!target.src.includes(fallbackPath)) {
                      target.src = `${import.meta.env.BASE_URL}${fallbackPath}`;
                    }
                  }}
                  className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"
                />
              </div>

              {/* Info Text & Stats */}
              <div className="flex-1 min-w-0 text-left space-y-1">
                {/* Name and Title Label (No emoji, text only in the box) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100 tracking-wide">
                    {selectedCharacter.name}
                  </h3>
                  <span 
                    id="character-title-label"
                    className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-500/70 text-purple-300 shadow-sm shadow-purple-950/40"
                  >
                    {selectedCharacter.title}
                  </span>
                </div>

                {/* Character Lore / Description (Vertically compact) */}
                <p className="text-[11px] sm:text-xs text-stone-300 leading-snug max-w-xl">
                  {selectedCharacter.description.split(/(\*[^*]+\*)/g).map((chunk, i) => {
                    if (chunk.startsWith('*') && chunk.endsWith('*')) {
                      return <em key={i} className="italic text-purple-200 font-medium">{chunk.slice(1, -1)}</em>;
                    }
                    return chunk;
                  })}
                </p>

                {/* Stat Badges Row: Starting Item, Base Max HP, Speed */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {/* Starting Item */}
                  <div 
                    id="char-starting-item"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/50 text-[11px] font-semibold text-indigo-200 shadow-sm"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    <span>Starting Item:</span>
                    <span className="text-amber-300 font-bold">{selectedCharacter.startingWeaponName}</span>
                  </div>

                  {/* Base Max HP */}
                  <div 
                    id="char-base-hp"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-700/50 text-[11px] font-semibold text-emerald-200 shadow-sm"
                  >
                    <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                    <span>Base Max HP:</span>
                    <span className="text-emerald-300 font-mono font-bold">{selectedCharacter.baseMaxHp}</span>
                  </div>

                  {/* Speed */}
                  <div 
                    id="char-speed"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-700/50 text-[11px] font-semibold text-sky-200 shadow-sm"
                  >
                    <Footprints className="w-3 h-3 text-sky-400" />
                    <span>Speed:</span>
                    <span className="text-sky-300 font-mono font-bold">{selectedCharacter.speedLabel}</span>
                  </div>
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
                <span>Start Run</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
