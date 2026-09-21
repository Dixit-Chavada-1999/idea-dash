import { useState } from 'react'
import { dashboardApi } from '../api/dashboard'
import { CalcTip } from '../components/CalcTip'
import { Pill, SectionHead } from '../components/Panel'
import type { CheckSeverity, ChecksResponse } from '../contracts/dashboard'
import { useApi } from '../hooks/useApi'

type TabId = 'po' | 'inv'

const num = (n: number) => Math.round(n).toLocaleString('en-GB')

const SEVERITY: Record<CheckSeverity, { label: string; tone: 'red' | 'amber' | 'grey' }> = {
  escalate: { label: 'Escalate', tone: 'red' },
  rule_needed: { label: 'Rule needed', tone: 'amber' },
  confirm: { label: 'Confirm', tone: 'amber' },
  review: { label: 'Review', tone: 'grey' },
}

/** Ribbon colour matches the severity, so the table scans down the left edge. */
const RIBBON: Record<CheckSeverity, string> = {
  escalate: 'rib-red',
  rule_needed: 'rib-amber',
  confirm: 'rib-amber',
  review: 'rib-grey',
}

function date(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function PendingPoTable({ data }: { data: ChecksResponse['pendingPo'] }) {
  const shown = data.rows.filter((r) => !r.suppressed)
  const suppressed = data.rows.filter((r) => r.suppressed)

  return (
    <>
      <div className="scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 96 }}>Code</th>
              <th>Project</th>
              <th className="n">Budget</th>
              <th className="n">Actual</th>
              <th className="n">Awarded</th>
              <th style={{ width: 110 }}>Start date</th>
              <th style={{ width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr className={`rib ${RIBBON[r.severity]}`} key={r.code}>
                <td>
                  <span className="code">{r.code}</span>
                </td>
                <td>{r.name}</td>
                <td className="n">{num(r.budget)}</td>
                <td className="n">{num(r.actual)}</td>
                <td className="n">{r.awarded}</td>
                <td className="n">{date(r.startDate)}</td>
                <td>
                  <Pill label={SEVERITY[r.severity].label} tone={SEVERITY[r.severity].tone} />
                </td>
              </tr>
            ))}

            <tr className="total">
              <td colSpan={2}>Total exposure — {data.shownCount} projects</td>
              <td className="n">{num(data.totals.budget)}</td>
              <td className="n">{num(data.totals.actual)}</td>
              <td className="n">—</td>
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel-foot">
        {suppressed.length > 0 && (
          <>
            <Pill label={`Suppressed ${suppressed.length}`} tone="green" />
            &nbsp;
            {suppressed.map((r) => `${r.code} — ${r.suppressedBecause}`).join('; ')}. Suppressions are counted and
            shown on the face of the report, never removed silently.
            <br />
          </>
        )}
        {data.olderCount > 0 && (
          <>
            <Pill label={`+${data.olderCount} older`} tone="amber" />
            &nbsp;
            {data.olderCount} further won projects, started more than 12 months ago, also carry no PO — a
            data-backfill gap rather than current exposure, so they're counted here and not listed row by row.
            <br />
          </>
        )}
        <strong>Rule:</strong> {data.rule}
      </div>
    </>
  )
}

function UnplannedTable({ data }: { data: ChecksResponse['unplannedInvoicing'] }) {
  const held = data.withoutGateCount - data.rows.length
  // projects the old planned-month-only rule flagged that do have a forecast
  const movedOn = data.planOnlyCount - data.rows.length

  return (
    <>
      <div className="scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 96 }}>Code</th>
              <th>Project</th>
              <th className="n">Invoiced</th>
              <th className="n">Awarded</th>
              <th className="n">Outstanding</th>
              <th className="n">Budget</th>
              <th className="n">Actual</th>
              <th style={{ width: 90 }}>Also §6.1</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr className="rib rib-amber" key={r.code}>
                <td>
                  <span className="code">{r.code}</span>
                </td>
                <td>{r.name}</td>
                <td className="n">{r.invoicedPct.toFixed(0)}%</td>
                <td className="n">{num(r.awarded)}</td>
                <td className="n">{num(r.outstanding)}</td>
                <td className="n">{num(r.budget)}</td>
                <td className="n">{num(r.actual)}</td>
                <td>
                  <Pill label={r.alsoPendingPo ? 'Yes' : 'No'} tone={r.alsoPendingPo ? 'amber' : 'grey'} />
                </td>
              </tr>
            ))}

            <tr className="total">
              <td colSpan={4}>Outstanding across {data.rows.length} projects</td>
              <td className="n">{num(data.outstandingTotal)}</td>
              <td />
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel-foot">
        <strong>Rule:</strong> {data.rule}
        {held > 0 && (
          <>
            {' '}
            Without the money-outstanding gate the rule returns <strong className="num">
              {data.withoutGateCount}
            </strong>{' '}
            rows — the other {held} have finished invoicing and owe nothing.{' '}
            <strong>Open decision:</strong> should the gate stay?
          </>
        )}
        {/* The correction is disclosed rather than showing up as an unexplained
            drop in the row count between one run and the next. */}
        {movedOn > 0 && (
          <>
            <br />
            <strong>Reading the planned month alone returned {data.planOnlyCount} rows.</strong> The other{' '}
            {movedOn} have an invoice scheduled — their milestone was moved, and the later date sits in{' '}
            <code>forecast_month</code> rather than <code>month</code>. Both columns are populated on every
            milestone and disagree on 92 of them.
          </>
        )}
      </div>
    </>
  )
}

export function StandingChecks() {
  const [tab, setTab] = useState<TabId>('po')
  const state = useApi(() => dashboardApi.checks())

  const poCount = state.status === 'ready' ? state.data.pendingPo.shownCount : null
  const invCount = state.status === 'ready' ? state.data.unplannedInvoicing.rows.length : null

  return (
    <section className="sec fade" id="checks" style={{ animationDelay: '.15s' }}>
      <SectionHead
        title="Standing checks"
        clause="§6.1 · §6.2"
        /* "full output" is a claim about this table, so it counts what the rule
           returned rather than asserting nothing was dropped */
        right={
          state.status === 'ready'
            ? `Full mechanical output — all ${state.data.pendingPo.rows.length + state.data.unplannedInvoicing.rows.length} rows shown or named, no triage step exists`
            : 'Full mechanical output — no triage step exists in the pipeline'
        }
      />

      <div className="panel">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            type="button"
            aria-selected={tab === 'po'}
            onClick={() => setTab('po')}
          >
            Pending PO {poCount !== null && <span className="count">{poCount}</span>}
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={tab === 'inv'}
            onClick={() => setTab('inv')}
          >
            Unplanned invoicing {invCount !== null && <span className="count q">{invCount}</span>}
          </button>
          {/* the active tab's own rule, as a formula — same affordance as every
              other panel's header, just outside a <button> since the tabs
              already are one and a button cannot nest inside a button */}
          {state.status === 'ready' && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <CalcTip
                text={tab === 'po' ? state.data.pendingPo.calc : state.data.unplannedInvoicing.calc}
              />
            </span>
          )}
        </div>

        {state.status === 'loading' && (
          <div className="panel-body">
            <p style={{ margin: 0, color: 'var(--color-ink-3)' }}>Running the checks…</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="panel-body">
            <div className="gate-err">{state.message}</div>
          </div>
        )}

        {state.status === 'ready' &&
          (tab === 'po' ? (
            <PendingPoTable data={state.data.pendingPo} />
          ) : (
            <UnplannedTable data={state.data.unplannedInvoicing} />
          ))}
      </div>
    </section>
  )
}
