import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
            EternalMap
          </h1>
          <p className="text-xl text-slate-400">
            Build your empire on an infinite procedural world
          </p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/play"
            className="block w-full py-4 px-8 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
          >
            New Game
          </Link>
          
          <button
            disabled
            className="w-full py-4 px-8 rounded-lg bg-slate-700/50 text-slate-500 text-xl font-semibold cursor-not-allowed opacity-50"
          >
            Continue Game
          </button>
        </div>

        <div className="text-sm text-slate-500 space-y-2">
          <p>Drag with right-click to pan • Scroll to zoom</p>
        </div>
      </div>
    </main>
  )
}