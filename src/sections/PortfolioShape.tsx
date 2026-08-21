import { useBasis } from '../basis/context'
import { BacklogChart } from '../components/BacklogChart'
import { Illus } from '../components/Illus'
import { Panel, SectionHead } from '../components/Panel'
import { SectorLegend, SectorPie } from '../components/SectorPie'
import { SECTORS } from '../data/console'

function BarRow({ name, value, alt = false }: { name: string; value: number; alt?: boolean }) {
  return (
    <div className="bar-row">
      <div className="bl">
        <span className="name">{name}</span>
        <span className="val">
          <Illus>{value.toFixed(1)}%</Illus>
        </span>
      </div>
      <div className="track">
        <div className={alt ? 'fill alt' : 'fill'} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function PortfolioShape() {
  const { figures, tags } = useBasis()

  return (
    <section className="sec fade" id="shape" style={{ animationDelay: '.1s' }}>
      <SectionHead title="Portfolio shape" clause="§5.2 · §5.6 · §5.7" />

      <div className="row two">
        <Panel title="Progress vs spend" clause="§5.6" right="Live · weighted by awarded">
          <BarRow name="Progress" value={45.4} />
          <BarRow name="Spent" value={30.9} alt />
          <div className="gapbox">
            Work is running <b>14.5pp</b> ahead of cash drawn down — in line with the 14–15pp seen on every run to
            date. Projects with £0 awarded carry the median positive weight rather than dropping out of the
            average.
          </div>
        </Panel>

        <Panel
          title="Backlog by discipline"
          clause="§5.2"
          right={
            <>
              Remaining budget · <b>{tags.backlog}</b>
            </>
          }
          foot={
            <>
              <strong>Mechanical bundles CAD with MEC</strong> because the Tracker has no standalone CAD column. A
              deliberate overstatement, flagged as an upper bound every render. Retire this proxy the moment CRM
              starts splitting CAD by the discipline it actually supports.
            </>
          }
        >
          <BacklogChart />
        </Panel>
      </div>

      <div className="row">
        <Panel
          title="Sector split of orders won"
          clause="§5.7"
          right="Ex-procurement · totals tie to the headline card"
          foot={
            <>
              Colour is fixed per sector across both charts, so a sector never changes colour between views. Built
              on ex-procurement value — on the gross basis this totals <span className="num">£1,683,912</span> and
              stops reconciling to the headline card. That exact gap is the procurement slice.
            </>
          }
        >
          <div className="pies">
            <div className="pie-unit">
              <SectorPie sectors={SECTORS} field="cytd" label="Sector split current year to date" />
              <div className="cap">Current year to date</div>
              <div className="tot">{figures.sectorTotal}</div>
            </div>
            <div className="pie-unit">
              <SectorPie sectors={SECTORS} field="prior" label="Sector split prior full year" />
              <div className="cap">Prior full year</div>
              <div className="tot">
                <Illus>£1,712,400</Illus>
              </div>
            </div>
          </div>
          <SectorLegend sectors={SECTORS} />
        </Panel>
      </div>
    </section>
  )
}
