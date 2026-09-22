import { gbp } from '../data/money'

export type MonthlyBar = { label: string; colour: string; values: number[] }

const BASE_Y = 168
const TOP_Y = 20
const FIRST_X = 46

/*
 * Bar spacing, widened 22 September 2026.
 *
 * It was GAP 40 / BAR_W 26, which made the drawing 546 units wide. An SVG with
 * a fixed height and the default preserveAspectRatio scales by whichever axis
 * binds first: height was pinned at 210 and the viewBox is 210 tall, so the
 * scale was 1 and the chart drew at 546px in the middle of a panel twice that,
 * with white space either side. Worse, each month got 40px for a label like
 * Sep’2025, which needs about 45 — so the axis ran together into one unbroken
 * line of text.
 *
 * 92 units a month makes the twelve-month drawing ~1170 wide, close enough to
 * the panel that the scale stops being the thing that shrinks it, and gives
 * every label room. The height now follows the width (see the <svg/>), so this
 * stays true at any panel size.
 */
const GAP = 92

/*
 * The bar fills 80% of its month, leaving 18 units of air between neighbours.
 *
 * It was 60 of 92 — a third of the chart was white space, and on a stacked bar
 * the gaps read as loudly as the bars do. The slot itself stays at 92 because
 * that is what the month label underneath needs; widening the bar closes the
 * gap without touching the axis.
 */
const BAR_W = Math.round(GAP * 0.8)

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
    // width-driven, not height-driven: `height: auto` lets the drawing fill the
    // panel and take whatever height its own aspect ratio asks for, instead of
    // being pinned to 210 and centred inside the space it refused to use
    <svg
      viewBox={`0 0 ${width} 210`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="Order value by month and discipline"
    >
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
                  <title>{`${s.name}, ${label} — ${gbp(s.value)}`}</title>
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
