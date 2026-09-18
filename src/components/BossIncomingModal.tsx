import React from 'react';
import { ShieldAlert, Sword, Heart, Zap, AlertTriangle, CheckCircle, Skull, Flame } from 'lucide-react';
import { BossDefinition } from '../types/game';
import { resolveAssetPath } from '../utils/assets';
import { GameImage } from './GameImage';
import { getLanguage, t, translateBossName } from '../utils/i18n';

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
  const isPt = getLanguage() === 'pt-BR';
  // Get mechanics and explanation based on boss id
  const getBossDetails = (id: string) => {
    switch (id) {
      case 'carnivore_plant':
        return {
          title: translateBossName(id, boss.name, getLanguage()),
          subtitle: isPt ? "O Diabo da Estufa" : "Greenhouse's Devil",
          color: '#22c55e',
          accent: 'emerald',
          mechanics: isPt ? [
            'Vinhas Espinhosas: Dispara vinhas emaranhadas que prendem a bruxa no lugar.',
            'Ataque de Mordida: Descarrega uma mordida devastadora. Nota: A Investida (Dash) é necessária para escapar!'
          ] : [
            'Thorny Vines: Shoots tangled thorny vines that snare and root the witch in place.',
            'Chomp Attack: Delivers a devastating chomp bite. Note: Dash is necessary to escape the Chomp Attack!'
          ],
          strategy: isPt ? 'Mantenha distância e circule o perímetro. Use sua habilidade de Investida para esquivar da mordida.' : 'Keep your distance and circle around the perimeter. Use your Dash ability to evade the Chomp Attack and escape when cornered.'
        };
      case 'haunted_eye':
        return {
          title: isPt ? 'Olho Assombrado' : 'Haunted Eye',
          subtitle: isPt ? 'Espírito Onisciente' : 'All-Seeing Spirit',
          color: '#dc2626',
          accent: 'rose',
          mechanics: isPt ? [
            'Lágrimas Pranteantes: Dispara rajadas de lágrimas ocultas teleguiadas.',
            'Defesa Ocular: O olho só fecha quando os 3 Mini Olhos forem derrotados.',
            'ZONA PROIBIDA (Desvie o Olhar): Durante a fase de olho aberto, mantenha o cursor abaixo da Bruxa (Y > Bruxa). Olhar diretamente causa 20 DPS!'
          ] : [
            'Weeping Tears: Fires volleys of homing occult teardrops that track your position.',
            'Eye Defense: The Eye only closes when all 3 Mini Eyes are defeated.',
            'FORBIDDEN ZONE (Look Away): During its eye-open phase, you MUST keep your cursor below the Witch (Y > Witch). Staring directly at the eye inflicts 20 DPS!'
          ],
          strategy: isPt ? 'Destrua todos os 3 Mini Olhos primeiro para que o Olho principal feche. Fique atento à posição do cursor!' : 'Destroy all 3 Mini Eyes first so the main Eye closes. Watch your cursor position when the warning line appears!'
        };
      case 'archmages':
        return {
          title: isPt ? 'Os 3 Arquemagos' : 'The 3 Archmages',
          subtitle: isPt ? 'Trindade Elemental Ancestral' : 'Ancient Elemental Trinity',
          color: '#a855f7',
          accent: 'purple',
          mechanics: isPt ? [
            'Fase 1 (Trindade): Vermelho (Chuva de Fogo teleguiada), Verde (Caixa de Vinhas e golpes 3x1), Azul (Feixes de Trovão giratórios de 10s).',
            'Defesa de Bolha: Magos nocauteados (0 HP) ficam protegidos no canto inferior esquerdo.',
            'Fase 2: Unem-se (1200 HP) com feitiço de clone sincronizado, 8 feixes de arco-íris e tempestade de relâmpagos.'
          ] : [
            'Phase 1 (Trinity): Red (Homing fireballs), Green (Vine Box & 3x1 bursts), Blue (10s spinning Thunder Beams).',
            'Bubble Shield: Knocked-down wizards (0 HP) move to the bottom left wrapped in protective bubbles.',
            'Phase 2: Merge (1200 HP) with synchronized player cloning, 8 spinning rainbow beams, and thunder hazards.'
          ],
          strategy: isPt ? 'Na Fase 1, foque o dano no Mago ativo. Na Fase 2, posicione-se em áreas seguras tanto para você quanto para seu clone!' : 'In Phase 1, burst down whichever Wizard is currently active. In Phase 2, navigate tiles that are safe for BOTH you and your synchronized clone!'
        };
      case 'night_bear':
      default:
        return {
          title: 'NightBear',
          subtitle: isPt ? 'Besta Incontrolável' : 'Uncontrollable Beast',
          color: '#b45309',
          accent: 'amber',
          mechanics: isPt ? [
            'Investidas Frenéticas: Corre pela arena em linha reta, ficando tonto após bater nas paredes 3 vezes.',
            'Ataque "A Mordida": Disparado após 2 atordoamentos por tontura. NightBear salta para o centro superior e morde toda a arena!'
          ] : [
            'Frenzied Charges: Sprints across the arena in linear charges, becoming dizzy after crashing into walls 3 times.',
            '"THE Bite" Attack: Triggers after 2 Charge Attack dizzy stuns. NightBear leaps to the top center and unleashes arena-wide bites! A clear opening always exists near you to escape!'
          ],
          strategy: isPt ? 'Atraia suas investidas para as paredes para atordoá-lo. Após o 2º atordoamento, observe o salto para o topo e desvie pela abertura!' : 'Bait his charges into walls to stun him. After recovering from his 2nd dizzy stun, watch for his leap to top center, then quickly react and step into the clear gap to avoid bite damage!'
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
            {t('boss_incoming_banner', getLanguage())}
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
              <GameImage
                src="assets/aistudio/carnivore_plant.png"
                fallbackSrc="assets/carnivore_plant.png"
                alternateFallbacks={['https://i.imgur.com/kaNPLzb.png']}
                alt="Carnivore Plant"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : boss.id === 'haunted_eye' ? (
              <GameImage
                src="assets/aistudio/haunted_eye_open.png"
                fallbackSrc="assets/haunted_eye_open.png"
                alternateFallbacks={['https://i.imgur.com/caqAbHC.png']}
                alt="Haunted Eye"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : boss.id === 'night_bear' ? (
              <GameImage
                src="assets/aistudio/night_bear.png"
                fallbackSrc="assets/night_bear.png"
                alternateFallbacks={['https://i.imgur.com/Pjkp2on.png']}
                alt="NightBear"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain [image-rendering:pixelated] drop-shadow-md"
              />
            ) : boss.id === 'archmages' ? (
              <GameImage
                src="assets/aistudio/geraldo_rgb.png"
                fallbackSrc="assets/geraldo_rgb.png"
                alternateFallbacks={['https://i.imgur.com/w8qU2F1.png', 'assets/geraldo.png']}
                alt="The 3 Archmages"
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
                <Zap className="w-3.5 h-3.5 text-purple-400" /> {isPt ? 'Tempo: Limite de 90s' : 'Time: 90s Limit'}
              </span>
            </div>
          </div>
        </div>

        {/* Mechanics & Attacks */}
        <div className="flex flex-col gap-3 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> {isPt ? 'Ataques & Mecânicas' : 'Attacks & Mechanics'}
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
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {isPt ? 'Estratégia de Sobrevivência' : 'Survival Strategy'}
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
          {isPt ? 'INICIAR BATALHA' : 'BEGIN BATTLE'}
          <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
        </button>

      </div>
    </div>
  );
};
