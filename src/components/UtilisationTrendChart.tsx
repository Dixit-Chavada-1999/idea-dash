import { useState } from 'react'

/*
 * Same coordinate approach as UtilisationChart: a wide, width-driven viewBox,
 * so the drawing fills the panel at a scale near 1.4 and a 9-unit label renders
 * at roughly the size it was drawn for.
 */
const W = 1080
const H = 230
const BASE_Y = 196
const TOP_Y = 14
const PLOT_X = 42
const PLOT_R = 1062

/**
 * Fixed per discipline, in the order the disciplines are listed, never by rank.
 * A discipline keeps its colour whichever month is hovered and whichever line
 * happens to be highest. Validated as a set for colour-vision separation; three
 * of the six sit under 3:1 against white, so the legend and the hover readout
 * carry the identity alongside the colour.
 */
const SERIES_COLOURS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']
const OVERALL_COLOUR = '#0D1B26'

export type TrendSeries = { label: string; pct: (number | null)[] }

const shortMonth = (ym: string) => {
  const [y, m] = ym.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[Number(m) - 1] ?? m}’${y?.slice(2)}`
}

/**
 * The axis floor, fitted to the data but on a round ten.
 *
 * The snapshot chart pins 0–100 because a single reading is a share of a whole.
 * A trend is read for its direction, and at 0–100 six lines between 60% and 95%
 * would sit in the top third of the panel with every month-to-month move
 * flattened out. The ceiling stays at 100, since nothing can exceed it.
 */
function floorOf(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10)
}

/** Split a line at months with no reading, rather than bridging the gap. */
function segments(pts: ({ x: number; y: number } | null)[]): string[] {
  const out: string[] = []
  let cur: string[] = []
  for (const p of pts) {
    if (p) cur.push(`${cur.length ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    else if (cur.length) {
      out.push(cur.join(''))
      cur = []
    }
  }
  if (cur.length) out.push(cur.join(''))
  return out
}

/**
 * Utilisation per discipline, one line each, month by month.
 *
 * The portfolio-wide figure is drawn dashed in ink behind the disciplines, as
 * the reference each line is read against. Hovering a month shows every
 * reading for it, largest first — there are too many close lines to label each
 * point without the labels colliding.
 */
export function UtilisationTrendChart({
  keys,
  series,
  overall,
}: {
  keys: string[]
  series: TrendSeries[]
  overall: (number | null)[]
}) {
  const [hover, setHover] = useState<number | null>(null)

  const all = [...series.flatMap((s) => s.pct), ...overall].filter((v): v is number => v !== null)
  const lo = floorOf(all)
  const ticks: number[] = []
  for (let t = lo; t <= 100; t += lo >= 50 ? 10 : 20) ticks.push(t)

  const slot = (PLOT_R - PLOT_X) / Math.max(1, keys.length)
  const x = (i: number) => PLOT_X + i * slot + slot / 2
  const y = (v: number) => BASE_Y - ((Math.min(Math.max(lo, v), 100) - lo) / (100 - lo)) * (BASE_Y - TOP_Y)
  const pointsOf = (vals: (number | null)[]) => vals.map((v, i) => (v === null ? null : { x: x(i), y: y(v) }))

  const lines = [
    ...series.map((s, i) => ({ label: s.label, colour: SERIES_COLOURS[i % SERIES_COLOURS.length]!, pct: s.pct, overall: false })),
    { label: 'All disciplines', colour: OVERALL_COLOUR, pct: overall, overall: true },
  ]

  const readout =
    hover === null
      ? []
      : lines
          .map((l) => ({ ...l, v: l.pct[hover] ?? null }))
          .sort((a, b) => (b.v ?? -1) - (a.v ?? -1))

  // the readout sits beside the hovered month, flipping to the left past halfway
  // so it never runs off the panel
  const tipLeft = hover === null ? 0 : (x(hover) / W) * 100
  const flip = hover !== null && hover >= keys.length / 2

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Utilisation by discipline, month by month"
        onMouseLeave={() => setHover(null)}
      >
        <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#7B8FA0">
          {ticks.map((t) => (
            <text key={t} x={PLOT_X - 5} y={y(t) + 3} textAnchor="end">
              {t}
            </text>
          ))}
        </g>
        {ticks.map((t) => (
          <line
            key={t}
            x1={PLOT_X}
            y1={y(t)}
            x2={PLOT_R}
            y2={y(t)}
            stroke={t === lo ? '#0D1B26' : '#E4EAEF'}
            strokeWidth={t === lo ? 1.5 : 1}
          />
        ))}

        {hover !== null && (
          <line x1={x(hover)} y1={TOP_Y} x2={x(hover)} y2={BASE_Y} stroke="#7B8FA0" strokeWidth={1} />
        )}

        {/* ink reference first, so every discipline draws over it */}
        {[...lines].reverse().map((l) =>
          segments(pointsOf(l.pct)).map((d, j) => (
            <path
              key={`${l.label}-${j}`}
              d={d}
              fill="none"
              stroke={l.colour}
              strokeWidth={2}
              strokeDasharray={l.overall ? '6 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )),
        )}

        {hover !== null &&
          lines.map((l) => {
            const v = l.pct[hover]
            return v == null ? null : (
              <circle key={l.label} cx={x(hover)} cy={y(v)} r={4} fill={l.colour} stroke="#fff" strokeWidth={2} />
            )
          })}

        <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#4B5F6E" textAnchor="middle">
          {keys.map((k, i) => (
            <text key={k} x={x(i)} y={BASE_Y + 16} fontWeight={hover === i ? 700 : 400}>
              {shortMonth(k)}
            </text>
          ))}
        </g>

        {/* hit targets: the whole month column, far larger than the points */}
        {keys.map((k, i) => (
          <rect
            key={k}
            x={PLOT_X + i * slot}
            y={TOP_Y}
            width={slot}
            height={BASE_Y - TOP_Y + 22}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="trend-tip"
          style={{
            left: `${tipLeft}%`,
            transform: flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
          }}
        >
          <div className="trend-tip-hd">{shortMonth(keys[hover]!)}</div>
          {readout.map((r) => (
            <div key={r.label} className="trend-tip-row">
              <i
                style={{
                  background: r.overall ? 'transparent' : r.colour,
                  borderTop: r.overall ? `2px dashed ${r.colour}` : undefined,
                }}
              />
              <span>{r.label}</span>
              <b>{r.v === null ? '—' : `${r.v.toFixed(1)}%`}</b>
            </div>
          ))}
        </div>
      )}

      <div className="wg-note" style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {lines.map((l) => (
          <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i
              style={{
                width: 14,
                height: 0,
                borderTop: `2px ${l.overall ? 'dashed' : 'solid'} ${l.colour}`,
                display: 'inline-block',
              }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
