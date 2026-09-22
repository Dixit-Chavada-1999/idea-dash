import type { BacklogBar } from '../data/backlog'
import { gbp } from '../data/money'

const BASE_Y = 165
const TOP_Y = 23
const PLOT_X = 56
const PLOT_R = 424

const fmt = (v: number) => `${Math.round(v / 1000)}k`

/**
 * Bar geometry, derived from the number of bars rather than fixed.
 *
 * These were constants sized for the four bundled buckets — BAR_W 70, GAP 92,
 * first bar at x=68. Unbundling the disciplines on 22 September 2026 took the
 * count to eight, and bars six onward were drawn past the viewBox's 430 and
 * simply vanished: ELC and PRM were missing from the chart while still counted
 * in the total printed above it. A chart that silently drops a discipline is
 * worse than one that looks cramped, so the slot is divided out of the plot
 * width instead.
 */
function geometry(n: number) {
  const slot = (PLOT_R - PLOT_X) / Math.max(1, n)
  const width = slot * 0.66
  return {
    width,
    x: (i: number) => PLOT_X + i * slot + (slot - width) / 2,
    centre: (i: number) => PLOT_X + i * slot + slot / 2,
    // the label type has to come down once the slots narrow, or eight
    // three-letter codes at 1.4 letter-spacing collide
    labelSize: slot < 46 ? 8 : 10,
    valueSize: slot < 46 ? 10 : 12,
  }
}

/**
 * Four ticks ending on a round number at or above the tallest bar.
 *
 * The axis was fixed at £450,000, which suited the gross budget it used to plot
 * and does not suit the net backlog it plots now — the bars would sit in the
 * lower two thirds of the frame, and a bucket above the ceiling would have been
 * drawn off the top of the chart with nothing to say so.
 */
function axis(bars: BacklogBar[]): { max: number; ticks: number[] } {
  const tallest = Math.max(0, ...bars.map((b) => b.value))
  // three equal steps, each rounded up to 50k, so the labels stay readable
  const step = Math.max(50_000, Math.ceil(tallest / 3 / 50_000) * 50_000)
  const max = step * 3
  return { max, ticks: [0, step, step * 2, max] }
}

/**
 * Net backlog by discipline — budget less cost booked, as the server sends it.
 *
 * A negative value is possible where a discipline is overspent. The figure is
 * kept as it is; only the bar geometry is clamped, so an overspent discipline
 * shows an empty track rather than a rectangle drawn upside down.
 */
export function BacklogChart({ bars }: { bars: BacklogBar[] }) {
  const { max: AXIS_MAX, ticks: TICKS } = axis(bars)
  const geo = geometry(bars.length)
  const y = (v: number) => BASE_Y - (Math.min(Math.max(0, v), AXIS_MAX) / AXIS_MAX) * (BASE_Y - TOP_Y)

  return (
    <svg viewBox="0 0 430 210" width="100%" height={210} role="img" aria-label="Backlog by discipline">
      {/* y-axis ticks */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9.5" fill="#7B8FA0">
        {TICKS.map((t) => (
          <text key={t} x={42} y={y(t) + 3} textAnchor="end">
            {t === 0 ? '0' : fmt(t)}
          </text>
        ))}
      </g>

      {/* gridlines */}
      {TICKS.filter((t) => t > 0).map((t) => (
        <line key={t} x1={48} y1={y(t)} x2={424} y2={y(t)} stroke="#E4EAEF" strokeWidth="1" />
      ))}

      {/* bars + value labels */}
      {bars.map((b, i) => {
        const top = y(b.value)
        return (
          <g key={b.label}>
            <rect x={geo.x(i)} y={top} width={geo.width} height={BASE_Y - top} fill={b.colour}>
              <title>{`${b.label} — ${gbp(b.value)}`}</title>
            </rect>
            <text
              x={geo.centre(i)}
              y={top - 6}
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={geo.valueSize}
              fontWeight="600"
              fill="#0D1B26"
            >
              {fmt(b.value)}
            </text>
          </g>
        )
      })}

      {/* baseline */}
      <line x1={48} y1={BASE_Y} x2={424} y2={BASE_Y} stroke="#0D1B26" strokeWidth="2" />

      {/* discipline labels */}
      <g
        fontFamily="Archivo, sans-serif"
        fontWeight="700"
        fontSize={geo.labelSize}
        fill="#4B5F6E"
        textAnchor="middle"
        letterSpacing="1.4"
      >
        {bars.map((b, i) => (
          <text key={b.label} x={geo.centre(i)} y={183}>
            {b.label}
          </text>
        ))}
      </g>

      {/* proxy / composition captions */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9" textAnchor="middle">
        {bars.map((b, i) =>
          b.sub ? (
            <text key={b.label} x={geo.centre(i)} y={197} fill={b.sub.colour}>
              {b.sub.text}
            </text>
          ) : null,
        )}
      </g>
    </svg>
  )
}
