import { dashboardApi } from '../api/dashboard'
import { useBasis } from '../basis/context'
import { BacklogChart } from '../components/BacklogChart'
import { OrdersByDisciplineChart } from '../components/OrdersByDisciplineChart'
import { Panel, Pill, SectionHead } from '../components/Panel'
import { SectorLegend, SectorPie } from '../components/SectorPie'
import { sectorColours } from '../components/sectorColours'
import type { PortfolioResponse } from '../contracts/dashboard'
import { useApi } from '../hooks/useApi'
import { gbp } from '../data/money'

const pct = (n: number) => `${n.toFixed(1)}%`

/**
 * The client's own glosses for the discipline codes (16 September call).
 *
 * The `disciplines` table stores the initial as the name — `PRM`'s name is
 * literally "PRM" — so the database cannot supply this. It matters because the
 * difference between this breakdown and the headline card *is* PRM, and on the
 * review call Zac had to work that out for himself: "I'm guessing the
 * difference there is PMO, basically the project management budgets?" He was
 * right, and a reader should not have to guess the same thing twice.
 *
 * Only entries confirmed on that call appear here. Anything else keeps its
 * initial rather than being given a name nobody has agreed.
 */
/** The client's own glosses, from the 16 September call. */
const DISCIPLINE_NAME: Record<string, string> = {
  PRM: 'project management (PMO)',
  PRO: 'process',
  INC: 'instruments and control',
  MEC: 'mechanical',
  ELC: 'electrical',
  SAF: 'safety',
}

