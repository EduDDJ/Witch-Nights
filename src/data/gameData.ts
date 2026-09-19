import { WeaponDefinition, StatItemDefinition, CurseChoice, BossDefinition, CharacterDefinition } from '../types/game';

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'ruby',
    name: 'Ruby',
    title: 'Misunderstood Witch',
    startingWeaponId: 'arcane_wand',
    startingWeaponName: 'Stellar Beam',
    megaEvolutionName: 'Stellar Laser',
    baseMaxHp: 100,
    speedMultiplier: 1.1,
    speedLabel: '1.1x',
    description: 'A good hearted woman born as a witch, fending herself because of that. And they call *her* the monster.',
    spriteUrl: 'assets/aistudio/witch.png',
    fallbackSpriteUrl: 'https://i.imgur.com/uvH316Y.png',
    color: '#a855f7',
  },
  {
    id: 'glowob',
    name: 'GlOwOb',
    title: 'Just a Goo',
    startingWeaponId: 'brimstone_shotgun',
    startingWeaponName: 'Acid Pellets',
    megaEvolutionName: 'Acidic Wave',
    baseMaxHp: 75,
    speedMultiplier: 1.25,
    speedLabel: '1.25x',
    description: "Just a goo. People treat them like a monster, when all they want to do is... to be honest, I'm not entirely sure I know what they do.",
    spriteUrl: 'assets/aistudio/glowob.png',
    fallbackSpriteUrl: 'https://i.imgur.com/xNWJ044.png',
    color: '#22c55e',
  },
  {
    id: 'odalia',
    name: 'Odalia',
    title: 'Chosen Protector',
    startingWeaponId: 'astral_sword',
    startingWeaponName: 'Astral Blade',
    startingStatItemId: 'shield_of_protection',
    startingStatItemName: 'Shield of Protection',
    megaEvolutionName: 'Astral Transformation',
    baseMaxHp: 120,
    speedMultiplier: 1.05,
    speedLabel: '1.05x',
    description: "A former villain, chosen and converted by a higher organization to protect the injusticed. That's why she's here.",
    spriteUrl: 'assets/aistudio/odalia.png',
    fallbackSpriteUrl: 'https://i.imgur.com/VAvCvjR.png',
    color: '#38bdf8',
  },
  {
    id: 'geraldo',
    name: 'Geraldo The Red',
    title: 'RGB Archmage',
    startingWeaponId: 'seeking_wisp',
    startingWeaponName: 'Fire Wisp',
    megaEvolutionName: 'Fireball!!!',
    baseMaxHp: 100,
    speedMultiplier: 1.1,
    speedLabel: '1.1x',
    description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.',
    spriteUrl: 'assets/aistudio/geraldo.png',
    fallbackSpriteUrl: 'https://i.imgur.com/v80iCki.png',
    color: '#ef4444',
  },
  {
    id: 'geraldo_green',
    name: 'Geraldo The Green',
    title: 'RGB Archmage',
    startingWeaponId: 'vine_snare',
    startingWeaponName: 'Vine Snare',
    megaEvolutionName: 'Pet Plant',
    baseMaxHp: 100,
    speedMultiplier: 1.1,
    speedLabel: '1.1x',
    startingLevelBonus: 1,
    description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.',
    spriteUrl: 'assets/aistudio/geraldo_green.png',
    fallbackSpriteUrl: 'https://i.imgur.com/k6tO808.png',
    color: '#22c55e',
  },
  {
    id: 'geraldo_blue',
    name: 'Geraldo The Blue',
    title: 'RGB Archmage',
    startingWeaponId: 'thunderstrike',
    startingWeaponName: 'Thunderstrike',
    megaEvolutionName: 'Thunderstorm',
    baseMaxHp: 100,
    speedMultiplier: 1.1,
    speedLabel: '1.1x',
    description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.',
    spriteUrl: 'assets/aistudio/geraldo_blue.png',
    fallbackSpriteUrl: 'https://i.imgur.com/f9W9M5Z.png',
    color: '#3b82f6',
  },
];


