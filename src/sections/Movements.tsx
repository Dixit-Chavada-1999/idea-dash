import { dashboardApi } from '../api/dashboard'
import { Panel, Pill, SectionHead } from '../components/Panel'
import type { MovementRow } from '../contracts/dashboard'
import { useApi } from '../hooks/useApi'

function value(v: number, unit: MovementRow['unit']) {
  if (unit === 'money') return `£${Math.round(v).toLocaleString('en-GB')}`
  if (unit === 'percent') return `${v.toFixed(1)}%`
  return Math.round(v).toLocaleString('en-GB')
}

function delta(r: MovementRow) {
  const sign = r.change >= 0 ? '+' : '−'
  const size =
    r.unit === 'money'
      ? `£${Math.abs(Math.round(r.change)).toLocaleString('en-GB')}`
      : Math.abs(Math.round(r.change)).toLocaleString('en-GB')
  const pct = r.changePct === null ? '' : ` · ${sign}${Math.abs(r.changePct).toFixed(1)}%`
  return `${sign}${size}${pct}`
}

export function Movements() {
  const state = useApi(() => dashboardApi.movements(7))

  return (
    <section className="sec fade" id="movements" style={{ animationDelay: '.2s' }}>
      <SectionHead
        title="Movements"
        clause="§8"
        /* the metric count is server-side; a typed one goes stale when a fourth
           becomes rebuildable */
        right={
          state.status === 'ready'
            ? `Rebuilt from ${state.data.rows.length} date-stamped facts — no run history is kept`
            : 'Rebuilt from date-stamped facts — no run history is kept'
        }
      />

      {state.status === 'loading' && (
        <div className="panel">
          <div className="panel-body">
            <p style={{ margin: 0, color: 'var(--color-ink-3)' }}>Rebuilding the comparison…</p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="panel">
          <div className="panel-body">
            <div className="gate-err">{state.message}</div>
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <Panel
          title={`${state.data.window.from} → ${state.data.window.to}`}
          right={
            <>
              Threshold <b>&gt;{state.data.threshold.pct}%</b>
            </>
          }
          padded={false}
          calc={
            'Each metric is re-run twice, at two different end dates -- "now" and "a week ago" --\n' +
            'against the same query, not read from any stored history\n\n' +
            'Orders won YTD      -> dated on PO date\n' +
            'Enquiries YTD       -> dated on enquiry date\n' +
            'Cost booked, all time -> dated on the timesheet date\n\n' +
            'Material = |change| > threshold %   -- flags the row, keeps no ruling on it'
          }
          foot={
            <>
              {/* count from the rows, not typed in: the metric list is server-side
                  and a fourth would leave a hardcoded "three" lying. */}
              <strong>Nothing records what was reported last week.</strong> The{' '}
              {state.data.rows.length} above{' '}
              {state.data.rows.length === 1 ? 'is' : 'are'} recomputed instead — each rests on a date of its own,
              a purchase order on its PO date, an enquiry on its enquiry date, a timesheet line on its day, so the
              figure as it stood on a past date can be worked out exactly.
              <br />
              <br />
              A person&rsquo;s ruling on a delta is not kept. Recording one would mean storing it, and nothing
              outside sign-in is stored.
            </>
          }
        >
          <div className="scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="n">A week ago</th>
                  <th className="n">Now</th>
                  <th className="n">Δ</th>
                  <th style={{ width: 130 }}>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {state.data.rows.map((r) => (
                  <tr className={`rib ${r.classification === 'material' ? 'rib-amber' : 'rib-grey'}`} key={r.key}>
                    <td>{r.label}</td>
                    <td className="n">{value(r.previous, r.unit)}</td>
                    <td className="n">{value(r.current, r.unit)}</td>
                    <td className="n">{delta(r)}</td>
                    <td>
                      <Pill
                        label={r.classification === 'material' ? 'Material' : 'Within noise'}
                        tone={r.classification === 'material' ? 'amber' : 'grey'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="unavailable">
            <span className="lead">Cannot be rebuilt from this data</span>
            {state.data.unavailable.map((u) => (
              <div className="unavailable-row" key={u.label}>
                <span className="k">{u.label}</span>
                <span className="r">{u.reason}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </section>
  )
}
