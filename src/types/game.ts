export type ShootingType = 'NEAREST_ENEMY' | 'MOUSE_DIRECTION' | 'AREA_OF_EFFECT';

export interface BossAttack {
  type:
    | 'CARNIVORE_PLANT_AOE'
    | 'CARNIVORE_PLANT_VINES'
    | 'HAUNTED_EYE_PROJECTILE'
    | 'HAUNTED_EYE_TEAR'
    | 'NIGHT_BEAR_BITE'
    | 'ARCHMAGES_FIREBALL'
    | 'ARCHMAGES_RAINBOW_FIREBALL'
    | 'ARCHMAGES_VINE_TILE_ATTACK'
    | 'ARCHMAGES_THUNDER_STRIKE'
    | 'ARCHMAGES_SPINNING_BEAM';
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  warningTimer: number; // Time until damage
  activeTimer: number; // Time damage is active
  duration: number;
  damage: number;
  radius: number;
  targetAngle?: number;
  color?: string;
  isHoming?: boolean;
  spawnTime?: number;
  maxLife?: number;
  vines?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
  }[];
  safeSpots?: {
    x: number;
    y: number;
    radius: number;
  }[];
  hasHit?: boolean;
}

export interface BossDefinition {
  id: string;
  name: string;
  maxHp: number;
  damage: number;
  radius: number;
  widthRadius?: number;
  heightRadius?: number;
  color: string;
  spriteUrl?: string;
  fallbackSpriteUrl?: string;
}

export interface ArchmageState {
  id: 'geraldo_red' | 'geraldo_green' | 'geraldo_blue';
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  isShielded: boolean;
  isTurnShielded?: boolean;
  turnDamageTaken?: number;
  color: string;
}

export interface BossInstance {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  radius: number;
  widthRadius?: number;
  heightRadius?: number;
  x: number;
  y: number;
  color: string;
  attacks: BossAttack[];
  vineRootedDuration?: number;
  frozenTimer?: number;
  burnDuration?: number;
  burnTickTimer?: number;
  burnDamagePerTick?: number;
  acidDuration?: number;
  acidTickTimer?: number;
  acidDamagePerTick?: number;
  eyeState?: 'CLOSED' | 'WARNING' | 'OPEN';
  eyeTimer?: number;
  lastHitBy?: string;
  archmagesPhase?: 'PHASE1' | 'MERGING' | 'PHASE2';
  activeArchmageId?: 'geraldo_red' | 'geraldo_green' | 'geraldo_blue' | 'geraldo_rgb' | null;
  archmagesList?: ArchmageState[];
}

export interface WeaponTier {
  tier: number;
  name: string;
  description: string;
  damageBonus: number;
  fireRateBonus: number; // multiplier to attack interval (lower is faster)
  countBonus: number;
  sizeBonus: number;
  pierceBonus: number;
  speedBonus?: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  shootingType: ShootingType;
  icon: string;
  baseDamage: number;
  baseInterval: number; // in seconds
  baseSpeed: number;
  baseSize: number;
  basePierce: number;
  baseCount: number;
  description: string;
  unlockCondition?: string;
  isLegendary?: boolean;
  bulletColor: string;
  iconColor?: string;
  tiers: WeaponTier[];
}

export interface StatItemTier {
  tier: number;
  name: string;
  description: string;
  statValue: number;
}

export interface StatItemDefinition {
  id: string;
  name: string;
  statType: 'VAMPIRISM' | 'PROJECTILE_SIZE' | 'KNOCKBACK' | 'DASH_COOLDOWN' | 'MOVE_SPEED' | 'DAMAGE_BOOST' | 'MAGNET_RADIUS' | 'MAX_HEALTH' | 'EXTRA_CHOICES' | 'DESTINY_CONTROL' | 'MEDUSA_SLOW' | 'DASH_DAMAGE' | 'DAMAGE_REDUCTION';
  icon: string;
  description: string;
  unlockCondition?: string;
  isLegendary?: boolean;
  color: string;
  tiers: StatItemTier[];
}

export interface CurseChoice {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  unlockCondition?: string;
  isLegendary?: boolean;
  icon: string;
  color: string;
  effect: 'RESET_GUNS_MAX_PASSIVES' | 'TRIPLE_ONE_GUN' | 'DIVIDE_HP_DOUBLE_DMG' | 'SWARM_TRIPLE_EXP' | 'PHANTOM_DASH' | 'DEJA_VU' | 'VAMPIRES_BITE';
}

