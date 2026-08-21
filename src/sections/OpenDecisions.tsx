import { Illus } from '../components/Illus'
import { DECISIONS, KEYLINE } from '../data/console'

export function OpenDecisions() {
  return (
    <section className="sec fade" id="open" style={{ animationDelay: '.25s' }}>
      <div className="openq">
        <div className="openq-hd">
          <h2>Open decisions — only IDEA can settle these</h2>
          <span className="r">Each one changes a rule in the pipeline, not just a label</span>
        </div>
        <div className="openq-grid">
          {DECISIONS.map((d) => (
            <div className="q" key={d.n}>
              <span className="qn">{d.n}</span>
              <span className="qt">{d.title}</span>
              <span className="qb">{d.body}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="footnote">
        <span className="lead">Standing basis note — renders on screen and on every export</span>
        <p>
          Backlog, operating margin and the sector split are <strong>services-only (SO)</strong>, excluding
          3rd-party and procurement pass-through. Orders won YTD excludes <strong className="num">23</strong>{' '}
          converted projects with no PO Received date logged (<Illus mono>£486,300</Illus> budgeted,{' '}
          <Illus mono>£212,750</Illus> already spent). Mechanical backlog combines CAD with MEC and is an{' '}
          <strong>upper bound</strong>. Current-year H1 conversion is a maturing cohort and is not like-for-like
          against a fully lapsed prior-year H1.
        </p>
        <div className="keyline">
          {KEYLINE.map((k) => (
            <span key={k.k}>
              <b>{k.k}</b> {k.v}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
