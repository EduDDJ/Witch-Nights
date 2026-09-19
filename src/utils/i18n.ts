import { useState, useEffect } from 'react';

export type Language = 'en' | 'pt-BR';

let currentLanguage: Language = 'en';

try {
  const savedOptions = localStorage.getItem('witch_nights_options');
  if (savedOptions) {
    const parsed = JSON.parse(savedOptions);
    if (parsed.language) {
      currentLanguage = parsed.language;
    }
  }
} catch {
  // ignore
}

const listeners = new Set<(lang: Language) => void>();

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  if (currentLanguage !== lang) {
    currentLanguage = lang;
    listeners.forEach((listener) => listener(lang));
  }
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(currentLanguage);
  useEffect(() => {
    const handler = (newLang: Language) => setLang(newLang);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);
  return lang;
}

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Main Menu
    start_game: 'Start Game',
    boss_rush: 'Boss Rush',
    collection: 'Collection',
    tutorial: 'Tutorial',
    achievements: 'Achievements',
    options: 'Options',
    
    // Options
    game_options: 'Game Options',
    options_subtitle: 'Configure audio, mobile layout, and controls',
    mobile_mode: 'Mobile Mode',
    mobile_mode_desc: 'Adds on-screen movement and controls, compacts menus for smaller screens, and adjusts HUD positioning.',
    enabled: 'ENABLED',
    disabled: 'DISABLED',
    mobile_aim_mode: 'Mobile Aiming Mode',
    joystick_aim: 'Joystick Aim',
    joystick_aim_desc: 'Use right-side virtual joystick to aim weapons.',
    touch_aim: 'Touch to Aim',
    touch_aim_desc: 'Tap/click anywhere to aim directly (removes aim joystick).',
    sound_settings: 'Sound Settings',
    sound_effects_music: 'Sound Effects & Music',
    volume: 'Volume',
    gameplay_graphics: 'Gameplay & Graphics',
    dash_input_mode: 'Dash Input Mode',
    movement_dir: 'Movement Dir',
    movement_dir_desc: 'Dash in the direction the witch is currently moving.',
    cursor_position: 'Cursor Position',
    cursor_position_desc: 'Dash directly towards your mouse cursor position.',
    screen_shake: 'Screen Shake',
    screen_shake_desc: 'Produces intense screen shake when hitting or taking heavy damage.',
    damage_numbers: 'Damage Numbers',
    damage_numbers_desc: 'Spawns scrolling red/white floating damage text above enemies.',
    screen_brightness: 'Screen Brightness',
    screen_brightness_desc: 'Adjust render filter brightness (50% to 150%).',
    danger_zone: 'Danger Zone: Reset Progress',
    danger_zone_desc: 'Delete all save data, including achievement unlocks and highscores.',
    reset_progress: 'RESET PROGRESS',
    confirm_reset: 'CONFIRM RESET? THIS CANNOT BE UNDONE!',
    yes_wipe: 'YES, WIPE ALL DATA',
    cancel: 'CANCEL',
    reset_success: 'Success! Progress has been fully reset.',
    language: 'Language',
    select_language: 'Select Language',
    language_option_prompt: 'Please choose your preferred language to begin / Escolha o seu idioma preferido para começar',

    // Character Select
    character_select: 'Character Select',
    select_skin: 'Select Skin',
    back: 'Back',
    back_to_menu: 'Back to Main Menu',
    confirm_character: 'Confirm Character',
    start_run: 'Start Run',
    starting_weapon: 'Starting Weapon',
    starting_item: 'Starting Item',
    speed: 'Speed',
    max_hp: 'Max HP',
    description: 'Description',

    // Game HUD & Gameplay
    level: 'Lv.',
    time: 'TIME',
    boss_incoming: 'BOSS INCOMING',
    paused: 'Paused',
    score: 'Score',
    kills: 'Kills',
    wave: 'Wave',

    // Pause Menu
    game_paused: 'Game Paused',
    resume: 'Resume',
    restart_run: 'Restart Run',
    main_menu: 'Main Menu',
    dev_tools: 'Dev Tools',
    current_items: 'CURRENT ITEMS',
    artifacts_label: 'Artifacts',
    weapons_label: 'Weapons',
    hover_inspect: 'Hover over an item to inspect stats',
    total_time: 'Total Time:',
    resume_game: 'Resume Game',
    quit_to_main_menu: 'Quit to Main Menu',
    tutorial_subtitle: 'Master witchcraft, survive monster hordes, conquer formidable bosses, and forge forbidden pacts.',
    movement_targeting: 'Movement & Targeting',
    phase_dash: 'Phase Dash',
    pause_game: 'Pause Game',
    pause_shortcut_info: 'Press P or ESC (or click the Pause button on top) to pause the game at any time.',
    or_arrow_keys: 'or Arrow keys',
    or_spacebar: 'or',
    spacebar_key: 'SPACEBAR',
    movement_desc: 'Navigate seamlessly across the cursed realm. Aim with your mouse cursor to guide directional projectiles and targeted spells like Stellar Beam!',
    phase_dash_desc: 'Burst with speed and total invulnerability (i-frames) on a 3s cooldown. Use Dash to pierce dense swarms or dodge lethal attacks! (Cooldown can be reduced by up to 50% with the Broom of Haste).',
    boss_encounters: 'Boss Encounters & Hazard Zones',
    boss_encounters_desc: 'Formidable bosses like the Carnivore Plant emerge during your run. Each boss has a Base Max HP (their health at Level 1), which scales by +12% for every player level. Watch out for red telegraphed hazard rings—activate your Phase Dash to evade!',
    vitality_regen: 'Vitality & Regeneration',
    vitality_regen_desc: 'You possess a natural passive healing of 0.5 HP/s. This vital regeneration can be significantly upgraded by finding and leveling up the Bloodstone artifact!',
    weapons_artifacts: 'Weapons & Artifacts',
    weapons_artifacts_desc: 'Equip up to 5 active Weapons alongside 5 passive Artifacts that bestow persistent stat enhancements. Every weapon level-up also grants an innate +10% damage bonus.',
    exp_orbs: 'EXP Orbs & Enemy Drops',
    exp_orbs_desc: 'Defeat foes to harvest EXP: standard cyan gems, elite Village Knight red orbs (10 EXP), and colossal Boss yellow orbs (75 EXP + 25 HP Healing Food). Enemies also have a 10% chance to drop special items like Healing Food (heals half of the enemy\'s damage), upgraded orbs, or rare EXP Magnets (~1%).',
    witch_deal_tutorial_section: "The Witch's Deal",
    witch_deal_desc: 'When the clock strikes 07:30, a Witch offers a forbidden Witch\'s Deal. Choose to Accept for transcendent power at a dangerous cost, or Deny the bargain.',
    characters_mega: 'Characters & Mega Evolution',
    char_mega_desc1: 'Each character comes with distinct attributes: Max HP dictates total health, Speed determines movement swiftness across the map, and a signature Starting Weapon sets your initial combat style.',
    char_mega_desc2: 'Mega Evolution (Rank 7): Every character can unlock a supreme Rank 7 Mega Evolution for their signature Starting Weapon (such as Ruby\'s Stellar Laser or GlOwOb\'s Acidic Wave). Rank 7 upgrades appear in level-up choices exclusively when playing as that specific character!',
    understood: 'Understood',
    play_now: 'Play Now',

    // Level Up Modal
    level_up: 'Level Up!',
    choose_boon: 'Choose a Boon',
    reroll: 'Reroll',
    max_level: 'MAX',
    channeling_arcane: 'Channeling Arcane Choices...',
    reroll_options: 'Reroll Options (1 Left)',
    channeling_boons: 'Channeling boons...',
    achievement_complete: 'Achievement Complete!',
    unlocked_label: 'Unlocked:',
    dismiss_notification: 'Dismiss notification',
    achievement_notification: 'Achievement notification',
    item_unlocked: 'ITEM UNLOCKED!',
    legendary_item: 'Legendary Item',
    item_unlocked_desc: '{name} has been unlocked and can now show up as a level up option! Obtain it in a run in order to discover it!',
    choose_boss: 'CHOOSE YOUR BOSS',
    choose_boss_desc: 'Your mastery over fate allows you to choose which monstrous terror shall emerge from the dark grove:',
    summon_boss: 'Summon {name}',
    new_weapon_acquired: 'NEW WEAPON ACQUIRED',
    new_stat_artifact: 'NEW STAT ARTIFACT',
    mega_evolution: 'MEGA EVOLUTION',
    passive_artifact: 'Passive Artifact',
    new_tag: 'NEW',
    nearest_enemy: 'Nearest Enemy',
    mouse_aim: 'Mouse Aim',
    aoe_label: 'Area of Effect (AoE)',
    weapon_label: 'Weapon',

    // Witch Deal Modal
    witch_deal: "The Witch's Deal",
    strike_bargain: 'Strike a Bargain',
    witch_deal_subtitle: 'A dark bargain presented itself...',
    minute_epoch: 'Minute 7:30 Epoch',
    accept_deal: 'Accept',
    deny_deal: 'Deny',
    deny_both: 'Deny Both',

    // HUD & Badges
    cheats_enabled: 'Cheats Enabled',
    foe_level: 'FOE LV',
    destiny_control_activated: 'Destiny Control Activated',
    boss_incoming_banner: '⚠️ BOSS INCOMING ⚠️',

    // Tutorial Modal
    witch_training: "Witch's Training",
    how_to_play: 'How to Play',
    controls: 'Controls',
    movement: 'Movement',
    dash: 'Dash',
    learn: 'Learn',
    bargains: 'Bargains',
    close_tutorial: 'Close Tutorial',
    wasd_movement: 'WASD / Arrow Keys',
    wasd_desc: 'Move your character in 8 directions across the battlefield.',
    shift_dash: 'Shift Key / On-screen Dash',
    shift_dash_desc: 'Dash with brief invincibility to escape traps and dodge projectile bursts.',
    auto_attack: 'Auto Attack & Manual Aiming',
    auto_attack_desc: 'Weapons fire automatically. Use your mouse cursor or right joystick to aim direct-fire weapons.',
    collect_gems: 'Collect Gems & Artifacts',
    collect_gems_desc: 'Kill enemies to collect experience gems and level up. Upgrading items boosts your projectile size, speed, or adds special conditions.',
    witch_deals_tutorial: "Occult Witch's Deals",
    witch_deals_tutorial_desc: 'Every 5 minutes, you will encounter the mysterious Witch, offering a powerful curse that can drastically alter your playstyle.',

    // GameOver Modal
    victory: 'Victory!',
    game_over: 'Game Over',
    stats: 'Stats',
    survival_time: 'Survival Time',
    level_reached: 'Level Reached',
    enemies_slain: 'Enemies Slain',
    bosses_defeated: 'Bosses Defeated',
    try_again: 'Try Again',
    killed_by: 'Killed by',

    // Collection Modal
    encyclopedia: 'Occult Encyclopedia',
    encyclopedia_desc: 'Learn about weapons, items, curses, and defeated foes.',
    weapons: 'Weapons',
    artifacts: 'Artifacts',
    curses: 'Curses',
    bestiary: 'Bestiary',
    unlocked_items: 'Unlocked',
    locked_item: 'Locked',

    // Boss Rush Modal
    boss_rush_title: 'Boss Rush Challenge',
    boss_rush_desc: 'Face all major bosses back-to-back in a test of pure survival skill!',
    best_time: 'Best Boss Rush Time',
    character_best_time: 'Character Best Time',
    no_record: 'No record yet',
    active_char: 'Active Character',
    change_char: 'Change Character',
    true_witch_mode: 'True Witch Mode',
    true_witch_desc: 'Double boss health, 50% more enemy damage, no passive health regen.',
    start_boss_rush: 'Start Boss Rush',
    locked_boss_rush: 'Locked - Win Boss Rush once to unlock.',

    // Boss Incoming Modal
    boss_incoming_title: 'Boss Incoming!',
    boss_incoming_desc: 'A powerful presence is near...',
    fight: 'Fight',

    // Character Select
    geraldo_unlock_hint: 'Complete the "Color Me Impressed" Achievement to unlock.',
    geraldo_green_unlock_hint: 'Complete the "Your Element is... Green." Achievement to unlock.',
    geraldo_blue_unlock_hint: 'Complete the "Out of the whole Alphabet, Blue is my Favorite Number" Achievement to unlock.',
    skin_select_title: 'Select Skin',
    skin_locked: 'Locked',

    // Dev Tools
    dev_fight_boss: 'Fight Boss',
    dev_fight_boss_desc: 'Set boss timer to 0 and choose a Boss to fight',
    dev_choose_boss_title: 'Choose a Boss to Fight',
    dev_choose_boss_desc: 'Timer set to 00:00. Select which Boss you want to challenge:',
    dev_tools_badge: 'Dev Tools • Fight Boss',
  },
  'pt-BR': {
    // Main Menu
    start_game: 'Iniciar Jogo',
    boss_rush: 'Boss Rush', // Kept as Boss Rush as requested "Don't change the game's and NightBear's name" and Boss Rush is name of mode
    collection: 'Coleção',
    tutorial: 'Tutorial',
    achievements: 'Conquistas',
    options: 'Opções',

    // Options
    game_options: 'Opções do Jogo',
    options_subtitle: 'Configure áudio, controles e layout móvel',
    mobile_mode: 'Modo Móvel',
    mobile_mode_desc: 'Adiciona controles de movimento na tela, compacta menus para telas menores e ajusta a posição do HUD.',
    enabled: 'ATIVADO',
    disabled: 'DESATIVADO',
    mobile_aim_mode: 'Modo de Mira Móvel',
    joystick_aim: 'Mirar com Analógico',
    joystick_aim_desc: 'Use o analógico virtual direito para mirar armas.',
    touch_aim: 'Mirar com Toque',
    touch_aim_desc: 'Toque/clique em qualquer lugar para mirar diretamente (remove o analógico de mira).',
    sound_settings: 'Configurações de Som',
    sound_effects_music: 'Efeitos Sonoros e Música',
    volume: 'Volume',
    gameplay_graphics: 'Jogabilidade e Gráficos',
    dash_input_mode: 'Modo de Entrada do Dash',
    movement_dir: 'Direção do Movimento',
    movement_dir_desc: 'Dê o dash na direção em que a bruxa está se movendo.',
    cursor_position: 'Posição do Cursor',
    cursor_position_desc: 'Dê o dash diretamente na direção do cursor do mouse.',
    screen_shake: 'Tremer a Tela',
    screen_shake_desc: 'Gera tremores intensos na tela ao golpear ou receber dano alto.',
    damage_numbers: 'Números de Dano',
    damage_numbers_desc: 'Exibe números flutuantes de dano em vermelho/branco acima dos inimigos.',
    screen_brightness: 'Brilho da Tela',
    screen_brightness_desc: 'Ajuste o filtro de brilho da renderização (50% a 150%).',
    danger_zone: 'Zona de Perigo: Redefinir Progresso',
    danger_zone_desc: 'Apague todos os dados salvos, incluindo conquistas e recordes.',
    reset_progress: 'REDEFINIR PROGRESSO',
    confirm_reset: 'CONFIRMAR? ISSO NÃO PODE SER DESFEITO!',
    yes_wipe: 'SIM, APAGAR TUDO',
    cancel: 'CANCELAR',
    reset_success: 'Sucesso! O progresso foi redefinido.',
    language: 'Idioma',
    select_language: 'Selecionar Idioma',
    language_option_prompt: 'Escolha o seu idioma preferido para começar',

    // Character Select
    character_select: 'Seleção de Personagem',
    select_skin: 'Selecionar Skin',
    back: 'Voltar',
    back_to_menu: 'Voltar ao Menu',
    confirm_character: 'Confirmar Personagem',
    start_run: 'Iniciar Partida',
    starting_weapon: 'Arma Inicial',
    starting_item: 'Item Inicial',
    speed: 'Velocidade',
    max_hp: 'Vida Máxima',
    description: 'Descrição',

    // Game HUD & Gameplay
    level: 'Nív.',
    time: 'TEMPO',
    boss_incoming: 'CHEFE SE APROXIMANDO',
    paused: 'Pausado',
    score: 'Pontos',
    kills: 'Derrotas',
    wave: 'Onda',

    // Pause Menu
    game_paused: 'Jogo Pausado',
    resume: 'Continuar',
    restart_run: 'Reiniciar Partida',
    main_menu: 'Menu Principal',
    dev_tools: 'Ferramentas de Dev',
    current_items: 'ITENS ATUAIS',
    artifacts_label: 'Artefatos',
    weapons_label: 'Armas',
    hover_inspect: 'Passe o mouse sobre um item para inspecionar os atributos',
    total_time: 'Tempo Total:',
    resume_game: 'Retomar Jogo',
    quit_to_main_menu: 'Sair para o Menu Principal',
    tutorial_subtitle: 'Domine a bruxaria, sobreviva a hordas de monstros, conquiste chefes formidáveis e faça pactos proibidos.',
    movement_targeting: 'Movimento e Mira',
    phase_dash: 'Investida de Fase',
    pause_game: 'Pausar o Jogo',
    pause_shortcut_info: 'Pressione P ou ESC (ou clique no botão de Pausa no topo) para pausar o jogo a qualquer momento.',
    or_arrow_keys: 'ou Teclas direcionais',
    or_spacebar: 'ou',
    spacebar_key: 'ESPAÇO',
    movement_desc: 'Navegue pelo reino amaldiçoado. Mire com o cursor do mouse para direcionar projéteis e feitiços como o Raio Estelar!',
    phase_dash_desc: 'Ganhe um impulso de velocidade e invulnerabilidade total (i-frames) com recarga de 3s. Use o Dash para atravessar hordas densas ou desviar de ataques letais! (A recarga pode ser reduzida em até 50% com a Vassoura da Pressa).',
    boss_encounters: 'Encontros com Chefes e Zonas de Perigo',
    boss_encounters_desc: 'Chefes formidáveis como a Planta Carnívora surgem durante sua partida. Cada chefe tem uma Vida Máxima Base que escala em +12% por nível do jogador. Cuidado com as áreas de perigo vermelhas—ative sua Investida de Fase para escapar!',
    vitality_regen: 'Vitalidade e Regeneração',
    vitality_regen_desc: 'Você possui uma cura passiva natural de 0,5 PV/s. Essa regeneração vital pode ser bastante aprimorada ao encontrar e evoluir o artefato Pedra de Sangue!',
    weapons_artifacts: 'Armas e Artefatos',
    weapons_artifacts_desc: 'Equipe até 5 Armas ativas junto com 5 Artefatos passivos que concedem melhorias constantes de atributos. Cada melhoria de arma também concede +10% de dano bônus inato.',
    exp_orbs: 'Orbes de EXP e Drops de Inimigos',
    exp_orbs_desc: 'Derrote inimigos para coletar EXP: cristais cianos normais, orbes vermelhos do Cavaleiro da Vila (10 EXP) e orbes amarelos de Chefes (75 EXP + Comida de Cura de 25 PV). Inimigos também têm 10% de chance de soltar itens especiais como Comida de Cura (cura metade do dano do inimigo), orbes aprimorados ou Imãs de EXP raros (~1%).',
    witch_deal_tutorial_section: 'Acordo da Bruxa',
    witch_deal_desc: 'Quando o relógio marcar 07:30, uma Bruxa oferecerá um Acordo da Bruxa proibido. Escolha Aceitar para obter poder transcendente a um custo perigoso, ou Recuse a barganha.',
    characters_mega: 'Personagens e Megaevolução',
    char_mega_desc1: 'Cada personagem possui atributos distintos: Vida Máxima dita a vida total, Velocidade determina a rapidez de movimentação e uma Arma Inicial assinatura define seu estilo de combate.',
    char_mega_desc2: 'Megaevolução (Rank 7): Todo personagem pode desbloquear uma Megaevolução Rank 7 suprema para sua Arma Inicial exclusiva (como o Laser Estelar da Ruby ou a Onda Ácida do GlOwOb). Melhorias de Rank 7 aparecem nas escolhas de nível exclusivamente ao jogar com aquele personagem!',
    understood: 'Entendido',
    play_now: 'Jogar Agora',

    // Level Up Modal
    level_up: 'Aumento de Nível!',
    choose_boon: 'Escolha uma Bênção',
    reroll: 'Trocar',
    max_level: 'MÁX',
    channeling_arcane: 'Canalizando Escolhas Arcanas...',
    reroll_options: 'Rolar Opções (1 Restante)',
    channeling_boons: 'Canalizando bênçãos...',
    achievement_complete: 'Conquista Concluída!',
    unlocked_label: 'Desbloqueado:',
    dismiss_notification: 'Dispensar notificação',
    achievement_notification: 'Notificação de conquista',
    item_unlocked: 'ITEM DESBLOQUEADO!',
    legendary_item: 'Item Lendário',
    item_unlocked_desc: '{name} foi desbloqueado e agora pode aparecer como opção de nível! Obtenha-o em uma partida para descobri-lo!',
    choose_boss: 'ESCOLHA SEU CHEFE',
    choose_boss_desc: 'Sua maestria sobre o destino permite que você escolha qual terror monstruoso emergirá do bosque sombrio:',
    summon_boss: 'Invocar {name}',
    new_weapon_acquired: 'NOVA ARMA ADQUIRIDA',
    new_stat_artifact: 'NOVO ARTEFATO',
    mega_evolution: 'MEGA EVOLUÇÃO',
    passive_artifact: 'Artefato Passivo',
    new_tag: 'NOVO',
    nearest_enemy: 'Inimigo Mais Próximo',
    mouse_aim: 'Mira do Mouse',
    aoe_label: 'Área de Efeito (AoE)',
    weapon_label: 'Arma',

    // Witch Deal Modal
    witch_deal: 'Acordo da Bruxa',
    strike_bargain: 'Feche uma Barganha',
    witch_deal_subtitle: 'Um acordo sombrio se apresentou...',
    minute_epoch: 'Época de 7:30 Minutos',
    accept_deal: 'Aceitar',
    deny_deal: 'Recusar',
    deny_both: 'Recusar Ambos',

    // HUD & Badges
    cheats_enabled: 'Trapalhadas Ativadas',
    foe_level: 'NÍV INIMIGO',
    destiny_control_activated: 'Controle do Destino Ativado',
    boss_incoming_banner: '⚠️ CHEFE SE APROXIMANDO ⚠️',

    // Tutorial Modal
    witch_training: 'Treinamento da Bruxa',
    how_to_play: 'Como Jogar',
    controls: 'Controles',
    movement: 'Movimento',
    dash: 'Dash',
    learn: 'Aprender',
    bargains: 'Barganhas',
    close_tutorial: 'Fechar Tutorial',
    wasd_movement: 'WASD / Teclas Direcionais',
    wasd_desc: 'Mova seu personagem em 8 direções pelo campo de batalha.',
    shift_dash: 'Tecla Shift / Dash na Tela',
    shift_dash_desc: 'Dê um dash com breve invulnerabilidade para escapar de armadilhas e desviar de projéteis.',
    auto_attack: 'Ataque Automático e Mira Manual',
    auto_attack_desc: 'As armas disparam automaticamente. Use o cursor do mouse ou o analógico direito para mirar armas de disparo direto.',
    collect_gems: 'Colete Cristais e Artefatos',
    collect_gems_desc: 'Derrote inimigos para coletar cristais de experiência e subir de nível. Melhorar itens aumenta o tamanho, velocidade ou adiciona condições especiais.',
    witch_deals_tutorial: 'Acordos Ocultos da Bruxa',
    witch_deals_tutorial_desc: 'A cada 5 minutos, você encontrará a misteriosa Bruxa, que oferecerá uma maldição poderosa capaz de alterar drasticamente seu estilo de jogo.',

    // GameOver Modal
    victory: 'Vitória!',
    game_over: 'Fim de Jogo',
    stats: 'Estatísticas',
    survival_time: 'Tempo de Sobrevivência',
    level_reached: 'Nível Alcançado',
    enemies_slain: 'Inimigos Derrotados',
    bosses_defeated: 'Chefes Derrotados',
    try_again: 'Tentar Novamente',
    killed_by: 'Derrotado por',

    // Collection Modal
    encyclopedia: 'Enciclopédia Oculta',
    encyclopedia_desc: 'Saiba mais sobre armas, itens, maldições e inimigos derrotados.',
    weapons: 'Armas',
    artifacts: 'Artefatos',
    curses: 'Maldições',
    bestiary: 'Bestiário',
    unlocked_items: 'Desbloqueado',
    locked_item: 'Bloqueado',

    // Boss Rush Modal
    boss_rush_title: 'Desafio Invasão de Chefes',
    boss_rush_desc: 'Enfronte todos os principais chefes consecutivamente em um teste de pura sobrevivência!',
    best_time: 'Melhor Tempo na Invasão',
    character_best_time: 'Melhor Tempo com o Personagem',
    no_record: 'Sem registro ainda',
    active_char: 'Personagem Ativo',
    change_char: 'Mudar Personagem',
    true_witch_mode: 'Modo Bruxa Verdadeira',
    true_witch_desc: 'Dobro de vida dos chefes, 50% mais dano de inimigos, sem cura passiva.',
    start_boss_rush: 'Iniciar Invasão',
    locked_boss_rush: 'Bloqueado - Vença a Invasão de Chefes uma vez para desbloquear.',

    // Boss Incoming Modal
    boss_incoming_title: 'Chefe se Aproximando!',
    boss_incoming_desc: 'Uma presença poderosa está por perto...',
    fight: 'Lutar',

    // Character Select
    geraldo_unlock_hint: 'Complete a conquista "Mostre Suas Cores Verdadeiras" para desbloquear.',
    geraldo_green_unlock_hint: 'Complete a conquista "Seu Elemento é... Verde." para desbloquear.',
    geraldo_blue_unlock_hint: 'Complete a conquista "De todo o Alfabeto, Azul é o meu Número Favorito" para desbloquear.',
    skin_select_title: 'Selecionar Skin',
    skin_locked: 'Bloqueado',

    // Dev Tools
    dev_fight_boss: 'Lutar contra Chefe',
    dev_fight_boss_desc: 'Define o cronômetro para 0 e escolha um Chefe para lutar',
    dev_choose_boss_title: 'Escolha um Chefe para Lutar',
    dev_choose_boss_desc: 'Cronômetro definido para 00:00. Selecione qual Chefe você deseja enfrentar:',
    dev_tools_badge: 'Ferramentas Dev • Lutar contra Chefe',
  },
};