export const BOSS_POOL: BossDefinition[] = [
  {
    id: 'carnivore_plant',
    name: 'Carnivore Plant',
    maxHp: 1200,
    damage: 20,
    radius: 40,
    color: '#22c55e',
    spriteUrl: 'assets/aistudio/carnivore_plant.png',
    fallbackSpriteUrl: 'https://i.imgur.com/kaNPLzb.png',
  },
  {
    id: 'haunted_eye',
    name: 'Haunted Eye',
    maxHp: 800,
    damage: 20,
    radius: 65,
    widthRadius: 155, // Panoramic wide ocular boss (~310px width)
    heightRadius: 55, // ~110px height
    color: '#dc2626',
    spriteUrl: 'assets/aistudio/haunted_eye_open.png',
    fallbackSpriteUrl: 'https://i.imgur.com/caqAbHC.png',
  },
  {
    id: 'night_bear',
    name: 'NightBear',
    maxHp: 800,
    damage: 25,
    radius: 50,
    color: '#3b2f2f', // Dark brown/black bear color
    spriteUrl: 'assets/aistudio/night_bear.png',
    fallbackSpriteUrl: 'https://i.imgur.com/Pjkp2on.png',
  },
  {
    id: 'archmages',
    name: 'The 3 Archmages',
    maxHp: 3000,
    damage: 20,
    radius: 32,
    color: '#a855f7',
    spriteUrl: 'assets/aistudio/geraldo_rgb.png',
    fallbackSpriteUrl: 'https://i.imgur.com/w8qU2F1.png',
  }
];

