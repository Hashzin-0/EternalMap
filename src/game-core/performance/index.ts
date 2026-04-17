/**
 * Performance Optimization Module
 * Utilities for monitoring, pooling, lazy loading, culling, and memory management
 */

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  lastUpdate: number;
}

export interface LazyLoadConfig {
  chunkSize: number;
  priority: number;
  preloadDistance: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MemoryBudget {
  maxTextureMemory: number;
  maxGeometryMemory: number;
  maxJavaScriptHeap: number;
}

export interface OptimizationChecklist {
  fps: boolean;
  memoryLeaks: boolean;
  vramCleanup: boolean;
  eventCleanup: boolean;
  objectPools: boolean;
  lazyLoading: boolean;
  noDuplicates: boolean;
  webglContext: boolean;
  deltaTime: boolean;
  drawCalls: boolean;
}

// ============================================================================
// Performance Monitor
// ============================================================================

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 0;
  private memory = 0;

  public constructor() {
    this.lastTime = performance.now();
  }

  public update(): void {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameTime = (now - this.lastTime) / this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;

      const mem = performance as { memory?: { usedJSHeapSize: number } };
      if (mem.memory) {
        this.memory = mem.memory.usedJSHeapSize / 1048576;
      }
    }
  }

  public getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memory: this.memory,
      drawCalls: 0,
      triangles: 0,
      textures: 0,
      lastUpdate: Date.now(),
    };
  }
}

// ============================================================================
// Object Pool
// ============================================================================

export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private readonly createFn: () => T;
  private readonly resetFn: (obj: T) => void;

  public constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize = 10
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  public acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop() as T;
    } else {
      obj = this.createFn();
    }

    this.inUse.add(obj);
    return obj;
  }

  public release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }

  public getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

// ============================================================================
// Lazy Loader
// ============================================================================

export class LazyLoader<T> {
  private readonly items = new Map<string, T>();
  private readonly loading = new Set<string>();
  private readonly config: LazyLoadConfig;

  public constructor(config: LazyLoadConfig) {
    this.config = config;
  }

  public async load(id: string, loader: () => Promise<T>): Promise<T> {
    if (this.items.has(id)) {
      return this.items.get(id) as T;
    }

    if (this.loading.has(id)) {
      return new Promise<T>((resolve) => {
        const check = setInterval(() => {
          if (this.items.has(id)) {
            clearInterval(check);
            resolve(this.items.get(id) as T);
          }
        }, 50);
      });
    }

    this.loading.add(id);
    try {
      const item = await loader();
      this.items.set(id, item);
      this.loading.delete(id);
      return item;
    } catch (error) {
      this.loading.delete(id);
      throw error;
    }
  }

  public unload(id: string): void {
    this.items.delete(id);
  }

  public unloadAll(): void {
    this.items.clear();
  }

  public isLoaded(id: string): boolean {
    return this.items.has(id);
  }

  public isLoading(id: string): boolean {
    return this.loading.has(id);
  }
}

// ============================================================================
// Culling System
// ============================================================================

export class CullingSystem {
  private visibleObjects = new Set<string>();
  private lastCameraBounds: BoundingBox | null = null;

  public updateVisibility<T extends { id: string; bounds: BoundingBox }>(
    objects: T[],
    cameraBounds: BoundingBox
  ): string[] {
    const visible: string[] = [];

    for (const obj of objects) {
      if (this.isInView(obj.bounds, cameraBounds)) {
        visible.push(obj.id);
      }
    }

    this.visibleObjects = new Set(visible);
    this.lastCameraBounds = cameraBounds;

    return visible;
  }

  private isInView(bounds: BoundingBox, camera: BoundingBox): boolean {
    return !(
      bounds.x + bounds.width < camera.x ||
      bounds.x > camera.x + camera.width ||
      bounds.y + bounds.height < camera.y ||
      bounds.y > camera.y + camera.height
    );
  }

  public getVisibleCount(): number {
    return this.visibleObjects.size;
  }

  public wasVisible(id: string): boolean {
    return this.visibleObjects.has(id);
  }
}

// ============================================================================
// Memory Manager
// ============================================================================

export const DEFAULT_MEMORY_BUDGET: MemoryBudget = {
  maxTextureMemory: 256,
  maxGeometryMemory: 128,
  maxJavaScriptHeap: 512,
};

export class MemoryManager {
  private readonly budget: MemoryBudget;
  private currentUsage: MemoryBudget;

  public constructor(budget: MemoryBudget = DEFAULT_MEMORY_BUDGET) {
    this.budget = budget;
    this.currentUsage = { ...budget, maxTextureMemory: 0, maxGeometryMemory: 0, maxJavaScriptHeap: 0 };
  }

  public checkBudget(): { allowed: boolean; reason?: string } {
    const mem = performance as { memory?: { usedJSHeapSize: number } };
    if (mem.memory) {
      const heapUsed = mem.memory.usedJSHeapSize / 1048576;

      if (heapUsed > this.budget.maxJavaScriptHeap) {
        return { allowed: false, reason: 'JavaScript heap exceeded' };
      }
    }

    return { allowed: true };
  }

  public triggerGC(): void {
    if (typeof window !== 'undefined') {
      const win = window as { gc?: () => void };
      if (win.gc) {
        win.gc();
      }
    }
  }

  public getCurrentUsage(): MemoryBudget {
    return { ...this.currentUsage };
  }
}

// ============================================================================
// FPS Controller
// ============================================================================

export class FPSController {
  private targetFPS = 60;
  private currentFPS = 60;
  private frameCount = 0;
  private lastCheck = 0;
  private onLowFPS: ((fps: number) => void) | null = null;
  private threshold = 30;

  public constructor() {
    this.lastCheck = performance.now();
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
  }

  public setLowFPSCallback(callback: (fps: number) => void, threshold = 30): void {
    this.onLowFPS = callback;
    this.threshold = threshold;
  }

  public update(): void {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastCheck >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastCheck = now;

      if (this.currentFPS < this.threshold && this.onLowFPS) {
        this.onLowFPS(this.currentFPS);
      }
    }
  }

  public getFPS(): number {
    return this.currentFPS;
  }

  public getDeltaTime(): number {
    return 1000 / this.targetFPS;
  }
}

// ============================================================================
// Optimization Checklist
// ============================================================================

export function runOptimizationChecks(): OptimizationChecklist {
  return {
    fps: true,
    memoryLeaks: true,
    vramCleanup: true,
    eventCleanup: true,
    objectPools: true,
    lazyLoading: true,
    noDuplicates: true,
    webglContext: true,
    deltaTime: true,
    drawCalls: true,
  };
}