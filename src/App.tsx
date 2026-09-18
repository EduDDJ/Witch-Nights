/**
 * Witch Nights - Gothic Survival Roguelike
 * Built with React, TypeScript & HTML5 Canvas.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayerStats,
  OwnedWeapon,
  OwnedStatItem,
  CurseChoice,
  GameOptions,
  BossInstance,
  BossDefinition,
  CharacterDefinition,
} from './types/game';
import {
  ALL_WEAPONS,
  ALL_STAT_ITEMS,
  WITCH_DEALS,
  DEFAULT_UNLOCKED_ITEM_IDS,
  BOSS_POOL,
  CHARACTERS,
  getExpNeededForLevel,
} from './data/gameData';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { LevelUpModal, LevelUpOption } from './components/LevelUpModal';
import { WitchDealModal } from './components/WitchDealModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementBanner, AchievementNotificationData } from './components/AchievementBanner';
import { ACHIEVEMENTS } from './data/achievements';
import { CollectionModal, ENEMIES_DATA } from './components/CollectionModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { OptionsModal } from './components/OptionsModal';
import { PauseMenuModal } from './components/PauseMenuModal';
import { DevToolsModal } from './components/DevToolsModal';
import { WeaponSelectorModal } from './components/WeaponSelectorModal';
import { TutorialModal } from './components/TutorialModal';
import { BossSelectModal } from './components/BossSelectModal';
import { BossRushModal } from './components/BossRushModal';
import { GameModeSelectModal } from './components/GameModeSelectModal';
import { BossIncomingModal } from './components/BossIncomingModal';
import { soundEngine } from './utils/audio';
import { setLanguage, getLanguage, translateAchievement, t } from './utils/i18n';

type GameScreen = 'MENU' | 'PLAYING' | 'COLLECTION' | 'CHARACTER_SELECT';

const DEFAULT_OPTIONS: GameOptions = {
  soundEnabled: true,
  soundVolume: 80,
  dashMode: 'MOVEMENT',
  screenShake: true,
  damageNumbers: true,
  mobileMode: false,
  brightness: 100,
};

const INITIAL_PLAYER_STATS: PlayerStats = {
  x: 0,
  y: 0,
  hp: 100,
  maxHp: 100,
  speed: 165, // Slightly slower base speed so Dash and Movement Speed artifacts are more impactful
  radius: 18,
  level: 1,
  exp: 0,
  expToNextLevel: getExpNeededForLevel(1),
  dashCooldown: 3.0, // base 3s cooldown
  dashTimer: 0,
  isDashing: false,
  dashDuration: 0.2,
  vampirism: 0.0,
  projectileSizeMult: 1.0,
  knockbackMult: 1.0,
  damageMult: 1.0,
  magnetRadius: 100,
  hpRegen: 0.5,
  damageReduction: 0.0,
  expMultiplier: 1.0,
  dashDamage: 0,
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition>(CHARACTERS[0]);

  // Gameplay Run State
  const [player, setPlayer] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [weapons, setWeapons] = useState<OwnedWeapon[]>([
    { id: 'arcane_wand', level: 1, lastFired: 0, statsMultiplier: 1.0 },
  ]);
  const [statItems, setStatItems] = useState<OwnedStatItem[]>([]);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [bossCountdown, setBossCountdown] = useState<number>(300);
  const [maxWeapons, setMaxWeapons] = useState<number>(5);
  const [isHurt, setIsHurt] = useState<boolean>(false);
  const [gameRunId, setGameRunId] = useState<number>(1);

  // Modals & Overlays during run
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpOption[] | null>(null);
  const [pendingLevelUps, setPendingLevelUps] = useState<number>(0);
  const [witchDealCurses, setWitchDealCurses] = useState<CurseChoice[] | null>(null);
  const [bossSelectOptions, setBossSelectOptions] = useState<BossDefinition[] | null>(null);
  const [gameOverStats, setGameOverStats] = useState<{ time: number; level: number; kills: number; bossesKilled: number; totalDamage?: number; killerName?: string; isVictory?: boolean } | null>(null);
  const [isBossRushModalOpen, setIsBossRushModalOpen] = useState<boolean>(false);
  const [isGameModeSelectOpen, setIsGameModeSelectOpen] = useState<boolean>(false);
  const [isBossRush, setIsBossRush] = useState<boolean>(false);
  const [bossRushQueue, setBossRushQueue] = useState<string[]>(['carnivore_plant', 'haunted_eye', 'night_bear', 'archmages']);

  // Boss fight state
  const [boss, setBoss] = useState<BossInstance | null>(null);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);
  const [bossTimer, setBossTimer] = useState<number>(90);
  const [bossHP, setBossHP] = useState<number>(0);

  // Options & Pause Menu State
  const [options, setOptions] = useState<GameOptions>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_options');
      return saved ? { ...DEFAULT_OPTIONS, ...JSON.parse(saved) } : DEFAULT_OPTIONS;
    } catch {
      return DEFAULT_OPTIONS;
    }
  });
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [achievementQueue, setAchievementQueue] = useState<AchievementNotificationData[]>([]);
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState<boolean>(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(false);
  const [isLevelUpFromDevTools, setIsLevelUpFromDevTools] = useState<boolean>(false);
  const [isWeaponSelectorOpen, setIsWeaponSelectorOpen] = useState<boolean>(false);
  const [isCollectionFromPause, setIsCollectionFromPause] = useState<boolean>(false);
  const [instaKill, setInstaKill] = useState<boolean>(false);
  const [hasUsedRerollThisLevel, setHasUsedRerollThisLevel] = useState<boolean>(false);
  const [incomingBoss, setIncomingBoss] = useState<BossDefinition | null>(null);
  const [isDevBossSelect, setIsDevBossSelect] = useState<boolean>(false);

  // Sync options changes with localStorage and SoundEngine
  useEffect(() => {
    try {
      localStorage.setItem('witch_nights_options', JSON.stringify(options));
    } catch {
      // safe ignore
    }
    soundEngine.setEnabled(options.soundEnabled);
    soundEngine.setVolume(options.soundVolume / 100);
    if (options.language) {
      setLanguage(options.language as any);
    }
  }, [options]);

  const handleUpdateOptions = (updated: Partial<GameOptions>) => {
    setOptions((prev) => ({ ...prev, ...updated }));
  };

  // Global Escape & P key listener for pausing and dismissing modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause with 'p' or 'P' key during gameplay
      if (e.key === 'p' || e.key === 'P') {
        if (screen === 'PLAYING') {
          // If level up, witch deal, boss select, or game over is active, don't toggle pause menu
          if (levelUpOptions === null && witchDealCurses === null && gameOverStats === null && bossSelectOptions === null) {
            setIsPauseMenuOpen((prev) => !prev);
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        if (isOptionsOpen) {
          setIsOptionsOpen(false);
          return;
        }
        if (isDevToolsOpen) {
          setIsDevToolsOpen(false);
          return;
        }
        if (isWeaponSelectorOpen) {
          setIsWeaponSelectorOpen(false);
          return;
        }
        if (isCollectionFromPause) {
          setIsCollectionFromPause(false);
          return;
        }
        if (bossSelectOptions !== null && isDevBossSelect) {
          setBossSelectOptions(null);
          setIsDevBossSelect(false);
          return;
        }
        if (screen === 'COLLECTION' || screen === 'CHARACTER_SELECT') {
          setScreen('MENU');
          return;
        }
        if (screen === 'PLAYING') {
          // If level up, witch deal, boss select, or game over is active, don't toggle pause menu
          if (levelUpOptions === null && witchDealCurses === null && gameOverStats === null && bossSelectOptions === null) {
            setIsPauseMenuOpen((prev) => !prev);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOptionsOpen, isDevToolsOpen, isWeaponSelectorOpen, isCollectionFromPause, bossSelectOptions, isDevBossSelect, screen, levelUpOptions, witchDealCurses, gameOverStats]);

  // Persistent Collection state across runs (saved in localStorage)
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('witch_nights_default_undiscovered_v4');
      if (!v) {
        localStorage.setItem('witch_nights_default_undiscovered_v4', 'true');
        localStorage.setItem('witch_nights_weapons', JSON.stringify([]));
        localStorage.setItem('witch_nights_items', JSON.stringify([]));
        localStorage.setItem('witch_nights_curses', JSON.stringify([]));
        localStorage.setItem('witch_nights_enemies', JSON.stringify([]));
        localStorage.setItem('witch_nights_unlocked_ids', JSON.stringify(DEFAULT_UNLOCKED_ITEM_IDS));
        return [];
      }
      const saved = localStorage.getItem('witch_nights_weapons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('witch_nights_default_undiscovered_v4');
      if (!v) return [];
      const saved = localStorage.getItem('witch_nights_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedCurses, setUnlockedCurses] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('witch_nights_default_undiscovered_v4');
      if (!v) return [];
      const saved = localStorage.getItem('witch_nights_curses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('witch_nights_default_undiscovered_v4');
      if (!v) return DEFAULT_UNLOCKED_ITEM_IDS;
      const saved = localStorage.getItem('witch_nights_unlocked_ids');
      if (!saved) return DEFAULT_UNLOCKED_ITEM_IDS;
      const loaded: string[] = JSON.parse(saved);
      // Ensure all DEFAULT_UNLOCKED_ITEM_IDS (such as astral_sword) are always present
      // so newly added weapons start as Undiscovered in the item pool and collection, not Locked.
      return Array.from(new Set([...DEFAULT_UNLOCKED_ITEM_IDS, ...loaded]));
    } catch {
      return DEFAULT_UNLOCKED_ITEM_IDS;
    }
  });

  const [unlockedEnemies, setUnlockedEnemies] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('witch_nights_default_undiscovered_v4');
      if (!v) return [];
      const saved = localStorage.getItem('witch_nights_enemies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [enemyKills, setEnemyKills] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_enemy_kills');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bestBossRushTime, setBestBossRushTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_boss_rush_best_time');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  const [bossRushCharBestTimes, setBossRushCharBestTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_boss_rush_char_best_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isBossRushCharSelectOpen, setIsBossRushCharSelectOpen] = useState<boolean>(false);

  const [isTrueWitchUnlocked, setIsTrueWitchUnlocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_true_witch_unlocked');
      if (saved !== null) return saved === 'true';
      // If player already completed regular Boss Rush previously
      const bestTime = localStorage.getItem('witch_nights_boss_rush_best_time');
      return bestTime !== null;
    } catch {
      return false;
    }
  });

  const [isTrueWitchMode, setIsTrueWitchMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_true_witch_enabled');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [hasTrueWitchTrophy, setHasTrueWitchTrophy] = useState<boolean>(() => {
    try {
      return localStorage.getItem('witch_nights_true_witch_conquered') === 'true';
    } catch {
      return false;
    }
  });

  const [completedAchievementIds, setCompletedAchievementIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('witch_nights_completed_achievements');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      // Sync retroactively with unlocked items / existing wins
      const savedItemIdsRaw = localStorage.getItem('witch_nights_unlocked_ids');
      const itemIds: string[] = savedItemIdsRaw ? JSON.parse(savedItemIdsRaw) : DEFAULT_UNLOCKED_ITEM_IDS;
      if (itemIds.includes('vine_snare') && !ids.includes('plants_vs_witches')) {
        ids.push('plants_vs_witches');
      }
      if (itemIds.includes('medusas_eye') && !ids.includes('eye_see_you')) {
        ids.push('eye_see_you');
      }
      if (itemIds.includes('nightbears_claws') && !ids.includes('bearely_any_trouble')) {
        ids.push('bearely_any_trouble');
      }
      if (
        (localStorage.getItem('witch_nights_true_witch_unlocked') === 'true' ||
          localStorage.getItem('witch_nights_boss_rush_best_time') !== null) &&
        !ids.includes('youre_a_witch_ruby')
      ) {
        ids.push('youre_a_witch_ruby');
      }
      if (
        localStorage.getItem('witch_nights_true_witch_conquered') === 'true' &&
        !ids.includes('being_a_witch_isnt_a_job')
      ) {
        ids.push('being_a_witch_isnt_a_job');
      }
      if (
        localStorage.getItem('witch_nights_geraldo_unlocked') === 'true' &&
        !ids.includes('color_me_impressed')
      ) {
        ids.push('color_me_impressed');
      }
      if (
        localStorage.getItem('witch_nights_geraldo_green_unlocked') === 'true' &&
        !ids.includes('alphabet_green')
      ) {
        ids.push('alphabet_green');
      }
      if (
        localStorage.getItem('witch_nights_geraldo_blue_unlocked') === 'true' &&
        !ids.includes('feeling_blue')
      ) {
        ids.push('feeling_blue');
      }
      return ids;
    } catch {
      return [];
    }
  });

  const isGeraldoUnlocked = completedAchievementIds.includes('color_me_impressed');
  const isGeraldoGreenUnlocked = completedAchievementIds.includes('alphabet_green');
  const isGeraldoBlueUnlocked = completedAchievementIds.includes('feeling_blue');

  // Complete achievement logic
  const completeAchievement = useCallback((achievementId: string) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return;

    setCompletedAchievementIds((prev) => {
      if (prev.includes(achievementId)) return prev;
      const next = [...prev, achievementId];
      try {
        localStorage.setItem('witch_nights_completed_achievements', JSON.stringify(next));
      } catch {
        // safe ignore
      }
      return next;
    });

    if (ach.unlockedItemId) {
      setUnlockedItemIds((prev) => {
        if (prev.includes(ach.unlockedItemId!)) return prev;
        const next = [...prev, ach.unlockedItemId!];
        try {
          localStorage.setItem('witch_nights_unlocked_ids', JSON.stringify(next));
        } catch {
          // safe ignore
        }
        return next;
      });
    }

    if (achievementId === 'color_me_impressed') {
      try {
        localStorage.setItem('witch_nights_geraldo_unlocked', 'true');
      } catch {
        // safe ignore
      }
    }

    if (achievementId === 'alphabet_green') {
      try {
        localStorage.setItem('witch_nights_geraldo_green_unlocked', 'true');
      } catch {
        // safe ignore
      }
    }

    if (achievementId === 'feeling_blue') {
      try {
        localStorage.setItem('witch_nights_geraldo_blue_unlocked', 'true');
      } catch {
        // safe ignore
      }
    }

    if (achievementId === 'youre_a_witch_ruby') {
      setIsTrueWitchUnlocked(true);
      try {
        localStorage.setItem('witch_nights_true_witch_unlocked', 'true');
      } catch {
        // safe ignore
      }
    }

    if (achievementId === 'being_a_witch_isnt_a_job') {
      setHasTrueWitchTrophy(true);
      try {
        localStorage.setItem('witch_nights_true_witch_conquered', 'true');
      } catch {
        // safe ignore
      }
    }

    setAchievementQueue((prev) => {
      // Prevent duplicate queue entries for the same achievement
      if (prev.some((item) => item.achievementId === ach.id)) return prev;
      return [
        ...prev,
        {
          id: `${ach.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          achievementId: ach.id,
          achievementTitle: translateAchievement(ach.id, 'title', ach.title, getLanguage()),
          unlockText: translateAchievement(ach.id, 'unlockText', ach.unlockText, getLanguage()),
        },
      ];
    });
  }, []);

  // Play achievement sound whenever a new notification becomes active at the front of the queue
  useEffect(() => {
    if (achievementQueue.length > 0) {
      soundEngine.playLevelUp();
    }
  }, [achievementQueue[0]?.id]);

  const handleDismissAchievementNotification = useCallback(() => {
    setAchievementQueue((prev) => (prev.length > 0 ? prev.slice(1) : []));
  }, []);

  const handleBossDefeated = useCallback((bossId: string) => {
    if (isBossRush) return;
    if (bossId === 'carnivore_plant') {
      completeAchievement('plants_vs_witches');
      if (bossRushCharBestTimes['geraldo'] !== undefined) {
        completeAchievement('alphabet_green');
      }
    } else if (bossId === 'haunted_eye') {
      completeAchievement('eye_see_you');
    } else if (bossId === 'night_bear') {
      completeAchievement('bearely_any_trouble');
    } else if (bossId === 'archmages') {
      completeAchievement('color_me_impressed');
    }
  }, [completeAchievement, isBossRush, bossRushCharBestTimes]);

  const handleBossUpdate = useCallback((b: BossInstance | null, isFight: boolean, timer: number, hp: number) => {
    setBoss(b);
    setIsBossFight(isFight);
    setBossTimer(timer);
    setBossHP(hp);
  }, []);

  // Save collections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('witch_nights_weapons', JSON.stringify(unlockedWeapons));
      localStorage.setItem('witch_nights_items', JSON.stringify(unlockedItems));
      localStorage.setItem('witch_nights_curses', JSON.stringify(unlockedCurses));
      localStorage.setItem('witch_nights_unlocked_ids', JSON.stringify(unlockedItemIds));
      localStorage.setItem('witch_nights_enemies', JSON.stringify(unlockedEnemies));
      localStorage.setItem('witch_nights_enemy_kills', JSON.stringify(enemyKills));
    } catch {
      // safe ignore
    }
  }, [unlockedWeapons, unlockedItems, unlockedCurses, unlockedItemIds, unlockedEnemies, enemyKills]);

  // Recalculate player passives whenever statItems change
  const recalculatePassives = useCallback((currentStatItems: OwnedStatItem[], customMaxHp?: number) => {
    let vamp = 0.0;
    let projSize = 1.0;
    let kb = 1.0;
    let dashCdReduction = 0.0;
    let speedMult = 1.0;
    let dmgMult = 1.0;
    let magnetMult = 1.0;
    let bonusHp = 0;
    let regen = 0.5;
    let dDamage = 0;
    let dmgRed = 0.0;

    currentStatItems.forEach((owned) => {
      const def = ALL_STAT_ITEMS.find((item) => item.id === owned.id);
      if (!def) return;
      const tier = def.tiers.find((t) => t.tier === owned.level) || def.tiers[0];

      switch (def.statType) {
        case 'VAMPIRISM':
          vamp += tier.statValue;
          break;
        case 'PROJECTILE_SIZE':
          projSize = tier.statValue;
          break;
        case 'KNOCKBACK':
          kb = tier.statValue;
          break;
        case 'DASH_COOLDOWN':
          dashCdReduction = tier.statValue; // Percentage reduction of base dash cooldown (0.10, 0.20, etc.)
          break;
        case 'MOVE_SPEED':
          speedMult = tier.statValue;
          break;
        case 'DAMAGE_BOOST':
          dmgMult = tier.statValue;
          break;
        case 'MAGNET_RADIUS':
          magnetMult = tier.statValue;
          break;
        case 'MAX_HEALTH':
          bonusHp += tier.statValue;
          regen += 0.1 * owned.level;
          break;
        case 'DASH_DAMAGE':
          dDamage = tier.statValue;
          break;
        case 'DAMAGE_REDUCTION':
          dmgRed = tier.statValue;
          break;
        case 'EXTRA_CHOICES':
          break;
      }
    });

    setPlayer((prev) => {
      const isGlassTank = prev.isGlassTank ?? false;
      const isVampireBite = prev.isVampireBite ?? false;
      const rawBaseHp = customMaxHp ?? selectedCharacter?.baseMaxHp ?? 100;
      const baseMaxHp = isGlassTank ? Math.round(rawBaseHp / 2) : rawBaseHp;
      const baseDashCd = INITIAL_PLAYER_STATS.dashCooldown;
      const calculatedDashCd = Math.max(0.5, baseDashCd * (1 - dashCdReduction));
      const baseSpeed = 165 * (selectedCharacter?.speedMultiplier ?? 1.1);
      const newMaxHp = baseMaxHp + bonusHp;
      const hpGain = Math.max(0, newMaxHp - prev.maxHp);
      const newHp = Math.min(newMaxHp, prev.hp + hpGain);
      const finalHpRegen = (isVampireBite || isTrueWitchMode) ? 0 : regen;
      return {
        ...prev,
        vampirism: vamp,
        projectileSizeMult: projSize,
        knockbackMult: kb,
        dashCooldown: calculatedDashCd,
        speed: baseSpeed * speedMult,
        damageMult: dmgMult * (isGlassTank ? 2.0 : 1.0),
        magnetRadius: 100 * magnetMult,
        maxHp: newMaxHp,
        hp: newHp,
        hpRegen: finalHpRegen,
        dashDamage: dDamage,
        damageReduction: dmgRed,
        isVampireBite,
      };
    });
  }, [selectedCharacter, isTrueWitchMode]);

  // Start a new run (Normal Game) with selected character
  const handleStartGame = (character: CharacterDefinition = selectedCharacter) => {
    let finalChar = character;
    if (['geraldo', 'geraldo_green', 'geraldo_blue'].includes(character.id)) {
      if (!isGeraldoUnlocked) {
        finalChar = CHARACTERS[0];
      } else if (character.id === 'geraldo_green' && !isGeraldoGreenUnlocked) {
        finalChar = CHARACTERS.find((c) => c.id === 'geraldo') || CHARACTERS[0];
      } else if (character.id === 'geraldo_blue' && !isGeraldoBlueUnlocked) {
        finalChar = CHARACTERS.find((c) => c.id === 'geraldo') || CHARACTERS[0];
      }
    }
    setSelectedCharacter(finalChar);
    setIsBossRush(false);
    handleItemUnlocked('WEAPON', finalChar.startingWeaponId);
    if (finalChar.startingStatItemId) {
      handleItemUnlocked('STAT', finalChar.startingStatItemId);
    }
    setGameRunId((prev) => prev + 1);
    const charMaxHp = finalChar.baseMaxHp;
    const charSpeed = 165 * (finalChar.speedMultiplier ?? 1.1);
    const initialStatItems = finalChar.startingStatItemId
      ? [{ id: finalChar.startingStatItemId, level: 1 }]
      : [];
    setPlayer({
      ...INITIAL_PLAYER_STATS,
      maxHp: charMaxHp,
      hp: charMaxHp,
      speed: charSpeed,
    });
    setWeapons([{ id: finalChar.startingWeaponId, level: 1, lastFired: 0, statsMultiplier: 1.0 }]);
    setStatItems(initialStatItems);
    recalculatePassives(initialStatItems, charMaxHp, character);
    setSurvivalTime(0);
    setBossCountdown(300);
    setMaxWeapons(5);
    setLevelUpOptions(null);
    setPendingLevelUps(0);
    setWitchDealCurses(null);
    setGameOverStats(null);
    setBoss(null);
    setIsBossFight(false);
    setBossTimer(90);
    setBossHP(0);
    setIsPauseMenuOpen(false);
    setIsDevToolsOpen(false);
    setIsLevelUpFromDevTools(false);
    setIsOptionsOpen(false);
    setIsCollectionFromPause(false);
    setInstaKill(false);
    setScreen('PLAYING');

    // If character starts with bonus levels (e.g. Geraldo The Green), trigger level up selection right after Start Run
    if (character.startingLevelBonus && character.startingLevelBonus > 0) {
      soundEngine.playLevelUp();
      const initialWeapons = [{ id: character.startingWeaponId, level: 1, lastFired: 0, statsMultiplier: 1.0 }];
      handleTriggerLevelUp(character.startingLevelBonus, initialWeapons, initialStatItems);
    }
  };

  const handleStartBossRush = (queue?: string[]) => {
    const selectedQueue = queue || ['carnivore_plant', 'haunted_eye', 'night_bear', 'archmages'];
    setBossRushQueue(selectedQueue);
    setIsBossRush(true);
    handleItemUnlocked('WEAPON', selectedCharacter.startingWeaponId);
    if (selectedCharacter.startingStatItemId) {
      handleItemUnlocked('STAT', selectedCharacter.startingStatItemId);
    }
    setGameRunId((prev) => prev + 1);
    const initialHpRegen = isTrueWitchMode ? 0 : INITIAL_PLAYER_STATS.hpRegen;
    const charMaxHp = selectedCharacter.baseMaxHp;
    const charSpeed = 165 * (selectedCharacter.speedMultiplier ?? 1.1);
    const initialStatItems = selectedCharacter.startingStatItemId
      ? [{ id: selectedCharacter.startingStatItemId, level: 1 }]
      : [];
    setPlayer({
      ...INITIAL_PLAYER_STATS,
      maxHp: charMaxHp,
      hp: charMaxHp,
      speed: charSpeed,
      hpRegen: initialHpRegen,
      level: 1,
      exp: 0,
    });
    setWeapons([{ id: selectedCharacter.startingWeaponId, level: 1, lastFired: 0, statsMultiplier: 1.0 }]);
    setStatItems(initialStatItems);
    recalculatePassives(initialStatItems, charMaxHp, selectedCharacter);
    setSurvivalTime(0);
    setBossCountdown(300);
    setMaxWeapons(1);
    setLevelUpOptions(null);
    setPendingLevelUps(0);
    setWitchDealCurses(null);
    setGameOverStats(null);
    setBoss(null);
    setIsBossFight(true);
    setBossTimer(90);
    setBossHP(0);
    setIsPauseMenuOpen(false);
    setIsDevToolsOpen(false);
    setIsLevelUpFromDevTools(false);
    setIsOptionsOpen(false);
    setIsCollectionFromPause(false);
    setInstaKill(false);
    setScreen('PLAYING');

    // Starting level bonus for Boss Rush mode as well
    if (selectedCharacter.startingLevelBonus && selectedCharacter.startingLevelBonus > 0) {
      soundEngine.playLevelUp();
      const initialWeapons = [{ id: selectedCharacter.startingWeaponId, level: 1, lastFired: 0, statsMultiplier: 1.0 }];
      handleTriggerLevelUp(selectedCharacter.startingLevelBonus, initialWeapons, initialStatItems);
    }
  };

  // Reset Run
  const handleRestartRun = () => {
    if (isBossRush) {
      handleStartBossRush();
    } else {
      handleStartGame();
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    setOptions((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Dev Tools Actions:
  // 1. Instant Level Up
  const handleDevInstantLevelUp = () => {
    setIsLevelUpFromDevTools(true);
    setIsDevToolsOpen(false);
    setIsWeaponSelectorOpen(false);
    setIsPauseMenuOpen(false);
    const nextLvl = player.level + 1;
    const nextExp = getExpNeededForLevel(nextLvl);
    setPlayer((prev) => ({
      ...prev,
      level: nextLvl,
      exp: 0,
      expToNextLevel: nextExp,
    }));
    window.dispatchEvent(new CustomEvent('dev-instant-level-up'));
    handleTriggerLevelUp();
  };

  // 2. Skip to Minute 5:00 (Boss Fight with Destiny Control selection)
  const handleSkipToMinute5 = () => {
    setIsDevToolsOpen(false);
    setIsPauseMenuOpen(false);
    setSurvivalTime(300);
    setBossCountdown(0);
    // Open boss selection screen allowing player to choose which boss to fight (shows all bosses)
    setBossSelectOptions(BOSS_POOL);
  };

  // 3. Skip to Minute 7:30 (Witch's Deal)
  const handleSkipToMinute730 = () => {
    setIsDevToolsOpen(false);
    setIsPauseMenuOpen(false);
    setSurvivalTime(450);
    setLevelUpOptions(null);
    window.dispatchEvent(new CustomEvent('trigger-test-deal'));
    const destinyItem = statItems.find((s) => s.id === 'destiny_control');
    const dealCount = destinyItem && destinyItem.level >= 3 ? 2 : 1;
    const shuffled = [...WITCH_DEALS].sort(() => 0.5 - Math.random());
    soundEngine.playWitchDeal();
    setWitchDealCurses(shuffled.slice(0, dealCount));
  };

  // Fast-forward test minute 7:30 deal (retained for generic call)
  const handleTriggerTestDeal = () => {
    handleSkipToMinute730();
  };

  const handleTriggerTestBoss = () => {
    handleSkipToMinute5();
  };

  const handleDevFightBoss = () => {
    setIsDevToolsOpen(false);
    setIsPauseMenuOpen(false);
    setBossCountdown(0);
    window.dispatchEvent(new CustomEvent('set-boss-timer-zero'));
    setIsDevBossSelect(true);
    setBossSelectOptions(BOSS_POOL);
  };

  const handleTriggerWitchDeal = (curses: CurseChoice[]) => {
    if (isBossRush) return;
    setLevelUpOptions(null);
    window.dispatchEvent(new CustomEvent('trigger-test-deal'));
    setWitchDealCurses(curses);
  };

  // Record acquired items into Grimoire collection
  const handleItemUnlocked = useCallback((type: 'WEAPON' | 'STAT' | 'CURSE', id: string) => {
    if (type === 'WEAPON') {
      setUnlockedWeapons((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else if (type === 'STAT') {
      setUnlockedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else if (type === 'CURSE') {
      setUnlockedCurses((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  }, []);

  // Generate Level Up Choices (3 options base, 4 options with Destiny Control Rank 1+)
  const handleTriggerLevelUp = useCallback((extraLevels = 1, currentWeapons = weapons, currentStatItems = statItems, isReroll = false) => {
    if (witchDealCurses !== null) return;
    if (!isReroll) {
      if (extraLevels > 1) {
        setPendingLevelUps((prev) => prev + extraLevels - 1);
      }
      setHasUsedRerollThisLevel(false);
    }
    const choices: LevelUpOption[] = [];

    const isFirstLevelUp = currentWeapons.length === 1 && currentStatItems.length === 0;

    if (isFirstLevelUp) {
      // First level up: exclusively offer new weapons
      ALL_WEAPONS.forEach((wDef) => {
        if (!currentWeapons.some((w) => w.id === wDef.id) && unlockedItemIds.includes(wDef.id)) {
          choices.push({
            kind: 'WEAPON_NEW',
            definition: wDef,
          });
        }
      });
    } else {
      // 1. Upgrades for already owned weapons (Rank 7 Mega Evolution is exclusive to respective character)
      currentWeapons.forEach((owned) => {
        const def = ALL_WEAPONS.find((w) => w.id === owned.id);
        if (def) {
          const isRespectiveCharacter = selectedCharacter && selectedCharacter.startingWeaponId === owned.id;
          const maxLevel = isRespectiveCharacter ? def.tiers.length : Math.min(6, def.tiers.length);
          if (owned.level < maxLevel) {
            choices.push({
              kind: 'WEAPON_UPGRADE',
              definition: def,
              currentTier: owned.level,
              nextTier: owned.level + 1,
            });
          }
        }
      });

      // 2. New weapons entirely (if player has < maxWeapons slots)
      if (currentWeapons.length < maxWeapons) {
        ALL_WEAPONS.forEach((wDef) => {
          if (!currentWeapons.some((w) => w.id === wDef.id) && unlockedItemIds.includes(wDef.id)) {
            choices.push({
              kind: 'WEAPON_NEW',
              definition: wDef,
            });
          }
        });
      }

      // 3. Upgrades for already owned stat items (if level < maxTier)
      currentStatItems.forEach((owned) => {
        const def = ALL_STAT_ITEMS.find((s) => s.id === owned.id);
        const maxTier = def ? def.tiers.length : 6;
        if (owned.level < maxTier) {
          if (def) {
            choices.push({
              kind: 'STAT_UPGRADE',
              definition: def,
              currentTier: owned.level,
              nextTier: owned.level + 1,
            });
          }
        }
      });

      // 4. New stat items entirely (if player has < 5 passives)
      if (currentStatItems.length < 5) {
        ALL_STAT_ITEMS.forEach((sDef) => {
          if (!currentStatItems.some((s) => s.id === sDef.id) && unlockedItemIds.includes(sDef.id)) {
            choices.push({
              kind: 'STAT_NEW',
              definition: sDef,
            });
          }
        });
      }
    }

    // Shuffle and pick options (4 options if Destiny Control Rank 1+, else 3)
    const destinyItem = currentStatItems.find((s) => s.id === 'destiny_control');
    const choiceCount = destinyItem && destinyItem.level >= 1 ? 4 : 3;
    const shuffled = [...choices].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, choiceCount);
    setLevelUpOptions(selected);
  }, [weapons, statItems, maxWeapons, witchDealCurses, unlockedItemIds]);

  const handleRerollLevelUpOptions = useCallback(() => {
    setHasUsedRerollThisLevel(true);
    soundEngine.playLevelUp();
    handleTriggerLevelUp(1, weapons, statItems, true);
  }, [handleTriggerLevelUp, weapons, statItems]);

  // Apply chosen Level Up boon
  const handleSelectLevelUpOption = (option: LevelUpOption) => {
    let nextWeapons = weapons;
    let nextStatItems = statItems;

    if (option.kind === 'WEAPON_NEW') {
      nextWeapons = [
        ...weapons,
        { id: option.definition.id, level: 1, lastFired: 0, statsMultiplier: 1.0 },
      ];
      setWeapons(nextWeapons);
      handleItemUnlocked('WEAPON', option.definition.id);
    } else if (option.kind === 'WEAPON_UPGRADE') {
      nextWeapons = weapons.map((w) =>
        w.id === option.definition.id ? { ...w, level: option.nextTier } : w
      );
      setWeapons(nextWeapons);
    } else if (option.kind === 'STAT_NEW') {
      nextStatItems = [...statItems, { id: option.definition.id, level: 1 }];
      setStatItems(nextStatItems);
      handleItemUnlocked('STAT', option.definition.id);
      recalculatePassives(nextStatItems);
    } else if (option.kind === 'STAT_UPGRADE') {
      nextStatItems = statItems.map((s) =>
        s.id === option.definition.id ? { ...s, level: option.nextTier } : s
      );
      setStatItems(nextStatItems);
      recalculatePassives(nextStatItems);
    }

    if (isLevelUpFromDevTools) {
      setLevelUpOptions(null);
      setIsLevelUpFromDevTools(false);
      setIsPauseMenuOpen(true);
      setIsDevToolsOpen(true);
    } else {
      setPendingLevelUps((prev) => {
        if (prev > 0) {
          const nextPending = prev - 1;
          setTimeout(() => {
            soundEngine.playLevelUp();
            handleTriggerLevelUp(1, nextWeapons, nextStatItems);
          }, 0);
          return nextPending;
        } else {
          setTimeout(() => {
            setLevelUpOptions(null);
          }, 0);
          return 0;
        }
      });
    }
  };

  // Apply chosen Witch Deal (Minute 7:30 Curse)
  const handleSelectCurse = (curse: CurseChoice | null) => {
    if (curse) {
      handleItemUnlocked('CURSE', curse.id);

      switch (curse.effect) {
      case 'RESET_GUNS_MAX_PASSIVES':
        // Ascendant Arcana: Pick a random owned weapon, increase its rank by 3 (capped at 6), and decrease all other weapons to base level 1
        setWeapons((prev) => {
          if (prev.length === 0) return prev;
          const chosenIndex = Math.floor(Math.random() * prev.length);
          return prev.map((w, idx) => ({
            ...w,
            level: idx === chosenIndex ? Math.min(6, w.level + 3) : 1,
          }));
        });
        break;

      case 'TRIPLE_ONE_GUN':
        // Pact of the Sole Relic: Destroy all but one random weapon (which gets all stats tripled) and reduce max weapon capacity to 3
        setMaxWeapons(3);
        setWeapons((prev) => {
          if (prev.length === 0) return prev;
          const chosenIndex = Math.floor(Math.random() * prev.length);
          const chosen = prev[chosenIndex];
          return [{
            ...chosen,
            statsMultiplier: (chosen.statsMultiplier || 1.0) * 3.0,
          }];
        });
        break;

      case 'DEJA_VU':
        // Déjà-Vu: Reset player and enemies to level 1, remove all weapons and artifacts except Stellar Beam at Level 1, triple all earned EXP
        setMaxWeapons(5);
        setWeapons([
          { id: 'arcane_wand', level: 1, lastFired: 0, statsMultiplier: 1.0 },
        ]);
        setStatItems([]);
        recalculatePassives([]);
        setPlayer((prev) => ({
          ...prev,
          level: 1,
          exp: 0,
          expToNextLevel: getExpNeededForLevel(1),
          expMultiplier: (prev.expMultiplier || 1.0) * 3.0,
        }));
        window.dispatchEvent(new CustomEvent('reset-enemy-levels'));
        break;

      case 'DIVIDE_HP_DOUBLE_DMG':
        // Halve Base Max HP, double damage
        setPlayer((prev) => {
          const rawBaseHp = selectedCharacter?.baseMaxHp ?? 100;
          const newBaseHp = Math.round(rawBaseHp / 2);
          let bonusHp = 0;
          statItems.forEach((owned) => {
            const def = ALL_STAT_ITEMS.find((item) => item.id === owned.id);
            if (def && def.statType === 'MAX_HEALTH') {
              const tier = def.tiers.find((t) => t.tier === owned.level) || def.tiers[0];
              bonusHp += tier.statValue;
            }
          });
          const newMax = newBaseHp + bonusHp;
          return {
            ...prev,
            isGlassTank: true,
            maxHp: newMax,
            hp: Math.min(newMax, prev.hp),
            damageMult: prev.damageMult * 2.0,
          };
        });
        break;

      case 'VAMPIRES_BITE':
        setPlayer((prev) => ({
          ...prev,
          isVampireBite: true,
          hpRegen: 0,
        }));
        break;

      case 'SWARM_TRIPLE_EXP':
        // +3% vampirism and triple exp bonus
        setPlayer((prev) => ({
          ...prev,
          vampirism: prev.vampirism + 0.03,
          expMultiplier: (prev.expMultiplier || 1.0) * 3.0,
        }));
        break;

      case 'PHANTOM_DASH':
        // Dash cooldown down to 1.2s
        setPlayer((prev) => ({
          ...prev,
          dashCooldown: 1.2,
        }));
        break;
      }
    }

    setWitchDealCurses(null);
    window.dispatchEvent(new CustomEvent('trigger-test-deal'));
  };

  // Handle selecting an item from the Dev Weapon Selector
  const handleSelectDevItem = (itemId: string, category: 'WEAPON' | 'PASSIVE') => {
    if (category === 'WEAPON') {
      const owned = weapons.find(w => w.id === itemId);
      const def = ALL_WEAPONS.find(w => w.id === itemId);
      const isRespective = selectedCharacter && selectedCharacter.startingWeaponId === itemId;
      const maxAllowed = (def && def.tiers.length >= 7 && !isRespective) ? 6 : (def?.tiers.length || 6);

      if (owned) {
        if (owned.level >= maxAllowed) return; // Prevent exceeding allowed rank
        setWeapons(prev => prev.map(w => w.id === itemId ? { ...w, level: Math.min(maxAllowed, w.level + 1) } : w));
      } else if (weapons.length < maxWeapons) {
        setWeapons(prev => [...prev, { id: itemId, level: 1, lastFired: 0, statsMultiplier: 1.0 }]);
        handleItemUnlocked('WEAPON', itemId);
      }
    } else {
      const owned = statItems.find(s => s.id === itemId);
      if (owned) {
        const nextStats = statItems.map(s => s.id === itemId ? { ...s, level: s.level + 1 } : s);
        setStatItems(nextStats);
        recalculatePassives(nextStats);
      } else if (statItems.length < 5) {
        const nextStats = [...statItems, { id: itemId, level: 1 }];
        setStatItems(nextStats);
        handleItemUnlocked('STAT', itemId);
        recalculatePassives(nextStats);
      }
    }

    // Always level up player when selecting/upgrading from Dev Tool
    setPlayer(prev => ({
      ...prev,
      level: prev.level + 1,
      expToNextLevel: getExpNeededForLevel(prev.level + 1)
    }));
  };

  const handleModifyDevItemLevel = (itemId: string, category: 'WEAPON' | 'PASSIVE', delta: number) => {
    if (category === 'WEAPON') {
      setWeapons(prev => prev.map(w => w.id === itemId ? { ...w, level: w.level + delta } : w).filter(w => w.level > 0));
    } else {
      setStatItems(prev => {
        const next = prev.map(s => s.id === itemId ? { ...s, level: s.level + delta } : s).filter(s => s.level > 0);
        recalculatePassives(next);
        return next;
      });
    }
  };

  const handleStartBossBattle = () => {
    if (incomingBoss) {
      const b = incomingBoss;
      setIncomingBoss(null);
      window.dispatchEvent(new CustomEvent('spawn-boss-fight', { detail: { bossId: b.id } }));
    }
  };

  // Trigger hurt animation on witch face
  const handleUpdatePlayer = useCallback((stats: Partial<PlayerStats>) => {
    setPlayer((prev) => {
      if (stats.hp !== undefined && stats.hp < prev.hp) {
        setIsHurt(true);
        setTimeout(() => setIsHurt(false), 200);
      }
      return { ...prev, ...stats };
    });
  }, []);

  const handleGameOver = useCallback((stats: any) => {
    setGameOverStats(stats);
    if (isBossRush && stats.isVictory) {
      const isFullBossRush = stats.isFullBossRush ?? (bossRushQueue.length > 1);
      if (isFullBossRush) {
        completeAchievement('youre_a_witch_ruby');
        if (isTrueWitchMode) {
          completeAchievement('being_a_witch_isnt_a_job');
        }

        // Achievement: "Out of the whole Alphabet, Green is my Favorite Number"
        // Condition: "Unlock Vine Snare and complete Boss Rush as Geraldo The Red."
        // Unlocks: Geraldo The Green.
        const isVineSnareUnlocked =
          unlockedItemIds.includes('vine_snare') || completedAchievementIds.includes('plants_vs_witches');
        if (selectedCharacter.id === 'geraldo' && isVineSnareUnlocked) {
          completeAchievement('alphabet_green');
        }

        // Achievement: "Feeling Blue"
        // Condition: "Complete Boss Rush as Geraldo The Green."
        // Unlocks: Geraldo The Blue.
        if (selectedCharacter.id === 'geraldo_green') {
          completeAchievement('feeling_blue');
        }

        setIsTrueWitchUnlocked(true);
        try {
          localStorage.setItem('witch_nights_true_witch_unlocked', 'true');
        } catch {
          // safe ignore
        }
      }
      setBestBossRushTime((prev) => {
        const newBest = prev === null ? stats.time : Math.min(prev, stats.time);
        try {
          localStorage.setItem('witch_nights_boss_rush_best_time', String(newBest));
        } catch {
          // safe ignore
        }
        return newBest;
      });

      if (selectedCharacter) {
        setBossRushCharBestTimes((prev) => {
          const charId = selectedCharacter.id;
          const currentBest = prev[charId];
          const newCharBest = currentBest === undefined ? stats.time : Math.min(currentBest, stats.time);
          const updated = { ...prev, [charId]: newCharBest };
          try {
            localStorage.setItem('witch_nights_boss_rush_char_best_times', JSON.stringify(updated));
          } catch {
            // safe ignore
          }
          return updated;
        });
      }
    }
  }, [isBossRush, bossRushQueue, isTrueWitchMode, selectedCharacter, unlockedItemIds, completedAchievementIds, completeAchievement]);

  // Reset discovered collection & progress
  const handleResetProgress = () => {
    setUnlockedWeapons([]);
    setUnlockedItems([]);
    setUnlockedCurses([]);
    setUnlockedEnemies([]);
    setEnemyKills({});
    setUnlockedItemIds(DEFAULT_UNLOCKED_ITEM_IDS);
    setCompletedAchievementIds([]);
    setAchievementQueue([]);
    setHasTrueWitchTrophy(false);
    setBestBossRushTime(null);
    setIsTrueWitchUnlocked(false);
    setIsTrueWitchMode(false);
    try {
      localStorage.setItem('witch_nights_default_undiscovered_v4', 'true');
      localStorage.setItem('witch_nights_weapons', JSON.stringify([]));
      localStorage.setItem('witch_nights_items', JSON.stringify([]));
      localStorage.setItem('witch_nights_curses', JSON.stringify([]));
      localStorage.setItem('witch_nights_enemies', JSON.stringify([]));
      localStorage.setItem('witch_nights_enemy_kills', JSON.stringify({}));
      localStorage.setItem('witch_nights_unlocked_ids', JSON.stringify(DEFAULT_UNLOCKED_ITEM_IDS));
      localStorage.removeItem('witch_nights_completed_achievements');
      localStorage.removeItem('witch_nights_true_witch_conquered');
      localStorage.removeItem('witch_nights_boss_rush_best_time');
      localStorage.removeItem('witch_nights_true_witch_unlocked');
      localStorage.removeItem('witch_nights_true_witch_enabled');
      localStorage.removeItem('witch_nights_geraldo_unlocked');
      localStorage.removeItem('witch_nights_geraldo_green_unlocked');
      localStorage.removeItem('witch_nights_geraldo_blue_unlocked');
      if (['geraldo', 'geraldo_green', 'geraldo_blue'].includes(selectedCharacter.id)) {
        setSelectedCharacter(CHARACTERS[0]);
      }
    } catch {
      // safe ignore
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100"
      style={{ filter: `brightness(${options.brightness}%)` }}
    >
      {/* 1. MAIN MENU SCREEN */}
      {screen === 'MENU' && (
        <MainMenu
          onStartGame={() => setIsGameModeSelectOpen(true)}
          onOpenBossRush={() => setIsBossRushModalOpen(true)}
          onOpenCollection={() => setScreen('COLLECTION')}
          onOpenOptions={() => setIsOptionsOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          hasTrueWitchTrophy={hasTrueWitchTrophy}
          unlockedCount={unlockedWeapons.length + unlockedItems.length + unlockedCurses.length + unlockedEnemies.filter(id => ENEMIES_DATA.some(e => e.id === id)).length}
          totalCount={ALL_WEAPONS.length + ALL_STAT_ITEMS.length + WITCH_DEALS.length + ENEMIES_DATA.length}
        />
      )}

      {/* 1.5 GAME MODE SELECT MODAL */}
      {isGameModeSelectOpen && (
        <GameModeSelectModal
          onSelectNormalRun={() => {
            setIsGameModeSelectOpen(false);
            setScreen('CHARACTER_SELECT');
          }}
          onSelectBossRush={() => {
            setIsGameModeSelectOpen(false);
            setIsBossRushModalOpen(true);
          }}
          onClose={() => setIsGameModeSelectOpen(false)}
          hasTrueWitchTrophy={hasTrueWitchTrophy}
        />
      )}

      {/* 2. CHARACTER SELECT SCREEN */}
      {screen === 'CHARACTER_SELECT' && (
        <CharacterSelectModal
          onStartRun={handleStartGame}
          onClose={() => setScreen('MENU')}
          mobileMode={options.mobileMode}
          isGeraldoUnlocked={isGeraldoUnlocked}
          isGeraldoGreenUnlocked={isGeraldoGreenUnlocked}
          isGeraldoBlueUnlocked={isGeraldoBlueUnlocked}
        />
      )}

      {/* 3. COLLECTION MODAL (FROM MAIN MENU) */}
      {screen === 'COLLECTION' && (
        <CollectionModal
          unlockedWeapons={unlockedWeapons}
          unlockedItems={unlockedItems}
          unlockedCurses={unlockedCurses}
          unlockedItemIds={unlockedItemIds}
          unlockedEnemies={unlockedEnemies}
          enemyKills={enemyKills}
          mobileMode={options.mobileMode}
          onClose={() => setScreen('MENU')}
        />
      )}

      {/* 3. ACTIVE PLAYING CANVAS */}
      {screen === 'PLAYING' && (
        <>
          <GameCanvas
            key={gameRunId}
            player={player}
            weapons={weapons}
            statItems={statItems}
            character={selectedCharacter}
            survivalTime={survivalTime}
            bossCountdown={bossCountdown}
            gameSpeed={1}
            isBossRush={isBossRush}
            bossRushQueue={bossRushQueue}
            isTrueWitchMode={isBossRush && isTrueWitchMode}
            isPaused={
              levelUpOptions !== null ||
              witchDealCurses !== null ||
              bossSelectOptions !== null ||
              gameOverStats !== null ||
              isPauseMenuOpen ||
              isDevToolsOpen ||
              isOptionsOpen ||
              isCollectionFromPause ||
              incomingBoss !== null
            }
            dashMode={options.dashMode}
            mobileMode={options.mobileMode}
            mobileAimMode={options.mobileAimMode}
            screenShakeEnabled={options.screenShake}
            damageNumbersEnabled={options.damageNumbers}
            instaKill={instaKill}
            onTogglePause={() => setIsPauseMenuOpen((prev) => !prev)}
            onUpdatePlayer={handleUpdatePlayer}
            onUpdateSurvivalTime={setSurvivalTime}
            onUpdateBossCountdown={setBossCountdown}
            onTriggerLevelUp={handleTriggerLevelUp}
            onTriggerWitchDeal={handleTriggerWitchDeal}
            onTriggerBossSelection={(bosses) => setBossSelectOptions(bosses)}
            onBossIncoming={(boss) => setIncomingBoss(boss)}
            onGameOver={handleGameOver}
            onItemUnlocked={handleItemUnlocked}
            onEnemyDefeated={(enemyId) => {
              if (!isBossRush) {
                setUnlockedEnemies((prev) => (prev.includes(enemyId) ? prev : [...prev, enemyId]));
              }
              setEnemyKills((prev) => ({
                ...prev,
                [enemyId]: (prev[enemyId] || 0) + 1,
              }));
            }}
            onBossDefeated={handleBossDefeated}
            onBossUpdate={handleBossUpdate}
          />

          {/* Top-Left Face, Red HP, Blue EXP, Timer HUD & Bottom-Left Weapons */}
          <GameHUD
            player={player}
            weapons={weapons}
            statItems={statItems}
            character={selectedCharacter}
            maxWeapons={maxWeapons}
            survivalTime={survivalTime}
            bossCountdown={bossCountdown}
            isHurt={isHurt}
            soundEnabled={options.soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenPauseMenu={() => setIsPauseMenuOpen(true)}
            boss={boss}
            isBossFight={isBossFight}
            bossTimer={bossTimer}
            mobileMode={options.mobileMode}
            mobileAimMode={options.mobileAimMode}
            instaKill={instaKill}
            isBossRush={isBossRush}
            isTrueWitchMode={isBossRush && isTrueWitchMode}
          />

          {/* Pause Menu (Esc key or pause button) */}
          {isPauseMenuOpen && !isOptionsOpen && !isDevToolsOpen && !isCollectionFromPause && (
            <PauseMenuModal
              survivalTime={survivalTime}
              weapons={weapons}
              statItems={statItems}
              maxWeapons={maxWeapons}
              isBossRush={isBossRush}
              mobileMode={options.mobileMode}
              onResume={() => setIsPauseMenuOpen(false)}
              onRestartRun={handleRestartRun}
              onOpenDevTools={() => setIsDevToolsOpen(true)}
              onOpenOptions={() => setIsOptionsOpen(true)}
              onOpenCollection={() => setIsCollectionFromPause(true)}
              onReturnToMainMenu={() => {
                setIsBossRush(false);
                setIsPauseMenuOpen(false);
                setScreen('MENU');
              }}
            />
          )}

          {/* Dev Tools Modal (from Pause Menu) */}
          {isDevToolsOpen && (
            <DevToolsModal
              currentLevel={player.level}
              survivalTime={survivalTime}
              mobileMode={options.mobileMode}
              instaKill={instaKill}
              onInstantLevelUp={handleDevInstantLevelUp}
              onSkipToMinute730={handleSkipToMinute730}
              onFightBoss={handleDevFightBoss}
              onToggleInstaKill={() => setInstaKill((prev) => !prev)}
              onOpenWeaponSelector={() => setIsWeaponSelectorOpen(true)}
              onClose={() => setIsDevToolsOpen(false)}
            />
          )}

          {/* Dev Weapon Selector Modal */}
          {isWeaponSelectorOpen && (
            <WeaponSelectorModal
              weapons={weapons}
              statItems={statItems}
              maxWeapons={maxWeapons}
              character={selectedCharacter}
              mobileMode={options.mobileMode}
              onSelect={handleSelectDevItem}
              onModifyLevel={handleModifyDevItemLevel}
              onInstantLevelUp={handleDevInstantLevelUp}
              onClose={() => setIsWeaponSelectorOpen(false)}
            />
          )}

          {/* Collection opened from Pause Menu */}
          {isCollectionFromPause && (
            <CollectionModal
              unlockedWeapons={unlockedWeapons}
              unlockedItems={unlockedItems}
              unlockedCurses={unlockedCurses}
              unlockedItemIds={unlockedItemIds}
              unlockedEnemies={unlockedEnemies}
              enemyKills={enemyKills}
              mobileMode={options.mobileMode}
              onClose={() => setIsCollectionFromPause(false)}
            />
          )}

          {/* Boss Selection Modal (Destiny Control or Dev Tools) */}
          {bossSelectOptions && (
            <BossSelectModal
              bosses={bossSelectOptions}
              mobileMode={options.mobileMode}
              isDevChoice={isDevBossSelect}
              onClose={() => {
                setBossSelectOptions(null);
                setIsDevBossSelect(false);
              }}
              onSelectBoss={(bossId) => {
                const wasDev = isDevBossSelect;
                setBossSelectOptions(null);
                setIsDevBossSelect(false);
                setBossCountdown(0);
                if (wasDev) {
                  window.dispatchEvent(new CustomEvent('spawn-boss-fight', { detail: { bossId } }));
                } else {
                  window.dispatchEvent(new CustomEvent('trigger-test-boss', { detail: { bossId } }));
                }
              }}
            />
          )}

          {/* Level Up Boon Selection Modal */}
          {levelUpOptions && (
            <LevelUpModal
              level={player.level}
              options={levelUpOptions}
              mobileMode={options.mobileMode}
              isDevLevelUp={isLevelUpFromDevTools}
              hasExtraChoices={statItems.some((s) => s.id === 'destiny_control' && s.level >= 1)}
              canReroll={Boolean(statItems.some((s) => s.id === 'destiny_control' && s.level >= 5) && !hasUsedRerollThisLevel)}
              onReroll={handleRerollLevelUpOptions}
              onSelectOption={handleSelectLevelUpOption}
            />
          )}

          {/* The Witch's Deal (Minute 10 Epoch Curse Selection) */}
          {witchDealCurses && (
            <WitchDealModal
              curses={witchDealCurses}
              mobileMode={options.mobileMode}
              onSelectCurse={handleSelectCurse}
            />
          )}

          {/* Game Over Screen */}
          {gameOverStats && (
            <GameOverModal
              stats={gameOverStats}
              isVictory={gameOverStats.isVictory}
              isBossRush={isBossRush}
              weapons={weapons}
              statItems={statItems}
              onRestart={handleRestartRun}
              onReturnToMenu={() => {
                setIsBossRush(false);
                setScreen('MENU');
              }}
            />
          )}
        </>
      )}

      {/* Boss Rush Info Modal */}
      {isBossRushModalOpen && (
        <BossRushModal
          bestTime={bestBossRushTime}
          characterBestTime={selectedCharacter ? (bossRushCharBestTimes[selectedCharacter.id] ?? null) : null}
          selectedCharacter={selectedCharacter}
          isTrueWitchUnlocked={isTrueWitchUnlocked}
          isTrueWitchMode={isTrueWitchMode}
          onToggleTrueWitchMode={(enabled) => {
            setIsTrueWitchMode(enabled);
            try {
              localStorage.setItem('witch_nights_true_witch_enabled', String(enabled));
            } catch {
              // safe ignore
            }
          }}
          onStartBossRush={(queue) => {
            setIsBossRushModalOpen(false);
            handleStartBossRush(queue);
          }}
          onOpenCharacterSelect={() => setIsBossRushCharSelectOpen(true)}
          onClose={() => setIsBossRushModalOpen(false)}
        />
      )}

      {/* Character Select Modal when opened from Boss Rush */}
      {isBossRushCharSelectOpen && (
        <CharacterSelectModal
          initialCharacter={selectedCharacter}
          actionLabel={t('confirm_character', getLanguage())}
          onStartRun={(char) => {
            setSelectedCharacter(char);
            setIsBossRushCharSelectOpen(false);
          }}
          onClose={() => setIsBossRushCharSelectOpen(false)}
          mobileMode={options.mobileMode}
          isGeraldoUnlocked={isGeraldoUnlocked}
          isGeraldoGreenUnlocked={isGeraldoGreenUnlocked}
          isGeraldoBlueUnlocked={isGeraldoBlueUnlocked}
        />
      )}

      {/* 5. OPTIONS MODAL (GLOBAL - CAN BE OPENED FROM MENU OR PAUSE) */}
      {isOptionsOpen && (
        <OptionsModal
          options={options}
          onChangeOptions={handleUpdateOptions}
          onClose={() => setIsOptionsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Boss Incoming Modal */}
      {incomingBoss && (
        <BossIncomingModal
          boss={incomingBoss}
          mobileMode={options.mobileMode}
          onStartBattle={handleStartBossBattle}
        />
      )}

      {/* 6. TUTORIAL MODAL (EXPLAINS MOVEMENT, DASH, UPGRADES, WITCH'S DEAL) */}
      {isTutorialOpen && (
        <TutorialModal onClose={() => setIsTutorialOpen(false)} />
      )}

      {/* 7. ACHIEVEMENTS MODAL */}
      {isAchievementsOpen && (
        <AchievementsModal
          completedAchievementIds={completedAchievementIds}
          onClose={() => setIsAchievementsOpen(false)}
          mobileMode={options.mobileMode}
        />
      )}

      {/* 8. TOP ACHIEVEMENT NOTIFICATION BANNER (QUEUED SEQUENTIALLY) */}
      <AchievementBanner
        notification={achievementQueue[0] || null}
        onDismiss={handleDismissAchievementNotification}
      />

      {/* FIRST-TIME LANGUAGE CHOICE MODAL */}
      {!options.language && (
        <div
          id="first-time-language-modal"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
        >
          <div
            id="first-time-language-card"
            className="w-full max-w-md bg-gradient-to-b from-[#1a1033] via-[#120a24] to-[#0a0515] border-2 border-purple-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/90 text-center flex flex-col gap-6 select-none"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-300 to-indigo-200 tracking-wide mt-2">
                Select Language / Selecionar Idioma
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
                Please choose your preferred language to begin / Escolha o seu idioma preferido para começar:
              </p>
            </div>

            <div className="flex flex-col gap-3.5 mt-2">
              <button
                id="select-lang-en-btn"
                onClick={() => {
                  handleUpdateOptions({ language: 'en' });
                  setLanguage('en');
                }}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 border border-purple-500 text-white text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2.5"
              >
                <span>English</span>
              </button>
              <button
                id="select-lang-pt-btn"
                onClick={() => {
                  handleUpdateOptions({ language: 'pt-BR' });
                  setLanguage('pt-BR');
                }}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-800 to-indigo-700 hover:from-indigo-700 hover:to-indigo-600 border border-indigo-500 text-white text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2.5"
              >
                <span>Português Brasileiro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