export const ALL_WEAPONS: WeaponDefinition[] = [
  {
    id: 'arcane_wand',
    name: 'Stellar Beam',
    shootingType: 'MOUSE_DIRECTION',
    icon: 'Sparkles',
    description: 'Direct fire magical arcane shards toward your mouse cursor.',
    baseDamage: 20,
    baseInterval: 0.8,
    baseSpeed: 400,
    baseSize: 15,
    basePierce: 1,
    baseCount: 1,
    bulletColor: '#a855f7',
    tiers: [
      { tier: 1, name: 'Stellar Beam', description: 'Fires 1 arcane shard toward cursor.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Fires 2 additional smaller shards on the sides and deals 30% more damage.', damageBonus: 6, fireRateBonus: 1.0, countBonus: 2, sizeBonus: 0, pierceBonus: 0 },
      { tier: 3, name: '', description: 'All shards pierce +1 enemy. +30% fire rate and +10% damage.', damageBonus: 8, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 0, pierceBonus: 1 },
      { tier: 4, name: '', description: 'Side shards grow to full size and +10% damage.', damageBonus: 10, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 0, pierceBonus: 1 },
      { tier: 5, name: '', description: 'All shards pierce through +1 more enemy. +10% damage.', damageBonus: 12, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 0, pierceBonus: 2 },
      { tier: 6, name: '', description: '+25% Fire Rate and +10% damage.', damageBonus: 14, fireRateBonus: 0.525, countBonus: 2, sizeBonus: 0, pierceBonus: 2 },
      { tier: 7, name: 'Stellar Laser', description: 'Transforms into a devastating laser beam that pierces infinitely.', damageBonus: 14, fireRateBonus: 0.525, countBonus: 0, sizeBonus: 10, pierceBonus: 998 },
    ]
  },
  {
    id: 'brimstone_shotgun',
    name: 'Acid Pellets',
    shootingType: 'MOUSE_DIRECTION',
    icon: 'FlaskConical',
    description: 'Fires corrosive acid pellets toward your cursor in rapid bursts.',
    baseDamage: 12,
    baseInterval: 1.1,
    baseSpeed: 600,
    baseSize: 7,
    basePierce: 1,
    baseCount: 3,
    bulletColor: '#22c55e',
    iconColor: '#a855f7',
    tiers: [
      { tier: 1, name: 'Acid Pellets', description: 'Fires 3 acid pellets, with the middle pellet aiming directly at your cursor.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Every shot fires another 3 pellets right after the first 3 in quick succession.', damageBonus: 4, fireRateBonus: 0.95, countBonus: 0, sizeBonus: 1, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Pellets apply corrosive Acid (7s duration, 1 hit/s dealing 10% attack damage) with a toxic green aura.', damageBonus: 6, fireRateBonus: 0.9, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Fires 2 more pellets in the first volley and 2 more in the second (10 pellets total per shot).', damageBonus: 9, fireRateBonus: 0.85, countBonus: 4, sizeBonus: 3, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Raises Acid duration from 7s to 10s.', damageBonus: 13, fireRateBonus: 0.8, countBonus: 0, sizeBonus: 4, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Every pellet gains +2 penetration, melting through hordes of foes.', damageBonus: 18, fireRateBonus: 0.7, countBonus: 0, sizeBonus: 5, pierceBonus: 2 },
      { tier: 7, name: 'Acidic Wave', description: 'Converts pellet shots into a wide acidic wave dealing double damage, knockbacking foes, and applying Acid for 15s.', damageBonus: 20, fireRateBonus: 0.7, countBonus: 0, sizeBonus: 12, pierceBonus: 998 },
    ]
  },
  {
    id: 'astral_sword',
    name: 'Astral Blade',
    shootingType: 'MOUSE_DIRECTION',
    icon: 'Sword',
    description: 'Swings an ethereal blade in a sweeping cone towards the cursor, expanding from 90° to 180° with upgrades.',
    baseDamage: 30,
    baseInterval: 1.05,
    baseSpeed: 0,
    baseSize: 95,
    basePierce: 999,
    baseCount: 1,
    bulletColor: '#a855f7',
    tiers: [
      { tier: 1, name: 'Astral Blade', description: 'Swings an ethereal blade in a 90° cone towards cursor in short range.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Increases swing cone to 108° and deals +6 damage.', damageBonus: 6, fireRateBonus: 0.95, countBonus: 0, sizeBonus: 5, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Increases swing cone to 126° and deals +8 damage.', damageBonus: 14, fireRateBonus: 0.90, countBonus: 0, sizeBonus: 10, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Increases swing cone to 144° and deals +10 damage.', damageBonus: 24, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 15, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Increases swing cone to 162° and deals +12 damage.', damageBonus: 36, fireRateBonus: 0.80, countBonus: 0, sizeBonus: 20, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Increases swing cone to 180° (full frontal half-circle) and deals +15 damage.', damageBonus: 51, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 25, pierceBonus: 0 },
      { tier: 7, name: 'Astral Transformation', description: 'Blade is always on screen aiming at cursor. Fast movement slashes foes with big damage & knockback, with 50% chance for Burn or Acid.', damageBonus: 65, fireRateBonus: 0.70, countBonus: 0, sizeBonus: 30, pierceBonus: 998 },
    ]
  },
  {
    id: 'toxic_cauldron',
    name: 'Acid Pools',
    shootingType: 'AREA_OF_EFFECT',
    icon: 'Skull',
    description: 'Hurls splashing caustic flasks creating lingering corrosive acid pools on the ground.',
    baseDamage: 5,
    baseInterval: 3.2,
    baseSpeed: 0,
    baseSize: 45,
    basePierce: 999,
    baseCount: 1,
    bulletColor: '#22c55e',
    tiers: [
      { tier: 1, name: 'Acid Pools', description: 'Splashes 1 small corrosive acid pool at nearby ground.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Pools deal +2 damage and expand +10 radius.', damageBonus: 2, fireRateBonus: 0.9, countBonus: 0, sizeBonus: 10, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Throws +1 acid pool per attack (2 pools total).', damageBonus: 4, fireRateBonus: 0.85, countBonus: 1, sizeBonus: 10, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Pools deal +4 damage and recharge 25% faster.', damageBonus: 7, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 15, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Throws +1 more pool (3 pools total) with wider area.', damageBonus: 11, fireRateBonus: 0.65, countBonus: 1, sizeBonus: 20, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Creates 4 massive bubbling acid lakes that dissolve whole hordes.', damageBonus: 18, fireRateBonus: 0.50, countBonus: 2, sizeBonus: 30, pierceBonus: 0 },
    ]
  },
  {
    id: 'grimoire_orbit',
    name: 'Orbiting Grimoire',
    shootingType: 'AREA_OF_EFFECT',
    icon: 'BookOpen',
    description: 'Enchants ancient cursed tomes to orbit around you, damaging any enemy entering your personal space.',
    baseDamage: 18,
    baseInterval: 0.05,
    baseSpeed: 2.2, // angular velocity
    baseSize: 18,
    basePierce: 999,
    baseCount: 1,
    bulletColor: '#22c55e',
    tiers: [
      { tier: 1, name: 'Orbiting Grimoire', description: '1 cursed grimoire spins around the witch at steady speed.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Grimoire rotation speed (r.p.m.) increases by 35%.', damageBonus: 4, fireRateBonus: 0.74, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Adds +1 orbiting grimoire (2 grimoires total).', damageBonus: 7, fireRateBonus: 0.74, countBonus: 1, sizeBonus: 4, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Grimoires rotate 35% faster (r.p.m.) around the witch.', damageBonus: 11, fireRateBonus: 0.55, countBonus: 1, sizeBonus: 6, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Adds +1 orbiting grimoire (3 grimoires total, max books reached).', damageBonus: 16, fireRateBonus: 0.55, countBonus: 2, sizeBonus: 8, pierceBonus: 0 },
      { tier: 6, name: '', description: '3 cosmic tomes rotate in a blazing hyper-velocity vortex (+35% r.p.m.).', damageBonus: 24, fireRateBonus: 0.40, countBonus: 2, sizeBonus: 10, pierceBonus: 0 },
    ]
  },
  {
    id: 'hellfire_nova',
    name: 'Pentagram',
    shootingType: 'AREA_OF_EFFECT',
    icon: 'Pentagram',
    description: 'Emits an expanding circular pulse and glowing pentagram around the witch, incinerating nearby enemies without projectiles.',
    baseDamage: 30,
    baseInterval: 2.1,
    baseSpeed: 0,
    baseSize: 130,
    basePierce: 999,
    baseCount: 1,
    bulletColor: '#22c55e',
    tiers: [
      { tier: 1, name: 'Pentagram', description: 'Emits a 130px circular pulse and glowing star around the witch.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Pulse radius expands (+25px) and deals +8 damage.', damageBonus: 8, fireRateBonus: 0.95, countBonus: 0, sizeBonus: 25, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Pulse recharges quicker and deals +12 damage.', damageBonus: 12, fireRateBonus: 0.90, countBonus: 0, sizeBonus: 25, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Pulse radius expands (+30px) and deals +16 damage.', damageBonus: 16, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 30, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Pulse blast knocks back foes strongly and deals +22 damage.', damageBonus: 22, fireRateBonus: 0.80, countBonus: 0, sizeBonus: 35, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Unleashes an apocalyptic 290px circular pulse and pentagram incinerating all nearby foes.', damageBonus: 36, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 50, pierceBonus: 0 },
    ]
  },
  {
    id: 'seeking_wisp',
    name: 'Fire Wisp',
    shootingType: 'NEAREST_ENEMY',
    icon: 'Flame',
    description: 'Launches blazing fire wisps that autonomously seek out the nearest enemy.',
    baseDamage: 22,
    baseInterval: 1.2,
    baseSpeed: 420,
    baseSize: 10,
    basePierce: 1,
    baseCount: 1,
    bulletColor: '#3b82f6',
    tiers: [
      { tier: 1, name: 'Fire Wisp', description: 'Launches 1 blazing homing fire wisp seeking the nearest monster.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Launches +1 homing fire wisp per volley (2 wisps total) and deals +4 damage.', damageBonus: 4, fireRateBonus: 1.0, countBonus: 1, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Fire wisps fly 30% faster and deal +6 damage.', damageBonus: 6, fireRateBonus: 1.0, speedBonus: 126, countBonus: 1, sizeBonus: 2, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Deals +10 damage and launches +1 homing fire wisp (3 wisps total).', damageBonus: 10, fireRateBonus: 1.0, speedBonus: 126, countBonus: 2, sizeBonus: 4, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Deals +15 damage and strengthens homing trajectory.', damageBonus: 15, fireRateBonus: 1.0, speedBonus: 126, countBonus: 2, sizeBonus: 5, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Detonates a small explosion on impact, dealing direct damage and area splash damage to nearby enemies.', damageBonus: 25, fireRateBonus: 1.0, speedBonus: 126, countBonus: 2, sizeBonus: 8, pierceBonus: 0 },
      { tier: 7, name: 'Fireball!!!', description: "Hurls a colossal Mega Fireball that detonates into a massive explosion on impact, dealing enormous splash damage and igniting all enemies caught within with continuous Burn.", damageBonus: 65, fireRateBonus: 1.45, speedBonus: 126, countBonus: 0, sizeBonus: 26, pierceBonus: 0 },
    ]
  },
  {
    id: 'vine_snare',
    name: 'Vine Snare',
    shootingType: 'NEAREST_ENEMY',
    icon: 'Sprout',
    description: 'Attacks the nearest enemy, dealing damage and trapping them in a visible vine for a few seconds.',
    unlockCondition: 'Defeat the Carnivore Plant Boss to unlock.',
    isLegendary: true,
    baseDamage: 15,
    baseInterval: 4.5,
    baseSpeed: 520,
    baseSize: 14,
    basePierce: 1,
    baseCount: 1,
    bulletColor: '#3b82f6',
    tiers: [
      { tier: 1, name: 'Vine Snare', description: 'Traps 1 nearest enemy in thorny vines for 2.0s. High cooldown.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Decreases vine cooldown by 22%.', damageBonus: 4, fireRateBonus: 0.78, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: '', description: 'Targets +1 additional enemy (2 enemies total).', damageBonus: 7, fireRateBonus: 0.78, countBonus: 1, sizeBonus: 2, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Decreases vine cooldown by 38%.', damageBonus: 11, fireRateBonus: 0.62, countBonus: 0, sizeBonus: 4, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Targets +1 additional enemy (3 enemies total).', damageBonus: 15, fireRateBonus: 0.62, countBonus: 1, sizeBonus: 4, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Rapidly traps 4 nearest enemies in thick thorny vines.', damageBonus: 22, fireRateBonus: 0.44, countBonus: 2, sizeBonus: 6, pierceBonus: 0 },
      { tier: 7, name: 'Pet Plant', description: 'Summons a loyal miniature Carnivore Plant companion that follows you into battle, periodically lunging and viciously biting nearby enemies with snapping jaws while you continue trapping foes.', damageBonus: 40, fireRateBonus: 0.38, countBonus: 2, sizeBonus: 8, pierceBonus: 0 },
    ]
  },
  {
    id: 'thunderstrike',
    name: 'Thunderstrike',
    shootingType: 'NEAREST_ENEMY',
    icon: 'Zap',
    description: 'A strong homing lightning weapon with high cooldown that strikes the nearest enemy.',
    baseDamage: 30,
    baseInterval: 2.2,
    baseSpeed: 550,
    baseSize: 14,
    basePierce: 1,
    baseCount: 1,
    bulletColor: '#3b82f6',
    iconColor: '#3b82f6',
    tiers: [
      { tier: 1, name: 'Thunderstrike', description: 'Shoots a Thunderstrike at the closest enemy, dealing 30 damage. High cooldown.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: '', description: 'Thunderstrike freezes enemies hit by 0.5 second.', damageBonus: 6, fireRateBonus: 0.95, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: '', description: 'After first hit, smaller thunderstrikes chain off the first enemy, dealing 50% damage to other enemies nearby, to a max of 2.', damageBonus: 12, fireRateBonus: 0.90, countBonus: 0, sizeBonus: 4, pierceBonus: 0 },
      { tier: 4, name: '', description: 'Thunderstrike can now chain off to 4 enemies.', damageBonus: 18, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 6, pierceBonus: 0 },
      { tier: 5, name: '', description: 'Thunderstrike now freezes the enemy hit for 0.75s.', damageBonus: 25, fireRateBonus: 0.80, countBonus: 0, sizeBonus: 8, pierceBonus: 0 },
      { tier: 6, name: '', description: 'Chained off Thunderstrikes now freeze the enemy hit for 0.5s.', damageBonus: 34, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 10, pierceBonus: 0 },
      { tier: 7, name: 'Thunderstorm', description: 'Shoots 2 Thunderstrikes simultaneously. Creates an area around the player that slows down enemies by 10%.', damageBonus: 45, fireRateBonus: 0.65, countBonus: 1, sizeBonus: 14, pierceBonus: 1 },
    ]
  }
];

export const ALL_STAT_ITEMS: StatItemDefinition[] = [
  {
    id: 'medusas_eye',
    name: "Medusa's Eye",
    statType: 'MEDUSA_SLOW',
    icon: 'Eye',
    description: "An ancient, petrifying gaze that slows down all enemies within a radius of your cursor, turning them slightly gray.",
    unlockCondition: "Defeat the Haunted Eye Boss to unlock.",
    isLegendary: true,
    color: '#d97706', // darkish orange for legendary
    tiers: [
      { tier: 1, name: "Medusa's Eye", description: 'Slows enemies near cursor by 25% (32px radius).', statValue: 0.25 },
      { tier: 2, name: '', description: 'Slows enemies by 30% and increases radius to 38px.', statValue: 0.30 },
      { tier: 3, name: '', description: 'Slows enemies by 35% and increases radius to 44px.', statValue: 0.35 },
      { tier: 4, name: '', description: 'Slows enemies by 40% and increases radius to 50px.', statValue: 0.40 },
      { tier: 5, name: '', description: 'Slows enemies by 45% and increases radius to 56px.', statValue: 0.45 },
      { tier: 6, name: '', description: 'Devastating 55% slow in a 64px cursor radius!', statValue: 0.55 },
    ]
  },
  {
    id: 'astral_lens',
    name: 'Astral Lens',
    statType: 'PROJECTILE_SIZE',
    icon: 'Maximize2',
    description: 'Magnifies all magical projectiles, beams, and Area-of-Effect zones.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Astral Lens', description: 'Increase all projectile & AoE sizes by +18%.', statValue: 1.18 },
      { tier: 2, name: '', description: 'Increase sizes by +15% (1.33x total).', statValue: 1.33 },
      { tier: 3, name: '', description: 'Increase sizes by +15% (1.48x total).', statValue: 1.48 },
      { tier: 4, name: '', description: 'Increase sizes by +17% (1.65x total).', statValue: 1.65 },
      { tier: 5, name: '', description: 'Increase sizes by +20% (1.85x total).', statValue: 1.85 },
      { tier: 6, name: '', description: 'Sizes doubled (+115% total / 2.15x!). Giant devastating spells.', statValue: 2.15 },
    ]
  },
  {
    id: 'repulsion_talisman',
    name: 'Repulsion Talisman',
    statType: 'KNOCKBACK',
    icon: 'Shield',
    description: 'Imbues your attacks with kinetic force that violently repels charging enemies.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Repulsion Talisman', description: 'Adds knockback to all attacks (+20% force).', statValue: 1.2 },
      { tier: 2, name: '', description: 'Increases knockback by +25% (1.45x total).', statValue: 1.45 },
      { tier: 3, name: '', description: 'Increases knockback by +25% (1.7x total).', statValue: 1.7 },
      { tier: 4, name: '', description: 'Increases knockback by +30% (2.0x total).', statValue: 2.0 },
      { tier: 5, name: '', description: 'Increases knockback by +35% (2.35x total).', statValue: 2.35 },
      { tier: 6, name: '', description: 'Tremendous 2.75x knockback force! Enemies cannot get close.', statValue: 2.75 },
    ]
  },
  {
    id: 'broom_of_haste',
    name: 'Broom of Haste',
    statType: 'DASH_COOLDOWN',
    icon: 'Broom',
    description: 'Witchcraft broom enchantment that reduces Shift-dash cooldown by 10% of base time per rank.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Broom of Haste', description: 'Reduces dash cooldown by 10% of base time.', statValue: 0.10 },
      { tier: 2, name: '', description: 'Reduces dash cooldown by 10% of base time (-20% total).', statValue: 0.20 },
      { tier: 3, name: '', description: 'Reduces dash cooldown by 10% of base time (-30% total).', statValue: 0.30 },
      { tier: 4, name: '', description: 'Reduces dash cooldown by 10% of base time (-40% total).', statValue: 0.40 },
      { tier: 5, name: '', description: 'Reduces dash cooldown by 10% of base time (-50% total)! Max rank 5.', statValue: 0.50 },
    ]
  },

  {
    id: 'magnet_orb',
    name: 'Attractor Amulet',
    statType: 'MAGNET_RADIUS',
    icon: 'Compass',
    description: 'Pulls scattered EXP crystals, food, and EXP magnets from great distances automatically.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Attractor Amulet', description: '+25% EXP, food & magnet collection radius (1.25x total).', statValue: 1.25 },
      { tier: 2, name: '', description: '+25% collection radius (1.50x total).', statValue: 1.50 },
      { tier: 3, name: '', description: '+25% collection radius (1.75x total).', statValue: 1.75 },
      { tier: 4, name: '', description: '+25% collection radius (2.00x total).', statValue: 2.00 },
      { tier: 5, name: '', description: '+25% collection radius (2.25x total).', statValue: 2.25 },
      { tier: 6, name: '', description: '+25% collection radius (2.50x total). Pulls everything instantly.', statValue: 2.50 },
    ]
  },
  {
    id: 'blood_ruby',
    name: 'Bloodstone',
    statType: 'MAX_HEALTH',
    icon: 'Heart',
    description: 'Infuses witch vitality with ancient bloodstone, increasing Max HP and passive HP regen.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Bloodstone', description: '+20 Max HP and +0.1 HP/s passive regeneration.', statValue: 20 },
      { tier: 2, name: '', description: '+20 Max HP and +0.1 HP/s regen (+40 Max HP total).', statValue: 40 },
      { tier: 3, name: '', description: '+20 Max HP and +0.1 HP/s regen (+60 Max HP total).', statValue: 60 },
      { tier: 4, name: '', description: '+20 Max HP and +0.1 HP/s regen (+80 Max HP total).', statValue: 80 },
      { tier: 5, name: '', description: '+20 Max HP and +0.1 HP/s regen (+100 Max HP total).', statValue: 100 },
    ]
  },
  {
    id: 'destiny_control',
    name: 'Destiny Control',
    statType: 'DESTINY_CONTROL',
    icon: 'Clover',
    description: 'An ancient occult compass and lucky charm that bends fate, expanding your options and controlling destiny.',
    color: '#ea580c',
    tiers: [
      {
        tier: 1,
        name: 'Destiny Control',
        description: 'Opens a 4th option for every level up.',
        statValue: 1,
      },
      {
        tier: 2,
        name: '',
        description: 'Choose from a pool of 2 random bosses at every 5-minute interval.',
        statValue: 2,
      },
      {
        tier: 3,
        name: '',
        description: "Adds a secondary Witch's Deal option when striking bargains.",
        statValue: 3,
      },
      {
        tier: 4,
        name: '',
        description: 'Adds a 3rd boss option to the selection pool at every 5-minute interval.',
        statValue: 4,
      },
      {
        tier: 5,
        name: '',
        description: 'Enables 1 Reroll per level up screen, refreshing all 4 options.',
        statValue: 5,
      },
    ],
  },
  {
    id: 'nightbears_claws',
    name: "Nightbear's Claws",
    statType: 'DASH_DAMAGE',
    icon: 'Fangs',
    description: "Cursed obsidian claws that allow you to shred through enemies. Damages and knockbacks enemies that touch you while you Dash.",
    unlockCondition: "Defeat the NightBear Boss to unlock.",
    isLegendary: true,
    color: '#ea580c', // Artifact Orange
    tiers: [
      { tier: 1, name: "Nightbear's Claws", description: 'Deals 20 damage and applies strong knockback to enemies you dash through.', statValue: 20 },
      { tier: 2, name: '', description: 'Damage and knockback increased to 140%.', statValue: 28 },
      { tier: 3, name: '', description: 'Damage and knockback increased to 180%.', statValue: 36 },
      { tier: 4, name: '', description: 'Damage and knockback increased to 220%.', statValue: 44 },
      { tier: 5, name: '', description: 'Damage and knockback increased to 260%.', statValue: 52 },
      { tier: 6, name: '', description: 'Max Rank! Damage and knockback increased to 300%. Shred through the darkness.', statValue: 60 },
    ]
  },
  {
    id: 'shield_of_protection',
    name: 'Shield of Protection',
    statType: 'DAMAGE_REDUCTION',
    icon: 'Shield',
    description: 'Enchanted protective shield that lowers all incoming damage taken by 5% per rank.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Shield of Protection', description: 'Lowers damage taken by 5%.', statValue: 0.05 },
      { tier: 2, name: '', description: 'Lowers damage taken by 10% (-5% additional).', statValue: 0.10 },
      { tier: 3, name: '', description: 'Lowers damage taken by 15% (-5% additional).', statValue: 0.15 },
      { tier: 4, name: '', description: 'Lowers damage taken by 20% (-5% additional).', statValue: 0.20 },
      { tier: 5, name: '', description: 'Max Rank! Lowers damage taken by 25%.', statValue: 0.25 },
    ]
  }
];

