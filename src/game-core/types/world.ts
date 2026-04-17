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
  FABRIC = 'fabric',
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

export interface GoodDefinition {
  id: GoodType;
  nameKey: string;
  category: GoodCategory;
  basePrice: number;
  tradedQuantity: number;
  prestigeFactor: number;
  convoyCostMultiplier: number;
  consumptionTaxCost: number;
}

export const GOODS_DEFINITION: Record<GoodType, GoodDefinition> = {
  grain: { id: GoodType.GRAIN, nameKey: 'good.grain', category: 'staple', basePrice: 15, tradedQuantity: 100, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  fish: { id: GoodType.FISH, nameKey: 'good.fish', category: 'staple', basePrice: 12, tradedQuantity: 80, prestigeFactor: 1.0, convoyCostMultiplier: 1.2, consumptionTaxCost: 0 },
  wood: { id: GoodType.WOOD, nameKey: 'good.wood', category: 'staple', basePrice: 20, tradedQuantity: 150, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  fabric: { id: GoodType.FABRIC, nameKey: 'good.fabric', category: 'staple', basePrice: 18, tradedQuantity: 100, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  textiles: { id: GoodType.TEXTILES, nameKey: 'good.textiles', category: 'staple', basePrice: 25, tradedQuantity: 120, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  
  coal: { id: GoodType.COAL, nameKey: 'good.coal', category: 'industrial', basePrice: 30, tradedQuantity: 200, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  iron: { id: GoodType.IRON, nameKey: 'good.iron', category: 'industrial', basePrice: 40, tradedQuantity: 150, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  steel: { id: GoodType.STEEL, nameKey: 'good.steel', category: 'industrial', basePrice: 60, tradedQuantity: 80, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  rubber: { id: GoodType.RUBBER, nameKey: 'good.rubber', category: 'industrial', basePrice: 45, tradedQuantity: 60, prestigeFactor: 1.0, convoyCostMultiplier: 1.2, consumptionTaxCost: 0 },
  lead: { id: GoodType.LEAD, nameKey: 'good.lead', category: 'industrial', basePrice: 35, tradedQuantity: 70, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  sulfur: { id: GoodType.SULFUR, nameKey: 'good.sulfur', category: 'industrial', basePrice: 25, tradedQuantity: 50, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  
  tea: { id: GoodType.TEA, nameKey: 'good.tea', category: 'luxury', basePrice: 50, tradedQuantity: 40, prestigeFactor: 1.5, convoyCostMultiplier: 1.5, consumptionTaxCost: 0 },
  coffee: { id: GoodType.COFFEE, nameKey: 'good.coffee', category: 'luxury', basePrice: 55, tradedQuantity: 35, prestigeFactor: 1.5, convoyCostMultiplier: 1.5, consumptionTaxCost: 0 },
  wine: { id: GoodType.WINE, nameKey: 'good.wine', category: 'luxury', basePrice: 60, tradedQuantity: 30, prestigeFactor: 1.5, convoyCostMultiplier: 1.5, consumptionTaxCost: 0 },
  silk: { id: GoodType.SILK, nameKey: 'good.silk', category: 'luxury', basePrice: 80, tradedQuantity: 25, prestigeFactor: 2.0, convoyCostMultiplier: 2.0, consumptionTaxCost: 0 },
  tobacco: { id: GoodType.TOBACCO, nameKey: 'good.tobacco', category: 'luxury', basePrice: 45, tradedQuantity: 40, prestigeFactor: 1.5, convoyCostMultiplier: 1.5, consumptionTaxCost: 0 },
  
  small_arms: { id: GoodType.SMALL_ARMS, nameKey: 'good.small_arms', category: 'military', basePrice: 60, tradedQuantity: 50, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  ammunition: { id: GoodType.AMMUNITION, nameKey: 'good.ammunition', category: 'military', basePrice: 50, tradedQuantity: 40, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  artillery: { id: GoodType.ARTILLERY, nameKey: 'good.artillery', category: 'military', basePrice: 100, tradedQuantity: 20, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  warships: { id: GoodType.WARSHIPS, nameKey: 'good.warships', category: 'military', basePrice: 200, tradedQuantity: 10, prestigeFactor: 1.0, convoyCostMultiplier: 2.0, consumptionTaxCost: 0 },
  
  oil: { id: GoodType.OIL, nameKey: 'good.oil', category: 'industrial', basePrice: 70, tradedQuantity: 40, prestigeFactor: 1.0, convoyCostMultiplier: 1.0, consumptionTaxCost: 0 },
  gold: { id: GoodType.GOLD, nameKey: 'good.gold', category: 'industrial', basePrice: 100, tradedQuantity: 20, prestigeFactor: 2.0, convoyCostMultiplier: 1.5, consumptionTaxCost: 0 },
};

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