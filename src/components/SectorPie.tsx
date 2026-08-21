import type { Sector } from '../data/console'

const CX = 100
const CY = 100
const R = 90
const START = -Math.PI / 2

function arcPath(a0: number, a1: number) {
  const x0 = CX + R * Math.cos(a0)
  const y0 = CY + R * Math.sin(a0)
  const x1 = CX + R * Math.cos(a1)
  const y1 = CY + R * Math.sin(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

type Props = {
  sectors: Sector[]
  /** which value column to draw — colour stays fixed per sector across both */
  field: 'cytd' | 'prior'
  label: string
}

export function SectorPie({ sectors, field, label }: Props) {
  const total = sectors.reduce((s, d) => s + d[field], 0)

  // running start angle per slice, derived rather than accumulated in a mutable
  const slices = sectors.map((d, i) => {
    const before = sectors.slice(0, i).reduce((s, x) => s + x[field], 0)
    const a0 = START + (before / total) * Math.PI * 2
    const a1 = a0 + (d[field] / total) * Math.PI * 2
    return {
      name: d.name,
      colour: d.colour,
      path: arcPath(a0, a1),
      title: `${d.name} — £${d[field].toLocaleString('en-GB')} (${((d[field] / total) * 100).toFixed(1)}%)`,
    }
  })

  return (
    <svg viewBox="0 0 200 200" width={200} height={200} role="img" aria-label={label}>
      {slices.map((s) => (
        <path key={s.name} d={s.path} fill={s.colour} stroke="#FFFFFF" strokeWidth="2">
          <title>{s.title}</title>
        </path>
      ))}
    </svg>
  )
}

export function SectorLegend({ sectors }: { sectors: Sector[] }) {
  return (
    <div className="sector-legend">
      {sectors.map((d) => (
        <span key={d.name}>
          <i className="sw" style={{ background: d.colour }} />
          {d.name}
        </span>
      ))}
    </div>
  )
}
