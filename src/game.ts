import {
  COLUMN_LABELS,
  ROW_LABELS,
  CONTENT_COLS,
  CONTENT_ROWS,
} from './Vestaboard'

export const TARGET_COUNT = 12
export const CELEBRATION_MS = 8000

/** All playable coordinates A1–U5 */
export function allPlayableCoords(): string[] {
  const coords: string[] = []
  for (const row of ROW_LABELS) {
    for (const col of COLUMN_LABELS) {
      coords.push(`${col}${row}`)
    }
  }
  return coords
}

/** Pick `count` distinct random playable coordinates */
export function pickTargets(count = TARGET_COUNT): Set<string> {
  const pool = allPlayableCoords()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return new Set(pool.slice(0, Math.min(count, pool.length)))
}

export function isPlayableCoord(value: string): boolean {
  if (value.length !== 2) return false
  const [col, row] = value
  return COLUMN_LABELS.includes(col) && ROW_LABELS.includes(row)
}

export { CONTENT_COLS, CONTENT_ROWS }
