import * as Phaser from 'phaser'

export interface GameLoopConfig {
  targetFps: number
  maxFrameTime: number
  onUpdate?: (delta: number) => void
}

export class GameLoop {
  private game: Phaser.Game
  private isPaused: boolean = false
  private gameSpeed: number = 1
  private targetFps: number
  private maxFrameTime: number
  private onUpdate?: (delta: number) => void

  constructor(game: Phaser.Game, config: GameLoopConfig) {
    this.game = game
    this.targetFps = config.targetFps
    this.maxFrameTime = config.maxFrameTime
    this.onUpdate = config.onUpdate

    this.setupTimeScale()
  }

  private setupTimeScale(): void {
    this.game.registry.set('gameSpeed', this.gameSpeed)
    this.game.registry.set('isPaused', this.isPaused)
  }

  pause(): void {
    this.isPaused = true
    this.game.registry.set('isPaused', true)
    this.game.loop.sleep()
  }

  resume(): void {
    this.isPaused = false
    this.game.registry.set('isPaused', false)
    this.game.loop.wake()
  }

  togglePause(): boolean {
    if (this.isPaused) {
      this.resume()
    } else {
      this.pause()
    }
    return this.isPaused
  }

  setSpeed(speed: number): void {
    this.gameSpeed = Math.max(0.25, Math.min(4, speed))
    this.game.registry.set('gameSpeed', this.gameSpeed)
    this.game.events.emit('speedChanged', this.gameSpeed)
  }

  getSpeed(): number {
    return this.gameSpeed
  }

  getIsPaused(): boolean {
    return this.isPaused
  }

  getTargetFps(): number {
    return this.targetFps
  }

  getMaxFrameTime(): number {
    return this.maxFrameTime
  }

  destroy(): void {
    this.onUpdate = undefined
  }
}

export function createGameLoop(game: Phaser.Game): GameLoop {
  return new GameLoop(game, {
    targetFps: 60,
    maxFrameTime: 250,
  })
}