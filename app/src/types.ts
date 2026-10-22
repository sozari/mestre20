export interface PlayerAttack {
  id: string;
  name: string;
  bonus: string;     // ex: "+7" ou "7"
  damage: string;    // ex: "1d12+6"
  crit: string;      // ex: "19/x3" ou "x2"
  type: string;      // ex: "Impacto", "Corte"
  range: string;     // ex: "Corpo a corpo (3m)"
}

export interface PlayerCharacter {
  id: string;
  name: string;
  player: string;
  race: string;
  classAndLevel: string;
  origin: string;
  deity: string;
  size: 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';
  displacement: string; // ex: "9m (6q)"
  // Atributos (formato direto editável)
  forca: string;
  destreza: string;
  constituicao: string;
  inteligencia: string;
  sabedoria: string;
  carisma: string;
  // Recursos
  pvCurrent: number;
  pvMax: number;
  pvTemp: number;
  pmCurrent: number;
  pmMax: number;
  pmTemp: number;
  // Defesa e Resistências / Perícias importantes para o Mestre
  defesa: string;
  rd: string;
  fortitude: string;
  reflexos: string;
  vontade: string;
  iniciativa: string;
  percepcao: string;
  luta: string;
  pontaria: string;
  cdMagia: string;
  tibares: string;
  // Condições ativas
  conditions: string[];
  // Ataques rápidos
  attacks: PlayerAttack[];
  // Caixas de texto livres para o mestre
  powersAndSpells: string;
  equipment: string;
  complicationOrDistinction: string;
  notes: string;
  color: string;
}

export interface ThreatAttack {
  name: string;
  bonus: number;
  damage: string;
  crit?: string;
  extra?: string;
}

export interface ThreatSheet {
  id: string;
  name: string;
  nd: string; // "1/4", "1/2", "1", "2", ... "20"
  role: 'Solo' | 'Lacaio' | 'Especial';
  typeAndSize: string; // ex: "Humanoide (orc) Médio"
  sizeCategory: 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';
  category: string; // ex: "Masmorras", "Ermos", "Puristas", "Tormenta", "Reino dos Mortos", "Custom"
  iniciativa: number;
  percepcao: number;
  senses: string;
  defesa: number;
  fortitude: number;
  reflexos: number;
  vontade: number;
  resistances?: string;
  pvMax: number;
  pmMax: number;
  deslocamento: string;
  attacks: ThreatAttack[];
  abilities: string;
  forca: string;
  destreza: string;
  constituicao: string;
  inteligencia: string;
  sabedoria: string;
  carisma: string;
  skills?: string;
  equipmentAndTreasure?: string;
  treasureType?: 'Nenhum' | 'Metade' | 'Padrão' | 'Dobro';
  bookId?: 'basico' | 'herois' | 'ameacas' | 'baralho';
  pdfPage?: number;
  bookPage?: number;
}

export interface PlannedEncounterMonster {
  threatId: string;
  name: string;
  nd: string;
  count: number;
  treasureType: 'Nenhum' | 'Metade' | 'Padrão' | 'Dobro';
  bookId?: 'basico' | 'herois' | 'ameacas' | 'baralho';
  pdfPage?: number;
}

export interface PlannedEncounter {
  id: string;
  title: string;
  notes: string;
  cardsSummary: string;
  monsters: PlannedEncounterMonster[];
  treasureSummary: string;
  treasureCoinsT$: number;
}

export interface CombatantCondition {
  name: string;
  roundsLeft?: number; // undefined = até o fim da cena
}

export interface Combatant {
  id: string;
  sourceId: string; // id do PlayerCharacter ou ThreatSheet
  name: string;
  isPlayer: boolean;
  role?: 'Solo' | 'Lacaio' | 'Especial';
  nd?: string;
  initiativeRoll: number;
  initiativeBonus: number;
  pvCurrent: number;
  pvMax: number;
  pvTemp: number;
  pmCurrent: number;
  pmMax: number;
  defesa: number;
  fortitude: number;
  reflexos: number;
  vontade: number;
  rd?: string;
  sizeCategory: 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';
  conditions: CombatantCondition[];
  attacks: Array<{ name: string; bonus: number; damage: string; crit?: string; extra?: string }>;
  abilitiesSummary?: string;
  notes: string;
  color: string;
  // Posição no mapa tático (em quadrados do grid)
  gridX: number;
  gridY: number;
}

export interface DiceRollEntry {
  id: string;
  timestamp: string;
  actor: string;
  label: string;
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  isD20: boolean;
  naturalD20?: number;
  isCrit?: boolean;
  isFumble?: boolean;
  secret?: boolean;
  detail?: string;
}

export interface CustomMapPin {
  id: string;
  mapId: 'arton' | 'doherimm' | 'lamnor' | 'moreania' | 'tamura';
  coordinates: [number, number];
  title: string;
  category: 'Grupo' | 'Missão' | 'Masmorra' | 'NPC' | 'Perigo' | 'Cidade' | 'Nota';
  description: string;
  color: string;
}

export interface SessionLog {
  id: string;
  number: number;
  title: string;
  date: string;
  summary: string;
  npcsMet: string;
  rewardsAndXp: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  currentDay: string;
  currentLocation: string;
  partyCoordinates: [number, number];
  players: PlayerCharacter[];
  customThreats: ThreatSheet[];
  plannedEncounters?: PlannedEncounter[];
  combat: {
    active: boolean;
    round: number;
    turnIndex: number;
    combatants: Combatant[];
    tacticalBgUrl?: string;
    tacticalGridCols: number;
    tacticalGridRows: number;
  };
  mapPins: CustomMapPin[];
  travelRoute: [number, number][];
  sessions: SessionLog[];
  gmQuickNotes: string;
}

export interface AppState {
  activeCampaignId: string;
  campaigns: Campaign[];
  diceHistory: DiceRollEntry[];
}
