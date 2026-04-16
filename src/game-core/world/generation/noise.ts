export class PerlinNoise {
  private perm: number[] = [];
  
  constructor(seed: number = 0) {
    this.perm = this.generatePermutation(seed);
  }
  
  private generatePermutation(seed: number): number[] {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    for (let i = 0; i < 256; i++) p[256 + i] = p[i];
    return p;
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.perm[X] + Y;
    const B = this.perm[X + 1] + Y;
    
    return this.lerp(
      this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
      this.lerp(this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1), u),
      v
    );
  }
  
  noise2D01(x: number, y: number): number {
    return (this.noise2D(x, y) + 1) / 2;
  }
  
  fbm(x: number, y: number, octaves: number = 4, lacunarity: number = 2, persistence: number = 0.5): number {
    let total = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    
    return total / maxValue;
  }
  
  fbm01(x: number, y: number, octaves: number = 4): number {
    return (this.fbm(x, y, octaves) + 1) / 2;
  }
}

export class WorleyNoise {
  private seeds: { x: number; y: number }[] = [];
  
  constructor(numCells: number, seed: number = 0) {
    this.seeds = this.generateSeeds(numCells, seed);
  }
  
  private generateSeeds(numCells: number, seed: number): { x: number; y: number }[] {
    const result: { x: number; y: number }[] = [];
    let s = seed;
    for (let i = 0; i < numCells; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      result.push({ x: s / 0x7fffffff, y: (s * 2) / 0x7fffffff });
    }
    return result;
  }
  
  noise2D(x: number, y: number): number {
    let minDist = Infinity;
    
    for (const seed of this.seeds) {
      const dx = x - seed.x;
      const dy = y - seed.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      minDist = Math.min(minDist, dist);
    }
    
    return Math.min(1, minDist * Math.sqrt(this.seeds.length));
  }
  
  noise2DF2(x: number, y: number): number {
    const distances: number[] = [];
    
    for (const seed of this.seeds) {
      const dx = x - seed.x;
      const dy = y - seed.y;
      distances.push(Math.sqrt(dx * dx + dy * dy));
    }
    
    distances.sort((a, b) => a - b);
    
    return Math.min(1, (distances[1] - distances[0]) * Math.sqrt(this.seeds.length));
  }
}

export interface NoiseOptions {
  scale: number;
  octaves: number;
  seed: number;
}

export class TerrainNoise {
  private perlin: PerlinNoise;
  private worley: WorleyNoise;
  private elevationNoise: PerlinNoise;
  private moistureNoise: PerlinNoise;
  
  constructor(seed: number = 12345) {
    this.perlin = new PerlinNoise(seed);
    this.worley = new WorleyNoise(50, seed);
    this.elevationNoise = new PerlinNoise(seed + 1000);
    this.moistureNoise = new PerlinNoise(seed + 2000);
  }
  
  getElevation(x: number, y: number): number {
    return this.elevationNoise.fbm01(x, y, 6);
  }
  
  getMoisture(x: number, y: number): number {
    return this.moistureNoise.fbm01(x, y, 4);
  }
  
  getTerrainType(elevation: number, moisture: number): string {
    if (elevation < 0.3) return 'ocean';
    if (elevation < 0.35) return 'coast';
    if (elevation > 0.8) return 'mountains';
    if (elevation > 0.6) return 'hills';
    if (moisture > 0.7) return 'forest';
    if (moisture > 0.5) return 'plains';
    if (moisture > 0.3) return 'grassland';
    if (moisture < 0.2) return 'desert';
    return 'plains';
  }
  
  getResourcePotential(x: number, y: number, resourceType: string): number {
    const noise = this.perlin;
    const offset = resourceType.charCodeAt(0) * 0.1;
    return noise.fbm01(x + offset, y + offset, 3);
  }
}