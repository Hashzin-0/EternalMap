import { HexCoords } from '../../types/world';
import { hexDistance, hexInBounds } from '../hex';
import { PerlinNoise, WorleyNoise, TerrainNoise } from './noise';
import { TerrainType, TERRAIN_MODIFIERS, Province, StateRegion, State, ResourceDeposit, GoodType, hexToString } from '../../types/world';

export interface WorldConfig {
  width: number;
  height: number;
  provinceCount: number;
  seed: number;
}

export interface WorldData {
  provinces: Map<string, Province>;
  stateRegions: Map<string, StateRegion>;
  states: Map<string, State>;
  provinceSeeds: Map<string, HexCoords>;
  terrainNoise: TerrainNoise;
}

export class VoronoiGenerator {
  generateSeeds(config: WorldConfig): HexCoords[] {
    const seeds: HexCoords[] = [];
    const { width, height, provinceCount } = config;
    
    const cols = Math.ceil(Math.sqrt(provinceCount * (width / height)));
    const rows = Math.ceil(provinceCount / cols);
    
    const cellW = width / cols;
    const cellH = height / rows;
    
    let seed = config.seed;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (seeds.length >= provinceCount) break;
        
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const jitterX = (seed / 0x7fffffff) * cellW * 0.8;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const jitterY = (seed / 0x7fffffff) * cellH * 0.8;
        
        const q = Math.floor(col * cellW + cellW / 2 + jitterX - width / 2);
        const r = Math.floor(row * cellH + cellH / 2 + jitterY - height / 2);
        seeds.push({ q, r });
      }
    }
    
    return seeds;
  }
  
  findNearestSeed(point: HexCoords, seeds: HexCoords[]): { seed: HexCoords; index: number; distance: number } {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    
    for (let i = 0; i < seeds.length; i++) {
      const dist = hexDistance(point, seeds[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    
    return { seed: seeds[nearestIdx], index: nearestIdx, distance: nearestDist };
  }
  
  assignProvinces(
    seeds: HexCoords[],
    bounds: { minQ: number; maxQ: number; minR: number; maxR: number }
  ): Map<string, Province> {
    const provinces = new Map<string, Province>();
    
    for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        const hex = { q, r };
        if (!hexInBounds(hex, bounds.minQ, bounds.maxQ, bounds.minR, bounds.maxR)) continue;
        
        const nearest = this.findNearestSeed(hex, seeds);
        
        if (nearest.distance < 8) {
          const id = `prov_${nearest.index}`;
          const province: Province = {
            id,
            hex,
            terrain: TerrainType.PLAINS,
            elevation: 0,
            resources: {},
            ownerId: null,
            infrastructure: 0,
            stateId: null,
          };
          provinces.set(id, province);
        }
      }
    }
    
    return provinces;
  }
  
  lloydsRelaxation(seeds: HexCoords[], iterations: number = 3, bounds: { minQ: number; maxQ: number; minR: number; maxR: number }): HexCoords[] {
    let current = [...seeds];
    
    for (let i = 0; i < iterations; i++) {
      const assignments = this.assignProvinces(current, bounds);
      
      const coordSums = new Map<number, { q: number; r: number }>();
      const counts = new Map<number, number>();
      
      for (const [id, province] of assignments) {
        const idx = parseInt(id.split('_')[1]);
        const existing = coordSums.get(idx) || { q: 0, r: 0 };
        coordSums.set(idx, {
          q: existing.q + province.hex.q,
          r: existing.r + province.hex.r,
        });
        const currentCount = counts.get(idx) ?? 0;
        counts.set(idx, currentCount + 1);
      }
      
      current = current.map((seed, idx) => {
        const count = counts.get(idx) || 1;
        const sum = coordSums.get(idx) || seed;
        return {
          q: Math.floor(sum.q / count),
          r: Math.floor(sum.r / count),
        };
      });
    }
    
    return current;
  }
}

export class TerrainGenerator {
  constructor(private noise: TerrainNoise) {}
  
