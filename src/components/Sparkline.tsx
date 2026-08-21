const W = 200
const H = 30
const PAD = 2

/** Inline trend line for a KPI card. Values are normalised to their own min/max. */
export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  const points = values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
      const y = PAD + (1 - (v - min) / span) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="spark">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`} fill="#E7F1F8" />
        <polyline
          points={points}
          fill="none"
          stroke="#1D6FA5"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
