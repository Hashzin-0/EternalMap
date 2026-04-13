import { GameState } from '../types/game-state'
import { MapData, TileData, TerrainType } from '../types/world'

export const TILE_SIZE = 32
export const MAP_WIDTH = 100
export const MAP_HEIGHT = 100

function generatePerlinNoise(width: number, height: number, seed: number): number[][] {
  const noise: number[][] = []
  const permutation = generatePermutation(seed)
  
  for (let y = 0; y < height; y++) {
    noise[y] = []
    for (let x = 0; x < width; x++) {
      noise[y][x] = perlinNoise(x, y, permutation)
    }
  }
  
  return noise
}

function generatePermutation(seed: number): number[] {
  const perm = Array.from({ length: 256 }, (_, i) => i)
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return [...perm, ...perm]
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

function perlinNoise(x: number, y: number, perm: number[]): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  
  const u = fade(xf)
  const v = fade(yf)
  
  const aa = perm[perm[X] + Y]
  const ab = perm[perm[X] + Y + 1]
  const ba = perm[perm[X + 1] + Y]
  const bb = perm[perm[X + 1] + Y + 1]
  
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  )
}

function determineTerrain(elevation: number, moisture: number): TerrainType {
  if (elevation < -0.3) return TerrainType.WATER
  if (elevation < -0.1) return TerrainType.GRASS
  if (elevation > 0.6) return TerrainType.MOUNTAIN
  if (moisture > 0.5) return TerrainType.FOREST
  if (moisture < -0.3) return TerrainType.DESERT
  return TerrainType.GRASS
}

export function generateInitialMapData(seed: number = 12345): MapData {
  const elevationNoise = generatePerlinNoise(MAP_WIDTH, MAP_HEIGHT, seed)
  const moistureNoise = generatePerlinNoise(MAP_WIDTH, MAP_HEIGHT, seed + 1000)
  
  const tiles: TileData[][] = []
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      const elevation = elevationNoise[y][x]
      const moisture = moistureNoise[y][x]
      
      tiles[y][x] = {
        x,
        y,
        terrain: determineTerrain(elevation, moisture),
        elevation: Math.round((elevation + 1) * 50),
        resources: {},
        buildingId: null,
        unitId: null,
      }
    }
  }
  
  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileSize: TILE_SIZE,
    tiles,
    seed,
  }
}

export function createInitialGameState(): GameState {
  return {
    time: 0,
    timeScale: 1,
    treasury: 1000,
    isPaused: false,
    gameSpeed: 1,
    selectedTile: null,
    cameraPosition: { x: 0, y: 0 },
    cameraZoom: 1,
    isLoaded: false,
  }
}