export enum TerrainType {
  GRASS = 'grass',
  WATER = 'water',
  MOUNTAIN = 'mountain',
  FOREST = 'forest',
  DESERT = 'desert',
  ROCK = 'rock',
}

export interface TileData {
  x: number
  y: number
  terrain: TerrainType
  elevation: number
  resources: Record<string, number>
  buildingId: string | null
  unitId: string | null
}

export interface MapData {
  width: number
  height: number
  tileSize: number
  tiles: TileData[][]
  seed: number
}

export interface Position {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}