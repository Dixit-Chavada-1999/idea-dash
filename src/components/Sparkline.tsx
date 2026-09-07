const W = 200
const H = 30
const PAD = 2

type Unit = 'money' | 'count' | 'percent'

function format(v: number, unit: Unit) {
  if (unit === 'money') return `£${Math.round(v).toLocaleString('en-GB')}`
  if (unit === 'percent') return `${v.toFixed(1)}%`
  return v.toLocaleString('en-GB')
}

/**
 * Inline trend line for a KPI card. Values are normalised to their own min/max.
 *
 * Each month carries a hover target — IDEA asked to read the year and the value
 * off the line rather than infer them from its shape, and on a 200×30 line
 * twelve months are three pixels apart, so the shape alone tells you nothing.
 *
 * The targets are transparent rects with a native `<title>`, not a JS tooltip.
 * Same approach as the sector pie, and it needs no state, no positioning and no
 * portal — an SVG title is what a browser already knows how to show. Each rect
 * spans its month's full slice of the width and the full height, so the whole
 * column is hoverable rather than the point itself: a 1.6px line is not a
 * target anyone can hit.
 */
export function Sparkline({
  values,
  keys,
  unit = 'count',
}: {
  values: number[]
  keys?: string[]
  unit?: Unit
}) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  const xy = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / span) * (H - PAD * 2),
    v,
  }))

  const points = xy.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const slice = (W - PAD * 2) / values.length

  return (
    <div className="spark">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        role={keys ? 'img' : undefined}
        aria-label={keys ? `Trend, ${keys[0]} to ${keys[keys.length - 1]}` : undefined}
        aria-hidden={keys ? undefined : 'true'}
      >
        <polygon points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`} fill="#E7F1F8" />
        <polyline
          points={points}
          fill="none"
          stroke="#1D6FA5"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />

        {keys?.length === values.length &&
          xy.map((p, i) => (
            <g key={keys[i]}>
              {/* drawn first so the marker sits above it and stays visible */}
              <rect x={PAD + i * slice} y={0} width={slice} height={H} fill="transparent">
                <title>{`${keys[i]} — ${format(p.v, unit)}`}</title>
              </rect>
              <circle
                cx={p.x}
                cy={p.y}
                r={1.7}
                fill="#1D6FA5"
                className="spark-dot"
                pointerEvents="none"
              />
            </g>
          ))}
      </svg>
    </div>
  )
}