export function t(key: string, lang: Language = currentLanguage): string {
  return UI_TRANSLATIONS[lang]?.[key] ?? UI_TRANSLATIONS['en']?.[key] ?? key;
}

// Localized Achievement definitions as requested:
export interface LocalizedAchievement {
  id: string;
  title: string;
  description: string;
  unlockText: string;
}

export const LOCALIZED_ACHIEVEMENTS: Record<Language, Record<string, LocalizedAchievement>> = {
  en: {
    plants_vs_witches: {
      id: 'plants_vs_witches',
      title: 'Plants Vs. Witches',
      description: 'Defeat the Carnivore Plant Boss in a run.',
      unlockText: 'Vine Attack',
    },
    eye_see_you: {
      id: 'eye_see_you',
      title: 'EYE See You',
      description: 'Defeat the Haunted Eye Boss in a run.',
      unlockText: "Medusa's Eye",
    },
    bearely_any_trouble: {
      id: 'bearely_any_trouble',
      title: 'BEARely Any Trouble',
      description: 'Defeat the NightBear Boss in a run.',
      unlockText: "NightBear's Claws Artifact",
    },
    color_me_impressed: {
      id: 'color_me_impressed',
      title: 'Color Me Impressed',
      description: 'Defeat the 3 Archmages in a run.',
      unlockText: 'Geraldo The Red',
    },
    alphabet_green: {
      id: 'alphabet_green',
      title: 'Your Element is... Green.',
      description: 'Unlock Vine Snare and complete Boss Rush as Geraldo The Red.',
      unlockText: 'Geraldo The Green',
    },
    feeling_blue: {
      id: 'feeling_blue',
      title: 'Out of the whole Alphabet, Blue is my Favorite Number',
      description: 'Complete Boss Rush as Geraldo The Green.',
      unlockText: 'Geraldo The Blue',
    },
    youre_a_witch_ruby: {
      id: 'youre_a_witch_ruby',
      title: "You're a Witch, Ruby",
      description: 'Win Boss Rush for the first time.',
      unlockText: 'True Witch Mode',
    },
    being_a_witch_isnt_a_job: {
      id: 'being_a_witch_isnt_a_job',
      title: 'I AM a freaking Witch!',
      description: 'Win Boss Rush in True Witch Mode.',
      unlockText: 'Diamond Trophy',
    },
  },
  'pt-BR': {
    plants_vs_witches: {
      id: 'plants_vs_witches',
      title: 'Plantas Vs. Bruxas',
      description: 'Derrote o chefe Planta Carnívora em uma partida.',
      unlockText: 'Armadilha de Vinhas',
    },
    eye_see_you: {
      id: 'eye_see_you',
      title: 'De Olho em Você',
      description: 'Derrote o chefe Olho Assombrado em uma partida.',
      unlockText: 'Olho de Medusa',
    },
    bearely_any_trouble: {
      id: 'bearely_any_trouble',
      title: 'Urso MELéfico',
      description: 'Derrote o chefe NightBear em uma partida.',
      unlockText: 'Artefato Garras de NightBear',
    },
    color_me_impressed: {
      id: 'color_me_impressed',
      title: 'Mostre Suas Cores Verdadeiras',
      description: 'Derrote os 3 Arquemagos em uma partida.',
      unlockText: 'Geraldo O Vermelho',
    },
    alphabet_green: {
      id: 'alphabet_green',
      title: 'Seu Elemento é... Verde.',
      description: 'Desbloqueie a Armadilha de Vinhas e vença a Invasão de Chefes como Geraldo O Vermelho.',
      unlockText: 'Geraldo O Verde',
    },
    feeling_blue: {
      id: 'feeling_blue',
      title: 'De todo o Alfabeto, Azul é o meu Número Favorito',
      description: 'Vença a Invasão de Chefes como Geraldo O Verde.',
      unlockText: 'Geraldo O Azul',
    },
    youre_a_witch_ruby: {
      id: 'youre_a_witch_ruby',
      title: 'Você é uma Bruxa, Ruby',
      description: 'Vença a Invasão de Chefes pela primeira vez.',
      unlockText: 'Modo Bruxa Verdadeira',
    },
    being_a_witch_isnt_a_job: {
      id: 'being_a_witch_isnt_a_job',
      title: 'Eu SOU uma Bruxa!',
      description: 'Vença a Invasão de Chefes no Modo Bruxa Verdadeira.',
      unlockText: 'Troféu de Diamante',
    },
  },
};

