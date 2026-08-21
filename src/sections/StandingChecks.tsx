import { useState } from 'react'
import { Pill, SectionHead } from '../components/Panel'
import {
  PENDING_PO,
  PENDING_PO_TOTAL,
  UNPLANNED_INVOICING,
  renderCell,
  type CheckRow,
} from '../data/console'

type TabId = 'po' | 'inv'

function CheckRows({ rows }: { rows: CheckRow[] }) {
  return (
    <>
      {rows.map((r) => (
        <tr className={`rib rib-${r.ribbon}`} key={r.code.v}>
          <td>
            <span className={r.code.illus ? 'code illus' : 'code'} title={r.code.illus ? 'Illustrative' : undefined}>
              {r.code.v}
            </span>
          </td>
          <td>
            {renderCell(r.project)}
            {r.note && <span className="rownote">{r.note}</span>}
          </td>
          {r.figures.map((f, i) => (
            <td className="n" key={i}>
              {renderCell(f)}
            </td>
          ))}
          <td>
            <Pill label={r.pill.label} tone={r.pill.tone} />
          </td>
        </tr>
      ))}
    </>
  )
}

export function StandingChecks() {
  const [tab, setTab] = useState<TabId>('po')

  return (
    <section className="sec fade" id="checks" style={{ animationDelay: '.15s' }}>
      <SectionHead
        title="Standing checks"
        clause="§6.1 · §6.2"
        right="Full mechanical output — no triage step exists in the pipeline"
      />

      <div className="panel">
        <div className="tabs" role="tablist">
          <button
            id="tabPO"
            role="tab"
            type="button"
            aria-selected={tab === 'po'}
            aria-controls="panePO"
            onClick={() => setTab('po')}
          >
            Pending PO <span className="count">23</span>
          </button>
          <button
            id="tabINV"
            role="tab"
            type="button"
            aria-selected={tab === 'inv'}
            aria-controls="paneINV"
            onClick={() => setTab('inv')}
          >
            Unplanned invoicing <span className="count q">2</span>
          </button>
        </div>

        {tab === 'po' && (
          <div id="panePO" role="tabpanel" aria-labelledby="tabPO">
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
                  <CheckRows rows={PENDING_PO} />
                  <tr className="total">
                    <td colSpan={2}>{PENDING_PO_TOTAL.label}</td>
                    {PENDING_PO_TOTAL.figures.map((f, i) => (
                      <td className="n" key={i}>
                        {renderCell(f)}
                      </td>
                    ))}
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              <Pill label="Suppressed 3" tone="green" /> &nbsp;Admin-only cost-centre splits 25120B / C / D, where
              the PO genuinely sits at parent 25120. Suppressions are counted and shown on the face of the report,
              never removed silently.
            </div>
          </div>
        )}

        {tab === 'inv' && (
          <div id="paneINV" role="tabpanel" aria-labelledby="tabINV">
            <div className="scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 96 }}>Code</th>
                    <th>Project</th>
                    <th className="n">Invoiced</th>
                    <th className="n">Awarded</th>
                    <th className="n">Budget</th>
                    <th className="n">Actual</th>
                    <th style={{ width: 110 }}>Also §6.1</th>
                  </tr>
                </thead>
                <tbody>
                  <CheckRows rows={UNPLANNED_INVOICING} />
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              Overlap with pending-PO is expected and labelled per row rather than reported twice.{' '}
              <strong>Open decision:</strong> should a zero-value gate apply here? A project with nothing awarded,
              budgeted or spent currently trips this on a technicality — 0% of nothing.
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

