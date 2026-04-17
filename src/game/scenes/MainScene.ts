import * as Phaser from 'phaser'
import { MapData, TileData, TerrainType } from '../../game-core/types/world'
import { TilemapRenderer } from '../renderers/TilemapRenderer'
import { CameraController } from '../camera/CameraController'
import { GameManager, createGameManager } from '../GameManager'

export class MainScene extends Phaser.Scene {
  private mapData!: MapData
  private tilemapRenderer!: TilemapRenderer
  private cameraController!: CameraController
  private gameManager!: GameManager

  constructor() {
    super({ key: 'MainScene' })
  }

  init(): void {
    const data = this.game.registry.get('mapData') as MapData | undefined
    if (data) {
      this.mapData = data
    } else {
      this.mapData = this.generateDefaultMap()
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e')

    // Initialize game manager
    this.gameManager = createGameManager()
    this.gameManager.setEventEmitter(this.game.events)
    
    // Initialize game state
    this.gameManager.initialize(1836, 10000, 100000)

    this.tilemapRenderer = new TilemapRenderer(this, this.mapData)
    this.tilemapRenderer.create()

    this.cameraController = new CameraController(this, this.cameras.main, this.mapData)
    this.cameraController.setup()

    const centerX = (this.mapData.width * this.mapData.tileSize) / 2
    const centerY = (this.mapData.height * this.mapData.tileSize) / 2
    this.cameras.main.centerOn(centerX, centerY)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.cameraController.startPan(pointer)
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.cameraController.pan(pointer)
      }
    })

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _games: unknown, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.9 : 1.1
      this.cameraController.zoom(zoomFactor)
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.handleTileClick(pointer)
      }
    })

    // Listen for game events from GameManager
    this.game.events.on('gameTick', this.handleGameTick, this)
    this.game.events.on('yearChanged', this.handleYearChanged, this)

    this.game.events.emit('sceneReady', true)
  }

  private handleTileClick(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const tileX = Math.floor(worldPoint.x / this.mapData.tileSize)
    const tileY = Math.floor(worldPoint.y / this.mapData.tileSize)

    if (tileX >= 0 && tileX < this.mapData.width && tileY >= 0 && tileY < this.mapData.height) {
      this.game.events.emit('tileClicked', { x: tileX, y: tileY })
    }
  }

  private handleGameTick(data: {
    year: number
    month: number
    treasury: number
    population: number
    legitimacy: number
    prestige: number
  }): void {
    // Emit to UI store
    this.game.events.emit('uiUpdate', data)
  }

  private handleYearChanged(data: { year: number }): void {
    console.log(`Year changed to ${data.year}`)
  }

  private generateDefaultMap(): MapData {
    const tiles: TileData[][] = []
    for (let y = 0; y < 100; y++) {
      tiles[y] = []
      for (let x = 0; x < 100; x++) {
        tiles[y][x] = {
          x,
          y,
          terrain: TerrainType.PLAINS,
          elevation: 50,
          resources: {},
          buildingId: null,
          unitId: null,
        }
      }
    }
    return {
      width: 100,
      height: 100,
      tileSize: 32,
      tiles,
      seed: 12345,
    }
  }

  update(_time: number, delta: number): void {
    // Update camera
    if (this.cameraController) {
      this.cameraController.update(delta)
    }
    
    // Update game systems
    if (this.gameManager) {
      this.gameManager.update(delta)
    }
  }
}