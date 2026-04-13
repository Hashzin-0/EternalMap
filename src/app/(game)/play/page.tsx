'use client'

import dynamic from 'next/dynamic'
import GameHUD from '../../../components/game/GameHUD'

const GameCanvas = dynamic(() => import('../../../components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-emerald-400 text-xl">Loading game...</div>
    </div>
  ),
})

export default function PlayPage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900 relative">
      <GameCanvas />
      <GameHUD />
    </div>
  )
}