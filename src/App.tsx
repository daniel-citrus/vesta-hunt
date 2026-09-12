import { useEffect, useRef, useState } from 'react'
import { CELEBRATION_MS, pickTargets, TARGET_COUNT } from './game'
import { heartCelebrationColors } from './heart'
import { TwoCellInput } from './TwoCellInput'
import { Vestaboard, type CellColor } from './Vestaboard'

type Phase = 'hunt' | 'celebrate'

function App() {
  const [phase, setPhase] = useState<Phase>('hunt')
  const [coord, setCoord] = useState('')
  const [targets, setTargets] = useState(() => pickTargets(TARGET_COUNT))
  const [cellColors, setCellColors] = useState(() => new Map<string, CellColor>())
  const [hits, setHits] = useState(() => new Set<string>())
  const [showTargets, setShowTargets] = useState(false)
  const resetTimer = useRef<number | null>(null)

  const probed = new Set(cellColors.keys())
  const celebration = phase === 'celebrate' ? heartCelebrationColors() : undefined

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    }
  }, [])

  function startNewHunt() {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
    setTargets(pickTargets(TARGET_COUNT))
    setCellColors(new Map())
    setHits(new Set())
    setCoord('')
    setPhase('hunt')
  }

  function beginCelebration() {
    setPhase('celebrate')
    setCoord('')
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => {
      startNewHunt()
    }, CELEBRATION_MS)
  }

  function handleSubmit(value: string) {
    if (phase !== 'hunt') return
    const key = value.toUpperCase()
    if (cellColors.has(key)) return

    const isHit = targets.has(key)
    const color: CellColor = isHit ? 'green' : 'red'

    const nextColors = new Map(cellColors)
    nextColors.set(key, color)
    setCellColors(nextColors)
    setCoord('')

    if (isHit) {
      const nextHits = new Set(hits)
      nextHits.add(key)
      setHits(nextHits)
      if (nextHits.size >= TARGET_COUNT) {
        beginCelebration()
      }
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="text-center">
        <p className="mb-1 text-xs font-semibold tracking-[0.35em] text-[var(--vb-accent)] uppercase">
          Vesta Hunt
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--vb-char)] sm:text-4xl">
          Vestaboard
        </h1>
        <p className="mt-2 text-sm text-[var(--vb-label)]">
          {phase === 'celebrate'
            ? 'Cleared — new hunt soon'
            : `Find ${TARGET_COUNT} · ${hits.size}/${TARGET_COUNT} · green hit · red miss`}
        </p>
      </header>

      <div className="flex max-w-full flex-col items-center gap-4 overflow-x-auto">
        <Vestaboard
          cellColors={cellColors}
          celebration={celebration}
          highlightCoords={showTargets && phase === 'hunt' ? targets : undefined}
          onCellClick={
            showTargets && phase === 'hunt' ? handleSubmit : undefined
          }
        />
        <TwoCellInput
          value={coord}
          onChange={setCoord}
          onSubmit={handleSubmit}
          probed={probed}
          disabled={phase === 'celebrate'}
          label="Coordinate"
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs tracking-wide text-[var(--vb-label)] uppercase select-none">
          <input
            type="checkbox"
            checked={showTargets}
            onChange={(e) => setShowTargets(e.target.checked)}
            className="size-3.5 accent-[var(--vb-accent)]"
          />
          Dev · show targets · click cells
        </label>
      </div>
    </main>
  )
}

export default App
