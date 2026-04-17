import { HexCoords } from '../types/world';

const HEX_DIRECTIONS = [
  { q: 0, r: -1 },  // N
  { q: 1, r: -1 },  // NE
  { q: 1, r: 0 },    // SE
  { q: 0, r: 1 },   // S
  { q: -1, r: 1 },  // SW
  { q: -1, r: 0 },  // NW
];

export function hexAdd(a: HexCoords, b: HexCoords): HexCoords {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function hexSubtract(a: HexCoords, b: HexCoords): HexCoords {
  return { q: a.q - b.q, r: a.r - b.r };
}

export function hexMultiply(hex: HexCoords, factor: number): HexCoords {
  return { q: hex.q * factor, r: hex.r * factor };
}

export function hexEquals(a: HexCoords, b: HexCoords): boolean {
  return a.q === b.q && a.r === b.r;
}

export function hexLength(hex: HexCoords): number {
  const s = -hex.q - hex.r;
  return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(s)) / 2;
}

export function hexDistance(a: HexCoords, b: HexCoords): number {
  return hexLength(hexSubtract(a, b));
}

export function hexNeighbors(hex: HexCoords): HexCoords[] {
  return HEX_DIRECTIONS.map(d => hexAdd(hex, d));
}

export function hexNeighborAt(hex: HexCoords, direction: number): HexCoords {
  return hexAdd(hex, HEX_DIRECTIONS[direction % 6]);
}

export function hexRing(center: HexCoords, radius: number): HexCoords[] {
  if (radius === 0) return [center];
  const results: HexCoords[] = [];
  let hex = hexAdd(center, hexMultiply(HEX_DIRECTIONS[4], radius));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(hex);
      hex = hexAdd(hex, HEX_DIRECTIONS[i]);
    }
  }
  return results;
}

export function hexSpiral(center: HexCoords, radius: number): HexCoords[] {
  const results: HexCoords[] = [center];
  for (let r = 1; r <= radius; r++) {
    results.push(...hexRing(center, r));
  }
  return results;
}

export function hexRound(hex: HexCoords): HexCoords {
  let rq = Math.round(hex.q);
  let rr = Math.round(hex.r);
  let rs = Math.round(-hex.q - hex.r);
  const qDiff = Math.abs(rq - hex.q);
  const rDiff = Math.abs(rr - hex.r);
  const sDiff = Math.abs(rs - (-hex.q - hex.r));
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

export function hexLerp(a: HexCoords, b: HexCoords, t: number): HexCoords {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
  };
}

export function hexLine(a: HexCoords, b: HexCoords): HexCoords[] {
  const n = hexDistance(a, b);
  const results: HexCoords[] = [];
  for (let i = 0; i <= n; i++) {
    results.push(hexRound(hexLerp(a, b, 1 / n * i)));
  }
  return results;
}

export function hexToPixel(hex: HexCoords, size: number): { x: number; y: number } {
  const x = size * (3/2 * hex.q);
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): HexCoords {
  const q = (2/3 * x) / size;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
  return hexRound({ q, r });
}

export class HexGrid<T> {
  private data: Map<string, T> = new Map();
  
  set(hex: HexCoords, value: T): void {
    this.data.set(`${hex.q},${hex.r}`, value);
  }
  
  get(hex: HexCoords): T | undefined {
    return this.data.get(`${hex.q},${hex.r}`);
  }
  
  has(hex: HexCoords): boolean {
    return this.data.has(`${hex.q},${hex.r}`);
  }
  
  delete(hex: HexCoords): boolean {
    return this.data.delete(`${hex.q},${hex.r}`);
  }
  
  getAll(): T[] {
    return Array.from(this.data.values());
  }
  
  getEntries(): [HexCoords, T][] {
    return Array.from(this.data.entries()).map(([k, v]) => {
      const [q, r] = k.split(',').map(Number);
      return [{ q, r }, v];
    });
  }
  
  clear(): void {
    this.data.clear();
  }
  
  get size(): number {
    return this.data.size;
  }
}

export function hexInBounds(hex: HexCoords, minQ: number, maxQ: number, minR: number, maxR: number): boolean {
  return hex.q >= minQ && hex.q <= maxQ && hex.r >= minR && hex.r <= maxR;
}

export function hexBounds(hexes: HexCoords[]): { minQ: number; maxQ: number; minR: number; maxR: number } {
  let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
  for (const hex of hexes) {
    minQ = Math.min(minQ, hex.q);
    maxQ = Math.max(maxQ, hex.q);
    minR = Math.min(minR, hex.r);
    maxR = Math.max(maxR, hex.r);
  }
  return { minQ, maxQ, minR, maxR };
}

export function hexRectangularGrid(minQ: number, maxQ: number, minR: number, maxR: number): HexCoords[] {
  const results: HexCoords[] = [];
  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      if (q + r >= minQ && q + r <= maxR) {  // valid hex
        results.push({ q, r });
      }
    }
  }
  return results;
}