export function translateAchievement(id: string, field: 'title' | 'description' | 'unlockText', defaultVal: string, lang: Language = currentLanguage): string {
  const item = LOCALIZED_ACHIEVEMENTS[lang]?.[id];
  if (item) {
    return item[field];
  }
  return defaultVal;
}

// In-Game Entities Dynamic Translation Maps

export const WEAPON_TRANSLATIONS: Record<Language, Record<string, { name: string; description: string }>> = {
  en: {
    arcane_wand: { name: 'Stellar Beam', description: 'Direct fire magical arcane shards toward your mouse cursor.' },
    brimstone_shotgun: { name: 'Acid Pellets', description: 'Fires corrosive acid pellets toward your cursor in rapid bursts.' },
    astral_sword: { name: 'Astral Blade', description: 'Swings an ethereal blade in a sweeping cone towards the cursor, expanding from 90° to 180° with upgrades.' },
    toxic_cauldron: { name: 'Acid Pools', description: 'Hurls splashing caustic flasks creating lingering corrosive acid pools on the ground.' },
    grimoire_orbit: { name: 'Orbiting Grimoire', description: 'Enchants ancient cursed tomes to orbit around you, damaging any enemy entering your personal space.' },
    hellfire_nova: { name: 'Pentagram', description: 'Emits an expanding circular pulse and glowing pentagram around the witch, incinerating nearby enemies without projectiles.' },
    seeking_wisp: { name: 'Fire Wisp', description: 'Launches blazing fire wisps that autonomously seek out the nearest enemy.' },
    vine_snare: { name: 'Vine Snare', description: 'Attacks the nearest enemy, dealing damage and trapping them in a visible vine for a few seconds. Defeat the Carnivore Plant Boss to unlock.' },
    thunderstrike: { name: 'Thunderstrike', description: 'A strong homing lightning weapon with high cooldown that strikes the nearest enemy with a crackling beam extending from the witch.' },
  },
  'pt-BR': {
    arcane_wand: { name: 'Feixe Estelar', description: 'Dispare fragmentos arcanos mágicos diretamente em direção ao cursor do mouse.' },
    brimstone_shotgun: { name: 'Bolotas Ácidas', description: 'Dispara bolotas de ácido corrosivo em rajadas rápidas em direção ao cursor.' },
    astral_sword: { name: 'Lâmina Astral', description: 'Goleia com uma lâmina etérea em um cone de varredura em direção ao cursor, expandindo de 90° para 180° com melhorias.' },
    toxic_cauldron: { name: 'Poças de Ácido', description: 'Arremessa frascos cáusticos que espirram, criando poças de ácido corrosivo persistentes no chão.' },
    grimoire_orbit: { name: 'Grimório Orbitante', description: 'Encanta tomos amaldiçoados antigos para orbitarem ao seu redor, causando dano a qualquer inimigo que entrar no seu espaço pessoal.' },
    hellfire_nova: { name: 'Pentagrama', description: 'Emite um pulso circular em expansão e um pentagrama brilhante ao redor da bruxa, incinerando inimigos próximos sem projéteis.' },
    seeking_wisp: { name: 'Fogo Fátuo', description: 'Lança fogos fátuos ardentes que buscam autonomamente o inimigo mais próximo.' },
    vine_snare: { name: 'Armadilha de Vinhas', description: 'Ataca o inimigo mais próximo, causando dano e prendendo-o em vinhas visíveis por alguns segundos. Derrote o chefe Planta Carnívora para desbloquear.' },
    thunderstrike: { name: 'Golpe do Trovão', description: 'Uma arma teleguiada de raio forte e alto tempo de recarga que atinge o inimigo mais próximo com um feixe elétrico estendido a partir da bruxa.' },
  },
};

