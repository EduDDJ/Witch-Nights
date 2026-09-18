import React, { useState } from 'react';
import { resolveAssetPath } from '../utils/assets';
import { ALL_WEAPONS, ALL_STAT_ITEMS, WITCH_DEALS, CHARACTERS } from '../data/gameData';
import { ShootingType } from '../types/game';
import {
  Sparkles,
  Flame,
  Skull,
  BookOpen,
  Crosshair,
  Zap,
  Radio,
  Droplet,
  Maximize2,
  Shield,
  Wind,
  Footprints,
  Compass,
  Heart,
  Sword,
  HelpCircle,
  Clover,
  Lock,
  Sprout,
  X,
  RotateCcw,
  CheckCircle,
  Eye,
  FlaskConical,
} from 'lucide-react';
import { VampireFangsIcon } from './VampireFangsIcon';
import { PentagramIcon } from './PentagramIcon';
import { BroomIcon } from './BroomIcon';
import {
  getLanguage,
  translateCharacterName,
  translateWeaponName,
  translateWeaponDescription,
  translateWeaponTierName,
  translateWeaponTierDescription,
  translateStatItemName,
  translateStatItemDescription,
  translateStatItemTierName,
  translateStatItemTierDescription,
  translateCurseTitle,
  translateCurseSubtitle,
  translateCurseDescription,
  translateBossName,
  translateEnemyName,
  translateEnemyDescription,
  translateAttackName,
  translateAttackTelegraph,
} from '../utils/i18n';

interface CollectionModalProps {
  unlockedWeapons: string[];
  unlockedItems: string[];
  unlockedCurses: string[];
  unlockedItemIds?: string[];
  unlockedEnemies?: string[];
  enemyKills?: Record<string, number>;
  mobileMode?: boolean;
  onClose: () => void;
}

const WEAPON_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Skull,
  BookOpen,
  Crosshair,
  Zap,
  Radio,
  Pentagram: PentagramIcon,
  Sword,
  Sprout,
  FlaskConical,
};

const STAT_ICONS: Record<string, React.ElementType> = {
  Fangs: VampireFangsIcon,
  Droplet: VampireFangsIcon,
  Broom: BroomIcon,
  Maximize2,
  Shield,
  Wind,
  Footprints,
  Zap,
  Compass,
  Heart,
  Clover,
  Eye,
};

const CURSE_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Sword,
  Skull,
  Flame,
  Wind,
  RotateCcw,
};

const PitchforkPeasantIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/peasant_pitchfork.png')}
    alt="Pitchfork Peasant"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('kKhEjFq.png')) {
        target.src = 'https://i.imgur.com/kKhEjFq.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const TorchPeasantIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/peasant_torch.png')}
    alt="Torch Peasant"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('VMPhtDP.png')) {
        target.src = 'https://i.imgur.com/VMPhtDP.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const VillageKnightIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/village_knight.png')}
    alt="Village Knight"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('iHevmHN.png')) {
        target.src = 'https://i.imgur.com/iHevmHN.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const createNormalEnemyIcon = (color: string) => {
  const Icon: React.FC<any> = (props) => (
    <svg viewBox="0 0 24 24" className={props.className || "w-full h-full drop-shadow-md"} {...props}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <circle cx="8.5" cy="10" r="1.5" fill="#0f172a" />
      <circle cx="15.5" cy="10" r="1.5" fill="#0f172a" />
    </svg>
  );
  return Icon;
};

const CarnivorePlantIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/carnivore_plant.png')}
    alt="Carnivore Plant"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('kaNPLzb.png')) {
        target.src = 'https://i.imgur.com/kaNPLzb.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const HauntedEyeIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/haunted_eye_closed.png')}
    alt="Haunted Eye"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('gK96eW7.png')) {
        target.src = 'https://i.imgur.com/gK96eW7.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const MiniEyeIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/mini_eye.png')}
    alt="Mini Eye"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('D4Yp6Z4.png')) {
        target.src = 'https://i.imgur.com/D4Yp6Z4.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const NightBearIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/night_bear.png')}
    alt="NightBear"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('5O8Bf2K.png')) {
        target.src = 'https://i.imgur.com/5O8Bf2K.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const ArchmagesIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/geraldo_rgb.png')}
    alt="The 3 Archmages"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('w8qU2F1.png')) {
        target.src = 'https://i.imgur.com/w8qU2F1.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

const RockThrowerIcon: React.FC<any> = (props) => (
  <img
    src={resolveAssetPath('assets/aistudio/rock_thrower.png')}
    alt="Rock Thrower"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.src.includes('X4zW2H7.png')) {
        target.src = 'https://i.imgur.com/X4zW2H7.png';
      }
    }}
    className={props.className || "w-full h-full object-contain [image-rendering:pixelated] drop-shadow-md"}
    {...props}
  />
);

interface EnemyCollectionData {
  id: string;
  name: string;
  color: string;
  damage: number;
  maxHp: number;
  speed: string;
  isBoss: boolean;
  isRed?: boolean;
  description: string;
  attacks?: {
    name: string;
    damage: string;
    telegraph: string;
    description: string;
  }[];
}

