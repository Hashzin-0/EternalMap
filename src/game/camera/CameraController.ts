import * as Phaser from 'phaser'
import { MapData } from '../../game-core/types/world'

export class CameraController {
  private scene: Phaser.Scene
  private camera: Phaser.Cameras.Scene2D.Camera
  private mapData: MapData
  private isDragging: boolean = false
  private lastPointerX: number = 0
  private lastPointerY: number = 0

  private minZoom: number = 0.25
  private maxZoom: number = 3.0

  constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, mapData: MapData) {
    this.scene = scene
    this.camera = camera
    this.mapData = mapData
  }

  setup(): void {
    this.camera.setZoom(1)
    this.camera.setBounds(
      0,
      0,
      this.mapData.width * this.mapData.tileSize,
      this.mapData.height * this.mapData.tileSize
    )
  }

  startPan(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true
    this.lastPointerX = pointer.x
    this.lastPointerY = pointer.y
  }

  pan(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging) return

    const worldPoint1 = this.camera.getWorldPoint(this.lastPointerX, this.lastPointerY)
    const worldPoint2 = this.camera.getWorldPoint(pointer.x, pointer.y)

    const deltaX = worldPoint1.x - worldPoint2.x
    const deltaY = worldPoint1.y - worldPoint2.y

    this.camera.scrollX += deltaX
    this.camera.scrollY += deltaY

    this.lastPointerX = pointer.x
    this.lastPointerY = pointer.y
  }

  endPan(): void {
    this.isDragging = false
  }

  zoom(factor: number): void {
    const newZoom = this.camera.zoom * factor
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom))
    
    if (clampedZoom !== this.camera.zoom) {
      this.camera.setZoom(clampedZoom)
      this.scene.game.events.emit('cameraZoomChanged', clampedZoom)
    }
  }

  setZoom(zoom: number): void {
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom))
    this.camera.setZoom(clampedZoom)
    this.scene.game.events.emit('cameraZoomChanged', clampedZoom)
  }

  centerOn(x: number, y: number): void {
    this.camera.centerOn(x, y)
  }

  getZoom(): number {
    return this.camera.zoom
  }

  getPosition(): { x: number; y: number } {
    return {
      x: this.camera.scrollX,
      y: this.camera.scrollY,
    }
  }

  update(_delta: number): void {
    if (!this.input?.activePointer?.rightButtonDown()) {
      this.isDragging = false
    }
  }

  private get input(): Phaser.Input.InputPlugin {
    return this.scene.input
  }
}