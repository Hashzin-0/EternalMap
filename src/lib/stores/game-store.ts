import { create } from 'zustand'
import { GameState, GameSpeed } from '../../game-core/types/game-state'

interface GameStore extends GameState {
  togglePause: () => void
  setPaused: (paused: boolean) => void
  setGameSpeed: (speed: GameSpeed) => void
  addTime: (delta: number) => void
  setTreasury: (amount: number) => void
  addTreasury: (amount: number) => void
  selectTile: (x: number, y: number) => void
  clearSelection: () => void
  setCameraPosition: (x: number, y: number) => void
  setCameraZoom: (zoom: number) => void
  setLoaded: (loaded: boolean) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  time: 0,
  timeScale: 1,
  treasury: 1000,
  isPaused: false,
  gameSpeed: 1,
  selectedTile: null,
  cameraPosition: { x: 0, y: 0 },
  cameraZoom: 1,
  isLoaded: false,

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setPaused: (paused: boolean) => set({ isPaused: paused }),

  setGameSpeed: (speed: GameSpeed) => set({ gameSpeed: speed, timeScale: speed }),

  addTime: (delta: number) =>
    set((state) => ({
      time: Math.max(0, state.time + delta * state.timeScale),
    })),

  setTreasury: (amount: number) => set({ treasury: amount }),

  addTreasury: (amount: number) =>
    set((state) => ({
      treasury: Math.max(0, state.treasury + amount),
    })),

  selectTile: (x: number, y: number) => set({ selectedTile: { x, y } }),

  clearSelection: () => set({ selectedTile: null }),

  setCameraPosition: (x: number, y: number) =>
    set({ cameraPosition: { x, y } }),

  setCameraZoom: (zoom: number) =>
    set({ cameraZoom: Math.max(0.25, Math.min(3.0, zoom)) }),

  setLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
}))

if (typeof window !== 'undefined') {
  let lastTime = performance.now()
  
  const gameLoop = () => {
    const state = useGameStore.getState()
    if (state.isLoaded && !state.isPaused) {
      const currentTime = performance.now()
      const delta = currentTime - lastTime
      
      if (delta >= 100) {
        useGameStore.getState().addTime(delta / 1000)
        lastTime = currentTime
      }
    }
    requestAnimationFrame(gameLoop)
  }
  
  requestAnimationFrame(gameLoop)
}