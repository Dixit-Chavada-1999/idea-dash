import { useEffect, useState } from 'react'
import { assistantApi, type AuditResponse } from '../api/assistant'
import type { Widget } from '../contracts/assistant'

/**
 * "Show your work" — what actually happened, not a claim about it.
 *
 * The wireframe printed *"Divergence 0.0% — within the 1% tolerance. Z-score
 * 0.4 against the 30-day baseline"* under a note admitting the values were
 * illustrative. Those numbers were invented to look like verification, which is
 * the worst thing a trust surface can do: it is read as evidence precisely
 * because it is specific.
 *
 * Everything here is recorded. The provenance travels on the widget; the steps
 * are fetched from `assistant_audit`, which was written when the answer was
 * produced. Where a figure cannot be justified, this drawer says so instead.
 */
export function QueryDrawer({
  widget,
  messageId,
  onClose,
}: {
  widget: Widget
  messageId: number | null
  onClose: () => void
}) {
  const q = widget.query
  const [audit, setAudit] = useState<AuditResponse | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // no id means the turn was never persisted; that is known during render and
    // does not need an effect to discover
    if (!messageId) return
    let cancelled = false
    assistantApi
      .audit(messageId)
      .then((a) => !cancelled && setAudit(a))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [messageId])

  const auditError = !messageId
    ? 'This answer was not stored, so there is no trail to show.'
    : failed
      ? 'The audit rows for this answer could not be read.'
      : null

  return (
    <div className="drawer-back" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        role="dialog"
        aria-label={`How ${widget.title} was produced`}
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

          <span className="kv">Metric (registry id)</span>
          <div className="code-line">{q.metric}</div>

          <span className="kv">Definition</span>
          <div className="code-line">{q.definition}</div>

          <span className="kv">Source</span>
          <div className="code-line">
            {q.source === 'metric'
              ? 'verified SQL — the query the dashboard runs, written and checked by a person'
              : 'allow-listed single-table aggregate, assembled by the query executor'}
          </div>

          <span className="kv">Period</span>
          <div className="code-line">
            {q.window
              ? `${q.window.from} → ${q.window.to}${q.window.partial ? ' (still running — cut at today)' : ''}`
              : 'none — this is a standing figure with no window'}
          </div>

          {q.plan && (
            <>
              <span className="kv">The query that ran</span>
              <div className="filt">
                <div>
                  <code>table = {q.plan.table}</code>
                </div>
                {q.plan.method && (
                  <div>
                    <code>
                      {q.plan.method}
                      {q.plan.valueColumn ? `(${q.plan.valueColumn})` : '(*)'}
                    </code>
                  </div>
                )}
                {q.plan.groupBy && (
                  <div>
                    <code>
                      group by {q.plan.groupBy}
                      {q.plan.grain ? ` per ${q.plan.grain}` : ''}
                    </code>
                  </div>
                )}
                {q.plan.columns && (
                  <div>
                    <code>select {q.plan.columns.join(', ')}</code>
                  </div>
                )}
                {q.plan.filters.map((f, i) => (
                  <div key={i}>
                    <code>
                      where {f.column} {f.operator}
                      {f.value === undefined ? '' : ` ${f.value}`}
                    </code>
                  </div>
                ))}
                {q.plan.orderBy && (
                  <div>
                    <code>order by {q.plan.orderBy}</code>
                  </div>
                )}
                {q.plan.limit !== undefined && (
                  <div>
                    <code>limit {q.plan.limit}</code>
                  </div>
                )}
              </div>

              {q.plan.resolved && (
                <>
                  <span className="kv">Filled in afterwards, by a second read</span>
                  <div className="filt">
                    {q.plan.resolved.map((r) => (
                      <div key={r}>
                        <code>{r}</code>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink-3)', margin: 0 }}>
                    These columns are not in the query above and were not joined to it. The rows came back carrying
                    an id, and one further allow-listed read exchanged those ids for the values shown.
                  </p>
                </>
              )}
              <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink-3)', margin: 0 }}>
                This is the spec after the allow-list finished with it, not what was proposed. Every table, column
                and operator above was checked against a fixed list before anything ran.
              </p>
            </>
          )}

          {Object.keys(q.meta).length > 0 && (
            <>
              <span className="kv">Population ({Object.keys(q.meta).length})</span>
              <div className="filt">
                {Object.entries(q.meta).map(([k, v]) => (
                  <div key={k}>
                    <code>
                      {k} = {typeof v === 'number' ? v.toLocaleString('en-GB') : v}
                    </code>
                  </div>
                ))}
              </div>
            </>
          )}

          {q.rating && (
            <>
              <span className="kv">Rating — IDEA&rsquo;s own threshold</span>
              <div className="code-line">
                {q.rating.band.toUpperCase()} · {q.rating.note}
              </div>
            </>
          )}

          {q.caveat && (
            <>
              <span className="kv">What this figure does not cover</span>
              <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink-2)', margin: 0 }}>{q.caveat}</p>
            </>
          )}

          <span className="kv">
            What ran{audit ? ` — ${audit.totalMs}ms total` : ''}
          </span>
          {audit ? (
            <div className="filt">
              {audit.steps.map((s, i) => (
                <div key={i}>
                  <code>
                    {s.tool} · {s.ms}ms
                    {s.rows !== null ? ` · ${s.rows} rows` : ''}
                  </code>
                  {(s.detail ?? s.error) && <em>{s.error ?? s.detail}</em>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink-3)', margin: 0 }}>
              {auditError ?? 'Reading the audit rows…'}
            </p>
          )}

          <div
            className="wg-note"
            style={{ marginTop: 18, borderTop: '1px solid var(--color-rule-2)', paddingTop: 11 }}
          >
            {q.source === 'metric' ? (
              <>
                These rows were written when the answer was produced, not reconstructed now. The figure came from
                the same query the operations dashboard renders — no model computed it, and no model saw a row of
                the result.
              </>
            ) : (
              <>
                These rows were written when the answer was produced, not reconstructed now. No registry metric
                answered this question, so a model proposed the query above — but it chose only from the
                allow-list, and it never saw a row of what came back. This carries less weight than a registered
                figure: the arithmetic is the database&rsquo;s, the question it answers is the model&rsquo;s
                reading of yours.
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