export const WEAPON_TIER_TRANSLATIONS: Record<Language, Record<string, Record<number, { name?: string; description: string }>>> = {
  en: {
    arcane_wand: {
      1: { name: 'Stellar Beam', description: 'Fires 1 arcane shard toward cursor.' },
      2: { description: 'Fires 2 additional smaller shards on the sides and deals 30% more damage.' },
      3: { description: 'All shards pierce +1 enemy. +30% fire rate and +10% damage.' },
      4: { description: 'Side shards grow to full size and +10% damage.' },
      5: { description: 'All shards pierce through +1 more enemy. +10% damage.' },
      6: { description: '+25% Fire Rate and +10% damage.' },
      7: { name: 'Stellar Laser', description: 'Transforms into a devastating laser beam that pierces infinitely.' },
    },
    brimstone_shotgun: {
      1: { name: 'Acid Pellets', description: 'Fires 3 acid pellets, with the middle pellet aiming directly at your cursor.' },
      2: { description: 'Every shot fires another 3 pellets right after the first 3 in quick succession.' },
      3: { description: 'Pellets apply corrosive Acid (7s duration, 1 hit/s dealing 10% attack damage) with a toxic green aura.' },
      4: { description: 'Fires 2 more pellets in the first volley and 2 more in the second (10 pellets total per shot).' },
      5: { description: 'Raises Acid duration from 7s to 10s.' },
      6: { description: 'Every pellet gains +2 penetration, melting through hordes of foes.' },
      7: { name: 'Acidic Wave', description: 'Converts pellet shots into a wide acidic wave dealing double damage, knockbacking foes, and applying Acid for 15s.' },
    },
    astral_sword: {
      1: { name: 'Astral Blade', description: 'Swings an ethereal blade in a 90° cone towards cursor in short range.' },
      2: { description: 'Increases swing cone to 108° and deals +6 damage.' },
      3: { description: 'Increases swing cone to 126° and deals +8 damage.' },
      4: { description: 'Increases swing cone to 144° and deals +10 damage.' },
      5: { description: 'Increases swing cone to 162° and deals +12 damage.' },
      6: { description: 'Increases swing cone to 180° (full frontal half-circle) and deals +15 damage.' },
      7: { name: 'Astral Transformation', description: 'Blade is always on screen aiming at cursor. Fast movement slashes foes with big damage & knockback, with 50% chance for Burn or Acid.' },
    },
    toxic_cauldron: {
      1: { name: 'Acid Pools', description: 'Splashes 1 small corrosive acid pool at nearby ground.' },
      2: { description: 'Pools deal +2 damage and expand +10 radius.' },
      3: { description: 'Throws +1 acid pool per attack (2 pools total).' },
      4: { description: 'Pools deal +4 damage and recharge 25% faster.' },
      5: { description: 'Throws +1 more pool (3 pools total) with wider area.' },
      6: { description: 'Creates 4 massive bubbling acid lakes that dissolve whole hordes.' },
    },
    grimoire_orbit: {
      1: { name: 'Orbiting Grimoire', description: '1 cursed grimoire spins around the witch at steady speed.' },
      2: { description: 'Grimoire rotation speed (r.p.m.) increases by 35%.' },
      3: { description: 'Adds +1 orbiting grimoire (2 grimoires total).' },
      4: { description: 'Grimoires rotate 35% faster (r.p.m.) around the witch.' },
      5: { description: 'Adds +1 orbiting grimoire (3 grimoires total, max books reached).' },
      6: { description: '3 cosmic tomes rotate in a blazing hyper-velocity vortex (+35% r.p.m.).' },
    },
    hellfire_nova: {
      1: { name: 'Pentagram', description: 'Emits a 130px circular pulse and glowing star around the witch.' },
      2: { description: 'Pulse radius expands (+25px) and deals +8 damage.' },
      3: { description: 'Pulse recharges quicker and deals +12 damage.' },
      4: { description: 'Pulse radius expands (+30px) and deals +16 damage.' },
      5: { description: 'Pulse blast knocks back foes strongly and deals +22 damage.' },
      6: { description: 'Unleashes an apocalyptic 290px circular pulse and pentagram incinerating all nearby foes.' },
    },
    seeking_wisp: {
      1: { name: 'Fire Wisp', description: 'Launches 1 blazing homing fire wisp seeking the nearest monster.' },
      2: { description: 'Launches +1 homing fire wisp per volley (2 wisps total) and deals +4 damage.' },
      3: { description: 'Fire wisps fly 30% faster and deal +6 damage.' },
      4: { description: 'Deals +10 damage and launches +1 homing fire wisp (3 wisps total).' },
      5: { description: 'Deals +15 damage and strengthens homing trajectory.' },
      6: { description: 'Detonates a small explosion on impact, dealing direct damage and area splash damage to nearby enemies.' },
      7: { name: 'Fireball!!!', description: 'Hurls a colossal Mega Fireball that detonates into a massive explosion on impact, dealing enormous splash damage and igniting all enemies caught within with continuous Burn.' },
    },
    vine_snare: {
      1: { name: 'Vine Snare', description: 'Traps 1 nearest enemy in thorny vines for 2.0s. High cooldown.' },
      2: { description: 'Decreases vine cooldown by 22%.' },
      3: { description: 'Targets +1 additional enemy (2 enemies total).' },
      4: { description: 'Decreases vine cooldown by 38%.' },
      5: { description: 'Targets +1 additional enemy (3 enemies total).' },
      6: { description: 'Rapidly traps 4 nearest enemies in thick thorny vines.' },
      7: { name: 'Pet Plant', description: 'Summons a loyal miniature Carnivore Plant companion that follows you into battle, periodically lunging and viciously biting nearby enemies with snapping jaws while you continue trapping foes.' },
    },
    thunderstrike: {
      1: { name: 'Thunderstrike', description: 'Shoots a Thunderstrike beam extending from player to closest enemy, dealing 30 damage. High cooldown.' },
      2: { description: 'Thunderstrike freezes enemies hit by 0.5 second.' },
      3: { description: 'After first hit, smaller thunderstrikes chain off the first enemy, dealing 50% damage to up to 2 nearby enemies.' },
      4: { description: 'Thunderstrike can now chain off to 4 enemies.' },
      5: { description: 'Thunderstrike now freezes the enemy hit for 0.75s.' },
      6: { description: 'Chained off Thunderstrikes now freeze the enemy hit for 0.5s.' },
      7: { name: 'Thunderstorm', description: 'Shoots 2 Thunderstrike beams simultaneously and creates a aura around player that slows down enemies by 10%.' },
    },
  },
  'pt-BR': {
    arcane_wand: {
      1: { name: 'Feixe Estelar', description: 'Dispara 1 fragmento arcano em direção ao cursor.' },
      2: { description: 'Dispara 2 fragmentos menores adicionais nas laterais e causa 30% a mais de dano.' },
      3: { description: 'Todos os fragmentos perfuram +1 inimigo. +30% de velocidade de ataque e +10% de dano.' },
      4: { description: 'Fragmentos laterais crescem para o tamanho total e +10% de dano.' },
      5: { description: 'Todos os fragmentos perfuram mais +1 inimigo. +10% de dano.' },
      6: { description: '+25% de velocidade de ataque e +10% de dano.' },
      7: { name: 'Laser Estelar', description: 'Transforma-se em um feixe de laser devastador que perfura infinitamente.' },
    },
    brimstone_shotgun: {
      1: { name: 'Bolotas Ácidas', description: 'Dispara 3 bolotas de ácido, com a bolota do meio mirando diretamente no cursor.' },
      2: { description: 'Cada disparo lança outras 3 bolotas logo após as primeiras em rápida sucessão.' },
      3: { description: 'Bolotas aplicam Ácido corrosivo (duração de 7s, 1 acerto/s causando 10% de dano de ataque) com uma aura verde tóxica.' },
      4: { description: 'Dispara mais 2 bolotas na primeira rajada e mais 2 na segunda (10 bolotas no total por tiro).' },
      5: { description: 'Aumenta a duração do Ácido de 7s para 10s.' },
      6: { description: 'Cada bolota ganha +2 de penetração, derretendo hordas de inimigos.' },
      7: { name: 'Onda Ácida', description: 'Converte os disparos em uma ampla onda ácida que causa o dobro de dano, repele inimigos e aplica Ácido por 15s.' },
    },
    astral_sword: {
      1: { name: 'Lâmina Astral', description: 'Goleia com uma lâmina etérea em um cone de 90° em direção ao cursor em curto alcance.' },
      2: { description: 'Aumenta o cone de golpe para 108° e causa +6 de dano.' },
      3: { description: 'Aumenta o cone de golpe para 126° e causa +8 de dano.' },
      4: { description: 'Aumenta o cone de golpe para 144° e causa +10 de dano.' },
      5: { description: 'Aumenta o cone de golpe para 162° e causa +12 de dano.' },
      6: { description: 'Aumenta o cone de golpe para 180° (meio círculo frontal completo) e causa +15 de dano.' },
      7: { name: 'Transformação Astral', description: 'A lâmina fica sempre na tela apontando para o cursor. Movimentos rápidos cortam os inimigos com grande dano e repulsão, com 50% de chance de Queimadura ou Ácido.' },
    },
    toxic_cauldron: {
      1: { name: 'Poças de Ácido', description: 'Espirra 1 pequena poça de ácido corrosivo no chão próximo.' },
      2: { description: 'As poças causam +2 de dano e expandem em +10 de raio.' },
      3: { description: 'Arremessa +1 poça de ácido por ataque (2 poças no total).' },
      4: { description: 'As poças causam +4 de dano e recarregam 25% mais rápido.' },
      5: { description: 'Arremessa +1 poça adicional (3 poças no total) com área maior.' },
      6: { description: 'Cria 4 lagos de ácido borbulhante massivos que dissolvem hordas inteiras.' },
    },
    grimoire_orbit: {
      1: { name: 'Grimório Orbitante', description: '1 grimório amaldiçoado gira ao redor da bruxa em velocidade constante.' },
      2: { description: 'A velocidade de rotação do grimório (r.p.m.) aumenta em 35%.' },
      3: { description: 'Adiciona +1 grimório orbitante (2 grimórios no total).' },
      4: { description: 'Os grimórios giram 35% mais rápido (r.p.m.) ao redor da bruxa.' },
      5: { description: 'Adiciona +1 grimório orbitante (3 grimórios no total, limite alcançado).' },
      6: { description: '3 tomos cósmicos giram em um vórtice ardente de hipervelocidade (+35% r.p.m.).' },
    },
    hellfire_nova: {
      1: { name: 'Pentagrama', description: 'Emite um pulso circular de 130px e uma estrela brilhante ao redor da bruxa.' },
      2: { description: 'O raio do pulso expande (+25px) e causa +8 de dano.' },
      3: { description: 'O pulso recarrega mais rápido e causa +12 de dano.' },
      4: { description: 'O raio do pulso expande (+30px) e causa +16 de dano.' },
      5: { description: 'A explosão do pulso repele os inimigos fortemente e causa +22 de dano.' },
      6: { description: 'Libera um pulso circular apocalíptico de 290px e um pentagrama, incinerando todos os inimigos próximos.' },
    },
    seeking_wisp: {
      1: { name: 'Fogo Fátuo', description: 'Lança 1 fogo fátuo teleguiado ardente que busca o monstro mais próximo.' },
      2: { description: 'Lança +1 fogo fátuo teleguiado por rajada (2 no total) e causa +4 de dano.' },
      3: { description: 'Fogos fátuos voam 30% mais rápido e causam +6 de dano.' },
      4: { description: 'Causa +10 de dano e lança +1 fogo fátuo teleguiado (3 no total).' },
      5: { description: 'Causa +15 de dano e fortalece a trajetória teleguiada.' },
      6: { description: 'Detona uma pequena explosão no impacto, causando dano direto e dano de área a inimigos próximos.' },
      7: { name: 'Bola de Fogo!!!', description: 'Arremessa uma colossal Mega Bola de Fogo que detona em uma explosão massiva no impacto, causando enorme dano de área e incendiando todos com Queimadura contínua.' },
    },
    vine_snare: {
      1: { name: 'Armadilha de Vinhas', description: 'Prende 1 inimigo mais próximo em vinhas espinhosas por 2.0s. Tempo de recarga alto.' },
      2: { description: 'Reduz o tempo de recarga das vinhas em 22%.' },
      3: { description: 'Alveja +1 inimigo adicional (2 inimigos no total).' },
      4: { description: 'Reduz o tempo de recarga das vinhas em 38%.' },
      5: { description: 'Alveja +1 inimigo adicional (3 inimigos no total).' },
      6: { description: 'Prende rapidamente os 4 inimigos mais próximos em vinhas espinhosas grossas.' },
      7: { name: 'Planta de Estimação', description: 'Invoca uma mini Planta Carnívora de estimação leal que te segue na batalha, avançando periodicamente e mordendo ferozmente inimigos próximos.' },
    },
    thunderstrike: {
      1: { name: 'Golpe do Trovão', description: 'Dispara um feixe elétrico do jogador até o inimigo mais próximo, causando 30 de dano. Tempo de recarga alto.' },
      2: { description: 'Golpe do Trovão congela os inimigos atingidos por 0,5 segundo.' },
      3: { description: 'Após o primeiro acerto, raios menores encadeiam do primeiro inimigo, causando 50% de dano a até 2 inimigos próximos.' },
      4: { description: 'Golpe do Trovão agora pode encadear para até 4 inimigos.' },
      5: { description: 'Golpe do Trovão agora congela o inimigo atingido por 0,75s.' },
      6: { description: 'Raios encadeados agora congelam o inimigo atingido por 0,5s.' },
      7: { name: 'Tempestade de Trovões', description: 'Dispara 2 feixes elétricos simultaneamente e cria uma aura ao redor do jogador que desacelera inimigos em 10%.' },
    },
  },
};

