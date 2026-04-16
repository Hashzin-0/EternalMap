export interface HexCoords {
  q: number;
  r: number;
}

export function hexToString(hex: HexCoords): string {
  return `${hex.q},${hex.r}`;
}

export function hexFromString(str: string): HexCoords {
  const [q, r] = str.split(',').map(Number);
  return { q, r };
}

export enum TerrainType {
  OCEAN = 'ocean',
  PLAINS = 'plains',
  HILLS = 'hills',
  MOUNTAINS = 'mountains',
  DESERT = 'desert',
  TUNDRA = 'tundra',
  JUNGLE = 'jungle',
  FOREST = 'forest',
  MARSH = 'marsh',
  COAST = 'coast',
}

export interface TerrainModifiers {
  movementCost: number;
  defenseBonus: number;
  combatWidth: number;
}

export const TERRAIN_MODIFIERS: Record<TerrainType, TerrainModifiers> = {
  ocean: { movementCost: 999, defenseBonus: 0, combatWidth: 0 },
  plains: { movementCost: 1.0, defenseBonus: 0, combatWidth: 1.0 },
  hills: { movementCost: 1.2, defenseBonus: 1, combatWidth: 0.67 },
  mountains: { movementCost: 1.4, defenseBonus: 2, combatWidth: 0.34 },
  desert: { movementCost: 1.3, defenseBonus: 0, combatWidth: 1.0 },
  tundra: { movementCost: 1.5, defenseBonus: 0, combatWidth: 1.0 },
  jungle: { movementCost: 1.3, defenseBonus: 2, combatWidth: 0.75 },
  forest: { movementCost: 1.2, defenseBonus: 1, combatWidth: 0.8 },
  marsh: { movementCost: 1.4, defenseBonus: 1, combatWidth: 0.5 },
  coast: { movementCost: 1.0, defenseBonus: 0, combatWidth: 1.0 },
};

export interface Province {
  id: string;
  hex: HexCoords;
  terrain: TerrainType;
  elevation: number;
  resources: Record<string, number>;
  ownerId: string | null;
  infrastructure: number;
  stateId: string | null;
}

export interface StateRegion {
  id: string;
  provinces: string[];
  traits: string[];
  arableLand: number;
  resources: Record<string, number>;
  cityHex: HexCoords | null;
  farmHex: HexCoords | null;
  portHex: HexCoords | null;
  mineHex: HexCoords | null;
  woodHex: HexCoords | null;
}

export interface State {
  id: string;
  regionId: string;
  ownerId: string;
  integrated: boolean;
  marketAccess: number;
  devastation: number;
}

export type GovernmentType = 
  | 'monarchy' | 'republic' | 'theocracy' | 'commune' | 'tribal';

export type CountryType = 'playable' | 'ai_only' | 'decentralized' | 'formable';

export interface Country {
  id: string;
  tag: string;
  nameKey: string;
  color: [number, number, number];
  countryType: CountryType;
  government: GovernmentType;
  primaryCulture: string;
  religion: string;
  capitalStateId: string | null;
  ownedStates: string[];
  marketId: string;
  treasury: number;
  prestige: number;
}

export enum GoodType {
  GRAIN = 'grain',
  FISH = 'fish',
  WOOD = 'wood',
  TEXTILES = 'textiles',
  COAL = 'coal',
  IRON = 'iron',
  STEEL = 'steel',
  RUBBER = 'rubber',
  LEAD = 'lead',
  SULFUR = 'sulfur',
  TEA = 'tea',
  COFFEE = 'coffee',
  WINE = 'wine',
  SILK = 'silk',
  TOBACCO = 'tobacco',
  SMALL_ARMS = 'small_arms',
  AMMUNITION = 'ammunition',
  ARTILLERY = 'artillery',
  WARSHIPS = 'warships',
  OIL = 'oil',
  GOLD = 'gold',
}

export type GoodCategory = 'staple' | 'industrial' | 'luxury' | 'military';

export interface ResourceDeposit {
  type: GoodType;
  amount: number;
  discoverable: boolean;
  discoveryChance: number;
  techRequired: string[];
}

export interface TileData {
  x: number;
  y: number;
  terrain: TerrainType;
  elevation: number;
  resources: Record<string, number>;
  buildingId: string | null;
  unitId: string | null;
}

export interface MapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: TileData[][];
  seed: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}