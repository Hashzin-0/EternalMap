import { useEffect, useRef, useState } from 'react'
import { createGameEngine, destroyGameEngine } from '../../game/engine/game-engine'
import { createGameLoop, GameLoop } from '../../game/engine/game-loop'
import { generateInitialMapData } from '../../game-core/state/initial-state'
import { useGameStore } from '../../lib/stores/game-store'
import type Phaser from 'phaser'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameLoopRef = useRef<GameLoop | null>(null)
  const [isReady, setIsReady] = useState(false)

  const setLoaded = useGameStore((state) => state.setLoaded)
  const isPaused = useGameStore((state) => state.isPaused)
  const gameSpeed = useGameStore((state) => state.gameSpeed)

  useEffect(() => {
    if (!containerRef.current) return

    const mapData = generateInitialMapData(12345)

    gameRef.current = createGameEngine({
      containerId: containerRef.current.id,
      width: window.innerWidth,
      height: window.innerHeight,
      mapData,
    })

    gameRef.current.events.on('ready', () => {
      if (gameRef.current) {
        gameLoopRef.current = createGameLoop(gameRef.current)
        setIsReady(true)
        setLoaded(true)
      }
    })

    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.destroy()
        gameLoopRef.current = null
      }
      destroyGameEngine()
    }
  }, [setLoaded])

  useEffect(() => {
    if (gameLoopRef.current) {
      if (isPaused) {
        gameLoopRef.current.pause()
      } else {
        gameLoopRef.current.resume()
      }
    }
  }, [isPaused])

  useEffect(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.setSpeed(gameSpeed)
    }
  }, [gameSpeed])

  return (
    <div
      id="game-container"
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: '100vh' }}
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-emerald-400 text-xl">Loading EternalMap...</div>
        </div>
      )}
    </div>
  )
}