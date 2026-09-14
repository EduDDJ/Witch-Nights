import { WeaponDefinition, StatItemDefinition, CurseChoice, BossDefinition } from '../types/game';

export const BOSS_POOL: BossDefinition[] = [
  {
    id: 'carnivore_plant',
    name: 'Carnivore Plant',
    maxHp: 1400,
    damage: 20,
    radius: 40,
    color: '#22c55e',
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
  },
  {
    id: 'night_bear',
    name: 'NightBear',
    maxHp: 800,
    damage: 25,
    radius: 50,
    color: '#3b2f2f', // Dark brown/black bear color
  }
];

export const ALL_WEAPONS: WeaponDefinition[] = [
  {
    id: 'arcane_wand',
    name: 'Arcana Blast',
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
      { tier: 1, name: 'Arcana Blast', description: 'Fires 1 arcane shard toward cursor.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Split Shard', description: 'Fires 2 additional smaller shards on the sides and deals 30% more damage.', damageBonus: 6, fireRateBonus: 1.0, countBonus: 2, sizeBonus: 0, pierceBonus: 0 },
      { tier: 3, name: 'Piercing Echo', description: 'All shards pierce +1 enemy. +30% fire rate and +10% damage.', damageBonus: 8, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 0, pierceBonus: 1 },
      { tier: 4, name: 'Convergence', description: 'Side shards grow to full size. Projectiles are 33% larger and +10% damage.', damageBonus: 10, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 5, pierceBonus: 1 },
      { tier: 5, name: 'Spectral Force', description: 'All shards pierce through +1 more enemy. +10% damage.', damageBonus: 12, fireRateBonus: 0.7, countBonus: 2, sizeBonus: 5, pierceBonus: 2 },
      { tier: 6, name: 'Astra-Laser', description: 'Transforms into a devastating laser beam that pierces infinitely.', damageBonus: 12, fireRateBonus: 0.7, countBonus: 0, sizeBonus: 10, pierceBonus: 998 },
    ]
  },
  {
    id: 'brimstone_shotgun',
    name: 'Brimstone Blaster',
    shootingType: 'MOUSE_DIRECTION',
    icon: 'Crosshair',
    description: 'Unleashes a wide cone of incendiary brimstone pellets towards your cursor.',
    baseDamage: 20,
    baseInterval: 1.1,
    baseSpeed: 580,
    baseSize: 7,
    basePierce: 1,
    baseCount: 4,
    bulletColor: '#a855f7',
    tiers: [
      { tier: 1, name: 'Hellfire Blast', description: 'Fires a 4-pellet spread towards cursor.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Scatter Shell', description: 'Fires +2 additional pellets and +5 damage.', damageBonus: 5, fireRateBonus: 0.9, countBonus: 2, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: 'Dense Powder', description: 'Pellets pierce through +1 enemy.', damageBonus: 7, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 2, pierceBonus: 1 },
      { tier: 4, name: 'Infernal Spray', description: 'Fires +2 more pellets (8 total) with faster reload.', damageBonus: 10, fireRateBonus: 0.8, countBonus: 2, sizeBonus: 3, pierceBonus: 0 },
      { tier: 5, name: 'Magma Slag', description: 'Pellets explode on impact and pierce +1 more enemy.', damageBonus: 14, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 4, pierceBonus: 1 },
      { tier: 6, name: 'Dragon Breath', description: 'Fires a 14-pellet superheated magma tidal wave that vaporizes lines of foes.', damageBonus: 24, fireRateBonus: 0.65, countBonus: 4, sizeBonus: 6, pierceBonus: 2 },
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
      { tier: 1, name: 'Miasma Splash', description: 'Splashes 1 small corrosive acid pool at nearby ground.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Corrosive Brew', description: 'Pools deal +2 damage and expand +10 radius.', damageBonus: 2, fireRateBonus: 0.9, countBonus: 0, sizeBonus: 10, pierceBonus: 0 },
      { tier: 3, name: 'Twin Flasks', description: 'Throws +1 acid pool per attack (2 pools total).', damageBonus: 4, fireRateBonus: 0.85, countBonus: 1, sizeBonus: 10, pierceBonus: 0 },
      { tier: 4, name: 'Virulent Slime', description: 'Pools deal +4 damage and recharge 25% faster.', damageBonus: 7, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 15, pierceBonus: 0 },
      { tier: 5, name: 'Caustic Deluge', description: 'Throws +1 more pool (3 pools total) with wider area.', damageBonus: 11, fireRateBonus: 0.65, countBonus: 1, sizeBonus: 20, pierceBonus: 0 },
      { tier: 6, name: 'Plague Cataclysm', description: 'Creates 4 massive bubbling acid lakes that dissolve whole hordes.', damageBonus: 18, fireRateBonus: 0.50, countBonus: 2, sizeBonus: 30, pierceBonus: 0 },
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
      { tier: 1, name: 'Lone Folio', description: '1 cursed grimoire spins around the witch at steady speed.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Hasty Pages', description: 'Grimoire rotation speed (r.p.m.) increases by 35%.', damageBonus: 4, fireRateBonus: 0.74, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: 'Twin Lexicons', description: 'Adds +1 orbiting grimoire (2 grimoires total).', damageBonus: 7, fireRateBonus: 0.74, countBonus: 1, sizeBonus: 4, pierceBonus: 0 },
      { tier: 4, name: 'Accelerated Vortex', description: 'Grimoires rotate 35% faster (r.p.m.) around the witch.', damageBonus: 11, fireRateBonus: 0.55, countBonus: 1, sizeBonus: 6, pierceBonus: 0 },
      { tier: 5, name: 'Tri-Tome Barrier', description: 'Adds +1 orbiting grimoire (3 grimoires total, max books reached).', damageBonus: 16, fireRateBonus: 0.55, countBonus: 2, sizeBonus: 8, pierceBonus: 0 },
      { tier: 6, name: 'Celestial Archive', description: '3 cosmic tomes rotate in a blazing hyper-velocity vortex (+35% r.p.m.).', damageBonus: 24, fireRateBonus: 0.40, countBonus: 2, sizeBonus: 10, pierceBonus: 0 },
    ]
  },
  {
    id: 'hellfire_nova',
    name: 'Pentagram',
    shootingType: 'AREA_OF_EFFECT',
    icon: 'Pentagram',
    description: 'Emits an expanding circular pulse and glowing pentagram around the witch, incinerating nearby enemies without projectiles.',
    baseDamage: 30,
    baseInterval: 2.3,
    baseSpeed: 0,
    baseSize: 130,
    basePierce: 999,
    baseCount: 1,
    bulletColor: '#22c55e',
    tiers: [
      { tier: 1, name: 'Star Pulse', description: 'Emits a 130px circular pulse and inverted star around the witch.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Expanding Corona', description: 'Pulse radius expands (+25px) and deals +8 damage.', damageBonus: 8, fireRateBonus: 0.9, countBonus: 0, sizeBonus: 25, pierceBonus: 0 },
      { tier: 3, name: 'Searing Wave', description: 'Pulse recharges 15% quicker and deals +12 damage.', damageBonus: 12, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 25, pierceBonus: 0 },
      { tier: 4, name: 'Blazing Shockwave', description: 'Pulse radius expands (+30px) and deals +16 damage.', damageBonus: 16, fireRateBonus: 0.8, countBonus: 0, sizeBonus: 30, pierceBonus: 0 },
      { tier: 5, name: 'Infernal Conflagration', description: 'Pulse blast knocks back foes strongly and deals +22 damage.', damageBonus: 22, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 35, pierceBonus: 0 },
      { tier: 6, name: 'Supernova Incarnate', description: 'Unleashes an apocalyptic 290px circular pulse and pentagram incinerating all nearby foes.', damageBonus: 36, fireRateBonus: 0.65, countBonus: 0, sizeBonus: 50, pierceBonus: 0 },
    ]
  },
  {
    id: 'seeking_wisp',
    name: "Seeking Wisp",
    shootingType: 'NEAREST_ENEMY',
    icon: 'Flame',
    description: 'Summons eerie ghostly wisps that autonomously hunt the nearest enemy.',
    baseDamage: 18,
    baseInterval: 0.85,
    baseSpeed: 420,
    baseSize: 9,
    basePierce: 1,
    baseCount: 1,
    bulletColor: '#3b82f6',
    tiers: [
      { tier: 1, name: 'Spirit Spark', description: 'Releases 1 homing spirit targeting closest monster.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Twin Phantoms', description: 'Releases +1 homing wisp per volley.', damageBonus: 4, fireRateBonus: 0.9, countBonus: 1, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: 'Ethereal Agility', description: 'Wisps move faster and reload 15% quicker.', damageBonus: 6, fireRateBonus: 0.85, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 4, name: 'Ghost Flock', description: 'Releases +1 wisp and pierces +1 target.', damageBonus: 8, fireRateBonus: 0.8, countBonus: 1, sizeBonus: 3, pierceBonus: 1 },
      { tier: 5, name: 'Wraith Claws', description: 'Deals +14 damage and gains sharp homing acceleration.', damageBonus: 14, fireRateBonus: 0.75, countBonus: 0, sizeBonus: 3, pierceBonus: 0 },
      { tier: 6, name: 'Banshee Swarm', description: 'Unleashes 5 relentless ethereal wisps that shred entire packs.', damageBonus: 22, fireRateBonus: 0.65, countBonus: 2, sizeBonus: 5, pierceBonus: 2 },
    ]
  },
  {
    id: 'vine_snare',
    name: 'Vine Attack',
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
      { tier: 1, name: 'Entangling Vines', description: 'Traps 1 nearest enemy in thorny vines for 2.0s. High cooldown.', damageBonus: 0, fireRateBonus: 1.0, countBonus: 0, sizeBonus: 0, pierceBonus: 0 },
      { tier: 2, name: 'Fast Sprout', description: 'Decreases vine cooldown by 22%.', damageBonus: 4, fireRateBonus: 0.78, countBonus: 0, sizeBonus: 2, pierceBonus: 0 },
      { tier: 3, name: 'Twin Tendrils', description: 'Targets +1 additional enemy (2 enemies total).', damageBonus: 7, fireRateBonus: 0.78, countBonus: 1, sizeBonus: 2, pierceBonus: 0 },
      { tier: 4, name: 'Rapid Roots', description: 'Decreases vine cooldown by 38%.', damageBonus: 11, fireRateBonus: 0.62, countBonus: 0, sizeBonus: 4, pierceBonus: 0 },
      { tier: 5, name: 'Thicket Lash', description: 'Targets +1 additional enemy (3 enemies total).', damageBonus: 15, fireRateBonus: 0.62, countBonus: 1, sizeBonus: 4, pierceBonus: 0 },
      { tier: 6, name: 'Forest Domain', description: 'Rapidly traps 4 nearest enemies in thick thorny vines.', damageBonus: 22, fireRateBonus: 0.44, countBonus: 2, sizeBonus: 6, pierceBonus: 0 },
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
      { tier: 1, name: 'Stonelight Glare', description: 'Slows enemies near cursor by 25% (40px radius).', statValue: 0.25 },
      { tier: 2, name: 'Petrifying Gaze', description: 'Slows enemies by 30% and increases radius to 60px.', statValue: 0.30 },
      { tier: 3, name: 'Gorgon Aura', description: 'Slows enemies by 35% and increases radius to 80px.', statValue: 0.35 },
      { tier: 4, name: 'Fossilizing Focus', description: 'Slows enemies by 40% and increases radius to 100px.', statValue: 0.40 },
      { tier: 5, name: 'Medusa Domain', description: 'Slows enemies by 45% and increases radius to 120px.', statValue: 0.45 },
      { tier: 6, name: 'Cursed Gorgon Crown', description: 'Devastating 55% slow in a 140px cursor radius!', statValue: 0.55 },
    ]
  },
  {
    id: 'vampiric_chalice',
    name: 'Vampiric Fangs',
    statType: 'VAMPIRISM',
    icon: 'Fangs',
    description: 'Leeches vitality from struck enemies, restoring health in combat.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Sip of Blood', description: 'Gain 0.8% Vampirism (~0.5 HP/s in combat).', statValue: 0.008 },
      { tier: 2, name: 'Crimson Sip', description: 'Gain +0.6% Vampirism (1.4% total, ~1.0 HP/s).', statValue: 0.014 },
      { tier: 3, name: 'Deep Quench', description: 'Gain +0.6% Vampirism (2.0% total, ~1.5 HP/s).', statValue: 0.020 },
      { tier: 4, name: 'Sanguine Thirst', description: 'Gain +0.8% Vampirism (2.8% total, ~2.2 HP/s).', statValue: 0.028 },
      { tier: 5, name: 'Heart Drinker', description: 'Gain +0.8% Vampirism (3.6% total, ~3.0 HP/s).', statValue: 0.036 },
      { tier: 6, name: 'Eternal Vampire', description: 'Gain +1.4% Vampirism (5.0% total, ~4.5 HP/s). Siphons steady vitality during battle.', statValue: 0.050 },
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
      { tier: 1, name: 'Minor Magnifier', description: 'Increase all projectile & AoE sizes by +18%.', statValue: 1.18 },
      { tier: 2, name: 'Astral Focus', description: 'Increase sizes by +15% (1.33x total).', statValue: 1.33 },
      { tier: 3, name: 'Occult Prism', description: 'Increase sizes by +15% (1.48x total).', statValue: 1.48 },
      { tier: 4, name: 'Cosmic Eye', description: 'Increase sizes by +17% (1.65x total).', statValue: 1.65 },
      { tier: 5, name: 'Starlight Spire', description: 'Increase sizes by +20% (1.85x total).', statValue: 1.85 },
      { tier: 6, name: 'Infinite Cosmos', description: 'Sizes doubled (+115% total / 2.15x!). Giant devastating spells.', statValue: 2.15 },
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
      { tier: 1, name: 'Force Ward', description: 'Adds knockback to all attacks (+20% force).', statValue: 1.2 },
      { tier: 2, name: 'Kinetic Seal', description: 'Increases knockback by +25% (1.45x total).', statValue: 1.45 },
      { tier: 3, name: 'Gale Charm', description: 'Increases knockback by +25% (1.7x total).', statValue: 1.7 },
      { tier: 4, name: 'Banishment Rune', description: 'Increases knockback by +30% (2.0x total).', statValue: 2.0 },
      { tier: 5, name: 'Titan Force', description: 'Increases knockback by +35% (2.35x total).', statValue: 2.35 },
      { tier: 6, name: 'Untouchable Aura', description: 'Tremendous 2.75x knockback force! Enemies cannot get close.', statValue: 2.75 },
    ]
  },
  {
    id: 'broom_of_haste',
    name: 'Broom of Haste',
    statType: 'DASH_COOLDOWN',
    icon: 'Broom',
    description: 'Witchcraft broom enchantment that drastically reduces Shift-dash cooldown.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Light Bristles', description: 'Reduces dash cooldown by 0.3s (2.7s CD).', statValue: 2.7 },
      { tier: 2, name: 'Wind Weaver', description: 'Reduces dash cooldown by 0.3s (2.4s CD).', statValue: 2.4 },
      { tier: 3, name: 'Gale Rider', description: 'Reduces dash cooldown by 0.3s (2.1s CD).', statValue: 2.1 },
      { tier: 4, name: 'Zephyr Flight', description: 'Reduces dash cooldown by 0.3s (1.8s CD).', statValue: 1.8 },
      { tier: 5, name: 'Sonic Broom', description: 'Reduces dash cooldown to 1.5s! Max rank 5.', statValue: 1.5 },
    ]
  },
  {
    id: 'silver_slippers',
    name: 'Silver Slippers',
    statType: 'MOVE_SPEED',
    icon: 'Footprints',
    description: 'Lightweight enchanted footwear that speeds up base movement.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Nimble Steps', description: '+12% movement speed.', statValue: 1.12 },
      { tier: 2, name: 'Swift Gait', description: '+10% movement speed (1.22x total).', statValue: 1.22 },
      { tier: 3, name: 'Moonlight Tread', description: '+10% movement speed (1.32x total).', statValue: 1.32 },
      { tier: 4, name: 'Fleet Shadow', description: '+10% movement speed (1.42x total).', statValue: 1.42 },
      { tier: 5, name: 'Breeze Walker', description: '+12% movement speed (1.54x total).', statValue: 1.54 },
      { tier: 6, name: 'Mercury Stride', description: '+16% movement speed (1.70x total). Outrun any monstrous horde.', statValue: 1.70 },
    ]
  },
  {
    id: 'black_candle',
    name: 'Black Candle',
    statType: 'DAMAGE_BOOST',
    icon: 'Zap',
    description: 'Black magic ritual candle multiplying all weapon damage output.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Dark Flame', description: '+15% damage to all attacks.', statValue: 1.15 },
      { tier: 2, name: 'Shadow Wax', description: '+15% damage (1.30x total).', statValue: 1.30 },
      { tier: 3, name: 'Occult Wick', description: '+15% damage (1.45x total).', statValue: 1.45 },
      { tier: 4, name: 'Cursed Glow', description: '+15% damage (1.60x total).', statValue: 1.60 },
      { tier: 5, name: 'Abyssal Fuel', description: '+20% damage (1.80x total).', statValue: 1.80 },
      { tier: 6, name: 'Eclipse Flame', description: '+30% damage (2.10x total!). Devastating arcane power.', statValue: 2.10 },
    ]
  },
  {
    id: 'magnet_orb',
    name: 'Attractor Amulet',
    statType: 'MAGNET_RADIUS',
    icon: 'Compass',
    description: 'Pulls scattered EXP crystals from great distances automatically.',
    color: '#ea580c',
    tiers: [
      { tier: 1, name: 'Faint Pull', description: '+25% EXP collection radius (1.25x total).', statValue: 1.25 },
      { tier: 2, name: 'Magnetic Core', description: '+25% EXP collection radius (1.50x total).', statValue: 1.50 },
      { tier: 3, name: 'Grave Magnet', description: '+25% EXP collection radius (1.75x total).', statValue: 1.75 },
      { tier: 4, name: 'Soul Siphon', description: '+25% EXP collection radius (2.00x total).', statValue: 2.00 },
      { tier: 5, name: 'Void Beacon', description: '+25% EXP collection radius (2.25x total).', statValue: 2.25 },
      { tier: 6, name: 'Black Hole Relic', description: '+25% EXP collection radius (2.50x total).', statValue: 2.50 },
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
      { tier: 1, name: 'Heartstone', description: '+20 Max HP and +0.1 HP/s passive regeneration.', statValue: 20 },
      { tier: 2, name: 'Vigor Bead', description: '+20 Max HP and +0.1 HP/s regen (+40 Max HP total).', statValue: 40 },
      { tier: 3, name: 'Vital Vein', description: '+20 Max HP and +0.1 HP/s regen (+60 Max HP total).', statValue: 60 },
      { tier: 4, name: 'Gore Gem', description: '+20 Max HP and +0.1 HP/s regen (+80 Max HP total).', statValue: 80 },
      { tier: 5, name: 'Blood Core', description: '+20 Max HP and +0.1 HP/s regen (+100 Max HP total).', statValue: 100 },
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
        name: 'Lucky Paw',
        description: 'Opens a 4th option for every level up.',
        statValue: 1,
      },
      {
        tier: 2,
        name: 'Thread of Fate',
        description: 'Choose from a pool of 2 random bosses at every 5-minute interval.',
        statValue: 2,
      },
      {
        tier: 3,
        name: "Rabbit's Grace",
        description: "Enables a 3rd Witch's Deal option when striking bargains.",
        statValue: 3,
      },
      {
        tier: 4,
        name: 'Tapestry of Destiny',
        description: 'Adds a 3rd boss option to the selection pool at every 5-minute interval.',
        statValue: 4,
      },
      {
        tier: 5,
        name: 'Fate Reroll',
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
    unlockCondition: "Defeat NightBear to unlock.",
    isLegendary: true,
    color: '#ea580c', // Artifact Orange
    tiers: [
      { tier: 1, name: 'Razor Claws', description: 'Deals 20 damage and applies strong knockback to enemies you dash through.', statValue: 20 },
      { tier: 2, name: 'Serrated Edge', description: 'Damage and knockback increased to 140%.', statValue: 28 },
      { tier: 3, name: 'Obsidian Talons', description: 'Damage and knockback increased to 180%.', statValue: 36 },
      { tier: 4, name: 'Nightmare Shredder', description: 'Damage and knockback increased to 220%.', statValue: 44 },
      { tier: 5, name: 'Gore Ripper', description: 'Damage and knockback increased to 260%.', statValue: 52 },
      { tier: 6, name: 'The Eternal Hunt', description: 'Max Rank! Damage and knockback increased to 300%. Shred through the darkness.', statValue: 60 },
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
    description: 'Destroys all weapons except 1 chosen at random, permanently tripling (300%) all of its stats! Reduces your maximum weapon capacity from 6 to 3.',
    icon: 'Sword',
    color: '#ef4444',
    effect: 'TRIPLE_ONE_GUN'
  },
  {
    id: 'curse_divide_hp_double_dmg',
    title: 'Glass Empress Covenant',
    subtitle: 'Fragile as Stained Glass, Lethal as the Void',
    description: 'Divide your maximum health by 4 (your witch becomes extremely fragile), but DOUBLES (2x) all your damage output permanently!',
    icon: 'Skull',
    color: '#ef4444',
    effect: 'DIVIDE_HP_DOUBLE_DMG'
  },
  {
    id: 'curse_swarm_triple_exp',
    title: 'Blood-Tide Apocalypse',
    subtitle: 'A Horde Beyond Reckoning with Boundless Sanguine Rewards',
    description: 'Double enemy spawn rate and monster health, but all monsters drop TRIPLE EXP and you gain an extra +3% Vampirism!',
    icon: 'Flame',
    color: '#ef4444',
    effect: 'SWARM_TRIPLE_EXP'
  },
  {
    id: 'curse_deja_vu',
    title: 'Déjà-Vu',
    subtitle: 'Time Rewinds to the Dawn, Bearing Infinite Enlightenment',
    description: 'Brings the player and all enemies back to Level 1. Removes all Weapons and Artifacts except Arcana Blast (reverted to Level 1). In return, all EXP earned is permanently TRIPLED (3x)!',
    icon: 'RotateCcw',
    color: '#ef4444',
    effect: 'DEJA_VU'
  }
];

export const DEFAULT_UNLOCKED_ITEM_IDS: string[] = [
  'arcane_wand',
  'brimstone_shotgun',
  'toxic_cauldron',
  'grimoire_orbit',
  'hellfire_nova',
  'seeking_wisp',
  'vampiric_chalice',
  'astral_lens',
  'repulsion_talisman',
  'broom_of_haste',
  'silver_slippers',
  'black_candle',
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
