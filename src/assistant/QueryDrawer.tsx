import type { Widget } from './types'

/**
 * "Show your work" — the drawer that makes a number auditable.
 * Everything shown here comes from the widget's own provenance block.
 */
export function QueryDrawer({ widget, onClose }: { widget: Widget; onClose: () => void }) {
  const q = widget.query
  const agg = [
    q.aggregate.method,
    q.aggregate.valueColumn && `of ${q.aggregate.valueColumn}`,
    q.aggregate.groupBy && `grouped by ${q.aggregate.groupBy}`,
    q.aggregate.topN && `top ${q.aggregate.topN}`,
    q.aggregate.sort,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="drawer-back" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        role="dialog"
        aria-label={`Query behind ${widget.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-hd">
          <h3>Show your work</h3>
          <button className="mini" type="button" onClick={onClose}>
            close
          </button>
        </div>

        <div className="drawer-body">
          <span className="kv">Widget</span>
          <div className="code-line">{widget.title}</div>

          {q.metric && (
            <>
              <span className="kv">Metric (registry id)</span>
              <div className="code-line">{q.metric}</div>
            </>
          )}

          <span className="kv">Table</span>
          <div className="code-line">{q.table}</div>

          <span className="kv">Aggregation</span>
          <div className="code-line">{agg}</div>

          {q.dateColumn && (
            <>
              <span className="kv">Date column</span>
              <div className="code-line">{q.dateColumn}</div>
            </>
          )}

          <span className="kv">Filters applied ({q.filters.length})</span>
          <div className="filt">
            {q.filters.map((f, i) => (
              <div key={i}>
                <code>
                  {f.column} {f.operator} {f.value}
                </code>
                {f.rationale && <em>{f.rationale}</em>}
              </div>
            ))}
          </div>

          {q.limit && (
            <>
              <span className="kv">Row limit</span>
              <div className="code-line">{q.limit}</div>
            </>
          )}

          <span className="kv">Verification</span>
          <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink-2)', margin: 0 }}>
            The aggregate was re-run and compared against an independent filtered count that shares no code path.
            Divergence 0.0% — within the 1% tolerance. Z-score 0.4 against the 30-day baseline: not an anomaly.
          </p>

          <div
            className="wg-note"
            style={{ marginTop: 18, borderTop: '1px solid var(--color-rule-2)', paddingTop: 11 }}
          >
            Wireframe — these values are illustrative. In the live build this drawer reads the actual filters and
            rows the query executor used.
          </div>
        </div>
      </aside>
    </div>
  )
}