export const WITCH_DEALS: CurseChoice[] = [
  {
    id: 'curse_reset_guns_max_passives',
    title: "Ascendant Arcana",
    subtitle: 'Empower One Chosen Weapon and Recalibrate Your Arsenal',
    description: 'Randomly empowers 1 owned weapon, increasing its rank by +3 (up to Rank 6), while reducing all other owned weapons down to base level (Rank 1)!',
    icon: 'Sparkles',
    color: '#ef4444',
    effect: 'RESET_GUNS_MAX_PASSIVES'
  },
  {
    id: 'curse_triple_one_gun',
    title: 'Pact of the Sole Relic',
    subtitle: 'Sacrifice Weapon Capacity for Cataclysmic Ruin',
    description: 'Destroys all weapons except 1 chosen at random, permanently tripling (300%) all of its stats! Reduces your maximum weapon capacity from 5 to 3.',
    icon: 'Sword',
    color: '#ef4444',
    effect: 'TRIPLE_ONE_GUN'
  },
  {
    id: 'curse_divide_hp_double_dmg',
    title: 'Glass Tank',
    subtitle: '',
    description: 'Halves your Base Max HP by 2, but DOUBLES all your damage output permanently!',
    icon: 'Skull',
    color: '#ef4444',
    effect: 'DIVIDE_HP_DOUBLE_DMG'
  },
  {
    id: 'curse_vampires_bite',
    title: "Vampire's Bite",
    subtitle: '',
    description: 'Removes ALL passive healing (Natural 0.5 HP/s & Bloodstone), but every enemy hit heals you for 2 HP.',
    icon: 'Fangs',
    color: '#ef4444',
    effect: 'VAMPIRES_BITE'
  },
  {
    id: 'curse_deja_vu',
    title: 'Déjà-Vu',
    subtitle: 'Time Rewinds to the Dawn, Bearing Infinite Enlightenment',
    description: 'Brings the player and all enemies back to Level 1. Removes all Weapons and Artifacts except Stellar Beam (reverted to Level 1). In return, all EXP earned is permanently TRIPLED (3x)!',
    icon: 'RotateCcw',
    color: '#ef4444',
    effect: 'DEJA_VU'
  }
];

