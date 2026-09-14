import React, { useRef, useEffect, useCallback } from 'react';
import {
  PlayerStats,
  OwnedWeapon,
  OwnedStatItem,
  Enemy,
  Projectile,
  AreaZone,
  NovaPulse,
  ExpGem,
  WorldPickup,
  FloatingText,
  Particle,
  CurseChoice,
  DashMode,
  BossInstance,
  BossAttack,
  BossDefinition,
} from '../types/game';
import {
  ALL_WEAPONS,
  ALL_STAT_ITEMS,
  getExpNeededForLevel,
  getEnemyLevel,
  getEnemyBaseHp,
  WITCH_DEALS,
  BOSS_POOL,
} from '../data/gameData';
import { soundEngine } from '../utils/audio';

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function createVineAttack(
  canvasW: number,
  canvasH: number,
  cameraX: number,
  cameraY: number,
  playerX: number,
  playerY: number
): BossAttack {
  const minX = cameraX + 30;
  const maxX = cameraX + canvasW - 30;
  const minY = cameraY + 30;
  const maxY = cameraY + canvasH - 30;
  const arenaW = maxX - minX;
  const arenaH = maxY - minY;

  const safeRadius = 26; // Smaller safe spot radius (52px diameter) for tighter maneuvering

  // 1. Generate primary safe spot close to player (70 - 105px away) but NEVER under the player
  const safeSpots: { x: number; y: number; radius: number }[] = [];
  const primaryAngle = Math.random() * Math.PI * 2;
  const primaryDist = 70 + Math.random() * 20; // 70px to 90px away from player
  let primaryX = playerX + Math.cos(primaryAngle) * primaryDist;
  let primaryY = playerY + Math.sin(primaryAngle) * primaryDist;

  // Clamp within arena bounds
  primaryX = Math.max(minX + safeRadius + 15, Math.min(maxX - safeRadius - 15, primaryX));
  primaryY = Math.max(minY + safeRadius + 15, Math.min(maxY - safeRadius - 15, primaryY));

  safeSpots.push({ x: primaryX, y: primaryY, radius: safeRadius });

  // 2. Generate 2 additional secondary safe spots elsewhere in the arena
  for (let attempt = 0; attempt < 30 && safeSpots.length < 3; attempt++) {
    const rx = minX + safeRadius + 20 + Math.random() * (arenaW - safeRadius * 2 - 40);
    const ry = minY + safeRadius + 20 + Math.random() * (arenaH - safeRadius * 2 - 40);
    const distToPlayer = Math.hypot(rx - playerX, ry - playerY);
    const isFarFromOtherSpots = safeSpots.every((spot) => Math.hypot(spot.x - rx, spot.y - ry) >= 130);

    if (distToPlayer >= 100 && isFarFromOtherSpots) {
      safeSpots.push({ x: rx, y: ry, radius: safeRadius });
    }
  }

  // 3. Generate straight beam/vine lines at diagonal and straight angles across the arena
  const candidateLines: { x1: number; y1: number; x2: number; y2: number; width: number }[] = [];
  const vineWidth = 32;

  const anglesInDegrees = [0, 90, 45, 135, 30, 60, 120, 150];
  const shuffledAngles = [...anglesInDegrees].sort(() => Math.random() - 0.5).slice(0, 3);

  const diagSpan = Math.hypot(arenaW, arenaH) + 200;
  const centerX = minX + arenaW / 2;
  const centerY = minY + arenaH / 2;

  shuffledAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const perpX = -sin;
    const perpY = cos;

    const step = 65; // Distance between parallel beam lines
    const numBeams = Math.floor(diagSpan / step);

    for (let i = -Math.floor(numBeams / 2); i <= Math.floor(numBeams / 2); i++) {
      const offsetX = perpX * (i * step);
      const offsetY = perpY * (i * step);

      const x1 = centerX + offsetX - cos * diagSpan;
      const y1 = centerY + offsetY - sin * diagSpan;
      const x2 = centerX + offsetX + cos * diagSpan;
      const y2 = centerY + offsetY + sin * diagSpan;

      candidateLines.push({ x1, y1, x2, y2, width: vineWidth });
    }
  });

  // 4. Filter candidate lines: keep lines ONLY if they do NOT intersect any safe spot
  const safeClearance = safeRadius + vineWidth / 2 + 2;
  const filteredVines = candidateLines.filter((line) => {
    return safeSpots.every(
      (spot) => distToSegment(spot.x, spot.y, line.x1, line.y1, line.x2, line.y2) > safeClearance
    );
  });

  return {
    type: 'CARNIVORE_PLANT_VINES',
    x: playerX,
    y: playerY,
    warningTimer: 1.0, // 1.0s telegraph warning
    activeTimer: 0.40,
    duration: 1.40,
    damage: 25,
    radius: 0,
    vines: filteredVines,
    safeSpots,
    hasHit: false,
  };
}

interface GameCanvasProps {
  player: PlayerStats;
  weapons: OwnedWeapon[];
  statItems: OwnedStatItem[];
  survivalTime: number;
  gameSpeed: number;
  isPaused: boolean;
  dashMode?: DashMode;
  screenShakeEnabled?: boolean;
  damageNumbersEnabled?: boolean;
  isClickToMoveActive?: boolean;
  mobileMode?: boolean;
  instaKill?: boolean;
  onTogglePause?: () => void;
  onUpdatePlayer: (stats: Partial<PlayerStats>) => void;
  onUpdateSurvivalTime: (time: number) => void;
  onTriggerLevelUp: (extraLevels?: number) => void;
  onTriggerWitchDeal: (curses: CurseChoice[]) => void;
  onGameOver: (finalStats: { time: number; level: number; kills: number; bossesKilled: number; killerName?: string }) => void;
  onItemUnlocked: (type: 'WEAPON' | 'STAT' | 'CURSE', id: string) => void;
  onEnemyDefeated?: (enemyId: string) => void;
  onUnlockItem?: (itemId: string) => void;
  onBossUpdate?: (boss: BossInstance | null, isFight: boolean, timer: number, hp: number) => void;
  onTriggerBossSelection?: (bosses: BossDefinition[]) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  weapons,
  statItems,
  survivalTime,
  gameSpeed,
  isPaused,
  dashMode = 'MOVEMENT',
  screenShakeEnabled = true,
  damageNumbersEnabled = true,
  isClickToMoveActive = false,
  mobileMode = false,
  instaKill = false,
  onTogglePause,
  onUpdatePlayer,
  onUpdateSurvivalTime,
  onTriggerLevelUp,
  onTriggerWitchDeal,
  onGameOver,
  onItemUnlocked,
  onEnemyDefeated,
  onUnlockItem,
  onBossUpdate,
  onTriggerBossSelection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const witchImageRef = useRef<HTMLImageElement | null>(null);
  const peasantImageRef = useRef<HTMLImageElement | null>(null);
  const peasantTorchImageRef = useRef<HTMLImageElement | null>(null);
  const villageKnightImageRef = useRef<HTMLImageElement | null>(null);
  const groundTileImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://i.imgur.com/uvH316Y.png';
    img.onload = () => {
      witchImageRef.current = img;
    };
    img.onerror = () => {
      // Fallback to local asset
      const fallback = new Image();
      fallback.src = `${import.meta.env.BASE_URL}assets/aistudio/1789315841509.png`;
      fallback.onload = () => {
        witchImageRef.current = fallback;
      };
    };

    const peasantImg = new Image();
    peasantImg.src = `${import.meta.env.BASE_URL}assets/aistudio/peasant_pitchfork.png`;
    peasantImg.onload = () => {
      peasantImageRef.current = peasantImg;
    };

    const torchImg = new Image();
    torchImg.src = `${import.meta.env.BASE_URL}assets/aistudio/peasant_torch.png`;
    torchImg.onload = () => {
      peasantTorchImageRef.current = torchImg;
    };

    const knightImg = new Image();
    knightImg.src = `${import.meta.env.BASE_URL}assets/aistudio/village_knight.png`;
    knightImg.onload = () => {
      villageKnightImageRef.current = knightImg;
    };

