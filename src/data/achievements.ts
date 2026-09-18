export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  unlockText: string;
  unlockedItemId?: string;
  bossId?: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'plants_vs_witches',
    title: 'Plants Vs. Witches',
    description: 'Defeat the Carnivore Plant Boss in a run.',
    unlockText: 'Vine Attack',
    unlockedItemId: 'vine_snare',
    bossId: 'carnivore_plant',
  },
  {
    id: 'eye_see_you',
    title: 'EYE See You',
    description: 'Defeat the Haunted Eye Boss in a run.',
    unlockText: "Medusa's Eye",
    unlockedItemId: 'medusas_eye',
    bossId: 'haunted_eye',
  },
  {
    id: 'bearely_any_trouble',
    title: 'BEARely Any Trouble',
    description: 'Defeat the NightBear Boss in a run.',
    unlockText: "NightBear's Claws Artifact",
    unlockedItemId: 'nightbears_claws',
    bossId: 'night_bear',
  },
  {
    id: 'color_me_impressed',
    title: 'Color Me Impressed',
    description: 'Defeat the 3 Archmages in a run.',
    unlockText: 'Geraldo The Red',
    bossId: 'archmages',
  },
  {
    id: 'alphabet_green',
    title: 'Out of the whole Alphabet, Green is my Favorite Number',
    description: 'Unlock Vine Snare and complete Boss Rush as Geraldo The Red.',
    unlockText: 'Geraldo The Green',
  },
  {
    id: 'feeling_blue',
    title: 'Feeling Blue',
    description: 'Complete Boss Rush as Geraldo The Green.',
    unlockText: 'Geraldo The Blue',
  },
  {
    id: 'youre_a_witch_ruby',
    title: "You're a Witch, Ruby",
    description: 'Win Boss Rush for the first time.',
    unlockText: 'True Witch Mode',
  },
  {
    id: 'being_a_witch_isnt_a_job',
    title: "I AM a freaking Witch!",
    description: 'Win Boss Rush in True Witch Mode.',
    unlockText: 'Diamond Trophy',
  },
];
