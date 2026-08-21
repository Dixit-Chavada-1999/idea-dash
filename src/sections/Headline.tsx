import type { ReactNode } from 'react'
import { useBasis } from '../basis/context'
import { Illus } from '../components/Illus'
import { SectionHead } from '../components/Panel'
import { Sparkline } from '../components/Sparkline'

function Kpi({
  title,
  chip,
  chipTone = '',
  children,
}: {
  title: string
  chip: string
  chipTone?: string
  children: ReactNode
}) {
  return (
    <div className="kpi">
      <div className="kpi-hd">
        <h3>{title}</h3>
        <span className={chipTone ? `chip ${chipTone}` : 'chip'}>{chip}</span>
      </div>
      <div className="kpi-body">{children}</div>
    </div>
  )
}

export function Headline() {
  const { figures, tags, isGross } = useBasis()
  const basisTone = isGross ? 'sp' : ''

  return (
    <section className="sec fade" id="headline" style={{ animationDelay: '.05s' }}>
      <SectionHead
        title="Headline"
        clause="§5.1 – §5.6"
        right={
          <>
            Solid figures trace to your methodology doc · <span className="illus">dotted</span> are illustrative
            pending first live run
          </>
        }
      />

      <div className="kpis">
        <Kpi title="Orders won YTD" chip={tags.orders} chipTone={basisTone}>
          <div className="big">{figures.orders}</div>
          <div className="meta">
            <span className="delta up">▲ 17.8%</span>
            <span>
              <span className="num">63</span> orders vs <Illus mono>54</Illus> same period LY
            </span>
          </div>
          <Sparkline values={[12, 19, 17, 26, 31, 29, 38, 44]} />
          <div className="caveat">
            Dated on <strong>PO Received only</strong>. Start date is overwritten whenever a project reopens —
            using it overstated this figure by ~40% on the first pass.
          </div>
        </Kpi>

        <Kpi title="Live proposals" chip="VALUE FIELD" chipTone="plain">
          <div className="big">
            <Illus>£2,341,600</Illus>
          </div>
          <div className="meta">
            <span className="delta dn illus" title="Illustrative">
              ▼ 5.8%
            </span>
            <span>
              <Illus mono>31</Illus> open · status Proposal sent
            </span>
          </div>
          <Sparkline values={[30, 33, 31, 36, 34, 39, 41, 37]} />
        </Kpi>

        <Kpi title="Enquiries YTD" chip="COUNT" chipTone="plain">
          <div className="big">
            <Illus>214</Illus>
          </div>
          <div className="meta">
            <span className="delta up illus" title="Illustrative">
              ▲ 9.2%
            </span>
            <span>no status filter applied</span>
          </div>
          <Sparkline values={[18, 22, 20, 25, 27, 24, 29, 31]} />
        </Kpi>

        <Kpi title="Conversion, H1" chip="COHORT" chipTone="bound">
          <div className="big">
            <Illus>38.6%</Illus>
          </div>
          <div className="meta">
            <span>
              vs <Illus mono>44.1%</Illus> H1 last year
            </span>
          </div>
          <div className="caveat">
            <strong>Not like-for-like.</strong> This year&rsquo;s H1 cohort hasn&rsquo;t finished maturing — some
            enquiries simply haven&rsquo;t had time to convert. The gap is partly an artefact of the clock.
          </div>
        </Kpi>

        <Kpi title="Current backlog" chip={tags.backlog} chipTone={basisTone}>
          <div className="big">
            <Illus>{figures.backlog}</Illus>
          </div>
          <div className="meta">
            <span>4 disciplines</span>
            <span>hybrid CRM + Tracker</span>
          </div>
          <Sparkline values={[24, 26, 25, 27, 26, 28, 27, 29]} />
          <div className="caveat">
            Remaining budget, not awarded value. Three pre-2025 Live codes (24123, 24156, 24219) sourced from the
            Tracker and folded into the same four buckets.
          </div>
        </Kpi>

        <Kpi title="Operating margin, live" chip={tags.margin} chipTone={basisTone}>
          <div className="big">
            <Illus>{figures.marginLive}</Illus>
          </div>
          <div className="meta">
            <span>
              Historical, completed <Illus mono>{figures.marginHist}</Illus>
            </span>
          </div>
          <Sparkline values={[19, 20, 22, 21, 23, 22, 21, 21]} />
          <div className="caveat">
            Live is earned value less actual. Historical splits pre/post-2025 across Tracker and CRM,
            services-only columns on both sides.
          </div>
        </Kpi>
      </div>
    </section>
  )
}