export interface OwnedWeapon {
  id: string;
  level: number; // 1 to 6
  lastFired: number;
  statsMultiplier?: number;
  kills?: number;
}

export interface OwnedStatItem {
  id: string;
  level: number; // 1 to 6
  kills?: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  speed: number;
  radius: number;
  damage: number;
  exp: number;
  color: string;
  name: string;
  type: 'BAT' | 'GHOUL' | 'WRAITH' | 'MINI_EYE' | 'ROCK_THROWER';
  vx: number;
  vy: number;
  hitFlashTimer: number;
  attackCooldown: number;
  isRed?: boolean;
  vineRootedDuration?: number;
  frozenTimer?: number;
  burnDuration?: number;
  burnTickTimer?: number;
  burnDamagePerTick?: number;
  acidDuration?: number;
  acidTickTimer?: number;
  acidDamagePerTick?: number;
  lastHitBy?: string;
  facingDir?: number; // 1 for facing right, -1 for facing left
  rockThrowTimer?: number;
  rockTelegraphTimer?: number;
  targetAngle?: number;
  targetDistance?: number;
}

export interface Projectile {
  id: number;
  weaponId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  color: string;
  pierce: number;
  duration: number;
  maxDuration: number;
  knockback: number;
  vampirismRatio: number;
  isOrbit?: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
  isAoE?: boolean;
  isBoomerang?: boolean;
  homingTargetId?: number | null;
  vineRootDuration?: number;
  burnDuration?: number;
  burnDamagePerTick?: number;
  acidDuration?: number;
  acidDamagePerTick?: number;
  isExplosive?: boolean;
  explosionRadius?: number;
  explosionDamage?: number;
  isLaser?: boolean;
  freezeDuration?: number;
  chainMax?: number;
  chainFreeze?: number;
  hasChained?: boolean;
  hitEnemyIds?: Set<number>;
  hitBoss?: boolean;
}

export interface AreaZone {
  id: number;
  weaponId: string;
  x: number;
  y: number;
  radius: number;
  damage: number;
  duration: number;
  maxDuration: number;
  color: string;
  tickInterval: number;
  lastTick: number;
  vampirismRatio: number;
}

export interface NovaPulse {
  id: number;
  weaponId: string;
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  duration: number;
  maxDuration: number;
  damage: number;
  color: string;
  vampirismRatio: number;
  knockback: number;
  hitEnemyIds: Set<number>;
}

export interface ExpGem {
  id: number;
  x: number;
  y: number;
  value: number;
  color: string;
  radius: number;
}

export interface WorldPickup {
  id: number;
  type: 'FOOD' | 'MAGNET';
  x: number;
  y: number;
  healAmount?: number;
  radius: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface PlayerStats {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  dashCooldown: number; // default 3.0
  dashTimer: number; // counting down to 0
  isDashing: boolean;
  dashDuration: number;
  vampirism: number; // decimal percentage e.g. 0.15 = 15%
  projectileSizeMult: number; // 1.0 default
  knockbackMult: number; // 1.0 default
  damageMult: number; // 1.0 default
  magnetRadius: number; // base 90
  hpRegen: number; // hp per second
  damageReduction?: number; // decimal reduction e.g. 0.05 = 5% less damage taken (up to 0.25)
  expMultiplier?: number; // default 1.0
  dashDamage?: number; // damage dealt to enemies during dash
  isGlassTank?: boolean;
  isVampireBite?: boolean;
}

export type DashMode = 'MOVEMENT' | 'CURSOR';
export type MobileAimMode = 'JOYSTICK' | 'TOUCH';

export interface GameOptions {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 100
  dashMode: DashMode; // 'MOVEMENT' (default) | 'CURSOR'
  screenShake: boolean;
  damageNumbers: boolean;
  mobileMode: boolean;
  mobileAimMode?: MobileAimMode; // 'JOYSTICK' (default) | 'TOUCH'
  brightness: number; // 50 to 150 (percentage)
  language?: string;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  title: string;
  startingWeaponId: string;
  startingWeaponName: string;
  startingStatItemId?: string;
  startingStatItemName?: string;
  megaEvolutionName?: string;
  baseMaxHp: number;
  speedMultiplier: number;
  speedLabel: string;
  startingLevelBonus?: number;
  description: string;
  spriteUrl: string;
  fallbackSpriteUrl?: string;
  color: string;
}