    const groundImg = new Image();
    groundImg.src = `${import.meta.env.BASE_URL}assets/aistudio/ground_tile.png`;
    groundImg.onload = () => {
      groundTileImageRef.current = groundImg;
    };
  }, []);

  // Mutable Game State refs for high-performance 60fps loop
  const playerRef = useRef<PlayerStats>(player);
  const weaponsRef = useRef<OwnedWeapon[]>(weapons);
  const statItemsRef = useRef<OwnedStatItem[]>(statItems);
  const survivalTimeRef = useRef<number>(survivalTime);
  const isPausedRef = useRef<boolean>(isPaused);
  const gameSpeedRef = useRef<number>(gameSpeed);
  const dashModeRef = useRef<DashMode>(dashMode);
  const screenShakeEnabledRef = useRef<boolean>(screenShakeEnabled);
  const damageNumbersEnabledRef = useRef<boolean>(damageNumbersEnabled);
  const instaKillRef = useRef<boolean>(instaKill);

  useEffect(() => {
    instaKillRef.current = instaKill;
  }, [instaKill]);
  const screenShakeRef = useRef<number>(0);
  const lastMoveDirRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: -1 });

  // Entities
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const aoeZonesRef = useRef<AreaZone[]>([]);
  const novaPulsesRef = useRef<NovaPulse[]>([]);
  const expGemsRef = useRef<ExpGem[]>([]);
  const pickupsRef = useRef<WorldPickup[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dashGhostsRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const dashVxRef = useRef<number>(0);
  const dashVyRef = useRef<number>(0);

  // Input state
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseScreenRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 0
  });
  const lastBattlefieldCursorRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 0
  });
  const walkTargetRef = useRef<{ x: number; y: number } | null>(null);

  // Boss fight
  const bossInstanceRef = useRef<BossInstance | null>(null);
  const isBossFightRef = useRef<boolean>(false);
  const bossTimerRef = useRef<number>(90); // 1m 30s
  const lastBossEpochRef = useRef<number>(0);
  const bossFightDurationRef = useRef<number>(0);
  const lockedCameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bossAttackCooldownRef = useRef<number>(2.0);
  const bossAttackCountRef = useRef<number>(0);
  const bossContactCooldownRef = useRef<number>(0);
  const bossDashHitCooldownRef = useRef<number>(0);
  const bossHitFlashRef = useRef<number>(0);
  const eyePhaseRef = useRef<'CLOSED' | 'WARNING' | 'OPEN'>('CLOSED');
  const eyePhaseTimerRef = useRef<number>(3.5);
  const eyeGazeDamageAccumulatorRef = useRef<number>(0);
  const eyeTearsFiredRef = useRef<number>(0);
  const eyeOpenAttackCountRef = useRef<number>(0);
  const nightBearStateRef = useRef<'IDLE' | 'TELEGRAPH' | 'CHARGING' | 'DIZZY'>('IDLE');
  const nightBearTimerRef = useRef<number>(0);
  const nightBearChargesRef = useRef<number>(0);
  const nightBearChargeTargetRef = useRef<{ x: number; y: number } | null>(null);
  const nightBearChargeAngleRef = useRef<number>(0);
  const nightBearHasHitPlayerRef = useRef<boolean>(false);
  const lastSpawnTime = useRef<number>(999);
  const nextEntityId = useRef<number>(1);
  const dealTriggeredRef = useRef<boolean>(false);
  const killsCountRef = useRef<number>(0);
  const bossesKilledRef = useRef<number>(0);
  const orbitAngleRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const enemyTimeOffsetRef = useRef<number>(0);
  const lastReportedHpRef = useRef<number>(player.hp);
  const joystickVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync props to refs without clobbering active game position or combat HP or dash state
  useEffect(() => {
    const currentP = playerRef.current;
    if (!currentP || survivalTime === 0) {
      playerRef.current = { ...player };
      return;
    }
    const maxGain = Math.max(0, player.maxHp - currentP.maxHp);
    const updatedHp = maxGain > 0
      ? Math.min(player.maxHp, currentP.hp + maxGain)
      : Math.min(player.maxHp, currentP.hp);

    currentP.maxHp = player.maxHp;
    currentP.hp = updatedHp;
    currentP.speed = player.speed;
    currentP.pickupRadius = player.pickupRadius;
    currentP.magnetRadius = player.magnetRadius;
    currentP.damageMult = player.damageMult;
    currentP.attackSpeedMult = player.attackSpeedMult;
    currentP.knockbackMult = player.knockbackMult;
    currentP.vampirism = player.vampirism;
    currentP.projSizeMult = player.projSizeMult;
    currentP.dashCooldown = player.dashCooldown;
    currentP.hpRegen = player.hpRegen;
    currentP.dashDamage = player.dashDamage;
  }, [player, survivalTime]);

  useEffect(() => { weaponsRef.current = weapons; }, [weapons]);
  useEffect(() => { statItemsRef.current = statItems; }, [statItems]);
  const isClickToMoveActiveRef = useRef<boolean>(isClickToMoveActive);
  useEffect(() => {
    isClickToMoveActiveRef.current = isClickToMoveActive;
    if (!isClickToMoveActive) {
      walkTargetRef.current = null;
    }
  }, [isClickToMoveActive]);
  // Start Boss Fight helper
  const spawnBossFight = useCallback((forcedBossId?: string) => {
    const canvas = canvasRef.current;
    const p = playerRef.current;
    if (!canvas || !p) return;

    // Set boss epoch so boss fight does not immediately re-trigger after victory
    lastBossEpochRef.current = Math.max(lastBossEpochRef.current, Math.floor(survivalTimeRef.current / 300), 1);

    // Lock camera centered around current player position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    lockedCameraRef.current = {
      x: p.x - centerX,
      y: p.y - centerY,
    };

    // Despawn all normal enemies
    enemiesRef.current = [];
    isBossFightRef.current = true;
    bossTimerRef.current = 90; // 1m 30s countdown

    const selectedBoss = (forcedBossId ? BOSS_POOL.find((b) => b.id === forcedBossId) : null)
      || BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)];

    // Boss scales relative to current player level
    const levelMult = 1 + ((p.level - 1) * 0.12);
    const scaledMaxHp = Math.round(selectedBoss.maxHp * levelMult);

    // Boss occupies ~10% screen at the top center of the locked screen
    // Top center in world coordinates:
    const bossWorldX = lockedCameraRef.current.x + canvas.width / 2;
    const bossWorldY = lockedCameraRef.current.y + Math.max(90, canvas.height * 0.16);

    const bossInstance: BossInstance = {
      ...selectedBoss,
      hp: scaledMaxHp,
      maxHp: scaledMaxHp,
      x: bossWorldX,
      y: bossWorldY,
      attacks: [],
      eyeState: 'CLOSED',
      eyeTimer: 3.5,
    };

    bossInstanceRef.current = bossInstance;
    bossAttackCooldownRef.current = 2.0;
    bossAttackCountRef.current = 0;
    bossHitFlashRef.current = 0;
    eyePhaseRef.current = 'CLOSED';
    eyePhaseTimerRef.current = 3.5;
    eyeGazeDamageAccumulatorRef.current = 0;
    eyeTearsFiredRef.current = 0;

    if (onBossUpdate) {
      onBossUpdate(bossInstance, true, 90, scaledMaxHp);
    }
  }, [onBossUpdate]);

  useEffect(() => {
    survivalTimeRef.current = survivalTime;
    // Explicitly wipe all active entities when restarting run (survivalTime resets to 0)
    if (survivalTime === 0) {
      enemiesRef.current = [];
      projectilesRef.current = [];
      aoeZonesRef.current = [];
      novaPulsesRef.current = [];
      expGemsRef.current = [];
      pickupsRef.current = [];
      floatingTextsRef.current = [];
      particlesRef.current = [];
      dashGhostsRef.current = [];
      killsCountRef.current = 0;
      bossesKilledRef.current = 0;
      dealTriggeredRef.current = false;
      walkTargetRef.current = null;
      lastBossEpochRef.current = 0;
      bossFightDurationRef.current = 0;
      isBossFightRef.current = false;
      bossInstanceRef.current = null;
      bossTimerRef.current = 90;
      bossContactCooldownRef.current = 0;
      bossDashHitCooldownRef.current = 0;
      eyeOpenAttackCountRef.current = 0;
      eyeTearsFiredRef.current = 0;
      lastSpawnTime.current = 999;
      nextEntityId.current = 1;
      enemyTimeOffsetRef.current = 0;
      lastReportedHpRef.current = player.hp;
      if (onBossUpdate) {
        onBossUpdate(null, false, 0, 0);
      }
    }
  }, [survivalTime, player.hp, onBossUpdate]);

  // Listener for instant boss and deal test buttons
  useEffect(() => {
    const handleTriggerTestBoss = (e?: Event) => {
      const customEvent = e as CustomEvent<{ bossId?: string }>;
      const bossId = customEvent?.detail?.bossId;
      lastBossEpochRef.current = Math.max(1, Math.floor(survivalTimeRef.current / 300));
      spawnBossFight(bossId);
    };
    const handleTriggerTestDeal = () => {
      dealTriggeredRef.current = true;
    };
    const handleDevInstantLevelUp = () => {
      const p = playerRef.current;
      if (p) {
        p.level += 1;
        p.exp = 0;
        p.expToNextLevel = getExpNeededForLevel(p.level);
        onUpdatePlayer({ exp: p.exp, level: p.level, expToNextLevel: p.expToNextLevel });
        soundEngine.playLevelUp();
      }
    };
    window.addEventListener('trigger-test-boss', handleTriggerTestBoss);
    window.addEventListener('trigger-test-deal', handleTriggerTestDeal);
    window.addEventListener('dev-instant-level-up', handleDevInstantLevelUp);
    return () => {
      window.removeEventListener('trigger-test-boss', handleTriggerTestBoss);
      window.removeEventListener('trigger-test-deal', handleTriggerTestDeal);
      window.removeEventListener('dev-instant-level-up', handleDevInstantLevelUp);
    };
  }, [spawnBossFight, onUpdatePlayer]);

  // Handle Déjà-Vu Curse: Reset enemies back to level 1
  useEffect(() => {
    const handleResetEnemies = () => {
      enemyTimeOffsetRef.current = survivalTimeRef.current;
      enemiesRef.current.forEach((enemy) => {
        enemy.level = 1;
        const baseHp = getEnemyBaseHp(1);
        enemy.maxHp = enemy.isRed ? Math.round(baseHp * 2.5) : baseHp;
        enemy.hp = Math.min(enemy.hp, enemy.maxHp);
        enemy.damage = enemy.isRed ? 25 : 10;
      });
      const p = playerRef.current;
      if (p) {
        p.level = 1;
        p.exp = 0;
        p.expToNextLevel = getExpNeededForLevel(1);
        p.expMultiplier = (p.expMultiplier || 1.0) * 3.0;
      }
    };
    window.addEventListener('reset-enemy-levels', handleResetEnemies);
    return () => window.removeEventListener('reset-enemy-levels', handleResetEnemies);
  }, []);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);
  useEffect(() => { dashModeRef.current = dashMode; }, [dashMode]);
  useEffect(() => { screenShakeEnabledRef.current = screenShakeEnabled; }, [screenShakeEnabled]);
  useEffect(() => { damageNumbersEnabledRef.current = damageNumbersEnabled; }, [damageNumbersEnabled]);
  const mobileModeRef = useRef<boolean>(mobileMode);
  useEffect(() => { mobileModeRef.current = mobileMode; }, [mobileMode]);

  // Dash Action: Dash in movement direction (default), joystick vector, or toward cursor
  const triggerDash = useCallback(() => {
    const p = playerRef.current;
    if (p.dashTimer > 0 || p.isDashing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let dx = 0;
    let dy = 0;

    const cameraX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
    const cameraY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;
    const playerScreenX = p.x - cameraX;
    const playerScreenY = p.y - cameraY;

    const joyX = joystickVectorRef.current.x;
    const joyY = joystickVectorRef.current.y;
    const joyDist = Math.hypot(joyX, joyY);

    const keys = keysRef.current;
    let kx = 0;
    let ky = 0;
    if (keys['w'] || keys['arrowup']) ky -= 1;
    if (keys['s'] || keys['arrowdown']) ky += 1;
    if (keys['a'] || keys['arrowleft']) kx -= 1;
    if (keys['d'] || keys['arrowright']) kx += 1;
    const keyDist = Math.hypot(kx, ky);

    if (joyDist > 0.08) {
      // 1. Active Virtual Joystick vector
      dx = joyX;
      dy = joyY;
    } else if (keyDist > 0) {
      // 2. Active WASD / Arrow keys vector
      dx = kx;
      dy = ky;
    } else if (mobileModeRef.current) {
      // 3. Mobile mode: prioritize walk target or last movement direction over HUD button tap location
      if (walkTargetRef.current) {
        dx = walkTargetRef.current.x - p.x;
        dy = walkTargetRef.current.y - p.y;
      } else if (Math.hypot(lastMoveDirRef.current.dx, lastMoveDirRef.current.dy) > 0) {
        dx = lastMoveDirRef.current.dx;
        dy = lastMoveDirRef.current.dy;
      } else {
        dx = 0;
        dy = -1;
      }
    } else if (dashModeRef.current === 'CURSOR') {
      // 4. Desktop cursor aiming
      const mouseX = mouseScreenRef.current.x;
      const mouseY = mouseScreenRef.current.y;
      dx = mouseX - playerScreenX;
      dy = mouseY - playerScreenY;
    } else if (walkTargetRef.current) {
      // 5. Active click-to-walk target
      dx = walkTargetRef.current.x - p.x;
      dy = walkTargetRef.current.y - p.y;
    } else if (Math.hypot(lastMoveDirRef.current.dx, lastMoveDirRef.current.dy) > 0) {
      // 6. Last active movement direction
      dx = lastMoveDirRef.current.dx;
      dy = lastMoveDirRef.current.dy;
    } else {
      // 7. Default fallback direction (dash up)
      dx = 0;
      dy = -1;
    }

    // End any active Mobile Movement walk immediately so the player stops once Dash ends
    walkTargetRef.current = null;

    let dist = Math.hypot(dx, dy);
    if (dist < 0.001) {
      dx = 0;
      dy = -1;
      dist = 1;
    }

    const dashSpeed = 1250;
    const vx = (dx / dist) * dashSpeed;
    const vy = (dy / dist) * dashSpeed;
    dashVxRef.current = vx;
    dashVyRef.current = vy;

    p.isDashing = true;
    p.dashDuration = 0.14;
    p.dashTimer = p.dashCooldown;

    soundEngine.playDash();

    // Spawn dash burst particles
    for (let i = 0; i < 18; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pSpeed = Math.random() * 160 + 60;
      particlesRef.current.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(pAngle) * pSpeed - vx * 0.25,
        vy: Math.sin(pAngle) * pSpeed - vy * 0.25,
        size: Math.random() * 4 + 2,
        color: '#c084fc',
        alpha: 1,
        decay: Math.random() * 2 + 3,
      });
    }

    onUpdatePlayer({ dashTimer: p.dashCooldown, isDashing: true });
  }, [onUpdatePlayer]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onTogglePause) {
          onTogglePause();
        }
        return;
      }

      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        walkTargetRef.current = null;
      }

      // Shift key triggers Dash
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        triggerDash();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    const updateCursorPos = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      mouseScreenRef.current = { x: sx, y: sy };
      // If cursor is within the main canvas area, update battlefield cursor target
      if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
        lastBattlefieldCursorRef.current = { x: sx, y: sy };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPos(e.clientX, e.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      updateCursorPos(e.clientX, e.clientY);

      if (!isClickToMoveActiveRef.current || isPausedRef.current) return;
      const targetElement = e.target as HTMLElement | null;
      if (targetElement && targetElement !== canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const p = playerRef.current;
      if (!canvas || !p) return;

      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const activeCamX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
      const activeCamY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;

      const targetWorldX = activeCamX + sx;
      const targetWorldY = activeCamY + sy;
      walkTargetRef.current = { x: targetWorldX, y: targetWorldY };

      // Spawn arrival target sparkle runes
      for (let i = 0; i < 8; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = Math.random() * 50 + 20;
        particlesRef.current.push({
          x: targetWorldX,
          y: targetWorldY,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          size: Math.random() * 3 + 2,
          color: '#34d399',
          alpha: 0.9,
          decay: 3.2,
        });
      }
    };

    const handleTriggerDashEvent = () => {
      triggerDash();
    };

    const handleTriggerWalkToCursor = () => {
      const canvas = canvasRef.current;
      const p = playerRef.current;
      if (!canvas || !p) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const activeCamX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
      const activeCamY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;

      const targetWorldX = activeCamX + lastBattlefieldCursorRef.current.x;
      const targetWorldY = activeCamY + lastBattlefieldCursorRef.current.y;
      walkTargetRef.current = { x: targetWorldX, y: targetWorldY };

      // Spawn arrival target sparkle runes
      for (let i = 0; i < 8; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = Math.random() * 50 + 20;
        particlesRef.current.push({
          x: targetWorldX,
          y: targetWorldY,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          size: Math.random() * 3 + 2,
          color: '#34d399',
          alpha: 0.9,
          decay: 3.2,
        });
      }
    };

    const handleJoystickMove = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      if (customEvent.detail) {
        joystickVectorRef.current = customEvent.detail;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('trigger-dash', handleTriggerDashEvent);
    window.addEventListener('trigger-walk-to-cursor', handleTriggerWalkToCursor);
    window.addEventListener('joystick-move', handleJoystickMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('trigger-dash', handleTriggerDashEvent);
      window.removeEventListener('trigger-walk-to-cursor', handleTriggerWalkToCursor);
      window.removeEventListener('joystick-move', handleJoystickMove);
    };
  }, [triggerDash]);

  // Spawn Enemy scaling calibrated for pacing
  const spawnEnemyWave = (dt: number, width: number, height: number) => {
    // No regular enemies spawn during active boss fight
    if (isBossFightRef.current) return;

    const rawTime = survivalTimeRef.current;
    const curTime = Math.max(0, rawTime - enemyTimeOffsetRef.current - bossFightDurationRef.current);
    const minutes = curTime / 60;
    lastSpawnTime.current += dt;

    // Enemy Level: mirrors player progression (scales faster at start, slowing down later)
    const enemyLevel = getEnemyLevel(curTime);

    // Spawn rate accelerates with survival time for increasing difficulty
    const spawnInterval = Math.max(0.18, 1.75 - minutes * 0.08);

    if (lastSpawnTime.current >= spawnInterval) {
      lastSpawnTime.current = 0;

      // Spawn initial pack of 3 enemies right from second 0 so there is no awkward pause at start of run
      const isInitialWave = curTime < 1.5 && enemiesRef.current.length < 3;
      const countToSpawn = isInitialWave ? 3 : 1;

      for (let sIdx = 0; sIdx < countToSpawn; sIdx++) {
        // Spawn off-screen distance from witch
        const p = playerRef.current;
        const angle = isInitialWave
          ? (sIdx * (Math.PI * 2 / 3)) + Math.random() * 0.4
          : Math.random() * Math.PI * 2;
        const spawnRadius = Math.max(width, height) * 0.60 + Math.random() * 60;
        const ex = p.x + Math.cos(angle) * spawnRadius;
        const ey = p.y + Math.sin(angle) * spawnRadius;

        // Enemy Base HP: doubles at level 2, with rate of increase slowing down subsequently
        const baseHp = getEnemyBaseHp(enemyLevel);

        // Enemy speed scales with time to steadily increase combat pressure
        const baseSpeed = Math.random() * 16 + 48 + Math.min(80, (enemyLevel - 1) * 2.2);
        let speed = baseSpeed;
        const expVal = Math.max(1, Math.round(1 + (enemyLevel - 1) * 0.25));

        // Enemy Archetypes
        const roll = Math.random();
        let type: Enemy['type'] = 'WRAITH';
        let color = '#38bdf8';
        let radius = 13;
        let hp = baseHp; // Base 20 HP
        let name = 'Torch Peasant';
        let damage = 10; // Base enemy deals 10 damage
        let isRed = false;
        speed = baseSpeed * 1.0; // Base 1x speed

        // Red Enemy (Village Knight): Healthier elite enemy, deals 25 damage, drops high-value Red EXP Orb!
        // Rare elite spawn rate calibrated so player reaches level 5 around minute ~5 instead of minute 2
        const isRedTimeEligible = curTime >= 80;
        const redSpawnChance = curTime >= 300 ? 0.82 : curTime >= 180 ? 0.88 : 0.93;
        if (isRedTimeEligible && roll > redSpawnChance) {
          type = 'GHOUL';
          color = '#ef4444'; // Distinct crimson red
          radius = 16;
          hp = baseHp * 1.5; // 30 HP if base is 20
          name = 'Village Knight';
          speed = baseSpeed * 0.75;
          damage = 25; // 25 damage for Red enemy
          isRed = true;
        } else if (Math.random() > 0.5) {
          type = 'BAT';
          color = '#a855f7';
          radius = 13;
          hp = Math.round(baseHp * 1.2); // 24 HP if base is 20
          name = 'Pitchfork Peasant';
          speed = baseSpeed * 1.15; // 1.15x speed
          damage = 12;
          isRed = false;
        }

        enemiesRef.current.push({
          id: nextEntityId.current++,
          x: ex,
          y: ey,
          hp,
          maxHp: hp,
          level: enemyLevel,
          speed,
          radius,
          damage,
          exp: expVal,
          color,
          name,
          type,
          vx: 0,
          vy: 0,
          hitFlashTimer: 0,
          attackCooldown: 0,
          isRed,
          facingDir: (p.x - ex) < 0 ? -1 : 1,
        });
      }
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rawDt = Math.min(0.1, (timestamp - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = timestamp;

      // Handle pause
      if (isPausedRef.current) {
        return;
      }

      // Simulation speed multiplier
      const dt = rawDt * gameSpeedRef.current;
      const p = playerRef.current;

      // Arena Wall Bounds for clamping movement during boss fight
      const minX = isBossFightRef.current ? lockedCameraRef.current.x + 24 : -Infinity;
      const maxX = isBossFightRef.current ? lockedCameraRef.current.x + canvas.width - 24 : Infinity;
      const minY = isBossFightRef.current ? lockedCameraRef.current.y + 24 : -Infinity;
      const maxY = isBossFightRef.current ? lockedCameraRef.current.y + canvas.height - 24 : Infinity;

      const triggerDashEndAoE = () => {
        if (p.dashDamage > 0) {
          const aoeRadius = 100;
          const kbForce = p.dashDamage * 8; // Powerful final blast

          // Visual Shred Burst
          for (let k = 0; k < 20; k++) {
            const pAng = Math.random() * Math.PI * 2;
            const pSpd = Math.random() * 180 + 60;
            particlesRef.current.push({
              x: p.x,
              y: p.y,
              vx: Math.cos(pAng) * pSpd,
              vy: Math.sin(pAng) * pSpd,
              size: Math.random() * 4 + 2,
              color: '#ea580c', // Artifact Orange
              alpha: 1,
              decay: 3.2,
            });
          }

          // Knockback nearby enemies
          enemiesRef.current.forEach((enemy) => {
            const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
            if (dist < aoeRadius) {
              const ang = Math.atan2(enemy.y - p.y, enemy.x - p.x);
              enemy.x += Math.cos(ang) * kbForce;
              enemy.y += Math.sin(ang) * kbForce;
              // Visual hit flash
              enemy.hp -= 1; // Minimal damage to trigger flinch
            }
          });
        }
      };

      // Increment Survival Timer
      survivalTimeRef.current += dt;
      onUpdateSurvivalTime(survivalTimeRef.current);

      // Boss Fight Trigger (Spawn every 5 mins = 300s, 600s, etc.)
      const currentBossEpoch = Math.floor(survivalTimeRef.current / 300);
      if (currentBossEpoch > 0 && currentBossEpoch > lastBossEpochRef.current && !isBossFightRef.current) {
        lastBossEpochRef.current = currentBossEpoch;
        const destinyControlItem = statItemsRef.current.find((s) => s.id === 'destiny_control');
        if (destinyControlItem && onTriggerBossSelection) {
          const count = destinyControlItem.level === 1 ? 2 : 3;
          const shuffled = [...BOSS_POOL].sort(() => 0.5 - Math.random());
          const selection = shuffled.slice(0, count);
          onTriggerBossSelection(selection);
        } else {
          spawnBossFight();
        }
      }

      // Boss Fight Logic
      if (isBossFightRef.current && bossInstanceRef.current) {
        const boss = bossInstanceRef.current;
        bossTimerRef.current -= dt;
        bossFightDurationRef.current += dt;

        if (bossHitFlashRef.current > 0) {
          bossHitFlashRef.current -= dt;
        }

        if (boss.vineRootedDuration && boss.vineRootedDuration > 0) {
          boss.vineRootedDuration -= dt;
        }

        if (onBossUpdate) {
          onBossUpdate(boss, true, bossTimerRef.current, boss.hp);
        }

        // Instant Death Condition if 1m 30s timer runs out
        if (bossTimerRef.current <= 0 || playerRef.current.hp <= 0) {
          if (playerRef.current.hp > 0) {
            playerRef.current.hp = 0;
            onUpdatePlayer({ hp: 0 });
          }
          onGameOver({
            time: survivalTimeRef.current,
            level: playerRef.current.level,
            kills: killsCountRef.current,
            bossesKilled: bossesKilledRef.current,
          });
          return;
        }

        // Carnivore Plant Attack Pattern (3 Vine attacks -> 1 Chomp attack -> Repeat)
        if (boss.id === 'carnivore_plant') {
          bossAttackCooldownRef.current -= dt;
          if (bossAttackCooldownRef.current <= 0) {
            const attackCycle = bossAttackCountRef.current % 4;
            bossAttackCountRef.current++;

            if (attackCycle < 3) {
              // Vine Attack (1, 2, 3 of 4)
              if (attackCycle === 2) {
                // Larger delay after the 3rd attack so the player's Dash (3s base cooldown) is guaranteed to be ready before the Chomp Attack
                bossAttackCooldownRef.current = 4.2 + Math.random() * 0.4;
              } else {
                // Spawns rapidly one after the other (approx 1.4s to 1.7s delay)
                bossAttackCooldownRef.current = 1.4 + Math.random() * 0.3;
              }
              const vineAtk = createVineAttack(
                canvas.width,
                canvas.height,
                lockedCameraRef.current.x,
                lockedCameraRef.current.y,
                playerRef.current.x,
                playerRef.current.y
              );
              boss.attacks.push(vineAtk);
            } else {
              // Chomp Attack (4 of 4)
              bossAttackCooldownRef.current = 3.0 + Math.random() * 0.4;
              boss.attacks.push({
                type: 'CARNIVORE_PLANT_AOE',
                x: playerRef.current.x,
                y: playerRef.current.y,
                warningTimer: 0.85, // Increased by 0.2s for a safer telegraph reaction
                activeTimer: 0.35,
                duration: 1.20, // Sum of warningTimer + activeTimer (0.85 + 0.35)
                damage: 25, // 25 heavy damage
                radius: 155,
                hasHit: false,
              });
            }
          }
        } else if (boss.id === 'haunted_eye') {
          // Haunted Eye State Machine (CLOSED -> WARNING -> OPEN -> CLOSED)
          eyePhaseTimerRef.current -= dt;
          boss.eyeState = eyePhaseRef.current;
          boss.eyeTimer = eyePhaseTimerRef.current;

          if (eyePhaseRef.current === 'CLOSED') {
            // Weep slow homing tears (about 4 total per closed phase) spaced 1s apart
            if (eyeTearsFiredRef.current < 4) {
              bossAttackCooldownRef.current -= dt;
              if (bossAttackCooldownRef.current <= 0) {
                bossAttackCooldownRef.current = 1.0;
                eyeTearsFiredRef.current++;
                const rx = boss.widthRadius || 155;
                const ry = boss.heightRadius || 55;
                const tearX = boss.x + (Math.random() - 0.5) * (rx * 1.4);
                const tearY = boss.y + ry * 0.4;
                boss.attacks.push({
                  type: 'HAUNTED_EYE_TEAR',
                  x: tearX,
                  y: tearY,
                  vx: (Math.random() - 0.5) * 20,
                  vy: 65 + Math.random() * 20,
                  warningTimer: 0,
                  activeTimer: 4.5,
                  duration: 4.5,
                  damage: 10,
                  radius: 9,
                  hasHit: false,
                });
              }
            }

            if (eyePhaseTimerRef.current <= 0) {
              eyePhaseRef.current = 'WARNING';
              eyePhaseTimerRef.current = 1.0; // 1.0s opening warning before gaze curse
              soundEngine.playShoot('wisp');
            }
          } else if (eyePhaseRef.current === 'WARNING') {
            if (Math.random() < 0.35) {
              particlesRef.current.push({
                x: boss.x + (Math.random() - 0.5) * 100,
                y: boss.y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 35,
                vy: -Math.random() * 45,
                size: 3,
                color: '#e11d48',
                alpha: 0.9,
                decay: 2.0,
              });
            }
            if (eyePhaseTimerRef.current <= 0) {
              eyePhaseRef.current = 'OPEN';
              eyeOpenAttackCountRef.current++;
              soundEngine.playHit();
              
              // Spawn 3 Mini Eyes from the bottom of the arena (left, center, right)
              const activeCamX = lockedCameraRef.current.x;
              const activeCamY = lockedCameraRef.current.y;
              const spawnY = activeCamY + canvas.height + 60;
              const playerLevel = playerRef.current.level;
              
              for (let i = 0; i < 3; i++) {
                const spawnX = activeCamX + (canvas.width / 4) * (i + 1);
                enemiesRef.current.push({
                  id: nextEntityId.current++,
                  x: spawnX,
                  y: spawnY,
                  hp: 1,
                  maxHp: 1,
                  level: playerLevel,
                  speed: 120, // 2x base speed (~60 base * 2)
                  radius: 9,
                  damage: 15,
                  exp: 0,
                  color: '#dc2626',
                  name: 'Mini Eye',
                  type: 'MINI_EYE',
                  vx: 0,
                  vy: 0,
                  hitFlashTimer: 0,
                  attackCooldown: 0,
                });
              }

              if (screenShakeEnabledRef.current) {
                screenShakeRef.current = 8;
              }
              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x,
                y: boss.y - (boss.heightRadius || boss.radius) - 24,
                text: '👁️ EYE OPEN! DEFEAT MINI EYES TO CLOSE IT!',
                color: '#ff2222',
                life: 2.2,
                maxLife: 2.2,
                vy: -20,
              });
            }
          } else if (eyePhaseRef.current === 'OPEN') {
            const activeCamX = lockedCameraRef.current.x;
            const activeCamY = lockedCameraRef.current.y;
            const mouseWorldX = activeCamX + mouseScreenRef.current.x;
            const mouseWorldY = activeCamY + mouseScreenRef.current.y;

            // Player MUST keep cursor away from the Boss (cursor.y > witch.y, aiming downwards)
            // If mouseWorldY <= player.y (towards the Boss / above the Witch), take 20 DPS!
            const isCursorForbidden = mouseWorldY <= playerRef.current.y;

            if (isCursorForbidden) {
              // Deal 20 DPS to the player while cursor is NOT away from the Boss
              const dps = 20;
              const dmgThisFrame = dps * dt;
              playerRef.current.hp = Math.max(0, playerRef.current.hp - dmgThisFrame);
              onUpdatePlayer({ hp: playerRef.current.hp });

              eyeGazeDamageAccumulatorRef.current += dmgThisFrame;
              if (eyeGazeDamageAccumulatorRef.current >= 2.0) {
                eyeGazeDamageAccumulatorRef.current = 0;
                soundEngine.playHit();
                floatingTextsRef.current.push({
                  id: nextEntityId.current++,
                  x: playerRef.current.x,
                  y: playerRef.current.y - 25,
                  text: '-20 DPS (LOOK AWAY FROM BOSS!)',
                  color: '#ef4444',
                  life: 0.6,
                  maxLife: 0.6,
                  vy: -35,
                });
              }

              if (Math.random() < 0.6) {
                particlesRef.current.push({
                  x: mouseWorldX + (Math.random() - 0.5) * 16,
                  y: mouseWorldY + (Math.random() - 0.5) * 16,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  size: Math.random() * 4 + 2,
                  color: '#ef4444',
                  alpha: 0.9,
                  decay: 2.5,
                });
                particlesRef.current.push({
                  x: playerRef.current.x + (Math.random() - 0.5) * 16,
                  y: playerRef.current.y + (Math.random() - 0.5) * 16,
                  vx: (Math.random() - 0.5) * 35,
                  vy: -Math.random() * 35,
                  size: Math.random() * 3 + 2,
                  color: '#f87171',
                  alpha: 0.9,
                  decay: 2.2,
                });
              }
            }

            // Note: The Eye doesn't shoot lasers when open anymore.
            // Requirement: Only when player defeats all 4 Mini Eyes that the Eye closes itself again
            const miniEyeCount = enemiesRef.current.filter(e => e.type === 'MINI_EYE').length;

            if (miniEyeCount === 0) {
              eyePhaseRef.current = 'CLOSED';
              // Adjusted duration so all 4 Blood Tears (fired over 3s, lasting 4.5s) despawn exactly as next attack warns
              eyePhaseTimerRef.current = 7.0 + Math.random() * 1.5;
              bossAttackCooldownRef.current = 0.5;
              eyeTearsFiredRef.current = 0;
            }
          }
        } else if (boss.id === 'night_bear') {
          if (nightBearStateRef.current === 'IDLE') {
            bossAttackCooldownRef.current -= dt;
            if (bossAttackCooldownRef.current <= 0) {
              nightBearStateRef.current = 'TELEGRAPH';
              nightBearTimerRef.current = 0.6;
              nightBearChargeTargetRef.current = { x: p.x, y: p.y };
              nightBearChargeAngleRef.current = Math.atan2(p.y - boss.y, p.x - boss.x);
              soundEngine.playShoot('wisp');
            }
          } else if (nightBearStateRef.current === 'TELEGRAPH') {
            nightBearTimerRef.current -= dt;
            if (nightBearTimerRef.current <= 0) {
              nightBearStateRef.current = 'CHARGING';
              nightBearHasHitPlayerRef.current = false;
              soundEngine.playHit();
            }
          } else if (nightBearStateRef.current === 'CHARGING') {
            const chargeSpeed = 650;
            boss.x += Math.cos(nightBearChargeAngleRef.current) * chargeSpeed * dt;
            boss.y += Math.sin(nightBearChargeAngleRef.current) * chargeSpeed * dt;

            // Wall check
            const hitWallX = boss.x <= minX + boss.radius || boss.x >= maxX - boss.radius;
            const hitWallY = boss.y <= minY + boss.radius || boss.y >= maxY - boss.radius;

            if (hitWallX || hitWallY) {
              // Clamp to walls
              boss.x = Math.max(minX + boss.radius, Math.min(maxX - boss.radius, boss.x));
              boss.y = Math.max(minY + boss.radius, Math.min(maxY - boss.radius, boss.y));

              nightBearChargesRef.current++;
              if (screenShakeEnabledRef.current) screenShakeRef.current = 10;
              
              if (nightBearChargesRef.current < 3) {
                nightBearStateRef.current = 'TELEGRAPH';
                nightBearTimerRef.current = 0.6;
                nightBearChargeTargetRef.current = { x: p.x, y: p.y };
                nightBearChargeAngleRef.current = Math.atan2(p.y - boss.y, p.x - boss.x);
              } else {
                nightBearStateRef.current = 'DIZZY';
                nightBearTimerRef.current = 3.0;
                nightBearChargesRef.current = 0;
              }
            }

            // Charge damage to player
            if (!nightBearHasHitPlayerRef.current) {
              const distToP = Math.hypot(p.x - boss.x, p.y - boss.y);
              if (distToP < p.radius + boss.radius) {
                nightBearHasHitPlayerRef.current = true;
                const chargeDmg = boss.damage;
                p.hp = Math.max(0, p.hp - chargeDmg);
                lastReportedHpRef.current = p.hp;
                onUpdatePlayer({ hp: p.hp });
                soundEngine.playPlayerHurt();
                
                // Set contact cooldown to avoid double-hitting with general boss contact logic
                bossContactCooldownRef.current = 0.55;

                if (screenShakeEnabledRef.current) screenShakeRef.current = 12;

                floatingTextsRef.current.push({
                  id: nextEntityId.current++,
                  x: p.x,
                  y: p.y - 20,
                  text: `-${chargeDmg}`,
                  color: '#ef4444',
                  life: 0,
                  maxLife: 0.8,
                  vy: -40,
                });

                // Knockback
                const kAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
                const kDist = 120;
                p.x = Math.max(minX, Math.min(maxX, p.x + Math.cos(kAngle) * kDist));
                p.y = Math.max(minY, Math.min(maxY, p.y + Math.sin(kAngle) * kDist));
              }
            }
          } else if (nightBearStateRef.current === 'DIZZY') {
            nightBearTimerRef.current -= dt;
            if (nightBearTimerRef.current <= 0) {
              nightBearStateRef.current = 'IDLE';
              bossAttackCooldownRef.current = 1.0;
            }
          }
        }

        // Update active boss attacks
        boss.attacks = boss.attacks.filter((a) => a.duration > 0 && !a.hasHit);
        boss.attacks.forEach((a) => {
          a.duration -= dt;
          if (a.warningTimer > 0) {
            a.warningTimer -= dt;
          } else if (a.activeTimer > 0) {
            a.activeTimer -= dt;
            if (!a.hasHit) {
              let isPlayerHit = false;

              if (a.type === 'CARNIVORE_PLANT_VINES' && a.vines) {
                for (const v of a.vines) {
                  const d = distToSegment(
                    playerRef.current.x,
                    playerRef.current.y,
                    v.x1,
                    v.y1,
                    v.x2,
                    v.y2
                  );
                  if (d <= v.width / 2 + playerRef.current.radius) {
                    isPlayerHit = true;
                    break;
                  }
                }
              } else if (a.type === 'CARNIVORE_PLANT_AOE') {
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'HAUNTED_EYE_PROJECTILE') {
                a.x += (a.vx || 0) * dt;
                a.y += (a.vy || 0) * dt;
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'HAUNTED_EYE_TEAR') {
                // Homing physics: tears fall down and steer towards player slowly
                // Limited turn rate and speed so moving dodges it with a close call
                const currentVx = a.vx || 0;
                const currentVy = a.vy || 60;
                const currentAngle = Math.atan2(currentVy, currentVx);
                const targetAngle = Math.atan2(playerRef.current.y - a.y, playerRef.current.x - a.x);

                let angleDiff = targetAngle - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                const maxTurn = 1.35 * dt;
                const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
                const newAngle = currentAngle + turn;
                const tearSpeed = 100;

                a.vx = Math.cos(newAngle) * tearSpeed;
                a.vy = Math.sin(newAngle) * tearSpeed;
                a.x += a.vx * dt;
                a.y += a.vy * dt;

                // Blood tear droplets
                if (Math.random() < 0.35) {
                  particlesRef.current.push({
                    x: a.x + (Math.random() - 0.5) * 4,
                    y: a.y + (Math.random() - 0.5) * 4,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    size: 2.5,
                    color: '#f43f5e',
                    alpha: 0.7,
                    decay: 2.8,
                  });
                }

                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              }

              if (isPlayerHit) {
                if (playerRef.current.isDashing) {
                  // Successfully evaded with Dash!
                  a.hasHit = true;
                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: playerRef.current.x,
                    y: playerRef.current.y - 22,
                    text: 'DODGE!',
                    color: '#38bdf8',
                    life: 0.65,
                    maxLife: 0.65,
                    vy: -45,
                  });
                } else {
                  // Direct hit: 25 heavy damage
                  a.hasHit = true;
                  const heavyDamage = a.damage;
                  playerRef.current.hp = Math.max(0, playerRef.current.hp - heavyDamage);
                  soundEngine.playHit();
                  if (screenShakeEnabledRef.current) {
                    screenShakeRef.current = 14;
                  }
                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: playerRef.current.x,
                    y: playerRef.current.y - 20,
                    text: `-${heavyDamage}`,
                    color: '#ef4444',
                    life: 0.85,
                    maxLife: 0.85,
                    vy: -50,
                  });
                  // Spurt thorns/blood burst particles
                  for (let p = 0; p < 14; p++) {
                    const pAng = Math.random() * Math.PI * 2;
                    const pSpd = Math.random() * 140 + 35;
                    particlesRef.current.push({
                      x: playerRef.current.x,
                      y: playerRef.current.y,
                      vx: Math.cos(pAng) * pSpd,
                      vy: Math.sin(pAng) * pSpd,
                      size: Math.random() * 4 + 2.5,
                      color: p % 2 === 0 ? '#ef4444' : '#10b981',
                      alpha: 1,
                      decay: 2.2,
                    });
                  }
                  onUpdatePlayer({ hp: playerRef.current.hp });
                }
              }
            }
          }
        });

        // Boss defeat check
        if (boss.hp <= 0) {
          soundEngine.playLevelUp();
          if (onEnemyDefeated) {
            onEnemyDefeated(boss.id);
          }
          // Boss drops 1 Yellow Orb (75 EXP) and 1 25HP healing food
          expGemsRef.current.push({
            id: nextEntityId.current++,
            x: boss.x,
            y: boss.y,
            value: 75,
            color: '#eab308',
            radius: 9.5,
          });

          // Always drop 25HP healing food with the yellow orb
          pickupsRef.current.push({
            id: nextEntityId.current++,
            type: 'FOOD',
            x: boss.x + 20,
            y: boss.y + 10,
            healAmount: 25,
            radius: 12,
          });

          // Massive celebration spark burst
          for (let k = 0; k < 45; k++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 180 + 40;
            particlesRef.current.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(pAngle) * pSpeed,
              vy: Math.sin(pAngle) * pSpeed,
              size: Math.random() * 5 + 3,
              color: k % 3 === 0 ? '#ef4444' : k % 3 === 1 ? '#a855f7' : '#fbbf24',
              alpha: 1,
              decay: 1.8,
            });
          }

          killsCountRef.current += 1;
          bossesKilledRef.current += 1;
          if (boss.lastHitBy) {
            const weapon = weaponsRef.current.find(w => w.id === boss.lastHitBy);
            if (weapon) {
              weapon.kills = (weapon.kills || 0) + 1;
            }
          }
          isBossFightRef.current = false;
          bossInstanceRef.current = null;
          lastBossEpochRef.current = Math.max(lastBossEpochRef.current, Math.floor(survivalTimeRef.current / 300), 1);
          if (onBossUpdate) {
            onBossUpdate(null, false, 0, 0);
          }
          if (onUnlockItem) {
            if (boss.id === 'carnivore_plant') {
              onUnlockItem('vine_snare');
            } else if (boss.id === 'haunted_eye') {
              onUnlockItem('medusas_eye');
            } else if (boss.id === 'night_bear') {
              onUnlockItem('nightbears_claws');
            }
          }
        }
      }

      // Check Minute 7:30 Epoch: The Witch's Deal (450 seconds)
      if (survivalTimeRef.current >= 450 && !dealTriggeredRef.current) {
        dealTriggeredRef.current = true;
        soundEngine.playWitchDeal();
        const rfItem = statItemsRef.current.find((s) => s.id === 'rabbits_foot');
        const dealCount = rfItem && rfItem.level >= 2 ? 3 : 2;
        const shuffled = [...WITCH_DEALS].sort(() => 0.5 - Math.random());
        onTriggerWitchDeal(shuffled.slice(0, dealCount));
        return;
      }

      // Dash Cooldown & Movement Update
      if (p.dashTimer > 0) {
        p.dashTimer = Math.max(0, p.dashTimer - dt);
        onUpdatePlayer({ dashTimer: p.dashTimer });
      }

      if (p.isDashing) {
        // Dash quickly towards movement/cursor vector
        p.x = Math.max(minX, Math.min(maxX, p.x + dashVxRef.current * dt));
        p.y = Math.max(minY, Math.min(maxY, p.y + dashVyRef.current * dt));
        p.dashDuration -= dt;
        // Leave visual dash ghost
        dashGhostsRef.current.push({ x: p.x, y: p.y, alpha: 0.75 });
        if (p.dashDuration <= 0) {
          triggerDashEndAoE();
          p.isDashing = false;
          dashVxRef.current = 0;
          dashVyRef.current = 0;
          walkTargetRef.current = null;
        }
      } else {
        // Standard WASD keyboard movement, Joystick movement, or Walk to cursor
        const keys = keysRef.current;
        let moveX = 0;
        let moveY = 0;
        if (keys['w'] || keys['arrowup']) moveY -= 1;
        if (keys['s'] || keys['arrowdown']) moveY += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        const moveDist = Math.hypot(moveX, moveY);
        const joyX = joystickVectorRef.current.x;
        const joyY = joystickVectorRef.current.y;
        const joyDist = Math.hypot(joyX, joyY);

        if (moveDist > 0) {
          // Manual key input cancels automated walk target
          walkTargetRef.current = null;
          lastMoveDirRef.current = { dx: moveX / moveDist, dy: moveY / moveDist };
          const moveSpeed = p.speed;
          let newX = p.x + (moveX / moveDist) * moveSpeed * dt;
          let newY = p.y + (moveY / moveDist) * moveSpeed * dt;

          p.x = Math.max(minX, Math.min(maxX, newX));
          p.y = Math.max(minY, Math.min(maxY, newY));
        } else if (joyDist > 0.08) {
          // Virtual Joystick movement
          walkTargetRef.current = null;
          const clampedJoyDist = Math.min(1, joyDist);
          const normJoyX = joyX / joyDist;
          const normJoyY = joyY / joyDist;
          lastMoveDirRef.current = { dx: normJoyX, dy: normJoyY };
          const moveSpeed = p.speed * clampedJoyDist;
          let newX = p.x + normJoyX * moveSpeed * dt;
          let newY = p.y + normJoyY * moveSpeed * dt;

          p.x = Math.max(minX, Math.min(maxX, newX));
          p.y = Math.max(minY, Math.min(maxY, newY));
        } else if (walkTargetRef.current) {
          // Walk towards target cursor location
          const target = walkTargetRef.current;
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 6) {
            walkTargetRef.current = null;
          } else {
            const dirX = dx / dist;
            const dirY = dy / dist;
            lastMoveDirRef.current = { dx: dirX, dy: dirY };
            const moveSpeed = p.speed;
            const step = Math.min(dist, moveSpeed * dt);
            let newX = p.x + dirX * step;
            let newY = p.y + dirY * step;

            p.x = Math.max(minX, Math.min(maxX, newX));
            p.y = Math.max(minY, Math.min(maxY, newY));
          }
        }
      }

      // Passive HP Regeneration
      if (p.hpRegen > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + p.hpRegen * dt);
      }

      // Update Boss Contact Cooldown
      if (bossContactCooldownRef.current > 0) {
        bossContactCooldownRef.current -= dt;
      }
      if (bossDashHitCooldownRef.current > 0) {
        bossDashHitCooldownRef.current -= dt;
      }

      // Boss Body Touch Collision (Player takes 10 damage & is knocked backwards when touching the Carnivore Plant Boss)
      if (isBossFightRef.current && bossInstanceRef.current) {
        const boss = bossInstanceRef.current;
        const distToBoss = Math.hypot(p.x - boss.x, p.y - boss.y);
        const contactThreshold = p.radius + boss.radius;
        let isContact = false;
        if (boss.id === 'haunted_eye') {
          const rx = (boss.widthRadius || 155) + p.radius;
          const ry = (boss.heightRadius || 55) + p.radius;
          const dx = (p.x - boss.x) / rx;
          const dy = (p.y - boss.y) / ry;
          isContact = (dx * dx + dy * dy) <= 1.0;
        } else {
          isContact = distToBoss <= contactThreshold;
        }

        if (isContact) {
          if (p.isDashing && p.dashDamage && p.dashDamage > 0) {
            // Nightbear's Claws: Damage the boss while dashing
            // We'll use a local ref for boss dash cooldown to avoid machine-gunning
            if (bossDashHitCooldownRef.current <= 0) {
              bossDashHitCooldownRef.current = 0.5;
              const actualDmg = p.dashDamage * 2.5 * (instaKillRef.current ? 100 : 1); // Bosses take more damage from this
              boss.hp -= actualDmg;
              bossHitFlashRef.current = 0.1;
              
            soundEngine.playHit();

            floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x + (Math.random() - 0.5) * 20,
                y: boss.y - 30,
                text: `${Math.round(actualDmg)}`,
                color: '#f87171',
                life: 0,
                maxLife: 0.8,
                vy: -50,
              });
              
              // We still allow the dash to be "interrupted" by boss mass for feel, 
              // but you don't take damage.
            }
          } else if (bossContactCooldownRef.current <= 0) {
            bossContactCooldownRef.current = 0.55;
            const contactDmg = boss.damage;
            p.hp = Math.max(0, p.hp - contactDmg);
            lastReportedHpRef.current = p.hp;
            onUpdatePlayer({ hp: p.hp });
            soundEngine.playPlayerHurt();

            if (screenShakeEnabledRef.current) {
              screenShakeRef.current = Math.min(screenShakeRef.current + 8, 14);
            }

            // Damage text on player
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 16,
              y: p.y - 18,
              text: `-${contactDmg}`,
              color: '#ef4444',
              life: 0,
              maxLife: 0.75,
              vy: -40,
            });

            // Burst particles on impact
            for (let k = 0; k < 14; k++) {
              const pAng = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 140 + 40;
              particlesRef.current.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(pAng) * pSpd,
                vy: Math.sin(pAng) * pSpd,
                size: Math.random() * 3.5 + 2,
                color: k % 2 === 0 ? '#22c55e' : '#ef4444',
                alpha: 1,
                decay: 2.8,
              });
            }

            // Knock player backwards away from the boss
            const knockAngle = distToBoss > 0.001 ? Math.atan2(p.y - boss.y, p.x - boss.x) : Math.PI / 2;
            const knockbackDistance = contactThreshold + (p.isDashing ? 180 : 90);
            p.x = Math.max(minX, Math.min(maxX, boss.x + Math.cos(knockAngle) * knockbackDistance));
            p.y = Math.max(minY, Math.min(maxY, boss.y + Math.sin(knockAngle) * knockbackDistance));

            // Stop Mobile Movement walk and dash recoil
            triggerDashEndAoE();
            walkTargetRef.current = null;
            p.isDashing = false;
            dashVxRef.current = 0;
            dashVyRef.current = 0;

            if (p.hp <= 0) {
              p.hp = 0;
              lastReportedHpRef.current = 0;
              onUpdatePlayer({ hp: 0 });
              onGameOver({
                time: survivalTimeRef.current,
                level: p.level,
                kills: killsCountRef.current,
                bossesKilled: bossesKilledRef.current,
                killerName: boss.name,
              });
              return;
            }
          }
        }
      }

      // Keep HUD HP bar in sync if health drifted due to regen or vampirism
      if (Math.abs(p.hp - lastReportedHpRef.current) >= 0.5) {
        lastReportedHpRef.current = p.hp;
        onUpdatePlayer({ hp: p.hp });
      }

      // Update Orbit Angle for orbiting weapons (speed scales with weapon tier)
      let grimoireRpmMult = 1.0;
      const equippedGrimoire = weaponsRef.current.find((w) => w.id === 'grimoire_orbit');
      if (equippedGrimoire) {
        const lvl = equippedGrimoire.level;
        if (lvl >= 6) grimoireRpmMult = 2.45;
        else if (lvl >= 4) grimoireRpmMult = 1.8;
        else if (lvl >= 2) grimoireRpmMult = 1.35;
      }
      orbitAngleRef.current += dt * 3.0 * grimoireRpmMult;

      // Enemy Spawning (PAUSED during Boss Fight!)
      if (!isBossFightRef.current) {
        spawnEnemyWave(dt, canvas.width, canvas.height);
      }

      // Weapons Auto-Firing based on Shooting Systems:
      // 1. NEAREST_ENEMY
      // 2. MOUSE_DIRECTION
      // 3. AREA_OF_EFFECT
      const curTime = survivalTimeRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const activeCamX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
      const activeCamY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;
      const mouseWorldX = activeCamX + mouseScreenRef.current.x;
      const mouseWorldY = activeCamY + mouseScreenRef.current.y;

      weaponsRef.current.forEach((owned) => {
        const def = ALL_WEAPONS.find((w) => w.id === owned.id);
        if (!def) return;

        const tier = def.tiers.find((t) => t.tier === owned.level) || def.tiers[0];
        const mult = owned.statsMultiplier || 1.0;

        // All weapons get an intrinsic 10% damage increase when leveled up
        const levelBonusMult = 1 + (owned.level - 1) * 0.10;
        const damage = (def.baseDamage + tier.damageBonus) * p.damageMult * mult * levelBonusMult;
        const interval = Math.max(0.08, (def.baseInterval * tier.fireRateBonus) / (mult > 1 ? mult : 1.0));
        const size = (def.baseSize + tier.sizeBonus) * p.projectileSizeMult;
        const count = def.baseCount + tier.countBonus;
        const pierce = def.basePierce + tier.pierceBonus;

        if (curTime - owned.lastFired >= interval) {
          owned.lastFired = curTime;

          // SHOOTING SYSTEM 1: MOUSE_DIRECTION
          if (def.shootingType === 'MOUSE_DIRECTION') {
            const baseAngle = Math.atan2(mouseWorldY - p.y, mouseWorldX - p.x);
            const isArcaneWand = def.id === 'arcane_wand';
            const spread = count > 1 ? (isArcaneWand ? 0.16 : 0.24) : 0;

            if (def.id === 'brimstone_shotgun') {
              soundEngine.playShoot('shotgun');
            } else {
              soundEngine.playShoot('wand');
            }

            const isLaser = isArcaneWand && owned.level >= 6;

            if (isLaser) {
              projectilesRef.current.push({
                id: nextEntityId.current++,
                weaponId: def.id,
                x: p.x,
                y: p.y,
                vx: Math.cos(baseAngle) * 3500, // Super fast for laser feel
                vy: Math.sin(baseAngle) * 3500,
                damage,
                radius: size, // 60px wide from tier data
                color: def.bulletColor,
                pierce,
                duration: 0,
                maxDuration: 0.15, // Pulse duration
                knockback: 18 * p.knockbackMult,
                vampirismRatio: p.vampirism,
                isLaser: true,
                hitEnemyIds: new Set<number>(),
                hitBoss: false,
              });
            } else {
              for (let i = 0; i < count; i++) {
                const ang = baseAngle + (i - (count - 1) / 2) * spread;
                let pDamage = damage;
                let pRadius = size;

                // Arcane Blast Rank 2-3 specific: side projectiles are smaller and weaker
                if (isArcaneWand && owned.level >= 2 && owned.level < 4 && i !== Math.floor(count / 2)) {
                  pDamage = 13 * p.damageMult * mult * levelBonusMult;
                  pRadius = 10 * p.projectileSizeMult;
                }

                projectilesRef.current.push({
                  id: nextEntityId.current++,
                  weaponId: def.id,
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(ang) * def.baseSpeed,
                  vy: Math.sin(ang) * def.baseSpeed,
                  damage: pDamage,
                  radius: pRadius,
                  color: def.bulletColor,
                  pierce,
                  duration: 0,
                  maxDuration: 1.8,
                  knockback: 18 * p.knockbackMult,
                  vampirismRatio: p.vampirism,
                  hitEnemyIds: new Set<number>(),
                  hitBoss: false,
                });
              }
            }
          }

          // SHOOTING SYSTEM 2: NEAREST_ENEMY (Homing Seeking Wisp or Instant Vine Trap)
          else if (def.shootingType === 'NEAREST_ENEMY') {
            const activeBoss = isBossFightRef.current && bossInstanceRef.current ? bossInstanceRef.current : null;

            if (def.id === 'vine_snare') {
              if (enemiesRef.current.length > 0) {
                // Instantly trap nearest enemies
                const sortedEnemies = [...enemiesRef.current].sort((a, b) => {
                  const distA = Math.hypot(a.x - p.x, a.y - p.y);
                  const distB = Math.hypot(b.x - p.x, b.y - p.y);
                  return distA - distB;
                });

                soundEngine.playShoot('cauldron');

                for (let i = 0; i < count; i++) {
                  const target = sortedEnemies[i % sortedEnemies.length];
                  const actualDmg = instaKillRef.current ? Math.max(target.hp + 10, 999999) : damage;
                  target.hp -= actualDmg;
                  target.lastHitBy = def.id;
                  target.hitFlashTimer = 0.1;
                  target.vineRootedDuration = 2.0;

                  soundEngine.playHit();

                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: target.x + (Math.random() - 0.5) * 10,
                    y: target.y - 10,
                    text: `${Math.round(actualDmg)}`,
                    color: def.bulletColor,
                    life: 0,
                    maxLife: 0.65,
                    vy: -45,
                  });

                  if (p.vampirism > 0) {
                    const healed = actualDmg * p.vampirism;
                    p.hp = Math.min(p.maxHp, p.hp + healed);
                  }
                }
              } else if (activeBoss) {
                soundEngine.playShoot('cauldron');

                const actualDmg = instaKillRef.current ? Math.max(activeBoss.hp + 10, 999999) : damage;
                activeBoss.hp -= actualDmg;
                activeBoss.lastHitBy = def.id;
                bossHitFlashRef.current = 0.12;
                activeBoss.vineRootedDuration = 2.0;

                soundEngine.playHit();

                floatingTextsRef.current.push({
                  id: nextEntityId.current++,
                  x: activeBoss.x + (Math.random() - 0.5) * 30,
                  y: activeBoss.y - 20,
                  text: `${Math.round(actualDmg)}`,
                  color: def.bulletColor,
                  life: 0,
                  maxLife: 0.65,
                  vy: -45,
                });

                if (p.vampirism > 0) {
                  const healed = actualDmg * p.vampirism;
                  p.hp = Math.min(p.maxHp, p.hp + healed);
                }
              }
            } else {
              // Homing Seeking Wisp (spirit_spark)
              if (enemiesRef.current.length > 0) {
                // Find closest enemies
                const sortedEnemies = [...enemiesRef.current].sort((a, b) => {
                  const distA = Math.hypot(a.x - p.x, a.y - p.y);
                  const distB = Math.hypot(b.x - p.x, b.y - p.y);
                  return distA - distB;
                });

                // Homing Seeking Wisp
                soundEngine.playShoot('wisp');
                for (let i = 0; i < count; i++) {
                  const target = sortedEnemies[i % sortedEnemies.length];
                  const ang = Math.atan2(target.y - p.y, target.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * def.baseSpeed,
                    vy: Math.sin(ang) * def.baseSpeed,
                    damage,
                    radius: size,
                    color: def.bulletColor,
                    pierce,
                    duration: 0,
                    maxDuration: 2.2,
                    knockback: 14 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    homingTargetId: target.id,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              } else if (activeBoss) {
                // Target Boss directly with Seeking Wisp
                soundEngine.playShoot('wisp');
                for (let i = 0; i < count; i++) {
                  const ang = Math.atan2(activeBoss.y - p.y, activeBoss.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * def.baseSpeed,
                    vy: Math.sin(ang) * def.baseSpeed,
                    damage,
                    radius: size,
                    color: def.bulletColor,
                    pierce,
                    duration: 0,
                    maxDuration: 2.2,
                    knockback: 14 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              }
            }
          }

          // SHOOTING SYSTEM 3: AREA_OF_EFFECT
          else if (def.shootingType === 'AREA_OF_EFFECT') {
            if (def.id === 'toxic_cauldron') {
              soundEngine.playShoot('cauldron');
              // Splash poison pools on nearby ground
              for (let i = 0; i < count; i++) {
                const rx = p.x + (Math.random() - 0.5) * 220;
                const ry = p.y + (Math.random() - 0.5) * 220;
                aoeZonesRef.current.push({
                  id: nextEntityId.current++,
                  weaponId: def.id,
                  x: rx,
                  y: ry,
                  radius: size,
                  damage,
                  duration: 0,
                  maxDuration: 3.5,
                  color: def.bulletColor,
                  tickInterval: 0.50,
                  lastTick: 0,
                  vampirismRatio: p.vampirism,
                });
              }
            } else if (def.id === 'hellfire_nova') {
              soundEngine.playShoot('nova');
              // Circular pulse around the player that deals damage to nearby enemies, WITHOUT ANY projectiles
              const pulseRadius = size;
              novaPulsesRef.current.push({
                id: nextEntityId.current++,
                weaponId: def.id,
                x: p.x,
                y: p.y,
                currentRadius: 15,
                maxRadius: pulseRadius,
                duration: 0,
                maxDuration: 0.38,
                damage,
                color: def.bulletColor,
                vampirismRatio: p.vampirism,
                knockback: 35 * p.knockbackMult,
                hitEnemyIds: new Set<number>(),
              });

              // Fiery spark burst radiating from the witch
              for (let k = 0; k < 18; k++) {
                const pAngle = Math.random() * Math.PI * 2;
                const pSpeed = Math.random() * 110 + 40;
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(pAngle) * pSpeed,
                  vy: Math.sin(pAngle) * pSpeed,
                  size: Math.random() * 3.5 + 2,
                  color: k % 2 === 0 ? '#f97316' : '#fbbf24',
                  alpha: 1,
                  decay: 2.2,
                });
              }
            }
          }
        }
      });

      // Special handling for Orbiting Grimoire (continuous rotating shield)
      const grimoireWeapon = weaponsRef.current.find((w) => w.id === 'grimoire_orbit');
      if (grimoireWeapon) {
        const def = ALL_WEAPONS.find((w) => w.id === 'grimoire_orbit')!;
        const tier = def.tiers.find((t) => t.tier === grimoireWeapon.level) || def.tiers[0];
        const mult = grimoireWeapon.statsMultiplier || 1.0;
        const levelBonusMult = 1 + (grimoireWeapon.level - 1) * 0.10;
        const damage = (def.baseDamage + tier.damageBonus) * p.damageMult * mult * levelBonusMult;
        const orbitRadius = (90 + (tier.sizeBonus || 0) * 1.5) * p.projectileSizeMult;
        const bookCount = Math.min(3, def.baseCount + tier.countBonus);

        for (let i = 0; i < bookCount; i++) {
          const bAngle = orbitAngleRef.current + (i / bookCount) * Math.PI * 2;
          const bx = p.x + Math.cos(bAngle) * orbitRadius;
          const by = p.y + Math.sin(bAngle) * orbitRadius;
          const bookRadius = (16 + (tier.sizeBonus || 0) * 0.6) * p.projectileSizeMult;

          // Check collision with enemies
          enemiesRef.current.forEach((enemy) => {
            const edist = Math.hypot(enemy.x - bx, enemy.y - by);
            if (edist <= bookRadius + enemy.radius) {
              const tickDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : damage * dt * 3.5;
              enemy.hp -= tickDmg;
              enemy.hitFlashTimer = 0.05;

              // Knockback
              const kbAngle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
              enemy.x += Math.cos(kbAngle) * (20 * p.knockbackMult * dt);
              enemy.y += Math.sin(kbAngle) * (20 * p.knockbackMult * dt);

              if (p.vampirism > 0) {
                p.hp = Math.min(p.maxHp, p.hp + tickDmg * p.vampirism);
              }
            }
          });

          // Check collision with Boss
          if (isBossFightRef.current && bossInstanceRef.current) {
            const boss = bossInstanceRef.current;
            let isBookHit = false;
            if (boss.id === 'haunted_eye') {
              const rx = (boss.widthRadius || 155) + bookRadius;
              const ry = (boss.heightRadius || 55) + bookRadius;
              const dx = (bx - boss.x) / rx;
              const dy = (by - boss.y) / ry;
              isBookHit = (dx * dx + dy * dy) <= 1.0;
            } else {
              isBookHit = Math.hypot(boss.x - bx, boss.y - by) <= bookRadius + boss.radius;
            }
            if (isBookHit) {
              const tickDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : damage * dt * 3.5;
              boss.hp -= tickDmg;
              bossHitFlashRef.current = 0.05;

              if (p.vampirism > 0) {
                p.hp = Math.min(p.maxHp, p.hp + tickDmg * p.vampirism);
              }
            }
          }
        }
      }

      // Update Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        proj.duration += dt;

        // Homing steering
        if (proj.homingTargetId) {
          const target = enemiesRef.current.find((e) => e.id === proj.homingTargetId);
          if (target) {
            const desiredAngle = Math.atan2(target.y - proj.y, target.x - proj.x);
            const currentSpeed = Math.hypot(proj.vx, proj.vy);
            proj.vx = proj.vx * 0.88 + Math.cos(desiredAngle) * currentSpeed * 0.12;
            proj.vy = proj.vy * 0.88 + Math.sin(desiredAngle) * currentSpeed * 0.12;
          }
        }

        if (proj.isLaser) {
          proj.x = p.x;
          proj.y = p.y;
        } else {
          proj.x += proj.vx * dt;
          proj.y += proj.vy * dt;
        }

        // Projectile Particle trail
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: proj.x,
            y: proj.y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: proj.radius * 0.6,
            color: proj.color,
            alpha: 0.8,
            decay: 5,
          });
        }

        // Check lifespan
        if (proj.duration >= proj.maxDuration) {
          projectilesRef.current.splice(i, 1);
          continue;
        }

        // Check collision with Boss
        if (isBossFightRef.current && bossInstanceRef.current && !proj.hitBoss) {
          const boss = bossInstanceRef.current;
          let isBossHit = false;

          if (proj.isLaser) {
            const dx = boss.x - proj.x;
            const dy = boss.y - proj.y;
            const angle = Math.atan2(proj.vy, proj.vx);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const localX = dx * cos + dy * sin;
            const localY = -dx * sin + dy * cos;
            
            if (localX >= 0 && localX <= 1200 && Math.abs(localY) <= proj.radius + (boss.radius || 40)) {
               isBossHit = true;
            }
          } else {
            if (boss.id === 'haunted_eye') {
              const rx = (boss.widthRadius || 155) + proj.radius;
              const ry = (boss.heightRadius || 55) + proj.radius;
              const dx = (proj.x - boss.x) / rx;
              const dy = (proj.y - boss.y) / ry;
              isBossHit = (dx * dx + dy * dy) <= 1.0;
            } else {
              isBossHit = Math.hypot(proj.x - boss.x, proj.y - boss.y) <= proj.radius + boss.radius;
            }
          }

          if (isBossHit) {
            proj.hitBoss = true;
            const actualDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : proj.damage;
            boss.hp -= actualDmg;
            boss.lastHitBy = proj.weaponId;
            bossHitFlashRef.current = 0.12;
            soundEngine.playHit();

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: boss.x + (Math.random() - 0.5) * 30,
              y: boss.y - 20,
              text: `${Math.round(actualDmg)}`,
              color: proj.color,
              life: 0,
              maxLife: 0.65,
              vy: -45,
            });

            if (proj.weaponId === 'vine_snare') {
              boss.vineRootedDuration = 2.0;
            }

            if (proj.vampirismRatio > 0) {
              const healed = actualDmg * proj.vampirismRatio;
              p.hp = Math.min(p.maxHp, p.hp + healed);
            }

            proj.pierce -= 1;
            if (proj.pierce <= 0) {
              projectilesRef.current.splice(i, 1);
              continue;
            }
          }
        }

        // Check collision with enemies
        for (let j = 0; j < enemiesRef.current.length; j++) {
          const enemy = enemiesRef.current[j];
          if (proj.hitEnemyIds?.has(enemy.id)) continue;
          let isHit = false;

          if (proj.isLaser) {
            // Laser collision: check if enemy is within the beam width and "in front" of the beam start
            const dx = enemy.x - proj.x;
            const dy = enemy.y - proj.y;
            const angle = Math.atan2(proj.vy, proj.vx);
            
            // Project enemy position onto laser vector
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const localX = dx * cos + dy * sin;
            const localY = -dx * sin + dy * cos;
            
            // If enemy is within beam width and within the beam path (1200px range)
            if (localX >= 0 && localX <= 1200 && Math.abs(localY) <= proj.radius + enemy.radius) {
              // Off-screen check
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              const activeCamX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
              const activeCamY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;
              
              const screenX = enemy.x - activeCamX;
              const screenY = enemy.y - activeCamY;
              
              if (screenX >= 0 && screenX <= canvas.width && screenY >= 0 && screenY <= canvas.height) {
                isHit = true;
              }
            }
          } else {
            const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
            if (dist <= proj.radius + enemy.radius) {
              isHit = true;
            }
          }

          if (isHit) {
            if (!proj.hitEnemyIds) proj.hitEnemyIds = new Set<number>();
            proj.hitEnemyIds.add(enemy.id);

            const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : proj.damage;
            enemy.hp -= actualDmg;
            enemy.lastHitBy = proj.weaponId;
            enemy.hitFlashTimer = 0.1;
            soundEngine.playHit();

            if (proj.weaponId === 'vine_snare') {
              enemy.vineRootedDuration = 2.0;
            }

            // Floating Damage Number
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: enemy.x + (Math.random() - 0.5) * 10,
              y: enemy.y - 10,
              text: `${Math.round(actualDmg)}`,
              color: proj.color,
              life: 0,
              maxLife: 0.65,
              vy: -45,
            });

            // Knockback
            const kbAngle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
            enemy.x += Math.cos(kbAngle) * proj.knockback;
            enemy.y += Math.sin(kbAngle) * proj.knockback;

            // Vampirism effect
            if (proj.vampirismRatio > 0) {
              const healed = actualDmg * proj.vampirismRatio;
              p.hp = Math.min(p.maxHp, p.hp + healed);
            }

            // Pierce check
            proj.pierce -= 1;
            if (proj.pierce <= 0) {
              projectilesRef.current.splice(i, 1);
              break;
            }
          }
        }
      }

      // Update AoE Zones
      for (let i = aoeZonesRef.current.length - 1; i >= 0; i--) {
        const aoe = aoeZonesRef.current[i];
        aoe.duration += dt;

        if (aoe.duration - aoe.lastTick >= aoe.tickInterval) {
          aoe.lastTick = aoe.duration;

          // Tick damage on enemies
          enemiesRef.current.forEach((enemy) => {
            const dist = Math.hypot(aoe.x - enemy.x, aoe.y - enemy.y);
            if (dist <= aoe.radius + enemy.radius) {
              const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : aoe.damage;
              enemy.hp -= actualDmg;
              enemy.lastHitBy = aoe.weaponId;
              enemy.hitFlashTimer = 0.08;

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: enemy.x,
                y: enemy.y - 12,
                text: `${Math.round(actualDmg)}`,
                color: '#4ade80',
                life: 0,
                maxLife: 0.5,
                vy: -35,
              });

              if (aoe.vampirismRatio > 0) {
                p.hp = Math.min(p.maxHp, p.hp + actualDmg * aoe.vampirismRatio);
              }
            }
          });

          // Tick damage on Boss
          if (isBossFightRef.current && bossInstanceRef.current) {
            const boss = bossInstanceRef.current;
            let isAoEHit = false;
            if (boss.id === 'haunted_eye') {
              const rx = (boss.widthRadius || 155) + aoe.radius;
              const ry = (boss.heightRadius || 55) + aoe.radius;
              const dx = (aoe.x - boss.x) / rx;
              const dy = (aoe.y - boss.y) / ry;
              isAoEHit = (dx * dx + dy * dy) <= 1.0;
            } else {
              isAoEHit = Math.hypot(aoe.x - boss.x, aoe.y - boss.y) <= aoe.radius + boss.radius;
            }
            if (isAoEHit) {
              const actualDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : aoe.damage;
              boss.hp -= actualDmg;
              boss.lastHitBy = aoe.weaponId;
              bossHitFlashRef.current = 0.08;

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x + (Math.random() - 0.5) * 25,
                y: boss.y - 15,
                text: `${Math.round(actualDmg)}`,
                color: '#4ade80',
                life: 0,
                maxLife: 0.5,
                vy: -35,
              });

              if (aoe.vampirismRatio > 0) {
                p.hp = Math.min(p.maxHp, p.hp + actualDmg * aoe.vampirismRatio);
              }
            }
          }
        }

        if (aoe.duration >= aoe.maxDuration) {
          aoeZonesRef.current.splice(i, 1);
        }
      }

      // Update Nova Pulses (Circular pulse around player without projectiles)
      for (let i = novaPulsesRef.current.length - 1; i >= 0; i--) {
        const pulse = novaPulsesRef.current[i];
        pulse.duration += dt;
        pulse.x = p.x;
        pulse.y = p.y;
        const progress = Math.min(1, pulse.duration / pulse.maxDuration);
        pulse.currentRadius = 15 + (pulse.maxRadius - 15) * Math.pow(progress, 0.7);

        // Check enemies within circular pulse radius around player
        enemiesRef.current.forEach((enemy) => {
          if (pulse.hitEnemyIds.has(enemy.id)) return;

          const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
          if (dist <= pulse.currentRadius + enemy.radius) {
            pulse.hitEnemyIds.add(enemy.id);
            const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : pulse.damage;
            enemy.hp -= actualDmg;
            enemy.lastHitBy = pulse.weaponId;
            enemy.hitFlashTimer = 0.12;

            // Knockback directly away from the player
            const kbAngle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
            enemy.x += Math.cos(kbAngle) * pulse.knockback;
            enemy.y += Math.sin(kbAngle) * pulse.knockback;

            // Floating combat damage text
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: enemy.x,
              y: enemy.y - 12,
              text: `${Math.round(actualDmg)}`,
              color: '#fb923c',
              life: 0,
              maxLife: 0.6,
              vy: -40,
            });

            // Vampirism
            if (pulse.vampirismRatio > 0) {
              p.hp = Math.min(p.maxHp, p.hp + actualDmg * pulse.vampirismRatio);
            }

            // Hit spark particles
            for (let k = 0; k < 4; k++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = Math.random() * 80 + 30;
              particlesRef.current.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                size: Math.random() * 3 + 2,
                color: '#f97316',
                alpha: 1,
                decay: 2.5,
              });
            }
          }
        });

        // Check boss in circular pulse
        if (isBossFightRef.current && bossInstanceRef.current && !pulse.hitEnemyIds.has(-999)) {
          const boss = bossInstanceRef.current;
          let isPulseHit = false;
          if (boss.id === 'haunted_eye') {
            const rx = (boss.widthRadius || 155) + pulse.currentRadius;
            const ry = (boss.heightRadius || 55) + pulse.currentRadius;
            const dx = (boss.x - p.x) / rx;
            const dy = (boss.y - p.y) / ry;
            isPulseHit = (dx * dx + dy * dy) <= 1.0;
          } else {
            isPulseHit = Math.hypot(boss.x - p.x, boss.y - p.y) <= pulse.currentRadius + boss.radius;
          }
          if (isPulseHit) {
            pulse.hitEnemyIds.add(-999);
            const actualDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : pulse.damage;
            boss.hp -= actualDmg;
            boss.lastHitBy = pulse.weaponId;
            bossHitFlashRef.current = 0.12;

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: boss.x,
              y: boss.y - 20,
              text: `${Math.round(actualDmg)}`,
              color: '#fb923c',
              life: 0,
              maxLife: 0.6,
              vy: -40,
            });

            if (pulse.vampirismRatio > 0) {
              p.hp = Math.min(p.maxHp, p.hp + actualDmg * pulse.vampirismRatio);
            }
          }
        }

        if (pulse.duration >= pulse.maxDuration) {
          novaPulsesRef.current.splice(i, 1);
        }
      }

      // Update Enemies & Check Player Hurt
      const medusaItem = statItemsRef.current.find((s) => s.id === 'medusas_eye');
      const medusaRadius = medusaItem ? 20 + medusaItem.level * 20 : 0;
      const medusaSlowMult = medusaItem ? Math.max(0.3, 1.0 - (0.2 + medusaItem.level * 0.05)) : 1.0;

      // 1. Advance enemies towards player and update timers / knockbacks
      for (let i = 0; i < enemiesRef.current.length; i++) {
        const enemy = enemiesRef.current[i];
        if (enemy.hp <= 0) continue;

        if (enemy.hitFlashTimer > 0) {
          enemy.hitFlashTimer -= dt;
        }

        // Cooldown timer for attack
        if (enemy.attackCooldown && enemy.attackCooldown > 0) {
          enemy.attackCooldown -= dt;
        }

        // Vine root duration timer
        if (enemy.vineRootedDuration && enemy.vineRootedDuration > 0) {
          enemy.vineRootedDuration -= dt;
        }

        // Apply knockback velocity recoil
        if (Math.abs(enemy.vx) > 1 || Math.abs(enemy.vy) > 1) {
          enemy.x += enemy.vx * dt;
          enemy.y += enemy.vy * dt;
          enemy.vx *= Math.max(0, 1 - dt * 8);
          enemy.vy *= Math.max(0, 1 - dt * 8);
        }

        // Enemies move towards the player
        const edx = p.x - enemy.x;
        const edy = p.y - enemy.y;
        const edist = Math.hypot(edx, edy);

        // Update facing direction sensor based on walking direction towards player (or knockback)
        if (Math.abs(enemy.vx) > 30) {
          enemy.facingDir = enemy.vx < 0 ? -1 : 1;
        } else if (Math.abs(edx) > 2) {
          enemy.facingDir = edx < 0 ? -1 : 1;
        }

        // Medusa's Eye Slow effect check
        const enemyCursorDist = Math.hypot(enemy.x - mouseWorldX, enemy.y - mouseWorldY);
        const isMedusaSlowed = medusaItem && enemyCursorDist <= medusaRadius;
        const currentEnemySpeed = isMedusaSlowed ? enemy.speed * medusaSlowMult : enemy.speed;

        // Advance towards player if not in initial heavy knockback stun and not vine rooted
        if (edist > 0 && (!enemy.attackCooldown || enemy.attackCooldown < 0.6) && (!enemy.vineRootedDuration || enemy.vineRootedDuration <= 0)) {
          enemy.x += (edx / edist) * currentEnemySpeed * dt;
          enemy.y += (edy / edist) * currentEnemySpeed * dt;
        }
      }

      // 2. Enemy-to-enemy collision resolution & congestion handling
      const numEnemies = enemiesRef.current.length;
      for (let iter = 0; iter < 2; iter++) {
        for (let i = 0; i < numEnemies; i++) {
          const e1 = enemiesRef.current[i];
          if (e1.hp <= 0) continue;

          for (let j = i + 1; j < numEnemies; j++) {
            const e2 = enemiesRef.current[j];
            if (e2.hp <= 0) continue;

            const dx = e2.x - e1.x;
            const dy = e2.y - e1.y;
            const distSq = dx * dx + dy * dy;
            const minDist = e1.radius + e2.radius;

            if (distSq < minDist * minDist) {
              const dist = Math.sqrt(distSq) || 0.001;
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              // Compare distance to player to determine leading vs trailing enemy
              const d1 = Math.hypot(e1.x - p.x, e1.y - p.y);
              const d2 = Math.hypot(e2.x - p.x, e2.y - p.y);

              let front = e1;
              let back = e2;
              let frontDist = d1;
              let backDist = d2;
              let dirFrontToBackX = nx;
              let dirFrontToBackY = ny;

              if (d2 < d1) {
                front = e2;
                back = e1;
                frontDist = d2;
                backDist = d1;
                dirFrontToBackX = -nx;
                dirFrontToBackY = -ny;
              }

              // Check if leading enemy is slower than trailing enemy
              const isFrontSlower = front.speed < back.speed;
              const isSideBySide = Math.abs(frontDist - backDist) < 4;

              let frontWeight = 0.5;
              let backWeight = 0.5;

              if (!isSideBySide) {
                if (isFrontSlower) {
                  // Slower enemy in front: trailing faster enemy MUST be kept behind!
                  // Front enemy holds its ground and does not get shoved into player.
                  frontWeight = 0.0;
                  backWeight = 1.0;
                } else if (front.speed > back.speed) {
                  frontWeight = 0.25;
                  backWeight = 0.75;
                } else {
                  frontWeight = 0.1;
                  backWeight = 0.9;
                }
              }

              // Displace along separation normal
              front.x -= dirFrontToBackX * overlap * frontWeight;
              front.y -= dirFrontToBackY * overlap * frontWeight;
              back.x += dirFrontToBackX * overlap * backWeight;
              back.y += dirFrontToBackY * overlap * backWeight;

              // When the front enemy is slower, strictly keep the faster enemy behind it
              if (isFrontSlower && Math.abs(back.vx) <= 80 && Math.abs(back.vy) <= 80) {
                const currentBackDist = Math.hypot(back.x - p.x, back.y - p.y);
                const minAllowedBackDist = frontDist + minDist * 0.85;
                if (currentBackDist < minAllowedBackDist) {
                  const bPdx = back.x - p.x;
                  const bPdy = back.y - p.y;
                  const bPdist = Math.hypot(bPdx, bPdy) || 0.001;
                  back.x = p.x + (bPdx / bPdist) * minAllowedBackDist;
                  back.y = p.y + (bPdy / bPdist) * minAllowedBackDist;
                }

                // Add gentle lateral diversion so rear enemies naturally fan out around front enemies
                const fx = front.x - p.x;
                const fy = front.y - p.y;
                const fLen = Math.hypot(fx, fy) || 1;
                const tx = -fy / fLen;
                const ty = fx / fLen;
                const dotTangent = (back.x - front.x) * tx + (back.y - front.y) * ty;
                const sideSign = dotTangent !== 0 ? Math.sign(dotTangent) : (back.id % 2 === 0 ? 1 : -1);
                back.x += tx * sideSign * 0.35 * overlap;
                back.y += ty * sideSign * 0.35 * overlap;
              }
            }
          }
        }
      }

      // 3. Check Player Hurt, Deaths, EXP Drops
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        const edx = p.x - enemy.x;
        const edy = p.y - enemy.y;
        const edist = Math.hypot(edx, edy);
        // Check collision with Player
        if (edist <= p.radius + enemy.radius) {
          // Nightbear's Claws: Damage and knockback enemies while dashing
          if (p.isDashing && p.dashDamage && p.dashDamage > 0 && enemy.hitFlashTimer <= 0) {
            const actualDmg = p.dashDamage * (instaKillRef.current ? 100 : 1);
            enemy.hp -= actualDmg;
            enemy.hitFlashTimer = 0.15; // Cooldown for dash damage on this enemy

            // Knockback
            const kbAngle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
            const kbForce = p.dashDamage * 6.0;
            enemy.x += Math.cos(kbAngle) * kbForce;
            enemy.y += Math.sin(kbAngle) * kbForce;

            // Damage text
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: enemy.x + (Math.random() - 0.5) * 10,
              y: enemy.y - 10,
              text: `${Math.round(actualDmg)}`,
              color: '#f87171',
              life: 0,
              maxLife: 0.65,
              vy: -45,
            });

            soundEngine.playHit();

            if (enemy.hp <= 0) {
              // Standard enemy death logic (handled below by the hp <= 0 check)
            }
          }

          // If dashing, immune to damage!
          // Enemies only deal damage once on collision, then get knocked back away
          if (!p.isDashing && (!enemy.attackCooldown || enemy.attackCooldown <= 0)) {
            const dmgDealt = enemy.damage;
            p.hp = Math.max(0, p.hp - dmgDealt);
            lastReportedHpRef.current = p.hp;
            onUpdatePlayer({ hp: p.hp });
            soundEngine.playPlayerHurt();

            if (screenShakeEnabledRef.current) {
              screenShakeRef.current = Math.min(screenShakeRef.current + (enemy.isRed ? 7 : 4), 12);
            }

            // Damage text on player
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 16,
              y: p.y - 18,
              text: `-${Math.round(dmgDealt)}`,
              color: enemy.isRed ? '#ef4444' : '#f87171',
              life: 0,
              maxLife: 0.75,
              vy: -40,
            });

            // Knockback the enemy away from the player
            const angle = edist > 0.001 ? Math.atan2(enemy.y - p.y, enemy.x - p.x) : Math.random() * Math.PI * 2;
            const pushDist = 70;
            enemy.x = p.x + Math.cos(angle) * (p.radius + enemy.radius + pushDist);
            enemy.y = p.y + Math.sin(angle) * (p.radius + enemy.radius + pushDist);
            enemy.vx = Math.cos(angle) * 450;
            enemy.vy = Math.sin(angle) * 450;
            enemy.attackCooldown = 0.85; // Recovers and cannot damage again until cooldown resets

            if (p.hp <= 0) {
              p.hp = 0;
              lastReportedHpRef.current = 0;
              onUpdatePlayer({ hp: 0 });
              onGameOver({
                time: survivalTimeRef.current,
                level: p.level,
                kills: killsCountRef.current,
                bossesKilled: bossesKilledRef.current,
                killerName: enemy.name,
              });
              return;
            }
          }
        }

        // Enemy Death
        if (enemy.hp <= 0) {
          killsCountRef.current++;
          if (enemy.lastHitBy) {
            const weapon = weaponsRef.current.find(w => w.id === enemy.lastHitBy);
            if (weapon) {
              weapon.kills = (weapon.kills || 0) + 1;
            }
          }
          soundEngine.playEnemyDeath();
          if (onEnemyDefeated) {
            onEnemyDefeated(
              enemy.type === 'BAT' ? 'bat' :
              enemy.type === 'GHOUL' ? 'ghoul' : 
              enemy.type === 'MINI_EYE' ? 'mini_eye' : 'wraith'
            );
          }

          // Death burst particles
          for (let k = 0; k < 8; k++) {
            particlesRef.current.push({
              x: enemy.x,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              size: Math.random() * 4 + 2,
              color: enemy.color,
              alpha: 1,
              decay: 3.5,
            });
          }

          // Mini Eye has no drops
          if (enemy.type === 'MINI_EYE') {
            enemiesRef.current.splice(i, 1);
            continue;
          }

          // Enemy Drops: Red Orb grants 10 EXP; 10% chance for special drop (Magnet ~1%, Food and Upgraded Orbs ~9%)
          const isVillageKnight = enemy.isRed || enemy.name === 'Village Knight';
          const specialRoll = Math.random();

          const pushExpDrop = (fallbackValue: number, fallbackColor: string, fallbackRadius: number) => {
            const chance = isVillageKnight ? 0.10 : 0.01;
            if (p.expToNextLevel > 700 && Math.random() < chance) {
              expGemsRef.current.push({
                id: nextEntityId.current++,
                x: enemy.x,
                y: enemy.y,
                value: 75,
                color: '#eab308',
                radius: 9.5,
              });
            } else {
              expGemsRef.current.push({
                id: nextEntityId.current++,
                x: enemy.x,
                y: enemy.y,
                value: fallbackValue,
                color: fallbackColor,
                radius: fallbackRadius,
              });
            }
          };

          if (specialRoll < 0.01) {
            // Rare Magnet Drop (~1% chance)
            pickupsRef.current.push({
              id: nextEntityId.current++,
              type: 'MAGNET',
              x: enemy.x,
              y: enemy.y,
              radius: 11,
            });

            // Normal EXP drop accompanying the magnet
            if (isVillageKnight) {
              pushExpDrop(10, '#ef4444', 7);
            } else {
              pushExpDrop(enemy.exp, '#38bdf8', 5);
            }
          } else if (specialRoll < 0.10) {
            // Other Special Drops (remaining ~9% chance)
            if (isVillageKnight) {
              // Village's Knight: higher-level orb doesn't apply; drops Food (deals 25 dmg) + standard Red Orb (10 EXP)
              pickupsRef.current.push({
                id: nextEntityId.current++,
                type: 'FOOD',
                x: enemy.x,
                y: enemy.y,
                healAmount: enemy.damage, // 25 HP
                radius: 11,
              });
              pushExpDrop(10, '#ef4444', 7);
            } else {
              // Peasants: 50% Food (+ standard blue gem), 50% Higher level EXP orb (Red Orb instead of blue)
              if (Math.random() < 0.5) {
                pickupsRef.current.push({
                  id: nextEntityId.current++,
                  type: 'FOOD',
                  x: enemy.x,
                  y: enemy.y,
                  healAmount: enemy.damage, // 10 or 12 HP
                  radius: 11,
                });
                pushExpDrop(enemy.exp, '#38bdf8', 5);
              } else {
                // Higher level EXP orb than their own (Peasants drop Red Orb instead of blue one)
                pushExpDrop(10, '#ef4444', 7);
              }
            }
          } else {
            // Normal 90% drops:
            if (isVillageKnight) {
              pushExpDrop(10, '#ef4444', 7);
            } else {
              // Normal cyan diamond EXP gem
              pushExpDrop(enemy.exp, '#38bdf8', 5);
            }
          }

          enemiesRef.current.splice(i, 1);
        }
      }

      // World Pickups (Food & Magnet) Collection
      for (let i = pickupsRef.current.length - 1; i >= 0; i--) {
        const pickup = pickupsRef.current[i];
        const pdist = Math.hypot(p.x - pickup.x, p.y - pickup.y);

        if (pdist <= p.radius + pickup.radius + 6) {
          if (pickup.type === 'FOOD') {
            const heal = pickup.healAmount || 10;
            p.hp = Math.min(p.maxHp, p.hp + heal);
            onUpdatePlayer({ hp: p.hp });

            soundEngine.playLevelUp();
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 16,
              y: p.y - 18,
              text: `+${heal} HP`,
              color: '#22c55e',
              life: 0,
              maxLife: 1.0,
              vy: -45,
            });

            // Green healing sparkles
            for (let k = 0; k < 12; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 80 + 25;
              particlesRef.current.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 4 + 2,
                color: '#4ade80',
                alpha: 1,
                decay: 2.4,
              });
            }
          } else if (pickup.type === 'MAGNET') {
            soundEngine.playShoot('nova');
            const totalGems = expGemsRef.current.length;
            // Teleport all uncollected EXP orbs directly to the player
            for (const gem of expGemsRef.current) {
              gem.x = p.x + (Math.random() - 0.5) * 10;
              gem.y = p.y + (Math.random() - 0.5) * 10;
            }

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x,
              y: p.y - 20,
              text: `MAGNET VACUUM! (${totalGems})`,
              color: '#38bdf8',
              life: 0,
              maxLife: 1.3,
              vy: -40,
            });

            // Electric shockwave particles
            for (let k = 0; k < 28; k++) {
              const ang = (k / 28) * Math.PI * 2;
              particlesRef.current.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * 190,
                vy: Math.sin(ang) * 190,
                size: 3.5,
                color: '#38bdf8',
                alpha: 1,
                decay: 2.2,
              });
            }
          }

          pickupsRef.current.splice(i, 1);
        }
      }

      // EXP Attraction & Collection
      const magnetRadius = p.magnetRadius;
      for (let i = expGemsRef.current.length - 1; i >= 0; i--) {
        const gem = expGemsRef.current[i];
        const gdist = Math.hypot(p.x - gem.x, p.y - gem.y);

        // Attract towards player
        if (gdist <= magnetRadius) {
          const pullSpeed = 420;
          gem.x += ((p.x - gem.x) / gdist) * pullSpeed * dt;
          gem.y += ((p.y - gem.y) / gdist) * pullSpeed * dt;
        }

        // Pickup
        if (gdist <= p.radius + gem.radius) {
          soundEngine.playExpPickup();
          const earnedExp = gem.value * (p.expMultiplier || 1.0);
          p.exp += earnedExp;

          if (gem.color === '#eab308' || gem.color === '#facc15') {
            // Yellow Boss Orb (75 EXP)
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y - 18,
              text: `+${Math.round(earnedExp)} BOSS EXP!`,
              color: '#facc15',
              life: 0,
              maxLife: 1.2,
              vy: -45,
            });

            for (let k = 0; k < 18; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 95 + 30;
              particlesRef.current.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 4 + 2,
                color: '#fde047',
                alpha: 1,
                decay: 2.0,
              });
            }
          } else if (gem.color === '#ef4444') {
            // Red EXP Orb (10 EXP)
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y - 12,
              text: `+${Math.round(earnedExp)} EXP`,
              color: '#f43f5e',
              life: 0,
              maxLife: 0.85,
              vy: -40,
            });
          }

          expGemsRef.current.splice(i, 1);

          // Check Level Up!
          if (p.exp >= p.expToNextLevel) {
            let levelsGained = 0;
            while (p.exp >= p.expToNextLevel) {
              p.exp -= p.expToNextLevel;
              p.level += 1;
              p.expToNextLevel = getExpNeededForLevel(p.level);
              levelsGained++;
            }

            onUpdatePlayer({ exp: p.exp, level: p.level, expToNextLevel: p.expToNextLevel });
            soundEngine.playLevelUp();
            onTriggerLevelUp(levelsGained);
            return;
          } else {
            onUpdatePlayer({ exp: p.exp });
          }
        }
      }

      // Update Floating Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.life += dt;
        ft.y += ft.vy * dt;
        if (ft.life >= ft.maxLife) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= pt.decay * dt;
        if (pt.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update Dash Ghosts
      for (let i = dashGhostsRef.current.length - 1; i >= 0; i--) {
        dashGhostsRef.current[i].alpha -= dt * 4;
        if (dashGhostsRef.current[i].alpha <= 0) {
          dashGhostsRef.current.splice(i, 1);
        }
      }

      // RENDER SCENE
      // Screen shake calculation
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeEnabledRef.current && screenShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // Camera offsets: during boss fight, camera is locked in place so player moves freely across the screen arena!
      const cameraX = (isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX) + shakeX;
      const cameraY = (isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY) + shakeY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Endless Open-World Ground Pattern
      const tileSize = 80;
      const startCol = Math.floor(cameraX / tileSize) - 1;
      const endCol = startCol + Math.ceil(canvas.width / tileSize) + 2;
      const startRow = Math.floor(cameraY / tileSize) - 1;
      const endRow = startRow + Math.ceil(canvas.height / tileSize) + 2;

      ctx.save();
      const groundImg = groundTileImageRef.current;
      if (groundImg) {
        ctx.imageSmoothingEnabled = false;
        for (let col = startCol; col <= endCol; col++) {
          for (let row = startRow; row <= endRow; row++) {
            const screenX = col * tileSize - cameraX;
            const screenY = row * tileSize - cameraY;
            ctx.drawImage(groundImg, screenX, screenY, tileSize, tileSize);
          }
        }
        // Darken the ground texture a bit for improved contrast and atmosphere
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        for (let col = startCol; col <= endCol; col++) {
          for (let row = startRow; row <= endRow; row++) {
            const screenX = col * tileSize - cameraX;
            const screenY = row * tileSize - cameraY;
            ctx.fillStyle = '#0c0816';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
            ctx.strokeStyle = '#1d152c';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }
      ctx.restore();

      // 1d. Medusa's Eye Slow Zone indicator
      const medusaItemRender = statItemsRef.current.find((s) => s.id === 'medusas_eye');
      if (medusaItemRender) {
        const mouseScreenX = mouseScreenRef.current.x;
        const mouseScreenY = mouseScreenRef.current.y;
        const medusaRadius = 20 + medusaItemRender.level * 20;

        ctx.save();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.16)'; // faint glowing green
        ctx.fillStyle = 'rgba(74, 222, 128, 0.02)'; // extremely light green background tint
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(mouseScreenX, mouseScreenY, medusaRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 1b. Walk-To-Cursor Destination Rune Marker
      if (walkTargetRef.current) {
        const markerScreenX = walkTargetRef.current.x - cameraX;
        const markerScreenY = walkTargetRef.current.y - cameraY;
        const time = survivalTimeRef.current;
        const pulse = 0.85 + 0.15 * Math.sin(time * 8);

        ctx.save();
        // Glowing target ring
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.85 * pulse})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(markerScreenX, markerScreenY, 18 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing magic core
        ctx.shadowBlur = 4;
        ctx.fillStyle = `rgba(52, 211, 153, ${0.4 * pulse})`;
        ctx.beginPath();
        ctx.arc(markerScreenX, markerScreenY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Direction dashed guide line from player to marker
        const psx = p.x - cameraX;
        const psy = p.y - cameraY;
        ctx.strokeStyle = `rgba(52, 211, 153, 0.22)`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(markerScreenX, markerScreenY);
        ctx.stroke();

        ctx.restore();
      }

      // 1c. Boss Arena Walls (Screen Lockdown boundary walls)
      if (isBossFightRef.current) {
        ctx.save();
        // Pulsing barrier border
        const pulse = 0.65 + 0.35 * Math.sin(survivalTimeRef.current * 4);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.75 * pulse})`;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

        // Inner barrier line
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.85 * pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 8]);
        ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

        // Corner thorn/barrier runes
        const cornerSize = 48;
        const corners = [
          { x: 10, y: 10, dx: 1, dy: 1 },
          { x: canvas.width - 10, y: 10, dx: -1, dy: 1 },
          { x: 10, y: canvas.height - 10, dx: 1, dy: -1 },
          { x: canvas.width - 10, y: canvas.height - 10, dx: -1, dy: -1 },
        ];

        corners.forEach((c) => {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x + c.dx * cornerSize, c.y);
          ctx.lineTo(c.x, c.y + c.dy * cornerSize);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 2. Render AoE Zones (Toxic Cauldron Puddles)
      aoeZonesRef.current.forEach((aoe) => {
        const sx = aoe.x - cameraX;
        const sy = aoe.y - cameraY;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, aoe.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${aoe.color}28`;
        ctx.fill();
        ctx.strokeStyle = aoe.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // 2b. Render Nova Pulses (Circular pulse around player without projectiles)
      novaPulsesRef.current.forEach((pulse) => {
        const sx = pulse.x - cameraX;
        const sy = pulse.y - cameraY;
        const progress = Math.min(1, pulse.duration / pulse.maxDuration);
        const alpha = Math.max(0, 1 - progress);

        ctx.save();

        // 1. Radial translucent fiery bloom
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, pulse.currentRadius);
        grad.addColorStop(0, `rgba(249, 115, 22, ${0.30 * alpha})`);
        grad.addColorStop(0.65, `rgba(234, 88, 12, ${0.20 * alpha})`);
        grad.addColorStop(1, `rgba(251, 191, 36, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, pulse.currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. High-intensity glowing shockwave ring
        ctx.lineWidth = Math.max(2, 6 * (1 - progress * 0.7));
        ctx.strokeStyle = `rgba(251, 146, 60, ${alpha * 0.95})`;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(sx, sy, pulse.currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Crisp bright inner crest
        ctx.lineWidth = Math.max(1, 2.5 * (1 - progress));
        ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0, pulse.currentRadius - 3), 0, Math.PI * 2);
        ctx.stroke();

        // 4. Cosmetic upside-down star (pentagram) inside the circle with real self-intersecting closed lines
        const starRadius = pulse.currentRadius * 0.55;
        const starStartAngle = Math.PI / 2; // Pointing downwards (upside-down star)

        const vertices = [];
        for (let k = 0; k < 5; k++) {
          const angle = starStartAngle + (k * 2 * Math.PI) / 5;
          vertices.push({
            x: sx + Math.cos(angle) * starRadius,
            y: sy + Math.sin(angle) * starRadius
          });
        }

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.lineTo(vertices[4].x, vertices[4].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[3].x, vertices[3].y);
        ctx.closePath();
        ctx.fillStyle = `rgba(249, 115, 22, ${0.16 * alpha})`;
        ctx.fill();
        ctx.lineWidth = Math.max(1.2, 2.5 * (1 - progress));
        ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.85})`;
        ctx.stroke();

        ctx.restore();
      });

      // 2c. Render Boss Hazard Attacks (Carnivore Plant AOE)
      if (isBossFightRef.current && bossInstanceRef.current) {
        bossInstanceRef.current.attacks.forEach((atk) => {
          const sx = atk.x - cameraX;
          const sy = atk.y - cameraY;

          ctx.save();
          if (atk.type === 'CARNIVORE_PLANT_VINES') {
            if (atk.warningTimer > 0) {
              const chargeProgress = Math.max(0, Math.min(1, 1 - atk.warningTimer / 1.0));

              if (atk.vines && atk.vines.length > 0) {
                const sampleWidth = atk.vines[0].width;

                // Pass 1: Batched semi-transparent danger beam corridor stroke
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.12 + 0.22 * chargeProgress})`;
                ctx.lineWidth = sampleWidth;
                ctx.lineCap = 'butt';
                ctx.beginPath();
                atk.vines.forEach((v) => {
                  ctx.moveTo(v.x1 - cameraX, v.y1 - cameraY);
                  ctx.lineTo(v.x2 - cameraX, v.y2 - cameraY);
                });
                ctx.stroke();

                // Pass 2: Batched intense bright red core beam line (No shadowBlur for mobile performance)
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 2.0 + 2.0 * chargeProgress;
                ctx.beginPath();
                atk.vines.forEach((v) => {
                  ctx.moveTo(v.x1 - cameraX, v.y1 - cameraY);
                  ctx.lineTo(v.x2 - cameraX, v.y2 - cameraY);
                });
                ctx.stroke();
              }
            } else if (atk.activeTimer > 0) {
              const snapProgress = Math.min(1, atk.activeTimer / 0.4);

              if (atk.vines && atk.vines.length > 0) {
                const sampleWidth = atk.vines[0].width;

                // Pass 1: Batched Outer Dark Vine Bark
                ctx.strokeStyle = '#064e3b';
                ctx.lineWidth = sampleWidth * snapProgress;
                ctx.lineCap = 'round';
                ctx.beginPath();
                atk.vines.forEach((v) => {
                  ctx.moveTo(v.x1 - cameraX, v.y1 - cameraY);
                  ctx.lineTo(v.x2 - cameraX, v.y2 - cameraY);
                });
                ctx.stroke();

                // Pass 2: Batched Inner Glowing Poison Core
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = sampleWidth * 0.45 * snapProgress;
                ctx.beginPath();
                atk.vines.forEach((v) => {
                  ctx.moveTo(v.x1 - cameraX, v.y1 - cameraY);
                  ctx.lineTo(v.x2 - cameraX, v.y2 - cameraY);
                });
                ctx.stroke();

                // Pass 3: Batched Spiky Thorny Spikes (Single path fill & stroke)
                ctx.fillStyle = '#022c22';
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                atk.vines.forEach((v) => {
                  const x1 = v.x1 - cameraX;
                  const y1 = v.y1 - cameraY;
                  const x2 = v.x2 - cameraX;
                  const y2 = v.y2 - cameraY;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.hypot(dx, dy);
                  if (len > 0) {
                    const nx = dx / len;
                    const ny = dy / len;
                    const px = -ny;
                    const py = nx;
                    const thornCount = Math.floor(len / 60);
                    const thornLen = (v.width / 2 + 10) * snapProgress;

                    for (let i = 1; i < thornCount; i++) {
                      const tx = x1 + nx * (i * 60);
                      const ty = y1 + ny * (i * 60);
                      const side = i % 2 === 0 ? 1 : -1;
                      ctx.moveTo(tx - nx * 6, ty - ny * 6);
                      ctx.lineTo(tx + side * px * thornLen, ty + side * py * thornLen);
                      ctx.lineTo(tx + nx * 6, ty + ny * 6);
                      ctx.closePath();
                    }
                  }
                });
                ctx.fill();
                ctx.stroke();
              }
            }
          } else if (atk.type === 'CARNIVORE_PLANT_AOE') {
            if (atk.warningTimer > 0) {
              // Rapid high-intensity danger telegraph (850ms fuse)
              const chargeProgress = Math.max(0, Math.min(1, 1 - atk.warningTimer / 0.85));

              // Pulsing danger base
              ctx.fillStyle = `rgba(239, 68, 68, ${0.25 + 0.25 * chargeProgress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, atk.radius, 0, Math.PI * 2);
              ctx.fill();

              // Expanding danger fill circle tracking fuse
              ctx.fillStyle = `rgba(220, 38, 38, ${0.4 + 0.35 * chargeProgress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, atk.radius * chargeProgress, 0, Math.PI * 2);
              ctx.fill();

              // Bright red hazard ring
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3.5;
              ctx.setLineDash([8, 4]);
              ctx.beginPath();
              ctx.arc(sx, sy, atk.radius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);

              // Central danger sigil
              ctx.font = 'bold 20px sans-serif';
              ctx.fillStyle = '#fee2e2';
              ctx.textAlign = 'center';
              ctx.fillText('⚠', sx, sy + 7);
            } else if (atk.activeTimer > 0) {
              // Erupting Carnivorous Jaws Snapping Shut!
              const snapProgress = Math.min(1, atk.activeTimer / 0.35);
              ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
              ctx.beginPath();
              ctx.arc(sx, sy, atk.radius, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(sx, sy, atk.radius, 0, Math.PI * 2);
              ctx.stroke();

              // Spiky thorny teeth snapping to center
              const spikes = 12;
              ctx.fillStyle = '#064e3b';
              ctx.beginPath();
              for (let s = 0; s < spikes; s++) {
                const ang = (s / spikes) * Math.PI * 2;
                const ox = sx + Math.cos(ang) * atk.radius;
                const oy = sy + Math.sin(ang) * atk.radius;
                const innerRad = atk.radius * (0.2 + 0.25 * (1 - snapProgress));
                const ix = sx + Math.cos(ang + Math.PI / spikes) * innerRad;
                const iy = sy + Math.sin(ang + Math.PI / spikes) * innerRad;
                if (s === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
                ctx.lineTo(ix, iy);
              }
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#34d399';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
          } else if (atk.type === 'HAUNTED_EYE_TEAR' || atk.type === 'HAUNTED_EYE_PROJECTILE') {
            // Render Occult Weeping Tear Projectile
            const angle = Math.atan2(atk.vy || 1, atk.vx || 0);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle);

            // Tear glowing aura
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 14;

            // Teardrop shape pointed forwards
            ctx.fillStyle = '#9f1239';
            ctx.beginPath();
            ctx.arc(0, 0, atk.radius, Math.PI / 2, (3 * Math.PI) / 2);
            ctx.lineTo(atk.radius * 1.8, 0);
            ctx.closePath();
            ctx.fill();

            // Inner bright core
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(0, 0, atk.radius * 0.55, Math.PI / 2, (3 * Math.PI) / 2);
            ctx.lineTo(atk.radius * 1.0, 0);
            ctx.closePath();
            ctx.fill();

            // Specular shine
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-atk.radius * 0.25, -atk.radius * 0.25, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
          ctx.restore();
        });
      }

      // 2.5 Render World Pickups (Food & Magnet)
      const curRunTime = survivalTimeRef.current;
      pickupsRef.current.forEach((pickup) => {
        const sx = pickup.x - cameraX;
        const sy = pickup.y - cameraY;
        const bob = Math.sin(curRunTime * 6 + pickup.id) * 3;

        ctx.save();
        if (pickup.type === 'FOOD') {
          // Roasted Feast / Healing Food
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 12;

          // Glowing soft green aura
          ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
          ctx.beginPath();
          ctx.arc(sx, sy + bob, 15, 0, Math.PI * 2);
          ctx.fill();

          // Bone handle
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(sx - 10, sy + bob - 1, 8, 4, 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(sx - 11, sy + bob - 1, 2.5, 0, Math.PI * 2);
          ctx.arc(sx - 11, sy + bob + 3, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Roast meat body
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(sx + 3, sy + bob + 1, 9, 6.5, -0.25, 0, Math.PI * 2);
          ctx.fill();

          // Crispy glaze highlight
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(sx + 4, sy + bob - 0.5, 6, 4, -0.25, 0, Math.PI * 2);
          ctx.fill();

          // Specular shine
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(sx + 2, sy + bob - 1.5, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // HP heal badge
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#4ade80';
          ctx.textAlign = 'center';
          ctx.fillText(`+${pickup.healAmount || 10}`, sx, sy + bob - 10);
        } else if (pickup.type === 'MAGNET') {
          // Magnet pickup
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;

          // Pulsing magnetic field ring
          const magPulse = 1 + 0.2 * Math.sin(curRunTime * 8 + pickup.id);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy + bob, 16 * magPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Horseshoe Magnet
          // Red arch
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.lineCap = 'butt';
          ctx.beginPath();
          ctx.arc(sx, sy + bob - 2, 7, 0, Math.PI, false);
          ctx.stroke();

          // Legs of horseshoe
          ctx.beginPath();
          ctx.moveTo(sx - 7, sy + bob - 2);
          ctx.lineTo(sx - 7, sy + bob + 5);
          ctx.moveTo(sx + 7, sy + bob - 2);
          ctx.lineTo(sx + 7, sy + bob + 5);
          ctx.stroke();

          // Silver magnetic poles
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(sx - 7, sy + bob + 4);
          ctx.lineTo(sx - 7, sy + bob + 7);
          ctx.moveTo(sx + 7, sy + bob + 4);
          ctx.lineTo(sx + 7, sy + bob + 7);
          ctx.stroke();

          // Mini electric sparks
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(sx - 7, sy + bob + 10, 1.8, 0, Math.PI * 2);
          ctx.arc(sx + 7, sy + bob + 10, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. Render EXP Gems & Red/Yellow EXP Orbs
      expGemsRef.current.forEach((gem) => {
        const sx = gem.x - cameraX;
        const sy = gem.y - cameraY;

        ctx.save();
        const isYellow = gem.color === '#eab308' || gem.color === '#facc15';
        const isRed = gem.color === '#ef4444';
        ctx.shadowColor = gem.color;
        ctx.shadowBlur = isYellow ? 20 : isRed ? 14 : 8;
        ctx.fillStyle = gem.color;

        if (isYellow) {
          // Distinct majestic glowing Yellow Boss EXP Orb (75 EXP)
          const pulse = 1 + 0.12 * Math.sin(Date.now() * 0.007 + gem.id);

          // Outer radiant halo
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.beginPath();
          ctx.arc(sx, sy, 14 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Golden orb body
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(sx, sy, 9, 0, Math.PI * 2);
          ctx.fill();

          // Inner gleaming core
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();

          // Specular glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx - 2.5, sy - 2.5, 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (isRed) {
          // Distinct glowing Red EXP Orb (10 EXP)
          ctx.beginPath();
          ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
          ctx.fill();
          // Inner bright crimson core
          ctx.fillStyle = '#fecdd3';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Diamond cyan gem shape
          ctx.beginPath();
          ctx.moveTo(sx, sy - 6);
          ctx.lineTo(sx + 5, sy);
          ctx.lineTo(sx, sy + 6);
          ctx.lineTo(sx - 5, sy);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // 4. Render Projectiles
      projectilesRef.current.forEach((proj) => {
        const sx = proj.x - cameraX;
        const sy = proj.y - cameraY;

        ctx.save();
        
        if (proj.isLaser) {
          // Render wide laser beam
          const progress = 1 - (proj.duration / proj.maxDuration);
          const alpha = Math.max(0, progress);
          const angle = Math.atan2(proj.vy, proj.vx);
          
          ctx.translate(sx, sy);
          ctx.rotate(angle);
          
          const beamLength = 1600; // Wide enough to cover screen
          const beamWidth = proj.radius * 2 * alpha;
          
          // Outer glow
          ctx.fillStyle = proj.color;
          ctx.globalAlpha = 0.3 * alpha;
          ctx.fillRect(-20, -beamWidth / 2, beamLength, beamWidth);
          
          // Main beam
          ctx.globalAlpha = 0.6 * alpha;
          ctx.fillRect(-20, -beamWidth / 4, beamLength, beamWidth / 2);
          
          // Core
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.9 * alpha;
          ctx.fillRect(-20, -beamWidth / 8, beamLength, beamWidth / 4);
        } else {
          ctx.shadowColor = proj.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(sx, sy, proj.radius, 0, Math.PI * 2);
          ctx.fill();

          // White core highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, proj.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Render Orbiting Grimoires (if equipped)
      if (grimoireWeapon) {
        const def = ALL_WEAPONS.find((w) => w.id === 'grimoire_orbit')!;
        const tier = def.tiers.find((t) => t.tier === grimoireWeapon.level) || def.tiers[0];
        const bookCount = Math.min(3, def.baseCount + tier.countBonus);
        const orbitRadius = (90 + (tier.sizeBonus || 0) * 1.5) * p.projectileSizeMult;
        const playerScreenX = p.x - cameraX;
        const playerScreenY = p.y - cameraY;
        const bw = (10 + (tier.sizeBonus || 0) * 0.4) * p.projectileSizeMult;
        const bh = (14 + (tier.sizeBonus || 0) * 0.6) * p.projectileSizeMult;

        for (let i = 0; i < bookCount; i++) {
          const bAngle = orbitAngleRef.current + (i / bookCount) * Math.PI * 2;
          const bx = playerScreenX + Math.cos(bAngle) * orbitRadius;
          const by = playerScreenY + Math.sin(bAngle) * orbitRadius;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(bAngle + Math.PI / 2);

          // Glowing Book
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-bw, -bh, bw * 2, bh * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-(bw - 2), -(bh - 2), (bw - 2) * 2, (bh - 2) * 2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-(bw - 2), -(bh - 2), (bw - 2) * 2, (bh - 2) * 2);
          ctx.restore();
        }
      }

      // 6. Render Dash Ghosts
      dashGhostsRef.current.forEach((ghost) => {
        const sx = ghost.x - cameraX;
        const sy = ghost.y - cameraY;
        ctx.save();
        ctx.globalAlpha = ghost.alpha * 0.4;
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Render Enemies
      enemiesRef.current.forEach((enemy) => {
        const sx = enemy.x - cameraX;
        const sy = enemy.y - cameraY;

        ctx.save();

        // Medusa's Eye Slow visual (grayish rendering)
        const mouseScreenX = mouseScreenRef.current.x;
        const mouseScreenY = mouseScreenRef.current.y;
        const distFromCursor = Math.hypot(sx - mouseScreenX, sy - mouseScreenY);
        const hasMedusa = medusaItemRender !== undefined;
        const medusaRad = medusaItemRender ? 20 + medusaItemRender.level * 20 : 0;
        const isMedusaSlowed = hasMedusa && distFromCursor <= medusaRad;

        if (isMedusaSlowed && enemy.hitFlashTimer <= 0) {
          ctx.filter = 'grayscale(85%)';
        }

        const isPitchforkPeasant = enemy.name === 'Pitchfork Peasant' || enemy.type === 'BAT';
        const isTorchPeasant = enemy.name === 'Torch Peasant' || enemy.type === 'WRAITH';
        const isVillageKnightEnemy = enemy.isRed || enemy.name === 'Village Knight';
        const isMiniEye = enemy.type === 'MINI_EYE';

        const customEnemyImg = isPitchforkPeasant
          ? peasantImageRef.current
          : isTorchPeasant
          ? peasantTorchImageRef.current
          : isVillageKnightEnemy
          ? villageKnightImageRef.current
          : null;

        if (customEnemyImg) {
          const img = customEnemyImg;
          const width = enemy.radius * 2 * 1.5;
          const height = width * (img.naturalHeight / img.naturalWidth || 1.0);

          ctx.save();
          ctx.translate(sx, sy);

          // Face moving direction horizontally (same direction sensor as the Witch)
          const facing = enemy.facingDir !== undefined ? enemy.facingDir : (p.x - enemy.x < 0 ? -1 : 1);
          if (facing < 0) {
            ctx.scale(-1, 1);
          }

          ctx.imageSmoothingEnabled = false;
          // If flashing from hit
          if (enemy.hitFlashTimer > 0) {
            ctx.filter = 'brightness(300%)';
          }
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
        } else if (isMiniEye) {
          // Draw Mini Eye
          ctx.save();
          if (enemy.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = '#2b0606';
          }
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pupil
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Hit flash white
          if (enemy.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = enemy.color;
          }

          ctx.shadowColor = enemy.color;
          ctx.shadowBlur = 6;

          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
          ctx.fill();

          // Enemy face / horns / eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(sx - enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(sx + enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Visible Vine Trap overlay if rooted
        if (enemy.vineRootedDuration && enemy.vineRootedDuration > 0) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius + 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx - enemy.radius - 2, sy - enemy.radius - 2);
          ctx.lineTo(sx + enemy.radius + 2, sy + enemy.radius + 2);
          ctx.moveTo(sx + enemy.radius + 2, sy - enemy.radius - 2);
          ctx.lineTo(sx - enemy.radius - 2, sy + enemy.radius + 2);
          ctx.stroke();

          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(sx - enemy.radius - 2, sy, 2.5, 0, Math.PI * 2);
          ctx.arc(sx + enemy.radius + 2, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mini health bar above enemy
        if (enemy.hp < enemy.maxHp) {
          const barW = enemy.radius * 2;
          const barH = 3;
          const barX = sx - enemy.radius;
          const barY = sy - enemy.radius - 8;

          ctx.fillStyle = '#334155';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);

          // Render enemy level above health bar
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#fca5a5';
          ctx.textAlign = 'center';
          ctx.fillText(`Lv.${enemy.level}`, sx, barY - 2);
        }

        ctx.restore();
      });

      // 7b. Render Boss Entity (Carnivore Plant or Haunted Eye, ~10% screen width at top center)
      if (isBossFightRef.current && bossInstanceRef.current) {
        const boss = bossInstanceRef.current;
        const bx = boss.x - cameraX;
        const by = boss.y - cameraY;

        ctx.save();
        const isFlashing = bossHitFlashRef.current > 0;

        if (boss.id === 'carnivore_plant') {
          // Boss Outer Bio-Aura
          ctx.shadowColor = isFlashing ? '#ffffff' : '#10b981';
          ctx.shadowBlur = 24;

          // Animated breathing pulse
          const breath = 1 + 0.05 * Math.sin(survivalTimeRef.current * 3);
          const r = boss.radius * breath;

          // Thorny Vine Collar
          ctx.fillStyle = isFlashing ? '#ffffff' : '#064e3b';
          ctx.beginPath();
          ctx.arc(bx, by, r * 1.25, 0, Math.PI * 2);
          ctx.fill();

          // Spreading thorny leaf petals
          const petals = 8;
          for (let k = 0; k < petals; k++) {
            const pAng = (k / petals) * Math.PI * 2 + survivalTimeRef.current * 0.4;
            const px = bx + Math.cos(pAng) * (r * 1.4);
            const py = by + Math.sin(pAng) * (r * 1.4);

            ctx.fillStyle = isFlashing ? '#ffffff' : '#047857';
            ctx.beginPath();
            ctx.ellipse(px, py, 22, 12, pAng, 0, Math.PI * 2);
            ctx.fill();
          }

          // Main Carnivorous Monster Bulb / Head
          ctx.fillStyle = isFlashing ? '#ffffff' : '#15803d';
          ctx.beginPath();
          ctx.arc(bx, by, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isFlashing ? '#ffffff' : '#86efac';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Snapping Jaws (upper & lower mandibles)
          const jawOpen = 14 + 8 * Math.sin(survivalTimeRef.current * 5);
          ctx.fillStyle = isFlashing ? '#ffffff' : '#450a0a';
          ctx.beginPath();
          ctx.ellipse(bx, by - 4, r * 0.7, jawOpen, 0, 0, Math.PI * 2);
          ctx.fill();

          // Sharp Spiky Teeth in Mouth
          ctx.fillStyle = isFlashing ? '#ffffff' : '#fef08a';
          const teethCount = 7;
          for (let t = 0; t < teethCount; t++) {
            const tx = bx - r * 0.55 + (t / (teethCount - 1)) * (r * 1.1);
            // Upper teeth
            ctx.beginPath();
            ctx.moveTo(tx - 4, by - 4 - jawOpen * 0.7);
            ctx.lineTo(tx + 4, by - 4 - jawOpen * 0.7);
            ctx.lineTo(tx, by - 4);
            ctx.closePath();
            ctx.fill();

            // Lower teeth
            ctx.beginPath();
            ctx.moveTo(tx - 4, by - 4 + jawOpen * 0.7);
            ctx.lineTo(tx + 4, by - 4 + jawOpen * 0.7);
            ctx.lineTo(tx, by - 4);
            ctx.closePath();
            ctx.fill();
          }

          // Glowing Malevolent Yellow / Red Eyes
          ctx.fillStyle = isFlashing ? '#ffffff' : '#facc15';
          ctx.beginPath();
          ctx.arc(bx - r * 0.45, by - r * 0.5, 7, 0, Math.PI * 2);
          ctx.arc(bx + r * 0.45, by - r * 0.5, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.arc(bx - r * 0.45, by - r * 0.5, 3.5, 0, Math.PI * 2);
          ctx.arc(bx + r * 0.45, by - r * 0.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (boss.id === 'night_bear') {
          // NightBear Boss Rendering
          const r = boss.radius;
          const isCharging = nightBearStateRef.current === 'CHARGING';
          const isDizzy = nightBearStateRef.current === 'DIZZY';
          const isTelegraph = nightBearStateRef.current === 'TELEGRAPH';
          
          // Aura
          ctx.shadowColor = isFlashing ? '#ffffff' : (isCharging ? '#ef4444' : '#3b2f2f');
          ctx.shadowBlur = isCharging ? 30 : 15;

          // Shake if charging or telegraphing
          let offsetX = 0;
          let offsetY = 0;
          if (isTelegraph) {
            offsetX = (Math.random() - 0.5) * 6;
            offsetY = (Math.random() - 0.5) * 6;
          }

          // Main body (Hulking Beast)
          ctx.fillStyle = isFlashing ? '#ffffff' : '#1c1917';
          ctx.beginPath();
          ctx.arc(bx + offsetX, by + offsetY, r * 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Ears
          ctx.fillStyle = isFlashing ? '#ffffff' : '#1c1917';
          ctx.beginPath();
          ctx.arc(bx + offsetX - r * 0.7, by + offsetY - r * 0.8, r * 0.4, 0, Math.PI * 2);
          ctx.arc(bx + offsetX + r * 0.7, by + offsetY - r * 0.8, r * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          if (isDizzy) {
            // X Eyes
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 3;
            // Left X
            ctx.beginPath();
            ctx.moveTo(bx + offsetX - r * 0.5, by + offsetY - r * 0.2);
            ctx.lineTo(bx + offsetX - r * 0.2, by + offsetY + r * 0.1);
            ctx.moveTo(bx + offsetX - r * 0.2, by + offsetY - r * 0.2);
            ctx.lineTo(bx + offsetX - r * 0.5, by + offsetY + r * 0.1);
            ctx.stroke();
            // Right X
            ctx.beginPath();
            ctx.moveTo(bx + offsetX + r * 0.2, by + offsetY - r * 0.2);
            ctx.lineTo(bx + offsetX + r * 0.5, by + offsetY + r * 0.1);
            ctx.moveTo(bx + offsetX + r * 0.5, by + offsetY - r * 0.2);
            ctx.lineTo(bx + offsetX + r * 0.2, by + offsetY + r * 0.1);
            ctx.stroke();
          } else {
            // Glowing red eyes
            ctx.fillStyle = isTelegraph ? '#ff0000' : '#ef4444';
            ctx.beginPath();
            ctx.arc(bx + offsetX - r * 0.4, by + offsetY - r * 0.1, 6, 0, Math.PI * 2);
            ctx.arc(bx + offsetX + r * 0.4, by + offsetY - r * 0.1, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(bx + offsetX - r * 0.4, by + offsetY - r * 0.1, 2, 0, Math.PI * 2);
            ctx.arc(bx + offsetX + r * 0.4, by + offsetY - r * 0.1, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Snout
          ctx.fillStyle = isFlashing ? '#ffffff' : '#292524';
          ctx.beginPath();
          ctx.ellipse(bx + offsetX, by + offsetY + r * 0.3, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Nose
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(bx + offsetX, by + offsetY + r * 0.25, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (boss.id === 'haunted_eye') {
          // Haunted Eye Boss Rendering (Wide Panoramic Occult Entity)
          const eyePhase = eyePhaseRef.current;
          const rx = boss.widthRadius || 155;
          const ry = boss.heightRadius || 55;

          // Outer Occult Eye Aura
          ctx.shadowColor = isFlashing ? '#ffffff' : (eyePhase === 'OPEN' ? '#ef4444' : '#7f1d1d');
          ctx.shadowBlur = eyePhase === 'OPEN' ? 32 : 18;

          // Floating bobbing effect
          const bobY = Math.sin(survivalTimeRef.current * 3) * 4;
          const eyeY = by + bobY;

          // Eyelid / Socket Border (Giant Wide Panoramic Almond shape)
          ctx.fillStyle = isFlashing ? '#ffffff' : '#2b0606';
          ctx.beginPath();
          ctx.ellipse(bx, eyeY, rx * 1.15, ry * 1.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isFlashing ? '#ffffff' : (eyePhase === 'OPEN' ? '#ef4444' : '#991b1b');
          ctx.lineWidth = 3.5;
          ctx.stroke();

          if (eyePhase === 'CLOSED') {
            // Eyelids tightly closed across wide span
            ctx.fillStyle = isFlashing ? '#ffffff' : '#3f0c10';
            ctx.beginPath();
            ctx.ellipse(bx, eyeY, rx * 1.05, ry * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sleeping dark veins
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(bx - rx * 0.7, eyeY - 12);
            ctx.lineTo(bx - rx * 0.25, eyeY - 3);
            ctx.moveTo(bx + rx * 0.7, eyeY - 14);
            ctx.lineTo(bx + rx * 0.3, eyeY - 4);
            ctx.moveTo(bx - rx * 0.5, eyeY + 12);
            ctx.lineTo(bx - rx * 0.15, eyeY + 4);
            ctx.moveTo(bx + rx * 0.55, eyeY + 14);
            ctx.lineTo(bx + rx * 0.2, eyeY + 5);
            ctx.stroke();
          } else if (eyePhase === 'WARNING') {
            // Eyelids twitching and opening slightly with bright red light
            const jitterX = (Math.random() - 0.5) * 3;
            const jitterY = (Math.random() - 0.5) * 3;

            ctx.fillStyle = '#4c0519';
            ctx.beginPath();
            ctx.ellipse(bx + jitterX, eyeY + jitterY, rx * 1.05, ry * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();

            // Parted slit leaking fiery light along wide width
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 22;
            ctx.beginPath();
            ctx.ellipse(bx + jitterX, eyeY + jitterY, rx * 0.85, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.stroke();

            // "Look Away!" alert in red in the center of the screen, fixed (not following player) and bigger
            ctx.save();
            ctx.font = '900 46px sans-serif';
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#dc2626';
            ctx.shadowBlur = 24;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Look Away!', canvas.width / 2, canvas.height / 2);
            ctx.restore();
          } else if (eyePhase === 'OPEN') {
            // Sclera (eyeball white)
            ctx.fillStyle = isFlashing ? '#ffffff' : '#fff1f2';
            ctx.beginPath();
            ctx.ellipse(bx, eyeY, rx * 1.05, ry * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bloodshot veins spreading from wide sides toward center
            ctx.strokeStyle = 'rgba(225, 29, 72, 0.75)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(bx - rx * 0.92, eyeY);
            ctx.lineTo(bx - rx * 0.5, eyeY - 8);
            ctx.moveTo(bx - rx * 0.92, eyeY);
            ctx.lineTo(bx - rx * 0.5, eyeY + 8);
            ctx.moveTo(bx - rx * 0.6, eyeY - 5);
            ctx.lineTo(bx - rx * 0.25, eyeY - 12);
            ctx.moveTo(bx + rx * 0.92, eyeY);
            ctx.lineTo(bx + rx * 0.5, eyeY - 8);
            ctx.moveTo(bx + rx * 0.92, eyeY);
            ctx.lineTo(bx + rx * 0.5, eyeY + 8);
            ctx.moveTo(bx + rx * 0.6, eyeY + 5);
            ctx.lineTo(bx + rx * 0.25, eyeY + 12);
            ctx.stroke();

            // Iris looking towards player instead of mouse cursor
            const targetScreenX = p.x - cameraX;
            const targetScreenY = p.y - cameraY;
            const lookDistX = Math.min(rx * 0.45, Math.abs(targetScreenX - bx) * 0.15) * Math.sign(targetScreenX - bx || 1);
            const lookDistY = Math.min(ry * 0.35, Math.abs(targetScreenY - eyeY) * 0.1) * Math.sign(targetScreenY - eyeY || 1);
            const irisX = bx + lookDistX;
            const irisY = eyeY + lookDistY;

            // Keep mouse cursor coordinates defined for the LOOK AWAY restriction mechanics below
            const mouseScreenX = mouseScreenRef.current.x;
            const mouseScreenY = mouseScreenRef.current.y;

            // Outer Iris
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.ellipse(irisX, irisY, 26, 22, 0, 0, Math.PI * 2);
            ctx.fill();

            // Middle Iris
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.ellipse(irisX, irisY, 19, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.ellipse(irisX, irisY, 11, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Inner glowing dot
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(irisX - 3, irisY - 2, 3, 0, Math.PI * 2);
            ctx.fill();

            // --- CURSOR RESTRICTION (LOOK AWAY: Y > WITCH) MECHANIC VISUALS ---
            const activeCamY = lockedCameraRef.current.y;
            const mouseWorldY = activeCamY + mouseScreenY;
            const isCursorForbidden = mouseWorldY <= p.y;
            const witchScreenY = p.y - cameraY;

            // Only show the line showing where the cursor needs to be during the first time the attack is used in the run
            const showGuideLine = eyeOpenAttackCountRef.current <= 1;

            ctx.save();
            if (isCursorForbidden) {
              // Danger tint on forbidden upper side (y <= witchScreenY, pointing towards boss)
              ctx.fillStyle = 'rgba(239, 68, 68, 0.09)';
              ctx.fillRect(0, 0, canvas.width, witchScreenY);

              if (showGuideLine) {
                // Pulsing bright red horizontal dividing line through the Witch
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.moveTo(0, witchScreenY);
                ctx.lineTo(canvas.width, witchScreenY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Warning Tag
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#fca5a5';
                ctx.textAlign = 'left';
                ctx.fillText('⚠️ FORBIDDEN ZONE (AIM AWAY FROM BOSS: Y > WITCH) - 20 DPS!', 16, Math.max(25, witchScreenY - 14));
              }

              // Warning reticle on cursor
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(mouseScreenX, mouseScreenY, 22 + Math.sin(survivalTimeRef.current * 12) * 4, 0, Math.PI * 2);
              ctx.stroke();

              ctx.font = 'bold 11px sans-serif';
              ctx.fillStyle = '#ff2222';
              ctx.textAlign = 'center';
              ctx.fillText('20 DPS!', mouseScreenX, mouseScreenY + 36);
            } else {
              if (showGuideLine) {
                // Safe zone indicator: subtle emerald horizontal line
                ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.moveTo(0, witchScreenY);
                ctx.lineTo(canvas.width, witchScreenY);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.font = 'bold 10px sans-serif';
                ctx.fillStyle = 'rgba(110, 231, 183, 0.85)';
                ctx.textAlign = 'left';
                ctx.fillText('✓ SAFE ZONE (AWAY FROM BOSS: CURSOR Y > WITCH)', 16, Math.min(canvas.height - 15, witchScreenY + 20));
              }
            }
            ctx.restore();
          }
        }

        ctx.restore();
      }

      // 8. Render THE WITCH (Main Character - Rendered dynamically at player position on screen)
      const playerScreenX = p.x - cameraX;
      const playerScreenY = p.y - cameraY;

      ctx.save();
      if (witchImageRef.current) {
        const img = witchImageRef.current;
        // Balance dimensions: base width on player radius, 1:1 square ratio for pixel art sprite
        const width = p.radius * 2 * 1.5;
        const height = width * (img.naturalHeight / img.naturalWidth || 1.0);

        ctx.translate(playerScreenX, playerScreenY);

        // Flip horizontally if moving left
        if (lastMoveDirRef.current.dx < 0) {
          ctx.scale(-1, 1);
        }

        ctx.imageSmoothingEnabled = false;
        // Draw centered at translated origin
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
      } else {
        // Body robe
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#581c87';
        ctx.fill();

        // Witch Hat brim & cone
        ctx.fillStyle = '#110c1c';
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(playerScreenX, playerScreenY - 4, 15, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(playerScreenX - 7, playerScreenY - 5);
        ctx.lineTo(playerScreenX + 7, playerScreenY - 5);
        ctx.lineTo(playerScreenX, playerScreenY - 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Purple ribbon & gold buckle on hat
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(playerScreenX - 5.5, playerScreenY - 7.5, 11, 2.2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(playerScreenX - 1.5, playerScreenY - 8, 3, 2.8);

        // Face
        ctx.fillStyle = '#fce7f3';
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY + 3, 7, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Eyes
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(playerScreenX - 2.5, playerScreenY + 2, 1.2, 0, Math.PI * 2);
        ctx.arc(playerScreenX + 2.5, playerScreenY + 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 9. Render Particles
      particlesRef.current.forEach((pt) => {
        const sx = pt.x - cameraX;
        const sy = pt.y - cameraY;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(sx, sy, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 10. Render Floating Combat Damage Texts
      if (damageNumbersEnabledRef.current !== false) {
        floatingTextsRef.current.forEach((ft) => {
          const sx = ft.x - cameraX;
          const sy = ft.y - cameraY;
          const progress = ft.life / ft.maxLife;

          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = ft.color;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, sx, sy);
          ctx.restore();
        });
      }

      // 11. Custom Crosshair at Mouse
      ctx.save();
      const mx = mouseScreenRef.current.x;
      const my = mouseScreenRef.current.y;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.moveTo(mx - 12, my);
      ctx.lineTo(mx + 12, my);
      ctx.moveTo(mx, my - 12);
      ctx.lineTo(mx, my + 12);
      ctx.stroke();
      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    onGameOver,
    onTriggerLevelUp,
    onTriggerWitchDeal,
    onUpdatePlayer,
    onUpdateSurvivalTime,
  ]);

  // Window Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      id="witch-nights-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair block"
    />
  );
};