export const STAT_ITEM_TRANSLATIONS: Record<Language, Record<string, { name: string; description: string }>> = {
  en: {
    medusas_eye: { name: "Medusa's Eye", description: "An ancient, petrifying gaze that slows down all enemies within a radius of your cursor, turning them slightly gray. Defeat the Haunted Eye Boss to unlock." },
    astral_lens: { name: 'Astral Lens', description: 'Magnifies all magical projectiles, beams, and Area-of-Effect zones.' },
    repulsion_talisman: { name: 'Repulsion Talisman', description: 'Imbues your attacks with kinetic force that violently repels charging enemies.' },
    broom_of_haste: { name: 'Broom of Haste', description: 'Witchcraft broom enchantment that reduces Shift-dash cooldown by 10% of base time per rank.' },
    magnet_orb: { name: 'Attractor Amulet', description: 'Pulls scattered EXP crystals, food, and EXP magnets from great distances automatically.' },
    blood_ruby: { name: 'Bloodstone', description: 'Infuses witch vitality with ancient bloodstone, increasing Max HP and passive HP regen.' },
    destiny_control: { name: 'Destiny Control', description: 'An ancient occult compass and lucky charm that bends fate, expanding your options and controlling destiny.' },
    nightbears_claws: { name: "Nightbear's Claws", description: "Cursed obsidian claws that allow you to shred through enemies. Damages and knockbacks enemies that touch you while you Dash. Defeat the NightBear Boss to unlock." },
    shield_of_protection: { name: 'Shield of Protection', description: 'Enchanted protective shield that lowers all incoming damage taken by 5% per rank.' },
  },
  'pt-BR': {
    medusas_eye: { name: 'Olho de Medusa', description: 'Um olhar antigo e petrificante que retarda todos os inimigos dentro de um raio ao redor do cursor, tornando-os levemente cinzentos. Derrote o chefe Olho Assombrado para desbloquear.' },
    astral_lens: { name: 'Lente Astral', description: 'Amplia todos os projéteis mágicos, feixes e zonas de efeito de área.' },
    repulsion_talisman: { name: 'Talismã de Repulsão', description: 'Infiltra seus ataques com força cinética que repele violentamente os inimigos que avançam.' },
    broom_of_haste: { name: 'Vassoura da Pressa', description: 'Encantamento de vassoura de bruxa que reduz o tempo de recarga do Dash por Shift em 10% do tempo base por nível.' },
    magnet_orb: { name: 'Amuleto de Atração', description: 'Atrai cristais de EXP, comida e ímãs espalhados de grandes distâncias automaticamente.' },
    blood_ruby: { name: 'Pedra de Sangue', description: 'Infunde vitalidade à bruxa com uma antiga pedra de sangue, aumentando a Vida Máxima e a regeneração passiva.' },
    destiny_control: { name: 'Controle do Destino', description: 'Uma bússola oculta antiga e amuleto da sorte que dobra o destino, expandindo suas opções e controlando o destino.' },
    nightbears_claws: { name: 'Garras de NightBear', description: 'Garras de obsidiana amaldiçoadas que permitem retalhar os inimigos. Causa dano e repele inimigos que tocarem em você durante o Dash. Derrote o chefe NightBear para desbloquear.' },
    shield_of_protection: { name: 'Escudo de Proteção', description: 'Escudo protetor encantado que reduz todo o dano recebido em 5% por nível.' },
  },
};

