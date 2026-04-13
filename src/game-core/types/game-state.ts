export interface GameState {
  time: number
  timeScale: number
  treasury: number
  isPaused: boolean
  gameSpeed: number
  selectedTile: { x: number; y: number } | null
  cameraPosition: { x: number; y: number }
  cameraZoom: number
  isLoaded: boolean
}

export type GameSpeed = 0.25 | 0.5 | 1 | 2 | 4

export interface GameAction {
  type: 'PAUSE' | 'RESUME' | 'SET_SPEED' | 'ADD_TIME' | 'SET_TREASURY' | 'SELECT_TILE' | 'SET_CAMERA' | 'SET_ZOOM' | 'SET_LOADED'
  payload?: unknown
}