  generateProvinceTerrain(province: Province): Province {
    const hex = province.hex;
    const elevation = this.noise.getElevation(hex.q * 0.05, hex.r * 0.05);
    const moisture = this.noise.getMoisture(hex.q * 0.05, hex.r * 0.05);
    
    let terrain: TerrainType;
    if (elevation < 0.3) {
      terrain = TerrainType.OCEAN;
    } else if (elevation < 0.35) {
      terrain = TerrainType.COAST;
    } else if (elevation > 0.8) {
      terrain = TerrainType.MOUNTAINS;
    } else if (elevation > 0.65) {
      terrain = TerrainType.HILLS;
    } else if (moisture > 0.7) {
      terrain = TerrainType.FOREST;
    } else if (moisture > 0.4) {
      terrain = TerrainType.PLAINS;
    } else if (moisture < 0.25) {
      terrain = TerrainType.DESERT;
    } else {
      terrain = TerrainType.PLAINS;
    }
    
    const resources: Record<string, number> = {};
    if (terrain === TerrainType.FOREST) {
      resources['wood'] = Math.floor(elevation * 100);
    }
    if (terrain === TerrainType.HILLS || terrain === TerrainType.MOUNTAINS) {
      resources['iron'] = Math.floor(elevation * 50);
      resources['coal'] = Math.floor(moisture * 50);
    }
    if (terrain === TerrainType.DESERT) {
      resources['gold'] = Math.floor(moisture < 0.15 ? elevation * 30 : 0);
    }
    if (terrain === TerrainType.COAST) {
      resources['fish'] = 50;
    }
    
    return {
      ...province,
      terrain,
      elevation,
      resources,
    };
  }
}

export class WorldGenerator {
  private voronoi: VoronoiGenerator;
  private terrainGen: TerrainGenerator;
  private config: WorldConfig;
  
  constructor(config: Partial<WorldConfig> = {}) {
    this.config = {
      width: config.width || 100,
      height: config.height || 60,
      provinceCount: config.provinceCount || 100,
      seed: config.seed || 12345,
    };
    
    this.voronoi = new VoronoiGenerator();
    this.terrainGen = new TerrainGenerator(new TerrainNoise(this.config.seed));
  }
  
  generate(): WorldData {
    const seeds = this.voronoi.generateSeeds(this.config);
    
    const bounds = {
      minQ: -Math.floor(this.config.width / 2),
      maxQ: Math.floor(this.config.width / 2),
      minR: -Math.floor(this.config.height / 2),
      maxR: Math.floor(this.config.height / 2),
    };
    
    const relaxedSeeds = this.voronoi.lloydsRelaxation(seeds, 3, bounds);
    
    const provinces = this.voronoi.assignProvinces(relaxedSeeds, bounds);
    
    for (const [id, province] of provinces) {
      provinces.set(id, this.terrainGen.generateProvinceTerrain(province));
    }
    
    const stateRegions = new Map<string, StateRegion>();
    const states = new Map<string, State>();
    
    const provinceList = Array.from(provinces.values());
    const regionSize = 7;
    let regionIdx = 0;
    let stateIdx = 0;
    
    while (provinceList.length > 0) {
      const provinceIds: string[] = [];
      const size = Math.min(regionSize, provinceList.length);
      
      for (let i = 0; i < size; i++) {
        const p = provinceList.pop()!;
        provinceIds.push(p.id);
      }
      
      const regionId = `region_${regionIdx++}`;
      const stateId = `state_${stateIdx++}`;
      
      const cityProvince = provinceIds.length > 0 ? provinces.get(provinceIds[Math.floor(provinceIds.length / 2)]) : null;
      const cityHex = cityProvince?.hex ?? null;
      
      const farmId = provinceIds.find(id => provinces.get(id)?.terrain === TerrainType.PLAINS);
      const farmProvince = farmId ? provinces.get(farmId) : null;
      const farmHex = farmProvince?.hex ?? null;
      
      const portId = provinceIds.find(id => provinces.get(id)?.terrain === TerrainType.COAST);
      const portProvince = portId ? provinces.get(portId) : null;
      const portHex = portProvince?.hex ?? null;
      
      const mineId = provinceIds.find(id => {
        const p = provinces.get(id);
        return p?.terrain === TerrainType.HILLS || p?.terrain === TerrainType.MOUNTAINS;
      });
      const mineProvince = mineId ? provinces.get(mineId) : null;
      const mineHex = mineProvince?.hex ?? null;
      
      const woodId = provinceIds.find(id => provinces.get(id)?.terrain === TerrainType.FOREST);
      const woodProvince = woodId ? provinces.get(woodId) : null;
      const woodHex = woodProvince?.hex ?? null;
      
      stateRegions.set(regionId, {
        id: regionId,
        provinces: provinceIds,
        traits: [],
        arableLand: provinceIds.length * 10,
        resources: {},
        cityHex,
        farmHex,
        portHex,
        mineHex,
        woodHex,
      });
      
      states.set(stateId, {
        id: stateId,
        regionId,
        ownerId: '',
        integrated: true,
        marketAccess: 0.5,
        devastation: 0,
      });
    }
    
    const provinceSeeds = new Map<string, HexCoords>();
    for (let i = 0; i < relaxedSeeds.length; i++) {
      provinceSeeds.set(`prov_${i}`, relaxedSeeds[i]);
    }
    
    return {
      provinces,
      stateRegions,
      states,
      provinceSeeds,
      terrainNoise: new TerrainNoise(this.config.seed),
    };
  }
  
  getConfig(): WorldConfig {
    return { ...this.config };
  }
}