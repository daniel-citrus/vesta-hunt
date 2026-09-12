const COLS = 22
const ROWS = 6

/** Content area inside the labeled frame (excludes label row/col) */
const CONTENT_COLS = COLS - 1 // 21 → A–U
const CONTENT_ROWS = ROWS - 1 // 5 → 1–5

const COLUMN_LABELS = Array.from({ length: CONTENT_COLS }, (_, i) =>
  String.fromCharCode(65 + i),
) // A–U

const ROW_LABELS = Array.from({ length: CONTENT_ROWS }, (_, i) => String(i + 1)) // 1–5

export type CellColor = 'red' | 'green'

type VestaboardProps = {
  /**
   * Character grid for the playable area (5×21). Labels override edge cells in hunt mode.
   * Ignored when `celebration` is set.
   */
  board?: string[][]
  /** Playable coords (e.g. "A1") → color chip (hunt mode) */
  cellColors?: ReadonlyMap<string, CellColor>
  /**
   * When set, render a full 6×22 color art grid with no coordinate labels.
   * `null` entries are blank flaps.
   */
  celebration?: (CellColor | null)[][]
  /** Dev: coords to outline so targets are easy to spot */
  highlightCoords?: ReadonlySet<string>
  /** Dev: playable cells call this with e.g. "A1" when clicked */
  onCellClick?: (coord: string) => void
}

function emptyBoard(): string[][] {
  return Array.from({ length: CONTENT_ROWS }, () =>
    Array.from({ length: CONTENT_COLS }, () => ''),
  )
}

function coordKey(colLabel: string, rowLabel: string): string {
  return `${colLabel}${rowLabel}`
}

function colorClass(color: CellColor): string {
  if (color === 'red') return 'bg-[var(--vb-red)] text-[var(--vb-red)]'
  return 'bg-[var(--vb-green)] text-[var(--vb-green)]'
}

function FlapCell({
  char,
  muted = false,
  color,
  highlighted = false,
  clickable = false,
  onClick,
  ariaLabel,
  role = 'gridcell',
  ariaHidden = false,
}: {
  char: string
  muted?: boolean
  color?: CellColor | null
  highlighted?: boolean
  clickable?: boolean
  onClick?: () => void
  ariaLabel?: string
  role?: 'gridcell' | 'columnheader' | 'rowheader'
  ariaHidden?: boolean
}) {
  const hasColor = color === 'red' || color === 'green'
  const display = hasColor ? '' : char.trim().slice(0, 1)
  const Tag = clickable ? 'button' : 'div'

  return (
    <Tag
      type={clickable ? 'button' : undefined}
      onClick={clickable ? onClick : undefined}
      className={[
        "relative flex size-7 items-center justify-center rounded-[2px] font-['IBM_Plex_Mono',monospace] text-sm font-semibold uppercase transition-colors duration-300 sm:size-8 sm:text-base",
        highlighted ? '' : 'overflow-hidden',
        hasColor
          ? colorClass(color)
          : muted
            ? 'bg-[var(--vb-cell)] text-[var(--vb-label)]'
            : highlighted
              ? 'bg-[#1a3040] text-[var(--vb-char)]'
              : 'bg-[var(--vb-cell)] text-[var(--vb-char)]',
        highlighted ? 'vb-target-highlight z-10' : '',
        clickable
          ? 'cursor-pointer border-0 p-0 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--vb-accent)]'
          : '',
      ].join(' ')}
      role={clickable ? undefined : role}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden || undefined}
    >
      <span
        className={[
          'pointer-events-none absolute inset-x-0 top-1/2 h-px',
          hasColor ? 'bg-black/25' : 'bg-black/50',
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="relative z-10 leading-none">{display || '\u00A0'}</span>
    </Tag>
  )
}

function huntChar(board: string[][], row: number, col: number): string {
  if (row === 0 && col === 0) return ''
  if (row === 0) return COLUMN_LABELS[col - 1] ?? ''
  if (col === 0) return ROW_LABELS[row - 1] ?? ''
  if (board.length === CONTENT_ROWS && (board[0]?.length ?? 0) === CONTENT_COLS) {
    return board[row - 1]?.[col - 1] ?? ''
  }
  return board[row]?.[col] ?? ''
}

export function Vestaboard({
  board = emptyBoard(),
  cellColors,
  celebration,
  highlightCoords,
  onCellClick,
}: VestaboardProps) {
  const celebrating = celebration !== undefined
  const cellsClickable = Boolean(onCellClick) && !celebrating

  return (
    <div
      className="inline-grid gap-1 rounded-sm bg-[var(--vb-frame)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label={
        celebrating
          ? 'Vestaboard celebration'
          : 'Vestaboard, 22 columns by 6 rows'
      }
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} className="contents" role="row">
          {Array.from({ length: COLS }, (_, col) => {
            if (celebrating) {
              const color = celebration[row]?.[col] ?? null
              return (
                <FlapCell
                  key={`${row}-${col}`}
                  char=""
                  color={color}
                  ariaLabel={color ? `${color} chip` : 'blank'}
                />
              )
            }

            const char = huntChar(board, row, col)
            const isCorner = row === 0 && col === 0
            const isColLabel = row === 0 && col > 0
            const isRowLabel = col === 0 && row > 0
            const colLabel = col > 0 ? COLUMN_LABELS[col - 1] : ''
            const rowLabel = row > 0 ? ROW_LABELS[row - 1] : ''
            const isContent = row > 0 && col > 0
            const key = isContent ? coordKey(colLabel, rowLabel) : ''
            const color = isContent ? cellColors?.get(key) : undefined
            const highlighted = isContent && (highlightCoords?.has(key) ?? false)
            const clickable = cellsClickable && isContent

            return (
              <FlapCell
                key={`${row}-${col}`}
                char={char}
                color={color}
                highlighted={highlighted}
                clickable={clickable}
                onClick={clickable ? () => onCellClick?.(key) : undefined}
                muted={isColLabel || isRowLabel}
                ariaHidden={isCorner}
                role={
                  isColLabel ? 'columnheader' : isRowLabel ? 'rowheader' : 'gridcell'
                }
                ariaLabel={
                  isCorner
                    ? undefined
                    : isColLabel
                      ? `Column ${char}`
                      : isRowLabel
                        ? `Row ${char}`
                        : `${colLabel}${rowLabel}${
                            color === 'red'
                              ? ': miss'
                              : color === 'green'
                                ? ': hit'
                                : highlighted
                                  ? ': target'
                                  : char.trim()
                                    ? `: ${char.trim().slice(0, 1)}`
                                    : ''
                          }`
                }
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export {
  COLS,
  ROWS,
  CONTENT_COLS,
  CONTENT_ROWS,
  COLUMN_LABELS,
  ROW_LABELS,
  coordKey,
}
