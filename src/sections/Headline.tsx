import { dashboardApi } from '../api/dashboard'
import { useBasis } from '../basis/context'
import { CalcTip } from '../components/CalcTip'
import { OutcomePies } from '../components/OutcomePies'
import { SectionHead } from '../components/Panel'
import { Sparkline } from '../components/Sparkline'
import type { Kpi } from '../contracts/dashboard'
import { useApi } from '../hooks/useApi'

const CONFIDENCE_CHIP: Record<Kpi['confidence'], { label: string; tone: string }> = {
  measured: { label: 'MEASURED', tone: '' },
  partial: { label: 'PARTIAL', tone: 'bound' },
  unavailable: { label: 'NO DATA', tone: 'plain' },
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const chip = CONFIDENCE_CHIP[kpi.confidence]

  return (
    <div className="kpi">
      <div className="kpi-hd">
        <h3>{kpi.label}</h3>
        {/* Two different questions side by side: the rating says whether the figure
            is good, the confidence chip says how much to trust it. Only three of
            the six map to a band IDEA has set — the rest carry no dot. */}
        {kpi.rating && <span className={`rag rag-${kpi.rating.band}`} title={kpi.rating.note} />}
        <span className={chip.tone ? `chip ${chip.tone}` : 'chip'}>{chip.label}</span>
        {kpi.calc && <CalcTip text={kpi.calc} />}
      </div>
      <div className="kpi-body">
        <div className={kpi.confidence === 'unavailable' ? 'big muted' : 'big'}>{kpi.value}</div>

        {(kpi.delta || kpi.meta?.length) && (
          <div className="meta">
            {kpi.delta && <span className={`delta ${kpi.delta.dir}`}>{kpi.delta.text}</span>}
            {kpi.meta?.map((m, i) => <span key={`${kpi.key}-meta-${i}`}>{m}</span>)}
          </div>
        )}

        {/* Present on conversion only. The rate above is the headline; these say
            what it is made of — and the amber wedge, fat on the current cohort
            and absent on the lapsed one, is why the rate is measured over
            decided enquiries rather than all of them. */}
        {kpi.outcome && (
          <OutcomePies
            window={kpi.outcome.window}
            current={kpi.outcome.current}
            prior={kpi.outcome.prior}
          />
        )}

        {/* Only the date-stamped metrics carry a series. `plots` is always shown:
            three of them answer a different question from the figure above, and
            an unlabelled line would be read as that figure's own history. */}
        {kpi.series && (
          <>
            <Sparkline
              values={kpi.series.values}
              keys={kpi.series.keys}
              unit={kpi.series.unit}
            />
            <div className="meta">
              <span>{kpi.series.plots}</span>
              <span>
                {kpi.series.label} · complete months only
              </span>
            </div>
          </>
        )}

        {kpi.rating && <div className="rag-note">{kpi.rating.note}</div>}

        {kpi.caveat && <div className="caveat">{kpi.caveat}</div>}
      </div>
    </div>
  )
}

/** Six placeholder cards so the grid does not jump when the figures arrive. */
function Skeleton() {
  return (
    <div className="kpis">
      {Array.from({ length: 6 }, (_, i) => (
        <div className="kpi" key={i}>
          <div className="kpi-hd">
            <h3>Loading</h3>
          </div>
          <div className="kpi-body">
            <div className="big muted">—</div>
            <div className="meta">
              <span>reading the reporting database…</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Headline() {
  const { basis } = useBasis()
  const state = useApi(() => dashboardApi.headline(basis))

  return (
    <section className="sec fade" id="headline" style={{ animationDelay: '.05s' }}>
      <SectionHead
        title="Headline"
        clause="§5.1 – §5.6"
        right={
          state.status === 'ready'
            ? `Measured over ${state.data.period.label}`
            : 'Live figures from the reporting database'
        }
      />

      {state.status === 'loading' && <Skeleton />}

      {state.status === 'error' && (
        <div className="panel">
          <div className="panel-hd">
            <h3>Figures unavailable</h3>
          </div>
          <div className="panel-body">
            <div className="gate-err">{state.message}</div>
            <p className="wg-note" style={{ marginTop: 12, borderTop: 0, paddingTop: 0 }}>
              Nothing is shown rather than a stale or estimated number.
            </p>
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <div className="kpis">
            {state.data.kpis.map((k) => (
              <KpiCard kpi={k} key={k.key} />
            ))}
          </div>

          <div className="footnote" style={{ marginTop: 16 }}>
            <span className="lead">What these figures rest on</span>
            <p>
              <strong className="num">{state.data.integrity.projectsActive.toLocaleString('en-GB')}</strong> active
              projects of {state.data.integrity.projectsTotal.toLocaleString('en-GB')} on file.{' '}
              <strong className="num">
                £{Math.round(state.data.integrity.valueRecoveredFromCsv).toLocaleString('en-GB')}
              </strong>{' '}
              of project value sits in the migration&rsquo;s raw import column and is counted here — summing the
              live column alone would miss it.{' '}
              <strong className="num">{state.data.integrity.projectsWithoutValue}</strong> projects carry no value
              in either column, and{' '}
              <strong className="num">{state.data.integrity.orphanClients}</strong> reference a client that no
              longer exists.
            </p>
            <div className="keyline">
              <span>
                <b>Basis</b> no services-only / gross split is applied.{' '}
                {state.data.integrity.procurementProjects > 0 ? (
                  <>
                    The numeric procurement columns are empty, but{' '}
                    <strong className="num">{state.data.integrity.procurementProjects}</strong> projects carry £
                    {Math.round(state.data.integrity.procurementValue).toLocaleString('en-GB')} in{' '}
                    <code>procurement_global</code> — enough to build one
                  </>
                ) : (
                  <>No procurement is recorded anywhere in this data</>
                )}
              </span>
              <span>
                <b>Read</b> {new Date(state.data.generatedAt).toLocaleString('en-GB')}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
