import { useState } from 'react'
import type { Widget } from '../contracts/assistant'

const fmt = (v: number, unit: string) =>
  unit === 'money'
    ? `£${Math.round(v).toLocaleString('en-GB')}`
    : unit === 'percent'
      ? `${v.toFixed(1)}%`
      : Math.round(v).toLocaleString('en-GB')

/** Horizontal bars — readable at any widget width, unlike a vertical axis. */
function Bars({ w }: { w: Extract<Widget, { kind: 'bar' }> }) {
  const max = Math.max(...w.bars.map((b) => b.value), 1)
  return (
    <>
      {w.bars.map((b) => (
        <div className="hbar" key={b.label}>
          <div className="l">
            <span className="k">{b.label}</span>
            <span className="v">{fmt(b.value, w.format)}</span>
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

/**
 * Ten, because a table under a chat answer is read as an answer rather than
 * browsed as a report. Nine hundred rows dumped under a question buries the
 * findings, the follow-up chips and every other widget below a scroll nobody
 * asked for.
 */
const PAGE_SIZE = 10

/**
 * Rows, one page at a time.
 *
 * Every cell arrives already formatted — currency, dates and rounding are the
 * server's, so this renders strings and does no arithmetic. The header stays
 * put while the body scrolls, because a list is read by scanning down one
 * column and a header that scrolls away makes that impossible.
 *
 * Paging is local to the page: the server has already sent every row it is
 * going to send, and the count beside the table says when that is fewer than
 * matched. Fetching per page would mean re-running the query for each click,
 * which for a figure quoted in a meeting could quietly return different rows
 * than the ones the question was answered with.
 */
function Rows({ w }: { w: Extract<Widget, { kind: 'table' }> }) {
  const [page, setPage] = useState(0)

  // a redeployed answer or a new question can shorten the list under a page
  // that no longer exists; clamping on render beats an effect that flashes
  const pages = Math.max(1, Math.ceil(w.rows.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const start = current * PAGE_SIZE
  const shown = w.rows.slice(start, start + PAGE_SIZE)

  if (w.rows.length === 0) {
    return <div className="wg-note">No rows matched.</div>
  }

  return (
    <>
      <div className="wg-table">
        <table>
          <thead>
            <tr>
              {w.columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'r' : undefined}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              // rows carry no id of their own; order is the server's and is stable
              <tr key={start + i}>
                {w.columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'r' : undefined}>
                    {row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="wg-pager">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 0}>
            prev
          </button>
          <span>
            {/* the row range, not just the page number — "11–20 of 946" says how
                far through the list a reader is; "page 2 of 95" does not */}
            {(start + 1).toLocaleString('en-GB')}–{Math.min(start + PAGE_SIZE, w.rows.length).toLocaleString('en-GB')} of{' '}
            {w.rows.length.toLocaleString('en-GB')}
          </span>
          <button type="button" onClick={() => setPage(current + 1)} disabled={current >= pages - 1}>
            next
          </button>
        </div>
      )}

      {w.note && <div className="wg-note">{w.note}</div>}
    </>
  )
}

type Props = {
  widget: Widget
  flash: boolean
  onShowQuery: (w: Widget) => void
}

/**
 * One widget.
 *
 * The wireframe's header carried a "✓ verified" button and a csv export, both
 * decorative. The tick claimed the figure had been re-aggregated and matched
 * against an independent count, which nothing did; it is gone rather than
 * reworded, because a verification badge that means nothing is worse than none.
 * What replaced it is `query`, which now opens the actual audit trail.
 */
export function WidgetCard({ widget, flash, onShowQuery }: Props) {
  // a 3-column card cannot hold labelled buttons without wrapping the header
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
          <button
            type="button"
            onClick={() => onShowQuery(widget)}
            className="tip-left"
            data-tip="Show how this figure was produced — the query, the population and every step that ran"
            aria-label="Show how this figure was produced"
          >
            query
          </button>
        </span>
      </div>

      <div className={widget.kind === 'kpi' ? 'wg-body wg-kpi' : 'wg-body'}>
        {widget.kind === 'kpi' ? (
          <>
            <div className="v">{widget.value}</div>
            {widget.note && (
              <div className="m">
                <span>{widget.note}</span>
              </div>
            )}
          </>
        ) : widget.kind === 'table' ? (
          <Rows w={widget} />
        ) : (
          <Bars w={widget} />
        )}
      </div>
    </div>
  )
}
