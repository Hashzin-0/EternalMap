import * as Phaser from 'phaser'
import { MapData, TerrainType } from '../../game-core/types/world'

export class TilemapRenderer {
  private scene: Phaser.Scene
  private mapData: MapData
  private tilemap!: Phaser.Tilemaps.Tilemap
  private terrainColors: Map<TerrainType, number>

  constructor(scene: Phaser.Scene, mapData: MapData) {
    this.scene = scene
    this.mapData = mapData
    this.terrainColors = new Map([
      [TerrainType.GRASS, 0x4a7c59],
      [TerrainType.WATER, 0x3d5a80],
      [TerrainType.MOUNTAIN, 0x6b6b6b],
      [TerrainType.FOREST, 0x2d5a27],
      [TerrainType.DESERT, 0xd4a373],
      [TerrainType.ROCK, 0x4a4a4a],
    ])
  }

  create(): void {
    this.createTileset()
    this.createTilemap()
    this.renderTiles()
  }

  private createTileset(): void {
    const canvas = document.createElement('canvas')
    canvas.width = this.mapData.tileSize * 8
    canvas.height = this.mapData.tileSize
    const ctx = canvas.getContext('2d')!

    const terrainKeys = Object.keys(TerrainType)
    terrainKeys.forEach((key, index) => {
      const terrainType = TerrainType[key as keyof typeof TerrainType]
      const color = this.terrainColors.get(terrainType) || 0x888888
      const x = index * this.mapData.tileSize
      
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
      ctx.fillRect(x, 0, this.mapData.tileSize, this.mapData.tileSize)
      
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(x, 0, this.mapData.tileSize, 2)
      ctx.fillRect(x, 0, 2, this.mapData.tileSize)
    })

    this.scene.textures.addCanvas('terrain-tiles', canvas)
  }

  private createTilemap(): void {
    this.tilemap = this.scene.make.tilemap({
      tileWidth: this.mapData.tileSize,
      tileHeight: this.mapData.tileSize,
      width: this.mapData.width,
      height: this.mapData.height,
    })

    const tileset = this.tilemap.addTilesetImage('terrain-tiles', undefined, this.mapData.tileSize, this.mapData.tileSize)
    if (tileset) {
      tileset.name = 'terrain-tiles'
    }
  }

  private renderTiles(): void {
    const terrainKeys = Object.keys(TerrainType)
    const terrainToIndex: Map<TerrainType, number> = new Map()
    terrainKeys.forEach((key, index) => {
      terrainToIndex.set(TerrainType[key as keyof typeof TerrainType], index)
    })

    const layerData: number[][] = []
    for (let y = 0; y < this.mapData.height; y++) {
      layerData[y] = []
      for (let x = 0; x < this.mapData.width; x++) {
        const tile = this.mapData.tiles[y][x]
        const index = terrainToIndex.get(tile.terrain) ?? 0
        layerData[y][x] = index
      }
    }

    const layer = this.tilemap.createBlankLayer('terrain', 'terrain-tiles')
    if (layer) {
      for (let y = 0; y < this.mapData.height; y++) {
        for (let x = 0; x < this.mapData.width; x++) {
          const tileIndex = layerData[y][x]
          layer.putTileAt(tileIndex, x, y)
        }
      }
    }

    this.addGridOverlay()
  }

  private addGridOverlay(): void {
    const graphics = this.scene.add.graphics()
    graphics.lineStyle(1, 0x000000, 0.15)

    for (let x = 0; x <= this.mapData.width; x++) {
      graphics.moveTo(x * this.mapData.tileSize, 0)
      graphics.lineTo(x * this.mapData.tileSize, this.mapData.height * this.mapData.tileSize)
    }

    for (let y = 0; y <= this.mapData.height; y++) {
      graphics.moveTo(0, y * this.mapData.tileSize)
      graphics.lineTo(this.mapData.width * this.mapData.tileSize, y * this.mapData.tileSize)
    }

    graphics.strokePath()
  }

  getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.tilemap
  }

  destroy(): void {
    this.tilemap.destroy()
  }
}