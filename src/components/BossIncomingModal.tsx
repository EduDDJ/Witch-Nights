import React from 'react';
import { ShieldAlert, Sword, Heart, Zap, AlertTriangle, CheckCircle, Skull, Flame } from 'lucide-react';
import { BossDefinition } from '../types/game';

interface BossIncomingModalProps {
  boss: BossDefinition;
  mobileMode?: boolean;
  onStartBattle: () => void;
}

export const BossIncomingModal: React.FC<BossIncomingModalProps> = ({
  boss,
  mobileMode = false,
  onStartBattle,
}) => {
  // Get mechanics and explanation based on boss id
  const getBossDetails = (id: string) => {
    switch (id) {
      case 'carnivore_plant':
        return {
          title: 'Carnivore Plant',
          subtitle: "Greenhouse's Devil",
          color: '#22c55e',
          accent: 'emerald',
          mechanics: [
            'Thorny Vines: Shoots tangled thorny vines that snare and root the witch in place.',
            'Chomp Attack: Delivers a devastating chomp bite. Note: Dash is necessary to escape the Chomp Attack!'
          ],
          strategy: 'Keep your distance and circle around the perimeter. Use your Dash ability to evade the Chomp Attack and escape when cornered.'
        };
      case 'haunted_eye':
        return {
          title: 'Haunted Eye',
          subtitle: 'All-Seeing Spirit',
          color: '#dc2626',
          accent: 'rose',
          mechanics: [
            'Weeping Tears: Fires volleys of homing occult teardrops that track your position.',
            'Eye Defense: The Eye only closes when all 3 Mini Eyes are defeated.',
            'FORBIDDEN ZONE (Look Away): During its eye-open phase, you MUST keep your cursor below the Witch (Y > Witch). Staring directly at the eye inflicts 20 DPS!'
          ],
          strategy: 'Destroy all 3 Mini Eyes first so the main Eye closes. Watch your cursor position when the warning line appears!'
        };
      case 'night_bear':
      default:
        return {
          title: 'NightBear',
          subtitle: 'Uncontrollable Beast',
          color: '#b45309',
          accent: 'amber',
          mechanics: [
            'Frenzied Charges: Sprints across the arena in linear charges, becoming dizzy after crashing into walls 3 times.',
            '"THE Bite" Attack: Triggers after 2 Charge Attack dizzy stuns. NightBear leaps to the top center and unleashes arena-wide bites! A clear opening always exists near you to escape!'
          ],
          strategy: 'Bait his charges into walls to stun him. After recovering from his 2nd dizzy stun, watch for his leap to top center, then quickly react and step into the clear gap to avoid bite damage!'
        };
    }
  };

  const details = getBossDetails(boss.id);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-slate-950 via-rose-950/20 to-slate-950 border-2 border-rose-600/70 rounded-3xl shadow-2xl shadow-rose-950/80 text-slate-100 flex flex-col ${
        mobileMode ? 'p-4 gap-4' : 'p-6 sm:p-8 gap-6'
      }`}>
        
        {/* Header Alert Banner */}
        <div className="flex items-center justify-center gap-3 bg-rose-950/60 border border-rose-500/50 py-2.5 px-4 rounded-2xl shadow-lg shadow-rose-950/50 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black text-rose-300 uppercase tracking-widest">
            ⚠️ BOSS INCOMING ⚠️
          </span>
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
        </div>

        {/* Boss Identity Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-inner">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-2 shadow-xl shrink-0"
            style={{ backgroundColor: `${details.color}22`, borderColor: details.color }}
          >
            {boss.id === 'carnivore_plant' ? (
              <img
                src="https://i.imgur.com/kaNPLzb.png"
                alt="Carnivore Plant"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('carnivore_plant.png')) {
                    target.src = `${import.meta.env.BASE_URL}assets/aistudio/carnivore_plant.png`;
                  }
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : boss.id === 'haunted_eye' ? (
              <img
                src="https://i.imgur.com/caqAbHC.png"
                alt="Haunted Eye"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('haunted_eye_open.png')) {
                    target.src = `${import.meta.env.BASE_URL}assets/aistudio/haunted_eye_open.png`;
                  }
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : boss.id === 'night_bear' ? (
              <img
                src="https://i.imgur.com/Pjkp2on.png"
                alt="NightBear"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('night_bear.png')) {
                    target.src = `${import.meta.env.BASE_URL}assets/aistudio/night_bear.png`;
                  }
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : (
              <Skull className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: details.color }} />
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
              {details.title}
            </h2>
            <p className="text-xs sm:text-sm text-rose-400 font-semibold mb-2">
              {details.subtitle}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800 text-rose-300">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> HP: {boss.maxHp}
              </span>
              <span className="flex items-center gap-1 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800 text-amber-300">
                <Sword className="w-3.5 h-3.5 text-amber-400" /> ATK: {boss.damage}
              </span>
              <span className="flex items-center gap-1 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800 text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" /> Time: 90s Limit
              </span>
            </div>
          </div>
        </div>

        {/* Mechanics & Attacks */}
        <div className="flex flex-col gap-3 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Attacks & Mechanics
          </h3>
          <ul className="flex flex-col gap-2">
            {details.mechanics.map((mech, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                <span>{mech}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategy Tip */}
        <div className="flex flex-col gap-2 bg-emerald-950/30 border border-emerald-600/30 p-4 rounded-2xl">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Survival Strategy
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed italic">
            "{details.strategy}"
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartBattle}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-base uppercase tracking-widest shadow-xl shadow-rose-950/80 border-2 border-rose-400/50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3"
        >
          <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
          BEGIN BATTLE
          <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
        </button>

      </div>
    </div>
  );
};