export const DEFAULT_UNLOCKED_ITEM_IDS: string[] = [
  'arcane_wand',
  'brimstone_shotgun',
  'astral_sword',
  'toxic_cauldron',
  'grimoire_orbit',
  'hellfire_nova',
  'seeking_wisp',
  'thunderstrike',
  'shield_of_protection',
  'astral_lens',
  'repulsion_talisman',
  'broom_of_haste',
  'magnet_orb',
  'blood_ruby',
  'destiny_control',
  ...WITCH_DEALS.map((c) => c.id),
];

/**
 * Calibrated EXP Formula:
 * - Always ends in a 0 or 5 (multiples of 5)
 * - Level 1 takes 10 EXP
 * - Level 2 takes 25 EXP
 * - Progression: 10, 25, 45, 70, 100, 135, 175, 220...
 * - Level 5 reaches ~150 cumulative EXP (around 5 mins)
 * - Level 20 reaches ~3200 cumulative EXP (around 30 mins)
 */
export function getExpNeededForLevel(level: number): number {
  if (level <= 1) return 10;
  if (level === 2) return 25;
  const n = Math.max(1, Math.floor(level));
  // Quadratic progression: 10, 25, 45, 70, 100, 135, 175, 220, 270, 325...
  const raw = 10 + 15 * (n - 1) + 2.5 * (n - 1) * (n - 2);
  // Guarantee it always ends in 0 or 5 (exact multiple of 5)
  return Math.max(10, Math.round(raw / 5) * 5);
}

