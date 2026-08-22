import type { Widget } from './types'

const fmt = {
  money: (v: number) => `£${v.toLocaleString('en-GB')}`,
  hours: (v: number) => v.toLocaleString('en-GB'),
  count: (v: number) => v.toLocaleString('en-GB'),
}

/** Horizontal bars — readable at any widget width, unlike a vertical axis. */
function Bars({ w }: { w: Extract<Widget, { kind: 'bar' }> }) {
  const max = Math.max(...w.bars.map((b) => b.value))
  return (
    <>
      {w.bars.map((b) => (
        <div className="hbar" key={b.label}>
          <div className="l">
            <span className="k">{b.label}</span>
            <span className="v">{fmt[w.format](b.value)}</span>
          </div>
          <div className="t">
            <div
              className="f"
              style={{ width: `${(b.value / max) * 100}%`, background: b.colour ?? '#1D6FA5' }}
            />
          </div>
        </div>
      ))}
      {w.axisLabel && <div className="wg-note">{w.axisLabel}</div>}
    </>
  )
}

function Line({ w }: { w: Extract<Widget, { kind: 'line' }> }) {
  const H = 92
  const W = 320
  const PAD = 4
  const vals = w.points.map((p) => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1

  const pts = w.points
    .map((p, i) => {
      const x = PAD + (i / (w.points.length - 1)) * (W - PAD * 2)
      const y = PAD + (1 - (p.value - min) / span) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const last = w.points[w.points.length - 1]

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true">
        <polygon points={`${PAD},${H - PAD} ${pts} ${W - PAD},${H - PAD}`} fill="#E7F1F8" />
        <polyline
          points={pts}
          fill="none"
          stroke="#1D6FA5"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="wg-note">
        {w.points[0].label} → {last.label} · latest{' '}
        <strong className="num">{fmt[w.format](last.value)}</strong>
      </div>
    </>
  )
}

function Table({ w }: { w: Extract<Widget, { kind: 'table' }> }) {
  return (
    <div className="scroll">
      <table className="tbl">
        <thead>
          <tr>
            {w.columns.map((c) => (
              <th key={c.key} className={c.numeric ? 'n' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {w.rows.map((r, i) => (
            <tr key={i}>
              {w.columns.map((c) => (
                <td key={c.key} className={c.numeric ? 'n' : undefined}>
                  {c.key === 'code' ? <span className="code">{r[c.key]}</span> : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Props = {
  widget: Widget
  flash: boolean
  onShowQuery: (w: Widget) => void
}

export function WidgetCard({ widget, flash, onShowQuery }: Props) {
  // a 3-column card cannot hold three labelled buttons without wrapping the header
  const tight = widget.w <= 4

  return (
    <div
      className={['wg', tight && 'tight', flash && 'flash'].filter(Boolean).join(' ')}
      id={`wg-${widget.id}`}
      style={{ gridColumn: `span ${widget.w}` }}
    >
      <div className="wg-hd">
        <h3>{widget.title}</h3>
        {widget.chip && <span className="chip plain">{widget.chip}</span>}
        <span className="tools">
          {/* on a narrow card the verify signal moves into the body, so the title fits */}
          {!tight && (
            <button type="button" className="ok" title="Re-aggregated and matched an independent count">
              ✓ verified
            </button>
          )}
          <button type="button" onClick={() => onShowQuery(widget)} title="Show the query behind this number">
            query
          </button>
          {!tight && (
            <button type="button" title="Export the rows behind this widget">
              csv
            </button>
          )}
        </span>
      </div>

      <div className={widget.kind === 'kpi' ? 'wg-body wg-kpi' : 'wg-body'}>
        {widget.kind === 'kpi' && (
          <>
            <div className="v">{widget.value}</div>
            <div className="m">
              {widget.delta && <span className={`delta ${widget.delta.dir}`}>{widget.delta.text}</span>}
              {widget.note && <span>{widget.note}</span>}
            </div>
            {tight && <div className="wg-verified">✓ verified · independent count</div>}
          </>
        )}
        {widget.kind === 'bar' && <Bars w={widget} />}
        {widget.kind === 'line' && <Line w={widget} />}
        {widget.kind === 'table' && <Table w={widget} />}
      </div>
    </div>
  )
}