export const STAT_ITEM_TIER_TRANSLATIONS: Record<Language, Record<string, Record<number, { name?: string; description: string }>>> = {
  en: {
    medusas_eye: {
      1: { name: "Medusa's Eye", description: 'Slows enemies near cursor by 25% (32px radius).' },
      2: { description: 'Slows enemies by 30% and increases radius to 38px.' },
      3: { description: 'Slows enemies by 35% and increases radius to 44px.' },
      4: { description: 'Slows enemies by 40% and increases radius to 50px.' },
      5: { description: 'Slows enemies by 45% and increases radius to 56px.' },
      6: { description: 'Devastating 55% slow in a 64px cursor radius!' },
    },
    astral_lens: {
      1: { name: 'Astral Lens', description: 'Increase all projectile & AoE sizes by +18%.' },
      2: { description: 'Increase sizes by +15% (1.33x total).' },
      3: { description: 'Increase sizes by +15% (1.48x total).' },
      4: { description: 'Increase sizes by +17% (1.65x total).' },
      5: { description: 'Increase sizes by +20% (1.85x total).' },
      6: { description: 'Sizes doubled (+115% total / 2.15x!). Giant devastating spells.' },
    },
    repulsion_talisman: {
      1: { name: 'Repulsion Talisman', description: 'Adds knockback to all attacks (+20% force).' },
      2: { description: 'Increases knockback by +25% (1.45x total).' },
      3: { description: 'Increases knockback by +25% (1.7x total).' },
      4: { description: 'Increases knockback by +30% (2.0x total).' },
      5: { description: 'Increases knockback by +35% (2.35x total).' },
      6: { description: 'Tremendous 2.75x knockback force! Enemies cannot get close.' },
    },
    broom_of_haste: {
      1: { name: 'Broom of Haste', description: 'Reduces dash cooldown by 10% of base time.' },
      2: { description: 'Reduces dash cooldown by 10% of base time (-20% total).' },
      3: { description: 'Reduces dash cooldown by 10% of base time (-30% total).' },
      4: { description: 'Reduces dash cooldown by 10% of base time (-40% total).' },
      5: { description: 'Reduces dash cooldown by 10% of base time (-50% total)! Max rank 5.' },
    },
    magnet_orb: {
      1: { name: 'Attractor Amulet', description: '+25% EXP, food & magnet collection radius (1.25x total).' },
      2: { description: '+25% collection radius (1.50x total).' },
      3: { description: '+25% collection radius (1.75x total).' },
      4: { description: '+25% collection radius (2.00x total).' },
      5: { description: '+25% collection radius (2.25x total).' },
      6: { description: '+25% collection radius (2.50x total). Pulls everything instantly.' },
    },
    blood_ruby: {
      1: { name: 'Bloodstone', description: '+20 Max HP and +0.1 HP/s passive regeneration.' },
      2: { description: '+20 Max HP and +0.1 HP/s regen (+40 Max HP total).' },
      3: { description: '+20 Max HP and +0.1 HP/s regen (+60 Max HP total).' },
      4: { description: '+20 Max HP and +0.1 HP/s regen (+80 Max HP total).' },
      5: { description: '+20 Max HP and +0.1 HP/s regen (+100 Max HP total).' },
    },
    destiny_control: {
      1: { name: 'Destiny Control', description: 'Opens a 4th option for every level up.' },
      2: { description: 'Choose from a pool of 2 random bosses at every 5-minute interval.' },
      3: { description: "Adds a secondary Witch's Deal option when striking bargains." },
      4: { description: 'Adds a 3rd boss option to the selection pool at every 5-minute interval.' },
      5: { description: 'Enables 1 Reroll per level up screen, refreshing all 4 options.' },
    },
    nightbears_claws: {
      1: { name: "Nightbear's Claws", description: 'Deals 20 damage and applies strong knockback to enemies you dash through.' },
      2: { description: 'Damage and knockback increased to 140%.' },
      3: { description: 'Damage and knockback increased to 180%.' },
      4: { description: 'Damage and knockback increased to 220%.' },
      5: { description: 'Damage and knockback increased to 260%.' },
      6: { description: 'Max Rank! Damage and knockback increased to 300%. Shred through the darkness.' },
    },
    shield_of_protection: {
      1: { name: 'Shield of Protection', description: 'Lowers damage taken by 5%.' },
      2: { description: 'Lowers damage taken by 10% (-5% additional).' },
      3: { description: 'Lowers damage taken by 15% (-5% additional).' },
      4: { description: 'Lowers damage taken by 20% (-5% additional).' },
      5: { description: 'Max Rank! Lowers damage taken by 25%.' },
    },
  },
  'pt-BR': {
    medusas_eye: {
      1: { name: 'Olho de Medusa', description: 'Desacelera inimigos perto do cursor em 25% (raio de 32px).' },
      2: { description: 'Desacelera inimigos em 30% e aumenta o raio para 38px.' },
      3: { description: 'Desacelera inimigos em 35% e aumenta o raio para 44px.' },
      4: { description: 'Desacelera inimigos em 40% e aumenta o raio para 50px.' },
      5: { description: 'Desacelera inimigos em 45% e aumenta o raio para 56px.' },
      6: { description: 'Lentidão devastadora de 55% em um raio do cursor de 64px!' },
    },
    astral_lens: {
      1: { name: 'Lente Astral', description: 'Aumenta todos os tamanhos de projétil e área em +18%.' },
      2: { description: 'Aumenta tamanhos em +15% (1.33x no total).' },
      3: { description: 'Aumenta tamanhos em +15% (1.48x no total).' },
      4: { description: 'Aumenta tamanhos em +17% (1.65x no total).' },
      5: { description: 'Aumenta tamanhos em +20% (1.85x no total).' },
      6: { description: 'Tamanhos dobrados (+115% total / 2.15x!). Feitiços gigantescos devastadores.' },
    },
    repulsion_talisman: {
      1: { name: 'Talismã de Repulsão', description: 'Adiciona repulsão a todos os ataques (+20% de força).' },
      2: { description: 'Aumenta a repulsão em +25% (1.45x no total).' },
      3: { description: 'Aumenta a repulsão em +25% (1.7x no total).' },
      4: { description: 'Aumenta a repulsão em +30% (2.0x no total).' },
      5: { description: 'Aumenta a repulsão em +35% (2.35x no total).' },
      6: { description: 'Força de repulsão tremenda de 2.75x! Os inimigos não conseguem se aproximar.' },
    },
    broom_of_haste: {
      1: { name: 'Vassoura da Pressa', description: 'Reduz o tempo de recarga do dash em 10% do tempo base.' },
      2: { description: 'Reduz o tempo de recarga do dash em 10% do tempo base (-20% total).' },
      3: { description: 'Reduz o tempo de recarga do dash em 10% do tempo base (-30% total).' },
      4: { description: 'Reduz o tempo de recarga do dash em 10% do tempo base (-40% total).' },
      5: { description: 'Reduz o tempo de recarga do dash em 10% do tempo base (-50% total)! Nível máximo 5.' },
    },
    magnet_orb: {
      1: { name: 'Amuleto de Atração', description: '+25% de raio de coleta de EXP, comida e ímãs (1.25x total).' },
      2: { description: '+25% de raio de coleta (1.50x no total).' },
      3: { description: '+25% de raio de coleta (1.75x no total).' },
      4: { description: '+25% de raio de coleta (2.00x no total).' },
      5: { description: '+25% de raio de coleta (2.25x no total).' },
      6: { description: '+25% de raio de coleta (2.50x no total). Atrai tudo instantaneamente.' },
    },
    blood_ruby: {
      1: { name: 'Pedra de Sangue', description: '+20 de Vida Máxima e +0,1 PV/s de regeneração passiva.' },
      2: { description: '+20 de Vida Máxima e +0,1 PV/s de regen (+40 de Vida Máxima no total).' },
      3: { description: '+20 de Vida Máxima e +0,1 PV/s de regen (+60 de Vida Máxima no total).' },
      4: { description: '+20 de Vida Máxima e +0,1 PV/s de regen (+80 de Vida Máxima no total).' },
      5: { description: '+20 de Vida Máxima e +0,1 PV/s de regen (+100 de Vida Máxima no total).' },
    },
    destiny_control: {
      1: { name: 'Controle do Destino', description: 'Abre uma 4ª opção a cada aumento de nível.' },
      2: { description: 'Escolha a partir de uma seleção de 2 chefes aleatórios a cada intervalo de 5 minutos.' },
      3: { description: 'Adiciona uma segunda opção de Acordo da Bruxa ao fechar barganhas.' },
      4: { description: 'Adiciona uma 3ª opção de chefe à seleção a cada intervalo de 5 minutos.' },
      5: { description: 'Habilita 1 Troca por tela de aumento de nível, atualizando as 4 opções.' },
    },
    nightbears_claws: {
      1: { name: 'Garras de NightBear', description: 'Causa 20 de dano e aplica forte repulsão a inimigos que você atravessar com o dash.' },
      2: { description: 'Dano e repulsão aumentados para 140%.' },
      3: { description: 'Dano e repulsão aumentados para 180%.' },
      4: { description: 'Dano e repulsão aumentados para 220%.' },
      5: { description: 'Dano e repulsão aumentados para 260%.' },
      6: { description: 'Nível Máximo! Dano e repulsão aumentados para 300%. Retalhe através da escuridão.' },
    },
    shield_of_protection: {
      1: { name: 'Escudo de Proteção', description: 'Reduz o dano recebido em 5%.' },
      2: { description: 'Reduz o dano recebido em 10% (-5% adicional).' },
      3: { description: 'Reduz o dano recebido em 15% (-5% adicional).' },
      4: { description: 'Reduz o dano recebido em 20% (-5% adicional).' },
      5: { description: 'Nível Máximo! Reduz o dano recebido em 25%.' },
    },
  },
};

