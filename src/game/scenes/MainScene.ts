import * as Phaser from 'phaser'
import { MapData, TileData, TerrainType } from '../../game-core/types/world'
import { TilemapRenderer } from '../renderers/TilemapRenderer'
import { CameraController } from '../camera/CameraController'

export class MainScene extends Phaser.Scene {
  private mapData!: MapData
  private tilemapRenderer!: TilemapRenderer
  private cameraController!: CameraController

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

  private generateDefaultMap(): MapData {
    const tiles: TileData[][] = []
    for (let y = 0; y < 100; y++) {
      tiles[y] = []
      for (let x = 0; x < 100; x++) {
        tiles[y][x] = {
          x,
          y,
          terrain: TerrainType.GRASS,
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
    if (this.cameraController) {
      this.cameraController.update(delta)
    }
  }
}