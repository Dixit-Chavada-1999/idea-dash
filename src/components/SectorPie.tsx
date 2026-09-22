import type { SectorSlice } from '../contracts/dashboard'
import { gbp } from '../data/money'

const CX = 100
const CY = 100
const R = 90
const START = -Math.PI / 2

/** Below this the slice is a whole circle — see `drawn` for why an arc will not do. */
const FULL = 0.9999

function arcPath(a0: number, a1: number) {
  const x0 = CX + R * Math.cos(a0)
  const y0 = CY + R * Math.sin(a0)
  const x1 = CX + R * Math.cos(a1)
  const y1 = CY + R * Math.sin(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

/**
 * Divider width for one slice.
 *
 * A fixed 2px stroke erases a narrow wedge: at 0.5% the rim is under 3px across,
 * so a 2px white edge on each side leaves nothing. The divider therefore shrinks
 * with the slice it borders — wide slices keep the full separation, thin ones
 * keep their colour.
 */
function strokeFor(fraction: number) {
  const rimPx = fraction * Math.PI * 2 * R
  return Math.max(0.25, Math.min(2, rimPx / 3))
}

type Props = { slices: SectorSlice[]; colours: Map<string, string>; label: string }

export function SectorPie({ slices, colours, label }: Props) {
  const total = slices.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <svg viewBox="0 0 200 200" width={200} height={200} role="img" aria-label={`${label} — no data`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#D3DCE2" strokeWidth="2" strokeDasharray="4 5" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#7B8FA0">
          no orders
        </text>
      </svg>
    )
  }

  // running start angle derived per slice rather than accumulated in a mutable
  const drawn = slices.map((d, i) => {
    const before = slices.slice(0, i).reduce((s, x) => s + x.value, 0)
    const fraction = d.value / total
    const a0 = START + (before / total) * Math.PI * 2
    const a1 = a0 + fraction * Math.PI * 2

    return {
      name: d.name,
      colour: colours.get(d.name) ?? '#C6D2DA',
      /*
       * A slice covering the whole circle cannot be an arc: its two endpoints
       * land on the same point, and SVG omits an arc whose endpoints coincide.
       * The path collapses to a line and the pie renders blank — so a sole
       * sector is drawn as a circle instead.
       */
      full: fraction >= FULL,
      path: arcPath(a0, a1),
      stroke: strokeFor(fraction),
      empty: d.value <= 0,
      title: `${d.name} — ${gbp(d.value)} (${(fraction * 100).toFixed(1)}%)`,
    }
  })

  return (
    <svg viewBox="0 0 200 200" width={200} height={200} role="img" aria-label={label}>
      {drawn
        .filter((s) => !s.empty)
        .map((s) =>
          s.full ? (
            <circle key={s.name} cx={CX} cy={CY} r={R} fill={s.colour}>
              <title>{s.title}</title>
            </circle>
          ) : (
            <path key={s.name} d={s.path} fill={s.colour} stroke="#FFFFFF" strokeWidth={s.stroke}>
              <title>{s.title}</title>
            </path>
          ),
        )}
    </svg>
  )
}

export function SectorLegend({ colours }: { colours: Map<string, string> }) {
  return (
    <div className="sector-legend">
      {[...colours.entries()].map(([name, colour]) => (
        <span key={name}>
          <i className="sw" style={{ background: colour }} />
          {name}
        </span>
      ))}
    </div>
  )
}
