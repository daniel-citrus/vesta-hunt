import { COLS, type CellColor } from './Vestaboard'

/** Narrow classic heart (8×6), centered on the 22×6 board. `#` = fill. */
const HEART = [
  '.##..##.',
  '########',
  '########',
  '.######.',
  '..####..',
  '...##...',
] as const

function centeredHeartRows(): string[] {
  const heartW = HEART[0].length
  const offset = Math.floor((COLS - heartW) / 2)
  return HEART.map((row) => {
    const cells = Array.from({ length: COLS }, () => '.')
    for (let c = 0; c < heartW; c++) cells[offset + c] = row[c] ?? '.'
    return cells.join('')
  })
}

const CENTERED_HEART = centeredHeartRows()

/** Full-board colors for win celebration (`null` = blank flap) */
export function heartCelebrationColors(): (CellColor | null)[][] {
  return CENTERED_HEART.map((row) =>
    Array.from({ length: COLS }, (_, col) => (row[col] === '#' ? ('red' as const) : null)),
  )
}
