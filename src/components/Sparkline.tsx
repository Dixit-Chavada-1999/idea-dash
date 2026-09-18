import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const W = 200
const H = 30
const PAD = 2
const MARGIN = 12
const TIP_WIDTH = 130

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
 * The targets are transparent rects; hovering one shows a small dark tooltip,
 * styled to match `CalcTip`'s popover (same colours, radius, shadow) rather
 * than the browser's own plain `<title>` box this replaced. Positioned in JS
 * from the hovered rect's own `getBoundingClientRect()` and rendered into
 * `document.body` via a portal, clamped to the viewport — the same technique
 * `CalcTip` uses and for the same reason: a card-anchored box can run off the
 * edge of a narrow card or the screen.
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number; arrowLeft: number } | null>(null)
  const targetRef = useRef<SVGRectElement | null>(null)

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

  useLayoutEffect(() => {
    if (hoverIndex === null || !targetRef.current) {
      setPos(null)
      return
    }
    const r = targetRef.current.getBoundingClientRect()
    const idealLeft = r.left + r.width / 2 - TIP_WIDTH / 2
    const left = Math.min(Math.max(idealLeft, MARGIN), window.innerWidth - TIP_WIDTH - MARGIN)
    const top = r.top - 8
    const arrowLeft = r.left + r.width / 2 - left
    setPos({ top, left, arrowLeft })
  }, [hoverIndex])

  const leave = () => {
    targetRef.current = null
    setHoverIndex(null)
  }

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
        onMouseLeave={leave}
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
              <rect
                x={PAD + i * slice}
                y={0}
                width={slice}
                height={H}
                fill="transparent"
                onMouseEnter={(e) => {
                  targetRef.current = e.currentTarget
                  setHoverIndex(i)
                }}
              />
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

      {hoverIndex !== null &&
        keys &&
        pos &&
        createPortal(
          <div
            className="spark-tip"
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: TIP_WIDTH, ['--arrow-left' as string]: `${pos.arrowLeft}px` }}
          >
            <span className="spark-tip-month">{keys[hoverIndex]}</span>
            <span className="spark-tip-value">{format(xy[hoverIndex]!.v, unit)}</span>
          </div>,
          document.body,
        )}
    </div>
  )
}
