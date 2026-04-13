'use client'

import { useGameStore } from '../../lib/stores/game-store'
import type { GameSpeed } from '../../game-core/types/game-state'

export default function GameHUD() {
  const time = useGameStore((state) => state.time)
  const treasury = useGameStore((state) => state.treasury)
  const isPaused = useGameStore((state) => state.isPaused)
  const gameSpeed = useGameStore((state) => state.gameSpeed)
  const togglePause = useGameStore((state) => state.togglePause)
  const setGameSpeed = useGameStore((state) => state.setGameSpeed)

  const formatTime = (t: number): string => {
    const days = Math.floor(t / 1000)
    const hours = Math.floor((t % 1000) / 1000 * 24)
    return `Day ${days + 1}, Hour ${hours}`
  }

  const speedOptions: GameSpeed[] = [0.25, 0.5, 1, 2, 4]

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
            <span className="text-white font-mono text-sm">{formatTime(time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V5a1 1 0 112 0v4a1 1 0 01-1 1H5a1 1 0 110-2h4z" />
            </svg>
            <span className="text-white font-mono text-sm">{treasury.toLocaleString()} Gold</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={togglePause}
            className="px-3 py-1 rounded bg-slate-700/80 hover:bg-slate-600/80 text-white text-sm transition-colors"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-white text-sm mr-2">Speed:</span>
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  gameSpeed === speed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}