import type { BacklogBar } from '../data/backlog'

const AXIS_MAX = 450_000
const TICKS = [0, 150_000, 300_000, 450_000]
const BASE_Y = 165
const TOP_Y = 23
const BAR_W = 70
const FIRST_X = 68
const GAP = 92

const y = (v: number) => BASE_Y - (v / AXIS_MAX) * (BASE_Y - TOP_Y)
const fmt = (v: number) => `${Math.round(v / 1000)}k`
const centre = (i: number) => FIRST_X + i * GAP + BAR_W / 2

/** Remaining budget by discipline. Scale is computed, so the bars stay honest. */
export function BacklogChart({ bars }: { bars: BacklogBar[] }) {
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
            <rect x={FIRST_X + i * GAP} y={top} width={BAR_W} height={BASE_Y - top} fill={b.colour}>
              <title>{`${b.label} — £${b.value.toLocaleString('en-GB')}`}</title>
            </rect>
            <text
              x={centre(i)}
              y={top - 6}
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="12"
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
        fontSize="10"
        fill="#4B5F6E"
        textAnchor="middle"
        letterSpacing="1.4"
      >
        {bars.map((b, i) => (
          <text key={b.label} x={centre(i)} y={183}>
            {b.label}
          </text>
        ))}
      </g>

      {/* proxy / composition captions */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9" textAnchor="middle">
        {bars.map((b, i) =>
          b.sub ? (
            <text key={b.label} x={centre(i)} y={197} fill={b.sub.colour}>
              {b.sub.text}
            </text>
          ) : null,
        )}
      </g>
    </svg>
  )
}