export const ENEMIES_DATA: EnemyCollectionData[] = [
  {
    id: 'wraith',
    name: 'Torch Peasant',
    color: '#38bdf8',
    damage: 10,
    maxHp: 20,
    speed: '1.0x',
    isBoss: false,
    description: 'A peasant carrying a flickering torch through the shadows. The baseline villager moving at standard speed.'
  },
  {
    id: 'bat',
    name: 'Pitchfork Peasant',
    color: '#a855f7',
    damage: 12,
    maxHp: 20,
    speed: '1.15x',
    isBoss: false,
    description: 'A maddened villager wielding an iron pitchfork. Hardier, swifter, and more aggressive than torch-bearing peasants.'
  },
  {
    id: 'rock_thrower',
    name: 'Rock Thrower',
    color: '#d97706',
    damage: 20,
    maxHp: 25,
    speed: '0.85x',
    isBoss: false,
    description: 'A cunning villager who maintains a safe distance from the Witch, telegraphing and hurling heavy rocks every few seconds.'
  },
  {
    id: 'ghoul',
    name: 'Village Knight',
    color: '#ef4444',
    damage: 25,
    maxHp: 30,
    speed: '0.75x',
    isBoss: false,
    isRed: true,
    description: 'A resilient elite knight of the village that drops high-value Red EXP Orbs.'
  },
  {
    id: 'carnivore_plant',
    name: 'Carnivore Plant',
    color: '#22c55e',
    damage: 20,
    maxHp: 1400,
    speed: '0.0x',
    isBoss: true,
    description: 'A stationary botanical nightmare with vicious roots and an insatiable appetite.',
    attacks: [
      { name: 'Vine Snare', damage: '10', telegraph: '1s', description: 'Spawns roots near the player. Emits a smaller warning circle before striking.' },
      { name: 'Chomp Attack', damage: '25', telegraph: '0.85s', description: 'Massive area-of-effect bite centered on the player. Dash is required to escape.' }
    ]
  },
  {
    id: 'mini_eye',
    name: 'Mini Eye',
    color: '#dc2626',
    damage: 15,
    maxHp: 1,
    speed: '2.0x',
    isBoss: false,
    description: 'A tiny, swift ocular minion spawned when the Haunted Eye reveals its true gaze. They relentlessly pursue the witch and self-destruct upon contact.'
  },
  {
    id: 'haunted_eye',
    name: 'Haunted Eye',
    color: '#dc2626',
    damage: 20,
    maxHp: 800,
    speed: '0.0x',
    isBoss: true,
    description: 'A colossal panoramic ocular terror that stays open until its trio of Mini Eye minions are defeated.',
    attacks: [
      { name: 'Blood Tears', damage: '10', telegraph: 'Instant', description: 'Weeps magical projectiles that drift toward the player.' },
      { name: 'Gaze Curse', damage: '20 DPS', telegraph: '1.00s', description: 'When the eye opens, player must look away (cursor below the witch) or suffer rapid damage. The eye only closes when all 3 Mini Eyes are destroyed.' }
    ]
  },
  {
    id: 'night_bear',
    name: 'NightBear',
    color: '#3b2f2f',
    damage: 25,
    maxHp: 1200,
    speed: '2.5x',
    isBoss: true,
    description: 'A dark, hulking beast that alternates 2 - 1 between relentless charges and a devastating arena-wide biting frenzy called "THE Bite".',
    attacks: [
      { name: 'Charge', damage: '25', telegraph: '0.6s', description: 'NightBear readies himself and charges at high speed until hitting a wall. Crashing 3 times causes him to become stunned and dizzy.' },
      { name: 'THE Bite', damage: '25', telegraph: '1.0s', description: 'After recovering from dizziness twice (2 Charge Attacks), NightBear leaps to the top center (telegraphed by a red circle) and bites in circular areas, leaving an opening nearby to escape with quick thinking.' }
    ]
  },
  {
    id: 'archmages',
    name: 'The 3 Archmages',
    color: '#a855f7',
    damage: 20,
    maxHp: 1200,
    speed: '1.0x',
    isBoss: true,
    description: 'A trinity of wise Archmages, testing Ruby. Each has their own attack, but, after defeating all 3, something is waiting for you...',
    attacks: [
      { name: "It's Raining Fire!", damage: '20', telegraph: '1.0s', description: 'Geraldo The Red casts 4 pairs of homing fireballs from screen sides.' },
      { name: 'Vine Box', damage: '25', telegraph: '1.0s', description: 'Geraldo The Green traps you in a 3x3 box with red vine tiles, striking with 3x1 bursts.' },
      { name: 'Thunder Beams', damage: '20', telegraph: '1.5s', description: 'Geraldo The Blue fires 4 electric beams that spin clockwise for 10s.' },
      { name: 'Cloning Spell', damage: '25', telegraph: '1.2s', description: 'Geraldo The RGB duplicates you into separate 3x3 boxes with shared movement.' },
      { name: 'RGBeam', damage: '20', telegraph: '1.5s', description: '8 spinning rainbow beams rotate clockwise around Geraldo The RGB.' },
      { name: 'Rainbow Rain', damage: '20', telegraph: '1.0s', description: 'Tri-directional fireballs, hazard vine tiles, and lightning strikes.' }
    ]
  }
];

interface HoveredItemData {
  id: string;
  name: string;
  category: 'WEAPON' | 'PASSIVE' | 'CURSE' | 'ENEMY';
  isDiscovered: boolean;
  isUnlocked: boolean;
  isLegendary?: boolean;
  description: string;
  unlockCondition?: string;
  shootingType?: ShootingType;
  bulletColor?: string;
  icon: React.ElementType;
  tiers?: { tier: number; damageBonus?: number; fireRateBonus?: number; sizeBonus?: number; countBonus?: number; statValue?: number; description: string }[];
  enemyStats?: {
    damage: number;
    maxHp: number;
    speed: string;
    attacks?: {
      name: string;
      damage: string;
      telegraph: string;
      description: string;
    }[];
  };
  kills?: number;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  unlockedWeapons,
  unlockedItems,
  unlockedCurses,
  unlockedItemIds = [],
  unlockedEnemies = [],
  enemyKills = {},
  mobileMode = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'WEAPONS' | 'PASSIVES' | 'CURSES' | 'ENEMIES'>('WEAPONS');
  const [selectedItem, setSelectedItem] = useState<HoveredItemData | null>(null);
  const [showUpgradeInfo, setShowUpgradeInfo] = useState<boolean>(false);
  const currentLang = getLanguage();

  const discoveredEnemiesCount = ENEMIES_DATA.filter((e) => unlockedEnemies.includes(e.id)).length;
  const totalCollected = unlockedWeapons.length + unlockedItems.length + unlockedCurses.length + discoveredEnemiesCount;
  const totalAvailable = ALL_WEAPONS.length + ALL_STAT_ITEMS.length + WITCH_DEALS.length + ENEMIES_DATA.length;

  const sortedWeapons = [...ALL_WEAPONS].sort((a, b) => {
    const isALeg = Boolean(a.isLegendary);
    const isBLeg = Boolean(b.isLegendary);
    if (isALeg && !isBLeg) return 1;
    if (!isALeg && isBLeg) return -1;
    return 0;
  });

  const sortedStatItems = [...ALL_STAT_ITEMS].sort((a, b) => {
    const isALeg = Boolean(a.isLegendary);
    const isBLeg = Boolean(b.isLegendary);
    if (isALeg && !isBLeg) return 1;
    if (!isALeg && isBLeg) return -1;
    return 0;
  });

  const sortedCurses = [...WITCH_DEALS].sort((a, b) => {
    const isALeg = Boolean(a.isLegendary);
    const isBLeg = Boolean(b.isLegendary);
    if (isALeg && !isBLeg) return 1;
    if (!isALeg && isBLeg) return -1;
    return 0;
  });

