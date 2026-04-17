/**
 * Save/Load System - Phase 9
 * IndexedDB persistence, auto-save, versioning, validation
 */

import { HexCoords } from '../types/world';

// ============================================================
// 1. SAVE FORMAT
// ============================================================

export interface WorldSaveData {
  readonly provinces: ProvinceSaveData[];
  readonly states: StateSaveData[];
  readonly countries: CountrySaveData[];
}

export interface ProvinceSaveData {
  readonly id: string;
  readonly hex: HexCoords;
  readonly terrain: string;
  readonly elevation: number;
  readonly resources: Record<string, number>;
  readonly ownerId: string | null;
  readonly infrastructure: number;
  readonly stateId: string | null;
}

export interface StateSaveData {
  readonly id: string;
  readonly regionId: string;
  readonly ownerId: string;
  readonly integrated: boolean;
  readonly marketAccess: number;
  readonly devastation: number;
}

export interface CountrySaveData {
  readonly id: string;
  readonly tag: string;
  readonly nameKey: string;
  readonly color: readonly [number, number, number];
  readonly countryType: string;
  readonly government: string;
  readonly primaryCulture: string;
  readonly religion: string;
  readonly capitalStateId: string | null;
  readonly ownedStates: readonly string[];
  readonly marketId: string;
  readonly treasury: number;
  readonly prestige: number;
}

export interface EconomySaveData {
  readonly treasury: number;
  readonly buildings: BuildingSaveData[];
  readonly constructions: ConstructionSaveData[];
  readonly markets: MarketSaveData[];
  readonly tradeRoutes: TradeRouteSaveData[];
}

export interface BuildingSaveData {
  readonly id: string;
  readonly type: string;
  readonly stateId: string;
  readonly level: number;
  readonly workers: Record<string, number>;
  readonly inputs: Record<string, number>;
  readonly outputs: Record<string, number>;
}

export interface ConstructionSaveData {
  readonly id: string;
  readonly type: string;
  readonly stateId: string;
  readonly progress: number;
  readonly totalCost: number;
}

export interface MarketSaveData {
  readonly id: string;
  readonly prices: Record<string, number>;
  readonly supply: Record<string, number>;
  readonly demand: Record<string, number>;
}

export interface TradeRouteSaveData {
  readonly id: string;
  readonly fromStateId: string;
  readonly toStateId: string;
  readonly goodType: string;
  readonly amount: number;
  readonly tariff: number;
}

export interface PopulationSaveData {
  readonly pops: PopSaveData[];
}

export interface PopSaveData {
  readonly id: string;
  readonly stateId: string;
  readonly culture: string;
  readonly religion: string;
  readonly profession: string;
  readonly stratum: string;
  readonly size: number;
  readonly needs: Record<string, number>;
  readonly savings: number;
}

export interface PoliticsSaveData {
  readonly laws: Record<string, boolean>;
  readonly governmentType: string;
  readonly legitimacy: number;
  readonly igs: IgSaveData[];
}

export interface IgSaveData {
  readonly id: string;
  readonly nameKey: string;
  readonly support: number;
  readonly loyalty: number;
  readonly isRuling: boolean;
}

export interface TechnologySaveData {
  readonly innovations: InnovationSaveData[];
  readonly currentResearch: string | null;
  readonly researchProgress: number;
}

export interface InnovationSaveData {
  readonly techId: string;
  readonly researched: boolean;
  readonly researchProgress: number;
  readonly unlockedDate: number | null;
}

export interface DiplomacySaveData {
  readonly relations: RelationSaveData[];
  readonly wars: WarSaveData[];
}

export interface RelationSaveData {
  readonly fromCountryId: string;
  readonly toCountryId: string;
  readonly value: number;
  readonly hasEmbassy: boolean;
  readonly tradeAgreement: boolean;
  readonly militaryAccess: boolean;
  readonly alliance: boolean;
}

export interface WarSaveData {
  readonly id: string;
  readonly name: string;
  readonly attackers: readonly string[];
  readonly defenders: readonly string[];
  readonly startDate: number;
  readonly isActive: boolean;
}

export interface UISaveData {
  readonly selectedTile: HexCoords | null;
  readonly cameraPosition: HexCoords;
  readonly cameraZoom: number;
  readonly activePanel: string | null;
}

export interface GameSaveData {
  readonly version: string;
  readonly gameName: string;
  readonly saveDate: number;
  readonly gameTime: number;
  readonly world: WorldSaveData;
  readonly economy: EconomySaveData;
  readonly population: PopulationSaveData;
  readonly politics: PoliticsSaveData;
  readonly technology: TechnologySaveData;
  readonly diplomacy: DiplomacySaveData;
  readonly ui: UISaveData;
  readonly checksum: string;
}

export interface SaveSlot {
  readonly id: number;
  readonly name: string;
  readonly saveData: GameSaveData;
  readonly thumbnail: string | null;
  readonly lastSaved: number;
  readonly fileSize: number;
}

// ============================================================
// 2. SERIALIZATION
// ============================================================

const GAME_VERSION = '1.0.0';

export function serializeGameState(gameState: GameSaveData): string {
  const jsonString = JSON.stringify(gameState);
  return jsonString;
}