export const CHARACTER_TRANSLATIONS: Record<Language, Record<string, { title: string; description: string }>> = {
  en: {
    ruby: { title: 'Misunderstood Witch', description: 'A good hearted woman born as a witch, fending herself because of that. And they call *her* the monster.' },
    glowob: { title: 'Just a Goo', description: "Just a goo. People treat them like a monster, when all they want to do is... to be honest, I'm not entirely sure I know what they do." },
    odalia: { title: 'Chosen Protector', description: "A former villain, chosen and converted by a higher organization to protect the injusticed. That's why she's here." },
    geraldo: { title: 'RGB Archmage', description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.' },
    geraldo_green: { title: 'RGB Archmage', description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.' },
    geraldo_blue: { title: 'RGB Archmage', description: 'A wise Archmage that teaches his knowledges to only a very small group, selected by hand.' },
  },
  'pt-BR': {
    ruby: { title: 'Bruxa Incompreendida', description: 'Uma mulher de bom coração que nasceu bruxa, apenas se defendendo. E ainda chamam *ela* de monstro.' },
    glowob: { title: 'Apenas uma Geleia', description: 'Apenas uma geleia. As pessoas a tratam como um monstro, quando tudo o que ela quer é... para ser honesto, não sei direito o que ela faz.' },
    odalia: { title: 'Protetora Escolhida', description: 'Uma ex-vilã, escolhida e convertida por uma organização superior para proteger os injustiçados. É por isso que ela está aqui.' },
    geraldo: { title: 'Arquemago RGB', description: 'Um sábio Arquemago que ensina seus conhecimentos apenas para um grupo muito seleto, escolhido a dedo.' },
    geraldo_green: { title: 'Arquemago RGB', description: 'Um sábio Arquemago que ensina seus conhecimentos apenas para um grupo muito seleto, escolhido a dedo.' },
    geraldo_blue: { title: 'Arquemago RGB', description: 'Um sábio Arquemago que ensina seus conhecimentos apenas para um grupo muito seleto, escolhido a dedo.' },
  },
};

export const WITCH_DEAL_TRANSLATIONS: Record<Language, Record<string, { title: string; subtitle: string; description: string }>> = {
  en: {
    curse_reset_guns_max_passives: {
      title: 'Ascendant Arcana',
      subtitle: 'Empower One Chosen Weapon and Recalibrate Your Arsenal',
      description: 'Randomly empowers 1 owned weapon, increasing its rank by +3 (up to Rank 6), while reducing all other owned weapons down to base level (Rank 1)!',
    },
    curse_triple_one_gun: {
      title: 'Pact of the Sole Relic',
      subtitle: 'Sacrifice Weapon Capacity for Cataclysmic Ruin',
      description: 'Destroys all weapons except 1 chosen at random, permanently tripling (300%) all of its stats! Reduces your maximum weapon capacity from 5 to 3.',
    },
    curse_divide_hp_double_dmg: {
      title: 'Glass Tank',
      subtitle: '',
      description: 'Halves your Base Max HP by 2, but DOUBLES all your damage output permanently!',
    },
    curse_vampires_bite: {
      title: "Vampire's Bite",
      subtitle: '',
      description: 'Removes ALL passive healing (Natural 0.5 HP/s & Bloodstone), but every enemy hit heals you for 2 HP.',
    },
    curse_deja_vu: {
      title: 'Déjà-Vu',
      subtitle: 'Time Rewinds to the Dawn, Bearing Infinite Enlightenment',
      description: 'Brings the player and all enemies back to Level 1. Removes all Weapons and Artifacts except Stellar Beam (reverted to Level 1). In return, all EXP earned is permanently TRIPLED (3x)!',
    },
  },
  'pt-BR': {
    curse_reset_guns_max_passives: {
      title: 'Arcano Ascendente',
      subtitle: 'Empodere uma Arma Escolhida e Recalibre seu Arsenal',
      description: 'Empodera aleatoriamente 1 arma possuída, aumentando seu nível em +3 (até o nível 6), enquanto reduz todas as outras armas para o nível base (Nível 1)!',
    },
    curse_triple_one_gun: {
      title: 'Pacto da Relíquia Única',
      subtitle: 'Sacrifique a Capacidade de Armas por uma Ruína Cataclísmica',
      description: 'Destrói todas as armas, exceto 1 escolhida aleatoriamente, triplicando permanentemente (300%) todos os seus atributos! Reduz sua capacidade máxima de armas de 5 para 3.',
    },
    curse_divide_hp_double_dmg: {
      title: 'Tanque de Vidro',
      subtitle: '',
      description: 'Reduz sua Vida Máxima pela metade, mas DOBRA todo o seu dano causado permanentemente!',
    },
    curse_vampires_bite: {
      title: 'Mordida de Vampiro',
      subtitle: '',
      description: 'Remove TODA cura passiva (Natural 0.5 PV/s e Pedra de Sangue), mas cada inimigo atingido te cura em 2 PV.',
    },
    curse_deja_vu: {
      title: 'Déjà-Vu',
      subtitle: 'O Tempo Retorna ao Amanhecer, Trazendo Iluminação Infinita',
      description: 'Leva o jogador e todos os inimigos de volta ao Nível 1. Remove todas as armas e artefatos, exceto o Feixe Estelar (revertido ao Nível 1). Em troca, toda a EXP obtida é permanentemente TRIPLICADA (3x)!',
    },
  },
};

export const BOSS_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    carnivore_plant: 'Carnivore Plant',
    haunted_eye: 'Haunted Eye',
    night_bear: 'NightBear', // explicitly don't change NightBear
    archmages: 'The 3 Archmages',
    geraldo_rgb: 'Geraldo The RGB',
    geraldo_red: 'Geraldo The Red',
    geraldo_green: 'Geraldo The Green',
    geraldo_blue: 'Geraldo The Blue',
  },
  'pt-BR': {
    carnivore_plant: 'Planta Carnívora',
    haunted_eye: 'Olho Assombrado',
    night_bear: 'NightBear', // explicitly don't change NightBear
    archmages: 'Os 3 Arquemagos',
    geraldo_rgb: 'Geraldo O RGB',
    geraldo_red: 'Geraldo O Vermelho',
    geraldo_green: 'Geraldo O Verde',
    geraldo_blue: 'Geraldo O Azul',
  },
};

export const ENEMY_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    BAT: 'Pitchfork Peasant',
    GHOUL: 'Village Knight',
    WRAITH: 'Torch Peasant',
    MINI_EYE: 'Mini Eye',
    ROCK_THROWER: 'Rock Thrower',
  },
  'pt-BR': {
    BAT: 'Camponês com Forca',
    GHOUL: 'Cavaleiro da Vila',
    WRAITH: 'Camponês com Tocha',
    MINI_EYE: 'Olhinho',
    ROCK_THROWER: 'Lançador de Pedras',
  },
};

export function translateWeaponName(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return WEAPON_TRANSLATIONS[lang]?.[id]?.name ?? defaultVal;
}

export function translateWeaponDescription(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return WEAPON_TRANSLATIONS[lang]?.[id]?.description ?? defaultVal;
}

export function translateWeaponTierName(id: string, tier: number, defaultVal: string, lang: Language = currentLanguage): string {
  return WEAPON_TIER_TRANSLATIONS[lang]?.[id]?.[tier]?.name ?? defaultVal;
}

export function translateWeaponTierDescription(id: string, tier: number, defaultVal: string, lang: Language = currentLanguage): string {
  return WEAPON_TIER_TRANSLATIONS[lang]?.[id]?.[tier]?.description ?? defaultVal;
}

export function translateStatItemName(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return STAT_ITEM_TRANSLATIONS[lang]?.[id]?.name ?? defaultVal;
}

export function translateStatItemDescription(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return STAT_ITEM_TRANSLATIONS[lang]?.[id]?.description ?? defaultVal;
}

export function translateStatItemTierName(id: string, tier: number, defaultVal: string, lang: Language = currentLanguage): string {
  return STAT_ITEM_TIER_TRANSLATIONS[lang]?.[id]?.[tier]?.name ?? defaultVal;
}

