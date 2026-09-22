import { dashboardApi } from '../api/dashboard'
import { useBasis } from '../basis/context'
import { Illus } from '../components/Illus'
import { DECISIONS, KEYLINE } from '../data/console'
import { useApi } from '../hooks/useApi'
import { formatDay, useRun } from '../run/context'
import { gbp } from '../data/money'


/**
 * The standing basis note.
 *
 * The wireframe's wording was "converted projects with no PO Received date
 * logged". No such population exists here — every active purchase order carries
 * a date. What the pipeline does surface is the reverse shape: live projects
 * with no purchase order at all, which is the pending-PO check. So the sentence
 * describes that instead of quietly reusing its figures under the old wording.
 */
function BasisNote() {
  const state = useApi(() => dashboardApi.checks())

  if (state.status !== 'ready') {
    return (
      <>
        Orders won YTD counts purchase orders only, so live projects carrying no purchase order contribute
        nothing to it.{' '}
        {state.status === 'error' ? state.message : 'Reading the exposure…'}
      </>
    )
  }

  const { shownCount, suppressedCount, totals } = state.data.pendingPo

  return (
    <>
      Orders won YTD counts purchase orders only, so the{' '}
      <strong className="num">{shownCount}</strong> live projects with none on file contribute nothing to it (
      <Illus mono>{gbp(totals.budget)}</Illus> budgeted, <Illus mono>{gbp(totals.actual)}</Illus> already spent)
      {suppressedCount > 0 && (
        <>
          {' '}
          — a further <strong className="num">{suppressedCount}</strong> are held back because the parent project
          holds the order
        </>
      )}
      .
    </>
  )
}

/**
 * Which backlog buckets bundle more than one discipline.
 *
 * Read from the portfolio response rather than written out. The sentence used to
 * name Mechanical alone — EC&I bundles ELC with INC and is the larger of the two,
 * and it went unmentioned. `BUCKETS` is also declared to be retirable, so a
 * hand-written line here would go stale the moment CAD is unbundled while the
 * Portfolio panel beside it updated correctly.
 */
function BundlingNote() {
  const { basis } = useBasis()
  const state = useApi(() => dashboardApi.portfolio(basis))

  if (state.status !== 'ready') return null

  const bundled = state.data.backlogByDiscipline.buckets.filter((b) => b.bundled)
  if (bundled.length === 0) return null

  const phrases = bundled.map((b) => `${b.label} combines ${b.composedOf.join(' with ')}`)
  const joined =
    phrases.length === 1
      ? phrases[0]
      : `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`

  return (
    <>
      {joined}, so {bundled.length === 1 ? 'that bucket is an' : 'those buckets are'}{' '}
      <strong>upper {bundled.length === 1 ? 'bound' : 'bounds'}</strong>.{' '}
    </>
  )
}

export function OpenDecisions() {
  const run = useRun()
  const evidence = useApi(() => dashboardApi.decisions())

  // key → line, so a card that has no evidence simply finds nothing
  const byKey = new Map(
    evidence.status === 'ready' ? evidence.data.evidence.map((e) => [e.key, e.text]) : [],
  )

  return (
    <section className="sec fade" id="open" style={{ animationDelay: '.25s' }}>
      <div className="openq">
        <div className="openq-hd">
          <h2>Open decisions — only IDEA can settle these</h2>
          <span className="r">Each one changes a rule in the pipeline, not just a label</span>
        </div>
        <div className="openq-grid">
          {DECISIONS.map((d) => {
            const line = d.evidenceKey ? byKey.get(d.evidenceKey) : undefined
            return (
              <div className="q" key={d.n}>
                <span className="qn">{d.n}</span>
                <span className="qt">{d.title}</span>
                <span className="qb">{d.body}</span>
                {/* Measured on every read, so a card cannot quote a figure that
                    has since moved. Cards the database cannot speak to show none. */}
                {line && <span className="qe">{line}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="footnote">
        <span className="lead">Standing basis note — renders on screen and on every export</span>
        <p>
          Backlog and operating margin are built from budgeted hours at the rate card, so they are{' '}
          <strong>services-only</strong> by construction; orders are the purchase-order value as entered.{' '}
          <BasisNote /> <BundlingNote />
          Current-year H1 conversion is a maturing cohort and is not like-for-like against a fully lapsed
          prior-year H1.
        </p>
        <div className="keyline">
          {KEYLINE.map((k) => (
            <span key={k.k}>
              <b>{k.k}</b> {k.v}
            </span>
          ))}
          {run.status === 'ready' && (
            <>
              <span>
                <b>Data to</b> {run.data.latestData ? formatDay(run.data.latestData) : 'unknown'}
              </span>
              <span>
                <b>Sources</b>{' '}
                {run.data.sources
                  .map((x) => `${x.label} ${x.rows.toLocaleString('en-GB')}`)
                  .join(' · ')}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