/**
 * Enemy Level Progression:
 * - Mirrors player progression: faster level ups at start of the game,
 *   slowing down as time progresses.
 * - 0 - 30s: Lv. 1 (gives player ample time to reach Lv. 2 with 10 exp before facing Lv. 2 foes)
 * - 30 - 55s: Lv. 2
 * - 55 - 85s: Lv. 3
 * - 85 - 120s: Lv. 4
 * - 120 - 165s: Lv. 5
 * - 165 - 215s: Lv. 6
 * - 215 - 270s: Lv. 7
 * - 270 - 330s: Lv. 8
 * - 330s+: +1 level every 45s
 */
export function getEnemyLevel(seconds: number): number {
  if (seconds < 30) return 1;
  if (seconds < 55) return 2;
  if (seconds < 85) return 3;
  if (seconds < 120) return 4;
  if (seconds < 165) return 5;
  if (seconds < 215) return 6;
  if (seconds < 270) return 7;
  if (seconds < 330) return 8;
  return 8 + Math.floor((seconds - 330) / 45);
}

/**
 * Enemy HP Progression:
 * - Doubles at Level 2 (from 18 to 36).
 * - Rate of HP increase slows down as levels advance to prevent bullet-sponges
 *   while player leveling slows down, while difficulty escalates via swarms,
 *   faster speed, and deadly 25-damage Red enemies.
 */
export function getEnemyBaseHp(level: number): number {
  if (level <= 1) return 20;
  if (level === 2) return 40; // doubled as requested
  // Sub-linear diminishing increases: +14, +12, +10, +9, +8...
  let hp = 40;
  for (let l = 3; l <= level; l++) {
    const step = Math.max(7, 16 - (l - 2) * 1.2);
    hp += step;
  }
  return Math.round(hp);
}

/**
 * Food items heal the player equivalent to half of enemy's damage.
 * - Always rounded so the number ends in 0 or 5 (multiples of 5).
 * - If exactly in between (ending in 2.5 and 7.5), round down (to 0 and 5, respectively).
 */
export function calculateFoodHealAmount(enemyDamage: number): number {
  const halfDamage = enemyDamage / 2;
  const step = halfDamage / 5;
  const frac = step - Math.floor(step);
  let roundedStep: number;
  if (Math.abs(frac - 0.5) < 1e-6) {
    roundedStep = Math.floor(step);
  } else {
    roundedStep = Math.round(step);
  }
  return Math.max(0, roundedStep * 5);
}
