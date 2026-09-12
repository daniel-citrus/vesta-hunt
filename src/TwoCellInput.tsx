import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'

type TwoCellInputProps = {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  /** Coords already probed — duplicate submit is rejected */
  probed?: ReadonlySet<string>
  /** Lock the whole control (e.g. celebration) */
  disabled?: boolean
  /** Accessible name for the control */
  label?: string
  submitLabel?: string
}

function normalizeChar(raw: string, index: number): string {
  const c = raw.slice(-1)
  if (!c) return ''
  if (index === 0) {
    const upper = c.toUpperCase()
    return upper >= 'A' && upper <= 'U' ? upper : ''
  }
  return c >= '1' && c <= '5' ? c : ''
}

export function TwoCellInput({
  value,
  onChange,
  onSubmit,
  probed,
  disabled = false,
  label = 'Coordinate',
  submitLabel = 'Submit',
}: TwoCellInputProps) {
  const id = useId()
  const [internal, setInternal] = useState<[string, string]>(['', ''])
  const [shaking, setShaking] = useState(false)
  const firstRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)
  const refs = [firstRef, secondRef] as const
  const shakeTimer = useRef<number | null>(null)

  const controlled = value !== undefined
  const cells: [string, string] = controlled
    ? [value[0]?.toUpperCase() ?? '', value[1] ?? '']
    : internal

  const complete = cells[0].length === 1 && cells[1].length === 1
  const current = cells.join('')
  const isDuplicate = complete && (probed?.has(current) ?? false)
  const inputsLocked = disabled
  /** Hard-disable only while celebrating or incomplete; duplicates stay clickable so reject+shake can fire */
  const hardDisabled = disabled || !complete

  useEffect(() => {
    return () => {
      if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current)
    }
  }, [])

  function commit(next: [string, string]) {
    if (!controlled) setInternal(next)
    onChange?.(next.join(''))
  }

  function triggerShake() {
    setShaking(true)
    if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current)
    shakeTimer.current = window.setTimeout(() => setShaking(false), 400)
  }

  function handleChange(index: 0 | 1, e: ChangeEvent<HTMLInputElement>) {
    if (disabled) return
    const char = normalizeChar(e.target.value, index)
    const next: [string, string] = [cells[0], cells[1]]
    next[index] = char
    commit(next)
    if (char && index === 0) secondRef.current?.focus()
  }

  function handleKeyDown(index: 0 | 1, e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return
    if (e.key === 'Enter' && complete && isDuplicate) {
      e.preventDefault()
      triggerShake()
      return
    }
    if (e.key === 'Backspace' && !cells[index] && index === 1) {
      e.preventDefault()
      commit([cells[0], ''])
      firstRef.current?.focus()
    }
    if (e.key === 'ArrowLeft' && index === 1) {
      e.preventDefault()
      firstRef.current?.focus()
    }
    if (e.key === 'ArrowRight' && index === 0) {
      e.preventDefault()
      secondRef.current?.focus()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled) return
    if (!complete) return
    if (isDuplicate) {
      triggerShake()
      return
    }
    onSubmit?.(current)
  }

  return (
    <form
      className={['flex items-center gap-3', shaking ? 'vb-shake' : ''].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      aria-label={label}
    >
      <label htmlFor={`${id}-0`} className="sr-only">
        {label}
      </label>
      <div
        className="inline-grid grid-cols-2 gap-1 rounded-sm bg-[var(--vb-frame)] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
        role="group"
        aria-label={label}
      >
        {([0, 1] as const).map((index) => (
          <div
            key={index}
            className="relative size-10 overflow-hidden rounded-[2px] bg-[var(--vb-cell)] sm:size-11"
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-black/50"
              aria-hidden="true"
            />
            <input
              id={`${id}-${index}`}
              ref={refs[index]}
              type="text"
              inputMode={index === 0 ? 'text' : 'numeric'}
              maxLength={1}
              autoComplete="off"
              spellCheck={false}
              disabled={inputsLocked}
              value={cells[index]}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={index === 0 ? 'Column letter A–U' : 'Row number 1–5'}
              className="relative z-0 size-full bg-transparent text-center font-['IBM_Plex_Mono',monospace] text-lg font-semibold uppercase text-[var(--vb-char)] caret-[var(--vb-accent)] outline-none selection:bg-[var(--vb-accent)]/30 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xl"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={hardDisabled}
        aria-disabled={hardDisabled || isDuplicate}
        className={[
          "h-10 rounded-sm bg-[var(--vb-frame)] px-4 font-['IBM_Plex_Mono',monospace] text-sm font-semibold tracking-wide text-[var(--vb-char)] uppercase shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition sm:h-11 sm:px-5 sm:text-base",
          hardDisabled || isDuplicate
            ? 'cursor-not-allowed opacity-40'
            : 'enabled:hover:text-[var(--vb-accent)] enabled:active:scale-[0.98]',
        ].join(' ')}
      >
        {submitLabel}
      </button>
    </form>
  )
}