  const getShootingTypeLabel = (type?: ShootingType) => {
    switch (type) {
      case 'NEAREST_ENEMY':
        return { 
          label: currentLang === 'en' ? 'Nearest Enemy Homing' : 'Teleguiado no Inimigo Próximo', 
          color: 'text-sky-300 bg-sky-950/80 border-sky-700/60' 
        };
      case 'MOUSE_DIRECTION':
        return { 
          label: currentLang === 'en' ? 'Mouse Direction Aim' : 'Mira na Direção do Mouse', 
          color: 'text-purple-300 bg-purple-950/80 border-purple-700/60' 
        };
      case 'AREA_OF_EFFECT':
        return { 
          label: currentLang === 'en' ? 'Area of Effect (AoE)' : 'Área de Efeito (AoE)', 
          color: 'text-emerald-300 bg-emerald-950/80 border-emerald-700/60' 
        };
      default:
        return { 
          label: currentLang === 'en' ? 'Direct' : 'Direto', 
          color: 'text-slate-300 bg-slate-800 border-slate-700' 
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl ${mobileMode ? 'max-h-[96vh]' : 'max-h-[92vh]'} bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 border-2 border-purple-700/60 rounded-3xl shadow-2xl shadow-purple-950/70 flex flex-col overflow-hidden relative`}>
        {/* Header */}
        <div className={`border-b border-purple-900/50 flex items-center justify-between bg-slate-950/80 ${mobileMode ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <h2 className="text-lg sm:text-2xl font-serif font-black text-slate-100 tracking-wide">
                {currentLang === 'en' ? 'Collection' : 'Coleção'}
              </h2>
              <span className="text-sm sm:text-xl font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/50 px-2 sm:px-3 py-0.5 rounded-xl shadow-lg shadow-amber-950/40 tracking-wider">
                {totalCollected}/{totalAvailable}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              {currentLang === 'en' ? 'Hover or tap any item image to reveal what each one does' : 'Passe o cursor ou toque na imagem de qualquer item para ver o que ele faz'}
            </p>
          </div>

          {/* Right Header Button: X (exit) */}
          <div className="flex items-center">
            <button
              id="collection-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-purple-900 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer shadow-md"
              aria-label="Close Collection"
              title="Close Collection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-1.5 sm:gap-2 border-b border-purple-950/60 bg-slate-950/40 text-[11px] sm:text-xs overflow-x-auto ${mobileMode ? 'px-3 py-1.5' : 'px-6 pt-3 pb-2'}`}>
          {(['WEAPONS', 'PASSIVES', 'CURSES', 'ENEMIES'] as const).map((tab) => (
            <button
              key={tab}
              id={`collection-tab-${tab.toLowerCase()}`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedItem(null);
              }}
              className={`whitespace-nowrap px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'WEAPONS'
                ? (currentLang === 'en' ? `Weapons ${unlockedWeapons.length}/${ALL_WEAPONS.length}` : `Armas ${unlockedWeapons.length}/${ALL_WEAPONS.length}`)
                : tab === 'PASSIVES'
                ? (currentLang === 'en' ? `Artifacts ${unlockedItems.length}/${ALL_STAT_ITEMS.length}` : `Artefatos ${unlockedItems.length}/${ALL_STAT_ITEMS.length}`)
                : tab === 'CURSES'
                ? (currentLang === 'en' ? `Witch's Curses ${unlockedCurses.length}/${WITCH_DEALS.length}` : `Maldições da Bruxa ${unlockedCurses.length}/${WITCH_DEALS.length}`)
                : (currentLang === 'en' ? `Enemies ${discoveredEnemiesCount}/${ENEMIES_DATA.length}` : `Inimigos ${discoveredEnemiesCount}/${ENEMIES_DATA.length}`)}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className={`flex-1 overflow-y-auto flex flex-col justify-between ${mobileMode ? 'p-3 sm:p-5' : 'p-6 sm:p-8'}`}>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2.5 sm:gap-4 justify-items-center">
            {/* 1. Weapons */}
            {activeTab === 'WEAPONS' &&
              sortedWeapons.map((w) => {
                const isDiscovered = unlockedWeapons.includes(w.id);
                const isUnlocked = unlockedItemIds.includes(w.id);
                const isLegendary = Boolean(w.isLegendary);
                const RealIcon = WEAPON_ICONS[w.icon] || Sparkles;

                let DisplayIcon = RealIcon;
                if (!isDiscovered) {
                  DisplayIcon = isUnlocked ? HelpCircle : Lock;
                }

                const itemData: HoveredItemData = {
                  id: w.id,
                  name: translateWeaponName(w.id, w.name, currentLang),
                  category: 'WEAPON',
                  isDiscovered,
                  isUnlocked,
                  isLegendary,
                  description: translateWeaponDescription(w.id, w.description, currentLang),
                  unlockCondition: currentLang === 'en' ? w.unlockCondition : (
                    w.unlockCondition === 'Defeat the Carnivore Plant Boss to unlock.' ? 'Derrote o chefe Planta Carnívora para desbloquear.' :
                    w.unlockCondition === 'Defeat the Haunted Eye Boss to unlock.' ? 'Derrote o chefe Olho Assombrado para desbloquear.' :
                    w.unlockCondition === 'Defeat the NightBear Boss to unlock.' ? 'Derrote o chefe NightBear para desbloquear.' :
                    w.unlockCondition
                  ),
                  shootingType: w.shootingType,
                  bulletColor: w.iconColor || w.bulletColor,
                  icon: DisplayIcon,
                  tiers: w.tiers,
                };

                const displayColor = w.iconColor || w.bulletColor;

                const bgStyle = isLegendary
                  ? isDiscovered
                    ? `${displayColor}22`
                    : isUnlocked
                    ? '#451a0333'
                    : '#78350f25'
                  : isDiscovered
                  ? `${displayColor}22`
                  : isUnlocked
                  ? '#13111c'
                  : '#1e293b25';

                const borderStyle = isLegendary
                  ? '#fbbf24'
                  : isDiscovered
                  ? `${displayColor}aa`
                  : isUnlocked
                  ? '#332a48'
                  : '#475569';

                return (
                  <div
                    key={w.id}
                    id={`collection-item-${w.id}`}
                    onClick={() => setSelectedItem(itemData)}
                    className="relative group cursor-pointer flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
                        isLegendary
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25 hover:scale-110 hover:shadow-amber-500/50 hover:ring-amber-300'
                          : isDiscovered
                          ? 'hover:scale-110 hover:shadow-2xl shadow-purple-950/80'
                          : isUnlocked
                          ? 'opacity-60 hover:opacity-100 hover:scale-105'
                          : 'shadow-md shadow-slate-900 hover:scale-105'
                      } ${selectedItem?.id === w.id ? 'ring-4 ring-purple-500 border-purple-400 scale-105' : ''}`}
                      style={{
                        backgroundColor: bgStyle,
                        borderColor: selectedItem?.id === w.id ? '#a855f7' : borderStyle,
                      }}
                    >
                      {isDiscovered ? (
                        <RealIcon
                          className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:rotate-6"
                          style={{ color: displayColor }}
                        />
                      ) : isUnlocked ? (
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      ) : (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      )}
                    </div>
                  </div>
                );
              })}

            {/* 2. Stat Passives / Artifacts */}
            {activeTab === 'PASSIVES' &&
              sortedStatItems.map((s) => {
                const isDiscovered = unlockedItems.includes(s.id);
                const isUnlocked = unlockedItemIds.includes(s.id);
                const isLegendary = Boolean(s.isLegendary);
                const RealIcon = STAT_ICONS[s.icon] || Droplet;

                let DisplayIcon = RealIcon;
                if (!isDiscovered) {
                  DisplayIcon = isUnlocked ? HelpCircle : Lock;
                }

                const itemData: HoveredItemData = {
                  id: s.id,
                  name: translateStatItemName(s.id, s.name, currentLang),
                  category: 'PASSIVE',
                  isDiscovered,
                  isUnlocked,
                  isLegendary,
                  description: translateStatItemDescription(s.id, s.description, currentLang),
                  unlockCondition: currentLang === 'en' ? s.unlockCondition : (
                    s.unlockCondition === 'Defeat the Carnivore Plant Boss to unlock.' ? 'Derrote o chefe Planta Carnívora para desbloquear.' :
                    s.unlockCondition === 'Defeat the Haunted Eye Boss to unlock.' ? 'Derrote o chefe Olho Assombrado para desbloquear.' :
                    s.unlockCondition === 'Defeat the NightBear Boss to unlock.' ? 'Derrote o chefe NightBear para desbloquear.' :
                    s.unlockCondition
                  ),
                  bulletColor: s.color,
                  icon: DisplayIcon,
                  tiers: s.tiers,
                };

                const bgStyle = isLegendary
                  ? isDiscovered
                    ? `${s.color}22`
                    : isUnlocked
                    ? '#451a0333'
                    : '#78350f25'
                  : isDiscovered
                  ? `${s.color}22`
                  : isUnlocked
                  ? '#13111c'
                  : '#1e293b25';

                const borderStyle = isLegendary
                  ? '#fbbf24'
                  : isDiscovered
                  ? `${s.color}aa`
                  : isUnlocked
                  ? '#332a48'
                  : '#475569';

                const isSelected = selectedItem?.id === s.id;
                return (
                  <div
                    key={s.id}
                    id={`collection-item-${s.id}`}
                    onClick={() => setSelectedItem(itemData)}
                    className="relative group cursor-pointer flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
                        isLegendary
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25 hover:scale-110 hover:shadow-amber-500/50 hover:ring-amber-300'
                          : isDiscovered
                          ? 'hover:scale-110 hover:shadow-2xl'
                          : isUnlocked
                          ? 'opacity-60 hover:opacity-100 hover:scale-105'
                          : 'shadow-md shadow-slate-900 hover:scale-105'
                      } ${isSelected ? 'ring-4 ring-purple-500 border-purple-400 scale-105' : ''}`}
                      style={{
                        backgroundColor: bgStyle,
                        borderColor: isSelected ? '#a855f7' : borderStyle,
                      }}
                    >
                      {isDiscovered ? (
                        <RealIcon
                          className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:rotate-6"
                          style={{ color: s.color }}
                        />
                      ) : isUnlocked ? (
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      ) : (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      )}
                    </div>
                  </div>
                );
              })}

            {/* 3. Witch's Deals */}
            {activeTab === 'CURSES' &&
              sortedCurses.map((c) => {
                const isDiscovered = unlockedCurses.includes(c.id);
                const isUnlocked = unlockedItemIds.includes(c.id);
                const isLegendary = Boolean(c.isLegendary);
                const RealIcon = CURSE_ICONS[c.icon] || Skull;

                let DisplayIcon = RealIcon;
                if (!isDiscovered) {
                  DisplayIcon = isUnlocked ? HelpCircle : Lock;
                }

                const itemData: HoveredItemData = {
                  id: c.id,
                  name: translateCurseTitle(c.id, c.title, currentLang),
                  category: 'CURSE',
                  isDiscovered,
                  isUnlocked,
                  isLegendary,
                  description: translateCurseSubtitle(c.id, c.subtitle || '', currentLang)
                    ? `${translateCurseSubtitle(c.id, c.subtitle || '', currentLang)} — ${translateCurseDescription(c.id, c.description, currentLang)}`
                    : translateCurseDescription(c.id, c.description, currentLang),
                  unlockCondition: currentLang === 'en' ? c.unlockCondition : (
                    c.unlockCondition === 'Defeat the Carnivore Plant Boss to unlock.' ? 'Derrote o chefe Planta Carnívora para desbloquear.' :
                    c.unlockCondition === 'Defeat the Haunted Eye Boss to unlock.' ? 'Derrote o chefe Olho Assombrado para desbloquear.' :
                    c.unlockCondition === 'Defeat the NightBear Boss to unlock.' ? 'Derrote o chefe NightBear para desbloquear.' :
                    c.unlockCondition
                  ),
                  bulletColor: c.color,
                  icon: DisplayIcon,
                };

                const bgStyle = isLegendary
                  ? isDiscovered
                    ? `${c.color}22`
                    : isUnlocked
                    ? '#451a0333'
                    : '#78350f25'
                  : isDiscovered
                  ? `${c.color}22`
                  : isUnlocked
                  ? '#13111c'
                  : '#1e293b25';

                const borderStyle = isLegendary
                  ? '#fbbf24'
                  : isDiscovered
                  ? `${c.color}aa`
                  : isUnlocked
                  ? '#332a48'
                  : '#475569';

                const isSelected = selectedItem?.id === c.id;
                return (
                  <div
                    key={c.id}
                    id={`collection-item-${c.id}`}
                    onClick={() => setSelectedItem(itemData)}
                    className="relative group cursor-pointer flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
                        isLegendary
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25 hover:scale-110 hover:shadow-amber-500/50 hover:ring-amber-300'
                          : isDiscovered
                          ? 'hover:scale-110 hover:shadow-2xl shadow-rose-950/80'
                          : isUnlocked
                          ? 'opacity-60 hover:opacity-100 hover:scale-105'
                          : 'shadow-md shadow-slate-900 hover:scale-105'
                      } ${isSelected ? 'ring-4 ring-purple-500 border-purple-400 scale-105' : ''}`}
                      style={{
                        backgroundColor: bgStyle,
                        borderColor: isSelected ? '#a855f7' : borderStyle,
                      }}
                    >
                      {isDiscovered ? (
                        <RealIcon
                          className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:rotate-6"
                          style={{ color: c.color }}
                        />
                      ) : isUnlocked ? (
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      ) : (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      )}
                    </div>
                  </div>
                );
              })}

            {/* 4. Enemies */}
            {activeTab === 'ENEMIES' &&
              ENEMIES_DATA.map((e) => {
                const isSelected = selectedItem?.id === e.id;
                const isDiscovered = unlockedEnemies?.includes(e.id) || false;
                
                let EnemyIcon = createNormalEnemyIcon(e.color);
                if (e.id === 'wraith') EnemyIcon = TorchPeasantIcon;
                if (e.id === 'bat') EnemyIcon = PitchforkPeasantIcon;
                if (e.id === 'rock_thrower') EnemyIcon = RockThrowerIcon;
                if (e.id === 'ghoul') EnemyIcon = VillageKnightIcon;
                if (e.id === 'carnivore_plant') EnemyIcon = CarnivorePlantIcon;
                if (e.id === 'haunted_eye') EnemyIcon = HauntedEyeIcon;
                if (e.id === 'mini_eye') EnemyIcon = MiniEyeIcon;
                if (e.id === 'night_bear') EnemyIcon = NightBearIcon;
                if (e.id === 'archmages') EnemyIcon = ArchmagesIcon;

                const DisplayIcon = isDiscovered ? EnemyIcon : HelpCircle;

                const bgStyle = isDiscovered ? '#ef444422' : '#450a0a22';
                const borderStyle = e.isBoss ? '#fbbf24' : isDiscovered ? '#ef4444aa' : '#7f1d1d66';

                const itemData: HoveredItemData = {
                  id: e.id,
                  name: e.isBoss ? translateBossName(e.id, e.name, currentLang) : translateEnemyName(e.id.toUpperCase(), e.name, currentLang),
                  category: 'ENEMY',
                  isDiscovered,
                  isUnlocked: true,
                  isLegendary: e.isBoss,
                  description: translateEnemyDescription(e.id, e.description, currentLang),
                  unlockCondition: currentLang === 'en' ? 'Defeat this enemy to reveal its stats.' : 'Derrote este inimigo para revelar seus atributos.',
                  bulletColor: e.color,
                  icon: DisplayIcon,
                  enemyStats: {
                    damage: e.damage,
                    maxHp: e.maxHp,
                    speed: e.speed,
                    attacks: e.attacks ? e.attacks.map(atk => ({
                      name: translateAttackName(atk.name, currentLang),
                      damage: atk.damage,
                      telegraph: currentLang === 'en' ? atk.telegraph : (
                        atk.telegraph === 'Instant' ? 'Imediato' : atk.telegraph
                      ),
                      description: translateAttackTelegraph(atk.name, atk.description, currentLang),
                    })) : undefined,
                  },
                  kills: enemyKills[e.id] || 0,
                };

                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedItem(itemData)}
                    className="relative group cursor-pointer flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
                        e.isBoss
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25 hover:scale-110 hover:shadow-amber-500/50 hover:ring-amber-300'
                          : 'hover:scale-110 hover:shadow-2xl shadow-slate-900 shadow-md'
                      } ${isSelected ? 'ring-4 ring-purple-500 border-purple-400 scale-105' : ''}`}
                      style={{
                        backgroundColor: bgStyle,
                        borderColor: isSelected ? '#a855f7' : borderStyle,
                      }}
                    >
                      {isDiscovered ? (
                        <EnemyIcon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" />
                      ) : (
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* DYNAMIC DESCRIPTION PANEL */}
          <div className={`${mobileMode ? 'mt-4 min-h-[90px] p-3' : 'mt-8 min-h-[120px] p-4'} rounded-2xl bg-slate-950/90 border border-purple-900/60 shadow-2xl flex items-center justify-center transition-all`}>
            {selectedItem ? (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 animate-in fade-in duration-150">
                {/* Large Icon Box */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${
                    selectedItem.isLegendary ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md shadow-amber-500/25' : ''
                  }`}
                  style={{
                    backgroundColor: selectedItem.category === 'ENEMY'
                      ? (selectedItem.isDiscovered ? '#ef444422' : '#450a0a22')
                      : selectedItem.isLegendary
                      ? '#78350f25'
                      : selectedItem.isDiscovered
                      ? `${selectedItem.bulletColor || '#a855f7'}22`
                      : selectedItem.isUnlocked
                      ? '#1e1b4b33'
                      : '#1e293b25',
                    borderColor: selectedItem.isLegendary
                      ? '#fbbf24'
                      : selectedItem.category === 'ENEMY'
                      ? (selectedItem.isDiscovered ? '#ef4444aa' : '#7f1d1d66')
                      : selectedItem.isDiscovered
                      ? `${selectedItem.bulletColor || '#a855f7'}aa`
                      : selectedItem.isUnlocked
                      ? '#3730a344'
                      : '#475569',
                  }}
                >
                  <selectedItem.icon
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    style={{
                      color: selectedItem.isDiscovered
                        ? selectedItem.bulletColor || '#c084fc'
                        : selectedItem.isLegendary
                        ? '#fbbf24'
                        : selectedItem.isUnlocked
                        ? '#94a3b8'
                        : '#fbbf24',
                    }}
                  />
                </div>

                {/* Description Text */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm sm:text-lg font-bold text-slate-100 font-serif">
                      {selectedItem.isDiscovered
                        ? selectedItem.name
                        : selectedItem.isUnlocked
                        ? (selectedItem.category === 'WEAPON'
                            ? (currentLang === 'en' ? 'Undiscovered Weapon' : 'Arma Não Descoberta')
                            : selectedItem.category === 'PASSIVE'
                            ? (currentLang === 'en' ? 'Undiscovered Artifact' : 'Artefato Não Descoberto')
                            : selectedItem.category === 'CURSE'
                            ? (currentLang === 'en' ? "Undiscovered Witch's Deal" : "Acordo da Bruxa Não Descoberto")
                            : selectedItem.isLegendary
                            ? (currentLang === 'en' ? 'Undiscovered Boss' : 'Chefe Não Descoberto')
                            : (currentLang === 'en' ? 'Undiscovered Enemy' : 'Inimigo Não Descoberto'))
                        : `${currentLang === 'en' ? 'Locked' : 'Bloqueado'}: ${selectedItem.name}`}
                    </h4>

                    {selectedItem.isLegendary && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm shadow-amber-500/30">
                        <Sparkles className="w-3 h-3 text-amber-400" /> {selectedItem.category === 'ENEMY' ? (currentLang === 'en' ? 'Boss Enemy' : 'Inimigo Chefe') : (currentLang === 'en' ? 'Legendary Item' : 'Item Lendário')}
                      </span>
                    )}

                    {selectedItem.isDiscovered ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {currentLang === 'en' ? 'Discovered' : 'Descoberto'}
                      </span>
                    ) : selectedItem.isUnlocked ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {currentLang === 'en' ? 'Undiscovered' : 'Não Descoberto'}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-600/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {currentLang === 'en' ? 'Locked' : 'Bloqueado'}
                      </span>
                    )}

                    {selectedItem.isDiscovered && selectedItem.shootingType && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          getShootingTypeLabel(selectedItem.shootingType).color
                        }`}
                      >
                        {getShootingTypeLabel(selectedItem.shootingType).label}
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-black/40 p-2 sm:p-2.5 rounded-xl border border-stone-800 text-left">
                    <p>
                      {selectedItem.isDiscovered
                        ? selectedItem.description
                        : selectedItem.isUnlocked
                        ? (selectedItem.category === 'ENEMY'
                            ? (currentLang === 'en' ? 'Defeat this enemy in a run to unlock its details in the Collection!' : 'Derrote este inimigo em uma partida para desbloquear seus detalhes na Coleção!')
                            : (currentLang === 'en' ? 'Collect this item in a run when leveling up to unlock it in the Collection!' : 'Colete este item em uma partida ao subir de nível para desbloqueá-lo na Coleção!'))
                        : selectedItem.unlockCondition || (currentLang === 'en' ? 'Defeat the Carnivore Plant Boss to unlock.' : 'Derrote o chefe Planta Carnívora para desbloquear.')}
                    </p>
                    {selectedItem.category === 'ENEMY' && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-stone-400">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          {currentLang === 'en' ? 'Killed:' : 'Derrotados:'} <span className="text-slate-100 font-mono font-bold">{selectedItem.kills ?? (enemyKills[selectedItem.id] || 0)}</span>
                        </span>
                        {selectedItem.isDiscovered && selectedItem.enemyStats && (
                          <>
                            <span>{currentLang === 'en' ? 'Damage:' : 'Dano:'} <span className="text-rose-400">{selectedItem.enemyStats.damage}</span></span>
                            <span>{currentLang === 'en' ? 'Speed:' : 'Velocidade:'} <span className="text-sky-400">{selectedItem.enemyStats.speed}</span></span>
                            <span>{currentLang === 'en' ? 'Base Max HP:' : 'Vida Máxima Base:'} <span className="text-emerald-400">{selectedItem.enemyStats.maxHp}</span></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Button ("i") */}
                {((selectedItem.category !== 'ENEMY' && selectedItem.category !== 'CURSE') || selectedItem.isLegendary) && (() => {
                  const isBossLocked = selectedItem.category === 'ENEMY' && selectedItem.isLegendary && !selectedItem.isDiscovered;
                  return (
                    <button
                      disabled={isBossLocked}
                      onClick={() => setShowUpgradeInfo(true)}
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all shadow-md self-center ${
                        isBossLocked
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-50'
                          : 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/50 hover:border-purple-400 font-serif text-base sm:text-lg font-black text-amber-400 hover:text-amber-300 cursor-pointer'
                      }`}
                      title={
                        isBossLocked
                          ? (currentLang === 'en' ? "Defeat this Boss to unlock its information" : "Derrote este Chefe para desbloquear suas informações")
                          : selectedItem.category === 'ENEMY'
                          ? (currentLang === 'en' ? "View Boss Attacks" : "Ver Ataques do Chefe")
                          : (currentLang === 'en' ? "View Upgrade Details & Stats" : "Ver Detalhes de Melhorias e Atributos")
                      }
                    >
                      {isBossLocked ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        'i'
                      )}
                    </button>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-stone-500 text-xs sm:text-sm italic flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500/50" />
                {currentLang === 'en' ? 'Click any item image above to select it and view its description' : 'Clique em qualquer imagem de item acima para selecioná-lo e ver sua descrição'}
              </div>
            )}
          </div>
        </div>

        {/* UPGRADE DETAILS SUB-MODAL */}
        {showUpgradeInfo && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl bg-gradient-to-b from-stone-950 via-slate-950 to-stone-950 border-2 ${
              selectedItem.isLegendary ? 'border-amber-500/80' : 'border-purple-500/60'
            } rounded-2xl shadow-2xl p-6 relative text-slate-100 flex flex-col max-h-[85vh] ${
              mobileMode ? 'p-4 max-h-[90vh]' : ''
            }`}>
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border-2"
                    style={{
                      backgroundColor: selectedItem.category === 'ENEMY' ? '#ef444422' : selectedItem.isLegendary ? '#78350f22' : `${selectedItem.bulletColor || '#a855f7'}15`,
                      borderColor: selectedItem.isLegendary ? '#fbbf24' : selectedItem.category === 'ENEMY' ? '#ef444488' : `${selectedItem.bulletColor || '#a855f7'}88`,
                    }}
                  >
                    <selectedItem.icon
                      className="w-5 h-5"
                      style={{ color: selectedItem.isDiscovered ? selectedItem.bulletColor || '#c084fc' : '#94a3b8' }}
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-100 flex items-center gap-2 flex-wrap">
                      {selectedItem.isDiscovered 
                        ? selectedItem.name 
                        : selectedItem.category === 'ENEMY'
                        ? selectedItem.isLegendary
                          ? (currentLang === 'en' ? '??? (Undiscovered Boss)' : '??? (Chefe Não Descoberto)')
                          : (currentLang === 'en' ? '??? (Undiscovered Enemy)' : '??? (Inimigo Não Descoberto)')
                        : (currentLang === 'en' ? '??? (Locked Item)' : '??? (Item Bloqueado)')}
                      {selectedItem.isLegendary && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" /> {selectedItem.category === 'ENEMY' ? (currentLang === 'en' ? 'Boss Enemy' : 'Inimigo Chefe') : (currentLang === 'en' ? 'Legendary' : 'Lendário')}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {currentLang === 'en' ? 'Category:' : 'Categoria:'} {selectedItem.category === 'WEAPON' ? (currentLang === 'en' ? 'Weapon' : 'Arma') : selectedItem.category === 'PASSIVE' ? (currentLang === 'en' ? 'Artifact / Passive' : 'Artefato / Passivo') : selectedItem.category === 'CURSE' ? (currentLang === 'en' ? "Witch's Deal" : "Acordo da Bruxa") : (currentLang === 'en' ? 'Boss Enemy' : 'Inimigo Chefe')}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowUpgradeInfo(false)}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors border border-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-left">
                 {/* Base Description */}
                <div className="bg-stone-900/70 p-3 rounded-xl border border-stone-800 text-left">
                  <h4 className="text-xs uppercase font-bold text-purple-400 mb-1 text-left">{currentLang === 'en' ? 'Base Description' : 'Descrição Base'}</h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed text-left">
                    {selectedItem.isDiscovered 
                      ? selectedItem.description
                      : selectedItem.isUnlocked
                      ? (selectedItem.category === 'ENEMY'
                          ? (currentLang === 'en' ? 'Defeat this enemy in a run to unlock its details in the Collection!' : 'Derrote este inimigo em uma partida para desbloquear seus detalhes na Coleção!')
                          : (currentLang === 'en' ? 'Collect this item in a run when leveling up to unlock it in the Collection!' : 'Colete este item em uma partida ao subir de nível para desbloqueá-lo na Coleção!'))
                      : selectedItem.unlockCondition || (currentLang === 'en' ? 'Complete a hidden achievement to unlock.' : 'Complete uma conquista oculta para desbloquear.')}
                  </p>
                  {selectedItem.category === 'ENEMY' && (
                    <div className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
                      {currentLang === 'en' ? 'Killed:' : 'Derrotados:'} <span className="text-slate-100 font-mono font-bold">{selectedItem.kills ?? (enemyKills[selectedItem.id] || 0)}</span>
                    </div>
                  )}
                </div>

                {/* Stat Calculations Explanation Note */}
                {selectedItem.category !== 'ENEMY' && (
                  <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-3 text-xs text-stone-300">
                    <p className="font-semibold text-amber-300 mb-1">📊 {currentLang === 'en' ? 'Upgrade Stat Reference Info:' : 'Referência de Atributos de Melhoria:'}</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>{currentLang === 'en' ? 'Rank 1 (Base):' : 'Rank 1 (Base):'}</strong> {currentLang === 'en' ? 'Displayed in absolute, starting numbers.' : 'Exibido em números absolutos e iniciais.'}</li>
                      <li><strong>{currentLang === 'en' ? 'Subsequent Ranks:' : 'Ranks Seguintes:'}</strong> {currentLang === 'en' ? 'Displays only what that specific Rank adds (relative to the previous Rank).' : 'Exibe apenas o que aquele Rank específico adiciona (em relação ao Rank anterior).'}</li>
                    </ul>
                  </div>
                )}

                {/* Upgrades Tiers */}
                {selectedItem.category !== 'ENEMY' && (
                <div className="text-left">
                  <h4 className="text-xs uppercase font-bold text-amber-400 mb-2 flex items-center gap-1 text-left">
                    <Sparkles className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Upgrade Ranks & Stats' : 'Ranks de Melhoria e Atributos'}
                  </h4>
                  {selectedItem.tiers && selectedItem.tiers.length > 0 ? (
                    <div className="flex flex-col gap-2.5 text-left">
                      {selectedItem.tiers.map((t: any, index: number) => {
                        const statsList: string[] = [];
                        const prevT = index > 0 ? selectedItem.tiers![index - 1] : null;

                        if (selectedItem.category === 'WEAPON') {
                          const baseWeapon = ALL_WEAPONS.find((w) => w.id === selectedItem.id);
                          if (baseWeapon) {
                            if (t.tier === 1) {
                              // Base Rank (1) of each weapon - display stats as numbers
                              statsList.push(`${currentLang === 'en' ? 'Damage' : 'Dano'}: ${baseWeapon.baseDamage}`);
                              statsList.push(`${currentLang === 'en' ? 'Cooldown' : 'Recarga'}: ${baseWeapon.baseInterval.toFixed(2)}s`);
                              statsList.push(`${currentLang === 'en' ? 'Projectiles' : 'Projéteis'}: ${baseWeapon.baseCount}`);
                              statsList.push(`${currentLang === 'en' ? 'Size' : 'Tamanho'}: ${baseWeapon.baseSize}px`);
                              if (baseWeapon.basePierce !== undefined && baseWeapon.basePierce > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Pierce' : 'Perfuração'}: ${baseWeapon.basePierce >= 999 ? '∞' : baseWeapon.basePierce}`);
                              }
                              if (baseWeapon.baseSpeed !== undefined && baseWeapon.baseSpeed > 0) {
                                if (baseWeapon.id === 'grimoire_orbit') {
                                  statsList.push(`${currentLang === 'en' ? 'Orbit Speed' : 'Velocidade de Órbita'}: ${baseWeapon.baseSpeed.toFixed(1)} rad/s`);
                                } else {
                                  statsList.push(`${currentLang === 'en' ? 'Velocity' : 'Velocidade'}: ${baseWeapon.baseSpeed}px/s`);
                                }
                              }
                              if (baseWeapon.id === 'astral_sword') {
                                statsList.push(`${currentLang === 'en' ? 'Attack Cone' : 'Cone de Ataque'}: 90°`);
                              }
                            } else {
                              if (baseWeapon.id === 'astral_sword') {
                                const coneDeg = 90 + (t.tier - 1) * 18;
                                statsList.push(`${currentLang === 'en' ? 'Attack Cone' : 'Cone de Ataque'}: ${coneDeg}° (+18°)`);
                              }
                              // Rank > 1: Stats displayed as percentage of the previous rank (with projectile & pierce as exceptions)
                              const currentD = baseWeapon.baseDamage + (t.damageBonus || 0);
                              const prevD = baseWeapon.baseDamage + (prevT ? ((prevT as any).damageBonus || 0) : 0);
                              const diffD = currentD - prevD;
                              if (diffD > 0) {
                                const pctD = Math.round((diffD / prevD) * 100);
                                statsList.push(`${currentLang === 'en' ? 'Damage' : 'Dano'}: +${pctD}%`);
                              }

                              const currentFRFactor = t.fireRateBonus || 1.0;
                              const prevFRFactor = prevT ? ((prevT as any).fireRateBonus || 1.0) : 1.0;
                              if (currentFRFactor !== prevFRFactor) {
                                const pctFR = Math.round(((prevFRFactor / currentFRFactor) - 1) * 100);
                                if (pctFR > 0) {
                                  statsList.push(`${currentLang === 'en' ? 'Fire Rate' : 'Cadência'}: +${pctFR}%`);
                                } else if (pctFR < 0) {
                                  statsList.push(`${currentLang === 'en' ? 'Fire Rate' : 'Cadência'}: ${pctFR}%`);
                                }
                              }

                              const currentSpeed = (baseWeapon.baseSpeed || 0) + ((t as any).speedBonus || 0);
                              const prevSpeed = (baseWeapon.baseSpeed || 0) + (prevT ? (((prevT as any).speedBonus) || 0) : 0);
                              const diffSpeed = currentSpeed - prevSpeed;
                              if (diffSpeed > 0 && baseWeapon.baseSpeed) {
                                const pctSpeed = Math.round((diffSpeed / baseWeapon.baseSpeed) * 100);
                                statsList.push(`${currentLang === 'en' ? 'Velocity' : 'Velocidade'}: +${pctSpeed}%`);
                              }

                              const currentSize = baseWeapon.baseSize + (t.sizeBonus || 0);
                              const prevSize = baseWeapon.baseSize + (prevT ? ((prevT as any).sizeBonus || 0) : 0);
                              const diffSize = currentSize - prevSize;
                              if (diffSize > 0) {
                                const pctSize = Math.round((diffSize / prevSize) * 100);
                                statsList.push(`${currentLang === 'en' ? 'Size' : 'Tamanho'}: +${pctSize}%`);
                              }

                              // Exceptions: absolute additions for projectiles and pierce
                              const currentCount = t.countBonus || 0;
                              const prevCount = prevT ? ((prevT as any).countBonus || 0) : 0;
                              const diffCount = currentCount - prevCount;
                              if (diffCount > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Projectiles' : 'Projéteis'}: +${diffCount}`);
                              }

                              const currentPierce = t.pierceBonus || 0;
                              const prevPierce = prevT ? ((prevT as any).pierceBonus || 0) : 0;
                              const diffPierce = currentPierce - prevPierce;
                              if (diffPierce > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Pierce' : 'Perfuração'}: +${diffPierce}`);
                              }

                              if (baseWeapon.id === 'seeking_wisp' && t.tier === 6) {
                                statsList.push(currentLang === 'en' ? 'Special: Small Explosion' : 'Especial: Pequena Explosão');
                              }
                              if (baseWeapon.id === 'seeking_wisp' && t.tier === 7) {
                                statsList.push(currentLang === 'en' ? 'Special: Mega Blast Explosion + Continuous Burn' : 'Especial: Explosão Mega Impactante + Queimadura Contínua');
                              }
                              if (baseWeapon.id === 'arcane_wand' && t.tier === 7) {
                                statsList.push(currentLang === 'en' ? 'Special: Infinite Piercing Laser' : 'Especial: Laser Perfurante Infinito');
                              }
                              if (baseWeapon.id === 'brimstone_shotgun' && t.tier === 7) {
                                statsList.push(currentLang === 'en' ? 'Special: Wide Wave (2x Dmg + Knockback + 15s Acid)' : 'Especial: Onda Ampla (Dobro de Dano + Repulsão + Ácido de 15s)');
                              }
                              if (baseWeapon.id === 'astral_sword' && t.tier === 7) {
                                statsList.push(currentLang === 'en' ? 'Special: Persistent Cursor Blade + High Speed Slash + Burn/Acid' : 'Especial: Lâmina no Cursor Persistente + Golpe Veloz + Queimadura/Ácido');
                              }
                            }
                          }
                        } else if (selectedItem.category === 'PASSIVE') {
                          if (t.tier === 1) {
                            if (selectedItem.id === 'vampiric_chalice') {
                              statsList.push(`${currentLang === 'en' ? 'Vampirism' : 'Vampirismo'}: ${Math.round(t.statValue * 100)}%`);
                            } else if (selectedItem.id === 'medusas_eye') {
                              // Handled entirely in text description
                            } else if (selectedItem.id === 'broom_of_haste') {
                              statsList.push(`${currentLang === 'en' ? 'Dash Cooldown' : 'Recarga do Dash'}: -${Math.round(t.statValue * 100)}%`);
                            } else if (selectedItem.id === 'blood_ruby') {
                              statsList.push(`${currentLang === 'en' ? 'Max HP' : 'Vida Máxima'}: +${t.statValue}`);
                              statsList.push(`${currentLang === 'en' ? 'Regen' : 'Regeneração'}: +0.1 HP/s`);
                            } else if (selectedItem.id === 'nightbears_claws') {
                              statsList.push(`${currentLang === 'en' ? 'Dash Damage' : 'Dano de Dash'}: ${t.statValue}`);
                            } else if (selectedItem.id === 'destiny_control') {
                              statsList.push(currentLang === 'en' ? 'Level Choices: 4 Options' : 'Opções de Nível: 4 Opções');
                            } else {
                              const pct = Math.round((t.statValue - 1) * 100);
                              const label = selectedItem.id === 'astral_lens' ? (currentLang === 'en' ? 'Spell Size' : 'Tamanho do Feitiço') :
                                            selectedItem.id === 'repulsion_talisman' ? (currentLang === 'en' ? 'Knockback' : 'Repulsão') :
                                            selectedItem.id === 'magnet_orb' ? (currentLang === 'en' ? 'Pickup Radius' : 'Raio de Coleta') : (currentLang === 'en' ? 'Bonus' : 'Bônus');
                              statsList.push(`${label}: +${pct}%`);
                            }
                          } else {
                            // Rank > 1
                            const prevVal = prevT ? (prevT as any).statValue : 1.0;
                            const currVal = t.statValue;

                            if (selectedItem.id === 'vampiric_chalice') {
                              const diff = currVal - prevVal;
                              if (diff > 0) {
                                const pct = Math.round((diff / prevVal) * 100);
                                statsList.push(`${currentLang === 'en' ? 'Vampirism' : 'Vampirismo'}: +${pct}%`);
                              }
                            } else if (selectedItem.id === 'nightbears_claws') {
                              const diff = currVal - prevVal;
                              if (diff > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Dash Damage' : 'Dano de Dash'}: +${Math.round(diff)}`);
                              }
                            } else if (selectedItem.id === 'medusas_eye') {
                              // Handled entirely in text description
                            } else if (selectedItem.id === 'broom_of_haste') {
                              const diffPct = Math.round((currVal - prevVal) * 100);
                              if (diffPct > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Dash Cooldown' : 'Recarga do Dash'}: -${diffPct}%`);
                              }
                            } else if (selectedItem.id === 'blood_ruby') {
                              // Max HP exception - absolute number
                              const diff = currVal - prevVal;
                              if (diff > 0) {
                                statsList.push(`${currentLang === 'en' ? 'Max HP' : 'Vida Máxima'}: +${diff}`);
                              }
                              statsList.push(`${currentLang === 'en' ? 'Regen' : 'Regeneração'}: +0.1 HP/s`);
                            } else if (selectedItem.id === 'destiny_control') {
                              if (t.tier === 2) statsList.push(currentLang === 'en' ? 'Boss Pool: 2 Choices' : 'Seleção de Chefes: 2 Opções');
                              else if (t.tier === 3) statsList.push(currentLang === 'en' ? "Witch's Deals: 3 Choices" : 'Acordos da Bruxa: 3 Opções');
                              else if (t.tier === 4) statsList.push(currentLang === 'en' ? 'Boss Pool: 3 Choices' : 'Seleção de Chefes: 3 Opções');
                              else if (t.tier === 5) statsList.push(currentLang === 'en' ? 'Level Rerolls: 1 Per Screen' : 'Trocas de Nível: 1 Por Tela');
                            } else {
                              // Standard multipliers
                              const pct = ((currVal / prevVal) - 1) * 100;
                              if (pct > 0) {
                                const label = selectedItem.id === 'astral_lens' ? (currentLang === 'en' ? 'Spell Size' : 'Tamanho do Feitiço') :
                                              selectedItem.id === 'repulsion_talisman' ? (currentLang === 'en' ? 'Knockback' : 'Repulsão') :
                                              selectedItem.id === 'magnet_orb' ? (currentLang === 'en' ? 'Pickup Radius' : 'Raio de Coleta') : (currentLang === 'en' ? 'Bonus' : 'Bônus');
                                statsList.push(`${label}: +${Math.round(pct)}%`);
                              }
                            }
                          }
                        }

                        const tierDesc = selectedItem.category === 'WEAPON' 
                          ? translateWeaponTierDescription(selectedItem.id, t.tier, t.description, currentLang) 
                          : selectedItem.category === 'PASSIVE' 
                          ? translateStatItemTierDescription(selectedItem.id, t.tier, t.description, currentLang) 
                          : t.description;

                        return (
                          <div
                            key={t.tier}
                            className="bg-stone-950/80 p-3 rounded-xl border border-stone-900 hover:border-purple-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left"
                          >
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-2 text-left flex-wrap">
                                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/40">
                                  {t.tier === 7 ? (currentLang === 'en' ? 'Mega Evolved' : 'Megaevoluído') : `Rank ${t.tier}`}
                                </span>
                                {t.tier === 7 && (
                                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/80 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    {(() => {
                                      const charObj = CHARACTERS.find((c) => c.startingWeaponId === selectedItem.id);
                                      const charName = charObj ? translateCharacterName(charObj.id, charObj.name, currentLang) : (currentLang === 'en' ? 'Character' : 'Personagem');
                                      return currentLang === 'en' ? `${charName}'s Mega Evolution` : `Megaevolução de ${charName}`;
                                    })()}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-300 mt-1 text-left">{tierDesc}</p>
                            </div>
                            
                            {statsList.length > 0 && (
                              <div className="flex flex-wrap gap-1 sm:flex-col sm:items-end justify-start">
                                {statsList.map((stat, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded"
                                  >
                                    {stat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-900 text-center text-xs text-stone-500 italic">
                      {currentLang === 'en' ? 'This selection does not possess upgrade tiers.' : 'Esta seleção não possui níveis de melhoria.'}
                    </div>
                  )}
                </div>
                )}

                {selectedItem.category === 'ENEMY' && selectedItem.enemyStats?.attacks && (
                  <div className="text-left mt-2">
                    <h4 className="text-xs uppercase font-bold text-rose-400 mb-2 flex items-center gap-1 text-left">
                      <Flame className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Boss Attacks' : 'Ataques do Chefe'}
                    </h4>
                    <div className="flex flex-col gap-3">
                      {selectedItem.enemyStats.attacks.map((atk, i) => (
                        <div key={i} className="bg-stone-950/80 p-3 rounded-xl border border-rose-900/40">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200 text-sm">{atk.name}</span>
                            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                              {atk.damage} {currentLang === 'en' ? 'DMG' : 'Dano'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 leading-relaxed mb-2">{atk.description}</p>
                          <div className="text-[10px] text-sky-300 font-mono flex items-center gap-1">
                            <Wind className="w-3 h-3" /> {currentLang === 'en' ? 'Telegraph:' : 'Sinalização:'} {atk.telegraph}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