const named = (initial: string) =>
  DISCIPLINE_NAME[initial] ? `${initial} — ${DISCIPLINE_NAME[initial]}` : initial

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
    <Panel
      title="Progress vs spend"
      clause="§5.6"
      right="Live · weighted by budget"
      calc={
        'Budget = Σ(budget hours × rate card)\n' +
        '         + Σ budgeted expenses\n' +
        '         + Σ procurement budget     -- (SP only)\n' +
        'EV     = Σ(each discipline’s budget × its own\n' +
        '           progress)\n' +
        '         + Σ procurement earned     -- (SP only)\n' +
        'Cost   = Σ(hours × cost rate) + Σ expenses paid\n' +
        '         + Σ procurement spend      -- (SP only)\n\n' +
        'Progress % = EV ÷ budget\n' +
        'Spent %    = cost ÷ budget'
      }
    >
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
      calc={
        'Per discipline = its budget, less the cost\n' +
        '                 booked to it   -- can go negative\n\n' +
        'Budget = budget hours x rate card\n' +
        'Cost   = hours booked x charge rate\n' +
        'Both over Live and Ready to start\n\n' +
        'One bar per discipline -- PRO, INC, MEC, CAD,\n' +
        'SAF, ELC, PRM, OPE. Nothing is bundled.\n\n' +
        'Expenses and procurement belong to no discipline,\n' +
        'so their net is held separately and added back in\n' +
        'when this is tied to the headline card\n\n' +
        'SO  -> expenses only\n' +
        'S+P -> expenses and procurement\n' +
        '       -- procurement carries no discipline in\n' +
        '          the CRM, so the basis moves this figure\n' +
        '          and the total, never the bars'
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
              be unbundled whenever a combined view is no longer wanted.{' '}
            </>
          )}
          {data.unbucketed.length > 0 && (
            <>
              <br />
              <strong>Outside these buckets:</strong>{' '}
              {data.unbucketed.map((u) => `${named(u.initial)} ${gbp(u.value)}`).join(', ')} — held back from the total
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
          {data.unattributedLineItems !== 0 && (
            <>
              <br />
              <strong>Expenses and procurement:</strong> {gbp(data.unattributedLineItems)} of backlog sits in
              line items, which are recorded against the project and carry no discipline at all. It is in the
              headline card but in no bar here — without this line the bars look short of the card by exactly
              this much.
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

const PILL_TONE: Record<'green' | 'amber' | 'red', 'green' | 'amber' | 'red'> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
}

function UtilisationPanel({ data }: { data: PortfolioResponse['utilisation'] }) {
  const bundled = data.buckets.filter((b) => b.bundled)
  const delta = data.current.pct !== null && data.prior?.pct != null ? data.current.pct - data.prior.pct : null

  return (
    <Panel
      title="Utilisation by discipline"
      clause="email 30 Aug"
      right={
        <>
          {data.window.label}
          {data.rating && (
            <>
              {' '}
              <Pill label={data.rating.band} tone={PILL_TONE[data.rating.band]} />
            </>
          )}
        </>
      }
      foot={
        <>
          <strong>
            {data.current.pct === null ? '—' : `${data.current.pct.toFixed(1)}%`} project hours ÷ (project +
            overhead)
          </strong>{' '}
          {data.prior?.pct != null && delta !== null && (
            <>
              vs {data.prior.pct.toFixed(1)}% {data.prior.label.toLowerCase()} ({delta >= 0 ? '+' : ''}
              {delta.toFixed(1)}pp).{' '}
            </>
          )}
          {data.rating?.note}{' '}
          Leave ({Math.round(data.current.leaveHours).toLocaleString('en-GB')} hrs this window) sits outside the
          ratio on both sides, per the formula given on the call.
          {bundled.length > 0 && (
            <>
              {' '}
              <strong>{bundled.map((b) => `${b.label} bundles ${b.composedOf.join(' + ')}`).join('; ')}.</strong>
            </>
          )}
          {data.unbucketed.length > 0 && (
            <>
              <br />
              <strong>Outside these buckets:</strong>{' '}
              {data.unbucketed
                .map((u) => `${named(u.initial)} ${u.pct === null ? '—' : `${u.pct.toFixed(1)}%`}`)
                .join(', ')}
              .
            </>
          )}
          {data.unattributedHours > 0 && (
            <>
              <br />
              <strong>No discipline recorded:</strong> {Math.round(data.unattributedHours).toLocaleString('en-GB')}{' '}
              hrs, held out rather than guessed into a bucket.
            </>
          )}
        </>
      }
      calc={
        'Utilisation = project hours\n' +
        '              ÷ (project hours + overhead hours)\n\n' +
        'Told apart by the project code:\n' +
        '  starts 2#####  -> client project\n' +
        '  starts LEAVE   -> leave, left out of both\n' +
        '                    sides entirely\n' +
        '  anything else  -> overhead\n\n' +
        'Measured over the last complete quarter'
      }
    >
      {data.buckets.map((b) => (
        <BarRow key={b.label} name={b.label} value={b.pct} />
      ))}
    </Panel>
  )
}

const DISCIPLINE_COLOURS = ['#1D6FA5', '#58A3CE', '#E8940C', '#9AC7E3']
const UNALLOCATED_COLOUR = '#B9C3CB'

function OrdersByDisciplinePanel({ data }: { data: PortfolioResponse['ordersByDiscipline'] }) {
  const bundled = data.buckets.filter((b) => b.bundled)
  const series = [
    ...data.buckets.map((b, i) => ({ label: b.label, colour: DISCIPLINE_COLOURS[i % 4]!, values: b.values })),
    ...(data.unallocated.total > 0
      ? [{ label: 'Unallocated', colour: UNALLOCATED_COLOUR, values: data.unallocated.values }]
      : []),
  ]

  return (
    <Panel
      title="Order value by month × discipline"
      clause="Abi's dashboard #1"
      right={
        data.tiesToHeadline
          ? 'Apportioned by budget-hours split · sums to Orders won (S+P)'
          : `Apportioned by budget-hours split · does NOT sum to Orders won (${gbp(data.headlineTotal)})`
      }
      calc={
        'Always the raw purchase order value, S+P, whichever\n' +
        'basis is selected                      -- (SP only)\n' +
        'SO would net each project against its procurement\n' +
        'budget, and that adjustment sits at project level\n' +
        'with no month of its own to sit in\n\n' +
        'A purchase order carries no discipline, so its value\n' +
        'is split across the disciplines in the same\n' +
        'proportion as that project’s own budget hours\n\n' +
        'Projects with no budget hours go to their own\n' +
        '"Unallocated" series'
      }
      foot={
        <>
          <code>project_purchase_orders</code> carries no discipline of its own, so each PO's value is split across
          disciplines in the same proportion as that project's own budget hours.
          {bundled.length > 0 && (
            <>
              {' '}
              <strong>{bundled.map((b) => `${b.label} bundles ${b.composedOf.join(' + ')}`).join('; ')}.</strong>
            </>
          )}
          {data.unallocated.total > 0 && (
            <>
              <br />
              <strong>Unallocated:</strong> {gbp(data.unallocated.total)} across {data.unallocated.projects}{' '}
              project{data.unallocated.projects === 1 ? '' : 's'} with no budget hours to apportion by — shown as
              its own series pending IDEA's ruling on whether to exclude it instead.
            </>
          )}
        </>
      }
    >
      <OrdersByDisciplineChart keys={data.keys} series={series} />
      <div className="wg-note" style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i style={{ width: 9, height: 9, background: s.colour, display: 'inline-block', borderRadius: 2 }} />
            {s.label}
          </span>
        ))}
      </div>
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
      calc={
        'Orders won in the window, grouped by the sector\n' +
        'the project belongs to\n\n' +
        'On SO, each project is netted against its own\n' +
        'procurement budget                     -- (SP only)\n' +
        '  awarded − procurement, margin included\n' +
        '  -- IDEA’s own formula\n\n' +
        'Adds up to Orders won YTD exactly, on the same\n' +
        'basis. The prior-year pie covers the same stretch\n' +
        'of last year, not the whole year.'
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
  const { basis } = useBasis()
  const state = useApi(() => dashboardApi.portfolio(basis))

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
            <OrdersByDisciplinePanel data={state.data.ordersByDiscipline} />
          </div>
          <div className="row">
            <UtilisationPanel data={state.data.utilisation} />
          </div>
          <div className="row">
            <SectorPanel data={state.data.sectorSplit} />
          </div>
        </>
      )}
    </section>
  )
}
