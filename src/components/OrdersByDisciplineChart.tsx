export type MonthlyBar = { label: string; colour: string; values: number[] }

const BASE_Y = 168
const TOP_Y = 20
const BAR_W = 26
const FIRST_X = 46
const GAP = 40

const fmt = (v: number) => (v === 0 ? '' : `${Math.round(v / 1000)}k`)
const centre = (i: number) => FIRST_X + i * GAP + BAR_W / 2

function axis(totals: number[]): { max: number; ticks: number[] } {
  const tallest = Math.max(0, ...totals)
  const step = Math.max(50_000, Math.ceil(tallest / 3 / 50_000) * 50_000)
  const max = step * 3
  return { max, ticks: [0, step, step * 2, max] }
}

/**
 * Twelve months, stacked by discipline — the apportioned figures on top of
 * each other, so the bar's full height is the same total the headline PO sum
 * gives for that month.
 *
 * Each series shares the month axis with every other panel's twelve-month
 * chart on this console, so the same month always sits in the same column.
 */
export function OrdersByDisciplineChart({ keys, series }: { keys: string[]; series: MonthlyBar[] }) {
  const totals = keys.map((_, i) => series.reduce((s, b) => s + (b.values[i] ?? 0), 0))
  const { max: AXIS_MAX, ticks: TICKS } = axis(totals)
  const y = (v: number) => BASE_Y - (Math.min(Math.max(0, v), AXIS_MAX) / AXIS_MAX) * (BASE_Y - TOP_Y)

  const width = FIRST_X + keys.length * GAP + 20

  return (
    <svg viewBox={`0 0 ${width} 210`} width="100%" height={210} role="img" aria-label="Order value by month and discipline">
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9.5" fill="#7B8FA0">
        {TICKS.map((t) => (
          <text key={t} x={FIRST_X - 6} y={y(t) + 3} textAnchor="end">
            {t === 0 ? '0' : fmt(t)}
          </text>
        ))}
      </g>

      {TICKS.filter((t) => t > 0).map((t) => (
        <line key={t} x1={FIRST_X} y1={y(t)} x2={width - 12} y2={y(t)} stroke="#E4EAEF" strokeWidth="1" />
      ))}

      {keys.map((label, i) => {
        let running = 0
        const segs = series.map((s) => {
          const v = s.values[i] ?? 0
          const bottom = running
          running += v
          return { colour: s.colour, name: s.label, value: v, bottom }
        })
        const total = running

        return (
          <g key={label}>
            {segs
              .filter((s) => s.value > 0)
              .map((s) => (
                <rect
                  key={s.name}
                  x={FIRST_X + i * GAP}
                  y={y(s.bottom + s.value)}
                  width={BAR_W}
                  height={y(s.bottom) - y(s.bottom + s.value)}
                  fill={s.colour}
                >
                  <title>{`${s.name}, ${label} — £${Math.round(s.value).toLocaleString('en-GB')}`}</title>
                </rect>
              ))}
            {total > 0 && (
              <text
                x={centre(i)}
                y={y(total) - 5}
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="9"
                fontWeight="600"
                fill="#0D1B26"
              >
                {fmt(total)}
              </text>
            )}
          </g>
        )
      })}

      <line x1={FIRST_X} y1={BASE_Y} x2={width - 12} y2={BASE_Y} stroke="#0D1B26" strokeWidth="2" />

      <g fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#4B5F6E" textAnchor="middle">
        {keys.map((label, i) => (
          <text key={label} x={centre(i)} y={183}>
            {label.replace(' ', "’")}
          </text>
        ))}
      </g>
    </svg>
  )
}
