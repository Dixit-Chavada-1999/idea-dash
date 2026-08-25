import { dashboardApi } from '../api/dashboard'
import { SectionHead } from '../components/Panel'
import { useApi } from '../hooks/useApi'

/** Placeholder cells so the strip holds its height while the checks run. */
function Skeleton() {
  return (
    <div className="strip">
      {Array.from({ length: 5 }, (_, i) => (
        <div className="chk" key={i}>
          <span className="k">Checking</span>
          <span className="v">
            <span className="dot" />—
          </span>
          <span className="n">reading the reporting database…</span>
        </div>
      ))}
    </div>
  )
}

export function Integrity() {
  const state = useApi(() => dashboardApi.integrity())

  return (
    <section className="sec fade" id="integrity">
      <SectionHead
        title="Ingestion & integrity"
        clause="§2 · §3 · §7"
        /* The old line claimed every check clears. Three of five do not today,
           and the figures render regardless — so it reports the count instead. */
        right={
          state.status === 'ready'
            ? state.data.checks.every((c) => c.status === 'ok')
              ? 'All five checks clear'
              : `${state.data.checks.filter((c) => c.status !== 'ok').length} of ${state.data.checks.length} checks need attention`
            : 'Measured against the reporting database'
        }
      />

      {state.status === 'loading' && <Skeleton />}

      {state.status === 'error' && (
        <div className="strip">
          <div className="chk" style={{ gridColumn: '1 / -1' }}>
            <span className="k">Checks unavailable</span>
            <span className="v">
              <span className="dot dot-alert" />—
            </span>
            <span className="n">{state.message}</span>
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="strip">
          {state.data.checks.map((c) => (
            <div className="chk" key={c.key}>
              <span className="k">{c.label}</span>
              <span className="v">
                <span className={`dot dot-${c.status}`} />
                {c.value}
              </span>
              <span className="n">{c.note}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
