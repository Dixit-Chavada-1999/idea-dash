import type { OutcomeCohort } from '../contracts/dashboard'

/**
 * The conversion cohort, drawn IDEA's way (their spec §7).
 *
 * Two pies side by side — prior-year equivalent on the left, current on the
 * right — each the three-way split of one cohort. Read together they show the
 * thing a single percentage cannot: the amber wedge is the enquiries still
 * undecided, and it is fat on the current period and almost absent on the
 * lapsed one. That gap is the reason the resolved rate exists.
 *
 * The colours are semantic and fixed by IDEA, not chosen here, and they must
 * not drift between the two charts or between runs — the whole comparison
 * rests on green meaning the same thing on both sides.
 */
const COLOUR = {
  won: '#0ca30c',
  pending: '#fab219',
  unsuccessful: '#d03b3b',
} as const

const LABEL = {
  won: 'Won',
  pending: 'Live / pending',
  unsuccessful: 'Unsuccessful',
} as const

type Bucket = keyof typeof COLOUR

const ORDER: Bucket[] = ['won', 'pending', 'unsuccessful']

const CX = 70
const CY = 70
const R = 62
const START = -Math.PI / 2

/** Below this a slice is the whole circle — an arc whose ends coincide draws nothing. */
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
 * Divider width for one slice — narrower on thin wedges.
 *
 * A fixed stroke erases a small slice entirely: the prior-year cohort is 2%
 * pending, whose rim is a couple of pixels across, and a 2px white edge each
 * side would leave nothing to see. Losing that wedge would lose the comparison.
 */
function strokeFor(fraction: number) {
  return Math.max(0.25, Math.min(2, (fraction * Math.PI * 2 * R) / 3))
}

function Pie({ cohort }: { cohort: OutcomeCohort }) {
  const total = cohort.won + cohort.pending + cohort.unsuccessful

  if (total === 0) {
    return (
      <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label={`${cohort.label} — no enquiries`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#D3DCE2" strokeWidth="2" strokeDasharray="4 5" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#7B8FA0">
          no enquiries
        </text>
      </svg>
    )
  }

  // start angle derived per slice rather than accumulated in a mutable
  const drawn = ORDER.map((key, i) => {
    const before = ORDER.slice(0, i).reduce((s, k) => s + cohort[k], 0)
    const fraction = cohort[key] / total
    const a0 = START + (before / total) * Math.PI * 2

    return {
      key,
      fraction,
      colour: COLOUR[key],
      full: fraction >= FULL,
      path: arcPath(a0, a0 + fraction * Math.PI * 2),
      stroke: strokeFor(fraction),
      title: `${LABEL[key]} — ${cohort[key]} of ${total} (${(fraction * 100).toFixed(1)}%)`,
    }
  })

  return (
    <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label={cohort.label}>
      {drawn
        .filter((s) => s.fraction > 0)
        .map((s) =>
          s.full ? (
            <circle key={s.key} cx={CX} cy={CY} r={R} fill={s.colour}>
              <title>{s.title}</title>
            </circle>
          ) : (
            <path key={s.key} d={s.path} fill={s.colour} stroke="#FFFFFF" strokeWidth={s.stroke}>
              <title>{s.title}</title>
            </path>
          ),
        )}
    </svg>
  )
}

const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(1)}%`)

function Cohort({ cohort }: { cohort: OutcomeCohort }) {
  const total = cohort.won + cohort.pending + cohort.unsuccessful

  return (
    <figure className="outcome-cohort">
      <Pie cohort={cohort} />
      <figcaption>
        <b>{pct(cohort.resolved)}</b>
        <span>{cohort.label}</span>
        {/* The counts, so the pie is readable without hovering it. Split over
            two lines rather than left to wrap: the card is narrow, and a break
            landing mid-pair reads as a different number. */}
        <span className="outcome-counts">
          {cohort.won} won · {cohort.pending} open · {cohort.unsuccessful} lost
        </span>
        <span className="outcome-counts">{total} raised</span>
      </figcaption>
    </figure>
  )
}

/**
 * Prior on the left, current on the right — the reading order IDEA specified,
 * so the eye moves from the settled cohort to the one still resolving.
 */
export function OutcomePies({
  window,
  current,
  prior,
}: {
  window: string
  current: OutcomeCohort
  prior: OutcomeCohort
}) {
  return (
    <div className="outcome">
      <div className="outcome-pies">
        <Cohort cohort={prior} />
        <Cohort cohort={current} />
      </div>
      <div className="outcome-legend">
        {ORDER.map((k) => (
          <span key={k}>
            <i className="sw" style={{ background: COLOUR[k] }} />
            {LABEL[k]}
          </span>
        ))}
        <span className="outcome-window">{window}</span>
      </div>
    </div>
  )
}
