/*
 * The coordinate space is wide on purpose.
 *
 * This is a width-driven SVG: it fills the panel and takes whatever height its
 * own aspect ratio asks for. At the first pass the viewBox was 430 x 186, so in
 * a 1550px panel everything — bars, ticks, type — was scaled 3.6x and the chart
 * came out 670px tall with 30px labels.
 *
 * 1080 x 190 is close to six-to-one, which lands around 270px tall in the same
 * panel and leaves the scale near 1.4, so a 9-unit label renders at about the
 * 13px it was drawn for.
 */
const BASE_Y = 142
const TOP_Y = 26
const PLOT_X = 42
const PLOT_R = 1062
const TICKS = [0, 25, 50, 75, 100]

export type UtilisationBar = { label: string; pct: number | null }

/**
 * Utilisation per discipline, as columns.
 *
 * Was a stack of horizontal tracks, one row per discipline. Eight of them ran
 * the panel down the page and made the comparison the panel exists for — who is
 * high, who is low — a matter of scanning eight separate rulers rather than
 * reading one. Columns put every discipline on a single shared axis.
 *
 * The axis is fixed at 0–100, not fitted to the data: utilisation is a share of
 * a whole, and an axis fitted to a 77–93% spread would make ordinary variation
 * look like a chasm.
 *
 * A null reading draws no column and is labelled "—" rather than resting at the
 * floor. Zero is a real value here — OPE books no project work at all — so
 * "none" and "nothing measured" have to stay distinguishable.
 */
export function UtilisationChart({ bars }: { bars: UtilisationBar[] }) {
  const slot = (PLOT_R - PLOT_X) / Math.max(1, bars.length)
  const barW = slot * 0.55
  const centre = (i: number) => PLOT_X + i * slot + slot / 2
  const y = (v: number) => BASE_Y - (Math.min(Math.max(0, v), 100) / 100) * (BASE_Y - TOP_Y)

  return (
    <svg
      viewBox="0 0 1080 190"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="Utilisation by discipline"
    >
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#7B8FA0">
        {TICKS.map((t) => (
          <text key={t} x={PLOT_X - 5} y={y(t) + 3} textAnchor="end">
            {t}
          </text>
        ))}
      </g>

      {TICKS.map((t) => (
        <line
          key={t}
          x1={PLOT_X}
          y1={y(t)}
          x2={PLOT_R}
          y2={y(t)}
          stroke={t === 0 ? '#0D1B26' : '#E4EAEF'}
          strokeWidth={t === 0 ? 1.5 : 1}
        />
      ))}

      {bars.map((b, i) =>
        b.pct === null ? null : (
          <rect
            key={b.label}
            x={centre(i) - barW / 2}
            y={y(b.pct)}
            width={barW}
            height={BASE_Y - y(b.pct)}
            fill="#1D6FA5"
          >
            <title>{`${b.label} — ${b.pct.toFixed(1)}%`}</title>
          </rect>
        ),
      )}

      {/* the reading, above its own column — the figure is the point of the
          panel, and putting it on the bar saves reading it off the axis */}
      <g
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fontWeight="600"
        fill="#0D1B26"
        textAnchor="middle"
      >
        {bars.map((b, i) => (
          <text key={b.label} x={centre(i)} y={(b.pct === null ? BASE_Y : y(b.pct)) - 5}>
            {b.pct === null ? '—' : `${b.pct.toFixed(1)}%`}
          </text>
        ))}
      </g>

      <g
        fontFamily="Archivo, sans-serif"
        fontWeight="700"
        fontSize="10.5"
        fill="#4B5F6E"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        {bars.map((b, i) => (
          <text key={b.label} x={centre(i)} y={BASE_Y + 17}>
            {b.label}
          </text>
        ))}
      </g>
    </svg>
  )
}
