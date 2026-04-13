import * as Phaser from 'phaser'
import { MainScene } from '../scenes/MainScene'
import { generateInitialMapData } from '../../game-core/state/initial-state'

export interface GameEngineConfig {
  containerId: string
  width: number
  height: number
  mapData?: unknown
}

let gameInstance: Phaser.Game | null = null

export function createGameEngine(config: GameEngineConfig): Phaser.Game {
  if (gameInstance) {
    gameInstance.destroy(true)
  }

  const renderer: number = Phaser.AUTO

  const physicsConfig: Phaser.Types.Core.PhysicsConfig = {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  }

  const mapData = config.mapData || generateInitialMapData()

  gameInstance = new Phaser.Game({
    type: renderer,
    width: config.width,
    height: config.height,
    parent: config.containerId,
    backgroundColor: '#1a1a2e',
    physics: physicsConfig,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainScene],
  })

  gameInstance.registry.set('mapData', mapData)

  return gameInstance
}

export function destroyGameEngine(): void {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export function getGameInstance(): Phaser.Game | null {
  return gameInstance
}