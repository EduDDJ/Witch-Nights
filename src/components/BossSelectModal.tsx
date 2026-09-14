import React, { useEffect, useState } from 'react';
import { BossDefinition } from '../types/game';
import { Eye, Swords, Sparkles, AlertTriangle } from 'lucide-react';

interface BossSelectModalProps {
  bosses: BossDefinition[];
  mobileMode?: boolean;
  onSelectBoss: (bossId: string) => void;
}

export const BossSelectModal: React.FC<BossSelectModalProps> = ({
  bosses,
  mobileMode = false,
  onSelectBoss,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard 1, 2, 3 shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return;
      if (e.key === '1' && bosses[0]) onSelectBoss(bosses[0].id);
      if (e.key === '2' && bosses[1]) onSelectBoss(bosses[1].id);
      if (e.key === '3' && bosses[2]) onSelectBoss(bosses[2].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bosses, isReady, onSelectBoss]);

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
        {/* Glow Header */}
        <div className={`text-center ${mobileMode ? 'mb-3' : 'mb-6'}`}>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-300 font-bold uppercase tracking-widest ${
              mobileMode ? 'px-2 py-0.5 text-[10px] mb-1' : 'px-3.5 py-1 text-xs mb-2'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Destiny Control Activated
          </div>
          <h2
            className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 tracking-tight font-serif ${
              mobileMode ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            CHOOSE YOUR BOSS
          </h2>
          <p
            className={`text-slate-300 max-w-lg mx-auto ${
              mobileMode ? 'text-[11px] sm:text-xs mt-0.5' : 'text-xs sm:text-sm mt-1'
            }`}
          >
            Your mastery over fate allows you to choose which monstrous terror shall emerge from the dark grove:
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
                          : 'bg-stone-950/80 border-stone-500/60 shadow-stone-900/50'
                      }`}
                    >
                      {isPlant && (
                        <svg
                          viewBox="0 0 100 100"
                          className="w-20 h-20 drop-shadow-md animate-pulse"
                          aria-label="Carnivore Plant Visual"
                        >
                          {/* Leaves & Petals */}
                          <path
                            d="M 20 80 Q 30 50 50 65 Q 35 75 20 80 Z"
                            fill="#15803d"
                          />
                          <path
                            d="M 80 80 Q 70 50 50 65 Q 65 75 80 80 Z"
                            fill="#15803d"
                          />
                          <circle cx="50" cy="50" r="32" fill="#166534" />
                          <circle cx="50" cy="50" r="28" fill="#10b981" />
                          {/* Snapping Mouth Cavity */}
                          <ellipse cx="50" cy="50" rx="20" ry="14" fill="#881337" />
                          {/* Sharp Fangs */}
                          <polygon points="36,40 40,48 44,40" fill="#f8fafc" />
                          <polygon points="46,40 50,49 54,40" fill="#f8fafc" />
                          <polygon points="56,40 60,48 64,40" fill="#f8fafc" />
                          <polygon points="38,60 42,52 46,60" fill="#f8fafc" />
                          <polygon points="48,60 52,51 56,60" fill="#f8fafc" />
                          <polygon points="58,60 62,52 66,60" fill="#f8fafc" />
                          {/* Spores/Aura */}
                          <circle cx="30" cy="35" r="3" fill="#86efac" opacity="0.8" />
                          <circle cx="70" cy="35" r="3" fill="#86efac" opacity="0.8" />
                        </svg>
                      )}

                      {isEye && (
                        <svg
                          viewBox="0 0 120 70"
                          className="w-24 h-16 drop-shadow-md group-hover:scale-110 transition-transform"
                          aria-label="Haunted Eye Visual"
                        >
                          {/* Dark Arcane Panoramic Socket Aura */}
                          <ellipse cx="60" cy="35" rx="52" ry="26" fill="#450a0a" />
                          <ellipse cx="60" cy="35" rx="46" ry="22" fill="#881337" />
                          {/* Closed Eyelid */}
                          <ellipse cx="60" cy="35" rx="42" ry="18" fill="#1e1b4b" stroke="#e11d48" strokeWidth="2" />
                          {/* Arcane seal rune */}
                          <circle cx="60" cy="35" r="7" fill="#be123c" opacity="0.6" />
                        </svg>
                      )}

                      {isBear && (
                        <img
                          src="https://i.imgur.com/Pjkp2on.png"
                          alt="NightBear Visual"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('night_bear.png')) {
                              target.src = `${import.meta.env.BASE_URL}assets/aistudio/night_bear.png`;
                            }
                          }}
                          className="w-20 h-20 object-contain [image-rendering:pixelated] drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      )}
                    </div>
                  </div>

                  {/* Boss Identity */}
                  <div className="text-center mt-2">
                    <h3
                      className={`text-lg sm:text-xl font-bold font-serif ${
                        isPlant ? 'text-emerald-200' : isEye ? 'text-rose-200' : 'text-stone-200'
                      }`}
                    >
                      {boss.name}
                    </h3>
                    <div
                      className={`inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full mt-1 ${
                        isPlant
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          : isEye
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : 'bg-stone-900/60 text-stone-300 border border-stone-700/50'
                      }`}
                    >
                      {isPlant ? 'Botanical Grove Terror' : isEye ? 'Abyssal Ocular Watcher' : 'Primal Shadow Stalker'}
                    </div>
                  </div>

                  {/* Description & Attacks */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {isPlant ? (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>Spawns crushing thorny vine lines across the grove.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>Unleashes deadly expanding Chomp AoE strikes.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Defeating it unlocks the legendary Vine Attack!</span>
                        </div>
                      </>
                    ) : isEye ? (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>Weeps slow homing tears while closed and spawns Mini Eye minions to hunt you down.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>When it opens, you must look away (cursor Y &gt; Witch) to avoid its deadly gaze curse!</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Defeating it unlocks the legendary Medusa's Eye!</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-stone-400 font-bold">•</span>
                          <span>A hulking beast that charges relentlessly across the arena.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-stone-400 font-bold">•</span>
                          <span>Invincible while charging, but gets dizzy after 3 consecutive strikes.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-300 font-medium pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Defeating it unlocks the legendary Nightbear's Claws!</span>
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
                        : 'bg-stone-600 group-hover:bg-stone-700 text-white shadow-md shadow-stone-950'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    Summon {boss.name}
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
