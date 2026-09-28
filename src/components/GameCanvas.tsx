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
  MobileAimMode,
  BossInstance,
  BossAttack,
  BossDefinition,
  CharacterDefinition,
} from '../types/game';
import {
  ALL_WEAPONS,
  ALL_STAT_ITEMS,
  getExpNeededForLevel,
  getEnemyLevel,
  getEnemyBaseHp,
  calculateFoodHealAmount,
  WITCH_DEALS,
  BOSS_POOL,
  CHARACTERS,
  getBossHomeMap,
} from '../data/gameData';
import { soundEngine } from '../utils/audio';
import { resolveAssetPath } from '../utils/assets';
import {
  GERALDO_RED_DATA_URI,
  GERALDO_GREEN_DATA_URI,
  GERALDO_BLUE_DATA_URI,
  GERALDO_RGB_DATA_URI,
  GOOGOLBRA_HEAD_DATA_URI,
  GOOGOLBRA_BODY_DATA_URI,
} from '../utils/localDataUris';
import { getLanguage, translateBossName, translateMapName, UI_TRANSLATIONS } from '../utils/i18n';

export const BUNNARY_MESSAGES = [
  "01000011 01100001 01101110 01101111 01101110 01010100 00110100 01010100 01011001 01110101 01000010 01111001",
  "01001100 01100101 01110011 01100010 01101001 01100001 01101110 01110011",
  "01010000 01101001 01001001 01110011 01000011 01101111 01101111 01101100",
  "01001110 01100101 01110010 01100100",
];

function generateGoogolbraSpiralPath(camX: number, camY: number, width: number, height: number) {
  const tileSize = 80;
  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);
  const path: { x: number; y: number; col: number; row: number; dirX: number; dirY: number }[] = [];

  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;

  while (top <= bottom && left <= right) {
    // 1. Moving top-right to top-left
    for (let c = right; c >= left; c--) {
      path.push({
        col: c,
        row: top,
        x: camX + c * tileSize + tileSize / 2,
        y: camY + top * tileSize + tileSize / 2,
        dirX: -1,
        dirY: 0,
      });
    }
    top++;
    if (top > bottom) break;

    // 2. Moving top-left to bottom-left
    for (let r = top; r <= bottom; r++) {
      path.push({
        col: left,
        row: r,
        x: camX + left * tileSize + tileSize / 2,
        y: camY + r * tileSize + tileSize / 2,
        dirX: 0,
        dirY: 1,
      });
    }
    left++;
    if (left > right) break;

    // 3. Moving bottom-left to bottom-right
    for (let c = left; c <= right; c++) {
      path.push({
        col: c,
        row: bottom,
        x: camX + c * tileSize + tileSize / 2,
        y: camY + bottom * tileSize + tileSize / 2,
        dirX: 1,
        dirY: 0,
      });
    }
    bottom--;
    if (top > bottom) break;

    // 4. Moving bottom-right to top-right
    for (let r = bottom; r >= top; r--) {
      path.push({
        col: right,
        row: r,
        x: camX + right * tileSize + tileSize / 2,
        y: camY + r * tileSize + tileSize / 2,
        dirX: 0,
        dirY: -1,
      });
    }
    right--;
  }

  return path;
}

function getPathPointAtProgress(
  path: { x: number; y: number; dirX: number; dirY: number }[],
  progress: number
): { x: number; y: number; dirX: number; dirY: number; angle: number } | null {
  if (!path || path.length === 0) return null;

  if (progress <= 0) {
    const first = path[0];
    const tileSteps = Math.floor(-progress);
    const distBack = tileSteps * 80;
    const x = first.x - first.dirX * distBack;
    const y = first.y - first.dirY * distBack;
    const angle = Math.atan2(first.dirY, first.dirX);
    return { x, y, dirX: first.dirX, dirY: first.dirY, angle };
  }

  if (progress >= path.length - 1) {
    const last = path[path.length - 1];
    const tileSteps = Math.floor(progress - (path.length - 1));
    const distForward = tileSteps * 80;
    const x = last.x + last.dirX * distForward;
    const y = last.y + last.dirY * distForward;
    const angle = Math.atan2(last.dirY, last.dirX);
    return { x, y, dirX: last.dirX, dirY: last.dirY, angle };
  }

  // Classic Snake Game discrete tile snapping:
  // Snaps head and body segments to exact 80px tile centers instead of smooth sub-pixel sliding
  const idx = Math.min(path.length - 1, Math.max(0, Math.floor(progress)));
  const p1 = path[idx];
  const nextIdx = Math.min(path.length - 1, idx + 1);
  const p2 = path[nextIdx];

  const x = p1.x;
  const y = p1.y;
  const dirX = p2.x !== p1.x ? Math.sign(p2.x - p1.x) : p1.dirX;
  const dirY = p2.y !== p1.y ? Math.sign(p2.y - p1.y) : p1.dirY;
  const angle = Math.atan2(p2.y !== p1.y ? p2.y - p1.y : dirY, p2.x !== p1.x ? p2.x - p1.x : dirX);

  return { x, y, dirX, dirY, angle };
}

function getFibonacciNumber(n: number): bigint {
  if (n <= 0) return 0n;
  if (n === 1 || n === 2) return 1n;
  let a = 1n, b = 1n;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

function getFibonacciQuestionText(n: number, lang: string): string {
  const ordinalsEn = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
    'Twenty-First', 'Twenty-Second', 'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth', 'Twenty-Sixth', 'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth',
    'Thirty-First', 'Thirty-Second', 'Thirty-Third', 'Thirty-Fourth', 'Thirty-Fifth', 'Thirty-Sixth', 'Thirty-Seventh', 'Thirty-Eighth', 'Thirty-Ninth', 'Fortieth',
    'Forty-First', 'Forty-Second', 'Forty-Third', 'Forty-Fourth', 'Forty-Fifth', 'Forty-Sixth', 'Forty-Seventh', 'Forty-Eighth', 'Forty-Ninth', 'Fiftieth'];
  const ordinalsPt = ['', 'Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto', 'Sexto', 'Sétimo', 'Oitavo', 'Nono', 'Décimo',
    'Décimo Primeiro', 'Décimo Segundo', 'Décimo Terceiro', 'Décimo Quarto', 'Décimo Quinto', 'Décimo Sexto', 'Décimo Sétimo', 'Décimo Oitavo', 'Décimo Nono', 'Vigésimo',
    'Vigésimo Primeiro', 'Vigésimo Segundo', 'Vigésimo Terceiro', 'Vigésimo Quarto', 'Vigésimo Quinto', 'Vigésimo Sexto', 'Vigésimo Sétimo', 'Vigésimo Oitavo', 'Vigésimo Nono', 'Trigésimo',
    'Trigésimo Primeiro', 'Trigésimo Segundo', 'Trigésimo Terceiro', 'Trigésimo Quarto', 'Trigésimo Quinto', 'Trigésimo Sexto', 'Trigésimo Sétimo', 'Trigésimo Oitavo', 'Trigésimo Nono', 'Quadragésimo',
    'Quadragésimo Primeiro', 'Quadragésimo Segundo', 'Quadragésimo Terceiro', 'Quadragésimo Quarto', 'Quadragésimo Quinto', 'Quadragésimo Sexto', 'Quadragésimo Sétimo', 'Quadragésimo Oitavo', 'Quadragésimo Nono', 'Quinquagésimo'];
  
  if (lang === 'pt-BR') {
    const ord = ordinalsPt[n] || `${n}º`;
    return `${ord} Número de Fibonacci`;
  } else {
    const ord = ordinalsEn[n] || `${n}th`;
    return `${ord} Fibonacci Number`;
  }
}

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
    warningTimer: 1.5, // 1.5s telegraph warning
    activeTimer: 0.40,
    duration: 1.90,
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
  character?: CharacterDefinition;
  survivalTime: number;
  bossCountdown?: number;
  gameSpeed: number;
  isPaused: boolean;
  dashMode?: DashMode;
  screenShakeEnabled?: boolean;
  damageNumbersEnabled?: boolean;
  isClickToMoveActive?: boolean;
  mobileMode?: boolean;
  mobileAimMode?: MobileAimMode;
  instaKill?: boolean;
  invincibility?: boolean;
  isBossRush?: boolean;
  bossRushQueue?: string[];
  isTrueWitchMode?: boolean;
  onTogglePause?: () => void;
  onUpdatePlayer: (stats: Partial<PlayerStats>) => void;
  onUpdateSurvivalTime: (time: number, mapId?: string) => void;
  onUpdateBossCountdown?: (countdown: number) => void;
  onTriggerLevelUp: (extraLevels?: number) => void;
  onTriggerWitchDeal: (curses: CurseChoice[]) => void;
  onGameOver: (finalStats: { time: number; level: number; kills: number; bossesKilled: number; totalDamage?: number; killerName?: string; isVictory?: boolean; mapId?: string; isFullBossRush?: boolean }) => void;
  onItemUnlocked: (type: 'WEAPON' | 'STAT' | 'CURSE', id: string) => void;
  onEnemyDefeated?: (enemyId: string) => void;
  onUnlockItem?: (itemId: string) => void;
  onBossDefeated?: (bossId: string) => void;
  onBossUpdate?: (boss: BossInstance | null, isFight: boolean, timer: number, hp: number) => void;
  onTriggerBossSelection?: (bosses: BossDefinition[]) => void;
  onBossIncoming?: (boss: BossDefinition) => void;
  selectedMap?: string;
}

export const GameCanvasComponent: React.FC<GameCanvasProps> = ({
  player,
  weapons,
  statItems,
  character,
  survivalTime,
  bossCountdown,
  gameSpeed,
  isPaused,
  dashMode = 'MOVEMENT',
  screenShakeEnabled = true,
  damageNumbersEnabled = true,
  isClickToMoveActive = false,
  mobileMode = false,
  mobileAimMode = 'JOYSTICK',
  instaKill = false,
  invincibility = false,
  isBossRush = false,
  bossRushQueue,
  isTrueWitchMode = false,
  selectedMap = 'village_outskirts',
  onTogglePause,
  onUpdatePlayer,
  onUpdateSurvivalTime,
  onUpdateBossCountdown,
  onTriggerLevelUp,
  onTriggerWitchDeal,
  onGameOver: rawOnGameOver,
  onItemUnlocked,
  onEnemyDefeated,
  onUnlockItem,
  onBossDefeated,
  onBossUpdate,
  onTriggerBossSelection,
  onBossIncoming,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const witchImageRef = useRef<HTMLImageElement | null>(null);
  const peasantImageRef = useRef<HTMLImageElement | null>(null);
  const peasantTorchImageRef = useRef<HTMLImageElement | null>(null);
  const unocondaImageRef = useRef<HTMLImageElement | null>(null);
  const viiiperImageRef = useRef<HTMLImageElement | null>(null);
  const villageKnightImageRef = useRef<HTMLImageElement | null>(null);
  const obMooseImageRef = useRef<HTMLImageElement | null>(null);
  const spectralArrowImageRef = useRef<HTMLImageElement | null>(null);
  const sickleImageRef = useRef<HTMLImageElement | null>(null);
  const stellarBeamImageRef = useRef<HTMLImageElement | null>(null);
  const pentagramImageRef = useRef<HTMLImageElement | null>(null);
  const groundTileImageRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const mathTile1Ref = useRef<HTMLImageElement | null>(null);
  const mathTile2Ref = useRef<HTMLImageElement | null>(null);
  const mathTile3Ref = useRef<HTMLImageElement | null>(null);
  const mathTile4Ref = useRef<HTMLImageElement | null>(null);
  const mathTileBlankRef = useRef<HTMLImageElement | null>(null);
  const blackHoneyTileImageRef = useRef<HTMLImageElement | null>(null);
  const miniEyeImageRef = useRef<HTMLImageElement | null>(null);
  const hauntedEyeOpenImageRef = useRef<HTMLImageElement | null>(null);
  const hauntedEyeOpeningImageRef = useRef<HTMLImageElement | null>(null);
  const hauntedEyeClosedImageRef = useRef<HTMLImageElement | null>(null);
  const carnivorePlantImageRef = useRef<HTMLImageElement | null>(null);
  const carnivorePlantClosedImageRef = useRef<HTMLImageElement | null>(null);
  const nightBearImageRef = useRef<HTMLImageElement | null>(null);
  const nightBearDizzyImageRef = useRef<HTMLImageElement | null>(null);
  const rockThrowerImageRef = useRef<HTMLImageElement | null>(null);
  const rockProjectileImageRef = useRef<HTMLImageElement | null>(null);
  const bunnary0ImageRef = useRef<HTMLImageElement | null>(null);
  const bunnary1ImageRef = useRef<HTMLImageElement | null>(null);
  const bunnaryBlankImageRef = useRef<HTMLImageElement | null>(null);
  const bunnaryEndImageRef = useRef<HTMLImageElement | null>(null);
  const bunnaryPelletImageRef = useRef<HTMLImageElement | null>(null);
  const grimoireImageRef = useRef<HTMLImageElement | null>(null);
  const astralBladeImageRef = useRef<HTMLImageElement | null>(null);
  const geraldoRedImageRef = useRef<HTMLImageElement | null>(null);
  const geraldoGreenImageRef = useRef<HTMLImageElement | null>(null);
  const geraldoBlueImageRef = useRef<HTMLImageElement | null>(null);
  const geraldoRgbImageRef = useRef<HTMLImageElement | null>(null);

  const phiboccionImageRef = useRef<HTMLImageElement | null>(null);
  const phiboccionKickingImageRef = useRef<HTMLImageElement | null>(null);
  const landPhineImageRef = useRef<HTMLImageElement | null>(null);
  const landPhineBlinkingImageRef = useRef<HTMLImageElement | null>(null);

  const googolbraHeadImageRef = useRef<HTMLImageElement | null>(null);
  const googolbraBodyImageRef = useRef<HTMLImageElement | null>(null);

  const pythagorasImageRef = useRef<HTMLImageElement | null>(null);
  const rulerImageRef = useRef<HTMLImageElement | null>(null);
  const setsquareImageRef = useRef<HTMLImageElement | null>(null);
  const protractorImageRef = useRef<HTMLImageElement | null>(null);

  // Load Character Sprite dynamically based on selected character (prioritizing local bundled assets)
  useEffect(() => {
    const rawSprite = character?.spriteUrl || 'assets/aistudio/witch.png';
    const rawFallback = character?.fallbackSpriteUrl || 'assets/aistudio/witch.png';

    // Prioritize local bundled asset or data URI first
    const isPrimaryLocal = rawSprite.startsWith('assets/') || rawSprite.startsWith('data:');
    const primarySrc = isPrimaryLocal ? rawSprite : (rawFallback.startsWith('assets/') || rawFallback.startsWith('data:') ? rawFallback : rawSprite);
    const secondarySrc = primarySrc === rawSprite ? rawFallback : rawSprite;

    const img = new Image();
    if (!primarySrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = resolveAssetPath(primarySrc);
    img.onload = () => {
      witchImageRef.current = img;
    };
    img.onerror = () => {
      const fallback = new Image();
      if (!secondarySrc.startsWith('data:')) {
        fallback.crossOrigin = 'anonymous';
      }
      fallback.src = resolveAssetPath(secondarySrc);
      fallback.onload = () => {
        witchImageRef.current = fallback;
      };
    };
  }, [character?.spriteUrl, character?.fallbackSpriteUrl]);

  useEffect(() => {
    const loadImage = (
      primarySrc: string,
      fallbackRelativePath: string,
      targetRef: React.MutableRefObject<HTMLImageElement | null>,
      dataUriFallback?: string
    ) => {
      const candidates: string[] = [];
      if (fallbackRelativePath) {
        candidates.push(resolveAssetPath(fallbackRelativePath));
        if (fallbackRelativePath.includes('assets/aistudio/')) {
          candidates.push(resolveAssetPath(fallbackRelativePath.replace('assets/aistudio/', 'assets/')));
        }
        const fileName = fallbackRelativePath.split('/').pop();
        if (fileName) {
          candidates.push(resolveAssetPath(fileName));
          candidates.push(resolveAssetPath(`sprites/characters/${fileName}`));
        }
      }
      if (primarySrc) {
        candidates.push(resolveAssetPath(primarySrc));
      }
      if (dataUriFallback) {
        candidates.push(dataUriFallback);
      }

      let currentIndex = 0;
      const tryNext = () => {
        if (currentIndex >= candidates.length) return;
        const src = candidates[currentIndex++];
        const img = new Image();
        if (src.startsWith('http://') || src.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          targetRef.current = img;
        };
        img.onerror = () => {
          tryNext();
        };
        img.src = src;
      };

      tryNext();
    };

    loadImage('https://i.imgur.com/kKhEjFq.png', 'assets/aistudio/peasant_pitchfork.png', peasantImageRef);
    loadImage('https://i.imgur.com/VMPhtDP.png', 'assets/aistudio/peasant_torch.png', peasantTorchImageRef);
    loadImage('https://i.imgur.com/KncCJpG.png', 'assets/aistudio/unoconda.png', unocondaImageRef);
    loadImage('https://i.imgur.com/eKjiE6b.png', 'assets/aistudio/viiiper.png', viiiperImageRef);
    loadImage('https://i.imgur.com/iHevmHN.png', 'assets/aistudio/village_knight.png', villageKnightImageRef);
    loadImage('https://i.imgur.com/AbmtRP2.png', 'assets/aistudio/obmoose.png', obMooseImageRef);
    loadImage('https://i.imgur.com/Xn8yFcZ.png', 'assets/aistudio/spectral_arrow.png', spectralArrowImageRef);
    loadImage('https://i.imgur.com/3Op1go9.png', 'assets/aistudio/stellar_beam.png', stellarBeamImageRef);
    loadImage('https://i.imgur.com/DikcnTS.png', 'assets/aistudio/pentagram.png', pentagramImageRef);
    loadImage('https://i.imgur.com/TYQ1jE7.png', 'assets/aistudio/sickle.png', sickleImageRef);

    // Procedural stone tile texture for instant seamless display with no network delay or CORS seams
    const createProceduralGround = (): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = 80;
      c.height = 80;
      const cctx = c.getContext('2d');
      if (cctx) {
        cctx.fillStyle = '#140c24';
        cctx.fillRect(0, 0, 80, 80);
        cctx.fillStyle = '#170f2b';
        cctx.fillRect(4, 4, 72, 72);
        cctx.fillStyle = '#1b1232';
        cctx.fillRect(8, 8, 64, 64);
        cctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        cctx.fillRect(12, 12, 56, 56);
      }
      return c;
    };
    groundTileImageRef.current = createProceduralGround();

    const groundImg = new Image();
    groundImg.src = resolveAssetPath('assets/aistudio/ground_tile.png');
    groundImg.onload = () => {
      groundTileImageRef.current = groundImg;
    };
    groundImg.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.src = 'https://i.imgur.com/qe0cqr1.png';
      fallback.onload = () => {
        groundTileImageRef.current = fallback;
      };
    };

    loadImage('https://i.imgur.com/w1wX8hT.png', 'assets/math_tile_1.png', mathTile1Ref);
    loadImage('https://i.imgur.com/4LZqEmj.png', 'assets/math_tile_2.png', mathTile2Ref);
    loadImage('https://i.imgur.com/BPzzv1Y.png', 'assets/math_tile_3.png', mathTile3Ref);
    loadImage('https://i.imgur.com/oKggJ2g.png', 'assets/math_tile_4.png', mathTile4Ref);
    loadImage('https://i.imgur.com/G1XlFzU.png', 'assets/math_tile_blank.png', mathTileBlankRef);
    loadImage('https://i.imgur.com/ZrLFBRE.png', 'assets/black_honey_tile.png', blackHoneyTileImageRef);

    loadImage('https://i.imgur.com/p2eqvL6.png', 'assets/aistudio/mini_eye.png', miniEyeImageRef);
    loadImage('https://i.imgur.com/caqAbHC.png', 'assets/aistudio/haunted_eye_open.png', hauntedEyeOpenImageRef);
    loadImage('https://i.imgur.com/hGKp8kz.png', 'assets/aistudio/haunted_eye_opening.png', hauntedEyeOpeningImageRef);
    loadImage('https://i.imgur.com/kFDmaSo.png', 'assets/aistudio/haunted_eye_closed.png', hauntedEyeClosedImageRef);
    loadImage('https://i.imgur.com/kaNPLzb.png', 'assets/aistudio/carnivore_plant.png', carnivorePlantImageRef);
    loadImage('https://i.imgur.com/cvf1t1u.png', 'assets/aistudio/carnivore_plant_closed.png', carnivorePlantClosedImageRef);
    loadImage('https://i.imgur.com/Pjkp2on.png', 'assets/aistudio/night_bear.png', nightBearImageRef);
    loadImage('https://i.imgur.com/urcHgH1.png', 'assets/aistudio/night_bear_dizzy.png', nightBearDizzyImageRef);
    loadImage('https://i.imgur.com/ST9LA1d.png', 'assets/aistudio/rock_thrower.png', rockThrowerImageRef);
    loadImage('https://i.imgur.com/UTAWfui.png', 'assets/aistudio/rock_projectile.png', rockProjectileImageRef);
    loadImage('https://i.imgur.com/90lSZbP.png', 'assets/aistudio/bunnary_0.png', bunnary0ImageRef);
    loadImage('https://i.imgur.com/QzUsisb.png', 'assets/aistudio/bunnary_1.png', bunnary1ImageRef);
    loadImage('https://i.imgur.com/FgtlESH.png', 'assets/aistudio/bunnary_blank.png', bunnaryBlankImageRef);
    loadImage('https://i.imgur.com/jGKPWKu.png', 'assets/aistudio/bunnary_end_sentence.png', bunnaryEndImageRef);
    loadImage('https://i.imgur.com/mPFgOY7.png', 'assets/aistudio/bunnary_pellet.png', bunnaryPelletImageRef);
    loadImage('https://i.imgur.com/VqRnYzc.png', 'assets/aistudio/grimoire.png', grimoireImageRef);
    loadImage('https://i.imgur.com/wP5Mlu1.png', 'assets/aistudio/astral_blade.png', astralBladeImageRef);
    const redCharUri = CHARACTERS.find((c) => c.id === 'geraldo')?.fallbackSpriteUrl;
    const greenCharUri = CHARACTERS.find((c) => c.id === 'geraldo_green')?.fallbackSpriteUrl;
    const blueCharUri = CHARACTERS.find((c) => c.id === 'geraldo_blue')?.fallbackSpriteUrl;

    loadImage('https://i.imgur.com/v80iCki.png', 'assets/aistudio/geraldo.png', geraldoRedImageRef, GERALDO_RED_DATA_URI);
    loadImage('https://i.imgur.com/k6tO808.png', 'assets/aistudio/geraldo_green.png', geraldoGreenImageRef, GERALDO_GREEN_DATA_URI);
    loadImage('https://i.imgur.com/f9W9M5Z.png', 'assets/aistudio/geraldo_blue.png', geraldoBlueImageRef, GERALDO_BLUE_DATA_URI);
    loadImage('https://i.imgur.com/w8qU2F1.png', 'assets/aistudio/geraldo_rgb.png', geraldoRgbImageRef, GERALDO_RGB_DATA_URI);

    loadImage('https://i.imgur.com/g0AgJ3Y.png', 'assets/aistudio/phiboccion.png', phiboccionImageRef);
    loadImage('https://i.imgur.com/7gN6fD5.png', 'assets/aistudio/phiboccion_kicking.png', phiboccionKickingImageRef);
    loadImage('https://i.imgur.com/ioiFCOw.png', 'assets/aistudio/land_phi_ne.png', landPhineImageRef);
    loadImage('https://i.imgur.com/0TT8WLi.png', 'assets/aistudio/land_phi_ne_blinking.png', landPhineBlinkingImageRef);

    loadImage('https://i.imgur.com/HJ9tJm7.png', 'assets/aistudio/googolbra_head.png', googolbraHeadImageRef, GOOGOLBRA_HEAD_DATA_URI);
    loadImage('https://i.imgur.com/4Kvs0qj.png', 'assets/aistudio/googolbra_body.png', googolbraBodyImageRef, GOOGOLBRA_BODY_DATA_URI);

    loadImage('https://i.imgur.com/APbtbDS.png', 'assets/aistudio/pythagoras.png', pythagorasImageRef);
    loadImage('https://i.imgur.com/NGSgVv0.png', 'assets/aistudio/ruler.png', rulerImageRef);
    loadImage('https://i.imgur.com/7pECiy3.png', 'assets/aistudio/setsquare.png', setsquareImageRef);
    loadImage('https://i.imgur.com/txF73Vo.png', 'assets/aistudio/protractor.png', protractorImageRef);
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
  const invincibilityRef = useRef<boolean>(invincibility);

  useEffect(() => {
    instaKillRef.current = instaKill;
    invincibilityRef.current = invincibility;
  }, [instaKill, invincibility]);

  const selectedMapRef = useRef<string>(selectedMap);
  useEffect(() => {
    selectedMapRef.current = selectedMap;
  }, [selectedMap]);

  const onGameOver = useCallback(
    (finalStats: any) => {
      rawOnGameOver({
        mapId: selectedMapRef.current,
        ...finalStats,
      });
    },
    [rawOnGameOver]
  );
  const screenShakeRef = useRef<number>(0);
  const lastMoveDirRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: -1 });

  // Entities
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const rockProjectilesRef = useRef<{ id: number; x: number; y: number; vx: number; vy: number; damage: number; radius: number; life: number; maxLife: number; isPellet?: boolean }[]>([]);
  const aoeZonesRef = useRef<AreaZone[]>([]);
  const novaPulsesRef = useRef<NovaPulse[]>([]);
  const astralSlashesRef = useRef<{
    id: number;
    x: number;
    y: number;
    angle: number;
    halfArc: number;
    range: number;
    duration: number;
    maxDuration: number;
    color: string;
  }[]>([]);
  const megaAstralBladeRef = useRef<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    vx: number;
    vy: number;
    speed: number;
    angle: number;
    enemyHitMap: Map<number, number>;
  }>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    angle: 0,
    enemyHitMap: new Map(),
  });
  const delayedAcidShotsRef = useRef<{
    x: number;
    y: number;
    baseAngle: number;
    damage: number;
    size: number;
    pierce: number;
    count: number;
    level: number;
    bulletColor: string;
    timer: number;
    acidDuration?: number;
    acidDamagePerTick?: number;
    knockback: number;
    vampirismRatio: number;
    baseSpeed: number;
  }[]>([]);
  const expGemsRef = useRef<ExpGem[]>([]);
  const pickupsRef = useRef<WorldPickup[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dashGhostsRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const dashVxRef = useRef<number>(0);
  const dashVyRef = useRef<number>(0);

  // Pet Plant (Mega Evolution: Pet Plant)
  const petPlantStateRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    attackCooldown: number;
    isBiting: boolean;
    biteTimer: number;
    targetEnemyId: number | null;
    lungeOffsetX: number;
    lungeOffsetY: number;
  }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    attackCooldown: 1.2,
    isBiting: false,
    biteTimer: 0,
    targetEnemyId: null,
    lungeOffsetX: 0,
    lungeOffsetY: 0,
  });

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
  const isBossPendingRef = useRef<boolean>(false);
  const bossCountdownRef = useRef<number>(bossCountdown ?? 300);
  const bossTimerRef = useRef<number>(90); // 1m 30s
  const lastBossEpochRef = useRef<number>(0);
  const bossFightDurationRef = useRef<number>(0);
  const lockedCameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bossRushQueueRef = useRef<string[]>(bossRushQueue || ['carnivore_plant', 'haunted_eye', 'night_bear', 'archmages', 'googolbra', 'phiboccion']);
  const bossRushIndexRef = useRef<number>(0);
  const bossRushPauseTimerRef = useRef<number>(5.0);
  const totalDamageDealtRef = useRef<number>(0);
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
  const nightBearStateRef = useRef<'IDLE' | 'TELEGRAPH' | 'CHARGING' | 'DIZZY' | 'BITE_REPOSITION' | 'BITE_ATTACK'>('IDLE');
  const nightBearTimerRef = useRef<number>(0);
  const nightBearChargesRef = useRef<number>(0);
  const nightBearChargeDurationRef = useRef<number>(0);
  const nightBearDizzyCountRef = useRef<number>(0);
  const nightBearSafeZoneRef = useRef<{ x: number; y: number; radius: number } | null>(null);
  const nightBearRepositionStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nightBearRepositionTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nightBearChargeTargetRef = useRef<{ x: number; y: number } | null>(null);
  const nightBearChargeAngleRef = useRef<number>(0);
  const nightBearHasHitPlayerRef = useRef<boolean>(false);
  const archmageAttackTimerRef = useRef<number>(1.0);
  const archmageSubStepRef = useRef<number>(0);
  const archmageFireballsFiredRef = useRef<number>(0);
  const archmageMergingTimerRef = useRef<number>(0);
  const archmageRGBAttackIndexRef = useRef<number>(0);
  const archmageCloneRef = useRef<{ x: number; y: number; active: boolean; timer: number } | null>(null);
  const archmageCloneStrikeCountRef = useRef<number>(0);
  const archmageSpinningBeamsRef = useRef<{ baseAngle: number; spinSpeed: number; beamCount: number; beamLength: number; duration: number; isRainbow?: boolean } | null>(null);
  const archmageBlueTelegraphTimerRef = useRef<number>(0);

  const phiboccionAttackIndexRef = useRef<number>(0);
  const phiboccionTimerRef = useRef<number>(0);
  const phiboccionKickCountRef = useRef<number>(0);
  const phiboccionKickPhaseRef = useRef<'PREP' | 'DASH' | 'REST'>('PREP');
  const phiboccionDashStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const phiboccionDashTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const phiboccionCornerRef = useRef<number>(0);
  const phiboccionLaserFireRateRef = useRef<number>(0);
  const phiboccionLaserTimerRef = useRef<number>(0);
  const phiboccionMineDroppedRef = useRef<boolean>(false);
  const phiboccionKeypadActiveRef = useRef<boolean>(false);
  const phiboccionKeypadStageRef = useRef<number>(1);
  const phiboccionKeypadAnswersCorrectRef = useRef<number>(0);
  const phiboccionKeypadTimerRef = useRef<number>(10.0);
  const phiboccionKeypadQuestionRef = useRef<{ q: string; a: string; difficulty: number } | null>(null);
  const phiboccionKeypadInputRef = useRef<string>("");
  const phiboccionKeypadResultTextRef = useRef<string>("");
  const phiboccionKeypadResultTimerRef = useRef<number>(0);
  const phiboccionKeypadPendingAdvanceRef = useRef<boolean>(false);
  const phiboccionKeypadModeRef = useRef<'ROOT' | 'FIBONACCI'>('ROOT');
  const phiboccionFibIntroStepRef = useRef<number>(0);
  const phiboccionFibIntroTimerRef = useRef<number>(1.0);
  const phiboccionKeypadLastAnswerCorrectRef = useRef<boolean>(true);

  const googolbraStateRef = useRef<'CONSTRICTION' | 'RETREATING' | 'ZEBRA_TELEGRAPH' | 'ZEBRA_ATTACK' | 'SNEAK_APPROACH' | 'SNEAK_GRASP' | 'COOLDOWN'>('CONSTRICTION');
  const googolbraProgressRef = useRef<number>(0);
  const googolbraConstrictionDamageTakenRef = useRef<number>(0);
  const googolbraSpiralPathRef = useRef<{ x: number; y: number; col: number; row: number; dirX: number; dirY: number }[]>([]);
  const googolbraCurrentSegmentsRef = useRef<{ x: number; y: number; dirX: number; dirY: number; angle: number }[]>([]);
  const googolbraZebraStateRef = useRef<{
    isVertical: boolean;
    stripes: number[];
    timer: number;
    progress: number;
    lanes: {
      startX: number;
      startY: number;
      dirX: number;
      dirY: number;
      angle: number;
      length: number;
      delay: number;
    }[];
  }>({
    isVertical: true,
    stripes: [],
    timer: 1.2,
    progress: 0,
    lanes: [],
  });
  const googolbraZebraAttackCountRef = useRef<number>(0);
  const googolbraSneakStateRef = useRef<{
    approachTimer: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    graspTimer: number;
    damageTickTimer: number;
    struggles: number;
    maxStruggles: number;
  }>({
    approachTimer: 0,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    graspTimer: 0,
    damageTickTimer: 0,
    struggles: 0,
    maxStruggles: 30,
  });
  const googolbraCooldownTimerRef = useRef<number>(0);
  const googolbraHeadAngleRef = useRef<number>(0);
  const lastStruggleTriggerTimeRef = useRef<number>(0);
  const googolbraGraspLastTenthsRef = useRef<number>(-1);
  const googolbraGraspLastStrugglesRef = useRef<number>(-1);
  const googolbraGraspLastInDamageRef = useRef<boolean>(false);
  const bossPreviousHpRef = useRef<number>(-1);

  const pythagorasPhaseRef = useRef<'GEOMETRY_DASH' | 'REST' | 'MONTY_HALL' | 'GEOMENTO_MORI'>('GEOMETRY_DASH');
  const pythagorasTimerRef = useRef<number>(0);
  const pythagorasRulerTimerRef = useRef<number>(0);
  const pythagorasProtractorWaveRef = useRef<number>(0);
  const pythagorasProtractorTimerRef = useRef<number>(0);
  const pythagorasSetSquareTimerRef = useRef<number>(0);
  const pythagorasMoveDirRef = useRef<number>(1);
  const pythagorasLastAttackRef = useRef<'GEOMETRY_DASH' | 'MONTY_HALL' | 'GEOMENTO_MORI'>('GEOMENTO_MORI');

  const pythagorasMontyHallActiveRef = useRef<boolean>(false);
  const pythagorasMontyStepRef = useRef<'PICK' | 'REVEAL_ANIM' | 'CHOICE' | 'RESULT'>('PICK');
  const pythagorasMontyPrizeDoorRef = useRef<number>(0);
  const pythagorasMontyPlayerPickRef = useRef<number>(-1);
  const pythagorasMontyRevealedEmptyDoorRef = useRef<number>(-1);
  const pythagorasMontyFinalPickRef = useRef<number>(-1);
  const pythagorasMontyTimerRef = useRef<number>(0);
  const pythagorasMontyResultTypeRef = useRef<'WIN' | 'LOSE' | null>(null);

  // GeoMento Mori Attack Refs
  const pythagorasGeoMoriActiveRef = useRef<boolean>(false);
  const pythagorasGeoMoriEquationsRef = useRef<{ id: string; formula: string; color: string; fn: (x: number) => number | null }[]>([]);
  const pythagorasGeoMoriStateRef = useRef<'TELEGRAPH' | 'ACTIVE' | 'DONE'>('TELEGRAPH');
  const pythagorasGeoMoriTimerRef = useRef<number>(0);
  const pythagorasGeoMoriHitCooldownRef = useRef<number>(0);
  const pythagorasGeoMoriCastCountRef = useRef<number>(0);
  const pythagorasGeoMoriRoundRef = useRef<number>(1);

  const playerInvincibleTimerRef = useRef<number>(0);
  const lastVineAttackKeyRef = useRef<string | null>(null);
  const lastFacingDirectionRef = useRef<'left' | 'right'>('right');
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
  const cursorJoystickVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isCursorJoystickActiveRef = useRef<boolean>(false);
  const lastCursorAimAngleRef = useRef<number>(-Math.PI / 2); // Default upward aim
  const isPlayerWalkingRef = useRef<boolean>(false);
  const playerWalkAnimTimeRef = useRef<number>(0);

  // Throttled reporting refs to eliminate React re-render lag
  const lastReportedSurvivalSecRef = useRef<number>(-1);
  const lastReportedCountdownRef = useRef<number>(-1);
  const lastReportedBossTimerRef = useRef<number>(-1);
  const lastReportedBossHpRef = useRef<number>(-1);
  const lastDashReportTimeRef = useRef<number>(0);
  const groundPatternRef = useRef<CanvasPattern | null>(null);
  const groundPatternImgRef = useRef<HTMLImageElement | null>(null);
  const blackHoneyPatternRef = useRef<CanvasPattern | null>(null);
  const blackHoneyPatternImgRef = useRef<HTMLImageElement | null>(null);
  const prevSurvivalTimeRef = useRef<number>(survivalTime);
  const weaponTimeRef = useRef<number>(0);
  const lastBossReportTimeRef = useRef<number>(0);

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
    currentP.projectileSizeMult = player.projectileSizeMult;
    currentP.dashCooldown = player.dashCooldown;
    currentP.hpRegen = player.hpRegen;
    currentP.dashDamage = player.dashDamage;
    currentP.damageReduction = player.damageReduction;
  }, [player, survivalTime]);

  useEffect(() => {
    // Preserve lastFired timestamps across weapon updates so fire rate never resets or desyncs
    const curSimTime = weaponTimeRef.current;
    const existingMap = new Map(weaponsRef.current.map((w) => [w.id, w.lastFired]));
    weaponsRef.current = weapons.map((w) => {
      const prevFired = existingMap.get(w.id) ?? w.lastFired ?? 0;
      return {
        ...w,
        lastFired: prevFired > curSimTime ? Math.max(0, curSimTime - 0.5) : prevFired,
      };
    });
  }, [weapons]);

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

    // Lock camera centered around current player position, snapped to exact tile grid
    const tileSize = 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    lockedCameraRef.current = {
      x: Math.round((p.x - centerX) / tileSize) * tileSize,
      y: Math.round((p.y - centerY) / tileSize) * tileSize,
    };

    // Keep player safely inside the arena and away from the top-center boss spawn zone
    p.x = Math.max(lockedCameraRef.current.x + 50, Math.min(lockedCameraRef.current.x + canvas.width - 50, p.x));
    p.y = Math.max(lockedCameraRef.current.y + 50, Math.min(lockedCameraRef.current.y + canvas.height - 50, p.y));
    if (p.y < lockedCameraRef.current.y + 240) {
      p.y = lockedCameraRef.current.y + 360;
    }

    // Despawn all normal enemies
    enemiesRef.current = [];
    isBossFightRef.current = true;
    isBossPendingRef.current = false;
    bossTimerRef.current = 90; // 1m 30s countdown

    let selectedBoss = forcedBossId ? BOSS_POOL.find((b) => b.id === forcedBossId) : null;
    if (!selectedBoss) {
      if (selectedMapRef.current === 'mathematical_realm') {
        const mathBosses = BOSS_POOL.filter((b) => b.id === 'googolbra' || b.id === 'phiboccion');
        selectedBoss = mathBosses[Math.floor(Math.random() * mathBosses.length)] || BOSS_POOL[0];
      } else {
        const availableBosses = BOSS_POOL.filter((b) => b.id !== 'phiboccion' && b.id !== 'googolbra');
        selectedBoss = availableBosses[Math.floor(Math.random() * availableBosses.length)] || BOSS_POOL[0];
      }
    }

    // Boss scales relative to current player level
    let levelMult = 1 + ((p.level - 1) * 0.12);
    if (selectedMapRef.current === 'black_honey_forest') {
      levelMult *= 1.2;
    }
    const scaledMaxHp = Math.round(selectedBoss.maxHp * levelMult);

    // Boss spawns directly at the top center of the locked screen
    const bossWorldX = lockedCameraRef.current.x + canvas.width / 2;
    const bossWorldY = lockedCameraRef.current.y + 115;

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

    if (selectedBoss.id === 'googolbra') {
      bossInstance.googolbraState = 'CONSTRICTION';
      googolbraStateRef.current = 'CONSTRICTION';
      googolbraProgressRef.current = 0;
      googolbraConstrictionDamageTakenRef.current = 0;
      const cam = lockedCameraRef.current;
      googolbraSpiralPathRef.current = generateGoogolbraSpiralPath(cam.x, cam.y, canvas.width, canvas.height);
      if (googolbraSpiralPathRef.current.length > 0) {
        bossInstance.x = googolbraSpiralPathRef.current[0].x;
        bossInstance.y = googolbraSpiralPathRef.current[0].y;
      }
      bossInstance.radius = 40;
      bossPreviousHpRef.current = scaledMaxHp;
    }

    if (selectedBoss.id === 'phiboccion') {
      bossInstance.phiboccionState = 'FLOATING';
      bossInstance.phiboccionAngle = 0;
      bossInstance.isKicking = false;
      bossInstance.isInvincible = false;
    }

    if (selectedBoss.id === 'archmages') {
      const wizardMaxHp = Math.round(600 * levelMult);
      bossInstance.archmagesPhase = 'PHASE1';
      bossInstance.activeArchmageId = 'geraldo_red';
      bossInstance.archmagesList = [
        {
          id: 'geraldo_red',
          name: 'Geraldo The Red',
          hp: wizardMaxHp,
          maxHp: wizardMaxHp,
          color: '#ef4444',
          isShielded: false,
          isTurnShielded: false,
          turnDamageTaken: 0,
          x: bossWorldX,
          y: bossWorldY,
        },
        {
          id: 'geraldo_green',
          name: 'Geraldo The Green',
          hp: wizardMaxHp,
          maxHp: wizardMaxHp,
          color: '#22c55e',
          isShielded: false,
          isTurnShielded: false,
          turnDamageTaken: 0,
          x: bossWorldX,
          y: bossWorldY,
        },
        {
          id: 'geraldo_blue',
          name: 'Geraldo The Blue',
          hp: wizardMaxHp,
          maxHp: wizardMaxHp,
          color: '#3b82f6',
          isShielded: false,
          isTurnShielded: false,
          turnDamageTaken: 0,
          x: bossWorldX,
          y: bossWorldY,
        },
      ];
      bossInstance.hp = wizardMaxHp * 3;
      bossInstance.maxHp = wizardMaxHp * 3;
    }

    bossInstanceRef.current = bossInstance;
    bossAttackCooldownRef.current = 2.0;
    bossAttackCountRef.current = 0;
    bossHitFlashRef.current = 0;
    eyePhaseRef.current = 'CLOSED';
    eyePhaseTimerRef.current = 3.5;
    eyeGazeDamageAccumulatorRef.current = 0;
    eyeTearsFiredRef.current = 0;
    nightBearStateRef.current = 'IDLE';
    nightBearTimerRef.current = 0;
    nightBearChargesRef.current = 0;
    nightBearDizzyCountRef.current = 0;
    nightBearSafeZoneRef.current = null;
    nightBearHasHitPlayerRef.current = false;
    archmageAttackTimerRef.current = 1.0;
    archmageSubStepRef.current = 0;
    archmageFireballsFiredRef.current = 0;
    archmageMergingTimerRef.current = 0;
    archmageRGBAttackIndexRef.current = 0;
    archmageCloneRef.current = null;
    archmageSpinningBeamsRef.current = null;
    lastVineAttackKeyRef.current = null;

    phiboccionAttackIndexRef.current = 0;
    phiboccionTimerRef.current = 0;
    phiboccionKickCountRef.current = 0;
    phiboccionKickPhaseRef.current = 'PREP';
    phiboccionDashStartRef.current = { x: 0, y: 0 };
    phiboccionDashTargetRef.current = { x: 0, y: 0 };
    phiboccionCornerRef.current = 0;
    phiboccionLaserFireRateRef.current = 0;
    phiboccionLaserTimerRef.current = 0;
    phiboccionMineDroppedRef.current = false;
    phiboccionKeypadActiveRef.current = false;
    phiboccionKeypadStageRef.current = 1;
    phiboccionKeypadAnswersCorrectRef.current = 0;
    phiboccionKeypadTimerRef.current = 10.0;
    phiboccionKeypadQuestionRef.current = null;
    phiboccionKeypadInputRef.current = "";
    phiboccionKeypadResultTextRef.current = "";
    phiboccionKeypadResultTimerRef.current = 0;
    phiboccionKeypadPendingAdvanceRef.current = false;
    phiboccionKeypadModeRef.current = 'ROOT';
    phiboccionFibIntroStepRef.current = 0;
    phiboccionFibIntroTimerRef.current = 1.0;
    phiboccionKeypadLastAnswerCorrectRef.current = true;
    pythagorasPhaseRef.current = 'GEOMETRY_DASH';
    pythagorasTimerRef.current = 0;
    pythagorasRulerTimerRef.current = 0;
    pythagorasProtractorWaveRef.current = 0;
    pythagorasProtractorTimerRef.current = 0.5;
    pythagorasSetSquareTimerRef.current = 0.5;
    pythagorasMoveDirRef.current = 1;
    pythagorasLastAttackRef.current = 'MONTY_HALL';
    pythagorasMontyHallActiveRef.current = false;
    pythagorasMontyStepRef.current = 'PICK';
    pythagorasMontyPrizeDoorRef.current = 0;
    pythagorasMontyPlayerPickRef.current = -1;
    pythagorasMontyRevealedEmptyDoorRef.current = -1;
    pythagorasMontyFinalPickRef.current = -1;
    pythagorasMontyTimerRef.current = 0;
    pythagorasMontyResultTypeRef.current = null;
    pythagorasGeoMoriActiveRef.current = false;
    pythagorasGeoMoriEquationsRef.current = [];
    pythagorasGeoMoriStateRef.current = 'TELEGRAPH';
    pythagorasGeoMoriTimerRef.current = 0;
    pythagorasGeoMoriHitCooldownRef.current = 0;
    pythagorasGeoMoriCastCountRef.current = 0;
    pythagorasGeoMoriRoundRef.current = 1;

    lastReportedBossTimerRef.current = 90;
    lastReportedBossHpRef.current = scaledMaxHp;
    if (onBossUpdate) {
      onBossUpdate(bossInstance, true, 90, scaledMaxHp);
    }
  }, [onBossUpdate]);

  useEffect(() => {
    const wasRunning = prevSurvivalTimeRef.current > 0;
    prevSurvivalTimeRef.current = survivalTime;

    // Explicitly wipe all active entities only when genuine run restart occurs (survivalTime resets to 0 from an active run)
    if (wasRunning && survivalTime === 0) {
      survivalTimeRef.current = 0;
      weaponTimeRef.current = 0;
      weaponsRef.current.forEach((w) => {
        w.lastFired = 0;
      });
      enemiesRef.current = [];
      projectilesRef.current = [];
      rockProjectilesRef.current = [];
      aoeZonesRef.current = [];
      novaPulsesRef.current = [];
      astralSlashesRef.current = [];
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
      bossInstanceRef.current = null;
      bossTimerRef.current = 90;
      isBossPendingRef.current = false;
      bossCountdownRef.current = 300;
      lastReportedCountdownRef.current = 300;
      lastReportedSurvivalSecRef.current = 0;
      lastReportedBossTimerRef.current = -1;
      lastReportedBossHpRef.current = -1;
      if (onUpdateBossCountdown) {
        onUpdateBossCountdown(300);
      }
      bossContactCooldownRef.current = 0;
      bossDashHitCooldownRef.current = 0;
      playerInvincibleTimerRef.current = 0;
      eyeOpenAttackCountRef.current = 0;
      eyeTearsFiredRef.current = 0;
      nightBearStateRef.current = 'IDLE';
      nightBearTimerRef.current = 0;
      nightBearChargesRef.current = 0;
      nightBearDizzyCountRef.current = 0;
      nightBearSafeZoneRef.current = null;
      nightBearHasHitPlayerRef.current = false;
      lastSpawnTime.current = 999;
      nextEntityId.current = 1;
      enemyTimeOffsetRef.current = 0;
      lastReportedHpRef.current = playerRef.current.hp;
      bossRushQueueRef.current = bossRushQueue || ['carnivore_plant', 'haunted_eye', 'night_bear', 'archmages', 'googolbra', 'phiboccion'];
      bossRushIndexRef.current = 0;
      bossRushPauseTimerRef.current = 5.0;
      totalDamageDealtRef.current = 0;
      if (isBossRush) {
        isBossFightRef.current = true;
        const canvas = canvasRef.current;
        const p = playerRef.current;
        if (canvas && p) {
          const tileSize = 80;
          lockedCameraRef.current = {
            x: Math.round((p.x - canvas.width / 2) / tileSize) * tileSize,
            y: Math.round((p.y - canvas.height / 2) / tileSize) * tileSize,
          };
          p.x = Math.max(lockedCameraRef.current.x + 50, Math.min(lockedCameraRef.current.x + canvas.width - 50, p.x));
          p.y = Math.max(lockedCameraRef.current.y + 50, Math.min(lockedCameraRef.current.y + canvas.height - 50, p.y));
          if (p.y < lockedCameraRef.current.y + 240) {
            p.y = lockedCameraRef.current.y + 360;
          }
        }
      } else {
        isBossFightRef.current = false;
      }
      if (onBossUpdate) {
        onBossUpdate(null, false, 0, 0);
      }
    } else if (Math.abs(survivalTime - survivalTimeRef.current) > 2) {
      // Deliberate jump from DevTools (Skip to Minute 5:00 or Minute 7:30)
      survivalTimeRef.current = survivalTime;
      weaponTimeRef.current = survivalTime;
      weaponsRef.current.forEach((w) => {
        w.lastFired = survivalTime;
      });
    }
  }, [survivalTime, isBossRush, bossRushQueue, onUpdateBossCountdown, onBossUpdate]);

  // Listener for instant boss and deal test buttons
  useEffect(() => {
    const handleTriggerTestBoss = (e?: Event) => {
      const customEvent = e as CustomEvent<{ bossId?: string }>;
      const bossId = customEvent?.detail?.bossId;
      isBossPendingRef.current = true;
      bossCountdownRef.current = 0;
      if (onUpdateBossCountdown) {
        onUpdateBossCountdown(0);
      }
      lastBossEpochRef.current = Math.max(1, Math.floor(survivalTimeRef.current / 300));
      const selectedBoss = (bossId ? BOSS_POOL.find((b) => b.id === bossId) : null) || BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)];
      if (onBossIncoming) {
        onBossIncoming(selectedBoss);
      } else {
        spawnBossFight(bossId);
      }
    };
    const handleSpawnBossFightEvent = (e?: Event) => {
      const customEvent = e as CustomEvent<{ bossId?: string }>;
      const bossId = customEvent?.detail?.bossId;
      isBossPendingRef.current = false;
      bossCountdownRef.current = 0;
      if (onUpdateBossCountdown) {
        onUpdateBossCountdown(0);
      }
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
    const handleSetBossTimerZero = () => {
      bossCountdownRef.current = 0;
      if (onUpdateBossCountdown) {
        onUpdateBossCountdown(0);
      }
    };
    window.addEventListener('trigger-test-boss', handleTriggerTestBoss);
    window.addEventListener('spawn-boss-fight', handleSpawnBossFightEvent);
    window.addEventListener('trigger-test-deal', handleTriggerTestDeal);
    window.addEventListener('dev-instant-level-up', handleDevInstantLevelUp);
    window.addEventListener('set-boss-timer-zero', handleSetBossTimerZero);
    return () => {
      window.removeEventListener('trigger-test-boss', handleTriggerTestBoss);
      window.removeEventListener('spawn-boss-fight', handleSpawnBossFightEvent);
      window.removeEventListener('trigger-test-deal', handleTriggerTestDeal);
      window.removeEventListener('dev-instant-level-up', handleDevInstantLevelUp);
      window.removeEventListener('set-boss-timer-zero', handleSetBossTimerZero);
    };
  }, [spawnBossFight, onUpdatePlayer, onBossIncoming]);

  // Handle Déjà-Vu Curse: Reset enemies back to level 1
  useEffect(() => {
    const handleResetEnemies = () => {
      enemyTimeOffsetRef.current = survivalTimeRef.current;
      enemiesRef.current.forEach((enemy) => {
        enemy.level = 1;
        let baseHp = getEnemyBaseHp(1);
        if (selectedMapRef.current === 'black_honey_forest') {
          baseHp = Math.round(baseHp * 1.2);
        }
        enemy.maxHp = enemy.isRed ? Math.round(baseHp * 3.0) : baseHp;
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
  const mobileAimModeRef = useRef<MobileAimMode>(mobileAimMode);
  useEffect(() => { mobileAimModeRef.current = mobileAimMode; }, [mobileAimMode]);

  // Dash Action: Dash in movement direction (default), joystick vector, or toward cursor
  const triggerDash = useCallback(() => {
    if (phiboccionKeypadActiveRef.current || pythagorasMontyHallActiveRef.current) return;

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

    const cursorJoyX = cursorJoystickVectorRef.current.x;
    const cursorJoyY = cursorJoystickVectorRef.current.y;
    const cursorJoyDist = Math.hypot(cursorJoyX, cursorJoyY);

    const keys = keysRef.current;
    let kx = 0;
    let ky = 0;
    if (keys['w'] || keys['arrowup']) ky -= 1;
    if (keys['s'] || keys['arrowdown']) ky += 1;
    if (keys['a'] || keys['arrowleft']) kx -= 1;
    if (keys['d'] || keys['arrowright']) kx += 1;
    const keyDist = Math.hypot(kx, ky);

    if (dashModeRef.current === 'CURSOR' && cursorJoyDist > 0.08) {
      // Aiming cursor joystick active
      dx = cursorJoyX;
      dy = cursorJoyY;
    } else if (joyDist > 0.08) {
      // 1. Active Virtual Joystick vector
      dx = joyX;
      dy = joyY;
    } else if (keyDist > 0) {
      // 2. Active WASD / Arrow keys vector
      dx = kx;
      dy = ky;
    } else if (mobileModeRef.current) {
      // 3. Mobile mode: prioritize cursor joystick, walk target, or last movement direction
      if (cursorJoyDist > 0.08) {
        dx = cursorJoyX;
        dy = cursorJoyY;
      } else if (walkTargetRef.current) {
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
    lastMoveDirRef.current = { dx: dx / dist, dy: dy / dist };
    if (vx < -0.1) {
      lastFacingDirectionRef.current = 'left';
    } else if (vx > 0.1) {
      lastFacingDirectionRef.current = 'right';
    }

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

  // Equations generator for Pythagoras "GeoMento Mori" attack
  const getRandomGeoMoriEquations = () => {
    // 5 Distinct mathematical curve families with 28 diverse equations
    const CATEGORIES = {
      rational: [
        {
          id: 'reciprocal',
          formula: 'y = 1 / x',
          fn: (x: number) => (Math.abs(x) < 0.14 ? null : 1 / x),
        },
        {
          id: 'neg_reciprocal',
          formula: 'y = -1 / x',
          fn: (x: number) => (Math.abs(x) < 0.14 ? null : -1 / x),
        },
        {
          id: 'volcano',
          formula: 'y = 1 / x²',
          fn: (x: number) => (Math.abs(x) < 0.2 ? null : Math.min(8, 0.75 / (x * x))),
        },
        {
          id: 'neg_volcano',
          formula: 'y = -1 / x²',
          fn: (x: number) => (Math.abs(x) < 0.2 ? null : Math.max(-8, -0.75 / (x * x))),
        },
      ],
      polynomial: [
        {
          id: 'parabola',
          formula: 'y = x²',
          fn: (x: number) => 0.35 * x * x,
        },
        {
          id: 'neg_parabola',
          formula: 'y = -x²',
          fn: (x: number) => -0.35 * x * x,
        },
        {
          id: 'shifted_parabola_down',
          formula: 'y = 0.25x² - 2',
          fn: (x: number) => 0.25 * x * x - 2,
        },
        {
          id: 'shifted_parabola_up',
          formula: 'y = -0.25x² + 2',
          fn: (x: number) => -0.25 * x * x + 2,
        },
        {
          id: 'cubic',
          formula: 'y = x³ / 4',
          fn: (x: number) => (x * x * x) * 0.12,
        },
        {
          id: 'neg_cubic',
          formula: 'y = -x³ / 4',
          fn: (x: number) => -(x * x * x) * 0.12,
        },
      ],
      linear: [
        {
          id: 'half_linear',
          formula: 'y = x / 2',
          fn: (x: number) => x / 2,
        },
        {
          id: 'neg_half_linear',
          formula: 'y = -x / 2',
          fn: (x: number) => -x / 2,
        },
        {
          id: 'linear_2x',
          formula: 'y = 2x',
          fn: (x: number) => 1.5 * x,
        },
        {
          id: 'neg_linear_2x',
          formula: 'y = -2x',
          fn: (x: number) => -1.5 * x,
        },
        {
          id: 'linear_offset_pos',
          formula: 'y = x - 1.5',
          fn: (x: number) => x - 1.5,
        },
        {
          id: 'linear_offset_neg',
          formula: 'y = -x + 1.5',
          fn: (x: number) => -x + 1.5,
        },
      ],
      wave: [
        {
          id: 'sine',
          formula: 'y = 2·sin(x)',
          fn: (x: number) => 2 * Math.sin(x),
        },
        {
          id: 'cosine',
          formula: 'y = 2·cos(x)',
          fn: (x: number) => 2 * Math.cos(x),
        },
        {
          id: 'broad_sine',
          formula: 'y = 3·sin(x / 2)',
          fn: (x: number) => 3 * Math.sin(x / 2),
        },
        {
          id: 'fast_cosine',
          formula: 'y = 1.8·cos(2x)',
          fn: (x: number) => 1.8 * Math.cos(2 * x),
        },
      ],
      special: [
        {
          id: 'abs_val',
          formula: 'y = |x|',
          fn: (x: number) => Math.abs(x) * 0.8,
        },
        {
          id: 'neg_abs_val',
          formula: 'y = -|x|',
          fn: (x: number) => -Math.abs(x) * 0.8,
        },
        {
          id: 'radical',
          formula: 'y = 2·√|x|',
          fn: (x: number) => 2 * Math.sqrt(Math.abs(x)),
        },
        {
          id: 'neg_radical',
          formula: 'y = -2·√|x|',
          fn: (x: number) => -2 * Math.sqrt(Math.abs(x)),
        },
        {
          id: 'witch_agnesi',
          formula: 'y = 3 / (x² + 1)',
          fn: (x: number) => 3 / (x * x + 1),
        },
        {
          id: 'neg_witch_agnesi',
          formula: 'y = -3 / (x² + 1)',
          fn: (x: number) => -3 / (x * x + 1),
        },
        {
          id: 'semicircle_dome',
          formula: 'y = √(16 - x²)',
          fn: (x: number) => (Math.abs(x) <= 3.95 ? Math.sqrt(16 - x * x) : null),
        },
        {
          id: 'semicircle_bowl',
          formula: 'y = -√(16 - x²)',
          fn: (x: number) => (Math.abs(x) <= 3.95 ? -Math.sqrt(16 - x * x) : null),
        },
      ],
    };

    pythagorasGeoMoriCastCountRef.current++;

    const SECTOR_POOLS = {
      topLeft: [
        { id: 'neg_hyperbola', formula: 'y = -4 / x', fn: (x: number) => (Math.abs(x) > 0.1 ? -4 / x : null) },
        { id: 'neg_half_linear', formula: 'y = -x / 2', fn: (x: number) => -x / 2 },
        { id: 'neg_linear_2x', formula: 'y = -2x', fn: (x: number) => -1.5 * x },
        { id: 'linear_offset_neg', formula: 'y = -x + 1.5', fn: (x: number) => -x + 1.5 },
        { id: 'neg_radical', formula: 'y = -2·√|x|', fn: (x: number) => -2 * Math.sqrt(Math.abs(x)) },
      ],
      topRight: [
        { id: 'hyperbola', formula: 'y = 4 / x', fn: (x: number) => (Math.abs(x) > 0.1 ? 4 / x : null) },
        { id: 'half_linear', formula: 'y = x / 2', fn: (x: number) => x / 2 },
        { id: 'linear_2x', formula: 'y = 2x', fn: (x: number) => 1.5 * x },
        { id: 'linear_offset_pos', formula: 'y = x - 1.5', fn: (x: number) => x - 1.5 },
        { id: 'radical', formula: 'y = 2·√|x|', fn: (x: number) => 2 * Math.sqrt(Math.abs(x)) },
      ],
      bottomLeft: [
        { id: 'neg_parabola', formula: 'y = -x²', fn: (x: number) => -0.35 * x * x },
        { id: 'neg_cubic', formula: 'y = -x³ / 4', fn: (x: number) => -(x * x * x) * 0.12 },
        { id: 'neg_witch_agnesi', formula: 'y = -3 / (x² + 1)', fn: (x: number) => -3 / (x * x + 1) },
        { id: 'semicircle_bowl', formula: 'y = -√(16 - x²)', fn: (x: number) => (Math.abs(x) <= 3.95 ? -Math.sqrt(16 - x * x) : null) },
      ],
      bottomRight: [
        { id: 'parabola', formula: 'y = x²', fn: (x: number) => 0.35 * x * x },
        { id: 'cubic', formula: 'y = x³ / 4', fn: (x: number) => (x * x * x) * 0.12 },
        { id: 'witch_agnesi', formula: 'y = 3 / (x² + 1)', fn: (x: number) => 3 / (x * x + 1) },
        { id: 'semicircle_dome', formula: 'y = √(16 - x²)', fn: (x: number) => (Math.abs(x) <= 3.95 ? Math.sqrt(16 - x * x) : null) },
      ],
      waves: [
        { id: 'sine', formula: 'y = 2·sin(x)', fn: (x: number) => 2 * Math.sin(x) },
        { id: 'cosine', formula: 'y = 2·cos(x)', fn: (x: number) => 2 * Math.cos(x) },
        { id: 'broad_sine', formula: 'y = 3·sin(x / 2)', fn: (x: number) => 3 * Math.sin(x / 2) },
        { id: 'fast_cosine', formula: 'y = 1.8·cos(2x)', fn: (x: number) => 1.8 * Math.cos(2 * x) },
        { id: 'abs_val', formula: 'y = |x|', fn: (x: number) => Math.abs(x) * 0.8 },
      ]
    };

    const pickRandom = (list: any[]) => list[Math.floor(Math.random() * list.length)];
    // Ensure balanced representation across all 4 quadrants / sectors (3 Top-Left, 3 Top-Right, 2 Bottom-Left, 2 Bottom-Right)
    const selected = [
      pickRandom(SECTOR_POOLS.topLeft),
      pickRandom(SECTOR_POOLS.topLeft),
      pickRandom(SECTOR_POOLS.topLeft),
      pickRandom(SECTOR_POOLS.topRight),
      pickRandom(SECTOR_POOLS.topRight),
      pickRandom(SECTOR_POOLS.topRight),
      pickRandom(SECTOR_POOLS.bottomLeft),
      pickRandom(SECTOR_POOLS.bottomLeft),
      pickRandom(SECTOR_POOLS.bottomRight),
      pickRandom(SECTOR_POOLS.bottomRight),
    ].sort(() => Math.random() - 0.5);

    // Assign 10 distinct neon colors so curves on screen match top-left equations
    const DISTINCT_COLORS = [
      '#38bdf8', '#facc15', '#f43f5e', '#a855f7', '#34d399',
      '#fb923c', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'
    ];
    return selected.map((eq, i) => ({
      ...eq,
      color: DISTINCT_COLORS[i % DISTINCT_COLORS.length],
    }));
  };

  // Geometry helper for Pythagoras "(Mont)YOUR (hall) Problem"
  const getMontyDoorGeometry = (canvas: HTMLCanvasElement) => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dw = Math.min(130, Math.floor((canvas.width - 90) / 3));
    const dh = Math.floor(dw * 1.55);
    const spacing = Math.min(180, Math.floor(canvas.width / 3.4));

    const doorY = cy - Math.floor(dh / 2) - 15;
    const bw = Math.min(dw + 24, spacing - 10);
    const bh = 42;
    const buttonY = doorY + dh + 16;

    const doors = [0, 1, 2].map((i) => {
      const doorX = cx + (i - 1) * spacing;
      return {
        index: i,
        x: doorX - dw / 2,
        y: doorY,
        w: dw,
        h: dh,
        cx: doorX,
        buttonX: doorX - bw / 2,
        buttonY: buttonY,
        buttonW: bw,
        buttonH: bh,
      };
    });

    return { cx, cy, dw, dh, spacing, doorY, bw, bh, buttonY, doors };
  };

  // Input Listeners
  useEffect(() => {
    const handleMontyPickDoor = (doorIndex: number) => {
      if (!pythagorasMontyHallActiveRef.current) return;
      const step = pythagorasMontyStepRef.current;

      if (step === 'PICK') {
        pythagorasMontyPlayerPickRef.current = doorIndex;
        soundEngine.playShoot('wand');

        // Host reveals an empty door that is NOT player's pick and NOT the prize door
        const prize = pythagorasMontyPrizeDoorRef.current;
        const availableEmpty = [0, 1, 2].filter((d) => d !== doorIndex && d !== prize);
        const chosenEmpty = availableEmpty[Math.floor(Math.random() * availableEmpty.length)];
        pythagorasMontyRevealedEmptyDoorRef.current = chosenEmpty;

        pythagorasMontyStepRef.current = 'REVEAL_ANIM';
        pythagorasMontyTimerRef.current = 1.0;
      } else if (step === 'CHOICE') {
        // Cannot pick the already opened empty door
        if (doorIndex === pythagorasMontyRevealedEmptyDoorRef.current) return;

        pythagorasMontyFinalPickRef.current = doorIndex;
        const prize = pythagorasMontyPrizeDoorRef.current;
        pythagorasMontyStepRef.current = 'RESULT';
        pythagorasMontyTimerRef.current = 2.8;

        const boss = bossInstanceRef.current;
        if (doorIndex === prize) {
          // WIN! Deal 20% of Pythagoras Max HP
          pythagorasMontyResultTypeRef.current = 'WIN';
          soundEngine.playLevelUp();
          if (boss) {
            const damage = Math.round(boss.maxHp * 0.20);
            boss.hp = Math.max(1, boss.hp - damage);
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: boss.x,
              y: boss.y - 45,
              text: `-${damage} HP!`,
              color: '#38bdf8',
              life: 0,
              maxLife: 2.0,
              vy: -35,
            });
          }
          if (screenShakeEnabledRef.current) {
            screenShakeRef.current = 8;
          }
        } else {
          // LOSE! Deal 20% of player's CURRENT health
          pythagorasMontyResultTypeRef.current = 'LOSE';
          soundEngine.playPlayerHurt();
          const currentHp = playerRef.current.hp;
          const playerDmg = Math.max(1, Math.round(currentHp * 0.20));
          playerRef.current.hp = Math.max(0, currentHp - playerDmg);
          floatingTextsRef.current.push({
            id: nextEntityId.current++,
            x: playerRef.current.x,
            y: playerRef.current.y - 35,
            text: `-${playerDmg} HP!`,
            color: '#ef4444',
            life: 0,
            maxLife: 2.0,
            vy: -35,
          });
          if (screenShakeEnabledRef.current) {
            screenShakeRef.current = 10;
          }
        }
      }
    };

    const submitMathAnswer = () => {
      if (phiboccionKeypadResultTimerRef.current > 0 || phiboccionKeypadPendingAdvanceRef.current) {
        return;
      }

      const currentInput = phiboccionKeypadInputRef.current.trim();
      const correctAnswer = phiboccionKeypadQuestionRef.current?.a || "";
      const isFib = phiboccionKeypadModeRef.current === 'FIBONACCI';

      if (isFib) {
        const isCorrect = currentInput === correctAnswer;
        phiboccionKeypadLastAnswerCorrectRef.current = isCorrect;
        if (isCorrect) {
          phiboccionKeypadAnswersCorrectRef.current++;
          phiboccionKeypadResultTextRef.current = "CORRECT!";
          phiboccionKeypadResultTimerRef.current = 0.8;
          soundEngine.playLevelUp();
        } else {
          phiboccionKeypadResultTextRef.current = `WRONG! (ANS: ${correctAnswer})`;
          phiboccionKeypadResultTimerRef.current = 1.2;
          soundEngine.playPlayerHurt();
        }
      } else {
        if (currentInput === correctAnswer) {
          phiboccionKeypadAnswersCorrectRef.current++;
          phiboccionKeypadResultTextRef.current = "CORRECT!";
          phiboccionKeypadResultTimerRef.current = 1.0;
          soundEngine.playLevelUp();

          const canvas = canvasRef.current;
          if (canvas) {
            const sx = canvas.width / 2;
            const sy = canvas.height - 390;
            for (let i = 0; i < 20; i++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 90 + 30;
              particlesRef.current.push({
                x: sx + (isBossFightRef.current ? lockedCameraRef.current.x : playerRef.current.x - canvas.width / 2),
                y: sy + (isBossFightRef.current ? lockedCameraRef.current.y : playerRef.current.y - canvas.height / 2),
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 4 + 2,
                color: '#22c55e',
                alpha: 0.9,
                decay: 2.0,
              });
            }
          }
        } else {
          phiboccionKeypadResultTextRef.current = `WRONG! (ANS: ${correctAnswer})`;
          phiboccionKeypadResultTimerRef.current = 1.2;
          soundEngine.playPlayerHurt();

          const canvas = canvasRef.current;
          if (canvas) {
            const sx = canvas.width / 2;
            const sy = canvas.height - 390;
            for (let i = 0; i < 20; i++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 90 + 30;
              particlesRef.current.push({
                x: sx + (isBossFightRef.current ? lockedCameraRef.current.x : playerRef.current.x - canvas.width / 2),
                y: sy + (isBossFightRef.current ? lockedCameraRef.current.y : playerRef.current.y - canvas.height / 2),
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 4 + 2,
                color: '#ef4444',
                alpha: 0.9,
                decay: 2.0,
              });
            }
          }
        }
      }

      phiboccionKeypadPendingAdvanceRef.current = true;
    };

    const triggerGoogolbraStruggle = () => {
      if (googolbraStateRef.current !== 'SNEAK_GRASP') return;
      const now = Date.now();
      if (now - lastStruggleTriggerTimeRef.current < 60) return;
      lastStruggleTriggerTimeRef.current = now;
      const sneak = googolbraSneakStateRef.current;
      sneak.struggles++;
      googolbraGraspLastStrugglesRef.current = -1; // Force immediate HUD update on struggle click
      soundEngine.playHit();
      if (screenShakeEnabledRef.current) screenShakeRef.current = Math.min(screenShakeRef.current + 3, 12);

      const p = playerRef.current;
      if (p) {
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 100 + 40;
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 2,
            color: '#38bdf8',
            alpha: 0.9,
            decay: 3.5,
          });
        }
      }

      const inDamage = sneak.graspTimer >= 5.0;
      const graceRemaining = Math.max(0, 5.0 - sneak.graspTimer);

      if (sneak.struggles >= sneak.maxStruggles) {
        googolbraStateRef.current = 'COOLDOWN';
        googolbraCooldownTimerRef.current = 1.0; // 1s breathing time before next constriction
        if (bossInstanceRef.current) {
          bossInstanceRef.current.googolbraState = 'COOLDOWN';
          bossInstanceRef.current.x = -9999;
          bossInstanceRef.current.y = -9999;
        }
        googolbraCurrentSegmentsRef.current = [];
        soundEngine.playExplosion();
        if (screenShakeEnabledRef.current) screenShakeRef.current = 16;
        const lang = getLanguage();
        floatingTextsRef.current.push({
          id: nextEntityId.current++,
          x: p ? p.x : 0,
          y: p ? p.y - 60 : 0,
          text: lang === 'pt-BR' ? 'LIBERTOU-SE!' : 'BROKE FREE!',
          color: '#4ade80',
          life: 0,
          maxLife: 2.0,
          vy: -40,
        });

        window.dispatchEvent(new CustomEvent('googolbra-grasp-state', {
          detail: {
            active: false,
            struggles: sneak.maxStruggles,
            maxStruggles: sneak.maxStruggles,
            graceTimer: 0,
            inDamagePhase: false,
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('googolbra-grasp-state', {
          detail: {
            active: true,
            struggles: sneak.struggles,
            maxStruggles: sneak.maxStruggles,
            graceTimer: graceRemaining,
            inDamagePhase: inDamage,
          }
        }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar Struggles during Googolbra Sssneak Attack Grasp
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        if (googolbraStateRef.current === 'SNEAK_GRASP') {
          e.preventDefault();
          triggerGoogolbraStruggle();
          return;
        }
      }

      if (e.repeat) return;

      // Handle Keypad Interception if Active
      if (phiboccionKeypadActiveRef.current) {
        if (phiboccionKeypadResultTimerRef.current > 0 || phiboccionKeypadPendingAdvanceRef.current) {
          e.preventDefault();
          return;
        }
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          if (phiboccionKeypadInputRef.current.length < 3) {
            phiboccionKeypadInputRef.current += e.key;
            soundEngine.playShoot('wand');
          }
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          if (phiboccionKeypadInputRef.current.length > 0) {
            phiboccionKeypadInputRef.current = phiboccionKeypadInputRef.current.slice(0, -1);
            soundEngine.playShoot('sword');
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          submitMathAnswer();
          return;
        }
      }

      // Handle Pythagoras Monty Hall Keys (1, 2, 3)
      if (pythagorasMontyHallActiveRef.current) {
        if (e.key === '1') {
          e.preventDefault();
          handleMontyPickDoor(0);
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          handleMontyPickDoor(1);
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          handleMontyPickDoor(2);
          return;
        }
      }

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

    const isTouchOnExcludedControls = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      let curr: HTMLElement | null = target;
      while (curr) {
        const id = curr.id || '';
        const className = typeof curr.className === 'string' ? curr.className : '';
        if (
          id.includes('virtual-joystick') ||
          id.includes('hud-dash') ||
          id.includes('hud-pause') ||
          id.includes('googolbra-struggle') ||
          id.includes('options') ||
          id.includes('modal') ||
          id.includes('menu') ||
          className.includes('virtual-joystick') ||
          className.includes('hud-dash') ||
          className.includes('googolbra-struggle') ||
          className.includes('hud-pause')
        ) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const updateCursorPos = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const sx = (clientX - rect.left) * scaleX;
      const sy = (clientY - rect.top) * scaleY;
      mouseScreenRef.current = { x: sx, y: sy };
      // If cursor is within the main canvas area, update battlefield cursor target
      if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
        lastBattlefieldCursorRef.current = { x: sx, y: sy };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPos(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isTouchOnExcludedControls(e.target as HTMLElement | null)) {
        updateCursorPos(e.clientX, e.clientY);
        if (mobileModeRef.current && mobileAimModeRef.current === 'TOUCH') {
          isCursorJoystickActiveRef.current = true;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const targetElement = e.target as HTMLElement | null;
      if (targetElement?.closest('#googolbra-struggle-button') || targetElement?.closest('#googolbra-struggle-overlay')) {
        return;
      }
      if (googolbraStateRef.current === 'SNEAK_GRASP') {
        triggerGoogolbraStruggle();
      }

      if (!isTouchOnExcludedControls(targetElement)) {
        updateCursorPos(e.clientX, e.clientY);
        if (mobileModeRef.current && mobileAimModeRef.current === 'TOUCH') {
          isCursorJoystickActiveRef.current = true;
        }
      }

      // Check math keypad clicks
      if (phiboccionKeypadActiveRef.current) {
        if (phiboccionKeypadResultTimerRef.current > 0 || phiboccionKeypadPendingAdvanceRef.current) {
          return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
          const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
          const sx = (e.clientX - rect.left) * scaleX;
          const sy = (e.clientY - rect.top) * scaleY;

          const cx = canvas.width / 2;
          const cy = canvas.height / 2 - 120;

          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
              const bx = cx - 115 + col * 80;
              const by = cy + 105 + row * 65;
              const bw = 70;
              const bh = 55;

              if (sx >= bx && sx <= bx + bw && sy >= by && sy <= by + bh) {
                let btnLabel = '';
                if (row < 3) {
                  btnLabel = String(7 - row * 3 + col);
                } else {
                  if (col === 0) btnLabel = 'DEL';
                  else if (col === 1) btnLabel = '0';
                  else btnLabel = 'ENTER';
                }

                if (btnLabel === 'DEL') {
                  if (phiboccionKeypadInputRef.current.length > 0) {
                    phiboccionKeypadInputRef.current = phiboccionKeypadInputRef.current.slice(0, -1);
                    soundEngine.playShoot('sword');
                  }
                } else if (btnLabel === 'ENTER') {
                  submitMathAnswer();
                } else {
                  if (phiboccionKeypadInputRef.current.length < 3) {
                    phiboccionKeypadInputRef.current += btnLabel;
                    soundEngine.playShoot('wand');
                  }
                }
                return;
              }
            }
          }

          // Intercept and absorb all clicks inside the overall keypad bounds to prevent movement
          if (sx >= cx - 150 && sx <= cx + 150 && sy >= cy - 140 && sy <= cy + 380) {
            return;
          }
        }
      }

      // Check Pythagoras Monty Hall door clicks
      if (pythagorasMontyHallActiveRef.current) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
          const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
          const sx = (e.clientX - rect.left) * scaleX;
          const sy = (e.clientY - rect.top) * scaleY;

          const { doors } = getMontyDoorGeometry(canvas);

          for (const d of doors) {
            const hitDoor = sx >= d.x && sx <= d.x + d.w && sy >= d.y && sy <= d.y + d.h;
            const hitButton = sx >= d.buttonX && sx <= d.buttonX + d.buttonW && sy >= d.buttonY && sy <= d.buttonY + d.buttonH;

            if (hitDoor || hitButton) {
              handleMontyPickDoor(d.index);
              return;
            }
          }
        }
        return;
      }

      if (!isClickToMoveActiveRef.current || isPausedRef.current) return;
      if (targetElement && targetElement !== canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const p = playerRef.current;
      if (!canvas || !p) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;

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

    const handleCursorJoystickMove = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; active?: boolean }>;
      if (customEvent.detail) {
        const { x, y, active } = customEvent.detail;
        cursorJoystickVectorRef.current = { x, y };
        const dist = Math.hypot(x, y);
        if (dist > 0.05) {
          isCursorJoystickActiveRef.current = true;
          lastCursorAimAngleRef.current = Math.atan2(y, x);

          const canvas = canvasRef.current;
          if (canvas && playerRef.current) {
            const p = playerRef.current;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const cameraX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
            const cameraY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;
            const playerScreenX = p.x - cameraX;
            const playerScreenY = p.y - cameraY;

            const aimDist = Math.min(canvas.width, canvas.height) * 0.28;
            mouseScreenRef.current = {
              x: playerScreenX + x * aimDist,
              y: playerScreenY + y * aimDist,
            };
            lastBattlefieldCursorRef.current = { ...mouseScreenRef.current };
          }
        } else {
          if (active === false) {
            isCursorJoystickActiveRef.current = false;
          }
        }
      }
    };

    const handleTriggerStruggleEvent = () => {
      triggerGoogolbraStruggle();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('trigger-dash', handleTriggerDashEvent);
    window.addEventListener('trigger-struggle', handleTriggerStruggleEvent);
    window.addEventListener('trigger-walk-to-cursor', handleTriggerWalkToCursor);
    window.addEventListener('joystick-move', handleJoystickMove);
    window.addEventListener('cursor-joystick-move', handleCursorJoystickMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('trigger-dash', handleTriggerDashEvent);
      window.removeEventListener('trigger-struggle', handleTriggerStruggleEvent);
      window.removeEventListener('trigger-walk-to-cursor', handleTriggerWalkToCursor);
      window.removeEventListener('joystick-move', handleJoystickMove);
      window.removeEventListener('cursor-joystick-move', handleCursorJoystickMove);
    };
  }, [triggerDash]);

  // Spawn Enemy scaling calibrated for pacing
  const spawnEnemyWave = (dt: number, width: number, height: number) => {
    // No regular enemies spawn in Boss Rush / Singular Fight mode or during active boss fight
    if (isBossRush || isBossFightRef.current) return;

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
        let baseHp = getEnemyBaseHp(enemyLevel);
        if (selectedMapRef.current === 'black_honey_forest') {
          baseHp = Math.round(baseHp * 1.2);
        }

        // Enemy speed scales with time to steadily increase combat pressure
        const baseSpeed = Math.random() * 16 + 48 + Math.min(80, (enemyLevel - 1) * 2.2);
        let speed = baseSpeed;
        const expVal = Math.max(1, Math.round(1 + (enemyLevel - 1) * 0.25));

        // Enemy Archetypes
        const roll = Math.random();
        const isMathRealm = selectedMapRef.current === 'mathematical_realm';
        let type: Enemy['type'] = isMathRealm ? 'UNOCONDA' : 'WRAITH';
        let color = isMathRealm ? '#10b981' : '#38bdf8';
        let radius = 13;
        let hp = baseHp; // Base 20 HP
        let name = isMathRealm ? 'Unoconda' : 'Torch Peasant';
        let damage = 10; // Base enemy deals 10 damage
        let isRed = false;
        speed = baseSpeed * 1.0; // Base 1x speed

        // Red Enemy (Village Knight): Healthier elite enemy, deals 25 damage, drops high-value Red EXP Orb!
        // Rare elite spawn rate calibrated so player reaches level 5 around minute ~5 instead of minute 2
        const isRedTimeEligible = curTime >= 80;
        const redSpawnChance = curTime >= 300 ? 0.82 : curTime >= 180 ? 0.88 : 0.93;
        if (isRedTimeEligible && roll > redSpawnChance) {
          isRed = true;
          if (selectedMapRef.current === 'mathematical_realm') {
            type = 'OBMOOSE';
            name = 'ObMoose';
            radius = 20;
          } else {
            type = 'GHOUL';
            name = 'Village Knight';
            radius = 16;
          }
          color = '#ef4444'; // Distinct crimson red
          hp = baseHp * 3.0; // 60 HP if base is 20
          speed = baseSpeed * 0.75;
          damage = 25; // 25 damage for Red enemy
        } else {
          const subRoll = Math.random();
          if (subRoll < 0.0625) {
            if (isMathRealm) {
              type = 'BUNNARY';
              color = '#06b6d4';
              radius = 20;
              hp = Math.round(baseHp * 1.25); // 25 HP when base is 20
              name = 'Bunnary';
              speed = baseSpeed * 0.85; // 0.85x speed
              damage = 20; // 20 damage
              isRed = false;
            } else {
              type = 'ROCK_THROWER';
              color = '#d97706';
              radius = 14;
              hp = Math.round(baseHp * 1.25); // 25 HP when base is 20
              name = 'Rock Thrower';
              speed = baseSpeed * 0.85; // 0.85x speed
              damage = 20; // 20 damage
              isRed = false;
            }
          } else if (subRoll < 0.53125) {
            if (isMathRealm) {
              type = 'VIIIPER';
              color = '#a855f7';
              radius = 14;
              hp = baseHp; // 20 HP when base is 20
              name = 'VIIIper';
              speed = baseSpeed * 1.0; // Standard 1.0x speed
              damage = 12;
              isRed = false;
            } else {
              type = 'BAT';
              color = '#a855f7';
              radius = 13;
              hp = baseHp; // 20 HP when base is 20
              name = 'Pitchfork Peasant';
              speed = baseSpeed * 1.0; // Standard 1.0x speed
              damage = 12;
              isRed = false;
            }
          } else {
            if (isMathRealm) {
              type = 'UNOCONDA';
              color = '#10b981';
              radius = 13;
              hp = baseHp; // Base 20 HP
              name = 'Unoconda';
              speed = baseSpeed * 1.15; // Same 1.15x speed as Torch Peasant
              damage = 10;
              isRed = false;
            } else {
              type = 'WRAITH';
              color = '#38bdf8';
              radius = 13;
              hp = baseHp; // Base 20 HP
              name = 'Torch Peasant';
              speed = baseSpeed * 1.15; // Swifter 1.15x speed
              damage = 10;
              isRed = false;
            }
          }
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
          rockThrowTimer: 3.5 + Math.random() * 2.0,
          targetDistance: 220 + Math.random() * 40,
          bunnaryMsgIndex: Math.floor(Math.random() * BUNNARY_MESSAGES.length),
          bunnaryCharIndex: -1,
          bunnarySymbolTimer: 0.6,
          bunnaryInGap: false,
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

      // Increment Survival Timer & Monotonic Weapon Clock
      survivalTimeRef.current += dt;
      weaponTimeRef.current += dt;
      const intSec = Math.floor(survivalTimeRef.current);
      if (intSec !== lastReportedSurvivalSecRef.current) {
        lastReportedSurvivalSecRef.current = intSec;
        onUpdateSurvivalTime(intSec, selectedMapRef.current);
      }

      // Boss Rush Mode Logic
      if (isBossRush) {
        if (!bossInstanceRef.current) {
          bossRushPauseTimerRef.current -= dt;
          if (bossRushPauseTimerRef.current <= 0) {
            if (bossRushIndexRef.current < bossRushQueueRef.current.length) {
              const bId = bossRushQueueRef.current[bossRushIndexRef.current];
              spawnBossFight(bId);
            } else {
              // Victory!
              onGameOver({
                time: survivalTimeRef.current,
                level: playerRef.current.level,
                kills: killsCountRef.current,
                bossesKilled: bossesKilledRef.current,
                totalDamage: totalDamageDealtRef.current,
                isVictory: true,
                isFullBossRush: bossRushQueueRef.current.length > 1,
              });
              return;
            }
          }
        }
      } else {
        // Normal Mode: 5-minute countdown to Boss Fight
        // While in a Bossfight (active boss, pending/incoming boss), pause the timer until the Boss is defeated
        const isInBossFight = isBossFightRef.current || bossInstanceRef.current !== null || isBossPendingRef.current;
        if (!isInBossFight) {
          bossCountdownRef.current = Math.max(0, bossCountdownRef.current - dt);

          if (bossCountdownRef.current <= 0) {
            bossCountdownRef.current = 0;
            isBossPendingRef.current = true;
            const destinyControlItem = statItemsRef.current.find((s) => s.id === 'destiny_control');
            if (destinyControlItem && destinyControlItem.level >= 2 && onTriggerBossSelection) {
              const count = destinyControlItem.level >= 4 ? 3 : 2;
              const poolForSelection = selectedMapRef.current === 'mathematical_realm'
                ? BOSS_POOL
                : BOSS_POOL.filter((b) => b.id !== 'phiboccion');
              const shuffled = [...poolForSelection].sort(() => 0.5 - Math.random());
              const selection = shuffled.slice(0, count);
              onTriggerBossSelection(selection);
            } else {
              let selectedBoss;
              if (selectedMapRef.current === 'mathematical_realm') {
                selectedBoss = BOSS_POOL.find((b) => b.id === 'phiboccion') || BOSS_POOL[0];
              } else {
                const availableBosses = BOSS_POOL.filter((b) => b.id !== 'phiboccion');
                selectedBoss = availableBosses[Math.floor(Math.random() * availableBosses.length)] || BOSS_POOL[0];
              }
              if (onBossIncoming) {
                onBossIncoming(selectedBoss);
              } else {
                spawnBossFight(selectedBoss.id);
              }
            }
          }
        }

        const intCountdown = Math.ceil(bossCountdownRef.current);
        if (onUpdateBossCountdown && intCountdown !== lastReportedCountdownRef.current) {
          lastReportedCountdownRef.current = intCountdown;
          onUpdateBossCountdown(intCountdown);
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

        // Monitor damage taken for Googolbra Constriction Repel
        if (bossPreviousHpRef.current === -1 || bossPreviousHpRef.current < boss.hp) {
          bossPreviousHpRef.current = boss.hp;
        }
        if (boss.hp < bossPreviousHpRef.current) {
          const dmgDealt = bossPreviousHpRef.current - boss.hp;
          bossPreviousHpRef.current = boss.hp;

          if (boss.id === 'googolbra' && googolbraStateRef.current === 'CONSTRICTION') {
            googolbraConstrictionDamageTakenRef.current += dmgDealt;
            const threshold = boss.maxHp / 5;
            if (googolbraConstrictionDamageTakenRef.current >= threshold) {
              googolbraStateRef.current = 'RETREATING';
              boss.googolbraState = 'RETREATING';
              soundEngine.playHit();
              if (screenShakeEnabledRef.current) screenShakeRef.current = 8;
              const lang = getLanguage();
              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x,
                y: boss.y - 45,
                text: lang === 'pt-BR' ? 'REPELIDO! RECUANDO!' : 'REPELLED! RETREATING!',
                color: '#38bdf8',
                life: 0,
                maxLife: 1.5,
                vy: -30,
              });
            }
          }
        }

        if (boss.vineRootedDuration && boss.vineRootedDuration > 0) {
          boss.vineRootedDuration -= dt;
        }

        if (boss.frozenTimer && boss.frozenTimer > 0) {
          boss.frozenTimer -= dt;
        }

        // Boss Burn status effect
        if (boss.burnDuration && boss.burnDuration > 0) {
          boss.burnDuration -= dt;
          boss.burnTickTimer = (boss.burnTickTimer || 0) - dt;
          if (boss.burnTickTimer <= 0) {
            boss.burnTickTimer = 0.5; // Tick twice per second for 5s
            if (!boss.isInvincible) {
              const tickDmg = boss.burnDamagePerTick || 1;
              const actualTickDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : tickDmg;
              boss.hp -= actualTickDmg;
              boss.lastHitBy = 'seeking_wisp';
              bossHitFlashRef.current = 0.08;

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x + (Math.random() - 0.5) * 20,
                y: boss.y - 25,
                text: `${Math.round(actualTickDmg)}`,
                color: '#ef4444',
                life: 0,
                maxLife: 0.6,
                vy: -40,
              });
            }
          }
        }

        // Boss Acid status effect
        if (boss.acidDuration && boss.acidDuration > 0) {
          boss.acidDuration -= dt;
          boss.acidTickTimer = (boss.acidTickTimer || 0) - dt;
          if (boss.acidTickTimer <= 0) {
            boss.acidTickTimer = 1.0; // Tick once per second for Acid
            if (!boss.isInvincible) {
              const tickDmg = boss.acidDamagePerTick || 1;
              const actualTickDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : tickDmg;
              boss.hp -= actualTickDmg;
              boss.lastHitBy = 'brimstone_shotgun';
              bossHitFlashRef.current = 0.08;

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x + (Math.random() - 0.5) * 20,
                y: boss.y - 25,
                text: `${Math.round(actualTickDmg)}`,
                color: '#22c55e',
                life: 0,
                maxLife: 0.6,
                vy: -40,
              });
            }
          }
        }

        if (onBossUpdate) {
          const nowMs = performance.now();
          const currentIntTimer = Math.ceil(bossTimerRef.current);
          const hpDiff = Math.abs(boss.hp - lastReportedBossHpRef.current);
          const minReportInterval = mobileModeRef.current ? 200 : 80;
          if (boss.hp <= 0 || currentIntTimer !== lastReportedBossTimerRef.current || (hpDiff >= 1 && nowMs - lastBossReportTimeRef.current >= minReportInterval)) {
            lastBossReportTimeRef.current = nowMs;
            lastReportedBossTimerRef.current = currentIntTimer;
            lastReportedBossHpRef.current = boss.hp;
            onBossUpdate(boss, true, currentIntTimer, boss.hp);
          }
        }

        // Player Death Condition
        if (playerRef.current.hp <= 0) {
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

        // Carnivore Plant Attack Pattern (3 Vine snare attacks -> 1 Chomp attack -> Repeat)
        if (boss.id === 'carnivore_plant') {
          bossAttackCooldownRef.current -= dt;
          if (bossAttackCooldownRef.current <= 0) {
            const attackCycle = bossAttackCountRef.current % 4;
            bossAttackCountRef.current++;

            if (attackCycle < 3) {
              // Vine Snare (1, 2, 3 of 4)
              if (attackCycle === 2) {
                // Larger delay after the 3rd attack so the player's Dash (3s base cooldown) is guaranteed to be ready before the Chomp Attack
                bossAttackCooldownRef.current = 4.2 + Math.random() * 0.4;
              } else {
                // Clean interval of 1.9s - 2.2s so the attack finishes before the next begins
                bossAttackCooldownRef.current = 1.9 + Math.random() * 0.3;
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
                  hp: selectedMapRef.current === 'black_honey_forest' ? 2 : 1,
                  maxHp: selectedMapRef.current === 'black_honey_forest' ? 2 : 1,
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
              const dmgThisFrame = invincibilityRef.current ? 0 : (dps * dt);
              playerRef.current.hp = Math.max(0, playerRef.current.hp - dmgThisFrame);
              lastReportedHpRef.current = playerRef.current.hp;
              onUpdatePlayer({ hp: playerRef.current.hp });

              if (playerRef.current.hp <= 0) {
                playerRef.current.hp = 0;
                lastReportedHpRef.current = 0;
                onUpdatePlayer({ hp: 0 });
                onGameOver({
                  time: survivalTimeRef.current,
                  level: playerRef.current.level,
                  kills: killsCountRef.current,
                  bossesKilled: bossesKilledRef.current,
                  killerName: boss.name,
                });
                return;
              }

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
              nightBearChargeDurationRef.current = 0;
              soundEngine.playHit();
            }
          } else if (nightBearStateRef.current === 'CHARGING') {
            nightBearChargeDurationRef.current += dt;
            const chargeSpeed = 650;
            boss.x += Math.cos(nightBearChargeAngleRef.current) * chargeSpeed * dt;
            boss.y += Math.sin(nightBearChargeAngleRef.current) * chargeSpeed * dt;

            // Wall check
            const hitWallX = boss.x <= minX + boss.radius || boss.x >= maxX - boss.radius;
            const hitWallY = boss.y <= minY + boss.radius || boss.y >= maxY - boss.radius;
            const chargeTimedOut = nightBearChargeDurationRef.current >= 2.5;

            if (hitWallX || hitWallY || chargeTimedOut) {
              // Clamp to walls
              boss.x = Math.max(minX + boss.radius, Math.min(maxX - boss.radius, boss.x));
              boss.y = Math.max(minY + boss.radius, Math.min(maxY - boss.radius, boss.y));

              nightBearChargesRef.current++;
              if (screenShakeEnabledRef.current) screenShakeRef.current = 10;
              soundEngine.playHit();
              
              if (nightBearChargesRef.current < 3) {
                nightBearStateRef.current = 'TELEGRAPH';
                nightBearTimerRef.current = 0.6;
                nightBearChargeTargetRef.current = { x: p.x, y: p.y };
                nightBearChargeAngleRef.current = Math.atan2(p.y - boss.y, p.x - boss.x);
              } else {
                nightBearStateRef.current = 'DIZZY';
                nightBearTimerRef.current = 2.8;
                nightBearChargesRef.current = 0;
                nightBearDizzyCountRef.current++;
              }
            }

            // Charge damage to player
            if (!nightBearHasHitPlayerRef.current && playerInvincibleTimerRef.current <= 0) {
              const distToP = Math.hypot(p.x - boss.x, p.y - boss.y);
              if (distToP < p.radius + boss.radius) {
                nightBearHasHitPlayerRef.current = true;
                const chargeDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(boss.damage * (1 - (p.damageReduction || 0))));
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
              // Boss recovers from dizziness:
              // The Charge Attack and "THE Bite" Attack alternate 2 - 1.
              // NightBear must experience 2 dizzy states (Charge Attacks) before using "THE Bite"!
              if (nightBearDizzyCountRef.current >= 2) {
                nightBearStateRef.current = 'BITE_REPOSITION';
                nightBearTimerRef.current = 1.0;
                const homeX = lockedCameraRef.current.x + canvas.width / 2;
                const homeY = lockedCameraRef.current.y + 115;
                nightBearRepositionStartRef.current = { x: boss.x, y: boss.y };
                nightBearRepositionTargetRef.current = { x: homeX, y: homeY };
                soundEngine.playRoar();
              } else {
                nightBearStateRef.current = 'IDLE';
                bossAttackCooldownRef.current = 1.0;
              }
            }
          } else if (nightBearStateRef.current === 'BITE_REPOSITION') {
            nightBearTimerRef.current -= dt;
            const repositionDuration = 1.0;
            const progress = Math.min(1, Math.max(0, 1 - nightBearTimerRef.current / repositionDuration));
            const ease = progress * progress * (3 - 2 * progress);
            const start = nightBearRepositionStartRef.current;
            const target = nightBearRepositionTargetRef.current;

            boss.x = start.x + (target.x - start.x) * ease;
            boss.y = start.y + (target.y - start.y) * ease;

            if (nightBearTimerRef.current <= 0) {
              boss.x = target.x;
              boss.y = target.y;
              if (screenShakeEnabledRef.current) screenShakeRef.current = 10;
              soundEngine.playHit();
              soundEngine.playRoar();

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x,
                y: boss.y - boss.radius - 22,
                text: 'THE BITE!',
                color: '#ef4444',
                life: 0,
                maxLife: 1.4,
                vy: -35,
              });

              nightBearStateRef.current = 'BITE_ATTACK';
              nightBearTimerRef.current = 1.6; // 1.0s telegraph + 0.35s bite active + 0.25s post-bite

              // Spawn non-overlapping circular areas with a 1.0s warning telegraph
              const biteRadius = 40;
              const safeZoneRadius = 48;
              const minBiteDist = biteRadius * 2 + 8; // Strictly non-overlapping: 88px between centers
              const safeDist = 100; // Comfortable distance for player to walk to in 1.0s

              // Usable arena bounds
              const usableMinX = minX + biteRadius + 8;
              const usableMaxX = maxX - biteRadius - 8;
              const usableMinY = minY + 90 + biteRadius + 8;
              const usableMaxY = maxY - biteRadius - 8;

              const arenaCenterX = (usableMinX + usableMaxX) / 2;
              const arenaCenterY = (usableMinY + usableMaxY) / 2;

              // Determine safe zone direction: defaults toward arena center
              let angle = Math.atan2(arenaCenterY - p.y, arenaCenterX - p.x);

              // If player is moving, test if movement direction points into safe bounds
              const isMoving = keysRef.current['w'] || keysRef.current['s'] || keysRef.current['a'] || keysRef.current['d'] ||
                keysRef.current['arrowup'] || keysRef.current['arrowdown'] || keysRef.current['arrowleft'] || keysRef.current['arrowright'];
              if (isMoving) {
                let dx = 0;
                let dy = 0;
                if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
                if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;
                if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
                if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
                if (dx !== 0 || dy !== 0) {
                  const moveAngle = Math.atan2(dy, dx);
                  const testX = p.x + Math.cos(moveAngle) * safeDist;
                  const testY = p.y + Math.sin(moveAngle) * safeDist;
                  if (testX >= usableMinX + safeZoneRadius && testX <= usableMaxX - safeZoneRadius &&
                      testY >= usableMinY + safeZoneRadius && testY <= usableMaxY - safeZoneRadius) {
                    angle = moveAngle;
                  }
                }
              }

              // Compute safe zone position
              let safeZoneX = p.x + Math.cos(angle) * safeDist;
              let safeZoneY = p.y + Math.sin(angle) * safeDist;
              safeZoneX = Math.max(usableMinX + safeZoneRadius, Math.min(usableMaxX - safeZoneRadius, safeZoneX));
              safeZoneY = Math.max(usableMinY + safeZoneRadius, Math.min(usableMaxY - safeZoneRadius, safeZoneY));

              // Guarantee the safe zone is NEVER directly under the player: minimum distance 75px
              if (Math.hypot(safeZoneX - p.x, safeZoneY - p.y) < 75) {
                const toCenterAngle = Math.atan2(arenaCenterY - p.y, arenaCenterX - p.x);
                safeZoneX = Math.max(usableMinX + safeZoneRadius, Math.min(usableMaxX - safeZoneRadius, p.x + Math.cos(toCenterAngle) * safeDist));
                safeZoneY = Math.max(usableMinY + safeZoneRadius, Math.min(usableMaxY - safeZoneRadius, p.y + Math.sin(toCenterAngle) * safeDist));
              }

              // 1. Mandatory bite placed directly on/under the player so they cannot stand still (safe zone never under them)
              const pBiteX = Math.max(usableMinX, Math.min(usableMaxX, p.x));
              const pBiteY = Math.max(usableMinY, Math.min(usableMaxY, p.y));

              // Ensure the bite on player and safe zone do not overlap
              const distToSafe = Math.hypot(pBiteX - safeZoneX, pBiteY - safeZoneY);
              const minSafeGap = biteRadius + safeZoneRadius + 8; // 40 + 48 + 8 = 96px
              if (distToSafe < minSafeGap) {
                const pushAngle = Math.atan2(safeZoneY - pBiteY, safeZoneX - pBiteX);
                safeZoneX = Math.max(usableMinX + safeZoneRadius, Math.min(usableMaxX - safeZoneRadius, pBiteX + Math.cos(pushAngle) * minSafeGap));
                safeZoneY = Math.max(usableMinY + safeZoneRadius, Math.min(usableMaxY - safeZoneRadius, pBiteY + Math.sin(pushAngle) * minSafeGap));
              }

              nightBearSafeZoneRef.current = { x: safeZoneX, y: safeZoneY, radius: safeZoneRadius };

              const biteSpots: { x: number; y: number }[] = [];
              biteSpots.push({ x: pBiteX, y: pBiteY });

              // Validation helper: strictly prevents bite overlaps and protects the safe zone
              const isBiteAllowed = (bx: number, by: number): boolean => {
                // Must not overlap safe zone
                if (Math.hypot(bx - safeZoneX, by - safeZoneY) < biteRadius + safeZoneRadius + 6) {
                  return false;
                }
                // Must not overlap ANY existing bite
                for (let i = 0; i < biteSpots.length; i++) {
                  if (Math.hypot(bx - biteSpots[i].x, by - biteSpots[i].y) < minBiteDist) {
                    return false;
                  }
                }
                return true;
              };

              // Fill the arena with non-overlapping candidate bites using jittered grid
              const step = minBiteDist;
              const gridCandidates: { x: number; y: number }[] = [];
              for (let gx = usableMinX; gx <= usableMaxX; gx += step) {
                for (let gy = usableMinY; gy <= usableMaxY; gy += step) {
                  const jx = Math.max(usableMinX, Math.min(usableMaxX, gx + (Math.random() - 0.5) * 14));
                  const jy = Math.max(usableMinY, Math.min(usableMaxY, gy + (Math.random() - 0.5) * 14));
                  gridCandidates.push({ x: jx, y: jy });
                }
              }

              // Shuffle grid candidates
              for (let i = gridCandidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gridCandidates[i], gridCandidates[j]] = [gridCandidates[j], gridCandidates[i]];
              }

              for (const cand of gridCandidates) {
                if (isBiteAllowed(cand.x, cand.y)) {
                  biteSpots.push({ x: cand.x, y: cand.y });
                }
              }

              // Random sampling pass to pack any remaining pockets while strictly preserving non-overlap
              for (let attempt = 0; attempt < 250; attempt++) {
                const rx = usableMinX + Math.random() * (usableMaxX - usableMinX);
                const ry = usableMinY + Math.random() * (usableMaxY - usableMinY);
                if (isBiteAllowed(rx, ry)) {
                  biteSpots.push({ x: rx, y: ry });
                }
              }

              for (const spot of biteSpots) {
                boss.attacks.push({
                  type: 'NIGHT_BEAR_BITE',
                  x: spot.x,
                  y: spot.y,
                  radius: biteRadius,
                  warningTimer: 1.0, // 1.0s telegraph warning
                  activeTimer: 0.35,  // 0.35s biting snap active
                  duration: 1.35,
                  damage: boss.damage,
                  hasHit: false,
                });
              }
            }
          } else if (nightBearStateRef.current === 'BITE_ATTACK') {
            nightBearTimerRef.current -= dt;
            if (nightBearTimerRef.current <= 0) {
              // Conclude "THE Bite" Attack and restart cycle:
              nightBearDizzyCountRef.current = 0;
              nightBearChargesRef.current = 0;
              nightBearSafeZoneRef.current = null;
              nightBearStateRef.current = 'IDLE';
              bossAttackCooldownRef.current = 1.0;
            }
          }
        } else if (boss.id === 'archmages') {
          // --- THE 3 ARCHMAGES BOSS LOGIC ---
          const cam = lockedCameraRef.current;
          const canvasW = canvas.width;
          const canvasH = canvas.height;
          const topCenterX = cam.x + canvasW / 2;
          const topCenterY = cam.y + 115;
          const arenaCenterX = cam.x + canvasW / 2;
          const arenaCenterY = cam.y + canvasH / 2;

          // Sync Phase 1 damage if boss.hp was reduced externally
          if (boss.archmagesPhase === 'PHASE1' && boss.archmagesList) {
            const activeWiz = boss.archmagesList.find(w => w.id === boss.activeArchmageId);
            const totalWizHp = boss.archmagesList.reduce((sum, w) => sum + Math.max(0, w.hp), 0);
            if (boss.hp < totalWizHp) {
              const diff = totalWizHp - boss.hp;
              if (activeWiz && !activeWiz.isShielded && activeWiz.hp > 0) {
                if (activeWiz.isTurnShielded) {
                  // Active wizard is currently in temporary turn shield (took 1/3 of max HP this attack turn)
                  boss.hp = totalWizHp;
                } else {
                  const maxHp = activeWiz.maxHp || 600;
                  const turnDmgLimit = maxHp / 3;
                  const currentTurnDmg = activeWiz.turnDamageTaken || 0;
                  const allowedTurnDmg = Math.max(0, turnDmgLimit - currentTurnDmg);
                  const actualDmg = Math.min(diff, allowedTurnDmg);

                  activeWiz.turnDamageTaken = currentTurnDmg + actualDmg;
                  activeWiz.hp = Math.max(0, activeWiz.hp - actualDmg);

                  if (activeWiz.hp <= 0) {
                    activeWiz.hp = 0;
                    activeWiz.isShielded = true;
                    activeWiz.isTurnShielded = false;
                    activeWiz.turnDamageTaken = 0;
                    const shieldedCount = boss.archmagesList.filter(w => w.isShielded).length - 1;
                    activeWiz.x = cam.x + 60 + shieldedCount * 55;
                    activeWiz.y = cam.y + canvasH - 145; // Raised position clearing bottom-left HUD!
                    soundEngine.playLevelUp();
                    boss.attacks = [];
                    archmageSpinningBeamsRef.current = null;
                    archmageBlueTelegraphTimerRef.current = 0;
                    const remaining = boss.archmagesList.filter(w => !w.isShielded && w.hp > 0);
                    if (remaining.length === 0) {
                      boss.archmagesPhase = 'MERGING';
                      boss.activeArchmageId = null;
                      archmageMergingTimerRef.current = 2.0;
                    } else {
                      const nextWiz = remaining[0];
                      boss.activeArchmageId = nextWiz.id;
                      nextWiz.isTurnShielded = false;
                      nextWiz.turnDamageTaken = 0;
                      archmageAttackTimerRef.current = 0.5;
                      archmageSubStepRef.current = 0;
                      archmageFireballsFiredRef.current = 0;
                    }
                  } else if (activeWiz.turnDamageTaken >= turnDmgLimit) {
                    // Reached 1/3 max HP DMG limit for this attack phase! Raise bubble shield for remainder of attack
                    activeWiz.isTurnShielded = true;
                    soundEngine.playLevelUp();
                    floatingTextsRef.current.push({
                      id: nextEntityId.current++,
                      x: activeWiz.x,
                      y: activeWiz.y - 45,
                      text: 'SHIELDED!',
                      color: '#38bdf8',
                      life: 0.8,
                      maxLife: 0.8,
                      vy: -30,
                    });
                  }
                  boss.hp = Math.max(1, boss.archmagesList.reduce((sum, w) => sum + Math.max(0, w.hp), 0));
                }
              }
            }
          }

          if (boss.archmagesPhase === 'PHASE1') {
            const list = boss.archmagesList || [];
            const activeId = boss.activeArchmageId || 'geraldo_red';
            const activeWiz = list.find(w => w.id === activeId);

            if (!activeWiz || activeWiz.isShielded || activeWiz.hp <= 0) {
              const alive = list.filter(w => !w.isShielded && w.hp > 0);
              if (alive.length === 0) {
                boss.archmagesPhase = 'MERGING';
                boss.activeArchmageId = null;
                boss.attacks = [];
                archmageSpinningBeamsRef.current = null;
                archmageBlueTelegraphTimerRef.current = 0;
                archmageMergingTimerRef.current = 2.0;
                soundEngine.playLevelUp();
              } else {
                const nextWiz = alive[0];
                boss.activeArchmageId = nextWiz.id;
                nextWiz.isTurnShielded = false;
                nextWiz.turnDamageTaken = 0;
                archmageAttackTimerRef.current = 0.5;
                archmageSubStepRef.current = 0;
                archmageFireballsFiredRef.current = 0;
              }
            } else {
              const isBlue = activeId === 'geraldo_blue';
              const curTargetX = isBlue ? arenaCenterX : topCenterX;
              const curTargetY = isBlue ? arenaCenterY : topCenterY;
              activeWiz.x = curTargetX;
              activeWiz.y = curTargetY;
              boss.x = curTargetX;
              boss.y = curTargetY;

              archmageAttackTimerRef.current -= dt;

              if (activeId === 'geraldo_red') {
                // IT'S RAINING FIRE! (Geraldo The Red)
                if (archmageFireballsFiredRef.current < 4) {
                  if (archmageAttackTimerRef.current <= 0) {
                    archmageAttackTimerRef.current = 2.0;
                    archmageFireballsFiredRef.current++;

                    soundEngine.playShoot('fireball');
                    if (screenShakeEnabledRef.current) screenShakeRef.current = 4;

                    boss.attacks.push({
                      type: 'ARCHMAGES_FIREBALL',
                      x: cam.x + 30,
                      y: arenaCenterY,
                      radius: 18,
                      vx: 130,
                      vy: 0,
                      warningTimer: 0,
                      activeTimer: 10,
                      duration: 10,
                      damage: 20,
                      hasHit: false,
                    });

                    boss.attacks.push({
                      type: 'ARCHMAGES_FIREBALL',
                      x: cam.x + canvasW - 30,
                      y: arenaCenterY,
                      radius: 18,
                      vx: -130,
                      vy: 0,
                      warningTimer: 0,
                      activeTimer: 10,
                      duration: 10,
                      damage: 20,
                      hasHit: false,
                    });

                    if (archmageFireballsFiredRef.current === 4) {
                      archmageAttackTimerRef.current = 4.0;
                    }
                  }
                } else {
                  if (archmageAttackTimerRef.current <= 0) {
                    boss.attacks = boss.attacks.filter(a => a.type !== 'ARCHMAGES_FIREBALL');
                    activeWiz.isTurnShielded = false;
                    activeWiz.turnDamageTaken = 0;
                    const alive = list.filter(w => !w.isShielded && w.hp > 0);
                    const nextWiz = alive.find(w => w.id === 'geraldo_green') || alive.find(w => w.id === 'geraldo_blue') || alive[0];
                    if (nextWiz) {
                      boss.activeArchmageId = nextWiz.id;
                      nextWiz.isTurnShielded = false;
                      nextWiz.turnDamageTaken = 0;
                      archmageAttackTimerRef.current = 0.6;
                      archmageSubStepRef.current = 0;
                      archmageFireballsFiredRef.current = 0;
                    }
                  }
                }
              } else if (activeId === 'geraldo_green') {
                // VINE BOX (Geraldo The Green)
                const tileSize = 80;
                const boxLeft = arenaCenterX - (tileSize * 3) / 2;
                const boxTop = arenaCenterY - (tileSize * 3) / 2;

                if (p.x < boxLeft + p.radius) p.x = boxLeft + p.radius;
                if (p.x > boxLeft + tileSize * 3 - p.radius) p.x = boxLeft + tileSize * 3 - p.radius;
                if (p.y < boxTop + p.radius) p.y = boxTop + p.radius;
                if (p.y > boxTop + tileSize * 3 - p.radius) p.y = boxTop + tileSize * 3 - p.radius;

                if (archmageAttackTimerRef.current <= 0) {
                  if (archmageSubStepRef.current < 5) {
                    archmageSubStepRef.current++;
                    archmageAttackTimerRef.current = 1.6;

                    soundEngine.playShoot('plant');

                    let isHorizontal = Math.random() < 0.5;
                    let index = Math.floor(Math.random() * 3);
                    let key = `${isHorizontal ? 'H' : 'V'}_${index}`;
                    while (key === lastVineAttackKeyRef.current) {
                      isHorizontal = Math.random() < 0.5;
                      index = Math.floor(Math.random() * 3);
                      key = `${isHorizontal ? 'H' : 'V'}_${index}`;
                    }
                    lastVineAttackKeyRef.current = key;

                    let startTileX = 0;
                    let startTileY = 0;
                    let countX = 3;
                    let countY = 1;

                    if (isHorizontal) {
                      startTileX = 0;
                      startTileY = index;
                      countX = 3;
                      countY = 1;
                    } else {
                      startTileX = index;
                      startTileY = 0;
                      countX = 1;
                      countY = 3;
                    }

                    const hazardX = boxLeft + startTileX * tileSize;
                    const hazardY = boxTop + startTileY * tileSize;
                    const hazardW = countX * tileSize;
                    const hazardH = countY * tileSize;

                    boss.attacks.push({
                      type: 'ARCHMAGES_VINE_TILE_ATTACK',
                      x: hazardX + hazardW / 2,
                      y: hazardY + hazardH / 2,
                      width: hazardW,
                      height: hazardH,
                      radius: Math.max(hazardW, hazardH) / 2,
                      warningTimer: 1.0,
                      activeTimer: 0.35,
                      duration: 1.35,
                      damage: 25,
                      hasHit: false,
                    });
                  } else {
                    boss.attacks = boss.attacks.filter(a => a.type !== 'ARCHMAGES_VINE_TILE_ATTACK');
                    activeWiz.isTurnShielded = false;
                    activeWiz.turnDamageTaken = 0;
                    const alive = list.filter(w => !w.isShielded && w.hp > 0);
                    const nextWiz = alive.find(w => w.id === 'geraldo_blue') || alive.find(w => w.id === 'geraldo_red') || alive[0];
                    if (nextWiz) {
                      boss.activeArchmageId = nextWiz.id;
                      nextWiz.isTurnShielded = false;
                      nextWiz.turnDamageTaken = 0;
                      archmageAttackTimerRef.current = 0.6;
                      archmageSubStepRef.current = 0;
                      archmageFireballsFiredRef.current = 0;
                    }
                  }
                }
              } else if (activeId === 'geraldo_blue') {
                // THUNDER BEAMS (Geraldo The Blue) - 1.5s Telegraph phase before lasers
                if (archmageSubStepRef.current === 0) {
                  archmageSubStepRef.current = 1;
                  archmageAttackTimerRef.current = 1.5; // 1.5s Telegraph time!
                  archmageBlueTelegraphTimerRef.current = 1.5;
                  soundEngine.playShoot('wand');
                } else if (archmageSubStepRef.current === 1) {
                  archmageBlueTelegraphTimerRef.current = Math.max(0, archmageAttackTimerRef.current);
                  if (archmageAttackTimerRef.current <= 0) {
                    archmageSubStepRef.current = 2;
                    archmageBlueTelegraphTimerRef.current = 0;
                    archmageAttackTimerRef.current = 7.0;
                    archmageSpinningBeamsRef.current = {
                      baseAngle: 0,
                      spinSpeed: 0.65,
                      beamCount: 4,
                      beamLength: 900,
                      duration: 7.0,
                      isRainbow: false,
                    };
                    soundEngine.playShoot('wand');
                  }
                } else if (archmageSubStepRef.current === 2) {
                  if (archmageSpinningBeamsRef.current) {
                    archmageSpinningBeamsRef.current.baseAngle += 0.65 * dt;
                    archmageSpinningBeamsRef.current.duration -= dt;

                    if (bossDashHitCooldownRef.current <= 0 && playerInvincibleTimerRef.current <= 0) {
                      const beams = archmageSpinningBeamsRef.current;
                      const bx = arenaCenterX;
                      const by = arenaCenterY;
                      const px = p.x;
                      const py = p.y;
                      let hitByBeam = false;

                      for (let b = 0; b < beams.beamCount; b++) {
                        const beamAngle = beams.baseAngle + (b * Math.PI * 2) / beams.beamCount;
                        const beamCos = Math.cos(beamAngle);
                        const beamSin = Math.sin(beamAngle);
                        const dx = px - bx;
                        const dy = py - by;
                        const projDist = dx * beamCos + dy * beamSin;
                        const perpDist = Math.abs(-dx * beamSin + dy * beamCos);

                        if (projDist >= 0 && projDist <= beams.beamLength && perpDist <= p.radius + 14) {
                          hitByBeam = true;
                          break;
                        }
                      }

                      if (hitByBeam) {
                        bossDashHitCooldownRef.current = 0.4;
                        if (p.isDashing) {
                          floatingTextsRef.current.push({
                            id: nextEntityId.current++,
                            x: p.x,
                            y: p.y - 20,
                            text: 'DODGE!',
                            color: '#38bdf8',
                            life: 0.6,
                            maxLife: 0.6,
                            vy: -40,
                          });
                        } else {
                          playerInvincibleTimerRef.current = 1.0; // 1s invincibility time
                          const beamDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(20 * (1 - (p.damageReduction || 0))));
                          p.hp = Math.max(0, p.hp - beamDmg);
                          lastReportedHpRef.current = p.hp;
                          soundEngine.playPlayerHurt();
                          if (screenShakeEnabledRef.current) screenShakeRef.current = 8;
                          floatingTextsRef.current.push({
                            id: nextEntityId.current++,
                            x: p.x,
                            y: p.y - 20,
                            text: `-${beamDmg}`,
                            color: '#38bdf8',
                            life: 0.8,
                            maxLife: 0.8,
                            vy: -40,
                          });
                          onUpdatePlayer({ hp: p.hp });
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
                  }

                  if (archmageAttackTimerRef.current <= 0) {
                    activeWiz.isTurnShielded = false;
                    activeWiz.turnDamageTaken = 0;
                    const alive = list.filter(w => !w.isShielded && w.hp > 0);
                    const nextWiz = alive.find(w => w.id === 'geraldo_red') || alive.find(w => w.id === 'geraldo_green') || alive[0];
                    if (nextWiz && nextWiz.id === 'geraldo_blue' && alive.length === 1) {
                      // Last mage standing: Keep spinning beams active continuously without turning off or telegraphing again
                      archmageAttackTimerRef.current = 7.0;
                      if (archmageSpinningBeamsRef.current) {
                        archmageSpinningBeamsRef.current.duration = 7.0;
                      }
                    } else if (nextWiz) {
                      archmageSpinningBeamsRef.current = null;
                      archmageBlueTelegraphTimerRef.current = 0;
                      boss.activeArchmageId = nextWiz.id;
                      nextWiz.isTurnShielded = false;
                      nextWiz.turnDamageTaken = 0;
                      archmageAttackTimerRef.current = 0.6;
                      archmageSubStepRef.current = 0;
                      archmageFireballsFiredRef.current = 0;
                    }
                  }
                }
              }
            }
          } else if (boss.archmagesPhase === 'MERGING') {
            archmageMergingTimerRef.current -= dt;
            const progress = Math.max(0, Math.min(1, 1 - archmageMergingTimerRef.current / 2.0));
            const list = boss.archmagesList || [];
            const centerMergeX = topCenterX;
            const centerMergeY = topCenterY;

            list.forEach((wiz, idx) => {
              wiz.isTurnShielded = false;
              wiz.turnDamageTaken = 0;
              const angle = (idx * Math.PI * 2) / 3 - Math.PI / 2;
              const triRadius = 130 * Math.min(1, progress * 1.5);
              const targetX = centerMergeX + Math.cos(angle) * triRadius;
              const targetY = centerMergeY + Math.sin(angle) * triRadius;

              if (progress >= 0.75) {
                const dashProg = (progress - 0.75) / 0.25;
                wiz.x = targetX + (centerMergeX - targetX) * dashProg;
                wiz.y = targetY + (centerMergeY - targetY) * dashProg;
              } else {
                wiz.x = targetX;
                wiz.y = targetY;
              }
            });

            for (let k = 0; k < 2; k++) {
              particlesRef.current.push({
                x: centerMergeX + (Math.random() - 0.5) * 80,
                y: centerMergeY + (Math.random() - 0.5) * 80,
                vx: (Math.random() - 0.5) * 40,
                vy: (Math.random() - 0.5) * 40,
                size: Math.random() * 3 + 2,
                color: '#3b82f6',
                alpha: 1,
                decay: 2.5,
              });
            }

            if (archmageMergingTimerRef.current <= 0) {
              boss.archmagesPhase = 'PHASE2';
              const levelMult = 1 + ((p.level - 1) * 0.12);
              const rgbMaxHp = Math.round(1200 * levelMult);
              boss.name = 'Geraldo The RGB';
              boss.hp = rgbMaxHp;
              boss.maxHp = rgbMaxHp;
              boss.x = topCenterX;
              boss.y = topCenterY;
              boss.color = '#ffffff';
              archmageAttackTimerRef.current = 1.0;
              archmageRGBAttackIndexRef.current = 0;
              archmageSubStepRef.current = 0;
              archmageSpinningBeamsRef.current = null;
              archmageCloneRef.current = null;

              soundEngine.playLevelUp();
              if (screenShakeEnabledRef.current) screenShakeRef.current = 16;
            }
          } else if (boss.archmagesPhase === 'PHASE2') {
            archmageAttackTimerRef.current -= dt;
            const currentAtk = archmageRGBAttackIndexRef.current;

            if (currentAtk === 1) {
              // RGBeam: Geraldo The RGB stays at center-center of map
              boss.x = arenaCenterX;
              boss.y = arenaCenterY;
            } else {
              boss.x = topCenterX;
              boss.y = topCenterY;
            }

            if (currentAtk === 0) {
              // CLONING SPELL: 2 Boxes (Player Box & Clone Box) with alternating 3x1 Horizontal & 1x3 Vertical attacks
              const tileSize = 80;
              const pBoxX = arenaCenterX - 160;
              const pBoxY = arenaCenterY;
              const cBoxX = arenaCenterX + 160;
              const cBoxY = arenaCenterY;

              const pBoxLeft = pBoxX - (tileSize * 3) / 2;
              const pBoxTop = pBoxY - (tileSize * 3) / 2;
              const cBoxLeft = cBoxX - (tileSize * 3) / 2;
              const cBoxTop = cBoxY - (tileSize * 3) / 2;

              // Constrain player inside Player's Box
              if (p.x < pBoxLeft + p.radius) p.x = pBoxLeft + p.radius;
              if (p.x > pBoxLeft + tileSize * 3 - p.radius) p.x = pBoxLeft + tileSize * 3 - p.radius;
              if (p.y < pBoxTop + p.radius) p.y = pBoxTop + p.radius;
              if (p.y > pBoxTop + tileSize * 3 - p.radius) p.y = pBoxTop + tileSize * 3 - p.radius;

              if (archmageSubStepRef.current === 0) {
                archmageSubStepRef.current = 1;
                archmageAttackTimerRef.current = 1.0;
                archmageCloneStrikeCountRef.current = 0;
                // Teleport player and clone to the center of their respective box
                p.x = pBoxX;
                p.y = pBoxY;
                archmageCloneRef.current = {
                  x: cBoxX,
                  y: cBoxY,
                  active: true,
                  timer: 7.0,
                };
                // When Clone Spell starts, despawn remaining Rainbow Fireballs
                boss.attacks = boss.attacks.filter(a => a.type !== 'ARCHMAGES_RAINBOW_FIREBALL' && a.type !== 'ARCHMAGES_VINE_TILE_ATTACK');
                soundEngine.playShoot('wand');
              } else {
                if (archmageCloneRef.current) {
                  // Moving player moves clone by same delta so they are always in the same square tile relative to box center
                  const pRelX = p.x - pBoxX;
                  const pRelY = p.y - pBoxY;
                  archmageCloneRef.current.x = cBoxX + pRelX;
                  archmageCloneRef.current.y = cBoxY + pRelY;
                  archmageCloneRef.current.timer = archmageAttackTimerRef.current;
                }

                if (archmageAttackTimerRef.current <= 0) {
                  if (archmageCloneStrikeCountRef.current < 4) {
                    archmageCloneStrikeCountRef.current++;
                    archmageAttackTimerRef.current = 1.9;
                    soundEngine.playShoot('plant');

                    let rIndex = Math.floor(Math.random() * 3);
                    let cIndex = Math.floor(Math.random() * 3);

                    const isOdd = archmageCloneStrikeCountRef.current % 2 === 1;
                    let pKey = isOdd ? `H_${rIndex}` : `V_${cIndex}`;
                    while (pKey === lastVineAttackKeyRef.current) {
                      rIndex = Math.floor(Math.random() * 3);
                      cIndex = Math.floor(Math.random() * 3);
                      pKey = isOdd ? `H_${rIndex}` : `V_${cIndex}`;
                    }
                    lastVineAttackKeyRef.current = pKey;

                    let startTileX1 = 0, startTileY1 = 0, countX1 = 3, countY1 = 1;
                    let startTileX2 = 0, startTileY2 = 0, countX2 = 1, countY2 = 3;

                    if (archmageCloneStrikeCountRef.current % 2 === 1) {
                      // Odd strike: Player Box gets 3x1 Horizontal, Clone Box gets 1x3 Vertical
                      startTileX1 = 0; startTileY1 = rIndex; countX1 = 3; countY1 = 1;
                      startTileX2 = cIndex; startTileY2 = 0; countX2 = 1; countY2 = 3;
                    } else {
                      // Even strike: Player Box gets 1x3 Vertical, Clone Box gets 3x1 Horizontal
                      startTileX1 = cIndex; startTileY1 = 0; countX1 = 1; countY1 = 3;
                      startTileX2 = 0; startTileY2 = rIndex; countX2 = 3; countY2 = 1;
                    }

                    const hazardX1 = pBoxLeft + startTileX1 * tileSize;
                    const hazardY1 = pBoxTop + startTileY1 * tileSize;
                    const hazardW1 = countX1 * tileSize;
                    const hazardH1 = countY1 * tileSize;

                    const hazardX2 = cBoxLeft + startTileX2 * tileSize;
                    const hazardY2 = cBoxTop + startTileY2 * tileSize;
                    const hazardW2 = countX2 * tileSize;
                    const hazardH2 = countY2 * tileSize;

                    boss.attacks.push({
                      type: 'ARCHMAGES_VINE_TILE_ATTACK',
                      x: hazardX1 + hazardW1 / 2,
                      y: hazardY1 + hazardH1 / 2,
                      width: hazardW1,
                      height: hazardH1,
                      radius: Math.max(hazardW1, hazardH1) / 2,
                      warningTimer: 1.45,
                      activeTimer: 0.35,
                      duration: 1.8,
                      damage: 20,
                      hasHit: false,
                    });

                    boss.attacks.push({
                      type: 'ARCHMAGES_VINE_TILE_ATTACK',
                      x: hazardX2 + hazardW2 / 2,
                      y: hazardY2 + hazardH2 / 2,
                      width: hazardW2,
                      height: hazardH2,
                      radius: Math.max(hazardW2, hazardH2) / 2,
                      warningTimer: 1.45,
                      activeTimer: 0.35,
                      duration: 1.8,
                      damage: 20,
                      hasHit: false,
                    });
                  } else {
                    // Clone spell completed: Despawn clone & filter vine attacks!
                    archmageCloneRef.current = null;
                    boss.attacks = boss.attacks.filter(a => a.type !== 'ARCHMAGES_VINE_TILE_ATTACK');
                    archmageRGBAttackIndexRef.current = 1;
                    archmageAttackTimerRef.current = 0.8;
                    archmageSubStepRef.current = 0;
                  }
                }
              }
            } else if (currentAtk === 1) {
              // RGBEAM: Geraldo The RGB in center-center of map with slower dodgeable lasers (lasts 3s less)
              if (archmageSubStepRef.current === 0) {
                archmageSubStepRef.current = 1;
                archmageAttackTimerRef.current = 1.0;
                archmageSpinningBeamsRef.current = {
                  baseAngle: 0,
                  spinSpeed: 0.35,
                  beamCount: 8,
                  beamLength: 1000,
                  duration: 9.0,
                  isRainbow: true,
                };
                soundEngine.playShoot('wand');
              } else if (archmageSubStepRef.current === 1) {
                if (archmageAttackTimerRef.current <= 0) {
                  archmageSubStepRef.current = 2;
                  archmageAttackTimerRef.current = 8.0;
                  soundEngine.playShoot('wand');
                }
              } else if (archmageSubStepRef.current === 2) {
                if (archmageSpinningBeamsRef.current) {
                  archmageSpinningBeamsRef.current.baseAngle += 0.35 * dt;
                  archmageSpinningBeamsRef.current.duration -= dt;

                  if (bossDashHitCooldownRef.current <= 0 && playerInvincibleTimerRef.current <= 0) {
                    const beams = archmageSpinningBeamsRef.current;
                    const bx = arenaCenterX;
                    const by = arenaCenterY;
                    const px = p.x;
                    const py = p.y;
                    let hitByBeam = false;

                    for (let b = 0; b < beams.beamCount; b++) {
                      const beamAngle = beams.baseAngle + (b * Math.PI * 2) / beams.beamCount;
                      const beamCos = Math.cos(beamAngle);
                      const beamSin = Math.sin(beamAngle);
                      const dx = px - bx;
                      const dy = py - by;
                      const projDist = dx * beamCos + dy * beamSin;
                      const perpDist = Math.abs(-dx * beamSin + dy * beamCos);

                      if (projDist >= 0 && projDist <= beams.beamLength && perpDist <= p.radius + 14) {
                        hitByBeam = true;
                        break;
                      }
                    }

                    if (hitByBeam) {
                      bossDashHitCooldownRef.current = 0.4;
                      if (p.isDashing) {
                        floatingTextsRef.current.push({
                            id: nextEntityId.current++,
                            x: p.x,
                            y: p.y - 20,
                            text: 'DODGE!',
                            color: '#38bdf8',
                            life: 0.6,
                            maxLife: 0.6,
                            vy: -40,
                          });
                      } else {
                        playerInvincibleTimerRef.current = 1.0; // 1s invincibility time
                        const beamDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(25 * (1 - (p.damageReduction || 0))));
                        p.hp = Math.max(0, p.hp - beamDmg);
                        lastReportedHpRef.current = p.hp;
                        soundEngine.playPlayerHurt();
                        if (screenShakeEnabledRef.current) screenShakeRef.current = 10;
                        floatingTextsRef.current.push({
                          id: nextEntityId.current++,
                          x: p.x,
                          y: p.y - 20,
                          text: `-${beamDmg}`,
                          color: '#f43f5e',
                          life: 0.8,
                          maxLife: 0.8,
                          vy: -40,
                        });
                        onUpdatePlayer({ hp: p.hp });
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

                  if (archmageAttackTimerRef.current <= 0) {
                    archmageSpinningBeamsRef.current = null;
                    archmageRGBAttackIndexRef.current = 2;
                    archmageAttackTimerRef.current = 0.8;
                    archmageSubStepRef.current = 0;
                  }
                }
              }
            } else if (currentAtk === 2) {
              // RAINBOW RAIN (Extended by ~2 seconds: 8 volleys & longer lingering fireballs)
              if (archmageSubStepRef.current < 8) {
                if (archmageAttackTimerRef.current <= 0) {
                  archmageSubStepRef.current++;
                  archmageAttackTimerRef.current = 0.85;

                  soundEngine.playShoot('fireball');
                  if (screenShakeEnabledRef.current) screenShakeRef.current = 4;

                  // Spawn Rainbow Fireballs from both sides simultaneously (just like Geraldo The Red)
                  boss.attacks.push({
                    type: 'ARCHMAGES_RAINBOW_FIREBALL',
                    x: cam.x + 30,
                    y: topCenterY - 10 + (Math.random() - 0.5) * 40,
                    radius: 20,
                    vx: 70,
                    vy: 75,
                    warningTimer: 0,
                    activeTimer: 12.0,
                    duration: 12.0,
                    damage: 22,
                    hasHit: false,
                  });
                  boss.attacks.push({
                    type: 'ARCHMAGES_RAINBOW_FIREBALL',
                    x: cam.x + canvasW - 30,
                    y: topCenterY - 10 + (Math.random() - 0.5) * 40,
                    radius: 20,
                    vx: -70,
                    vy: 75,
                    warningTimer: 0,
                    activeTimer: 12.0,
                    duration: 12.0,
                    damage: 22,
                    hasHit: false,
                  });

                  const strikeX = p.x + (Math.random() - 0.5) * 120;
                  const strikeY = p.y + (Math.random() - 0.5) * 120;
                  boss.attacks.push({
                    type: 'ARCHMAGES_THUNDER_STRIKE',
                    x: Math.max(minX + 40, Math.min(maxX - 40, strikeX)),
                    y: Math.max(minY + 120, Math.min(maxY - 40, strikeY)),
                    radius: 42,
                    warningTimer: 1.0,
                    activeTimer: 0.3,
                    duration: 1.3,
                    damage: 25,
                    hasHit: false,
                  });
                }
              } else {
                if (archmageAttackTimerRef.current <= 0) {
                  archmageRGBAttackIndexRef.current = 0;
                  archmageAttackTimerRef.current = 1.2;
                  archmageSubStepRef.current = 0;
                }
              }
            }
          }
        } else if (boss.id === 'googolbra') {
          // --- GOOGOLBRA BOSS BEHAVIOR & AI ---
          const cam = lockedCameraRef.current;
          const tileSize = 80;

          // Ensure spiral path is initialized for current locked arena
          if (googolbraSpiralPathRef.current.length === 0) {
            googolbraSpiralPathRef.current = generateGoogolbraSpiralPath(cam.x, cam.y, canvas.width, canvas.height);
          }

          if (googolbraStateRef.current === 'CONSTRICTION') {
            boss.googolbraState = 'CONSTRICTION';
            // Snake advances along spiral path: top-right -> top-left -> bottom-left -> bottom-right ...
            const spiralSpeed = 8.4; // tiles per second (+50% speed)
            googolbraProgressRef.current += dt * spiralSpeed;

            const headPt = getPathPointAtProgress(googolbraSpiralPathRef.current, googolbraProgressRef.current);
            if (headPt) {
              boss.x = headPt.x;
              boss.y = headPt.y;
              googolbraHeadAngleRef.current = headPt.angle;
            }

            // Body trailing behind the head (up to 100 segments representing Googol's 100 zeros)
            const segCount = Math.min(100, Math.max(0, Math.floor(googolbraProgressRef.current)));
            const segs: { x: number; y: number; dirX: number; dirY: number; angle: number }[] = [];
            for (let s = 1; s <= segCount; s++) {
              const pt = getPathPointAtProgress(googolbraSpiralPathRef.current, googolbraProgressRef.current - s);
              if (pt) segs.push(pt);
            }
            googolbraCurrentSegmentsRef.current = segs;

            // Collision check: Head
            const headContact = Math.hypot(p.x - boss.x, p.y - boss.y) <= p.radius + 36;
            if (headContact && playerInvincibleTimerRef.current <= 0) {
              const contactDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(boss.damage * (1 - (p.damageReduction || 0))));
              p.hp = Math.max(0, p.hp - contactDmg);
              lastReportedHpRef.current = p.hp;
              onUpdatePlayer({ hp: p.hp });
              playerInvincibleTimerRef.current = 0.55;
              soundEngine.playPlayerHurt();
              if (screenShakeEnabledRef.current) {
                screenShakeRef.current = Math.min(screenShakeRef.current + 8, 14);
              }
            }

            // Collision check: Body segments
            if (playerInvincibleTimerRef.current <= 0) {
              for (const seg of segs) {
                if (Math.hypot(p.x - seg.x, p.y - seg.y) <= p.radius + 34) {
                  const segDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round((boss.damage * 0.75) * (1 - (p.damageReduction || 0))));
                  p.hp = Math.max(0, p.hp - segDmg);
                  lastReportedHpRef.current = p.hp;
                  onUpdatePlayer({ hp: p.hp });
                  playerInvincibleTimerRef.current = 0.55;
                  soundEngine.playPlayerHurt();
                  if (screenShakeEnabledRef.current) {
                    screenShakeRef.current = Math.min(screenShakeRef.current + 6, 12);
                  }
                  break;
                }
              }
            }

            // If Googolbra coils all the way to the center of the arena without being repelled
            if (googolbraProgressRef.current >= googolbraSpiralPathRef.current.length - 1) {
              googolbraStateRef.current = 'RETREATING';
              boss.googolbraState = 'RETREATING';
            }
          } else if (googolbraStateRef.current === 'RETREATING') {
            boss.googolbraState = 'RETREATING';
            // Googolbra retreats backwards rapidly until fully off screen (way quicker)
            googolbraProgressRef.current -= dt * 28.0;

            const headPt = getPathPointAtProgress(googolbraSpiralPathRef.current, googolbraProgressRef.current);
            if (headPt) {
              boss.x = headPt.x;
              boss.y = headPt.y;
              googolbraHeadAngleRef.current = headPt.angle + Math.PI; // Face backwards when retreating
            }

            const segCount = Math.min(100, Math.max(0, Math.floor(googolbraProgressRef.current)));
            const segs: { x: number; y: number; dirX: number; dirY: number; angle: number }[] = [];
            for (let s = 1; s <= segCount; s++) {
              const pt = getPathPointAtProgress(googolbraSpiralPathRef.current, googolbraProgressRef.current - s);
              if (pt) segs.push(pt);
            }
            googolbraCurrentSegmentsRef.current = segs;

            // When fully off-screen (progress <= -2)
            if (googolbraProgressRef.current <= -2) {
              googolbraCurrentSegmentsRef.current = [];
              googolbraZebraAttackCountRef.current = 0;
              googolbraStateRef.current = 'ZEBRA_TELEGRAPH';
              boss.googolbraState = 'ZEBRA_TELEGRAPH';
              googolbraZebraStateRef.current.timer = 1.2; // 1.2s telegraph
              googolbraZebraStateRef.current.isVertical = Math.random() < 0.5;

              // Generate alternating zebra stripes across the arena
              const cols = Math.floor(canvas.width / tileSize);
              const rows = Math.floor(canvas.height / tileSize);
              const isVert = googolbraZebraStateRef.current.isVertical;
              const stripes: number[] = [];
              const maxUnits = isVert ? cols : rows;
              for (let i = 1; i < maxUnits; i += 2) {
                stripes.push(i);
              }
              googolbraZebraStateRef.current.stripes = stripes;
              googolbraZebraStateRef.current.progress = 0;

              // Park boss off-screen during telegraph
              boss.x = cam.x - 300;
              boss.y = cam.y - 300;
            }
          } else if (googolbraStateRef.current === 'ZEBRA_TELEGRAPH') {
            boss.googolbraState = 'ZEBRA_TELEGRAPH';
            googolbraZebraStateRef.current.timer -= dt;

            if (googolbraZebraStateRef.current.timer <= 0) {
              // Build continuous serpentine path visiting all stripes simultaneously
              const isVert = googolbraZebraStateRef.current.isVertical;
              const stripes = googolbraZebraStateRef.current.stripes;
              const cols = Math.floor(canvas.width / tileSize);
              const rows = Math.floor(canvas.height / tileSize);
              const waypoints: { x: number; y: number }[] = [];

              if (isVert) {
                const yTop = cam.y - 120;
                const yBottom = cam.y + rows * tileSize + 120;
                const yArenaTop = cam.y - 20;
                const yArenaBottom = cam.y + rows * tileSize + 20;

                stripes.forEach((colIdx, idx) => {
                  const x = cam.x + colIdx * tileSize + tileSize / 2;
                  const goDown = idx % 2 === 0;
                  if (idx === 0) {
                    waypoints.push({ x, y: yTop });
                  }
                  if (goDown) {
                    waypoints.push({ x, y: yArenaBottom });
                  } else {
                    waypoints.push({ x, y: yArenaTop });
                  }
                  if (idx + 1 < stripes.length) {
                    const nextColIdx = stripes[idx + 1];
                    const nextX = cam.x + nextColIdx * tileSize + tileSize / 2;
                    waypoints.push({ x: nextX, y: goDown ? yArenaBottom : yArenaTop });
                  } else {
                    waypoints.push({ x, y: goDown ? yBottom : yTop });
                  }
                });
              } else {
                const xLeft = cam.x - 120;
                const xRight = cam.x + cols * tileSize + 120;
                const xArenaLeft = cam.x - 20;
                const xArenaRight = cam.x + cols * tileSize + 20;

                stripes.forEach((rowIdx, idx) => {
                  const y = cam.y + rowIdx * tileSize + tileSize / 2;
                  const goRight = idx % 2 === 0;
                  if (idx === 0) {
                    waypoints.push({ x: xLeft, y });
                  }
                  if (goRight) {
                    waypoints.push({ x: xArenaRight, y });
                  } else {
                    waypoints.push({ x: xArenaLeft, y });
                  }
                  if (idx + 1 < stripes.length) {
                    const nextRowIdx = stripes[idx + 1];
                    const nextY = cam.y + nextRowIdx * tileSize + tileSize / 2;
                    waypoints.push({ x: goRight ? xArenaRight : xArenaLeft, y: nextY });
                  } else {
                    waypoints.push({ x: goRight ? xRight : xLeft, y });
                  }
                });
              }

              const pathPoints: { x: number; y: number; dirX: number; dirY: number; angle: number; dist: number }[] = [];
              let totalDist = 0;
              pathPoints.push({ x: waypoints[0].x, y: waypoints[0].y, dirX: 0, dirY: 1, angle: Math.PI / 2, dist: 0 });

              for (let i = 0; i < waypoints.length - 1; i++) {
                const p1 = waypoints[i];
                const p2 = waypoints[i + 1];
                const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                if (segLen < 1) continue;
                const dx = (p2.x - p1.x) / segLen;
                const dy = (p2.y - p1.y) / segLen;
                const angle = Math.atan2(dy, dx);
                const step = 15;
                for (let d = step; d < segLen; d += step) {
                  totalDist += step;
                  pathPoints.push({
                    x: p1.x + dx * d,
                    y: p1.y + dy * d,
                    dirX: dx,
                    dirY: dy,
                    angle,
                    dist: totalDist,
                  });
                }
                totalDist += segLen - (Math.floor(segLen / step) * step);
                pathPoints.push({
                  x: p2.x,
                  y: p2.y,
                  dirX: dx,
                  dirY: dy,
                  angle,
                  dist: totalDist,
                });
              }

              googolbraZebraStateRef.current.path = pathPoints;
              googolbraZebraStateRef.current.totalPathLength = totalDist;
              googolbraZebraStateRef.current.snakeLength = totalDist + 800; // Longer than total path to occupy all lanes simultaneously!
              googolbraZebraStateRef.current.progress = 0;
              googolbraStateRef.current = 'ZEBRA_ATTACK';
              boss.googolbraState = 'ZEBRA_ATTACK';
              soundEngine.playWhoosh();
              if (screenShakeEnabledRef.current) screenShakeRef.current = 12;
            }
          } else if (googolbraStateRef.current === 'ZEBRA_ATTACK') {
            boss.googolbraState = 'ZEBRA_ATTACK';
            const zState = googolbraZebraStateRef.current;
            const zebraSpeed = 3400; // Ultra high-speed continuous rush
            zState.progress += dt * zebraSpeed;
            const pHeadDist = zState.progress;

            const path = zState.path;
            const totalL = zState.totalPathLength;
            const snakeL = zState.snakeLength;

            const allSegments: { x: number; y: number; dirX: number; dirY: number; angle: number }[] = [];
            let primaryHeadSet = false;

            const segSpacing = 80; // Discrete 80px tile grid spacing
            const numSegmentsToDraw = Math.floor(snakeL / segSpacing);

            for (let s = 0; s <= numSegmentsToDraw; s++) {
              const d = pHeadDist - s * segSpacing;
              if (d >= 0 && d <= totalL) {
                const sampleIdx = Math.min(
                  path.length - 1,
                  Math.max(0, Math.round((d / (totalL || 1)) * (path.length - 1)))
                );
                const pt = path[sampleIdx] || path[0];
                if (pt) {
                  // Tile grid snap for classic snake aesthetic
                  const cam = lockedCameraRef.current;
                  const snappedX = Math.floor((pt.x - cam.x) / tileSize) * tileSize + tileSize / 2 + cam.x;
                  const snappedY = Math.floor((pt.y - cam.y) / tileSize) * tileSize + tileSize / 2 + cam.y;

                  if (s === 0) {
                    boss.x = snappedX;
                    boss.y = snappedY;
                    googolbraHeadAngleRef.current = pt.angle;
                    primaryHeadSet = true;
                  }
                  allSegments.push({
                    x: snappedX,
                    y: snappedY,
                    dirX: pt.dirX,
                    dirY: pt.dirY,
                    angle: pt.angle,
                  });
                }
              }
            }

            googolbraCurrentSegmentsRef.current = allSegments;

            // Check collision with player
            let hitPlayer = false;
            for (const seg of allSegments) {
              if (Math.hypot(p.x - seg.x, p.y - seg.y) <= p.radius + 36) {
                hitPlayer = true;
                break;
              }
            }

            if (hitPlayer && playerInvincibleTimerRef.current <= 0) {
              const dmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(boss.damage * (1 - (p.damageReduction || 0))));
              p.hp = Math.max(0, p.hp - dmg);
              lastReportedHpRef.current = p.hp;
              onUpdatePlayer({ hp: p.hp });
              playerInvincibleTimerRef.current = 0.55;
              soundEngine.playPlayerHurt();
              if (screenShakeEnabledRef.current) screenShakeRef.current = 10;
            }

            // Once the entire snake has finished rushing through
            if (pHeadDist >= totalL + snakeL) {
              googolbraZebraAttackCountRef.current++;
              if (googolbraZebraAttackCountRef.current < 2) {
                // Wave 1 finished, telegraph Wave 2 immediately with alternating axis!
                googolbraCurrentSegmentsRef.current = [];
                googolbraStateRef.current = 'ZEBRA_TELEGRAPH';
                boss.googolbraState = 'ZEBRA_TELEGRAPH';
                googolbraZebraStateRef.current.timer = 1.0;
                googolbraZebraStateRef.current.isVertical = !googolbraZebraStateRef.current.isVertical;
                googolbraZebraStateRef.current.progress = 0;
                const cols = Math.floor(canvas.width / tileSize);
                const rows = Math.floor(canvas.height / tileSize);
                const isVert = googolbraZebraStateRef.current.isVertical;
                const stripes: number[] = [];
                const maxUnits = isVert ? cols : rows;
                for (let i = 1; i < maxUnits; i += 2) {
                  stripes.push(i);
                }
                googolbraZebraStateRef.current.stripes = stripes;
                boss.x = cam.x - 300;
                boss.y = cam.y - 300;
              } else {
                // Wave 2 complete! Launch Sssneak Attack!
                googolbraZebraAttackCountRef.current = 0;
                googolbraCurrentSegmentsRef.current = [];
                googolbraStateRef.current = 'SNEAK_APPROACH';
                boss.googolbraState = 'SNEAK_APPROACH';

                // Pick random point off-screen
                const spawnAngle = Math.random() * Math.PI * 2;
                const spawnDist = Math.max(canvas.width, canvas.height) * 0.8 + 300;
                const startX = p.x + Math.cos(spawnAngle) * spawnDist;
                const startY = p.y + Math.sin(spawnAngle) * spawnDist;

                boss.x = startX;
                boss.y = startY;
                googolbraHeadAngleRef.current = Math.atan2(p.y - startY, p.x - startX);

                googolbraSneakStateRef.current = {
                  approachTimer: 0,
                  startX,
                  startY,
                  targetX: p.x,
                  targetY: p.y,
                  graspTimer: 0,
                  damageTickTimer: 0,
                  struggles: 0,
                  maxStruggles: 30,
                };
                soundEngine.playWhoosh();
              }
            }
          } else if (googolbraStateRef.current === 'SNEAK_APPROACH') {
            boss.googolbraState = 'SNEAK_APPROACH';
            const sneak = googolbraSneakStateRef.current;
            sneak.approachTimer += dt;
            const approachDuration = 0.35; // Rockets to player in 0.35s
            const progressRatio = Math.min(1, sneak.approachTimer / approachDuration);

            boss.x = sneak.startX + (p.x - sneak.startX) * progressRatio;
            boss.y = sneak.startY + (p.y - sneak.startY) * progressRatio;
            googolbraHeadAngleRef.current = Math.atan2(p.y - sneak.startY, p.x - sneak.startX);

            const segs: { x: number; y: number; dirX: number; dirY: number; angle: number }[] = [];
            const dirX = Math.cos(googolbraHeadAngleRef.current);
            const dirY = Math.sin(googolbraHeadAngleRef.current);
            for (let s = 1; s <= 12; s++) {
              segs.push({
                x: boss.x - dirX * (s * 50),
                y: boss.y - dirY * (s * 50),
                dirX,
                dirY,
                angle: googolbraHeadAngleRef.current,
              });
            }
            googolbraCurrentSegmentsRef.current = segs;

            if (progressRatio >= 1 || Math.hypot(p.x - boss.x, p.y - boss.y) <= 45) {
              googolbraStateRef.current = 'SNEAK_GRASP';
              boss.googolbraState = 'SNEAK_GRASP';
              sneak.graspTimer = 0;
              sneak.damageTickTimer = 0;
              sneak.struggles = 0;
              soundEngine.playWhoosh();
              if (screenShakeEnabledRef.current) screenShakeRef.current = 12;

              googolbraGraspLastTenthsRef.current = -1;
              googolbraGraspLastStrugglesRef.current = -1;
              googolbraGraspLastInDamageRef.current = false;

              window.dispatchEvent(
                new CustomEvent('googolbra-grasp-state', {
                  detail: {
                    active: true,
                    struggles: 0,
                    maxStruggles: sneak.maxStruggles,
                    graceTimer: 5.0,
                    inDamagePhase: false,
                  },
                })
              );
            }
          } else if (googolbraStateRef.current === 'SNEAK_GRASP') {
            boss.googolbraState = 'SNEAK_GRASP';
            const sneak = googolbraSneakStateRef.current;
            sneak.graspTimer += dt;
            const inDamage = sneak.graspTimer >= 5.0;
            const graceRemaining = Math.max(0, 5.0 - sneak.graspTimer);

            // Constrict player movement while grasped
            p.vx = 0;
            p.vy = 0;

            // Tight rotating coil directly wrapping around player
            const coilSpeed = 3.5;
            const coilAngle = (Date.now() / 300) * coilSpeed;
            const coilRadius = 45;
            boss.x = p.x + Math.cos(coilAngle) * coilRadius;
            boss.y = p.y + Math.sin(coilAngle) * coilRadius;
            googolbraHeadAngleRef.current = coilAngle + Math.PI / 2;

            const coilSegs: { x: number; y: number; dirX: number; dirY: number; angle: number }[] = [];
            for (let s = 1; s <= 14; s++) {
              const segA = coilAngle - s * 0.44;
              const r = coilRadius + s * 2.2;
              coilSegs.push({
                x: p.x + Math.cos(segA) * r,
                y: p.y + Math.sin(segA) * r,
                dirX: -Math.sin(segA),
                dirY: Math.cos(segA),
                angle: segA + Math.PI / 2,
              });
            }
            googolbraCurrentSegmentsRef.current = coilSegs;

            // Damage only starts after 5s grace period: 10 DPS (5 damage every 0.5s)
            if (inDamage) {
              sneak.damageTickTimer += dt;
              if (sneak.damageTickTimer >= 0.5) {
                sneak.damageTickTimer -= 0.5;
                const crushDmg = invincibilityRef.current
                  ? 0
                  : Math.max(1, Math.round(5 * (1 - (p.damageReduction || 0))));
                p.hp = Math.max(0, p.hp - crushDmg);
                lastReportedHpRef.current = p.hp;
                onUpdatePlayer({ hp: p.hp });
                soundEngine.playPlayerHurt();
                if (screenShakeEnabledRef.current) screenShakeRef.current = 6;
              }
            }

            // Sync with HUD (Throttled to 10 FPS or on struggle click to prevent mobile React state lag)
            const graceTenths = Math.round(graceRemaining * 10);
            if (
              graceTenths !== googolbraGraspLastTenthsRef.current ||
              sneak.struggles !== googolbraGraspLastStrugglesRef.current ||
              inDamage !== googolbraGraspLastInDamageRef.current
            ) {
              googolbraGraspLastTenthsRef.current = graceTenths;
              googolbraGraspLastStrugglesRef.current = sneak.struggles;
              googolbraGraspLastInDamageRef.current = inDamage;

              window.dispatchEvent(
                new CustomEvent('googolbra-grasp-state', {
                  detail: {
                    active: true,
                    struggles: sneak.struggles,
                    maxStruggles: sneak.maxStruggles,
                    graceTimer: graceRemaining,
                    inDamagePhase: inDamage,
                  },
                })
              );
            }
          } else if (googolbraStateRef.current === 'COOLDOWN') {
            googolbraCooldownTimerRef.current -= dt;
            if (googolbraCooldownTimerRef.current <= 0) {
              googolbraStateRef.current = 'CONSTRICTION';
              boss.googolbraState = 'CONSTRICTION';
              googolbraConstrictionDamageTakenRef.current = 0;
              googolbraProgressRef.current = 0;
              googolbraSpiralPathRef.current = generateGoogolbraSpiralPath(cam.x, cam.y, canvas.width, canvas.height);
            }
          }
        } else if (boss.id === 'phiboccion') {
          // --- PHIBOCCION BEHAVIOR & AI ---
          if (boss.phiboccionState === 'FLOATING') {
            bossAttackCooldownRef.current -= dt;

            // Smoothly hover in place with subtle, gentle floating so he is easy to aim at and hit
            const targetX = lockedCameraRef.current.x + canvas.width / 2 + Math.sin(survivalTimeRef.current * 0.8) * 24;
            const targetY = lockedCameraRef.current.y + 170 + Math.cos(survivalTimeRef.current * 0.6) * 12;
            const dx = targetX - boss.x;
            const dy = targetY - boss.y;
            boss.x += dx * 1.5 * dt;
            boss.y += dy * 1.5 * dt;

            if (bossAttackCooldownRef.current <= 0) {
              const atkIdx = phiboccionAttackIndexRef.current;
              phiboccionAttackIndexRef.current = (atkIdx + 1) % 3;

              if (atkIdx === 0) {
                // Prepare "x to the Power of THIS KICK"
                boss.phiboccionState = 'KICKING';
                boss.isKicking = true;
                phiboccionKickCountRef.current = 0;
                phiboccionKickPhaseRef.current = 'PREP';
                phiboccionTimerRef.current = 0.5;

                // Clear previous Land Phi-nes as specified
                boss.attacks = boss.attacks.filter((a) => a.type !== 'PHIBOCCION_LAND_PHINE');
              } else if (atkIdx === 1) {
                // Prepare "Phi-X-Plosion"
                boss.phiboccionState = 'PHI_X_PLOSION';
                phiboccionKickPhaseRef.current = 'PREP';
                phiboccionTimerRef.current = 0.5;
                boss.isKicking = true;

                // Select random corner out of 4 (or top corners only if Mobile Mode)
                const corner = mobileModeRef.current ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4);
                phiboccionCornerRef.current = corner;

                const left = lockedCameraRef.current.x + 90;
                const right = lockedCameraRef.current.x + canvas.width - 90;
                const top = lockedCameraRef.current.y + 130;
                const bottom = lockedCameraRef.current.y + canvas.height - 90;

                if (corner === 0) {
                  phiboccionDashTargetRef.current = { x: left, y: top };
                } else if (corner === 1) {
                  phiboccionDashTargetRef.current = { x: right, y: top };
                } else if (corner === 2) {
                  phiboccionDashTargetRef.current = { x: left, y: bottom };
                } else {
                  phiboccionDashTargetRef.current = { x: right, y: bottom };
                }
                phiboccionDashStartRef.current = { x: boss.x, y: boss.y };

                // Drop 5 Land Phi-nes at random well-spaced points across the map (never at the player's feet)
                const newMines: { x: number; y: number }[] = [];
                const minMinesX = lockedCameraRef.current.x + 100;
                const maxMinesX = lockedCameraRef.current.x + canvas.width - 100;
                const minMinesY = lockedCameraRef.current.y + 140;
                const maxMinesY = lockedCameraRef.current.y + canvas.height - 100;

                for (let attempts = 0; attempts < 120 && newMines.length < 5; attempts++) {
                  const rx = minMinesX + Math.random() * (maxMinesX - minMinesX);
                  const ry = minMinesY + Math.random() * (maxMinesY - minMinesY);

                  // Must be at least 180px away from the player
                  if (Math.hypot(rx - p.x, ry - p.y) < 180) continue;

                  // Must be at least 150px away from all other mines in this batch
                  if (newMines.some((m) => Math.hypot(m.x - rx, m.y - ry) < 150)) continue;

                  newMines.push({ x: rx, y: ry });
                }

                for (const m of newMines) {
                  boss.attacks.push({
                    type: 'PHIBOCCION_LAND_PHINE',
                    x: m.x,
                    y: m.y,
                    radius: 25,
                    warningTimer: 0.4,
                    activeTimer: 99999,
                    duration: 99999,
                    damage: 30,
                    hasHit: false,
                  });
                }
              } else {
                // Prepare "The Root of Strength"
                boss.phiboccionState = 'ROOT_OF_STRENGTH';
                phiboccionKickPhaseRef.current = 'PREP';
                phiboccionTimerRef.current = 1.2;
                phiboccionDashStartRef.current = { x: boss.x, y: boss.y };
                phiboccionDashTargetRef.current = {
                  x: lockedCameraRef.current.x + canvas.width / 2,
                  y: lockedCameraRef.current.y + 115,
                };
              }
            }
          } else if (boss.phiboccionState === 'KICKING') {
            phiboccionTimerRef.current -= dt;

            if (phiboccionKickPhaseRef.current === 'PREP') {
              // Point bottom/legs towards player position
              const dx = p.x - boss.x;
              const dy = p.y - boss.y;
              boss.phiboccionAngle = Math.atan2(dy, dx);

              if (phiboccionTimerRef.current <= 0) {
                phiboccionKickPhaseRef.current = 'DASH';
                phiboccionTimerRef.current = 1.2;
                phiboccionMineDroppedRef.current = false;
                phiboccionDashStartRef.current = { x: boss.x, y: boss.y };

                const angle = boss.phiboccionAngle || 0;
                let tx = boss.x + Math.cos(angle) * 700;
                let ty = boss.y + Math.sin(angle) * 700;

                // Keep dash strictly bounded within the arena
                tx = Math.max(lockedCameraRef.current.x + 80, Math.min(lockedCameraRef.current.x + canvas.width - 80, tx));
                ty = Math.max(lockedCameraRef.current.y + 120, Math.min(lockedCameraRef.current.y + canvas.height - 80, ty));

                phiboccionDashTargetRef.current = { x: tx, y: ty };
                soundEngine.playShoot('sword');
                if (screenShakeEnabledRef.current) screenShakeRef.current = 5;
              }
            } else if (phiboccionKickPhaseRef.current === 'DASH') {
              const t = Math.max(0, Math.min(1, 1 - (phiboccionTimerRef.current / 1.2)));
              boss.x = phiboccionDashStartRef.current.x + (phiboccionDashTargetRef.current.x - phiboccionDashStartRef.current.x) * t;
              boss.y = phiboccionDashStartRef.current.y + (phiboccionDashTargetRef.current.y - phiboccionDashStartRef.current.y) * t;

              // Drop Land Phi-ne directly beneath Phiboccion as he passes through the midpoint of his kick (t >= 0.5)
              if (!phiboccionMineDroppedRef.current && t >= 0.5) {
                phiboccionMineDroppedRef.current = true;
                boss.attacks.push({
                  type: 'PHIBOCCION_LAND_PHINE',
                  x: boss.x,
                  y: boss.y,
                  radius: 25,
                  warningTimer: 0.4,
                  activeTimer: 99999,
                  duration: 99999,
                  damage: 30,
                  hasHit: false,
                });
              }

              // Check direct player collision with kicking boss
              const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
              if (dist <= boss.radius + p.radius) {
                if (playerInvincibleTimerRef.current <= 0) {
                  const actualDamage = Math.max(1, Math.round(25 * (1 - (p.damageReduction || 0))));
                  p.hp -= actualDamage;
                  playerInvincibleTimerRef.current = 1.0;

                  soundEngine.playPlayerHurt();
                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: p.x,
                    y: p.y - 20,
                    text: `-${actualDamage}`,
                    color: '#f87171',
                    life: 0.8,
                    maxLife: 0.8,
                    vy: -40,
                  });
                }
              }

              if (phiboccionTimerRef.current <= 0) {
                boss.x = phiboccionDashTargetRef.current.x;
                boss.y = phiboccionDashTargetRef.current.y;

                phiboccionKickCountRef.current++;
                if (phiboccionKickCountRef.current < 5) {
                  phiboccionKickPhaseRef.current = 'PREP';
                  phiboccionTimerRef.current = 0.45;
                } else {
                  boss.phiboccionState = 'FLOATING';
                  boss.isKicking = false;
                  bossAttackCooldownRef.current = 2.0;
                }
              }
            }
          } else if (boss.phiboccionState === 'PHI_X_PLOSION') {
            phiboccionTimerRef.current -= dt;

            if (phiboccionKickPhaseRef.current === 'PREP') {
              const t = Math.max(0, Math.min(1, 1 - (phiboccionTimerRef.current / 1.0)));
              boss.x = phiboccionDashStartRef.current.x + (phiboccionDashTargetRef.current.x - phiboccionDashStartRef.current.x) * t;
              boss.y = phiboccionDashStartRef.current.y + (phiboccionDashTargetRef.current.y - phiboccionDashStartRef.current.y) * t;

              if (phiboccionTimerRef.current <= 0) {
                boss.x = phiboccionDashTargetRef.current.x;
                boss.y = phiboccionDashTargetRef.current.y;

                phiboccionKickPhaseRef.current = 'DASH';
                phiboccionTimerRef.current = 4.0;
                phiboccionLaserTimerRef.current = 0;
                boss.phiboccionAngle = 0;
              }
            } else if (phiboccionKickPhaseRef.current === 'DASH') {
              const angleToPlayer = Math.atan2(p.y - boss.y, p.x - boss.x);
              boss.phiboccionAngle = angleToPlayer;

              const isFastPhase = phiboccionTimerRef.current < 2.0;
              const fireInterval = isFastPhase ? 0.12 : 0.35;

              phiboccionLaserTimerRef.current -= dt;
              if (phiboccionLaserTimerRef.current <= 0) {
                phiboccionLaserTimerRef.current = fireInterval;

                // Aim directly at the player and spawn laser strictly from the tip of his kicking foot
                soundEngine.playShoot('wand');

                const feetOffset = boss.radius * 2.8;
                const feetX = boss.x + Math.cos(angleToPlayer) * feetOffset;
                const feetY = boss.y + Math.sin(angleToPlayer) * feetOffset;

                boss.attacks.push({
                  type: 'PHIBOCCION_BEAM',
                  x: feetX,
                  y: feetY,
                  radius: 12,
                  vx: Math.cos(angleToPlayer) * 350,
                  vy: Math.sin(angleToPlayer) * 350,
                  warningTimer: 0,
                  activeTimer: 4.5,
                  duration: 4.5,
                  damage: 10,
                  hasHit: false,
                });
              }

              if (phiboccionTimerRef.current <= 0) {
                phiboccionKickPhaseRef.current = 'REST';
                phiboccionTimerRef.current = 2.4;
                boss.isKicking = false;

                // Spawn explosion directly under the player with a human-scale, escapable radius
                boss.attacks.push({
                  type: 'PHIBOCCION_EXPLOSION',
                  x: p.x,
                  y: p.y,
                  radius: 180,
                  warningTimer: 2.0,
                  activeTimer: 0.4,
                  duration: 2.4,
                  damage: 40,
                  hasHit: false,
                });

                soundEngine.playShoot('lightning');
              }
            } else if (phiboccionKickPhaseRef.current === 'REST') {
              if (phiboccionTimerRef.current > 0.4) {
                if (screenShakeEnabledRef.current && Math.random() < 0.4) {
                  screenShakeRef.current = Math.max(screenShakeRef.current, 3);
                }
              } else {
                if (screenShakeEnabledRef.current && phiboccionTimerRef.current > 0.2) {
                  screenShakeRef.current = Math.max(screenShakeRef.current, 12);
                }
              }

              if (phiboccionTimerRef.current <= 0) {
                boss.phiboccionState = 'FLOATING';
                bossAttackCooldownRef.current = 2.5;
              }
            }
          } else if (boss.phiboccionState === 'ROOT_OF_STRENGTH') {
            phiboccionTimerRef.current -= dt;

            if (phiboccionKickPhaseRef.current === 'PREP') {
              const t = Math.max(0, Math.min(1, 1 - (phiboccionTimerRef.current / 1.2)));
              boss.x = phiboccionDashStartRef.current.x + (phiboccionDashTargetRef.current.x - phiboccionDashStartRef.current.x) * t;
              boss.y = phiboccionDashStartRef.current.y + (phiboccionDashTargetRef.current.y - phiboccionDashStartRef.current.y) * t;

              if (phiboccionTimerRef.current <= 0) {
                boss.x = phiboccionDashTargetRef.current.x;
                boss.y = phiboccionDashTargetRef.current.y;

                boss.isInvincible = true;
                phiboccionKickPhaseRef.current = 'DASH';
                phiboccionKeypadActiveRef.current = true;
                phiboccionKeypadStageRef.current = 1;
                phiboccionKeypadAnswersCorrectRef.current = 0;
                phiboccionKeypadTimerRef.current = 10.0;
                phiboccionKeypadInputRef.current = "";
                phiboccionKeypadResultTextRef.current = "";
                phiboccionKeypadResultTimerRef.current = 0;

                const ans = Math.floor(Math.random() * 9) + 1;
                phiboccionKeypadQuestionRef.current = {
                  q: `√${ans * ans}`,
                  a: String(ans),
                  difficulty: ans,
                };

                soundEngine.playLevelUp();
              }
            } else if (phiboccionKickPhaseRef.current === 'DASH') {
              boss.x = lockedCameraRef.current.x + canvas.width / 2;
              boss.y = lockedCameraRef.current.y + 115;

              if (phiboccionKeypadActiveRef.current) {
                playerInvincibleTimerRef.current = 0.5; // Player and Phiboccion are both invincible during Root of Strength attack
                if (phiboccionKeypadResultTimerRef.current > 0) {
                  phiboccionKeypadResultTimerRef.current -= dt;

                  if (phiboccionKeypadResultTimerRef.current <= 0) {
                    phiboccionKeypadResultTimerRef.current = 0;

                    // Execute the delayed stage transition or close
                    if (phiboccionKeypadPendingAdvanceRef.current) {
                      phiboccionKeypadPendingAdvanceRef.current = false;
                      const currentStage = phiboccionKeypadStageRef.current;

                      if (currentStage < 3) {
                        phiboccionKeypadStageRef.current = currentStage + 1;
                        phiboccionKeypadTimerRef.current = 10.0;
                        phiboccionKeypadInputRef.current = "";
                        phiboccionKeypadResultTextRef.current = "";

                        let nextAns = 5;
                        if (currentStage + 1 === 2) {
                          do {
                            nextAns = Math.floor(Math.random() * 11) + 10; // 10..20
                          } while (nextAns === 10 || nextAns === 20); // Exclude 100 and 400
                        } else {
                          do {
                            nextAns = Math.floor(Math.random() * 10) + 21; // 21..30
                          } while (nextAns === 30); // Exclude 900
                        }

                        phiboccionKeypadQuestionRef.current = {
                          q: `√${nextAns * nextAns}`,
                          a: String(nextAns),
                          difficulty: nextAns,
                        };
                      } else {
                        // Finished Stage 3! Transition out and apply rewards
                        phiboccionKeypadActiveRef.current = false;
                        boss.isInvincible = false;
                        boss.phiboccionState = 'FLOATING';
                        bossAttackCooldownRef.current = 3.0;

                        if (phiboccionKeypadAnswersCorrectRef.current === 3) {
                          const rewardDamage = Math.round(boss.maxHp / 5);
                          boss.hp = Math.max(1, boss.hp - rewardDamage);
                          soundEngine.playExplosion();
                          if (screenShakeEnabledRef.current) screenShakeRef.current = 15;

                          floatingTextsRef.current.push({
                            id: nextEntityId.current++,
                            x: boss.x,
                            y: boss.y - 40,
                            text: `-${rewardDamage} (MATH PENETRATION!)`,
                            color: '#facc15',
                            life: 1.5,
                            maxLife: 1.5,
                            vy: -50,
                          });
                        }
                      }
                    }
                  }
                } else {
                  // Only run down timer if not showing result feedback
                  phiboccionKeypadTimerRef.current -= dt;

                  if (phiboccionKeypadTimerRef.current <= 0) {
                    phiboccionKeypadResultTextRef.current = "TIME'S UP!";
                    phiboccionKeypadResultTimerRef.current = 1.2;
                    phiboccionKeypadPendingAdvanceRef.current = true;
                    soundEngine.playPlayerHurt();
                  }
                }
              }
            }
          } else if (boss.phiboccionState === 'FIBONACCI_INTRO') {
            boss.x = lockedCameraRef.current.x + canvas.width / 2;
            boss.y = lockedCameraRef.current.y + 115;
            boss.isInvincible = true;
            boss.damage = 0;

            phiboccionFibIntroTimerRef.current -= dt;
            if (phiboccionFibIntroTimerRef.current <= 0) {
              phiboccionFibIntroStepRef.current++;
              if (phiboccionFibIntroStepRef.current < 3) {
                phiboccionFibIntroTimerRef.current = 1.0;
                soundEngine.playShoot('wand');
              } else if (phiboccionFibIntroStepRef.current === 3) {
                phiboccionFibIntroTimerRef.current = 1.5;
                soundEngine.playShoot('lightning');
              } else {
                boss.phiboccionState = 'FIBONACCI_CHALLENGE';
                phiboccionKeypadModeRef.current = 'FIBONACCI';
                phiboccionKeypadActiveRef.current = true;
                phiboccionKeypadStageRef.current = 1;
                phiboccionKeypadAnswersCorrectRef.current = 0;
                phiboccionKeypadTimerRef.current = 5.0;
                phiboccionKeypadInputRef.current = "";
                phiboccionKeypadResultTextRef.current = "";
                phiboccionKeypadResultTimerRef.current = 0;

                const firstAns = getFibonacciNumber(1);
                const lang = getLanguage();
                phiboccionKeypadQuestionRef.current = {
                  q: getFibonacciQuestionText(1, lang),
                  a: firstAns.toString(),
                  difficulty: 1,
                };
                soundEngine.playLevelUp();
              }
            }
          } else if (boss.phiboccionState === 'FIBONACCI_CHALLENGE') {
            boss.x = lockedCameraRef.current.x + canvas.width / 2;
            boss.y = lockedCameraRef.current.y + 115;
            playerInvincibleTimerRef.current = 0.5;

            if (phiboccionKeypadActiveRef.current) {
              if (phiboccionKeypadResultTimerRef.current > 0) {
                phiboccionKeypadResultTimerRef.current -= dt;
                if (phiboccionKeypadResultTimerRef.current <= 0) {
                  phiboccionKeypadResultTimerRef.current = 0;
                  if (phiboccionKeypadPendingAdvanceRef.current) {
                    phiboccionKeypadPendingAdvanceRef.current = false;
                    const currentStage = phiboccionKeypadStageRef.current;
                    const passed = phiboccionKeypadLastAnswerCorrectRef.current;

                    if (passed && currentStage < 50) {
                      const nextStage = currentStage + 1;
                      phiboccionKeypadStageRef.current = nextStage;
                      const correctCount = phiboccionKeypadAnswersCorrectRef.current;
                      phiboccionKeypadTimerRef.current = Math.max(1.0, 5.0 - (correctCount * 0.2));
                      phiboccionKeypadInputRef.current = "";
                      phiboccionKeypadResultTextRef.current = "";

                      const nextAns = getFibonacciNumber(nextStage);
                      const lang = getLanguage();
                      phiboccionKeypadQuestionRef.current = {
                        q: getFibonacciQuestionText(nextStage, lang),
                        a: nextAns.toString(),
                        difficulty: nextStage,
                      };
                    } else {
                      phiboccionKeypadActiveRef.current = false;
                      boss.isInvincible = false;
                      boss.hp = 0;
                    }
                  }
                }
              } else {
                phiboccionKeypadTimerRef.current -= dt;
                if (phiboccionKeypadTimerRef.current <= 0) {
                  phiboccionKeypadLastAnswerCorrectRef.current = false;
                  phiboccionKeypadResultTextRef.current = "TIME'S UP!";
                  phiboccionKeypadResultTimerRef.current = 1.2;
                  phiboccionKeypadPendingAdvanceRef.current = true;
                  soundEngine.playPlayerHurt();
                }
              }
            }
          }
        } else if (boss.id === 'pythagoras') {
          // --- PYTHAGORAS THE MATHEMAGICIAN BEHAVIOR & AI ---
          if (pythagorasPhaseRef.current === 'GEOMETRY_DASH') {
            pythagorasTimerRef.current += dt;

            // Movement: Pythagoras stays still at the top center of the screen
            const centerX = lockedCameraRef.current.x + canvas.width / 2;
            const topY = lockedCameraRef.current.y + 120;

            boss.x += (centerX - boss.x) * 6 * dt;
            boss.y += (topY - boss.y) * 6 * dt;

            // 1. "Geometry? Dash!": Constantly throws rulers underneath him, functionally dividing the arena in two
            pythagorasRulerTimerRef.current -= dt;
            if (pythagorasRulerTimerRef.current <= 0) {
              pythagorasRulerTimerRef.current = 0.16;

              boss.attacks.push({
                type: 'PYTHAGORAS_RULER',
                x: boss.x + (Math.random() - 0.5) * 10,
                y: boss.y + 125,
                vx: 0,
                vy: 140,
                radius: 20,
                width: 25,
                height: 75,
                damage: 20,
                duration: 9.0,
                warningTimer: 0,
                activeTimer: 9.0,
                hasHit: false,
                angle: Math.PI / 2,
              });
            }

            // 2. Protractors: Throws 1 to the left and 1 to the right, moving in a circular motion circling around all of both areas (3 times total)
            pythagorasProtractorTimerRef.current -= dt;
            if (pythagorasProtractorTimerRef.current <= 0 && pythagorasProtractorWaveRef.current < 3) {
              pythagorasProtractorWaveRef.current += 1;
              pythagorasProtractorTimerRef.current = 2.8;

              const wave = pythagorasProtractorWaveRef.current;
              const leftCenterX = centerX - canvas.width * 0.25;
              const rightCenterX = centerX + canvas.width * 0.25;
              const centerY = lockedCameraRef.current.y + canvas.height / 2;
              // Radii span from inner to outer coverage across all of left/right area
              const orbitRadius = 120 + (wave - 1) * 90;

              // Left Protractor: appears from Pythagoras's left side and leaves towards the left
              boss.attacks.push({
                type: 'PYTHAGORAS_PROTRACTOR',
                x: boss.x - 48,
                y: boss.y + 15,
                vx: 0,
                vy: 0,
                radius: 20,
                damage: 20,
                duration: 12.0,
                warningTimer: 0,
                activeTimer: 12.0,
                hasHit: false,
                orbitCenterX: leftCenterX,
                orbitCenterY: centerY,
                orbitRadius: orbitRadius,
                orbitAngle: -Math.PI / 2,
                orbitSpeed: -0.9,
                rotAngle: 0,
                spawnOriginX: boss.x - 48,
                spawnOriginY: boss.y + 15,
                launchTimer: 0,
                launchDuration: 1.5,
              });

              // Right Protractor: appears from Pythagoras's right side and leaves towards the right
              boss.attacks.push({
                type: 'PYTHAGORAS_PROTRACTOR',
                x: boss.x + 48,
                y: boss.y + 15,
                vx: 0,
                vy: 0,
                radius: 20,
                damage: 20,
                duration: 12.0,
                warningTimer: 0,
                activeTimer: 12.0,
                hasHit: false,
                orbitCenterX: rightCenterX,
                orbitCenterY: centerY,
                orbitRadius: orbitRadius,
                orbitAngle: -Math.PI / 2,
                orbitSpeed: 0.9,
                rotAngle: 0,
                spawnOriginX: boss.x + 48,
                spawnOriginY: boss.y + 15,
                launchTimer: 0,
                launchDuration: 1.5,
              });
            }

            // 3. Spinning Set-Square: Throws every 1.5s aimed at player
            pythagorasSetSquareTimerRef.current -= dt;
            if (pythagorasSetSquareTimerRef.current <= 0) {
              pythagorasSetSquareTimerRef.current = 1.5;

              const angleToPlayer = Math.atan2(playerRef.current.y - boss.y, playerRef.current.x - boss.x);
              const speed = 230;

              boss.attacks.push({
                type: 'PYTHAGORAS_SETSQUARE',
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angleToPlayer) * speed,
                vy: Math.sin(angleToPlayer) * speed,
                radius: 18,
                damage: 20,
                duration: 8.5,
                warningTimer: 0,
                activeTimer: 8.5,
                hasHit: false,
                rotAngle: 0,
                rotSpeed: 10,
              });
            }

            if (pythagorasTimerRef.current >= 11.0) {
              pythagorasPhaseRef.current = 'REST';
              pythagorasTimerRef.current = 0;
              pythagorasLastAttackRef.current = 'GEOMETRY_DASH';
            }
          } else if (pythagorasPhaseRef.current === 'MONTY_HALL') {
            // Keep Pythagoras stationary at top center and invulnerable during the puzzle
            const centerX = lockedCameraRef.current.x + canvas.width / 2;
            const topY = lockedCameraRef.current.y + 115;
            boss.x += (centerX - boss.x) * 6 * dt;
            boss.y += (topY - boss.y) * 6 * dt;
            boss.isInvincible = true;
            playerInvincibleTimerRef.current = 0.5;

            if (pythagorasMontyStepRef.current === 'REVEAL_ANIM') {
              pythagorasMontyTimerRef.current -= dt;
              if (pythagorasMontyTimerRef.current <= 0) {
                pythagorasMontyStepRef.current = 'CHOICE';
              }
            } else if (pythagorasMontyStepRef.current === 'RESULT') {
              pythagorasMontyTimerRef.current -= dt;
              if (pythagorasMontyTimerRef.current <= 0) {
                pythagorasMontyHallActiveRef.current = false;
                boss.isInvincible = false;
                pythagorasPhaseRef.current = 'REST';
                pythagorasTimerRef.current = 0;
                pythagorasLastAttackRef.current = 'MONTY_HALL';
              }
            }
          } else if (pythagorasPhaseRef.current === 'GEOMENTO_MORI') {
            // Keep Pythagoras floating in top center casting the graphs
            const centerX = lockedCameraRef.current.x + canvas.width / 2;
            const topY = lockedCameraRef.current.y + 115;
            boss.x += (centerX - boss.x) * 6 * dt;
            boss.y += (topY - boss.y) * 6 * dt;

            pythagorasGeoMoriTimerRef.current += dt;
            pythagorasGeoMoriHitCooldownRef.current = Math.max(0, pythagorasGeoMoriHitCooldownRef.current - dt);

            // Spawn floating magical mathematical equations particles from Pythagoras
            if (Math.random() < 0.25) {
              const symbols = ['f(x)', '∫', '²', '√', '1/x', 'lim', 'π', 'dy/dx'];
              const sym = symbols[Math.floor(Math.random() * symbols.length)];
              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: boss.x + (Math.random() - 0.5) * 60,
                y: boss.y + (Math.random() - 0.5) * 30,
                text: sym,
                color: '#f87171',
                life: 0.8,
                maxLife: 0.8,
                vy: -35,
              });
            }

            if (pythagorasGeoMoriStateRef.current === 'TELEGRAPH') {
              // 1.5 seconds equations appear on top-left
              if (pythagorasGeoMoriTimerRef.current >= 1.5) {
                pythagorasGeoMoriStateRef.current = 'ACTIVE';
                pythagorasGeoMoriTimerRef.current = 0;
                soundEngine.playShoot('lightning');
              }
            } else if (pythagorasGeoMoriStateRef.current === 'ACTIVE') {
              // 2.2 seconds the red lines are graphed onto the arena
              // Player Collision with the 3 graphed curves
              // Middle of screen is (0;0) in coordinate space
              const screenCenterX = lockedCameraRef.current.x + canvas.width / 2;
              const screenCenterY = lockedCameraRef.current.y + canvas.height / 2;

              // Grid scale: 1 coordinate unit = 60 pixels
              const scale = 60;
              const px = playerRef.current.x;
              const py = playerRef.current.y;
              const playerCoordX = (px - screenCenterX) / scale;

              // Check collision against all 3 equations
              if (pythagorasGeoMoriHitCooldownRef.current <= 0 && playerInvincibleTimerRef.current <= 0) {
                let hitByCurve = false;

                for (const eq of pythagorasGeoMoriEquationsRef.current) {
                  // Sample nearby x values around player hitbox
                  const testSteps = [-0.25, -0.15, 0, 0.15, 0.25];
                  for (const step of testSteps) {
                    const sampleX = playerCoordX + step;
                    const sampleY = eq.fn(sampleX);
                    if (sampleY === null || isNaN(sampleY)) continue;

                    // Convert coordinate (sampleX, sampleY) to world pixels
                    // Remember: standard Cartesian y goes UP, canvas y goes DOWN
                    const worldCurveX = screenCenterX + sampleX * scale;
                    const worldCurveY = screenCenterY - sampleY * scale;

                    const dist = Math.hypot(px - worldCurveX, py - worldCurveY);
                    const hitRadius = playerRef.current.radius + 10; // 10px line thickness buffer

                    if (dist <= hitRadius) {
                      hitByCurve = true;
                      break;
                    }
                  }
                  if (hitByCurve) break;
                }

                if (hitByCurve) {
                  if (playerRef.current.isDashing) {
                    // Evaded with Dash!
                    floatingTextsRef.current.push({
                      id: nextEntityId.current++,
                      x: playerRef.current.x,
                      y: playerRef.current.y - 24,
                      text: 'DODGE!',
                      color: '#38bdf8',
                      life: 0.65,
                      maxLife: 0.65,
                      vy: -45,
                    });
                  } else {
                    // Player touches the line: takes 20 damage!
                    const rawDamage = 20;
                    const damage = invincibilityRef.current ? 0 : Math.max(1, Math.round(rawDamage * (1 - (playerRef.current.damageReduction || 0))));
                    playerRef.current.hp = Math.max(0, playerRef.current.hp - damage);
                    lastReportedHpRef.current = playerRef.current.hp;
                    pythagorasGeoMoriHitCooldownRef.current = 0.55; // Brief grace period so player isn't instantly deleted in 1 frame

                    soundEngine.playHit();
                    if (screenShakeEnabledRef.current) {
                      screenShakeRef.current = 12;
                    }
                    floatingTextsRef.current.push({
                      id: nextEntityId.current++,
                      x: playerRef.current.x,
                      y: playerRef.current.y - 20,
                      text: `-${damage}`,
                      color: '#ef4444',
                      life: 0.85,
                      maxLife: 0.85,
                      vy: -50,
                    });

                    // Sparks & blood particles on hit
                    for (let p = 0; p < 12; p++) {
                      const pAng = Math.random() * Math.PI * 2;
                      const pSpd = Math.random() * 120 + 30;
                      particlesRef.current.push({
                        x: playerRef.current.x,
                        y: playerRef.current.y,
                        vx: Math.cos(pAng) * pSpd,
                        vy: Math.sin(pAng) * pSpd,
                        size: Math.random() * 3 + 2,
                        color: '#ef4444',
                        alpha: 1,
                        decay: Math.random() * 2 + 2,
                      });
                    }
                  }
                }
              }

              // Ends sooner once the graphs appear (2.2 seconds instead of 3.2 seconds)
              if (pythagorasGeoMoriTimerRef.current >= 2.2) {
                pythagorasGeoMoriRoundRef.current += 1;
                if (pythagorasGeoMoriRoundRef.current <= 3) {
                  pythagorasGeoMoriEquationsRef.current = getRandomGeoMoriEquations();
                  pythagorasGeoMoriStateRef.current = 'TELEGRAPH';
                  pythagorasGeoMoriTimerRef.current = 0;
                  pythagorasGeoMoriHitCooldownRef.current = 0;
                  soundEngine.playShoot('wand');
                } else {
                  pythagorasGeoMoriActiveRef.current = false;
                  pythagorasGeoMoriStateRef.current = 'DONE';
                  pythagorasPhaseRef.current = 'REST';
                  pythagorasTimerRef.current = 0;
                  pythagorasLastAttackRef.current = 'GEOMENTO_MORI';
                }
              }
            }
          } else {
            // REST phase
            pythagorasTimerRef.current += dt;
            const centerX = lockedCameraRef.current.x + canvas.width / 2;
            const topY = lockedCameraRef.current.y + 120;
            boss.x += (centerX - boss.x) * 6 * dt;
            boss.y += (topY - boss.y) * 6 * dt;

            if (pythagorasTimerRef.current >= 1.8) {
              pythagorasTimerRef.current = 0;
              if (pythagorasLastAttackRef.current === 'GEOMETRY_DASH') {
                pythagorasPhaseRef.current = 'MONTY_HALL';
                pythagorasMontyHallActiveRef.current = true;
                pythagorasMontyStepRef.current = 'PICK';
                pythagorasMontyPrizeDoorRef.current = Math.floor(Math.random() * 3);
                pythagorasMontyPlayerPickRef.current = -1;
                pythagorasMontyRevealedEmptyDoorRef.current = -1;
                pythagorasMontyFinalPickRef.current = -1;
                pythagorasMontyTimerRef.current = 0;
                pythagorasMontyResultTypeRef.current = null;
                boss.attacks = [];
                soundEngine.playLevelUp();
              } else if (pythagorasLastAttackRef.current === 'MONTY_HALL') {
                pythagorasPhaseRef.current = 'GEOMENTO_MORI';
                pythagorasGeoMoriActiveRef.current = true;
                pythagorasGeoMoriEquationsRef.current = getRandomGeoMoriEquations();
                pythagorasGeoMoriStateRef.current = 'TELEGRAPH';
                pythagorasGeoMoriTimerRef.current = 0;
                pythagorasGeoMoriHitCooldownRef.current = 0;
                pythagorasGeoMoriRoundRef.current = 1;
                boss.attacks = [];
                soundEngine.playShoot('wand');
              } else {
                pythagorasPhaseRef.current = 'GEOMETRY_DASH';
                pythagorasRulerTimerRef.current = 0;
                pythagorasProtractorWaveRef.current = 0;
                pythagorasProtractorTimerRef.current = 0.5;
                pythagorasSetSquareTimerRef.current = 0.5;
              }
            }
          }
        }

        // Update active boss attacks
        boss.attacks = boss.attacks.filter((a) => a.duration > 0 && !a.hasHit);
        let playedBiteSoundThisFrame = false;
        boss.attacks.forEach((a) => {
          a.duration -= dt;
          if (a.warningTimer > 0) {
            a.warningTimer -= dt;
            if (a.warningTimer <= 0 && a.type === 'NIGHT_BEAR_BITE') {
              if (!playedBiteSoundThisFrame) {
                playedBiteSoundThisFrame = true;
                soundEngine.playBite();
                if (screenShakeEnabledRef.current) {
                  screenShakeRef.current = 10;
                }
              }
            }
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
              } else if (a.type === 'NIGHT_BEAR_BITE') {
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'ARCHMAGES_FIREBALL') {
                const currentVx = a.vx || 0;
                const currentVy = a.vy || 80;
                const currentAngle = Math.atan2(currentVy, currentVx);
                const targetAngle = Math.atan2(playerRef.current.y - a.y, playerRef.current.x - a.x);

                let angleDiff = targetAngle - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                const maxTurn = 1.2 * dt;
                const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
                const newAngle = currentAngle + turn;
                const fireballSpeed = 130;

                a.vx = Math.cos(newAngle) * fireballSpeed;
                a.vy = Math.sin(newAngle) * fireballSpeed;
                a.x += a.vx * dt;
                a.y += a.vy * dt;

                if (Math.random() < 0.5) {
                  particlesRef.current.push({
                    x: a.x + (Math.random() - 0.5) * 6,
                    y: a.y + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20,
                    size: 3.5,
                    color: Math.random() < 0.5 ? '#ef4444' : '#f97316',
                    alpha: 0.8,
                    decay: 3.0,
                  });
                }

                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'ARCHMAGES_RAINBOW_FIREBALL') {
                const currentVx = a.vx || 0;
                const currentVy = a.vy || 80;
                const currentAngle = Math.atan2(currentVy, currentVx);
                const targetAngle = Math.atan2(playerRef.current.y - a.y, playerRef.current.x - a.x);

                let angleDiff = targetAngle - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                const maxTurn = 2.0 * dt;
                const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
                const newAngle = currentAngle + turn;
                const fireballSpeed = 145;

                a.vx = Math.cos(newAngle) * fireballSpeed;
                a.vy = Math.sin(newAngle) * fireballSpeed;
                a.x += a.vx * dt;
                a.y += a.vy * dt;

                if (Math.random() < 0.6) {
                  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#ec4899'];
                  particlesRef.current.push({
                    x: a.x + (Math.random() - 0.5) * 8,
                    y: a.y + (Math.random() - 0.5) * 8,
                    vx: (Math.random() - 0.5) * 25,
                    vy: (Math.random() - 0.5) * 25,
                    size: 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 0.9,
                    decay: 3.2,
                  });
                }

                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'ARCHMAGES_VINE_TILE_ATTACK') {
                if (a.width && a.height) {
                  const halfW = a.width / 2;
                  const halfH = a.height / 2;
                  const px = playerRef.current.x;
                  const py = playerRef.current.y;
                  const pr = playerRef.current.radius;
                  if (px + pr >= a.x - halfW && px - pr <= a.x + halfW && py + pr >= a.y - halfH && py - pr <= a.y + halfH) {
                    isPlayerHit = true;
                  }
                  // Check if the synchronized clone is caught in the vines!
                  if (archmageCloneRef.current && archmageCloneRef.current.active) {
                    const cx = archmageCloneRef.current.x;
                    const cy = archmageCloneRef.current.y;
                    if (cx + pr >= a.x - halfW && cx - pr <= a.x + halfW && cy + pr >= a.y - halfH && cy - pr <= a.y + halfH) {
                      isPlayerHit = true;
                    }
                  }
                } else {
                  const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                  if (pDist <= a.radius + playerRef.current.radius) {
                    isPlayerHit = true;
                  }
                  if (archmageCloneRef.current && archmageCloneRef.current.active) {
                    const cDist = Math.hypot(archmageCloneRef.current.x - a.x, archmageCloneRef.current.y - a.y);
                    if (cDist <= a.radius + playerRef.current.radius) {
                      isPlayerHit = true;
                    }
                  }
                }
              } else if (a.type === 'ARCHMAGES_THUNDER_STRIKE') {
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'PHIBOCCION_LAND_PHINE') {
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                  a.hasHit = true;

                  // Cool golden/red math blast particles
                  for (let i = 0; i < 15; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 80 + 45;
                    particlesRef.current.push({
                      x: a.x,
                      y: a.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      size: Math.random() * 4 + 2,
                      color: Math.random() < 0.5 ? '#eab308' : '#ef4444',
                      alpha: 0.95,
                      decay: 2.5,
                    });
                  }
                  soundEngine.playExplosion();
                }
              } else if (a.type === 'PHIBOCCION_BEAM') {
                a.x += (a.vx || 0) * dt;
                a.y += (a.vy || 0) * dt;
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                  a.hasHit = true;
                }

                if (Math.random() < 0.18) {
                  particlesRef.current.push({
                    x: a.x,
                    y: a.y,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    size: 2,
                    color: '#fef08a',
                    alpha: 0.7,
                    decay: 3.0,
                  });
                }
              } else if (a.type === 'PHIBOCCION_EXPLOSION') {
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }

                if (Math.random() < 0.15) {
                  const dots = 24;
                  for (let i = 0; i < dots; i++) {
                    const ang = (i / dots) * Math.PI * 2;
                    particlesRef.current.push({
                      x: a.x + Math.cos(ang) * (a.radius * 0.4),
                      y: a.y + Math.sin(ang) * (a.radius * 0.4),
                      vx: Math.cos(ang) * 160,
                      vy: Math.sin(ang) * 160,
                      size: 3,
                      color: '#facc15',
                      alpha: 0.9,
                      decay: 2.0,
                    });
                  }
                }
              } else if (a.type === 'PYTHAGORAS_RULER') {
                a.y += (a.vy || 140) * dt;
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'PYTHAGORAS_PROTRACTOR') {
                if (a.orbitCenterX !== undefined && a.orbitCenterY !== undefined) {
                  const screenCenterX = lockedCameraRef.current.x + canvas.width / 2;
                  const screenCenterY = lockedCameraRef.current.y + canvas.height / 2;
                  const isLeft = a.orbitCenterX < screenCenterX;
                  const currentOrbitCenterX = screenCenterX + (isLeft ? -canvas.width * 0.25 : canvas.width * 0.25);
                  const currentOrbitCenterY = screenCenterY;

                  a.orbitAngle = (a.orbitAngle || 0) + (a.orbitSpeed || (isLeft ? -0.9 : 0.9)) * dt;
                  const baseR = a.orbitRadius || 150;
                  const sweepingR = baseR + Math.sin((a.orbitAngle || 0) * 1.5) * 35;
                  const targetOrbitX = currentOrbitCenterX + Math.cos(a.orbitAngle) * sweepingR;
                  const targetOrbitY = currentOrbitCenterY + Math.sin(a.orbitAngle) * sweepingR;

                  if (a.launchDuration && a.launchTimer !== undefined && a.launchTimer < a.launchDuration) {
                    a.launchTimer += dt;
                    const progress = Math.min(1, a.launchTimer / a.launchDuration);
                    const ease = 1 - (1 - progress) * (1 - progress);
                    const startX = a.spawnOriginX ?? a.x;
                    const startY = a.spawnOriginY ?? a.y;
                    a.x = startX + (targetOrbitX - startX) * ease;
                    a.y = startY + (targetOrbitY - startY) * ease;
                  } else {
                    a.x = targetOrbitX;
                    a.y = targetOrbitY;
                  }
                  a.rotAngle = (a.rotAngle || 0) + (isLeft ? -2 : 2) * dt;

                  if (Math.random() < 0.2) {
                    particlesRef.current.push({
                      x: a.x + (Math.random() - 0.5) * 12,
                      y: a.y + (Math.random() - 0.5) * 12,
                      vx: (Math.random() - 0.5) * 20,
                      vy: (Math.random() - 0.5) * 20,
                      size: 2,
                      color: '#38bdf8',
                      alpha: 0.7,
                      decay: 2.2,
                    });
                  }
                }
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              } else if (a.type === 'PYTHAGORAS_SETSQUARE') {
                a.x += (a.vx || 0) * dt;
                a.y += (a.vy || 0) * dt;
                a.rotAngle = (a.rotAngle || 0) + (a.rotSpeed || 5) * dt;
                const pDist = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                if (pDist <= a.radius + playerRef.current.radius) {
                  isPlayerHit = true;
                }
              }

              if (isPlayerHit && playerInvincibleTimerRef.current <= 0) {
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
                  const heavyDamage = invincibilityRef.current ? 0 : Math.max(1, Math.round(a.damage * (1 - (playerRef.current.damageReduction || 0))));
                  playerRef.current.hp = Math.max(0, playerRef.current.hp - heavyDamage);
                  lastReportedHpRef.current = playerRef.current.hp;
                  soundEngine.playHit();
                  if (a.type === 'PYTHAGORAS_RULER') {
                    playerInvincibleTimerRef.current = Math.max(playerInvincibleTimerRef.current, 1.0);
                  }
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

                  if (playerRef.current.hp <= 0) {
                    playerRef.current.hp = 0;
                    lastReportedHpRef.current = 0;
                    onUpdatePlayer({ hp: 0 });
                    onGameOver({
                      time: survivalTimeRef.current,
                      level: playerRef.current.level,
                      kills: killsCountRef.current,
                      bossesKilled: bossesKilledRef.current,
                      killerName: boss.name,
                    });
                    return;
                  }
                }
              }
            }
          }
        });

        // Boss defeat check (Note: 3 Archmages Phase 1 & MERGING transition into Phase 2 Geraldo The RGB)
        const isArchmagesPhase1OrMerging = boss.id === 'archmages' && (boss.archmagesPhase === 'PHASE1' || boss.archmagesPhase === 'MERGING');
        const isPhiboccionFibPending = boss.id === 'phiboccion' && boss.phiboccionState !== 'FIBONACCI_INTRO' && boss.phiboccionState !== 'FIBONACCI_CHALLENGE';

        if (boss.hp <= 0 && !isArchmagesPhase1OrMerging) {
          if (isPhiboccionFibPending) {
            boss.hp = 1;
            boss.isInvincible = true;
            boss.damage = 0;
            boss.phiboccionState = 'FIBONACCI_INTRO';
            phiboccionFibIntroStepRef.current = 0;
            phiboccionFibIntroTimerRef.current = 1.0;
            soundEngine.playLevelUp();
            return;
          }

          soundEngine.playLevelUp();
          if (onEnemyDefeated) {
            onEnemyDefeated(boss.id);
          }
          // Boss drops 1 Yellow Orb (75 EXP) and 1 25HP healing food (Disabled in Boss Rush)
          if (!isBossRush) {
            expGemsRef.current.push({
              id: nextEntityId.current++,
              x: boss.x,
              y: boss.y,
              value: 75,
              color: '#eab308',
              radius: 9.5,
            });

            if (boss.id === 'phiboccion') {
              const correctCount = phiboccionKeypadAnswersCorrectRef.current;
              const yellowCount = Math.floor(correctCount / 8);
              const redCount = correctCount % 8;

              for (let yb = 0; yb < yellowCount; yb++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 40 + 10;
                expGemsRef.current.push({
                  id: nextEntityId.current++,
                  x: boss.x + Math.cos(angle) * dist,
                  y: boss.y + Math.sin(angle) * dist,
                  value: 75,
                  color: '#eab308',
                  radius: 9.5,
                });
              }

              for (let rb = 0; rb < redCount; rb++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 50 + 15;
                expGemsRef.current.push({
                  id: nextEntityId.current++,
                  x: boss.x + Math.cos(angle) * dist,
                  y: boss.y + Math.sin(angle) * dist,
                  value: 10,
                  color: '#ef4444',
                  radius: 7,
                });
              }
            }

            // Always drop a 25HP healing food with the yellow orb (independent of boss damage)
            pickupsRef.current.push({
              id: nextEntityId.current++,
              type: 'FOOD',
              x: boss.x + 20,
              y: boss.y + 10,
              healAmount: 25,
              radius: 12,
            });
          }

          // Massive celebration spark burst (suppressed for Astral Blade)
          if (boss.lastHitBy !== 'astral_sword') {
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
          }

          killsCountRef.current += 1;
          bossesKilledRef.current += 1;
          if (boss.lastHitBy) {
            const weapon = weaponsRef.current.find(w => w.id === boss.lastHitBy);
            if (weapon) {
              weapon.kills = (weapon.kills || 0) + 1;
            }
          }

          if (isBossRush) {
            if (!isTrueWitchMode) {
              p.hp = Math.min(p.maxHp, p.hp + 25);
              lastReportedHpRef.current = p.hp;
              onUpdatePlayer({ hp: p.hp });

              floatingTextsRef.current.push({
                id: nextEntityId.current++,
                x: p.x + (Math.random() - 0.5) * 16,
                y: p.y - 18,
                text: '+25 HP',
                color: '#22c55e',
                life: 0,
                maxLife: 1.0,
                vy: -45,
              });

              // Green healing sparkles matching food pickup
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
            }

            soundEngine.playLevelUp();

            if (onBossDefeated) {
              onBossDefeated(boss.id);
            }
            if (boss.id === 'googolbra') {
              googolbraCurrentSegmentsRef.current = [];
              window.dispatchEvent(
                new CustomEvent('googolbra-grasp-state', {
                  detail: {
                    active: false,
                    struggles: 0,
                    maxStruggles: 30,
                    graceTimer: 0,
                    inDamagePhase: false,
                  },
                })
              );
            }
            if (onBossUpdate) {
              onBossUpdate(null, true, 0, 0);
            }
            // Clear remaining minions from defeated boss
            enemiesRef.current = enemiesRef.current.filter((e) => e.type !== 'mini_eye');

            bossRushIndexRef.current += 1;
            bossInstanceRef.current = null;
            isBossFightRef.current = true;

            if (bossRushIndexRef.current < bossRushQueueRef.current.length) {
              bossRushPauseTimerRef.current = 5.0;
            } else {
              onGameOver({
                time: survivalTimeRef.current,
                level: playerRef.current.level,
                kills: killsCountRef.current,
                bossesKilled: bossesKilledRef.current,
                totalDamage: totalDamageDealtRef.current,
                isVictory: true,
                isFullBossRush: bossRushQueueRef.current.length > 1,
              });
              return;
            }
          } else {
            isBossFightRef.current = false;
            bossInstanceRef.current = null;
            isBossPendingRef.current = false;
            // Boss defeated: reset 5-minute countdown for the next boss fight!
            bossCountdownRef.current = 300.0;
            if (onUpdateBossCountdown) {
              onUpdateBossCountdown(300.0);
            }
            lastBossEpochRef.current = Math.max(lastBossEpochRef.current, Math.floor(survivalTimeRef.current / 300), 1);
            if (onBossUpdate) {
              onBossUpdate(null, false, 0, 0);
            }
            if (onBossDefeated) {
              onBossDefeated(boss.id);
            }
          }
        }
      }

      // Check Minute 7:30 Epoch: The Witch's Deal (450 seconds) - Disabled in Boss Rush
      if (!isBossRush && survivalTimeRef.current >= 450 && !dealTriggeredRef.current) {
        dealTriggeredRef.current = true;
        soundEngine.playWitchDeal();
        const destinyItem = statItemsRef.current.find((s) => s.id === 'destiny_control');
        const dealCount = destinyItem && destinyItem.level >= 3 ? 2 : 1;
        const shuffled = [...WITCH_DEALS].sort(() => 0.5 - Math.random());
        onTriggerWitchDeal(shuffled.slice(0, dealCount));
        return;
      }

      // Dash Cooldown & Movement Update
      if (p.dashTimer > 0) {
        p.dashTimer = Math.max(0, p.dashTimer - dt);
        const nowMs = performance.now();
        if (p.dashTimer === 0 || nowMs - lastDashReportTimeRef.current >= 100) {
          lastDashReportTimeRef.current = nowMs;
          onUpdatePlayer({ dashTimer: p.dashTimer });
        }
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
          onUpdatePlayer({ isDashing: false });
        }
      } else if (phiboccionKeypadActiveRef.current || pythagorasMontyHallActiveRef.current) {
        // Player is locked in place during Root of Strength keypad challenge or Monty Hall
        walkTargetRef.current = null;
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
          if (moveX < 0) lastFacingDirectionRef.current = 'left';
          else if (moveX > 0) lastFacingDirectionRef.current = 'right';
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
          if (normJoyX < -0.1) lastFacingDirectionRef.current = 'left';
          else if (normJoyX > 0.1) lastFacingDirectionRef.current = 'right';
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
            if (dirX < -0.1) lastFacingDirectionRef.current = 'left';
            else if (dirX > 0.1) lastFacingDirectionRef.current = 'right';
            const moveSpeed = p.speed;
            const step = Math.min(dist, moveSpeed * dt);
            let newX = p.x + dirX * step;
            let newY = p.y + dirY * step;

            p.x = Math.max(minX, Math.min(maxX, newX));
            p.y = Math.max(minY, Math.min(maxY, newY));
          }
        }
      }

      // Track walking state for character animations (e.g. GlOwOb vertical stretch)
      const isWalkingNow = p.isDashing || (keysRef.current['w'] || keysRef.current['arrowup'] || keysRef.current['s'] || keysRef.current['arrowdown'] || keysRef.current['a'] || keysRef.current['arrowleft'] || keysRef.current['d'] || keysRef.current['arrowright']) || (Math.hypot(joystickVectorRef.current.x, joystickVectorRef.current.y) > 0.08) || Boolean(walkTargetRef.current);
      isPlayerWalkingRef.current = Boolean(isWalkingNow);
      if (isWalkingNow) {
        playerWalkAnimTimeRef.current += dt * 7;
      } else {
        playerWalkAnimTimeRef.current = 0;
      }

      // Helper function for Vampire's Bite +2 HP on hit
      const triggerVampiresBiteHeal = () => {
        if (!p.isVampireBite || p.hp <= 0 || p.hp >= p.maxHp) return;
        const newHp = Math.min(p.maxHp, p.hp + 2);
        if (newHp > p.hp) {
          p.hp = newHp;
          lastReportedHpRef.current = newHp;
          onUpdatePlayer({ hp: newHp });
          floatingTextsRef.current.push({
            id: nextEntityId.current++,
            x: p.x + (Math.random() - 0.5) * 16,
            y: p.y - 20,
            text: '+2 HP',
            color: '#ef4444',
            life: 0,
            maxLife: 0.6,
            vy: -35,
          });
        }
      };

      // Passive HP Regeneration (strictly when player is alive, True Witch Mode is not active, and Vampire's Bite is not active)
      if (!isTrueWitchMode && !p.isVampireBite && p.hpRegen > 0 && p.hp > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + p.hpRegen * dt);
      }

      // Update Boss Contact Cooldown
      if (bossContactCooldownRef.current > 0) {
        bossContactCooldownRef.current -= dt;
      }
      if (bossDashHitCooldownRef.current > 0) {
        bossDashHitCooldownRef.current -= dt;
      }
      if (playerInvincibleTimerRef.current > 0) {
        playerInvincibleTimerRef.current -= dt;
      }

      // Boss Body Touch Collision (Player takes 10 damage & is knocked backwards when touching the Carnivore Plant Boss)
      if (isBossFightRef.current && bossInstanceRef.current) {
        const boss = bossInstanceRef.current;
        const distToBoss = Math.hypot(p.x - boss.x, p.y - boss.y);
        const contactThreshold = p.radius + boss.radius;
        let isContact = false;
        if (boss.id === 'archmages' && (boss.archmagesPhase === 'PHASE1' || boss.archmagesPhase === 'MERGING')) {
          // Archmages Phase 1 and Phase 2 transition animation float in positions casting/merging spells; physical body touch contact collision is disabled
          isContact = false;
        } else if (boss.id === 'phiboccion' && (boss.phiboccionState === 'FLOATING' || phiboccionKickPhaseRef.current === 'PREP')) {
          // Disable body touch contact damage while Phiboccion is floating or moving towards setup corners in PREP phase
          isContact = false;
        } else if (boss.id === 'googolbra') {
          // Body and head contact damage handled precisely per tile segment in Googolbra loop
          isContact = false;
        } else if (boss.id === 'haunted_eye') {
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
          } else if (bossContactCooldownRef.current <= 0 && playerInvincibleTimerRef.current <= 0) {
            bossContactCooldownRef.current = 0.55;
            const contactDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(boss.damage * (1 - (p.damageReduction || 0))));
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

      // Enemy Spawning (PAUSED in Boss Rush mode or during Boss Fight!)
      if (!isBossRush && !isBossFightRef.current) {
        spawnEnemyWave(dt, canvas.width, canvas.height);
      }

      // Weapons Auto-Firing based on Shooting Systems:
      // 1. NEAREST_ENEMY
      // 2. MOUSE_DIRECTION
      // 3. AREA_OF_EFFECT
      const curTime = weaponTimeRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const activeCamX = isBossFightRef.current ? lockedCameraRef.current.x : p.x - centerX;
      const activeCamY = isBossFightRef.current ? lockedCameraRef.current.y : p.y - centerY;

      // In Mobile Mode, dynamically synchronize cursor position with Aim Joystick (if Joystick mode is active)
      if (mobileModeRef.current && mobileAimModeRef.current !== 'TOUCH') {
        const cJoyX = cursorJoystickVectorRef.current.x;
        const cJoyY = cursorJoystickVectorRef.current.y;
        const cJoyDist = Math.hypot(cJoyX, cJoyY);
        const aimDist = Math.min(canvas.width, canvas.height) * 0.28;
        const playerScreenX = p.x - activeCamX;
        const playerScreenY = p.y - activeCamY;

        if (cJoyDist > 0.05) {
          lastCursorAimAngleRef.current = Math.atan2(cJoyY, cJoyX);
          mouseScreenRef.current = {
            x: playerScreenX + cJoyX * aimDist,
            y: playerScreenY + cJoyY * aimDist,
          };
          lastBattlefieldCursorRef.current = { ...mouseScreenRef.current };
        } else if (lastCursorAimAngleRef.current !== undefined) {
          mouseScreenRef.current = {
            x: playerScreenX + Math.cos(lastCursorAimAngleRef.current) * aimDist,
            y: playerScreenY + Math.sin(lastCursorAimAngleRef.current) * aimDist,
          };
          lastBattlefieldCursorRef.current = { ...mouseScreenRef.current };
        }
      }

      const mouseWorldX = activeCamX + mouseScreenRef.current.x;
      const mouseWorldY = activeCamY + mouseScreenRef.current.y;

      // UPDATE PET PLANT (Mega Evolution: Pet Plant)
      const vineSnareOwned = weaponsRef.current.find(w => w.id === 'vine_snare');
      const hasPetPlant = vineSnareOwned && vineSnareOwned.level >= 7;

      if (hasPetPlant) {
        const pet = petPlantStateRef.current;
        if (pet.x === 0 && pet.y === 0) {
          pet.x = p.x - 30;
          pet.y = p.y + 15;
        }

        // Follow target slightly hovering behind / beside the player
        const followOffsetDist = 38;
        const followHoverAngle = curTime * 1.6;
        const targetPetX = p.x + Math.cos(followHoverAngle) * followOffsetDist;
        const targetPetY = p.y + Math.sin(followHoverAngle) * (followOffsetDist * 0.6) - 5;

        // Smoothly interpolate position towards target
        const petFollowSpeed = 6.0;
        pet.x += (targetPetX - pet.x) * Math.min(1, petFollowSpeed * dt);
        pet.y += (targetPetY - pet.y) * Math.min(1, petFollowSpeed * dt);

        // Update Bite animation and timer
        if (pet.biteTimer > 0) {
          pet.biteTimer -= dt;
          if (pet.biteTimer <= 0) {
            pet.isBiting = false;
            pet.lungeOffsetX = 0;
            pet.lungeOffsetY = 0;
          }
        }

        // Update attack cooldown
        if (pet.attackCooldown > 0) {
          pet.attackCooldown -= dt;
        } else {
          // Find closest enemy or boss to bite
          const activeBoss = isBossFightRef.current && bossInstanceRef.current ? bossInstanceRef.current : null;
          const aliveEnemies = enemiesRef.current.filter(e => e.hp > 0);
          
          let closestTarget: { x: number; y: number; hp: number; radius: number; isBoss: boolean; ref?: any } | null = null;
          let minDist = 220; // Pet Plant attack radius

          if (activeBoss && !activeBoss.isInvincible) {
            const dist = Math.hypot(activeBoss.x - pet.x, activeBoss.y - pet.y);
            if (dist < minDist) {
              minDist = dist;
              closestTarget = { x: activeBoss.x, y: activeBoss.y, hp: activeBoss.hp, radius: activeBoss.radius, isBoss: true, ref: activeBoss };
            }
          }

          for (let k = 0; k < aliveEnemies.length; k++) {
            const e = aliveEnemies[k];
            const dist = Math.hypot(e.x - pet.x, e.y - pet.y);
            if (dist < minDist) {
              minDist = dist;
              closestTarget = { x: e.x, y: e.y, hp: e.hp, radius: e.radius, isBoss: false, ref: e };
            }
          }

          if (closestTarget) {
            // Trigger Bite Attack!
            pet.isBiting = true;
            pet.biteTimer = 0.28; // Rapid bite animation duration
            pet.attackCooldown = 0.95; // Attack frequency

            // Lunge visual displacement
            const biteAngle = Math.atan2(closestTarget.y - pet.y, closestTarget.x - pet.x);
            pet.angle = biteAngle;
            pet.lungeOffsetX = Math.cos(biteAngle) * 22;
            pet.lungeOffsetY = Math.sin(biteAngle) * 22;

            // Damage computation (Pet Plant deals fierce bite damage)
            const vineDef = ALL_WEAPONS.find(w => w.id === 'vine_snare');
            const vineTier = vineDef?.tiers.find(t => t.tier >= 7);
            const petDmgBase = (vineDef ? vineDef.baseDamage + (vineTier?.damageBonus || 40) : 55);
            const biteDamage = petDmgBase * p.damageMult * (vineSnareOwned.statsMultiplier || 1.0) * 1.6;
            const actualBiteDmg = instaKillRef.current ? Math.max(closestTarget.hp + 10, 999999) : biteDamage;

            soundEngine.playHit();

            if (closestTarget.isBoss) {
              const b = closestTarget.ref;
              b.hp -= actualBiteDmg;
              b.lastHitBy = 'pet_plant';
              bossHitFlashRef.current = 0.12;
              b.vineRootedDuration = 1.0; // Short root on bite
            } else {
              const targetEnemy = closestTarget.ref;
              targetEnemy.hp -= actualBiteDmg;
              targetEnemy.lastHitBy = 'pet_plant';
              targetEnemy.hitFlashTimer = 0.1;
              targetEnemy.vineRootedDuration = 1.5;
            }

            triggerVampiresBiteHeal();

            // Floating Damage Number for Pet Plant
            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: closestTarget.x + (Math.random() - 0.5) * 16,
              y: closestTarget.y - 15,
              text: `${Math.round(actualBiteDmg)}`,
              color: '#22c55e',
              life: 0,
              maxLife: 0.65,
              vy: -45,
            });

            // Green spore & bite particles
            for (let k = 0; k < 8; k++) {
              const pAng = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 90 + 30;
              particlesRef.current.push({
                x: closestTarget.x,
                y: closestTarget.y,
                vx: Math.cos(pAng) * pSpd,
                vy: Math.sin(pAng) * pSpd,
                size: Math.random() * 3.5 + 2,
                color: k % 2 === 0 ? '#22c55e' : '#15803d',
                alpha: 1,
                decay: 3.5,
              });
            }
          }
        }
      }

      weaponsRef.current.forEach((owned) => {
        const def = ALL_WEAPONS.find((w) => w.id === owned.id);
        if (!def) return;

        const tier = def.tiers.find((t) => t.tier === owned.level) || def.tiers[0];
        const mult = owned.statsMultiplier || 1.0;

        // All weapons get an intrinsic 10% damage increase when leveled up
        const levelBonusMult = 1 + (owned.level - 1) * 0.10;
        const damage = (def.baseDamage + tier.damageBonus) * p.damageMult * mult * levelBonusMult;
        const attackSpeed = (p.attackSpeedMult || 1.0) * (mult > 1 ? mult : 1.0);
        const interval = Math.max(0.05, (def.baseInterval * tier.fireRateBonus) / Math.max(0.1, attackSpeed));
        const size = (def.baseSize + tier.sizeBonus) * p.projectileSizeMult;
        const count = def.baseCount + tier.countBonus;
        const pierce = def.basePierce + tier.pierceBonus;

        // Guard against any forward clock skew or desync
        if (owned.lastFired > curTime) {
          owned.lastFired = Math.max(0, curTime - interval);
        }

        if (curTime - owned.lastFired >= interval) {
          owned.lastFired = curTime;

          if (def.id === 'protractor') {
            soundEngine.playShoot('sword');

            // Determine movement base direction
            let baseAngle = Math.atan2(lastMoveDirRef.current.dy, lastMoveDirRef.current.dx);
            if (Math.hypot(lastMoveDirRef.current.dx, lastMoveDirRef.current.dy) < 0.05) {
              baseAngle = lastFacingDirectionRef.current === 'left' ? Math.PI : 0;
            }

            // Determine launch angles based on weapon rank:
            // Rank 1: moving direction
            // Rank 2: + behind (+PI)
            // Rank 3: + above (-PI/2)
            // Rank 4+: + underneath (+PI/2)
            const angles: number[] = [baseAngle];
            if (owned.level >= 2) {
              angles.push(baseAngle + Math.PI); // Behind
            }
            if (owned.level >= 3) {
              angles.push(baseAngle - Math.PI / 2); // Above
            }
            if (owned.level >= 4) {
              angles.push(baseAngle + Math.PI / 2); // Underneath
            }

            // Loop geometry: big circular motion strictly in front of the player towards shot direction
            const loopR = 140 * p.areaMult;
            const loopDuration = 1.6;

            angles.forEach((alpha, idx) => {
              const forwardX = Math.cos(alpha);
              const forwardY = Math.sin(alpha);
              const perpX = -Math.sin(alpha);
              const perpY = Math.cos(alpha);
              const loopDir = idx % 2 === 0 ? 1 : -1;

              projectilesRef.current.push({
                id: nextEntityId.current++,
                weaponId: def.id,
                weaponLevel: owned.level,
                x: p.x,
                y: p.y,
                vx: forwardX * 420,
                vy: forwardY * 420,
                damage,
                radius: size,
                color: '#38bdf8',
                pierce: 999,
                duration: 0,
                maxDuration: loopDuration,
                knockback: 10 * p.knockbackMult,
                vampirismRatio: p.vampirism,
                isCircularLoop: true,
                loopRadius: loopR,
                loopDirection: loopDir,
                forwardX,
                forwardY,
                perpX,
                perpY,
                rotationAngle: alpha,
                hitEnemyIds: new Set<number>(),
                hitBoss: false,
              });
            });
          }

          // SHOOTING SYSTEM 1: MOUSE_DIRECTION
          else if (def.shootingType === 'MOUSE_DIRECTION') {
            const baseAngle = Math.atan2(mouseWorldY - p.y, mouseWorldX - p.x);

            if (def.id === 'astral_sword') {
              const weaponRank = owned?.level || 1;
              if (weaponRank >= 7) return; // Mega Evolution: Astral Transformation is active 100% of the time

              soundEngine.playShoot('sword');
              const slashRange = size; // short range based on baseSize (95px) * p.projectileSizeMult
              // Cone area of attack: slowly increases from 90° (Rank 1) to 180° (Rank 6)
              // Each rank adds 18°: 90° (Rank 1), 108° (Rank 2), 126° (Rank 3), 144° (Rank 4), 162° (Rank 5), 180° (Rank 6)
              const coneDegrees = Math.min(180, 90 + (Math.max(1, weaponRank) - 1) * 18);
              const totalArc = (coneDegrees * Math.PI) / 180;
              const halfArc = totalArc / 2;

              // 1. Cleave normal enemies within cone arc and short range
              enemiesRef.current.forEach((enemy) => {
                if (enemy.hp <= 0) return;
                const dx = enemy.x - p.x;
                const dy = enemy.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= slashRange + enemy.radius) {
                  const enemyAngle = Math.atan2(dy, dx);
                  const angleDiff = Math.atan2(Math.sin(enemyAngle - baseAngle), Math.cos(enemyAngle - baseAngle));

                  if (Math.abs(angleDiff) <= halfArc + 0.12) {
                    const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : damage;
                    enemy.hp -= actualDmg;
                    enemy.lastHitBy = def.id;
                    enemy.hitFlashTimer = 0.12;

                    // Knockback away from player
                    const kbAngle = Math.atan2(dy, dx);
                    const kbForce = 24 * p.knockbackMult;
                    enemy.x += Math.cos(kbAngle) * kbForce;
                    enemy.y += Math.sin(kbAngle) * kbForce;

                    if (p.vampirism > 0) {
                      p.hp = Math.min(p.maxHp, p.hp + actualDmg * p.vampirism);
                    }
                    triggerVampiresBiteHeal();

                    soundEngine.playHit();

                    floatingTextsRef.current.push({
                      id: nextEntityId.current++,
                      x: enemy.x + (Math.random() - 0.5) * 12,
                      y: enemy.y - 12,
                      text: `${Math.round(actualDmg)}`,
                      color: '#c084fc',
                      life: 0,
                      maxLife: 0.65,
                      vy: -45,
                    });
                  }
                }
              });

              // 2. Cleave Boss if active
              const activeBoss = isBossFightRef.current && bossInstanceRef.current ? bossInstanceRef.current : null;
              if (activeBoss && activeBoss.hp > 0 && !activeBoss.isInvincible) {
                const bdx = activeBoss.x - p.x;
                const bdy = activeBoss.y - p.y;
                const bdist = Math.hypot(bdx, bdy);
                const bossRadius = activeBoss.radius || 40;

                if (bdist <= slashRange + bossRadius) {
                  const bossAngle = Math.atan2(bdy, bdx);
                  const angleDiff = Math.atan2(Math.sin(bossAngle - baseAngle), Math.cos(bossAngle - baseAngle));

                  if (Math.abs(angleDiff) <= halfArc + 0.15) {
                    const actualDmg = instaKillRef.current ? Math.max(activeBoss.hp + 10, 999999) : damage;
                    activeBoss.hp -= actualDmg;
                    activeBoss.lastHitBy = def.id;
                    bossHitFlashRef.current = 0.12;

                    if (p.vampirism > 0) {
                      p.hp = Math.min(p.maxHp, p.hp + actualDmg * p.vampirism);
                    }
                    triggerVampiresBiteHeal();

                    soundEngine.playHit();

                    floatingTextsRef.current.push({
                      id: nextEntityId.current++,
                      x: activeBoss.x + (Math.random() - 0.5) * 20,
                      y: activeBoss.y - 20,
                      text: `${Math.round(actualDmg)}`,
                      color: '#c084fc',
                      life: 0,
                      maxLife: 0.75,
                      vy: -45,
                    });
                  }
                }
              }

              // Push visual animated slash
              astralSlashesRef.current.push({
                id: nextEntityId.current++,
                x: p.x,
                y: p.y,
                angle: baseAngle,
                halfArc,
                range: slashRange,
                duration: 0,
                maxDuration: 0.22,
                color: def.bulletColor,
              });
            } else if (def.id === 'brimstone_shotgun') {
              soundEngine.playShoot('shotgun');
              if (owned.level >= 7) {
                // GlOwOb Mega Evolution: Acidic Wave
                const waveDamage = damage * 2; // Deals damage equivalent to 2 pellets
                projectilesRef.current.push({
                  id: nextEntityId.current++,
                  weaponId: def.id,
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(baseAngle) * 550,
                  vy: Math.sin(baseAngle) * 550,
                  damage: waveDamage,
                  radius: 45,
                  color: def.bulletColor,
                  pierce: 998,
                  duration: 0,
                  maxDuration: 1.6,
                  knockback: 30 * p.knockbackMult, // Slightly knockbacking
                  vampirismRatio: p.vampirism,
                  acidDuration: 15.0, // Acid effect for 15 seconds
                  acidDamagePerTick: Math.max(1, Math.round(waveDamage * 0.10)),
                  isAcidWave: true,
                  hitEnemyIds: new Set<number>(),
                  hitBoss: false,
                });
              } else {
                const volleyCount = owned.level >= 4 ? 5 : 3;
                const spread = volleyCount === 5 ? 0.085 : 0.12;
                const acidDuration = owned.level >= 3 ? (owned.level >= 5 ? 10.0 : 7.0) : undefined;
                const acidDamagePerTick = owned.level >= 3 ? Math.max(1, Math.round(damage * 0.10)) : undefined;

                for (let i = 0; i < volleyCount; i++) {
                  const ang = baseAngle + (i - (volleyCount - 1) / 2) * spread;
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(ang) * def.baseSpeed,
                    vy: Math.sin(ang) * def.baseSpeed,
                    damage,
                    radius: size,
                    color: def.bulletColor,
                    pierce,
                    duration: 0,
                    maxDuration: 1.8,
                    knockback: 18 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    acidDuration,
                    acidDamagePerTick,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }

                if (owned.level >= 2) {
                  delayedAcidShotsRef.current.push({
                    x: p.x,
                    y: p.y,
                    baseAngle,
                    damage,
                    size,
                    pierce,
                    count: volleyCount,
                    level: owned.level,
                    bulletColor: def.bulletColor,
                    timer: 0.12,
                    acidDuration,
                    acidDamagePerTick,
                    knockback: 18 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    baseSpeed: def.baseSpeed,
                  });
                }
              }
            } else {
              soundEngine.playShoot('wand');
              const isArcaneWand = def.id === 'arcane_wand';
              const spread = count > 1 ? (isArcaneWand ? 0.16 : 0.24) : 0;
              const isLaser = isArcaneWand && owned.level >= 7;

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
                    weaponLevel: owned.level,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(ang) * def.baseSpeed,
                    vy: Math.sin(ang) * def.baseSpeed,
                    damage: pDamage,
                    radius: pRadius,
                    color: def.bulletColor,
                    pierce,
                    duration: 0,
                    maxDuration: 3.5, // Extended lifespan so projectiles traverse large boss arenas without early despawns
                    knockback: (def.id === 'spectral_arrow' ? 24 : 18) * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              }
            }
          }

          // SHOOTING SYSTEM 2: NEAREST_ENEMY (Homing Seeking Wisp or Instant Vine Trap)
          else if (def.shootingType === 'NEAREST_ENEMY') {
            const activeBoss = isBossFightRef.current && bossInstanceRef.current ? bossInstanceRef.current : null;
            const sortedEnemies = [...enemiesRef.current].filter(e => e.hp > 0).sort((a, b) => {
              const distA = Math.hypot(a.x - p.x, a.y - p.y);
              const distB = Math.hypot(b.x - p.x, b.y - p.y);
              return distA - distB;
            });

            if (sortedEnemies.length === 0 && !activeBoss) {
              return;
            }

            if (def.id === 'vine_snare') {
              if (sortedEnemies.length > 0) {
                // Instantly trap nearest enemies (1 per enemy, up to count)
                soundEngine.playShoot('cauldron');

                const targetCount = Math.min(count, sortedEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                  const target = sortedEnemies[i];
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
              } else if (activeBoss && !activeBoss.isInvincible) {
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
            } else if (def.id === 'thunderstrike') {
              const isThunderstorm = owned.level >= 7;
              const freezeDuration = owned.level >= 5 ? 0.75 : (owned.level >= 2 ? 0.5 : 0);
              const chainMax = owned.level >= 4 ? 4 : (owned.level >= 3 ? 2 : 0);
              const chainFreeze = owned.level >= 6 ? 0.5 : 0;
              const shootCount = isThunderstorm ? Math.max(2, count) : count;
              const projSpeed = def.baseSpeed + ((tier as any).speedBonus || 0);

              if (sortedEnemies.length > 0) {
                soundEngine.playShoot('wisp');
                const targetCount = Math.min(shootCount, sortedEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                  const target = sortedEnemies[i];
                  const ang = Math.atan2(target.y - p.y, target.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#3b82f6',
                    pierce: 1,
                    duration: 0,
                    maxDuration: 2.0,
                    knockback: 14 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    homingTargetId: target.id,
                    freezeDuration,
                    chainMax,
                    chainFreeze,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              } else if (activeBoss) {
                soundEngine.playShoot('wisp');
                for (let i = 0; i < shootCount; i++) {
                  const ang = Math.atan2(activeBoss.y - p.y, activeBoss.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#3b82f6',
                    pierce: 1,
                    duration: 0,
                    maxDuration: 2.0,
                    knockback: 14 * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    freezeDuration,
                    chainMax,
                    chainFreeze,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              }
            } else if (def.id === 'sickle') {
              const projSpeed = def.baseSpeed + ((tier as any).speedBonus || 0);
              const kb = (owned.level >= 6 ? 12 : 0) * p.knockbackMult;

              if (sortedEnemies.length > 0) {
                soundEngine.playShoot('sword');
                const targetCount = Math.min(count, sortedEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                  const target = sortedEnemies[i];
                  const ang = Math.atan2(target.y - p.y, target.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    weaponLevel: owned.level,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#38bdf8',
                    pierce: 999,
                    duration: 0,
                    maxDuration: 4.5,
                    knockback: kb,
                    vampirismRatio: p.vampirism,
                    isBoomerang: true,
                    startX: p.x,
                    startY: p.y,
                    maxDistance: 280,
                    isReturning: false,
                    returnThrowTriggered: false,
                    rotationAngle: 0,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              } else if (activeBoss) {
                soundEngine.playShoot('sword');
                for (let i = 0; i < count; i++) {
                  const ang = Math.atan2(activeBoss.y - p.y, activeBoss.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    weaponLevel: owned.level,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#38bdf8',
                    pierce: 999,
                    duration: 0,
                    maxDuration: 4.5,
                    knockback: kb,
                    vampirismRatio: p.vampirism,
                    isBoomerang: true,
                    startX: p.x,
                    startY: p.y,
                    maxDistance: 280,
                    isReturning: false,
                    returnThrowTriggered: false,
                    rotationAngle: 0,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              }
            } else {
              // Homing Fire Wisp / Mega Fireball (Fireball!!!)
              const isMegaFireball = owned.level >= 7;
              const isRank6Explosion = owned.level === 6;
              const hasExplosion = isMegaFireball || isRank6Explosion;
              const hasBurn = isMegaFireball; // Mega Evolution Fireball!!! applies continuous burn
              const burnDuration = hasBurn ? 5.0 : undefined;
              const burnDamagePerTick = hasBurn ? Math.max(1, Math.round(damage * 0.15)) : undefined;
              const projSpeed = (def.baseSpeed + ((tier as any).speedBonus || 0));
              const expRadius = isMegaFireball ? 115 : (isRank6Explosion ? 55 : undefined);
              const expDamage = isMegaFireball ? Math.round(damage * 0.85) : (isRank6Explosion ? Math.round(damage * 0.45) : undefined);

              if (sortedEnemies.length > 0) {
                if (isMegaFireball) {
                  soundEngine.playShoot('nova');
                } else {
                  soundEngine.playShoot('wisp');
                }

                const targetCount = Math.min(count, sortedEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                  const target = sortedEnemies[i];
                  const ang = Math.atan2(target.y - p.y, target.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#ef4444',
                    pierce,
                    duration: 0,
                    maxDuration: 2.5,
                    knockback: (isMegaFireball ? 26 : (isRank6Explosion ? 18 : 14)) * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    homingTargetId: target.id,
                    burnDuration,
                    burnDamagePerTick,
                    isExplosive: hasExplosion,
                    explosionRadius: expRadius,
                    explosionDamage: expDamage,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              } else if (activeBoss) {
                // Target Boss directly with Fire Wisp / Fireball!!!
                if (isMegaFireball) {
                  soundEngine.playShoot('nova');
                } else {
                  soundEngine.playShoot('wisp');
                }
                for (let i = 0; i < count; i++) {
                  const ang = Math.atan2(activeBoss.y - p.y, activeBoss.x - p.x);
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: def.id,
                    x: p.x + (Math.random() - 0.5) * 10,
                    y: p.y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * projSpeed,
                    vy: Math.sin(ang) * projSpeed,
                    damage,
                    radius: size,
                    color: '#ef4444',
                    pierce,
                    duration: 0,
                    maxDuration: 2.5,
                    knockback: (isMegaFireball ? 26 : (isRank6Explosion ? 18 : 14)) * p.knockbackMult,
                    vampirismRatio: p.vampirism,
                    burnDuration,
                    burnDamagePerTick,
                    isExplosive: hasExplosion,
                    explosionRadius: expRadius,
                    explosionDamage: expDamage,
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
        const orbitRadius = (58 + (tier.sizeBonus || 0) * 1.5) * p.projectileSizeMult;
        const bookCount = Math.min(3, def.baseCount + tier.countBonus);

        for (let i = 0; i < bookCount; i++) {
          const bAngle = orbitAngleRef.current + (i / bookCount) * Math.PI * 2;
          const bx = p.x + Math.cos(bAngle) * orbitRadius;
          const by = p.y + Math.sin(bAngle) * orbitRadius;
          const bookRadius = (11 + (tier.sizeBonus || 0) * 0.4) * p.projectileSizeMult;

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
            if (isBookHit && !boss.isInvincible) {
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

      // Update delayed acid shots
      for (let i = delayedAcidShotsRef.current.length - 1; i >= 0; i--) {
        const delayed = delayedAcidShotsRef.current[i];
        delayed.timer -= dt;
        if (delayed.timer <= 0) {
          const spread = delayed.count === 5 ? 0.085 : 0.12;
          for (let c = 0; c < delayed.count; c++) {
            const ang = delayed.baseAngle + (c - (delayed.count - 1) / 2) * spread;
            projectilesRef.current.push({
              id: nextEntityId.current++,
              weaponId: 'brimstone_shotgun',
              x: delayed.x,
              y: delayed.y,
              vx: Math.cos(ang) * delayed.baseSpeed,
              vy: Math.sin(ang) * delayed.baseSpeed,
              damage: delayed.damage,
              radius: delayed.size,
              color: delayed.bulletColor,
              pierce: delayed.pierce,
              duration: 0,
              maxDuration: 1.8,
              knockback: delayed.knockback,
              vampirismRatio: delayed.vampirismRatio,
              acidDuration: delayed.acidDuration,
              acidDamagePerTick: delayed.acidDamagePerTick,
              hitEnemyIds: new Set<number>(),
              hitBoss: false,
            });
          }
          delayedAcidShotsRef.current.splice(i, 1);
        }
      }

      // Special handling for Mega Evolution: Astral Transformation (Astral Blade Rank 7)
      const megaAstralWeapon = weaponsRef.current.find((w) => w.id === 'astral_sword' && w.level >= 7);
      if (megaAstralWeapon) {
        const def = ALL_WEAPONS.find((w) => w.id === 'astral_sword')!;
        const tier = def.tiers.find((t) => t.tier === 7) || def.tiers[def.tiers.length - 1];
        const mult = megaAstralWeapon.statsMultiplier || 1.0;
        const levelBonusMult = 1 + (megaAstralWeapon.level - 1) * 0.10;
        const damage = (def.baseDamage + tier.damageBonus) * p.damageMult * mult * levelBonusMult;
        const bladeRadius = (45 + (tier.sizeBonus || 0) * 0.5) * p.projectileSizeMult;

        const blade = megaAstralBladeRef.current;
        if (blade.x === 0 && blade.y === 0) {
          blade.x = p.x;
          blade.y = p.y;
          blade.prevX = p.x;
          blade.prevY = p.y;
        }

        // Aim towards cursor position
        const targetX = mouseWorldX;
        const targetY = mouseWorldY;

        // Smoothly and responsively track target (cursor) position
        const dx = targetX - blade.x;
        const dy = targetY - blade.y;
        const distToTarget = Math.hypot(dx, dy);

        if (distToTarget > 1) {
          const stepSpeed = Math.min(distToTarget / dt, 2400);
          blade.x += (dx / distToTarget) * stepSpeed * dt;
          blade.y += (dy / distToTarget) * stepSpeed * dt;
        }

        // Calculate velocity & speed
        const frameVx = (blade.x - blade.prevX) / dt;
        const frameVy = (blade.y - blade.prevY) / dt;
        blade.vx = blade.vx * 0.4 + frameVx * 0.6;
        blade.vy = blade.vy * 0.4 + frameVy * 0.6;
        blade.speed = Math.hypot(blade.vx, blade.vy);
        blade.angle = Math.atan2(mouseWorldY - p.y, mouseWorldX - p.x);
        blade.prevX = blade.x;
        blade.prevY = blade.y;

        const SPEED_THRESHOLD = 500; // Raised speed threshold for slash damage & effects
        const isFastEnough = blade.speed >= SPEED_THRESHOLD;

        // Small wind trail behind blade when moving fast enough
        if (isFastEnough) {
          if (Math.random() < 0.75) {
            const moveAngle = Math.atan2(blade.vy, blade.vx);
            particlesRef.current.push({
              x: blade.x - Math.cos(moveAngle) * 20 + (Math.random() - 0.5) * 16,
              y: blade.y - Math.sin(moveAngle) * 20 + (Math.random() - 0.5) * 16,
              vx: -Math.cos(moveAngle) * (blade.speed * 0.12) + (Math.random() - 0.5) * 30,
              vy: -Math.sin(moveAngle) * (blade.speed * 0.12) + (Math.random() - 0.5) * 30,
              size: 3.5 + Math.random() * 4.5,
              color: Math.random() < 0.5 ? '#e0f2fe' : '#38bdf8',
              alpha: 0.85,
              decay: 6,
            });
          }

          // Check hit against normal enemies
          enemiesRef.current.forEach((enemy) => {
            if (enemy.hp <= 0) return;
            const edist = Math.hypot(enemy.x - blade.x, enemy.y - blade.y);
            if (edist <= bladeRadius + enemy.radius) {
              const ASTRAL_HIT_COOLDOWN = 0.5; // Prevent rapid hits from spinning blade (0.5s cooldown per enemy)
              const lastHit = blade.enemyHitMap.get(enemy.id) || 0;
              if (curTime - lastHit >= ASTRAL_HIT_COOLDOWN) {
                blade.enemyHitMap.set(enemy.id, curTime);
                const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : damage * 1.5;
                enemy.hp -= actualDmg;
                enemy.lastHitBy = 'astral_sword';
                enemy.hitFlashTimer = 0.12;

                // Big knockback in movement direction
                const kbAngle = Math.atan2(blade.vy, blade.vx);
                const kbForce = 32 * p.knockbackMult;
                enemy.x += Math.cos(kbAngle) * kbForce;
                enemy.y += Math.sin(kbAngle) * kbForce;

                if (p.vampirism > 0) {
                  p.hp = Math.min(p.maxHp, p.hp + actualDmg * p.vampirism);
                }
                triggerVampiresBiteHeal();

                // 50% chance to apply either Burn or Acid
                if (Math.random() < 0.5) {
                  if (Math.random() < 0.5) {
                    // Burn for 5s
                    enemy.burnDuration = Math.max(enemy.burnDuration || 0, 5.0);
                    enemy.burnDamagePerTick = Math.max(enemy.burnDamagePerTick || 0, Math.max(2, Math.round(actualDmg * 0.15)));
                  } else {
                    // Acid for 15s
                    enemy.acidDuration = Math.max(enemy.acidDuration || 0, 15.0);
                    enemy.acidDamagePerTick = Math.max(enemy.acidDamagePerTick || 0, Math.max(2, Math.round(actualDmg * 0.15)));
                  }
                }

                soundEngine.playHit();
                floatingTextsRef.current.push({
                  id: nextEntityId.current++,
                  x: enemy.x + (Math.random() - 0.5) * 12,
                  y: enemy.y - 12,
                  text: Math.round(actualDmg).toString(),
                  color: '#38bdf8',
                  duration: 0.6,
                  maxDuration: 0.6,
                });
              }
            }
          });

          // Check hit against Boss
          if (isBossFightRef.current && bossInstanceRef.current) {
            const boss = bossInstanceRef.current;
            if (boss.hp > 0 && !boss.isInvincible) {
              const bdist = Math.hypot(boss.x - blade.x, boss.y - blade.y);
              if (bdist <= bladeRadius + (boss.radius || 45)) {
                const ASTRAL_BOSS_HIT_COOLDOWN = 0.5; // Prevent rapid hits from spinning blade (0.5s cooldown for boss)
                const lastHit = blade.enemyHitMap.get(-999) || 0;
                if (curTime - lastHit >= ASTRAL_BOSS_HIT_COOLDOWN) {
                  blade.enemyHitMap.set(-999, curTime);
                  const actualDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : damage * 1.5;
                  boss.hp -= actualDmg;
                  boss.lastHitBy = 'astral_sword';
                  boss.hitFlashTimer = 0.12;

                  if (p.vampirism > 0) {
                    p.hp = Math.min(p.maxHp, p.hp + actualDmg * p.vampirism);
                  }
                  triggerVampiresBiteHeal();

                  if (Math.random() < 0.5) {
                    if (Math.random() < 0.5) {
                      boss.burnDuration = Math.max(boss.burnDuration || 0, 5.0);
                      boss.burnDamagePerTick = Math.max(boss.burnDamagePerTick || 0, Math.max(2, Math.round(actualDmg * 0.15)));
                    } else {
                      boss.acidDuration = Math.max(boss.acidDuration || 0, 15.0);
                      boss.acidDamagePerTick = Math.max(boss.acidDamagePerTick || 0, Math.max(2, Math.round(actualDmg * 0.15)));
                    }
                  }

                  soundEngine.playHit();
                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: boss.x + (Math.random() - 0.5) * 20,
                    y: boss.y - 20,
                    text: Math.round(actualDmg).toString(),
                    color: '#38bdf8',
                    duration: 0.6,
                    maxDuration: 0.6,
                  });
                }
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

        // Boomerang / Sickle logic
        if (proj.isBoomerang) {
          // Constantly rotating clockwise
          proj.rotationAngle = ((proj.rotationAngle || 0) + dt * 14) % (Math.PI * 2);

          if (!proj.isReturning) {
            const distFromStart = Math.hypot(proj.x - (proj.startX ?? proj.x), proj.y - (proj.startY ?? proj.y));
            if (distFromStart >= (proj.maxDistance ?? 280)) {
              proj.isReturning = true;
              // Reset hit sets so enemies can be struck again on return journey
              proj.hitEnemyIds?.clear();
              proj.hitBoss = false;

              // Rank 3: When a Sickle is at its maximum distance, the player throws another (essentially double fire rate)
              if ((proj.weaponLevel ?? 1) >= 3 && !proj.returnThrowTriggered) {
                proj.returnThrowTriggered = true;
                const activeBoss = isBossFightRef.current && bossInstanceRef.current ? bossInstanceRef.current : null;
                const sortedEnemies = [...enemiesRef.current].filter((e) => e.hp > 0).sort((a, b) => {
                  return Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y);
                });
                let throwAngle: number | null = null;
                if (sortedEnemies.length > 0) {
                  throwAngle = Math.atan2(sortedEnemies[0].y - p.y, sortedEnemies[0].x - p.x);
                } else if (activeBoss) {
                  throwAngle = Math.atan2(activeBoss.y - p.y, activeBoss.x - p.x);
                }
                if (throwAngle !== null) {
                  soundEngine.playShoot('sword');
                  const projSpeed = 450;
                  const kb = ((proj.weaponLevel ?? 1) >= 6 ? 12 : 0) * p.knockbackMult;
                  projectilesRef.current.push({
                    id: nextEntityId.current++,
                    weaponId: 'sickle',
                    weaponLevel: proj.weaponLevel,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(throwAngle) * projSpeed,
                    vy: Math.sin(throwAngle) * projSpeed,
                    damage: proj.damage,
                    radius: proj.radius,
                    color: '#38bdf8',
                    pierce: 999,
                    duration: 0,
                    maxDuration: 4.5,
                    knockback: kb,
                    vampirismRatio: p.vampirism,
                    isBoomerang: true,
                    startX: p.x,
                    startY: p.y,
                    maxDistance: 280,
                    isReturning: false,
                    returnThrowTriggered: true, // Only primary sickle triggers secondary throw
                    rotationAngle: 0,
                    hitEnemyIds: new Set<number>(),
                    hitBoss: false,
                  });
                }
              }
            }
          } else {
            // Returning to player
            const toPlayerX = p.x - proj.x;
            const toPlayerY = p.y - proj.y;
            const distToPlayer = Math.hypot(toPlayerX, toPlayerY);
            if (distToPlayer <= Math.max(28, p.radius + proj.radius)) {
              // Caught by player
              projectilesRef.current.splice(i, 1);
              continue;
            } else {
              const retSpeed = 480;
              proj.vx = (toPlayerX / distToPlayer) * retSpeed;
              proj.vy = (toPlayerY / distToPlayer) * retSpeed;
            }
          }
        }

        if (proj.isLaser) {
          proj.x = p.x;
          proj.y = p.y;
        } else if (proj.isCircularLoop) {
          const loopDuration = proj.maxDuration || 1.6;
          const progress = Math.min(1.0, proj.duration / loopDuration);

          proj.rotationAngle = (proj.rotationAngle || 0) + 14 * dt;

          if (progress >= 1.0) {
            // Loop finished and returned to player!
            projectilesRef.current.splice(i, 1);
            continue;
          }

          // Reset hit enemies halfway through loop so return journey slices again
          if (progress > 0.52 && !proj.returnThrowTriggered) {
            proj.returnThrowTriggered = true;
            proj.hitBoss = false;
            proj.hitEnemyIds?.clear();
          }

          // Circle strictly towards where it was shot:
          // Starts at player, moves forward along forward vector, arcs in a circle reaching 2*R distance at progress=0.5, and returns to player at progress=1.0
          const theta = progress * Math.PI * 2;
          const R = proj.loopRadius || 140;
          const fwdDist = R * (1 - Math.cos(theta));
          const latDist = R * Math.sin(theta) * (proj.loopDirection || 1);

          const fwdX = proj.forwardX ?? 1;
          const fwdY = proj.forwardY ?? 0;
          const pX = proj.perpX ?? 0;
          const pY = proj.perpY ?? 1;

          proj.x = p.x + fwdDist * fwdX + latDist * pX;
          proj.y = p.y + fwdDist * fwdY + latDist * pY;
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
        if (!proj.isCircularLoop && proj.duration >= proj.maxDuration) {
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
            } else if (boss.id === 'googolbra') {
              isBossHit = Math.hypot(proj.x - boss.x, proj.y - boss.y) <= proj.radius + boss.radius;
              if (!isBossHit && googolbraCurrentSegmentsRef.current) {
                for (const seg of googolbraCurrentSegmentsRef.current) {
                  if (Math.hypot(proj.x - seg.x, proj.y - seg.y) <= proj.radius + 38) {
                    isBossHit = true;
                    break;
                  }
                }
              }
            } else {
              isBossHit = Math.hypot(proj.x - boss.x, proj.y - boss.y) <= proj.radius + boss.radius;
            }
          }

          if (isBossHit && !boss.isInvincible) {
            proj.hitBoss = true;
            proj.hitCount = (proj.hitCount || 0) + 1;

            let calcDmg = proj.damage;
            if (proj.weaponId === 'spectral_arrow' && proj.hitCount > 1 && (proj.weaponLevel ?? 1) < 5) {
              calcDmg = Math.round(proj.damage * 0.5);
            }

            const actualDmg = instaKillRef.current ? Math.max(boss.hp + 10, 999999) : calcDmg;
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

            if (proj.burnDuration) {
              boss.burnDuration = proj.burnDuration;
              boss.burnTickTimer = 0.05;
              boss.burnDamagePerTick = proj.burnDamagePerTick || Math.max(1, Math.round((proj.damage || actualDmg) * 0.10));
            }

            if (proj.acidDuration) {
              boss.acidDuration = proj.acidDuration;
              boss.acidTickTimer = 0.05;
              boss.acidDamagePerTick = proj.acidDamagePerTick || Math.max(1, Math.round((proj.damage || actualDmg) * 0.10));
            }

            if (proj.vampirismRatio > 0) {
              const healed = actualDmg * proj.vampirismRatio;
              p.hp = Math.min(p.maxHp, p.hp + healed);
            }
            triggerVampiresBiteHeal();

            // Mega Fireball explosion on Boss hit
            if (proj.isExplosive) {
              const expX = proj.x;
              const expY = proj.y;
              const expRadius = proj.explosionRadius || 100;
              const splashDmg = proj.explosionDamage || Math.round(proj.damage * 0.65);

              soundEngine.playExplosion();
              if (screenShakeEnabledRef.current) {
                screenShakeRef.current = Math.max(screenShakeRef.current, 7);
              }

              for (let k = 0; k < 24; k++) {
                const pAng = Math.random() * Math.PI * 2;
                const pSpd = Math.random() * 180 + 50;
                particlesRef.current.push({
                  x: expX,
                  y: expY,
                  vx: Math.cos(pAng) * pSpd,
                  vy: Math.sin(pAng) * pSpd,
                  size: Math.random() * 5 + 3,
                  color: k % 3 === 0 ? '#ef4444' : k % 3 === 1 ? '#f97316' : '#facc15',
                  alpha: 1.0,
                  decay: 3.0,
                });
              }

              // Splash surrounding normal enemies
              for (let k = 0; k < enemiesRef.current.length; k++) {
                const otherE = enemiesRef.current[k];
                if (otherE.hp <= 0) continue;
                const edist = Math.hypot(otherE.x - expX, otherE.y - expY);
                if (edist <= expRadius + otherE.radius) {
                  const actualSplash = instaKillRef.current ? Math.max(otherE.hp + 10, 999999) : splashDmg;
                  otherE.hp -= actualSplash;
                  otherE.lastHitBy = proj.weaponId;
                  otherE.hitFlashTimer = 0.1;
                  if (proj.burnDuration) {
                    otherE.burnDuration = proj.burnDuration;
                    otherE.burnTickTimer = 0.05;
                    otherE.burnDamagePerTick = proj.burnDamagePerTick || Math.max(1, Math.round((proj.damage || actualSplash) * 0.10));
                  }

                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: otherE.x + (Math.random() - 0.5) * 10,
                    y: otherE.y - 10,
                    text: `${Math.round(actualSplash)}`,
                    color: '#f97316',
                    life: 0,
                    maxLife: 0.65,
                    vy: -40,
                  });

                  const kbAng = Math.atan2(otherE.y - expY, otherE.x - expX);
                  otherE.x += Math.cos(kbAng) * (18 * p.knockbackMult);
                  otherE.y += Math.sin(kbAng) * (18 * p.knockbackMult);
                }
              }

              projectilesRef.current.splice(i, 1);
              continue;
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
            proj.hitCount = (proj.hitCount || 0) + 1;

            let calcDmg = proj.damage;
            if (proj.weaponId === 'spectral_arrow' && proj.hitCount > 1 && (proj.weaponLevel ?? 1) < 5) {
              calcDmg = Math.round(proj.damage * 0.5);
            }

            const actualDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : calcDmg;
            enemy.hp -= actualDmg;
            enemy.lastHitBy = proj.weaponId;
            enemy.hitFlashTimer = 0.1;
            soundEngine.playHit();
            triggerVampiresBiteHeal();

            if (proj.weaponId === 'vine_snare') {
              enemy.vineRootedDuration = 2.0;
            }

            if (proj.weaponId === 'thunderstrike') {
              if (proj.freezeDuration && proj.freezeDuration > 0) {
                enemy.frozenTimer = proj.freezeDuration;
              }
              if (proj.chainMax && proj.chainMax > 0 && !proj.hasChained) {
                proj.hasChained = true;
                const chainTargets = [...enemiesRef.current]
                  .filter(e => e.hp > 0 && e.id !== enemy.id && !proj.hitEnemyIds?.has(e.id))
                  .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))
                  .slice(0, proj.chainMax);

                const chainDmg = Math.round(proj.damage * 0.5);
                const chainFreezeDur = proj.chainFreeze || 0;

                for (const cTarget of chainTargets) {
                  if (!proj.hitEnemyIds) proj.hitEnemyIds = new Set<number>();
                  proj.hitEnemyIds.add(cTarget.id);

                  const actualChainDmg = instaKillRef.current ? Math.max(cTarget.hp + 10, 999999) : chainDmg;
                  cTarget.hp -= actualChainDmg;
                  cTarget.lastHitBy = 'thunderstrike';
                  cTarget.hitFlashTimer = 0.1;
                  if (chainFreezeDur > 0) {
                    cTarget.frozenTimer = chainFreezeDur;
                  }

                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: cTarget.x + (Math.random() - 0.5) * 8,
                    y: cTarget.y - 10,
                    text: `${Math.round(actualChainDmg)}`,
                    color: '#60a5fa',
                    life: 0,
                    maxLife: 0.65,
                    vy: -40,
                  });

                  for (let pIdx = 0; pIdx < 8; pIdx++) {
                    particlesRef.current.push({
                      x: cTarget.x,
                      y: cTarget.y,
                      vx: (Math.random() - 0.5) * 120,
                      vy: (Math.random() - 0.5) * 120,
                      size: 2.5,
                      color: '#3b82f6',
                      alpha: 0.9,
                      decay: 4.0,
                    });
                  }
                }
              }
            }

            if (proj.burnDuration) {
              enemy.burnDuration = proj.burnDuration;
              enemy.burnTickTimer = 0.05;
              enemy.burnDamagePerTick = proj.burnDamagePerTick || Math.max(1, Math.round((proj.damage || actualDmg) * 0.10));
            }

            if (proj.acidDuration) {
              enemy.acidDuration = proj.acidDuration;
              enemy.acidTickTimer = 0.05;
              enemy.acidDamagePerTick = proj.acidDamagePerTick || Math.max(1, Math.round((proj.damage || actualDmg) * 0.10));
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
            if (!isTrueWitchMode && proj.vampirismRatio > 0) {
              const healed = actualDmg * proj.vampirismRatio;
              p.hp = Math.min(p.maxHp, p.hp + healed);
            }

            // Mega Fireball explosion on Enemy hit
            if (proj.isExplosive) {
              const expX = proj.x;
              const expY = proj.y;
              const expRadius = proj.explosionRadius || 100;
              const splashDmg = proj.explosionDamage || Math.round(proj.damage * 0.65);

              soundEngine.playExplosion();
              if (screenShakeEnabledRef.current) {
                screenShakeRef.current = Math.max(screenShakeRef.current, 7);
              }

              // Visual explosion particles
              for (let k = 0; k < 24; k++) {
                const pAng = Math.random() * Math.PI * 2;
                const pSpd = Math.random() * 180 + 50;
                particlesRef.current.push({
                  x: expX,
                  y: expY,
                  vx: Math.cos(pAng) * pSpd,
                  vy: Math.sin(pAng) * pSpd,
                  size: Math.random() * 5 + 3,
                  color: k % 3 === 0 ? '#ef4444' : k % 3 === 1 ? '#f97316' : '#facc15',
                  alpha: 1.0,
                  decay: 3.0,
                });
              }

              // Splash damage & Burn to other enemies in explosion area
              for (let k = 0; k < enemiesRef.current.length; k++) {
                const otherE = enemiesRef.current[k];
                if (otherE.hp <= 0 || otherE.id === enemy.id) continue;
                const edist = Math.hypot(otherE.x - expX, otherE.y - expY);
                if (edist <= expRadius + otherE.radius) {
                  if (!proj.hitEnemyIds) proj.hitEnemyIds = new Set<number>();
                  proj.hitEnemyIds.add(otherE.id);

                  const actualSplash = instaKillRef.current ? Math.max(otherE.hp + 10, 999999) : splashDmg;
                  otherE.hp -= actualSplash;
                  otherE.lastHitBy = proj.weaponId;
                  otherE.hitFlashTimer = 0.1;
                  if (proj.burnDuration) {
                    otherE.burnDuration = proj.burnDuration;
                    otherE.burnTickTimer = 0.05;
                    otherE.burnDamagePerTick = proj.burnDamagePerTick || Math.max(1, Math.round((proj.damage || actualSplash) * 0.10));
                  }

                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: otherE.x + (Math.random() - 0.5) * 10,
                    y: otherE.y - 10,
                    text: `${Math.round(actualSplash)}`,
                    color: '#f97316',
                    life: 0,
                    maxLife: 0.65,
                    vy: -40,
                  });

                  const kbAng = Math.atan2(otherE.y - expY, otherE.x - expX);
                  otherE.x += Math.cos(kbAng) * (18 * p.knockbackMult);
                  otherE.y += Math.sin(kbAng) * (18 * p.knockbackMult);
                }
              }

              // Boss caught in splash
              if (isBossFightRef.current && bossInstanceRef.current && !proj.hitBoss && !bossInstanceRef.current.isInvincible) {
                const b = bossInstanceRef.current;
                const bdist = Math.hypot(b.x - expX, b.y - expY);
                if (bdist <= expRadius + (b.radius || 40)) {
                  proj.hitBoss = true;
                  const actualSplash = instaKillRef.current ? Math.max(b.hp + 10, 999999) : splashDmg;
                  b.hp -= actualSplash;
                  b.lastHitBy = proj.weaponId;
                  bossHitFlashRef.current = 0.12;
                  if (proj.burnDuration) {
                    b.burnDuration = proj.burnDuration;
                    b.burnTickTimer = 0.05;
                    b.burnDamagePerTick = proj.burnDamagePerTick || Math.max(1, Math.round((proj.damage || actualSplash) * 0.10));
                  }

                  floatingTextsRef.current.push({
                    id: nextEntityId.current++,
                    x: b.x + (Math.random() - 0.5) * 20,
                    y: b.y - 20,
                    text: `${Math.round(actualSplash)}`,
                    color: '#f97316',
                    life: 0,
                    maxLife: 0.65,
                    vy: -40,
                  });
                }
              }

              projectilesRef.current.splice(i, 1);
              break;
            }

            // Pierce check
            proj.pierce -= 1;
            if (proj.pierce <= 0) {
              projectilesRef.current.splice(i, 1);
              break;
            } else if (proj.weaponId === 'spectral_arrow' && (proj.weaponLevel ?? 1) >= 3) {
              // Spectral Arrow Homing logic (Rank 3+): After hitting enemy, homes into closest remaining enemy
              const target = [...enemiesRef.current]
                .filter(e => e.hp > 0 && e.id !== enemy.id && !proj.hitEnemyIds?.has(e.id))
                .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))[0];

              if (target) {
                const spd = Math.hypot(proj.vx, proj.vy) || 800;
                const nextAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
                proj.vx = Math.cos(nextAngle) * spd;
                proj.vy = Math.sin(nextAngle) * spd;
                proj.x = enemy.x;
                proj.y = enemy.y;
                proj.homingTargetId = target.id;
              }
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
            if (isAoEHit && !boss.isInvincible) {
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
          if (isPulseHit && !boss.isInvincible) {
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

      // Update Astral Slashes
      for (let i = astralSlashesRef.current.length - 1; i >= 0; i--) {
        const slash = astralSlashesRef.current[i];
        slash.duration += dt;
        slash.x = p.x;
        slash.y = p.y;
        if (slash.duration >= slash.maxDuration) {
          astralSlashesRef.current.splice(i, 1);
        }
      }

      // Update Rock Thrower Projectiles
      for (let i = rockProjectilesRef.current.length - 1; i >= 0; i--) {
        const rock = rockProjectilesRef.current[i];
        rock.x += rock.vx * dt;
        rock.y += rock.vy * dt;
        rock.life += dt;

        // Player hit check
        const distToP = Math.hypot(p.x - rock.x, p.y - rock.y);
        if (distToP <= p.radius + rock.radius) {
          if (!p.isDashing && playerInvincibleTimerRef.current <= 0) {
            const rockDmg = invincibilityRef.current ? 0 : Math.max(1, Math.round(rock.damage * (1 - (p.damageReduction || 0))));
            p.hp = Math.max(0, p.hp - rockDmg);
            lastReportedHpRef.current = p.hp;
            onUpdatePlayer({ hp: p.hp });
            soundEngine.playPlayerHurt();

            if (screenShakeEnabledRef.current) {
              screenShakeRef.current = 6;
            }

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: p.x + (Math.random() - 0.5) * 16,
              y: p.y - 18,
              text: `-${rockDmg}`,
              color: rock.isPellet ? '#06b6d4' : '#d97706',
              life: 0,
              maxLife: 0.75,
              vy: -40,
            });

            if (p.hp <= 0) {
              p.hp = 0;
              lastReportedHpRef.current = 0;
              onUpdatePlayer({ hp: 0 });
              onGameOver({
                time: survivalTimeRef.current,
                level: p.level,
                kills: killsCountRef.current,
                bossesKilled: bossesKilledRef.current,
                killerName: rock.isPellet ? (getLanguage() === 'en' ? 'Bunnary' : 'c0e1ho') : 'Rock Thrower',
              });
              return;
            }
          }
          rockProjectilesRef.current.splice(i, 1);
          continue;
        }

        if (rock.life >= rock.maxLife) {
          rockProjectilesRef.current.splice(i, 1);
        }
      }

      // Update Enemies & Check Player Hurt
      const medusaItem = statItemsRef.current.find((s) => s.id === 'medusas_eye');
      const medusaRadius = medusaItem ? 26 + medusaItem.level * 6 : 0;
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

        if (enemy.frozenTimer && enemy.frozenTimer > 0) {
          enemy.frozenTimer -= dt;
        }

        // Burn status effect: constant damage for 5 seconds with ember particles
        if (enemy.burnDuration && enemy.burnDuration > 0) {
          enemy.burnDuration -= dt;
          enemy.burnTickTimer = (enemy.burnTickTimer || 0) - dt;
          if (enemy.burnTickTimer <= 0) {
            enemy.burnTickTimer = 0.5; // Tick twice per second for 5s (10 ticks)
            const tickDmg = enemy.burnDamagePerTick || 1;
            const actualTickDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : tickDmg;
            enemy.hp -= actualTickDmg;
            enemy.lastHitBy = 'seeking_wisp';
            enemy.hitFlashTimer = 0.08;

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: enemy.x + (Math.random() - 0.5) * 8,
              y: enemy.y - 12,
              text: `${Math.round(actualTickDmg)}`,
              color: '#ef4444',
              life: 0,
              maxLife: 0.55,
              vy: -35,
            });

            if (particlesRef.current.length < 200) {
              particlesRef.current.push({
                x: enemy.x + (Math.random() - 0.5) * (enemy.radius * 0.8),
                y: enemy.y + (Math.random() - 0.5) * (enemy.radius * 0.8),
                vx: (Math.random() - 0.5) * 15,
                vy: -25 - Math.random() * 25,
                size: 2.5,
                color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
                alpha: 0.9,
                decay: 3.5,
              });
            }
          }
        }

        // Acid status effect: 1 hit per second with toxic green particles
        if (enemy.acidDuration && enemy.acidDuration > 0) {
          enemy.acidDuration -= dt;
          enemy.acidTickTimer = (enemy.acidTickTimer || 0) - dt;
          if (enemy.acidTickTimer <= 0) {
            enemy.acidTickTimer = 1.0; // Tick once per second for Acid
            const tickDmg = enemy.acidDamagePerTick || 1;
            const actualTickDmg = instaKillRef.current ? Math.max(enemy.hp + 10, 999999) : tickDmg;
            enemy.hp -= actualTickDmg;
            enemy.lastHitBy = 'brimstone_shotgun';
            enemy.hitFlashTimer = 0.08;

            floatingTextsRef.current.push({
              id: nextEntityId.current++,
              x: enemy.x + (Math.random() - 0.5) * 8,
              y: enemy.y - 12,
              text: `${Math.round(actualTickDmg)}`,
              color: '#22c55e',
              life: 0,
              maxLife: 0.55,
              vy: -35,
            });

            if (particlesRef.current.length < 200) {
              particlesRef.current.push({
                x: enemy.x + (Math.random() - 0.5) * (enemy.radius * 0.8),
                y: enemy.y + (Math.random() - 0.5) * (enemy.radius * 0.8),
                vx: (Math.random() - 0.5) * 12,
                vy: -Math.random() * 20 - 5,
                size: Math.random() * 3 + 2,
                color: '#22c55e',
                alpha: 0.8,
                decay: 2.5,
              });
            }
          }
        }

        // Rock Thrower & Bunnary AI & Attack logic
        if ((enemy.type === 'ROCK_THROWER' || enemy.type === 'BUNNARY') && (!enemy.vineRootedDuration || enemy.vineRootedDuration <= 0) && (!enemy.frozenTimer || enemy.frozenTimer <= 0)) {
          if (enemy.rockTelegraphTimer && enemy.rockTelegraphTimer > 0) {
            enemy.rockTelegraphTimer -= dt;
            enemy.targetAngle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
            if (enemy.rockTelegraphTimer <= 0) {
              const throwAngle = enemy.targetAngle;
              const rockSpeed = 380;
              rockProjectilesRef.current.push({
                id: nextEntityId.current++,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(throwAngle) * rockSpeed,
                vy: Math.sin(throwAngle) * rockSpeed,
                damage: enemy.damage || 20,
                radius: 6,
                life: 0,
                maxLife: 4.0,
                isPellet: enemy.type === 'BUNNARY',
              });
              soundEngine.playShoot('wisp');
              enemy.rockThrowTimer = 4.5 + Math.random() * 1.5;
              enemy.rockTelegraphTimer = undefined;
            }
          } else {
            enemy.rockThrowTimer = (enemy.rockThrowTimer !== undefined ? enemy.rockThrowTimer : 4.0) - dt;
            if (enemy.rockThrowTimer <= 0) {
              enemy.rockTelegraphTimer = 1.0;
              enemy.targetAngle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
            }
          }
        }

        // Bunnary binary sprite cycling
        if (enemy.type === 'BUNNARY') {
          const msgIdx = enemy.bunnaryMsgIndex ?? 0;
          const currentMsg = BUNNARY_MESSAGES[msgIdx % BUNNARY_MESSAGES.length];
          enemy.bunnarySymbolTimer = (enemy.bunnarySymbolTimer ?? 0.32) - dt;
          if (enemy.bunnarySymbolTimer <= 0) {
            if (enemy.bunnaryInGap) {
              // Quick blank flicker between numbers finished; now show the next character
              enemy.bunnaryInGap = false;
              const nextCharIdx = (enemy.bunnaryCharIndex ?? -1) + 1;
              if (nextCharIdx >= currentMsg.length) {
                // Loop to next message, signaling start of new message with End Sentence sprite
                enemy.bunnaryMsgIndex = (msgIdx + 1) % BUNNARY_MESSAGES.length;
                enemy.bunnaryCharIndex = -1;
                enemy.bunnarySymbolTimer = 0.6; // End Sentence marker duration
              } else {
                enemy.bunnaryCharIndex = nextCharIdx;
                enemy.bunnarySymbolTimer = 0.32; // Normal character duration
              }
            } else {
              // Just finished displaying current character or End Sentence marker
              const charIdx = enemy.bunnaryCharIndex ?? -1;
              if (charIdx === -1) {
                // Finished End Sentence marker, start first character
                enemy.bunnaryCharIndex = 0;
                enemy.bunnarySymbolTimer = 0.32;
              } else {
                const ch = currentMsg[charIdx];
                if (ch === '0' || ch === '1') {
                  // After any number, quickly flash blank (~0.08s) so repeated digits are clearly distinguishable
                  enemy.bunnaryInGap = true;
                  enemy.bunnarySymbolTimer = 0.08;
                } else {
                  // It was a space, move straight to next character
                  const nextCharIdx = charIdx + 1;
                  if (nextCharIdx >= currentMsg.length) {
                    enemy.bunnaryMsgIndex = (msgIdx + 1) % BUNNARY_MESSAGES.length;
                    enemy.bunnaryCharIndex = -1;
                    enemy.bunnarySymbolTimer = 0.6;
                  } else {
                    enemy.bunnaryCharIndex = nextCharIdx;
                    enemy.bunnarySymbolTimer = 0.32;
                  }
                }
              }
            }
          }
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

        // Thunderstorm Slow aura check (10% slow within 140px of player)
        const thunderstormWp = weaponsRef.current.find((w) => w.id === 'thunderstrike' && w.level >= 7);
        const distToPlayer = Math.hypot(enemy.x - p.x, enemy.y - p.y);
        const isThunderstormSlowed = Boolean(thunderstormWp && distToPlayer <= 140);

        let speedMult = 1.0;
        if (isMedusaSlowed) speedMult *= medusaSlowMult;
        if (isThunderstormSlowed) speedMult *= 0.90;

        const currentEnemySpeed = enemy.speed * speedMult;

        // Advance towards player if not in initial heavy knockback stun and not vine rooted or frozen
        if (edist > 0 && (!enemy.attackCooldown || enemy.attackCooldown < 0.6) && (!enemy.vineRootedDuration || enemy.vineRootedDuration <= 0) && (!enemy.frozenTimer || enemy.frozenTimer <= 0)) {
          if (enemy.type === 'ROCK_THROWER' || enemy.type === 'BUNNARY') {
            const isTelegraphing = enemy.rockTelegraphTimer && enemy.rockTelegraphTimer > 0;
            if (!isTelegraphing) {
              const targetDist = enemy.targetDistance || 230;
              if (edist > targetDist + 15) {
                enemy.x += (edx / edist) * currentEnemySpeed * dt;
                enemy.y += (edy / edist) * currentEnemySpeed * dt;
              } else if (edist < targetDist - 15) {
                enemy.x -= (edx / edist) * currentEnemySpeed * 0.75 * dt;
                enemy.y -= (edy / edist) * currentEnemySpeed * 0.75 * dt;
              }
            }
          } else {
            enemy.x += (edx / edist) * currentEnemySpeed * dt;
            enemy.y += (edy / edist) * currentEnemySpeed * dt;
          }
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
          if (!p.isDashing && playerInvincibleTimerRef.current <= 0 && (!enemy.attackCooldown || enemy.attackCooldown <= 0)) {
            const dmgDealt = invincibilityRef.current ? 0 : Math.max(1, Math.round(enemy.damage * (1 - (p.damageReduction || 0))));
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

            // Mini Eye self-destructs / dies immediately upon touching and damaging the player
            if (enemy.type === 'MINI_EYE') {
              enemy.hp = 0;
            } else {
              // Knockback the enemy away from the player
              const angle = edist > 0.001 ? Math.atan2(enemy.y - p.y, enemy.x - p.x) : Math.random() * Math.PI * 2;
              const pushDist = 70;
              enemy.x = p.x + Math.cos(angle) * (p.radius + enemy.radius + pushDist);
              enemy.y = p.y + Math.sin(angle) * (p.radius + enemy.radius + pushDist);
              enemy.vx = Math.cos(angle) * 450;
              enemy.vy = Math.sin(angle) * 450;
              enemy.attackCooldown = 0.85; // Recovers and cannot damage again until cooldown resets
            }

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
              enemy.type === 'UNOCONDA' || enemy.name === 'Unoconda' ? 'unoconda' :
              enemy.type === 'VIIIPER' || enemy.name === 'VIIIper' ? 'viiiper' :
              enemy.type === 'BUNNARY' || enemy.name === 'Bunnary' ? 'bunnary' :
              enemy.type === 'BAT' ? 'bat' :
              enemy.type === 'GHOUL' ? 'ghoul' :
              enemy.type === 'OBMOOSE' ? 'obmoose' :
              enemy.type === 'MINI_EYE' ? 'mini_eye' :
              enemy.type === 'ROCK_THROWER' ? 'rock_thrower' : 'wraith'
            );
          }

          // Death burst particles (suppressed for Astral Blade)
          if (enemy.lastHitBy !== 'astral_sword') {
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
          }

          // Mini Eye has no drops
          if (enemy.type === 'MINI_EYE') {
            enemiesRef.current.splice(i, 1);
            continue;
          }

          // Enemy Drops (Disabled in Boss Rush mode)
          if (!isBossRush) {
            const isEliteEnemy = enemy.isRed || enemy.name === 'Village Knight' || enemy.name === 'ObMoose' || enemy.type === 'OBMOOSE';
            const specialRoll = Math.random();

            const pushExpDrop = (fallbackValue: number, fallbackColor: string, fallbackRadius: number) => {
              const chance = isEliteEnemy ? 0.10 : 0.01;
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
              if (isEliteEnemy) {
                pushExpDrop(10, '#ef4444', 7);
              } else {
                pushExpDrop(enemy.exp, '#38bdf8', 5);
              }
            } else if (specialRoll < 0.10) {
              // Other Special Drops (remaining ~9% chance)
              if (isEliteEnemy) {
                // Elite Enemy (Village Knight / ObMoose): higher-level orb doesn't apply; drops Food (half of enemy damage rounded to 0 or 5) + standard Red Orb (10 EXP)
                pickupsRef.current.push({
                  id: nextEntityId.current++,
                  type: 'FOOD',
                  x: enemy.x,
                  y: enemy.y,
                  healAmount: calculateFoodHealAmount(enemy.damage),
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
                    healAmount: calculateFoodHealAmount(enemy.damage),
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
              if (isEliteEnemy) {
                pushExpDrop(10, '#ef4444', 7);
              } else {
                // Normal cyan diamond EXP gem
                pushExpDrop(enemy.exp, '#38bdf8', 5);
              }
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
            const heal = pickup.healAmount !== undefined ? pickup.healAmount : calculateFoodHealAmount(10);
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
      {
        const magnetRadius = p.magnetRadius;

        // Attract world pickups (Food & Magnets) towards player
        for (const pickup of pickupsRef.current) {
          const pdist = Math.hypot(p.x - pickup.x, p.y - pickup.y);
          if (pdist <= magnetRadius) {
            const pullSpeed = 420;
            pickup.x += ((p.x - pickup.x) / pdist) * pullSpeed * dt;
            pickup.y += ((p.y - pickup.y) / pdist) * pullSpeed * dt;
          }
        }

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
      ctx.save();
      // Base background fill so there are no transparent gaps
      ctx.fillStyle = '#140c24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tileSize = 80;

      // In Boss Rush and Singular Fight, dynamic floor tiles always match the map the Boss is originally fought in
      let activeFloorMap = selectedMapRef.current;
      if (isBossRush) {
        const currentBossId = bossInstanceRef.current?.id || (bossRushIndexRef.current < bossRushQueueRef.current.length ? bossRushQueueRef.current[bossRushIndexRef.current] : null);
        if (currentBossId) {
          activeFloorMap = getBossHomeMap(currentBossId);
        }
      }

      if (activeFloorMap === 'black_honey_forest') {
        const honeyImg = blackHoneyTileImageRef.current;
        let patternDrawn = false;
        if (honeyImg && honeyImg.complete && honeyImg.naturalWidth > 0) {
          try {
            if (!blackHoneyPatternRef.current || blackHoneyPatternImgRef.current !== honeyImg) {
              blackHoneyPatternRef.current = ctx.createPattern(honeyImg, 'repeat');
              blackHoneyPatternImgRef.current = honeyImg;
            }
            const pattern = blackHoneyPatternRef.current;
            if (pattern && typeof (pattern as any).setTransform === 'function') {
              const matrix = new DOMMatrix();
              matrix.translateSelf(-cameraX, -cameraY);
              const scale = 120 / honeyImg.naturalWidth;
              matrix.scaleSelf(scale, scale);
              (pattern as any).setTransform(matrix);
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              patternDrawn = true;
            }
          } catch {
            patternDrawn = false;
          }

          if (!patternDrawn) {
            const bTileSize = 120;
            const startCol = Math.floor(cameraX / bTileSize) - 1;
            const endCol = startCol + Math.ceil(canvas.width / bTileSize) + 2;
            const startRow = Math.floor(cameraY / bTileSize) - 1;
            const endRow = startRow + Math.ceil(canvas.height / bTileSize) + 2;

            for (let col = startCol; col <= endCol; col++) {
              for (let row = startRow; row <= endRow; row++) {
                const screenX = Math.floor(col * bTileSize - cameraX);
                const screenY = Math.floor(row * bTileSize - cameraY);
                ctx.drawImage(honeyImg, screenX, screenY, bTileSize + 1, bTileSize + 1);
              }
            }
          }
        } else {
          ctx.fillStyle = '#1c120c';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (activeFloorMap === 'mathematical_realm') {
        const mathTileSize = 160;
        const startCol = Math.floor(cameraX / mathTileSize) - 1;
        const endCol = startCol + Math.ceil(canvas.width / mathTileSize) + 2;
        const startRow = Math.floor(cameraY / mathTileSize) - 1;
        const endRow = startRow + Math.ceil(canvas.height / mathTileSize) + 2;

        for (let col = startCol; col <= endCol; col++) {
          for (let row = startRow; row <= endRow; row++) {
            const screenX = Math.floor(col * mathTileSize - cameraX);
            const screenY = Math.floor(row * mathTileSize - cameraY);
            
            // Deterministic check: only 15% of the tiles are special symbol tiles, most (85%) are blank
            const isSpecial = Math.abs((col * 73 + row * 89) % 100) < 15;
            let img = mathTileBlankRef.current;

            if (isSpecial) {
              const val = Math.abs((col * 17 + row * 31) % 4);
              if (val === 0 && mathTile1Ref.current) img = mathTile1Ref.current;
              else if (val === 1 && mathTile2Ref.current) img = mathTile2Ref.current;
              else if (val === 2 && mathTile3Ref.current) img = mathTile3Ref.current;
              else if (val === 3 && mathTile4Ref.current) img = mathTile4Ref.current;
            }
            
            if (img) {
              ctx.drawImage(img, screenX, screenY, mathTileSize + 1, mathTileSize + 1);
            } else {
              // Fallback if images aren't loaded yet
              const isAlt = (Math.abs(col) + Math.abs(row)) % 2 === 0;
              ctx.fillStyle = isAlt ? '#140c24' : '#11091f';
              ctx.fillRect(screenX, screenY, mathTileSize + 1, mathTileSize + 1);
            }
          }
        }
        // Darken the ground texture a bit for improved contrast and atmosphere
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const groundImg = groundTileImageRef.current;

        let patternDrawn = false;
        if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
          try {
            if (!groundPatternRef.current || groundPatternImgRef.current !== groundImg) {
              groundPatternRef.current = ctx.createPattern(groundImg, 'repeat');
              groundPatternImgRef.current = groundImg;
            }
            const pattern = groundPatternRef.current;
            if (pattern && typeof (pattern as any).setTransform === 'function') {
              const matrix = new DOMMatrix();
              matrix.translateSelf(-cameraX, -cameraY);
              (pattern as any).setTransform(matrix);
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              patternDrawn = true;
            }
          } catch {
            patternDrawn = false;
          }

          if (!patternDrawn) {
            const startCol = Math.floor(cameraX / tileSize) - 1;
            const endCol = startCol + Math.ceil(canvas.width / tileSize) + 2;
            const startRow = Math.floor(cameraY / tileSize) - 1;
            const endRow = startRow + Math.ceil(canvas.height / tileSize) + 2;

            for (let col = startCol; col <= endCol; col++) {
              for (let row = startRow; row <= endRow; row++) {
                const screenX = Math.floor(col * tileSize - cameraX);
                const screenY = Math.floor(row * tileSize - cameraY);
                // +1 pixel overlap prevents subpixel hairline seams on mobile high-DPI screens
                ctx.drawImage(groundImg, screenX, screenY, tileSize + 1, tileSize + 1);
              }
            }
          }

          // Darken the ground texture a bit for improved contrast and atmosphere
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          const startCol = Math.floor(cameraX / tileSize) - 1;
          const endCol = startCol + Math.ceil(canvas.width / tileSize) + 2;
          const startRow = Math.floor(cameraY / tileSize) - 1;
          const endRow = startRow + Math.ceil(canvas.height / tileSize) + 2;

          for (let col = startCol; col <= endCol; col++) {
            for (let row = startRow; row <= endRow; row++) {
              const screenX = Math.floor(col * tileSize - cameraX);
              const screenY = Math.floor(row * tileSize - cameraY);
              const isAlt = (Math.abs(col) + Math.abs(row)) % 2 === 0;
              ctx.fillStyle = isAlt ? '#140c24' : '#11091f';
              ctx.fillRect(screenX, screenY, tileSize + 1, tileSize + 1);
            }
          }
        }
      }
      ctx.restore();

      // Boss Rush Pause Countdown Banner Overlay
      if (isBossRush && !bossInstanceRef.current && bossRushPauseTimerRef.current > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 5, 20, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        if (!mobileModeRef.current) {
          ctx.shadowColor = '#9333ea';
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowBlur = 0;
        }
        const lang = getLanguage();
        const isSingular = bossRushQueueRef.current.length === 1;
        const modeTitle = isSingular
          ? (lang === 'en' ? 'SINGULAR FIGHT MODE' : 'MODO LUTA SINGULAR')
          : (lang === 'en' ? 'BOSS RUSH MODE' : 'MODO INVASÃO DE CHEFES');
        ctx.fillText(modeTitle, canvas.width / 2, canvas.height / 2 - 70);

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 24px sans-serif';
        if (!mobileModeRef.current) {
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        const currentQueueId = bossRushQueueRef.current[bossRushIndexRef.current];
        const bossDef = BOSS_POOL.find((b) => b.id === currentQueueId);
        const nextName = bossDef
          ? translateBossName(bossDef.id, bossDef.name, lang)
          : (currentQueueId || 'Boss');
        const nextLabel = lang === 'en' ? 'Next Challenger' : 'Próximo Desafiante';
        ctx.fillText(`${nextLabel}: ${nextName}`, canvas.width / 2, canvas.height / 2 - 20);

        if (currentQueueId) {
          const mapId = getBossHomeMap(currentQueueId);
          const mapDisplayName = translateMapName(mapId, lang);
          const arenaLabel = lang === 'en' ? 'Arena' : 'Arena';
          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 15px monospace';
          ctx.shadowBlur = 0;
          ctx.fillText(`(${arenaLabel}: ${mapDisplayName})`, canvas.width / 2, canvas.height / 2 + 10);
        }

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 52px monospace';
        if (!mobileModeRef.current) {
          ctx.shadowColor = '#d97706';
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillText(`${Math.ceil(bossRushPauseTimerRef.current)}s`, canvas.width / 2, canvas.height / 2 + 65);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 1d. Medusa's Eye Slow Zone indicator
      const medusaItemRender = statItemsRef.current.find((s) => s.id === 'medusas_eye');
      if (medusaItemRender) {
        const mouseScreenX = mouseScreenRef.current.x;
        const mouseScreenY = mouseScreenRef.current.y;
        const medusaRadius = 26 + medusaItemRender.level * 6;

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

      // 1e. Thunderstorm Slowness Aura indicator under player (blue ring)
      const thunderstormWpRender = weaponsRef.current.find((w) => w.id === 'thunderstrike' && w.level >= 7);
      if (thunderstormWpRender) {
        const playerScreenX = p.x - cameraX;
        const playerScreenY = p.y - cameraY;
        const thunderstormRadius = 140;

        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)'; // glowing electric blue
        ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'; // light blue tint fill
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);

        // Ring at exact effect radius
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, thunderstormRadius, 0, Math.PI * 2);
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
        const pulse = 0.65 + 0.35 * Math.sin(survivalTimeRef.current * 4);

        // Outer glow stroke (GPU accelerated, no CPU shadowBlur)
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.28 * pulse})`;
        ctx.lineWidth = 14;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

        // Main pulsing barrier border
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.85 * pulse})`;
        ctx.lineWidth = 5;
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

        // 4. In-game Pentagram sprite inside the pulse
        const pentagramImg = pentagramImageRef.current;
        if (pentagramImg && pentagramImg.complete && pentagramImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 16 * alpha;
          ctx.imageSmoothingEnabled = false;
          const imgSize = pulse.currentRadius * 1.5;
          ctx.drawImage(pentagramImg, sx - imgSize / 2, sy - imgSize / 2, imgSize, imgSize);
          ctx.restore();
        } else {
          const starRadius = pulse.currentRadius * 0.55;
          const starStartAngle = -Math.PI / 2;
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
        }

        ctx.restore();
      });

      // 2b-2. Render Astral Blade Slashes (expanding cone area swing towards cursor)
      astralSlashesRef.current.forEach((slash) => {
        const sx = slash.x - cameraX;
        const sy = slash.y - cameraY;
        const progress = Math.min(1, slash.duration / slash.maxDuration);
        const alpha = Math.max(0, 1 - progress);
        const easeProgress = 1 - Math.pow(1 - progress, 2);

        // Cone swing centered on slash.angle (towards cursor)
        const halfArc = slash.halfArc ?? Math.PI / 4;
        const startAngle = slash.angle - halfArc;
        const endAngle = slash.angle + halfArc;
        const currentAngle = startAngle + (endAngle - startAngle) * easeProgress;

        ctx.save();

        // 1. Ethereal Astral cleave sector zone
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.arc(sx, sy, slash.range, startAngle, endAngle);
        ctx.closePath();
        const sectorGrad = ctx.createRadialGradient(sx, sy, 5, sx, sy, slash.range);
        sectorGrad.addColorStop(0, `rgba(168, 85, 247, ${0.30 * alpha})`);
        sectorGrad.addColorStop(0.65, `rgba(147, 51, 234, ${0.14 * alpha})`);
        sectorGrad.addColorStop(1, `rgba(168, 85, 247, 0)`);
        ctx.fillStyle = sectorGrad;
        ctx.fill();

        // 2. Outer crescent sweep trail
        const trailEnd = currentAngle;
        ctx.beginPath();
        ctx.arc(sx, sy, slash.range, startAngle, trailEnd);
        ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.9})`;
        ctx.lineWidth = Math.max(1.5, 4.5 * (1 - progress * 0.4));
        ctx.stroke();

        // Luminous inner crescent blade edge
        ctx.beginPath();
        ctx.arc(sx, sy, slash.range * 0.96, Math.max(startAngle, currentAngle - 0.45), trailEnd);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. The Astral Blade itself swinging along currentAngle
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(currentAngle);

        const bladeLen = slash.range;
        const hiltDist = 8;

        if (astralBladeImageRef.current && (astralBladeImageRef.current.complete || astralBladeImageRef.current.naturalWidth > 0)) {
          ctx.save();
          ctx.globalAlpha = alpha;

          const swordLength = bladeLen - hiltDist;
          const scale = swordLength / 96;
          const swordWidth = 96 * scale;

          ctx.translate(hiltDist, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(
            astralBladeImageRef.current,
            -swordWidth / 2,
            -swordLength,
            swordWidth,
            swordLength
          );
          ctx.restore();

          // Tip astral star sparkle
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(bladeLen, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const guardW = 9;
          const bladeW = 7;

          // Glowing sword blade body
          ctx.beginPath();
          ctx.moveTo(hiltDist, 0);
          ctx.lineTo(hiltDist + 14, -bladeW);
          ctx.lineTo(bladeLen - 12, -bladeW * 0.65);
          ctx.lineTo(bladeLen, 0); // blade tip
          ctx.lineTo(bladeLen - 12, bladeW * 0.65);
          ctx.lineTo(hiltDist + 14, bladeW);
          ctx.closePath();

          const bladeGrad = ctx.createLinearGradient(hiltDist, 0, bladeLen, 0);
          bladeGrad.addColorStop(0, `rgba(126, 34, 206, ${alpha * 0.9})`);
          bladeGrad.addColorStop(0.45, `rgba(192, 132, 252, ${alpha * 0.95})`);
          bladeGrad.addColorStop(1, `rgba(250, 245, 255, ${alpha})`);
          ctx.fillStyle = bladeGrad;
          ctx.fill();

          // White-hot central sword spine / fuller
          ctx.beginPath();
          ctx.moveTo(hiltDist + 6, 0);
          ctx.lineTo(bladeLen - 4, 0);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Astral Crossguard
          ctx.beginPath();
          ctx.moveTo(hiltDist, -guardW);
          ctx.lineTo(hiltDist + 4, 0);
          ctx.lineTo(hiltDist, guardW);
          ctx.strokeStyle = `rgba(233, 213, 255, ${alpha * 0.9})`;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Tip astral star sparkle
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(bladeLen, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        ctx.restore();
      });

      // 2b-3. Render Mega Evolution Astral Transformation Blade
      const megaAstralWeaponRender = weaponsRef.current.find((w) => w.id === 'astral_sword' && w.level >= 7);
      if (megaAstralWeaponRender) {
        const blade = megaAstralBladeRef.current;
        if (blade.x !== 0 || blade.y !== 0) {
          const sx = blade.x - cameraX;
          const sy = blade.y - cameraY;
          const isFast = blade.speed >= 500;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(blade.angle);

          // Glowing aura around transformed blade
          ctx.shadowColor = isFast ? '#38bdf8' : '#a855f7';
          ctx.shadowBlur = isFast ? 32 : 16;

          // If fast enough, draw energetic wind ring / sweep arc around blade
          if (isFast) {
            ctx.beginPath();
            ctx.arc(0, 0, 65, -Math.PI / 2.8, Math.PI / 2.8);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 62, -Math.PI / 3.2, Math.PI / 3.2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.lineWidth = 3;
            ctx.stroke();
          }

          if (astralBladeImageRef.current && (astralBladeImageRef.current.complete || astralBladeImageRef.current.naturalWidth > 0)) {
            const swordLength = 110;
            const scale = swordLength / 96;
            const swordWidth = 96 * scale;

            ctx.save();
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(
              astralBladeImageRef.current,
              -swordWidth / 2,
              -swordLength / 2,
              swordWidth,
              swordLength
            );
            ctx.restore();
          } else {
            // Drawn sword fallback
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 2c. Render Boss Hazard Attacks (Carnivore Plant AOE, Vines, NightBear Bite)
      if (isBossFightRef.current && bossInstanceRef.current) {
        // Render NightBear Destination Circle Telegraph during BITE_REPOSITION
        if (bossInstanceRef.current.id === 'night_bear' && nightBearStateRef.current === 'BITE_REPOSITION') {
          const targetX = nightBearRepositionTargetRef.current.x;
          const targetY = nightBearRepositionTargetRef.current.y;
          const tsx = targetX - cameraX;
          const tsy = targetY - cameraY;
          const targetRadius = bossInstanceRef.current.radius * 1.25;

          ctx.save();
          const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);

          // Pulsing red danger area fill
          ctx.fillStyle = `rgba(239, 68, 68, ${0.18 + 0.16 * pulse})`;
          ctx.beginPath();
          ctx.arc(tsx, tsy, targetRadius, 0, Math.PI * 2);
          ctx.fill();

          // Animated dashed red circle
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3.5;
          const dashOffset = (performance.now() * 0.04) % 24;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -dashOffset;
          ctx.beginPath();
          ctx.arc(tsx, tsy, targetRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Target reticle lines
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tsx - targetRadius - 10, tsy);
          ctx.lineTo(tsx + targetRadius + 10, tsy);
          ctx.moveTo(tsx, tsy - targetRadius - 10);
          ctx.lineTo(tsx, tsy + targetRadius + 10);
          ctx.stroke();

          // Inner glowing red bullseye
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(tsx, tsy, 6, 0, Math.PI * 2);
          ctx.fill();

          // Label above circle
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#fee2e2';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ DESTINATION', tsx, tsy - targetRadius - 10);
          ctx.restore();
        }

        bossInstanceRef.current.attacks.forEach((atk) => {
          const sx = atk.x - cameraX;
          const sy = atk.y - cameraY;

          ctx.save();
          if (atk.type === 'CARNIVORE_PLANT_VINES') {
            if (atk.warningTimer > 0) {
              const chargeProgress = Math.max(0, Math.min(1, 1 - atk.warningTimer / 1.5));

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

            // Outer tear glowing aura without CPU-heavy shadowBlur
            ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
            ctx.beginPath();
            ctx.arc(0, 0, atk.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

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
          } else if (atk.type === 'NIGHT_BEAR_BITE') {
            if (atk.warningTimer > 0) {
              // 1s telegraph: Red circle showing where NightBear will bite
              const progress = Math.max(0, Math.min(1, 1 - atk.warningTimer / 1.0));
              const r = atk.radius;

              // Outer pulsing hazard circle
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2.5 + 1.5 * progress;
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();

              // Pulsing translucent red danger fill
              ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + 0.25 * progress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.fill();

              // Expanding red core disk tracking 1s fuse
              ctx.fillStyle = `rgba(220, 38, 38, ${0.35 + 0.35 * progress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r * progress, 0, Math.PI * 2);
              ctx.fill();

              // Dashed danger ring
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = 1.5;
              ctx.setLineDash([6, 4]);
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);

              // Warning fangs silhouette in center
              ctx.save();
              ctx.translate(sx, sy);
              const fangGap = (1 - progress) * 10 + 4;
              ctx.fillStyle = '#fee2e2';
              // Upper fangs pointing down
              ctx.beginPath();
              ctx.moveTo(-10, -fangGap - 6);
              ctx.lineTo(10, -fangGap - 6);
              ctx.lineTo(6, -fangGap);
              ctx.lineTo(2, -fangGap - 4);
              ctx.lineTo(-2, -fangGap);
              ctx.lineTo(-6, -fangGap - 4);
              ctx.closePath();
              ctx.fill();
              // Lower fangs pointing up
              ctx.beginPath();
              ctx.moveTo(-10, fangGap + 6);
              ctx.lineTo(10, fangGap + 6);
              ctx.lineTo(6, fangGap);
              ctx.lineTo(2, fangGap + 4);
              ctx.lineTo(-2, fangGap);
              ctx.lineTo(-6, fangGap + 4);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            } else if (atk.activeTimer > 0) {
              // The actual Bite: Snapping vicious jaws shut!
              const snapNorm = Math.min(1, (0.35 - atk.activeTimer) / 0.12);
              const r = atk.radius;

              // Dark crimson blood impact flash
              ctx.fillStyle = `rgba(185, 28, 28, ${0.45 * (atk.activeTimer / 0.35)})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r * 1.15, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#dc2626';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();

              // Clamping razor bear jaws
              ctx.save();
              ctx.translate(sx, sy);
              const clampOffset = (1 - snapNorm) * 16;

              // Upper dark jaw
              ctx.fillStyle = '#1c1917';
              ctx.strokeStyle = '#b91c1c';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, -clampOffset, r * 0.85, Math.PI, 0, false);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Upper razor teeth
              ctx.fillStyle = '#f8fafc';
              const teethCount = 5;
              for (let i = 0; i < teethCount; i++) {
                const tx = -r * 0.6 + i * (r * 1.2 / (teethCount - 1));
                ctx.beginPath();
                ctx.moveTo(tx - 4, -clampOffset);
                ctx.lineTo(tx + 4, -clampOffset);
                ctx.lineTo(tx, -clampOffset + 10);
                ctx.closePath();
                ctx.fill();
              }

              // Lower dark jaw
              ctx.fillStyle = '#1c1917';
              ctx.beginPath();
              ctx.arc(0, clampOffset, r * 0.85, 0, Math.PI, false);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Lower razor teeth
              ctx.fillStyle = '#f8fafc';
              for (let i = 0; i < teethCount; i++) {
                const tx = -r * 0.6 + i * (r * 1.2 / (teethCount - 1));
                ctx.beginPath();
                ctx.moveTo(tx - 4, clampOffset);
                ctx.lineTo(tx + 4, clampOffset);
                ctx.lineTo(tx, clampOffset - 10);
                ctx.closePath();
                ctx.fill();
              }

              // Vicious slash claw lines across the bite
              ctx.strokeStyle = '#f87171';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(-r * 0.7, -r * 0.5);
              ctx.lineTo(r * 0.7, r * 0.5);
              ctx.moveTo(-r * 0.5, -r * 0.7);
              ctx.lineTo(r * 0.5, r * 0.7);
              ctx.stroke();

              ctx.restore();
            }
          } else if (atk.type === 'ARCHMAGES_FIREBALL') {
            const r = atk.radius;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 16;

            ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.35, 0, Math.PI * 2);
            ctx.fill();

            const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#facc15');
            grad.addColorStop(0.7, '#f97316');
            grad.addColorStop(1, '#ef4444');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (atk.type === 'ARCHMAGES_RAINBOW_FIREBALL') {
            const r = atk.radius;
            const hue = (survivalTimeRef.current * 240 + atk.x) % 360;
            ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
            ctx.shadowBlur = 18;

            ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.4)`;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.4, 0, Math.PI * 2);
            ctx.fill();

            const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, `hsl(${(hue + 60) % 360}, 100%, 70%)`);
            grad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (atk.type === 'ARCHMAGES_VINE_TILE_ATTACK') {
            const w = atk.width || (atk.radius * 2);
            const h = atk.height || (atk.radius * 2);
            const left = sx - w / 2;
            const top = sy - h / 2;

            if (atk.warningTimer > 0) {
              const progress = Math.max(0, Math.min(1, 1 - (atk.warningTimer / 1.0)));
              ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + 0.3 * Math.sin(survivalTimeRef.current * 16)})`;
              ctx.fillRect(left, top, w, h);

              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3;
              ctx.strokeRect(left, top, w, h);

              ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
              ctx.fillRect(left, top + h * (1 - progress), w, h * progress);

              ctx.strokeStyle = 'rgba(254, 202, 202, 0.6)';
              ctx.lineWidth = 2;
              ctx.setLineDash([8, 8]);
              ctx.strokeRect(left + 2, top + 2, w - 4, h - 4);
              ctx.setLineDash([]);
            } else if (atk.activeTimer > 0) {
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(left, top, w, h);

              ctx.strokeStyle = '#fee2e2';
              ctx.lineWidth = 3.5;
              ctx.strokeRect(left, top, w, h);

              ctx.fillStyle = '#7f1d1d';
              const thornCount = Math.floor(Math.max(w, h) / 16);
              for (let i = 0; i < thornCount; i++) {
                const tx = left + (i / thornCount) * w + 8;
                const ty = top + h / 2;
                ctx.beginPath();
                ctx.moveTo(tx - 6, ty + 12);
                ctx.lineTo(tx + 6, ty + 12);
                ctx.lineTo(tx, ty - 12);
                ctx.closePath();
                ctx.fill();
              }
            }
          } else if (atk.type === 'ARCHMAGES_THUNDER_STRIKE') {
            const r = atk.radius;
            if (atk.warningTimer > 0) {
              const progress = Math.max(0, Math.min(1, 1 - (atk.warningTimer / 1.0)));
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();

              ctx.fillStyle = `rgba(56, 189, 248, ${0.2 + 0.3 * progress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r * progress, 0, Math.PI * 2);
              ctx.fill();
            } else if (atk.activeTimer > 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.beginPath();
              ctx.arc(sx, sy, r * 1.2, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(sx, 0);
              ctx.lineTo(sx - 15, sy * 0.4);
              ctx.lineTo(sx + 15, sy * 0.7);
              ctx.lineTo(sx, sy);
              ctx.stroke();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
          } else if (atk.type === 'PHIBOCCION_LAND_PHINE') {
            const r = atk.radius;
            const isBlinking = Math.floor(survivalTimeRef.current * 4) % 2 === 0;

            // Draw telegraph/warning circle around landmine
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.35, 0, Math.PI * 2);
            ctx.fill();

            // Swap between regular and blinking image
            const mineImg = isBlinking
              ? (landPhineBlinkingImageRef.current || landPhineImageRef.current)
              : (landPhineImageRef.current || landPhineBlinkingImageRef.current);

            if (mineImg && mineImg.complete && mineImg.naturalWidth > 0) {
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(mineImg, sx - r, sy - r, r * 2, r * 2);
              ctx.restore();
            } else {
              // Mathematical Golden Ratio styled fallback mine
              ctx.save();
              ctx.translate(sx, sy);
              ctx.fillStyle = isBlinking ? '#f59e0b' : '#d97706';
              ctx.beginPath();
              ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
              ctx.stroke();

              ctx.fillStyle = '#fee2e2';
              ctx.beginPath();
              ctx.arc(0, 0, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          } else if (atk.type === 'PHIBOCCION_BEAM') {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(Math.atan2(atk.vy || 0, atk.vx || 0));

            ctx.fillStyle = '#fef08a';
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-14, -4, 28, 8, 4);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
          } else if (atk.type === 'PHIBOCCION_EXPLOSION') {
            const r = atk.radius;
            if (atk.warningTimer > 0) {
              const progress = Math.max(0, Math.min(1, 1 - (atk.warningTimer / 2.0)));

              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();

              ctx.fillStyle = `rgba(234, 179, 8, ${0.1 + 0.15 * progress})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r * progress, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.setLineDash([8, 8]);
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
            } else if (atk.activeTimer > 0) {
              const progress = Math.max(0, Math.min(1, 1 - (atk.activeTimer / 0.4)));

              ctx.fillStyle = `rgba(251, 191, 36, ${0.85 * (1 - progress)})`;
              ctx.beginPath();
              ctx.arc(sx, sy, r * (0.2 + 0.8 * progress), 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
              ctx.lineWidth = 8 * (1 - progress);
              ctx.beginPath();
              ctx.arc(sx, sy, r * progress, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else if (atk.type === 'PYTHAGORAS_RULER') {
            const rulerImg = rulerImageRef.current;
            const rSize = (atk.height || 50);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(atk.angle || 0);
            if (rulerImg && rulerImg.complete && rulerImg.naturalWidth > 0) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(rulerImg, -rSize / 2, -rSize / 2, rSize, rSize);
            } else {
              const rWidth = atk.width || 20;
              const rHeight = atk.height || 50;
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(-rWidth / 2, -rHeight / 2, rWidth, rHeight);
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(-rWidth / 2, -rHeight / 2, rWidth, rHeight);
              ctx.fillStyle = '#451a03';
              for (let t = -rHeight / 2 + 4; t < rHeight / 2 - 4; t += 6) {
                ctx.fillRect(-rWidth / 2 + 2, t, rWidth / 3, 1.5);
              }
            }
            ctx.restore();
          } else if (atk.type === 'PYTHAGORAS_PROTRACTOR') {
            const protractorImg = protractorImageRef.current;
            const pSize = atk.radius * 2.2;

            // Telegraph launch trail connecting from Pythagoras's side for clear dodgeability
            if (atk.launchDuration && atk.launchTimer !== undefined && atk.launchTimer < atk.launchDuration && atk.spawnOriginX !== undefined && atk.spawnOriginY !== undefined) {
              const launchProgress = atk.launchTimer / atk.launchDuration;
              const lineAlpha = (1 - launchProgress) * 0.75;
              if (lineAlpha > 0.05) {
                const startSx = atk.spawnOriginX - lockedCameraRef.current.x;
                const startSy = atk.spawnOriginY - lockedCameraRef.current.y;
                ctx.save();
                ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
                ctx.lineWidth = 2.5;
                ctx.setLineDash([6, 5]);
                ctx.beginPath();
                ctx.moveTo(startSx, startSy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
                ctx.restore();
              }
            }

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(atk.rotAngle || 0);

            // Glowing blue/cyan aura for high visibility and dodgeability
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;

            if (protractorImg && protractorImg.complete && protractorImg.naturalWidth > 0) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(protractorImg, -pSize / 2, -pSize / 2, pSize, pSize);
            } else {
              ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
              ctx.beginPath();
              ctx.arc(0, 0, atk.radius, Math.PI, 0, false);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#1d4ed8';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
            ctx.restore();
          } else if (atk.type === 'PYTHAGORAS_SETSQUARE') {
            const setsquareImg = setsquareImageRef.current;
            const sSize = atk.radius * 2.2;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(atk.rotAngle || 0);
            if (setsquareImg && setsquareImg.complete && setsquareImg.naturalWidth > 0) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(setsquareImg, -sSize / 2, -sSize / 2, sSize, sSize);
            } else {
              ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
              ctx.beginPath();
              ctx.moveTo(-atk.radius, atk.radius);
              ctx.lineTo(atk.radius, atk.radius);
              ctx.lineTo(-atk.radius, -atk.radius);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#6b21a8';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
            ctx.restore();
          }
          ctx.restore();
        });
      }

      // --- RENDER PYTHAGORAS "GEOMENTO MORI" CARTESIAN GRAPH CURVES ---
      if (pythagorasGeoMoriActiveRef.current && pythagorasGeoMoriEquationsRef.current.length > 0) {
        ctx.save();
        const screenCenterX = (lockedCameraRef.current.x + canvas.width / 2) - cameraX;
        const screenCenterY = (lockedCameraRef.current.y + canvas.height / 2) - cameraY;
        const scale = 60; // 60px per Cartesian unit
        const state = pythagorasGeoMoriStateRef.current;
        const timer = pythagorasGeoMoriTimerRef.current;

        // 1. Cartesian Grid lines
        const gridAlpha = state === 'TELEGRAPH'
          ? Math.min(0.22, (timer / 2.2) * 0.22)
          : (state === 'ACTIVE' ? 0.22 : 0.08);

        ctx.strokeStyle = `rgba(168, 85, 247, ${gridAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);

        // Vertical grid lines
        for (let x = screenCenterX % scale; x < canvas.width; x += scale) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        // Horizontal grid lines
        for (let y = screenCenterY % scale; y < canvas.height; y += scale) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // 2. Main Cartesian Coordinate Axes crossing at (0, 0)
        const axisAlpha = state === 'TELEGRAPH'
          ? Math.min(0.75, (timer / 2.2) * 0.75)
          : (state === 'ACTIVE' ? 0.85 : 0.3);

        ctx.strokeStyle = `rgba(192, 132, 252, ${axisAlpha})`;
        ctx.lineWidth = 2.0;

        // X-axis (y = 0)
        ctx.beginPath();
        ctx.moveTo(0, screenCenterY);
        ctx.lineTo(canvas.width, screenCenterY);
        ctx.stroke();

        // X-axis arrowheads & label
        ctx.fillStyle = `rgba(192, 132, 252, ${axisAlpha})`;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 12, screenCenterY - 4);
        ctx.lineTo(canvas.width - 2, screenCenterY);
        ctx.lineTo(canvas.width - 12, screenCenterY + 4);
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('+x', canvas.width - 16, screenCenterY - 7);

        // Y-axis (x = 0)
        ctx.beginPath();
        ctx.moveTo(screenCenterX, 0);
        ctx.lineTo(screenCenterX, canvas.height);
        ctx.stroke();

        // Y-axis arrowheads & label
        ctx.beginPath();
        ctx.moveTo(screenCenterX - 4, 12);
        ctx.lineTo(screenCenterX, 2);
        ctx.lineTo(screenCenterX + 4, 12);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillText('+y', screenCenterX + 8, 14);

        // Axis unit ticks and coordinate labels
        ctx.font = '9px monospace';
        ctx.fillStyle = `rgba(226, 232, 240, ${axisAlpha * 0.75})`;
        ctx.textAlign = 'center';

        // X Ticks (-6 to +6)
        for (let u = -8; u <= 8; u++) {
          if (u === 0) continue;
          const tx = screenCenterX + u * scale;
          if (tx > 20 && tx < canvas.width - 20) {
            ctx.beginPath();
            ctx.moveTo(tx, screenCenterY - 3);
            ctx.lineTo(tx, screenCenterY + 3);
            ctx.stroke();
            if (u % 2 === 0) {
              ctx.fillText(String(u), tx, screenCenterY + 14);
            }
          }
        }

        // Y Ticks (-5 to +5)
        ctx.textAlign = 'right';
        for (let u = -6; u <= 6; u++) {
          if (u === 0) continue;
          const ty = screenCenterY - u * scale;
          if (ty > 20 && ty < canvas.height - 20) {
            ctx.beginPath();
            ctx.moveTo(screenCenterX - 3, ty);
            ctx.lineTo(screenCenterX + 3, ty);
            ctx.stroke();
            if (u % 2 === 0) {
              ctx.fillText(String(u), screenCenterX - 6, ty + 3);
            }
          }
        }

        // Origin (0;0) indicator marker
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenCenterX, screenCenterY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'left';
        ctx.fillText('(0, 0)', screenCenterX + 7, screenCenterY + 14);

        // 3. Render the 3 Graphed Equation Curves
        if (state === 'TELEGRAPH') {
          // Pre-graph warning / telegraph: pulsing dashed preview lines in each equation's color
          const pulse = Math.sin(survivalTimeRef.current * 14) * 0.25 + 0.45;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([10, 8]);

          pythagorasGeoMoriEquationsRef.current.forEach((eq) => {
            ctx.strokeStyle = eq.color;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            let isDrawing = false;
            const minX = -screenCenterX;
            const maxX = canvas.width - screenCenterX;
            const stepPx = 4;

            for (let px = minX; px <= maxX; px += stepPx) {
              const coordX = px / scale;
              const coordY = eq.fn(coordX);
              if (coordY === null || isNaN(coordY) || Math.abs(coordY) > 50) {
                isDrawing = false;
                continue;
              }
              const canvasX = screenCenterX + px;
              const canvasY = screenCenterY - coordY * scale;

              if (canvasY < -100 || canvasY > canvas.height + 100) {
                isDrawing = false;
                continue;
              }

              if (!isDrawing) {
                ctx.moveTo(canvasX, canvasY);
                isDrawing = true;
              } else {
                ctx.lineTo(canvasX, canvasY);
              }
            }
            ctx.stroke();
          });
          ctx.globalAlpha = 1.0;
          ctx.setLineDash([]);
        } else if (state === 'ACTIVE') {
          // ACTIVE: Full glowing neon laser curves that deal damage!
          const activeProgress = Math.min(1, timer / 0.5);
          const pulseGlow = Math.sin(survivalTimeRef.current * 18) * 0.12 + 0.88;

          pythagorasGeoMoriEquationsRef.current.forEach((eq) => {
            // Outer bright laser glow in equation's distinct signature color
            ctx.save();
            ctx.shadowColor = eq.color;
            ctx.shadowBlur = 14;
            ctx.strokeStyle = eq.color;
            ctx.lineWidth = 5.0;
            ctx.globalAlpha = 0.9 * activeProgress * pulseGlow;
            ctx.beginPath();

            let isDrawing = false;
            const minX = -screenCenterX;
            const maxX = canvas.width - screenCenterX;
            const stepPx = 3;

            for (let px = minX; px <= maxX; px += stepPx) {
              const coordX = px / scale;
              const coordY = eq.fn(coordX);
              if (coordY === null || isNaN(coordY) || Math.abs(coordY) > 50) {
                isDrawing = false;
                continue;
              }
              const canvasX = screenCenterX + px;
              const canvasY = screenCenterY - coordY * scale;

              if (canvasY < -150 || canvasY > canvas.height + 150) {
                isDrawing = false;
                continue;
              }

              if (!isDrawing) {
                ctx.moveTo(canvasX, canvasY);
                isDrawing = true;
              } else {
                ctx.lineTo(canvasX, canvasY);
              }
            }
            ctx.stroke();

            // Inner hot core line
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.8;
            ctx.globalAlpha = 0.95 * activeProgress;
            ctx.stroke();

            ctx.restore();
          });
        }
        ctx.restore();
      }

      // Render Archmage Blue 1.5s Laser Telegraph
      if (archmageBlueTelegraphTimerRef.current > 0 && isBossFightRef.current && bossInstanceRef.current) {
        const boss = bossInstanceRef.current;
        const bx = boss.x - cameraX;
        const by = boss.y - cameraY;
        const pulse = Math.sin(survivalTimeRef.current * 24) * 0.35 + 0.65;

        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([16, 10]);
        for (let b = 0; b < 4; b++) {
          const angle = (b * Math.PI * 2) / 4;
          const endX = bx + Math.cos(angle) * 900;
          const endY = by + Math.sin(angle) * 900;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Archmage Spinning Beams (Geraldo The Blue & Geraldo The RGB)
      if (archmageSpinningBeamsRef.current && isBossFightRef.current && bossInstanceRef.current) {
        const beams = archmageSpinningBeamsRef.current;
        const boss = bossInstanceRef.current;
        const bx = boss.x - cameraX;
        const by = boss.y - cameraY;

        ctx.save();
        const rainbowBeamColors = [
          '#f472b6', // light pink
          '#ef4444', // red
          '#f97316', // orange
          '#eab308', // yellow
          '#22c55e', // green
          '#3b82f6', // blue
          '#6b21a8', // dark purple
          '#c084fc', // violet
        ];

        for (let b = 0; b < beams.beamCount; b++) {
          const angle = beams.baseAngle + (b * Math.PI * 2) / beams.beamCount;
          const endX = bx + Math.cos(angle) * beams.beamLength;
          const endY = by + Math.sin(angle) * beams.beamLength;

          const mainColor = beams.isRainbow
            ? rainbowBeamColors[b % rainbowBeamColors.length]
            : '#38bdf8';
          const coreColor = '#ffffff';

          ctx.shadowColor = mainColor;
          ctx.shadowBlur = 18;

          // Outer beam
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Inner laser core
          ctx.strokeStyle = coreColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Vine Box(es) for Geraldo Green (1 box) and Geraldo RGB Clone Spell (2 boxes)
      if (isBossFightRef.current && bossInstanceRef.current?.id === 'archmages') {
        const boss = bossInstanceRef.current;
        const isGreen = boss.archmagesPhase === 'PHASE1' && boss.activeArchmageId === 'geraldo_green';
        const isRGBClone = boss.archmagesPhase === 'PHASE2' && archmageRGBAttackIndexRef.current === 0 && archmageCloneRef.current !== null;

        if (isGreen || isRGBClone) {
          const cam = lockedCameraRef.current;
          const arenaCenterX = cam.x + canvas.width / 2;
          const arenaCenterY = cam.y + canvas.height / 2;
          const tileSize = 80;

          const boxCenters = isRGBClone
            ? [
                { x: arenaCenterX - 160, y: arenaCenterY },
                { x: arenaCenterX + 160, y: arenaCenterY },
              ]
            : [{ x: arenaCenterX, y: arenaCenterY }];

          ctx.save();
          boxCenters.forEach((bCenter) => {
            const boxLeft = bCenter.x - (tileSize * 3) / 2 - cameraX;
            const boxTop = bCenter.y - (tileSize * 3) / 2 - cameraY;
            const boxSize = tileSize * 3;

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4;
            ctx.strokeRect(boxLeft, boxTop, boxSize, boxSize);

            ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
            ctx.lineWidth = 1.5;
            for (let i = 1; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo(boxLeft + i * tileSize, boxTop);
              ctx.lineTo(boxLeft + i * tileSize, boxTop + boxSize);
              ctx.moveTo(boxLeft, boxTop + i * tileSize);
              ctx.lineTo(boxLeft + boxSize, boxTop + i * tileSize);
              ctx.stroke();
            }

            ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(boxLeft - 20, boxTop - 20, boxSize + 40, 20);
            ctx.fillRect(boxLeft - 20, boxTop + boxSize, boxSize + 40, 20);
            ctx.fillRect(boxLeft - 20, boxTop, 20, boxSize);
            ctx.fillRect(boxLeft + boxSize, boxTop, 20, boxSize);
          });
          ctx.restore();
        }
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
          const badgeHeal = pickup.healAmount !== undefined ? pickup.healAmount : calculateFoodHealAmount(10);
          ctx.fillText(`+${badgeHeal}`, sx, sy + bob - 10);
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
        } else if (proj.isAcidWave) {
          // Render wide acidic wave
          const angle = Math.atan2(proj.vy, proj.vx);
          const progress = 1 - (proj.duration / proj.maxDuration);
          const alpha = Math.min(1, Math.max(0, progress * 1.5));

          ctx.translate(sx, sy);
          ctx.rotate(angle);

          // Outer glowing aura
          ctx.save();
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 24;

          // Wide crescent arc
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius * 1.5, -Math.PI / 2.8, Math.PI / 2.8);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 18;
          ctx.lineCap = 'round';
          ctx.globalAlpha = 0.8 * alpha;
          ctx.stroke();

          // Bright inner core arc
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius * 1.45, -Math.PI / 3.2, Math.PI / 3.2);
          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.globalAlpha = 0.95 * alpha;
          ctx.stroke();

          // White center highlight line
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius * 1.42, -Math.PI / 3.8, Math.PI / 3.8);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.globalAlpha = alpha;
          ctx.stroke();

          ctx.restore();
        } else if (proj.weaponId === 'seeking_wisp') {
          // Fire Wisp & Mega Fireball (Fireball!!!) rendering
          const isMega = Boolean(proj.radius >= 20);
          
          ctx.save();
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = isMega ? 32 : (proj.isExplosive ? 20 : 12);

          // Outer fiery corona
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, proj.radius * 1.25);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.25, '#fef08a');
          grad.addColorStop(0.55, '#f97316');
          grad.addColorStop(1, '#dc2626');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, proj.radius, 0, Math.PI * 2);
          ctx.fill();

          // Swirling flame rim for Mega Fireball
          if (isMega) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(sx, sy, proj.radius * 0.85, 0, Math.PI * 2);
            ctx.stroke();

            // Inner intense white-hot core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, proj.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // White core highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, proj.radius * 0.38, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        } else if (proj.weaponId === 'thunderstrike') {
          // Thunderstrike beam rendering extending from player to projectile head (enemy)
          const playerSx = p.x - cameraX;
          const playerSy = p.y - cameraY;

          ctx.save();
          
          // Outer electric glow
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 20;

          // Electric crackle line segments from player to projectile head (sx, sy)
          ctx.beginPath();
          ctx.moveTo(playerSx, playerSy);

          const dx = sx - playerSx;
          const dy = sy - playerSy;
          const dist = Math.hypot(dx, dy);
          const segments = Math.max(3, Math.floor(dist / 20));

          for (let s = 1; s < segments; s++) {
            const ratio = s / segments;
            const segX = playerSx + dx * ratio;
            const segY = playerSy + dy * ratio;
            // Perpendicular offset for lightning crackle
            const perpX = -dy / (dist || 1);
            const perpY = dx / (dist || 1);
            const offset = (Math.random() - 0.5) * 14;

            ctx.lineTo(segX + perpX * offset, segY + perpY * offset);
          }
          ctx.lineTo(sx, sy);

          // Outer wide blue stroke
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = Math.max(4, proj.radius * 0.85);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Inner bright cyan stroke
          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = Math.max(2, proj.radius * 0.4);
          ctx.stroke();

          // Core white hot bolt
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright electric spark head at sx, sy
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(3, proj.radius * 0.6), 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (proj.weaponId === 'spectral_arrow') {
          const angle = Math.atan2(proj.vy, proj.vx);
          const arrowImg = spectralArrowImageRef.current;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle + Math.PI / 2);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          if (arrowImg && arrowImg.complete && arrowImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            const height = proj.radius * 2.2;
            const aspect = arrowImg.naturalWidth / arrowImg.naturalHeight;
            const width = height * aspect;
            ctx.drawImage(arrowImg, -width / 2, -height / 2, width, height);
          } else {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(-6, 8);
            ctx.lineTo(0, 4);
            ctx.lineTo(6, 8);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (proj.weaponId === 'sickle') {
          const sickleImg = sickleImageRef.current;
          const rotAngle = proj.rotationAngle || 0;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(rotAngle);
          ctx.shadowBlur = 0;
          if (sickleImg && sickleImg.complete && sickleImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            const drawSize = proj.radius * 1.8;
            ctx.drawImage(sickleImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else {
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius, -Math.PI * 0.7, Math.PI * 0.3);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.restore();
        } else if (proj.weaponId === 'protractor') {
          const protractorImg = protractorImageRef.current;
          const rotAngle = proj.rotationAngle || 0;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(rotAngle);
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#38bdf8';
          if (protractorImg && protractorImg.complete && protractorImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            const drawSize = proj.radius * 2.0;
            ctx.drawImage(protractorImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else {
            // Procedural fallback semi-circle protractor
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius * 1.2, 0, Math.PI, false);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius * 0.5, 0, Math.PI, false);
            ctx.closePath();
            ctx.stroke();
          }
          ctx.restore();
        } else if (proj.weaponId === 'arcane_wand') {
          const angle = Math.atan2(proj.vy, proj.vx);
          const beamImg = stellarBeamImageRef.current;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle + Math.PI / 2);
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 12;
          if (beamImg && beamImg.complete && beamImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            const height = Math.max(24, proj.radius * 2.6);
            const aspect = beamImg.naturalWidth / beamImg.naturalHeight;
            const width = height * aspect;
            ctx.drawImage(beamImg, -width / 2, -height / 2, width, height);
          } else {
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
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

      // Render Rock Thrower & Bunnary Projectiles
      rockProjectilesRef.current.forEach((rock) => {
        const sx = rock.x - cameraX;
        const sy = rock.y - cameraY;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rock.life * 9);

        if (rock.isPellet) {
          const pelletImg = bunnaryPelletImageRef.current;
          const pelletSize = rock.radius * 3.2;

          if (pelletImg && pelletImg.complete && pelletImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(pelletImg, -pelletSize / 2, -pelletSize / 2, pelletSize, pelletSize);
          } else {
            // Shadow beneath pellet
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 5, rock.radius, rock.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pellet body fallback
            ctx.fillStyle = '#06b6d4';
            ctx.strokeStyle = '#083344';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, rock.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Highlight
            ctx.fillStyle = '#cffafe';
            ctx.beginPath();
            ctx.arc(-2, -2, rock.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          const rockImg = rockProjectileImageRef.current;
          const rockSize = rock.radius * 2.5;

          if (rockImg && rockImg.complete && rockImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(rockImg, -rockSize / 2, -rockSize / 2, rockSize, rockSize);
          } else {
            // Shadow beneath rock
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 6, rock.radius, rock.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Jagged boulder body fallback
            ctx.fillStyle = '#78716c';
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, rock.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Highlight
            ctx.fillStyle = '#d6d3d1';
            ctx.beginPath();
            ctx.arc(-2, -2, rock.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      });

      // 5. Render Orbiting Grimoires (if equipped)
      if (grimoireWeapon) {
        const def = ALL_WEAPONS.find((w) => w.id === 'grimoire_orbit')!;
        const tier = def.tiers.find((t) => t.tier === grimoireWeapon.level) || def.tiers[0];
        const bookCount = Math.min(3, def.baseCount + tier.countBonus);
        const orbitRadius = (58 + (tier.sizeBonus || 0) * 1.5) * p.projectileSizeMult;
        const playerScreenX = p.x - cameraX;
        const playerScreenY = p.y - cameraY;
        const bookSize = (20 + (tier.sizeBonus || 0) * 0.8) * p.projectileSizeMult;
        const grimoireImg = grimoireImageRef.current;

        for (let i = 0; i < bookCount; i++) {
          const bAngle = orbitAngleRef.current + (i / bookCount) * Math.PI * 2;
          const bx = playerScreenX + Math.cos(bAngle) * orbitRadius;
          const by = playerScreenY + Math.sin(bAngle) * orbitRadius;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(bAngle + Math.PI / 2);

          // Glowing Arcane Aura
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;

          if (grimoireImg && grimoireImg.complete && grimoireImg.naturalWidth > 0) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(grimoireImg, -bookSize / 2, -bookSize / 2, bookSize, bookSize);
          } else {
            const bw = (6.5 + (tier.sizeBonus || 0) * 0.3) * p.projectileSizeMult;
            const bh = (9.5 + (tier.sizeBonus || 0) * 0.4) * p.projectileSizeMult;
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-bw, -bh, bw * 2, bh * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-(bw - 2), -(bh - 2), (bw - 2) * 2, (bh - 2) * 2);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-(bw - 2), -(bh - 2), (bw - 2) * 2, (bh - 2) * 2);
          }
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

        // Medusa's Eye Slow visual (grayish rendering) & Thunderstorm Slow visual (blue rendering under player)
        const mouseScreenX = mouseScreenRef.current.x;
        const mouseScreenY = mouseScreenRef.current.y;
        const distFromCursor = Math.hypot(sx - mouseScreenX, sy - mouseScreenY);
        const hasMedusa = medusaItemRender !== undefined;
        const medusaRad = medusaItemRender ? 26 + medusaItemRender.level * 6 : 0;
        const isMedusaSlowed = hasMedusa && distFromCursor <= medusaRad;

        const playerScreenX = p.x - cameraX;
        const playerScreenY = p.y - cameraY;
        const distFromPlayer = Math.hypot(sx - playerScreenX, sy - playerScreenY);
        const thunderstormWpDraw = weaponsRef.current.find((w) => w.id === 'thunderstrike' && w.level >= 7);
        const isThunderstormSlowed = Boolean(thunderstormWpDraw && distFromPlayer <= 140);

        if (enemy.hitFlashTimer <= 0) {
          if (isMedusaSlowed && isThunderstormSlowed) {
            ctx.filter = 'grayscale(50%) hue-rotate(180deg) saturate(200%)';
          } else if (isMedusaSlowed) {
            ctx.filter = 'grayscale(85%)';
          } else if (isThunderstormSlowed) {
            ctx.filter = 'hue-rotate(180deg) saturate(250%) brightness(1.15)';
          }
        }

        const isUnocondaEnemy = enemy.name === 'Unoconda' || enemy.type === 'UNOCONDA';
        const isViiiperEnemy = enemy.name === 'VIIIper' || enemy.type === 'VIIIPER';
        const isPitchforkPeasant = (enemy.name === 'Pitchfork Peasant' || enemy.type === 'BAT') && !isViiiperEnemy;
        const isTorchPeasant = (enemy.name === 'Torch Peasant' || enemy.type === 'WRAITH') && !isUnocondaEnemy;
        const isObMooseEnemy = enemy.name === 'ObMoose' || enemy.type === 'OBMOOSE';
        const isVillageKnightEnemy = (enemy.isRed || enemy.name === 'Village Knight' || enemy.type === 'GHOUL') && !isObMooseEnemy;
        const isMiniEye = enemy.type === 'MINI_EYE';

        const customEnemyImg = isPitchforkPeasant
          ? peasantImageRef.current
          : isTorchPeasant
          ? peasantTorchImageRef.current
          : isUnocondaEnemy
          ? unocondaImageRef.current
          : isViiiperEnemy
          ? viiiperImageRef.current
          : isObMooseEnemy
          ? obMooseImageRef.current
          : isVillageKnightEnemy
          ? villageKnightImageRef.current
          : null;

        if (customEnemyImg) {
          const img = customEnemyImg;
          const scaleMult = isObMooseEnemy ? 1.8 : isViiiperEnemy ? 1.62 : 1.5;
          const width = enemy.radius * 2 * scaleMult;
          const aspect = (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)
            ? (img.naturalHeight / img.naturalWidth)
            : 1.0;
          const height = width * aspect;

          ctx.save();
          ctx.translate(sx, sy);

          // Face moving direction horizontally (same direction sensor as the Witch)
          let facing = enemy.facingDir !== undefined ? enemy.facingDir : (p.x - enemy.x < 0 ? -1 : 1);
          if (isUnocondaEnemy || isViiiperEnemy) {
            facing = -facing; // Invert because source sprite natively faces left
          }
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
          // Draw Mini Eye with new model
          ctx.save();
          const miniEyeImg = miniEyeImageRef.current;
          const eyeSize = enemy.radius * 2.5;
          if (miniEyeImg && miniEyeImg.complete && miniEyeImg.naturalWidth > 0) {
            ctx.translate(sx, sy);
            ctx.imageSmoothingEnabled = false;
            if (enemy.hitFlashTimer > 0) {
              ctx.filter = 'brightness(300%)';
            }
            ctx.drawImage(miniEyeImg, -eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
          } else {
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
          }
          ctx.restore();
        } else if (enemy.type === 'ROCK_THROWER') {
          // Draw Rock Thrower
          ctx.save();

          // If telegraphing, render dashed line & warning target towards player
          const isTelegraphing = enemy.rockTelegraphTimer && enemy.rockTelegraphTimer > 0;
          if (isTelegraphing) {
            const progress = 1 - ((enemy.rockTelegraphTimer || 0) / 1.0);
            const targetAng = enemy.targetAngle !== undefined ? enemy.targetAngle : Math.atan2(p.y - enemy.y, p.x - enemy.x);
            const lineLen = 240;
            const endX = sx + Math.cos(targetAng) * lineLen;
            const endY = sy + Math.sin(targetAng) * lineLen;

            ctx.save();
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.35 + progress * 0.5})`;
            ctx.lineWidth = 2 + progress * 2.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Telegraph circle at target
            ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + progress * 0.35})`;
            ctx.beginPath();
            ctx.arc(endX, endY, 14 * progress + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          const rockImg = rockThrowerImageRef.current;
          const spriteSize = enemy.radius * 2.5;

          if (rockImg && rockImg.complete && rockImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.imageSmoothingEnabled = false;

            const facingLeft = (isTelegraphing && enemy.targetAngle !== undefined)
              ? Math.cos(enemy.targetAngle) < 0
              : p.x < enemy.x;
            if (facingLeft) {
              ctx.scale(-1, 1);
            }

            if (enemy.hitFlashTimer > 0) {
              ctx.filter = 'brightness(300%)';
            } else if (isTelegraphing) {
              ctx.filter = 'drop-shadow(0 0 6px #f59e0b)';
            }

            ctx.drawImage(rockImg, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
            ctx.restore();
          } else {
            if (enemy.hitFlashTimer > 0) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = '#d97706';
            }

            ctx.shadowColor = '#d97706';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
            ctx.fill();

            // Face / Eyes
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(sx - enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
            ctx.arc(sx + enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Rock held in hand
            const rockOffsetAngle = isTelegraphing ? (enemy.targetAngle || 0) : (p.x - enemy.x < 0 ? Math.PI : 0);
            const rx = sx + Math.cos(rockOffsetAngle) * (enemy.radius + 4);
            const ry = sy + Math.sin(rockOffsetAngle) * (enemy.radius + 4);

            ctx.fillStyle = isTelegraphing ? '#f59e0b' : '#78716c';
            ctx.strokeStyle = '#44403c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(rx, ry, isTelegraphing ? 6.5 : 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (isTelegraphing) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(rx, ry, 9 + Math.sin(performance.now() * 0.02) * 2, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          ctx.restore();
        } else if (enemy.type === 'BUNNARY') {
          // Draw Bunnary
          ctx.save();

          // If telegraphing, render dashed line & warning target towards player
          const isTelegraphing = enemy.rockTelegraphTimer && enemy.rockTelegraphTimer > 0;
          if (isTelegraphing) {
            const progress = 1 - ((enemy.rockTelegraphTimer || 0) / 1.0);
            const targetAng = enemy.targetAngle !== undefined ? enemy.targetAngle : Math.atan2(p.y - enemy.y, p.x - enemy.x);
            const lineLen = 240;
            const endX = sx + Math.cos(targetAng) * lineLen;
            const endY = sy + Math.sin(targetAng) * lineLen;

            ctx.save();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 + progress * 0.5})`;
            ctx.lineWidth = 2 + progress * 2.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Telegraph circle at target
            ctx.fillStyle = `rgba(6, 182, 212, ${0.15 + progress * 0.35})`;
            ctx.beginPath();
            ctx.arc(endX, endY, 14 * progress + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Pick sprite based on current binary sequence
          let bunnaryImg: HTMLImageElement | null = null;
          if (enemy.bunnaryInGap) {
            bunnaryImg = bunnaryBlankImageRef.current;
          } else {
            const charIdx = enemy.bunnaryCharIndex ?? -1;
            if (charIdx === -1) {
              bunnaryImg = bunnaryEndImageRef.current;
            } else {
              const msgIdx = (enemy.bunnaryMsgIndex ?? 0) % BUNNARY_MESSAGES.length;
              const currentMsg = BUNNARY_MESSAGES[msgIdx];
              const ch = currentMsg[charIdx] || ' ';
              if (ch === '0') {
                bunnaryImg = bunnary0ImageRef.current;
              } else if (ch === '1') {
                bunnaryImg = bunnary1ImageRef.current;
              } else {
                bunnaryImg = bunnaryBlankImageRef.current;
              }
            }
          }

          if (!bunnaryImg || !bunnaryImg.complete || bunnaryImg.naturalWidth === 0) {
            bunnaryImg = bunnary0ImageRef.current || bunnaryBlankImageRef.current;
          }

          // Bunnary is bigger now for high visibility of chest binary numbers
          const spriteSize = enemy.radius * 3.6;

          if (bunnaryImg && bunnaryImg.complete && bunnaryImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.imageSmoothingEnabled = false;

            if (enemy.hitFlashTimer > 0) {
              ctx.filter = 'brightness(300%)';
            } else if (isTelegraphing) {
              ctx.filter = 'drop-shadow(0 0 8px #06b6d4)';
            }

            ctx.drawImage(bunnaryImg, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
            ctx.restore();
          } else {
            if (enemy.hitFlashTimer > 0) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = '#06b6d4';
            }

            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
            ctx.fill();

            // Face / Eyes
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(sx - enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
            ctx.arc(sx + enemy.radius * 0.35, sy - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

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

        // Visible Burn effect overlay: glowing red aura with rising flame embers
        if (enemy.burnDuration && enemy.burnDuration > 0) {
          ctx.save();
          const auraPulse = Math.sin(survivalTimeRef.current * 8) * 2.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14 + auraPulse;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.75 + Math.sin(survivalTimeRef.current * 10) * 0.2})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius + 4 + auraPulse * 0.4, 0, Math.PI * 2);
          ctx.stroke();

          // Inner fiery red glow
          ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius + 2, 0, Math.PI * 2);
          ctx.fill();

          // Rising flame embers
          for (let f = 0; f < 2; f++) {
            const emberAngle = (survivalTimeRef.current * 4 + f * Math.PI) % (Math.PI * 2);
            const emberX = sx + Math.cos(emberAngle) * (enemy.radius * 0.6);
            const emberY = sy - enemy.radius * 0.4 - ((survivalTimeRef.current * 30 + f * 14) % (enemy.radius + 8));
            ctx.fillStyle = f % 2 === 0 ? '#f97316' : '#facc15';
            ctx.beginPath();
            ctx.arc(emberX, emberY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Visible Acid effect overlay: glowing green aura
        if (enemy.acidDuration && enemy.acidDuration > 0) {
          ctx.save();
          const auraPulse = Math.sin(survivalTimeRef.current * 8) * 2.5;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 14 + auraPulse;
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.75 + Math.sin(survivalTimeRef.current * 10) * 0.2})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius + 4 + auraPulse * 0.4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
          ctx.beginPath();
          ctx.arc(sx, sy, enemy.radius + 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
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
          const r = boss.radius;

          // Alternate between open and closed mouth models every 1 second
          const isMouthClosed = Math.floor(survivalTimeRef.current) % 2 === 1;
          const openImg = carnivorePlantImageRef.current;
          const closedImg = carnivorePlantClosedImageRef.current;

          let plantImg: HTMLImageElement | null = null;
          if (isMouthClosed) {
            plantImg = (closedImg && closedImg.complete && closedImg.naturalWidth > 0)
              ? closedImg
              : openImg;
          } else {
            plantImg = (openImg && openImg.complete && openImg.naturalWidth > 0)
              ? openImg
              : closedImg;
          }

          // Animated breathing pulse
          const breath = 1 + 0.04 * Math.sin(survivalTimeRef.current * 3.5);
          const plantSize = r * 2.5 * breath;

          // Boss Outer Bio-Aura (GPU accelerated halo)
          ctx.fillStyle = isFlashing ? 'rgba(255, 255, 255, 0.35)' : 'rgba(16, 185, 129, 0.22)';
          ctx.beginPath();
          ctx.arc(bx, by, plantSize * 0.52, 0, Math.PI * 2);
          ctx.fill();

          if (plantImg && plantImg.complete && plantImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(bx, by);
            ctx.imageSmoothingEnabled = false;

            // Subtle organic sway
            const sway = Math.sin(survivalTimeRef.current * 2) * 0.04;
            ctx.rotate(sway);

            if (isFlashing) {
              ctx.filter = 'brightness(300%)';
            }

            ctx.drawImage(plantImg, -plantSize / 2, -plantSize / 2, plantSize, plantSize);
            ctx.restore();
          } else {
            // Fallback rendering while sprite is loading
            const fallbackR = r * breath;

            // Thorny Vine Collar
            ctx.fillStyle = isFlashing ? '#ffffff' : '#064e3b';
            ctx.beginPath();
            ctx.arc(bx, by, fallbackR * 1.25, 0, Math.PI * 2);
            ctx.fill();

            // Spreading thorny leaf petals
            const petals = 8;
            for (let k = 0; k < petals; k++) {
              const pAng = (k / petals) * Math.PI * 2 + survivalTimeRef.current * 0.4;
              const px = bx + Math.cos(pAng) * (fallbackR * 1.4);
              const py = by + Math.sin(pAng) * (fallbackR * 1.4);

              ctx.fillStyle = isFlashing ? '#ffffff' : '#047857';
              ctx.beginPath();
              ctx.ellipse(px, py, 22, 12, pAng, 0, Math.PI * 2);
              ctx.fill();
            }

            // Main Carnivorous Monster Bulb / Head
            ctx.fillStyle = isFlashing ? '#ffffff' : '#15803d';
            ctx.beginPath();
            ctx.arc(bx, by, fallbackR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isFlashing ? '#ffffff' : '#86efac';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Snapping Jaws (upper & lower mandibles)
            const jawOpen = 14 + 8 * Math.sin(survivalTimeRef.current * 5);
            ctx.fillStyle = isFlashing ? '#ffffff' : '#450a0a';
            ctx.beginPath();
            ctx.ellipse(bx, by - 4, fallbackR * 0.7, jawOpen, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sharp Spiky Teeth in Mouth
            ctx.fillStyle = isFlashing ? '#ffffff' : '#fef08a';
            const teethCount = 7;
            for (let t = 0; t < teethCount; t++) {
              const tx = bx - fallbackR * 0.55 + (t / (teethCount - 1)) * (fallbackR * 1.1);
              ctx.beginPath();
              ctx.moveTo(tx - 4, by - 4 - jawOpen * 0.7);
              ctx.lineTo(tx + 4, by - 4 - jawOpen * 0.7);
              ctx.lineTo(tx, by - 4);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(tx - 4, by - 4 + jawOpen * 0.7);
              ctx.lineTo(tx + 4, by - 4 + jawOpen * 0.7);
              ctx.lineTo(tx, by - 4);
              ctx.closePath();
              ctx.fill();
            }
          }
        } else if (boss.id === 'night_bear') {
          // NightBear Boss Rendering
          const r = boss.radius;
          const isCharging = nightBearStateRef.current === 'CHARGING';
          const isDizzy = nightBearStateRef.current === 'DIZZY';
          const isTelegraph = nightBearStateRef.current === 'TELEGRAPH';
          const isRepositioning = nightBearStateRef.current === 'BITE_REPOSITION';
          const isBiteAttack = nightBearStateRef.current === 'BITE_ATTACK';

          // Shake if charging or telegraphing or biting
          let offsetX = 0;
          let offsetY = 0;
          if (isTelegraph || isBiteAttack) {
            offsetX = (Math.random() - 0.5) * 6;
            offsetY = (Math.random() - 0.5) * 6;
          }

          const bearImg = isDizzy ? nightBearDizzyImageRef.current : nightBearImageRef.current;
          const bearSize = r * 2.5;

          // Outer Boss Aura (GPU accelerated soft halo)
          const bearAuraColor = isFlashing
            ? 'rgba(255, 255, 255, 0.45)'
            : isCharging || isBiteAttack
            ? 'rgba(239, 68, 68, 0.32)'
            : isDizzy
            ? 'rgba(56, 189, 248, 0.28)'
            : isRepositioning
            ? 'rgba(248, 113, 113, 0.28)'
            : 'rgba(239, 68, 68, 0.14)';
          ctx.fillStyle = bearAuraColor;
          ctx.beginPath();
          ctx.arc(bx + offsetX, by + offsetY, bearSize * 0.52, 0, Math.PI * 2);
          ctx.fill();

          if (bearImg && bearImg.complete && bearImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(bx + offsetX, by + offsetY);
            ctx.imageSmoothingEnabled = false;

            // Flip horizontally based on movement/player direction
            const facingLeft = (isCharging || isTelegraph)
              ? Math.cos(nightBearChargeAngleRef.current) < 0
              : p.x < boss.x;
            if (facingLeft) {
              ctx.scale(-1, 1);
            }

            if (isFlashing) {
              ctx.filter = 'brightness(300%)';
            }

            ctx.drawImage(bearImg, -bearSize / 2, -bearSize / 2, bearSize, bearSize);
            ctx.restore();

            // Dizzy orbiting stars above head when stunned
            if (isDizzy) {
              const dizzyTime = performance.now() * 0.005;
              const starCount = 3;
              for (let s = 0; s < starCount; s++) {
                const sAngle = dizzyTime + (s * (Math.PI * 2 / starCount));
                const starX = bx + offsetX + Math.cos(sAngle) * (r * 0.75);
                const starY = by + offsetY - (r * 0.85) + Math.sin(sAngle) * (r * 0.25);
                ctx.save();
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(starX, starY, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          } else {
            // Main body (Hulking Beast fallback)
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
          }
        } else if (boss.id === 'haunted_eye') {
          // Haunted Eye Boss Rendering (Wide Panoramic Occult Entity)
          const eyePhase = eyePhaseRef.current;
          const rx = boss.widthRadius || 155;
          const ry = boss.heightRadius || 55;
          const eyeWidth = rx * 2.3;
          const eyeHeight = ry * 2.5;

          // Floating bobbing effect
          const bobY = Math.sin(survivalTimeRef.current * 3) * 4;
          const eyeY = by + bobY;

          // Outer Occult Eye Aura (GPU accelerated halo)
          const eyeAura = isFlashing
            ? 'rgba(255, 255, 255, 0.45)'
            : eyePhase === 'OPEN'
            ? 'rgba(239, 68, 68, 0.35)'
            : 'rgba(153, 27, 27, 0.22)';
          ctx.fillStyle = eyeAura;
          ctx.beginPath();
          ctx.ellipse(bx, eyeY, rx * 1.25, ry * 1.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Select appropriate sprite for current phase
          let eyeImg: HTMLImageElement | null = null;
          if (eyePhase === 'CLOSED') {
            eyeImg = hauntedEyeClosedImageRef.current;
          } else if (eyePhase === 'WARNING') {
            eyeImg = hauntedEyeOpeningImageRef.current;
          } else {
            eyeImg = hauntedEyeOpenImageRef.current;
          }

          if (eyeImg && eyeImg.complete && eyeImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(bx, eyeY);
            ctx.imageSmoothingEnabled = false;

            if (isFlashing) {
              ctx.filter = 'brightness(300%)';
            }

            ctx.drawImage(eyeImg, -eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight);
            ctx.restore();
          } else {
            // Fallback rendering
            ctx.fillStyle = isFlashing ? '#ffffff' : '#2b0606';
            ctx.beginPath();
            ctx.ellipse(bx, eyeY, rx * 1.15, ry * 1.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isFlashing ? '#ffffff' : (eyePhase === 'OPEN' ? '#ef4444' : '#991b1b');
            ctx.lineWidth = 3.5;
            ctx.stroke();
          }

          // Pupil (Rendered using Mini-Eye sprite tracking the player when Open)
          if (eyePhase === 'OPEN') {
            const targetScreenX = p.x - cameraX;
            const targetScreenY = p.y - cameraY;
            const lookDistX = Math.min(rx * 0.42, Math.abs(targetScreenX - bx) * 0.15) * Math.sign(targetScreenX - bx || 1);
            const lookDistY = Math.min(ry * 0.35, Math.abs(targetScreenY - eyeY) * 0.1) * Math.sign(targetScreenY - eyeY || 1);
            const irisX = bx + lookDistX;
            const irisY = eyeY + lookDistY;

            const miniEyeImg = miniEyeImageRef.current;
            if (miniEyeImg && miniEyeImg.complete && miniEyeImg.naturalWidth > 0) {
              const pupilSize = 44;
              ctx.save();
              ctx.translate(irisX, irisY);
              ctx.imageSmoothingEnabled = false;
              if (isFlashing) {
                ctx.filter = 'brightness(300%)';
              }
              ctx.drawImage(miniEyeImg, -pupilSize / 2, -pupilSize / 2, pupilSize, pupilSize);
              ctx.restore();
            } else {
              ctx.fillStyle = '#09090b';
              ctx.beginPath();
              ctx.ellipse(irisX, irisY, 14, 13, 0, 0, Math.PI * 2);
              ctx.fill();

              // Inner glowing dot
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(irisX - 3, irisY - 2, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (eyePhase === 'WARNING') {
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
            // Keep mouse cursor coordinates defined for the LOOK AWAY restriction mechanics below
            const mouseScreenX = mouseScreenRef.current.x;
            const mouseScreenY = mouseScreenRef.current.y;

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
        } else if (boss.id === 'archmages') {
          // --- ARCHMAGES BOSS RENDERING ---
          if (boss.archmagesPhase === 'PHASE1') {
            const list = boss.archmagesList || [];

            // 1. Draw Shielded Bubble Wizards at bottom left
            list.filter(w => w.isShielded).forEach((w) => {
              const wx = w.x - cameraX;
              const wy = w.y - cameraY;

              ctx.save();
              // Shimmering Protective Bubble
              const bubblePulse = Math.sin(survivalTimeRef.current * 6 + wx) * 2;
              const bRadius = 26 + bubblePulse;

              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 16;
              ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
              ctx.beginPath();
              ctx.arc(wx, wy, bRadius, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#bae6fd';
              ctx.lineWidth = 2.5;
              ctx.stroke();

              // Specular shine on bubble
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(wx - bRadius * 0.4, wy - bRadius * 0.4, 4, 0, Math.PI * 2);
              ctx.fill();

              // Draw downed wizard sprite inside bubble
              let wImg: HTMLImageElement | null = null;
              if (w.id === 'geraldo_red') wImg = geraldoRedImageRef.current;
              else if (w.id === 'geraldo_green') wImg = geraldoGreenImageRef.current;
              else if (w.id === 'geraldo_blue') wImg = geraldoBlueImageRef.current;

              const wSize = 44;
              if (wImg && wImg.complete && wImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(wx, wy);
                ctx.globalAlpha = 0.85;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(wImg, -wSize / 2, -wSize / 2, wSize, wSize);
                ctx.restore();
              } else {
                ctx.fillStyle = w.color;
                ctx.beginPath();
                ctx.arc(wx, wy, 16, 0, Math.PI * 2);
                ctx.fill();
              }

              // Shield text
              ctx.font = 'bold 9px sans-serif';
              ctx.fillStyle = '#bae6fd';
              ctx.textAlign = 'center';
              ctx.fillText('SHIELDED', wx, wy + bRadius + 12);

              ctx.restore();
            });

            // 2. Draw Active Wizard (Geraldo The Red/Green at Top Center, Geraldo The Blue at Center-Center)
            const activeWiz = list.find(w => w.id === boss.activeArchmageId);
            if (activeWiz && !activeWiz.isShielded && activeWiz.hp > 0) {
              const ax = (activeWiz.x || boss.x) - cameraX;
              const ay = (activeWiz.y || boss.y) - cameraY;
              const bobY = Math.sin(survivalTimeRef.current * 4) * 4;
              const wizY = ay + bobY;
              const wSize = 64;

              ctx.save();

              // Elemental Aura (Restored without shadow for visibility)
              ctx.fillStyle = activeWiz.color === '#ef4444'
                ? 'rgba(239, 68, 68, 0.25)'
                : activeWiz.color === '#22c55e'
                ? 'rgba(34, 197, 94, 0.25)'
                : 'rgba(59, 130, 246, 0.25)';
              ctx.beginPath();
              ctx.arc(ax, wizY, 36, 0, Math.PI * 2);
              ctx.fill();

              // Temporary Turn Shield (if 200 DMG taken in single attack turn)
              if (activeWiz.isTurnShielded) {
                const bubblePulse = Math.sin(survivalTimeRef.current * 8) * 2;
                const bRadius = 40 + bubblePulse;

                ctx.save();
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 20;
                ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
                ctx.beginPath();
                ctx.arc(ax, wizY, bRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#bae6fd';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ax - bRadius * 0.4, wizY - bRadius * 0.4, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = 'bold 10px sans-serif';
                ctx.fillStyle = '#bae6fd';
                ctx.textAlign = 'center';
                ctx.fillText('SHIELDED', ax, wizY + bRadius + 14);
                ctx.restore();
              }

              let wImg: HTMLImageElement | null = null;
              if (activeWiz.id === 'geraldo_red') wImg = geraldoRedImageRef.current;
              else if (activeWiz.id === 'geraldo_green') wImg = geraldoGreenImageRef.current;
              else if (activeWiz.id === 'geraldo_blue') wImg = geraldoBlueImageRef.current;

              if (wImg && wImg.complete && wImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(ax, wizY);
                ctx.imageSmoothingEnabled = false;
                if (isFlashing) {
                  ctx.filter = 'brightness(300%)';
                }
                ctx.drawImage(wImg, -wSize / 2, -wSize / 2, wSize, wSize);
                ctx.restore();
              } else {
                ctx.fillStyle = isFlashing ? '#ffffff' : activeWiz.color;
                ctx.beginPath();
                ctx.arc(ax, wizY, 26, 0, Math.PI * 2);
                ctx.fill();
              }

              // Mini Health bar
              const barW = 60;
              const barH = 5;
              const barX = ax - barW / 2;
              const barY = wizY - 42;

              ctx.fillStyle = '#1e293b';
              ctx.fillRect(barX, barY, barW, barH);
              ctx.fillStyle = activeWiz.color;
              ctx.fillRect(barX, barY, barW * (activeWiz.hp / activeWiz.maxHp), barH);
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 1;
              ctx.strokeRect(barX, barY, barW, barH);

              ctx.restore();
            }
          } else if (boss.archmagesPhase === 'MERGING') {
            const list = boss.archmagesList || [];
            list.forEach((w) => {
              const wx = w.x - cameraX;
              const wy = w.y - cameraY;
              const wSize = 52;

              let wImg: HTMLImageElement | null = null;
              if (w.id === 'geraldo_red') wImg = geraldoRedImageRef.current;
              else if (w.id === 'geraldo_green') wImg = geraldoGreenImageRef.current;
              else if (w.id === 'geraldo_blue') wImg = geraldoBlueImageRef.current;

              ctx.save();
              ctx.shadowColor = w.color;
              ctx.shadowBlur = 20;

              // Arc line to center
              ctx.strokeStyle = w.color;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(wx, wy);
              ctx.lineTo(bx, by);
              ctx.stroke();

              if (wImg && wImg.complete && wImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(wx, wy);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(wImg, -wSize / 2, -wSize / 2, wSize, wSize);
                ctx.restore();
              } else {
                ctx.fillStyle = w.color;
                ctx.beginPath();
                ctx.arc(wx, wy, 20, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            });
          } else if (boss.archmagesPhase === 'PHASE2') {
            // GERALDO THE RGB RENDERING (Clean & Non-Laggy)
            const bobY = Math.sin(survivalTimeRef.current * 4) * 4;
            const rgbY = by + bobY;
            const rSize = 76;

            ctx.save();
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;

            // Cycle between Geraldo Sprites every fourth of a second: RGB -> Red -> RGB -> Green -> RGB -> Blue
            const cycleIndex = Math.floor(survivalTimeRef.current * 4) % 6;
            let targetImg: HTMLImageElement | null = null;
            if (cycleIndex === 0 || cycleIndex === 2 || cycleIndex === 4) {
              targetImg = geraldoRgbImageRef.current;
            } else if (cycleIndex === 1) {
              targetImg = geraldoRedImageRef.current;
            } else if (cycleIndex === 3) {
              targetImg = geraldoGreenImageRef.current;
            } else if (cycleIndex === 5) {
              targetImg = geraldoBlueImageRef.current;
            }

            const activeSprite = (targetImg && targetImg.complete && targetImg.naturalWidth > 0)
              ? targetImg
              : (geraldoRgbImageRef.current && geraldoRgbImageRef.current.complete && geraldoRgbImageRef.current.naturalWidth > 0)
              ? geraldoRgbImageRef.current
              : null;

            if (activeSprite) {
              ctx.save();
              ctx.translate(bx, rgbY);
              ctx.imageSmoothingEnabled = false;

              if (isFlashing) {
                ctx.filter = 'brightness(300%)';
              }

              ctx.drawImage(activeSprite, -rSize / 2, -rSize / 2, rSize, rSize);
              ctx.restore();
            } else {
              ctx.fillStyle = isFlashing ? '#ffffff' : '#38bdf8';
              ctx.beginPath();
              ctx.arc(bx, rgbY, 32, 0, Math.PI * 2);
              ctx.fill();
            }

            // Mini health bar for Phase 2
            const barW = 80;
            const barH = 6;
            const barX = bx - barW / 2;
            const barY = rgbY - 50;

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(barX, barY, barW * (boss.hp / boss.maxHp), barH);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            ctx.restore();

            // Draw Synchronized Player Clone if active
            if (archmageCloneRef.current) {
              const clone = archmageCloneRef.current;
              const cx = clone.x - cameraX;
              const cy = clone.y - cameraY;

              const playerImg = witchImageRef.current;
              const baseSize = p.radius * 2 * 1.5;
              let width = baseSize;
              let height = baseSize;

              if (playerImg && playerImg.complete && playerImg.naturalWidth > 0 && playerImg.naturalHeight > 0) {
                const spriteRatio = playerImg.naturalWidth / playerImg.naturalHeight;
                if (spriteRatio >= 1) {
                  width = baseSize;
                  height = baseSize / spriteRatio;
                } else {
                  height = baseSize;
                  width = baseSize * spriteRatio;
                }
              }

              ctx.save();
              ctx.translate(cx, cy);
              if (character?.id !== 'glowob' && lastFacingDirectionRef.current === 'left') {
                ctx.scale(-1, 1);
              }
              ctx.imageSmoothingEnabled = false;
              if (playerImg && playerImg.complete && playerImg.naturalWidth > 0) {
                ctx.drawImage(playerImg, -width / 2, -height / 2, width, height);
              } else {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            }
          }
        } else if (boss.id === 'googolbra') {
          // --- GOOGOLBRA BOSS RENDERING ---
          const camX = cameraX;
          const camY = cameraY;
          const tileSize = 80;

          // 1. Telegraph Warning Indicator for Zebra Pattern
          if (googolbraStateRef.current === 'ZEBRA_TELEGRAPH') {
            const zState = googolbraZebraStateRef.current;
            const isVert = zState.isVertical;
            const stripes = zState.stripes;
            const cam = lockedCameraRef.current;
            const cols = Math.floor(canvas.width / tileSize);
            const rows = Math.floor(canvas.height / tileSize);
            const pulse = 0.35 + 0.2 * Math.sin(Date.now() / 90);

            ctx.save();
            ctx.fillStyle = `rgba(6, 182, 212, ${pulse})`;
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;

            if (isVert) {
              stripes.forEach((colIdx) => {
                const sx = cam.x + colIdx * tileSize - camX;
                const sy = cam.y - camY;
                const sh = rows * tileSize;
                ctx.fillRect(sx, sy, tileSize, sh);
                ctx.strokeRect(sx, sy, tileSize, sh);

                // Warning diagonal hazard stripes
                ctx.save();
                ctx.beginPath();
                ctx.rect(sx, sy, tileSize, sh);
                ctx.clip();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 4;
                for (let hy = -tileSize; hy < sh + tileSize; hy += 32) {
                  ctx.beginPath();
                  ctx.moveTo(sx, sy + hy);
                  ctx.lineTo(sx + tileSize, sy + hy + tileSize);
                  ctx.stroke();
                }
                ctx.restore();
              });
            } else {
              stripes.forEach((rowIdx) => {
                const sx = cam.x - camX;
                const sy = cam.y + rowIdx * tileSize - camY;
                const sw = cols * tileSize;
                ctx.fillRect(sx, sy, sw, tileSize);
                ctx.strokeRect(sx, sy, sw, tileSize);

                // Warning diagonal hazard stripes
                ctx.save();
                ctx.beginPath();
                ctx.rect(sx, sy, sw, tileSize);
                ctx.clip();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 4;
                for (let hx = -tileSize; hx < sw + tileSize; hx += 32) {
                  ctx.beginPath();
                  ctx.moveTo(sx + hx, sy);
                  ctx.lineTo(sx + hx + tileSize, sy + tileSize);
                  ctx.stroke();
                }
                ctx.restore();
              });
            }

            // Telegraph Countdown Banner
            const lang = getLanguage();
            const warningText = lang === 'pt-BR'
              ? `⚡ PADRÃO ZEBRA IMINENTE! ${Math.max(0, zState.timer).toFixed(1)}s ⚡`
              : `⚡ ZEBRA STRIKE IMMINENT! ${Math.max(0, zState.timer).toFixed(1)}s ⚡`;
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.fillText(warningText, canvas.width / 2, 90);
            ctx.shadowBlur = 0;
            ctx.restore();
          }

          // 2. Render Body Segments (Rendered from tail to front)
          const bodySegments = googolbraCurrentSegmentsRef.current;
          const bodySprite = googolbraBodyImageRef.current;
          const hasBodySprite = bodySprite && bodySprite.complete && bodySprite.naturalWidth > 0;

          for (let i = bodySegments.length - 1; i >= 0; i--) {
            const seg = bodySegments[i];
            const sx = seg.x - camX;
            const sy = seg.y - camY;

            ctx.save();
            ctx.translate(sx, sy);

            if (hasBodySprite) {
              ctx.rotate(seg.angle - Math.PI);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(bodySprite, -40, -40, 80, 80);
            } else {
              // High-tech Mathematical Realm Serpent Segment Fallback
              ctx.fillStyle = '#0891b2';
              ctx.strokeStyle = '#22d3ee';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(0, 0, 36, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Digit '0' representing Googol zeros
              ctx.fillStyle = '#cffafe';
              ctx.font = 'bold 22px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('0', 0, 0);
            }

            ctx.restore();
          }

          // 3. Render Snake Head
          const headSprite = googolbraHeadImageRef.current;
          const hasHeadSprite = headSprite && headSprite.complete && headSprite.naturalWidth > 0;
          const hx = boss.x - camX;
          const hy = boss.y - camY;

          ctx.save();
          ctx.translate(hx, hy);

          if (isFlashing) {
            ctx.filter = 'brightness(300%)';
          }

          if (hasHeadSprite) {
            // Source sprite is facing left, rotate by (angle - Math.PI) so it faces movement direction
            ctx.rotate(googolbraHeadAngleRef.current - Math.PI);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(headSprite, -40, -40, 80, 80);
          } else {
            ctx.rotate(googolbraHeadAngleRef.current);
            // High-tech Mathematical Realm Serpent Head Fallback
            ctx.fillStyle = '#0e7490';
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 38, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Glowing Eyes
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(14, -12, 6, 0, Math.PI * 2);
            ctx.arc(14, 12, 6, 0, Math.PI * 2);
            ctx.fill();

            // Crown / Horn of the Googol
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('10¹⁰⁰', -6, 0);
          }
          ctx.restore();

          // 4. Constriction Repel Progress Ring (around the Head)
          if (googolbraStateRef.current === 'CONSTRICTION') {
            const threshold = boss.maxHp / 5;
            const dealt = Math.min(threshold, googolbraConstrictionDamageTakenRef.current);
            const repelPct = dealt / threshold;

            ctx.save();
            ctx.translate(hx, hy);

            // Progress ring
            ctx.beginPath();
            ctx.arc(0, 0, 48, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 48, -Math.PI / 2, -Math.PI / 2 + repelPct * Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Repel badge text
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e0f2fe';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 4;
            const lang = getLanguage();
            const repelLabel = lang === 'pt-BR'
              ? `REPELIR: ${Math.round(repelPct * 100)}%`
              : `REPEL: ${Math.round(repelPct * 100)}%`;
            ctx.fillText(repelLabel, 0, -56);
            ctx.restore();
          }

          // 5. Sssneak Attack Grasp Constriction Aura
          if (googolbraStateRef.current === 'SNEAK_GRASP') {
            const sneak = googolbraSneakStateRef.current;
            const inDamage = sneak.graspTimer >= 5.0;
            const px = p.x - camX;
            const py = p.y - camY;

            ctx.save();
            ctx.translate(px, py);

            // Pulsing constriction rings
            const ringPulse = (Date.now() % 1000) / 1000;
            ctx.beginPath();
            ctx.arc(0, 0, 42 + ringPulse * 32, 0, Math.PI * 2);
            ctx.strokeStyle = inDamage ? `rgba(239, 68, 68, ${1 - ringPulse})` : `rgba(56, 189, 248, ${1 - ringPulse})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Threat warning text above player
            const lang = getLanguage();
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            if (!inDamage) {
              const remaining = Math.max(0, 5.0 - sneak.graspTimer).toFixed(1);
              ctx.fillStyle = '#fef08a';
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 6;
              ctx.fillText(lang === 'pt-BR' ? `ESMAGAMENTO EM: ${remaining}s!` : `CRUSH IN: ${remaining}s!`, 0, -68);
            } else {
              ctx.fillStyle = '#f87171';
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 8;
              ctx.fillText(lang === 'pt-BR' ? `SOFRENDO ESMAGAMENTO!` : `SUFFERING CRUSH DAMAGE!`, 0, -68);
            }

            ctx.restore();
          }
        } else if (boss.id === 'phiboccion') {
          // --- PHIBOCCION BOSS RENDERING ---
          const r = boss.radius;
          const isKicking = boss.isKicking || boss.phiboccionState === 'KICKING';

          // Float bobbing effect if NOT actively kicking
          const bobY = isKicking ? 0 : Math.sin(survivalTimeRef.current * 4) * 8;
          const px = bx;
          const py = by + bobY;
          const size = r * 5.0;

          // Get active sprite
          const spriteImg = isKicking ? phiboccionKickingImageRef.current : phiboccionImageRef.current;
          if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(px, py);
            ctx.imageSmoothingEnabled = false;

            // Rotate legs facing the kick dash direction if kicking
            if (isKicking && boss.phiboccionAngle !== undefined) {
              ctx.rotate(boss.phiboccionAngle - Math.PI / 2);
            } else if (!isKicking) {
              const facingLeft = p.x < boss.x;
              if (facingLeft) {
                ctx.scale(-1, 1);
              }
            }

            if (isFlashing) {
              ctx.filter = 'brightness(300%)';
            }

            ctx.drawImage(spriteImg, -size / 2, -size / 2, size, size);
            ctx.restore();
          } else {
            // High-quality Golden Ratio fallback shape
            ctx.save();
            ctx.translate(px, py);

            if (isFlashing) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = '#eab308';
            }

            ctx.beginPath();
            ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isFlashing ? '#ffffff' : '#fef08a';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -r * 1.2);
            ctx.lineTo(0, r * 1.2);
            ctx.stroke();

            ctx.fillStyle = isFlashing ? '#ffffff' : '#78350f';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }

          // Invincibility barrier bubble (glowing white/gold shield) if invincible
          if (boss.isInvincible) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(px, py, r * 1.35, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
            ctx.beginPath();
            ctx.arc(px, py, r * 1.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else if (boss.id === 'pythagoras') {
          // --- PYTHAGORAS BOSS RENDERING ---
          const r = boss.radius;
          const bobY = Math.sin(survivalTimeRef.current * 3) * 6;
          const px = bx;
          const py = by + bobY;
          const size = r * 3.5;

          const spriteImg = pythagorasImageRef.current;
          if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(px, py);
            ctx.imageSmoothingEnabled = false;

            const facingLeft = p.x < boss.x;
            if (facingLeft) {
              ctx.scale(-1, 1);
            }

            if (isFlashing) {
              ctx.filter = 'brightness(300%)';
            }

            ctx.drawImage(spriteImg, -size / 2, -size / 2, size, size);
            ctx.restore();
          } else {
            // High-quality Pythagoras fallback shape
            ctx.save();
            ctx.translate(px, py);

            ctx.fillStyle = isFlashing ? '#ffffff' : '#8b5cf6';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isFlashing ? '#ffffff' : '#c084fc';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            ctx.restore();
          }
        }

        // Visible Burn effect on Boss
        if (boss.burnDuration && boss.burnDuration > 0) {
          ctx.save();
          const bPulse = Math.sin(survivalTimeRef.current * 8) * 3;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20 + bPulse;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 + Math.sin(survivalTimeRef.current * 10) * 0.2})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(bx, by, (boss.radius || 45) + 6 + bPulse * 0.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
          ctx.beginPath();
          ctx.arc(bx, by, (boss.radius || 45) + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Visible Acid effect on Boss
        if (boss.acidDuration && boss.acidDuration > 0) {
          ctx.save();
          const bPulse = Math.sin(survivalTimeRef.current * 8) * 3;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20 + bPulse;
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.8 + Math.sin(survivalTimeRef.current * 10) * 0.2})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(bx, by, (boss.radius || 45) + 6 + bPulse * 0.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(34, 197, 94, 0.14)';
          ctx.beginPath();
          ctx.arc(bx, by, (boss.radius || 45) + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // 8. Render THE WITCH (Main Character - Rendered dynamically at player position on screen)
      const playerScreenX = p.x - cameraX;
      const playerScreenY = p.y - cameraY;

      ctx.save();
      if (playerInvincibleTimerRef.current > 0) {
        // Model slightly flashes during invincibility period (oscillating alpha)
        const isFlashed = Math.floor(playerInvincibleTimerRef.current * 16) % 2 === 0;
        ctx.globalAlpha = isFlashed ? 0.35 : 0.95;
      }
      if (witchImageRef.current) {
        const img = witchImageRef.current;
        // Balance dimensions: base size on player radius, strictly preserving sprite aspect ratio without vertical stretching
        const baseSize = p.radius * 2 * 1.5;
        let width = baseSize;
        let height = baseSize;

        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          const spriteRatio = img.naturalWidth / img.naturalHeight;
          if (spriteRatio >= 1) {
            width = baseSize;
            height = baseSize / spriteRatio;
          } else {
            height = baseSize;
            width = baseSize * spriteRatio;
          }
        }

        ctx.translate(playerScreenX, playerScreenY);

        // Flip horizontally based on movement direction / last moved direction (for characters that mirror)
        // GlOwOb does not mirror, keeping it always facing to the right
        const allowMirror = character?.id !== 'glowob';
        if (allowMirror) {
          if (p.isDashing && Math.abs(dashVxRef.current) > 0.1) {
            lastFacingDirectionRef.current = dashVxRef.current < 0 ? 'left' : 'right';
          }

          if (lastFacingDirectionRef.current === 'left') {
            ctx.scale(-1, 1);
          }
        }

        // GlOwOb: slightly stretch vertically while walking (playful gooey bounce)
        if (character?.id === 'glowob' && isPlayerWalkingRef.current) {
          const cycle = Math.sin(playerWalkAnimTimeRef.current);
          const scaleY = 1.0 + cycle * 0.12;
          const scaleX = 1.0 - cycle * 0.05;
          ctx.scale(scaleX, scaleY);
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

      // 8.5 Render PET PLANT COMPANION (Mega Evolution: Pet Plant)
      const vineSnareCheck = weaponsRef.current.find(w => w.id === 'vine_snare');
      if (vineSnareCheck && vineSnareCheck.level >= 7) {
        const pet = petPlantStateRef.current;
        const petScreenX = (pet.x + pet.lungeOffsetX) - cameraX;
        const petScreenY = (pet.y + pet.lungeOffsetY) - cameraY;
        const petSize = 28; // Small cute pet plant size

        ctx.save();
        ctx.translate(petScreenX, petScreenY);

        // Face towards attack angle or player orientation
        const isFacingLeft = pet.lungeOffsetX !== 0 ? pet.lungeOffsetX < 0 : (pet.x < p.x);
        if (isFacingLeft) {
          ctx.scale(-1, 1);
        }

        // When biting, use the Mouth Closed model for quick snap animation, otherwise open mouth model
        const plantImg = pet.isBiting 
          ? (carnivorePlantClosedImageRef.current || carnivorePlantImageRef.current) 
          : (carnivorePlantImageRef.current || carnivorePlantClosedImageRef.current);

        if (plantImg && plantImg.complete && plantImg.naturalWidth > 0) {
          ctx.imageSmoothingEnabled = false;
          // Subtle hover bob
          const petBob = Math.sin(curTime * 5) * 2;
          ctx.drawImage(plantImg, -petSize / 2, -petSize / 2 + petBob, petSize, petSize);
        } else {
          // Fallback procedural small pet plant
          ctx.fillStyle = pet.isBiting ? '#15803d' : '#22c55e';
          ctx.beginPath();
          ctx.arc(0, 0, petSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Small green magic aura ring under pet
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, petSize * 0.4, 10, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

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

      // 11. Custom Crosshair at Mouse / Virtual Aiming Reticle
      ctx.save();
      const mx = mouseScreenRef.current.x;
      const my = mouseScreenRef.current.y;
      if (mobileModeRef.current) {
        // Glowing mobile aim reticle
        ctx.strokeStyle = isCursorJoystickActiveRef.current ? '#fb7185' : '#e879f9';
        ctx.lineWidth = 2;
        ctx.shadowColor = isCursorJoystickActiveRef.current ? 'rgba(244, 63, 94, 0.75)' : 'rgba(232, 121, 249, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.moveTo(mx - 15, my);
        ctx.lineTo(mx - 5, my);
        ctx.moveTo(mx + 5, my);
        ctx.lineTo(mx + 15, my);
        ctx.moveTo(mx, my - 15);
        ctx.lineTo(mx, my - 5);
        ctx.moveTo(mx, my + 5);
        ctx.lineTo(mx, my + 15);
        ctx.stroke();

        // Inner targeting pip
        ctx.fillStyle = isCursorJoystickActiveRef.current ? '#f43f5e' : '#c084fc';
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.moveTo(mx - 12, my);
        ctx.lineTo(mx + 12, my);
        ctx.moveTo(mx, my - 12);
        ctx.lineTo(mx, my + 12);
        ctx.stroke();
      }
      ctx.restore();

      // --- DRAW PHIBOCCION FIBONACCI INTRO SEQUENCE ---
      if (bossInstanceRef.current && bossInstanceRef.current.id === 'phiboccion' && bossInstanceRef.current.phiboccionState === 'FIBONACCI_INTRO') {
        ctx.save();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 60;
        const step = phiboccionFibIntroStepRef.current;
        const texts = ["SHOW", "ME", "THE", "FIBONACCI SEQUENCE!!!"];
        const currentText = texts[step] || "FIBONACCI SEQUENCE!!!";

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, cy - 80, canvas.width, 160);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, cy - 80);
        ctx.lineTo(canvas.width, cy - 80);
        ctx.moveTo(0, cy + 80);
        ctx.lineTo(canvas.width, cy + 80);
        ctx.stroke();

        ctx.font = 'bold 44px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 20;
        ctx.fillText(currentText, cx, cy + 12);
        ctx.restore();
      }

      // --- DRAW PHIBOCCION MATH KEYPAD CHALLENGE ---
      if (phiboccionKeypadActiveRef.current) {
        ctx.save();

        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 120;

        const lang = getLanguage();
        const t = (key: string) => UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;

        // Backdrop panel dimming screen
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Core panel box container (with glowing golden border)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cx - 150, cy - 140, 300, 520, 16);
        ctx.fill();
        ctx.stroke();

        // Highlighting top header bar
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 150, cy - 140, 300, 55, [16, 16, 0, 0]);
        ctx.fill();

        // Title text
        const isFib = phiboccionKeypadModeRef.current === 'FIBONACCI';
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(isFib ? 'SAY. SOME. FIBONACCI!!!' : t('math_root_of_strength'), cx, cy - 100);

        // Subtitle instructions
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(isFib ? (lang === 'pt-BR' ? `QUESTÃO ${phiboccionKeypadStageRef.current} DE 50` : `QUESTION ${phiboccionKeypadStageRef.current} OF 50`) : t('math_solve_root').toUpperCase(), cx, cy - 65);

        // Current Stage Indicator
        const stage = phiboccionKeypadStageRef.current;
        if (isFib) {
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#a855f7';
          ctx.fillText(`STAGE ${stage} / 50 (Correct: ${phiboccionKeypadAnswersCorrectRef.current})`, cx, cy - 45);
        } else {
          let dots = '';
          for (let i = 1; i <= 3; i++) {
            if (i < stage) dots += '✓ ';
            else if (i === stage) dots += '● ';
            else dots += '○ ';
          }
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#a855f7';
          ctx.fillText(`${dots}`, cx, cy - 45);
        }

        // Display math question formula (e.g., √144)
        const qData = phiboccionKeypadQuestionRef.current;
        if (qData) {
          ctx.font = 'bold 36px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${qData.q}`, cx, cy);
        }

        // Display user input & underline
        const inputStr = phiboccionKeypadInputRef.current;
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#eab308';
        ctx.fillText(inputStr || '?', cx, cy + 40);

        // Underline for answer area
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy + 50);
        ctx.lineTo(cx + 50, cy + 50);
        ctx.stroke();

        // Display 10-second Countdown bar & remaining time
        const timeLeft = Math.max(0, phiboccionKeypadTimerRef.current);
        const barWidth = 240;
        const fillWidth = barWidth * (timeLeft / 10.0);

        // Bar background
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 120, cy + 65, barWidth, 10, 4);
        ctx.fill();

        // Bar fill (Green to Red transition)
        const g = Math.floor((timeLeft / 10.0) * 255);
        const rVal = Math.floor((1 - timeLeft / 10.0) * 255);
        ctx.fillStyle = `rgb(${rVal}, ${g}, 40)`;
        ctx.beginPath();
        ctx.roundRect(cx - 120, cy + 65, fillWidth, 10, 4);
        ctx.fill();

        // Timer text
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`${timeLeft.toFixed(1)}s`, cx, cy + 90);

        // DRAW BUTTON GRID
        for (let rIdx = 0; rIdx < 4; rIdx++) {
          for (let cIdx = 0; cIdx < 3; cIdx++) {
            const bx = cx - 115 + cIdx * 80;
            const by = cy + 105 + rIdx * 65;
            const bw = 70;
            const bh = 55;

            // Determine label
            let label = '';
            if (rIdx < 3) {
              label = String(7 - rIdx * 3 + cIdx);
            } else {
              if (cIdx === 0) label = t('math_del');
              else if (cIdx === 1) label = '0';
              else label = t('math_enter');
            }

            // Check if mouse hovers over this button
            const isHovered = mx >= bx && mx <= bx + bw && my >= by && my <= by + bh;

            // Draw button background
            ctx.fillStyle = isHovered ? '#334155' : '#1e293b';
            ctx.strokeStyle = isHovered ? '#fef08a' : '#475569';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 8);
            ctx.fill();
            ctx.stroke();

            // Draw button text label
            ctx.font = label.length > 3 ? 'bold 11px monospace' : 'bold 18px monospace';
            ctx.fillStyle = isHovered ? '#ffffff' : '#f8fafc';
            ctx.fillText(label, bx + bw / 2, by + bh / 2 + 6);
          }
        }

        // Feedback Result Banner Overlay (Correct/Wrong/Times Up)
        const resultTimer = phiboccionKeypadResultTimerRef.current || 0;
        const resText = phiboccionKeypadResultTextRef.current || "";
        if (resultTimer > 0 && resText !== "") {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(cx - 140, cy - 40, 280, 110, 12);
          ctx.fill();

          ctx.strokeStyle = resText.includes('CORRECT') ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.font = 'bold 20px monospace';
          ctx.fillStyle = resText.includes('CORRECT') ? '#4ade80' : '#f87171';
          ctx.fillText(resText, cx, cy + 15);

          if (phiboccionKeypadAnswersCorrectRef.current === 3 && resText.includes('CORRECT')) {
            ctx.font = '11px monospace';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(t('math_damage_dealt'), cx, cy + 45);
          }
        }

        ctx.restore();
      }

      // --- DRAW PYTHAGORAS "(MONT)YOUR (HALL) PROBLEM" CHALLENGE ---
      if (pythagorasMontyHallActiveRef.current) {
        ctx.save();

        const lang = getLanguage();
        const t = (key: string) => UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;

        // Dark dim backdrop over arena
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;

        const { doors } = getMontyDoorGeometry(canvas);

        const step = pythagorasMontyStepRef.current;
        const prizeDoor = pythagorasMontyPrizeDoorRef.current;
        const playerPick = pythagorasMontyPlayerPickRef.current;
        const revealedEmpty = pythagorasMontyRevealedEmptyDoorRef.current;
        const finalPick = pythagorasMontyFinalPickRef.current;

        // Top Header Banner
        const bannerW = Math.min(680, canvas.width - 40);
        const bannerH = 95;
        const bannerX = cx - bannerW / 2;
        const bannerY = Math.max(16, doors[0].y - bannerH - 24);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
        ctx.fill();
        ctx.stroke();

        // Header Top Accent
        ctx.fillStyle = '#2e1065';
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, 36, [16, 16, 0, 0]);
        ctx.fill();

        // Title
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText(t('monty_hall_title'), cx, bannerY + 24);

        // Instruction / Subtitle
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#e2e8f0';

        if (step === 'PICK') {
          ctx.fillText(t('monty_pick_instruction'), cx, bannerY + 65);
        } else if (step === 'REVEAL_ANIM') {
          ctx.fillStyle = '#c084fc';
          ctx.fillText(t('monty_revealing'), cx, bannerY + 65);
        } else if (step === 'CHOICE') {
          const otherDoor = [0, 1, 2].find((d) => d !== playerPick && d !== revealedEmpty) ?? 0;
          const choicePrompt = t('monty_choice_instruction')
            .replace('{door}', String(revealedEmpty + 1));
          ctx.fillStyle = '#facc15';
          ctx.fillText(choicePrompt, cx, bannerY + 60);

          ctx.font = '11px monospace';
          ctx.fillStyle = '#94a3b8';
          const subText = lang === 'pt-BR'
            ? `Porta ${playerPick + 1} (Sua escolha atual) vs Porta ${otherDoor + 1} (Alternativa)`
            : `Door ${playerPick + 1} (Current pick) vs Door ${otherDoor + 1} (Alternative)`;
          ctx.fillText(subText, cx, bannerY + 80);
        } else if (step === 'RESULT') {
          if (pythagorasMontyResultTypeRef.current === 'WIN') {
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(t('monty_win_msg'), cx, bannerY + 68);
          } else {
            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(t('monty_lose_msg'), cx, bannerY + 68);
          }
        }

        // Mouse coordinates on canvas
        const mx = mouseScreenRef.current.x;
        const my = mouseScreenRef.current.y;

        // Render each of the 3 Doors
        doors.forEach((d) => {
          const i = d.index;
          const isOpen = (step === 'REVEAL_ANIM' || step === 'CHOICE')
            ? (i === revealedEmpty)
            : (step === 'RESULT'); // all doors revealed on RESULT

          const isPrize = (i === prizeDoor);
          const isPlayerInitialPick = (i === playerPick);

          const isHovered = (
            (mx >= d.x && mx <= d.x + d.w && my >= d.y && my <= d.y + d.h) ||
            (mx >= d.buttonX && mx <= d.buttonX + d.buttonW && my >= d.buttonY && my <= d.buttonY + d.buttonH)
          );

          // Door Outer Arch Frame
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#4338ca';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(d.x - 4, d.y - 4, d.w + 8, d.h + 8, [18, 18, 4, 4]);
          ctx.fill();
          ctx.stroke();

          if (isOpen) {
            // Door Interior Chamber
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(d.x, d.y, d.w, d.h, [14, 14, 0, 0]);
            ctx.clip();

            if (isPrize) {
              // Radiant Golden Chamber
              const grad = ctx.createRadialGradient(d.cx, d.y + d.h * 0.45, 10, d.cx, d.y + d.h * 0.45, d.w);
              grad.addColorStop(0, '#fef08a');
              grad.addColorStop(0.4, '#eab308');
              grad.addColorStop(1, '#713f12');
              ctx.fillStyle = grad;
              ctx.fillRect(d.x, d.y, d.w, d.h);

              // Golden Rays
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 2;
              for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                ctx.beginPath();
                ctx.moveTo(d.cx, d.y + d.h * 0.45);
                ctx.lineTo(d.cx + Math.cos(angle) * d.w, d.y + d.h * 0.45 + Math.sin(angle) * d.h);
                ctx.stroke();
              }

              // Prize Emblem (Geometric Star / Gem)
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(d.cx, d.y + d.h * 0.45, 22, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 3;
              ctx.stroke();

              ctx.font = 'bold 20px monospace';
              ctx.fillStyle = '#ca8a04';
              ctx.textAlign = 'center';
              ctx.fillText('★', d.cx, d.y + d.h * 0.45 + 7);

              // Prize Text
              ctx.font = 'bold 14px monospace';
              ctx.fillStyle = '#1e1b4b';
              ctx.fillText(t('monty_prize_label'), d.cx, d.y + d.h * 0.75);

              ctx.font = 'bold 11px monospace';
              ctx.fillStyle = '#0f172a';
              ctx.fillText('-20% BOSS HP', d.cx, d.y + d.h * 0.88);
            } else {
              // Dark Empty Chamber
              const grad = ctx.createLinearGradient(d.cx, d.y, d.cx, d.y + d.h);
              grad.addColorStop(0, '#090d16');
              grad.addColorStop(1, '#1e293b');
              ctx.fillStyle = grad;
              ctx.fillRect(d.x, d.y, d.w, d.h);

              // Dust / Cobweb detail
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(d.x + 10, d.y + 10);
              ctx.lineTo(d.x + 35, d.y + 35);
              ctx.moveTo(d.x + 10, d.y + 25);
              ctx.lineTo(d.x + 25, d.y + 10);
              ctx.stroke();

              // Empty Symbol (Ghostly Zero / Cross)
              ctx.font = 'bold 26px monospace';
              ctx.fillStyle = '#64748b';
              ctx.textAlign = 'center';
              ctx.fillText('Ø', d.cx, d.y + d.h * 0.45);

              ctx.font = 'bold 13px monospace';
              ctx.fillStyle = '#94a3b8';
              ctx.fillText(t('monty_empty_label'), d.cx, d.y + d.h * 0.72);

              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#ef4444';
              ctx.fillText('-20% YOUR HP', d.cx, d.y + d.h * 0.86);
            }
            ctx.restore();

            // Swung open door panel on the left
            ctx.fillStyle = '#311042';
            ctx.strokeStyle = '#581c87';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 22, d.y + 8);
            ctx.lineTo(d.x - 22, d.y + d.h - 8);
            ctx.lineTo(d.x, d.y + d.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // CLOSED DOOR
            // Stately wooden / mathematical panel
            const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
            grad.addColorStop(0, '#3b0764');
            grad.addColorStop(0.5, '#4c1d95');
            grad.addColorStop(1, '#2e1065');
            ctx.fillStyle = grad;

            const isDoorSelected = (isPlayerInitialPick && (step === 'CHOICE' || step === 'REVEAL_ANIM'));
            ctx.strokeStyle = isDoorSelected ? '#facc15' : (isHovered && step === 'PICK' ? '#a78bfa' : '#6d28d9');
            ctx.lineWidth = isDoorSelected ? 4 : (isHovered ? 3 : 2);

            ctx.beginPath();
            ctx.roundRect(d.x, d.y, d.w, d.h, [14, 14, 0, 0]);
            ctx.fill();
            ctx.stroke();

            // Decorative Panels
            const pw = d.w - 24;
            const ph = (d.h - 50) / 2;
            ctx.strokeStyle = isDoorSelected ? 'rgba(250, 204, 21, 0.4)' : 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 2;

            // Top Panel
            ctx.strokeRect(d.x + 12, d.y + 16, pw, ph);
            // Bottom Panel
            ctx.strokeRect(d.x + 12, d.y + 28 + ph, pw, ph);

            // Door Roman Numeral on Top Panel
            const numerals = ['I', 'II', 'III'];
            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = isDoorSelected ? '#fef08a' : '#ddd6fe';
            ctx.textAlign = 'center';
            ctx.fillText(numerals[i] || String(i + 1), d.cx, d.y + 16 + ph / 2 + 8);

            // Brass Door Knob
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(d.x + d.w - 18, d.y + d.h / 2 + 6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // "YOUR PICK" Badge on Door if Selected
            if (isDoorSelected) {
              ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
              ctx.beginPath();
              ctx.roundRect(d.cx - 46, d.y + d.h - 32, 92, 22, 6);
              ctx.fill();

              ctx.font = 'bold 9px monospace';
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'center';
              ctx.fillText(lang === 'pt-BR' ? 'SUA ESCOLHA' : 'YOUR PICK', d.cx, d.y + d.h - 18);
            }
          }

          // BUTTON BENEATH THE DOOR
          let btnText = '';
          let btnBg = '#1e1b4b';
          let btnBorder = '#6d28d9';
          let btnTextColor = '#ffffff';
          let btnDisabled = false;

          if (step === 'PICK') {
            btnText = t('monty_door_label').replace('{door}', String(i + 1));
            if (isHovered) {
              btnBg = '#4338ca';
              btnBorder = '#facc15';
            }
          } else if (step === 'REVEAL_ANIM' || step === 'CHOICE') {
            if (i === revealedEmpty) {
              btnText = t('monty_empty_label');
              btnBg = '#1e293b';
              btnBorder = '#334155';
              btnTextColor = '#64748b';
              btnDisabled = true;
            } else if (i === playerPick) {
              btnText = t('monty_stay_btn').replace('{door}', String(i + 1));
              btnBg = isHovered ? '#047857' : '#065f46';
              btnBorder = '#34d399';
              btnTextColor = '#ecfdf5';
            } else {
              btnText = t('monty_switch_btn').replace('{door}', String(i + 1));
              btnBg = isHovered ? '#86198f' : '#701a75';
              btnBorder = '#f472b6';
              btnTextColor = '#fdf2f8';
            }
          } else if (step === 'RESULT') {
            if (i === finalPick) {
              if (i === prizeDoor) {
                btnText = lang === 'pt-BR' ? '✓ VENCEU (-20% HP)' : '✓ WIN (-20% HP)';
                btnBg = '#15803d';
                btnBorder = '#4ade80';
              } else {
                btnText = lang === 'pt-BR' ? '✖ VAZIA (-20% HP)' : '✖ EMPTY (-20% HP)';
                btnBg = '#991b1b';
                btnBorder = '#f87171';
              }
            } else {
              btnText = (i === prizeDoor)
                ? (lang === 'pt-BR' ? 'ERA O PRÊMIO' : 'WAS PRIZE')
                : (lang === 'pt-BR' ? 'PORTA VAZIA' : 'EMPTY DOOR');
              btnBg = '#1e293b';
              btnBorder = '#334155';
              btnTextColor = '#94a3b8';
              btnDisabled = true;
            }
          }

          ctx.fillStyle = btnBg;
          ctx.strokeStyle = btnBorder;
          ctx.lineWidth = (isHovered && !btnDisabled) ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.roundRect(d.buttonX, d.buttonY, d.buttonW, d.buttonH, 8);
          ctx.fill();
          ctx.stroke();

          // Button Text
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = btnTextColor;
          ctx.textAlign = 'center';
          ctx.fillText(btnText, d.buttonX + d.buttonW / 2, d.buttonY + d.buttonH / 2 + 4);
        });

        ctx.restore();
      }

      // --- DRAW PYTHAGORAS "GEOMENTO MORI" EQUATIONS HUD (TOP-LEFT) ---
      if (pythagorasGeoMoriActiveRef.current && pythagorasGeoMoriEquationsRef.current.length > 0) {
        ctx.save();
        const state = pythagorasGeoMoriStateRef.current;
        const timer = pythagorasGeoMoriTimerRef.current;
        const lang = getLanguage();
        const t = (key: string) => UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;

        // Position on top-left of canvas screen, below player portrait & HP/EXP bars
        const cardX = mobileModeRef.current ? 12 : 18;
        const cardY = mobileModeRef.current ? 74 : 84;
        const cardW = mobileModeRef.current ? 250 : 275;
        const cardH = 300;

        // Card backdrop with dark mathematical parchment aesthetic
        const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        bgGrad.addColorStop(1, 'rgba(30, 27, 75, 0.95)');
        ctx.fillStyle = bgGrad;
        ctx.strokeStyle = state === 'ACTIVE' ? '#c084fc' : '#8b5cf6';
        ctx.lineWidth = 2.0;

        if (state === 'ACTIVE') {
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Header Title: GeoMento Mori
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'left';
        ctx.fillText('📐 ' + t('geomento_mori_title'), cardX + 14, cardY + 22);

        // Status Badge / Countdown
        const timeLeft = Math.max(0, 2.2 - timer).toFixed(1);
        const badgeText = state === 'TELEGRAPH'
          ? t('geomento_graphing_in').replace('{sec}', timeLeft)
          : t('geomento_curves_active');
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = state === 'TELEGRAPH' ? '#facc15' : '#f87171';
        ctx.textAlign = 'right';
        ctx.fillText(badgeText, cardX + cardW - 14, cardY + 22);

        // Subtitle / Instruction: Origin (0,0) at screen center
        ctx.font = '9.5px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(t('geomento_center_origin'), cardX + 14, cardY + 38);

        // Thin separator rule
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 12, cardY + 44);
        ctx.lineTo(cardX + cardW - 12, cardY + 44);
        ctx.stroke();

        // The 10 equations displayed in top-left
        const eqStartY = cardY + 54;
        pythagorasGeoMoriEquationsRef.current.forEach((eq, idx) => {
          const itemY = eqStartY + idx * 22;

          // Equation row pill matching equation color
          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.strokeStyle = eq.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(cardX + 12, itemY - 9, cardW - 24, 18, 4);
          ctx.fill();
          ctx.stroke();

          // Index tag: (1) to (10) with matching equation color
          ctx.font = 'bold 9.5px monospace';
          ctx.fillStyle = eq.color;
          ctx.textAlign = 'left';
          ctx.fillText(`(${idx + 1})`, cardX + 16, itemY + 3);

          // Formula text: e.g. y = 1 / x, y = x², y = 2·sin(x), etc.
          ctx.font = 'bold 11.5px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(eq.formula, cardX + 44, itemY + 2);

          // Matching color dot indicator
          ctx.fillStyle = eq.color;
          ctx.beginPath();
          ctx.arc(cardX + cardW - 22, itemY - 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }
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

  // Window Resize: Set canvas resolution to exact integer tile grid dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const tileSize = 80;
      // Exact full tile grid count based on landscape / portrait orientation
      const isPortrait = window.innerHeight > window.innerWidth;
      const cols = isPortrait ? 9 : 16;
      const rows = isPortrait ? 16 : 9;

      canvas.width = cols * tileSize;   // 16 * 80 = 1280px (or 9 * 80 = 720px in portrait)
      canvas.height = rows * tileSize;  // 9 * 80 = 720px (or 16 * 80 = 1280px in portrait)
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

export const GameCanvas = React.memo(GameCanvasComponent);
