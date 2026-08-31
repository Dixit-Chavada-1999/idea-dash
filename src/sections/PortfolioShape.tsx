import { dashboardApi } from '../api/dashboard'
import { BacklogChart } from '../components/BacklogChart'
import { Panel, SectionHead } from '../components/Panel'
import { SectorLegend, SectorPie } from '../components/SectorPie'
import { sectorColours } from '../components/sectorColours'
import type { PortfolioResponse } from '../contracts/dashboard'
import { useApi } from '../hooks/useApi'

const gbp = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`
const pct = (n: number) => `${n.toFixed(1)}%`

/** One bar. A null value renders an empty track rather than a stand-in figure. */
function BarRow({ name, value, alt = false }: { name: string; value: number | null; alt?: boolean }) {
  return (
    <div className="bar-row">
      <div className="bl">
        <span className="name">{name}</span>
        <span className="val">{value === null ? '—' : pct(value)}</span>
      </div>
      <div className="track">
        {value !== null && (
          <div className={alt ? 'fill alt' : 'fill'} style={{ width: `${Math.min(100, value)}%` }} />
        )}
      </div>
    </div>
  )
}

function ProgressVsSpend({ data }: { data: PortfolioResponse['progressVsSpend'] }) {
  const {
    progressPct, spentPct, earnedValue, cost, budgetValue,
    measuredProjects, liveProjects, projectsWithProgress, liveBudgetValue,
  } = data

  const gap = progressPct === null ? null : progressPct - spentPct
  const unmeasured = liveProjects - projectsWithProgress
  // records progress but carries no priced budget hours, so it falls outside the
  // bars without being one of the projects that "record nothing"
  const progressNoBudget = projectsWithProgress - measuredProjects

  return (
    <Panel title="Progress vs spend" clause="§5.6" right="Live · weighted by budget">
      <BarRow name="Progress" value={progressPct} />
      <BarRow name="Spent" value={spentPct} alt />

      {gap === null ? (
        <div className="caveat" style={{ marginTop: 14 }}>
          <strong>No live project records progress.</strong> Without it the gap this panel exists to show cannot
          be measured.
        </div>
      ) : (
        <div className="gapbox">
          Work is running <b>{gap.toFixed(1)}pp</b> {gap >= 0 ? 'ahead of' : 'behind'} cash drawn down —{' '}
          {gbp(earnedValue)} earned against {gbp(cost)} spent.
        </div>
      )}

      <div className="wg-note" style={{ marginTop: 14 }}>
        Progress is recorded per discipline and weighted by that discipline&rsquo;s budget, so a larger workstream
        moves the figure more. Both bars cover the {measuredProjects} projects that record progress —{' '}
        {gbp(budgetValue)} of priced budget.
        {unmeasured > 0 && (
          <>
            {' '}
            <strong>
              {unmeasured} of {liveProjects} live projects record nothing
            </strong>{' '}
            and sit outside both bars, together with the remainder of the {gbp(liveBudgetValue)} live budget.
          </>
        )}
        {progressNoBudget > 0 && (
          <>
            {' '}
            A further <strong>{progressNoBudget}</strong> record progress but carry no priced budget hours, so
            there is nothing to weight — {measuredProjects} + {unmeasured} + {progressNoBudget} ={' '}
            {liveProjects}.
          </>
        )}
      </div>
    </Panel>
  )
}

function BacklogPanel({ data }: { data: PortfolioResponse['backlogByDiscipline'] }) {
  const bundled = data.buckets.filter((b) => b.bundled)

  return (
    <Panel
      title="Net backlog by discipline"
      clause="§5.2"
      /* The same measure as the headline card's "Current backlog", broken down:
         budget at the rate card less the cost already booked. It used to show
         gross budget, which put a £400k gap between this panel and the card and
         invited reading it as a discrepancy. The tie is now checked server-side
         and reported below rather than asserted. */
      right={
        <>
          Net of cost · <b>{gbp(data.total)}</b>
        </>
      }
      foot={
        <>
          <strong>
            {gbp(data.grossTotal)} budgeted, less {gbp(data.costTotal)} booked.
          </strong>{' '}
          {data.tiesToHeadline
            ? 'Every part of this breakdown sums to the headline card’s Current backlog exactly.'
            : `These parts do NOT sum to the headline card, which reads ${gbp(data.headlineBacklog)} — a discipline has been lost from one side and not the other.`}{' '}
          {bundled.length > 0 && (
            <>
              <br />
              <strong>
                {bundled.map((b) => `${b.label} bundles ${b.composedOf.join(' + ')}`).join('; ')}.
              </strong>{' '}
              Both are separable in this data — the disciplines carry their own budget hours, so this bundling can
              be retired whenever the four-bucket view is no longer wanted.{' '}
            </>
          )}
          {data.unbucketed.length > 0 && (
            <>
              <br />
              <strong>Outside these buckets:</strong>{' '}
              {data.unbucketed.map((u) => `${u.initial} ${gbp(u.value)}`).join(', ')} — held back from the total
              rather than folded in silently, and counted in the tie above.
            </>
          )}
          {data.unattributedCost > 0 && (
            <>
              <br />
              <strong>Unattributed cost:</strong> {gbp(data.unattributedCost)} of booked cost carries no
              discipline, so it belongs to no bar. It is taken off the tie above, not off a bucket.
            </>
          )}
        </>
      }
    >
      <BacklogChart
        bars={data.buckets.map((b, i) => ({
          label: b.label,
          value: b.value,
          colour: ['#1D6FA5', '#58A3CE', '#E8940C', '#9AC7E3'][i % 4],
          ...(b.bundled && { sub: { text: `${b.composedOf.join(' + ')}`, colour: '#7B8FA0' } }),
        }))}
      />
    </Panel>
  )
}

function SectorPanel({ data }: { data: PortfolioResponse['sectorSplit'] }) {
  const colours = sectorColours(data.current.slices, data.prior.slices)

  return (
    <Panel
      title="Sector split of orders won"
      clause="§5.7"
      /* the tie is checked server-side, so the panel reports the result rather
         than repeating the claim */
      right={
        data.tiesToHeadline
          ? 'Purchase orders by sector · totals tie to the headline card'
          : `Purchase orders by sector · total does NOT tie — headline reads ${gbp(data.headlineOrders)}`
      }
      foot={
        <>
          Colour is fixed per sector across both charts, so a sector never changes colour between views. Built on
          purchase-order value dated on the PO
          {data.tiesToHeadline
            ? ' — the current-year total is summed again without the sector grouping and matches Orders won YTD exactly.'
            : ' — but summing the same orders without the sector grouping gives a different total, so a project has lost its sector.'}
        </>
      }
    >
      <div className="pies">
        {[data.current, data.prior].map((g) => (
          <div className="pie-unit" key={g.label}>
            <SectorPie slices={g.slices} colours={colours} label={g.label} />
            <div className="cap">{g.label}</div>
            <div className="tot">{gbp(g.total)}</div>
          </div>
        ))}
      </div>
      <SectorLegend colours={colours} />
    </Panel>
  )
}

export function PortfolioShape() {
  const state = useApi(() => dashboardApi.portfolio())

  return (
    <section className="sec fade" id="shape" style={{ animationDelay: '.1s' }}>
      <SectionHead
        title="Portfolio shape"
        clause="§5.2 · §5.6 · §5.7"
        right={state.status === 'ready' ? 'Live · priced at the rate card in force' : undefined}
      />

      {state.status === 'loading' && (
        <div className="panel">
          <div className="panel-body">
            <p style={{ margin: 0, color: 'var(--color-ink-3)' }}>Reading the reporting database…</p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="panel">
          <div className="panel-hd">
            <h3>Portfolio shape unavailable</h3>
          </div>
          <div className="panel-body">
            <div className="gate-err">{state.message}</div>
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <div className="row two">
            <ProgressVsSpend data={state.data.progressVsSpend} />
            <BacklogPanel data={state.data.backlogByDiscipline} />
          </div>
          <div className="row">
            <SectorPanel data={state.data.sectorSplit} />
          </div>
        </>
      )}
    </section>
  )
}