export function deserializeGameState(jsonString: string): GameSaveData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.version || !parsed.world) {
      return null;
    }
    return parsed as GameSaveData;
  } catch {
    return null;
  }
}

export function createChecksum(data: GameSaveData): string {
  const str = JSON.stringify({
    version: data.version,
    gameTime: data.gameTime,
    world: data.world,
    economy: data.economy,
  });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// ============================================================
// 3. INDEXEDDB STORAGE
// ============================================================

const DB_NAME = 'eternalmap_save';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export async function initSaveDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveGame(slotId: number, data: GameSaveData): Promise<void> {
  const db = await initSaveDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const saveSlot: SaveSlot = {
      id: slotId,
      name: data.gameName,
      saveData: data,
      thumbnail: null,
      lastSaved: Date.now(),
      fileSize: JSON.stringify(data).length,
    };

    const request = store.put(saveSlot);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadGame(slotId: number): Promise<GameSaveData | null> {
  const db = await initSaveDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(slotId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as SaveSlot | undefined;
      resolve(result?.saveData ?? null);
    };
  });
}

export async function listSaveSlots(): Promise<SaveSlot[]> {
  const db = await initSaveDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

export async function deleteSaveSlot(slotId: number): Promise<void> {
  const db = await initSaveDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(slotId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================
// 4. AUTO SAVE
// ============================================================

export interface AutoSaveConfig {
  readonly enabled: boolean;
  readonly intervalMinutes: number;
  readonly maxSlots: number;
  readonly quickSaveSlot: number;
}

export const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMinutes: 15,
  maxSlots: 5,
  quickSaveSlot: 0,
};

export class AutoSaveManager {
  private config: AutoSaveConfig;
  private lastSaveTime: number = 0;
  private timerId: number | null = null;

  constructor(config: AutoSaveConfig = DEFAULT_AUTO_SAVE_CONFIG) {
    this.config = config;
  }

  start(
    getGameState: () => GameSaveData,
    onSave: (slot: number) => void
  ): void {
    if (!this.config.enabled) return;

    const intervalMs = this.config.intervalMinutes * 60 * 1000;

    this.timerId = window.setInterval(() => {
      const state = getGameState();
      const slot = this.getNextAutoSaveSlot();
      saveGame(slot, state);
      this.lastSaveTime = Date.now();
      onSave(slot);
    }, intervalMs);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  private getNextAutoSaveSlot(): number {
    const now = Date.now();
    const elapsed = now - this.lastSaveTime;
    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    const cycle = elapsed > 0 ? Math.floor(elapsed / intervalMs) : 0;
    return (cycle % this.config.maxSlots) + 1;
  }
}

// ============================================================
// 5. VERSION MIGRATION
// ============================================================

export interface MigrationRule {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly migrate: (data: unknown) => unknown;
}

const MIGRATION_RULES: readonly MigrationRule[] = [];

export function migrateSaveData(
  data: GameSaveData,
  targetVersion: string
): GameSaveData {
  const currentVersion = data.version;

  if (compareVersions(currentVersion, targetVersion) >= 0) {
    return data;
  }

  const migrations = MIGRATION_RULES.filter(
    (rule) =>
      compareVersions(rule.fromVersion, currentVersion) >= 0 &&
      compareVersions(rule.toVersion, targetVersion) <= 0
  );

  let currentData = data;
  for (const rule of migrations) {
    currentData = rule.migrate(currentData) as GameSaveData;
  }

  return {
    ...currentData,
    version: targetVersion,
  };
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;
    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }
  return 0;
}

// ============================================================
// 6. VALIDATION
// ============================================================

export interface SaveValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export function validateSaveData(data: GameSaveData): SaveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.version) {
    errors.push('Missing version');
  }

  if (!data.gameName || data.gameName.length > 50) {
    errors.push('Invalid game name');
  }

  if (data.gameTime < 0) {
    errors.push('Invalid game time');
  }

  if (!data.world) {
    errors.push('Missing world data');
  } else if (data.world.provinces.length === 0) {
    warnings.push('No provinces in save');
  }

  if (data.economy === undefined) {
    errors.push('Missing economy data');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// 7. QUICK SAVE/LOAD
// ============================================================

const QUICK_SAVE_KEY = 'eternalmap_quicksave';

export async function quickSave(gameState: GameSaveData): Promise<void> {
  const serialized = serializeGameState(gameState);
  localStorage.setItem(QUICK_SAVE_KEY, serialized);
}

export async function quickLoad(): Promise<GameSaveData | null> {
  const serialized = localStorage.getItem(QUICK_SAVE_KEY);
  if (!serialized) return null;
  return deserializeGameState(serialized);
}

export function hasQuickSave(): boolean {
  return localStorage.getItem(QUICK_SAVE_KEY) !== null;
}

// ============================================================
// 8. EXPORT/IMPORT FILE
// ============================================================

export async function exportSaveToFile(
  gameState: GameSaveData,
  filename: string
): Promise<void> {
  const json = serializeGameState(gameState);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export async function importSaveFromFile(
  file: File
): Promise<GameSaveData | null> {
  try {
    const text = await file.text();
    const data = deserializeGameState(text);
    if (!data) return null;

    const validation = validateSaveData(data);
    if (!validation.valid) {
      console.error('Invalid save file:', validation.errors);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}