export function translateStatItemTierDescription(id: string, tier: number, defaultVal: string, lang: Language = currentLanguage): string {
  return STAT_ITEM_TIER_TRANSLATIONS[lang]?.[id]?.[tier]?.description ?? defaultVal;
}

export function translateCharacterName(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  if (lang === 'pt-BR') {
    if (id === 'geraldo') return 'Geraldo O Vermelho';
    if (id === 'geraldo_green') return 'Geraldo O Verde';
    if (id === 'geraldo_blue') return 'Geraldo O Azul';
  }
  return defaultVal;
}

export function translateCharacterTitle(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return CHARACTER_TRANSLATIONS[lang]?.[id]?.title ?? defaultVal;
}

export function translateCharacterDescription(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return CHARACTER_TRANSLATIONS[lang]?.[id]?.description ?? defaultVal;
}

export function translateCurseTitle(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return WITCH_DEAL_TRANSLATIONS[lang]?.[id]?.title ?? defaultVal;
}

export function translateCurseSubtitle(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return WITCH_DEAL_TRANSLATIONS[lang]?.[id]?.subtitle ?? defaultVal;
}

export function translateCurseDescription(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return WITCH_DEAL_TRANSLATIONS[lang]?.[id]?.description ?? defaultVal;
}

export function translateBossName(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return BOSS_TRANSLATIONS[lang]?.[id] ?? defaultVal;
}

export function translateEnemyName(type: string, defaultVal: string, lang: Language = currentLanguage): string {
  return ENEMY_TRANSLATIONS[lang]?.[type] ?? defaultVal;
}

export const ENEMY_DESC_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    wraith: 'A peasant carrying a flickering torch through the shadows. The baseline villager moving at standard speed.',
    bat: 'A maddened villager wielding an iron pitchfork. Hardier, swifter, and more aggressive than torch-bearing peasants.',
    rock_thrower: 'A cunning villager who maintains a safe distance from the Witch, telegraphing and hurling heavy rocks every few seconds.',
    ghoul: 'A resilient elite knight of the village that drops high-value Red EXP Orbs.',
    carnivore_plant: 'A stationary botanical nightmare with vicious roots and an insatiable appetite.',
    mini_eye: 'A tiny, swift ocular minion spawned when the Haunted Eye reveals its true gaze. They relentlessly pursue the witch and self-destruct upon contact.',
    haunted_eye: 'A colossal panoramic ocular terror that stays open until its trio of Mini Eye minions are defeated.',
    night_bear: 'A dark, hulking beast that alternates between relentless charges and a devastating arena-wide biting frenzy called "THE Bite".',
    archmages: 'A trinity of wise Archmages, testing Ruby. Each has their own attack, but, after defeating all 3, something is waiting for you...',
  },
  'pt-BR': {
    wraith: 'Um camponês carregando uma tocha bruxuleante pelas sombras. O habitante básico da vila que se move em velocidade padrão.',
    bat: 'Um camponês enlouquecido empunhando uma forca de ferro. Mais resistente, veloz e agressivo do que os camponeses com tochas.',
    rock_thrower: 'Um aldeão astuto que mantém uma distância segura da Bruxa, sinalizando e arremessando pedras pesadas a cada poucos segundos.',
    ghoul: 'Um cavaleiro de elite resiliente da vila que deixa cair Orbes de EXP Vermelhas de alto valor.',
    carnivore_plant: 'Um pesadelo botânico estacionário com raízes cruéis e um apetite insaciável.',
    mini_eye: 'Um pequeno e veloz servo ocular gerado quando o Olho Assombrado revela seu verdadeiro olhar. Eles perseguem implacavelmente a bruxa e se autodestroem ao contato.',
    haunted_eye: 'Um colossal terror ocular panorâmico que permanece aberto até que seu trio de servos Olhinho seja derrotado.',
    night_bear: 'Uma fera sombria e robusta que alterna entre investidas implacáveis e um ataque de mordida devastador em toda a arena chamado "A Mordida".',
    archmages: 'Uma trindade de sábios Arquemagos testando Ruby. Cada um tem seu próprio ataque, mas, após derrotar os 3, algo está esperando por você...',
  },
};

export const ATTACK_TRANSLATIONS: Record<Language, Record<string, { name: string; telegraph: string }>> = {
  en: {
    'Vine Snare': {
      name: 'Vine Snare',
      telegraph: 'Spawns roots near the player. Emits a smaller warning circle before striking.',
    },
    'Chomp Attack': {
      name: 'Chomp Attack',
      telegraph: 'Massive area-of-effect bite centered on the player. Dash is required to escape.',
    },
    'Blood Tears': {
      name: 'Blood Tears',
      telegraph: 'Weeps magical projectiles that drift toward the player.',
    },
    'Gaze Curse': {
      name: 'Gaze Curse',
      telegraph: 'When the eye opens, player must look away (cursor below the witch) or suffer rapid damage. The eye only closes when all 3 Mini Eyes are destroyed.',
    },
    'Charge': {
      name: 'Charge',
      telegraph: 'NightBear readies himself and charges at high speed until hitting a wall. Crashing 3 times causes him to become stunned and dizzy.',
    },
    'THE Bite': {
      name: 'THE Bite',
      telegraph: 'After recovering from dizziness twice (2 Charge Attacks), NightBear leaps to the top center (telegraphed by a red circle) and bites in circular areas, leaving an opening nearby to escape with quick thinking.',
    },
    "It's Raining Fire!": {
      name: "It's Raining Fire!",
      telegraph: 'Geraldo The Red casts 4 pairs of homing fireballs from screen sides. They steer toward you and despawn 4s after the final wave.',
    },
    'Vine Box': {
      name: 'Vine Box',
      telegraph: 'Geraldo The Green traps you in a 3x3 box bordered by red vine tiles, striking with 3x1 telegraphed vine bursts.',
    },
    'Thunder Beams': {
      name: 'Thunder Beams',
      telegraph: 'Geraldo The Blue fires 4 electric beams that spin clockwise for 10s. Touching a beam inflicts damage with a 3s invulnerability safety window.',
    },
    'Cloning Spell': {
      name: 'Cloning Spell',
      telegraph: 'Geraldo The RGB duplicates you into separate 3x3 boxes. Move together to stand on safe tiles for both yourself and your clone.',
    },
    'RGBeam': {
      name: 'RGBeam',
      telegraph: '8 spinning rainbow beams rotate clockwise around Geraldo The RGB at 45° angles.',
    },
    'Rainbow Rain': {
      name: 'Rainbow Rain',
      telegraph: 'Rainbow fireballs launch from 2 screen sides while lightning strikes telegraphed circles.',
    },
  },
  'pt-BR': {
    'Vine Snare': {
      name: 'Armadilha de Vinhas',
      telegraph: 'Invoca raízes perto do jogador. Emite um círculo de aviso menor antes de golpear.',
    },
    'Chomp Attack': {
      name: 'Ataque de Mastigação',
      telegraph: 'Mordida massiva em área centrada no jogador. É necessário usar o Dash para escapar.',
    },
    'Blood Tears': {
      name: 'Lágrimas de Sangue',
      telegraph: 'Chora projéteis mágicos que flutuam em direção ao jogador.',
    },
    'Gaze Curse': {
      name: 'Maldição do Olhar',
      telegraph: 'Quando o olho se abre, o jogador deve desviar o olhar (cursor abaixo da bruxa) ou sofrerá dano rápido. O olho só se fecha quando todos os 3 Olhinhos forem destruídos.',
    },
    'Charge': {
      name: 'Investida',
      telegraph: 'NightBear se prepara e avança em alta velocidade até colidir com uma parede. Bater 3 vezes o deixa atordoado e tonto.',
    },
    'THE Bite': {
      name: 'A Mordida',
      telegraph: 'Depois de se recuperar da tontura duas vezes (2 Ataques de Investida), NightBear salta para o centro superior (sinalizado por um círculo vermelho) e morde em áreas circulares, deixando uma abertura próxima para escapar com raciocínio rápido.',
    },
    "It's Raining Fire!": {
      name: 'Chuva de Fogo!',
      telegraph: 'Geraldo O Vermelho lança 4 pares de bolas de fogo teleguiadas das laterais que desaparecem 4s após a última onda.',
    },
    'Vine Box': {
      name: 'Caixa de Vinhas',
      telegraph: 'Geraldo O Verde prende você em uma caixa 3x3 cercada por vinhas vermelhas e ataca com golpes telegrafados 3x1.',
    },
    'Thunder Beams': {
      name: 'Feixes de Trovão',
      telegraph: 'Geraldo O Azul dispara 4 feixes elétricos que giram em sentido horário por 10s. Tocar neles causa dano com 3s de invulnerabilidade.',
    },
    'Cloning Spell': {
      name: 'Feitiço de Clonagem',
      telegraph: 'Geraldo O RGB duplica você em caixas 3x3 separadas. Mova-se em conjunto para pisar em azulejos seguros para ambos.',
    },
    'RGBeam': {
      name: 'Feixe RGB',
      telegraph: '8 feixes de arco-íris giratórios em ângulos de 45° ao redor de Geraldo O RGB.',
    },
    'Rainbow Rain': {
      name: 'Chuva de Arco-Íris',
      telegraph: 'Bolas de fogo de arco-íris são disparadas de 2 lados da tela enquanto raios caem em círculos telegrafados.',
    },
  },
};

export function translateEnemyDescription(id: string, defaultVal: string, lang: Language = currentLanguage): string {
  return ENEMY_DESC_TRANSLATIONS[lang]?.[id] ?? defaultVal;
}

export function translateAttackName(attackName: string, lang: Language = currentLanguage): string {
  return ATTACK_TRANSLATIONS[lang]?.[attackName]?.name ?? attackName;
}

export function translateAttackTelegraph(attackName: string, defaultVal: string, lang: Language = currentLanguage): string {
  return ATTACK_TRANSLATIONS[lang]?.[attackName]?.telegraph ?? defaultVal;
}

